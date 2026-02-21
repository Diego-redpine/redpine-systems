import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/api-helpers';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

// GET /api/integrations/google/callback - Handle Google OAuth return
// This route is in PUBLIC_ROUTES (no auth required — user returns from Google)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id
  const error = searchParams.get('error');
  const origin = new URL(request.url).origin;

  const dashboardUrl = `${origin}/dashboard`;

  if (error) {
    return NextResponse.redirect(
      `${dashboardUrl}?integration=google&status=error&message=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${dashboardUrl}?integration=google&status=error&message=missing_params`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${dashboardUrl}?integration=google&status=error&message=not_configured`
    );
  }

  const redirectUri = `${origin}/api/integrations/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Google token exchange failed:', errorText);
      return NextResponse.redirect(
        `${dashboardUrl}?integration=google&status=error&message=token_exchange_failed`
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user email from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let userEmail = '';
    let userName = '';

    if (userInfoResponse.ok) {
      const userInfo: GoogleUserInfo = await userInfoResponse.json();
      userEmail = userInfo.email || '';
      userName = userInfo.name || '';
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    // Upsert into integration_connections
    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('integration_connections')
      .upsert(
        {
          user_id: state,
          provider: 'google',
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          metadata: {
            email: userEmail,
            name: userName,
          },
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (dbError) {
      console.error('Failed to save Google connection:', dbError);
      return NextResponse.redirect(
        `${dashboardUrl}?integration=google&status=error&message=save_failed`
      );
    }

    return NextResponse.redirect(
      `${dashboardUrl}?integration=google&status=success`
    );
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      `${dashboardUrl}?integration=google&status=error&message=oauth_failed`
    );
  }
}
