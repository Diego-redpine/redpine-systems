import { NextRequest, NextResponse } from 'next/server';
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

// POST /api/public/events/register — register attendee for an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, attendee_name, attendee_email, attendee_phone, tickets } = body;

    // Validate required fields
    if (!event_id) {
      return NextResponse.json({ error: 'Missing event_id' }, { status: 400 });
    }
    if (!attendee_name || !attendee_name.trim()) {
      return NextResponse.json({ error: 'Missing attendee_name' }, { status: 400 });
    }
    if (!attendee_email || !attendee_email.trim()) {
      return NextResponse.json({ error: 'Missing attendee_email' }, { status: 400 });
    }

    const requestedTickets = tickets && tickets > 0 ? tickets : 1;
    const supabase = getSupabaseAdmin();

    // Look up the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, capacity, tickets_sold, ticket_price_cents, is_free, status')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'upcoming') {
      return NextResponse.json({ error: 'Event is no longer accepting registrations' }, { status: 400 });
    }

    // Check capacity if set
    if (event.capacity !== null && event.capacity > 0) {
      const currentSold = event.tickets_sold || 0;
      if (currentSold + requestedTickets > event.capacity) {
        const remaining = event.capacity - currentSold;
        return NextResponse.json(
          {
            error: 'Not enough tickets available',
            remaining,
          },
          { status: 409 }
        );
      }
    }

    // For paid events, return a placeholder (Stripe integration TODO)
    if (event.ticket_price_cents > 0 && !event.is_free) {
      // TODO: Create Stripe Checkout session for ticket purchase
      // For now, return requiresPayment flag so the frontend knows
      return NextResponse.json({
        success: true,
        requiresPayment: true,
        event_id: event.id,
        event_name: event.name,
        ticket_price_cents: event.ticket_price_cents,
        tickets: requestedTickets,
        total_cents: event.ticket_price_cents * requestedTickets,
      });
    }

    // Free event: insert registration and increment tickets_sold
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id,
        attendee_name: attendee_name.trim(),
        attendee_email: attendee_email.trim(),
        attendee_phone: attendee_phone?.trim() || null,
        tickets: requestedTickets,
        status: 'registered',
      })
      .select()
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }

    // Increment tickets_sold on the event
    const { error: updateError } = await supabase
      .from('events')
      .update({ tickets_sold: (event.tickets_sold || 0) + requestedTickets })
      .eq('id', event_id);

    if (updateError) {
      console.error('Error updating tickets_sold:', updateError);
      // Registration was created, so we don't fail the request — just log the error
    }

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        event_id: registration.event_id,
        attendee_name: registration.attendee_name,
        attendee_email: registration.attendee_email,
        tickets: registration.tickets,
        status: registration.status,
        created_at: registration.created_at,
      },
    });
  } catch (err) {
    console.error('Event registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
