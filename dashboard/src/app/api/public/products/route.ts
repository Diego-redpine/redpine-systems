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

// Demo products for preview/unauthenticated mode
const DEMO_PRODUCTS = [
  {
    id: 'demo_prod_1',
    name: 'Classic Candle — Vanilla Bean',
    description: 'Hand-poured soy wax candle with warm vanilla fragrance. 8 oz jar, 50+ hour burn time.',
    price_cents: 2400,
    sku: 'CND-VAN-001',
    quantity: 34,
    category: 'Retail',
    image_url: null,
    is_active: true,
  },
  {
    id: 'demo_prod_2',
    name: 'Signature Tote Bag',
    description: 'Heavyweight organic cotton tote with embroidered logo. Machine washable.',
    price_cents: 3200,
    sku: 'BAG-TOTE-001',
    quantity: 18,
    category: 'Retail',
    image_url: null,
    is_active: true,
  },
  {
    id: 'demo_prod_3',
    name: 'Hydrating Cuticle Oil',
    description: 'Nourishing blend of jojoba, vitamin E, and lavender essential oil. 0.5 oz dropper bottle.',
    price_cents: 1400,
    sku: 'NAIL-OIL-001',
    quantity: 52,
    category: 'Nail Care',
    image_url: null,
    is_active: true,
  },
  {
    id: 'demo_prod_4',
    name: 'Gel Polish Remover Kit',
    description: 'At-home gel removal kit with foil wraps, acetone pads, and cuticle pusher.',
    price_cents: 1800,
    sku: 'NAIL-RMV-001',
    quantity: 27,
    category: 'Nail Care',
    image_url: null,
    is_active: true,
  },
  {
    id: 'demo_prod_5',
    name: 'Gift Card — $50',
    description: 'Digital gift card redeemable for any service or product. Delivered via email.',
    price_cents: 5000,
    sku: 'GC-050',
    quantity: 999,
    category: 'Gift Cards',
    image_url: null,
    is_active: true,
  },
];

// GET /api/public/products?subdomain=X — list active products for portal/shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      // Return demo products if no subdomain
      return NextResponse.json({
        success: true,
        products: DEMO_PRODUCTS,
        isDemo: true,
      });
    }

    const result = await getConfigBySubdomain(subdomain);
    if (!result) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const userId = result.profile.id;
    const supabase = getSupabaseAdmin();

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price_cents, sku, quantity, category, image_url, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('GET /api/public/products query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      isDemo: false,
    });
  } catch (error) {
    console.error('GET /api/public/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
