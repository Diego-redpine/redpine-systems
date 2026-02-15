// Subdomain utilities for F7 - Multi-tenant routing

import { createServerClient } from '@supabase/ssr';

// Environment variable for root domain
// Production: 'redpine.systems'
// Development: 'localhost:3000'
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Reserved subdomains that cannot be used
const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'preview',
  'login',
  'signup',
  'auth',
  'mail',
  'ftp',
  'static',
  'assets',
  'cdn',
  'blog',
  'help',
  'support',
  'docs',
  'status',
];

/**
 * Extract subdomain from hostname
 *
 * Examples:
 * - 'tony-barber.redpine.systems' -> 'tony-barber'
 * - 'www.redpine.systems' -> null
 * - 'redpine.systems' -> null
 * - 'localhost:3000' -> null
 * - 'tony-barber.localhost:3000' -> 'tony-barber'
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present for comparison
  const hostWithoutPort = hostname.split(':')[0];
  const rootWithoutPort = ROOT_DOMAIN.split(':')[0];

  // Handle localhost
  if (rootWithoutPort === 'localhost') {
    // For localhost, check if there's a subdomain prefix
    // e.g., 'tony-barber.localhost' -> 'tony-barber'
    if (hostWithoutPort.endsWith('.localhost')) {
      const subdomain = hostWithoutPort.replace('.localhost', '');
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        return subdomain;
      }
    }
    return null;
  }

  // Handle production domain (e.g., redpine.systems)
  // If hostname is exactly the root domain or www.root, return null
  if (hostWithoutPort === rootWithoutPort || hostWithoutPort === `www.${rootWithoutPort}`) {
    return null;
  }

  // Check if hostname ends with root domain
  if (hostWithoutPort.endsWith(`.${rootWithoutPort}`)) {
    const subdomain = hostWithoutPort.replace(`.${rootWithoutPort}`, '');
    // Don't return www as a valid subdomain
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  return null;
}

/**
 * Validate subdomain format
 * - 3-63 characters
 * - lowercase alphanumeric + hyphens only
 * - cannot start or end with hyphen
 * - cannot be reserved
 */
export function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  if (!subdomain) {
    return { valid: false, error: 'Subdomain is required' };
  }

  if (subdomain.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters' };
  }

  if (subdomain.length > 63) {
    return { valid: false, error: 'Subdomain must be 63 characters or less' };
  }

  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { valid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
  }

  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { valid: false, error: 'Subdomain cannot start or end with a hyphen' };
  }

  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return { valid: false, error: 'This subdomain is reserved' };
  }

  return { valid: true };
}

/**
 * Check if a subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

// Create admin Supabase client (bypasses RLS)
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

/**
 * Get config data by subdomain
 *
 * 1. Queries profiles table for matching subdomain
 * 2. If found, queries configs for active config owned by that user
 * 3. Returns { profile, config } or null
 */
export async function getConfigBySubdomain(subdomain: string): Promise<{
  profile: {
    id: string;
    email: string;
    business_name: string | null;
    subdomain: string;
    plan: string;
  };
  config: {
    id: string;
    business_name: string | null;
    business_type: string | null;
    tabs: unknown[];
    colors: Record<string, string> | null;
    nav_style: string;
  };
} | null> {
  const supabase = getSupabaseAdmin();

  // Find profile by subdomain
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, business_name, subdomain, plan')
    .eq('subdomain', subdomain)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Find active config for this user
  const { data: config, error: configError } = await supabase
    .from('configs')
    .select('id, business_name, business_type, tabs, colors, nav_style')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .single();

  if (configError || !config) {
    return null;
  }

  return { profile, config };
}

/**
 * Generate subdomain URL
 */
export function getSubdomainUrl(subdomain: string): string {
  const protocol = ROOT_DOMAIN.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${subdomain}.${ROOT_DOMAIN}`;
}
