# RED PINE OS — THE BRAIN
## Living Context Document | Single Source of Truth
**Founder:** Diego Rodriguez — Co-CTO, Red Pine (Age 22)
**Started:** January 20, 2026
**Last Checkpoint:** February 18, 2026 — Day 29
**Overall Progress:** ~94% Complete (Core Platform) — Launch Sprint ACTIVE
**Tagline:** "The bricks are ours. The house is yours."

---

# CHECKPOINT LOG
> Update this section every other day or when significant progress is made.
> Format: Date | Day # | What changed | What's next

| Date | Day | Status | Key Progress | Next Steps |
|------|-----|--------|-------------|------------|
| Feb 14 | 25 | Route Planner + Code Quality | Route Planner Batch 1: new `'route'` ViewType (6th view), Leaflet map with territory polygons + customer pins, dnd-kit sortable stop list, RouteDetailModal. Code Quality Sprint: extracted duplicate `getStatusBadgeStyle()` to shared `badge-styles.ts`, removed unused imports, fixed console 401 errors. 3 Playwright tests passed. 0 TypeScript errors, 0 console errors. | Supabase migrations, deploy, landing page |
| Feb 17 | 28 | Phase C Planning | Gallery system, AI-generated websites, booking pipeline, multi-language chat, visual previews in onboarding — all added to Brain. Gallery build starting. | Build Gallery system end-to-end |
| Feb 18 | 29 | Gallery + Templates Family 1 | Gallery system (13 steps). Cost optimization (Haiku chat, 10-msg cap). **Industry Templates Family 1 (Beauty & Body)**: template module (`templates/registry.py`, `beauty_body.py`), enterprise-first skeleton with locked components, 10 industry subtypes (nail_salon, barbershop, hair_salon, lash_brow, makeup_artist, tattoo, spa, med_spa, pet_grooming, salon), template-aware `/configure` route, `validate_locked_components()` safety net, 16 unit tests (all pass), 5 live API tests (all pass), Playwright E2E verified. Solo operators get Staff tab removed, enterprise keeps it. Locked components (calendar, clients, gallery, invoices, appointments) always present. Non-beauty industries fall back to existing build-from-scratch. | Test more industries, build Family 2-6 |
| _next_ | _ | ________________ | ________________________________________________ | ________________ |

---

# CURRENT STATUS

## Progress Map (as of Feb 18, 2026)

**All core features COMPLETE** — Backend (B1-B9), Frontend (F1-F8, CC), 74 components, smart onboarding, Stripe payments, analytics, booking, ordering, restaurant system, site builder, freelancer marketplace, marketing hub, route planner, gallery system, Industry Templates Family 1, code quality sprint, and more. See Completed Build Phases below for details.

| Area | Status | % Done |
|------|--------|--------|
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

## Current Stack

| Service | Port | Technology | Role |
|---------|------|-----------|------|
| Database | — | Supabase (PostgreSQL) | Data storage, auth, realtime |
| Backend | 5001 | Flask + Claude API | AI chat, config generation |
| Dashboard | 3000 | Next.js + React + Tailwind | UI, preview, editing |
| Payments | — | Stripe | Subscriptions, checkout |
| Email | — | Resend | Transactional emails |
| Domain | — | redpine.systems | *.redpine.systems for subdomains |

### Domain & URL Structure
- **Root domain:** `redpine.systems` — serves the onboarding/landing page (AI chat)
- **Client subdomains:** `businessname.redpine.systems` — each client gets their own subdomain
- **Website pages:** `businessname.redpine.systems/home`, `/about`, `/services`, `/contact`, etc.
- **Public booking:** `businessname.redpine.systems/book`
- **Public ordering:** `businessname.redpine.systems/order`
- **Dashboard:** `app.redpine.systems`

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

Expanded from 28 to 68 (Phase 1A) to 74 (Restaurant System). Tabs are custom containers (any name, any icon). Components are building blocks inside tabs.

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

---

# 4. THE 6 VIEW MODES

Every component can display in multiple view formats. Default assignments are defined in `view-registry.ts`.

| View | Purpose | Default For |
|------|---------|------------|
| Table | Spreadsheet grid, sortable columns | products, invoices, payments, expenses, staff, vendors |
| Cards | Responsive visual grid, dual-color bar | staff, projects, equipment, reviews, images |
| Pipeline | Kanban columns, drag between stages | clients, leads, jobs, workflows |
| Calendar | Day/week/month time grid | appointments, schedules, shifts, calendar |
| List | Compact vertical stack, checkboxes | todos, messages, notes, announcements |
| Route | Territory map + stop list, Leaflet | routes |

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
3. If vague, AI asks clarifying questions
4. If detailed, AI generates config immediately
5. "Platform Ready!" screen with summary
6. Clicks "Launch Dashboard" — preview with dummy data
7. Chat panel on left — edit tabs, components, colors
8. Explore all views (table, cards, pipeline, calendar, list)
9. "Save & Launch" — Stripe checkout ($29/mo)
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
| Platform | $29/mo | Full platform, real data, all components, all views, subdomain |
| AI Agents | $5-50/mo each | Receptionist, Content Writer, Review Manager, Route Planner, Bookkeeper |

### Revenue Math
- Cost per paid user: ~$0.40-1.00
- Revenue per paid user: $29/mo base + $20 avg agents = $49/mo
- Break-even: 8 customers = ~$400/mo survival
- Freedom number: 30 customers = ~$1,500/mo
- Target: 100 customers = ~$5,000/mo

---

# 9. COMPLETED BUILD PHASES

- **Phase 1A:** 74 components registered across 5 config files (view-registry, entity-fields, dummy-data, StatCards, component-registry)
- **Phase 2:** Smart onboarding — AI generates 10-key color palettes, view assignments, pipeline stages with `transform_pipeline_stages()`, MUST USE component rules
- **Phase 3:** SaveLaunchPopup $29/mo paywall, `canEdit` boolean replaces `editsRemaining` counter
- **Phase 4:** Analytics (6-month revenue chart, client growth, per-tab Recharts), public booking page `/book/[subdomain]`, dummy data gaps resolved
- **Phase 5:** Logo upload to Supabase Storage, context-aware section headings, business name in sidebar
- **Phase 6:** Vercel config (`dashboard/vercel.json`), Railway config (`onboarding/Procfile`, `railway.json`)
- **Phase 7:** Terms/Privacy pages, 404/error pages, rate limiting (chat 20/min, config POST 10/min)
- **Restaurant System (7 Batches):** Staff/roles, online ordering, kitchen ops, SMS/delivery/loyalty, waitlist/tip pools/waste log/suppliers/POs, delivery modal, ROI calculator — 74 total components
- **Post-Test Fixes:** Color transfer from onboarding to preview, 18 curated palettes, AI color validation (43 industries), 5 card category layouts, analytics templates (8 industry groups)
- **Foundation Sprint:** 26 npm packages installed (TipTap, FullCalendar, dnd-kit, Recharts, Tanstack Table, jsPDF, react-dropzone, papaparse, Leaflet), 6 sprints — all components functional
- **Launch Blockers Sprint:** Password reset, mobile nav (TopBar overflow), settings tab (6 sections), booking backend (overlap detection), ChaiBuilder site builder, Stripe Connect + Square OAuth
- **Website/Site Redesign (8 Batches):** SiteView, SiteAnalytics, site_projects, SiteWizard, 4 custom ChaiBuilder widgets (BookingWidget, ProductGrid, ContactForm, ReviewCarousel), floating AI chat in editor
- **Freelancer Marketplace (5 Batches):** Browse/hire, OrderFlowModal, MyOrders, reviews/milestones, gig cover images
- **Route Planner:** 6th ViewType (`route`), Leaflet maps, territory polygons, dnd-kit sortable stop list, RouteDetailModal
- **Code Quality Sprint:** Extracted shared `badge-styles.ts`, removed unused imports, fixed console 401 errors, 0 TypeScript errors
- **UI Architecture Overhaul:** TopBar replaces Sidebar, CenterModal system, ToolsStrip (5 buttons), StageManagerModal with dnd-kit
- **Data-Linked Website Widgets:** DataSelector entity picker, all 4 widgets follow builder/public + linked/unlinked pattern
- **Universal Calendar:** AddEventModal (2-step: pick type then fill form), event types color-coded (Appointment=blue, Class=purple, Shift=green)
- **Gallery System:** DB tables (gallery_albums + gallery_images), upload/CRUD/reorder APIs, GalleryManager (Albums + All Photos, masonry grid, lightbox), GalleryWidget for ChaiBuilder
- **Industry Templates Family 1 (Beauty & Body):** 10 subtypes, enterprise-first skeletons, locked components, `validate_locked_components()` safety net

### Testing Results
45 industries tested across 6 rounds — consistent A average. All configs: correct business_name/type, 5-7 tabs, relevant components, 100% SVG icons, unique industry-appropriate colors, context-aware headings.

### Migrations Status
All SQL migrations consolidated into `supabase/LATEST_MIGRATIONS.sql` (idempotent, safe to re-run). Diego last applied on Feb 15, 2026 (migrations 012-027 + portal + gallery). Any future DB changes append to this same file.

---

# 10. DEVELOPMENT WORKFLOW

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

---

# 11. FUTURE VISION

**CORE PRINCIPLE: No half-launches.** We do not ship until EVERYTHING works for EVERY business. No v1/v2 mentality. If competitors have a feature, we must have it — and better. This is an all-in-one platform. Build it RIGHT, build it COMPLETE, then launch.

### Dashboard — Goal Forest (replaces Pine Tree Growth)
The Dashboard is a single-tab, no-sub-tabs platform view. Instead of "grow your business" as the only game, users SET THEIR OWN GOALS via a wizard. Each goal becomes a pine tree. Multiple goals = a forest that grows.

- **Goal Wizard**: Choose type (revenue, reviews, clients, bookings) → set target ($10k/mo, 500 reviews) → set timeframe → plant a tree
- **Trackable goals**: Revenue (invoices/payments), client count, review count, bookings/week, recurring revenue, staff growth, repeat client rate, utilization rate, custom goals
- **Visual**: Forest grows denser as goals are achieved. Completed trees → background. Badges below for past milestones.
- **Status**: Dashboard is hardcoded empty platform tab. PineTreeWidget exists but needs full redesign.

### Review Management System — Platform Tab (NOT YET BUILT)
Full reputation management modeled after GoHighLevel. Every business gets this as a platform tab in the toolbox.

**Core features:**
- **Multi-platform review inbox**: Google Business Profile, Facebook, Yelp (priority) + 40 others (TripAdvisor, Healthgrades, HomeAdvisor, etc.)
- **AI review responses**: Suggestive mode (AI drafts, owner approves) + Auto-Pilot mode (auto-respond based on star rating rules — NEVER auto-respond to 1-2 stars)
- **Review request automation**: SMS/email after completed appointments or paid invoices, smart timing, drip sequences, custom review links, QR codes for in-store
- **Review widgets**: Connect real reviews to ChaiBuilder website (ReviewCarousel widget), star rating badges, "Leave a review" CTA
- **Analytics**: Review volume over time, average rating trend, response rate, platform breakdown, sentiment analysis
- **Notifications**: Instant alerts for new reviews, priority alerts for negative reviews, weekly digest

**DB tables needed:** review_connections, reviews, review_requests, review_templates, review_settings, review_responses
**APIs needed:** Google Business Profile API, Facebook Graph API, Yelp Fusion API, Claude API for response generation
**Platform tab sub-tabs:** Reviews | Requests | Analytics | Settings

### Calendar Consolidation (BUILT ✅ Feb 18, 2026)
- ONE calendar per platform with built-in filter chips (All | Appointments | Classes | Shifts)
- `consolidate_calendars()` strips redundant sub-tabs (appointments, schedules, shifts, classes, reservations) from calendar tabs
- `enforce_tab_limit()` caps at 8 tabs (Dashboard + 7 user tabs)
- Dashboard hardcoded empty (platform-managed, separate Goal Forest plan)
- Frontend `dedupedComponents` also strips redundant sub-tabs for legacy configs
- BookingSetupWizard moved from Settings to Calendar view (gear icon, owner-only)
- Desktop TopBar "More" dropdown for 7+ tabs

### Other Future Systems
- **AI Agents ($5-50/mo)** — Receptionist, Content Writer, Route Planner, Bookkeeper — **BLOCKED: needs Diego's input** on pricing and roster
- **The Forest (Community)** — Business owners growing together. Mighty Pines mentor Sprouts. Leaderboards
- **Growth Courses** — Skill trees: Sales, Marketing, Operations. AI recommends based on user data
- **Template Marketplace** — Users share configs. Clone and customize. Revenue share
- **Multi-Business Support** — One user, multiple pine trees. Forest view
- **API Access** — REST API for Pro users to integrate with external tools
- **Red Pine Print** — Physical goods (signs, merch, stickers) shipped to users
- **Mobile App** — React Native (future)
- **White-label** — Agencies rebrand Red Pine for their clients
- **SMS/Text Marketing** — Twilio configured for notifications only, needs full campaign system
- **Customer Satisfaction** — Surveys, NPS tracking, satisfaction metrics

### Phase C: Gallery System — BUILT ✅ (Feb 18, 2026)
Full gallery system — DB tables (gallery_albums + gallery_images), authenticated API (upload/CRUD/reorder), public API, GalleryManager (iOS Photos-style Albums + All Photos views, masonry grid, lightbox, upload wizard), GalleryWidget for ChaiBuilder, ensure_gallery() post-processing for visual industries. 8/8 industries tested.

### Phase C: Industry Templates + Locked Components (Family 1 COMPLETE ✅)
**Insight from Diego:** "The config should be based off the enterprise version of that business. The AI should SUBTRACT what the user doesn't need, not try to BUILD from nothing."

**Architecture:** Template (enterprise skeleton) -> AI customizes -> Post-processing validates locked components. Locked = AI cannot remove it. Solo tech says "just me" -> AI removes Staff tab. But Gallery, Calendar, Pipeline, Invoices stay no matter what.

**6 Template Families:**

**Family 1: Beauty & Body Services — COMPLETE ✅**
Base: Dashboard, Clients (booking pipeline), Schedule, Services, Gallery, Payments, Settings
- Nail salon / nail tech, Barber / barbershop, Hair salon / stylist, Lash / brow tech, Makeup artist, Tattoo / piercing (+Waivers, Portfolio), Spa / massage (+Rooms), Med spa (+Waivers, +Treatments), Pet grooming (+Waivers)

**Family 2: Food & Hospitality** — WAITING (Diego needs to onboard-test)
Base: Dashboard, Reservations, Menu, Orders, Gallery, Staff, Payments, Settings

**Family 3: Field Services** — WAITING (Diego needs to onboard-test)
Base: Dashboard, Customers (jobs pipeline), Schedule, Jobs, Gallery, Fleet, Payments, Settings

**Family 4: Professional Services** — WAITING (Diego needs to onboard-test)
Base: Dashboard, Clients (sales pipeline), Schedule, Projects, Payments, Settings — NO Gallery tab

**Family 5: Fitness & Education** — WAITING (Diego needs to onboard-test)
Base: Dashboard, Members, Schedule (classes), Gallery, Payments, Settings

**Family 6: Retail & E-commerce** — WAITING (Diego needs to onboard-test)
Base: Dashboard, Products, Orders, Inventory, Payments, Settings — NO Gallery tab

**Process for Families 2-6:** Each family requires Diego to go through the full onboarding flow AS IF he were that business type, evaluate what the AI generates, then inform what the enterprise template should look like. This is a manual quality pass, not automatable.

### Phase C: AI-Generated Websites (Diego priority)
**Problem:** Most users won't use ChaiBuilder drag-and-drop. They expect a website to just exist when they sign up.

**Approach — Template-based first:**
1. 5-10 pre-built ChaiBuilder page templates per industry category
2. AI picks the best template, swaps in business name, colors, logo, relevant sections
3. Website is live at `{business}.redpine.systems` immediately after signup
4. User can still customize via ChaiBuilder later

### Phase C: Subdomain Routing for Business Websites
- `app.redpine.systems` -> Dashboard (login, manage your business)
- `{business}.redpine.systems` -> Public website + portal + booking + ordering
- Wildcard DNS on `*.redpine.systems` (Cloudflare), Next.js middleware reads subdomain

### Phase C: 14-Day Free Trial ✅ BUILT (Feb 18, 2026)
- `trial_period_days: 14` in both checkout routes, SaveLaunchPopup updated with "Start Free Trial" copy
- Stripe handles trial expiration and first charge automatically

### Phase C: Dashboard Onboarding Tour — BLOCKED: needs design thought
First-login guided walkthrough. BLOCKED because every industry generates different tabs/components — the tour MUST be config-aware. Lower priority than gallery/website/trial.

### Phase C: Booking Pipeline for Service Businesses
**Two pipelines for appointment-based businesses:**
- **Booking Pipeline (daily use):** Clients -> Booked -> Confirmed -> In Chair -> Completed -> Rebook
- **Rewards Pipeline (client value):** New -> Regular -> VIP -> Ambassador

AI picks the right pipeline type based on business type: booking pipeline for salons/barbers/tattoo, sales pipeline for agencies/consulting, legal pipeline for law firms, etc.

### Phase C: Multi-Language Onboarding ✅ BUILT (Feb 18, 2026)
Placeholder text in English/Spanish/Portuguese. System prompt: "Always respond in the same language the user writes in." Tab/component labels stay English. Claude speaks 50+ languages — this was nearly free.

### Phase C: Visual Previews in Chat — BLOCKED: needs real screenshots
Show pipeline/calendar/gallery screenshots during onboarding chat so users can see what they're getting. BLOCKED UNTIL platform is visually polished + all 6 template families done. Also applies to onboarding landing page images (currently generic illustrations, need real platform screenshots).

### Phase C: Recurring Classes + Per-Instance Attendance
Calendar-based class management with per-instance RSVP and historical attendance tracking. Key insight: Pipeline = client journey (one person in ONE stage at a time). Classes = grouping (one person in MULTIPLE classes simultaneously). Calendar is the natural home for classes because classes are time-based events.

Applies to: Martial arts, yoga, dance, gyms, tutoring, music schools — any business with recurring group sessions.

### Phase C: QuickBooks Integration
OAuth2 flow to connect QuickBooks Online from Settings tab. Bidirectional sync of invoices, payments, expenses, customers. Makes Red Pine viable for businesses already on QB.

---

# 12. STANDING RULES

### Session Protocol
- Update The Brain after every work session
- Re-share this file at the start of every new Claude chat
- Diego handles all UI/design. PRDs focus on backend logic only
- No rush. Build it right. Structure and foundation first
- Test with real business owners when core flow works end-to-end

### Startup Commands
```bash
# Terminal 1: Flask Onboarding
cd ~/redpine-os/onboarding && source ../venv312/bin/activate && python app.py

# Terminal 2: Next.js Dashboard
cd ~/redpine-os/dashboard && npm run dev
```

**Access URLs:**
- Onboarding: http://localhost:5001
- Dashboard: http://localhost:3000

---

# 13. DIEGO'S CONTEXT

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

> RED PINE OS — From Seed to Mighty Pine
> Brain v8 | February 18, 2026 | Day 29
> ~94% Complete | Deploy Sprint Active
> "The bricks are ours. The house is yours."
