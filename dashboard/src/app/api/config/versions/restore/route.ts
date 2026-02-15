import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getVersionById, saveConfigVersion } from '@/lib/config-versions';

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

// POST /api/config/versions/restore - Restore a specific version by ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config_id, version_id } = body;

    if (!config_id || !version_id) {
      return NextResponse.json(
        { success: false, error: 'config_id and version_id are required' },
        { status: 400 }
      );
    }

    // Verify user owns this config
    const user = await getAuthenticatedUser(request);
    const supabaseAdmin = getSupabaseAdmin();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check config ownership and get current state
    const { data: currentConfig, error: configError } = await supabaseAdmin
      .from('configs')
      .select('*')
      .eq('id', config_id)
      .single();

    if (configError || !currentConfig) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }

    if (currentConfig.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify this config' },
        { status: 403 }
      );
    }

    // Get the specific version to restore
    const version = await getVersionById(supabaseAdmin, version_id);

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    // Verify the version belongs to this config
    if (version.config_id !== config_id) {
      return NextResponse.json(
        { success: false, error: 'Version does not belong to this config' },
        { status: 400 }
      );
    }

    // Save the CURRENT state as a new version before restoring
    // This makes the restore itself undoable
    await saveConfigVersion(
      supabaseAdmin,
      config_id,
      currentConfig.tabs || [],
      currentConfig.colors || null
    );

    // Restore the config from the version snapshot
    const { data: restoredConfig, error: updateError } = await supabaseAdmin
      .from('configs')
      .update({
        tabs: version.tabs_snapshot,
        colors: version.colors_snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config_id)
      .select()
      .single();

    if (updateError) {
      console.error('Restore error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: restoredConfig.id,
        businessName: restoredConfig.business_name,
        businessType: restoredConfig.business_type,
        tabs: restoredConfig.tabs,
        colors: restoredConfig.colors,
        platformTabs: ['site', 'analytics', 'settings'],
      },
      message: `Restored to version ${version.version_number}`,
    });

  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore version' },
      { status: 500 }
    );
  }
}
