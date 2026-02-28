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

// GET — List messages for an order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = getSupabaseUser(request);

    // Verify access
    const { data: order } = await supabase
      .from('freelancer_orders')
      .select('buyer_id, freelancer_id')
      .eq('id', id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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

    const { data: messages, error } = await supabase
      .from('freelancer_messages')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: messages || [] });
  } catch (error) {
    console.error('List messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST — Send a message
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseUser(request);

    // Verify access
    const { data: order } = await supabase
      .from('freelancer_orders')
      .select('buyer_id, freelancer_id')
      .eq('id', id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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

    const { data: message, error } = await supabase
      .from('freelancer_messages')
      .insert({
        order_id: id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
