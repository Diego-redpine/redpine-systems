import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, searchRead, create } from '@/lib/odoo';

// GET /api/odoo/calendar - Fetch calendar events/appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const client = await getOdooClient();

    if (!client) {
      // Return dummy data if Odoo is not available
      return NextResponse.json({
        success: true,
        source: 'dummy',
        data: {
          appointments: [
            { id: 1, time: '10:00 AM', client: 'Sarah Johnson', service: 'Gel Manicure' },
            { id: 2, time: '11:30 AM', client: 'Walk-in', service: 'Pedicure' },
            { id: 3, time: '2:00 PM', client: 'Emily Chen', service: 'Full Set' },
          ],
        },
      });
    }

    // Fetch calendar events for the specified date
    const startDate = `${dateStr} 00:00:00`;
    const endDate = `${dateStr} 23:59:59`;

    const events = await searchRead(
      client,
      'calendar.event',
      [
        ['start', '>=', startDate],
        ['start', '<=', endDate],
      ],
      ['id', 'name', 'start', 'stop', 'partner_ids', 'description', 'location'],
      50,
      0,
      'start asc'
    );

    // Get partner names for events
    const appointments = events.map((event) => {
      const startTime = new Date(event.start as string);
      const timeStr = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      return {
        id: event.id,
        time: timeStr,
        client: event.name || 'Appointment',
        service: event.description || '',
        location: event.location || '',
      };
    });

    return NextResponse.json({
      success: true,
      source: 'odoo',
      data: { appointments },
    });
  } catch (error) {
    console.error('Odoo calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

// POST /api/odoo/calendar - Create appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, start, stop, partnerId, description } = body;

    const client = await getOdooClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Odoo not available' },
        { status: 503 }
      );
    }

    const eventId = await create(client, 'calendar.event', {
      name,
      start,
      stop,
      partner_ids: partnerId ? [[4, partnerId]] : [],
      description,
    });

    return NextResponse.json({
      success: true,
      data: { id: eventId },
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
