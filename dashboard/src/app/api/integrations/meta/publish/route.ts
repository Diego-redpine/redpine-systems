// Meta Publish API — Publish a social media post to Facebook/Instagram
// POST: Accepts { postId }, fetches the post, publishes via Graph API
// Returns mock success if no token is stored (real publishing requires Meta app review)

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

interface PlatformResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ---------- POST: Publish a social post to Facebook/Instagram ----------
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.postId) {
      return badRequestResponse('postId is required');
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch the post
    const { data: post, error: postError } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('id', body.postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      return notFoundResponse('Social media post');
    }

    // 2. Validate the post is publishable
    if (post.status === 'published') {
      return badRequestResponse('Post is already published');
    }

    if (!post.content || post.content.trim() === '') {
      return badRequestResponse('Post has no content to publish');
    }

    // 3. Check Meta connection
    const { data: connection } = await supabase
      .from('integration_connections')
      .select('access_token, refresh_token, metadata, is_active, token_expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'meta')
      .single();

    // If no connection or inactive, return mock success for development
    if (!connection || !connection.is_active) {
      await supabase
        .from('social_media_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.postId)
        .eq('user_id', user.id);

      return successResponse({
        published: true,
        mock: true,
        message: 'Post marked as published (Meta not connected — mock mode)',
        postId: body.postId,
      });
    }

    // 4. Check token expiration
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      if (expiresAt < new Date()) {
        await supabase
          .from('social_media_posts')
          .update({
            status: 'failed',
            error_message: 'Meta access token has expired. Please reconnect your account.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.postId)
          .eq('user_id', user.id);

        return NextResponse.json(
          {
            error: 'Meta access token expired. Please reconnect your Meta account.',
            code: 'TOKEN_EXPIRED',
          },
          { status: 401 }
        );
      }
    }

    // 5. Decrypt tokens
    let pageAccessToken: string;
    try {
      // Page token is stored in refresh_token field
      if (connection.refresh_token) {
        pageAccessToken = decrypt(connection.refresh_token);
      } else {
        pageAccessToken = decrypt(connection.access_token);
      }
    } catch {
      return serverErrorResponse(new Error('Failed to decrypt Meta tokens'));
    }

    const metadata = (connection.metadata || {}) as Record<string, unknown>;
    const pageId = metadata.page_id as string;

    if (!pageId) {
      return badRequestResponse(
        'No Facebook Page ID found. Please reconnect your Meta account and select a page.'
      );
    }

    // 6. Publish to connected platforms via Graph API
    const targetPlatforms = (post.platforms as string[]) || [];
    const results: Record<string, PlatformResult> = {};
    let hasError = false;

    // -- Facebook Page post --
    if (targetPlatforms.includes('facebook') || targetPlatforms.length === 0) {
      try {
        const fbResponse = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/feed`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: post.content,
              access_token: pageAccessToken,
            }),
          }
        );

        const fbResult = await fbResponse.json();

        if (fbResponse.ok && fbResult.id) {
          results.facebook = { success: true, postId: fbResult.id };
        } else {
          hasError = true;
          results.facebook = {
            success: false,
            error: fbResult.error?.message || 'Unknown Facebook API error',
          };
        }
      } catch (fbErr) {
        hasError = true;
        results.facebook = {
          success: false,
          error: fbErr instanceof Error ? fbErr.message : 'Facebook publish failed',
        };
      }
    }

    // -- Instagram post (requires media container + publish) --
    if (targetPlatforms.includes('instagram') && metadata.instagram_account_id) {
      const igAccountId = metadata.instagram_account_id as string;
      const mediaUrls = (post.media_urls as string[]) || (post.image_urls as string[]) || [];

      if (mediaUrls.length === 0) {
        // Instagram requires at least one image — skip without marking overall failure
        results.instagram = {
          success: false,
          error: 'Instagram posts require at least one image',
        };
      } else {
        try {
          // Step 1: Create media container
          const containerResponse = await fetch(
            `https://graph.facebook.com/v19.0/${igAccountId}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caption: post.content,
                image_url: mediaUrls[0],
                access_token: pageAccessToken,
              }),
            }
          );

          const containerResult = await containerResponse.json();

          if (containerResponse.ok && containerResult.id) {
            // Step 2: Publish the container
            const publishResponse = await fetch(
              `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  creation_id: containerResult.id,
                  access_token: pageAccessToken,
                }),
              }
            );

            const publishResult = await publishResponse.json();

            if (publishResponse.ok && publishResult.id) {
              results.instagram = { success: true, postId: publishResult.id };
            } else {
              hasError = true;
              results.instagram = {
                success: false,
                error: publishResult.error?.message || 'Instagram publish failed',
              };
            }
          } else {
            hasError = true;
            results.instagram = {
              success: false,
              error: containerResult.error?.message || 'Instagram container creation failed',
            };
          }
        } catch (igErr) {
          hasError = true;
          results.instagram = {
            success: false,
            error: igErr instanceof Error ? igErr.message : 'Instagram publish failed',
          };
        }
      }
    }

    // 7. Update post status based on results
    const anySuccess = Object.values(results).some((r) => r.success);

    const newStatus = anySuccess ? 'published' : 'failed';
    const errorMessage = hasError
      ? Object.entries(results)
          .filter(([, r]) => !r.success)
          .map(([platform, r]) => `${platform}: ${r.error}`)
          .join('; ')
      : null;

    await supabase
      .from('social_media_posts')
      .update({
        status: newStatus,
        published_at: anySuccess ? new Date().toISOString() : null,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.postId)
      .eq('user_id', user.id);

    return successResponse({
      published: anySuccess,
      postId: body.postId,
      results,
      status: newStatus,
    });
  } catch (err) {
    console.error('Meta publish error:', err);
    return serverErrorResponse(err);
  }
}
