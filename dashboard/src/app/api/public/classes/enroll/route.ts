import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientId } from '@/lib/rate-limit';

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

// POST /api/public/classes/enroll — enroll a client in a scheduled class
export async function POST(request: NextRequest) {
  // Rate limit: 10 per minute per IP
  const clientId = getClientId(request);
  const limit = rateLimit(`class-enroll:${clientId}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many enrollment requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { class_schedule_id, client_name, client_email, enrollment_date, is_drop_in } = body;

  // Validate required fields
  if (!class_schedule_id) {
    return NextResponse.json({ error: 'Missing class_schedule_id' }, { status: 400 });
  }
  if (!client_name || !client_name.trim()) {
    return NextResponse.json({ error: 'Missing client_name' }, { status: 400 });
  }
  if (!client_email || !client_email.trim()) {
    return NextResponse.json({ error: 'Missing client_email' }, { status: 400 });
  }
  if (!enrollment_date) {
    return NextResponse.json({ error: 'Missing enrollment_date' }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up the schedule entry and its parent class
  const { data: scheduleEntry, error: schedError } = await supabase
    .from('class_schedule')
    .select('id, class_id, is_active')
    .eq('id', class_schedule_id)
    .single();

  if (schedError || !scheduleEntry) {
    return NextResponse.json({ error: 'Class schedule not found' }, { status: 404 });
  }

  if (!scheduleEntry.is_active) {
    return NextResponse.json({ error: 'This class session is no longer active' }, { status: 400 });
  }

  // Look up the parent class for capacity and pricing
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id, name, capacity, drop_in_price_cents, member_only, is_active')
    .eq('id', scheduleEntry.class_id)
    .single();

  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  if (!classData.is_active) {
    return NextResponse.json({ error: 'This class is no longer active' }, { status: 400 });
  }

  // Check capacity if the class has one
  if (classData.capacity !== null && classData.capacity > 0) {
    const { count, error: countError } = await supabase
      .from('class_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('class_schedule_id', class_schedule_id)
      .eq('enrollment_date', enrollment_date)
      .neq('status', 'cancelled');

    if (countError) {
      console.error('Error counting enrollments:', countError);
      return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
    }

    const currentCount = count || 0;
    if (currentCount >= classData.capacity) {
      return NextResponse.json(
        {
          error: 'Class is full for this date',
          capacity: classData.capacity,
          enrolled: currentCount,
        },
        { status: 409 }
      );
    }
  }

  // For paid drop-ins, return payment info before inserting enrollment
  const dropIn = is_drop_in === true;
  if (dropIn && classData.drop_in_price_cents > 0) {
    // Insert enrollment with 'pending_payment' status
    const { data: enrollment, error: insertError } = await supabase
      .from('class_enrollments')
      .insert({
        class_schedule_id,
        client_name: client_name.trim(),
        client_email: client_email.trim(),
        enrollment_date,
        status: 'pending_payment',
        is_drop_in: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating enrollment:', insertError);
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      enrollment_id: enrollment.id,
      class_name: classData.name,
      total_cents: classData.drop_in_price_cents,
    });
  }

  // Free enrollment or member enrollment — insert directly
  const { data: enrollment, error: insertError } = await supabase
    .from('class_enrollments')
    .insert({
      class_schedule_id,
      client_name: client_name.trim(),
      client_email: client_email.trim(),
      enrollment_date,
      status: 'enrolled',
      is_drop_in: dropIn,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating enrollment:', insertError);
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    enrollment: {
      id: enrollment.id,
      class_schedule_id: enrollment.class_schedule_id,
      client_name: enrollment.client_name,
      client_email: enrollment.client_email,
      enrollment_date: enrollment.enrollment_date,
      status: enrollment.status,
      is_drop_in: enrollment.is_drop_in,
      created_at: enrollment.created_at,
    },
  });
}
