import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const rl = rateLimit(`onboarding-check:${clientId}`, 20);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 },
    );
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const { description } = await request.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ success: false, error: 'Description required' }, { status: 400 });
    }

    const prompt = `Analyze this business description and determine if it has enough detail to configure a business platform.

Description: "${description}"

A DETAILED description must include ALL of these:
- Business name (a specific name, not just the type)
- Specific services or products offered
- Who their customers are
- Team size or structure
- At least one workflow detail (how they handle clients, scheduling, billing, etc.)

If ANY of these is missing, respond "VAGUE". Only respond "DETAILED" if the description is truly comprehensive with all 5 elements.

Most single-sentence descriptions should be "VAGUE" — we want to ask follow-up questions to build a better system.

Respond with ONLY one word: "DETAILED" or "VAGUE"`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error('Check-input API error:', res.status);
      return NextResponse.json({ success: false, error: 'AI service error' }, { status: 502 });
    }

    const data = await res.json();
    const result = (data.content?.[0]?.text ?? '').trim().toUpperCase();
    const isDetailed = result.includes('DETAILED');

    return NextResponse.json({ success: true, detailed: isDetailed });
  } catch (e) {
    console.error('Check-input error:', e);
    return NextResponse.json({ success: false, error: 'Failed to check input' }, { status: 500 });
  }
}
