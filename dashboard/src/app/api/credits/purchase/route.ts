import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { CREDIT_TIERS } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { tierId } = body;

    // Validate tier
    const tier = CREDIT_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ success: false, error: 'Invalid credit tier' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', user.id);
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tier.price,
      currency: 'usd',
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.id,
        tierId: tier.id,
        credits: tier.credits.toString(),
        type: 'credit_purchase',
      },
    });

    return NextResponse.json({
      success: true,
      status: 'requires_action',
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (e) {
    console.error('Credits purchase error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to process purchase' },
      { status: 500 },
    );
  }
}
