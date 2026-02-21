import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import { validateSubdomain, isReservedSubdomain } from '@/lib/subdomain';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Create Supabase server client with service role (bypasses RLS)
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

// Generate a URL-safe subdomain from business name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate random 4-digit suffix
function randomSuffix(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Ensure subdomain meets minimum length
function ensureMinLength(subdomain: string, minLength: number = 3): string {
  if (subdomain.length < minLength) {
    return subdomain + randomSuffix();
  }
  return subdomain;
}

// POST /api/config/link - Link anonymous config to authenticated user
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get configId from request body
    const body = await request.json();
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: 'Config ID required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 3. Get the config and verify it's anonymous (user_id is null)
    const { data: config, error: configError } = await supabase
      .from('configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }

    if (config.user_id !== null) {
      return NextResponse.json(
        { success: false, error: 'Config already linked to a user' },
        { status: 400 }
      );
    }

    // 4. Generate subdomain from business_name
    let subdomain = slugify(config.business_name || 'my-business');

    // Ensure minimum length (3 characters)
    subdomain = ensureMinLength(subdomain, 3);

    // Check if subdomain is reserved
    if (isReservedSubdomain(subdomain)) {
      subdomain = `${subdomain}-${randomSuffix()}`;
    }

    // Validate subdomain format
    let validation = validateSubdomain(subdomain);
    if (!validation.valid) {
      // If invalid, add suffix and try again
      subdomain = `${subdomain}-${randomSuffix()}`;
      validation = validateSubdomain(subdomain);
      if (!validation.valid) {
        // Fallback to generic subdomain
        subdomain = `business-${randomSuffix()}`;
      }
    }

    // Check if subdomain is taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('subdomain')
      .eq('subdomain', subdomain)
      .single();

    if (existingProfile) {
      // Subdomain taken, append random suffix
      subdomain = `${subdomain}-${randomSuffix()}`;
    }

    // 5. Update the config to link it to the user
    const { data: updatedConfig, error: updateConfigError } = await supabase
      .from('configs')
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', configId)
      .is('user_id', null) // PostgREST requires .is() for null comparison
      .select('id')
      .single();

    if (updateConfigError || !updatedConfig) {
      console.error('Failed to link config:', updateConfigError);
      return NextResponse.json(
        { success: false, error: 'Failed to link config. It may already be claimed.' },
        { status: 500 }
      );
    }

    // 6. Upsert the user's profile with business_name and subdomain
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        business_name: config.business_name,
        subdomain: subdomain,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (updateProfileError) {
      console.error('Failed to update profile:', updateProfileError);
      // Don't fail the whole request - config is linked, profile update is secondary
    }

    // 7. Send welcome email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      await sendEmail({
        to: user.email!,
        subject: 'Welcome to Red Pine!',
        html: welcomeEmail(config.business_name || 'there', `${appUrl}/dashboard`),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request - email is non-critical
    }

    return NextResponse.json({
      success: true,
      configId: configId,
      subdomain: subdomain,
      message: 'Config linked successfully'
    });

  } catch (error) {
    console.error('Link config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to link config' },
      { status: 500 }
    );
  }
}
