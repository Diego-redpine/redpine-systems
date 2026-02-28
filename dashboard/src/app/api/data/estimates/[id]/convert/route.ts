// POST /api/data/estimates/[id]/convert — Convert estimate to invoice
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

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const supabase = getSupabaseUser(request);

    // Fetch estimate
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (estError || !estimate) return notFoundResponse('Estimate');

    // Only convert from valid statuses
    if (!['sent', 'approved', 'draft'].includes(estimate.status)) {
      return badRequestResponse(`Cannot convert estimate with status "${estimate.status}"`);
    }

    // Create invoice from estimate data
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: estimate.client_id || null,
        invoice_number: invoiceNumber,
        amount_cents: estimate.amount_cents || 0,
        line_items: estimate.line_items || [],
        status: 'sent',
        due_date: dueDate.toISOString(),
        notes: estimate.notes || null,
      })
      .select('id')
      .single();

    if (invError || !invoice) {
      console.error('Failed to create invoice from estimate:', invError);
      return serverErrorResponse(invError);
    }

    // Update estimate status to invoiced
    await supabase
      .from('estimates')
      .update({
        status: 'invoiced',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    return successResponse({
      success: true,
      invoiceId: invoice.id,
      invoiceNumber,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
