import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/integrations/outlook/connect - Redirect to Microsoft OAuth
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Outlook integration not configured' },
      { status: 500 }
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/integrations/outlook/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'Calendars.ReadBasic offline_access User.Read',
    response_mode: 'query',
    state: user.id,
  });

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
