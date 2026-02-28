import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/crud';
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

async function verifyOrderAccess(orderId: string, userId: string, request: NextRequest) {
  const supabase = getSupabaseUser(request);
  const { data: order } = await supabase
    .from('freelancer_orders')
    .select('buyer_id, freelancer_id')
    .eq('id', orderId)
    .single();

  if (!order) return null;

  const isBuyer = order.buyer_id === userId;
  let isFreelancer = false;
  if (!isBuyer) {
    const { data: profile } = await supabase
      .from('freelancer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    isFreelancer = profile?.id === order.freelancer_id;
  }

  if (!isBuyer && !isFreelancer) return null;
  return { isBuyer, isFreelancer };
}

// GET — List milestones for an order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await verifyOrderAccess(id, user.id, request);
  if (!access) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = getSupabaseUser(request);
    const { data, error } = await supabase
      .from('order_milestones')
      .select('*')
      .eq('order_id', id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('List milestones error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

// POST — Create a milestone (freelancer only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await verifyOrderAccess(id, user.id, request);
  if (!access?.isFreelancer) {
    return NextResponse.json({ error: 'Only freelancer can create milestones' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, amount_cents, due_date, sort_order } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = getSupabaseUser(request);
    const { data, error } = await supabase
      .from('order_milestones')
      .insert({
        order_id: id,
        title,
        description: description || '',
        amount_cents: amount_cents || 0,
        due_date: due_date || null,
        sort_order: sort_order || 0,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}

// PATCH — Update milestone status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await verifyOrderAccess(id, user.id, request);
  if (!access) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { milestone_id, action } = body; // 'submit' | 'approve'

    if (!milestone_id || !action) {
      return NextResponse.json({ error: 'milestone_id and action are required' }, { status: 400 });
    }

    const supabase = getSupabaseUser(request);
    const updates: Record<string, unknown> = {};

    if (action === 'submit' && access.isFreelancer) {
      updates.status = 'submitted';
      updates.submitted_at = new Date().toISOString();
    } else if (action === 'approve' && access.isBuyer) {
      updates.status = 'approved';
      updates.approved_at = new Date().toISOString();
    } else {
      return NextResponse.json({ error: 'Invalid action for your role' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('order_milestones')
      .update(updates)
      .eq('id', milestone_id)
      .eq('order_id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Update milestone error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}
