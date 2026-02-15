// Pipeline Summary API - F1-B Task 14
// Get item counts and totals per stage

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createDefaultPipelineConfig } from '@/lib/pipeline-presets';
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

// Map component IDs to their database tables
const COMPONENT_TABLE_MAP: Record<string, string> = {
  leads: 'leads',
  jobs: 'tasks', // jobs use tasks table
  projects: 'tasks', // projects use tasks table
  workflows: 'tasks', // workflows use tasks table
};

// Map component IDs to their value fields (if any)
const COMPONENT_VALUE_FIELD: Record<string, string | null> = {
  leads: 'value_cents',
  jobs: null,
  projects: null,
  workflows: null,
};

// GET /api/pipeline/summary - Get counts per stage
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

    // Get stages (from component or defaults)
    let stages: PipelineStage[];
    if (result?.component?.pipeline?.stages) {
      stages = result.component.pipeline.stages;
    } else {
      const defaultPipeline = createDefaultPipelineConfig(
        config.business_type || 'generic',
        component_id
      );
      stages = defaultPipeline.stages;
    }

    // Get the table name for this component
    const tableName = COMPONENT_TABLE_MAP[component_id];
    if (!tableName) {
      return NextResponse.json(
        { success: false, error: `Component '${component_id}' does not support pipeline summary` },
        { status: 400 }
      );
    }

    // Get value field if exists
    const valueField = COMPONENT_VALUE_FIELD[component_id];

    // Fetch all items for this user with stage_id
    // Type the response as array of records with stage_id and optional value field
    type ItemRecord = { stage_id: string | null; [key: string]: unknown };

    const { data: items, error: itemsError } = await supabase
      .from(tableName)
      .select(valueField ? `stage_id, ${valueField}` : 'stage_id')
      .eq('user_id', user.id);

    if (itemsError) {
      console.error('Fetch items error:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch items' },
        { status: 500 }
      );
    }

    const typedItems = (items || []) as unknown as ItemRecord[];

    // Count items per stage
    const stageSummary = stages.map(stage => {
      const stageItems = typedItems.filter(item => item.stage_id === stage.id);
      const count = stageItems.length;

      // Calculate total value if value field exists
      let total_value: number | null = null;
      if (valueField) {
        total_value = stageItems.reduce((sum, item) => {
          const value = item[valueField];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      }

      return {
        stage_id: stage.id,
        stage_name: stage.name,
        color: stage.color,
        order: stage.order,
        count,
        ...(total_value !== null && { total_value }),
      };
    });

    // Also count items with no stage_id (unassigned)
    const unassignedItems = typedItems.filter(item => !item.stage_id);
    const unassignedCount = unassignedItems.length;

    return NextResponse.json({
      success: true,
      data: {
        stages: stageSummary,
        unassigned: {
          count: unassignedCount,
          ...(valueField && {
            total_value: unassignedItems.reduce((sum, item) => {
              const value = item[valueField];
              return sum + (typeof value === 'number' ? value : 0);
            }, 0),
          }),
        },
        totals: {
          count: typedItems.length,
          ...(valueField && {
            total_value: typedItems.reduce((sum, item) => {
              const value = item[valueField];
              return sum + (typeof value === 'number' ? value : 0);
            }, 0),
          }),
        },
      },
    });
  } catch (error) {
    console.error('GET pipeline summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline summary' },
      { status: 500 }
    );
  }
}
