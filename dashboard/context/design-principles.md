# Design Principles – Red Pine OS

These principles guide structural and functional UI decisions. Unlike typical design systems, we do NOT dictate aesthetics — users control their appearance through the color system and chat editor.

**Our job: Build solid, flexible infrastructure.**
**Their job: Make it look how they want.**

---

## 1. Structural Integrity Over Decoration

- Every component must WORK correctly before it looks good
- Layout, spacing, and hierarchy are structural — we control these
- Colors, shadows, and visual flair come from user config — they control these
- Never hardcode colors, ever. Read from `config.colors`

## 2. User Color System is Sacred

The 10 color keys are the user's paintbrush:

```
sidebar_bg, sidebar_icons, sidebar_buttons, sidebar_text
background, buttons, cards, text, headings, borders
```

Rules:
- All components read colors from props/context, never inline hex values
- Use `getContrastText(bgColor)` for text on colored backgrounds
- Auto-contrast: dark sidebar_bg → light sidebar_text (and vice versa)
- Dual-color support: `color_primary` + `color_secondary` on records

## 3. Consistent Spacing Scale

We DO control spacing because it's structural:

- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Tailwind classes: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Card padding: 16–24px
- Section gaps: 24–48px
- Component header height: consistent across all views

## 4. Typography Hierarchy (Structural)

We control size relationships, users control colors:

- Headings: larger, bolder (use `configColors.headings`)
- Body: readable size (use `configColors.text`)
- Small/meta: reduced size, muted (use `configColors.text` with opacity)
- Line height: 1.5–1.75 for readability
- Never ALL CAPS except very short labels

## 5. Responsive Behavior is Non-Negotiable

Layouts must work everywhere:

- **Mobile** (< 640px): Single column, stacked layouts, full-width buttons
- **Tablet** (640–1024px): 2-column grids, collapsible sidebars
- **Desktop** (> 1024px): Multi-column grids, expanded sidebars, data-dense views

Card grid reflow:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Large: 4 columns

## 6. View Mode Consistency

Each view type has a consistent structure regardless of which entity it displays:

**TableView:**
- Header row with sortable columns
- Data rows with consistent height
- Color indicator dot in first column
- Click row → DetailPanel

**CardView:**
- Responsive grid (1–4 columns)
- Color bar at top of each card (dual-color gradient if both colors set)
- Title, subtitle, badge, meta fields
- Click card → DetailPanel

**PipelineView:**
- Horizontal scroll container
- Columns = stages (colored headers)
- Cards stack vertically in columns
- Drag between columns updates stage_id
- Card shape configurable: default, rounded, arrow, minimal

**CalendarView:**
- Day/Week/Month toggle (always present)
- Time grid with hour markers
- Events as colored blocks
- Navigation: prev/next/today

**ListView:**
- Vertical stack, one item per row
- Optional checkbox (for completable items)
- Color dot indicator
- Bold styling for unread/pending items

## 7. Empty States Matter

When a component has zero records:
- Show a friendly message: "No [entity] yet"
- Prominent "Add your first [entity]" button
- Use configColors for styling
- Never show a blank void

## 8. Interaction States

All interactive elements need:
- **Hover**: Subtle feedback (background tint, scale 1.02)
- **Focus**: Visible ring for accessibility (2px, primary color with opacity)
- **Active/Pressed**: Slightly darker/deeper
- **Disabled**: Reduced opacity, no pointer cursor
- **Loading**: Spinner or skeleton, never frozen UI

Transitions: 150–200ms ease-out. Never jarring.

## 9. Accessibility Baseline

- Semantic HTML (button, nav, main, section, article)
- Keyboard navigable (Tab order logical)
- Focus indicators visible
- Touch targets ≥ 44×44px
- Color contrast: let the user's color choices determine this, but warn if contrast is poor

## 10. Performance Consciousness

- No massive uncompressed images
- Lazy load off-screen content
- Optimistic UI updates (instant feedback, rollback on failure)
- Pagination at 25 items (don't load 1000 records at once)
- Debounce search inputs (500ms)

---

## What We DON'T Dictate

These are USER choices, not ours:

- ❌ Specific hex colors for buttons, cards, backgrounds
- ❌ Whether they want dark mode or light mode
- ❌ Shadow depth, border radius, gradient styles
- ❌ Font family (future: let them pick)
- ❌ Brand personality (playful vs serious)

The chat editor handles all of this:
- "Make my sidebar dark green"
- "I want a light mode"
- "Make it look like [screenshot URL]"

Our structure + their preferences = their custom platform.

---

## Verification Questions

When reviewing any UI change, ask:

1. Are ALL colors coming from configColors or record colors?
2. Does the layout work on mobile, tablet, and desktop?
3. Is there an empty state?
4. Do all interactions have feedback (hover, focus, loading)?
5. Can a user change this element's appearance via the color system?

If #5 is "no" for a visual property, ask: should it be configurable?

---

*"The bricks are ours. The house is yours."*
