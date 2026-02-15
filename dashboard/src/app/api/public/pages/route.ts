import { NextRequest, NextResponse } from 'next/server';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

// GET /api/public/pages?subdomain=X&slug=home
// Public endpoint - returns published page blocks for rendering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');
  const slug = searchParams.get('slug');

  if (!subdomain || !slug) {
    return NextResponse.json({ error: 'subdomain and slug are required' }, { status: 400 });
  }

  // Look up business by subdomain
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('site_pages')
    .select('title, blocks, seo_title, seo_description')
    .eq('user_id', result.profile.id)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
