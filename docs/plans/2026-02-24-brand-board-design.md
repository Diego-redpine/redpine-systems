# Brand Board — Design Document

**Date:** 2026-02-24
**Source:** Sticky Note #10 (Templates & Industry Configuration) + Brand Board spec
**Status:** Approved

---

## Overview

The Brand Board is a vertical brand-kit editor (logo, colors, fonts) that appears in two contexts:
1. **Onboarding step 4** — full-screen page at `/brand-board` between signup/building and dashboard launch
2. **Dashboard editor** — first tab inside the existing EditorOverlay sidebar panel

A single `BrandBoardEditor` component powers both contexts.

## Onboarding Flow (Updated)

```
Phase         | What the user sees
──────────────|────────────────────────────────────
CHAT          | Full-screen AI conversation (Flask)
SIGNUP        | Chat dimmed + modal overlay
BUILDING      | Full-screen "building..." animation
BRAND_BOARD   | Full-screen Brand Board wizard ← NEW
COMPLETE      | Redirect to /dashboard
```

Flask's `linkConfigAndRedirect()` redirects to `/brand-board?config_id=xxx&access_token=...&refresh_token=...` instead of directly to `/dashboard`.

## Brand Board Layout

Vertical, scrollable. Clean white background. Three sections stacked:

```
┌──────────────────────────────────┐
│  LOGOS                           │
│  [upload] [upload] [upload]      │
│  Primary   Icon    Alt           │
│  Upload 1-5 logos                │
├──────────────────────────────────┤
│  COLORS                          │
│  3 preset theme cards to pick    │
│  (from industry color-defaults)  │
│                                  │
│  ██ ██ ██ ██ ██  (active palette)│
│  Clickable swatches to tweak     │
│  "Customize all 10" → Colors tab │
├──────────────────────────────────┤
│  FONTS                           │
│  Heading: [Poppins         ▾]    │
│  Body:    [Inter           ▾]    │
│  Live preview specimen text      │
├──────────────────────────────────┤
│  [ Launch Your Dashboard ]       │  ← onboarding only
└──────────────────────────────────┘
```

## Editor Overlay Tabs (Updated)

Current: `Sections | Colors | Fonts`
New: `Brand Board | Colors | Sections`

- **Brand Board** — the BrandBoardEditor component (logo, color presets, fonts)
- **Colors** — existing detailed 10-color editor (ColorsEditor.tsx, unchanged)
- **Sections** — existing tab/component reordering (SectionsEditor, unchanged)

The standalone `Fonts` tab is removed since font selection lives inside Brand Board.

## Component Architecture

### BrandBoardEditor (new)
- **Props:** `configId`, `colors`, `onColorsChange`, `onFontChange`, `businessType`, `mode: 'onboarding' | 'editor'`
- **Sections:** LogoUpload, ColorPresets, FontPicker
- **Data source:** Reads from config (pre-filled by AI), saves via `PUT /api/config`

### LogoUpload section
- 1-5 upload slots (primary, icon, light variant, dark variant, alt)
- Drag-and-drop or click to upload
- Stored via Supabase Storage
- Thumbnails displayed in a row (like Cove Collective reference)

### ColorPresets section
- 3 preset theme cards generated from the industry palette (`color-defaults.ts`)
- Each card shows the 5 main swatches (sidebar, buttons, background, text, cards)
- Click to apply a preset
- Individual swatches clickable to open color picker
- "Customize all colors" link navigates to the Colors tab

### FontPicker section
- Two dropdowns: Heading font + Body font
- From the existing FONT_OPTIONS (28 fonts in EditorOverlay.tsx)
- Spec calls for ~120 fonts — expand library over time
- Live specimen preview showing both fonts at different sizes
- Fonts saved to config (not just localStorage)

## Data Flow

1. AI generates config during BUILDING phase (colors from `color-defaults.ts`)
2. `/brand-board` page fetches config via `GET /api/config?id={configId}`
3. Pre-fills Brand Board with AI-picked colors, default fonts
4. User tweaks logo/colors/fonts
5. Changes saved via `PUT /api/config?id={configId}` (debounced)
6. "Launch Your Dashboard" → redirect to `/dashboard`

## Font Storage (Updated)

Currently fonts are stored in `localStorage` only. For Brand Board to work:
- Add `heading_font` and `body_font` fields to config
- Dashboard reads fonts from config on load (falling back to localStorage for backwards compat)
- EditorOverlay font selection saves to config instead of just localStorage

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/BrandBoardEditor.tsx` | Shared component (logo + colors + fonts) |
| `src/app/brand-board/page.tsx` | Onboarding full-screen page |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/EditorOverlay.tsx` | Replace Fonts tab with Brand Board tab, reorder tabs |
| `onboarding/templates/index.html` | `linkConfigAndRedirect()` → redirect to `/brand-board` |

## Files to Delete

| File | Reason |
|------|--------|
| `src/app/preview/page.tsx` | Dead code — replaced by Brand Board onboarding flow |

## Color Presets Strategy

For each business type, generate 3 theme options:
1. **AI-picked** — the palette from `color-defaults.ts` (default selection)
2. **Light variant** — lighter/softer version of the same hue family
3. **Dark variant** — deeper/moodier version

These are computed from the industry base palette, not hardcoded.

## Out of Scope (for now)

- Expanding font library to 120 (current 28 is sufficient for launch)
- Logo AI generation
- Brand Board in Settings page (COO chat handles post-launch for now; editor tab covers direct editing)
