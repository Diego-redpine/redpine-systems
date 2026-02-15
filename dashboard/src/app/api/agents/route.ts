// AI Agents Marketplace API — browse agents and manage subscriptions
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET: List all agents + user's active subscriptions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Get all active agents
    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('install_count', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Try to get user subscriptions if authenticated
    let subscriptions: { agent_id: string; status: string; configuration: Record<string, unknown>; started_at: string }[] = [];
    try {
      const ctx = await getBusinessContext(request);
      if (ctx) {
        const { data: subs } = await supabase
          .from('agent_subscriptions')
          .select('agent_id, status, configuration, started_at')
          .eq('user_id', ctx.userId)
          .eq('status', 'active');
        subscriptions = subs || [];
      }
    } catch { /* unauthenticated — fine */ }

    return NextResponse.json({
      agents: agents || [],
      subscriptions,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
