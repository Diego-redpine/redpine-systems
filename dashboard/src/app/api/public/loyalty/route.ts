import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

// Demo loyalty data
const DEMO_LOYALTY = {
  customer_name: 'Loyal Customer',
  points: 78,
  tier: 'silver',
  total_orders: 12,
  reward_available: false,
  reward_threshold: 100,
  points_to_next_reward: 22,
};

// GET /api/public/loyalty?phone=X&subdomain=Y — Look up loyalty member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const subdomain = searchParams.get('subdomain');

    if (!phone || !subdomain) {
      return NextResponse.json({ error: 'phone and subdomain required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Resolve subdomain → owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('subdomain', subdomain)
      .single();

    if (profile) {
      // Get loyalty config
      const { data: config } = await supabase
        .from('loyalty_config')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (!config || !config.is_active) {
        return NextResponse.json({ success: true, data: null, message: 'Loyalty program not active' });
      }

      // Look up member
      const { data: member } = await supabase
        .from('loyalty_members')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('customer_phone', phone)
        .single();

      if (member) {
        const rewardAvailable = member.points >= config.reward_threshold;
        return NextResponse.json({
          success: true,
          data: {
            ...member,
            reward_available: rewardAvailable,
            reward_threshold: config.reward_threshold,
            reward_value_cents: config.reward_value_cents,
            points_to_next_reward: rewardAvailable ? 0 : config.reward_threshold - member.points,
          },
        });
      }

      return NextResponse.json({ success: true, data: null, message: 'Not a loyalty member yet' });
    }

    // Demo fallback
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return NextResponse.json({ success: true, data: DEMO_LOYALTY, isDemo: true });
    }

    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    console.error('[Loyalty API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/public/loyalty — Earn points after order
export async function POST(request: NextRequest) {
  try {
    const { phone, subdomain, spent_cents } = await request.json();

    if (!phone || !subdomain || !spent_cents) {
      return NextResponse.json({ error: 'phone, subdomain, and spent_cents required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('subdomain', subdomain)
      .single();

    if (!profile) {
      return NextResponse.json({ success: true, isDemo: true, pointsEarned: Math.floor(spent_cents / 100) });
    }

    const { data: config } = await supabase
      .from('loyalty_config')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();

    if (!config || !config.is_active) {
      return NextResponse.json({ success: true, message: 'Loyalty not active' });
    }

    const pointsEarned = Math.floor(spent_cents / 100) * config.points_per_dollar;

    // Upsert loyalty member
    const { data: existing } = await supabase
      .from('loyalty_members')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('customer_phone', phone)
      .single();

    if (existing) {
      await supabase
        .from('loyalty_members')
        .update({
          points: existing.points + pointsEarned,
          total_orders: existing.total_orders + 1,
          total_spent_cents: existing.total_spent_cents + spent_cents,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('loyalty_members')
        .insert({
          user_id: profile.user_id,
          customer_phone: phone,
          points: pointsEarned,
          total_orders: 1,
          total_spent_cents: spent_cents,
        });
    }

    return NextResponse.json({ success: true, pointsEarned });
  } catch (err) {
    console.error('[Loyalty POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
