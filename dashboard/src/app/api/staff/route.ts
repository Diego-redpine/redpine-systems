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

// GET /api/staff - List all staff for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/staff - Create a new staff member
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
      .from('staff')
      .insert({
        user_id: user.id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || null,
        hourly_rate_cents: body.hourly_rate_cents || null,
        is_active: body.is_active !== false,
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
