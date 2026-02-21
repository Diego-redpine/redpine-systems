import { decrypt, encrypt } from '@/lib/encryption';
import { getSupabaseAdmin } from '@/lib/api-helpers';

interface IntegrationConnection {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, string> | null;
  is_active: boolean;
  connected_at: string;
  updated_at: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Get a valid (non-expired) Outlook access token for the given user.
 * Automatically refreshes the token if it's expired or about to expire.
 * Returns null if the user has no active Outlook connection or refresh fails.
 */
export async function getValidOutlookToken(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: conn } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'outlook')
    .eq('is_active', true)
    .single<IntegrationConnection>();

  if (!conn) return null;

  const accessToken = decrypt(conn.access_token);

  // Check if token is still valid (with 5 min buffer)
  if (
    conn.token_expires_at &&
    new Date(conn.token_expires_at) > new Date(Date.now() + 5 * 60 * 1000)
  ) {
    return accessToken;
  }

  // Token expired — attempt refresh
  if (!conn.refresh_token) return null;
  const refreshToken = decrypt(conn.refresh_token);

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error('Outlook token refresh failed:', await response.text());
    return null;
  }

  const tokens: MicrosoftTokenResponse = await response.json();

  // Update stored tokens
  await supabase
    .from('integration_connections')
    .update({
      access_token: encrypt(tokens.access_token),
      refresh_token: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : conn.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conn.id);

  return tokens.access_token;
}
