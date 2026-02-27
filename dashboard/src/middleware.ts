import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN ARCHITECTURE — DO NOT CHANGE WITHOUT READING THIS
// ═══════════════════════════════════════════════════════════════════════════════
//
// redpine.systems             → Landing page (public, AI chat signup)
// app.redpine.systems         → Dashboard (authenticated, business owner platform)
// *.redpine.systems           → User websites (public, e.g. luxe-nails.redpine.systems)
// *.redpine.systems/portal    → Client portals (magic link auth)
//
// DNS: Cloudflare wildcard *.redpine.systems → Vercel
// Vercel: Custom domains: redpine.systems, *.redpine.systems
//
// DO NOT modify this routing architecture. It is wired in Cloudflare and Vercel.
// ═══════════════════════════════════════════════════════════════════════════════

// ROOT_DOMAIN is read at runtime by Edge middleware.
// Use ROOT_DOMAIN (server-only) first, fallback to NEXT_PUBLIC_ (build-time inlined).
// .trim() guards against trailing whitespace from env var configuration.
const ROOT_DOMAIN = (process.env.ROOT_DOMAIN || process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').trim();

// The "app" subdomain is reserved for the dashboard — never treat it as a user site
const APP_SUBDOMAIN = 'app';

// Extract subdomain from hostname
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(':')[0];
  const rootWithoutPort = ROOT_DOMAIN.split(':')[0];

  // Local development
  if (rootWithoutPort === 'localhost') {
    if (hostWithoutPort.endsWith('.localhost')) {
      const subdomain = hostWithoutPort.replace('.localhost', '');
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        return subdomain;
      }
    }
    return null;
  }

  // Exact root domain or www → no subdomain
  if (hostWithoutPort === rootWithoutPort || hostWithoutPort === `www.${rootWithoutPort}`) {
    return null;
  }

  // *.redpine.systems → extract subdomain
  if (hostWithoutPort.endsWith(`.${rootWithoutPort}`)) {
    const subdomain = hostWithoutPort.replace(`.${rootWithoutPort}`, '');
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  return null;
}

// Routes that don't require authentication on the main domain / app subdomain
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/onboarding',
  '/api/onboarding',
  '/brand-board',
  '/auth',
  '/api/stripe/webhook',
  '/api/config',
  '/api/chat',
  '/api/subdomain',
  '/api/data/mode',
  '/checkout/success',
  '/checkout/cancel',
  '/book',
  '/order',
  '/board',
  '/terms',
  '/privacy',
  '/api/public',
  '/api/team/accept',
  '/site',
  '/editor',
  '/form',
  '/review',
  '/sign',
  '/portal',
  '/api/portal',
  '/api/integrations/stripe/callback',
  '/api/integrations/square/callback',
  '/api/integrations/quickbooks/callback',
  '/api/integrations/google/callback',
  '/api/integrations/notion/callback',
  '/api/integrations/outlook/callback',
  '/api/marketplace',
  '/api/agents',
  '/landing.html',
  '/examples',
];

// API routes allowed on user subdomains without auth
const SUBDOMAIN_PUBLIC_API_ROUTES = [
  '/api/subdomain',
  '/api/public',
  '/api/config',
  '/api/stripe/webhook',
  '/api/portal',
];

// Routes bypassed entirely by middleware
const BYPASS_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/static',
];

// Page paths on user subdomains that have their own dedicated route
// e.g. luxe-nails.redpine.systems/portal → /portal/luxe-nails
const SUBDOMAIN_SPECIAL_PATHS: Record<string, string> = {
  '/portal': '/portal',
  '/book': '/book',
  '/order': '/order',
  '/form': '/form',
  '/review': '/review',
  '/sign': '/sign',
  '/board': '/board',
};

function setSubdomainHeaders(response: NextResponse, subdomain: string | null) {
  response.headers.set('x-is-subdomain', (subdomain !== null).toString());
  if (subdomain) {
    response.headers.set('x-subdomain', subdomain);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Bypass static files and Next.js internals
  if (BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Detect subdomain
  const subdomain = extractSubdomain(hostname);

  // ─── APP SUBDOMAIN (app.redpine.systems) ──────────────────────────────────
  // Treated identically to the root domain — this IS the dashboard.
  // No rewrites needed, just run normal auth flow.
  if (subdomain === APP_SUBDOMAIN) {
    return handleMainDomain(request, pathname, null);
  }

  // ─── USER SUBDOMAINS (*.redpine.systems) ──────────────────────────────────
  // These serve the user's public website. Rewrite URLs to internal routes.
  if (subdomain !== null) {
    return handleUserSubdomain(request, pathname, subdomain);
  }

  // ─── ROOT DOMAIN (redpine.systems) ────────────────────────────────────────
  return handleMainDomain(request, pathname, null);
}

// Handle user subdomain requests (luxe-nails.redpine.systems)
function handleUserSubdomain(request: NextRequest, pathname: string, subdomain: string): NextResponse {
  // API routes on subdomains
  if (pathname.startsWith('/api/')) {
    const isPublicApi = SUBDOMAIN_PUBLIC_API_ROUTES.some(
      route => pathname === route || pathname.startsWith(route + '/')
    );
    if (isPublicApi) {
      const response = NextResponse.next({ request: { headers: request.headers } });
      setSubdomainHeaders(response, subdomain);
      return response;
    }
    // Non-public API on subdomain → 401
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check for special paths (portal, book, order, etc.)
  for (const [path, internalPrefix] of Object.entries(SUBDOMAIN_SPECIAL_PATHS)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      const url = request.nextUrl.clone();
      url.pathname = `${internalPrefix}/${subdomain}${pathname.slice(path.length)}`;
      const response = NextResponse.rewrite(url);
      setSubdomainHeaders(response, subdomain);
      return response;
    }
  }

  // Default: rewrite to /site/[subdomain] (the user's website)
  const url = request.nextUrl.clone();
  if (pathname === '/' || pathname === '') {
    url.pathname = `/site/${subdomain}`;
  } else {
    url.pathname = `/site/${subdomain}${pathname}`;
  }
  const response = NextResponse.rewrite(url);
  setSubdomainHeaders(response, subdomain);
  return response;
}

// Handle main domain requests (redpine.systems or app.redpine.systems)
async function handleMainDomain(request: NextRequest, pathname: string, subdomain: string | null): Promise<NextResponse> {
  let response = NextResponse.next({ request: { headers: request.headers } });
  setSubdomainHeaders(response, subdomain);

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response;
  }

  // Everything else requires auth — create Supabase client to check session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request: { headers: request.headers } });
            setSubdomainHeaders(response, subdomain);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
