// Subdomain Auth Check API - F7 Check if current user owns this subdomain

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Get authenticated user from request cookies
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

// Create admin Supabase client
function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

// GET /api/subdomain/auth - Check if current user owns this subdomain
export async function GET(request: NextRequest) {
  try {
    // Get subdomain from header (set by middleware)
    const subdomain = request.headers.get('x-subdomain');

    if (!subdomain) {
      return NextResponse.json({
        success: true,
        data: {
          isOwner: false,
          canEdit: false,
          reason: 'Not a subdomain request',
        },
      });
    }

    // Check if user is authenticated
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          isOwner: false,
          canEdit: false,
          reason: 'Not authenticated',
        },
      });
    }

    // Check if user's profile subdomain matches
    const supabaseAdmin = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subdomain')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        success: true,
        data: {
          isOwner: false,
          canEdit: false,
          reason: 'Profile not found',
        },
      });
    }

    const isOwner = profile.subdomain === subdomain;

    return NextResponse.json({
      success: true,
      data: {
        isOwner,
        canEdit: isOwner,
        subdomain,
        userSubdomain: profile.subdomain,
      },
    });
  } catch (error) {
    console.error('GET subdomain auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check subdomain auth' },
      { status: 500 }
    );
  }
}
