import { NextRequest, NextResponse } from 'next/server';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { createServerClient } from '@supabase/ssr';

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

const DEMO_EVENTS = [
  {
    id: 'demo-evt-1',
    name: 'Intro to Pottery Workshop',
    description: 'Learn the basics of wheel-throwing and hand-building in this beginner-friendly workshop. All materials included.',
    event_date: '2026-03-15',
    start_time: '10:00',
    end_time: '13:00',
    venue: 'Studio A',
    category: 'Workshops',
    capacity: 20,
    tickets_sold: 14,
    ticket_price_cents: 4500,
    is_free: false,
    is_public: true,
    status: 'upcoming',
  },
  {
    id: 'demo-evt-2',
    name: 'Friday Night Jazz',
    description: 'Enjoy an evening of live jazz from the Marcus Bell Quartet. Cash bar and light bites available.',
    event_date: '2026-03-21',
    start_time: '19:00',
    end_time: '22:00',
    venue: 'Main Hall',
    category: 'Concerts',
    capacity: 150,
    tickets_sold: 87,
    ticket_price_cents: 2500,
    is_free: false,
    is_public: true,
    status: 'upcoming',
  },
  {
    id: 'demo-evt-3',
    name: 'Startup Founders Meetup',
    description: 'Monthly networking event for local founders and entrepreneurs. Lightning talks followed by open networking.',
    event_date: '2026-03-28',
    start_time: '18:00',
    end_time: '20:30',
    venue: 'Community Room',
    category: 'Meetups',
    capacity: 60,
    tickets_sold: 33,
    ticket_price_cents: 0,
    is_free: true,
    is_public: true,
    status: 'upcoming',
  },
  {
    id: 'demo-evt-4',
    name: 'Spring Art Exhibition Opening',
    description: 'Opening night reception for our spring group exhibition featuring 12 local artists. Complimentary wine and cheese.',
    event_date: '2026-04-05',
    start_time: '17:00',
    end_time: '21:00',
    venue: 'Gallery Space',
    category: 'Exhibitions',
    capacity: 100,
    tickets_sold: 45,
    ticket_price_cents: 0,
    is_free: true,
    is_public: true,
    status: 'upcoming',
  },
  {
    id: 'demo-evt-5',
    name: 'Advanced Yoga Retreat Day',
    description: 'A full-day immersive yoga experience with meditation, breathwork, and a plant-based lunch included.',
    event_date: '2026-04-12',
    start_time: '08:00',
    end_time: '16:00',
    venue: 'Wellness Center',
    category: 'Workshops',
    capacity: 30,
    tickets_sold: 22,
    ticket_price_cents: 8500,
    is_free: false,
    is_public: true,
    status: 'upcoming',
  },
];

// GET /api/public/events?subdomain=X — list upcoming public events
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({
      success: true,
      events: DEMO_EVENTS,
      isDemo: true,
    });
  }

  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, description, event_date, start_time, end_time, venue, image_url, category, capacity, tickets_sold, ticket_price_cents, is_free, is_public, status')
    .eq('user_id', userId)
    .eq('is_public', true)
    .eq('status', 'upcoming')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    events: events || [],
    isDemo: false,
  });
}
