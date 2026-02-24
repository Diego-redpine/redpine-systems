// Portal Cards — Stripe payment method management
// GET: list saved payment methods
// POST: create SetupIntent for adding new card
// DELETE: detach a payment method
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function validateSession(request: NextRequest) {
  const token = request.headers.get('x-portal-token')
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('portal_sessions')
    .select('client_id, user_id, config_id, expires_at, metadata')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;
  return session;
}

async function getStripeClient() {
  const stripe = (await import('stripe')).default;
  return new stripe(process.env.STRIPE_SECRET_KEY!);
}

async function getOrCreateStripeCustomer(
  clientId: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, stripe_customer_id')
    .eq('id', clientId)
    .single();

  if (!client) return null;

  if (client.stripe_customer_id) {
    return client.stripe_customer_id;
  }

  // Create Stripe customer
  const stripeClient = await getStripeClient();
  const customer = await stripeClient.customers.create({
    name: client.name || undefined,
    email: client.email || undefined,
    metadata: { client_id: clientId },
  });

  // Save to client record
  await supabase
    .from('clients')
    .update({ stripe_customer_id: customer.id })
    .eq('id', clientId);

  return customer.id;
}

// GET: List saved payment methods
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const customerId = await getOrCreateStripeCustomer(session.client_id, supabase);

  if (!customerId) {
    return NextResponse.json({ cards: [], default_payment_method: null });
  }

  try {
    const stripeClient = await getStripeClient();

    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    const customer = await stripeClient.customers.retrieve(customerId);
    const defaultPm = !customer.deleted
      ? (customer.invoice_settings?.default_payment_method as string) || null
      : null;

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand || 'unknown',
      last4: pm.card?.last4 || '****',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      is_default: pm.id === defaultPm,
    }));

    return NextResponse.json({ cards, default_payment_method: defaultPm });
  } catch (err) {
    console.error('[Portal Cards] Stripe GET error:', err);
    return NextResponse.json({ cards: [], default_payment_method: null });
  }
}

// POST: Create SetupIntent for adding a new card
export async function POST(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const customerId = await getOrCreateStripeCustomer(session.client_id, supabase);

  if (!customerId) {
    return NextResponse.json({ error: 'Could not create customer' }, { status: 500 });
  }

  try {
    const stripeClient = await getStripeClient();

    let body: { action?: string; payment_method_id?: string } = {};
    try { body = await request.json(); } catch { /* empty body = create setup intent */ }

    // Set default payment method
    if (body.action === 'set_default' && body.payment_method_id) {
      await stripeClient.customers.update(customerId, {
        invoice_settings: { default_payment_method: body.payment_method_id },
      });
      return NextResponse.json({ success: true });
    }

    // Create SetupIntent
    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
    });
  } catch (err) {
    console.error('[Portal Cards] Stripe POST error:', err);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
}

// DELETE: Detach a payment method
export async function DELETE(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const paymentMethodId = searchParams.get('id');

  if (!paymentMethodId) {
    return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
  }

  try {
    const stripeClient = await getStripeClient();

    // Verify this payment method belongs to the client's Stripe customer
    const pm = await stripeClient.paymentMethods.retrieve(paymentMethodId);
    const supabase = getSupabaseAdmin();
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id')
      .eq('id', session.client_id)
      .single();

    if (pm.customer !== client?.stripe_customer_id) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    await stripeClient.paymentMethods.detach(paymentMethodId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Portal Cards] Stripe DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 });
  }
}
