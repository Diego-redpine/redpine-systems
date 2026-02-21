import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/integrations/google/connect - Redirect to Google OAuth
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google integration not configured' },
      { status: 500 }
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/integrations/google/callback`;

  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: user.id,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
