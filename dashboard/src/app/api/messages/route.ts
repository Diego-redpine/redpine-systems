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

// GET /api/messages - List all messages for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseUser(request);

    let query = supabase
      .from('messages')
      .select('*, client:clients(id, name)')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.content) {
      return badRequestResponse('Content is required');
    }

    const supabase = getSupabaseUser(request);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        client_id: body.client_id || null,
        content: body.content,
        type: body.type || 'note',
        is_read: body.is_read || false,
      })
      .select()
      .single();

    if (error) throw error;

    return createdResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
