# Red Pine OS — Deep Research Queue

Background research for agents running in a separate terminal. Designed to produce hours of thorough, evidence-based research — not surface-level summaries.

---

## How to Run

```bash
# In a dedicated research terminal (runs in background, won't interrupt build terminal):
cd ~/redpine-os
claude "You are a deep research agent for Red Pine OS. Read RESEARCH_QUEUE.md carefully — \
it contains detailed checklists, comparison tables, and screenshot instructions. \
Work through topics starting from #1. For EVERY competitor listed: \
1) Web search for current info (pricing, features, reviews) \
2) Use Playwright MCP to visit their website and take screenshots (homepage, pricing page, \
   key feature pages — both desktop 1280x800 and mobile 375x812) \
3) Save screenshots to research-results/screenshots/{topic-folder}/{competitor}-{page}.png \
4) Fill out EVERY row in comparison tables with real data \
5) Search Reddit, G2, Capterra for real user complaints and quote them \
6) Write complete findings to research-results/{XX-slug}.md \
Do NOT summarize from memory — only use live web data. Take your time. \
Thoroughness over speed. Check every box in every checklist. \
When done with one topic, move to the next. Keep going until all topics are complete."
```

**Tip:** If the agent runs out of context mid-topic, start a new session pointing at the next unfinished topic. Check the Progress Tracker at the bottom of this file to see what's done.

**Key instruction for the agent:** The checklist format below is intentional. Each checkbox is a discrete research task. Don't skip any. Don't summarize — gather real data, real numbers, real quotes.

---

## Research Rules (Include These in Agent Prompt)

1. **No memory summaries** — Every claim must come from a live web search, product page, or review site
2. **Include sources** — Every finding gets a URL. No unsourced claims.
3. **Fill every table cell** — If a comparison table has 6 competitors and 10 features, that's 60 cells. Fill them all. Write "Not found" if genuinely unavailable.
4. **Find user complaints** — For each platform, search Reddit, G2, Capterra, TrustPilot for real complaints. Quote them.
5. **Get real pricing** — Visit actual pricing pages. Screenshot-describe the tiers. Note what's behind paywalls.
6. **One topic = one output file** — Write each completed topic to `research-results/XX-slug.md`
7. **Don't rush** — A shallow answer is worse than no answer. If a topic needs 45 minutes, take 45 minutes.

---

## Screenshot Protocol (Use Playwright MCP)

You have Playwright MCP available. **Use it aggressively.** Screenshots are the most valuable output of this research — they become design reference for the build team.

### What to Screenshot:
For EVERY competitor, capture these pages (when publicly accessible):

| Page Type | Why It Matters | Naming Convention |
|-----------|---------------|-------------------|
| **Homepage/hero** | How they present themselves, visual quality | `{competitor}-homepage.png` |
| **Pricing page** | Exact tiers, feature gates, positioning | `{competitor}-pricing.png` |
| **Feature page** | How they describe/show key features | `{competitor}-features.png` |
| **Dashboard/product UI** | Layout patterns, data presentation (if visible in marketing screenshots or demos) | `{competitor}-dashboard.png` |
| **Booking/scheduling flow** | Client-facing UX for appointments | `{competitor}-booking.png` |
| **Client portal** | What end-customers see | `{competitor}-portal.png` |
| **Mobile view** | Set viewport to 375x812, screenshot same pages | `{competitor}-mobile-{page}.png` |

### How to Screenshot:
```
1. Navigate to the competitor's website with browser_navigate
2. Wait for page to load (browser_wait_for, 2-3 seconds)
3. Take full-page screenshot: browser_take_screenshot with fullPage=true
4. Save to: research-results/screenshots/{topic-folder}/{competitor}-{page}.png
5. For mobile: browser_resize to 375x812 FIRST, then screenshot as {competitor}-mobile-{page}.png
6. Resize back to 1280x800 for desktop screenshots
```

### Screenshot Folder Structure:
```
research-results/screenshots/
├── 01-editor/          # Squarespace, Webflow, Wix, Framer editor UIs
├── 02-platforms/        # Shopify, Toast, HoneyBook platform overviews
├── 03-salon/            # Vagaro, Fresha, GlossGenius, Booksy, Boulevard
├── 04-fitness/          # Mindbody, Zen Planner, WellnessLiving, Momoyoga
├── 05-professional/     # Clio, Karbon, HoneyBook, Dubsado
├── 06-home-services/    # Jobber, Housecall Pro, ServiceTitan
├── 07-restaurants/      # Toast, Square, ChowNow
├── 08-ai-builders/      # Durable, Mixo, 10Web, Wix ADI
├── 09-marketplace/      # Shopify App Store, HubSpot Marketplace
└── 10-portals/          # Client portal screenshots from various platforms
```

### Priority Screenshots (Most Valuable for Building):
These are the screenshots the build team will reference most — prioritize capturing these:
- **Editor responsive controls** — How Webflow/Wix/Framer show breakpoint switching UI
- **Booking flows** — Step-by-step client booking experience from 3+ competitors
- **Dashboard layouts** — How competitors organize stats, tables, charts, navigation
- **Pricing pages** — Every competitor's pricing page (informs our positioning)
- **Mobile views** — Set Playwright to 375px width, screenshot competitor sites

### In the Research Output File:
When referencing a screenshot, embed it like this:
```markdown
**Vagaro Pricing Page:**
![Vagaro Pricing](screenshots/03-salon/vagaro-pricing.png)
Vagaro offers 3 tiers: $30/mo (single), $50/mo (2 staff), $90/mo (unlimited)...
```

---

# TOPIC 1: Website Editor — Architecture, User Spectrum, and Portability

**This is the deepest research topic. The editor is the core of Red Pine.**

Red Pine's editor must serve THREE very different users through ONE tool:

| User | Skill Level | What They Want | How They Use the Editor |
|------|------------|----------------|------------------------|
| **Business owner (just get online)** | Zero | "AI, make me a website" | Chat with AI → done in 5 min. Maybe tweaks colors. |
| **Business owner (hands-on)** | Low-Medium | Drag sections, customize text, upload photos | Visual editor, pre-built sections, no code |
| **Freelancer (hired via marketplace)** | High | Build impressive sites for clients | Full editor control, OR import code, OR mix both |

The marketplace connection is key: a business owner who can't design can HIRE a freelancer through Red Pine's marketplace. That freelancer needs to work effectively in our editor — or bring their own code and have our pre-built sections (booking, gallery, products, reviews) work as portable components they can embed anywhere.

**Three core questions:**
1. Is our absolute-positioning + computed-breakpoints model viable long-term, or should we move to flow-based?
2. How do other editors serve the novice-to-pro spectrum in one tool?
3. How do other platforms handle portable/embeddable components that work across different build approaches?

## Part A: Responsive Architecture (Sand or Concrete?)

### Competitor Checklist (research EACH one):

### [ ] Squarespace
- [ ] What layout model do they use? (CSS grid? Flexbox? Custom engine?)
- [ ] How are sections structured? (fixed sections with flow content inside?)
- [ ] What happens when you edit on desktop — does mobile auto-update?
- [ ] Can users manually override mobile layout?
- [ ] How do they handle images across viewports?
- [ ] What are the CONSTRAINTS? (what can't users do?)
- [ ] Search Reddit/forums: "squarespace responsive frustrating" — what do people complain about?
- [ ] What's their editor architecture? (DOM-based? Canvas? Virtual?)
- [ ] **SCREENSHOT:** Homepage (desktop + mobile), template editor if visible, any responsive preview UI → `screenshots/01-editor/squarespace-*.png`

### [ ] Webflow
- [ ] Flexbox + grid based — how does their breakpoint system work?
- [ ] "Cascade down" model: desktop styles cascade to tablet/mobile unless overridden. How exactly?
- [ ] Can you set different layouts per breakpoint? How much control?
- [ ] How do they handle absolute positioning within relative containers?
- [ ] What's the learning curve? (search: "webflow too complex" or "webflow learning curve")
- [ ] What's their responsive preview workflow?
- [ ] How do they handle text reflow across breakpoints?
- [ ] **SCREENSHOT:** Homepage, editor UI (if visible in marketing), responsive preview controls → `screenshots/01-editor/webflow-*.png`

### [ ] Wix
- [ ] Classic Editor vs Editor X (now Wix Studio) — what changed and why?
- [ ] How does their AI auto-layout ("Wix ADI") handle responsive?
- [ ] Editor X uses CSS grid — how does it differ from Webflow?
- [ ] What's the "mobile editor" experience? Separate from desktop?
- [ ] Search: "wix mobile layout broken" — common complaints?
- [ ] How do they handle drag-and-drop positioning across viewports?
- [ ] What constraints did they ADD over time (started free-form, added structure)?
- [ ] **SCREENSHOT:** Homepage, Wix Studio editor (marketing shots), mobile editor UI → `screenshots/01-editor/wix-*.png`

### [ ] Framer
- [ ] Auto-layout (like Figma) — how does it handle responsive?
- [ ] Stack-based layout: horizontal and vertical stacks with breakpoint overrides
- [ ] How do they handle the absolute-vs-flow tension?
- [ ] What's their breakpoint system? (how many, how do overrides work?)
- [ ] Component-based: how do components adapt across viewports?
- [ ] Search: "framer responsive issues" — pain points?
- [ ] **SCREENSHOT:** Homepage, auto-layout panel, breakpoint controls → `screenshots/01-editor/framer-*.png`

### [ ] WordPress / Elementor / Divi
- [ ] How do the major WP builders handle responsive?
- [ ] Elementor: section → column → widget model. How does it reflow?
- [ ] Custom CSS per breakpoint — how much control?
- [ ] What percentage of users struggle with responsive in WP builders?
- [ ] **SCREENSHOT:** Elementor editor, responsive mode toggle → `screenshots/01-editor/elementor-*.png`

## Comparison Table (fill ALL cells):

| Feature | Squarespace | Webflow | Wix Studio | Framer | Elementor | **Red Pine (current)** |
|---------|-------------|---------|------------|--------|-----------|----------------------|
| Layout model | ? | ? | ? | ? | ? | Absolute positioning |
| Breakpoint approach | ? | ? | ? | ? | ? | Computed per viewport |
| Edit mobile separately? | ? | ? | ? | ? | ? | Yes (manual) |
| Auto-adapt when editing desktop? | ? | ? | ? | ? | ? | Breakpoint regen on switch |
| Text reflow | ? | ? | ? | ? | ? | Font scale + height estimate |
| User positioning freedom | ? | ? | ? | ? | ? | Full (pixel-perfect) |
| Main user complaint | ? | ? | ? | ? | ? | Overlaps on viewport switch |
| Learning curve | ? | ? | ? | ? | ? | Low (chat-first) |

## Part A Analysis Required:
- [ ] What model do 3+ of these use? (that's likely the industry standard)
- [ ] What are the tradeoffs of each model for a CHAT-FIRST builder (where AI places elements, not users)?
- [ ] Is there a hybrid approach? (flow-based sections, absolute elements within sections)
- [ ] Migration path: if we should change models, what's the effort? What breaks?
- [ ] Recommendation: stay (absolute), migrate (flow), or hybrid? With reasoning.

---

## Part B: Novice-to-Pro Spectrum (One Editor, All Skill Levels)

**How do other editors serve both "just get me online" owners AND professional freelancers?**

### [ ] Squarespace — Novice vs Pro
- [ ] What's the simplest path to a live site? How many clicks from signup to published?
- [ ] "Squarespace Blueprint" / AI setup — what does it generate?
- [ ] What can a pro do that a novice can't? (custom CSS, code injection, developer mode)
- [ ] Do they have a freelancer/agency marketplace? How does it work?
- [ ] Search: "squarespace hire designer" — how do people find someone to build their site?
- [ ] **SCREENSHOT:** The simplest setup flow (step 1, step 2...) → `screenshots/01-editor/squarespace-setup-*.png`

### [ ] Wix — ADI vs Editor vs Studio
- [ ] Wix ADI (AI auto-build): what's the experience? How good are the results?
- [ ] Wix Editor (drag-and-drop): medium skill level. What can you do?
- [ ] Wix Studio (pro tool): what does it add for agencies/freelancers?
- [ ] How does Wix handle the transition? Can a novice site be "upgraded" to Studio?
- [ ] Wix Marketplace: how do freelancers offer services? Pricing? Reviews?
- [ ] Search: "wix marketplace freelancer experience" — what do freelancers say about building on Wix?
- [ ] **SCREENSHOT:** ADI flow, Editor view, Studio view (side by side if possible) → `screenshots/01-editor/wix-spectrum-*.png`

### [ ] Webflow — Pro Tool with Templates
- [ ] Webflow is pro-first. How do novices use it? (templates? Webflow Experts marketplace?)
- [ ] Webflow Experts: how does their freelancer marketplace work? Pricing? Matching?
- [ ] Can a business owner make basic edits to a Webflow site a freelancer built?
- [ ] "Editor mode" vs "Designer mode" — how do they separate novice from pro?
- [ ] Search: "webflow too complicated for clients" — what do agencies say about handoff?
- [ ] **SCREENSHOT:** Webflow Experts marketplace, Editor mode vs Designer mode → `screenshots/01-editor/webflow-spectrum-*.png`

### [ ] Shopify — Themes + Liquid + Visual Editor
- [ ] Theme editor (novice): what can owners customize without code?
- [ ] Liquid templating (pro): what can developers do with code?
- [ ] Shopify Experts marketplace: how do freelancers build Shopify stores?
- [ ] Dawn theme / Online Store 2.0: how do sections and blocks work?
- [ ] How do custom Shopify apps/sections get built and distributed?
- [ ] **SCREENSHOT:** Theme editor, Shopify Experts marketplace → `screenshots/01-editor/shopify-spectrum-*.png`

### [ ] WordPress — The Original Spectrum
- [ ] Gutenberg blocks (novice): block editor for basic content
- [ ] Page builders — Elementor/Divi (medium): drag-and-drop
- [ ] Full code (pro): custom themes, plugins, PHP
- [ ] How do freelancers work with WordPress clients? (handoff, ongoing edits, etc.)
- [ ] Plugin/block portability: how do third-party blocks work across themes?
- [ ] What makes WordPress the #1 CMS despite its complexity?

### Spectrum Comparison Table:

| Feature | Squarespace | Wix | Webflow | Shopify | WordPress | **Red Pine** |
|---------|-------------|-----|---------|---------|-----------|-------------|
| AI auto-build (zero skill) | ? | ? | ? | ? | ? | Yes (onboarding chat) |
| Visual drag-and-drop | ? | ? | ? | ? | ? | Yes (free-form editor) |
| Pre-built sections/blocks | ? | ? | ? | ? | ? | Yes (4 widget types) |
| Code access for pros | ? | ? | ? | ? | ? | No (not yet) |
| CSS customization | ? | ? | ? | ? | ? | No |
| Custom code injection | ? | ? | ? | ? | ? | No |
| Template/theme system | ? | ? | ? | ? | ? | No (AI generates from scratch) |
| Freelancer marketplace | ? | ? | ? | ? | ? | Planned |
| Client handoff (pro builds, owner edits) | ? | ? | ? | ? | ? | Not yet |
| Export/download site code | ? | ? | ? | ? | ? | No |
| Third-party components | ? | ? | ? | ? | ? | No |
| Time from signup to live site | ? | ? | ? | ? | ? | ~5 min (AI) |

### Part B Analysis Required:
- [ ] What's the pattern? Do successful editors have SEPARATE modes for novice vs pro, or one mode that scales?
- [ ] Red Pine's biggest gap for pros: no code access. How critical is this?
- [ ] For the marketplace: when a freelancer builds a site for a client, how does the CLIENT make ongoing edits? What's the handoff experience on other platforms?
- [ ] Should Red Pine have "owner mode" (simplified) and "builder mode" (full control)?
- [ ] What's the minimum pro feature set to attract freelancers? (CSS? code blocks? custom HTML sections?)

---

## Part C: Portable Components / Embeddable Widgets

**Red Pine's pre-built sections (booking, gallery, products, reviews) need to work across multiple contexts:**
1. Inside our visual editor (drag-and-drop)
2. Inside a coded page (freelancer writes HTML/CSS, embeds our booking widget)
3. Potentially on external sites (embed code for booking on an existing WordPress site)

### [ ] Shopify Sections & Blocks
- [ ] How do Shopify "sections" work? (JSON schema, Liquid template, CSS)
- [ ] Can a developer create a custom section and distribute it?
- [ ] How do third-party apps inject UI into the storefront? (App blocks, Script tags, Theme extensions)
- [ ] How portable are Shopify sections across themes?
- [ ] **SCREENSHOT:** Shopify section editor, app block in theme editor → `screenshots/01-editor/shopify-sections-*.png`

### [ ] WordPress Blocks (Gutenberg)
- [ ] How do WordPress blocks work technically? (React components registered as blocks)
- [ ] Can blocks be used across ANY WordPress theme?
- [ ] How do third-party block plugins work? (ACF Blocks, Kadence Blocks)
- [ ] Block patterns: pre-built layouts made of blocks. How are they distributed?
- [ ] What makes blocks truly portable?

### [ ] Webflow Components
- [ ] Webflow "Components" (reusable design elements): how do they work?
- [ ] Can components be shared across projects?
- [ ] Webflow Apps: how do third-party developers add functionality?
- [ ] Custom code embed within Webflow: how does it interact with their visual system?

### [ ] Embed Widgets (Calendly, Typeform, etc.)
- [ ] How does Calendly embed on ANY website? (iframe? script tag? web component?)
- [ ] How does Typeform embed? What's the integration pattern?
- [ ] How does Square Online embed booking/ordering on external sites?
- [ ] What's the standard for embeddable widgets? (iframe vs web component vs script)
- [ ] What data flows between the embed and the host page?
- [ ] **SCREENSHOT:** Calendly embed code page, Typeform embed options → `screenshots/01-editor/embed-widgets-*.png`

### [ ] Web Components Standard
- [ ] What are Web Components? (Custom Elements, Shadow DOM, HTML Templates)
- [ ] How mature is browser support?
- [ ] Do any major platforms use Web Components for their embeds?
- [ ] Could Red Pine's pre-built sections be Web Components that work ANYWHERE?
- [ ] Pros/cons vs iframe embeds

### Portability Comparison Table:

| Feature | Shopify Sections | WP Blocks | Webflow Components | Embed Widgets (Calendly) | **Red Pine Sections** |
|---------|-----------------|-----------|-------------------|-------------------------|---------------------|
| Works in visual editor | ? | ? | ? | N/A | Yes |
| Works in code context | ? | ? | ? | ? | Not yet |
| Embeddable on external sites | ? | ? | ? | ? | Not yet |
| Carries real data (appointments, products) | ? | ? | ? | ? | Yes (Supabase) |
| Customizable appearance | ? | ? | ? | ? | Limited |
| Self-contained (no dependencies) | ? | ? | ? | ? | No (needs React) |
| Standard format (Web Component, iframe, etc.) | ? | ? | ? | ? | React component |

### Part C Analysis Required:
- [ ] What's the best approach for making Red Pine sections portable?
  - Option A: **Web Components** — works anywhere, zero dependencies, Shadow DOM isolates styles
  - Option B: **iframe embeds** — simplest, most compatible, but limited communication with host page
  - Option C: **Script tag + render target** — like Calendly. A `<script>` tag + a `<div id="redpine-booking">` container
  - Option D: **React components published to npm** — only works in React projects
- [ ] Which approach lets a freelancer most easily embed a Red Pine booking widget in custom code?
- [ ] Which approach lets a business owner embed booking on their existing WordPress/Squarespace site?
- [ ] What data does the embed need from the host? (business ID, styling, user auth?)
- [ ] Is this the same architecture as "Shopify Buy Button" (embed checkout anywhere)?

---

## Final Topic 1 Synthesis:

After completing Parts A, B, and C, write a final section that answers:

1. **Architecture recommendation:** What responsive model should Red Pine use? With migration plan if needed.
2. **Spectrum strategy:** How should Red Pine handle novice owners vs pro freelancers? One mode or two?
3. **Portability roadmap:** What's the path to making pre-built sections work as embeddable widgets?
4. **Priority order:** What should we build FIRST to serve the most users?
5. **Red Pine's moat:** Given all this research, what makes Red Pine's editor uniquely valuable? (AI-first + business OS + marketplace + portable sections = what exactly?)

**Output file:** `research-results/01-editor-responsive-model.md`

---

# TOPIC 2: All-in-One Platform Playbook

**Core question:** How do successful platforms go from niche tool to all-in-one without being mediocre at everything?

## Platform Checklist (research EACH one):

### [ ] Shopify (e-commerce → everything)
- [ ] Timeline: when did they launch each major feature? (POS, payments, email, shipping, capital, app store)
- [ ] What was the core loop they nailed first?
- [ ] Revenue breakdown: what % from subscriptions vs payments vs app store?
- [ ] How many apps in their marketplace? What are the top-selling categories?
- [ ] How did they decide build vs partner vs acquire?
- [ ] What did they intentionally NOT build? Why?

### [ ] Toast (restaurant POS → platform)
- [ ] Started as just POS — what did they add and in what order?
- [ ] Pricing model: hardware + software + payments
- [ ] What % of restaurants use Toast for everything vs just POS?
- [ ] What's their "lock-in" — what makes it hard to leave?
- [ ] Revenue per customer and growth trajectory

### [ ] Mindbody (booking → fitness platform)
- [ ] Started as booking software — what expanded?
- [ ] Consumer marketplace: how does the B2C side (Mindbody app) drive B2B value?
- [ ] Pricing tiers and what's in each
- [ ] Biggest complaints from studio owners
- [ ] What competitors are eating their lunch? (ClassPass, Vagaro, etc.)

### [ ] HoneyBook (CRM → creative business OS)
- [ ] Feature expansion timeline
- [ ] How do they handle industry-specific needs vs staying generic?
- [ ] Smart files / proposals — what's their differentiator?
- [ ] Pricing and packaging strategy
- [ ] User reviews: what do people love/hate?

### [ ] Jobber (field service scheduling → platform)
- [ ] Feature set: quoting, scheduling, invoicing, payments, CRM, GPS
- [ ] How do they handle different trade types (plumber vs cleaner vs landscaper)?
- [ ] Pricing tiers and feature gates
- [ ] Mobile app quality (critical for field service)
- [ ] Integration strategy: QuickBooks, Stripe, Mailchimp — what's native vs integrated?

### [ ] Square (payments → everything)
- [ ] Expansion path: POS → appointments → payroll → banking → online store → marketing
- [ ] How did payments-first give them an advantage?
- [ ] Square for Restaurants vs Square for Retail vs Square Appointments — how do they segment?
- [ ] Free tier strategy: what's free and why?
- [ ] What's their TAM and market share per vertical?

## Pattern Analysis Table:

| Platform | Started as | Core loop | Expansion order | Build vs Buy vs Partner | Lock-in mechanism | Revenue model |
|----------|-----------|-----------|----------------|------------------------|------------------|---------------|
| Shopify | ? | ? | ? | ? | ? | ? |
| Toast | ? | ? | ? | ? | ? | ? |
| Mindbody | ? | ? | ? | ? | ? | ? |
| HoneyBook | ? | ? | ? | ? | ? | ? |
| Jobber | ? | ? | ? | ? | ? | ? |
| Square | ? | ? | ? | ? | ? | ? |

## Analysis Required:
- [ ] What's the common pattern? (most start with scheduling, payments, or CRM?)
- [ ] What's Red Pine's current core loop? Is it strong enough to expand from?
- [ ] What should Red Pine build NEXT based on these patterns?
- [ ] What should Red Pine explicitly NOT build (yet)?
- [ ] The "Shopify model": core platform + marketplace of add-ons. Does this work for SMB SaaS?

**Output file:** `research-results/02-all-in-one-architecture.md`

---

# TOPIC 3: Salon & Beauty Deep Dive

**Core question:** What do salon owners actually need that Red Pine currently lacks?

## Platform Checklist:

### [ ] Vagaro
- [ ] Full feature list (visit their features page, list everything)
- [ ] Pricing tiers (exact numbers)
- [ ] Booking flow: how does a client book? Walk through it step by step
- [ ] Staff management: commission splits, chair rental, tip distribution
- [ ] POS: do they require their own hardware?
- [ ] Marketing tools: email, SMS, automated campaigns
- [ ] Search G2/Capterra: top 5 complaints from real users (quote them)
- [ ] What's their mobile app like? (client-facing AND business-facing)

### [ ] Fresha
- [ ] Unique model: FREE software, charges per transaction. How does this work?
- [ ] Feature comparison vs Vagaro
- [ ] Marketplace: how do they acquire clients for businesses?
- [ ] Payment processing: what are the fees?
- [ ] Search: "fresha hidden fees" or "fresha complaints" — real user feedback

### [ ] GlossGenius
- [ ] Target market: independent stylists vs multi-chair salons?
- [ ] Pricing and packaging
- [ ] Custom branded website included? What does it look like?
- [ ] Payment hardware: their own card reader?
- [ ] What makes them different from Vagaro/Fresha?
- [ ] User reviews: what do indie stylists love about it?

### [ ] Booksy
- [ ] How is it different from Vagaro? What's the angle?
- [ ] Consumer marketplace (Booksy app) — similar to Mindbody?
- [ ] Pricing
- [ ] Geographic focus (US? Europe? Global?)
- [ ] Reviews and complaints

### [ ] Boulevard
- [ ] Enterprise-focused? What makes them the "premium" option?
- [ ] Features that smaller platforms don't have
- [ ] Pricing (they gate it — find any info available)
- [ ] Target: multi-location salons and spas
- [ ] What sets them apart?

## Feature Comparison Matrix:

| Feature | Vagaro | Fresha | GlossGenius | Booksy | Boulevard | **Red Pine** |
|---------|--------|--------|-------------|--------|-----------|-------------|
| Online booking | ? | ? | ? | ? | ? | Yes (basic) |
| Walk-in management | ? | ? | ? | ? | ? | No |
| Service stacking (combo booking) | ? | ? | ? | ? | ? | No |
| Chair/room rental management | ? | ? | ? | ? | ? | No |
| Commission tracking | ? | ? | ? | ? | ? | No |
| Tip management | ? | ? | ? | ? | ? | No |
| Product retail / inventory | ? | ? | ? | ? | ? | Basic |
| Client preferences & notes | ? | ? | ? | ? | ? | Notes only |
| Before/after photos | ? | ? | ? | ? | ? | No |
| Automated review requests | ? | ? | ? | ? | ? | No |
| Loyalty / rewards program | ? | ? | ? | ? | ? | No |
| No-show protection (deposits) | ? | ? | ? | ? | ? | No |
| SMS reminders | ? | ? | ? | ? | ? | Stubbed |
| Email marketing | ? | ? | ? | ? | ? | No |
| POS / in-store payments | ? | ? | ? | ? | ? | No |
| Staff scheduling (availability) | ? | ? | ? | ? | ? | Basic |
| Payroll | ? | ? | ? | ? | ? | No |
| Custom website included | ? | ? | ? | ? | ? | Yes |
| Client portal | ? | ? | ? | ? | ? | Yes |
| Mobile app (business) | ? | ? | ? | ? | ? | No (web only) |
| Mobile app (client) | ? | ? | ? | ? | ? | No (web only) |
| Pricing (monthly) | ? | ? | ? | ? | ? | $29/mo |

## Analysis Required:
- [ ] What are the TOP 5 features salon owners can't live without?
- [ ] What's the minimum viable salon feature set for Red Pine?
- [ ] What can we implement in 2 weeks vs 2 months vs 6 months?
- [ ] Where does Red Pine's website builder give us an ADVANTAGE these platforms don't have?
- [ ] Pricing analysis: at $29/mo are we underpriced, overpriced, or competitive?

**Output file:** `research-results/03-salon-beauty.md`

---

# TOPIC 4: Fitness & Wellness Deep Dive

**Core question:** What does a gym/studio/yoga space need that goes beyond basic scheduling?

## Platform Checklist:

### [ ] Mindbody
- [ ] Full feature list, pricing tiers (exact $)
- [ ] Class scheduling: recurring, waitlists, capacity, subs
- [ ] Memberships: types, billing, freeze/cancel, family
- [ ] Consumer marketplace: Mindbody app installs, how it drives bookings
- [ ] Reporting: what metrics do studios track?
- [ ] G2/Capterra: top complaints (quote real reviews)
- [ ] Integrations: what do studios connect to Mindbody?

### [ ] Vagaro (fitness angle)
- [ ] How does Vagaro serve fitness vs salon differently?
- [ ] Class vs appointment booking differences
- [ ] Pricing for fitness specifically

### [ ] Zen Planner / PushPress
- [ ] CrossFit/boutique gym focused — what specific features?
- [ ] WOD tracking, performance benchmarks
- [ ] Membership management
- [ ] Community features
- [ ] Pricing

### [ ] WellnessLiving
- [ ] How do they position vs Mindbody?
- [ ] Features unique to WellnessLiving
- [ ] Pricing (cheaper than Mindbody?)
- [ ] Reviews and complaints

### [ ] Momoyoga / Momence
- [ ] Yoga/pilates specific — what's different?
- [ ] Teacher management
- [ ] Pricing
- [ ] Simple vs complex: where do they sit?

## Feature Matrix:

| Feature | Mindbody | Vagaro | Zen Planner | WellnessLiving | Momoyoga | **Red Pine** |
|---------|----------|--------|-------------|----------------|----------|-------------|
| Recurring class scheduling | ? | ? | ? | ? | ? | Planned |
| Waitlists | ? | ? | ? | ? | ? | No |
| Class check-in (QR/kiosk) | ? | ? | ? | ? | ? | Planned |
| Memberships (monthly) | ? | ? | ? | ? | ? | No |
| Class packs / punch cards | ? | ? | ? | ? | ? | No |
| Drop-in pricing | ? | ? | ? | ? | ? | No |
| Family/household accounts | ? | ? | ? | ? | ? | No |
| Membership freeze/cancel | ? | ? | ? | ? | ? | No |
| Instructor pay tracking | ? | ? | ? | ? | ? | No |
| Substitute management | ? | ? | ? | ? | ? | No |
| Attendance history | ? | ? | ? | ? | ? | Planned |
| Retention/churn metrics | ? | ? | ? | ? | ? | No |
| Consumer marketplace app | ? | ? | ? | ? | ? | No |
| Automated review requests | ? | ? | ? | ? | ? | No |
| Challenges/leaderboards | ? | ? | ? | ? | ? | No |
| Zoom/virtual class integration | ? | ? | ? | ? | ? | No |
| Staff mobile app | ? | ? | ? | ? | ? | No |
| Pricing (monthly) | ? | ? | ? | ? | ? | $29/mo |

## Analysis Required:
- [ ] What's the #1 reason studios choose Mindbody over cheaper alternatives?
- [ ] What's the minimum viable feature set for a yoga studio vs a CrossFit box vs a traditional gym?
- [ ] Our recurring classes + attendance plan (see `memory/recurring-classes-attendance.md`) — does it cover the basics?
- [ ] What's the biggest gap between our plan and what studios actually need?

**Output file:** `research-results/04-fitness-wellness.md`

---

# TOPIC 5: Professional Services

**Core question:** Can Red Pine serve law firms, accounting firms, and consultants?

## Platform Checklist:

### [ ] Clio (Law)
- [ ] Feature list, pricing tiers
- [ ] Case/matter management
- [ ] Time tracking + billable hours
- [ ] Trust accounting (IOLTA compliance)
- [ ] Client portal: Clio for Clients
- [ ] Document management + e-signatures
- [ ] Court date tracking / deadlines
- [ ] G2 reviews: complaints

### [ ] Karbon (Accounting)
- [ ] Workflow management for accountants
- [ ] Client task management
- [ ] Email integration (triage system)
- [ ] Tax season workflow templates
- [ ] Pricing
- [ ] Reviews

### [ ] HoneyBook (Creative professionals)
- [ ] Smart files (proposals + contracts + invoices in one)
- [ ] Booking flow for creatives
- [ ] Pricing
- [ ] What makes creatives choose HoneyBook over generic tools?

### [ ] Dubsado (Freelancers)
- [ ] Forms, contracts, invoicing
- [ ] Automation workflows (canned emails, auto-follow-ups)
- [ ] Pricing (one-time vs subscription)
- [ ] How does it differ from HoneyBook?

## Analysis Required:
- [ ] Professional services are VERY different from salon/fitness — is it realistic for Red Pine to serve them?
- [ ] What's universal across all professional services? (CRM, invoicing, scheduling, client portal)
- [ ] What's too niche to build? (trust accounting, court dates, tax workflows)
- [ ] Honest assessment: should Red Pine target professional services at all, or focus elsewhere?

**Output file:** `research-results/05-professional-services.md`

---

# TOPIC 6: Home Services & Trades

**Core question:** Can Red Pine serve plumbers, electricians, cleaners, landscapers?

## Platform Checklist:

### [ ] Jobber
- [ ] Full features, pricing
- [ ] Quote → schedule → invoice → payment flow
- [ ] Mobile app (critical — techs are in the field)
- [ ] GPS tracking / route optimization
- [ ] Client hub (their portal)
- [ ] Reviews and complaints

### [ ] Housecall Pro
- [ ] How does it differ from Jobber?
- [ ] Pricing comparison
- [ ] Marketing features (postcard campaigns, review management)
- [ ] Financing options for customers

### [ ] ServiceTitan
- [ ] Enterprise-level — what do they have that Jobber doesn't?
- [ ] Pricing (expensive — find actual numbers)
- [ ] Why do large HVAC/plumbing companies choose this?

### [ ] GorillaDesk / Launch27
- [ ] Niche: pest control (GorillaDesk), cleaning (Launch27)
- [ ] What niche features matter?
- [ ] Pricing

## Analysis Required:
- [ ] Home services NEED a mobile app — techs are on job sites. Is web-only a dealbreaker?
- [ ] Quote → job → invoice pipeline — how does this map to Red Pine's current pipeline view?
- [ ] GPS/dispatching — is this realistic for Red Pine or completely out of scope?
- [ ] What's the minimum viable feature set for a cleaning company? A landscaper? An electrician?

**Output file:** `research-results/06-home-services-trades.md`

---

# TOPIC 7: Restaurants & Food Service

**Core question:** Can Red Pine serve restaurants without POS hardware?

## Platform Checklist:

### [ ] Toast
- [ ] Full feature set (hardware + software)
- [ ] Pricing (free tier, what's included)
- [ ] Online ordering system details
- [ ] Kitchen display system
- [ ] Why restaurants choose Toast

### [ ] Square for Restaurants
- [ ] Free tier vs paid
- [ ] How it differs from generic Square
- [ ] Online ordering
- [ ] Menu management

### [ ] ChowNow / Olo
- [ ] Online ordering specialists — what do they do better than Toast?
- [ ] Commission-free model
- [ ] Integration with existing POS

### [ ] Clover
- [ ] How does it compare to Toast/Square?
- [ ] Restaurant-specific features

## Analysis Required:
- [ ] POS is the center of a restaurant — without it, can Red Pine add any value?
- [ ] Online ordering is the one area we COULD compete. What's the minimum viable online ordering system?
- [ ] What about food trucks, ghost kitchens, bakeries, cafes — do they need POS or just online ordering?
- [ ] Honest recommendation: is restaurant a viable vertical for Red Pine, or should we skip it?

**Output file:** `research-results/07-restaurants-food.md`

---

# TOPIC 8: AI-First Website Builders

**Core question:** Where does Red Pine's chat-first approach win vs AI-native builders?

## Platform Checklist:

### [ ] Durable.co
- [ ] What does it generate? (visit, try if possible)
- [ ] Pricing
- [ ] Editing after generation — how much control?
- [ ] CRM, invoicing, forms — is it a platform or just a site builder?
- [ ] User reviews: complaints about limitations

### [ ] Mixo
- [ ] One-shot site generation — landing pages
- [ ] Pricing
- [ ] Customization after generation
- [ ] Target audience

### [ ] 10Web AI / Hostinger AI
- [ ] WordPress-based AI builders
- [ ] How much of the site does AI build vs template?
- [ ] Pricing
- [ ] Quality of generated sites

### [ ] Wix ADI
- [ ] How does Wix's AI builder compare to their manual editor?
- [ ] What % of users use ADI vs manual?
- [ ] Limitations of ADI

### [ ] Framer AI
- [ ] AI features within Framer
- [ ] How does AI-assisted differ from AI-generated?

## Comparison Matrix:

| Feature | Durable | Mixo | 10Web | Wix ADI | Framer AI | **Red Pine** |
|---------|---------|------|-------|---------|-----------|-------------|
| AI generates full site | ? | ? | ? | ? | ? | Yes (onboarding) |
| AI edits existing page | ? | ? | ? | ? | ? | Yes (chat editor) |
| Built-in CRM | ? | ? | ? | ? | ? | Yes |
| Built-in booking | ? | ? | ? | ? | ? | Yes |
| Built-in invoicing | ? | ? | ? | ? | ? | Yes |
| Chat-first editing | ? | ? | ? | ? | ? | Yes |
| Custom domain | ? | ? | ? | ? | ? | Yes (subdomain) |
| Client portal | ? | ? | ? | ? | ? | Yes |
| Pricing | ? | ? | ? | ? | ? | $29/mo |
| Target market | ? | ? | ? | ? | ? | SMB (all industries) |

## Analysis Required:
- [ ] Red Pine = AI site BUILDER + full business OS. Most AI builders are JUST sites. Is that our moat?
- [ ] What do users actually want from AI — one-shot generation or ongoing editing assistant?
- [ ] Are any of these competitors building toward a full business OS like us?
- [ ] What marketing language resonates? How do these competitors describe themselves?

**Output file:** `research-results/08-ai-first-builders.md`

---

# TOPIC 9: Marketplace & Agent Monetization

**Core question:** How should we price AI agents and marketplace items?

## Platform Checklist:

### [ ] Shopify App Store
- [ ] Revenue share model (what % does Shopify take?)
- [ ] Top 10 paid apps: what are they, what do they cost?
- [ ] Free vs paid ratio
- [ ] How much do top app developers earn?
- [ ] App review/approval process

### [ ] Intercom Fin / Zendesk AI
- [ ] AI agent pricing model (per resolution? per seat? flat?)
- [ ] What do customers pay monthly for AI features?
- [ ] Adoption rates — what % of customers use AI features?
- [ ] ROI they claim for businesses

### [ ] HubSpot Marketplace
- [ ] Free vs paid integrations
- [ ] Revenue share model
- [ ] What categories exist?

### [ ] Salesforce AppExchange
- [ ] Enterprise pricing for AI add-ons (Einstein AI)
- [ ] Revenue model for third-party apps

## Analysis Required:
- [ ] For Red Pine's FIRST-PARTY agents ($15-20/mo each), is per-agent subscription the right model?
- [ ] Should some agents be free to drive platform adoption?
- [ ] Usage-based (per-task, per-message) vs flat subscription — what works better for SMB?
- [ ] What's the realistic monthly ARPU we should target? ($29 base + $X agents = $Y total)
- [ ] When should we open the marketplace to third-party developers?

**Output file:** `research-results/09-marketplace-monetization.md`

---

# TOPIC 10: Client Portal Best Practices

**Core question:** What makes a portal that clients actually use (not ignore)?

## Platform Checklist:

### [ ] Clio for Clients (Legal)
- [ ] What can clients do? (view case, share docs, pay, message)
- [ ] Adoption rate — do clients actually use it?
- [ ] Mobile experience

### [ ] HoneyBook Client View
- [ ] Walk through a client's experience from proposal to payment
- [ ] How branded is it?
- [ ] What do clients say about it?

### [ ] Jobber Client Hub
- [ ] What can clients do? (approve quotes, pay, request service)
- [ ] Self-service capabilities
- [ ] Reviews

### [ ] Mindbody Consumer App
- [ ] The consumer-facing marketplace
- [ ] How it drives bookings for businesses
- [ ] User reviews of the app

## Analysis Required:
- [ ] What 3 actions do clients do most in portals? (pay, book, message?)
- [ ] Red Pine has: magic-link login, data view, checkout. What's missing?
- [ ] Should we build a consumer-facing marketplace (like Mindbody app) to help businesses get discovered?
- [ ] Push notifications, SMS reminders — what drives portal engagement?
- [ ] White-label branding: how important is it that the portal looks like THEIR business, not Red Pine?

**Output file:** `research-results/10-client-portal.md`

---

---

# TOPIC 11: Freelancer Marketplace — The Owner-to-Pro Pipeline

**Core question:** How should Red Pine connect business owners who need websites with freelancers who build them?

This is a potential game-changer: owner signs up → AI builds a basic site → owner wants more → hires a freelancer THROUGH Red Pine → freelancer builds in our editor or brings code → owner pays through our platform. Red Pine takes a cut. Everyone wins.

## Competitor Marketplaces to Research:

### [ ] Webflow Experts
- [ ] How does matching work? (owner posts project? browses freelancers? algorithm?)
- [ ] What does a freelancer profile look like? Portfolio, pricing, reviews?
- [ ] What's the fee structure? Does Webflow take a cut?
- [ ] How does the handoff work? Freelancer builds → owner gets access to edit?
- [ ] Can freelancers set recurring maintenance retainers?
- [ ] How many Experts are on the platform? Average project size?
- [ ] Search: "webflow experts experience" from freelancer perspective
- [ ] **SCREENSHOT:** Experts marketplace browse page, freelancer profile, project post flow → `screenshots/11-marketplace/webflow-experts-*.png`

### [ ] Wix Marketplace
- [ ] Same questions as Webflow Experts
- [ ] How does Wix vet freelancers?
- [ ] Pricing transparency: are prices listed or negotiated?
- [ ] **SCREENSHOT:** Marketplace browse, freelancer profile → `screenshots/11-marketplace/wix-marketplace-*.png`

### [ ] Shopify Experts
- [ ] Categories: setup, design, development, marketing
- [ ] How do stores find and hire Experts?
- [ ] Pricing: per project? Hourly?
- [ ] What makes top Shopify Experts successful?
- [ ] **SCREENSHOT:** Experts directory, project categories → `screenshots/11-marketplace/shopify-experts-*.png`

### [ ] Fiverr / Upwork (general freelancer platforms)
- [ ] How do they handle website design gigs specifically?
- [ ] What platforms do freelancers build on? (WordPress, Wix, custom code)
- [ ] Average price for a small business website on Fiverr? On Upwork?
- [ ] Pain points: what do business owners complain about when hiring freelancers for websites?
- [ ] Pain points: what do freelancers complain about on these platforms?

### [ ] 99designs / Dribbble Hiring
- [ ] Design-specific marketplaces
- [ ] Contest model vs direct hire
- [ ] How do they handle the design-to-development gap?

### [ ] Squarespace Circle (agency/freelancer program)
- [ ] Not a marketplace but a partner program — how does it work?
- [ ] What perks do freelancers get?
- [ ] How do they refer clients to Circle members?

## The Red Pine Advantage to Validate:

Red Pine is unique because the freelancer works INSIDE the same platform the owner already uses. No migration. No "here's a ZIP file of your site." The freelancer logs in, builds/improves the site, and the owner sees it live. The pre-built sections (booking, products, reviews) are already connected to the owner's real data.

Research questions:
- [ ] On other platforms, what's the #1 friction point in the owner-freelancer handoff?
- [ ] How do freelancers currently handle the "client wants to edit after I'm done" problem?
- [ ] What % of small businesses hire someone to build their website vs doing it themselves?
- [ ] What's the average spend on a freelancer-built small business website?
- [ ] Do freelancers prefer working in a platform's editor or their own tools?
- [ ] What would make a freelancer CHOOSE to work in Red Pine's editor over WordPress/Webflow?

## Feature Requirements Table:

| Feature | Webflow Experts | Wix Marketplace | Shopify Experts | Fiverr/Upwork | **Red Pine (needed)** |
|---------|----------------|-----------------|-----------------|---------------|---------------------|
| Freelancer profiles + portfolios | ? | ? | ? | ? | Not built |
| Project posting by owners | ? | ? | ? | ? | Not built |
| Matching/discovery | ? | ? | ? | ? | Not built |
| In-platform payment/escrow | ? | ? | ? | ? | Stripe exists |
| Freelancer works in same editor | ? | ? | ? | N/A | Yes (our edge) |
| Owner can edit after handoff | ? | ? | ? | ? | Yes (our edge) |
| Review/rating system | ? | ? | ? | ? | Not built |
| Platform commission | ? | ? | ? | ? | TBD |
| Ongoing maintenance retainers | ? | ? | ? | ? | Not built |
| Template/theme marketplace (freelancer sells pre-built designs) | ? | ? | ? | N/A | Not built |

## Analysis Required:
- [ ] What's the minimum viable freelancer marketplace for Red Pine?
- [ ] Should we start with a marketplace (two-sided) or a directory (list of approved freelancers)?
- [ ] What commission should Red Pine charge? (compare: Fiverr 20%, Upwork 10-20%, Webflow/Wix ?)
- [ ] Should freelancers also be able to sell TEMPLATES through the marketplace?
- [ ] What editor features do we need to add FIRST to attract freelancers? (code access? CSS? custom HTML?)
- [ ] Revenue opportunity: if 20% of Red Pine owners hire a freelancer at avg $500, and we take 15%... what's the math?

**Output file:** `research-results/11-freelancer-marketplace.md`

---

# TOPIC 12: Discounts, Coupons & Specials — Promotion Engine

**Core question:** How do platforms let business owners create and manage promotions, and how do customers redeem them?

Every business runs promotions — salons do "first visit 20% off," restaurants run happy hour specials, gyms offer "first month free," event centers have early bird pricing, freelancers give referral discounts. Red Pine needs a promotion system that works across ALL industries.

## Promotion Types to Understand:

| Promo Type | Example | Industries That Use It |
|------------|---------|----------------------|
| **Percentage off** | 20% off first visit | Salon, spa, fitness, all |
| **Dollar amount off** | $10 off next service | Salon, home services, all |
| **BOGO** | Buy 1 class, get 1 free | Fitness, salon, retail |
| **First-time discount** | First haircut 50% off | Salon, fitness, all |
| **Referral code** | "Refer a friend, both get $15 off" | All |
| **Happy hour / time-based** | 30% off appointments before noon | Salon, restaurant, spa |
| **Seasonal / holiday** | Valentine's Day couples massage deal | Spa, salon, restaurant |
| **Package / bundle** | 5 classes for the price of 4 | Fitness, martial arts |
| **Early bird** | $20 off if booked 2 weeks ahead | Events, classes |
| **Loyalty / punch card** | 10th visit free | Salon, coffee, fitness |
| **Flash sale** | 24-hour 40% off | Retail, services |
| **Student / military / senior** | 15% off with ID | All |
| **Gift cards / certificates** | $50 gift card for $40 | All |
| **Membership discount** | Members get 10% off retail | Fitness, salon |

## Platform Checklist (research EACH one):

### [ ] Square
- [ ] How do owners create discounts? (dashboard flow — screenshot it)
- [ ] Discount types supported (%, $, BOGO, automatic vs manual)
- [ ] Coupon codes: can owners create custom codes? Character limits? Expiration?
- [ ] How are discounts applied? (POS? Online checkout? Both?)
- [ ] Loyalty program: how does Square Loyalty work? Pricing?
- [ ] Gift cards: digital vs physical? Pricing?
- [ ] Reporting: can owners see which promos perform best?
- [ ] **SCREENSHOT:** Discount creation flow, loyalty setup, coupon management → `screenshots/12-promos/square-*.png`

### [ ] Shopify
- [ ] Discount code creation flow (types: %, $, free shipping, buy X get Y)
- [ ] Automatic discounts vs manual codes
- [ ] Stacking rules: can customers combine discounts?
- [ ] Usage limits (per customer, total uses, minimum purchase)
- [ ] Expiration dates, scheduling (start/end times)
- [ ] How discounts display on the storefront
- [ ] Shopify Scripts (Shopify Plus) — advanced promo logic
- [ ] **SCREENSHOT:** Discount creation page, storefront display → `screenshots/12-promos/shopify-*.png`

### [ ] Vagaro (salon promos)
- [ ] How do salons create specials? (daily deals, packages, gift certificates)
- [ ] Discount display on booking page
- [ ] Membership pricing / recurring discounts
- [ ] Referral program setup
- [ ] Deal/coupon campaigns (email + SMS)
- [ ] **SCREENSHOT:** Deal creation, booking page with promo → `screenshots/12-promos/vagaro-*.png`

### [ ] Mindbody (fitness promos)
- [ ] Intro offers (first class free, first month discounted)
- [ ] Class pack pricing vs single-class pricing
- [ ] Promotional pricing for memberships
- [ ] Flash sales / limited-time offers
- [ ] How promos show up in the consumer Mindbody app
- [ ] **SCREENSHOT:** Promo setup, consumer app promo display → `screenshots/12-promos/mindbody-*.png`

### [ ] Toast / Square for Restaurants
- [ ] Happy hour pricing setup
- [ ] Daily specials management
- [ ] Coupon/promo code at checkout
- [ ] Loyalty points system
- [ ] How specials display on the online ordering menu
- [ ] **SCREENSHOT:** Specials setup, online ordering promo display → `screenshots/12-promos/toast-*.png`

### [ ] Stripe Coupons & Promotions
- [ ] Stripe Coupons API: how does it work? (percent_off, amount_off, duration)
- [ ] Promotion Codes: customer-facing codes linked to coupons
- [ ] Can coupons apply to subscriptions? One-time payments? Both?
- [ ] Redemption limits, expiration, first-time-only restrictions
- [ ] How does this integrate with Stripe Checkout?
- [ ] **This is critical** — Red Pine uses Stripe. We should build on Stripe's native coupon system.

### [ ] GoHighLevel / HubSpot (CRM promos)
- [ ] Do CRM platforms have built-in promo engines?
- [ ] How do they tie promos to marketing campaigns (email/SMS)?
- [ ] Workflow automation: "client hasn't visited in 30 days → send 20% off coupon"
- [ ] Tracking: which promos drove the most revenue?

## Comparison Table (fill ALL cells):

| Feature | Square | Shopify | Vagaro | Mindbody | Toast | Stripe API | **Red Pine** |
|---------|--------|---------|--------|----------|-------|------------|-------------|
| % discount | ? | ? | ? | ? | ? | ? | No |
| $ amount off | ? | ? | ? | ? | ? | ? | No |
| Coupon codes | ? | ? | ? | ? | ? | ? | No |
| Auto-apply discounts | ? | ? | ? | ? | ? | ? | No |
| BOGO | ? | ? | ? | ? | ? | ? | No |
| Time-based (happy hour) | ? | ? | ? | ? | ? | ? | No |
| First-time customer | ? | ? | ? | ? | ? | ? | No |
| Referral codes | ? | ? | ? | ? | ? | ? | No |
| Loyalty / punch card | ? | ? | ? | ? | ? | ? | No |
| Gift cards | ? | ? | ? | ? | ? | ? | No |
| Package / bundle pricing | ? | ? | ? | ? | ? | ? | No |
| Usage limits (per customer) | ? | ? | ? | ? | ? | ? | No |
| Expiration dates | ? | ? | ? | ? | ? | ? | No |
| Stacking rules | ? | ? | ? | ? | ? | ? | No |
| Promo performance analytics | ? | ? | ? | ? | ? | ? | No |
| Display on website/portal | ? | ? | ? | ? | ? | N/A | No |
| SMS/email campaign tie-in | ? | ? | ? | ? | ? | N/A | No |
| Pricing for promo features | ? | ? | ? | ? | ? | Free (API) | N/A |

## Analysis Required:
- [ ] What promo types do 80% of SMBs use? (Pareto — focus on the most common ones first)
- [ ] Stripe Coupons API — can we build on this directly? What does it handle vs what we need to build ourselves?
- [ ] How should promos display on the website? (banner? badge on services? dedicated "Specials" section?)
- [ ] How should promos display in the portal? (client sees "You have a 20% off coupon")
- [ ] Automation opportunity: "No visit in 30 days → auto-generate win-back coupon" — how do competitors do this?
- [ ] Should promo creation be in the dashboard (manual) AND in AI chat ("Create a 20% off coupon for new clients")?
- [ ] Database design: do we need a `promotions` table, `coupons` table, or extend `invoices`?
- [ ] How do promos interact with Stripe Connect? (owner's connected account needs the coupon, not Red Pine's)
- [ ] Gift cards: digital-only for MVP? How does the balance system work?
- [ ] Loyalty: simple punch card (10th visit free) vs points system — which is MVP?

## Architecture Considerations for Red Pine:

Since we use Stripe:
1. **Stripe Coupons** → create coupon objects on the owner's connected account
2. **Stripe Promotion Codes** → customer-facing codes linked to coupons
3. **Apply at checkout** → Stripe handles the math (discount amount, tax recalculation)
4. **Track redemptions** → Stripe tracks usage, we mirror in our DB for analytics

What we'd need to build ourselves:
- Dashboard UI for owners to create/manage promos
- AI chat: "Create a Valentine's Day special" → creates coupon + promo code
- Website display: "Specials" banner or badge on services
- Portal display: "You have 1 available coupon"
- Automated campaigns: trigger coupons based on client behavior
- Loyalty tracking: visit count / points → auto-generate reward coupon

**Output file:** `research-results/12-discounts-coupons-specials.md`

---

## Progress Tracker

| # | Topic | Status | Output File |
|---|-------|--------|-------------|
| 1 | Editor — Architecture, Spectrum, Portability | Not started | `01-editor-responsive-model.md` |
| 2 | All-in-One Platform Playbook | Not started | `02-all-in-one-architecture.md` |
| 3 | Salon & Beauty Deep Dive | Not started | `03-salon-beauty.md` |
| 4 | Fitness & Wellness Deep Dive | Not started | `04-fitness-wellness.md` |
| 5 | Professional Services | Not started | `05-professional-services.md` |
| 6 | Home Services & Trades | Not started | `06-home-services-trades.md` |
| 7 | Restaurants & Food Service | Not started | `07-restaurants-food.md` |
| 8 | AI-First Website Builders | Not started | `08-ai-first-builders.md` |
| 9 | Marketplace & Agent Monetization | Not started | `09-marketplace-monetization.md` |
| 10 | Client Portal Best Practices | Not started | `10-client-portal.md` |
| 11 | Freelancer Marketplace Pipeline | Not started | `11-freelancer-marketplace.md` |
| 12 | Discounts, Coupons & Specials | Not started | `12-discounts-coupons-specials.md` |

---

*Created: February 20, 2026*
*Estimated total research time: 6-8 hours across all topics*
*Topic 1 alone (editor deep dive): 1.5-2 hours — it has 3 parts*
*Topics 2-11: 30-45 minutes each*
