import { SupabaseClient } from '@supabase/supabase-js';

export interface HealthScore {
  overall: number; // 0-100
  categories: {
    name: string;
    score: number;
    tip: string;
  }[];
}

export async function calculateHealthScore(userId: string, supabase: SupabaseClient): Promise<HealthScore> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch data for each category
  const [appointments, invoices, reviews, clients] = await Promise.all([
    supabase.from('appointments').select('id, status').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
    supabase.from('invoices').select('id, amount_cents, status').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
    supabase.from('reviews').select('id, rating').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
    supabase.from('clients').select('id').eq('user_id', userId).gte('created_at', thirtyDaysAgo),
  ]);

  // Calculate sub-scores
  const categories = [];

  // Booking activity
  const apptCount = appointments.data?.length || 0;
  const bookingScore = Math.min(100, apptCount * 5); // 20 appointments = 100
  categories.push({
    name: 'Booking Activity',
    score: bookingScore,
    tip: bookingScore < 50
      ? 'Try running a promotion to fill empty slots'
      : 'Great booking activity!',
  });

  // Revenue
  const totalRevenue = (invoices.data || []).reduce(
    (sum: number, inv: { amount_cents?: number }) => sum + (inv.amount_cents || 0),
    0
  );
  const revenueScore = Math.min(100, Math.round(totalRevenue / 100)); // $100 = 100 points, max 100
  categories.push({
    name: 'Revenue',
    score: revenueScore,
    tip: revenueScore < 50
      ? 'Consider upselling services or adding packages'
      : 'Revenue is healthy!',
  });

  // Reviews
  const avgRating = (reviews.data || []).length > 0
    ? (reviews.data || []).reduce(
        (sum: number, r: { rating?: number }) => sum + (r.rating || 0),
        0
      ) / reviews.data!.length
    : 0;
  const reviewScore = Math.round(avgRating * 20); // 5 stars = 100
  categories.push({
    name: 'Reviews',
    score: reviewScore,
    tip: reviewScore < 60
      ? 'Send review requests after appointments'
      : 'Excellent review ratings!',
  });

  // Client growth
  const newClients = clients.data?.length || 0;
  const clientScore = Math.min(100, newClients * 10); // 10 new clients = 100
  categories.push({
    name: 'Client Growth',
    score: clientScore,
    tip: clientScore < 50
      ? 'Ask happy clients for referrals'
      : 'Client acquisition is strong!',
  });

  const overall = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );

  return { overall, categories };
}
