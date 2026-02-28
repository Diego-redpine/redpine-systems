// POST /api/appointments/no-show — Mark appointment as no-show and optionally charge
import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { emitAgentEvent } from '@/lib/agent-events';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { appointmentId } = await request.json();
    if (!appointmentId) return badRequestResponse('appointmentId is required');

    const supabase = getSupabaseUser(request);

    // Fetch appointment
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('user_id', user.id)
      .single();

    if (apptError || !appointment) return notFoundResponse('Appointment');

    if (appointment.status === 'no_show') {
      return badRequestResponse('Appointment is already marked as no-show');
    }

    // Fetch calendar settings for no-show policy
    const { data: calSettings } = await supabase
      .from('calendar_settings')
      .select('no_show_policy, no_show_fee_cents')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1);

    const settings = calSettings?.[0];
    const policy = settings?.no_show_policy || 'none';
    const customFeeCents = settings?.no_show_fee_cents || 0;

    // Update appointment status
    await supabase
      .from('appointments')
      .update({ status: 'no_show', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .eq('user_id', user.id);

    // Calculate fee based on policy
    let feeCents = 0;
    let invoiceId: string | null = null;

    if (policy === 'charge_deposit') {
      feeCents = appointment.deposit_amount_cents || 0;
    } else if (policy === 'charge_full') {
      // Get total from services
      const serviceIds = appointment.service_ids || [];
      if (serviceIds.length > 0) {
        const { data: services } = await supabase
          .from('packages')
          .select('price_cents')
          .in('id', serviceIds);
        feeCents = (services || []).reduce((sum: number, s: any) => sum + (s.price_cents || 0), 0);
      }
    } else if (policy === 'charge_custom') {
      feeCents = customFeeCents;
    }
    // policy === 'none' → feeCents stays 0

    // Create invoice for the fee if > 0
    if (feeCents > 0) {
      const serviceName = appointment.title || 'Appointment';
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

      const { data: inv } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: appointment.client_id || null,
          invoice_number: invoiceNumber,
          amount_cents: feeCents,
          line_items: [{ description: `No-show fee — ${serviceName}`, quantity: 1, unit_price_cents: feeCents }],
          status: 'sent',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `No-show charge for appointment on ${new Date(appointment.start_time).toLocaleDateString()}`,
        })
        .select('id')
        .single();

      invoiceId = inv?.id || null;
    }

    // Emit agent event
    emitAgentEvent({
      type: 'appointment.no_show',
      userId: user.id,
      payload: {
        appointment_id: appointmentId,
        client_name: appointment.client_name || appointment.title,
        fee_cents: feeCents,
        invoice_id: invoiceId,
      },
    }, supabase);

    return successResponse({ success: true, feeCents, invoiceId });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
