import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  deletedResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/pages/[slug] - Get a single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { slug } = await params;
  const supabase = getSupabaseUser(request);

  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  if (error || !data) return notFoundResponse('Page');
  return successResponse(data);
}

// PUT /api/pages/[slug] - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { slug } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  // Allowed fields
  if (body.title !== undefined) updates.title = body.title;
  if (body.blocks !== undefined) updates.blocks = body.blocks;
  if (body.published !== undefined) updates.published = body.published;
  if (body.seo_title !== undefined) updates.seo_title = body.seo_title;
  if (body.seo_description !== undefined) updates.seo_description = body.seo_description;
  if (body.metadata !== undefined) updates.metadata = body.metadata;

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('site_pages')
    .update(updates)
    .eq('user_id', user.id)
    .eq('slug', slug)
    .select('id, slug, title, published, seo_title, seo_description, updated_at')
    .single();

  if (error || !data) return notFoundResponse('Page');
  return successResponse(data);
}

// DELETE /api/pages/[slug] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { slug } = await params;
  const supabase = getSupabaseUser(request);

  const { error } = await supabase
    .from('site_pages')
    .delete()
    .eq('user_id', user.id)
    .eq('slug', slug);

  if (error) return serverErrorResponse(error);
  return deletedResponse();
}
