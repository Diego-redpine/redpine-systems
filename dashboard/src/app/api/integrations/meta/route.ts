// Meta (Facebook/Instagram) Integration — Connection management
// GET: connection status | POST: store OAuth credentials | DELETE: disconnect

import { NextRequest, NextResponse } from 'next/server';
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

// ---------- GET: Return Meta connection status ----------
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('integration_connections')
    .select('id, provider, is_active, connected_at, metadata, token_expires_at')
    .eq('user_id', user.id)
    .eq('provider', 'meta')
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found — that's fine, means not connected
    return serverErrorResponse(error);
  }

  if (!data) {
    return successResponse({
      connected: false,
      provider: 'meta',
      platforms: ['facebook', 'instagram'],
    });
  }

  // Never expose tokens — only return safe metadata
  const metadata = (data.metadata || {}) as Record<string, unknown>;
  return successResponse({
    connected: data.is_active,
    provider: 'meta',
    platforms: ['facebook', 'instagram'],
    connectedAt: data.connected_at,
    tokenExpiresAt: data.token_expires_at,
    pageName: metadata.page_name || null,
    pageId: metadata.page_id || null,
    instagramAccountId: metadata.instagram_account_id || null,
    email: metadata.email || null,
  });
}

// ---------- POST: Store Meta OAuth credentials ----------
// Accepts callback data from Meta OAuth flow (access_token, page info)
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.access_token) {
      return badRequestResponse('access_token is required');
    }

    // Encrypt the access token before storage
    const encryptedAccessToken = encrypt(body.access_token);
    const encryptedPageToken = body.page_access_token
      ? encrypt(body.page_access_token)
      : null;

    // Calculate token expiration (Meta long-lived tokens last ~60 days)
    const expiresIn = body.expires_in || 5184000; // default 60 days
    const tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString();

    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('integration_connections')
      .upsert(
        {
          user_id: user.id,
          provider: 'meta',
          access_token: encryptedAccessToken,
          refresh_token: encryptedPageToken, // store page token in refresh_token field
          token_expires_at: tokenExpiresAt,
          metadata: {
            email: body.email || null,
            page_name: body.page_name || null,
            page_id: body.page_id || null,
            instagram_account_id: body.instagram_account_id || null,
            permissions: body.permissions || [],
          },
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (dbError) {
      console.error('Failed to save Meta connection:', dbError);
      return serverErrorResponse(dbError);
    }

    return successResponse({
      connected: true,
      provider: 'meta',
      message: 'Meta integration connected successfully',
    });
  } catch (err) {
    console.error('Meta POST error:', err);
    return serverErrorResponse(err);
  }
}

// ---------- DELETE: Disconnect Meta integration ----------
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('integration_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'meta');

  if (error) {
    console.error('Failed to delete Meta connection:', error);
    return serverErrorResponse(error);
  }

  return deletedResponse();
}
