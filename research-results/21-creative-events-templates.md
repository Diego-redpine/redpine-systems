# Research #21: Creative & Events Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 8 creative and events business types based on competitor platform research.

---

## Table of Contents
1. [Photographer](#1-photographer)
2. [Videographer](#2-videographer)
3. [DJ / Entertainer](#3-dj--entertainer)
4. [Event Planner](#4-event-planner)
5. [Florist](#5-florist)
6. [Wedding Planner](#6-wedding-planner)
7. [Interior Designer](#7-interior-designer)
8. [Graphic Designer / Freelance Creative](#8-graphic-designer--freelance-creative)
9. [Competitor Comparison](#9-competitor-comparison)
10. [Template Config Recommendations](#10-template-config-recommendations)

---

## INDUSTRY OVERVIEW

Creative and events businesses share a common workflow: inquiry -> proposal/quote -> contract + deposit -> project execution -> delivery -> final payment. They are project-based, often seasonal (wedding season peaks May-October), and rely heavily on portfolio presentation, client communication, and milestone-based payments. Trust and personal brand are everything. The key platforms (HoneyBook, Dubsado, Studio Ninja) all center on the inquiry-to-booking pipeline with integrated contracts, invoices, and communication.

---

## 1. PHOTOGRAPHER

**Competitors studied:** Studio Ninja, HoneyBook, Dubsado, Tave (VSCO Workspace), Bloom, Pixieset, ShootProof

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Sessions / Packages |
| Appointments | Shoots / Sessions |
| Products | Prints / Digitals / Albums |
| Staff | Photographers / Second Shooters / Assistants |
| Pipeline | Booking Pipeline |

**Essential Tabs:**

1. **Dashboard** — Upcoming shoots, bookings this month, revenue, inquiries pending, galleries to deliver, invoices outstanding. Studio Ninja tracks jobs, deadlines, tasks, and invoice statuses in one view.
2. **Bookings / Jobs** — Central entity: event date, client, package, location, timeline, shot list, second shooter, payment status, contract status, gallery delivery status. Full lifecycle from inquiry to delivery.
3. **Pipeline** — Lead management from inquiry to booked: inquiry received, responded, consultation scheduled, proposal sent, contract signed, deposit paid. Studio Ninja and Tave both automate inquiry follow-up sequences.
4. **Calendar** — Shoot schedule, editing blocks, client meetings, delivery deadlines, second shooter availability. Avoid double-booking on same date (critical for wedding/event photographers).
5. **Contracts / Proposals** — Package proposals with pricing tiers, add-on options, custom quotes. Contract generation with terms, cancellation policy, usage rights. E-signature. HoneyBook and Dubsado combine proposal + contract + invoice into one flow.
6. **Invoices / Payments** — Deposit + final payment milestones, payment plans, retainer management, tax tracking. Typical: 30-50% deposit at booking, balance due 2 weeks before event.

**Optional Tabs:**

1. **Galleries** — Client gallery delivery: upload edited photos, set download permissions, enable proofing/favorites, print store integration. Pixieset and ShootProof are the leading gallery platforms (integrate or build in).
2. **Questionnaires** — Pre-shoot questionnaires: wedding timeline, family groupings, location preferences, must-have shots, vendor contacts. Client info gathering.
3. **Workflows** — Automated email/task sequences: inquiry response, booking confirmation, reminder 1 week before, gallery delivery, review request. Studio Ninja and Tave both offer powerful workflow automation.
4. **Products / Store** — Print sales, album design/ordering, wall art, digital downloads. ShootProof and Pixieset offer built-in storefronts.
5. **Marketing** — Blog posts of recent work, SEO for "[city] wedding photographer", referral programs, styled shoot features.
6. **Reports** — Revenue by session type, booking rate, average package value, busiest months, lead source ROI.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Bookings/Jobs | Calendar | Shoots with date, client, package, location, status |
| Inquiries | Pipeline | Leads with source, date, package interest, follow-up |
| Clients | Table | Client profiles with booking history, galleries |
| Contracts | Table | Signed agreements with terms, package, amounts |
| Invoices | Table | Payment milestones with deposit/balance status |
| Galleries | Cards | Delivered photo galleries with client, photo count |
| Questionnaires | Table | Pre-shoot client questionnaires with completion status |

**Pipeline Stages:**

```
Inquiry Received -> Response Sent -> Consultation/Meeting -> Proposal Sent -> Contract Signed -> Deposit Paid -> Pre-Shoot Planning -> Shoot Day -> Editing -> Gallery Delivered -> Final Payment -> Review Requested
```

**Unique Features:**
- Gallery delivery and proofing (clients select favorites, approve for print)
- Package-based pricing with add-on options (extra hours, second shooter, album)
- Pre-shoot questionnaires for planning
- Automated workflow sequences (inquiry -> booking -> shoot -> delivery)
- Date-based booking (no double-booking on shoot dates)
- Second shooter/assistant assignment per job
- Shot list and timeline management
- Print/product store integration
- Usage rights management in contracts
- Portfolio/blog integration for marketing
- Studio Ninja pricing: from $17.50/month
- Pixieset pricing: Free - $50/month for galleries

**Pricing Model:**
- Package-based (e.g., 4 hours + 300 digitals = $2,500; 8 hours + album = $4,500)
- A la carte add-ons (extra hour, second shooter, engagement session, album)
- Print sales through online gallery store
- Deposit: 30-50% at booking, balance before or after event
- Payment plans available for higher-value packages

**Portfolio/Gallery Importance:** CRITICAL. Portfolio is the #1 marketing tool. Photographers need both:
- Marketing galleries (on website, public-facing portfolio)
- Client galleries (private delivery, proofing, ordering)

---

## 2. VIDEOGRAPHER

**Competitors studied:** HoneyBook, Dubsado, Studio Ninja, Frame.io, Vimeo

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Projects / Packages |
| Appointments | Shoots / Filming Days |
| Products | Films / Videos / Deliverables |
| Staff | Videographers / Editors / Assistants |
| Pipeline | Booking Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active projects by stage, upcoming shoots, editing deadlines, revenue, pending proposals.
2. **Projects** — Project management: type (wedding film, commercial, corporate, music video, real estate), shoot dates, locations, crew, deliverables list, revision rounds, delivery deadline. Multi-day shoots common.
3. **Pipeline** — Same inquiry-to-booking flow as photographers, but often longer sales cycles for commercial work. Lead tracking from inquiry to signed contract.
4. **Calendar** — Filming dates, editing schedules, client review deadlines, delivery dates. Block off multi-day shoots.
5. **Contracts / Proposals** — Package proposals with deliverables list (highlight reel, full film, social clips), revision policy, delivery timeline, usage rights (especially for commercial). E-signature.
6. **Invoices** — Milestone payments: deposit, shoot day, rough cut delivery, final delivery. Larger total values than photography (wedding films: $3K-10K+, commercial: $5K-50K+).

**Optional Tabs:**

1. **Deliverables / Review** — Video review and feedback: share private video links, collect timestamped feedback, track revision rounds. Frame.io is the industry standard for video review.
2. **Questionnaires** — Pre-production questionnaires: shot list, interview questions, brand guidelines (commercial), timeline (wedding).
3. **Crew** — Crew management for larger shoots: videographers, audio, lighting, assistants. Day rates per crew member.
4. **Equipment** — Camera, audio, lighting, drone equipment tracking, rental management.
5. **Reports** — Revenue by project type, editing hours per project, revision count trends.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Video projects with type, dates, deliverables, status |
| Bookings | Calendar | Filming dates with location, crew, equipment |
| Clients | Table | Client profiles with project history |
| Deliverables | Table | Video files with review status, revision round |
| Contracts | Table | Signed agreements with scope, rights, payment terms |
| Invoices | Table | Milestone-based payments |

**Pipeline Stages:**

```
Inquiry -> Discovery Call -> Creative Brief / Proposal Sent -> Contract Signed -> Deposit -> Pre-Production Planning -> Shoot Day(s) -> Editing -> Rough Cut Review -> Revisions -> Final Delivery -> Final Payment -> Testimonial Request
```

**Unique Features:**
- Multi-deliverable projects (highlight, full film, social cuts, raw footage)
- Video review with timestamped feedback (Frame.io integration or built-in)
- Revision round tracking and limits (contractual: 2-3 rounds included)
- Pre-production planning (shot lists, storyboards, locations, talent)
- Crew booking and day rate management
- Equipment/rental tracking
- Usage rights per deliverable (web, broadcast, social, perpetual)
- Longer editing timelines than photography (weeks to months)
- Raw footage delivery option
- Music licensing tracking

**Pricing Model:**
- Package-based for events (wedding film: $3,000-10,000+)
- Day rate for commercial ($1,000-5,000/day)
- Project-based for custom work
- Per-deliverable pricing for add-ons (drone, social cuts)
- Deposit: 30-50% at booking, balance at delivery
- Commercial: 50% deposit, 50% on final delivery

---

## 3. DJ / ENTERTAINER

**Competitors studied:** DJ Intelligence, DJ Event Planner, Check Cherry, Gigbuilder, SongBoard

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Event Hosts |
| Services | Packages / Services |
| Appointments | Events / Gigs |
| Products | Equipment / Lighting |
| Staff | DJs / MCs / Entertainers |
| Pipeline | Booking Pipeline |

**Essential Tabs:**

1. **Dashboard** — Upcoming gigs, revenue this month, pending proposals, song requests pending, equipment availability.
2. **Events / Gigs** — Event details: date, venue, event type (wedding, corporate, birthday, club night), start/end time, setup time, equipment needed, MC services, lighting, special requests. Timeline/itinerary for the event.
3. **Pipeline** — Inquiry to booking: lead source, event date availability, proposal sent, contract signed, deposit paid. DJ Intelligence and Check Cherry both manage this flow.
4. **Calendar** — Event dates with setup/breakdown times, double-booking prevention. DJ availability management.
5. **Contracts / Proposals** — Package proposals with services included (DJ, MC, lighting, photo booth), timeline, overtime rates. Contract with cancellation policy, equipment liability.
6. **Invoices** — Deposit + final payment. Typical: 25-50% deposit to hold date, balance due before event.

**Optional Tabs:**

1. **Music / Song Requests** — Client song request portal: must-play list, do-not-play list, genre preferences, first dance, special moment songs. SongBoard specializes in this. Guest request functionality.
2. **Event Timeline** — Detailed event timeline: ceremony, cocktail hour, introductions, first dance, dinner, toasts, open dancing, last song. Shareable with client and venue coordinator.
3. **Equipment** — Sound system, speakers, subwoofers, lighting (uplighting, dance floor lights), microphones, DJ controllers. Inventory tracking and per-event assignment.
4. **Reviews / Portfolio** — Video clips of events, testimonials, event galleries for marketing.
5. **Marketing** — Wedding vendor directories, social media, showcase events.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Events/Gigs | Calendar | Events with date, venue, type, package, timeline |
| Inquiries | Pipeline | Leads with event date, type, budget, status |
| Clients | Table | Event hosts with event history, preferences |
| Song Requests | List | Must-play, do-not-play, genre preferences per event |
| Event Timeline | List | Minute-by-minute event itinerary |
| Equipment | Table | Audio, lighting inventory with availability |
| Contracts | Table | Signed agreements with package, terms |

**Pipeline Stages:**

```
Inquiry -> Date Availability Check -> Consultation / Demo -> Proposal Sent -> Contract Signed -> Deposit Paid -> Planning Meeting -> Song Requests Collected -> Event Day -> Final Payment -> Review Request
```

**Unique Features:**
- Song request management (must-play, do-not-play, genre preferences)
- Event timeline/itinerary builder
- Date-based availability (one event per DJ per night)
- Equipment inventory and per-event assignment
- MC services and timeline coordination
- Lighting design options per event
- Guest song request portal (live during event or pre-event)
- Spotify/Apple Music integration for playlists
- DJ profile/demo for marketing
- Overtime rate management
- DJ Intelligence pricing: custom; Check Cherry: custom; SongBoard: free tier available

**Pricing Model:**
- Package-based (4 hours DJ: $800-2,000; 6 hours DJ + MC + lighting: $2,000-5,000)
- Hourly add-ons for overtime ($150-300/hour)
- Equipment add-ons (uplighting, photo booth, subwoofer)
- Travel fees for distant venues
- Deposit: 25-50% at booking, balance before event

---

## 4. EVENT PLANNER

**Competitors studied:** Aisle Planner, Planning Pod, HoneyBook, Dubsado, AllSeated

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Events / Projects |
| Appointments | Planning Meetings |
| Products | Vendor Services |
| Staff | Planners / Coordinators / Assistants |
| Pipeline | Booking Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active events, upcoming deadlines, vendor payments due, revenue, client communications pending.
2. **Events / Projects** — Event management: date, venue, guest count, budget, vendor list, timeline, floor plan, theme/style. Full lifecycle tracking from planning through day-of execution.
3. **Vendors** — Vendor database: category (caterer, florist, photographer, DJ, venue, rentals), contact info, pricing, availability, preferred status, contracts. Vendor coordination is the core of event planning.
4. **Budget** — Budget management per event: categories (venue, catering, flowers, music, photography, rentals, decor), estimated vs actual costs, payments made vs remaining, tips/gratuities. Aisle Planner and Planning Pod both offer detailed budget tracking.
5. **Timeline** — Day-of timeline: minute-by-minute schedule for the event, vendor arrival times, ceremony timing, reception flow. Shared with all vendors and client. Aisle Planner excels at timeline creation.
6. **Clients** — Client profiles with event details, preferences, communication history, contracts, invoices.

**Optional Tabs:**

1. **Guest List** — Guest management: names, RSVPs (yes/no/maybe), meal selections, table assignments, dietary restrictions, address for invitations. Aisle Planner includes guest list management.
2. **Floor Plan / Seating** — Visual floor plan with table layout, seating chart, ceremony layout. AllSeated offers 3D venue visualization.
3. **Design / Style** — Mood boards, color palettes, inspiration images, design direction per event. Aisle Planner includes style guides.
4. **Tasks / Checklists** — Planning task checklists by months-out (12 months, 6 months, 3 months, 1 month, 1 week). Task assignment to team or client.
5. **Documents** — Vendor contracts, proposals, insurance certificates, permits, floor plans.
6. **Reports** — Revenue per event, vendor spend analysis, client acquisition, seasonal trends.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Events | Pipeline | Events with date, venue, guest count, budget, status |
| Vendors | Table | Vendor database with category, contact, pricing, status |
| Budget | Table | Per-event budget with categories, estimated vs actual |
| Timeline | List | Day-of timeline with vendor coordination |
| Guest List | Table | Guests with RSVP, meal, table, dietary info |
| Tasks | List | Planning checklist with months-out deadlines |
| Floor Plans | Cards | Venue layouts with table arrangements |

**Pipeline Stages:**

```
Inquiry -> Consultation -> Proposal Sent -> Contract Signed -> Deposit -> Vendor Selection -> Design Planning -> Vendor Bookings -> Final Details -> Rehearsal -> Event Day -> Day-After Wrap-Up -> Final Invoice -> Review
```

**Unique Features:**
- Vendor management and coordination (the core skill of event planners)
- Detailed budget tracking with estimated vs actual
- Day-of timeline builder shared with all vendors
- Guest list management with RSVP tracking
- Floor plan and seating chart design
- Mood board and style guide creation
- Multi-vendor payment tracking and schedule
- Rehearsal planning and coordination
- Checklist templates by event type (wedding, corporate, social)
- Vendor referral tracking (which vendors do you recommend most?)
- Aisle Planner pricing: $59.99-189.99/month

**Pricing Model:**
- Flat fee per event ($2,000-10,000+ for full planning)
- Day-of coordination fee ($1,000-3,000)
- Percentage of event budget (15-20%)
- Hourly consulting ($50-200/hour)
- Deposit: 30-50% at booking, balance before event or in installments

---

## 5. FLORIST

**Competitors studied:** BloomNation, Floranext, Hana Florist POS, HoneyBook, Details Flowers

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Clients |
| Services | Arrangements / Designs |
| Appointments | Consultations / Deliveries |
| Products | Flowers / Arrangements / Plants |
| Staff | Designers / Delivery Drivers |
| Pipeline | Order Pipeline |

**Essential Tabs:**

1. **Dashboard** — Today's orders, deliveries scheduled, revenue, upcoming event orders (weddings, funerals), walk-in sales, online orders. BloomNation POS 3.0 shows centralized order management.
2. **Orders** — Order management: type (walk-in, phone, online, event), arrangement details, delivery address, delivery date/time, card message, special instructions. Status tracking (received, designing, ready, out for delivery, delivered).
3. **Products / Catalog** — Arrangement catalog with photos, descriptions, pricing, seasonal availability. Categories: everyday bouquets, sympathy, romance, birthday, plants, wedding packages.
4. **Deliveries** — Delivery route management: addresses, time windows, driver assignment, route optimization, delivery confirmation with photo. BloomNation offers smart delivery routing with driver mobile integration.
5. **Events / Weddings** — Event floral: consultation scheduling, proposal builder with arrangement descriptions and pricing, wedding packages (ceremony, reception, bridal party), event setup/breakdown logistics.
6. **Payments** — POS for walk-in, online payments, event deposits, subscription billing for recurring deliveries.

**Optional Tabs:**

1. **Consultations** — Wedding/event floral consultation scheduling and notes: bride's vision, color palette, flower preferences, budget, venue details.
2. **Subscriptions** — Recurring flower delivery programs: weekly office flowers, bi-weekly home bouquets, seasonal arrangements. BloomNation supports automated subscription revenue.
3. **Inventory** — Flower inventory with perishability tracking (roses: 5-7 days, lilies: 10-14 days), wholesale cost, supplier, seasonal availability. Critical for managing waste.
4. **Marketing** — Holiday campaigns (Valentine's, Mother's Day, Prom), event advertising, social media, loyalty program.
5. **Suppliers** — Wholesale flower market relationships, ordering schedules, pricing by season.
6. **Reports** — Revenue by occasion type, popular arrangements, delivery efficiency, waste/loss tracking.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Orders | List | All orders with type, status, delivery, arrangement |
| Products/Arrangements | Cards | Catalog with photos, pricing, availability |
| Deliveries | List (Calendar) | Delivery schedule with addresses, driver, status |
| Events | Calendar | Wedding/event florals with consultation, proposal |
| Subscriptions | Table | Recurring delivery programs with frequency |
| Inventory | Table | Flower stock with perishability, cost, supplier |

**Pipeline Stages:**

Everyday orders:
```
Order Received -> Designing -> Arranged -> Ready -> Out for Delivery -> Delivered -> Review Request
```

Event/Wedding:
```
Inquiry -> Consultation -> Proposal Sent -> Revision -> Approved -> Deposit -> Flower Order Placed -> Design Day -> Setup -> Event -> Breakdown -> Final Invoice -> Review
```

**Unique Features:**
- Perishable inventory management (flower freshness tracking)
- Delivery route optimization with driver mobile app
- Wedding/event floral proposal builder with per-arrangement pricing
- Subscription flower programs (weekly/monthly recurring)
- Seasonal availability management (what's in bloom)
- Card message management (print on card insert)
- Holiday rush management (Valentine's Day, Mother's Day are 30%+ of annual revenue)
- Wire service integration or independence (FTD, Teleflora)
- Photo delivery confirmation
- Recipe/arrangement templates (standard designs that can be reproduced)
- BloomNation POS 3.0: fast order entry, delivery routing, loyalty, subscriptions

**Pricing Model:**
- Per-arrangement pricing (standard bouquets: $40-150)
- Event/wedding packages ($500-15,000+ depending on scale)
- Delivery fees ($10-20 local)
- Subscription programs (weekly: $30-60/delivery)
- Walk-in retail pricing
- Deposit: 50% for events, full payment for everyday orders

---

## 6. WEDDING PLANNER

**Competitors studied:** Aisle Planner, Planning Pod, HoneyBook, Dubsado, Honeybooked

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Couples / Clients |
| Services | Packages / Services |
| Appointments | Planning Sessions |
| Products | N/A |
| Staff | Planners / Coordinators |
| Pipeline | Booking Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active weddings, upcoming planning meetings, vendor payments due, timeline deadlines, revenue. Seasonal view (most weddings May-October).
2. **Weddings** — Per-wedding management: couple names, date, venue(s), guest count, budget, style/theme, vendor team, timeline, all documents. The central organizing entity.
3. **Vendors** — Wedding-specific vendor categories: venue, caterer, photographer, videographer, florist, DJ/band, officiant, hair/makeup, cake, rentals, lighting, transportation, stationery. Track bookings, contracts, payments, contact info per vendor per wedding.
4. **Budget** — Detailed wedding budget: 15-20 categories, estimated vs actual, deposits paid, balances due, tip calculations, contingency fund. Budget tracking is one of the most valued features.
5. **Timeline** — Wedding day timeline: getting ready, ceremony, cocktail hour, reception, last dance. Vendor-specific timelines (photographer arrives at X, florist delivers at Y). Shared with all vendors.
6. **Clients / Couples** — Couple profiles: preferences, vision, communication log, contract, payment schedule.

**Optional Tabs:**

1. **Guest List** — Comprehensive guest management: addresses, RSVPs, dietary restrictions, plus-ones, table assignments, meal selections, B-list/waitlist.
2. **Design** — Mood boards, color palette, inspiration images, fabric swatches, stationery design, cake design.
3. **Seating** — Floor plan with table layout, seating chart management (who sits where), table naming/numbering.
4. **Checklist** — Wedding planning checklist by timeline: 12+ months, 9-12 months, 6-9 months, 3-6 months, 1-3 months, 1 month, week of. Standard checklist with customization.
5. **Documents** — Vendor contracts, insurance, permits, licenses (marriage license reminder).
6. **Client Portal** — Shared workspace where couples can view timeline, budget, vendor contacts, checklist, and provide input.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Weddings | Pipeline | Weddings with date, venue, couple, budget, status |
| Vendors | Table | Per-wedding vendor roster with category, contract, payment |
| Budget | Table | Wedding budget with categories, estimated, actual, paid |
| Timeline | List | Minute-by-minute wedding day schedule |
| Guest List | Table | Guests with RSVP, meal, table, dietary info |
| Checklist | List | Planning tasks by months-out |
| Design/Style | Cards | Mood boards, color palettes, inspiration |

**Pipeline Stages:**

```
Inquiry -> Chemistry Meeting -> Proposal Sent -> Contract Signed -> Deposit -> Vendor Recommendations -> Vendor Bookings -> Design Planning -> Tasting/Tastings -> Final Details Meeting -> Rehearsal -> Wedding Day -> Thank You / Wrap-Up -> Review / Referral
```

**Unique Features:**
- Everything in Event Planner PLUS wedding-specific:
- Couple-focused client management
- Wedding-specific vendor categories and recommendations
- Bridal party coordination
- Ceremony + reception dual-venue management
- Rehearsal dinner planning
- Wedding day emergency kit checklist
- Marriage license and legal requirements tracking
- Gift tracking and thank-you note management
- Day-of coordinator handoff package
- Post-wedding wrap-up (vendor review, album, video delivery tracking)

**Pricing Model:**
- Full planning: $3,000-15,000+ (depending on market/scale)
- Partial planning: $1,500-5,000
- Day-of/month-of coordination: $1,000-3,000
- Hourly consulting: $75-200/hour
- Destination wedding premium: additional fees for travel
- Deposit: 30-50% at booking, balance in installments or before wedding

---

## 7. INTERIOR DESIGNER

**Competitors studied:** Houzz Pro, Studio Designer, DesignFiles, Mydoma Studio, Ivy (now Houzz Pro)

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Projects / Rooms |
| Appointments | Consultations / Site Visits |
| Products | Furnishings / Fixtures / Materials |
| Staff | Designers / Assistants / Installers |
| Pipeline | Project Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active projects, proposals pending, purchase orders to track, upcoming installations, revenue, time logged.
2. **Projects** — Project management per client: rooms/spaces, design phase, mood boards, product selections, floor plans, budget, timeline. Houzz Pro organizes by project with phases and tasks.
3. **Product Sourcing** — Product library: furniture, lighting, textiles, accessories, materials with vendor, price, lead time, specifications. Houzz Pro's Clipper tool captures product info from vendor websites. This is a core differentiator for interior design software.
4. **Procurement** — Purchase order management: order tracking, vendor communication, shipping/delivery coordination, receiving, installation scheduling. Studio Designer specializes in procurement workflow.
5. **Presentations / Design Boards** — Mood boards, concept boards, room renders, material/finish selections shared with clients for approval. Visual presentation is how designers sell their vision.
6. **Billing** — Design fee tracking (hourly or flat), product markup management, procurement pass-through with markup, invoicing, payment collection.

**Optional Tabs:**

1. **Time Tracking** — Hours per project/room, billable vs admin time, budget comparison. Houzz Pro includes time tracking with rounding.
2. **Client Portal** — Shared workspace for clients to view designs, approve selections, track orders, make payments. Houzz Pro offers auto-updating client dashboards.
3. **Floor Plans** — 2D/3D floor plan creation, furniture placement, spatial planning. Houzz Pro offers 3D visualization and AR room tours.
4. **Proposals** — Design proposal with scope, fee structure, terms, estimated product budget.
5. **Vendors / Trade Resources** — Trade vendor relationships, trade discounts, showroom contacts, sample tracking.
6. **Reports** — Project profitability, time utilization, product markup analysis, revenue by project type.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Design projects with rooms, phase, budget, status |
| Products / Selections | Table | Furnishings with vendor, price, lead time, room |
| Purchase Orders | Table | Orders with vendor, items, ship date, tracking |
| Mood Boards | Cards | Visual design concepts per room/project |
| Floor Plans | Cards | Room layouts with furniture placement |
| Proposals | Pipeline | Design proposals with fee, scope, status |
| Invoices | Table | Bills with design fees, product markup, payments |

**Pipeline Stages:**

```
Inquiry -> Initial Consultation -> Design Agreement Signed -> Retainer Paid -> Concept Development -> Mood Board Presentation -> Client Approval -> Product Sourcing -> Procurement -> Ordering -> Receiving / Warehousing -> Installation Day -> Styling -> Project Reveal -> Final Invoice -> Photography
```

**Unique Features:**
- Product sourcing and procurement management (furniture, materials, fixtures)
- Trade discount management and product markup tracking
- Mood board and design board creation
- Floor plan / 3D visualization / AR room tours
- Multi-room project management within single client
- Lead time tracking for furniture orders (often 8-16 weeks)
- Installation coordination and scheduling
- Product markup as revenue model (buy at trade, sell at retail)
- Client selection approval workflow
- Vendor/showroom relationship management
- Sample and swatch tracking
- Houzz Pro pricing: starts at $249/year
- Studio Designer pricing: $72-109/user/month

**Pricing Model:**
- Hourly design fee ($100-500/hour)
- Flat fee per room ($1,000-10,000+ per room)
- Percentage of total product budget (25-35% markup on furnishings)
- Cost-plus (wholesale cost + fixed percentage markup)
- Retainer + hourly + markup combination
- Procurement fees (pass-through + markup)

---

## 8. GRAPHIC DESIGNER / FREELANCE CREATIVE

**Competitors studied:** HoneyBook, Dubsado, Bonsai, 17hats, Toggl

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Projects / Services |
| Appointments | Meetings / Calls |
| Products | Deliverables / Files |
| Staff | Designer (typically solo) |
| Pipeline | Project Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active projects, upcoming deadlines, invoices outstanding, proposals pending, income this month.
2. **Projects** — Project management: type (logo, brand identity, website, packaging, print, social media graphics), deliverables, revision rounds, timeline, file delivery. Per-project task tracking.
3. **Clients** — Client CRM: company info, brand guidelines, project history, communication, invoices. Long-term client relationships are the goal.
4. **Proposals / Contracts** — Project proposal with scope, deliverables, timeline, pricing, revision policy. Combined proposal + contract + invoice (Dubsado excels at this). Terms: revision limits, file format delivery, usage rights.
5. **Invoices / Payments** — Milestone-based invoicing: deposit, mid-project, final delivery. Recurring invoicing for retainer clients. Bonsai offers integrated invoicing with time tracking.
6. **Calendar** — Project deadlines, client meetings, delivery dates, revision rounds.

**Optional Tabs:**

1. **Time Tracking** — Hours per project, billable rate tracking, project profitability. Essential for understanding true cost per project and quoting accurately.
2. **Files / Deliverables** — File delivery management: organized by project, version control, file format options (AI, PSD, PNG, PDF), brand asset packages.
3. **Questionnaires / Briefs** — Creative brief collection: brand values, target audience, competitors, color preferences, style references. Pre-project information gathering.
4. **Portfolio** — Website portfolio integration, case study presentation, process documentation.
5. **Taxes / Expenses** — Income/expense tracking, quarterly estimated taxes, 1099 tracking. Bonsai offers built-in tax tracking for freelancers.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Design projects with type, deliverables, status |
| Clients | Table | Client profiles with brand info, project history |
| Proposals | Pipeline | Project proposals with scope, pricing, status |
| Deliverables | Table | Files with version, format, delivery status |
| Invoices | Table | Payment milestones with amounts, status |
| Time Entries | Table | Hours per project with rate |

**Pipeline Stages:**

```
Inquiry -> Discovery Call -> Creative Brief -> Proposal Sent -> Contract Signed -> Deposit -> Research / Mood Board -> First Concepts -> Client Feedback -> Revisions -> Final Approval -> File Delivery -> Final Payment -> Testimonial Request
```

**Unique Features:**
- Creative brief/questionnaire collection
- Revision tracking with contractual limits (2-3 rounds included)
- File delivery management with multiple formats
- Brand asset package delivery (logos, colors, fonts, guidelines)
- Usage rights and licensing in contracts
- Version control for design iterations
- Recurring retainer management for ongoing clients
- Tax tracking for freelancers (quarterly estimates, 1099)
- Portfolio website integration
- Sub-branding for multi-brand freelancers
- Dubsado pricing: $20/mo (Starter), $40/mo (Premier)
- HoneyBook pricing: $29/mo (Starter, annual)
- Bonsai pricing: $21/mo (Starter)

**Pricing Model:**
- Project-based (logo: $500-5,000; brand identity: $2,000-15,000; website: $3,000-20,000)
- Hourly ($50-200/hour)
- Monthly retainer ($500-5,000/month for ongoing design support)
- Per-deliverable pricing for smaller items
- Rush fees (24-48 hour turnaround premium)
- Deposit: 30-50% at booking, balance at delivery

---

## 9. COMPETITOR COMPARISON

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **HoneyBook** | All creatives/events | $29/mo (annual) | AI-powered, proposal-to-payment flow, templates, easy UX |
| **Dubsado** | Service-based creatives | $20/mo | Powerful workflow automation, branded forms, unlimited clients |
| **Studio Ninja** | Photographers | ~$17.50/mo | Photography-specific, gallery integrations, 30K+ users |
| **Tave (VSCO Workspace)** | Photographers | $20/mo | Deep automation, lead tracking, multi-brand support |
| **Pixieset** | Photo gallery delivery | Free - $50/mo | Gallery delivery, proofing, print store, client downloads |
| **ShootProof** | Photo sales | $10/mo+ | Online gallery store, lab integration, print fulfillment |
| **Aisle Planner** | Wedding/event planners | $59.99/mo | Wedding-specific, timeline builder, guest lists, style guides |
| **Planning Pod** | Event planners | Custom | Full event management: floor plans, catering, registration |
| **BloomNation** | Florists | Custom | Florist POS, delivery routing, wire-service alternative |
| **Check Cherry** | DJs/entertainers | Custom | DJ-specific, song requests, packages, Spotify integration |
| **Houzz Pro** | Interior designers | $249/year | Product sourcing (Clipper), 3D viz, procurement, client portal |
| **Studio Designer** | Interior designers | $72/user/mo | Advanced procurement, accounting, vendor management |
| **Bonsai** | Freelancers | $21/mo | All-in-one for freelancers: contracts, invoicing, taxes |
| **17hats** | Small service businesses | $15/mo | Affordable all-in-one, lead capture, workflows, quotes |

**Red Pine Gaps/Opportunities:**
- The inquiry-to-booking pipeline is universal across all creative/event businesses
- Gallery delivery (photography) is a specialized need that could integrate or partner
- Song request management (DJ) is niche but builds client engagement
- Vendor coordination (event planners) is poorly served by generic CRM tools
- Product sourcing and procurement (interior design) is the most complex workflow
- All these businesses need portfolio/gallery on their website (Red Pine Website feature)
- Milestone payment management is universal and should be a core feature
- Questionnaire/intake forms are used by every creative business type
- Contract + proposal + invoice as a unified flow is the winning pattern (Dubsado/HoneyBook)

---

## 10. TEMPLATE CONFIG RECOMMENDATIONS

### Photographer

```typescript
{
  templateId: 'photographer',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Packages',
    appointments: 'Shoots',
    staff: 'Photographers',
    products: 'Prints & Albums'
  },
  portalConfig: {
    primaryAction: 'inquire_about_session',
    bookingMode: 'inquiry_to_booking',
    chatProminence: 'high',
    reviewPrompt: 'after_gallery_delivery',
    preferenceFields: ['session_type', 'event_date', 'location', 'guest_count', 'style_preference']
  },
  essentialTabs: ['dashboard', 'bookings', 'pipeline', 'calendar', 'contracts', 'invoices'],
  optionalTabs: ['galleries', 'questionnaires', 'workflows', 'store', 'marketing', 'reports'],
  defaultView: { bookings: 'calendar', pipeline: 'pipeline', contracts: 'table', galleries: 'cards' },
  pipelineStages: ['inquiry', 'responded', 'consultation', 'proposal_sent', 'contract_signed', 'deposit_paid', 'planning', 'shoot_day', 'editing', 'gallery_delivered', 'final_payment', 'review'],
  paymentModel: 'deposit_plus_final',
  bookingFlow: 'inquiry_to_proposal_to_contract'
}
```

### Videographer

```typescript
{
  templateId: 'videographer',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Projects',
    appointments: 'Shoots',
    staff: 'Videographers',
    products: 'Films & Videos'
  },
  portalConfig: {
    primaryAction: 'request_quote',
    bookingMode: 'inquiry_to_booking',
    chatProminence: 'high',
    reviewPrompt: 'after_final_delivery',
    preferenceFields: ['project_type', 'event_date', 'location', 'deliverables_needed', 'budget_range']
  },
  essentialTabs: ['dashboard', 'projects', 'pipeline', 'calendar', 'contracts', 'invoices'],
  optionalTabs: ['deliverables', 'questionnaires', 'crew', 'equipment', 'reports'],
  defaultView: { projects: 'pipeline', calendar: 'calendar', deliverables: 'table' },
  pipelineStages: ['inquiry', 'discovery_call', 'proposal_sent', 'contract_signed', 'deposit', 'pre_production', 'shoot', 'editing', 'rough_cut', 'revisions', 'final_delivery', 'final_payment'],
  paymentModel: 'milestone_payments',
  bookingFlow: 'inquiry_to_proposal_to_contract'
}
```

### DJ / Entertainer

```typescript
{
  templateId: 'dj',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Packages',
    appointments: 'Events',
    staff: 'DJs',
    products: 'Equipment'
  },
  portalConfig: {
    primaryAction: 'check_availability',
    bookingMode: 'date_based_booking',
    chatProminence: 'high',
    reviewPrompt: 'after_event',
    preferenceFields: ['event_type', 'event_date', 'venue', 'guest_count', 'music_genre', 'services_needed']
  },
  essentialTabs: ['dashboard', 'events', 'pipeline', 'calendar', 'contracts', 'invoices'],
  optionalTabs: ['music_requests', 'event_timeline', 'equipment', 'reviews', 'marketing'],
  defaultView: { events: 'calendar', pipeline: 'pipeline', music_requests: 'list' },
  pipelineStages: ['inquiry', 'availability_check', 'consultation', 'proposal_sent', 'contract_signed', 'deposit', 'planning', 'song_requests', 'event_day', 'final_payment', 'review'],
  paymentModel: 'deposit_plus_final',
  bookingFlow: 'inquiry_to_proposal_to_contract'
}
```

### Event Planner

```typescript
{
  templateId: 'event_planner',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Events',
    appointments: 'Planning Meetings',
    staff: 'Planners',
    products: 'Vendor Services'
  },
  portalConfig: {
    primaryAction: 'plan_my_event',
    bookingMode: 'consultation',
    chatProminence: 'high',
    reviewPrompt: 'after_event',
    preferenceFields: ['event_type', 'date', 'guest_count', 'budget', 'venue_preference', 'style']
  },
  essentialTabs: ['dashboard', 'events', 'vendors', 'budget', 'timeline', 'clients'],
  optionalTabs: ['guest_list', 'floor_plan', 'design', 'tasks', 'documents', 'reports'],
  defaultView: { events: 'pipeline', vendors: 'table', budget: 'table', timeline: 'list' },
  pipelineStages: ['inquiry', 'consultation', 'proposal_sent', 'signed', 'deposit', 'vendor_selection', 'design', 'bookings', 'final_details', 'event_day', 'wrapup', 'review'],
  paymentModel: 'deposit_installments_final',
  bookingFlow: 'consultation_to_proposal'
}
```

### Florist

```typescript
{
  templateId: 'florist',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Customers',
    services: 'Arrangements',
    appointments: 'Consultations',
    staff: 'Designers',
    products: 'Flowers & Plants'
  },
  portalConfig: {
    primaryAction: 'order_flowers',
    bookingMode: 'order_or_consultation',
    chatProminence: 'medium',
    reviewPrompt: 'after_delivery',
    preferenceFields: ['occasion', 'budget', 'color_preference', 'delivery_date', 'recipient_address']
  },
  essentialTabs: ['dashboard', 'orders', 'products', 'deliveries', 'events', 'payments'],
  optionalTabs: ['consultations', 'subscriptions', 'inventory', 'marketing', 'suppliers', 'reports'],
  defaultView: { orders: 'list', products: 'cards', deliveries: 'list', events: 'calendar' },
  pipelineStages: ['order_received', 'designing', 'arranged', 'ready', 'out_for_delivery', 'delivered'],
  paymentModel: 'immediate_or_deposit',
  bookingFlow: 'order_online_or_consultation'
}
```

### Wedding Planner

```typescript
{
  templateId: 'wedding_planner',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Couples',
    services: 'Planning Packages',
    appointments: 'Planning Sessions',
    staff: 'Planners',
    products: null
  },
  portalConfig: {
    primaryAction: 'start_planning',
    bookingMode: 'consultation',
    chatProminence: 'high',
    reviewPrompt: 'after_wedding',
    preferenceFields: ['wedding_date', 'guest_count', 'budget', 'venue_preference', 'style', 'services_needed']
  },
  essentialTabs: ['dashboard', 'weddings', 'vendors', 'budget', 'timeline', 'couples'],
  optionalTabs: ['guest_list', 'design', 'seating', 'checklist', 'documents', 'portal'],
  defaultView: { weddings: 'pipeline', vendors: 'table', budget: 'table', timeline: 'list' },
  pipelineStages: ['inquiry', 'chemistry_meeting', 'proposal_sent', 'signed', 'deposit', 'vendor_selection', 'design', 'bookings', 'final_details', 'rehearsal', 'wedding_day', 'wrapup'],
  paymentModel: 'deposit_installments_final',
  bookingFlow: 'consultation_to_proposal'
}
```

### Interior Designer

```typescript
{
  templateId: 'interior_designer',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Projects',
    appointments: 'Consultations',
    staff: 'Designers',
    products: 'Furnishings'
  },
  portalConfig: {
    primaryAction: 'book_consultation',
    bookingMode: 'consultation',
    chatProminence: 'medium',
    reviewPrompt: 'after_project_reveal',
    preferenceFields: ['project_type', 'rooms', 'style', 'budget', 'timeline']
  },
  essentialTabs: ['dashboard', 'projects', 'sourcing', 'procurement', 'presentations', 'billing'],
  optionalTabs: ['time_tracking', 'portal', 'floor_plans', 'proposals', 'vendors', 'reports'],
  defaultView: { projects: 'pipeline', sourcing: 'table', procurement: 'table', presentations: 'cards' },
  pipelineStages: ['inquiry', 'consultation', 'agreement_signed', 'retainer', 'concept', 'presentation', 'approval', 'sourcing', 'procurement', 'ordering', 'receiving', 'installation', 'styling', 'reveal', 'final_invoice'],
  paymentModel: 'retainer_plus_markup',
  bookingFlow: 'consultation_to_agreement'
}
```

### Graphic Designer / Freelance Creative

```typescript
{
  templateId: 'graphic_designer',
  familyId: 'creative_events',
  labelOverrides: {
    clients: 'Clients',
    services: 'Projects',
    appointments: 'Meetings',
    staff: 'Designer',
    products: 'Deliverables'
  },
  portalConfig: {
    primaryAction: 'start_a_project',
    bookingMode: 'inquiry',
    chatProminence: 'high',
    reviewPrompt: 'after_project_delivery',
    preferenceFields: ['project_type', 'timeline', 'budget', 'brand_guidelines']
  },
  essentialTabs: ['dashboard', 'projects', 'clients', 'proposals', 'invoices', 'calendar'],
  optionalTabs: ['time_tracking', 'deliverables', 'questionnaires', 'portfolio', 'taxes'],
  defaultView: { projects: 'pipeline', clients: 'table', proposals: 'pipeline', invoices: 'table' },
  pipelineStages: ['inquiry', 'discovery', 'brief', 'proposal_sent', 'signed', 'deposit', 'research', 'concepts', 'feedback', 'revisions', 'approval', 'file_delivery', 'final_payment'],
  paymentModel: 'deposit_plus_final_or_retainer',
  bookingFlow: 'inquiry_to_proposal'
}
```

---

## Sources

- HoneyBook: https://www.honeybook.com/pricing
- Dubsado: https://www.dubsado.com/pricing
- Studio Ninja: https://www.studioninja.co/pricing/
- Tave / VSCO Workspace: https://hello.tave.com/tave-plans
- Pixieset: https://pixieset.com/pricing/
- ShootProof: https://www.shootproof.com/
- Aisle Planner: https://www.aisleplanner.com/
- Planning Pod: https://planningpod.com/
- BloomNation: https://www.bloomnation.com/
- DJ Intelligence: https://www.djintelligence.com/
- Check Cherry: https://www.checkcherry.com/
- Houzz Pro: https://www.houzz.com/pro
- Studio Designer: https://www.studiodesigner.com/
- Bonsai: https://www.hellobonsai.com/
- 17hats: https://www.17hats.com/
