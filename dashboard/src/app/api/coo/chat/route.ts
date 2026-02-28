import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { loadMemories, extractMemories, saveMemories, formatMemoriesForPrompt } from '@/lib/coo-memory';
import { buildCooSystemPrompt, CooPersonality, DEFAULT_PERMISSIONS } from '@/lib/coo-prompts';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute
  const clientId = getClientId(request);
  const rl = await rateLimit(`coo-chat:${clientId}`, 20);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];

    const supabase = getSupabaseUser(request);

    // Load memories + business context in parallel
    const [memories, configResult, staffResult, clientsResult, servicesResult] = await Promise.all([
      loadMemories(context.businessOwnerId, supabase),
      supabase.from('configs').select('business_type, business_name, coo_personality, coo_permissions').eq('user_id', context.businessOwnerId).single(),
      supabase.from('team_members').select('id').eq('business_owner_id', context.businessOwnerId).eq('status', 'active'),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', context.businessOwnerId),
      supabase.from('packages').select('name, price_cents').eq('user_id', context.businessOwnerId).eq('item_type', 'service').limit(20),
    ]);

    const config = configResult.data;
    const personality: CooPersonality = (config?.coo_personality as CooPersonality) || 'friendly';
    const permissions = config?.coo_permissions || DEFAULT_PERMISSIONS;
    const memoryJournal = formatMemoriesForPrompt(memories);

    const systemPrompt = buildCooSystemPrompt(
      personality,
      memoryJournal,
      {
        businessName: config?.business_name,
        businessType: config?.business_type,
        staffCount: staffResult.data?.length || 0,
        clientCount: clientsResult.count || 0,
        services: servicesResult.data || [],
      },
      permissions
    );

    // Call Claude API
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[COO Chat] API error:', res.status, errText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await res.json();
    const responseText = data.content?.[0]?.text ?? '';

    // Extract and save memories in background (fire-and-forget)
    const fullConversation = [...messages, { role: 'assistant' as const, content: responseText }];
    extractMemories(fullConversation, memories, apiKey)
      .then(extracted => {
        if (extracted.length > 0) {
          return saveMemories(context.businessOwnerId, extracted, memories, supabase);
        }
      })
      .catch(err => console.error('[COO Memory] Background extraction error:', err));

    // Log activity
    supabase
      .from('agent_activity')
      .insert({
        user_id: context.businessOwnerId,
        agent_type: 'coo',
        event_type: 'conversation',
        description: `COO conversation (${messages.length} messages)`,
        metadata: { message_count: messages.length },
      })
      .then(() => {});

    return NextResponse.json({ success: true, response: responseText });
  } catch (error) {
    console.error('[COO Chat] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
