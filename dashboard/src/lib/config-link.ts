import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import { validateSubdomain, isReservedSubdomain } from '@/lib/subdomain';

// Create Supabase admin client (bypasses RLS)
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

// Generate a URL-safe subdomain from business name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export interface LinkConfigResult {
  success: boolean;
  subdomain?: string;
  error?: string;
}

/**
 * Link an anonymous config to an authenticated user.
 * - Verifies config exists with user_id IS NULL
 * - Generates and validates subdomain from business_name
 * - Updates config user_id
 * - Upserts profile with business_name + subdomain
 * - Sends welcome email (best effort)
 */
export async function linkConfigToUser(
  userId: string,
  userEmail: string,
  configId: string
): Promise<LinkConfigResult> {
  const supabase = getSupabaseAdmin();

  // 1. Get the config and verify it's anonymous
  const { data: config, error: configError } = await supabase
    .from('configs')
    .select('*')
    .eq('id', configId)
    .single();

  if (configError || !config) {
    return { success: false, error: 'Config not found' };
  }

  if (config.user_id !== null) {
    return { success: false, error: 'Config already linked to a user' };
  }

  // 2. Generate subdomain from business_name
  let subdomain = slugify(config.business_name || 'my-business');
  subdomain = ensureMinLength(subdomain, 3);

  if (isReservedSubdomain(subdomain)) {
    subdomain = `${subdomain}-${randomSuffix()}`;
  }

  let validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    subdomain = `${subdomain}-${randomSuffix()}`;
    validation = validateSubdomain(subdomain);
    if (!validation.valid) {
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
    subdomain = `${subdomain}-${randomSuffix()}`;
  }

  // 3. Update config to link to user
  const { data: updatedConfig, error: updateConfigError } = await supabase
    .from('configs')
    .update({
      user_id: userId,
      updated_at: new Date().toISOString()
    })
    .eq('id', configId)
    .is('user_id', null)
    .select('id')
    .single();

  if (updateConfigError || !updatedConfig) {
    console.error('Failed to link config:', updateConfigError);
    return { success: false, error: 'Failed to link config. It may already be claimed.' };
  }

  // 4. Upsert profile
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      business_name: config.business_name,
      subdomain: subdomain,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (updateProfileError) {
    console.error('Failed to update profile:', updateProfileError);
  }

  // 5. Send welcome email (best effort)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    await sendEmail({
      to: userEmail,
      subject: 'Welcome to Red Pine!',
      html: welcomeEmail(config.business_name || 'there', `${appUrl}/dashboard`),
    });
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  return { success: true, subdomain };
}
