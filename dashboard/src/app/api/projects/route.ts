import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  createdResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/projects - List user's site projects
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('site_projects')
    .select('id, name, description, project_type, is_active, metadata, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}

// POST /api/projects - Create a new site project
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const { name, description, project_type } = body;

  if (!name || !project_type) {
    return badRequestResponse('name and project_type are required');
  }

  if (!['website', 'link_tree', 'portal'].includes(project_type)) {
    return badRequestResponse('project_type must be "website", "link_tree", or "portal"');
  }

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('site_projects')
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      project_type,
      metadata: body.metadata || {},
    })
    .select('id, name, description, project_type, is_active, created_at')
    .single();

  if (error) return serverErrorResponse(error);
  return createdResponse(data);
}
