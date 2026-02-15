import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site_projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return serverErrorResponse(error);
  if (!data) return badRequestResponse('Project not found');
  return successResponse(data);
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await context.params;
  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.metadata !== undefined) updates.metadata = body.metadata;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site_projects')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name, description, project_type, is_active, metadata, updated_at')
    .single();

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}

// DELETE /api/projects/[id] - Delete a project (cascades to pages)
export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('site_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return serverErrorResponse(error);
  return successResponse({ deleted: true });
}
