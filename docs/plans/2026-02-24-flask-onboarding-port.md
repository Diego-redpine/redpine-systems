# Flask → Next.js Onboarding Port — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port remaining Flask onboarding AI logic (Batches 3-8) to Next.js TypeScript API routes, enabling full retirement of the Flask server for onboarding.

**Architecture:** 4 new files — 1 library module for AI calls, 3 API route handlers. All AI calls use raw `fetch` to `api.anthropic.com` (matching existing `/api/chat` pattern). Validation pipeline uses already-ported functions from `src/lib/onboarding/`. Config persistence uses Supabase admin client (matching existing `/api/config` pattern).

**Tech Stack:** Next.js 14 API routes, Anthropic Messages API (raw fetch), Supabase (PostgreSQL), TypeScript, existing onboarding library.

---

## Task 1: Create `ai-config.ts` — AI config generation library

**Files:**
- Create: `dashboard/src/lib/onboarding/ai-config.ts`

**Context:** This ports Flask `app.py` functions `analyze_business()` (lines 526-1037), `analyze_with_template()` (lines 406-461), and `generate_website_copy()` (lines 1143-1191). The prompts are copied VERBATIM from Flask — they're battle-tested across 40+ industries.

**Step 1: Create the file with helper + types**

Create `dashboard/src/lib/onboarding/ai-config.ts`:

```typescript
/**
 * AI config generation functions for onboarding.
 * Ported from onboarding/app.py — analyze_business, analyze_with_template, generate_website_copy.
 *
 * Uses raw fetch to Anthropic Messages API (matching existing /api/chat pattern).
 * Prompts are copied verbatim from Flask — battle-tested across 40+ industries.
 */

import type { RawConfig } from './validation';
import type { WebsiteCopy } from './website-sections';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Strip markdown code fences from AI responses */
function stripCodeBlocks(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/** Call Anthropic Messages API. Throws on HTTP errors. */
async function callAnthropic(opts: {
  model: string;
  maxTokens: number;
  system?: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      ...(opts.system ? { system: opts.system } : {}),
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
```

**Step 2: Add `analyzeWithTemplate` function**

Append to the same file. This is the template-path AI call — shorter prompt since the template provides the skeleton. Port of Flask `analyze_with_template()` (lines 406-461).

```typescript
// ── Template Path ────────────────────────────────────────────────────────

/**
 * Customize a template for a specific business using AI.
 * Much shorter prompt than analyzeBusiness since the template provides the skeleton.
 */
export async function analyzeWithTemplate(
  description: string,
  template: RawConfig,
  businessType: string,
): Promise<RawConfig> {
  const templateJson = JSON.stringify(template, null, 2);

  const prompt = `You are customizing a business platform template for a specific business.

Business description: ${description}
Business type: ${businessType}

Here is the starting template (JSON):
${templateJson}

Your job is to CUSTOMIZE this template for the specific business described above. Return ONLY valid JSON.

## RULES:
1. **NEVER remove components with "_locked": true** — these are essential and must stay
2. **You CAN remove tabs marked "_removable": true** if the business is solo (no staff/team mentioned)
3. **Customize labels** to match the business (e.g. "Staff" → "Barbers", "Clients" → "Pets & Owners")
4. **Add components** the user specifically mentioned that aren't in the template
5. **Remove unlocked components** the user clearly doesn't need
6. **Keep the tab structure** — don't reorganize tabs, just add/remove within them
7. **Set pipeline stages** if the user described specific progression (belt ranks, loyalty tiers, etc.)
8. **Extract the business name** from the description — keep it in the SAME LANGUAGE the user wrote in
9. **Tab and component labels should be in English** — the dashboard UI is English, only business_name stays in the user's language

## OUTPUT FORMAT:
Return the FULL config as JSON (same structure as template):
{
    "business_name": "extracted business name",
    "business_type": "${businessType}",
    "tabs": [ ... customized tabs ... ],
    "summary": "one sentence about what was configured"
}

Do NOT include "colors" — colors are handled separately.
Keep "_locked" and "_removable" flags on components — they'll be stripped later.
Every component MUST have a "view" field.`;

  const raw = await callAnthropic({
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(stripCodeBlocks(raw)) as RawConfig;
}
```

**Step 3: Add `analyzeBusiness` function**

Append to the same file. This is the from-scratch AI call with the full mega-prompt. Port of Flask `analyze_business()` (lines 526-1037). The prompt is VERBATIM from Flask.

```typescript
// ── From-Scratch Path ────────────────────────────────────────────────────

/**
 * Generate a full dashboard config from a business description (no template).
 * Uses a comprehensive prompt with industry templates, component registry, etc.
 */
export async function analyzeBusiness(description: string): Promise<RawConfig> {
  // NOTE: This prompt is copied VERBATIM from Flask app.py lines 529-1020.
  // Do NOT edit it unless the Flask version is also updated.
  const prompt = `Analyze this business and create a custom dashboard configuration.

Business description: ${description}

LANGUAGE: The description may be in any language. Extract the business_name in the user's original language. All tab labels and component labels should be in English (the dashboard UI is English).

Return ONLY valid JSON (no markdown, no code blocks):
{
    "business_name": "extracted or generated name",
    "business_type": "barber, barbershop, salon, ... (FULL LIST OMITTED FOR PLAN BREVITY — COPY FROM FLASK app.py line 538)",
    ... rest of the mega-prompt ...
}

(FULL PROMPT BODY: Copy verbatim from Flask app.py lines 529-1020. This includes:
- COLOR GENERATION RULES
- VIEW ASSIGNMENT RULES
- PIPELINE STAGES
- COMPONENT REGISTRY (68 components)
- AVAILABLE ICONS
- INDUSTRY TEMPLATES (20+ templates)
- RULES FOR GOOD CONFIGS (18 rules)
- GOOD vs BAD CONFIG EXAMPLES)

Now analyze the business description and create a perfect config.`;

  const raw = await callAnthropic({
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(stripCodeBlocks(raw)) as RawConfig;
}
```

**IMPORTANT NOTE FOR IMPLEMENTER:** The `analyzeBusiness` prompt is ~500 lines. Copy it VERBATIM from `onboarding/app.py` lines 529-1020 as a template literal. Do NOT summarize or paraphrase. The exact wording matters for AI output quality.

**Step 4: Add `generateWebsiteCopy` function**

Append to the same file. Port of Flask `generate_website_copy()` (lines 1143-1191). Uses Haiku for cost efficiency. Includes fallback defaults on failure.

```typescript
// ── Website Copy ─────────────────────────────────────────────────────────

/** Default fallback copy when AI generation fails */
function getDefaultWebsiteCopy(businessName: string, businessType: string): WebsiteCopy {
  const typeLabel = businessType.replace(/_/g, ' ');
  return {
    hero_headline: `Welcome to ${businessName}`,
    hero_subheadline: `${businessName} — your trusted ${typeLabel} partner.`,
    hero_cta: 'Get Started',
    about_title: `About ${businessName}`,
    about_text: `${businessName} is dedicated to providing exceptional ${typeLabel} services. We pride ourselves on quality, reliability, and customer satisfaction.`,
    features_title: 'Why Choose Us',
    features: [
      'Professional & experienced team',
      'Committed to quality service',
      'Customer satisfaction guaranteed',
    ],
    cta_headline: 'Ready to Get Started?',
    cta_text: 'Contact us today to learn more.',
    cta_button: 'Contact Us',
  };
}

/**
 * Generate personalized website copy using Haiku 4.5.
 * Returns fallback defaults on any failure (never throws).
 */
export async function generateWebsiteCopy(
  businessName: string,
  businessType: string,
  description: string,
): Promise<WebsiteCopy> {
  try {
    const raw = await callAnthropic({
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 800,
      system: 'You generate website marketing copy for small businesses. Return ONLY valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Business: ${businessName} (Type: ${businessType})
Description: ${description}

Return JSON:
{
  "hero_headline": "powerful headline, 4-8 words, no quotes",
  "hero_subheadline": "one compelling sentence about the business",
  "hero_cta": "call to action button text, 2-4 words",
  "about_title": "about section heading",
  "about_text": "2-3 engaging sentences about what makes this business special",
  "features_title": "section heading for key selling points",
  "features": ["selling point 1 (1-2 sentences)", "selling point 2 (1-2 sentences)", "selling point 3 (1-2 sentences)"],
  "cta_headline": "motivating call to action heading",
  "cta_text": "short persuasive sentence",
  "cta_button": "action button text, 2-4 words"
}`,
      }],
    });

    return JSON.parse(stripCodeBlocks(raw)) as WebsiteCopy;
  } catch (e) {
    console.error('Website copy generation failed, using defaults:', e);
    return getDefaultWebsiteCopy(businessName, businessType);
  }
}
```

**Step 5: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit src/lib/onboarding/ai-config.ts 2>&1 | head -20`
Expected: No errors (or only unrelated project-wide errors).

**Step 6: Commit**

```bash
git add dashboard/src/lib/onboarding/ai-config.ts
git commit -m "feat: Port Flask AI config generation to TypeScript (Batch 3-4)"
```

---

## Task 2: Create `/api/onboarding/chat` — Multi-turn discovery chat

**Files:**
- Create: `dashboard/src/app/api/onboarding/chat/route.ts`

**Context:** Ports Flask `/chat` endpoint (lines 1051-1106). Uses Haiku for cost efficiency. Capped at 10 user messages — after that, forces READY_TO_BUILD. The system prompt is a casual CTO gathering 6 details about the business.

**Step 1: Create the route file**

Create `dashboard/src/app/api/onboarding/chat/route.ts`:

```typescript
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
  const rl = rateLimit(`onboarding-chat:${clientId}`, 30);
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
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/app/api/onboarding/chat/route.ts 2>&1 | head -20`

**Step 3: Commit**

```bash
git add dashboard/src/app/api/onboarding/chat/route.ts
git commit -m "feat: Port Flask onboarding chat to Next.js API route (Batch 6)"
```

---

## Task 3: Create `/api/onboarding/check-input` — Input detailedness check

**Files:**
- Create: `dashboard/src/app/api/onboarding/check-input/route.ts`

**Context:** Ports Flask `/check-input` endpoint (lines 1108-1141). Simple prompt → Haiku → returns DETAILED or VAGUE.

**Step 1: Create the route file**

Create `dashboard/src/app/api/onboarding/check-input/route.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add dashboard/src/app/api/onboarding/check-input/route.ts
git commit -m "feat: Port Flask check-input to Next.js API route (Batch 5)"
```

---

## Task 4: Create `/api/onboarding/configure` — Main orchestration endpoint

**Files:**
- Create: `dashboard/src/app/api/onboarding/configure/route.ts`

**Context:** This is the big one — ports Flask `/configure` endpoint (lines 1194-1301). It orchestrates the entire onboarding flow: template detection → AI config generation → validation pipeline → website copy → website sections → save to Supabase.

**Dependencies:** Requires Task 1 (`ai-config.ts`) to be complete.

**Step 1: Create the route file**

Create `dashboard/src/app/api/onboarding/configure/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { detectTemplateType, getTemplate } from '@/lib/onboarding/registry';
import { validateConfig, type RawConfig } from '@/lib/onboarding/validation';
import { generateWebsiteSections, getTemplateKey, type WebsiteCopy } from '@/lib/onboarding/website-sections';
import { analyzeBusiness, analyzeWithTemplate, generateWebsiteCopy } from '@/lib/onboarding/ai-config';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute (config generation is expensive)
  const clientId = getClientId(request);
  const rl = rateLimit(`onboarding-configure:${clientId}`, 5);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  try {
    const body = await request.json();
    const description: string = body.description ?? '';
    if (!description.trim()) {
      return NextResponse.json({ success: false, error: 'Description required' }, { status: 400 });
    }

    // ── Step 1: Generate config (template path or from-scratch) ──────────

    let config: RawConfig;
    let template: RawConfig | undefined;
    let lockedIds: Set<string> | undefined;

    const detection = detectTemplateType(description);
    if (detection) {
      const templateResult = getTemplate(detection.businessType, detection.family);
      if (templateResult) {
        template = templateResult.template as RawConfig;
        lockedIds = templateResult.lockedIds;
        config = await analyzeWithTemplate(description, template, detection.businessType);
      } else {
        config = await analyzeBusiness(description);
      }
    } else {
      config = await analyzeBusiness(description);
    }

    // ── Step 2: Run validation pipeline ──────────────────────────────────

    config = validateConfig(config, template, lockedIds);

    // ── Step 3: Generate website data ────────────────────────────────────

    let websiteData = null;
    try {
      const bname = config.business_name ?? 'My Business';
      const btype = config.business_type ?? 'service';
      const bcolors = config.colors ?? {};
      const websiteCopy: WebsiteCopy = await generateWebsiteCopy(bname, btype, description);
      websiteData = generateWebsiteSections(bname, btype, websiteCopy, bcolors);
    } catch (e) {
      console.error('Website generation failed (continuing without):', e);
    }

    // ── Step 4: Save to Supabase ─────────────────────────────────────────

    const supabase = getSupabase();

    const configData: Record<string, unknown> = {
      user_id: null, // Anonymous until signup
      business_name: config.business_name ?? 'My Business',
      business_type: config.business_type ?? 'service',
      tabs: config.tabs ?? [],
      colors: config.colors ?? {},
      nav_style: 'sidebar',
      is_active: true,
    };
    if (websiteData) {
      configData.website_data = websiteData;
    }

    let insertResult = await supabase
      .from('configs')
      .insert(configData)
      .select('id')
      .single();

    // Retry without website_data if column doesn't exist yet
    if (insertResult.error && websiteData) {
      const { website_data, ...withoutWebsite } = configData;
      insertResult = await supabase
        .from('configs')
        .insert(withoutWebsite)
        .select('id')
        .single();
    }

    if (insertResult.error) {
      console.error('Config save error:', insertResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to save config' },
        { status: 500 },
      );
    }

    const configId = insertResult.data!.id;

    // ── Step 5: Return response ──────────────────────────────────────────

    const response: Record<string, unknown> = {
      success: true,
      config,
      config_id: configId,
    };
    if (websiteData) {
      response.website_data = {
        pages: (websiteData as any).pages?.length ?? 0,
        elements: (websiteData as any).elements?.length ?? 0,
        template_key: getTemplateKey(config.business_type ?? ''),
      };
    }

    return NextResponse.json(response);
  } catch (e) {
    console.error('Configure error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Configuration failed' },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit 2>&1 | grep -E "(error|onboarding)" | head -20`

Fix any type errors. Common issues:
- `RawConfig` might need to be exported from `validation.ts` (it already is: line 56)
- `WebsiteCopy` is already exported from `website-sections.ts` (line 41)
- `TemplateResult` needs to expose `template` and `lockedIds` — check `templates/beauty-body.ts`

**Step 3: Commit**

```bash
git add dashboard/src/app/api/onboarding/configure/route.ts
git commit -m "feat: Port Flask /configure orchestration to Next.js (Batch 7-8)"
```

---

## Task 5: Export `RawConfig` if needed + type compatibility check

**Files:**
- Possibly modify: `dashboard/src/lib/onboarding/validation.ts` (line 56 — `RawConfig` is already exported)
- Possibly modify: `dashboard/src/lib/onboarding/templates/beauty-body.ts` (ensure `TemplateResult` type is compatible)

**Step 1: Verify `TemplateResult` type**

Read `dashboard/src/lib/onboarding/templates/beauty-body.ts` to confirm the `TemplateResult` interface. It must expose `template` (matching `RawConfig`) and `lockedIds` (a `Set<string>`).

If the template object uses a different shape than `RawConfig`, add a type assertion in the configure route (Task 4) where we cast `templateResult.template as RawConfig`.

**Step 2: Run full type check**

Run: `cd dashboard && npx tsc --noEmit 2>&1 | head -30`

Fix any remaining issues. This step is a safety net — most types should align since the ported code was designed to match.

**Step 3: Commit (if changes needed)**

```bash
git add -u
git commit -m "fix: Type compatibility for onboarding port"
```

---

## Task 6: Full integration test — compile + verify API routes exist

**Step 1: Verify dev server starts**

Run: `cd dashboard && npm run build 2>&1 | tail -30`

Check that all 3 new API routes are listed in the build output:
- `/api/onboarding/chat`
- `/api/onboarding/check-input`
- `/api/onboarding/configure`

**Step 2: Verify the routes are reachable (dev server)**

Run: `cd dashboard && npm run dev &`

Then test each endpoint with curl (expect 400/500 errors from missing body, but NOT 404):

```bash
curl -s -X POST http://localhost:3000/api/onboarding/chat -H 'Content-Type: application/json' -d '{}' | head -c 200
curl -s -X POST http://localhost:3000/api/onboarding/check-input -H 'Content-Type: application/json' -d '{}' | head -c 200
curl -s -X POST http://localhost:3000/api/onboarding/configure -H 'Content-Type: application/json' -d '{}' | head -c 200
```

Expected: JSON responses (not 404). Specific error messages like "Description required" confirm the routes are wired up.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: Flask onboarding port complete — Batches 3-8 (AI core + API routes)"
```

---

## Summary of New Files

| File | Lines (est.) | Ports From |
|------|-------------|-----------|
| `src/lib/onboarding/ai-config.ts` | ~600 | Flask `analyze_business`, `analyze_with_template`, `generate_website_copy` |
| `src/app/api/onboarding/chat/route.ts` | ~100 | Flask `/chat` |
| `src/app/api/onboarding/check-input/route.ts` | ~75 | Flask `/check-input` |
| `src/app/api/onboarding/configure/route.ts` | ~120 | Flask `/configure` |

Total: ~895 new lines of TypeScript replacing ~1,200 lines of Python.

After this, the Flask server is no longer needed for onboarding. The only remaining work is:
- **Batch 10:** Dashboard onboarding UI (chat component, loading animation, signup form)
- **Batch 11:** Testing & edge cases
