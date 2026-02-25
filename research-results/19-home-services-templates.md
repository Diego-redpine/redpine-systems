# Research #19: Home & Field Services Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 10 home/field service business types based on competitor platform research.

---

## Table of Contents
1. [Plumber](#1-plumber)
2. [Electrician](#2-electrician)
3. [HVAC Technician](#3-hvac-technician)
4. [Landscaper / Lawn Care](#4-landscaper--lawn-care)
5. [Cleaning Service](#5-cleaning-service)
6. [Pest Control](#6-pest-control)
7. [Handyman](#7-handyman)
8. [Roofing Contractor](#8-roofing-contractor)
9. [Painter](#9-painter)
10. [Moving Company](#10-moving-company)
11. [Competitor Comparison](#11-competitor-comparison)
12. [Template Config Recommendations](#12-template-config-recommendations)

---

## INDUSTRY OVERVIEW

Home and field services represent one of the largest small business categories, with businesses that dispatch technicians or crews to customer locations. The industry is dominated by ServiceTitan (enterprise), Housecall Pro (mid-market), and Jobber (SMB). The universal workflow is: Lead -> Estimate -> Schedule -> Dispatch -> Complete -> Invoice -> Collect Payment -> Request Review. Key differentiators are quoting/estimating, GPS dispatch, route optimization, and before/after photo documentation.

---

## 1. PLUMBER

**Competitors studied:** ServiceTitan, Housecall Pro, Jobber, Workiz, FieldEdge

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Property Owners |
| Services | Services / Repairs |
| Appointments | Jobs / Service Calls |
| Products | Parts / Materials |
| Staff | Technicians / Plumbers |
| Pipeline | Job Pipeline |

**Essential Tabs:**

1. **Dashboard** — Jobs today, revenue this week/month, outstanding invoices, dispatch board, technician locations (GPS), average ticket, booking conversion rate. ServiceTitan's dashboard shows real-time technician positions and revenue metrics.
2. **Jobs** — Job management: service type (drain clearing, leak repair, water heater, pipe replacement, sewer line), customer info, property address, scheduled time, assigned technician, job status, notes/photos, parts used, time tracking. Housecall Pro allows photo documentation on every job.
3. **Schedule / Dispatch** — Calendar view with drag-and-drop dispatch, technician availability, GPS tracking, route optimization, automatic customer notifications (on the way, arrived, completed). ServiceTitan and Housecall Pro both excel at real-time dispatching.
4. **Estimates** — Flat-rate pricing (pricebook) or time-and-materials quoting, good/better/best options, photo and video attachments, digital signature for approval, automatic conversion to job on approval. ServiceTitan's Pricebook Pro is the gold standard for flat-rate pricing.
5. **Invoices / Payments** — Invoice generation from job details, on-site payment collection (card, check, cash), financing options for large jobs ($5K+), payment plans, automatic receipts. Housecall Pro enables one-click invoicing from completed jobs.
6. **Customers** — Customer profiles with property details, service history, equipment installed (water heater age, pipe materials), communication log, outstanding balance.

**Optional Tabs:**

1. **Memberships / Service Agreements** — Maintenance plan management (annual flush, inspection), auto-renewal, recurring revenue tracking. ServiceTitan's membership feature drives recurring revenue.
2. **Marketing** — Google Local Services Ads integration, review generation, referral programs, postcard/email campaigns.
3. **Parts / Inventory** — Truck stock management, parts ordering, vendor pricing, parts markup tracking.
4. **Reports** — Revenue by service type, technician performance (average ticket, close rate), marketing ROI, job profitability.
5. **Permits** — Permit application tracking, inspection scheduling, compliance documentation.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Service calls with type, address, tech, status |
| Estimates | Pipeline | Quotes with status (draft, sent, approved, declined) |
| Customers | Table | Property owners with address, equipment, history |
| Invoices | Table | Bills with status (draft, sent, paid, overdue) |
| Technicians | Cards | Tech profiles with location, schedule, performance |
| Service Agreements | Table | Memberships with renewal date, services included |
| Parts/Inventory | Table | Truck stock with quantities, reorder alerts |

**Pipeline Stages:**

```
Lead/Call -> Estimate Scheduled -> Estimate Sent -> Approved -> Job Scheduled -> In Progress -> Completed -> Invoiced -> Paid -> Review Requested
```

**Unique Features:**
- Flat-rate pricebook with good/better/best options presentation
- GPS technician tracking and real-time dispatch board
- On-the-way and arrival notifications to customers (SMS/email)
- Before/after photo documentation
- Equipment tracking per property (water heater model, age, pipe material)
- Financing options for large repairs (partner with GreenSky, Wisetack)
- Permit and inspection tracking
- Truck stock/parts inventory per vehicle
- Emergency/priority job flagging (burst pipe, no hot water)
- ServiceTitan pricing: $235-325/user/month

**Payment Model:**
- Flat-rate pricing (pricebook) or time + materials
- On-site collection (card reader, check, cash)
- Financing for jobs over $1,000-5,000 (Wisetack, GreenSky)
- Service agreements: monthly/annual recurring billing
- Deposits for large projects (10-50%)
- Progress billing for multi-day jobs

---

## 2. ELECTRICIAN

**Competitors studied:** ServiceTitan, Housecall Pro, Jobber, FieldEdge, ServiceM8

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Property Owners |
| Services | Services / Installations |
| Appointments | Jobs / Work Orders |
| Products | Parts / Materials / Fixtures |
| Staff | Electricians / Technicians |

**Essential Tabs:**

1. **Dashboard** — Jobs today, revenue, dispatch board, technician GPS, average ticket, permit status overview, outstanding estimates.
2. **Jobs** — Job types: panel upgrade, outlet/switch install, lighting, rewiring, EV charger install, generator install, troubleshooting. Job details include scope, photos, wire gauge used, breaker panel info, code compliance notes.
3. **Schedule / Dispatch** — Same dispatch board as plumber with GPS, route optimization, automatic notifications. Electricians often have multi-day jobs requiring extended scheduling.
4. **Estimates** — Detailed quoting with labor hours, materials list, permit costs included. Good/better/best options. Digital approval with signature. Load calculations for panel work.
5. **Invoices / Payments** — Progress billing for large projects (panel upgrades, full rewires), deposit collection, financing options.
6. **Customers** — Property profiles with electrical panel info, service history, age of wiring, last inspection date.

**Optional Tabs:**

1. **Permits / Inspections** — Critical for electrical work: permit application tracking, inspection scheduling, pass/fail logging, re-inspection scheduling. Many jurisdictions require permits for any electrical work over basic outlet replacement.
2. **Service Agreements** — Annual electrical inspections, surge protector maintenance, generator service plans.
3. **Parts / Inventory** — Wire, breakers, panels, outlets, switches, fixtures, conduit. Vendor pricing and markup tracking.
4. **Reports** — Job profitability, technician utilization, permit pass rates, revenue by service category.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Work orders with type, address, tech, permit status |
| Estimates | Pipeline | Quotes with materials, labor, permit costs |
| Permits | Table | Active permits with status, inspection dates |
| Customers | Table | Property profiles with panel info, wiring age |
| Invoices | Table | Bills with progress payment tracking |

**Pipeline Stages:**

```
Lead -> Site Visit/Assessment -> Estimate Sent -> Approved -> Permit Pulled -> Job Scheduled -> In Progress -> Inspection Scheduled -> Inspection Passed -> Completed -> Invoiced -> Paid
```

**Unique Features:**
- Permit tracking with inspection scheduling (critical for code compliance)
- Load calculation references for panel work
- Multi-day job scheduling with progress tracking
- Wire/material takeoff lists per job
- Code compliance documentation and photos
- EV charger installation workflow (growing market)
- Generator installation and maintenance tracking
- Certification tracking (journeyman, master electrician licenses)

**Payment Model:**
- Flat-rate or time + materials
- Deposits for large projects (25-50%)
- Progress billing for multi-day/multi-phase work
- Financing for large installs ($3K+)
- Service agreement recurring billing

---

## 3. HVAC TECHNICIAN

**Competitors studied:** ServiceTitan, FieldEdge, Housecall Pro, Jobber, Service Fusion

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Homeowners |
| Services | Services / Installations |
| Appointments | Service Calls / Jobs |
| Products | Equipment / Parts |
| Staff | Technicians |

**Essential Tabs:**

1. **Dashboard** — Seasonal metrics (AC installs in summer, heating in winter), jobs today, revenue, dispatch board, membership renewals due, equipment installs pending.
2. **Jobs** — Service types: AC repair/install, furnace repair/install, duct cleaning, thermostat install, maintenance tune-up, heat pump, mini-split. Equipment details: make, model, serial number, age, warranty status, refrigerant type.
3. **Schedule / Dispatch** — Dispatch with GPS, route optimization. HVAC is highly seasonal: summer (AC) and winter (heating) peaks require capacity planning.
4. **Estimates** — Equipment replacement quotes with good/better/best (standard, mid-range, high-efficiency), rebate information, financing options prominently displayed. HVAC replacements are $5,000-$15,000+ making financing critical.
5. **Equipment** — Equipment database per property: make, model, serial number, install date, warranty expiration, refrigerant type, filter size, maintenance history. This is HVAC-specific and mission-critical for service planning.
6. **Invoices / Payments** — On-site collection, financing integration (80%+ of HVAC replacements are financed), warranty claim tracking.

**Optional Tabs:**

1. **Memberships** — Maintenance plans (bi-annual tune-ups, priority service, discount on repairs). ServiceTitan and others report this is the #1 recurring revenue driver for HVAC companies.
2. **Marketing** — Seasonal campaigns, Google Local Services, email/postcard for tune-up reminders.
3. **Parts / Inventory** — Refrigerant tracking (EPA regulations), filters, compressors, thermostats, coils. Truck stock management.
4. **Reports** — Revenue by service type, seasonal trends, technician close rate, membership retention, equipment replacement opportunities.
5. **Permits** — Required for equipment installations, duct modifications.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Service calls with type, equipment, tech assigned |
| Equipment | Table | Property equipment with model, age, warranty, maintenance |
| Estimates | Pipeline | Replacement/repair quotes with financing options |
| Memberships | Table | Maintenance plans with renewal dates, services included |
| Customers | Table | Homeowners with property, equipment, service history |

**Pipeline Stages:**

```
Incoming Call -> Diagnostic Scheduled -> Diagnostic Complete -> Estimate Presented (repair vs replace) -> Approved -> Parts Ordered -> Job Scheduled -> Installation/Repair Complete -> Inspection (if required) -> Invoiced -> Paid -> Maintenance Plan Offered
```

**Unique Features:**
- Equipment database per property (model, serial, age, refrigerant type, filter size)
- Seasonal demand management (AC season vs heating season)
- Financing integration (critical for $5K-15K+ equipment replacements)
- Maintenance membership management (bi-annual tune-ups)
- Manufacturer warranty tracking and claim management
- Rebate tracking (utility rebates for high-efficiency equipment)
- Refrigerant tracking (EPA compliance for R-410A, R-22 phase-out)
- Load calculations for equipment sizing
- Filter size tracking for repeat maintenance visits

**Payment Model:**
- Flat-rate for diagnostics and repairs
- Equipment replacement: financing (60-120 months, 0% promo options)
- Maintenance memberships: monthly or annual recurring billing
- On-site card collection for service calls
- Deposits for equipment installs

---

## 4. LANDSCAPER / LAWN CARE

**Competitors studied:** Jobber, LawnPro, GorillaDesk, Service Autopilot, Arborgold

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Properties |
| Services | Services |
| Appointments | Jobs / Visits |
| Products | Materials / Supplies |
| Staff | Crews / Foremen |

**Essential Tabs:**

1. **Dashboard** — Jobs today, crew locations, routes, revenue, outstanding estimates, recurring service count, seasonal capacity. LawnPro tracks routes and crew utilization.
2. **Jobs / Routes** — Recurring job management (weekly mow, bi-weekly landscaping), route optimization (minimize drive time between properties), crew assignment, job checklists. One-time jobs (cleanups, installations) alongside recurring routes. Jobber and LawnPro both optimize routes to reduce drive time.
3. **Schedule** — Visual schedule with crew assignments, drag-and-drop, recurring job patterns, weather-based rescheduling. Route view showing jobs in geographical order.
4. **Estimates** — Property-specific quoting (measure lot size, take photos, line-item materials), landscape design proposals with photos/renders, good/better/best for enhancement work.
5. **Customers / Properties** — Customer profiles with property details: lot size, lawn type, irrigation system, gate codes, pet warnings, service preferences, property photos. Multiple properties per customer possible.
6. **Invoices / Payments** — Auto-invoicing after job completion, batch invoicing for recurring services (invoice weekly/monthly), online payment portal, auto-pay enrollment.

**Optional Tabs:**

1. **Routes** — Dedicated route optimization view: map-based routing, crew assignment per route, drive time minimization, property clustering. LawnPro and GorillaDesk both offer route optimization.
2. **Materials** — Mulch, sod, plants, fertilizer, seed tracking. Markup and cost tracking per job.
3. **Equipment** — Mower maintenance schedules, trailer inventory, fuel tracking, repair logs. LawnPro tracks equipment maintenance.
4. **Marketing** — Door hangers, referral programs, seasonal upsell campaigns (spring cleanup, fall leaf removal, snow removal).
5. **Reports** — Revenue per property, route efficiency, crew productivity, seasonal revenue comparison.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Visits with property, crew, services, status |
| Routes | List (Map) | Daily routes with properties in order, crew, drive time |
| Properties | Table | Property details with lot size, notes, gate codes |
| Estimates | Pipeline | Quotes for enhancements and one-time work |
| Crews | Cards | Crew profiles with truck, route, today's schedule |
| Equipment | Table | Mowers, trimmers, blowers with maintenance schedule |
| Recurring Services | Table | Subscriptions with frequency, price, next visit |

**Pipeline Stages:**

```
Lead -> Property Visit -> Estimate Sent -> Approved -> Recurring Schedule Set -> Active Service -> Upsell Opportunity -> Enhancement Quote -> Winter Pause -> Spring Restart
```

**Unique Features:**
- Route optimization (minimize drive time, cluster nearby properties)
- Recurring job scheduling with automatic route building
- Property-specific details (gate codes, pet warnings, irrigation zones)
- Seasonal service transitions (mowing -> leaf removal -> snow removal)
- Crew-based scheduling (assign teams, not individuals)
- Weather-based rescheduling
- Before/after photos per property visit
- Lot size measurement tools
- Equipment maintenance tracking
- Batch invoicing for recurring customers (weekly or monthly billing cycles)
- LawnPro pricing: Free plan (up to 50 clients), $24-179/month for paid plans
- GorillaDesk pricing: $49-99/month

**Payment Model:**
- Recurring billing (monthly auto-charge for weekly/bi-weekly service)
- Per-visit invoicing
- Seasonal contracts (April-October, billed monthly)
- Enhancement work: deposit + final invoice
- Auto-pay enrollment (ACH/card on file)
- Net-30 for commercial accounts

---

## 5. CLEANING SERVICE

**Competitors studied:** ZenMaid, Launch27 (now Bookingkoala), Jobber, Housecall Pro

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Homeowners |
| Services | Services / Cleans |
| Appointments | Jobs / Cleans |
| Products | Supplies |
| Staff | Cleaners / Teams |

**Essential Tabs:**

1. **Dashboard** — Jobs today, cleaner schedules, revenue, booking requests, customer satisfaction score, recurring vs one-time ratio. ZenMaid focuses on schedule simplicity.
2. **Schedule** — Drag-and-drop scheduling, recurring appointment patterns (weekly, bi-weekly, monthly), cleaner assignment based on location and availability. ZenMaid sends instant notifications to cleaners when jobs are scheduled. Color-coded by cleaner/team.
3. **Jobs** — Job types: standard clean, deep clean, move-in/move-out, post-construction, office/commercial. Job details: home size, number of rooms/bathrooms, special instructions, supplies needed, estimated duration.
4. **Booking** — Online booking form (address, home size, service type, frequency, add-ons), instant pricing calculator, availability display. ZenMaid offers high-converting booking forms. Self-serve booking is critical for cleaning businesses.
5. **Customers** — Customer profiles with home details (size, rooms, flooring type, pets), access info (lockbox code, garage code), preferences (eco-friendly products, specific attention areas), cleaning history.
6. **Invoices / Payments** — Auto-invoice after job completion, card-on-file charging, tipping enabled, recurring billing for regular clients. ZenMaid integrates with QuickBooks.

**Optional Tabs:**

1. **Checklists** — Digital cleaning checklists per room, photo verification of completed tasks, quality assurance tracking. ZenMaid Pro includes digital checklists.
2. **Staff Safety** — ZenMaid's SOS feature: silent one-tap alert system for cleaners who need help. GPS tracking for safety and time verification.
3. **Marketing** — Review requests, referral programs, seasonal promotions (spring cleaning, holiday prep), automated follow-ups.
4. **Reports** — Revenue per cleaner, average job duration, customer retention, booking conversion rate, cleaner efficiency.
5. **Supplies** — Cleaning supply inventory, reorder tracking, supply cost per job.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Cleaning appointments with address, cleaner, type |
| Customers | Table | Homeowners with home details, preferences, access info |
| Cleaners | Cards | Cleaner profiles with schedule, location, ratings |
| Booking Requests | List | Online booking submissions pending confirmation |
| Recurring Schedules | Table | Repeating appointments with frequency and next date |
| Checklists | Table | Room-by-room task lists with completion status |

**Pipeline Stages:**

```
Online Booking / Inquiry -> Quote (for custom) -> Confirmed -> Scheduled -> Cleaner Assigned -> In Progress -> Completed -> Invoice Sent -> Paid -> Review Requested -> Recurring Set Up
```

**Unique Features:**
- Online booking with instant pricing calculator (by home size, rooms, add-ons)
- Recurring scheduling patterns (weekly, bi-weekly, monthly)
- Digital checklists with photo verification
- Cleaner safety features (SOS button, GPS tracking)
- Home access information management (lockbox codes, garage codes)
- Quality assurance scoring
- Automatic review requests after each clean
- Cleaner-client matching based on location
- Eco-friendly product preferences tracking
- ZenMaid pricing: Starter $19/mo + $4/seat, Pro $39/mo + $14/seat

**Payment Model:**
- Flat-rate pricing by home size and service type
- Card-on-file auto-charge after completion
- Tips (optional, digital)
- Recurring billing for regular service
- Gift certificates
- No deposits typically (unless deep clean or commercial)

---

## 6. PEST CONTROL

**Competitors studied:** GorillaDesk, PestPac, FieldRoutes, Briostack, Housecall Pro

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Properties |
| Services | Treatments / Services |
| Appointments | Jobs / Treatments |
| Products | Products / Chemicals |
| Staff | Technicians / Operators |

**Essential Tabs:**

1. **Dashboard** — Today's routes, technician locations, revenue, subscription count, renewal alerts, chemical inventory status.
2. **Jobs / Treatments** — Treatment types: general pest, termite, rodent, mosquito, bed bug, wildlife removal. Treatment details: chemicals/products used (regulatory tracking), application method, target pest, re-entry time, follow-up date.
3. **Routes** — Route-based scheduling is fundamental to pest control. Technicians run routes with 10-20 stops per day. Route optimization, geographic clustering, drive time minimization. GorillaDesk and PestPac both center on route management.
4. **Customers / Properties** — Property profiles: property type (residential, commercial), building type, pest history, treatment history, service agreement details, access instructions, diagram of treatment areas.
5. **Invoices / Payments** — Subscription billing (quarterly or monthly treatments), one-time service invoicing, auto-pay, payment reminders.
6. **Chemical Tracking** — Regulatory requirement: track all chemicals applied per property (product name, EPA number, amount, application method). Required for state licensing compliance. This is unique to pest control and non-negotiable.

**Optional Tabs:**

1. **Subscriptions** — Recurring service plans: quarterly general pest, monthly mosquito (seasonal), annual termite inspection. Auto-renewal and payment management.
2. **Marketing** — Seasonal campaigns (spring ant season, summer mosquito, fall rodent), review generation, referral programs.
3. **Reports** — Route efficiency, technician productivity, subscription retention, revenue by pest type, chemical usage reports.
4. **Equipment** — Spray equipment, bait stations, traps, vehicle inventory, maintenance schedules.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs/Treatments | Calendar | Treatment visits with route, property, pest type |
| Routes | List (Map) | Daily routes with stops, drive time, technician |
| Properties | Table | Property profiles with pest history, treatment log |
| Subscriptions | Table | Recurring service plans with frequency, renewal |
| Chemical Log | Table | Application records with product, amount, EPA number |
| Equipment | Table | Spray equipment, bait stations, vehicle inventory |

**Pipeline Stages:**

```
Lead/Call -> Inspection Scheduled -> Inspection Complete -> Estimate/Treatment Plan -> Approved -> Initial Treatment -> Follow-Up Treatment -> Subscription Enrolled -> Recurring Service -> Annual Renewal
```

**Unique Features:**
- Chemical/product application tracking (EPA regulatory compliance)
- Route-based scheduling with optimization
- Subscription service management (quarterly, monthly, annual plans)
- Property diagramming (treatment areas, bait station locations)
- Re-entry time tracking and customer notification
- Follow-up scheduling (many treatments require 2-3 visits)
- Seasonal pest forecasting
- Wood-destroying organism (WDO) inspection reports (for real estate)
- State licensing compliance documentation
- GorillaDesk pricing: Basic $49/mo, Pro $99/mo

**Payment Model:**
- Subscription billing (monthly or quarterly auto-charge)
- One-time service payments
- Annual contracts with monthly billing
- Initial treatment + follow-up pricing
- Auto-pay strongly encouraged
- WDO inspection reports: flat-fee per inspection

---

## 7. HANDYMAN

**Competitors studied:** Housecall Pro, Jobber, Workiz, ServiceM8

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers |
| Services | Services / Tasks |
| Appointments | Jobs |
| Products | Materials |
| Staff | Handymen / Technicians |

**Essential Tabs:**

1. **Dashboard** — Jobs today, revenue, upcoming estimates, outstanding invoices, average ticket. Simpler than specialized trades because handymen handle diverse job types.
2. **Jobs** — Broad service categories: plumbing minor, electrical minor, drywall, painting, furniture assembly, mounting (TV, shelves), door/window repair, deck/fence, general repairs. Job details: description, photos, materials needed, estimated time.
3. **Schedule** — Calendar with daily job slots, travel time between jobs, customer notification. Handymen often do 3-5 jobs per day with varying durations.
4. **Estimates** — Quick quoting (often on-site), hourly rate + materials, or flat-rate per task. Photo-based estimates (customer sends photos for remote quoting).
5. **Customers** — Customer profiles with property details, service history, preferred contact method.
6. **Invoices / Payments** — On-site invoicing, mobile card reader, hourly billing or flat-rate, materials markup tracking.

**Optional Tabs:**

1. **Marketing** — Review requests, referral programs, Google Business Profile management.
2. **Reports** — Revenue by service type, average job duration, customer acquisition cost.
3. **Materials** — Frequently used materials with pricing, markup tracking, vendor lists.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Jobs | Calendar | Service tasks with type, duration, address, status |
| Estimates | Pipeline | Quotes with hourly or flat-rate pricing |
| Customers | Table | Customers with property address, service history |
| Invoices | Table | Bills with hourly breakdown or flat rates |

**Pipeline Stages:**

```
Inquiry -> Photo/Phone Assessment -> Estimate Sent -> Approved -> Scheduled -> In Progress -> Completed -> Invoiced -> Paid -> Review Requested
```

**Unique Features:**
- Multi-trade capability (single business handles diverse job types)
- Photo-based remote quoting (customer sends photos)
- Hourly or per-task pricing flexibility
- Quick job scheduling (many same-day or next-day bookings)
- Materials tracking with markup
- Short job durations (30 min to 4 hours typical)
- Multi-job scheduling per day (3-5 stops)
- Simple booking (less complex than specialized trades)
- Housecall Pro and Jobber both serve handymen well at $59-79/month

**Payment Model:**
- Hourly rate ($50-150/hour) + materials
- Flat-rate for common tasks (TV mount: $150, faucet install: $200)
- On-site card payment
- Minimum service call fee ($50-100)
- Materials markup (10-20%)

---

## 8. ROOFING CONTRACTOR

**Competitors studied:** AccuLynx, JobNimbus, Jobber, ServiceTitan, RoofSnap

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Property Owners |
| Services | Services / Projects |
| Appointments | Jobs / Projects |
| Products | Materials / Shingles |
| Staff | Crews / Project Managers / Sales Reps |

**Essential Tabs:**

1. **Dashboard** — Active projects by stage, revenue pipeline, outstanding estimates, crew schedule, material orders pending, weather forecast. AccuLynx shows project-centric dashboards.
2. **Projects / Jobs** — Project management: roof type (shingle, metal, tile, flat), scope (full replacement, repair, inspection), square footage, pitch, measurements, photos, material specifications. Multi-day/multi-week project tracking with milestones.
3. **Estimates** — Aerial measurement integration (EagleView, HOVER, GAF QuickMeasure), automated material calculations (shingles, underlayment, flashing, nails), labor estimates, waste factor adjustment, profit margin slider. AccuLynx can auto-calculate materials from aerial measurements.
4. **Pipeline / Sales** — Lead tracking from multiple sources (storm damage canvassing, referrals, online), multi-touch follow-up sequences, appointment setting, proposal presentation. Roofing has a long sales cycle for replacements.
5. **Materials / Orders** — Material ordering integration with suppliers (ABC Supply, SRS, Beacon), delivery scheduling, material tracking per project.
6. **Payments** — Deposits (15-30%), progress payments, final payment, financing options (large projects $8K-25K+), insurance claim coordination.

**Optional Tabs:**

1. **Inspections** — Drone/aerial inspection photos, damage documentation, insurance scope reports, inspection checklists.
2. **Insurance Claims** — Insurance company communication, supplement management, claim documentation. Storm damage restoration is a major revenue driver.
3. **Permits** — Building permit tracking, HOA approval management, inspection scheduling.
4. **Crews** — Crew scheduling, subcontractor management, daily production tracking (squares completed), safety documentation.
5. **Marketing** — Door-to-door canvassing tracking, yard sign tracking, referral programs, Google reviews.
6. **Reports** — Revenue per project, crew productivity, lead conversion rate, material cost analysis, supplement success rate.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Roofing jobs with stage, scope, measurements, crew |
| Estimates | Pipeline | Quotes with aerial measurements, materials, pricing |
| Inspections | Table | Inspection reports with photos, damage findings |
| Materials | Table | Orders with supplier, delivery date, project assigned |
| Crews | Cards | Crew profiles with schedule, production, certifications |
| Insurance Claims | Pipeline | Claims with adjuster, supplement status, amounts |

**Pipeline Stages:**

```
Lead -> Inspection Scheduled -> Inspection Complete -> Estimate/Proposal Sent -> Negotiation -> Contract Signed -> Permit Applied -> Materials Ordered -> Production Scheduled -> Tear-Off -> Install -> Quality Check -> Final Inspection -> Invoiced -> Paid -> Warranty Registered
```

**Unique Features:**
- Aerial roof measurement integration (EagleView, HOVER - measure without climbing)
- Automated material takeoff from measurements
- Insurance claim and supplement management
- Multi-day project tracking with daily production logs
- Storm damage canvassing and lead management
- Crew-based scheduling (3-8 person crews)
- Material supplier integration and ordering
- Weather-dependent scheduling
- Manufacturer warranty registration (GAF, Owens Corning certifications)
- Profit margin calculator with sliding scale
- Before/during/after photo documentation
- AccuLynx pricing: quote-based, estimated $55-80/user/month

**Payment Model:**
- Deposits (15-30% at contract signing)
- Progress payments (materials delivery, mid-project)
- Final payment on completion
- Financing for large replacements ($8K-25K+)
- Insurance claims (direct payment from insurance company)
- Supplements for additional work discovered during project

---

## 9. PAINTER

**Competitors studied:** PaintScout, Housecall Pro, Jobber, Houzz Pro

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Homeowners |
| Services | Services / Projects |
| Appointments | Jobs / Projects |
| Products | Paint / Materials |
| Staff | Painters / Crews |

**Essential Tabs:**

1. **Dashboard** — Active projects, estimates pending, crew schedule, revenue, material costs.
2. **Estimates** — Room/area-based quoting with square footage, surface type (walls, ceiling, trim, exterior), prep work required, paint type/quality tier, color selections. PaintScout handles the entire sales workflow from estimating to proposals. The EDGE software auto-calculates labor based on wall height, surface condition, and application method.
3. **Projects / Jobs** — Project types: interior paint, exterior paint, cabinet refinishing, deck staining, wallpaper, commercial painting. Multi-room/multi-area tracking per project. Color selections per room.
4. **Schedule** — Crew scheduling for multi-day projects, prep day vs paint day planning, weather dependency for exterior work.
5. **Customers** — Customer profiles with property details, room-by-room color history, preferred paint brands.
6. **Invoices / Payments** — Deposit collection, progress billing for large projects, final payment.

**Optional Tabs:**

1. **Colors** — Color selection management per room, paint brand/product tracking, color match records. Customer color consultation notes.
2. **Materials** — Paint inventory, primer, tape, drop cloths, equipment. Cost tracking per project.
3. **Marketing** — Portfolio of completed work, review generation, referral programs.
4. **Reports** — Revenue per project, paint cost per square foot, crew productivity, estimate-to-close rate.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Painting jobs with scope, rooms, colors, crew |
| Estimates | Pipeline | Room-by-room quotes with sq ft, prep, paint grade |
| Color Selections | Table | Per-room color choices with brand, code, finish |
| Crews | Cards | Painter teams with schedule and current project |
| Materials | Table | Paint and supplies with cost, project allocation |

**Pipeline Stages:**

```
Inquiry -> Site Visit / Measurement -> Estimate Sent -> Color Consultation -> Approved -> Deposit Collected -> Materials Purchased -> Prep Day(s) -> Paint Day(s) -> Touch-up / Walkthrough -> Final Invoice -> Paid -> Review
```

**Unique Features:**
- Room-by-room estimating with square footage calculations
- Color selection management per space
- Prep work documentation (patching, sanding, priming)
- Multi-day project scheduling (prep separate from paint)
- Interior vs exterior project differentiation
- Weather tracking for exterior jobs
- Paint product and quality tier options (standard, premium, ultra-premium)
- Surface condition assessment (affects labor hours)
- Portfolio/gallery of completed work
- PaintScout pricing: specialized, quote-based

**Payment Model:**
- Per-project pricing (based on square footage, surfaces, prep)
- Deposits (25-50% at signing)
- Progress payments for large projects
- Final payment after walkthrough
- Materials may be billed separately or included

---

## 10. MOVING COMPANY

**Competitors studied:** SmartMoving, Moveitpro, MovePoint, Yembo, Workiz

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers |
| Services | Moves / Services |
| Appointments | Moves / Jobs |
| Products | Packing Materials |
| Staff | Movers / Crews / Drivers |

**Essential Tabs:**

1. **Dashboard** — Today's moves, crew/truck assignments, revenue pipeline, upcoming bookings, inventory availability (trucks, dollies, blankets).
2. **Moves / Jobs** — Move details: origin address, destination address, move type (local, long-distance, commercial, specialty), estimated hours, crew size, truck size, inventory list (rooms, large items), packing services, storage needs. SmartMoving's auto-pricing engine calculates based on move details.
3. **Estimates** — Online or in-home estimates with room inventory, virtual survey option (video call walkthrough), weight/volume estimation, binding vs non-binding quote, packing services add-on. SmartMoving offers mobile-friendly estimates with e-sign.
4. **Dispatch** — Drag-and-drop crew and truck assignment, daily move schedule, crew notifications, GPS tracking. SmartMoving saves 20 hours/week on dispatch.
5. **Customers** — Customer profiles with move history, inventory list, storage units, communication log.
6. **Invoices / Payments** — Deposit collection, hourly billing or flat-rate, materials charges, storage billing, insurance add-on charges.

**Optional Tabs:**

1. **Fleet** — Truck inventory with size, capacity, availability, maintenance schedule, insurance, DOT compliance documentation.
2. **Storage** — Storage unit management: unit sizes, availability, customer assignment, monthly billing, access logs.
3. **Crew Management** — Crew scheduling, driver certifications (CDL for long-distance), labor tracking, overtime management, payroll hours.
4. **Marketing** — Review requests (critical for moving - high trust industry), Google Business Profile, lead tracking from Yelp/Google/Angi.
5. **Reports** — Revenue per move, crew efficiency, truck utilization, booking conversion rate, seasonal demand patterns.
6. **Contracts** — Digital contracts with terms, liability, valuation coverage, binding/non-binding pricing agreement.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Moves | Calendar | Jobs with origin, destination, crew, truck, status |
| Estimates | Pipeline | Quotes with inventory, pricing, approval status |
| Trucks/Fleet | Cards | Vehicle inventory with availability, capacity |
| Crews | Cards | Moving teams with schedule, truck assignment |
| Storage Units | Table | Units with size, availability, customer, billing |
| Inventory Lists | Table | Customer's item inventory per move |

**Pipeline Stages:**

```
Lead/Inquiry -> Virtual/In-Home Survey -> Estimate Sent -> Follow-Up -> Booked / Deposit Received -> Pre-Move Call -> Move Day -> Delivery (if long-distance) -> Final Invoice -> Paid -> Review Request
```

**Unique Features:**
- Room-by-room inventory tracking for accurate quoting
- Virtual survey / video walkthrough estimating (Yembo AI)
- Auto-pricing engine based on move details (distance, size, stairs, specialty items)
- Truck/fleet management with capacity planning
- Crew + truck combined dispatch assignment
- DOT compliance documentation for interstate moves
- Storage unit management with monthly billing
- Binding vs non-binding estimate management
- Specialty item handling (piano, pool table, antiques, gun safes)
- Packing service add-on management
- Valuation coverage / insurance options
- SmartMoving pricing: Essential $299/mo, Growth $399/mo

**Payment Model:**
- Deposits at booking (typically flat fee or percentage)
- Hourly billing (local moves): $120-250/hour for 2-3 movers + truck
- Flat-rate for long-distance (based on weight/distance)
- Packing materials and services billed separately
- Storage: monthly recurring billing
- Tips common (cash or digital)
- COD (collect on delivery) for long-distance

---

## 11. COMPETITOR COMPARISON

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **ServiceTitan** | Large HVAC/plumbing/electrical | ~$235/user/mo | Enterprise-grade, pricebook, financing integration, full marketing suite |
| **Housecall Pro** | Mid-size field service | $59-79/mo | Easy setup, GPS tracking, online booking, one-click invoicing |
| **Jobber** | Small field service (any trade) | $25/mo | Affordable, client hub, automated follow-ups, 4x faster payment |
| **Workiz** | Multi-trade service businesses | $225/mo (5 users) | Call tracking, automation, subcontractor management |
| **GorillaDesk** | Pest control, lawn care | $49-99/mo | Chemical tracking, route optimization, subscription billing |
| **ZenMaid** | Cleaning services | $19/mo + $4/seat | Cleaning-specific, booking forms, safety SOS, checklists |
| **LawnPro** | Lawn care | Free - $179/mo | Free plan available, route optimization, equipment tracking |
| **AccuLynx** | Roofing contractors | ~$55-80/user/mo | Aerial measurements, insurance supplements, material ordering |
| **SmartMoving** | Moving companies | $299/mo | Auto-pricing engine, virtual surveys, dispatch optimization |
| **PaintScout** | Painting contractors | Quote-based | Painting-specific estimating, proposal workflow |

**Red Pine Gaps/Opportunities:**
- ServiceTitan is too expensive for small operators ($235+/user/month)
- No single platform serves all home service trades well at an affordable price
- Jobber is the closest to universal but lacks trade-specific features
- GPS tracking and route optimization are table stakes, not differentiators
- Review/reputation management is always an add-on, never built-in
- Client portal (customer-facing job tracking, invoice payment) is underserved
- Most platforms charge per user/technician, making growth expensive
- Equipment/fleet management is always an afterthought
- Chemical tracking (pest control) and permit tracking (electrical/roofing) are specialized needs

---

## 12. TEMPLATE CONFIG RECOMMENDATIONS

### Plumber

```typescript
{
  templateId: 'plumber',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Jobs',
    staff: 'Technicians',
    products: 'Parts'
  },
  portalConfig: {
    primaryAction: 'request_service',
    bookingMode: 'service_call',
    chatProminence: 'high',
    reviewPrompt: 'after_job_completion',
    preferenceFields: ['property_type', 'service_needed', 'urgency', 'preferred_time', 'property_access']
  },
  essentialTabs: ['dashboard', 'jobs', 'schedule', 'estimates', 'invoices', 'customers'],
  optionalTabs: ['memberships', 'marketing', 'inventory', 'reports', 'permits'],
  defaultView: { jobs: 'calendar', estimates: 'pipeline', customers: 'table', invoices: 'table' },
  pipelineStages: ['lead', 'estimate_scheduled', 'estimate_sent', 'approved', 'job_scheduled', 'in_progress', 'completed', 'invoiced', 'paid'],
  paymentModel: 'flat_rate_or_time_materials',
  bookingFlow: 'call_or_online_request'
}
```

### Electrician

```typescript
{
  templateId: 'electrician',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Work Orders',
    staff: 'Electricians',
    products: 'Parts & Materials'
  },
  portalConfig: {
    primaryAction: 'request_service',
    bookingMode: 'service_call',
    chatProminence: 'high',
    reviewPrompt: 'after_job_completion',
    preferenceFields: ['property_type', 'service_needed', 'panel_info', 'urgency']
  },
  essentialTabs: ['dashboard', 'jobs', 'schedule', 'estimates', 'invoices', 'customers'],
  optionalTabs: ['permits', 'memberships', 'inventory', 'reports'],
  defaultView: { jobs: 'calendar', estimates: 'pipeline', permits: 'table' },
  pipelineStages: ['lead', 'assessment', 'estimate_sent', 'approved', 'permit_pulled', 'scheduled', 'in_progress', 'inspection', 'completed', 'invoiced', 'paid'],
  paymentModel: 'flat_rate_with_progress_billing',
  bookingFlow: 'call_or_online_request'
}
```

### HVAC Technician

```typescript
{
  templateId: 'hvac',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Service Calls',
    staff: 'Technicians',
    products: 'Equipment & Parts'
  },
  portalConfig: {
    primaryAction: 'schedule_service',
    bookingMode: 'service_call',
    chatProminence: 'high',
    reviewPrompt: 'after_job_completion',
    preferenceFields: ['equipment_type', 'issue_description', 'urgency', 'financing_interest', 'membership_status']
  },
  essentialTabs: ['dashboard', 'jobs', 'schedule', 'estimates', 'equipment', 'invoices'],
  optionalTabs: ['memberships', 'marketing', 'inventory', 'reports', 'permits'],
  defaultView: { jobs: 'calendar', estimates: 'pipeline', equipment: 'table', memberships: 'table' },
  pipelineStages: ['call', 'diagnostic_scheduled', 'diagnostic_complete', 'estimate_presented', 'approved', 'parts_ordered', 'scheduled', 'completed', 'invoiced', 'paid', 'membership_offered'],
  paymentModel: 'flat_rate_with_financing',
  bookingFlow: 'call_or_online_request'
}
```

### Landscaper / Lawn Care

```typescript
{
  templateId: 'lawn_care',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Jobs',
    staff: 'Crews',
    products: 'Materials'
  },
  portalConfig: {
    primaryAction: 'get_quote',
    bookingMode: 'recurring_service',
    chatProminence: 'medium',
    reviewPrompt: 'monthly',
    preferenceFields: ['property_size', 'services_needed', 'frequency', 'gate_code', 'pet_info']
  },
  essentialTabs: ['dashboard', 'jobs', 'schedule', 'estimates', 'customers', 'invoices'],
  optionalTabs: ['routes', 'materials', 'equipment', 'marketing', 'reports'],
  defaultView: { jobs: 'calendar', routes: 'list', estimates: 'pipeline', customers: 'table' },
  pipelineStages: ['lead', 'property_visit', 'estimate_sent', 'approved', 'recurring_set', 'active', 'upsell', 'winter_pause', 'spring_restart'],
  paymentModel: 'recurring_billing',
  bookingFlow: 'online_quote_or_call'
}
```

### Cleaning Service

```typescript
{
  templateId: 'cleaning',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Cleans',
    appointments: 'Jobs',
    staff: 'Cleaners',
    products: 'Supplies'
  },
  portalConfig: {
    primaryAction: 'book_cleaning',
    bookingMode: 'recurring_booking',
    chatProminence: 'medium',
    reviewPrompt: 'after_each_clean',
    preferenceFields: ['home_size', 'rooms', 'bathrooms', 'pets', 'frequency', 'eco_friendly', 'access_info']
  },
  essentialTabs: ['dashboard', 'schedule', 'jobs', 'booking', 'customers', 'invoices'],
  optionalTabs: ['checklists', 'safety', 'marketing', 'reports', 'supplies'],
  defaultView: { schedule: 'calendar', jobs: 'calendar', customers: 'table', booking: 'list' },
  pipelineStages: ['inquiry', 'quote', 'confirmed', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'recurring_set'],
  paymentModel: 'card_on_file_auto_charge',
  bookingFlow: 'online_booking_with_instant_pricing'
}
```

### Pest Control

```typescript
{
  templateId: 'pest_control',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Treatments',
    appointments: 'Jobs',
    staff: 'Technicians',
    products: 'Products'
  },
  portalConfig: {
    primaryAction: 'schedule_treatment',
    bookingMode: 'recurring_service',
    chatProminence: 'medium',
    reviewPrompt: 'after_treatment',
    preferenceFields: ['property_type', 'pest_type', 'treatment_frequency', 'access_info']
  },
  essentialTabs: ['dashboard', 'jobs', 'routes', 'customers', 'invoices', 'chemical_tracking'],
  optionalTabs: ['subscriptions', 'marketing', 'reports', 'equipment'],
  defaultView: { jobs: 'calendar', routes: 'list', customers: 'table', chemical_tracking: 'table' },
  pipelineStages: ['lead', 'inspection', 'estimate', 'approved', 'initial_treatment', 'follow_up', 'subscription_enrolled', 'recurring', 'annual_renewal'],
  paymentModel: 'subscription_billing',
  bookingFlow: 'call_or_online_request'
}
```

### Handyman

```typescript
{
  templateId: 'handyman',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Jobs',
    staff: 'Handymen',
    products: 'Materials'
  },
  portalConfig: {
    primaryAction: 'request_service',
    bookingMode: 'appointment',
    chatProminence: 'high',
    reviewPrompt: 'after_job',
    preferenceFields: ['service_type', 'description', 'photos', 'preferred_time', 'urgency']
  },
  essentialTabs: ['dashboard', 'jobs', 'schedule', 'estimates', 'customers', 'invoices'],
  optionalTabs: ['marketing', 'reports', 'materials'],
  defaultView: { jobs: 'calendar', estimates: 'pipeline', customers: 'table' },
  pipelineStages: ['inquiry', 'assessment', 'estimate_sent', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid'],
  paymentModel: 'hourly_or_flat_rate',
  bookingFlow: 'call_or_photo_request'
}
```

### Roofing Contractor

```typescript
{
  templateId: 'roofing',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Projects',
    appointments: 'Projects',
    staff: 'Crews',
    products: 'Materials'
  },
  portalConfig: {
    primaryAction: 'schedule_inspection',
    bookingMode: 'project_based',
    chatProminence: 'medium',
    reviewPrompt: 'after_project_completion',
    preferenceFields: ['property_type', 'roof_type', 'issue', 'insurance_claim', 'urgency']
  },
  essentialTabs: ['dashboard', 'projects', 'estimates', 'pipeline', 'materials', 'payments'],
  optionalTabs: ['inspections', 'insurance', 'permits', 'crews', 'marketing', 'reports'],
  defaultView: { projects: 'pipeline', estimates: 'pipeline', inspections: 'table', materials: 'table' },
  pipelineStages: ['lead', 'inspection', 'estimate_sent', 'negotiation', 'contract_signed', 'permit', 'materials_ordered', 'production', 'tearoff', 'install', 'qc', 'final_inspection', 'invoiced', 'paid', 'warranty'],
  paymentModel: 'deposit_progress_final',
  bookingFlow: 'inspection_to_project'
}
```

### Painter

```typescript
{
  templateId: 'painter',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Projects',
    appointments: 'Projects',
    staff: 'Painters / Crews',
    products: 'Paint & Materials'
  },
  portalConfig: {
    primaryAction: 'get_estimate',
    bookingMode: 'project_based',
    chatProminence: 'medium',
    reviewPrompt: 'after_project',
    preferenceFields: ['project_type', 'rooms', 'interior_exterior', 'color_preferences', 'timeline']
  },
  essentialTabs: ['dashboard', 'estimates', 'projects', 'schedule', 'customers', 'invoices'],
  optionalTabs: ['colors', 'materials', 'marketing', 'reports'],
  defaultView: { projects: 'pipeline', estimates: 'pipeline', schedule: 'calendar' },
  pipelineStages: ['inquiry', 'site_visit', 'estimate_sent', 'color_consultation', 'approved', 'deposit', 'materials_purchased', 'prep', 'paint', 'touchup', 'final_invoice', 'paid'],
  paymentModel: 'deposit_plus_final',
  bookingFlow: 'site_visit_to_quote'
}
```

### Moving Company

```typescript
{
  templateId: 'moving',
  familyId: 'home_services',
  labelOverrides: {
    clients: 'Customers',
    services: 'Moves',
    appointments: 'Moves',
    staff: 'Movers / Crews',
    products: 'Packing Materials'
  },
  portalConfig: {
    primaryAction: 'get_moving_quote',
    bookingMode: 'event_based',
    chatProminence: 'high',
    reviewPrompt: 'after_move',
    preferenceFields: ['move_type', 'origin_address', 'destination_address', 'move_size', 'move_date', 'packing_needed', 'specialty_items', 'storage_needed']
  },
  essentialTabs: ['dashboard', 'moves', 'estimates', 'dispatch', 'customers', 'invoices'],
  optionalTabs: ['fleet', 'storage', 'crews', 'marketing', 'reports', 'contracts'],
  defaultView: { moves: 'calendar', estimates: 'pipeline', dispatch: 'calendar', fleet: 'cards' },
  pipelineStages: ['inquiry', 'survey', 'estimate_sent', 'follow_up', 'booked', 'pre_move_call', 'move_day', 'delivery', 'final_invoice', 'paid', 'review'],
  paymentModel: 'deposit_plus_hourly_or_flat',
  bookingFlow: 'survey_to_quote_to_booking'
}
```

---

## Sources

- ServiceTitan: https://www.servicetitan.com/pricing, https://www.servicetitan.com/features
- Housecall Pro: https://www.housecallpro.com/pricing/, https://www.housecallpro.com/features/
- Jobber: https://www.getjobber.com/features/, https://www.getjobber.com/
- Workiz: https://www.workiz.com/pricing-plans/
- GorillaDesk: https://gorilladesk.com/
- ZenMaid: https://get.zenmaid.com/pricing
- LawnPro: https://www.lawnprosoftware.com/price
- AccuLynx: https://acculynx.com/features/
- JobNimbus: https://www.jobnimbus.com/
- SmartMoving: https://www.smartmoving.com/pricing
- PaintScout: https://www.paintscout.com
