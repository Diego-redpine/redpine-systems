import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST — Create a new order
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gig_id, tier, requirements } = body;

    if (!gig_id || !tier) {
      return NextResponse.json({ error: 'gig_id and tier are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch gig with freelancer
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('*, freelancer:freelancer_profiles(*)')
      .eq('id', gig_id)
      .eq('is_active', true)
      .single();

    if (gigError || !gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    // Extract pricing
    const pricingTier = gig.pricing_tiers?.[tier];
    if (!pricingTier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const totalCents = pricingTier.price_cents;
    const platformFeeCents = Math.round(totalCents * 0.10); // 10% platform fee
    const freelancerPayoutCents = totalCents - platformFeeCents;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('freelancer_orders')
      .insert({
        buyer_id: user.id,
        freelancer_id: gig.freelancer_id,
        gig_id,
        tier,
        requirements: requirements || '',
        total_cents: totalCents,
        platform_fee_cents: platformFeeCents,
        freelancer_payout_cents: freelancerPayoutCents,
        max_revisions: pricingTier.revisions || 2,
        status: 'active', // For now, skip payment — goes directly to active
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET — List my orders
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'freelancer'

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('freelancer_orders')
      .select('*, gig:gigs(title, category, pricing_tiers), freelancer:freelancer_profiles(display_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (role === 'freelancer') {
      // Get freelancer profile first
      const { data: profile } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        return NextResponse.json({ data: [] });
      }
      query = query.eq('freelancer_id', profile.id);
    } else {
      query = query.eq('buyer_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
