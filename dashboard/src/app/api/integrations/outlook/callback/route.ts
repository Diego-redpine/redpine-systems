import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/api-helpers';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface MicrosoftUserProfile {
  id: string;
  displayName: string | null;
  mail: string | null;
  userPrincipalName: string;
}

// GET /api/integrations/outlook/callback - Handle Microsoft OAuth return
// This route is in PUBLIC_ROUTES (no auth required — user returns from Microsoft)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const origin = new URL(request.url).origin;

  const dashboardUrl = `${origin}/dashboard`;

  if (error) {
    console.error('Outlook OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${dashboardUrl}?integration=outlook&status=error&message=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${dashboardUrl}?integration=outlook&status=error&message=missing_params`
    );
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${dashboardUrl}?integration=outlook&status=error&message=not_configured`
    );
  }

  const redirectUri = `${origin}/api/integrations/outlook/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'Calendars.ReadBasic offline_access User.Read',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Outlook token exchange failed:', errorText);
      return NextResponse.redirect(
        `${dashboardUrl}?integration=outlook&status=error&message=token_exchange_failed`
      );
    }

    const tokens: MicrosoftTokenResponse = await tokenResponse.json();

    // Get user profile from Microsoft Graph
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    let userEmail = '';
    let displayName = '';

    if (profileResponse.ok) {
      const profile: MicrosoftUserProfile = await profileResponse.json();
      userEmail = profile.mail || profile.userPrincipalName || '';
      displayName = profile.displayName || '';
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
          provider: 'outlook',
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          metadata: {
            email: userEmail,
            displayName,
          },
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (dbError) {
      console.error('Failed to save Outlook connection:', dbError);
      return NextResponse.redirect(
        `${dashboardUrl}?integration=outlook&status=error&message=save_failed`
      );
    }

    return NextResponse.redirect(
      `${dashboardUrl}?integration=outlook&status=success`
    );
  } catch (err) {
    console.error('Outlook OAuth callback error:', err);
    return NextResponse.redirect(
      `${dashboardUrl}?integration=outlook&status=error&message=oauth_failed`
    );
  }
}
