import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  parseQueryParams,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  createdResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/leads - List all leads for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,source.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.name) {
      return badRequestResponse('Name is required');
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        source: body.source || null,
        stage: body.stage || 'new',
        value_cents: body.value_cents || null,
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
