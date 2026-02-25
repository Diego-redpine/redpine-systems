import { NextRequest, NextResponse } from 'next/server';

/**
 * Flask Onboarding Handoff API
 *
 * This endpoint receives the dashboard configuration from the Flask onboarding app
 * and returns a redirect URL for the brand board page.
 *
 * Flow:
 * 1. User completes onboarding chat in Flask
 * 2. Flask POSTs config to this endpoint
 * 3. This endpoint saves config and returns redirect URL
 * 4. Flask redirects user to the preview URL
 *
 * Example Flask code:
 * ```python
 * import requests
 *
 * config = {
 *     "business_name": "Bob's Cuts",
 *     "business_type": "barber",
 *     "visible_tabs": ["people", "time", "money", "comms"],
 *     "hidden_tabs": ["things", "tasks", "files"],
 *     "labels": {"people": "Clients"},
 *     "nav_style": "rounded",
 *     "nav_display": "icon_and_text",
 *     "modules_to_activate": ["contacts", "calendar", "account"]
 * }
 *
 * response = requests.post(
 *     "http://localhost:3000/api/handoff",
 *     json=config
 * )
 * data = response.json()
 * return redirect(data["redirect_url"])
 * ```
 */

// In-memory config store (use database in production)
const configStore = new Map<string, object>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique config ID
    const configId = `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Normalize config from Flask (snake_case to camelCase)
    const config = {
      id: configId,
      businessName: body.business_name || body.businessName || 'My Business',
      businessType: body.business_type || body.businessType || 'salon',
      visibleTabs: body.visible_tabs || body.visibleTabs || ['people', 'things', 'time', 'money', 'tasks', 'comms', 'files'],
      hiddenTabs: body.hidden_tabs || body.hiddenTabs || [],
      labels: body.labels || {},
      navStyle: body.nav_style || body.navStyle || 'rounded',
      navDisplayMode: body.nav_display || body.navDisplayMode || 'icon_and_text',
      modulesToActivate: body.modules_to_activate || body.modulesToActivate || ['contacts', 'calendar', 'account'],
      createdAt: new Date().toISOString(),
    };

    // Store config
    configStore.set(configId, config);

    // Also save to the config API store
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    // Build redirect URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${appUrl}/brand-board?config_id=${configId}`;

    return NextResponse.json({
      success: true,
      config_id: configId,
      redirect_url: redirectUrl,
      config,
    });
  } catch (error) {
    console.error('Handoff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process handoff' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a config (for debugging)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const configId = searchParams.get('id');

  if (!configId) {
    return NextResponse.json({
      success: true,
      message: 'Flask Handoff API',
      usage: {
        method: 'POST',
        body: {
          business_name: 'string',
          business_type: 'string (salon, barber, landscaping, etc.)',
          visible_tabs: 'array of tab IDs',
          hidden_tabs: 'array of tab IDs to hide',
          labels: 'object mapping tab IDs to custom labels',
          nav_style: 'rounded | half_rounded | square',
          nav_display: 'icon_only | text_only | icon_and_text',
          modules_to_activate: 'array of Odoo module names',
        },
        response: {
          success: true,
          config_id: 'unique config ID',
          redirect_url: 'URL to redirect user to',
        },
      },
    });
  }

  const config = configStore.get(configId);
  if (!config) {
    return NextResponse.json(
      { success: false, error: 'Config not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, config });
}
