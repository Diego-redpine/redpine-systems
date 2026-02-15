// Pipeline Stage by ID API - F1-B Task 11
// Update and delete individual pipeline stages

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

// PUT /api/pipeline/stages/[id] - Update a stage
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stage_id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config_id, tab_id, component_id, name, color, order, card_style } = body;

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

    if (!component.pipeline?.stages) {
      return NextResponse.json(
        { success: false, error: 'Component has no pipeline configuration' },
        { status: 400 }
      );
    }

    // Find the stage
    const stageIndex = component.pipeline.stages.findIndex(
      (s: PipelineStage) => s.id === stage_id
    );

    if (stageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Update stage properties
    const stage = component.pipeline.stages[stageIndex];
    if (name !== undefined) stage.name = name;
    if (color !== undefined) stage.color = color;
    if (order !== undefined) stage.order = order;
    if (card_style !== undefined) stage.card_style = card_style;

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
        { success: false, error: 'Failed to update stage' },
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
        updatedStage: stage,
      },
    });
  } catch (error) {
    console.error('PUT pipeline stage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

// DELETE /api/pipeline/stages/[id] - Delete a stage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stage_id } = await params;
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

    const tabs = config.tabs || [];
    const result = findComponent(tabs, tab_id, component_id);

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

    // Don't allow deleting if only 2 stages remain
    if (component.pipeline.stages.length <= 2) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete stage - minimum 2 stages required' },
        { status: 400 }
      );
    }

    // Find the stage
    const stageIndex = component.pipeline.stages.findIndex(
      (s: PipelineStage) => s.id === stage_id
    );

    if (stageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Save version before modifying
    await saveConfigVersion(supabase, config_id, config.tabs || [], config.colors || null);

    // Remove the stage
    const removedStage = component.pipeline.stages.splice(stageIndex, 1)[0];

    // Reorder remaining stages
    component.pipeline.stages.forEach((s: PipelineStage, idx: number) => {
      s.order = idx;
    });

    // Update default_stage_id if it was the deleted stage
    if (component.pipeline.default_stage_id === stage_id) {
      component.pipeline.default_stage_id = component.pipeline.stages[0]?.id || 'stage_1';
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
      console.error('Delete error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete stage' },
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
        removedStage,
      },
      message: `Deleted stage "${removedStage.name}"`,
    });
  } catch (error) {
    console.error('DELETE pipeline stage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
