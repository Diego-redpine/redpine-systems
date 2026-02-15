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

// GET /api/public/bookings/availability?subdomain=X&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');
  const date = searchParams.get('date');

  if (!subdomain || !date) {
    return NextResponse.json(
      { error: 'Missing required params: subdomain, date' },
      { status: 400 }
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  // Look up business
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const supabase = getSupabaseAdmin();

  // Load calendar settings for business hours and slot duration
  const { data: calSettings } = await supabase
    .from('calendar_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1);

  const calendarConfig = calSettings?.[0] || null;
  const slotDuration = calendarConfig?.duration_minutes || 60;
  const bufferMinutes = calendarConfig?.buffer_minutes || 0;

  // Check if this day is open based on business hours
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const availability = calendarConfig?.availability as Record<string, { enabled: boolean; start: string; end: string }> | null;
  const dayHours = availability?.[dayOfWeek];

  if (dayHours && !dayHours.enabled) {
    return NextResponse.json({
      success: true,
      date,
      takenSlots: [],
      closed: true,
      slotDuration,
      businessHours: null,
    });
  }

  // Get all non-cancelled appointments for this date
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd);

  // Convert to taken time slots (round to slot intervals)
  const slotInterval = Math.min(slotDuration, 30); // Use 30min intervals or slot duration, whichever is smaller
  const takenSlots: string[] = [];
  if (appointments) {
    for (const apt of appointments) {
      const start = new Date(apt.start_time);
      const end = new Date(apt.end_time);
      // Add buffer time
      const bufferedEnd = new Date(end.getTime() + bufferMinutes * 60 * 1000);
      // Mark all slots that overlap (including buffer)
      const current = new Date(start);
      current.setMinutes(Math.floor(current.getMinutes() / slotInterval) * slotInterval, 0, 0);

      while (current < bufferedEnd) {
        const hours = current.getHours();
        const minutes = current.getMinutes();
        const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const m = minutes.toString().padStart(2, '0');
        takenSlots.push(`${h}:${m} ${ampm}`);
        current.setMinutes(current.getMinutes() + slotInterval);
      }
    }
  }

  // Load staff list for direct booking mode
  let staffForBooking: { id: string; name: string }[] | null = null;
  if (calendarConfig?.assignment_mode === 'direct_booking' && calendarConfig.staff_ids?.length > 0) {
    const { data: staffData } = await supabase
      .from('staff')
      .select('id, name')
      .in('id', calendarConfig.staff_ids);
    staffForBooking = staffData || null;
  }

  return NextResponse.json({
    success: true,
    date,
    takenSlots: [...new Set(takenSlots)],
    closed: false,
    slotDuration,
    businessHours: dayHours ? { start: dayHours.start, end: dayHours.end } : null,
    assignmentMode: calendarConfig?.assignment_mode || 'manual',
    staff: staffForBooking,
  });
}
