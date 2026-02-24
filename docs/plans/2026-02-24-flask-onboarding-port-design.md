# Flask Onboarding Port — Design Document

**Date:** 2026-02-24
**Scope:** Batches 3-8 (AI core + API routes)
**Goal:** Port remaining Flask onboarding logic to Next.js TypeScript, enabling retirement of the Flask server for onboarding.

---

## Context

Batches 1-2 already ported: registry, beauty-body templates, color defaults, validation pipeline, website sections (2,250 lines of TypeScript). These are ready but not wired to API routes.

The Flask `app.py` (1,449 lines) still handles:
- AI chat for business discovery
- Input validation (DETAILED/VAGUE check)
- Config generation (template path + from-scratch path)
- Website copy generation
- Main `/configure` orchestration endpoint

## New Files

### 1. `src/lib/onboarding/ai-config.ts`

AI config generation functions. Direct port of Flask logic with identical prompts.

**Exports:**
- `analyzeBusiness(description: string)` — Full AI config generation from scratch. Uses Claude Sonnet. Returns `OnboardingConfig`.
- `analyzeWithTemplate(description: string, template: object, businessType: string)` — AI customization of template. Uses Claude Sonnet. Returns `OnboardingConfig`.
- `generateWebsiteCopy(businessName: string, businessType: string, description: string)` — Website marketing copy. Uses Claude Haiku. Returns `WebsiteCopy`.
- `stripCodeBlocks(text: string)` — Utility to clean markdown fences from AI responses.

**Dependencies:** `@anthropic-ai/sdk`, `process.env.ANTHROPIC_API_KEY`

### 2. `src/app/api/onboarding/configure/route.ts`

Main orchestration endpoint. POST only.

**Input:** `{ description: string, conversation_history?: ChatMessage[] }`

**Flow:**
1. `detectTemplateType(description)` — from `@/lib/onboarding/registry`
2. If template match: `getTemplate()` → `analyzeWithTemplate()` → `validateLockedComponents()` → `stripLockedFlags()`
3. If no match: `analyzeBusiness()`
4. Post-processing pipeline: `validateColors()` → `consolidateCalendars()` → `enforceTabLimit()` → `ensureGallery()` → `transformPipelineStages()`
5. `generateWebsiteCopy()` → `generateWebsiteSections()`
6. Save to Supabase `configs` table via admin client (same pattern as existing POST /api/config)

**Output:** `{ success: true, config, config_id, website_data: { pages, elements, template_key } }`

### 3. `src/app/api/onboarding/chat/route.ts`

Multi-turn business discovery chat. POST only.

**Input:** `{ messages: ChatMessage[] }`
**Model:** Claude Haiku 4.5 (cost efficiency)
**Cap:** 10 user messages, then force `READY_TO_BUILD`
**System prompt:** Identical to Flask — casual CTO gathering 6 details (name, services, customers, team size, pain point, progression)
**Output:** `{ success: true, response: string }`

### 4. `src/app/api/onboarding/check-input/route.ts`

Input detailedness check. POST only.

**Input:** `{ description: string }`
**Model:** Claude Haiku 4.5
**Output:** `{ success: true, detailed: boolean }`

## Skipped (Already Exists or Deprecated)

- Config CRUD → existing `/api/config` GET/PUT/POST
- Signup → client-side Supabase auth
- Local file storage → Supabase
- Website data endpoint → `configs.website_data` column
- Odoo integration → deprecated

## Types

```typescript
interface OnboardingConfig {
  business_name: string;
  business_type: string;
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
    components: Array<{
      id: string;
      label: string;
      view?: string;
      stages?: string[];
      pipeline?: object;
      _locked?: boolean;
      _removable?: boolean;
    }>;
    _removable?: boolean;
  }>;
  colors?: Record<string, string>;
  summary?: string;
}

interface WebsiteCopy {
  hero_headline: string;
  hero_subheadline: string;
  hero_cta: string;
  about_title: string;
  about_text: string;
  features_title: string;
  features: string[];
  cta_headline: string;
  cta_text: string;
  cta_button: string;
}
```

## Patterns

- **Anthropic SDK:** `new Anthropic()` with `ANTHROPIC_API_KEY` env var
- **Rate limiting:** Existing `rateLimit()` from `@/lib/rate-limit`
- **Supabase admin:** `createServerClient()` with service role key (same as `/api/config`)
- **Error handling:** Try/catch with fallback defaults for website copy generation
- **Prompts:** Copied verbatim from Flask — these are battle-tested
