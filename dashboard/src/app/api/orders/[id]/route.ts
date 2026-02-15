import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET — Order detail
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = getSupabaseAdmin();

    const { data: order, error } = await supabase
      .from('freelancer_orders')
      .select('*, gig:gigs(title, category, description, pricing_tiers), freelancer:freelancer_profiles(id, display_name, avatar_url, tagline)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify access — must be buyer or freelancer
    const isBuyer = order.buyer_id === user.id;
    let isFreelancer = false;

    if (!isBuyer) {
      const { data: profile } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      isFreelancer = profile?.id === order.freelancer_id;
    }

    if (!isBuyer && !isFreelancer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from('freelancer_messages')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    // Fetch milestones
    const { data: milestones } = await supabase
      .from('order_milestones')
      .select('*')
      .eq('order_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      data: { ...order, messages: messages || [], milestones: milestones || [] },
      role: isBuyer ? 'buyer' : 'freelancer',
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH — Update order status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { action } = body; // 'deliver' | 'approve' | 'request_revision' | 'cancel'

  try {
    const supabase = getSupabaseAdmin();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('freelancer_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Determine role
    const isBuyer = order.buyer_id === user.id;
    let isFreelancer = false;
    if (!isBuyer) {
      const { data: profile } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      isFreelancer = profile?.id === order.freelancer_id;
    }

    if (!isBuyer && !isFreelancer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Status transitions
    const updates: Record<string, unknown> = {};

    switch (action) {
      case 'deliver':
        if (!isFreelancer) return NextResponse.json({ error: 'Only freelancer can deliver' }, { status: 403 });
        if (!['active', 'in_progress', 'revision'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot deliver in current status' }, { status: 400 });
        }
        updates.status = 'delivered';
        updates.delivered_at = new Date().toISOString();
        break;

      case 'approve':
        if (!isBuyer) return NextResponse.json({ error: 'Only buyer can approve' }, { status: 403 });
        if (order.status !== 'delivered') {
          return NextResponse.json({ error: 'Can only approve delivered orders' }, { status: 400 });
        }
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
        break;

      case 'request_revision':
        if (!isBuyer) return NextResponse.json({ error: 'Only buyer can request revision' }, { status: 403 });
        if (order.status !== 'delivered') {
          return NextResponse.json({ error: 'Can only request revision on delivered orders' }, { status: 400 });
        }
        if (order.revision_count >= order.max_revisions) {
          return NextResponse.json({ error: 'Max revisions reached' }, { status: 400 });
        }
        updates.status = 'revision';
        updates.revision_count = order.revision_count + 1;
        break;

      case 'cancel':
        if (!['active', 'in_progress'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot cancel in current status' }, { status: 400 });
        }
        updates.status = 'cancelled';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('freelancer_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
