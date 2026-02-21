import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { linkConfigToUser } from '@/lib/config-link';

// Force dynamic rendering
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
  return user;
}

// POST /api/config/link - Link anonymous config to authenticated user
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get configId from request body
    const body = await request.json();
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: 'Config ID required' },
        { status: 400 }
      );
    }

    // 3. Link config using shared utility
    const result = await linkConfigToUser(user.id, user.email || '', configId);

    if (!result.success) {
      const status = result.error === 'Config not found' ? 404
        : result.error === 'Config already linked to a user' ? 400
        : 500;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      configId: configId,
      subdomain: result.subdomain,
      message: 'Config linked successfully'
    });

  } catch (error) {
    console.error('Link config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to link config' },
      { status: 500 }
    );
  }
}
