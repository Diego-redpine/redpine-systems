# Brand Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Brand Board (logo, colors, fonts) as an onboarding step and the first tab in the Editor sidebar.

**Architecture:** A shared `BrandBoardEditor` component renders in two contexts: full-screen at `/brand-board` during onboarding, and as the first tab inside `EditorOverlay`. The existing `ColorsEditor` and `SectionsEditor` remain as separate tabs. Font data moves from localStorage-only to config-persisted.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Supabase (Storage for logos, PostgreSQL for config)

**Design Doc:** `docs/plans/2026-02-24-brand-board-design.md`

---

## Task 1: Extract FONT_OPTIONS to shared module

The font list currently lives inside `EditorOverlay.tsx`. Both `BrandBoardEditor` and `EditorOverlay` need it.

**Files:**
- Create: `dashboard/src/lib/fonts.ts`
- Modify: `dashboard/src/components/EditorOverlay.tsx` (lines 13-45)

**Step 1: Create `dashboard/src/lib/fonts.ts`**

Move the `FONT_OPTIONS` array, `CORE_FONTS` set, and `loadExtraFonts()` function from `EditorOverlay.tsx` into this new file. Export all three.

```typescript
// dashboard/src/lib/fonts.ts

export const FONT_OPTIONS = [
  { name: 'Inter', family: 'Inter, system-ui, sans-serif', style: 'Clean & Modern' },
  { name: 'Plus Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif', style: 'Friendly & Bold' },
  // ... (copy all 28 entries from EditorOverlay.tsx lines 14-42)
];

export const CORE_FONTS = new Set(['Inter', 'DM Sans', 'Plus Jakarta Sans', 'Poppins', 'Manrope']);

export function loadExtraFonts() {
  // ... (copy from EditorOverlay.tsx lines 47-59)
}
```

**Step 2: Update `EditorOverlay.tsx` to import from shared module**

Replace the inline definitions (lines 13-59) with:
```typescript
import { FONT_OPTIONS, CORE_FONTS, loadExtraFonts } from '@/lib/fonts';
```

**Step 3: Verify the dashboard still works**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add dashboard/src/lib/fonts.ts dashboard/src/components/EditorOverlay.tsx
git commit -m "refactor: extract FONT_OPTIONS to shared lib/fonts module"
```

---

## Task 2: Add font fields to config API

Currently fonts are localStorage-only. Brand Board needs to persist `heading_font` and `body_font` in the config.

**Files:**
- Modify: `dashboard/src/app/api/config/route.ts` (PUT handler — add `heading_font`, `body_font` to allowed fields)

**Step 1: Check the PUT handler in config/route.ts**

Read the PUT handler to see how it currently saves config fields. The `colors` field is already saved — `heading_font` and `body_font` follow the same pattern. They're just top-level fields on the `configs` table row.

**Step 2: Update the PUT handler**

In the PUT handler, add `heading_font` and `body_font` to the update payload alongside `colors`, `tabs`, etc. These are string fields (font names like `'Poppins'`, `'Inter'`).

Add to the update object construction:
```typescript
if (body.heading_font !== undefined) updatePayload.heading_font = body.heading_font;
if (body.body_font !== undefined) updatePayload.body_font = body.body_font;
```

**Step 3: Update the GET handler's `toAppConfig()`**

In `toAppConfig()` (line 44), pass through the font fields:
```typescript
if (dbConfig.heading_font) result.headingFont = dbConfig.heading_font;
if (dbConfig.body_font) result.bodyFont = dbConfig.body_font;
```

**Step 4: Add font fields to DashboardConfig type**

In `dashboard/src/types/config.ts`, add to the `DashboardConfig` interface (line 85):
```typescript
headingFont?: string;
bodyFont?: string;
```

**Step 5: Create Supabase migration**

Add the new columns to the configs table:
```sql
-- Add font fields to configs table
ALTER TABLE configs ADD COLUMN IF NOT EXISTS heading_font TEXT;
ALTER TABLE configs ADD COLUMN IF NOT EXISTS body_font TEXT;
```

Append to `supabase/LATEST_MIGRATIONS.sql` and run via Supabase dashboard.

**Step 6: Verify**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 7: Commit**

```bash
git add dashboard/src/app/api/config/route.ts dashboard/src/types/config.ts supabase/LATEST_MIGRATIONS.sql
git commit -m "feat: add heading_font and body_font to config API"
```

---

## Task 3: Build `BrandBoardEditor` component

The core shared component. Three sections: logos, colors, fonts.

**Files:**
- Create: `dashboard/src/components/BrandBoardEditor.tsx`

**Step 1: Create the component file**

```typescript
// dashboard/src/components/BrandBoardEditor.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { FONT_OPTIONS, loadExtraFonts } from '@/lib/fonts';
import { ColorItem } from './editors/ColorsEditor';
import { getContrastText } from '@/lib/view-colors';
import { getColorDefaults, ColorConfig } from '@/lib/onboarding/color-defaults';
```

**Props interface:**
```typescript
interface BrandBoardEditorProps {
  configId: string | null;
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  headingFont: string;
  bodyFont: string;
  onFontChange: (heading: string, body: string) => void;
  businessType?: string;
  businessName?: string;
  buttonColor?: string;
  mode: 'onboarding' | 'editor';
  onLaunch?: () => void; // only used in onboarding mode
}
```

**Step 2: Build the LogoUpload section**

- Row of 3 upload slots (Primary, Icon, Alt) as rounded-xl bordered boxes
- Click to upload, show thumbnail preview
- Uses Supabase Storage via `POST /api/upload` (or direct client upload)
- For MVP: file input + preview, actual Supabase upload can be wired later
- Drag-and-drop support via `onDragOver`/`onDrop` handlers

```typescript
function LogoSection({ logos, onLogosChange }: { logos: LogoSlot[], onLogosChange: (logos: LogoSlot[]) => void }) {
  // 3 slots: primary, icon, alt
  // Each shows a dashed border box with "+" icon when empty, thumbnail when filled
  // Click triggers hidden <input type="file" accept="image/*">
}
```

**Step 3: Build the ColorPresets section**

- Generate 3 theme variants from the business type's palette in `color-defaults.ts`:
  1. Original (the AI-picked industry palette)
  2. Light variant (lighten sidebar_bg, keep accent hue)
  3. Dark variant (darken sidebar_bg toward near-black)
- Each theme is a clickable card showing 5 color dots (sidebar_bg, buttons, background, text, cards)
- Selected theme gets a ring/border highlight
- Below the presets: the active palette as horizontal swatches with labels
- Individual swatch click opens native `<input type="color">`

```typescript
function ColorPresetsSection({ colors, onColorsChange, businessType, buttonColor }: { ... }) {
  // Generate 3 presets from getColorDefaults(businessType)
  // Render as clickable theme cards
  // Show active palette swatches below
}
```

**Step 4: Build the FontPicker section**

- Two font selectors: "Heading Font" and "Body Font"
- Each shows current font name + dropdown of FONT_OPTIONS
- Live specimen preview below: heading text in heading font, body text in body font
- Lazy-load extra fonts when section is visible (reuse `loadExtraFonts()`)

```typescript
function FontSection({ headingFont, bodyFont, onFontChange, buttonColor }: { ... }) {
  // Two CustomSelect-style dropdowns (or simple select elements)
  // Specimen preview: "Your Business Name" in heading font, lorem paragraph in body font
}
```

**Step 5: Compose the full BrandBoardEditor**

```typescript
export default function BrandBoardEditor({ mode, onLaunch, ... }: BrandBoardEditorProps) {
  return (
    <div className={mode === 'onboarding' ? 'max-w-2xl mx-auto py-12 px-6' : ''}>
      {/* Section headers with subtle dividers */}
      <LogoSection ... />
      <div className="border-t border-gray-100 my-6" />
      <ColorPresetsSection ... />
      <div className="border-t border-gray-100 my-6" />
      <FontSection ... />

      {mode === 'onboarding' && (
        <button onClick={onLaunch} className="w-full mt-8 py-4 rounded-xl font-semibold text-lg ...">
          Launch Your Dashboard
        </button>
      )}
    </div>
  );
}
```

**Step 6: Verify types**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 7: Commit**

```bash
git add dashboard/src/components/BrandBoardEditor.tsx
git commit -m "feat: add BrandBoardEditor component (logo, colors, fonts)"
```

---

## Task 4: Create `/brand-board` onboarding page

Full-screen page shown after signup+building, before dashboard.

**Files:**
- Create: `dashboard/src/app/brand-board/page.tsx`
- Modify: `dashboard/src/middleware.ts` (line 43 — add `/brand-board` to PUBLIC_ROUTES)

**Step 1: Add `/brand-board` to PUBLIC_ROUTES**

In `dashboard/src/middleware.ts`, add `'/brand-board'` to the `PUBLIC_ROUTES` array (around line 43, next to `/preview`):

```typescript
const PUBLIC_ROUTES = [
  // ... existing routes ...
  '/brand-board',  // ← add this
];
```

**Step 2: Create the page**

The page:
1. Reads `config_id`, `access_token`, `refresh_token` from URL params
2. Sets Supabase auth session from tokens (same pattern as `/preview` page lines 218-236)
3. Fetches config via `GET /api/config?id={configId}`
4. Renders `BrandBoardEditor` in `mode="onboarding"`
5. On "Launch Your Dashboard" click → saves config → redirects to `/dashboard`

```typescript
// dashboard/src/app/brand-board/page.tsx
'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BrandBoardEditor from '@/components/BrandBoardEditor';
import { ColorItem } from '@/components/editors/ColorsEditor';
import { DashboardColors } from '@/types/config';
import { defaultColors, mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';
import { createBrowserClient } from '@supabase/ssr';

function BrandBoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const configId = searchParams.get('config_id');
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // State for colors, fonts, loading
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [businessType, setBusinessType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [buttonColor, setButtonColor] = useState('#1A1A1A');
  const [isLoading, setIsLoading] = useState(true);

  // Auth + fetch config on mount (similar to preview/page.tsx pattern)
  useEffect(() => {
    async function init() {
      // Set auth session from URL tokens
      if (accessToken && refreshToken) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('access_token');
        url.searchParams.delete('refresh_token');
        window.history.replaceState({}, '', url.toString());
      }

      // Fetch config
      if (configId) {
        const res = await fetch(`/api/config?id=${configId}`);
        const data = await res.json();
        if (data.success && data.data) {
          // Set business info
          setBusinessType(data.data.businessType || '');
          setBusinessName(data.data.businessName || '');
          // Set colors from config
          const configColors = data.data.colors || {};
          const merged = mergeWithDefaults(configColors);
          setButtonColor(merged.buttons || '#1A1A1A');
          // Convert to ColorItem array
          // ... (same colorsObjectToArray pattern from preview/page.tsx)
          // Set fonts from config
          setHeadingFont(data.data.headingFont || 'Inter');
          setBodyFont(data.data.bodyFont || 'Inter');
        }
      }
      setIsLoading(false);
    }
    init();
  }, [configId, accessToken, refreshToken]);

  const handleLaunch = async () => {
    // Save final state to config
    // Redirect to /dashboard
    router.push('/dashboard');
  };

  if (isLoading) {
    return (/* Loading spinner with Red Pine logo heartbeat animation */);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header — business name, no Red Pine logo */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{businessName || 'Your Brand'}</h1>
        <p className="text-sm text-gray-500 mt-1">Set up your brand kit</p>
      </div>

      <BrandBoardEditor
        configId={configId}
        colors={colors}
        onColorsChange={setColors}
        headingFont={headingFont}
        bodyFont={bodyFont}
        onFontChange={(h, b) => { setHeadingFont(h); setBodyFont(b); }}
        businessType={businessType}
        businessName={businessName}
        buttonColor={buttonColor}
        mode="onboarding"
        onLaunch={handleLaunch}
      />
    </div>
  );
}

export default function BrandBoardPage() {
  return (
    <Suspense fallback={/* loading */}>
      <BrandBoardContent />
    </Suspense>
  );
}
```

**Step 3: Verify**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add dashboard/src/app/brand-board/page.tsx dashboard/src/middleware.ts
git commit -m "feat: add /brand-board onboarding page"
```

---

## Task 5: Wire BrandBoardEditor into EditorOverlay

Replace the Fonts tab with Brand Board as the first tab.

**Files:**
- Modify: `dashboard/src/components/EditorOverlay.tsx`

**Step 1: Add BrandBoardEditor import**

```typescript
import BrandBoardEditor from './BrandBoardEditor';
```

**Step 2: Update the tab type and default**

Change line 218:
```typescript
// Before:
const [activeTab, setActiveTab] = useState<'sections' | 'colors' | 'fonts'>('colors');

// After:
const [activeTab, setActiveTab] = useState<'brand-board' | 'colors' | 'sections'>('brand-board');
```

**Step 3: Update the `editorTabs` array (lines 265-269)**

```typescript
// Before:
const editorTabs = [
  { id: 'sections' as const, label: 'Sections' },
  { id: 'colors' as const, label: 'Colors' },
  { id: 'fonts' as const, label: 'Fonts' },
];

// After:
const editorTabs = [
  { id: 'brand-board' as const, label: 'Brand' },
  { id: 'colors' as const, label: 'Colors' },
  { id: 'sections' as const, label: 'Sections' },
];
```

**Step 4: Update tab content rendering (lines 335-353)**

Remove the `fonts` tab rendering. Add brand-board tab rendering:

```typescript
{activeTab === 'brand-board' && (
  <BrandBoardEditor
    configId={null}  // Editor doesn't need configId — parent handles saving
    colors={colors}
    onColorsChange={onColorsChange}
    headingFont={selectedFont}
    bodyFont={selectedFont}  // For now, single font; expand later
    onFontChange={(h, _b) => applyFont(
      FONT_OPTIONS.find(f => f.name === h)?.family || h,
      h
    )}
    businessType=""
    buttonColor={buttonColor}
    mode="editor"
  />
)}
```

**Step 5: Remove the standalone FontsEditor function**

The `FontsEditor` function (lines 154-205) and its rendering can be removed since font picking is now inside BrandBoardEditor. Keep the `applyFont` function (line 258) since it's still used.

**Step 6: Update EditorOverlayProps**

Add `configId?: string` and `businessType?: string` to the props interface if needed by BrandBoardEditor (or pass `null`/empty defaults).

**Step 7: Verify**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 8: Commit**

```bash
git add dashboard/src/components/EditorOverlay.tsx
git commit -m "feat: replace Fonts tab with Brand Board in EditorOverlay"
```

---

## Task 6: Update Flask redirect to point to `/brand-board`

**Files:**
- Modify: `onboarding/templates/index.html` (line ~1550)

**Step 1: Update `linkConfigAndRedirect()`**

In `onboarding/templates/index.html`, find the `linkConfigAndRedirect()` function (around line 1538). Change the redirect target from `/auth/session` (which redirects to `/dashboard`) to go through `/brand-board` instead.

Currently (line ~1550):
```javascript
const sessionUrl = new URL(dashboardOrigin + '/auth/session');
```

The `/auth/session` route (in `dashboard/src/app/auth/session/route.ts`) currently hardcodes redirect to `/dashboard` (line 30). Two options:

**Option A (simpler):** Update `/auth/session` route to accept a `redirect` param:
```typescript
// In dashboard/src/app/auth/session/route.ts line 30
const redirectPath = searchParams.get('redirect') || '/dashboard';
const redirectUrl = new URL(redirectPath, origin);
```

Then in Flask:
```javascript
const sessionUrl = new URL(dashboardOrigin + '/auth/session');
// ... existing token params ...
sessionUrl.searchParams.set('redirect', '/brand-board');
sessionUrl.searchParams.set('config_id_for_brand', window.configId);  // brand board needs this
```

**Option B (cleaner):** Redirect to `/brand-board` directly with tokens, let it set its own session (like `/preview` already does). The `/brand-board` page already handles `access_token` and `refresh_token` from Task 4.

Go with **Option B**. Change `linkConfigAndRedirect()`:

```javascript
async function linkConfigAndRedirect() {
    document.getElementById('loading-signup').classList.add('hidden');
    document.getElementById('loading-building').classList.add('hidden');
    document.getElementById('loading-launching').classList.remove('hidden');

    const dashboardOrigin = window.baseRedirectUrl
        ? new URL(window.baseRedirectUrl).origin
        : '{{ dashboard_url }}';

    // Redirect to Brand Board instead of auth/session
    const brandBoardUrl = new URL(dashboardOrigin + '/brand-board');
    if (signupAuthData) {
        brandBoardUrl.searchParams.set('access_token', signupAuthData.access_token);
        brandBoardUrl.searchParams.set('refresh_token', signupAuthData.refresh_token);
    }
    if (window.configId) {
        brandBoardUrl.searchParams.set('config_id', window.configId);
    }

    setTimeout(() => {
        window.location.href = brandBoardUrl.toString();
    }, 1500);
}
```

**Note:** The `/brand-board` page handles auth session setup + config linking internally, then redirects to `/dashboard` on "Launch". The `/auth/session` route still exists for other flows (direct login, etc.) and remains unchanged.

**Step 2: Commit**

```bash
git add onboarding/templates/index.html
git commit -m "feat: redirect onboarding to /brand-board instead of /dashboard"
```

---

## Task 7: Update references to `/preview` and clean up

**Files:**
- Delete: `dashboard/src/app/preview/page.tsx`
- Modify: `dashboard/src/middleware.ts` (remove `/preview` from PUBLIC_ROUTES)
- Modify: `dashboard/src/app/api/handoff/route.ts` (line 75 — update redirect URL)
- Modify: `dashboard/src/app/api/checkout/route.ts` (lines 28-29 — update success/cancel URLs)

**Step 1: Delete the preview page**

```bash
rm dashboard/src/app/preview/page.tsx
```

**Step 2: Remove `/preview` from PUBLIC_ROUTES**

In `dashboard/src/middleware.ts` line 43, remove `'/preview',`.

**Step 3: Update handoff API redirect**

In `dashboard/src/app/api/handoff/route.ts` line 75:
```typescript
// Before:
const redirectUrl = `${appUrl}/preview?config_id=${configId}`;

// After:
const redirectUrl = `${appUrl}/brand-board?config_id=${configId}`;
```

**Step 4: Update checkout success/cancel URLs**

In `dashboard/src/app/api/checkout/route.ts` lines 28-29:
```typescript
// Before:
success_url: `${appUrl}/preview?config_id=${configId || ''}&payment=success`,
cancel_url: `${appUrl}/preview?config_id=${configId || ''}&payment=cancelled`,

// After:
success_url: `${appUrl}/brand-board?config_id=${configId || ''}&payment=success`,
cancel_url: `${appUrl}/brand-board?config_id=${configId || ''}&payment=cancelled`,
```

**Step 5: Search for any other `/preview` references**

Run: `grep -r "/preview" dashboard/src/ --include="*.ts" --include="*.tsx" -l`
Update any remaining references.

**Step 6: Verify**

Run: `cd /Users/Diego21/redpine-os/dashboard && npx tsc --noEmit`
Expected: No type errors

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: remove /preview page, update all references to /brand-board"
```

---

## Task 8: Visual polish and testing

**Files:**
- Modify: `dashboard/src/components/BrandBoardEditor.tsx` (styling refinements)

**Step 1: Manual test — onboarding flow**

1. Start Flask onboarding: `cd ~/redpine-os/onboarding && source ../venv312/bin/activate && python app.py`
2. Start dashboard: `cd ~/redpine-os/dashboard && npm run dev`
3. Go through onboarding chat → signup → building
4. Verify redirect lands on `/brand-board` with correct config
5. Verify logos, colors, fonts sections render
6. Verify "Launch Your Dashboard" saves and redirects to `/dashboard`

**Step 2: Manual test — editor sidebar**

1. Log into dashboard (luxe.nails.e2e@redpine.systems / TestNails2026!)
2. Click Editor (paint palette) in ToolsStrip
3. Verify tabs show: Brand | Colors | Sections
4. Verify Brand tab shows logo + color presets + font picker
5. Verify Colors tab still works (existing ColorsEditor)
6. Verify Sections tab still works (existing SectionsEditor)

**Step 3: Take screenshots**

```bash
mkdir -p design-reference/screenshots
```
- `brand-board-onboarding.png` — full-screen onboarding page
- `brand-board-editor-tab.png` — inside the editor sidebar

**Step 4: Compare to Cove Collective reference**

Verify the vertical layout matches the brand-kit aesthetic: logos at top, color swatches in middle, typography at bottom.

**Step 5: Commit any polish fixes**

```bash
git add -A
git commit -m "style: Brand Board visual polish"
```

---

## Summary of all files

| Action | File | Task |
|--------|------|------|
| Create | `dashboard/src/lib/fonts.ts` | 1 |
| Create | `dashboard/src/components/BrandBoardEditor.tsx` | 3 |
| Create | `dashboard/src/app/brand-board/page.tsx` | 4 |
| Modify | `dashboard/src/components/EditorOverlay.tsx` | 1, 5 |
| Modify | `dashboard/src/types/config.ts` | 2 |
| Modify | `dashboard/src/app/api/config/route.ts` | 2 |
| Modify | `dashboard/src/middleware.ts` | 4, 7 |
| Modify | `onboarding/templates/index.html` | 6 |
| Modify | `dashboard/src/app/api/handoff/route.ts` | 7 |
| Modify | `dashboard/src/app/api/checkout/route.ts` | 7 |
| Modify | `supabase/LATEST_MIGRATIONS.sql` | 2 |
| Delete | `dashboard/src/app/preview/page.tsx` | 7 |
