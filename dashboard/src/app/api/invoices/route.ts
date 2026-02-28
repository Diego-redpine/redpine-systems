import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  parseQueryParams,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  createdResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/invoices - List all invoices for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseUser(request);

    let query = supabase
      .from('invoices')
      .select('*, client:clients(id, name)')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (body.amount_cents === undefined) {
      return badRequestResponse('amount_cents is required');
    }

    const supabase = getSupabaseUser(request);

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: body.client_id || null,
        invoice_number: body.invoice_number || null,
        amount_cents: body.amount_cents,
        status: body.status || 'draft',
        due_date: body.due_date || null,
        line_items: body.line_items || [],
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return createdResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
