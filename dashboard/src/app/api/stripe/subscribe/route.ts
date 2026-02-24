import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// Get Supabase admin client
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

// Get authenticated user from request
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/stripe/subscribe - Create subscription with 14-day trial using saved payment method
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Fetch stripe_customer_id from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to get profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

    const stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'No Stripe customer found. Please save a payment method first.' },
        { status: 400 }
      );
    }

    // 3. List customer's payment methods to get the one saved by SetupIntent
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
      limit: 1,
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No payment method found. Please save a card first.' },
        { status: 400 }
      );
    }

    const defaultPaymentMethod = paymentMethods.data[0].id;

    // 4. Create subscription with 14-day trial
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: STRIPE_PRICE_ID }],
      default_payment_method: defaultPaymentMethod,
      trial_period_days: 14,
      metadata: {
        userId: user.id,
      },
    });

    // 5. Update profile with subscription details
    await supabaseAdmin
      .from('profiles')
      .update({
        plan: 'trialing',
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 6. Return success
    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: 'trialing',
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
