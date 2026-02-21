import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { linkConfigToUser } from '@/lib/config-link';

export const dynamic = 'force-dynamic';

/**
 * GET /auth/session?access_token=...&refresh_token=...&config_id=...
 *
 * Handles the post-signup handoff from Flask onboarding:
 * 1. Sets Supabase auth cookies from the provided tokens
 * 2. Links the config to the authenticated user (if config_id provided)
 * 3. Redirects to /dashboard with a valid cookie session
 *
 * This route is public (matched by /auth prefix in middleware PUBLIC_ROUTES).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const configId = searchParams.get('config_id');

  // Validate required params
  if (!accessToken || !refreshToken || accessToken === 'null' || refreshToken === 'null') {
    return NextResponse.redirect(`${origin}/login?error=missing_tokens`);
  }

  // Create response first so we can set cookies on it
  const redirectUrl = new URL('/dashboard', origin);
  const response = NextResponse.redirect(redirectUrl);

  // Create Supabase client that writes cookies to the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Set the session from the provided tokens — this triggers cookie writes
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.user) {
    console.error('Failed to set session:', error);
    return NextResponse.redirect(`${origin}/login?error=session_failed`);
  }

  // Link config if provided
  if (configId) {
    try {
      const result = await linkConfigToUser(
        data.user.id,
        data.user.email || '',
        configId
      );
      if (!result.success) {
        console.error('Config link failed:', result.error);
        // Don't block redirect — user can still access dashboard
      }
    } catch (err) {
      console.error('Config link error:', err);
    }
  }

  return response;
}
