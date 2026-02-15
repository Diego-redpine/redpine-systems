import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getVersionHistory } from '@/lib/config-versions';

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

// GET /api/config/versions?config_id=xxx - Get version history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const configId = searchParams.get('config_id');

  if (!configId) {
    return NextResponse.json(
      { success: false, error: 'config_id is required' },
      { status: 400 }
    );
  }

  try {
    // Verify user owns this config
    const { user } = await getAuthenticatedUser(request);
    const supabaseAdmin = getSupabaseAdmin();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check config ownership
    const { data: config, error: configError } = await supabaseAdmin
      .from('configs')
      .select('user_id')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }

    if (config.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this config' },
        { status: 403 }
      );
    }

    // Get version history
    const versions = await getVersionHistory(supabaseAdmin, configId, 20);

    return NextResponse.json({
      success: true,
      data: versions,
    });

  } catch (error) {
    console.error('Get version history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get version history' },
      { status: 500 }
    );
  }
}
