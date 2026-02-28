// POST /api/appointments/complete — Mark appointment done, auto-create invoice, calc commission

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import {
  calculateCommission,
  CommissionConfig,
} from '@/lib/commission-engine';

interface CompleteRequestBody {
  appointmentId: string;
  tipAmountCents?: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body: CompleteRequestBody = await request.json();

    if (!body.appointmentId) {
      return badRequestResponse('appointmentId is required');
    }

    const tipAmountCents = body.tipAmountCents ?? 0;

    if (tipAmountCents < 0) {
      return badRequestResponse('tipAmountCents cannot be negative');
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch appointment (owned by authenticated user)
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', body.appointmentId)
      .eq('user_id', user.id)
      .single();

    if (apptError || !appointment) {
      return notFoundResponse('Appointment');
    }

    if (appointment.status === 'completed') {
      return badRequestResponse('Appointment is already completed');
    }

    // 2. Fetch services from packages table
    const serviceIds: string[] = appointment.service_ids ?? [];
    let serviceTotalCents = 0;
    let services: { name: string; price_cents: number }[] = [];

    if (serviceIds.length > 0) {
      const { data: pkgs, error: pkgError } = await supabase
        .from('packages')
        .select('id, name, price_cents')
        .in('id', serviceIds);

      if (pkgError) {
        console.error('Failed to fetch services:', pkgError);
        return serverErrorResponse(pkgError);
      }

      services = (pkgs ?? []).map((p) => ({
        name: p.name as string,
        price_cents: p.price_cents as number,
      }));
      serviceTotalCents = services.reduce((sum, s) => sum + s.price_cents, 0);
    }

    // 3. Fetch staff info (if assigned)
    let staff: { id: string; commission_config: CommissionConfig | null } | null = null;

    if (appointment.staff_id) {
      const { data: staffRow } = await supabase
        .from('staff')
        .select('id, commission_config')
        .eq('id', appointment.staff_id)
        .single();

      if (staffRow) {
        staff = {
          id: staffRow.id as string,
          commission_config: staffRow.commission_config as CommissionConfig | null,
        };
      }
    }

    // 4. Update appointment to completed
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        tip_amount_cents: tipAmountCents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.appointmentId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
      return serverErrorResponse(updateError);
    }

    // 5. Auto-create invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const lineItems: LineItem[] = services.map((svc) => ({
      description: svc.name,
      quantity: 1,
      unit_price_cents: svc.price_cents,
    }));

    if (tipAmountCents > 0) {
      lineItems.push({
        description: 'Tip',
        quantity: 1,
        unit_price_cents: tipAmountCents,
      });
    }

    const totalCents = serviceTotalCents + tipAmountCents;

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: appointment.client_id ?? null,
        invoice_number: invoiceNumber,
        amount_cents: totalCents,
        line_items: lineItems,
        status: 'paid',
        paid_at: new Date().toISOString(),
        notes: `Auto-generated from appointment ${appointment.title || body.appointmentId}`,
      })
      .select('id')
      .single();

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      return serverErrorResponse(invoiceError);
    }

    // 6. Calculate and record commission (if staff has commission_config)
    let commissionCents = 0;

    if (
      staff?.commission_config &&
      typeof staff.commission_config === 'object' &&
      Object.keys(staff.commission_config).length > 0
    ) {
      const config = staff.commission_config;

      // Commission on services
      commissionCents += calculateCommission(config, {
        amount_cents: serviceTotalCents,
        type: 'service',
      });

      // Commission on tip (if applicable)
      if (tipAmountCents > 0) {
        commissionCents += calculateCommission(config, {
          amount_cents: tipAmountCents,
          type: 'tip',
        });
      }

      if (commissionCents > 0) {
        const { error: commError } = await supabase
          .from('commissions')
          .insert({
            user_id: user.id,
            staff_id: appointment.staff_id,
            amount_cents: commissionCents,
            source_type: 'appointment',
            source_id: body.appointmentId,
            status: 'pending',
          });

        if (commError) {
          // Log but don't fail the whole request — appointment and invoice already created
          console.error('Failed to record commission:', commError);
        }
      }
    }

    return successResponse({
      success: true,
      invoiceId: invoice?.id ?? null,
      commissionCents,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
