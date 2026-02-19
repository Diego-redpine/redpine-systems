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

// GET /api/public/services?subdomain=X — list active services for booking page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 });
  }

  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const supabase = getSupabaseAdmin();

  const { data: services } = await supabase
    .from('packages')
    .select('id, name, description, price_cents, duration_minutes, buffer_minutes, category')
    .eq('user_id', userId)
    .eq('item_type', 'service')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return NextResponse.json({
    success: true,
    services: services || [],
  });
}
