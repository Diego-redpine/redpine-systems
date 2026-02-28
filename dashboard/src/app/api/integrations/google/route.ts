// Google Business Profile Integration — Connection management
// GET: connection status | POST: store OAuth credentials | DELETE: disconnect
// Note: This is separate from the existing Google Sheets/Drive integration
// (google/connect + google/callback). This manages Google Business Profile specifically.

import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  deletedResponse,
  badRequestResponse,
} from '@/lib/api-helpers';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// ---------- GET: Return Google Business Profile connection status ----------
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('integration_connections')
    .select('id, provider, is_active, connected_at, metadata, token_expires_at')
    .eq('user_id', user.id)
    .eq('provider', 'google_business')
    .single();

  if (error && error.code !== 'PGRST116') {
    return serverErrorResponse(error);
  }

  if (!data) {
    return successResponse({
      connected: false,
      provider: 'google_business',
    });
  }

  const metadata = (data.metadata || {}) as Record<string, unknown>;
  return successResponse({
    connected: data.is_active,
    provider: 'google_business',
    connectedAt: data.connected_at,
    tokenExpiresAt: data.token_expires_at,
    businessName: metadata.business_name || null,
    locationId: metadata.location_id || null,
    accountId: metadata.account_id || null,
    email: metadata.email || null,
  });
}

// ---------- POST: Store Google Business OAuth credentials ----------
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.access_token) {
      return badRequestResponse('access_token is required');
    }

    const encryptedAccessToken = encrypt(body.access_token);
    const encryptedRefreshToken = body.refresh_token
      ? encrypt(body.refresh_token)
      : null;

    const expiresIn = body.expires_in || 3600; // default 1 hour for Google tokens
    const tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString();

    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('integration_connections')
      .upsert(
        {
          user_id: user.id,
          provider: 'google_business',
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          metadata: {
            email: body.email || null,
            business_name: body.business_name || null,
            location_id: body.location_id || null,
            account_id: body.account_id || null,
          },
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (dbError) {
      console.error('Failed to save Google Business connection:', dbError);
      return serverErrorResponse(dbError);
    }

    return successResponse({
      connected: true,
      provider: 'google_business',
      message: 'Google Business Profile connected successfully',
    });
  } catch (err) {
    console.error('Google Business POST error:', err);
    return serverErrorResponse(err);
  }
}

// ---------- DELETE: Disconnect Google Business integration ----------
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('integration_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'google_business');

  if (error) {
    console.error('Failed to delete Google Business connection:', error);
    return serverErrorResponse(error);
  }

  return deletedResponse();
}
