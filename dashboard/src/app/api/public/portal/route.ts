import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/public/portal?subdomain=X - Fetch portal pages for authenticated portal user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up the config by subdomain to find the user
  const { data: config } = await supabase
    .from('configurations')
    .select('id, user_id')
    .eq('subdomain', subdomain)
    .single();

  if (!config) {
    return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
  }

  // Find the portal project for this user
  const { data: project } = await supabase
    .from('site_projects')
    .select('id')
    .eq('user_id', config.user_id)
    .eq('project_type', 'portal')
    .eq('is_active', true)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'No portal configured' }, { status: 404 });
  }

  // Fetch portal pages (blocks)
  const { data: pages, error } = await supabase
    .from('site_pages')
    .select('id, title, slug, blocks, seo_title, is_published, sort_order')
    .eq('project_id', project.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    pages: pages || [],
    config_id: config.id,
    user_id: config.user_id,
  });
}
