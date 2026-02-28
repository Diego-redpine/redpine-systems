import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET — List agent activity for the user (all agents + COO)
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agent_type = searchParams.get('agent_type'); // optional filter
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const page = parseInt(searchParams.get('page') || '1');

  const supabase = getSupabaseUser(request);
  let query = supabase
    .from('agent_activity')
    .select('*', { count: 'exact' })
    .eq('user_id', context.businessOwnerId)
    .order('created_at', { ascending: false });

  if (agent_type) {
    query = query.eq('agent_type', agent_type);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[Agent Activity] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    count: count || 0,
    page,
    limit,
  });
}
