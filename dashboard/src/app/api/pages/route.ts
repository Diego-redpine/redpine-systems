import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  createdResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/pages - List user's pages
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();
  const projectId = request.nextUrl.searchParams.get('project_id');

  let query = supabase
    .from('site_pages')
    .select('id, slug, title, published, seo_title, seo_description, project_id, metadata, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const { title, slug } = body;

  if (!title || !slug) {
    return badRequestResponse('title and slug are required');
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return badRequestResponse('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  const supabase = getSupabaseAdmin();

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from('site_pages')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  if (existing) {
    return badRequestResponse('A page with this slug already exists');
  }

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    title,
    slug,
    blocks: body.blocks || [],
    published: body.published ?? false,
  };
  if (body.project_id) {
    insertData.project_id = body.project_id;
  }
  if (body.metadata) {
    insertData.metadata = body.metadata;
  }

  const { data, error } = await supabase
    .from('site_pages')
    .insert(insertData)
    .select('id, slug, title, published, project_id, updated_at')
    .single();

  if (error) return serverErrorResponse(error);
  return createdResponse(data);
}
