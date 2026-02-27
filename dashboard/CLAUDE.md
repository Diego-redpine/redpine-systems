# CLAUDE.md – Red Pine OS Project Memory & Rules

This file is loaded at the start of every Claude Code session. It provides persistent context, architecture rules, tool usage guidelines, and design reference.

---

## Project Identity

**Red Pine OS** is a chat-first platform builder. Users describe their business in natural language, AI assembles a custom business management platform from universal components.

**"The bricks are ours. The house is yours."**

We build infrastructure and structure. Users control appearance through the color system and chat editor. We are NOT decorators — we lay foundation, they add paint and furniture.

---

## Tech Stack

- **Database**: Supabase (PostgreSQL + Auth + RLS + Storage)
- **Backend**: Flask + Claude API (port 5001) for onboarding/AI chat
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind (port 3000)
- **Payments**: Stripe
- **Email**: Resend
- **Domain**: redpine.systems (*.redpine.systems for subdomains)

---

## Critical Rules — NEVER BREAK THESE

1. **Supabase for ALL data** — Never use Odoo for data operations. Odoo is future ERP integration only.
2. **RLS on every table** — All tables must have Row Level Security with `user_id = auth.uid()`.
3. **Colors from config** — NEVER hardcode colors in components. Read from `config.colors` or use the design system defaults.
4. **Fields from entity-fields.ts** — Views never hardcode which fields to display.
5. **No new UI libraries** — Tailwind utility classes only. No Material UI, Ant Design, Chakra.
6. **Match the design reference** — All UI work should trend toward `design-reference/reference-dashboard.webp`.
7. **DOMAIN ROUTING — DO NOT CHANGE** — See "Domain Architecture" section below.

---

## Domain Architecture — LOCKED IN, DO NOT MODIFY

```
redpine.systems             → Landing page (public, AI chat signup)
app.redpine.systems         → Dashboard (authenticated, business owner platform)
*.redpine.systems           → User websites (public, e.g. luxe-nails.redpine.systems)
*.redpine.systems/portal    → Client portals (magic link auth)
```

**DNS:** Cloudflare wildcard `*.redpine.systems` → Vercel
**Vercel:** Custom domains: `redpine.systems`, `*.redpine.systems`
**Env var:** `NEXT_PUBLIC_ROOT_DOMAIN=redpine.systems`

### Routing rules (in `src/middleware.ts`):

| Request | Handled by | Behavior |
|---------|-----------|----------|
| `redpine.systems/*` | `handleMainDomain()` | Landing page (public) or dashboard (auth required) |
| `app.redpine.systems/*` | `handleMainDomain()` | Dashboard — identical to root domain auth flow |
| `luxe-nails.redpine.systems/` | `handleUserSubdomain()` | Rewrites to `/site/luxe-nails` |
| `luxe-nails.redpine.systems/portal` | `handleUserSubdomain()` | Rewrites to `/portal/luxe-nails` |
| `luxe-nails.redpine.systems/book` | `handleUserSubdomain()` | Rewrites to `/book/luxe-nails` |
| `luxe-nails.redpine.systems/api/subdomain` | `handleUserSubdomain()` | Passes through with `x-subdomain` header |

### What NEVER changes:
- The `APP_SUBDOMAIN = 'app'` constant
- The `extractSubdomain()` function
- The rewrite pattern: `subdomain.redpine.systems/path` → `/internal-route/subdomain/path`
- The `SUBDOMAIN_SPECIAL_PATHS` map (portal, book, order, form, review, sign, board)
- The `x-subdomain` / `x-is-subdomain` headers on responses

**If you are an AI agent reading this:** Do NOT modify `src/middleware.ts` routing logic. The DNS and Vercel config depend on this exact structure. Changing it will break all user websites and the dashboard.

---

# DESIGN REFERENCE SYSTEM

## Primary Reference Image

**File:** `design-reference/reference-dashboard.webp`
**Spec:** `design-reference/DESIGN-SPEC.md`

This is the target aesthetic. When building or fixing UI, always compare against this reference.

## Target Aesthetic Summary

```
Palette:        Black, white, gray. Minimal color accents.
Corners:        Rounded everywhere (rounded-xl, rounded-2xl)
Shadows:        Subtle or none (shadow-sm max)
Spacing:        Generous (24px+ card padding)
Typography:     Bold numbers, clean hierarchy
Status:         Colored pill badges (blue, gray, green, red)
Stat Cards:     Big numbers at top of views
Table Rows:     Card-like with padding, not flat spreadsheet
Overall:        Polished product, not demo
```

## Design Reference Loop — AUTOMATIC

When working on ANY UI task:

```
1. OPEN the reference image: design-reference/reference-dashboard.webp
2. SCREENSHOT the current Red Pine UI (via Playwright)
3. COMPARE: What's different? What's missing?
4. IDENTIFY specific gaps:
   - Wrong colors?
   - Missing rounded corners?
   - Spacing too tight?
   - No status badges?
   - Missing stat cards?
5. MAKE code changes
6. SCREENSHOT again
7. COMPARE to reference again
8. REPEAT until it matches the reference quality
```

## Key Visual Patterns to Match

### Stat Cards Row
```jsx
// Top of each view — row of stat cards with big numbers
<div className="grid grid-cols-5 gap-4">
  <StatCard number="2.3k" label="Total Requests" change="+100%" />
  <StatCard number="823" label="Total Approval" featured={true} /> {/* Dark bg */}
  <StatCard number="1.2k" label="Pending" change="+59.8%" />
  ...
</div>
```

### Status Badges
```jsx
// Instead of plain text, use pill badges
<span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
  Shipped
</span>
<span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
  In Progress
</span>
```

### Card Styling
```jsx
// All cards should have generous padding and rounded corners
<div className="bg-white rounded-2xl p-6 shadow-sm">
  {/* content */}
</div>
```

### Table Rows as Cards
```jsx
// Each row should feel like a card, not a spreadsheet cell
<div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50">
  <Avatar />
  <div className="flex-1">
    <p className="font-medium">{name}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
  <StatusBadge status={status} />
</div>
```

### Background Layers
```
Page background:    bg-gray-100 (#F5F5F5)
Card background:    bg-white
Featured card:      bg-gray-900 text-white
```

---

## Color Palette (From Reference)

```css
/* Backgrounds */
--bg-page: #F5F5F5;
--bg-card: #FFFFFF;
--bg-card-featured: #1A1A1A;

/* Text */
--text-primary: #1A1A1A;
--text-secondary: #6B7280;
--text-on-dark: #FFFFFF;

/* Status Colors */
--status-success: #10B981;
--status-info: #3B82F6;
--status-warning: #F59E0B;
--status-danger: #EF4444;
--status-neutral: #9CA3AF;

/* Borders */
--border-light: #E5E7EB;
```

**IMPORTANT:** These are the DEFAULT palette. When user has custom `config.colors`, those override these defaults. The reference palette is the "blank canvas" before user customization.

---

# PLAYWRIGHT MCP — VISUAL DEVELOPMENT WORKFLOW

## Automatic Triggers — USE PLAYWRIGHT WITHOUT BEING ASKED

When you hear ANY of these phrases, **automatically use Playwright**:

**Viewing/Checking:**
- "check the dashboard" / "check the UI" / "check the page"
- "look at" / "show me" / "what does it look like"
- "compare to reference" / "does it match"

**Problems/Bugs:**
- "the [X] is broken" / "not showing" / "looks wrong"
- "doesn't match the design" / "looks different from reference"
- "fix the UI" / "fix the layout" / "fix the styling"

**Design Work:**
- "make it look like the reference"
- "style this like image 2"
- "redesign" / "restyle" / "polish"

**You don't need to be told "use Playwright"** — if the request involves UI, just do it.

---

## Screenshot Organization

**All screenshots go in:** `design-reference/screenshots/`

Naming convention:
```
design-reference/screenshots/
├── [component]-before.png      # State before changes
├── [component]-after.png       # State after changes
├── [component]-mobile.png      # Mobile viewport
├── [component]-hover.png       # Hover states
└── comparison-[date].png       # Side-by-side comparisons
```

Examples:
- `clients-table-before.png`
- `clients-table-after.png`
- `sidebar-hover.png`
- `dashboard-mobile.png`

**Before taking any screenshot**, ensure the folder exists:
```bash
mkdir -p design-reference/screenshots
```

When saving screenshots via Playwright, always use the full path:
```
design-reference/screenshots/[descriptive-name].png
```

---

## Standard UI Workflow

### For Any UI Task:

```
1. OPEN reference: View design-reference/reference-dashboard.webp
2. NAVIGATE: Go to http://localhost:3000 (or specific route)
3. SCREENSHOT: Save to design-reference/screenshots/[component]-before.png
4. COMPARE: Reference vs Current — list differences
5. CODE: Make changes to close the gaps
6. WAIT: Hot reload (~2 seconds)
7. SCREENSHOT: Save to design-reference/screenshots/[component]-after.png
8. COMPARE: Is it closer to reference?
9. REPEAT: Until it matches or ask for guidance
```

### Comparison Checklist (Run Mentally Each Loop):

- [ ] Background color correct? (gray page, white cards)
- [ ] Rounded corners on cards? (rounded-xl minimum)
- [ ] Padding generous? (p-6 / 24px on cards)
- [ ] Status badges are pills? (not plain text)
- [ ] Typography hierarchy clear? (big numbers, smaller labels)
- [ ] Shadows subtle? (shadow-sm or none)
- [ ] No harsh red accent? (unless user chose it)

---

## Playwright Capabilities

### Navigation & Viewing
```
- Navigate to any URL (localhost:3000, localhost:5001)
- Click sidebar items, tabs, buttons, dropdowns
- Take screenshots (full page or elements)
- Set viewport size (mobile, tablet, desktop)
```

### Interactions
```
- HOVER: Trigger :hover states
- CLICK: Buttons, rows, cards
- TYPE: Forms, search boxes
- DRAG: Pipeline cards between columns
- SCROLL: Navigate long pages
```

### Multi-Viewport Testing
```
Mobile:     375 x 667
Tablet:     768 x 1024
Desktop:    1280 x 800
Desktop L:  1920 x 1080
```

---

## Page Navigation Map

| Request | Action |
|---------|--------|
| "check the dashboard" | localhost:3000, screenshot |
| "check onboarding" | localhost:5001, screenshot |
| "check Colors tab" | Click Colors tab, screenshot |
| "check the reference" | Open design-reference/reference-dashboard.webp |
| "compare to reference" | Screenshot current + view reference + list differences |

---

# CODE STYLE & STRUCTURE

## File Structure

```
~/redpine-os/
├── dashboard/                 # Next.js frontend (port 3000)
│   ├── src/
│   │   ├── app/              # Pages and API routes
│   │   ├── components/       # React components
│   │   │   ├── views/        # View renderers (CardView, PipelineView, etc.)
│   │   │   └── data/         # Data UI (SearchBar, FilterBar)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   └── types/            # TypeScript types
│   ├── design-reference/     # Reference images and specs
│   └── context/              # Design principles, acceptance criteria
├── onboarding/               # Flask backend (port 5001)
└── RED_PINE_OS_BRAIN_v3.pdf  # Project documentation
```

## Code Style

- TypeScript everywhere
- Functional React components + hooks
- Tailwind CSS for all styling
- 2-space indentation, single quotes
- Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`

---

# KEY REFERENCES

## Files to Know

| File | Purpose |
|------|---------|
| `design-reference/reference-dashboard.webp` | Target design aesthetic |
| `design-reference/DESIGN-SPEC.md` | Extracted design tokens and patterns |
| `context/design-principles.md` | Structural UI rules |
| `context/acceptance-criteria.md` | Verification checklist |
| `src/lib/view-registry.ts` | Component → view mappings |
| `src/lib/entity-fields.ts` | Entity → display field mappings |
| `src/lib/view-colors.ts` | Color resolution utilities |

## The 28 Components

| Category | Components |
|----------|------------|
| People | clients, leads, staff, vendors |
| Things | products, inventory, equipment, assets |
| Time | calendar, appointments, schedules, shifts |
| Money | invoices, payments, expenses, payroll, estimates |
| Tasks | todos, jobs, projects, workflows |
| Communication | messages, notes, announcements, reviews |
| Files | documents, contracts, images, uploads |

## The 5 Views

| View | Default For |
|------|-------------|
| Table | clients, products, invoices, payments, expenses, staff, vendors |
| Calendar | appointments, schedules, shifts, calendar |
| Cards | staff, projects, equipment, reviews, images |
| Pipeline | leads, jobs, workflows |
| List | todos, messages, notes, announcements |

## The 10 Color Keys (User Controlled)

```
sidebar_bg, sidebar_icons, sidebar_buttons, sidebar_text
background, buttons, cards, text, headings, borders
```

---

# STARTUP COMMANDS

```bash
# Terminal 1: Dashboard
cd ~/redpine-os/dashboard && npm run dev

# Terminal 2: Claude Code
cd ~/redpine-os/dashboard && claude

# Terminal 3: Onboarding (optional)
cd ~/redpine-os/onboarding && source ../venv312/bin/activate && python app.py
```

---

# PR CHECKLIST

Before completing any UI task:

- [ ] Compared to design reference — matches quality level
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Colors from config (not hardcoded)
- [ ] Rounded corners (rounded-xl+)
- [ ] Generous spacing (p-6 on cards)
- [ ] Status badges are pills (not plain text)

---

*"The bricks are ours. The house is yours."*

*Last updated: February 6, 2026*
