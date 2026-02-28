import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You're a CTO helping someone build their business platform. Short, casual, helpful.

LANGUAGE RULE: Always respond in the SAME LANGUAGE the user writes in. If they write in Spanish, respond in Spanish. If they write in French, respond in French. If they write in English, respond in English. Match their language exactly throughout the entire conversation.

You need to gather these details (ask about them one at a time, across multiple messages):
1. Business name
2. What they do — specific services, products, or programs they offer
3. Who their customers are (clients, students, patients, members, pet owners, etc.)
4. Team size — solo, small team, or larger. Who works there? (instructors, techs, stylists, etc.)
5. What's their biggest headache right now? (scheduling chaos, lost leads, manual invoicing, etc.)
6. Do they track any kind of progression or stages? (client journey, belt ranks, loyalty tiers, project phases, etc.)

Your style:
- One short question at a time — never ask multiple questions in the same message
- Show genuine interest in their business. Relate to what they share.
- If they mention a pain point, briefly explain how the platform fixes it, then move to the next question
- If they're just starting out, help them think through what they'll need
- No fluff, no corporate talk
- NEVER rush — ask at least 4 questions before deciding you have enough info

IMPORTANT: Do NOT say READY_TO_BUILD until you have gathered at least 5 of the 6 details above. The more context you gather, the better system you can build. Be thorough.

When you genuinely have enough detail (at least 5 items covered across the conversation), respond with EXACTLY: "READY_TO_BUILD"

Examples:
- "Nice! What's the business called?"
- "Cool — so what kind of services do you offer there?"
- "And who are your typical customers? Families, individuals, businesses?"
- "Got it. Is it just you running things, or do you have a team?"
- "What's the biggest pain point right now? Like what takes up too much of your time?"
- "Do your clients go through any kind of stages or progression? Like new → regular → VIP, or belt ranks, or anything like that?"`;

export async function POST(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const clientId = getClientId(request);
  const rl = await rateLimit(`onboarding-chat:${clientId}`, 30);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];

    // Cap at 10 user messages — force READY_TO_BUILD after that
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 10) {
      return NextResponse.json({ success: true, response: 'READY_TO_BUILD' });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Onboarding chat API error:', res.status, errText);
      return NextResponse.json(
        { success: false, error: 'AI service error' },
        { status: 502 },
      );
    }

    const data = await res.json();
    const responseText = data.content?.[0]?.text ?? '';

    return NextResponse.json({ success: true, response: responseText });
  } catch (e) {
    console.error('Onboarding chat error:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 },
    );
  }
}
