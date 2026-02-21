import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getValidOutlookToken } from '@/lib/outlook-auth';

export const dynamic = 'force-dynamic';

interface OutlookCalendar {
  id: string;
  name: string;
  color: string;
}

interface GraphCalendarResponse {
  value: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

// GET /api/integrations/outlook/calendars - List user's Outlook calendars
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const token = await getValidOutlookToken(user.id);
    if (!token) {
      return successResponse({ calendars: [], connected: false });
    }

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/calendars?$select=id,name,color',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Outlook calendars:', errorText);
      return successResponse({ calendars: [], connected: true, error: 'fetch_failed' });
    }

    const data: GraphCalendarResponse = await response.json();

    const calendars: OutlookCalendar[] = data.value.map((cal) => ({
      id: cal.id,
      name: cal.name,
      color: cal.color,
    }));

    return successResponse({ calendars, connected: true });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
