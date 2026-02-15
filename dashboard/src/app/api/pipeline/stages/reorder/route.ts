// Pipeline Stage Reorder API - F1-B Task 12
// Reorder pipeline stages

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

// PUT /api/pipeline/stages/reorder - Reorder stages
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
    const { config_id, tab_id, component_id, ordered_stage_ids } = body;

    if (!config_id || !component_id || !ordered_stage_ids) {
      return NextResponse.json(
        { success: false, error: 'config_id, component_id, and ordered_stage_ids are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(ordered_stage_ids)) {
      return NextResponse.json(
        { success: false, error: 'ordered_stage_ids must be an array' },
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

    const tabs = config.tabs || [];
    const result = findComponent(tabs, tab_id || '', component_id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    const { component } = result;

    if (!component.pipeline?.stages) {
      return NextResponse.json(
        { success: false, error: 'Component has no pipeline configuration' },
        { status: 400 }
      );
    }

    // Validate all stage IDs exist
    const existingIds = new Set(component.pipeline.stages.map((s: PipelineStage) => s.id));
    for (const id of ordered_stage_ids) {
      if (!existingIds.has(id)) {
        return NextResponse.json(
          { success: false, error: `Stage ID "${id}" not found` },
          { status: 400 }
        );
      }
    }

    // Validate all existing stages are in the new order
    if (ordered_stage_ids.length !== component.pipeline.stages.length) {
      return NextResponse.json(
        { success: false, error: 'ordered_stage_ids must contain all stage IDs' },
        { status: 400 }
      );
    }

    // Save version before modifying
    await saveConfigVersion(supabase, config_id, config.tabs || [], config.colors || null);

    // Create a map of stages by ID
    const stageMap = new Map<string, PipelineStage>();
    for (const stage of component.pipeline.stages) {
      stageMap.set(stage.id, stage);
    }

    // Reorder stages according to ordered_stage_ids
    const reorderedStages: PipelineStage[] = [];
    for (let i = 0; i < ordered_stage_ids.length; i++) {
      const stage = stageMap.get(ordered_stage_ids[i])!;
      stage.order = i;
      reorderedStages.push(stage);
    }

    component.pipeline.stages = reorderedStages;

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
      console.error('Reorder error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reorder stages' },
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
      },
      message: 'Stages reordered successfully',
    });
  } catch (error) {
    console.error('PUT pipeline reorder error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder stages' },
      { status: 500 }
    );
  }
}
