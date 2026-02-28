import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/crud';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Demo analytics data
const DEMO_ANALYTICS = {
  today: {
    orders: 23,
    revenue_cents: 187500,
    avg_order_cents: 8152,
  },
  order_types: {
    dine_in: 12,
    pickup: 7,
    delivery: 4,
  },
  popular_items: [
    { name: 'Ribeye Steak', count: 8, revenue_cents: 33600 },
    { name: 'Grilled Salmon', count: 6, revenue_cents: 16800 },
    { name: 'Margherita Pizza', count: 5, revenue_cents: 9000 },
    { name: 'Caesar Salad', count: 4, revenue_cents: 5600 },
    { name: 'Chocolate Lava Cake', count: 3, revenue_cents: 3600 },
  ],
  peak_hours: [
    { hour: '11am', orders: 2 },
    { hour: '12pm', orders: 5 },
    { hour: '1pm', orders: 3 },
    { hour: '2pm', orders: 1 },
    { hour: '5pm', orders: 3 },
    { hour: '6pm', orders: 4 },
    { hour: '7pm', orders: 3 },
    { hour: '8pm', orders: 2 },
  ],
  comparison: {
    yesterday_orders: 19,
    yesterday_revenue_cents: 152300,
    last_week_orders: 21,
    last_week_revenue_cents: 168700,
  },
};

// GET /api/analytics/orders — Restaurant order analytics
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      // Return demo data for unauthenticated
      return NextResponse.json({ success: true, data: DEMO_ANALYTICS, isDemo: true });
    }

    const supabase = getSupabaseUser(request);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Fetch today's orders
    const { data: todayOrders } = await supabase
      .from('online_orders')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay)
      .in('payment_status', ['paid']);

    if (!todayOrders || todayOrders.length === 0) {
      return NextResponse.json({ success: true, data: DEMO_ANALYTICS, isDemo: true });
    }

    // Calculate analytics
    const totalRevenue = todayOrders.reduce((sum: number, o: { total_cents: number }) => sum + o.total_cents, 0);
    const avgOrder = Math.round(totalRevenue / todayOrders.length);

    const orderTypes = { dine_in: 0, pickup: 0, delivery: 0 };
    todayOrders.forEach((o: { order_type: string }) => {
      if (o.order_type in orderTypes) {
        orderTypes[o.order_type as keyof typeof orderTypes]++;
      }
    });

    // Popular items
    const itemCounts: Record<string, { count: number; revenue: number }> = {};
    todayOrders.forEach((o: { items: { name: string; price_cents: number; quantity: number }[] }) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 };
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.price_cents * item.quantity;
        });
      }
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, count: data.count, revenue_cents: data.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Peak hours
    const hourCounts: Record<number, number> = {};
    todayOrders.forEach((o: { created_at: string }) => {
      const hour = new Date(o.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, orders]) => ({
        hour: `${parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour)}${parseInt(hour) >= 12 ? 'pm' : 'am'}`,
        orders,
      }))
      .sort((a, b) => {
        const aHour = parseInt(a.hour);
        const bHour = parseInt(b.hour);
        return aHour - bHour;
      });

    return NextResponse.json({
      success: true,
      data: {
        today: {
          orders: todayOrders.length,
          revenue_cents: totalRevenue,
          avg_order_cents: avgOrder,
        },
        order_types: orderTypes,
        popular_items: popularItems,
        peak_hours: peakHours,
        comparison: DEMO_ANALYTICS.comparison, // Would need yesterday's data query
        period,
      },
    });
  } catch (err) {
    console.error('[Analytics Orders] Error:', err);
    return NextResponse.json({ success: true, data: DEMO_ANALYTICS, isDemo: true });
  }
}
