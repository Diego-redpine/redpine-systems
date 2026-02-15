// Shared API helpers for CRUD routes
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest) {
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

// Get Supabase admin client (bypasses RLS for server operations)
export function getSupabaseAdmin() {
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

// Parse query params for list endpoints
export interface QueryParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function parseQueryParams(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url);

  return {
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
  };
}

// Standard error responses
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}

export function notFoundResponse(resource: string) {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

export function serverErrorResponse(error: unknown) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Standard success responses
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function createdResponse(data: unknown) {
  return NextResponse.json({ data }, { status: 201 });
}

export function deletedResponse() {
  return NextResponse.json({ success: true }, { status: 200 });
}
