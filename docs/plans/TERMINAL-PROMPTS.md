# Terminal Prompts — Copy-Paste Into Each Terminal

---

## TERMINAL 1 — Templates & Registry

```
Read the plan at docs/plans/TERMINAL-1-TEMPLATES.md and execute it completely.

You are writing 8 template family files + updating the registry to cover ~90 business types. The pattern to follow exactly is in dashboard/src/lib/onboarding/templates/beauty-body.ts (570 lines). Each template file follows the same TypeScript interfaces and export patterns.

Research files with industry data are in research-results/ (files 17-23). Read the matching research file before writing each template.

USE BACKGROUND AGENTS — write 2-3 template files in parallel since they're independent. Each agent reads one research file + the beauty-body pattern, then writes one template file.

File ownership:
- CREATE: dashboard/src/lib/onboarding/templates/{health-wellness,food-beverage,home-field-services,professional-services,creative-events,education-childcare,automotive,retail}.ts
- MODIFY: dashboard/src/lib/onboarding/registry.ts

DO NOT touch any component files, API routes, or other lib files. Templates and registry ONLY.

When done, update memory/MEMORY.md to reflect all 9 families are complete.
```

---

## TERMINAL 2 — Wiring + Website Tab + Blog

```
Read the plan at docs/plans/TERMINAL-2-WIRING-AND-WEBSITE.md and execute it completely.

You have 2 jobs:

JOB 1 (do FIRST — takes 10 minutes): Wire orphaned components.
- MarketplaceView.tsx: Remove 'templates' sub-tab. Replace freelancers ComingSoonCard with actual FreelancerMarketplace import.
- SiteView.tsx: Add 'blog' and 'templates' sub-tabs. Wire TemplateMarketplace component to templates sub-tab.
- DashboardContent.tsx: Replace dashboard "coming soon" placeholder with PineTreeWidget + StatCards + ActivityFeedView.

JOB 2: Build blog system.
- Create dashboard/src/components/blog/ directory with BlogList.tsx, BlogEditor.tsx, BlogPost.tsx
- Create blog API route at dashboard/src/app/api/data/blog_posts/route.ts
- Create public blog pages at dashboard/src/app/site/[subdomain]/blog/
- Add blog_posts table migration to supabase/LATEST_MIGRATIONS.sql
- Wire BlogList into SiteView's blog sub-tab

File ownership — you ONLY touch:
- MarketplaceView.tsx, SiteView.tsx, DashboardContent.tsx (wiring changes)
- New blog/ directory and files
- New blog API route
- LATEST_MIGRATIONS.sql (blog table only)

DO NOT touch template files, portal, reviews, booking/payment logic, or editor core files.

When done, update memory/MEMORY.md.
```

---

## TERMINAL 3 — Core Business Logic

```
Read the plan at docs/plans/TERMINAL-3-BUSINESS-LOGIC.md and execute it completely.

You are wiring the money flow — the core business logic that makes Red Pine actually work for businesses. This covers deposits, tips, commissions, auto-invoicing, service stacking, quotes, and coupons.

Key files to modify:
- BookingSetupWizard.tsx — add deposit slider (10-100%), no-show protection toggle, service stacking
- AddCatalogItemWizard.tsx — progressive disclosure (4 fields default, "Advanced" expander), pricing per staff toggle
- StaffSetupWizard.tsx — tiered commission brackets UI
- /api/public/bookings/route.ts — enforce deposits, multi-service booking

Key files to create:
- TipSelector.tsx — tip percentage buttons for checkout
- QuoteBuilder.tsx — estimate builder with line items + "Convert to Invoice"
- CouponManager.tsx — coupon CRUD with codes, types, expiry
- commission-engine.ts — calculation logic for all 4 commission types
- /api/data/commissions/route.ts, /api/data/coupons/route.ts, /api/data/estimates/route.ts

Add migrations to supabase/LATEST_MIGRATIONS.sql for: deposit columns, commission table, coupons table.

USE BACKGROUND AGENTS for independent tasks — TipSelector, CouponManager, and QuoteBuilder can be built in parallel.

DO NOT touch template files, portal, reviews, navigation/wiring, editor, or blog files.

When done, update memory/MEMORY.md.
```

---

## TERMINAL 4 — Portal + Loyalty + Forms

```
Read the plan at docs/plans/TERMINAL-4-PORTAL-LOYALTY-FORMS.md and execute it completely.

You are upgrading the portal to Starbucks/McDonald's level, building the loyalty config system, and creating the form template library.

Portal upgrades (modify existing portal section components):
- PortalBookingSection.tsx — "Book Again" one-tap shortcut, saved preferences per industry
- PortalHistorySection.tsx — "Reorder" button next to past orders
- PortalCardsSection.tsx — Apple Wallet visual card design (stacked cards with gradient backgrounds)
- PortalLoyaltySection.tsx — Starbucks-style progress bar, points history, reward redemption
- PortalAccountSection.tsx — family member management (add/switch between family members)
- portal-templates.ts — industry-specific preference configs (salon, restaurant, gym, contractor, retail)

New files to create:
- LoyaltyConfigPanel.tsx — owner-facing loyalty program setup (earning rules, tiers, rewards)
- FormTemplateLibrary.tsx — Google Forms-style template browser with industry categories
- form-templates.ts — 15+ industry-specific form templates (salon intake, fitness waiver, medical history, etc.)
- DocTypeRenderer.tsx — visual differentiation (waiver=amber, contract=blue, survey=green, invoice=red)
- /api/data/loyalty_config/route.ts — loyalty config CRUD

Add migrations to supabase/LATEST_MIGRATIONS.sql for: loyalty_config, client_loyalty, portal_family_members tables.

USE BACKGROUND AGENTS — FormTemplateLibrary + form-templates.ts can be built in parallel with portal upgrades.

DO NOT touch template files, booking/payment logic, navigation/wiring, editor, or blog files.

When done, update memory/MEMORY.md.
```

---

## IMPORTANT NOTES FOR ALL TERMINALS

1. **Read the plan file first** — it has exact file paths, code examples, migration SQL, and design rules
2. **Read CLAUDE.md** — it has design rules (colors from config, CustomSelect mandatory, rounded-xl, generous padding)
3. **Use background agents** where noted — each terminal can parallelize independent file creation
4. **Update memory/MEMORY.md when done** — so the planning terminal knows what's complete
5. **DO NOT touch files outside your ownership** — other terminals are modifying their own files simultaneously
6. **All migrations go in supabase/LATEST_MIGRATIONS.sql** — coordinate migration numbers (041+)
7. **Currency is always cents** — store as INTEGER, display as `$${(cents/100).toFixed(2)}`
