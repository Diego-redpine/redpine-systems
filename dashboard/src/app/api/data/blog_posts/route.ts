import { NextRequest, NextResponse } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers('blog_posts', {
  searchFields: ['title', 'slug', 'tags'],
  requiredFields: ['title'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getSupabaseUser(request);
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getSupabaseUser(request);
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) return serverErrorResponse(error);
  return successResponse({ deleted: true });
}
