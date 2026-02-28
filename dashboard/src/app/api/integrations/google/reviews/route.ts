// Google Business Profile Reviews — Fetch and reply to reviews
// GET: Fetch reviews from Google API (if connected) or local reviews table
// POST: Reply to a Google review (writes to Google API + stores locally)

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// Helper: refresh Google access token using refresh_token
async function refreshGoogleToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !refreshToken) return null;

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

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// Helper: get a valid access token (refresh if expired)
async function getValidAccessToken(
  connection: {
    access_token: string;
    refresh_token: string | null;
    token_expires_at: string | null;
  },
  userId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  // Check if token is expired
  const isExpired =
    connection.token_expires_at &&
    new Date(connection.token_expires_at) < new Date();

  if (!isExpired) {
    try {
      return decrypt(connection.access_token);
    } catch {
      return null;
    }
  }

  // Token expired — try to refresh
  if (!connection.refresh_token) return null;

  let refreshToken: string;
  try {
    refreshToken = decrypt(connection.refresh_token);
  } catch {
    return null;
  }

  const newTokens = await refreshGoogleToken(refreshToken);
  if (!newTokens) return null;

  // Import encrypt dynamically to avoid circular issues
  const { encrypt } = await import('@/lib/encryption');

  // Update stored tokens
  const encryptedToken = encrypt(newTokens.access_token);
  const newExpiresAt = new Date(
    Date.now() + newTokens.expires_in * 1000
  ).toISOString();

  await supabase
    .from('integration_connections')
    .update({
      access_token: encryptedToken,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', 'google_business');

  return newTokens.access_token;
}

// ---------- GET: Fetch reviews ----------
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  // Check Google Business connection
  const { data: connection } = await supabase
    .from('integration_connections')
    .select('access_token, refresh_token, metadata, is_active, token_expires_at')
    .eq('user_id', user.id)
    .eq('provider', 'google_business')
    .single();

  // If connected, fetch from Google Business Profile API
  if (connection && connection.is_active) {
    const metadata = (connection.metadata || {}) as Record<string, unknown>;
    const accountId = metadata.account_id as string;
    const locationId = metadata.location_id as string;

    if (accountId && locationId) {
      const accessToken = await getValidAccessToken(connection, user.id);

      if (accessToken) {
        try {
          // Google Business Profile API v1
          const reviewsResponse = await fetch(
            `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            const googleReviews = (reviewsData.reviews || []).map(
              (review: Record<string, unknown>) => ({
                id: review.reviewId || review.name,
                source: 'google',
                customer: (review.reviewer as Record<string, unknown>)?.displayName || 'Google User',
                rating: starRatingToNumber(review.starRating as string),
                comment: (review.comment as string) || '',
                reply: review.reviewReply
                  ? (review.reviewReply as Record<string, unknown>).comment
                  : null,
                created_at: review.createTime,
                updated_at: review.updateTime,
                google_review_id: review.reviewId || review.name,
              })
            );

            return successResponse({
              reviews: googleReviews,
              source: 'google_api',
              totalCount: reviewsData.totalReviewCount || googleReviews.length,
              averageRating: reviewsData.averageRating || null,
            });
          }

          // If API call fails, fall through to local reviews
          console.warn('Google Reviews API returned non-OK:', reviewsResponse.status);
        } catch (apiErr) {
          console.warn('Google Reviews API error, falling back to local:', apiErr);
        }
      }
    }
  }

  // Fallback: fetch from local reviews table
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: localReviews, error: reviewsError, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (reviewsError) {
    return serverErrorResponse(reviewsError);
  }

  return successResponse({
    reviews: localReviews || [],
    source: 'local',
    totalCount: count || 0,
    page,
    pageSize,
  });
}

// ---------- POST: Reply to a Google review ----------
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.reviewId) {
      return badRequestResponse('reviewId is required');
    }
    if (!body.reply || body.reply.trim() === '') {
      return badRequestResponse('reply text is required');
    }

    const supabase = getSupabaseAdmin();

    // Check Google Business connection
    const { data: connection } = await supabase
      .from('integration_connections')
      .select('access_token, refresh_token, metadata, is_active, token_expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'google_business')
      .single();

    let googleReplySuccess = false;

    // Attempt to reply via Google API if connected
    if (connection && connection.is_active) {
      const metadata = (connection.metadata || {}) as Record<string, unknown>;
      const accountId = metadata.account_id as string;
      const locationId = metadata.location_id as string;

      if (accountId && locationId) {
        const accessToken = await getValidAccessToken(connection, user.id);

        if (accessToken) {
          try {
            const replyResponse = await fetch(
              `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${body.reviewId}/reply`,
              {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment: body.reply }),
              }
            );

            if (replyResponse.ok) {
              googleReplySuccess = true;
            } else {
              const errorData = await replyResponse.json();
              console.error('Google review reply failed:', errorData);
            }
          } catch (apiErr) {
            console.error('Google review reply API error:', apiErr);
          }
        }
      }
    }

    // Store the reply locally in the reviews table
    // Try to update the local review record if it has a matching google_review_id or id
    const { data: updatedReview } = await supabase
      .from('reviews')
      .update({
        reply: body.reply,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('id', body.reviewId)
      .select()
      .single();

    return successResponse({
      googleReplySuccess,
      localReviewUpdated: !!updatedReview,
      reviewId: body.reviewId,
      reply: body.reply,
      message: googleReplySuccess
        ? 'Reply posted to Google and saved locally'
        : 'Reply saved locally (Google API not available)',
    });
  } catch (err) {
    console.error('Google review reply error:', err);
    return serverErrorResponse(err);
  }
}

// Helper: convert Google star rating string to number
function starRatingToNumber(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[rating] || 0;
}
