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

// POST — Submit a review
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { order_id, rating, review } = body;

    if (!order_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'order_id and rating (1-5) are required' }, { status: 400 });
    }

    const supabase = getSupabaseUser(request);

    // Verify order exists, is completed, and user is the buyer
    const { data: order, error: orderError } = await supabase
      .from('freelancer_orders')
      .select('*')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .eq('status', 'completed')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found or not eligible for review' }, { status: 404 });
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from('freelancer_reviews')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Order already reviewed' }, { status: 409 });
    }

    // Insert review (DB trigger will update ratings on freelancer + gig)
    const { data: reviewData, error: reviewError } = await supabase
      .from('freelancer_reviews')
      .insert({
        order_id,
        reviewer_id: user.id,
        freelancer_id: order.freelancer_id,
        gig_id: order.gig_id,
        rating,
        review: review || '',
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    return NextResponse.json({ data: reviewData });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
