import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { AGENT_CATALOG, AgentId } from '@/lib/agent-events';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion });

// GET — List agent subscriptions for the user
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseUser(request);
  const { data: subscriptions } = await supabase
    .from('agent_subscriptions')
    .select('*')
    .eq('user_id', context.businessOwnerId)
    .eq('status', 'active');

  // Merge catalog info with subscription status
  const agents = AGENT_CATALOG.map(agent => {
    const sub = (subscriptions || []).find((s: { agent_id: string }) => s.agent_id === agent.id);
    return {
      ...agent,
      subscribed: agent.included || !!sub,
      subscription_id: sub?.id || null,
    };
  });

  return NextResponse.json({ success: true, data: agents });
}

// POST — Subscribe to a paid agent
export async function POST(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { agent_id } = body;

  const agent = AGENT_CATALOG.find(a => a.id === agent_id);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid agent_id' }, { status: 400 });
  }

  if (agent.included) {
    return NextResponse.json({ error: 'This agent is included free — no subscription needed' }, { status: 400 });
  }

  if (!agent.stripe_price_id) {
    return NextResponse.json({ error: 'Agent pricing not configured' }, { status: 500 });
  }

  const supabase = getSupabaseUser(request);

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('agent_subscriptions')
    .select('id')
    .eq('user_id', context.businessOwnerId)
    .eq('agent_id', agent_id as AgentId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already subscribed to this agent' }, { status: 400 });
  }

  try {
    // Find user's Stripe subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', context.businessOwnerId)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Add line item to existing subscription
    const subscriptionItem = await stripe.subscriptionItems.create({
      subscription: profile.stripe_subscription_id,
      price: agent.stripe_price_id,
      quantity: 1,
    });

    // Record in database
    const { data: sub, error } = await supabase
      .from('agent_subscriptions')
      .insert({
        user_id: context.businessOwnerId,
        agent_id: agent_id as AgentId,
        stripe_subscription_item_id: subscriptionItem.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    supabase.from('agent_activity').insert({
      user_id: context.businessOwnerId,
      agent_type: agent_id,
      event_type: 'agent.subscribed',
      description: `Subscribed to ${agent.name} ($${(agent.price_cents / 100).toFixed(2)}/mo)`,
    }).then(() => {});

    return NextResponse.json({ success: true, data: sub });
  } catch (error) {
    console.error('[Agent Subscribe] Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// DELETE — Unsubscribe from a paid agent
export async function DELETE(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agent_id = searchParams.get('agent_id');

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id parameter required' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);
  const { data: sub } = await supabase
    .from('agent_subscriptions')
    .select('*')
    .eq('user_id', context.businessOwnerId)
    .eq('agent_id', agent_id)
    .eq('status', 'active')
    .single();

  if (!sub) {
    return NextResponse.json({ error: 'No active subscription found for this agent' }, { status: 404 });
  }

  try {
    // Remove from Stripe
    if (sub.stripe_subscription_item_id) {
      await stripe.subscriptionItems.del(sub.stripe_subscription_item_id);
    }

    // Update local record
    await supabase
      .from('agent_subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', sub.id);

    const agent = AGENT_CATALOG.find(a => a.id === agent_id);

    // Log activity
    supabase.from('agent_activity').insert({
      user_id: context.businessOwnerId,
      agent_type: agent_id,
      event_type: 'agent.unsubscribed',
      description: `Unsubscribed from ${agent?.name || agent_id}`,
    }).then(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Agent Unsubscribe] Error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
