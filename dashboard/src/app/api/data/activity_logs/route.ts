// Activity Logs API — read-only feed of CRUD activity
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseAdmin, parseQueryParams } from '@/lib/crud';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { page, pageSize, sortBy, sortOrder, search, allParams } = parseQueryParams(request);

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', context.businessOwnerId);

    // Filter by action type
    if (allParams.action) {
      query = query.eq('action', allParams.action);
    }

    // Filter by entity type
    if (allParams.entity_type) {
      query = query.eq('entity_type', allParams.entity_type);
    }

    // Filter by actor
    if (allParams.actor_id) {
      query = query.eq('actor_id', allParams.actor_id);
    }

    // Date range filter
    if (allParams.from_date) {
      query = query.gte('created_at', allParams.from_date);
    }
    if (allParams.to_date) {
      query = query.lte('created_at', allParams.to_date);
    }

    // Search by entity name or actor name
    if (search) {
      query = query.or(`entity_name.ilike.%${search}%,actor_name.ilike.%${search}%`);
    }

    // Sort — default newest first
    query = query.order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });

    // Paginate
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('GET activity_logs error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('GET activity_logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
