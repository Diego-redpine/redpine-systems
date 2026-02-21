import { NextRequest, NextResponse } from 'next/server';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { createServerClient } from '@supabase/ssr';
import { getDemoBoardData } from '@/components/board/board-demo-data';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

// Component IDs that map to each board section
const SCHEDULE_IDS = new Set(['appointments', 'calendar', 'schedules', 'reservations']);
const ORDER_IDS = new Set(['orders']);
const CLASS_IDS = new Set(['classes', 'courses']);
const QUEUE_IDS = new Set(['waitlist']);
const PIPELINE_IDS = new Set(['leads', 'jobs', 'tickets', 'cases', 'projects', 'workflows']);

interface TabLike {
  label?: string;
  components?: Array<{ id: string; view?: string; pipeline?: { stages?: Array<{ name: string; color: string }> } }>;
}

function detectSections(tabs: TabLike[]): string[] {
  const sections: string[] = [];
  const allIds = new Set<string>();

  for (const tab of tabs) {
    if (tab.components) {
      for (const c of tab.components) {
        allIds.add(c.id);
      }
    }
  }

  if ([...allIds].some(id => SCHEDULE_IDS.has(id))) sections.push('schedule');
  if ([...allIds].some(id => ORDER_IDS.has(id))) sections.push('orders');
  if ([...allIds].some(id => CLASS_IDS.has(id))) sections.push('classes');
  if ([...allIds].some(id => QUEUE_IDS.has(id))) sections.push('queue');
  if ([...allIds].some(id => PIPELINE_IDS.has(id))) sections.push('pipeline');

  return sections;
}

function findPipelineComponent(tabs: TabLike[]): { entityId: string; stages: Array<{ name: string; color: string }> } | null {
  for (const tab of tabs) {
    if (tab.components) {
      for (const c of tab.components) {
        if (PIPELINE_IDS.has(c.id) && c.pipeline?.stages) {
          return { entityId: c.id, stages: c.pipeline.stages };
        }
      }
    }
  }
  return null;
}

// GET /api/public/board?subdomain=X — fetch live board data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  // No subdomain = demo mode
  if (!subdomain) {
    const demoData = getDemoBoardData();
    return NextResponse.json({
      success: true,
      businessName: 'Demo Business',
      logoUrl: null,
      colors: {},
      sections: ['schedule', 'orders', 'classes', 'queue', 'pipeline'],
      data: {
        stats: demoData.stats,
        schedule: demoData.schedule,
        orders: demoData.orders,
        classes: demoData.classes,
        queue: demoData.queue,
        pipeline: demoData.pipeline,
      },
      isDemo: true,
    });
  }

  // Look up business by subdomain
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const { profile, config } = result;
  const userId = profile.id;
  const businessName = config.business_name || profile.business_name || subdomain;
  const colors = config.colors || {};
  const tabs = (config.tabs || []) as TabLike[];

  // Extract logo URL from config (stored in sidebar or top-level)
  let logoUrl: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configAny = config as any;
  if (configAny.logo_url) {
    logoUrl = configAny.logo_url;
  }

  // Detect which sections this business has
  const sections = detectSections(tabs);

  // Date boundaries for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];
  const tomorrowISO = new Date(today.getTime() + 86400000).toISOString().split('T')[0];

  const supabase = getSupabaseAdmin();

  // Parallel queries for all data
  const [appointmentsRes, ordersRes, classesRes, waitlistRes] = await Promise.all([
    // Today's appointments
    sections.includes('schedule')
      ? supabase
          .from('appointments')
          .select('id, title, client_name, start_time, end_time, status, staff_name')
          .eq('user_id', userId)
          .gte('start_time', `${todayISO}T00:00:00`)
          .lt('start_time', `${tomorrowISO}T00:00:00`)
          .order('start_time', { ascending: true })
      : Promise.resolve({ data: null, error: null }),

    // Today's orders
    sections.includes('orders')
      ? supabase
          .from('online_orders')
          .select('id, order_number, customer_name, item_count, status, total_cents, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: null, error: null }),

    // Active classes
    sections.includes('classes')
      ? supabase
          .from('classes')
          .select('id, name, instructor, schedule_time, enrolled_count, capacity, is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
      : Promise.resolve({ data: null, error: null }),

    // Today's waitlist
    sections.includes('queue')
      ? supabase
          .from('waitlist')
          .select('id, name, party_size, created_at, queue_number, queue_date')
          .eq('user_id', userId)
          .eq('queue_date', todayISO)
          .order('queue_number', { ascending: true })
      : Promise.resolve({ data: null, error: null }),
  ]);

  // Build response data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  // Stats
  const appointmentCount = appointmentsRes.data?.length || 0;
  const todayOrders = ordersRes.data?.filter(o => {
    const created = new Date(o.created_at);
    return created >= today && created < new Date(today.getTime() + 86400000);
  }) || [];
  const orderCount = todayOrders.length;
  const revenue = todayOrders
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum: number, o: { total_cents?: number }) => sum + (o.total_cents || 0), 0) / 100;
  const customerNames = new Set(
    (appointmentsRes.data || [])
      .map((a: { client_name?: string }) => a.client_name)
      .filter(Boolean)
  );
  const customers = customerNames.size;

  data.stats = {
    appointments: appointmentCount,
    orders: orderCount,
    revenue,
    customers,
  };

  // Schedule
  if (sections.includes('schedule') && appointmentsRes.data) {
    data.schedule = appointmentsRes.data.map((a: {
      id: string;
      title?: string;
      client_name?: string;
      start_time: string;
      end_time?: string;
      status?: string;
      staff_name?: string;
    }) => {
      const startDate = new Date(a.start_time);
      const endDate = a.end_time ? new Date(a.end_time) : new Date(startDate.getTime() + 30 * 60000);
      const now = new Date();

      let status: 'completed' | 'in_progress' | 'upcoming' | 'cancelled' = 'upcoming';
      if (a.status === 'cancelled') status = 'cancelled';
      else if (a.status === 'completed' || endDate < now) status = 'completed';
      else if (startDate <= now && endDate >= now) status = 'in_progress';

      return {
        id: a.id,
        title: a.title || 'Appointment',
        client: a.client_name || 'Walk-in',
        time: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        status,
        staff: a.staff_name,
      };
    });
  }

  // Orders
  if (sections.includes('orders') && ordersRes.data) {
    const now = Date.now();
    data.orders = ordersRes.data.map((o: {
      id: string;
      order_number?: string;
      customer_name?: string;
      item_count?: number;
      status?: string;
      created_at: string;
    }) => ({
      id: o.id,
      number: o.order_number || `#${o.id.slice(0, 4)}`,
      customer: o.customer_name || 'Walk-in',
      itemCount: o.item_count || 1,
      status: o.status || 'new',
      minutesAgo: Math.round((now - new Date(o.created_at).getTime()) / 60000),
    }));
  }

  // Classes
  if (sections.includes('classes') && classesRes.data) {
    data.classes = classesRes.data.map((c: {
      id: string;
      name: string;
      instructor?: string;
      schedule_time?: string;
      enrolled_count?: number;
      capacity?: number;
    }) => ({
      id: c.id,
      name: c.name,
      instructor: c.instructor || 'TBA',
      time: c.schedule_time || '00:00',
      enrolled: c.enrolled_count || 0,
      capacity: c.capacity || 20,
      status: 'upcoming' as const,
    }));
  }

  // Queue / Waitlist
  if (sections.includes('queue') && waitlistRes.data) {
    const waiting = waitlistRes.data;
    const maxQueueNumber = waiting.reduce((max: number, w: { queue_number?: number }) =>
      Math.max(max, w.queue_number || 0), 0);

    data.queue = {
      currentNumber: maxQueueNumber > 0 ? maxQueueNumber : 0,
      waiting: waiting.map((w: {
        name?: string;
        party_size?: number;
        created_at: string;
      }) => ({
        name: w.name || 'Guest',
        partySize: w.party_size || 1,
        waitMinutes: Math.round((Date.now() - new Date(w.created_at).getTime()) / 60000),
      })),
      avgWait: waiting.length > 0
        ? Math.round(
            waiting.reduce((sum: number, w: { created_at: string }) =>
              sum + (Date.now() - new Date(w.created_at).getTime()) / 60000, 0
            ) / waiting.length
          )
        : 0,
    };
  }

  // Pipeline
  if (sections.includes('pipeline')) {
    const pipelineConfig = findPipelineComponent(tabs);
    if (pipelineConfig) {
      // Query the entity table to count items per stage
      const { data: pipelineData } = await supabase
        .from(pipelineConfig.entityId)
        .select('stage')
        .eq('user_id', userId);

      const stageCounts: Record<string, number> = {};
      if (pipelineData) {
        for (const row of pipelineData) {
          const stage = (row as { stage?: string }).stage || 'Unknown';
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        }
      }

      data.pipeline = pipelineConfig.stages.map(s => ({
        stage: s.name,
        color: s.color,
        count: stageCounts[s.name] || 0,
      }));
    }
  }

  return NextResponse.json({
    success: true,
    businessName,
    logoUrl,
    colors,
    sections,
    data,
    isDemo: false,
  });
}
