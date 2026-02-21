import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getValidOutlookToken } from '@/lib/outlook-auth';

export const dynamic = 'force-dynamic';

interface SyncRequestBody {
  calendarId: string;
  startDate?: string;
  endDate?: string;
}

interface OutlookEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName?: string;
  };
  bodyPreview?: string;
  isAllDay?: boolean;
}

interface GraphEventsResponse {
  value: OutlookEvent[];
  '@odata.nextLink'?: string;
}

interface AppointmentRecord {
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  calendar_type: string;
  status: string;
  source: string;
  external_id: string;
}

/**
 * Normalize a Microsoft Graph dateTime value to an ISO 8601 UTC string.
 * Graph returns dateTime in the format "2024-01-15T09:00:00.0000000" with a
 * separate timeZone field. When timeZone is UTC we just append Z. Otherwise
 * we still append Z as a safe default since Outlook calendarView returns UTC
 * datetimes when explicitly requested via the Prefer header.
 */
function normalizeGraphDateTime(dateTime: string): string {
  // Strip any trailing zeros and already-present Z
  const cleaned = dateTime.replace(/\.?\d*Z?$/, '');
  return `${cleaned}Z`;
}

// POST /api/integrations/outlook/sync - Sync events from an Outlook calendar
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  let body: SyncRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body');
  }

  const { calendarId } = body;
  if (!calendarId) {
    return badRequestResponse('calendarId is required');
  }

  // Default date range: 30 days ago to 90 days from now
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const startDate = body.startDate || defaultStart.toISOString();
  const endDate = body.endDate || defaultEnd.toISOString();

  try {
    const token = await getValidOutlookToken(user.id);
    if (!token) {
      return badRequestResponse('Outlook not connected or token expired. Please reconnect.');
    }

    // Fetch all events with pagination
    const allEvents: OutlookEvent[] = [];
    let nextUrl: string | null =
      `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarView` +
      `?startDateTime=${encodeURIComponent(startDate)}` +
      `&endDateTime=${encodeURIComponent(endDate)}` +
      `&$top=100` +
      `&$select=id,subject,start,end,location,bodyPreview,isAllDay`;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'outlook.timezone="UTC"',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch Outlook events:', errorText);
        return serverErrorResponse(new Error(`Graph API error: ${response.status}`));
      }

      const data: GraphEventsResponse = await response.json();
      allEvents.push(...data.value);
      nextUrl = data['@odata.nextLink'] || null;
    }

    if (allEvents.length === 0) {
      return successResponse({ imported: 0, updated: 0, errors: 0, total: 0 });
    }

    // Map Outlook events to appointment records
    const appointments: AppointmentRecord[] = allEvents.map((event) => {
      const descriptionParts = [
        event.location?.displayName,
        event.bodyPreview,
      ].filter(Boolean);

      return {
        user_id: user.id,
        title: event.subject || '(No subject)',
        start_time: normalizeGraphDateTime(event.start.dateTime),
        end_time: normalizeGraphDateTime(event.end.dateTime),
        description: descriptionParts.join(' — '),
        calendar_type: 'appointment',
        status: 'scheduled',
        source: 'outlook',
        external_id: event.id,
      };
    });

    // Check which external_ids already exist for this user
    const externalIds = appointments.map((a) => a.external_id);
    const supabase = getSupabaseAdmin();

    const { data: existingRecords } = await supabase
      .from('appointments')
      .select('external_id')
      .eq('user_id', user.id)
      .in('external_id', externalIds);

    const existingSet = new Set(
      (existingRecords || []).map((r: { external_id: string }) => r.external_id)
    );

    // Upsert all appointments
    // The partial unique index on (user_id, external_id) WHERE external_id IS NOT NULL
    // handles deduplication. All outlook events have external_id so this works.
    const { error: upsertError } = await supabase
      .from('appointments')
      .upsert(appointments, { onConflict: 'user_id,external_id' });

    if (upsertError) {
      console.error('Failed to upsert appointments:', upsertError);
      return serverErrorResponse(upsertError);
    }

    // Count new vs updated
    const imported = appointments.filter((a) => !existingSet.has(a.external_id)).length;
    const updated = appointments.filter((a) => existingSet.has(a.external_id)).length;

    return successResponse({
      imported,
      updated,
      errors: 0,
      total: allEvents.length,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
