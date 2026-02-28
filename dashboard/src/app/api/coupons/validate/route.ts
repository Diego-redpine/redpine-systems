import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/crud';

interface ValidateRequest {
  code: string;
  subdomain: string;
  subtotalCents: number;
}

interface Coupon {
  id: string;
  user_id: string;
  code: string;
  type: 'percent' | 'fixed' | 'free_item';
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

// POST /api/coupons/validate — Validate a coupon code without incrementing usage
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequest;
    const { code, subdomain, subtotalCents } = body;

    if (!code || !subdomain) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields: code, subdomain' },
        { status: 400 }
      );
    }

    if (typeof subtotalCents !== 'number' || subtotalCents < 0) {
      return NextResponse.json(
        { valid: false, error: 'subtotalCents must be a non-negative number' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseUser(request);

    // Resolve user_id from subdomain via profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (!profile) {
      return NextResponse.json(
        { valid: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const ownerId = profile.id;

    // Query coupon by code (case-insensitive) for this business owner
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', ownerId)
      .ilike('code', code)
      .eq('is_active', true)
      .single();

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    const typedCoupon = coupon as Coupon;

    // Check expiration
    if (typedCoupon.expires_at && new Date(typedCoupon.expires_at) <= new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' });
    }

    // Check usage limit
    if (typedCoupon.max_uses && typedCoupon.current_uses >= typedCoupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'Coupon has reached its usage limit' });
    }

    // Check minimum order amount
    if (typedCoupon.min_order_amount && subtotalCents < typedCoupon.min_order_amount) {
      const minDollars = (typedCoupon.min_order_amount / 100).toFixed(2);
      return NextResponse.json({
        valid: false,
        error: `Minimum order of $${minDollars} required`,
      });
    }

    // Calculate discount based on coupon type
    let discountCents = 0;

    if (typedCoupon.type === 'percent') {
      discountCents = Math.round(subtotalCents * (typedCoupon.value / 100));
    } else if (typedCoupon.type === 'fixed') {
      discountCents = typedCoupon.value;
    } else if (typedCoupon.type === 'free_item') {
      // UI handles free_item display — no monetary discount
      return NextResponse.json({
        valid: true,
        couponId: typedCoupon.id,
        discountCents: 0,
        type: 'free_item',
      });
    }

    // Cap discount so it never exceeds subtotal
    discountCents = Math.min(discountCents, subtotalCents);

    return NextResponse.json({
      valid: true,
      couponId: typedCoupon.id,
      discountCents,
      type: typedCoupon.type,
    });
  } catch (error) {
    console.error('POST /api/coupons/validate error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
