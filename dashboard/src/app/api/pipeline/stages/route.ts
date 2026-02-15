// Pipeline Stages API - F1-B Task 11
// CRUD operations for pipeline stages stored in config

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getStagePreset, createDefaultPipelineConfig } from '@/lib/pipeline-presets';
import { saveConfigVersion, pruneConfigVersions } from '@/lib/config-versions';
import { PipelineStage } from '@/types/config';

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

// Helper to find component in tabs
function findComponent(tabs: any[], tabId: string, componentId: string) {
  for (const tab of tabs) {
    if (tab.id === tabId || !tabId) {
      for (const component of tab.components || []) {
        if (component.id === componentId) {
          return { tab, component };
        }
      }
    }
  }
  return null;
}

// GET /api/pipeline/stages - Get stages for a component
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const config_id = searchParams.get('config_id');
    const component_id = searchParams.get('component_id');
    const tab_id = searchParams.get('tab_id') || '';

    if (!config_id || !component_id) {
      return NextResponse.json(
        { success: false, error: 'config_id and component_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch config
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
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Find the component
    const result = findComponent(config.tabs || [], tab_id, component_id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    const { component } = result;

    // If component has pipeline config, return it
    if (component.pipeline?.stages) {
      return NextResponse.json({
        success: true,
        data: {
          stages: component.pipeline.stages,
          default_stage_id: component.pipeline.default_stage_id,
        },
      });
    }

    // Otherwise, return default stages based on business type
    const defaultPipeline = createDefaultPipelineConfig(
      config.business_type || 'generic',
      component_id
    );

    return NextResponse.json({
      success: true,
      data: defaultPipeline,
      isDefault: true,
    });
  } catch (error) {
    console.error('GET pipeline stages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline stages' },
      { status: 500 }
    );
  }
}

// POST /api/pipeline/stages - Add a new stage
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config_id, tab_id, component_id, name, color } = body;

    if (!config_id || !component_id || !name) {
      return NextResponse.json(
        { success: false, error: 'config_id, component_id, and name are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch config
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
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Save version before modifying
    await saveConfigVersion(supabase, config_id, config.tabs || [], config.colors || null);

    const tabs = config.tabs || [];
    const result = findComponent(tabs, tab_id || '', component_id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    const { component } = result;

    // Initialize pipeline if not exists
    if (!component.pipeline) {
      const defaultPipeline = createDefaultPipelineConfig(
        config.business_type || 'generic',
        component_id
      );
      component.pipeline = defaultPipeline;
    }

    // Generate new stage ID
    const existingIds = component.pipeline.stages.map((s: PipelineStage) => s.id);
    let newId = 'stage_1';
    let counter = 1;
    while (existingIds.includes(newId)) {
      counter++;
      newId = `stage_${counter}`;
    }

    // Create new stage at end
    const newStage: PipelineStage = {
      id: newId,
      name,
      color: color || '#6B7280',
      order: component.pipeline.stages.length,
    };

    component.pipeline.stages.push(newStage);

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
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to add stage' },
        { status: 500 }
      );
    }

    // Prune old versions
    await pruneConfigVersions(supabase, config_id);

    return NextResponse.json({
      success: true,
      data: {
        stages: component.pipeline.stages,
        default_stage_id: component.pipeline.default_stage_id,
        newStage,
      },
    });
  } catch (error) {
    console.error('POST pipeline stages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add stage' },
      { status: 500 }
    );
  }
}
