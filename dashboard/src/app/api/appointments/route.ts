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

// GET /api/appointments - List all appointments for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('appointments')
      .select('*, client:clients(id, name)')
      .eq('user_id', user.id)
      .order(sort || 'start_time', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.title || !body.start_time || !body.end_time) {
      return badRequestResponse('Title, start_time, and end_time are required');
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        client_id: body.client_id || null,
        title: body.title,
        description: body.description || null,
        start_time: body.start_time,
        end_time: body.end_time,
        status: body.status || 'scheduled',
        location: body.location || null,
      })
      .select()
      .single();

    if (error) throw error;

    return createdResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
