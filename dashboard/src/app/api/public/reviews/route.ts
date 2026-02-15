// Public Reviews API — submit review + get reviews for public display

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/public/reviews?subdomain=<subdomain> — fetch published reviews for public display
export async function GET(request: NextRequest) {
  const subdomain = new URL(request.url).searchParams.get('subdomain');
  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up the business owner by subdomain
  const { data: config } = await supabase
    .from('configs')
    .select('user_id, config')
    .eq('subdomain', subdomain)
    .single();

  if (!config) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  // Fetch published reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, customer, rating, comment, source, response, created_at')
    .eq('user_id', config.user_id)
    .in('status', ['published', 'replied'])
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({
    reviews: reviews || [],
    businessName: config.config?.business_name || '',
  });
}

// POST /api/public/reviews — submit a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain, customer, email, rating, comment } = body;

    if (!subdomain || !customer || !rating) {
      return NextResponse.json({ error: 'subdomain, customer, and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Look up business owner
    const { data: config } = await supabase
      .from('configs')
      .select('user_id')
      .eq('subdomain', subdomain)
      .single();

    if (!config) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: config.user_id,
        customer,
        email: email || null,
        rating,
        comment: comment || null,
        source: 'direct',
        status: 'new',
      });

    if (insertError) {
      console.error('Review submission error:', insertError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Thank you for your review!' });
  } catch (error) {
    console.error('POST /api/public/reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
