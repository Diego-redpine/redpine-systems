import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';

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

// POST /api/stripe/setup-intent - Create SetupIntent for card collection
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

    // 2. Get user's profile to check for existing Stripe customer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to get profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    // 3. Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save customer ID to profile
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // 4. Create SetupIntent for off-session card collection (cards only)
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: stripeCustomerId,
    });

  } catch (error) {
    console.error('SetupIntent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
