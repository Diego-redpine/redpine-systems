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

const DEMO_CLASSES = [
  {
    id: 'demo-cls-1',
    name: 'Brazilian Jiu-Jitsu Fundamentals',
    description: 'Learn the core positions, escapes, and submissions of BJJ. Gi required. All experience levels welcome.',
    instructor_name: 'Coach Marcus Silva',
    category: 'Martial Arts',
    capacity: 30,
    drop_in_price_cents: 2500,
    member_only: false,
    schedule: [
      { day_of_week: 'Monday', start_time: '18:00', duration_minutes: 60, room: 'Mat Room A' },
      { day_of_week: 'Wednesday', start_time: '18:00', duration_minutes: 60, room: 'Mat Room A' },
      { day_of_week: 'Friday', start_time: '17:30', duration_minutes: 60, room: 'Mat Room A' },
    ],
  },
  {
    id: 'demo-cls-2',
    name: 'Vinyasa Flow Yoga',
    description: 'Dynamic flow linking breath to movement. Builds strength, flexibility, and balance. Bring your own mat.',
    instructor_name: 'Priya Sharma',
    category: 'Yoga',
    capacity: 20,
    drop_in_price_cents: 2000,
    member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '07:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Thursday', start_time: '07:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Saturday', start_time: '09:00', duration_minutes: 90, room: 'Studio 1' },
    ],
  },
  {
    id: 'demo-cls-3',
    name: 'Salsa & Bachata',
    description: 'Partner dancing for beginners and intermediates. No partner needed — we rotate! Latin shoes recommended.',
    instructor_name: 'Carlos & Maria Reyes',
    category: 'Dance',
    capacity: 24,
    drop_in_price_cents: 1800,
    member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '19:30', duration_minutes: 60, room: 'Dance Hall' },
      { day_of_week: 'Thursday', start_time: '19:30', duration_minutes: 60, room: 'Dance Hall' },
    ],
  },
  {
    id: 'demo-cls-4',
    name: 'HIIT Bootcamp',
    description: 'High-intensity interval training combining cardio, strength, and agility drills. All fitness levels.',
    instructor_name: 'Coach Jordan Lee',
    category: 'Fitness',
    capacity: 25,
    drop_in_price_cents: 1500,
    member_only: false,
    schedule: [
      { day_of_week: 'Monday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
      { day_of_week: 'Wednesday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
      { day_of_week: 'Friday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
      { day_of_week: 'Saturday', start_time: '08:00', duration_minutes: 45, room: 'Main Floor' },
    ],
  },
  {
    id: 'demo-cls-5',
    name: 'Muay Thai Striking',
    description: 'Traditional Thai boxing technique — kicks, elbows, knees, and clinch work. Gloves and shin guards provided.',
    instructor_name: 'Kru David Chen',
    category: 'Martial Arts',
    capacity: 20,
    drop_in_price_cents: 2500,
    member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '18:30', duration_minutes: 60, room: 'Mat Room B' },
      { day_of_week: 'Thursday', start_time: '18:30', duration_minutes: 60, room: 'Mat Room B' },
      { day_of_week: 'Saturday', start_time: '11:00', duration_minutes: 90, room: 'Mat Room B' },
    ],
  },
  {
    id: 'demo-cls-6',
    name: 'Restorative Yoga & Meditation',
    description: 'Gentle, prop-supported poses held for extended periods. Ends with guided meditation. Members only.',
    instructor_name: 'Priya Sharma',
    category: 'Yoga',
    capacity: 15,
    drop_in_price_cents: 0,
    member_only: true,
    schedule: [
      { day_of_week: 'Sunday', start_time: '10:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Wednesday', start_time: '19:30', duration_minutes: 75, room: 'Studio 1' },
    ],
  },
];

// GET /api/public/classes?subdomain=X — list active classes with weekly schedule
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({
      success: true,
      classes: DEMO_CLASSES,
      isDemo: true,
    });
  }

  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const supabase = getSupabaseAdmin();

  // Fetch active classes for this business
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id, name, description, instructor_name, category, capacity, drop_in_price_cents, member_only, image_url')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (classError) {
    console.error('Error fetching classes:', classError);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }

  if (!classes || classes.length === 0) {
    return NextResponse.json({
      success: true,
      classes: [],
      isDemo: false,
    });
  }

  // Fetch active schedule entries for all these classes
  const classIds = classes.map((c) => c.id);
  const { data: schedules, error: schedError } = await supabase
    .from('class_schedule')
    .select('id, class_id, day_of_week, start_time, duration_minutes, room')
    .in('class_id', classIds)
    .eq('is_active', true)
    .order('start_time', { ascending: true });

  if (schedError) {
    console.error('Error fetching class schedules:', schedError);
    // Return classes without schedule rather than failing entirely
  }

  // Merge schedule entries into their parent class
  const scheduleByClassId: Record<string, typeof schedules> = {};
  for (const entry of schedules || []) {
    if (!scheduleByClassId[entry.class_id]) {
      scheduleByClassId[entry.class_id] = [];
    }
    scheduleByClassId[entry.class_id]!.push(entry);
  }

  const classesWithSchedule = classes.map((cls) => ({
    ...cls,
    schedule: (scheduleByClassId[cls.id] || []).map((s) => ({
      id: s.id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      duration_minutes: s.duration_minutes,
      room: s.room,
    })),
  }));

  return NextResponse.json({
    success: true,
    classes: classesWithSchedule,
    isDemo: false,
  });
}
