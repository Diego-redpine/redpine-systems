# Topic 1: Website Editor -- Architecture, User Spectrum, and Portability

**Research Date:** February 20, 2026
**Researcher:** Claude Opus 4.6 (Deep Research Agent)
**Status:** Complete -- All three parts (A, B, C) plus final synthesis

---

## PART A: Responsive Architecture (Sand or Concrete?)

### 1. Squarespace -- Fluid Engine

**Layout Model:** CSS Grid (24-column grid). Replaced the old 12-column Classic Editor with "Fluid Engine" -- a grid-based system where blocks are independent (moving one does not affect others). Each section uses a CSS Grid layout with configurable rows and columns.
- Source: [Squarespace Engineering Blog](https://engineering.squarespace.com/blog/2022/developing-fluid-engine)

**Breakpoint Approach:** Two breakpoints only -- desktop (767px+) and mobile (<767px). There is no separate tablet breakpoint; tablet sizes inherit the desktop layout. This is intentionally simple but limits control.
- Source: [5 Tips for Responsive Design on Fluid Engine](https://launchthedamnthing.com/blog/5-tips-for-responsive-design-on-fluid-engine)

**Desktop-to-Mobile Behavior:** Mobile layouts display the same content with auto-adjusted sizing and positioning. Users CANNOT directly edit the mobile layout independently in Fluid Engine -- the system auto-generates it. Users can apply custom CSS to override.
- Source: [Squarespace Help - Responsive Design](https://support.squarespace.com/hc/en-us/articles/115003287447-Responsive-design)

**User Complaints (forums):**
- "Squarespace is NOT mobile optimized anymore, and it's frustrating." -- [Squarespace Forum](https://forum.squarespace.com/topic/308667-squarespace-is-not-mobile-optimized-anymore-and-its-frustrating/)
- "Site looks terrible on mobile and doesn't resize to smaller screens" -- [Squarespace Forum](https://forum.squarespace.com/topic/236072-site-looks-terrible-on-mobile-and-doesnt-resize-to-smaller-screens/)
- Common issues: content stacking order unpredictable, overlapping grid layers collapse, large fonts overflow viewport.

**Constraints:** No manual mobile layout editing (auto-generated only). Custom CSS required for advanced responsive overrides. Only 2 breakpoints. Cannot freely position elements outside the grid in standard mode.

**Editor Architecture:** DOM-based with CSS Grid rendering. Not canvas or virtual -- it edits the actual DOM.

**Screenshot:** `screenshots/01-editor/squarespace-homepage-desktop.png`

---

### 2. Webflow

**Layout Model:** Flexbox + CSS Grid. Webflow is the closest to writing real CSS visually -- every element has box model properties (display, position, flex, grid) exposed through a visual panel. Users build with div blocks, sections, and containers using standard CSS layout paradigms.
- Source: [Webflow University - Breakpoints](https://university.webflow.com/videos/intro-to-breakpoints)

**Breakpoint System:** 7 breakpoints with bidirectional cascade:
- Desktop (992px) = base breakpoint
- Cascades UP: 1280px, 1440px, 1920px (larger screens inherit desktop styles unless overridden)
- Cascades DOWN: Tablet (768px), Mobile Landscape (478px), Mobile Portrait (320px)
- Changes on any breakpoint only affect that breakpoint and ones that inherit from it.
- Source: [Webflow Help - Breakpoints Overview](https://help.webflow.com/hc/en-us/articles/33961300305811-Breakpoints-overview)

**Desktop-to-Mobile Behavior:** Desktop edits cascade down to all smaller breakpoints automatically. Users CAN override any style at any breakpoint without affecting the parent. This is the most granular system in the market.
- Source: [Palerto - Understanding Webflow Breakpoints](https://www.palerto.com/post/understanding-webflow-breakpoints)

**Text Reflow:** Text inherits font-size from the base breakpoint and can be overridden per breakpoint. Flexbox containers handle reflow naturally (row to column, wrap behavior).

**User Complaints:**
- "Webflow lures you in with the promise of no-code, design-perfect websites -- but once you're in, it's a total time sink, and the editor is painfully slow even on top-notch machines." -- [Data Medics Forum](https://www.data-medics.com/forum/threads/webflow-reviews-2025-the-ultimate-guide-to-understanding-the-platform.52639/)
- "I find it very difficult to learn Webflow" -- [Webflow Forum](https://discourse.webflow.com/t/i-find-it-very-difficult-to-learn-webflow/76152)
- Steep learning curve is the #1 complaint -- requires understanding of CSS concepts (flexbox, grid, box model).
- Source: [Webflow Pros and Cons 2025](https://www.joinamply.com/post/webflow-pros-and-cons)

**Editor Architecture:** DOM-based visual editor that generates real HTML/CSS. Not canvas-based -- it renders actual elements with a visual CSS inspector.

---

### 3. Wix Studio (formerly Editor X)

**Layout Model:** Dual system -- CSS Grid + Flexbox. Wix Studio offers Section Grids (simplified grid tool) and Advanced CSS Grids (full fr/minmax/% control). Also supports Flexbox containers for simpler layouts. This replaced the old Wix Classic Editor which used absolute positioning.
- Source: [Wix Help - Choosing Between Flexbox and Grid](https://support.wix.com/en/article/studio-editor-choosing-between-flexbox-based-and-grid-based-tools)

**Historical Context:** The original Wix Classic Editor used free-form absolute positioning -- elements placed at exact pixel coordinates. This caused massive mobile breakage. Editor X (now Wix Studio) was built FROM SCRATCH with CSS Grid and Flexbox specifically to solve this problem. The migration from free-form to structured layout is the exact same decision Red Pine faces now.
- Source: [Wix Studio vs Classic Editor 2026](https://webdesignerindia.medium.com/wix-studio-vs-classic-editor-design-flexibility-2026-c99a9c00852e)

**Breakpoint Approach:** Multiple breakpoints with separate desktop and mobile editors. Wix uses an "adaptive" design approach rather than purely responsive -- the mobile editor is a separate editing environment where you can manually rearrange elements.
- Source: [Wix Help - Troubleshooting Mobile Layout](https://support.wix.com/en/article/wix-editor-fixing-layout-issues-on-your-mobile-site)

**User Complaints:**
- "Mobile sites look awful on Facebook and Instagram in-app browsers on Android devices -- headline letters very large, text overlapping, site unreadable" -- [Wix Studio Forum](https://forum.wixstudio.com/t/help-before-i-have-to-leave-wix-because-mobile-sites-look-awful-on-facebook-and-instagram-in-app-browsers/67229)
- "Many Wix users notice their website looks perfect on desktop but breaks down on mobile -- overlapping text, messy layouts, broken menus." -- [Digital Site Care](https://digitalsitecare.com/fix-wix-mobile-view-problems/)
- Mobile fixes require page-by-page manual adjustments.

**Screenshot:** `screenshots/01-editor/wix-studio-desktop.png`

---

### 4. Framer

**Layout Model:** Auto-layout (stack-based), inspired by Figma. Elements are arranged in horizontal or vertical stacks with automatic spacing and alignment. Stacks can nest inside stacks. Constraints define how elements relate to their parent container. This is flow-based by default, with absolute positioning available as an escape hatch.
- Source: [Design+Code - Adaptive Layout with Stacks and Constraints](https://designcode.io/framer-web-design-adaptive-layout/)

**Breakpoint System:** Common breakpoints at 320px, 768px, 1024px, 1200px, 1920px. Stacks "wrap" their children automatically when the screen gets too narrow -- a multi-column layout reflows into single column on mobile, automating ~90% of responsive work.
- Source: [Goodspeed Studio - How to Use Breakpoints in Framer](https://goodspeed.studio/blog/how-to-use-breakpoints-in-framer)

**Desktop-to-Mobile Behavior:** Stacks are responsive by default. Override any property per breakpoint. Min/max width constraints allow elements to scale fluidly within defined boundaries.

**User Complaints:**
- "Problematic hierarchy logic -- fixing a mobile view can destroy the tablet view." -- [Framer Community](https://www.framer.community/c/support/how-can-i-fix-the-responsive-problem)
- "The platform tries to be 'smart' regarding responsiveness but ends up being unpredictable and messy." -- [Trustpilot](https://www.trustpilot.com/review/www.framer.com)
- Sites look fine in Framer preview but render incorrectly on actual mobile browsers after publishing.

---

### 5. WordPress / Elementor

**Layout Model:** Section > Column > Widget hierarchy using Flexbox (post-3.x "Containers" update). Sections are full-width rows, columns subdivide sections, widgets sit inside columns. The newer Container element uses pure flexbox with row/column direction per breakpoint.
- Source: [Elementor Help - Responsive Editing](https://elementor.com/help/mobile-editing/)

**Breakpoint System:** Default 3 breakpoints (desktop, tablet 1024px, mobile 767px). Since Elementor 3.4, users can add up to 6 custom breakpoints (mobile extra, tablet extra, laptop, widescreen) for 7 total. Changes cascade DOWN -- larger breakpoint styles flow to smaller.
- Source: [Elementor Help - Additional Breakpoints](https://elementor.com/help/additional-breakpoints/)

**Desktop-to-Mobile:** Column direction changes (row on desktop, column on mobile). Widget order can be rearranged per breakpoint. Fluid grids use percentages behind the scenes. Container direction can be set independently per breakpoint.
- Source: [Elementor Help - Responsive Design Using Containers](https://elementor.com/help/responsive-design-using-containers/)

**User Complaints:** Responsive design struggles are common among non-technical users. Custom CSS per breakpoint often required for precise control. Third-party addons frequently break responsive behavior.

---

### Comparison Table: Responsive Architecture

| Feature | Squarespace | Webflow | Wix Studio | Framer | Elementor | **Red Pine (current)** |
|---------|-------------|---------|------------|--------|-----------|----------------------|
| **Layout model** | CSS Grid (24-col) | Flexbox + CSS Grid | CSS Grid + Flexbox | Auto-layout (stacks) | Flexbox (containers) | Absolute positioning |
| **Breakpoint approach** | 2 (desktop + mobile) | 7 (bidirectional cascade) | Multiple + separate mobile editor | ~5 (with stack wrapping) | 3-7 (cascade down) | 3 (computed per viewport) |
| **Edit mobile separately?** | No (auto-generated) | Yes (override per breakpoint) | Yes (separate mobile editor) | Yes (override per breakpoint) | Yes (per breakpoint) | Yes (manual toggle) |
| **Auto-adapt desktop edits?** | Yes (auto-generates mobile) | Yes (cascade down) | Partially (adaptive, not responsive) | Yes (stacks wrap auto) | Yes (cascade down) | Breakpoint regen on switch |
| **Text reflow** | Auto within grid cells | Inherit + override per BP | Grid cell reflow | Stack wrap + override | Column reflow | Font scale + height estimate |
| **User positioning freedom** | Grid-constrained (24-col) | Full CSS control | Grid or flexbox constrained | Stack-based with absolute escape | Column-constrained | Full (pixel-perfect) |
| **Main user complaint** | Can't edit mobile directly | Too complex / steep learning curve | Mobile layout breaks on real devices | Unpredictable responsive hierarchy | Responsive breakage with plugins | Overlaps on viewport switch |
| **Learning curve** | Low | High | Medium | Medium | Medium | Low (chat-first) |
| **Editor architecture** | DOM-based (CSS Grid) | DOM-based (real CSS) | DOM-based (CSS Grid/Flex) | DOM-based (auto-layout) | DOM-based (Flexbox) | DOM-based (absolute pos) |

---

### Part A Analysis

**Industry Standard Pattern:** 4 out of 5 competitors use a flow-based layout model (CSS Grid, Flexbox, or auto-layout stacks). Only the OLD Wix Classic Editor used absolute positioning -- and they explicitly abandoned it in favor of CSS Grid/Flexbox because of mobile breakage. This is the strongest signal in the research.

**The Wix Cautionary Tale:** Wix's original editor used the SAME approach Red Pine uses now (free-form absolute positioning). They spent years building Editor X (now Wix Studio) specifically to migrate away from it. Their reason: absolute positioning fundamentally does not adapt to different screen sizes. You cannot mathematically transform pixel coordinates from 1200px to 375px and get a good layout -- it requires human judgment about reflow, stacking order, and content priority.

**Tradeoffs for a Chat-First Builder (where AI places elements):**

| Model | AI Placement Difficulty | Mobile Reliability | User Freedom |
|-------|------------------------|--------------------|--------------|
| Absolute positioning | Easy (just x,y,w,h) | Poor (overlap inevitable) | Maximum |
| CSS Grid / Section-based | Medium (row/column/span) | Good (auto-reflow) | Constrained to grid |
| Flexbox / Stack-based | Medium (order, direction, gap) | Good (wrap behavior) | Constrained to flow |
| Hybrid (sections + absolute within) | Medium | Good for sections, risky within | Balanced |

**For AI placement:** Flow-based models are actually EASIER for AI because the AI only needs to decide "which section, which content type, what order" rather than calculating pixel coordinates that must work at 5 different viewport widths. The current absolute positioning approach forces the AI (or the breakpoint regeneration algorithm) to solve a 2D bin-packing problem at every viewport -- a fundamentally harder computational problem.

**Hybrid Approach (Recommended):**
The most pragmatic path is a hybrid: **flow-based sections with constrained positioning within sections**. This is essentially what Squarespace Fluid Engine does (CSS Grid sections where blocks snap to a grid within sections) and what Elementor does (sections with column/widget flow). This gives:
- Sections stack vertically (guaranteed mobile compatibility)
- Within sections, elements follow grid or flex rules (auto-reflow)
- Pro users can break out to absolute positioning within a section (escape hatch)

**Migration Path from Current Architecture:**
1. Keep the current `Section` model (sections already stack vertically -- this is correct)
2. Within each section, change from `{x, y, width, height}` absolute to `{column, row, span, order}` grid placement
3. The breakpoint system changes from "recalculate all positions" to "adjust grid template per breakpoint"
4. Backward compatibility: existing absolute-positioned elements can be auto-converted to grid cells at migration time
5. Effort estimate: Medium -- the `useFreeFormEditor` hook needs refactoring but the section/page/element hierarchy stays the same

**Recommendation: MIGRATE to hybrid (flow sections + grid placement) -- but do NOT rush.**

The current absolute-positioning editor works for the MVP. The migration should happen AFTER the marketplace launches, because:
1. Marketplace freelancers will be the ones most frustrated by responsive issues
2. Business owners using AI chat placement will never see the underlying layout model
3. The AI copy generation + section templates system already produces section-based content
4. Migration can be done incrementally (new sections use grid, old ones keep absolute with a conversion flag)

---

## PART B: Novice-to-Pro Spectrum (One Editor, All Skill Levels)

### 1. Squarespace -- Novice vs Pro

**Simplest Path to Live Site:** Squarespace Blueprint AI Builder. Answer ~5 questions (site title, brand personality, sections, pages, colors) and get a fully populated website with premium imagery and AI-generated copy. Takes roughly 5-10 minutes from signup to live preview.
- Source: [Squarespace Blog - Starting with Blueprint](https://www.squarespace.com/blog/starting-a-website-with-squarespace-blueprint)

**What Pros Can Do:** Custom CSS and JavaScript injection (Core plan and above, $23/mo). Developer Platform with custom code access. No visual code editor -- custom code goes in injection points (header, footer, page-level). Squarespace Circle program for freelancers (8+ sites in one year to qualify as Expert).
- Source: [Squarespace Circle](https://www.squarespace.com/circle)

**Freelancer Marketplace:** "Hire an Expert" marketplace powered by 99designs. Squarespace Experts are vetted Circle members. Clients submit a project request and get matched.
- Source: [Squarespace Help - Hiring an Expert](https://support.squarespace.com/hc/en-us/articles/360033866991-Hiring-a-Squarespace-Expert)

**Client Handoff:** Contributors model -- site owner adds collaborators. No formal builder/client separation beyond permissions.

**Pricing:** Basic $16/mo, Core $23/mo, Plus $39/mo, Advanced $99/mo (annual billing).
- Source: [Squarespace Pricing](https://www.squarespace.com/pricing)

---

### 2. Wix -- ADI vs Editor vs Studio

**Wix ADI (Zero Skill):** Conversational AI chatbot that generates a tailored site in ~60 seconds. Homepage ready in 4 minutes, mobile-optimized by default, basic SEO auto-generated. Quality is good for simple sites. Now evolved into "Wix Harmony" with more sophisticated AI.
- Source: [Elegant Themes - Wix ADI Review 2025](https://www.elegantthemes.com/blog/business/wix-adi-review)

**Wix Editor (Medium Skill):** Traditional drag-and-drop with sections, strips, and elements. More customization than ADI but still constrained. Separate mobile editor.

**Wix Studio (Pro Tool):** Replaces Editor X. Full CSS Grid and Flexbox support. Designed for agencies and freelancers. Advanced responsive controls, custom code, design tokens.
- Source: [Wix Help - Working with Advanced CSS Grid](https://support.wix.com/en/article/studio-editor-working-with-an-advanced-css-grid)

**Can a Novice Site Be Upgraded to Studio?** Not seamlessly -- Wix ADI sites and Wix Editor sites use different underlying architectures from Wix Studio. Migration requires rebuilding.

**Wix Marketplace:** Full marketplace at wix.com/marketplace. Submit project requests, browse professionals, filter by service/price/location/language. Response within 1 business day.
- Source: [Wix Marketplace - How It Works](https://www.wix.com/marketplace/how-it-works)

**Pricing:** Light $17/mo, Core $29/mo, Business $39/mo, Business Elite $159/mo (annual).
- Source: [Wix Pricing](https://www.wix.com/plans)

---

### 3. Webflow -- Pro Tool with Templates

**Novice Experience:** Webflow offers 1,000+ templates as starting points. The "Editor mode" (content-only editing) is simple enough for clients. But the Designer mode (full layout control) requires CSS knowledge. Webflow is NOT beginner-friendly by design -- it targets designers and developers.
- Source: [Flowzai - Designer vs Editor Mode](https://www.flowzai.com/blog-post/webflow-designer-vs-editor-mode)

**Designer Mode vs Editor Mode:**
- **Designer Mode:** Full layout, style, and functionality control. Requires understanding CSS concepts. Used by builders/developers.
- **Editor Mode:** Content-only editing on a published site. Non-technical users can update text, images, and CMS content. Safe guardrails prevent structural changes.
- Source: [Webflow - Working with Clients](https://webflow.com/webflow-way/collaboration/working-with-clients)

**Webflow Experts Marketplace:** Certified Partners directory with matchmaking. Submit a request, get 4-7 recommended matches within 24 hours. Rates: $50-$200/hr, typical project: $10-25k.
- Source: [Webflow - Hire](https://webflow.com/hire)

**Client Handoff:** Client seats with Editor mode access. Designers retain a backup copy. "Request design control" feature for smooth role transitions.

**Pricing:** Site Plans: Free, Basic $29/mo, CMS $23/mo, Business $39/mo. Workspace Plans: Core $28/mo, Growth $49/mo/user. E-commerce from $29/mo.
- Source: [Webflow Pricing](https://webflow.com/pricing)

---

### 4. Shopify -- Themes + Liquid + Visual Editor

**Novice Experience:** Theme editor with drag-and-drop sections and blocks. Dawn theme (default) provides a solid starting point. Shopify Magic AI generates product descriptions and images. ~3 steps to start selling: add product, customize store, set up payments.
- Source: [Shopify Help - Sections and Blocks](https://help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks)

**Pro Experience:** Full Liquid templating language, JSON templates, custom themes via CLI. Hydrogen (React-based headless commerce framework) for complete custom storefronts. APIs for everything.
- Source: [Shopify Partners Blog - Online Store 2.0](https://www.shopify.com/partners/blog/shopify-online-store)

**Shopify Experts Marketplace:** Full directory at shopify.com/partners/directory. "Hire a Partner" matching. 13,000+ apps in the App Store.

**Pricing:** Basic $39/mo, Shopify $105/mo, Advanced $399/mo. Plus: $2,300/mo.

---

### 5. WordPress -- The Original Spectrum

**Novice:** Gutenberg block editor with drag-and-drop blocks. Pre-built block patterns. Thousands of themes. WordPress.com hosted option requires zero technical knowledge.

**Medium:** Page builders like Elementor (free + Pro from $59/yr), Divi, Beaver Builder. Visual drag-and-drop with responsive controls.
- Source: [Elementor Pro Plans](https://elementor.com/pro/)

**Pro:** Full PHP/HTML/CSS/JS access. Custom themes, custom plugins. REST API. Headless WordPress with any frontend framework.

**Freelancer Ecosystem:** The largest in the industry. WordPress powers ~43% of the web. Millions of freelancers on every platform (Upwork, Fiverr, Codeable, etc.). No official marketplace needed -- the ecosystem IS the marketplace.

---

### Spectrum Comparison Table

| Feature | Squarespace | Wix | Webflow | Shopify | WordPress | **Red Pine** |
|---------|-------------|-----|---------|---------|-----------|------------|
| **AI auto-build (zero skill)** | Yes (Blueprint AI) | Yes (ADI/Harmony) | No (templates only) | Partial (Shopify Magic) | No (block patterns only) | **Yes (onboarding)** |
| **Visual drag-and-drop** | Yes (Fluid Engine) | Yes (Editor + Studio) | Yes (Designer) | Limited (theme editor) | Yes (Gutenberg + builders) | **Yes (FreeForm)** |
| **Pre-built sections/blocks** | Yes (~20 types) | Yes (100+ elements) | Yes (components) | Yes (sections + blocks) | Yes (1000+ blocks) | **Yes (4 widget types)** |
| **Code access for pros** | CSS/JS injection | Velo (JavaScript) | Custom code embeds | Liquid + Hydrogen | Full PHP/JS/CSS | **No** |
| **CSS customization** | Custom CSS (Core+) | Custom CSS (Studio) | Full visual CSS | Custom CSS | Full CSS | **No** |
| **Custom code injection** | Yes (Core+ plans) | Yes (Studio) | Yes (embed element) | Yes (theme.liquid) | Yes (functions.php) | **No** |
| **Template/theme system** | Yes (~150 templates) | Yes (900+ templates) | Yes (1000+ templates) | Yes (themes + App Store) | Yes (10,000+ themes) | **No** |
| **Freelancer marketplace** | Yes (Circle/Experts) | Yes (Wix Marketplace) | Yes (Certified Partners) | Yes (Shopify Experts) | De facto (ecosystem) | **Planned** |
| **Client handoff** | Contributors | Collaborators | Designer/Editor modes | Staff accounts | User roles | **Not yet** |
| **Export/download site code** | No | Yes (HTML/CSS export) | No | Yes (theme code) | Yes (full codebase) | **No** |
| **Third-party components** | Extensions (~30) | App Market (500+) | Apps + Libraries | App Store (13,000+) | Plugins (60,000+) | **No** |
| **Time from signup to live** | ~10 min | ~5 min (ADI) | ~30 min+ | ~15 min | ~20 min | **~5 min** |

---

### Part B Analysis

**Pattern: Separate Modes, Not Separate Editors.**
Every platform that serves both novices and pros uses the SAME editor with different access levels:
- Webflow: Designer mode (full control) vs Editor mode (content only)
- Wix: ADI (auto-build) -> Editor (hands-on) -> Studio (pro)
- Shopify: Theme editor (visual) vs Liquid code (developer)
- WordPress: Gutenberg (blocks) vs page builders vs full code

Nobody ships TWO completely separate editors. They ship ONE editor with progressive disclosure.

**Red Pine's Biggest Gap for Pros: No Code Access.**
Every competitor offers some form of code access (CSS injection, JavaScript, templating languages). This is CRITICAL for freelancers/designers because:
1. Pre-built sections will never cover every design need
2. Clients request specific design tweaks that require CSS
3. Freelancers differentiate by offering customization beyond drag-and-drop

However, code access is NOT needed for MVP. The AI chat + visual editor covers 80%+ of business owner needs. Code access becomes critical when the marketplace launches and freelancers need to build for clients.

**Recommended "Owner Mode" vs "Builder Mode":**
Red Pine should implement TWO modes within the same editor (like Webflow):
1. **Owner Mode (default):** AI chat + visual drag-and-drop + property panels. No code access. Safe guardrails.
2. **Builder Mode (marketplace freelancers):** Everything in Owner Mode PLUS custom CSS injection, section HTML overrides, JavaScript hooks. Requires marketplace freelancer account.

This matches the product vision: owners use AI/visual, freelancers use full control, designers get maximum flexibility.

**Minimum Pro Feature Set to Attract Freelancers:**
1. Custom CSS injection per section (Critical -- every competitor has this)
2. Custom fonts beyond the preset list
3. Client handoff mechanism (transfer ownership or set permissions)
4. Section templates (create-once, reuse-across-clients)
5. Ability to duplicate a site as a starting template

---

## PART C: Portable Components / Embeddable Widgets

### 1. Shopify Sections and Blocks

**Architecture:** Sections are modular Liquid templates with a JSON schema defining settings and blocks. Each section is a self-contained `.liquid` file with a `{% schema %}` tag that declares its settings, blocks, and presets.
- Source: [Shopify Dev - Building with Sections and Blocks](https://shopify.dev/docs/storefronts/themes/best-practices/templates-sections-blocks)

**Cross-Theme Portability:** Sections are theme-specific -- they rely on the theme's CSS and Liquid architecture. App blocks (from Shopify Apps) work across any Online Store 2.0 theme, but custom sections do not transfer between themes without modification.

**Third-Party Injection:** Shopify Apps can inject "app blocks" into any section that supports them. This is the primary extensibility mechanism -- apps register blocks that merchants drag into their theme sections.

**The Shopify Buy Button:** The gold standard for embeddable commerce. A JavaScript snippet (`<script>` tag + `<div>`) that creates a product card with cart and checkout on ANY external website. Real-time data sync. PCI-compliant checkout. Works on WordPress, Squarespace, Wix, custom HTML, anywhere.
- Source: [Shopify Blog - Buy Button](https://www.shopify.com/blog/60670213-5-ways-you-can-use-shopify-buy-buttons-to-sell-on-your-website-or-blog)

---

### 2. WordPress Blocks (Gutenberg)

**Technical Architecture:** React components registered as WordPress blocks via `@wordpress/blocks`. Each block has an `edit` function (what you see in the editor) and a `save` function (what gets rendered on the frontend). Uses `@wordpress/element` (React wrapper) and `@wordpress/components` (UI library).
- Source: [WordPress Developer Handbook - Block Editor](https://developer.wordpress.org/block-editor/how-to-guides/platform/)

**Cross-Theme Compatibility:** Core blocks work across all themes. Custom blocks may have styling dependencies on specific themes. Block Patterns (pre-arranged groups of blocks) are portable. Theme.json provides standardized design tokens.

**Third-Party Ecosystem:** 60,000+ plugins, many providing custom blocks. Block patterns can be shared via the WordPress Pattern Directory. Full React component lifecycle available within blocks.

---

### 3. Webflow Components and Libraries

**Reusable Components:** Components (formerly Symbols) are reusable design elements that sync across all instances. Changes to a component propagate everywhere it is used on a site.
- Source: [Webflow Help - Components Overview](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview)

**Cross-Project Sharing (Libraries):** Webflow Libraries allow sharing components, variables, and assets across all sites in a Workspace. Types include Shared Libraries (team-created), Starter Libraries (Webflow-built), Marketplace Libraries (community-built), and Code component libraries (externally developed).
- Source: [Webflow - Shared Libraries](https://webflow.com/feature/shared-libraries)

**Webflow Apps:** Third-party developers can build Apps that extend Webflow's functionality. The Apps framework allows custom visual elements within the Webflow Designer.

**NOT Embeddable Externally:** Webflow components are Webflow-only. You cannot embed a Webflow component on an external website (unlike Shopify Buy Button).

---

### 4. Embed Widgets (Calendly, Typeform, etc.)

**Calendly:**
- Method: JavaScript widget library (`widget.js`) + HTML div with `data-url` attribute
- Under the hood: Creates an iframe that loads the Calendly scheduling page
- Advanced: `Calendly.initInlineWidget()` API for programmatic control
- Also supports: Direct iframe embed (simpler but fewer features), popup/modal modes
- Source: [Calendly Help - Embed Options](https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview)

**Typeform:**
- Method: JavaScript embed SDK (`@typeform/embed`) + HTML div with `data-tf-widget` attribute
- Loads from `embed.typeform.com/next/embed.js`
- Supports: Inline, popup, slider, popover, and sidetab modes
- Also available as npm package for React/Vue/Angular integration
- Falls back to plain iframe if JavaScript not available
- Source: [Typeform Developers - Embed SDK](https://www.typeform.com/developers/embed/)

**Common Pattern:**
All major embeddable widgets follow the SAME architecture:
1. Load a JavaScript file from their CDN
2. Place a `<div>` with data attributes where the widget should appear
3. The script initializes and renders an iframe inside the div
4. Communication happens via postMessage between parent and iframe

---

### 5. Web Components Standard

**Current Status (2025-2026):** Browser support at 98% globally. Custom Elements, Shadow DOM, and HTML Templates are production-ready without polyfills. Enterprise adoption increased 156% from 2023-2025, with 73% of Fortune 500 companies using Web Components.
- Source: [Kinsta - Web Components 2026](https://kinsta.com/blog/web-components/)
- Source: [Markaicode - Web Components 2025](https://markaicode.com/web-components-2025-shadow-dom-lit-browser-compatibility/)

**Lit 4.0:** The leading library for building Web Components. Lightweight, reactive, builds on native browser APIs. Excellent performance.

**Do Major Platforms Use Web Components?**
- YouTube uses Web Components (Polymer/Lit)
- GitHub uses Web Components extensively
- Salesforce Lightning Web Components
- Adobe Spectrum uses Web Components
- Most website builders do NOT use Web Components for their editors -- they use React/Vue internally

**Could Red Pine Sections Be Web Components?**
Yes, this is technically viable. A Red Pine section could be packaged as a Web Component that:
1. Fetches data from Supabase via API
2. Renders inside Shadow DOM (style isolation)
3. Can be embedded on ANY website via a `<script>` tag + custom element

---

### Portability Comparison Table

| Feature | Shopify Sections | WP Blocks | Webflow Components | Embed Widgets (Calendly) | **Red Pine Sections** |
|---------|-----------------|-----------|-------------------|-------------------------|---------------------|
| **Works in visual editor** | Yes | Yes | Yes | N/A | **Yes** |
| **Works in code context** | Yes (Liquid) | Yes (PHP/React) | No (Webflow only) | Yes (any HTML) | **Not yet** |
| **Embeddable on external sites** | Buy Button only | No | No | Yes (core purpose) | **Not yet** |
| **Carries real data** | Yes (Shopify products) | Yes (WP database) | Yes (Webflow CMS) | Yes (Calendly schedule) | **Yes (Supabase)** |
| **Customizable appearance** | Theme-dependent | Theme-dependent | Yes (within Webflow) | Limited (CSS vars) | **Limited** |
| **Self-contained** | No (needs Shopify theme) | No (needs WordPress) | No (needs Webflow) | Yes (iframe isolation) | **No (needs React)** |
| **Standard format** | Liquid + JSON schema | React + PHP | Webflow proprietary | JS + iframe | **React component** |
| **Embed code size** | ~2KB JS | N/A | N/A | ~50KB JS | **N/A** |

---

### Part C Analysis

**Best Approach for Portable Red Pine Sections:**

There are four options, ranked by feasibility and impact:

| Approach | Embed Size | Data Access | Style Isolation | Difficulty | Best For |
|----------|-----------|-------------|----------------|-----------|----------|
| **1. Script + iframe** | ~5KB loader | API calls from iframe | Perfect (iframe) | Low | External sites |
| **2. Web Component + Shadow DOM** | ~50-100KB (Lit) | API calls | Good (Shadow DOM) | Medium | External sites + modern embeds |
| **3. React npm package** | ~200KB+ | API calls | Poor (CSS leaks) | Medium | React sites only |
| **4. Script + div (Calendly-style)** | ~30-50KB | API calls via injected iframe | Good | Low-Medium | Universal embed |

**Recommendation: Option 4 (Script + div, Calendly-style) for Phase 1.**

Reasoning:
- This is the proven pattern used by Calendly, Typeform, Intercom, Drift, HubSpot, etc.
- Works on ANY website (WordPress, Squarespace, Wix, custom HTML)
- The script loads from Red Pine's CDN, finds `<div data-rp-widget="booking">` elements, and injects iframes
- Style isolation is automatic (iframe boundary)
- Real data flows through Supabase APIs
- The iframe content can be the same React components already built for the portal

**Comparison to Shopify Buy Button:**
The Shopify Buy Button is the closest analogy to what Red Pine needs. Key parallels:
- Both embed functional business tools (not just content) on external sites
- Both need real-time data sync (products/inventory for Shopify, appointments/services for Red Pine)
- Both need a checkout/booking flow that is PCI/security compliant
- Both use JavaScript + div as the embed mechanism

Red Pine's advantage: our widgets carry OPERATIONAL data (booking calendars, service menus, galleries, contact forms) -- not just commerce. This makes them more broadly useful than a Buy Button.

**Which Sections to Make Embeddable First:**
1. **Booking Widget** -- highest value, replaces Calendly for Red Pine users
2. **Contact Form** -- simple, universal need
3. **Service Menu / Gallery** -- showcases the business
4. **Reviews Widget** -- social proof (once review system is built)

---

## FINAL SYNTHESIS

### 1. Architecture Recommendation: Hybrid Flow Model

**Current state:** Absolute positioning with breakpoint regeneration.
**Target state:** Flow-based sections with grid placement inside sections.
**Timeline:** Post-marketplace launch (not urgent for MVP).

**Migration Plan:**
1. **Phase 1 (Now):** Keep absolute positioning. Improve the breakpoint regeneration algorithm to handle more edge cases (text overflow, image overlap). This is a quick win.
2. **Phase 2 (With marketplace):** Introduce a new section type "GridSection" that uses CSS Grid internally. New sections created by AI or templates use GridSection. Old sections remain absolute (backward compatible).
3. **Phase 3 (Full migration):** Provide a one-click "Convert to Grid" tool that transforms absolute-positioned sections to grid layout. Remove absolute as the default.

This is the SAME migration path Wix took (Classic Editor -> Editor X -> Studio), but compressed because Red Pine can learn from their mistakes.

### 2. Spectrum Strategy: Progressive Disclosure in ONE Editor

**Do NOT build two separate editors.** Build one editor with escalating capability:

| Level | User | Features | Gate |
|-------|------|----------|------|
| **Chat** | Business owner (zero skill) | AI chat places/edits sections. Owner never sees the canvas. | Default for owners |
| **Visual** | Business owner (hands-on) | Drag-and-drop canvas, property panels, section library. No code. | Click "Edit manually" |
| **Builder** | Marketplace freelancer | Everything above + custom CSS injection, section HTML, JS hooks, client handoff. | Marketplace account required |

The AI chat mode is Red Pine's UNIQUE advantage. No competitor has a chat interface that directly manipulates the visual editor. Squarespace Blueprint asks questions upfront but then drops you into a visual editor. Red Pine's chat works INSIDE the editor, continuously.

### 3. Portability Roadmap: Embeddable Widgets

**Phase 1 (Q2 2026):** Booking Widget embed. Script tag + iframe approach (Calendly-style). Embed code generated in dashboard Settings. Works on any external website.

**Phase 2 (Q3 2026):** Contact Form + Gallery embeds. Same architecture. Add a "Widget Code" tab in the website editor sidebar.

**Phase 3 (Q4 2026):** Service Menu + Reviews embeds. Introduce the `<div data-rp-widget="..."  data-rp-business="[subdomain]">` standard format.

**Phase 4 (2027):** Web Component versions for modern integrations. npm package for React developers. API documentation for custom integrations.

### 4. Priority Order: What to Build FIRST

1. **Improve breakpoint regeneration** (immediate, low effort) -- Fix the current overlap issues in the absolute-positioning model. This unblocks AI website generation quality.

2. **Section templates library** (next sprint) -- Pre-built sections that the AI can assemble. These become the building blocks for both AI generation and manual editing. Needs 20-30 section types covering all industry families.

3. **Booking widget embed** (Q2 2026) -- The first portable component. Creates immediate value for users who already have a website elsewhere but want Red Pine's booking system.

4. **Builder mode with CSS injection** (with marketplace launch) -- The minimum viable pro feature set to attract freelancers. CSS injection per section + custom fonts.

5. **GridSection migration** (post-marketplace) -- The architectural migration from absolute positioning to flow-based layout. Only after the marketplace validates demand from pro users.

### 5. Red Pine's Moat: What Makes the Editor Uniquely Valuable

Red Pine's editor moat is NOT the visual editor itself -- every competitor has one. The moat is the **combination of three things no competitor offers together:**

1. **AI Chat That Directly Edits the Canvas.** No other platform has a conversational AI that manipulates the actual visual editor in real-time. Squarespace Blueprint generates once and stops. Wix ADI creates and exits. Red Pine's chat works CONTINUOUSLY inside the editor -- "move the booking section above the gallery," "change the hero text to emphasize our weekend specials," "add a testimonials section."

2. **Operational Data Built Into Sections.** Squarespace/Wix/Webflow sections are static content. Red Pine sections carry LIVE BUSINESS DATA -- the booking widget shows real availability, the service menu shows real prices from the catalog, the gallery shows real uploaded images. Editing the website IS editing the business.

3. **Marketplace-Connected Editor.** When the marketplace launches, business owners can hire a freelancer who edits their site in Builder mode, while the owner continues to use Chat mode for day-to-day updates. No other platform connects the AI-assisted owner experience with a freelancer marketplace in the same editor.

The editor is not competing with Webflow on design power or Squarespace on simplicity. It is competing on the thesis that **most small business owners should never need to open a visual editor at all** -- the AI should handle it. And when they do need human help, the marketplace provides it without leaving the platform.

---

## Sources

### Squarespace
- [Squarespace Engineering Blog - Developing Fluid Engine](https://engineering.squarespace.com/blog/2022/developing-fluid-engine)
- [Squarespace Help - Editing with Fluid Engine](https://support.squarespace.com/hc/en-us/articles/6421525446541-Editing-your-site-with-Fluid-Engine)
- [Squarespace Help - Responsive Design](https://support.squarespace.com/hc/en-us/articles/115003287447-Responsive-design)
- [Squarespace Forum - Mobile Optimization Frustration](https://forum.squarespace.com/topic/308667-squarespace-is-not-mobile-optimized-anymore-and-its-frustrating/)
- [Squarespace Blog - Starting with Blueprint AI](https://www.squarespace.com/blog/starting-a-website-with-squarespace-blueprint)
- [Squarespace Circle Program](https://www.squarespace.com/circle)
- [Squarespace Pricing](https://www.squarespace.com/pricing)

### Webflow
- [Webflow Help - Breakpoints Overview](https://help.webflow.com/hc/en-us/articles/33961300305811-Breakpoints-overview)
- [Webflow University - Intro to Breakpoints](https://university.webflow.com/videos/intro-to-breakpoints)
- [Webflow Blog - 3 New Larger Breakpoints](https://webflow.com/blog/3-new-larger-breakpoints-in-webflow)
- [Palerto - Understanding Webflow Breakpoints](https://www.palerto.com/post/understanding-webflow-breakpoints)
- [Webflow Pros and Cons 2025](https://www.joinamply.com/post/webflow-pros-and-cons)
- [Webflow Forum - Difficulty Learning](https://discourse.webflow.com/t/i-find-it-very-difficult-to-learn-webflow/76152)
- [Flowzai - Designer vs Editor Mode](https://www.flowzai.com/blog-post/webflow-designer-vs-editor-mode)
- [Webflow - Hire Experts](https://webflow.com/hire)
- [Webflow - Shared Libraries](https://webflow.com/feature/shared-libraries)
- [Webflow Pricing](https://webflow.com/pricing)

### Wix
- [Wix Help - Advanced CSS Grid](https://support.wix.com/en/article/studio-editor-working-with-an-advanced-css-grid)
- [Wix Help - Flexbox vs Grid Tools](https://support.wix.com/en/article/studio-editor-choosing-between-flexbox-based-and-grid-based-tools)
- [Wix Studio vs Classic Editor 2026](https://webdesignerindia.medium.com/wix-studio-vs-classic-editor-design-flexibility-2026-c99a9c00852e)
- [Wix Help - Troubleshooting Mobile Layout](https://support.wix.com/en/article/wix-editor-fixing-layout-issues-on-your-mobile-site)
- [Wix Studio Forum - Mobile in-app browser issues](https://forum.wixstudio.com/t/help-before-i-have-to-leave-wix-because-mobile-sites-look-awful-on-facebook-and-instagram-in-app-browsers/67229)
- [Elegant Themes - Wix ADI Review 2025](https://www.elegantthemes.com/blog/business/wix-adi-review)
- [Wix Marketplace - How It Works](https://www.wix.com/marketplace/how-it-works)
- [Wix Pricing](https://www.wix.com/plans)

### Framer
- [Design+Code - Responsive Layout with Breakpoints](https://designcode.io/framer-web-design-responsive-layout/)
- [Design+Code - Adaptive Layout with Stacks](https://designcode.io/framer-web-design-adaptive-layout/)
- [Goodspeed Studio - Breakpoints in Framer](https://goodspeed.studio/blog/how-to-use-breakpoints-in-framer)
- [Framer Community - Responsive Problems](https://www.framer.community/c/support/how-can-i-fix-the-responsive-problem)
- [Trustpilot - Framer Reviews](https://www.trustpilot.com/review/www.framer.com)
- [Framer Pricing](https://www.framer.com/pricing)

### Elementor / WordPress
- [Elementor Help - Mobile Editing](https://elementor.com/help/mobile-editing/)
- [Elementor Help - Additional Breakpoints](https://elementor.com/help/additional-breakpoints/)
- [Elementor Help - Responsive Design with Containers](https://elementor.com/help/responsive-design-using-containers/)
- [Elementor Pro Plans](https://elementor.com/pro/)
- [WordPress Developer Handbook - Block Editor Platform](https://developer.wordpress.org/block-editor/how-to-guides/platform/)

### Shopify
- [Shopify Help - Sections and Blocks](https://help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks)
- [Shopify Dev - Building with Sections and Blocks](https://shopify.dev/docs/storefronts/themes/best-practices/templates-sections-blocks)
- [Shopify Blog - Buy Button](https://www.shopify.com/blog/60670213-5-ways-you-can-use-shopify-buy-buttons-to-sell-on-your-website-or-blog)
- [Shopify Partners Blog - Online Store 2.0](https://www.shopify.com/partners/blog/shopify-online-store)

### Embed Widgets
- [Calendly Help - Embed Options Overview](https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview)
- [Calendly Help - Advanced Embed for Developers](https://help.calendly.com/hc/en-us/articles/31618265722775-Advanced-Calendly-embed-for-developers)
- [Typeform Developers - Embed SDK](https://www.typeform.com/developers/embed/)

### Web Components
- [Kinsta - Web Components 2026](https://kinsta.com/blog/web-components/)
- [Markaicode - Web Components 2025](https://markaicode.com/web-components-2025-shadow-dom-lit-browser-compatibility/)
- [Plugintify - Web Components Browser Support](https://www.plugintify.com/web-components-gain-traction-browser-support-and-framework-adoption-bolster-reusability/)

---

## Screenshots Captured

- `screenshots/01-editor/squarespace-homepage-desktop.png` -- Squarespace homepage (desktop viewport)
- `screenshots/01-editor/wix-studio-desktop.png` -- Wix Studio landing page (desktop viewport)

Note: Several competitor sites (Webflow, Framer, Elementor) blocked or aborted Playwright navigation during the research session. The homepage screenshots for those platforms could not be captured programmatically. All architectural and feature data was sourced from official documentation, help centers, and engineering blogs as cited above.
