# Research Prompts — Ready to Run in Parallel

Copy-paste each into a separate Claude Code terminal. All results save to `research-results/`.

---

## PROMPT 1: Health & Wellness Templates (10 types)

```
Research the leading industry-specific software for Health & Wellness businesses and document what features/tabs they need in a dashboard platform. For each business type, study the top 2-3 competing platforms.

BUSINESS TYPES: gym, yoga studio, pilates studio, personal trainer, nutritionist/dietitian, chiropractor, physical therapy practice, mental health/therapy practice, massage therapy, acupuncture clinic

COMPETITORS TO STUDY: Mindbody, Vagaro, Zen Planner, WellnessLiving, Jane App, SimplePractice, Practice Better, TrueCoach, My PT Hub, Acuity Scheduling

For EACH of the 10 business types, document:
1. Essential tabs (what MUST be there day 1)
2. Optional tabs (nice-to-have, added later)
3. Industry-specific entities (e.g., "Treatment Plans" for PT, "Class Schedule" for yoga, "Workout Programs" for trainers)
4. Default view per entity (table/calendar/pipeline/cards/list)
5. Pipeline stages if applicable (e.g., patient intake pipeline)
6. Unique features that industry expects (e.g., SOAP notes for chiro, progress photos for trainers)
7. Label overrides (e.g., "Patients" not "Clients" for healthcare, "Members" not "Clients" for gyms)
8. What the booking/scheduling flow looks like (class-based vs appointment-based vs both)
9. Payment model (memberships vs packages vs per-session vs insurance billing)
10. What review/rating patterns exist in this industry

Save to research-results/17-health-wellness-templates.md
```

---

## PROMPT 2: Food & Beverage Templates (8 types)

```
Research the leading industry-specific software for Food & Beverage businesses and document what features/tabs they need in a dashboard platform.

BUSINESS TYPES: restaurant (full service), café/coffee shop, bakery, food truck, catering company, bar/lounge/nightclub, juice bar/smoothie shop, meal prep service

COMPETITORS TO STUDY: Toast, Square for Restaurants, Clover, TouchBistro, 7shifts, MarketMan, BentoBox, Popmenu, ChowNow, Olo

For EACH of the 8 business types, document:
1. Essential tabs (what MUST be there)
2. Optional tabs
3. Industry-specific entities (e.g., "Menu Items" with modifiers, "Recipes" with cost tracking, "Reservations", "Table Layout", "Tip Pools", "Waste Log")
4. Default view per entity
5. Unique features (e.g., kitchen display system, online ordering flow, delivery tracking, table management)
6. Label overrides (e.g., "Guests" not "Clients", "Menu" not "Services")
7. Ordering flow (dine-in vs takeout vs delivery vs catering)
8. Payment model (POS, tips, split checks, tabs)
9. Staff-specific needs (BOH vs FOH, tip pooling, shift scheduling)
10. What inventory/supply chain looks like for food businesses

Save to research-results/18-food-beverage-templates.md
```

---

## PROMPT 3: Home & Field Services Templates (10 types)

```
Research the leading industry-specific software for Home & Field Services businesses and document what features/tabs they need.

BUSINESS TYPES: plumber, electrician, HVAC technician, landscaper/lawn care, cleaning service (residential + commercial), pest control, handyman, roofing contractor, painter, moving company

COMPETITORS TO STUDY: ServiceTitan, Housecall Pro, Jobber, FieldEdge, ServiceM8, Workiz, GorillaDesk, LawnPro, ZenMaid, Launch27

For EACH of the 10 business types, document:
1. Essential tabs
2. Optional tabs
3. Industry-specific entities (e.g., "Jobs" with checklists, "Estimates/Quotes", "Routes", "Equipment/Fleet", "Permits/Inspections")
4. Default view per entity
5. Pipeline stages (e.g., Lead → Estimate → Scheduled → In Progress → Complete → Invoiced)
6. Unique features (e.g., GPS tracking, route optimization, before/after photos, permit tracking)
7. Label overrides (e.g., "Jobs" not "Appointments", "Properties" not "Clients")
8. Quoting/estimating flow (how do they price and send estimates?)
9. Payment model (deposits, progress billing, final invoice)
10. Fleet/equipment management needs

Save to research-results/19-home-field-services-templates.md
```

---

## PROMPT 4: Professional Services Templates (8 types)

```
Research the leading industry-specific software for Professional Services businesses and document what features/tabs they need.

BUSINESS TYPES: law firm/solo attorney, accounting/bookkeeping firm, business consultant, real estate agent/agency, insurance agent/agency, marketing/creative agency, architecture firm, financial advisor/planner

COMPETITORS TO STUDY: Clio (legal), QuickBooks (accounting), HoneyBook (creative), Follow Up Boss (real estate), AgencyAnalytics, Wrike, Monday.com, Dubsado, Toggl

For EACH of the 8 business types, document:
1. Essential tabs
2. Optional tabs
3. Industry-specific entities (e.g., "Cases" for legal, "Tax Returns" for accounting, "Listings" for real estate, "Campaigns" for marketing)
4. Default view per entity
5. Pipeline stages (e.g., legal: Intake → Review → Discovery → Trial → Closed)
6. Unique features (e.g., time tracking + billable hours, document management, client portals)
7. Label overrides
8. Billing model (hourly, retainer, project-based, commission)
9. Document/contract workflow
10. Compliance requirements (attorney-client privilege, financial regulations)

Save to research-results/20-professional-services-templates.md
```

---

## PROMPT 5: Creative & Events Templates (8 types)

```
Research the leading industry-specific software for Creative & Events businesses.

BUSINESS TYPES: photographer, videographer, DJ/entertainer, event planner, florist, wedding planner, interior designer, graphic designer/freelance creative

COMPETITORS TO STUDY: HoneyBook, Dubsado, Studio Ninja, ShootProof, Bloom, Aisle Planner, 17hats, Táve, Pixieset

For EACH of the 8 business types, document:
1. Essential tabs
2. Optional tabs
3. Industry-specific entities (e.g., "Events/Shoots" for photographers, "Mood Boards" for designers, "Vendor Lists" for wedding planners, "Galleries" for creatives)
4. Default view per entity
5. Pipeline stages (e.g., Inquiry → Proposal → Booked → Shoot → Edit → Deliver)
6. Unique features (e.g., gallery delivery/proofing, timeline management, vendor coordination)
7. Label overrides
8. Pricing model (packages, day rates, per-deliverable)
9. How contracts/proposals work in this industry
10. Portfolio/gallery importance and how it differs by type

Save to research-results/21-creative-events-templates.md
```

---

## PROMPT 6: Education & Childcare Templates (8 types)

```
Research the leading industry-specific software for Education & Childcare businesses.

BUSINESS TYPES: tutoring center/private tutor, music school/lessons, dance studio, daycare/childcare center, driving school, language school, martial arts studio, swim school/aquatics

COMPETITORS TO STUDY: Jackrabbit (dance/gym/swim), Pike13, iClassPro, Zen Planner, My Music Staff, TutorCruncher, brightwheel (childcare), Procare (childcare), Kicksite (martial arts)

For EACH of the 8 business types, document:
1. Essential tabs
2. Optional tabs
3. Industry-specific entities (e.g., "Students" with guardians, "Class Schedule" with enrollment, "Belt/Level Progression" for martial arts, "Recitals/Performances" for dance/music)
4. Default view per entity
5. Pipeline stages if applicable (e.g., martial arts belt progression, student enrollment funnel)
6. Unique features (e.g., parent portals, attendance tracking, skill progression, uniform/gear sales, sibling discounts)
7. Label overrides (e.g., "Students" not "Clients", "Guardians" as secondary contacts)
8. Payment model (monthly tuition, drop-in, semester packages, sibling discounts, registration fees)
9. Scheduling model (recurring classes vs private lessons vs camps/workshops)
10. Safety/compliance (child pickup authorization, emergency contacts, medical info)

Save to research-results/22-education-childcare-templates.md
```

---

## PROMPT 7: Automotive & Retail Templates (13 types)

```
Research the leading industry-specific software for Automotive AND Retail businesses.

AUTOMOTIVE (6): auto repair shop, auto detailing, car wash, tire shop, body shop/collision, towing company

RETAIL (7): boutique/clothing store, jewelry store, thrift/consignment store, pet store, gift shop, smoke/vape shop, bookstore

COMPETITORS TO STUDY:
- Auto: Shop-Ware, Mitchell 1, Tekmetric, AutoFluent, Urable (detailing)
- Retail: Shopify POS, Square POS, Lightspeed, Vend, Clover

For EACH of the 13 business types, document:
1. Essential tabs
2. Optional tabs
3. Industry-specific entities (e.g., "Vehicles" for auto with VIN/make/model, "Work Orders" for repair, "Consignment Inventory" for thrift)
4. Default view per entity
5. Pipeline stages (e.g., auto repair: Check-in → Diagnose → Approve → In Progress → QC → Ready)
6. Unique features (e.g., VIN lookup, digital vehicle inspection, inventory with variants/sizes, consignment tracking)
7. Label overrides
8. Payment model
9. Inventory management specifics (how deep does each type need it?)
10. Customer communication patterns (text when car is ready, restock alerts)

Save to research-results/23-automotive-retail-templates.md
```

---

## PROMPT 8: COO Memory & AI Assistant Research

```
Research how AI assistants and CRM platforms handle long-term memory, context persistence, and personalized AI interactions. This is for Red Pine's AI COO — a Jarvis-like business assistant that remembers everything about the owner and their business.

RESEARCH AREAS:

1. AI MEMORY SYSTEMS — How do these handle persistent context?
   - ChatGPT memory feature (how it stores, retrieves, forgets)
   - Google Gemini persistent memory
   - Character.ai long-term memory
   - Replika relationship memory
   - Claude's own approach to memory
   What works? What breaks? What do users love/hate?

2. RAG vs STRUCTURED MEMORY — Compare approaches:
   - Vector database retrieval (Pinecone, Weaviate, ChromaDB)
   - Structured memory tables (SQL-based, categorized)
   - Hybrid approaches
   What's the cost at scale? Latency? Accuracy?

3. CRM AI ASSISTANTS — How do these CRM platforms use AI?
   - Salesforce Einstein (AI predictions, recommendations)
   - HubSpot AI (content, chat, forecasting)
   - Zoho Zia (anomaly detection, predictions)
   - Freshworks Freddy AI
   What do they remember? How do they personalize? What do users say?

4. PROMPT ENGINEERING FOR MEMORY — Best practices:
   - How to structure system prompts with loaded memories
   - Memory extraction patterns (what to save from conversations)
   - Memory conflict resolution techniques
   - How to make AI "reflect" and self-organize memories

5. PERSONALITY & TRUST — How do AI assistants build trust?
   - Tone calibration (professional vs casual)
   - When to proactively surface insights vs wait to be asked
   - How to avoid being annoying/pushy
   - Personality configuration patterns

6. COST ANALYSIS — What does persistent AI context cost?
   - Haiku 4.5 with 5k-10k tokens of memory context per message
   - At 100-500 messages/month per user
   - At 1,000-10,000 users
   - Compare: vector DB hosting vs SQL memory table approach

Save to research-results/24-coo-memory-ai-research.md
Include specific quotes from users about AI memory features (what they love/hate).
```

---

## PROMPT 9: Pre-Set Automations Research

```
Research how business platforms provide pre-built automations that come ready to use. Focus on what automations small businesses actually need per industry.

PLATFORMS TO STUDY:
1. GoHighLevel — snapshots, workflow templates, trigger library
2. HubSpot — workflow templates marketplace
3. Mailchimp — pre-built automations (welcome series, abandoned cart, etc.)
4. ActiveCampaign — automation recipes
5. Zapier — most popular zaps by category
6. Monday.com — automation templates
7. Keap/Infusionsoft — campaign templates

FOR EACH PLATFORM, document:
1. What pre-built automations come out of the box?
2. Can users toggle them on/off?
3. Can users customize the steps?
4. How are they organized (by trigger type, by industry, by goal)?

THEN, for each Red Pine industry family, suggest 5-10 pre-built automations:

BEAUTY & BODY:
- e.g., "Send appointment reminder 24hrs before"
- e.g., "Request review 2hrs after appointment"
- e.g., "Birthday discount email"

FOOD & BEVERAGE:
- e.g., "Welcome email with first-time discount"

HOME SERVICES:
- e.g., "Follow-up estimate after 48hrs"

PROFESSIONAL SERVICES, CREATIVE, EDUCATION, AUTOMOTIVE, RETAIL — same format.

For each automation, specify:
- Trigger (what starts it)
- Action (what happens)
- Channel (email, SMS, in-app)
- Delay (immediate, 1hr, 24hrs, etc.)
- Can it be toggled on/off?

Save to research-results/25-preset-automations.md
```

---

## PROMPT 10: Website Copy Patterns Per Industry

```
Research how AI and website builders generate industry-specific website copy. Document the patterns for hero headlines, about sections, feature lists, and CTAs per business type.

STUDY:
1. Wix ADI — what copy does it generate for different business types?
2. Squarespace Blueprint — copy suggestions per template
3. GoDaddy AI builder — auto-generated content patterns
4. Durable.co — AI website generator copy patterns
5. 10Web AI — WordPress AI builder copy
6. Framer AI — AI-generated website copy

FOR EACH of Red Pine's 9 template families, document:
1. 3-5 hero headline patterns (with {business_name} placeholder)
2. 2-3 hero subheadline patterns
3. 2-3 CTA button text options
4. About section template (2-3 paragraph structure)
5. 3-5 "Why Choose Us" feature bullets typical for that industry
6. Contact section copy
7. Common tone/voice for the industry (formal vs casual vs warm)

FAMILIES: Beauty & Body, Health & Wellness, Food & Beverage, Home & Field Services, Professional Services, Creative & Events, Education & Childcare, Automotive, Retail

Also research:
- What makes AI-generated copy feel generic vs personalized?
- How do the best AI builders avoid the "written by AI" feel?
- What information do they ask the user to personalize copy?

Save to research-results/26-website-copy-patterns.md
```
