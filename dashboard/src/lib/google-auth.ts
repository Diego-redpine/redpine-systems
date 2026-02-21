// Google OAuth token management
// Handles token retrieval, decryption, and automatic refresh

import { getSupabaseAdmin } from '@/lib/api-helpers';
import { decrypt, encrypt } from '@/lib/encryption';

interface GoogleTokenResult {
  accessToken: string;
  connectionId: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

interface GoogleConnection {
  id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
}

/**
 * Get a valid Google access token for a user.
 * Automatically refreshes expired tokens.
 * Returns the decrypted access token ready for API calls.
 */
export async function getValidGoogleToken(userId: string): Promise<GoogleTokenResult | null> {
  const supabase = getSupabaseAdmin();

  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('id, access_token, refresh_token, token_expires_at, is_active')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !connection) {
    return null;
  }

  const conn = connection as GoogleConnection;

  if (!conn.is_active) {
    return null;
  }

  let accessToken: string;

  try {
    accessToken = decrypt(conn.access_token);
  } catch {
    console.error('Failed to decrypt Google access token');
    return null;
  }

  // Check if token is expired (with 60-second buffer)
  const isExpired = conn.token_expires_at
    ? new Date(conn.token_expires_at).getTime() < Date.now() + 60_000
    : false;

  if (isExpired && conn.refresh_token) {
    const refreshed = await refreshGoogleToken(userId, conn.id, conn.refresh_token);
    if (refreshed) {
      return { accessToken: refreshed, connectionId: conn.id };
    }
    // Refresh failed — try the existing token anyway (might still work briefly)
  }

  return { accessToken, connectionId: conn.id };
}

/**
 * Refresh an expired Google access token using the refresh token.
 * Updates the stored tokens in the database.
 * Returns the new decrypted access token, or null on failure.
 */
async function refreshGoogleToken(
  userId: string,
  connectionId: string,
  encryptedRefreshToken: string
): Promise<string | null> {
  let refreshToken: string;
  try {
    refreshToken = decrypt(encryptedRefreshToken);
  } catch {
    console.error('Failed to decrypt Google refresh token');
    return null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google token refresh failed:', errorText);
      return null;
    }

    const tokens: GoogleTokenResponse = await response.json();

    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const encryptedAccessToken = encrypt(tokens.access_token);

    const supabase = getSupabaseAdmin();

    const updateData: Record<string, string> = {
      access_token: encryptedAccessToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    };

    // Google may issue a new refresh token during refresh
    if (tokens.refresh_token) {
      updateData.refresh_token = encrypt(tokens.refresh_token);
    }

    const { error } = await supabase
      .from('integration_connections')
      .update(updateData)
      .eq('id', connectionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update refreshed Google tokens:', error);
    }

    return tokens.access_token;
  } catch (err) {
    console.error('Google token refresh error:', err);
    return null;
  }
}
