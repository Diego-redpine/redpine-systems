import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';

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

    const { paymentIntentId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 });
    }

    // Verify this payment is for this user
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const credits = parseInt(paymentIntent.metadata.credits, 10);
    const supabase = getSupabaseAdmin();

    // Add credits
    const { data } = await supabase
      .from('user_credits')
      .select('purchased_balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      await supabase
        .from('user_credits')
        .update({ purchased_balance: data.purchased_balance + credits, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, credits_added: credits });
  } catch (e) {
    console.error('Credits confirm error:', e);
    return NextResponse.json({ success: false, error: 'Failed to confirm purchase' }, { status: 500 });
  }
}
