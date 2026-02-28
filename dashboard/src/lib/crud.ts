// Generic CRUD handler factory for Supabase tables (F4)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PaginatedResponse } from '@/types/data';

// Create user-scoped Supabase client (respects RLS)
// Use this for ALL user-data queries — RLS ensures data isolation
export function getSupabaseUser(request: NextRequest) {
  return createServerClient(
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
}

// Get authenticated user from request cookies
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = getSupabaseUser(request);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Create admin Supabase client (bypasses RLS)
// ONLY use for: public routes, webhooks, audit logs, cross-tenant queries
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

// Business context for role-based data scoping
// Staff members see the owner's data, owners see their own
export interface BusinessContext {
  userId: string;          // The authenticated user's ID
  businessOwnerId: string; // The owner whose data to query (same as userId for owners)
  role: 'owner' | 'staff';
}

export async function getBusinessContext(request: NextRequest): Promise<BusinessContext | null> {
  const user = await getAuthenticatedUser(request);
  if (!user) return null;

  // User-scoped client — RLS on team_members allows staff to read own membership
  const supabase = getSupabaseUser(request);

  // Check if this user is a staff member of another owner
  const { data: membership } = await supabase
    .from('team_members')
    .select('business_owner_id, role')
    .eq('auth_user_id', user.id)
    .eq('status', 'active')
    .single();

  if (membership) {
    return {
      userId: user.id,
      businessOwnerId: membership.business_owner_id,
      role: membership.role as 'owner' | 'staff',
    };
  }

  // Solo owner — data is their own
  return {
    userId: user.id,
    businessOwnerId: user.id,
    role: 'owner',
  };
}

// Parse common query params
export function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    sortBy: searchParams.get('sort') || searchParams.get('sort_by') || 'created_at',
    sortOrder: (searchParams.get('sortDir') || searchParams.get('sort_order') || 'desc') as 'asc' | 'desc',
    search: searchParams.get('search') || '',
    // Return all params for custom filtering
    allParams: Object.fromEntries(searchParams.entries()),
  };
}

// Log an activity to the audit trail (fire-and-forget, never blocks CRUD)
export async function logActivity(params: {
  userId: string;         // business owner
  actorId: string;        // who performed the action
  actorName?: string;
  action: 'create' | 'update' | 'delete' | 'move_stage';
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('activity_logs').insert({
      user_id: params.userId,
      actor_id: params.actorId,
      actor_name: params.actorName || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      entity_name: params.entityName || null,
      changes: params.changes || {},
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.warn('[logActivity] Audit log failed (non-critical):', err);
  }
}

// Generic CRUD handlers factory
export function createCrudHandlers<T = Record<string, unknown>>(
  tableName: string,
  options?: {
    searchFields?: string[];
    requiredFields?: string[];
  }
) {
  const searchFields = options?.searchFields || ['name', 'title'];
  const requiredFields = options?.requiredFields || [];

  // GET handler - list with pagination, filtering, sorting, search
  async function handleGet(request: NextRequest): Promise<NextResponse> {
    try {
      const context = await getBusinessContext(request);
      if (!context) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const supabase = getSupabaseUser(request);
      const { page, pageSize, sortBy, sortOrder, search, allParams } = parseQueryParams(request);

      // Build query — use businessOwnerId so staff sees the owner's data
      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', context.businessOwnerId);

      // Apply search across searchable fields
      if (search) {
        const searchConditions = searchFields
          .map(field => `${field}.ilike.%${search}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply custom filters from query params
      const reservedParams = ['page', 'pageSize', 'sort', 'sortDir', 'sort_by', 'sort_order', 'search', 'start_date', 'end_date'];
      for (const [key, value] of Object.entries(allParams)) {
        if (!reservedParams.includes(key) && value) {
          query = query.eq(key, value);
        }
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(`GET ${tableName} error:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      const response: PaginatedResponse<T> = {
        data: (data || []) as T[],
        count: count || 0,
        page,
        pageSize,
      };

      return NextResponse.json({ success: true, ...response });
    } catch (error) {
      console.error(`GET ${tableName} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data' },
        { status: 500 }
      );
    }
  }

  // POST handler - create new record
  async function handlePost(request: NextRequest): Promise<NextResponse> {
    try {
      const context = await getBusinessContext(request);
      if (!context) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const body = await request.json();

      // Validate required fields
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { success: false, error: `${field} is required` },
            { status: 400 }
          );
        }
      }

      const supabase = getSupabaseUser(request);

      // Set user_id to businessOwnerId so staff-created records belong to the owner
      const record = {
        ...body,
        user_id: context.businessOwnerId,
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error(`POST ${tableName} error:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      // Audit log — fire and forget
      if (tableName !== 'activity_logs') {
        const rec = data as Record<string, unknown>;
        logActivity({
          userId: context.businessOwnerId,
          actorId: context.userId,
          action: 'create',
          entityType: tableName,
          entityId: rec?.id as string,
          entityName: (rec?.name || rec?.title || rec?.label || '') as string,
        });
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
      console.error(`POST ${tableName} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to create record' },
        { status: 500 }
      );
    }
  }

  // PUT handler - update by ID (verifies ownership)
  async function handlePut(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const context = await getBusinessContext(request);
      if (!context) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const supabase = getSupabaseUser(request);

      // Remove fields that shouldn't be updated
      delete body.id;
      delete body.user_id;
      delete body.created_at;

      // Add updated_at timestamp
      body.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(tableName)
        .update(body)
        .eq('id', id)
        .eq('user_id', context.businessOwnerId) // Verify ownership via business context
        .select()
        .single();

      if (error) {
        console.error(`PUT ${tableName} error:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { success: false, error: 'Record not found or not authorized' },
          { status: 404 }
        );
      }

      // Audit log — fire and forget
      if (tableName !== 'activity_logs') {
        const rec = data as Record<string, unknown>;
        logActivity({
          userId: context.businessOwnerId,
          actorId: context.userId,
          action: 'update',
          entityType: tableName,
          entityId: id,
          entityName: (rec?.name || rec?.title || rec?.label || '') as string,
          changes: body,
        });
      }

      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error(`PUT ${tableName} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to update record' },
        { status: 500 }
      );
    }
  }

  // DELETE handler - delete by ID (verifies ownership)
  async function handleDelete(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const context = await getBusinessContext(request);
      if (!context) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const supabase = getSupabaseUser(request);

      // Fetch the record name before deleting (for audit trail)
      let entityName = '';
      if (tableName !== 'activity_logs') {
        const { data: existing } = await supabase
          .from(tableName)
          .select('name, title, label')
          .eq('id', id)
          .eq('user_id', context.businessOwnerId)
          .single();
        if (existing) {
          entityName = (existing.name || existing.title || existing.label || '') as string;
        }
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', context.businessOwnerId); // Verify ownership via business context

      if (error) {
        console.error(`DELETE ${tableName} error:`, error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      // Audit log — fire and forget
      if (tableName !== 'activity_logs') {
        logActivity({
          userId: context.businessOwnerId,
          actorId: context.userId,
          action: 'delete',
          entityType: tableName,
          entityId: id,
          entityName,
        });
      }

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      console.error(`DELETE ${tableName} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete record' },
        { status: 500 }
      );
    }
  }

  // GET single by ID
  async function handleGetById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const context = await getBusinessContext(request);
      if (!context) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const supabase = getSupabaseUser(request);

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', context.businessOwnerId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error(`GET ${tableName}/${id} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch record' },
        { status: 500 }
      );
    }
  }

  return {
    handleGet,
    handlePost,
    handlePut,
    handleDelete,
    handleGetById,
  };
}
