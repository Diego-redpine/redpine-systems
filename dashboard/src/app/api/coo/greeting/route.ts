import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { buildProactiveGreeting, CooPersonality } from '@/lib/coo-prompts';

export const dynamic = 'force-dynamic';

// GET — Generate proactive greeting based on current business state
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseUser(request);
  const userId = context.businessOwnerId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString();

  // Gather context in parallel
  const [configResult, appointmentsResult, cancellationsResult, messagesResult, invoicesResult, reviewsResult, thisWeekRevenue, lastWeekRevenue] = await Promise.all([
    supabase.from('configs').select('business_name, coo_personality').eq('user_id', userId).single(),
    // Today's appointments
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('start_time', todayStr).lt('start_time', tomorrowStr)
      .neq('status', 'cancelled'),
    // Today's cancellations
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('updated_at', todayStr).eq('status', 'cancelled'),
    // Unread messages (approx — conversations with unread)
    supabase.from('chat_conversations').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gt('unread_count', 0),
    // Pending invoices
    supabase.from('invoices').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'sent'),
    // Recent reviews (last 7 days)
    supabase.from('reviews').select('rating, content')
      .eq('user_id', userId).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .limit(10),
    // This week revenue
    supabase.from('invoices').select('amount_cents')
      .eq('user_id', userId).eq('status', 'paid')
      .gte('paid_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    // Last week revenue
    supabase.from('invoices').select('amount_cents')
      .eq('user_id', userId).eq('status', 'paid')
      .gte('paid_at', new Date(Date.now() - 14 * 86400000).toISOString())
      .lt('paid_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const personality: CooPersonality = (configResult.data?.coo_personality as CooPersonality) || 'friendly';
  const ownerName = configResult.data?.business_name; // Use business name as fallback

  const weekRevenue = (thisWeekRevenue.data || []).reduce((s: number, i: { amount_cents: number }) => s + i.amount_cents, 0);
  const prevRevenue = (lastWeekRevenue.data || []).reduce((s: number, i: { amount_cents: number }) => s + i.amount_cents, 0);

  const greeting = buildProactiveGreeting(personality, {
    todayAppointments: appointmentsResult.count || 0,
    todayCancellations: cancellationsResult.count || 0,
    unreadMessages: messagesResult.count || 0,
    pendingInvoices: invoicesResult.count || 0,
    recentReviews: reviewsResult.data || [],
    weeklyRevenue: weekRevenue,
    lastWeekRevenue: prevRevenue,
  }, ownerName);

  return NextResponse.json({
    success: true,
    greeting,
    personality,
  });
}
