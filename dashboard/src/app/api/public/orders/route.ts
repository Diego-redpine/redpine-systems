import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

// Demo past orders for testing
const DEMO_PAST_ORDERS = [
  {
    id: 'demo-order-1',
    order_number: '#1038',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total_cents: 4200,
    items: [
      { name: 'Ribeye Steak', quantity: 1, price_cents: 4200, modifiers: [] },
    ],
  },
  {
    id: 'demo-order-2',
    order_number: '#1025',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    total_cents: 5600,
    items: [
      { name: 'Grilled Salmon', quantity: 1, price_cents: 2800, modifiers: [{ name: 'Rice Pilaf', price_cents: 0 }] },
      { name: 'Margherita Pizza', quantity: 1, price_cents: 1800, modifiers: [] },
    ],
  },
  {
    id: 'demo-order-3',
    order_number: '#1012',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    total_cents: 2800,
    items: [
      { name: 'Grilled Salmon', quantity: 1, price_cents: 2800, modifiers: [{ name: 'Mashed Potatoes', price_cents: 0 }] },
    ],
  },
];

// GET /api/public/orders?phone=XXX&subdomain=YYY
// Returns last 5 orders for a phone number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const subdomain = searchParams.get('subdomain');

    if (!phone || !subdomain) {
      return NextResponse.json({ error: 'phone and subdomain required' }, { status: 400 });
    }

    // Try real data
    const supabase = getSupabaseAdmin();

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('subdomain', subdomain)
      .single();

    if (profile) {
      const { data: orders } = await supabase
        .from('online_orders')
        .select('id, order_number, created_at, total_cents, items')
        .eq('user_id', profile.user_id)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orders && orders.length > 0) {
        return NextResponse.json({ success: true, data: orders });
      }
    }

    // Demo fallback — return past orders for any phone with 10+ digits
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return NextResponse.json({ success: true, data: DEMO_PAST_ORDERS, isDemo: true });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    console.error('[Public Orders API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
