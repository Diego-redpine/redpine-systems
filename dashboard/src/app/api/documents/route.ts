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

// GET /api/documents - List all documents for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,folder.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.name || !body.file_url) {
      return badRequestResponse('Name and file_url are required');
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: body.name,
        file_url: body.file_url,
        file_type: body.file_type || null,
        file_size_bytes: body.file_size_bytes || null,
        folder: body.folder || 'general',
      })
      .select()
      .single();

    if (error) throw error;

    return createdResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
