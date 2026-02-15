# Red Pine OS — Design Reference Spec

**Reference Image:** `design-reference/reference-dashboard.webp`

This is the target aesthetic. All UI work should move toward matching this look and feel.

---

## Color Palette (Extracted)

```
Background (main):     #F5F5F5 (light warm gray)
Background (cards):    #FFFFFF (pure white)
Background (highlight): #1A1A1A (near black - for featured stat card)
Text (primary):        #1A1A1A (near black)
Text (secondary):      #6B7280 (medium gray)
Text (on dark):        #FFFFFF (white)
Accent (success):      #10B981 (green for positive %)
Accent (neutral):      #3B82F6 (blue for status badges like "Shipped")
Accent (muted):        #9CA3AF (gray for "In Progress" badge)
Borders:               #E5E7EB (light gray, barely visible)
```

**Key Principle:** The palette is almost entirely black, white, and gray. Color is used sparingly for:
- Status badges
- Percentage indicators (+/-)
- Charts
- One highlighted card (inverted dark)

---

## Typography

```
Headings (stat numbers):  48-64px, font-weight 700 (bold), tracking tight
Headings (section):       20-24px, font-weight 600 (semibold)
Body (table data):        14-16px, font-weight 400 (regular)
Labels (small):           12-14px, font-weight 500 (medium), text-secondary color
Percentage indicators:    12-14px, font-weight 500, with up/down arrow
```

**Font Stack:** System fonts or Inter/SF Pro — clean sans-serif

---

## Spacing Scale

```
Card padding:          24px (p-6)
Card gap:              16-24px (gap-4 to gap-6)
Section gap:           32-48px (gap-8 to gap-12)
Table row padding:     16px vertical, 24px horizontal
Stat card internal:    24px padding, content centered or left-aligned
```

**Key Principle:** Generous whitespace. Nothing feels cramped. Content breathes.

---

## Border Radius

```
Cards:                 12-16px (rounded-xl to rounded-2xl)
Buttons:               8px (rounded-lg)
Badges/Pills:          9999px (rounded-full) — fully rounded
Inputs:                8px (rounded-lg)
Avatars:               50% (rounded-full)
```

**Key Principle:** Everything is rounded. No sharp corners anywhere.

---

## Shadows

```
Cards:                 shadow-sm or none (very subtle)
Elevated elements:     shadow-md (dropdowns, modals)
```

**Key Principle:** Shadows are minimal. Depth comes from background color contrast (white cards on gray background), not heavy shadows.

---

## Component Patterns

### Stat Cards (Top Row)
```
- 5 cards in a row, equal width
- One card is "featured" (dark background, inverted colors)
- Content: Icon (small, top-left or centered), Big number, Label below, Percentage change
- Percentage has colored indicator: green (+), red (-), gray (neutral)
- Subtle icon in corner or next to number
```

### Data Table / List Cards
```
- Each row is visually a card (subtle separation)
- Columns: Avatar/Icon | Primary text + subtitle | Data columns | Status badge
- Avatar: 32-40px circle with initials or image
- Status badge: Pill shape, colored background, white or dark text
- Row hover: Subtle background change
- No heavy grid lines — separation through spacing and subtle borders
```

### Status Badges
```
- Pill shaped (rounded-full)
- Padding: px-3 py-1
- Font: 12-14px, medium weight
- Colors:
  - Blue background (#3B82F6) + white text = "Shipped", "Active", "Complete"
  - Gray background (#E5E7EB) + dark text = "In Progress", "Pending", "Draft"
  - Green background (#10B981) + white text = "Paid", "Success"
  - Red background (#EF4444) + white text = "Overdue", "Failed", "Cancelled"
```

### Charts
```
- Bar chart: Black/gray bars, clean axis labels
- Radar/Spider chart: For multi-dimensional data
- Minimal styling — no heavy gridlines, subtle axis
```

### Sidebar Navigation
```
- Dark or light background (this reference uses light)
- Active item: Filled background (dark), white text
- Inactive items: No background, dark text
- Icons: Simple line icons, consistent stroke width
- Spacing: Generous padding between items
```

---

## What This Means for Red Pine

### Current State → Target State

| Element | Current (Red Pine) | Target (Reference) |
|---------|-------------------|-------------------|
| Accent color | Red (#EF4444) | Black/White + minimal color |
| Table rows | Flat spreadsheet | Card-like with rounded corners |
| Stat cards | None | Top row with big numbers |
| Status badges | Text only | Colored pills |
| Shadows | None | Subtle (shadow-sm) |
| Border radius | Small or none | Large (rounded-xl) |
| Spacing | Tight | Generous |
| Overall feel | Demo/prototype | Polished product |

### Priority Changes

1. **Add stat cards row** at top of each view (count, totals, key metrics)
2. **Restyle table rows** as contained cards with more padding and rounded corners
3. **Add status badges** as colored pills instead of plain text
4. **Increase border-radius** everywhere (cards, buttons, inputs)
5. **Switch accent from red to black/gray** (let user colors be the accent)
6. **Add more whitespace** throughout
7. **Soften everything** — no harsh lines, gentle borders

---

## Verification Checklist

When checking if UI matches reference:

- [ ] Background is light gray (#F5F5F5), cards are white
- [ ] No red accent visible (unless user chose red)
- [ ] All cards have rounded-xl or rounded-2xl corners
- [ ] Status values show as colored pill badges
- [ ] Stat cards present with big numbers
- [ ] Generous padding inside all cards (24px+)
- [ ] Typography hierarchy clear (big headings, smaller labels)
- [ ] Shadows are subtle or nonexistent
- [ ] Overall feel is "polished product" not "demo"

---

*Reference: design-reference/reference-dashboard.webp*
