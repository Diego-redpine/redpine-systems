import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  deletedResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/messages/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('messages')
      .select('*, client:clients(id, name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return notFoundResponse('Message');

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PUT /api/messages/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('messages')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) return notFoundResponse('Message');

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/messages/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return deletedResponse();
  } catch (error) {
    return serverErrorResponse(error);
  }
}
