# Editor Minimal Layout — Design Doc

## Problem
The editor's left sidebar (60px icon rail + 220px panel = 280px) and top toolbar (48px) eat significant canvas space. The editor feels cluttered, especially when tools aren't actively being used.

## Inspiration
Emblemo editor pattern: collapsed vertical "MENU" tab on left edge, clicks to reveal an overlay panel. Canvas gets nearly 100% of viewport by default.

## Design

### Layout: Before → After

**Before** — 540px+ of permanent chrome:
```
[X] [↩][↪]  Desktop|Tablet|Mobile  55% [👁][💾]   ← 48px top bar
┌──┬──────┬──────────────────────┬─────────┐
│AI│Search│                      │ Props   │
│  │Items │   Website Canvas     │ 260px   │
│T │      │                      │         │
│60│ 220  │                      │         │
└──┴──────┴──────────────────────┴─────────┘
```

**After** — 24px of permanent chrome:
```
┌──┐                    [↩][↪][🖥][📱] 55% [👁][💾]
│T │  ┌──────────────────────────────────────┐
│O │  │                                      │
│O │  │         Website Canvas               │
│L │  │    (nearly 100% of viewport)         │
│S │  │                                      │
└──┘  └──────────────────────────────────────┘
```

### Component 1: Vertical Tab (collapsed state)
- Width: ~24px, flush left edge, vertically centered
- Text: "TOOLS" rotated -90deg
- Style: subtle bg, border-right, hover darkens
- Click → opens overlay panel

### Component 2: Tool Overlay (expanded state)
- Width: ~280px, slides from left OVER the canvas (overlay, not push)
- Semi-transparent backdrop behind for click-away dismiss
- Single scrollable list with section headers (no sub-tabs):
  - SECTIONS — Blank, pre-built types
  - ELEMENTS — Shapes, text, buttons
  - WIDGETS — Booking, Gallery, Reviews, Products
  - MEDIA & LAYOUT — Images, device frames, grids
  - FORMS — Form elements
  - BRAND & DESIGN — Colors + fonts (link to Brand Board)
  - AI ASSISTANT — Chat interface
  - PROJECT — Pages, site settings
- Search bar at top filters across all categories
- Auto-close after adding an element/section
- Stays open for AI chat and brand editing sessions

### Component 3: Floating Toolbar
- Position: top-right of canvas area, 12px from edges
- Style: semi-transparent pill with backdrop-blur
- Icon-only, tooltips on hover:
  [X close] | [↩ undo][↪ redo] | [🖥 desktop][tablet][📱 mobile] | [-] 55% [+] | [👁 preview][💾 save]
- Always visible, floats on canvas

### Component 4: Properties Panel
- Already built: hidden by default, auto-opens on selection, manually collapsible

### Unchanged
- Page thumbnail bar (bottom)
- Canvas rendering
- Keyboard shortcuts (Cmd+Z, etc.)

## Files Affected
- `FreeFormEditor.tsx` — layout restructure (remove top bar, add floating toolbar, replace sidebar with tab)
- `FreeFormSidebar.tsx` — major rewrite: remove icon rail, convert to overlay with unified list
- `FreeFormCanvas.tsx` — no changes
- `FreeFormPropertiesPanel.tsx` — no changes (already collapsible)

## Key Behaviors
1. Editor loads → canvas is ~100% width, vertical "TOOLS" tab on left, floating toolbar top-right
2. Click "TOOLS" → overlay slides in from left (280px), backdrop appears
3. Click element in overlay → element added to canvas, overlay auto-closes
4. Click backdrop or tab again → overlay closes
5. Select section/element on canvas → properties panel auto-opens on right
6. Collapse properties → back to full canvas
