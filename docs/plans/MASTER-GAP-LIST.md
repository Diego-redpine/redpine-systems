# MASTER GAP LIST — Red Pine OS
## Every Sticky Note vs Actual Codebase (Feb 25, 2026)

This is the definitive list of what's DONE, PARTIAL, and MISSING across all 15 sticky notes.
Other terminals: use this as your build checklist. Every item here is a LOCKED decision from Diego.

---

## STICKY NOTE #1 — BOOKING ENGINE

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Deposits slider (10-100%) | MISSING | Nothing | Owner sets deposit % per service. Slider UI in service/booking setup. Stripe charges partial amount. |
| Card on file for booking | PARTIAL | Portal has `/api/portal/cards` route, `PortalCardsSection` exists | Card not REQUIRED for booking. No enforcement logic. No Apple Wallet visual in booking flow. |
| Service stacking (multi-service) | MISSING | Booking accepts single `service_id` | Need array of service_ids, combined duration calc, combined price |
| Family/group booking | MISSING | `clients.parent_email` field exists (migration 013b) | No UI for "book for family member". Mom can't book for kids. No parent-child account linking. |
| Processing times / buffer | DONE | `BookingSetupWizard` step 2 (0-30 min buffer), `/api/public/bookings` respects buffer | — |
| No-show protection | MISSING | Nothing | Charge policy config per owner. Card-on-file required toggle. No-show fee amount. Auto-charge logic. |

---

## STICKY NOTE #2 — PAYMENTS

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Tips at checkout | PARTIAL | `tip_pools` table (restaurant model, per-date pools) | Tips per individual transaction. Percentage buttons (15/18/20/custom) at checkout. Tip goes to specific staff. |
| Commission — flat per service | MISSING | `staff.pay_type` enum includes 'commission' | No flat-$ commission per service completion |
| Commission — % of service | PARTIAL | `staff.commission_percent` field + StaffSetupWizard UI | Not wired to actual payment events. No auto-calc on service completion. |
| Commission — tiered % | MISSING | Nothing | Tier brackets UI (e.g., 0-$5k = 30%, $5k-$10k = 35%). Config per staff. |
| Commission — product commission | MISSING | Nothing | Separate commission rate for product sales vs service sales |
| Commission triggers on money events | MISSING | Nothing | No automation: service complete → calc commission → credit staff. No invoice paid → commission trigger. |
| Payment plans (installments) | MISSING | Nothing | Stripe Billing / installment plans for high-ticket services |
| Quotes (single) | PARTIAL | `estimates` table in entity-fields.ts | No quote builder UI. No quote→invoice conversion. No client approval flow. |
| Auto-invoicing on job completion | MISSING | Nothing | Appointment status → 'completed' → auto-generate invoice with line items |
| Instant payouts (Stripe Connect) | PARTIAL | Stripe routes exist (`/api/stripe/*`) | No staff payout logic. No Stripe Connect Express for staff. |

---

## STICKY NOTE #3 — COMMUNICATION

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Unified inbox (GHL-style) | DONE | `UnifiedInbox.tsx` — 3-panel layout, 7 channel colors, search, filters | Running on demo data. Needs real data wiring. |
| Phone numbers (Twilio) | MISSING | Nothing | Twilio setup wizard. Phone number assignment. SMS send/receive. |
| WhatsApp (add-on) | MISSING | Listed as channel in demo data | No Twilio WhatsApp Business API integration |
| Email marketing | MISSING | Nothing in Marketing tab | Campaign builder, email templates, send to segments, track opens/clicks |
| Live chat = Receptionist Agent | PARTIAL | `ChatWidget.tsx` in portal (3-state: anon→returning→auth) | No Receptionist Agent pricing/feature gate ($15/mo). No AI auto-responses for widget. |
| Pre-built automations (toggle on/off) | PARTIAL | `AutomationBuilder.tsx` + `workflows` table | Builder is blank canvas. No industry-specific presets. No "toggle on" experience. Owner sees empty list. |

---

## STICKY NOTE #4 — FORMS & DOCUMENTS

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Docs tab (each type looks different) | PARTIAL | `DocumentEditor.tsx` with 3 generic templates (Contract, NDA, Meeting Notes) | Visual differentiation per doc type (waiver looks different from survey looks different from contract). Industry-specific templates. |
| Smart Files (proposal+contract+invoice) | MISSING | Documents, contracts, invoices are separate modules | Combined document that flows: proposal → signed contract → generated invoice |
| E-signatures | DONE | `SignaturePad.tsx` + `/app/sign/[id]` page | — |
| Smart Form Scanner | MISSING | Nothing | Button in doc editor. Upload PDF/photo. AI OCR → digitize into editable form fields. |
| Pre-built templates per industry | MISSING | Only 3 generic templates | Salon intake form, fitness waiver, medical history, contractor estimate, etc. |
| Google Forms-style template library | MISSING | Nothing | Browse/search form templates. Preview. One-click use. |
| Form builder | DONE | `FormBuilder.tsx` with 13 field types, drag-to-reorder | — |

---

## STICKY NOTE #5 — WEBSITE EDITOR

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Three tiers (AI chat → visual → code) | PARTIAL | Visual drag-drop editor (FreeForm). AI chat for onboarding. | Code view for freelancers. No HTML/CSS editor mode. |
| Code import button | MISSING | Nothing | Button next to "New Page" to paste raw HTML/CSS |
| Brand Board as source of truth | DONE | `BrandBoardEditor.tsx`, colors passed to editor | — |
| Blog sub-tab in Website tab | MISSING | SiteView has: Pages, Gallery, Portal, Analytics, SEO, Settings | No Blog sub-tab. No blog post editor. No blog list view. |
| Blog Agent ($5/mo) | MISSING | Not in AgentMarketplace | Agent that auto-generates blog content |
| Version history (unlimited) | MISSING | Editor has undo/redo only | No version snapshots. No "restore to previous version". No timestamp history. |
| Template library = Website sub-tab | MISSING | `TemplateMarketplace.tsx` exists but is ORPHANED. Not in SiteView sub-tabs. Currently a "Coming Soon" card in Marketplace tab. | Move to Website tab as sub-tab "Templates". Wire the existing component. |
| Template snowball (AI learns) | MISSING | Nothing | No mechanism to save user configs as templates. No learning from unique businesses. |

---

## STICKY NOTE #6 — REVIEW MANAGEMENT

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Review gate (positive→external, negative→private) | DONE | `ReviewGate.tsx` — toggle, star threshold, platform URLs, negative message | — |
| Respond from Red Pine to Google/Facebook | MISSING | Nothing | Google Business API + Facebook API integration for posting responses |
| Reputation Agent ($15/mo) | MISSING | Not in AgentMarketplace | AI auto-response agent. Sentiment analysis. Smart response drafts. |
| Smart review requests | DONE | `ReviewRequests.tsx` — triggers, channels, drip tracking | — |
| Review widget for websites | DONE | `ReviewWidgetBuilder.tsx` + `ReviewWidgetPreview.tsx` — 4 layouts, filters | — |
| Contact-to-review matching | PARTIAL | `reviews.client_id` FK exists (migration 038) | No fuzzy name match logic. No time correlation. No tracking link matching. |
| Trust builds over time (auto-pilot) | MISSING | Nothing | Approval loop: owner approves N responses → agent gains auto-respond permission |

---

## STICKY NOTE #7 — SERVICES, PRODUCTS & INVENTORY

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| GlossGenius simplicity (4 fields) | PARTIAL | `AddCatalogItemWizard.tsx` — works but shows 8+ fields | Progressive disclosure: show 4 default fields (name, price, duration, category). "Advanced" expandable for rest. |
| Basic inventory (stock + alerts) | PARTIAL | `packages.quantity` field, stock input in wizard | No low-stock alerts. No notification when inventory drops below threshold. |
| Same system, different modes | DONE | `packages` table with `item_type` (service/product/package) | — |
| Pricing per staff toggle | MISSING | Staff has pay rate, but no per-service override | Toggle on service: "Different price per staff?" → staff-specific pricing table |
| Packages/deals/coupons | MISSING | `packages` table supports type 'package' | No coupon code system. No discount builder. No deals/promotions section. |
| Menu = service catalog with modifiers | PARTIAL | `MenuWidget.tsx` exists for website display | No modifier system (size, extras, add-ons). Menu items are just products. |

---

## STICKY NOTE #8 — STAFF & OPERATIONS

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| All 4 commission types | PARTIAL | `StaffSetupWizard.tsx` — commission %, booth rental, hourly, salary, per-class | Tiered commission brackets missing. Product commission rate separate from service rate missing. |
| Chair/booth rental | DONE | `booth_rental` pay type in wizard, `pay_rate_cents` for monthly amount | — |
| Staff scheduling (opt-in) | DONE | Wizard step 3: availability with day toggles, time ranges. Employees skip. | — |
| Job tracking via Live Board | DONE | `LiveBoard.tsx` + 5 board types (schedule, orders, classes, queue, pipeline) | — |
| Time tracking with GPS | PARTIAL | `/api/data/time_tracking/route.ts` exists | No UI component for time tracking. No GPS/geolocation integration. No mobile clock-in. |
| Job forms/checklists | PARTIAL | `forms` table + `checklists` API route | No "Job Forms" UI component. No checklist template per job type. No integration with Live Board. |

---

## STICKY NOTE #9 — AI COO & AGENT FRAMEWORK

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| COO personality (set during onboarding) | MISSING | Nothing | Personality picker during onboarding (professional/friendly/knowledgeable) |
| COO in onboarding (tour guide) | PARTIAL | `OnboardingTour.tsx` (9 steps) + `SpotlightTour.tsx` | No COO character. Tour is generic steps, not COO-narrated. |
| Agent hiring (app store + COO mentions) | PARTIAL | `AgentMarketplace.tsx` — subscribe/unsubscribe per agent | No COO subtle recommendations. No "Hey, I noticed you could use X agent" prompts. |
| Trust levels | MISSING | Nothing | No trust_level field. No progressive permission system. |
| COO memory (coo_memories table) | MISSING | Nothing | `coo_memories` table with categories (goal, preference, client_note, milestone, decision, concern, idea). Structured reflection after each conversation. Supersession for conflicts. Confidence threshold (80%). |
| Agent event bus | MISSING | Nothing | Event bus pattern: agents write events → COO reads and narrates. No agent-to-platform event system. |

---

## STICKY NOTE #10 — TEMPLATES & INDUSTRY CONFIG

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| ~30 templates at launch | PARTIAL | `beauty-body.ts` (10 types). `registry.ts` only maps beauty-body aliases. | 8 more template families needed (~80 types total). Research 17-23 all done. |
| Closest match fallback | MISSING | `detectTemplateType()` returns null for no match | Fallback logic: pick closest family → let COO adjust post-launch |
| Template evolution (AI learns) | MISSING | Nothing | No mechanism to capture unique configs as learned templates |
| Template library (free, open source) | ORPHANED | `TemplateMarketplace.tsx` built but never imported | Wire into Website tab as sub-tab (NOT Marketplace tab) |
| Post-onboarding changes via COO | PARTIAL | `ChatOverlay.tsx` can modify tabs/colors | No "interview like a CTO" flow. No structured change process. |
| Feature request board | MISSING | Nothing | In-platform ideas board with upvoting. COO auto-logs requests. |

---

## STICKY NOTE #11 — PORTAL & CLIENT EXPERIENCE

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Portal location (/portal/* routes) | DONE | `/app/portal/[subdomain]/page.tsx` + API routes | — |
| Universal skeleton (8 sections) | DONE | `PortalShell`, `PortalNav`, `PortalTopBar`, 8 section components | — |
| Industry add-ons | MISSING | Portal sections are generic | Salon: saved preferences, before/after photos. Restaurant: reorder favorites, daily deals. Gym: class schedule, check-in QR. Contractor: project tracker. Retail: wishlist, shipping tracking. |
| Saved cards (Apple Wallet style) | PARTIAL | `PortalCardsSection` + `/api/portal/cards` | Need Apple Wallet visual design (card graphic, not just a list) |
| Loyalty (points/tier + progress bar) | PARTIAL | `PortalLoyaltySection` exists | Need visual progress bar (like Starbucks). Earning rules config for owner. |
| Family accounts | MISSING | `clients.parent_email` field exists | One login, manage child profiles. Switch between family members. |
| One-tap shortcuts (Book Again / Reorder) | MISSING | Nothing in portal sections | Prominent buttons in history section |
| Notification preferences | PARTIAL | `PortalNotificationsSection` + `portal_notification_preferences` table | Need real opt-in toggles wired to actual notification channels |
| ChatWidget (3-state) | DONE | `ChatWidget.tsx` — anonymous→returning→authenticated | — |

---

## STICKY NOTE #12 — REPORTING & ANALYTICS

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Analytics per-tab (NOT master) | DONE | Stat cards render at top of each entity view | — |
| Stat cards (60+ entities) | DONE | `StatCards.tsx` — auto-detects money/status/date fields | — |
| Dashboard tab = Goal Forest | MISSING | Dashboard renders "coming soon" placeholder. `PineTreeWidget` is a floating button only. | Full pixel art scene: blue sky, mountains, pine forest, grass. Goals = seeds → trees. Auto-milestone trees. Achievement badges. Activity feed. |
| COO natural language analytics | MISSING | ChatOverlay exists but not analytics-aware | "How was my week?" → COO pulls stats and answers in plain English |
| BI Agent (paid add-on) | MISSING | Not in AgentMarketplace | Proactive insights, weekly digests, anomaly detection |

---

## STICKY NOTE #13 — MARKETPLACE (FREELANCERS)

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Freelancer marketplace | ORPHANED | `FreelancerMarketplace.tsx` fully built (8 freelancers, 10 gigs, order flow) | NEVER IMPORTED. Shows "Coming Soon" card in MarketplaceView. |
| Same Red Pine dashboard | NOT BUILT | Nothing | No "freelancer" business type in onboarding. No auto-marketplace-profile. |
| Payment via escrow (Stripe Connect) | MISSING | Nothing | No escrow logic. No Stripe Connect for freelancers. No 5% platform cut. |
| Open registration + strike system | MISSING | Nothing | No freelancer auth flow. No ToS acceptance. No strike/ban system. |

---

## STICKY NOTE #14 — UI/LAYOUT ARCHITECTURE

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| Sidebar (keep current) | DONE | Current sidebar works | — |
| Dashboard = Goal Forest + stats + badges + activity | MISSING | Placeholder only | Full implementation per Sticky Note #12 |
| Notifications (bell + 5 types) | DONE | `NotificationPanel.tsx` — 5 types, bell icon | Running on demo data |
| Dark mode = NO | DONE | Correctly absent | — |

---

## STICKY NOTE #15 — MOBILE/PWA

| Item | Status | What Exists | What's Missing |
|------|--------|-------------|----------------|
| PWA (installable web app) | MISSING | Nothing | `manifest.json`, service worker, `next-pwa` config, install prompt |
| Capacitor wrapper | NOT YET | Deferred to Phase 2 | — |

---

## WIRING ISSUES (Built But Not Connected)

These are components that exist as fully coded files but are NOT imported anywhere:

| Component | File | Lines | Should Be Wired To |
|-----------|------|-------|--------------------|
| TemplateMarketplace | `TemplateMarketplace.tsx` | 471 | **Website tab** as sub-tab "Templates" (NOT Marketplace tab per Sticky Note #5) |
| FreelancerMarketplace | `FreelancerMarketplace.tsx` | 702 | MarketplaceView sub-tab 'freelancers' |
| Goal Forest (PineTreeWidget) | `PineTreeWidget.tsx` | 328 | Dashboard tab main view (replace "coming soon" placeholder) |

---

## WEBSITE TAB SUB-TABS (Current vs Spec)

**Current** (SiteView.tsx):
1. Pages
2. Gallery
3. Portal (conditional)
4. Analytics
5. SEO
6. Settings

**Should Be** (per Sticky Notes #5, #10):
1. Pages
2. Gallery
3. **Blog** ← MISSING
4. **Templates** ← MISSING (TemplateMarketplace component, currently orphaned)
5. Portal (conditional)
6. Analytics
7. SEO
8. Settings

---

## MARKETPLACE TAB SUB-TABS (Current vs Spec)

**Current** (MarketplaceView.tsx):
1. AI Agents ✅ (AgentMarketplace — working)
2. Templates ❌ (ComingSoonCard — should be REMOVED, template marketplace moves to Website tab)
3. Freelancers ❌ (ComingSoonCard — should render FreelancerMarketplace)

**Should Be** (per Sticky Notes #5, #13):
1. AI Agents (keep as-is)
2. Freelancers (wire FreelancerMarketplace.tsx)
3. ~~Templates~~ (REMOVE — templates live in Website tab per spec)

---

## PRIORITY TIERS

### P0 — Wiring (No new code, just imports + connections)
1. Wire `TemplateMarketplace.tsx` → Website tab sub-tab
2. Wire `FreelancerMarketplace.tsx` → Marketplace tab sub-tab
3. Wire `PineTreeWidget` → Dashboard tab (replace placeholder)
4. Remove "Templates" sub-tab from MarketplaceView
5. Add "Blog" sub-tab to SiteView (even if just placeholder page)
6. Add "Templates" sub-tab to SiteView

### P1 — Template Families (Research done, pattern exists)
7. Write `health-wellness.ts` (10 types) — Research #17 done
8. Write `food-beverage.ts` (8 types) — Research #18 done
9. Write `home-field-services.ts` (10 types) — Research #19 done
10. Write `professional-services.ts` (8 types) — Research #20 done
11. Write `creative-events.ts` (8 types) — Research #21 done
12. Write `education-childcare.ts` (8 types) — Research #22 done
13. Write `automotive.ts` (6 types) — Research #23 done
14. Write `retail.ts` (7 types) — Research #23 done
15. Update `registry.ts` with all ~80 business type aliases

### P2 — Core Business Logic (Fully specced, no research needed)
16. Deposit slider (service setup + booking enforcement)
17. Service stacking (multi-service booking)
18. No-show protection (card required + charge policy)
19. Tips at individual checkout (% buttons + custom)
20. Commission auto-calculation on money events
21. Auto-invoicing on appointment completion
22. Quote builder + quote→invoice conversion
23. Low-stock inventory alerts
24. Packages/deals/coupons system
25. Pricing per staff toggle

### P3 — Portal & Client Features (Specced)
26. Industry-specific portal add-ons (salon prefs, restaurant reorder, gym QR, etc.)
27. Apple Wallet card visual design
28. Loyalty earning rules config UI
29. Loyalty visual progress bar (Starbucks-style)
30. Family accounts (one login, manage profiles)
31. One-tap shortcuts (Book Again / Reorder)

### P4 — Communication & Integrations (Needs external APIs)
32. Twilio integration (phone numbers, SMS send/receive)
33. WhatsApp Business API integration
34. Email marketing campaign builder
35. Google Business API (respond to reviews from Red Pine)
36. Facebook API (respond to reviews)
37. Pre-built automation presets per industry (needs Research #25)

### P5 — AI & Advanced (Needs Research #24)
38. COO memory system (`coo_memories` table + reflection + supersession)
39. COO personality picker in onboarding
40. COO narrates onboarding tour (replace generic steps)
41. Agent event bus (agents write events → COO reads)
42. Trust levels (progressive permission)
43. Reputation Agent ($15/mo)
44. Blog Agent ($5/mo)
45. BI Agent (proactive insights)
46. COO natural language analytics ("How was my week?")

### P6 — Website Editor Advanced
47. Code view for freelancers (HTML/CSS editor mode)
48. Code import button (paste HTML/CSS next to "New Page")
49. Version history (unlimited snapshots with restore)
50. Blog post editor + blog list view
51. Template snowball (save user configs as templates, AI learns)

### P7 — Forms & Documents
52. Smart Files (proposal + contract + invoice combined flow)
53. Smart Form Scanner (upload PDF/photo → AI OCR → editable form)
54. Industry-specific form/waiver templates
55. Google Forms-style template browser
56. Visual differentiation per doc type (waiver ≠ survey ≠ contract)

### P8 — Staff & Operations
57. Tiered commission brackets UI
58. Product commission rate (separate from service)
59. Time tracking UI with GPS/geolocation
60. Job forms/checklists linked to Live Board
61. Mobile clock-in for field services

### P9 — Platform Polish
62. PWA (manifest.json + service worker + install prompt)
63. Feature request/ideas board (in-platform, upvote system)
64. Onboarding tour final step wiring
65. Logo upload persistence (Supabase Storage)
66. Migration 039 (heading_font + body_font columns)
67. Notification panel → real data (replace demo notifications)
68. Unified inbox → real data (replace demo conversations)

---

## BUILD SEQUENCE RECOMMENDATION

**Start with P0** — it's pure wiring, takes minutes, instantly makes the platform feel more complete.

**Then P1** — templates are mechanical (pattern exists), research is done, biggest coverage gain.

**Then P2** — core business logic that every business needs on day 1.

**P3-P9** can be parallelized across terminals by category.

---

*Generated Feb 25, 2026 by planning terminal. This is the source of truth for all build terminals.*
