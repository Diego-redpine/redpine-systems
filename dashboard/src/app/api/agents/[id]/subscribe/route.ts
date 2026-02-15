// Agent Subscribe/Unsubscribe API
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// POST: Subscribe or unsubscribe from an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: agentId } = await params;
    const body = await request.json();
    const { action } = body; // 'subscribe' | 'unsubscribe' | 'configure'
    const supabase = getSupabaseAdmin();

    // Verify agent exists
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('id, name, monthly_price_cents')
      .eq('id', agentId)
      .single();

    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    if (action === 'subscribe') {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('agent_subscriptions')
        .select('id, status')
        .eq('user_id', ctx.userId)
        .eq('agent_id', agentId)
        .single();

      if (existing?.status === 'active') {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
      }

      // Create or reactivate subscription
      if (existing) {
        await supabase
          .from('agent_subscriptions')
          .update({ status: 'active', cancelled_at: null, configuration: body.configuration || {} })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('agent_subscriptions')
          .insert({
            user_id: ctx.userId,
            agent_id: agentId,
            status: 'active',
            configuration: body.configuration || {},
          });
      }

      // Increment install count (best-effort)
      try {
        const { data: current } = await supabase
          .from('ai_agents')
          .select('install_count')
          .eq('id', agentId)
          .single();
        if (current) {
          await supabase
            .from('ai_agents')
            .update({ install_count: (current.install_count || 0) + 1 })
            .eq('id', agentId);
        }
      } catch { /* non-critical */ }

      // Log activity
      await supabase.from('agent_activity').insert({
        user_id: ctx.userId,
        agent_id: agentId,
        action: 'subscribed',
        details: { agent_name: agent.name },
      });

      return NextResponse.json({ success: true, message: `Subscribed to ${agent.name}` });
    }

    if (action === 'unsubscribe') {
      await supabase
        .from('agent_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('user_id', ctx.userId)
        .eq('agent_id', agentId);

      await supabase.from('agent_activity').insert({
        user_id: ctx.userId,
        agent_id: agentId,
        action: 'unsubscribed',
        details: { agent_name: agent.name },
      });

      return NextResponse.json({ success: true, message: `Unsubscribed from ${agent.name}` });
    }

    if (action === 'configure') {
      await supabase
        .from('agent_subscriptions')
        .update({ configuration: body.configuration || {} })
        .eq('user_id', ctx.userId)
        .eq('agent_id', agentId)
        .eq('status', 'active');

      return NextResponse.json({ success: true, message: 'Configuration updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
