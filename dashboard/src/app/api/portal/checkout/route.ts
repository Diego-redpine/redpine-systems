import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

// POST /api/portal/checkout - Create a Stripe checkout session for portal purchases
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { product_id, invoice_id, student_id } = body;

  if (!student_id || (!product_id && !invoice_id)) {
    return NextResponse.json(
      { error: 'student_id and either product_id or invoice_id required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Verify portal session
  const { data: portalSession } = await supabase
    .from('portal_sessions')
    .select('id, user_id, email, metadata')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!portalSession) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Get business name for checkout description
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, subdomain')
    .eq('id', portalSession.user_id)
    .single();

  const businessName = profile?.business_name || 'Business';
  const subdomain = profile?.subdomain || '';

  // Get the business's Stripe Connect account
  const { data: paymentConn } = await supabase
    .from('payment_connections')
    .select('account_id')
    .eq('user_id', portalSession.user_id)
    .eq('provider', 'stripe_connect')
    .eq('is_active', true)
    .single();

  // Build line items for checkout
  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let description = '';
  let amountCents = 0;

  if (invoice_id) {
    // Pay an invoice
    const { data: invoice } = await supabase
      .from('records')
      .select('data')
      .eq('id', invoice_id)
      .eq('user_id', portalSession.user_id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invData = invoice.data as Record<string, unknown>;
    amountCents = Math.round(((invData.amount as number) || 0) * 100);
    description = (invData.description as string) || `Invoice payment`;

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid invoice amount' }, { status: 400 });
    }

    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: description,
          description: `${businessName} — Invoice Payment`,
        },
        unit_amount: amountCents,
      },
      quantity: 1,
    }];
  } else if (product_id) {
    // Buy a product
    const { data: product } = await supabase
      .from('records')
      .select('data')
      .eq('id', product_id)
      .eq('user_id', portalSession.user_id)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const prodData = product.data as Record<string, unknown>;
    amountCents = Math.round(((prodData.price as number) || 0) * 100);
    description = (prodData.name as string) || 'Product purchase';

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid product price' }, { status: 400 });
    }

    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: description,
          description: `${businessName}`,
        },
        unit_amount: amountCents,
      },
      quantity: 1,
    }];
  }

  // Record the purchase intent
  const { data: purchaseRecord, error: insertError } = await supabase
    .from('records')
    .insert({
      user_id: portalSession.user_id,
      entity_type: 'portal_purchases',
      data: {
        product_id: product_id || null,
        invoice_id: invoice_id || null,
        student_id,
        description,
        amount_cents: amountCents,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    })
    .select('id')
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Build portal return URL
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalUrl = `${origin}/portal/${subdomain}`;

  // If business has Stripe Connect, create a checkout session on their connected account
  if (paymentConn?.account_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        customer_email: portalSession.email || undefined,
        metadata: {
          purchase_id: purchaseRecord?.id || '',
          student_id,
          portal: 'true',
        },
        success_url: `${portalUrl}?payment=success`,
        cancel_url: `${portalUrl}?payment=cancelled`,
        payment_intent_data: {
          application_fee_amount: Math.round(amountCents * 0.03), // 3% platform fee
        },
      };

      const session = await stripe.checkout.sessions.create(
        sessionParams,
        { stripeAccount: paymentConn.account_id }
      );

      // Update purchase record with Stripe session
      await supabase
        .from('records')
        .update({
          data: {
            product_id: product_id || null,
            invoice_id: invoice_id || null,
            student_id,
            description,
            amount_cents: amountCents,
            status: 'checkout_started',
            stripe_session_id: session.id,
            created_at: new Date().toISOString(),
          },
        })
        .eq('id', purchaseRecord?.id);

      return NextResponse.json({
        success: true,
        checkout_url: session.url,
      });
    } catch (stripeError) {
      console.error('Portal Stripe checkout error:', stripeError);
      // Fall through to non-Stripe flow
    }
  }

  // No Stripe Connect configured — mark as pending for manual payment
  return NextResponse.json({
    success: true,
    checkout_url: null,
    message: 'Payment request recorded. The business will contact you for payment.',
  });
}
