// Template Marketplace API — browse, publish, clone
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET: Browse templates (public — no auth required for reading)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const businessType = searchParams.get('business_type');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'popular'; // popular, newest, rating

    let query = supabase
      .from('marketplace_templates')
      .select('id, author_name, name, description, business_type, category, colors, tabs, is_featured, clone_count, rating_avg, rating_count, tags, preview_url, created_at', { count: 'exact' })
      .eq('is_published', true);

    if (category && category !== 'all') query = query.eq('category', category);
    if (businessType) query = query.eq('business_type', businessType);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,business_type.ilike.%${search}%`);

    if (sort === 'popular') query = query.order('clone_count', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'rating') query = query.order('rating_avg', { ascending: false });

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Publish a template or clone one
export async function POST(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Clone action
    if (body.action === 'clone') {
      const { template_id } = body;
      if (!template_id) return NextResponse.json({ error: 'template_id required' }, { status: 400 });

      // Get original template
      const { data: template, error: fetchErr } = await supabase
        .from('marketplace_templates')
        .select('config, colors, tabs')
        .eq('id', template_id)
        .eq('is_published', true)
        .single();

      if (fetchErr || !template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

      // Increment clone count (best-effort)
      try {
        const { data: current } = await supabase
          .from('marketplace_templates')
          .select('clone_count')
          .eq('id', template_id)
          .single();
        if (current) {
          await supabase
            .from('marketplace_templates')
            .update({ clone_count: ((current.clone_count as number) || 0) + 1 })
            .eq('id', template_id);
        }
      } catch { /* non-critical */ }

      return NextResponse.json({
        config: template.config,
        colors: template.colors,
        tabs: template.tabs,
        message: 'Template cloned successfully',
      });
    }

    // Publish action
    if (body.action === 'publish') {
      const { name, description, business_type, category, config, colors, tabs, tags } = body;

      if (!name || !business_type) {
        return NextResponse.json({ error: 'name and business_type required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('marketplace_templates')
        .insert({
          author_id: ctx.userId,
          author_name: body.author_name || 'Anonymous',
          name,
          description: description || '',
          business_type,
          category: category || 'general',
          config: config || {},
          colors: colors || {},
          tabs: tabs || [],
          tags: tags || [],
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
