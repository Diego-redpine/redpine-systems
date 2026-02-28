// Meta (Facebook) Reviews — Fetch and reply to Facebook page reviews/recommendations
// GET: Fetch Facebook page reviews via Graph API (uses Meta OAuth token from integrations)
// POST: Reply to a Facebook review

import { NextRequest } from 'next/server';
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

// Helper: get Meta connection and decrypt the page access token
async function getMetaPageToken(
  userId: string
): Promise<{
  token: string | null;
  pageId: string | null;
  error?: string;
}> {
  const supabase = getSupabaseAdmin();

  const { data: connection } = await supabase
    .from('integration_connections')
    .select('access_token, refresh_token, metadata, is_active, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'meta')
    .single();

  if (!connection || !connection.is_active) {
    return { token: null, pageId: null, error: 'Meta integration not connected' };
  }

  // Check token expiration
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at);
    if (expiresAt < new Date()) {
      return {
        token: null,
        pageId: null,
        error: 'Meta access token expired. Please reconnect your Meta account.',
      };
    }
  }

  const metadata = (connection.metadata || {}) as Record<string, unknown>;
  const pageId = metadata.page_id as string;

  if (!pageId) {
    return {
      token: null,
      pageId: null,
      error: 'No Facebook Page ID found. Please reconnect your Meta account.',
    };
  }

  try {
    // Page access token is stored in refresh_token field
    const token = connection.refresh_token
      ? decrypt(connection.refresh_token)
      : decrypt(connection.access_token);
    return { token, pageId };
  } catch {
    return { token: null, pageId: null, error: 'Failed to decrypt Meta tokens' };
  }
}

// ---------- GET: Fetch Facebook page reviews ----------
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { token, pageId, error: tokenError } = await getMetaPageToken(user.id);

  // If Meta is not connected, return local reviews filtered by source=facebook
  if (!token || !pageId) {
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: localReviews, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('source', 'facebook')
      .order('created_at', { ascending: false })
      .range(from, to);

    return successResponse({
      reviews: localReviews || [],
      source: 'local',
      connected: false,
      message: tokenError || 'Meta not connected — showing local Facebook reviews',
      totalCount: count || 0,
    });
  }

  // Fetch reviews from Facebook Graph API
  try {
    // Facebook Page ratings/reviews endpoint
    // Note: Facebook deprecated "reviews" in favor of "ratings" for pages
    const reviewsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/ratings?fields=reviewer,rating,review_text,created_time,open_graph_story,has_review,recommendation_type&limit=50&access_token=${token}`,
      { method: 'GET' }
    );

    if (!reviewsResponse.ok) {
      const errorData = await reviewsResponse.json();
      console.error('Facebook Reviews API error:', errorData);

      // Fall back to local reviews
      const supabase = getSupabaseAdmin();
      const { data: localReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'facebook')
        .order('created_at', { ascending: false })
        .limit(50);

      return successResponse({
        reviews: localReviews || [],
        source: 'local',
        connected: true,
        message: 'Facebook API error — showing cached reviews',
        apiError: errorData.error?.message || 'Unknown error',
      });
    }

    const reviewsData = await reviewsResponse.json();

    // Transform Facebook review format to our standard format
    const facebookReviews = (reviewsData.data || []).map(
      (review: Record<string, unknown>) => {
        const reviewer = review.reviewer as Record<string, string> | null;
        return {
          id: review.open_graph_story || `fb-${Date.now()}-${Math.random()}`,
          source: 'facebook',
          customer: reviewer?.name || 'Facebook User',
          customer_profile_url: reviewer?.id
            ? `https://facebook.com/${reviewer.id}`
            : null,
          rating: (review.rating as number) || (review.recommendation_type === 'positive' ? 5 : 3),
          comment: (review.review_text as string) || '',
          recommendation_type: review.recommendation_type || null,
          has_review: review.has_review || false,
          created_at: review.created_time,
          facebook_review_id: review.open_graph_story || null,
        };
      }
    );

    // Also fetch the overall page rating
    let overallRating = null;
    try {
      const ratingResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=overall_star_rating,rating_count&access_token=${token}`
      );
      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        overallRating = {
          averageRating: ratingData.overall_star_rating || null,
          totalCount: ratingData.rating_count || 0,
        };
      }
    } catch {
      // Non-critical — overall rating is supplementary
    }

    return successResponse({
      reviews: facebookReviews,
      source: 'facebook_api',
      connected: true,
      totalCount: facebookReviews.length,
      overallRating,
      paging: reviewsData.paging || null,
    });
  } catch (err) {
    console.error('Facebook reviews fetch error:', err);
    return serverErrorResponse(err);
  }
}

// ---------- POST: Reply to a Facebook review ----------
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

    const { token, pageId, error: tokenError } = await getMetaPageToken(user.id);

    if (!token || !pageId) {
      // Store locally even if Meta is not connected
      const supabase = getSupabaseAdmin();
      await supabase
        .from('reviews')
        .update({
          reply: body.reply,
          replied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('id', body.reviewId);

      return successResponse({
        facebookReplySuccess: false,
        localReplyStored: true,
        message: tokenError || 'Meta not connected — reply saved locally only',
      });
    }

    // Reply to the review/recommendation on Facebook
    // Facebook reviews are replied to by commenting on the open_graph_story
    let facebookReplySuccess = false;

    try {
      const replyResponse = await fetch(
        `https://graph.facebook.com/v19.0/${body.reviewId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: body.reply,
            access_token: token,
          }),
        }
      );

      if (replyResponse.ok) {
        facebookReplySuccess = true;
      } else {
        const errorData = await replyResponse.json();
        console.error('Facebook review reply failed:', errorData);
      }
    } catch (apiErr) {
      console.error('Facebook review reply API error:', apiErr);
    }

    // Also store the reply locally
    const supabase = getSupabaseAdmin();
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
      facebookReplySuccess,
      localReviewUpdated: !!updatedReview,
      reviewId: body.reviewId,
      reply: body.reply,
      message: facebookReplySuccess
        ? 'Reply posted to Facebook and saved locally'
        : 'Reply saved locally (Facebook API reply failed)',
    });
  } catch (err) {
    console.error('Facebook review reply error:', err);
    return serverErrorResponse(err);
  }
}
