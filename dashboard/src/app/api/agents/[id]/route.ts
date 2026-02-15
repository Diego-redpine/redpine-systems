// Single Agent API — get detail + activity log
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    // Get user's subscription and recent activity if authenticated
    let subscription = null;
    let recentActivity: unknown[] = [];
    try {
      const ctx = await getBusinessContext(request);
      if (ctx) {
        const { data: sub } = await supabase
          .from('agent_subscriptions')
          .select('*')
          .eq('user_id', ctx.userId)
          .eq('agent_id', id)
          .single();
        subscription = sub;

        const { data: activity } = await supabase
          .from('agent_activity')
          .select('*')
          .eq('user_id', ctx.userId)
          .eq('agent_id', id)
          .order('created_at', { ascending: false })
          .limit(20);
        recentActivity = activity || [];
      }
    } catch { /* unauthenticated */ }

    return NextResponse.json({ agent, subscription, recentActivity });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
