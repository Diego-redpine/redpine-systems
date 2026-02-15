import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
});

interface OrderItem {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  modifiers?: { name: string; price_cents: number }[];
  special_instructions?: string;
}

// POST /api/public/order — Place an order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subdomain,
      items,
      customer_name,
      customer_email,
      customer_phone,
      order_type,
      table_number,
      delivery_address,
      special_instructions,
      tip_cents = 0,
      promo_code,
      scheduled_for,
    } = body;

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 });
    }
    if (!customer_name) {
      return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
    }
    if (!order_type || !['dine_in', 'pickup', 'delivery'].includes(order_type)) {
      return NextResponse.json({ success: false, error: 'Valid order type is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Resolve business owner from subdomain
    let ownerId: string | null = null;
    let taxRate = 0;
    let businessName = 'Restaurant';

    if (subdomain) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, business_name, tax_rate')
        .eq('subdomain', subdomain)
        .single();

      if (profile) {
        ownerId = profile.id;
        taxRate = profile.tax_rate || 0;
        businessName = profile.business_name || 'Restaurant';
      }
    }

    // Calculate totals
    const typedItems = items as OrderItem[];
    let subtotalCents = 0;
    for (const item of typedItems) {
      let itemTotal = item.price_cents * item.quantity;
      if (item.modifiers) {
        for (const mod of item.modifiers) {
          itemTotal += mod.price_cents * item.quantity;
        }
      }
      subtotalCents += itemTotal;
    }

    // Apply promo code
    let discountCents = 0;
    let promoCodeId: string | null = null;
    if (promo_code && ownerId) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('user_id', ownerId)
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo) {
        const notExpired = !promo.expires_at || new Date(promo.expires_at) > new Date();
        const notMaxed = !promo.max_uses || promo.current_uses < promo.max_uses;
        const meetsMin = subtotalCents >= (promo.min_order_cents || 0);

        if (notExpired && notMaxed && meetsMin) {
          promoCodeId = promo.id;
          if (promo.discount_type === 'percent') {
            discountCents = Math.round(subtotalCents * (promo.discount_value / 100));
          } else {
            discountCents = promo.discount_value;
          }
          // Don't let discount exceed subtotal
          discountCents = Math.min(discountCents, subtotalCents);
        }
      }
    }

    const taxCents = Math.round((subtotalCents - discountCents) * (taxRate / 100));
    const deliveryFeeCents = order_type === 'delivery' ? 500 : 0; // $5 delivery fee
    const totalCents = subtotalCents - discountCents + taxCents + tip_cents + deliveryFeeCents;

    // Generate order number
    const orderNumber = `#${Date.now().toString().slice(-6)}`;

    // If this is a demo (no real owner), return mock confirmation
    if (!ownerId) {
      return NextResponse.json({
        success: true,
        data: {
          order_number: orderNumber,
          subtotal_cents: subtotalCents,
          discount_cents: discountCents,
          tax_cents: taxCents,
          tip_cents: tip_cents,
          delivery_fee_cents: deliveryFeeCents,
          total_cents: totalCents,
          status: 'confirmed',
          estimated_ready_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        },
        isDemo: true,
      });
    }

    // Insert order record
    const { data: order, error: orderError } = await supabase
      .from('online_orders')
      .insert({
        user_id: ownerId,
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        order_type,
        table_number: table_number || null,
        delivery_address: delivery_address || null,
        items: typedItems,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        tip_cents,
        delivery_fee_cents: deliveryFeeCents,
        discount_cents: discountCents,
        total_cents: totalCents,
        promo_code_id: promoCodeId,
        special_instructions: special_instructions || null,
        scheduled_for: scheduled_for || null,
        status: 'new',
        payment_status: 'pending',
        estimated_ready_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    // Increment promo code usage
    if (promoCodeId) {
      await supabase.rpc('increment_promo_usage', { promo_id: promoCodeId });
    }

    // Inventory deduction — check if menu items have linked inventory
    try {
      for (const item of typedItems) {
        const { data: menuItem } = await supabase
          .from('menus')
          .select('inventory_item_id, portions_per_unit')
          .eq('id', item.id)
          .eq('user_id', ownerId)
          .single();

        if (menuItem?.inventory_item_id) {
          const portionsUsed = item.quantity * (menuItem.portions_per_unit || 1);
          // Decrement inventory quantity
          const { data: inv } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('id', menuItem.inventory_item_id)
            .single();

          if (inv) {
            const newQty = Math.max(0, (inv.quantity || 0) - portionsUsed);
            await supabase
              .from('inventory')
              .update({ quantity: newQty })
              .eq('id', menuItem.inventory_item_id);

            // Auto-86: if stock hits 0, mark menu item unavailable
            if (newQty === 0) {
              await supabase
                .from('menus')
                .update({ is_available_online: false })
                .eq('id', item.id);
            }
          }
        }
      }
    } catch (invErr) {
      // Non-critical: log but don't fail the order
      console.error('Inventory deduction error:', invErr);
    }

    // Create Stripe Checkout Session (one-time payment)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Order ${orderNumber} - ${businessName}`,
                description: `${typedItems.length} item(s)`,
              },
              unit_amount: totalCents,
            },
            quantity: 1,
          }],
          metadata: {
            order_id: order.id,
            order_type: 'online_order',
          },
          success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/order/${subdomain}/confirmation?order=${order.id}`,
          cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/order/${subdomain}`,
        });

        // Update order with stripe session ID
        await supabase
          .from('online_orders')
          .update({ stripe_session_id: session.id })
          .eq('id', order.id);

        return NextResponse.json({
          success: true,
          data: order,
          checkoutUrl: session.url,
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Fall through to return order without payment
      }
    }

    // No Stripe configured — mark as confirmed directly (demo/development)
    await supabase
      .from('online_orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      data: { ...order, payment_status: 'paid', status: 'confirmed' },
    });
  } catch (error) {
    console.error('POST /api/public/order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
