// View Preference API - F1-A Task 4
// Update a component's view preference in the config

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isViewAvailable, ViewType } from '@/lib/view-registry';
import { saveConfigVersion, pruneConfigVersions } from '@/lib/config-versions';

export const dynamic = 'force-dynamic';

const VALID_VIEWS: ViewType[] = ['table', 'calendar', 'cards', 'pipeline', 'list'];

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

// PUT /api/views/preference - Update a component's view preference
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config_id, tab_id, component_id, view } = body;

    // Validate required fields
    if (!config_id || !tab_id || !component_id || !view) {
      return NextResponse.json(
        { success: false, error: 'config_id, tab_id, component_id, and view are required' },
        { status: 400 }
      );
    }

    // Validate view type
    if (!VALID_VIEWS.includes(view)) {
      return NextResponse.json(
        { success: false, error: `Invalid view type. Must be one of: ${VALID_VIEWS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate view is available for this component
    if (!isViewAvailable(component_id, view)) {
      return NextResponse.json(
        { success: false, error: `View '${view}' is not available for component '${component_id}'` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch current config
    const { data: config, error: fetchError } = await supabase
      .from('configs')
      .select('*')
      .eq('id', config_id)
      .single();

    if (fetchError || !config) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (config.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify this config' },
        { status: 403 }
      );
    }

    // Save version before modifying (F6)
    await saveConfigVersion(supabase, config_id, config.tabs || [], config.colors || null);

    // Update the specific component's view in the tabs array
    const tabs = config.tabs || [];
    let updated = false;

    for (const tab of tabs) {
      if (tab.id === tab_id) {
        for (const component of tab.components || []) {
          if (component.id === component_id) {
            component.view = view;
            updated = true;
            break;
          }
        }
        if (updated) break;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Component not found in specified tab' },
        { status: 404 }
      );
    }

    // Save updated config
    const { data: updatedConfig, error: updateError } = await supabase
      .from('configs')
      .update({
        tabs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update config error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update view preference' },
        { status: 500 }
      );
    }

    // Prune old versions (F6)
    await pruneConfigVersions(supabase, config_id);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedConfig.id,
        tabs: updatedConfig.tabs,
        colors: updatedConfig.colors,
      },
      message: `View updated to '${view}' for ${component_id}`,
    });
  } catch (error) {
    console.error('PUT view preference error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update view preference' },
      { status: 500 }
    );
  }
}
