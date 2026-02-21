// Notion OAuth Callback — exchanges code for token, stores encrypted in DB
// This route is in PUBLIC_ROUTES (no auth required — Notion redirects here)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/api-helpers';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

interface NotionTokenResponse {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_id: string;
  workspace_icon: string | null;
  owner: {
    type: string;
    user: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  };
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');

  // Handle error from Notion
  if (error || !code || !state) {
    const reason = error || 'missing_params';
    return NextResponse.redirect(
      `${origin}/dashboard?integration=notion&status=error&reason=${reason}`
    );
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/dashboard?integration=notion&status=error&reason=not_configured`
    );
  }

  try {
    const redirectUri = `${origin}/api/integrations/notion/callback`;

    // Exchange authorization code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Notion token exchange failed:', tokenResponse.status, errorBody);
      return NextResponse.redirect(
        `${origin}/dashboard?integration=notion&status=error&reason=token_exchange_failed`
      );
    }

    const tokenData = (await tokenResponse.json()) as NotionTokenResponse;

    // Encrypt the access token before storing
    const encryptedToken = encrypt(tokenData.access_token);

    // Upsert into integration_connections
    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('integration_connections')
      .upsert(
        {
          user_id: state,
          provider: 'notion',
          access_token: encryptedToken,
          refresh_token: null, // Notion tokens don't expire
          token_expires_at: null,
          metadata: {
            workspace_name: tokenData.workspace_name,
            workspace_id: tokenData.workspace_id,
            bot_id: tokenData.bot_id,
          },
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider',
        }
      );

    if (dbError) {
      console.error('Failed to store Notion connection:', dbError);
      return NextResponse.redirect(
        `${origin}/dashboard?integration=notion&status=error&reason=db_error`
      );
    }

    return NextResponse.redirect(
      `${origin}/dashboard?integration=notion&status=success`
    );
  } catch (err) {
    console.error('Notion callback error:', err);
    return NextResponse.redirect(
      `${origin}/dashboard?integration=notion&status=error&reason=unexpected`
    );
  }
}
