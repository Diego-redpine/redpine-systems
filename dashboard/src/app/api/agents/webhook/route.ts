import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// POST /api/agents/webhook — Inbound webhook from n8n
// n8n calls this after an agent processes an event
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.AGENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { user_id, agent_id, event_type, description, result, status } = body;

    if (!user_id || !agent_id || !event_type) {
      return NextResponse.json({ error: 'user_id, agent_id, and event_type required' }, { status: 400 });
    }

    // Log the agent action (admin client since this is a machine-to-machine call)
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('agent_activity')
      .insert({
        user_id,
        agent_type: agent_id,
        event_type,
        description: description || `${agent_id} processed ${event_type}`,
        metadata: { result: result || null },
        status: status || 'completed',
      });

    if (error) {
      console.error('[Agent Webhook] Insert error:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Agent Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
