import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { getSupabaseAdmin } from '@/lib/crud';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// POST /api/public/bookings - Create a booking (public, no auth)
export async function POST(request: NextRequest) {
  // Rate limit: 5 per minute per IP
  const clientId = getClientId(request);
  const limit = rateLimit(`booking:${clientId}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many booking requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { subdomain, name, email, phone, date, time, notes, service_ids: rawServiceIds } = body;

  // Validate required fields
  if (!subdomain || !name || !email || !date || !time) {
    return NextResponse.json(
      { error: 'Missing required fields: subdomain, name, email, date, time' },
      { status: 400 }
    );
  }

  // Normalize service IDs — support both single service_id and array service_ids
  const serviceIds: string[] = rawServiceIds && Array.isArray(rawServiceIds) && rawServiceIds.length > 0
    ? rawServiceIds
    : body.service_id ? [body.service_id] : [];

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Look up business by subdomain
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const businessName = result.config.business_name || result.profile.business_name || 'Business';
  const supabase = getSupabaseAdmin();

  // Load calendar settings (if configured) for duration + assignment
  const { data: calSettings } = await supabase
    .from('calendar_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1);

  const calendarConfig = calSettings?.[0] || null;
  const defaultDuration = calendarConfig?.duration_minutes || 60;
  const defaultBuffer = calendarConfig?.buffer_minutes || 0;
  const depositPercent = calendarConfig?.deposit_percent || 0;

  // Load services — support multi-service stacking
  let totalDurationMin = 0;
  let totalPriceCents = 0;
  let totalBufferMin = 0;
  const serviceNames: string[] = [];
  const resolvedServiceIds: string[] = [];

  if (serviceIds.length > 0) {
    const { data: services } = await supabase
      .from('packages')
      .select('id, duration_minutes, buffer_minutes, name, price_cents')
      .in('id', serviceIds)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (services && services.length > 0) {
      for (const svc of services) {
        totalDurationMin += svc.duration_minutes || defaultDuration;
        totalPriceCents += svc.price_cents || 0;
        totalBufferMin += svc.buffer_minutes || 0;
        if (svc.name) serviceNames.push(svc.name);
        resolvedServiceIds.push(svc.id);
      }
      // Add buffers between services (not after last one)
      if (services.length > 1) {
        totalDurationMin += totalBufferMin;
      }
    }
  }

  // Fallback to defaults if no services resolved
  if (totalDurationMin === 0) totalDurationMin = defaultDuration;
  const durationMin = totalDurationMin;
  const bufferMin = defaultBuffer;
  const serviceName = serviceNames.join(' + ');

  // Parse date and time into start/end timestamps
  // date = "YYYY-MM-DD", time = "H:MM AM/PM"
  const startTime = parseDateTime(date, time);
  if (!startTime) {
    return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
  }

  const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);

  // Round-robin staff assignment
  let assignedStaffId: string | null = null;
  if (calendarConfig?.assignment_mode === 'round_robin' && calendarConfig.staff_ids?.length > 0) {
    const staffIds = calendarConfig.staff_ids as string[];
    const lastIdx = calendarConfig.last_assigned_index || 0;
    const nextIdx = (lastIdx + 1) % staffIds.length;
    assignedStaffId = staffIds[nextIdx];

    // Check if assigned staff is available (no conflicts at this time)
    const { data: staffConflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('user_id', userId)
      .eq('staff_id', assignedStaffId)
      .neq('status', 'cancelled')
      .lt('start_time', new Date(endTime.getTime() + bufferMin * 60 * 1000).toISOString())
      .gt('end_time', new Date(startTime.getTime() - bufferMin * 60 * 1000).toISOString())
      .limit(1);

    // If conflicted, try other staff members
    if (staffConflicts && staffConflicts.length > 0) {
      assignedStaffId = null;
      for (let i = 0; i < staffIds.length; i++) {
        const candidateIdx = (nextIdx + i) % staffIds.length;
        const candidateId = staffIds[candidateIdx];
        const { data: cConflicts } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_id', userId)
          .eq('staff_id', candidateId)
          .neq('status', 'cancelled')
          .lt('start_time', new Date(endTime.getTime() + bufferMin * 60 * 1000).toISOString())
          .gt('end_time', new Date(startTime.getTime() - bufferMin * 60 * 1000).toISOString())
          .limit(1);

        if (!cConflicts || cConflicts.length === 0) {
          assignedStaffId = candidateId;
          break;
        }
      }
      if (!assignedStaffId) {
        return NextResponse.json(
          { error: 'No staff available at this time. Please choose another time.' },
          { status: 409 }
        );
      }
    }

    // Update round-robin index
    await supabase
      .from('calendar_settings')
      .update({ last_assigned_index: nextIdx })
      .eq('id', calendarConfig.id);
  } else {
    // No round-robin — check for general conflicts
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString())
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      );
    }
  }

  // Direct booking — client picks staff from body.staff_id
  if (calendarConfig?.assignment_mode === 'direct_booking' && body.staff_id) {
    assignedStaffId = body.staff_id;
  }

  // Find or create client by email
  let clientId_db: string;
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .eq('email', email)
    .single();

  if (existingClient) {
    clientId_db = existingClient.id;
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        name,
        email,
        phone: phone || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (clientError || !newClient) {
      console.error('Failed to create client:', clientError);
      return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
    }
    clientId_db = newClient.id;
  }

  // Generate booking reference
  const refNumber = `BK-${Date.now().toString(36).toUpperCase()}`;

  // Calculate deposit if configured
  let depositAmountCents = 0;
  let depositPaymentIntentId: string | null = null;
  let clientSecret: string | null = null;

  if (depositPercent > 0 && totalPriceCents > 0) {
    depositAmountCents = Math.round(totalPriceCents * (depositPercent / 100));

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: depositAmountCents,
        currency: 'usd',
        metadata: {
          booking_ref: refNumber,
          business_user_id: userId,
          customer_email: email,
          deposit_percent: String(depositPercent),
        },
      });
      depositPaymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    } catch (err) {
      console.error('Failed to create deposit PaymentIntent:', err);
      return NextResponse.json({ error: 'Failed to process deposit payment' }, { status: 500 });
    }
  }

  // Insert appointment with staff assignment + deposit + service stacking
  const { error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      user_id: userId,
      client_id: clientId_db,
      staff_id: assignedStaffId,
      service_id: resolvedServiceIds[0] || null,
      service_ids: resolvedServiceIds,
      title: serviceName ? `${serviceName} — ${name}` : `Booking: ${name}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: depositAmountCents > 0 ? 'pending_deposit' : 'scheduled',
      description: notes ? `Ref: ${refNumber}\n${notes}` : `Ref: ${refNumber}`,
      deposit_amount_cents: depositAmountCents,
      deposit_payment_intent_id: depositPaymentIntentId,
    });

  if (appointmentError) {
    console.error('Failed to create appointment:', appointmentError);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  // Send confirmation emails asynchronously (don't block response)
  sendBookingEmails(email, name, businessName, startTime, refNumber, result.profile.email).catch(
    (err) => console.error('Failed to send booking emails:', err)
  );

  return NextResponse.json({
    success: true,
    refNumber,
    startTime: startTime.toISOString(),
    businessName,
    ...(clientSecret ? { clientSecret, depositAmountCents } : {}),
  });
}

// Parse "YYYY-MM-DD" + "H:MM AM/PM" into Date
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    // Parse time like "9:00 AM", "1:30 PM"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;

    const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (isNaN(d.getTime())) return null;

    return d;
  } catch {
    return null;
  }
}

// Send booking emails via Resend
async function sendBookingEmails(
  customerEmail: string,
  customerName: string,
  businessName: string,
  startTime: Date,
  refNumber: string,
  ownerEmail: string,
) {
  const { sendEmail } = await import('@/lib/email');
  const { bookingConfirmationEmail, bookingNotificationEmail } = await import('@/lib/email-templates');

  const dateStr = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Email to customer
  await sendEmail({
    to: customerEmail,
    subject: `Booking Confirmed — ${businessName}`,
    html: bookingConfirmationEmail(customerName, businessName, dateStr, timeStr, refNumber),
  });

  // Email to business owner
  await sendEmail({
    to: ownerEmail,
    subject: `New Booking: ${customerName} — ${dateStr}`,
    html: bookingNotificationEmail(customerName, customerEmail, businessName, dateStr, timeStr, refNumber),
  });
}
