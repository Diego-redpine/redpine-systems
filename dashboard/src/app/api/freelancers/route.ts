import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'featured';
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('gigs')
      .select('*, freelancer:freelancer_profiles(*)')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (minPrice) {
      query = query.gte('pricing_tiers->basic->price_cents', parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte('pricing_tiers->basic->price_cents', parseInt(maxPrice));
    }

    // Sort
    switch (sort) {
      case 'price_low':
        query = query.order('pricing_tiers->basic->price_cents', { ascending: true });
        break;
      case 'price_high':
        query = query.order('pricing_tiers->basic->price_cents', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating_avg', { ascending: false });
        break;
      case 'popular':
        query = query.order('order_count', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default: // featured
        query = query.order('rating_avg', { ascending: false });
        break;
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [], page, pageSize });
  } catch (error) {
    console.error('Freelancers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
  }
}
