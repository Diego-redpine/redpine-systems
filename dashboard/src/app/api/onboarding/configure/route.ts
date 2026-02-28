import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { detectTemplateType, getTemplate } from '@/lib/onboarding/registry';
import { validateConfig, type RawConfig } from '@/lib/onboarding/validation';
import { generateWebsiteSections, getTemplateKey, type WebsiteCopy } from '@/lib/onboarding/website-sections';
import { analyzeBusiness, analyzeWithTemplate, generateWebsiteCopy } from '@/lib/onboarding/ai-config';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute (config generation is expensive)
  const clientId = getClientId(request);
  const rl = await rateLimit(`onboarding-configure:${clientId}`, 5);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  try {
    const body = await request.json();
    const description: string = body.description ?? '';
    if (!description.trim()) {
      return NextResponse.json({ success: false, error: 'Description required' }, { status: 400 });
    }

    // ── Step 1: Generate config (template path or from-scratch) ──────────

    let config: RawConfig;
    let template: RawConfig | undefined;
    let lockedIds: Set<string> | undefined;

    const detection = detectTemplateType(description);
    if (detection) {
      console.log(`Template matched: ${detection.businessType} (family: ${detection.family})`);
      const templateResult = getTemplate(detection.businessType, detection.family);
      if (templateResult) {
        template = templateResult.template as unknown as RawConfig;
        lockedIds = templateResult.lockedIds;
        config = await analyzeWithTemplate(description, template, detection.businessType);
      } else {
        // Template family matched but no template for this type — fallback
        config = await analyzeBusiness(description);
      }
    } else {
      // No template match — use original build-from-scratch
      config = await analyzeBusiness(description);
    }

    // ── Step 2: Run validation pipeline ──────────────────────────────────

    config = validateConfig(config, template, lockedIds);
    console.log(`Config validated: ${config.business_name} (${config.business_type})`);

    // ── Step 3: Generate website data ────────────────────────────────────

    let websiteData: Record<string, unknown> | null = null;
    try {
      const bname = config.business_name ?? 'My Business';
      const btype = config.business_type ?? 'service';
      const bcolors = config.colors ?? {};
      console.log(`Generating website for ${bname} (${btype})...`);
      const websiteCopy: WebsiteCopy = await generateWebsiteCopy(bname, btype, description);
      console.log(`Website copy generated: ${Object.keys(websiteCopy).join(', ')}`);
      const sections = generateWebsiteSections(bname, btype, websiteCopy, bcolors);
      websiteData = sections as unknown as Record<string, unknown>;
      const pages = (sections as any).pages ?? [];
      const elements = (sections as any).elements ?? [];
      console.log(`Website data built: ${pages.length} pages, ${elements.length} elements`);
    } catch (e) {
      console.error('Website generation failed (continuing without):', e);
    }

    // ── Step 4: Save to Supabase ─────────────────────────────────────────

    const supabase = getSupabase();

    const configData: Record<string, unknown> = {
      user_id: null, // Anonymous until signup
      business_name: config.business_name ?? 'My Business',
      business_type: config.business_type ?? 'service',
      tabs: config.tabs ?? [],
      colors: config.colors ?? {},
      nav_style: 'sidebar',
      is_active: true,
    };
    if (websiteData) {
      configData.website_data = websiteData;
    }

    let insertResult = await supabase
      .from('configs')
      .insert(configData)
      .select('id')
      .single();

    // Retry without website_data if column doesn't exist yet
    if (insertResult.error && websiteData) {
      console.warn('Config insert failed with website_data, retrying without:', insertResult.error.message);
      const { website_data, ...withoutWebsite } = configData;
      insertResult = await supabase
        .from('configs')
        .insert(withoutWebsite)
        .select('id')
        .single();
    }

    if (insertResult.error) {
      console.error('Config save error:', insertResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to save config' },
        { status: 500 },
      );
    }

    const configId = insertResult.data!.id;
    console.log(`Saved to Supabase with ID: ${configId}`);

    // ── Step 5: Return response ──────────────────────────────────────────

    const responseData: Record<string, unknown> = {
      success: true,
      config,
      config_id: configId,
    };
    if (websiteData) {
      responseData.website_data = {
        pages: ((websiteData as any).pages ?? []).length,
        elements: ((websiteData as any).elements ?? []).length,
        template_key: getTemplateKey(config.business_type ?? ''),
      };
    }

    return NextResponse.json(responseData);
  } catch (e) {
    console.error('Configure error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Configuration failed' },
      { status: 500 },
    );
  }
}
