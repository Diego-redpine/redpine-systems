import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Environment variable for root domain
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Extract subdomain from hostname (inline for middleware - can't import from lib)
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(':')[0];
  const rootWithoutPort = ROOT_DOMAIN.split(':')[0];

  if (rootWithoutPort === 'localhost') {
    if (hostWithoutPort.endsWith('.localhost')) {
      const subdomain = hostWithoutPort.replace('.localhost', '');
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        return subdomain;
      }
    }
    return null;
  }

  if (hostWithoutPort === rootWithoutPort || hostWithoutPort === `www.${rootWithoutPort}`) {
    return null;
  }

  if (hostWithoutPort.endsWith(`.${rootWithoutPort}`)) {
    const subdomain = hostWithoutPort.replace(`.${rootWithoutPort}`, '');
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  return null;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
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
];

// API routes that are allowed on subdomains without auth
// Everything else on subdomains goes through normal auth flow
const SUBDOMAIN_PUBLIC_API_ROUTES = [
  '/api/subdomain',
  '/api/public',
  '/api/config',       // GET only — handler enforces read-only for unauth
  '/api/stripe/webhook',
  '/api/portal',
];

// Routes that should be completely bypassed by middleware
const BYPASS_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/static',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Bypass static files and Next.js internals
  if (BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Detect subdomain
  const subdomain = extractSubdomain(hostname);
  const isSubdomain = subdomain !== null;

  // Create response with subdomain headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Set subdomain detection headers
  response.headers.set('x-is-subdomain', isSubdomain.toString());
  if (subdomain) {
    response.headers.set('x-subdomain', subdomain);
  }

  // For subdomain requests, allow public pages and only specific public API routes
  if (isSubdomain) {
    // Only allow whitelisted API routes without auth on subdomains
    if (pathname.startsWith('/api/')) {
      const isAllowed = SUBDOMAIN_PUBLIC_API_ROUTES.some(
        route => pathname === route || pathname.startsWith(route + '/')
      );
      if (isAllowed) {
        return response;
      }
      // All other API routes on subdomains require auth — fall through to auth check below
    } else {
      // Page routes on subdomains are public (booking, order, site pages, etc.)
      return response;
    }
  }

  // Non-subdomain requests follow normal auth flow

  // Allow public routes without auth check
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response;
  }

  // Create a Supabase client for auth checking
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
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            // Preserve subdomain headers
            response.headers.set('x-is-subdomain', isSubdomain.toString());
            if (subdomain) {
              response.headers.set('x-subdomain', subdomain);
            }
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check for valid session
  const { data: { user } } = await supabase.auth.getUser();

  // If no user and trying to access protected route
  if (!user) {
    // For API routes, return JSON 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
