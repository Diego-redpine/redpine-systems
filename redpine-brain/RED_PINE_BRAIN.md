# RED PINE OS — THE BRAIN
## Living Context Document | Single Source of Truth
**Founder:** Diego Rodriguez — Co-CTO, Red Pine (Age 22)
**Started:** January 20, 2026
**Last Checkpoint:** February 14, 2026 — Day 25
**Overall Progress:** ~94% Complete (Core Platform) — Launch Sprint ACTIVE
**Tagline:** "The bricks are ours. The house is yours."

---

# CHECKPOINT LOG
> Update this section every other day or when significant progress is made.
> Format: Date | Day # | What changed | What's next

| Date | Day | Status | Key Progress | Next Steps |
|------|-----|--------|-------------|------------|
| Jan 20 | 0 | Project started | Vision defined, Ralph automation set up | Build foundation |
| Jan 22 | 2 | Phase 1-2C complete | Foundation + Landing + Editor + Claude API streaming | Phase 2D: Platform context |
| Jan 23 | 3 | Phase 3-4 complete | Credit system + Stripe payments working | Onboarding + Data sync |
| Jan 24 | 4 | Phase 5A complete | Onboarding wizard, open questions documented | Answer open Qs, build 5B |
| Jan 26 | 6 | Outreach updated | Maria Santos added as Agent 2, Red Pine Sites integration | Finalize outreach infra |
| Jan 27 | 7 | Agency PRD written | Full closer/setter system designed with Supabase schema | Build agency platform |
| Jan 29 | 9 | Architecture pivot | Odoo 18 discovered — 328 modules, Flask + Next.js split | Build onboarding + dashboard |
| Jan 30 | 10 | Core built | Flask onboarding + AI chat + config gen + dashboard + Stripe | Vision expansion |
| Jan 31-Feb 1 | 11-12 | Vision expansion | Pine Tree system, AI Agents, marketplace, pricing iterations | Component architecture |
| Feb 2 | 13 | Component refactor | 28 components, tab-as-container model, color system, chat editor | Backend PRD |
| Feb 3 | 14 | Backend complete | B1-B9 all done via Claude Code, Supabase full stack, Brain v1 | Frontend phases |
| Feb 4 | 15 | Brain v2+v3, 30/30 | F6 versioning, CC colors, F4 CRUD (9 entities), F7 subdomains, 30/30 pass | Views + data UI |
| Feb 7 | 16 | Brain v4, ~70% | F1 views complete, F4 data wiring complete, Playwright MCP, UI redesign started | UI polish sprint |
| Feb 7-8 | 17-19 | Brain v5, ~85% | Phase 1A (68→74 components), Phase 2 (smart onboarding), Phase 3 (payment popup), Phase 4 (analytics, booking page), Phase 5 (logo upload, context headings), Phase 6 (Vercel/Railway deploy), Phase 7 (terms/privacy, 404, rate limiting), Restaurant System (7 batches), Post-Test (color transfer, card layouts, analytics templates, AI color validation), 45 industries tested A average | Phase A launch sprint |
| Feb 11 | 22 | Foundation Sprint | Sidebar A+, but tabs are hollow CRUD. Installed 23 npm libs (TipTap, FullCalendar, dnd-kit, Recharts, Tanstack Table, jsPDF, react-dropzone, Sonner, papaparse). 6-sprint plan to make all components functional. 73-task Phase B+ roadmap queued. | Sprint 1-5 build, Sprint 6 Supabase deploy |
| Feb 12 | 23 | Staff Wizard + Analytics | Staff Setup Wizard (5-step CenterModal), 9 analytics types covering all 70 entities, calendar consolidation AI rule, dummy mode optimistic fix, 2 more E2E tests (law firm A-, yoga A). 34 industries tested. | Calendar system OR Website builder |
| Feb 13 | 24 | Launch Sprint + Marketplace + Site Builder + Marketing + Data-Linked Widgets | Launch Blockers Sprint (6 features): password reset, mobile nav, settings tab, booking backend, ChaiBuilder site builder, Stripe Connect + Square OAuth. Website/Site redesign (8 batches): SiteView, SiteAnalytics, site_projects, SiteWizard, multi-project, floating AI chat, custom website widgets (4: BookingWidget, ProductGrid, ContactForm, ReviewCarousel). Freelancer Marketplace (5 batches): browse/hire, order flow, messaging, reviews, milestones. Marketing moved to ToolsStrip. Data-Linked Widgets: all 4 site widgets now start blank in editor with "Select" button → DataSelector popup → links to dashboard data. TopBar replaces Sidebar (no more sidebar). CenterModal popup system. ToolsStrip with 5 buttons (Chat, Edit, Website, Marketplace, Marketing). | Visual polish, Supabase migrations, deploy |
| Feb 14 | 25 | Route Planner + Code Quality | Route Planner Batch 1: new `'route'` ViewType (6th view), Leaflet map with territory polygons + customer pins, dnd-kit sortable stop list, RouteDetailModal with zoomed map + route polyline, TerritoryDrawTool for polygon drawing. Installed leaflet + react-leaflet + @types/leaflet. Code Quality Sprint: extracted duplicate `getStatusBadgeStyle()` to shared `badge-styles.ts`, removed unused imports (getCardBorder, getHeadingColor), fixed TerritoryDrawTool array index keys, added error logging to silent catch blocks (useCustomFields, useUserRole, crud.ts), fixed 3 console 401 errors (ViewRenderer + PineTreeWidget now use `useDataMode()` hook to skip API calls in dummy mode). 3 Playwright tests passed (landscaping, plumbing, cleaning — all with different theme colors). 0 TypeScript errors, 0 console errors. | Supabase migrations, deploy, landing page |
| Feb 17 | 28 | Phase C Planning | Gallery system, AI-generated websites, booking pipeline, multi-language chat, visual previews in onboarding — all added to Brain. Gallery build starting. | Build Gallery system end-to-end |
| Feb 18 | 29 | Gallery + Templates Family 1 | Gallery system (13 steps). Cost optimization (Haiku chat, 10-msg cap). **Industry Templates Family 1 (Beauty & Body)**: template module (`templates/registry.py`, `beauty_body.py`), enterprise-first skeleton with locked components, 10 industry subtypes (nail_salon, barbershop, hair_salon, lash_brow, makeup_artist, tattoo, spa, med_spa, pet_grooming, salon), template-aware `/configure` route, `validate_locked_components()` safety net, 16 unit tests (all pass), 5 live API tests (all pass), Playwright E2E verified. Solo operators get Staff tab removed, enterprise keeps it. Locked components (calendar, clients, gallery, invoices, appointments) always present. Non-beauty industries fall back to existing build-from-scratch. | Test more industries, build Family 2-6 |
| _next_ | _ | ________________ | ________________________________________________ | ________________ |

---

# CURRENT STATUS

## Progress Map (as of Feb 14, 2026)

| Area | Status | % Done |
|------|--------|--------|
| Backend Infrastructure (B1-B9) | COMPLETE | 100% |
| Config Versioning (F6) | COMPLETE | 100% |
| Colors via Chat (CC) | COMPLETE | 100% |
| Real Data CRUD API (F4 backend) | COMPLETE | 100% |
| Subdomain Routing (F7) | COMPLETE | 100% |
| View Registry + Types (F1-A) | COMPLETE | 100% |
| Pipeline Architecture (F1-B) | COMPLETE | 100% |
| View Renderers (F1-C/D/E) | COMPLETE | 100% |
| Real Data UI Layer (F4 frontend) | COMPLETE | 100% |
| Logo Upload (F3) | COMPLETE | 100% |
| Component Registry (74 total) | COMPLETE | 100% |
| Smart Onboarding (colors, views, pipelines) | COMPLETE | 100% |
| Payment System (Stripe $29/mo) | COMPLETE | 100% |
| Analytics (business-type templates) | COMPLETE | 100% |
| Public Booking Page (/book/[subdomain]) | COMPLETE | 100% |
| Public Ordering Page (/order/[subdomain]) | COMPLETE | 100% |
| Restaurant System (7 batches) | COMPLETE | 100% |
| Deployment Configs (Vercel + Railway) | COMPLETE | 100% |
| Legal Pages (Terms, Privacy, 404, Error) | COMPLETE | 100% |
| Rate Limiting | COMPLETE | 100% |
| Card Category Layouts (5 types) | COMPLETE | 100% |
| AI Color Validation (43 industries) | COMPLETE | 100% |
| Staff Setup Wizard (5-step) | COMPLETE | 100% |
| Analytics Per-Tab (9 types, 70 entities) | COMPLETE | 100% |
| Calendar Consolidation (AI rule + cross-config) | COMPLETE | 100% |
| Component Functionality (Foundation Sprint) | COMPLETE | 100% |
| UI Polish / Redesign (TopBar, CenterModal) | COMPLETE | 100% |
| Settings Tab | COMPLETE | 100% |
| Password Reset Flow | COMPLETE | 100% |
| Mobile Navigation (TopBar overflow) | COMPLETE | 100% |
| Site Builder (ChaiBuilder + custom widgets) | COMPLETE | 100% |
| Website Widgets (data-linked, 4 widgets) | COMPLETE | 100% |
| Freelancer Marketplace (5 batches) | COMPLETE | 100% |
| Marketing Hub (Social Media, Live Chat, Analytics) | COMPLETE | 100% |
| Payment Processors (Stripe Connect + Square) | COMPLETE | 100% |
| Route Planner (Leaflet maps, territory polygons) | COMPLETE | 100% |
| Code Quality (dedup, unused imports, error logging) | COMPLETE | 100% |
| Universal Calendar (per-event type picker) | COMPLETE | 100% |
| Gallery System (upload, albums, lightbox, widget) | COMPLETE | 100% |
| Industry Templates Family 1 (Beauty & Body) | COMPLETE | 100% |
| **Visual Polish + Deploy** | **IN PROGRESS** | **60%** |
| Drag-and-Drop Editor (F5) | NOT STARTED | 0% |

### What Blocks Launch
- **Supabase Migrations**: 12 SQL migrations (001-012) need to be applied in production
- **Visual Polish**: Some views need final design pass against reference
- **Deploy to Production**: Vercel + Railway configs ready but not deployed yet

**Note:** No separate landing page needed — the onboarding page IS the landing page/homepage. Users land on the AI chat, describe their business, and go straight into the platform. One page, one flow.

### What Can Wait Until After Launch
- Drag-and-Drop Editor — chat editing already works
- Forms Builder, E-Sign — Phase B features
- Pine Tree Growth, Community — Phase D engagement
- QuickBooks Integration — Phase B finance feature

---

# 1. THE VISION

Red Pine is a chat-first platform builder. Users describe their business in natural language, and AI assembles a fully functional platform from universal components in minutes.

**The Core Insight:** Every business is just 7 categories wearing different clothes:

| Category | Examples |
|----------|----------|
| People | Clients, staff, students, patients, customers, members |
| Things | Inventory, products, equipment, supplies, assets |
| Time | Scheduling, appointments, classes, shifts, events |
| Money | Invoices, payments, expenses, payroll, estimates |
| Tasks | To-dos, workflows, approvals, checklists |
| Communication | Messages, notes, updates, announcements |
| Files | Documents, contracts, uploads, portfolio |

**The Competitive Edge:** Zoho Creator has done this for 29 years, but their onboarding is a maze of catalogs and templates. Red Pine flips it: just describe what you need in a conversation.

**The Analogy:** We provide the bricks. AI builds the house. You can repaint everything, change the windows, add a garage, tear down walls, build a skyscraper, or make a cozy shack.

**Future Name Goal:** Sprout.com (domain goal — currently Red Pine)

---

# 2. ARCHITECTURE

## Current Stack (as of Feb 7, 2026)

| Service | Port | Technology | Role |
|---------|------|-----------|------|
| Database | — | Supabase (PostgreSQL) | Data storage, auth, realtime |
| Backend | 5001 | Flask + Claude API | AI chat, config generation |
| Dashboard | 3000 | Next.js + React + Tailwind | UI, preview, editing |
| Payments | — | Stripe | Subscriptions, checkout |
| Email | — | Resend | Transactional emails |
| Domain | — | redpine.systems | *.redpine.systems for subdomains (businessname.redpine.systems) |

### Domain & URL Structure
- **Root domain:** `redpine.systems` — serves the onboarding/landing page (AI chat)
- **Client subdomains:** `businessname.redpine.systems` — each client gets their own subdomain
- **Website pages:** `businessname.redpine.systems/home`, `/about`, `/services`, `/contact`, etc.
- **Public booking:** `businessname.redpine.systems/book` (or `/book/[subdomain]` internally)
- **Public ordering:** `businessname.redpine.systems/order` (or `/order/[subdomain]` internally)
- **Dashboard:** `app.redpine.systems` (or `redpine.systems/dashboard` — TBD on deploy)
- **No separate landing page** — the onboarding AI chat IS the homepage. Users land, describe their business, and go straight into the platform.

### Architecture Evolution
1. **Jan 20-24:** Next.js + Supabase + Ralph automation (autonomous AI coding loops)
2. **Jan 29:** Discovered Odoo 18 — pivoted to Odoo as backend (328 modules)
3. **Feb 3:** Odoo NOT primary data source — Supabase handles all data, Odoo is future integration only
4. **Feb 4:** Flat $29/mo pricing — platform is hook, agents are revenue
5. **Current:** Flask + Next.js + Supabase + Stripe + Resend

## File Structure

```
~/redpine-os/dashboard/
├── CLAUDE.md                    # Project memory + Playwright workflow
├── design-reference/
│   ├── reference-dashboard.webp # Target design aesthetic
│   ├── DESIGN-SPEC.md          # Extracted design tokens
│   └── screenshots/            # Before/after screenshots
├── src/
│   ├── app/
│   │   ├── api/                # ~40 API route directories
│   │   ├── dashboard/page.tsx  # Production dashboard (auth required)
│   │   ├── preview/page.tsx    # Preview dashboard (with config_id)
│   │   ├── page.tsx            # Demo dashboard (no auth)
│   │   ├── book/[subdomain]/   # Public booking page
│   │   ├── order/[subdomain]/  # Public ordering page
│   │   ├── site/[subdomain]/   # Public website pages
│   │   ├── editor/[slug]/      # ChaiBuilder page editor
│   │   └── login/, forgot-password/, terms/, privacy/, etc.
│   ├── components/
│   │   ├── views/              # View renderers (ViewRenderer, CardView, PipelineView, CalendarView, ListView, TableView, RouteView, DetailPanel, etc.)
│   │   ├── maps/               # Map components (LeafletMap, TerritoryDrawTool)
│   │   ├── widgets/            # ChaiBuilder website widgets (BookingWidget, ProductGrid, ContactForm, ReviewCarousel, DataSelector)
│   │   ├── marketplace/        # Freelancer marketplace (OrderFlowModal, MyOrders, OrderDetailModal, OrderChat, ReviewModal)
│   │   ├── editors/            # Rich text + document editors
│   │   ├── data/               # Data UI (SearchBar, FilterBar, DataToolbar)
│   │   ├── DashboardContent.tsx # Main content router (tabs, platform views, analytics)
│   │   ├── TopBar.tsx          # Horizontal tab navigation (replaced Sidebar)
│   │   ├── ToolsStrip.tsx      # Floating toolbar (5 buttons: Chat, Edit, Website, Marketplace, Marketing)
│   │   ├── EditorOverlay.tsx   # Design editor overlay
│   │   ├── SiteView.tsx        # Website builder (pages + analytics)
│   │   ├── SiteEditor.tsx      # ChaiBuilder editor wrapper
│   │   ├── FreelancerMarketplace.tsx # Browse/hire freelancers
│   │   ├── MarketplaceView.tsx # Marketplace sub-tabs container
│   │   └── SettingsContent.tsx # Settings (6 sections)
│   ├── hooks/                  # Data hooks (useDataMode, useEntityData, useEntityMutations, useUserRole, useCustomFields)
│   ├── providers/DataModeProvider.tsx
│   ├── types/                  # TypeScript types (config.ts, data.ts, freelancer.ts)
│   └── lib/
│       ├── view-registry.ts    # Component -> views mapping
│       ├── entity-fields.ts    # Entity -> display fields mapping (74 entities)
│       ├── dummy-data.ts       # Per-component mock data
│       ├── chai-blocks-register.ts # ChaiBuilder widget registration
│       ├── pdf-generator.ts    # PDF export (jsPDF + html2canvas)
│       ├── csv-export.ts       # CSV export
│       ├── badge-styles.ts     # Shared status badge colors (used by Card/List/TableView)
│       ├── rate-limit.ts       # Rate limiting
│       ├── encryption.ts       # AES-256-GCM for payment tokens
│       ├── payment-providers/  # Stripe Connect + Square OAuth
│       └── stripe.ts, sms.ts, geo.ts, delivery-provider.ts
```

---

# 3. THE 74 COMPONENTS

Expanded from 28 → 68 (Phase 1A) → 74 (Restaurant System). Tabs are custom containers (any name, any icon). Components are building blocks inside tabs.

### Original 28 Components

| Category | Components |
|----------|-----------|
| People | clients, leads, staff, vendors |
| Things | products, inventory, equipment, assets |
| Time | calendar, appointments, schedules, shifts |
| Money | invoices, payments, expenses, payroll, estimates |
| Tasks | todos, jobs, projects, workflows |
| Communication | messages, notes, announcements, reviews |
| Files | documents, contracts, images, uploads |

### Additional 46 Components (40 new + 6 restaurant ops)

| Category | Components |
|----------|-----------|
| Signing & Compliance | waivers, forms, signatures |
| Hospitality & Food | reservations, tables, menus, orders, rooms, recipes |
| Education & Programs | classes, memberships, courses, attendance |
| Field Service | inspections, routes, fleet, checklists, permits |
| Health & Medical | prescriptions, treatments |
| Creative | portfolios, galleries |
| Real Estate | listings, properties |
| Legal | cases |
| Events | venues, guests |
| Marketing | campaigns, loyalty, surveys |
| Support | tickets, knowledge |
| Business Operations | packages, subscriptions, time_tracking |
| Digital & Online | social_media, reputation, portal, community, chat_widget |
| Restaurant Ops | waitlist, tip_pools, waste_log, suppliers, purchase_orders |

### Config Schema
```json
{
  "tabs": [
    {
      "id": "tab_1",
      "label": "Work Shit",
      "icon": "briefcase",
      "components": [
        { "id": "clients", "label": "Clients" },
        { "id": "appointments", "label": "Appointments" },
        { "id": "payments", "label": "Bread" }
      ]
    }
  ]
}
```

### Chat Editing Examples (All Working)
| User Says | AI Does |
|-----------|---------|
| "add inventory" | Creates Inventory tab with Products + Inventory components |
| "add tasks inside my schedule" | Adds Tasks component to Schedule tab |
| "move clients into schedule and call it Work Shit" | Merges components, renames tab, removes old tab |
| "rename Payments to Bread" | Updates component label |
| "remove the files section" | Removes tab or component |

---

# 4. THE 6 VIEW MODES

Every component can display in multiple view formats.

| View | Purpose | Default For |
|------|---------|------------|
| Table | Spreadsheet grid, sortable columns | products, invoices, payments, expenses, staff, vendors |
| Cards | Responsive visual grid, dual-color bar | staff, projects, equipment, reviews, images |
| Pipeline | Kanban columns, drag between stages | clients, leads, jobs, workflows |
| Calendar | Day/week/month time grid | appointments, schedules, shifts, calendar |
| List | Compact vertical stack, checkboxes | todos, messages, notes, announcements |
| Route | Territory map + stop list, Leaflet | routes |

### Default View Assignments

| Component | Default View | Other Available |
|-----------|-------------|----------------|
| clients | Pipeline | Table, Cards, List |
| contacts | List | Table, Cards |
| leads | Pipeline | Table, List |
| staff | Cards | Table, List |
| vendors | Table | Cards |
| products | Table | Cards |
| inventory | Table | Cards |
| equipment | Cards | Table |
| assets | Table | Cards |
| calendar | Calendar | List |
| appointments | Calendar | Table, List |
| schedules | Calendar | Table |
| shifts | Calendar | Table |
| invoices | Table | List |
| payments | Table | List |
| expenses | Table | List |
| payroll | Table | List |
| estimates | Table | List |
| todos | List | Table |
| jobs | Pipeline | Table, Cards |
| projects | Cards | Table, Pipeline |
| workflows | Pipeline | Table |
| messages | List | Table |
| notes | List | Table |
| announcements | List | Table |
| reviews | Cards | Table, List |
| documents | Table | Cards |
| contracts | Table | List |
| images | Cards | Table |
| uploads | Table | List |
| routes | Route | (single view, no toggle) |

### Dual-Color System
- Every data record has `color_primary` and `color_secondary` fields
- Cards show a color bar at top (50/50 gradient if both colors set)
- Pipeline cards show a vertical color stripe on the left
- List items show a small color dot
- Table rows show a color indicator in the first column
- AI can set colors: "make all white belt students white"

---

# 5. COLOR SYSTEM

10 color targets, all controllable via AI chat:

| Target | What It Controls |
|--------|-----------------|
| Sidebar | Sidebar background color |
| Sidebar Buttons | Active tab button background |
| Sidebar Icons | Icon colors in navigation |
| Sidebar Text | Text color in sidebar |
| Background | Main content area background |
| Buttons | Action button colors |
| Cards | Component card/section background |
| Text | Body text color |
| Headings | Section heading colors |
| Icons | Content area icon colors |

Auto-contrast algorithm ensures text is always readable. Dark/light mode supported.

### Design Reference (UI Polish Target)
| Token | Value |
|-------|-------|
| Background (page) | #F5F5F5 (light gray) |
| Background (cards) | #FFFFFF (white) |
| Background (featured) | #1A1A1A (near black) |
| Text (primary) | #1A1A1A |
| Text (secondary) | #6B7280 |
| Border radius | rounded-xl to rounded-2xl (12-16px) |
| Shadows | shadow-sm or none (very subtle) |
| Card padding | 24px (p-6) |
| Status badges | Colored pills (blue, gray, green, red) |

**Current vs Target:**
- Accent color: Red → Black/White + minimal color
- Table rows: Flat spreadsheet → Card-like with rounded corners
- Stat cards: None → Top row with big numbers
- Status badges: Text only → Colored pills
- Overall feel: Demo/prototype → Polished product

---

# 6. DATABASE SCHEMA

### Core Tables
- `users` — Auth, plan status, Stripe customer ID
- `configs` — Business configurations (tabs, components, colors)
- `config_versions` — Version history (20-version limit, auto-save)

### 9 Data Entity Tables
Each has: `id`, `user_id`, `name/title`, `status`, `color_primary`, `color_secondary`, `stage_id`, `created_at`, `updated_at`

1. `clients` — name, email, phone, company, status, notes
2. `leads` — name, email, phone, source, status, value, stage_id
3. `staff` — name, role, email, phone, department, status
4. `appointments` — title, client_id, staff_id, start_time, end_time, status
5. `invoices` — number, client_id, amount, status, due_date
6. `payments` — invoice_id, amount, method, status, paid_at
7. `expenses` — description, amount, category, date, status
8. `todos` — title, description, priority, status, due_date, assigned_to
9. `products` — name, description, price, sku, category, stock_quantity

### Pipeline Tables
- `pipeline_stages` — name, entity_type, position, color, user_id
- Pipeline presets for 10+ industries

---

# 7. USER FLOW

### 10-Step Flow
1. User visits redpine.systems landing page
2. Types business description or clicks "Start with form"
3. If vague → AI asks clarifying questions
4. If detailed → AI generates config immediately
5. "Platform Ready!" screen with summary
6. Clicks "Launch Dashboard" → preview with dummy data
7. Chat panel on left — edit tabs, components, colors
8. Explore all views (table, cards, pipeline, calendar, list)
9. "Save & Launch" → Stripe checkout ($29/mo)
10. Live platform with real data, subdomain assigned

### Data Mode
- Preview users (free/anonymous) see dummy data
- Paid users see real data
- `/api/data/mode` endpoint returns "dummy" or "real"
- Switch is invisible to user

---

# 8. PRICING & REVENUE

### Current Model (as of Feb 4, 2026)

| Tier | Price | Includes |
|------|-------|---------|
| Free | $0 | Preview with dummy data, 2 anonymous + 5 email commands |
| Platform | $29/mo | Full platform, real data, all 28 components, all views, subdomain |
| AI Agents | $5-50/mo each | Receptionist, Content Writer, Review Manager, Route Planner, Bookkeeper |

### Pricing Evolution
1. **Jan 22:** $100/mo single tier + $1 credits
2. **Jan 24:** Same $100/mo + credits model
3. **Jan 29:** $10 Starter / $100 Pro two-tier
4. **Feb 2:** $10 Starter / $100 Pro (confirmed)
5. **Feb 4:** Flat $29/mo — platform is hook, agents are revenue

### Revenue Math
- Cost per paid user: ~$0.40-1.00
- Revenue per paid user: $29/mo base + $20 avg agents = $49/mo
- Break-even: 8 customers = ~$400/mo survival
- Freedom number: 30 customers = ~$1,500/mo
- Target: 100 customers = ~$5,000/mo

### Open Source Cost Savings (per customer)
| Tool | Replaces | Savings |
|------|----------|---------|
| Cal.com | Calendly ($12/mo) | $12/mo |
| OpenSign | DocuSign ($15/mo) | $15/mo |
| n8n | Zapier ($20/mo) | $20/mo |
| Listmonk | Mailchimp ($20/mo) | $20/mo |
| Chatwoot | Intercom ($39/mo) | $39/mo |
| Plausible | Google Analytics | Privacy-first |
| Lago | Stripe Billing ($25/mo) | $25/mo |
| Formbricks | Typeform ($25/mo) | $25/mo |
| **Total** | | **$160+/mo** |

---

# 9. BACKEND PHASES (ALL COMPLETE)

| Phase | Description | Status |
|-------|------------|--------|
| B1 | Supabase project setup, tables, RLS policies | DONE |
| B2 | Auth flow (signup, login, session management) | DONE |
| B3 | Config CRUD (create, read, update, delete) | DONE |
| B4 | AI chat route (Claude API, streaming, config updates) | DONE |
| B5 | Stripe integration (checkout, webhooks, subscription tracking) | DONE |
| B6 | Email system (Resend, welcome emails, receipts) | DONE |
| B7 | Dummy data system (per-component mock data) | DONE |
| B8 | Config versioning (auto-save, undo, 20-version history) | DONE |
| B9 | Color system backend (10 targets, auto-contrast) | DONE |

---

# 10. FRONTEND PHASES

| Phase | Description | Status |
|-------|------------|--------|
| F1-A | View Registry (28 components → 5 view types mapping) | DONE |
| F1-B | Pipeline Architecture (stages, presets, CRUD) | DONE |
| F1-C/D/E | View Renderers (Card, Pipeline, Calendar, List, Table) | DONE |
| F3 | Logo Upload | DONE |
| F4 | Real Data UI (CRUD, search, filter, pagination, detail panels) | DONE |
| F5 | Drag-and-Drop Component Editor | NOT STARTED |
| F6 | Config Versioning UI | DONE |
| F7 | Subdomain Routing (middleware, public config API, auth) | DONE |
| F8 | Deployment (Vercel + Railway config files) | DONE |
| CC | Colors via Chat (AI controls all 10 color targets) | DONE |

---

# 10B. COMPLETED BUILD PHASES (Post Brain v4)

### Phase 1A: Component Registry Expansion
- 28 → 68 components registered across 5 config files (view-registry, entity-fields, dummy-data, StatCards, component-registry)
- 40 new components across 13 categories
- All entity-fields.ts, dummy-data.ts, StatCards DEMO_STATS expanded to cover every component

### Phase 2: Smart Onboarding
- AI generates 10-key color palettes per industry (sidebar_bg, sidebar_icons, sidebar_buttons, sidebar_text, background, buttons, cards, text, headings, borders)
- View assignments (table/calendar/cards/pipeline/list) included in config
- Pipeline stages with `transform_pipeline_stages()` in app.py converts AI's `stages: ["str"]` → structured `pipeline: {stages: [{id,name,color,order}]}`
- MUST USE component rules for business types in AI prompt

### Phase 3: Payment Integration
- SaveLaunchPopup: $29/mo persistent (non-dismissable) paywall
- `canEdit` boolean prop replaces old `editsRemaining` counter
- Preview mode = always editable, Dashboard = subscription-gated

### Phase 4: Enhanced Analytics & Booking
- Analytics: 6-month revenue chart, client growth SVG, weekly chart, top services, booking status
- Public booking page `/book/[subdomain]` with date/time picker, contact form, confirmation screen
- Dummy data gaps resolved for all 74 components

### Phase 5: UI Polish
- Logo upload to Supabase Storage (`/api/logo`)
- Context-aware section headings in DashboardContent (e.g., "Today's Schedule", "Active Cases", "Boarding Check-ins")
- Business name displayed in sidebar

### Phase 6: Deployment Configs
- Vercel config (`dashboard/vercel.json`) — framework: nextjs, region: iad1
- Railway config (`onboarding/Procfile`, `railway.json`, `requirements.txt`) — gunicorn, 2 workers, 120s timeout

### Phase 7: Launch Essentials
- Terms of Service page (references $29/mo pricing, subscription terms)
- Privacy Policy page (data collection, Stripe/Supabase/Resend/Anthropic processing)
- 404 Not Found page, Error boundary page
- Rate limiting (`lib/rate-limit.ts` — chat 20/min, config POST 10/min)

### Restaurant System (7 Batches — Complete)
- **Batch 1:** Staff/role system — `team_members` table, `/api/auth/role`, `useUserRole` hook, CRUD scoping
- **Batch 2:** Online ordering — `/order/[subdomain]` page, public menu/order APIs, Stripe checkout, kitchen pipeline
- **Batch 3:** Kitchen ops — QR table ordering, pipeline view, 86'd items, receipt printing
- **Batch 4:** Customer experience — SMS (Twilio), reorder by phone, delivery zones (Haversine), catering mode, loyalty program
- **Batch 5:** Business intel — waitlist, tip pools, waste log, suppliers, purchase orders, inventory auto-deduction
- **Batch 6-7:** Delivery modal (DoorDash Drive manual workflow), delivery provider abstraction, financial benefit guide + ROI calculator
- 74 components total (68 + 6 new: waitlist, tip_pools, waste_log, suppliers, purchase_orders, loyalty)
- 7 new DB tables in `003_restaurant_operations.sql`
- Key files: `DeliveryRequestModal.tsx`, `OnlineOrderingGuide.tsx`, `delivery-provider.ts`, `sms.ts`, `geo.ts`

### Post-Test Fixes (Color Transfer + Cards + Analytics)
- **Color transfer:** Onboarding passes AI-generated `result.config.colors` to preview URL params (not hardcoded #ce0707)
- **URL params priority:** preview/page.tsx checks `hasUrlColors` before falling back to Supabase colors
- **Random palettes:** 18 curated professional palettes in `CURATED_PALETTES` array, randomized on onboarding page load
- **AI color validation:** `validate_colors()` in app.py replaces default red/black with industry-appropriate colors (43 types mapped in `INDUSTRY_COLOR_DEFAULTS`)
- **Card layouts:** 5 entity-category layouts in CardView (financial=big dollar amount, people=avatar initials, task=checkbox, event=date badge, default=color bar)
- **StatCards variability:** `STAT_COUNT_OVERRIDES` allows 2-3 cards for entities like messages, notes, images
- **Analytics templates:** `getAnalyticsTemplate()` returns business-type-specific stat labels, top items, breakdown — 8 industry groups (restaurant, salon, fitness, service, real estate, legal, retail, default)
- **Chat prompt:** Missing feature requests get positive redirect ("That's on the roadmap! For now...")

### Foundation Sprint (6 Sprints — Complete)
- **Sprint 1:** Sonner toasts (`ui/Toaster.tsx`), FileAttachments component, `/api/attachments` route
- **Sprint 2:** TipTap RichTextEditor, DocumentEditor (full-page), PDF generator (`lib/pdf-generator.ts`)
- **Sprint 3:** CalendarView → FullCalendar, PipelineView → dnd-kit (DndContext, DragOverlay), deal value rollups
- **Sprint 4:** TableView bulk select + inline editing, CSV export (`lib/csv-export.ts`), bulk delete handler
- **Sprint 5:** Recharts analytics (BarChart, AreaChart), CSV Import modal, LinkedRecords component, `/api/links` route
- 26 npm packages installed: date-fns, clsx, sonner, @tiptap/*, @fullcalendar/*, @dnd-kit/*, recharts, jspdf, html2canvas, @tanstack/react-table, @tanstack/react-virtual, react-dropzone, papaparse, leaflet, react-leaflet, @types/leaflet

### Launch Blockers Sprint (6 Features — Complete)
- **1A Password Reset:** forgot-password page, reset-password page, auth callback handles `type=recovery`
- **1B Mobile Navigation:** TopBar "More" overflow for >5 tabs, bottom sheet, sub-tab horizontal scroll
- **2A Settings Tab:** `SettingsContent.tsx` — 6 sections (Business Info, Account, Billing, Notifications, Integrations, Danger Zone)
- **2B Booking Backend:** `/api/public/bookings` (POST with rate limit, overlap detection, client find-or-create, ref number)
- **3 ChaiBuilder Site Builder:** SiteEditor wrapper, SiteContent (pages CRUD), `/api/pages` routes, `/site/[subdomain]` public pages
- **4 Payment Processors:** Stripe Connect + Square OAuth, PaymentProcessor factory, AES-256-GCM encryption

### Website/Site Redesign (8 Batches — Complete)
- Removed ChaiBuilder from top nav → only via ToolsStrip globe icon
- SiteView component with Pages/Analytics sub-tabs
- SiteAnalytics with Recharts (traffic, visitors, sources)
- `site_projects` table, SiteWizard (3-step), multi-project support
- 4 custom ChaiBuilder widgets registered under "Red Pine" group:
  - `widgets/BookingWidget.tsx` — date picker, time slots, booking confirmation
  - `widgets/ProductGrid.tsx` — product/service cards with price and book button
  - `widgets/ContactForm.tsx` — dynamic form with data linking
  - `widgets/ReviewCarousel.tsx` — star ratings, auto-play carousel
- Floating AI chat bubble inside SiteEditor

### Freelancer Marketplace (5 Batches — Complete)
- **Batch 1:** Browse/hire freelancers, 8 demo freelancers, 10 demo gigs with cover images, 6 categories, 3-tier pricing
- **Batch 2:** OrderFlowModal (3-step: Requirements → Review & Pay → Confirmation), 10% platform fee
- **Batch 3:** MyOrders (buyer/freelancer tabs), OrderDetailModal (timeline, status transitions), OrderChat
- **Batch 4:** ReviewModal (5-star + text), milestones (create/complete), demo order data
- **Batch 5:** Gig card cover images (Unsplash), gig detail modal images
- Key files: `MarketplaceView.tsx`, `FreelancerMarketplace.tsx`, `marketplace/` directory

### Route Planner — Batch 1 (Complete)
- **New `'route'` ViewType** — 6th view mode added to union alongside table/calendar/cards/pipeline/list
- **Leaflet + react-leaflet** — OpenStreetMap tiles, no API key, `next/dynamic` with `ssr: false` for SSR safety
- **LeafletMap.tsx** — Reusable map wrapper with custom SVG divIcon markers (business=red pin, customer=gray dot, stop=numbered circle)
- **TerritoryDrawTool.tsx** — Polygon drawing on map (click to place vertices, double-click to close, Escape to cancel)
- **RouteView.tsx** — 40/60 split layout: route cards (left) + territory map (right). Hover card highlights territory polygon
- **RouteDetailModal.tsx** — CenterModal with 50/50 split: dnd-kit sortable stop list (left) + zoomed map with route polyline (right). "Add Stop" inline customer search
- **Dummy data** — 4 routes (North/South/Downtown/West) with territory polygons, 12 stops with lat/lon/service/duration, 15 customer pins (Minneapolis metro)
- **RouteStop type** — `{ id, customer_name, address, lat, lon, service_type?, estimated_duration?, order }`
- **3 Playwright tests passed** — Green Valley Landscaping (green), ProFlow Plumbing (orange), Sparkle Clean Maids (blue)
- **Libraries installed:** leaflet, react-leaflet, @types/leaflet

### Code Quality Sprint (Complete)
- **Extracted `getStatusBadgeStyle()`** — Duplicate function in CardView/ListView/TableView → shared `lib/badge-styles.ts`
- **Removed unused imports** — `getCardBorder` from ListView, `getHeadingColor` from TableView
- **Fixed TerritoryDrawTool key prop** — Array index `key={i}` → stable `key={lat_lon}`
- **Added error logging** — Silent `catch {}` blocks in useCustomFields, useUserRole, crud.ts logActivity now log with `console.warn()`
- **Fixed generic parameter** — `createCrudHandlers<T>()` → `createCrudHandlers<T = Record<string, unknown>>()`
- **Fixed 3 console 401 errors** — ViewRenderer used `!componentConfig.dataSource` as demo mode proxy (broken because demo page sets dataSource). Replaced with `useDataMode()` hook → `dataMode === 'dummy'`. PineTreeWidget always fetched `/api/growth` on mount even in demo mode — now skips fetch when `dataMode === 'dummy'`
- **0 TypeScript errors, 0 console errors** after all changes

### UI Architecture Overhaul
- **TopBar replaces Sidebar:** Horizontal top navigation with tab pills, responsive overflow
- **CenterModal system:** All popups use CenterModal (`ui/CenterModal.tsx`)
- **ToolsStrip:** Floating vertical toolbar with 5 buttons (Chat, Edit, Website, Marketplace, Marketing)
- **Marketing Hub:** Social Media, Live Chat, Analytics sub-tabs (moved from top nav to ToolsStrip)
- **StageManagerModal:** dnd-kit sortable drag reorder for pipeline stages

### Data-Linked Website Widgets (Complete)
- **DataSelector.tsx:** Reusable entity picker modal (forms, products, services, reviews) with search/filter
- All 4 widgets follow same pattern:
  - **Builder + no link:** Dashed placeholder with "Select X" button → opens DataSelector
  - **Builder + linked:** Header badge with name/metadata + dimmed preview + "Change" button
  - **Public + linked:** Full widget renders with linked data
  - **Public + no link:** Fallback to generic behavior
- Props stored as `linkedXxxId` + `linkedXxxName` in ChaiBuilder block schema (hidden from sidebar)
- ContactForm: 5 demo form definitions with unique field sets (intake, survey, medical, contact, booking request)
- ProductGrid: Category filtering by linked product selection
- BookingWidget: Service-specific booking with duration info
- ReviewCarousel: Source filtering (all, recent 30 days, 5-star only)

### Testing Results (45 Industries, 5 Rounds)
- **Round 1-2:** 20 industries — A average (correct business_name, business_type, 5-7 tabs, relevant components, 100% SVG icons)
- **Round 3:** 10 industries (vet, hotel, catering, dance, property, tattoo, yoga, bakery, moving, recruiting) — A average (4x A+, 3x A, 3x A-)
- **Round 4:** 10 industries (pet grooming, florist, crossfit, accounting, photography, food truck, tutoring, coworking, pest control, jewelry) — A average (4x A+, 6x A)
- **Round 5a:** 5 industries (3 restaurants + dog grooming + law firm) — A average, interactive CRUD tested (7 add-record operations all successful)
- **Round 5b:** 4 industries (tattoo studio, pet grooming, law firm, yoga studio) — A average (2x A+, 1x A, 1x A-), Staff Wizard tested E2E, analytics per-tab verified
- All configs: unique industry-appropriate colors, context-aware headings, legal-specific pipeline stages (New→Discovery→Trial→Closed), business-type analytics templates
- **Round 6:** 3 field-service industries (landscaping, plumbing, cleaning) — Route Planner E2E tested via Playwright, all 3 with unique theme colors (green, orange, blue), route cards + territory maps + detail modals all rendering correctly
- **37 total industries tested across 6 rounds — consistent A average**

---

# 10C. FOUNDATION SPRINT (Making Components Actually Work)

**Problem:** Sidebar/tab generation is A+ (45 industries tested), but components inside tabs are hollow CRUD displays. Only 12 npm packages. No rich text, no file upload, no PDF, no charts, no drag-drop library, no inline editing.

**Solution:** Install 23 npm libraries + 6-sprint build plan.

### Libraries Installed (Feb 11, 2026)
| Library | Purpose |
|---------|---------|
| date-fns | Date formatting (replaces 34 raw Date() calls) |
| clsx | Conditional Tailwind class merging |
| Sonner | Toast notifications (success/error/info) |
| TipTap (4 pkgs) | Rich text editor (documents, notes, contracts) |
| FullCalendar (4 pkgs) | Full calendar (create events, drag-drop, week/month/day) |
| dnd-kit (3 pkgs) | Smooth drag-drop (pipeline, reordering) |
| Recharts | Charts from real data (bar, line, pie) |
| jsPDF + html2canvas | PDF generation (invoices, reports) |
| Tanstack Table + Virtual | Data grid (inline edit, virtual scroll for 1000+ rows) |
| react-dropzone | File upload drag-drop zone |
| papaparse | CSV parsing for import/export |
| Leaflet + react-leaflet | Interactive maps (route planner, territory polygons, customer pins) |

### Sprint Plan
1. **Sprint 1**: Toasts (Sonner) + File Attachments (react-dropzone) + migration 005
2. **Sprint 2**: Rich Text Editor (TipTap) + Document Editor + PDF download + Contract Templates
3. **Sprint 3**: Calendar (FullCalendar) + Pipeline (dnd-kit) + Stage Management
4. **Sprint 4**: Table (Tanstack) + Inline Editing + Bulk Actions + Advanced Filters + CSV Export
5. **Sprint 5**: Linked Records + Analytics (Recharts) + CSV Import + Recurring Records
6. **Sprint 6**: Consolidate Supabase migrations → Diego applies SQL → E2E testing

### New Supabase Tables
- `record_attachments` — file attachments for any entity
- `record_links` — relationships between records
- Recurring records fields on invoices/appointments

### Phase B+ Roadmap (73 tasks, queued after Foundation Sprint)
Settings Tab, Site Tab/Website Builder, Password Reset, Mobile Sidebar, Landing Page, Stripe Connect, Forms Builder, Reviews, E-Sign, Social Media, Automations (n8n), Live Chat, AI Agents + Marketplace, Pine Tree Growth, Website Builder v2 (ChaiBuilder), Mobile App, and more.

### Phase B Feature: Calendar & Scheduling System
**Problem:** Appointments, classes, shifts, and routes are all "time" but need different handling. No staff assignment, no public booking backend, no round robin.

**Planned Architecture:**
- **Calendar Types:** 1-on-1 (appointments), Group (classes), Service Route (mobile businesses), Shift (employee scheduling)
- **Staff Assignment Modes:**
  - Round Robin: auto-rotate through available staff
  - Manual: owner assigns each appointment
  - Direct Booking: client picks staff from public booking page
  - Smart Calendar/AI Agent: AI assigns based on skills, location, availability
- **Location-Aware Scheduling:** For mobile businesses (pet grooming, landscaping, cleaning) — route optimization, service area zones, travel time buffers
- **Public Booking Backend:** Wire `/book/[subdomain]` UI to real data — available slots, staff selection, confirmation emails
- **Embeddable Widget:** `<iframe>` or `<script>` tag businesses can put on external websites
- **GoHighLevel-style Calendar Wizard:** Setup flow that asks calendar type, duration, buffer time, availability, staff assignment mode
- ~~**Multi-source Calendar View:** Pull from appointments + classes + shifts into one master calendar with color-coded event types~~ **DONE** — Universal Calendar with AddEventModal (2-step: pick type → fill form). Events are per-type (Appointment=blue #3B82F6, Class=purple #8B5CF6, Shift=green #10B981). Color priority: blocked → color_primary → event_type → buttonColor.

**Applies to:** ALL industries (especially salon, fitness, medical, legal, cleaning, landscaping, pet grooming, tutoring)

### Phase B Feature: Recurring Classes + Per-Instance Attendance
**Concept:** Calendar-based class management with per-instance RSVP and historical attendance tracking.

**The Flow:**
1. Owner creates a recurring class: "Sparring — Every Monday 5pm"
2. Calendar shows it repeating automatically (FullCalendar recurring events)
3. Each instance has its own attendee list + check-in status
4. **Client/parent portal:** Browse available classes → RSVP for specific instances
5. **Owner view:** Click any date/time → see who RSVP'd vs who actually checked in
6. **Historical:** Go back 2 months → click past Monday → see that instance's attendance record

**Why Not Pipeline for Classes:**
Pipeline = client journey (one person in ONE stage at a time). Classes = grouping (one person in MULTIPLE classes simultaneously). A student in Kickboxing AND Sparring AND Kata can't be in 3 pipeline columns at once — but they can RSVP to 3 recurring calendar events. Calendar is the natural home for classes because classes are time-based events.

**Key Insight — Pipeline vs Classes:**
| Concept | Pipeline (journey) | Calendar (classes) |
|---------|-------------------|-------------------|
| Student in... | ONE stage at a time | MULTIPLE classes at once |
| Movement | Linear progression | Join/leave freely |
| Question answered | "How far along is this student?" | "Who's in Tuesday night Sparring?" |
| Example | Belt rank: White → Black | Attendance: 8 RSVP'd, 6 checked in |

**For martial arts, the full component picture:**
| Component | View | Purpose |
|-----------|------|---------|
| Students | Pipeline (belt stages: White → Black) | Journey/progression |
| Classes | Calendar (recurring events) | Schedule + per-instance RSVP + check-in |
| Families | Contacts/List | Parent info, emergency contacts |

**What Needs Building:**
- Recurring event instance model (each occurrence = separate attendee list)
- Per-instance attendee tracking (expected vs checked-in)
- Check-in mechanism for owners (mark attendance on a specific instance)
- Portal-side RSVP (parent/student signs up for specific class dates)
- Attendance trends/analytics ("who stopped coming?", "avg class size over time")

**Applies to:** Martial arts, yoga studios, dance studios, gyms/CrossFit, tutoring centers, music schools — any business with recurring group sessions

### Phase B Feature: QuickBooks Integration
**Problem:** Small businesses already use QuickBooks for accounting. Red Pine needs to sync financial data bidirectionally.

**Planned Architecture:**
- **OAuth2 flow:** Connect QuickBooks account from Settings tab
- **Bidirectional sync:** Invoices, payments, expenses, customers ↔ QuickBooks
- **Webhooks:** Real-time updates when QB data changes
- **Data mapping:** Red Pine entities → QB entities (clients→Customers, invoices→Invoices, expenses→Purchases)
- **Sync dashboard:** Show sync status, last sync time, conflicts, manual re-sync button
- **Supported editions:** QuickBooks Online (not Desktop)

**Revenue impact:** Makes Red Pine viable for businesses already on QB — they don't have to choose, they get both.

---

# 11. DEVELOPMENT WORKFLOW

### Visual Development Loop (Playwright MCP)
1. Open design reference image (`design-reference/reference-dashboard.webp`)
2. Navigate to localhost:3000 with Playwright
3. Screenshot current state, save to `design-reference/screenshots/`
4. Compare to reference — identify gaps
5. Make code changes
6. Screenshot again after hot reload
7. Repeat until it matches the reference quality

### Trigger Phrases (Auto-Use Playwright)
- "check the dashboard" / "check the UI" / "look at"
- "the X is broken" / "fix the UI" / "doesn't look right"
- "compare to reference" / "make it look like"
- "check mobile" / "test responsive"
- "check hover on X" / "test the flow"

### Tools Installed
- Playwright MCP: Browser control, screenshots, click, hover, type, drag
- CLAUDE.md: Persistent project memory
- Design Reference: reference-dashboard.webp + DESIGN-SPEC.md
- Voice Input: macOS dictation for faster prompting

---

# 12. RED PINE OUTREACH (Parallel Revenue Stream)

AI agents prospect businesses with outdated websites, build demo redesigns, send personalized cold emails.

### The Two Agents

| Attribute | Eric Espinoza | Maria Santos |
|-----------|--------------|--------------|
| Age | Early 30s | Late 20s |
| Languages | English, Spanish | English, Portuguese (Brazilian) |
| Email | eric@redpine.dev | maria@redpine.dev |
| Volume | 10 sites/day | 10 sites/day |
| Tone | Casual, enthusiastic, confident | Warm, professional, detail-oriented |
| Background | Partner at Red Pine | Designer at Red Pine |

### Updated Flow (Jan 26 — Red Pine Sites Integration)
1. **Prospecting:** Schedule → Fetch leads (Google Maps) → AI extracts data → Google Sheets
2. **Selection:** AI scores leads by site quality (worse = better) → Pick top 20 → Assign to agents
3. **Site Generation:** Claude API → JSON config (not HTML code!) → Supabase → Preview URL (~10 sec/site)
4. **Email Outreach:** AI composes personalized email with preview link → Send via agent Gmail
5. **Reply Handling:** Webhook → Match to lead → AI responds per rules file → Auto-reply
6. **Post-Payment:** Stripe webhook → Create real account → Assign subdomain → Auto-go-live

### Pricing (Outreach Offer)
| Offer | Price | What They Get |
|-------|-------|--------------|
| First Year Special | $50/year | Complete site + Red Pine account + 10 credits |
| Renewal | $100/year | Same |
| Upgrade to Systems | +$90/month | Full platform (all components) + 20 credits |

### Revenue Projections (20 demos/day)
| Metric | Daily | Monthly |
|--------|-------|---------|
| Demos Sent | 20 | 600 |
| Replies (10%) | 2 | 60 |
| Sales (30% of replies) | 0.6 | 18 |
| Revenue @ $50 | $30 | $900 |
| With upsells (~$75 avg) | $45 | $1,350 |

### Reply Handling Rules
- **Interested:** Express excitement, ask what changes they'd want
- **Asks price:** "The base is $50 to finish what you see. Want me to make any changes first?"
- **Wants changes:** Note requests, explain credits, offer to include in base
- **Not interested:** "No worries at all! Preview will be there if you revisit."
- **Skeptical:** "I'm [Eric/Maria], I work with Red Pine — we build websites for small businesses."
- **Ready to buy:** Send Stripe payment link ($50)

### Stack
| Component | Tool |
|-----------|------|
| Orchestration | n8n |
| AI (selection, email) | Claude API |
| AI (site generation) | Claude API (JSON config, not code) |
| Storage (data) | Google Sheets |
| Storage (sites) | Supabase |
| Rendering | Red Pine Sites (28-component library) |
| Email | Gmail (2 accounts) |
| Payment | Stripe |

---

# 13. RED PINE AGENCY (Closer/Setter System)

Full agency PRD designed Jan 27, 2026 — separate Next.js app for managing outreach at scale.

### Concept
- **Setters** (AI agents: Eric + Maria) — Find leads, build demos, send emails, handle replies
- **Closers** (human sales reps) — Take warm appointments, close deals, earn commission
- **Admin** (Diego) — Oversees everything, manages closers, tracks revenue

### Closer Tier System
| Tier | Access | Requirements |
|------|--------|-------------|
| Tier 1 (New) | Dashboard, calendar, assigned leads, pipeline | Default on signup |
| Tier 2 (Proven) | + Conversation history, follow-ups, rejected pool, email | 5+ deals or admin promotion |

### Key Tables
- `closers` — id, user_id, name, tier, territory, industries, deals_closed, deals_this_month, quota, warnings
- `leads` — id, business_name, industry, website, status, assigned_closer, cooling_until
- `appointments` — id, lead_id, closer_id, scheduled_at, status, notes
- `deals` — id, lead_id, closer_id, amount, plan, status, stripe_payment_id
- `conversations` — id, lead_id, setter_id, messages (jsonb), status
- `setter_logs` — id, setter_id, action, lead_id, details
- `notifications` — id, user_id, type, title, message, read

### Lead Status Flow
`new` → `contacted` → `replied` → `appointment_set` → `pitched` → `closed` / `rejected`
If rejected → `cooling` (3 weeks) → `recycled` → re-assigned to Tier 2

### n8n Workflows
1. **Prospecting** — Daily lead sourcing
2. **Site Generation** — Claude API → JSON config → deploy
3. **Email Outreach** — Personalized send via agent Gmail
4. **Reply Handler** — Webhook, parse, auto-respond
5. **Appointment Booking** — Match closer by territory/industry
6. **Post-Payment** — Stripe webhook → fulfillment tasks
7. **Cooling/Recycle** — Daily cron for lead recycling

### Build Phases
| Phase | Days | Focus |
|-------|------|-------|
| 1: Foundation | 1-2 | Next.js + Supabase + Auth + Layout |
| 2: Closer Dashboard | 3-4 | Stats, calendar, leads, pipeline |
| 3: Admin Dashboard | 5-6 | Full overview, closer management |
| 4: Tier 2 Features | 7 | Conversations, follow-ups, email |
| 5: Public Pages + Payments | 8-9 | Preview renderer, Stripe checkout |
| 6: n8n Automation | 10-11 | All 7 workflows |
| 7: Polish + Deploy | 12-14 | Mobile, errors, deploy |

---

# 14. SALES OPERATIONS

### Sales Rep Model
- Reps only close — no fulfillment, no tech, no copy
- Weekly payouts via Upwork (Wednesdays)
- Deals tracked in Google Sheets

### Commission Structure
| Plan | Price | Commission-Only Rep | Hourly Rep |
|------|-------|-------------------|-----------|
| Side Hustle | $75 | $25 | $0 |
| Small Business | $175 | $75 | $50 |
| Growing Business | $575 | $250 | $175 |
| Established | $1000+ | 50% | 35% |

### Plan Tiers (Sales Templates)
**Side Hustle ($75):** One-page website, mobile-friendly, booking form/contact button, one-time setup, no monthly fees, live in 2-4 days

**Small Business ($175):** 2-3 page website, online booking calendar, Red Pine CRM dashboard, payments portal, client pipeline, $25/mo software, setup in 3-5 days

**Growing Business ($575):** Multi-page (up to 5), booking calendar, CRM, payments + reminders, lead pipeline, reputation system, 1 custom automation, $50/mo software

**Established ($1000+):** Fully custom, priced to scope

### Outreach by Business Type
1. **Walk-In + Appointment:** "Even a one-pager helps people check hours and reviews"
2. **Appointment-Based:** "Booking's built-in, no extra apps"
3. **Project-Based:** "Photos, reviews, quote form — sends leads to your phone"
4. **Office/Professional:** "We automate bookings & reminders"
5. **Brick-and-Mortar:** "One clean site with map, reviews & follow-ups = more foot traffic"

### Key Objection Handling
| Objection | Response |
|-----------|----------|
| "Too small for that" | "That's why we built our side hustle plan — simple and worthwhile." |
| "I'll think about it" | "Totally fair — can I show you a mock-up for 15 minutes tomorrow?" |
| "I already have a site" | "Are you proud of how it reflects your business?" |
| "Not tech-savvy" | "You won't touch tech — we handle it all." |
| "Can't pay every month" | "Our plans cater to each business. 15 minutes to show you?" |

---

# 15. MISSING COMPONENTS ANALYSIS

### High Priority — ALL COMPLETE
- **Public Booking / Online Scheduling** — ✅ COMPLETE (`/book/[subdomain]` + `/api/public/bookings` with overlap detection)
- **Analytics / Reporting Dashboard** — ✅ COMPLETE (8 business-type templates + per-tab Recharts)
- **Website Builder** — ✅ COMPLETE (ChaiBuilder, 4 custom data-linked widgets, SiteWizard, multi-project)
- **Settings Tab** — ✅ COMPLETE (6 sections: Business Info, Account, Billing, Notifications, Integrations, Danger Zone)
- **Password Reset** — ✅ COMPLETE (forgot-password + reset-password pages)
- **Mobile Navigation** — ✅ COMPLETE (TopBar with overflow "More" button, bottom sheet)
- **Payment Processors** — ✅ COMPLETE (Stripe Connect + Square OAuth)
- **Freelancer Marketplace** — ✅ COMPLETE (browse, hire, orders, messaging, reviews, milestones)
- **Marketing Hub** — ✅ COMPLETE (Social Media, Live Chat, Analytics sub-tabs)

### Medium Priority (Post-Launch Phase B)
- **Forms Builder** — ❌ NOT STARTED. Integration: Formbricks
- **Reviews / Reputation** — ❌ NOT STARTED
- **E-Sign / Digital Waivers** — ❌ NOT STARTED. Integration: OpenSign
- **Automations** — ❌ NOT STARTED. Integration: n8n
- **Landing Page** — ✅ NOT NEEDED (onboarding page IS the landing page — users land on AI chat directly)

### Also Needed (Phase B+)
- **Notifications Center** — In-app bell icon + notification drawer
- **Activity Feed / Audit Log** — Track who changed what
- **Customer Portal** — Clients log in to see their data
- **Custom Fields** — Users add own fields to entities

### Launch Recommendation
Platform is functionally complete. Deploy after: applying 12 Supabase migrations, visual polish pass, landing page.

---

# 16. FUTURE VISION

- **Pine Tree Growth System** — Pixel-art tree grows as business grows (Seed → Sprout → Sapling → Pine → Mighty Pine)
- **AI Agents ($5-50/mo)** — Receptionist, Content Writer, Review Manager, Route Planner, Bookkeeper
- **The Forest (Community)** — Business owners growing together. Mighty Pines mentor Sprouts. Leaderboards
- **Growth Courses** — Skill trees: Sales, Marketing, Operations. AI recommends based on user data
- **Template Marketplace** — Users share configs. Clone and customize. Revenue share
- **Multi-Business Support** — One user, multiple pine trees. Forest view
- **API Access** — REST API for Pro users to integrate with external tools
- **Red Pine Print** — Physical goods (signs, merch, stickers) shipped to users
- **Mobile App** — React Native (future)
- **White-label** — Agencies rebrand Red Pine for their clients

### Phase C: Gallery System — BUILT ✅ (Feb 18, 2026)
**Built:** Full gallery system — DB tables (gallery_albums + gallery_images), authenticated API (upload/CRUD/reorder), public API, GalleryManager (iOS Photos-style Albums + All Photos views, masonry grid, lightbox, upload wizard), GalleryWidget for ChaiBuilder, ensure_gallery() post-processing for visual industries. 8/8 industries tested.

### Phase C: Industry Templates + Locked Components (Family 1 COMPLETE ✅)
**Problem:** AI generates configs from scratch every time. No skeleton to start from. Essential components randomly get omitted — gallery missing from nail salons, staff missing when they have 3 techs, pipeline stages generic instead of industry-specific. Every generation is a dice roll.

**Insight from Diego:** "The config should be based off the enterprise version of that business. The AI should SUBTRACT what the user doesn't need, not try to BUILD from nothing."

**Design principle:** Build templates enterprise-first (20-tech nail salon with 3 locations), then solo operators naturally use fewer features. The AI trims, never builds from scratch.

**Architecture:**

```
Template (enterprise skeleton) → AI customizes → Post-processing validates locked components
```

**Template = JSON config with locked flags:**
```json
{
  "industry": "nail_salon",
  "aliases": ["nail tech", "nails", "nail art", "gel nails", "acrylics"],
  "tabs": [
    { "label": "Dashboard", "components": [
      { "id": "calendar", "locked": true },
      { "id": "clients" }
    ]},
    { "label": "Clients", "components": [
      { "id": "clients", "locked": true, "pipeline_type": "booking" },
      { "id": "contacts" }
    ]},
    { "label": "Schedule", "components": [
      { "id": "calendar", "locked": true },
      { "id": "appointments", "locked": true }
    ]},
    { "label": "Services", "components": [
      { "id": "packages" },
      { "id": "products" }
    ]},
    { "label": "Gallery", "components": [
      { "id": "galleries", "locked": true }
    ]},
    { "label": "Staff", "components": [
      { "id": "staff" },
      { "id": "shifts" }
    ]},
    { "label": "Payments", "components": [
      { "id": "invoices", "locked": true },
      { "id": "payments" }
    ]}
  ]
}
```

**Locked = AI cannot remove it.** Solo tech says "just me" → AI removes Staff tab. But Gallery, Calendar, Pipeline, Invoices stay no matter what.

**Gallery placement: Its own tab (Diego's decision — easier to access)**

Gallery is always its own tab in the TopBar for visual businesses. Never buried as a subtab.

**Gallery also appears inside the Website tab** when the GalleryWidget is on the site:
- **Visual businesses (nail, barber, tattoo, etc.):** Gallery tab pre-configured + GalleryWidget auto-added to site → gallery management shows in both Gallery tab AND Website tab
- **Non-visual businesses (lawyer, consulting, etc.):** No Gallery tab by default. User can add GalleryWidget via ChaiBuilder editor → gallery management appears in Website tab only after they add it
- Both read from the same `gallery_images` + `gallery_albums` tables — upload once, shows everywhere

**6 Template Families (not 15 individual templates):**
Industries within a family share 90% of the same tabs. Build one base per family, AI applies 1-2 tweaks per industry.

**Family 1: Beauty & Body Services — BUILD FIRST**
Base: Dashboard, Clients (booking pipeline), Schedule, Services, Gallery, Payments, Settings
- Nail salon / nail tech — base
- Barber / barbershop — base
- Hair salon / stylist — base
- Lash / brow tech — base
- Makeup artist — base
- Tattoo / piercing — base + Waivers, Portfolio alongside Gallery
- Spa / massage — base, maybe +Rooms
- Med spa — base + Waivers, +Treatments
- Pet grooming — base + Waivers, Clients = "Pets & Owners"

**Family 2: Food & Hospitality** (build after testing)
Base: Dashboard, Reservations, Menu, Orders, Gallery, Staff, Payments, Settings
- Restaurant, Bakery (no reservations), Cafe, Food truck (+Routes), Catering (+Events/Guests), Bar (+Events)

**Family 3: Field Services** (build after testing)
Base: Dashboard, Customers (jobs pipeline), Schedule, Jobs, Gallery, Fleet, Payments, Settings
- Landscaping, Cleaning (no Fleet), Plumbing/HVAC (+Estimates), Auto detailing, Pest control, Roofing (+Estimates)

**Family 4: Professional Services** (build after testing)
Base: Dashboard, Clients (sales pipeline), Schedule, Projects, Payments, Settings — NO Gallery tab (add via website editor)
- Law firm (+Cases/Contracts/Time tracking), Consulting (+Contracts), Accounting (+Documents), Recruiting (+Cases), Real estate (+Properties/Listings)

**Family 5: Fitness & Education** (build after testing)
Base: Dashboard, Members, Schedule (classes), Gallery, Payments, Settings
- Gym (+Attendance), Martial arts (+Attendance/Progress/Waivers), Yoga/Dance (+Attendance), Tutoring (+Students/Progress), Music school (+Students)

**Family 6: Retail & E-commerce** (build after testing)
Base: Dashboard, Products, Orders, Inventory, Payments, Settings — NO Gallery tab by default
- Retail store, E-commerce (+Shipping), Florist (+Gallery/Events)

**Build order:** Family 1 first (beauty/body) — this is Diego's most tested area. Other families get built after Diego tests the platform from the perspective of those business owners (retail, law, restaurant, etc.) to identify what's actually missing.

**How the AI uses templates:**
1. `/check-input` determines business type → maps to a template family via alias list
2. Template is injected into the `/configure` prompt as the starting point
3. AI instructions: "Start from this template. Customize labels, add components the user mentioned, remove UNLOCKED components they don't need. NEVER remove components marked locked."
4. Post-processing: `validate_locked_components()` — if any locked component is missing, re-inject it
5. Fallback: if no template matches, fall back to current build-from-scratch behavior
6. Result: consistent, industry-appropriate configs every time

**What this replaces:**
- The current 7,500-token "build from scratch" prompt gets simplified
- MUST USE rules become unnecessary (templates enforce them)
- `ensure_gallery()` becomes unnecessary (templates include it)
- `consolidate_calendars()` still needed (calendar view dedup)
- `transform_pipeline_stages()` still needed (stage formatting)

**Open questions (resolve during Family 1 build):**
- Template selection: AI picks family, or hardcoded alias map?
- Website tab gallery: auto-detect GalleryWidget on site, or config flag?
- What happens when user adds/removes tabs via chat editor after generation?

**Revenue impact:** Every user gets a polished, enterprise-grade config on first try. No more "oh it didn't generate Gallery, let me try again." Conversion goes up because the platform immediately looks like it was built for them.

### Phase C: AI-Generated Websites
**Problem:** Most users (especially on mobile) won't use the ChaiBuilder drag-and-drop editor. They expect a website to just exist when they sign up.

**Solution:** During onboarding, AI generates a full website alongside the dashboard config. The system already knows: business name, type, colors, logo, tabs/components. That's enough to build a solid site.

**Approach — Template-based first:**
1. 5-10 pre-built ChaiBuilder page templates per industry category (service, restaurant, retail, professional, creative)
2. AI picks the best template, swaps in business name, colors, logo, relevant sections
3. Website is live at `{business}.redpine.systems` immediately after signup
4. User can still customize via ChaiBuilder later if they want
5. Gallery widget auto-populated if gallery component exists in config

**Why template-based > full AI generation:** Layouts need to be responsive and polished. AI-generated HTML/JSON has layout bugs. Templates guarantee quality, AI just fills in content.

**Revenue angle:** "You're getting a website + the system that backs it. 14-day free trial, then $29/mo." The website alone would cost $500-2000 from a freelancer.

### Phase C: Subdomain Routing for Business Websites
**Structure:**
- `app.redpine.systems` → Dashboard (login, manage your business)
- `{business}.redpine.systems` → Public website + portal + booking + ordering

**Technical:**
- Wildcard DNS on `*.redpine.systems` (Cloudflare supports this)
- Next.js middleware reads subdomain, routes to correct business's site data
- `subdomain` field on business config = their public URL
- Same pattern as Shopify (`admin.shopify.com` vs `yourstore.myshopify.com`)

### Phase C: 14-Day Free Trial
- Add `trial_period_days: 14` to Stripe checkout session
- Website is live during trial — if they're running their business on it, they convert
- Stripe handles trial expiration and first charge automatically

### Phase C: Dashboard Onboarding Tour (Post-Launch Polish)
**Problem:** New users land on their dashboard and don't know what anything does.

**Solution:** First-login guided walkthrough:
- Step-through modal or highlighted overlay
- Each step highlights a toolbar button / tab / feature
- Content is dynamic based on the user's config (different tabs = different tour)
- "Welcome! Here's your platform. Let's walk through it."
- Dismissible, can re-trigger from Settings

**Priority:** Lower than gallery/website/trial — this is retention, not conversion.

### Phase C: Booking Pipeline for Service Businesses
**Problem:** AI generates client pipelines like "New → Regular → VIP → Ambassador" for solo nail techs, barbers, tattoo artists. That's a loyalty progression, not a daily workflow. It doesn't help them run their day.

**Solution — Two pipelines for appointment-based service businesses:**

**Primary: Booking Pipeline (operational — daily use)**
| Stage | Meaning |
|-------|---------|
| Clients | Full client list — everyone lives here |
| Booked | Has upcoming appointment |
| Confirmed | Confirmed / deposit paid |
| In Chair | Currently being served |
| Completed | Done, ready for follow-up |
| Rebook | Needs re-engagement for next visit |

**Secondary: Rewards Pipeline (relational — client value over time)**
| Stage | Meaning |
|-------|---------|
| New | First-time client |
| Regular | 3+ visits |
| VIP | 10+ visits or high spend |
| Ambassador | Refers others, loyalty member |

**AI logic — this is NOT universal, only for booking-based businesses:**
- **Booking pipeline:** salon, barber, tattoo, nails, lash, massage, spa, pet grooming, auto detailing, cleaning, mobile car wash
- **Sales/journey pipeline:** agencies, recruiting, consulting, SaaS — keep Lead → Proposal → Negotiation → Closed
- **Legal pipeline:** law firms — keep New → Discovery → Trial → Closed
- **Real estate pipeline:** keep Lead → Showing → Offer → Closing
- **Medical pipeline:** keep Intake → Treatment → Follow-up → Discharged
- The AI already knows the business type from onboarding — it picks the right pipeline automatically

**Design principle:** Build industry templates enterprise-first (20-employee salon with 3 locations), then solo operators naturally use fewer features.

### Phase C: Multi-Language Onboarding
**Problem:** Non-English speakers land on Red Pine and can't use the AI chat effectively.

**Solution (minimal effort, huge reach):**
1. **Placeholder text:** "Describe your business in any language / Describa su negocio en cualquier idioma / Descreva seu negócio em qualquer idioma"
2. **System prompt rule:** "Always respond in the same language the user writes in"
3. Claude already speaks 50+ languages fluently — this is nearly free

**Result:** Someone types in Spanish → entire onboarding, questions, config labels come back in Spanish. Dashboard UI stays English for now, but the onboarding barrier is gone.

### Phase C: Visual Previews in Chat (Screenshots During Onboarding)
**Problem:** When the AI suggests "I think a pipeline system would work great for managing your clients," the user has no idea what a pipeline looks like. Most people signing up have never seen a CRM, pipeline, or dashboard — photos paint the picture in their heads.

**Phase 1 — Industry-specific screenshot library:**
1. Capture screenshots per **industry + view type** combination, not just generic views
2. Pipeline screenshots: booking pipeline (barber/nails/tattoo), sales pipeline (agency/recruiting), legal pipeline (law firm), etc.
3. Calendar screenshots: appointment-based (salon), class-based (martial arts/yoga), shift-based (restaurant)
4. Table/cards/gallery screenshots: per industry context
5. AI picks the RIGHT screenshot for the business type — barber sees booking pipeline, not a sales funnel
6. Frontend renders images inline in chat bubbles
7. "I think an all-in-one calendar best suits your needs — here's what it looks like: [calendar screenshot]. What do you think?"

**Screenshot categories needed:**
| View Type | Industry Variants |
|-----------|------------------|
| Pipeline | Booking (barber/nails/tattoo), Sales (agency/recruiting), Legal (law), Real Estate (listings), Medical (patient journey) |
| Calendar | Appointments (salon), Classes (martial arts/yoga), Shifts (restaurant), Mixed (multi-type) |
| Table | Inventory (retail), Menu (restaurant), Products (e-commerce), Clients (professional) |
| Cards | Staff (salon), Portfolio (creative), Properties (real estate) |
| Gallery | Food (restaurant), Work samples (nails/tattoo/landscaping), Listings (real estate) |

**Phase 2 (goal) — Live mini-previews:** Actually render interactive preview components inline in chat. Way harder but the ultimate UX.

**Impact:** Massively improves conversion. Seeing > reading. A nail tech who sees the calendar with color-coded appointments immediately gets it.

---

# 17. OPEN SOURCE INTEGRATIONS

| Tool | Purpose | Repo |
|------|---------|------|
| Cal.com | Appointment booking | cal.com/cal.com |
| OpenSign | Digital signatures | OpenSignLabs/OpenSign |
| n8n | Workflow automation | n8n-io/n8n |
| Listmonk | Email marketing | knadh/listmonk |
| Chatwoot | Customer messaging | chatwoot/chatwoot |
| Plausible | Privacy-first analytics | plausible/analytics |
| Lago | Usage-based billing | getlago/lago |
| Formbricks | Custom forms | formbricks/formbricks |

---

# 18. FULL DEVELOPMENT TIMELINE

| Date | Day | Key Events |
|------|-----|-----------|
| Jan 20 | 0 | Project started. Vision defined. Ralph automation created |
| Jan 22 | 2 | Master Plan v1. Phases 1-2C complete. Supabase configured. Outreach plan v1 |
| Jan 23 | 3 | Phases 3-4 complete (credits + Stripe). Master Plan v2 |
| Jan 24 | 4 | Phase 5A complete (onboarding). Open questions documented. Master Plan v3 |
| Jan 26 | 6 | Outreach v2 — Maria Santos added, Red Pine Sites integration, JSON not HTML |
| Jan 27 | 7 | Agency PRD complete — full closer/setter system with Supabase schema |
| Jan 29 | 9 | PIVOT: Odoo 18 discovered. Flask + Next.js split. OS Complete Master doc. 328 modules |
| Jan 30 | 10 | Flask onboarding + AI chat + config gen + Next.js dashboard + Stripe checkout |
| Jan 31 - Feb 1 | 11-12 | Pine Tree system, AI Agents marketplace, open source research, pricing iterations |
| Feb 2 | 13 | Component architecture refactor (28 components, tabs-as-containers), color system, Build Homework |
| Feb 3 | 14 | Claude Code completed B1-B9, Supabase full stack, Stripe webhooks, Resend emails, Brain v1, Brain v2 |
| Feb 4 | 15 | F6 versioning, CC colors via chat, F4 CRUD (9 entities), F7 subdomain routing, 30/30 checkpoint, Brain v3 |
| Feb 7 | 16 | F1 views (all 5 renderers), F4 data wiring (hooks + UI), Playwright MCP, UI redesign sprint, Brain v4 |

---

# 19. DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 20 | Next.js + Supabase + Ralph | Fast iteration, autonomous AI coding |
| Jan 22 | 7 universal categories model | Every business is the same 7 things |
| Jan 24 | n8n for automations | Open source, self-hosted, user-facing later |
| Jan 26 | Maria Santos as Agent 2 | Portuguese, warm tone, different from Eric |
| Jan 26 | JSON config not HTML for outreach | Faster, cheaper, consistent quality |
| Jan 27 | Closer/Setter agency model | Scale outreach with human closers + AI setters |
| Jan 29 | Odoo 18 as backend | 328 modules, leverage existing ERP |
| Jan 30 | Flask + Next.js split | Python for AI, React for dashboard |
| Feb 2 | Components over categories | Flexible tabs as containers, not rigid categories |
| Feb 3 | Odoo NOT primary data source | Supabase handles all data, Odoo is future integration |
| Feb 4 | Flat $29/mo pricing | Platform is hook, agents are revenue |
| Feb 4 | The Brain document | Solve context loss across sessions |
| Feb 4 | redpine.systems domain | business.redpine.systems for subdomains |
| Feb 4 | Remove color theme presets | Users pick colors directly or via chat |
| Feb 4 | 9 CRUD entities instead of 7 | More granular, better for component model |

---

# 20. ENVIRONMENT & CREDENTIALS

### Environment Variables (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# Resend
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=https://app.redpine.systems
NEXT_PUBLIC_SITE_URL=https://redpine.systems
```

**WARNING:** Never commit .env.local to git!

---

# 21. STANDING RULES

### Session Protocol
- Update The Brain after every work session
- Re-share this file at the start of every new Claude chat
- Diego handles all UI/design. PRDs focus on backend logic only
- No rush. Build it right. Structure and foundation first
- Test with real business owners when core flow works end-to-end

### Startup Commands
```bash
# Terminal 1: PostgreSQL (if using local)
/usr/local/opt/postgresql@15/bin/pg_ctl -D /usr/local/var/postgresql@15 start

# Terminal 2: Odoo (optional — not primary anymore)
cd ~/redpine-os && source venv312/bin/activate && ./odoo-bin --addons-path=addons -d redpine_dev

# Terminal 3: Flask Onboarding
cd ~/redpine-os/onboarding && source ../venv312/bin/activate && python app.py

# Terminal 4: Next.js Dashboard
cd ~/redpine-os/dashboard && npm run dev
```

**Access URLs:**
- Onboarding: http://localhost:5001
- Dashboard: http://localhost:3000
- Odoo Admin: http://localhost:8069 (admin/admin)

---

# 22. DIEGO'S CONTEXT

- 22 years old
- Founder & Co-CTO of Red Pine
- No longer at Walmart (fired over attendance technicality)
- Financial pressure — this is the lifeline, not a side project
- Ultimate goal: Red Pine funds Red Pine Studios (filmmaking)
- Working with AI tools: Claude (building), Gronk (research), Ralph (automation)
- Screenplay project: "Bloodhound" (separate creative work)
- Also has client: Juan Lopez Concrete / Big J's Concrete

### Success Metrics
- Survival: 8 customers = ~$800/mo
- Freedom: 30 customers = ~$3,000/mo
- Scale: 100 customers = ~$12,000/mo

---

# HOW TO USE THIS DOCUMENT

1. **New session:** Share this file with any new Claude chat: "I'm building Red Pine OS. Here's my brain doc. I need help with [task]."
2. **After work:** Update the Checkpoint Log at the top with what changed
3. **Every other day:** Review the Progress Map and update percentages
4. **Major decisions:** Add to the Decision Log
5. **Architecture changes:** Update the relevant section

---

> RED PINE OS — From Seed to Mighty Pine
> Brain v7 | February 14, 2026 | Day 25
> ~94% Complete | Deploy Sprint Active
> "The bricks are ours. The house is yours."
