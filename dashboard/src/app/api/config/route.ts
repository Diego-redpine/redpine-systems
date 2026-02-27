import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DashboardConfig, DashboardTab, TabComponent } from '@/types/config';
import { saveConfigVersion, pruneConfigVersions } from '@/lib/config-versions';
import { rateLimit, getClientId } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Create Supabase server client (bypasses RLS with service role)
function getSupabase() {
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

// Get authenticated user from request cookies (for user-specific queries)
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

// Convert Supabase config to DashboardConfig format
function toAppConfig(dbConfig: any): DashboardConfig & { websiteData?: any } {
  const result: DashboardConfig & { websiteData?: any } = {
    id: dbConfig.id,
    businessName: dbConfig.business_name,
    businessType: dbConfig.business_type,
    tabs: dbConfig.tabs || [],
    platformTabs: ['site', 'analytics', 'settings'],
    colors: dbConfig.colors || {},
  };
  // Font fields: try DB columns first, then fall back to colors JSONB
  if (dbConfig.heading_font) {
    result.headingFont = dbConfig.heading_font;
  } else if (dbConfig.colors?._headingFont) {
    result.headingFont = dbConfig.colors._headingFont;
  }
  if (dbConfig.body_font) {
    result.bodyFont = dbConfig.body_font;
  } else if (dbConfig.colors?._bodyFont) {
    result.bodyFont = dbConfig.colors._bodyFont;
  }
  if (dbConfig.website_data) {
    result.websiteData = dbConfig.website_data;
  }
  return result;
}

// Default config for when none is found
function getDefaultConfig(configId?: string): DashboardConfig {
  return {
    id: configId || 'default',
    businessName: 'My Business',
    businessType: 'service',
    tabs: [
      {
        id: 'tab_1',
        label: 'Clients',
        icon: 'people',
        components: [{ id: 'clients', label: 'Clients' }],
      },
      {
        id: 'tab_2',
        label: 'Schedule',
        icon: 'clock',
        components: [{ id: 'appointments', label: 'Appointments' }],
      },
      {
        id: 'tab_3',
        label: 'Payments',
        icon: 'dollar',
        components: [
          { id: 'payments', label: 'Payments' },
          { id: 'invoices', label: 'Invoices' },
        ],
      },
    ],
    platformTabs: ['site', 'analytics', 'settings'],
  };
}

// GET /api/config?id=xxx - Get config by ID (public for preview)
// GET /api/config (no ID) - Get authenticated user's active config
export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const clientId = getClientId(request);
  const rateLimitResult = rateLimit(`config-get:${clientId}`, 30);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const configId = searchParams.get('id');

  try {
    // If ID provided, fetch that specific config
    if (configId) {
      const { data, error } = await supabase
        .from('configs')
        .select('*')
        .eq('id', configId)
        .single();

      if (error || !data) {
        // Return default config if not found
        return NextResponse.json({
          success: true,
          data: getDefaultConfig(configId),
        });
      }

      return NextResponse.json({
        success: true,
        data: toAppConfig(data),
      });
    }

    // No ID - try to get authenticated user's config
    const user = await getAuthenticatedUser(request);

    if (user) {
      const { data, error } = await supabase
        .from('configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        return NextResponse.json({
          success: true,
          data: toAppConfig(data),
        });
      }
    }

    // No config found
    return NextResponse.json({
      success: false,
      error: 'No config found',
    }, { status: 404 });

  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get config' },
      { status: 500 }
    );
  }
}

// Helper to check if string is valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// PUT /api/config - Update config by ID (requires authentication + ownership)
export async function PUT(request: NextRequest) {
  // Require authentication
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    let { id, tabs, colors, businessName, businessType, headingFont, bodyFont } = body;

    // If no ID or invalid UUID, find the user's active config
    if (!id || !isValidUUID(id)) {
      const { data: userConfig } = await supabase
        .from('configs')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (userConfig) {
        id = userConfig.id;
      }
    }

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: 'Valid config ID required' },
        { status: 400 }
      );
    }

    // Verify user owns this config (or is a team member with access)
    const { data: configOwner } = await supabase
      .from('configs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!configOwner) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }

    // Check ownership: direct owner or team member of the owner
    if (configOwner.user_id !== user.id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_owner_id', configOwner.user_id)
        .eq('status', 'active')
        .single();

      if (!teamMember) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to modify this config' },
          { status: 403 }
        );
      }
    }

    // VERSIONING: Fetch current config state BEFORE updating
    const { data: currentConfig, error: fetchError } = await supabase
      .from('configs')
      .select('tabs, colors')
      .eq('id', id)
      .single();

    if (!fetchError && currentConfig) {
      // Save the current state as a version (so we can undo)
      await saveConfigVersion(
        supabase,
        id,
        currentConfig.tabs || [],
        currentConfig.colors || null
      );
    }

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (tabs !== undefined) updates.tabs = tabs;
    // Merge colors instead of replacing (allows partial color updates)
    if (colors !== undefined) {
      const existingColors = currentConfig?.colors || {};
      updates.colors = { ...existingColors, ...colors };
    }
    if (businessName !== undefined) updates.business_name = businessName;
    if (businessType !== undefined) updates.business_type = businessType;
    // Store fonts in colors JSONB (DB columns may not exist yet)
    if (headingFont !== undefined || bodyFont !== undefined) {
      const existingColors = updates.colors || currentConfig?.colors || {};
      if (headingFont !== undefined) existingColors._headingFont = headingFont;
      if (bodyFont !== undefined) existingColors._bodyFont = bodyFont;
      updates.colors = existingColors;
    }

    const { data, error } = await supabase
      .from('configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update config error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // VERSIONING: Prune old versions to keep storage bounded
    await pruneConfigVersions(supabase, id);

    return NextResponse.json({
      success: true,
      data: toAppConfig(data),
    });

  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

// POST /api/config - Create new config
export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const clientId = getClientId(request);
  const rateLimitResult = rateLimit(`config-post:${clientId}`, 10);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.reset / 1000)) } }
    );
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { businessName, businessType, tabs, colors, websiteData } = body;

    // Check for authenticated user — use their ID if available
    // Anonymous configs (from onboarding) are allowed with user_id = null
    const user = await getAuthenticatedUser(request);
    const ownerId = user?.id || null;

    // Create config record — user_id comes from auth, never from request body
    const configData: Record<string, any> = {
      user_id: ownerId,
      business_name: businessName || 'My Business',
      business_type: businessType || 'service',
      tabs: tabs || getDefaultConfig().tabs,
      colors: colors || {},
      nav_style: 'sidebar',
      is_active: true,
    };

    // Include website_data if provided (from onboarding website generation)
    if (websiteData) {
      configData.website_data = websiteData;
    }

    let { data, error } = await supabase
      .from('configs')
      .insert(configData)
      .select()
      .single();

    // If insert failed (e.g. website_data column doesn't exist yet), retry without it
    if (error && configData.website_data) {
      console.warn('Config insert failed with website_data, retrying without:', error.message);
      const { website_data, ...configWithoutWebsite } = configData;
      const retry = await supabase
        .from('configs')
        .insert(configWithoutWebsite)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Create config error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toAppConfig(data),
    });

  } catch (error) {
    console.error('Create config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create config' },
      { status: 500 }
    );
  }
}
