# Research #23: Automotive & Retail Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 13 automotive and retail business types based on competitor platform research.

---

## Table of Contents

### Automotive (6)
1. [Auto Repair Shop](#1-auto-repair-shop)
2. [Auto Detailing](#2-auto-detailing)
3. [Car Wash](#3-car-wash)
4. [Tire Shop](#4-tire-shop)
5. [Body Shop / Collision](#5-body-shop--collision)
6. [Towing Company](#6-towing-company)

### Retail (7)
7. [Boutique / Clothing Store](#7-boutique--clothing-store)
8. [Jewelry Store](#8-jewelry-store)
9. [Thrift / Consignment Store](#9-thrift--consignment-store)
10. [Pet Store](#10-pet-store)
11. [Gift Shop](#11-gift-shop)
12. [Smoke / Vape Shop](#12-smoke--vape-shop)
13. [Bookstore](#13-bookstore)
14. [Competitor Comparison](#14-competitor-comparison)
15. [Template Config Recommendations](#15-template-config-recommendations)

---

## AUTOMOTIVE OVERVIEW

Automotive businesses center on vehicles as the core entity. Every customer interaction ties back to a specific vehicle (year/make/model/VIN). The workflow is: vehicle check-in -> diagnosis -> estimate/approval -> repair -> quality check -> pickup. Digital vehicle inspections (DVI), parts sourcing, and customer communication (text when ready) are table stakes. The leaders are Shopmonkey, Tekmetric, and Shop-Ware for general repair, with specialized tools for body shops (CCC ONE, Mitchell) and car washes (DRB/Washify).

## RETAIL OVERVIEW

Retail businesses center on inventory management and point of sale. The core workflow is: source/purchase -> receive -> display/merchandise -> sell -> reorder. Key needs: inventory tracking with variants (size, color), POS, customer loyalty, and e-commerce integration. Shopify POS and Lightspeed dominate, with specialized tools for consignment (ConsignCloud, SimpleConsign) and niche retail.

---

# AUTOMOTIVE

## 1. AUTO REPAIR SHOP

**Competitors studied:** Shopmonkey, Tekmetric, Shop-Ware, Mitchell 1, AutoFluent

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Vehicle Owners |
| Services | Repairs / Services |
| Appointments | Work Orders / Repair Orders (ROs) |
| Products | Parts |
| Staff | Technicians / Mechanics / Service Advisors |
| Pipeline | Repair Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active ROs by status, revenue today/week/month, technician productivity, average repair order (ARO), parts on order, vehicles waiting. Shopmonkey shows intuitive dashboards with color-coded status tracking.
2. **Work Orders / Repair Orders** — The central entity: vehicle info (year/make/model/VIN), customer, services requested, diagnosis, estimate, parts needed, labor hours, technician assigned, status, photos/videos. Tekmetric's "Smart Jobs" feature assembles ROs in a few clicks with integrated labor guides.
3. **Digital Vehicle Inspection (DVI)** — Multi-point inspection with photo/video capture, condition ratings (green/yellow/red), findings shared with customer via text/email for approval. Tekmetric and Shopmonkey both feature built-in DVI. This is the modern standard replacing paper inspection sheets.
4. **Estimates / Approvals** — Line-item estimates with parts, labor, and shop supplies. Customer approval workflow: send via text/email, customer approves or declines individual line items. Good/better/best options for upselling.
5. **Customers** — Customer profiles linked to vehicle(s): service history per vehicle, recommended future services, communication preferences, outstanding balance.
6. **Vehicles** — Vehicle database: VIN, year/make/model, mileage at each visit, maintenance history, recommended services, recall information. Multiple vehicles per customer.

**Optional Tabs:**

1. **Parts** — Parts ordering integration (PartsTech, Nexpart, RepairLink), inventory tracking, vendor management, markup settings. Parts sourcing across multiple suppliers for best price.
2. **Technicians** — Technician profiles: certifications (ASE), specialties, productivity metrics (hours flagged vs clocked), pay rate (flat-rate or hourly).
3. **Schedule** — Appointment booking: online scheduling for customers, service advisor calendar, technician workload balancing, bay assignment.
4. **Marketing** — Automated service reminders (oil change due, tire rotation), review requests, decline follow-up (items customer declined on last visit), seasonal promotions.
5. **Reports** — ARO (average repair order), gross profit, technician productivity, parts margin, customer retention, recommended services conversion rate.
6. **Payments** — In-shop payments (card/cash/check), digital invoicing, financing for large repairs, payment plans.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Work Orders | Pipeline | ROs with vehicle, services, status, tech, estimate |
| Vehicles | Table | Vehicle database with VIN, make/model, mileage, history |
| Customers | Table | Vehicle owners with vehicles, history, balance |
| DVIs | Table | Inspections with findings, photos, approval status |
| Parts | Table | Parts inventory and orders with vendor, cost, markup |
| Estimates | Pipeline | Pending estimates with items, customer approval status |
| Technicians | Cards | Mechanics with certifications, productivity, schedule |

**Pipeline Stages:**

```
Appointment Scheduled -> Vehicle Checked In -> Inspection/Diagnosis -> Estimate Created -> Estimate Sent -> Customer Approved -> Parts Ordered -> In Progress -> Quality Check -> Ready for Pickup -> Customer Notified -> Picked Up -> Invoice Paid -> Review Requested
```

**Unique Features:**
- VIN decode for automatic vehicle info population
- Digital Vehicle Inspection with photo/video and customer sharing
- Parts sourcing integration across multiple vendors
- Labor guide integration (Mitchell, MOTOR) for accurate quoting
- CARFAX integration for vehicle history
- Declined services tracking and follow-up
- Maintenance schedule tracking (next oil change, tire rotation due)
- Bay/lift assignment per work order
- Technician flat-rate productivity tracking
- Customer text updates throughout repair process
- Shopmonkey pricing: $179-425/month; Tekmetric: $179-409/month

**Payment Model:**
- Pay at pickup (full payment on completion)
- Estimates approved before work begins
- Financing for large repairs ($1,000+) via Affirm, Sunbit, etc.
- Fleet/commercial accounts with net-30 terms
- Cash, card, check accepted
- Digital invoicing for pickup convenience

**Customer Communication Patterns:**
- Text when vehicle is checked in
- Text estimate for approval (with line-by-line approve/decline)
- Text DVI results with photos
- Text when vehicle is ready for pickup
- Automated service reminder emails/texts (30/60/90 days)

---

## 2. AUTO DETAILING

**Competitors studied:** Urable, Jobber, Square, DetailPro, WashMetrix

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Vehicle Owners |
| Services | Services / Packages |
| Appointments | Jobs / Appointments |
| Products | Detailing Products / Coatings |
| Staff | Detailers / Technicians |

**Essential Tabs:**

1. **Dashboard** — Jobs today, revenue, technician schedule, upcoming appointments, active packages. Urable provides centralized scheduling and CRM for detailers.
2. **Appointments / Jobs** — Service details: vehicle info, service package (wash, interior detail, exterior detail, full detail, ceramic coating, PPF, window tint), estimated duration, bay/location assignment. Mobile detailing adds customer address.
3. **Booking** — Online booking with service selection, vehicle type (sedan, SUV, truck affects pricing), add-ons, availability display. Urable offers 24/7 self-service booking portal.
4. **Packages / Services** — Service menu with tiered packages: basic wash, interior detail, exterior detail, full detail, ceramic coating, paint correction, PPF installation. Pricing varies by vehicle size.
5. **Customers** — Customer profiles with vehicle(s), service history, ceramic coating warranty dates, preferences, membership status.
6. **Payments** — On-site payment collection, deposit for premium services (ceramic coating), membership billing for recurring customers.

**Optional Tabs:**

1. **Memberships** — Monthly wash/detail memberships for recurring revenue. Wash plan management with frequency.
2. **Inventory** — Product inventory: soaps, waxes, ceramic coatings, microfiber towels, chemicals. Cost per job tracking.
3. **Marketing** — Before/after photo gallery, review requests, seasonal promotions, referral programs.
4. **Reports** — Revenue per service, average ticket, technician productivity, product cost per job.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Appointments | Calendar | Detail jobs with vehicle, service, time, tech |
| Vehicles | Table | Customer vehicles with size class, coating status |
| Packages | Cards | Service tiers with pricing by vehicle size |
| Memberships | Table | Recurring detail plans with frequency, billing |
| Customers | Table | Vehicle owners with history, preferences |

**Pipeline Stages:**

```
Booking Request -> Confirmed -> Vehicle Drop-Off -> Wash/Prep -> Detail Work -> Final Inspection -> Ready -> Customer Notified -> Picked Up -> Review Request
```

**Unique Features:**
- Vehicle size-based pricing (sedan vs SUV vs truck tier)
- Ceramic coating warranty tracking and maintenance reminders
- Before/after photo documentation (critical for marketing)
- Mobile detailing support (customer address as location)
- Membership/subscription plans for recurring revenue
- Bay/workspace management for fixed-location shops
- Paint correction level assessment (1-step, 2-step, 3-step)
- PPF and window tint installation tracking
- Product cost tracking per job
- Urable: detailing-specific CRM with scheduling and invoicing

**Payment Model:**
- Pay at completion (most common)
- Deposits for premium services (ceramic coating: 50% deposit)
- Membership billing (monthly: $30-100)
- Pricing by vehicle size class
- Add-on services at checkout
- Average ticket: $150-500+ for full detail

---

## 3. CAR WASH

**Competitors studied:** DRB/Washify, Rinsed, WashMetrix, Dencar, Micrologic

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Members / Customers |
| Services | Wash Packages |
| Appointments | N/A (drive-up) |
| Products | Wash Add-ons / Gift Cards |
| Staff | Attendants / Managers |

**Essential Tabs:**

1. **Dashboard** — Washes today, membership count, revenue, tunnel/bay utilization, weather impact, membership churn rate. DRB Washify provides real-time operational analytics.
2. **Memberships** — THE key entity for modern car washes: unlimited wash plans (Bronze/Silver/Gold tiers), auto-renewal, member count, churn tracking, plan management. Washify automates monthly renewals. Membership revenue is the #1 business model.
3. **POS / Transactions** — Drive-up transactions: package selection, add-on upsells (tire shine, rain repellent, interior vacuum), payment processing. Speed is critical (target: under 45 seconds per transaction).
4. **Customers** — Basic customer profiles: vehicles (plate-based identification), membership plan, visit frequency, lifetime value.
5. **Payments** — High-volume payment processing, contactless/mobile priority, gift card sales and redemption, monthly membership auto-charge.
6. **Marketing** — Membership conversion campaigns, gift card promotions, seasonal specials, loyalty programs.

**Optional Tabs:**

1. **Equipment** — Tunnel equipment maintenance: chemical systems, brushes, dryers, conveyor. Maintenance scheduling and alerts.
2. **Reports** — Washes per hour, revenue per wash, membership vs single-wash ratio, weather correlation, peak hours.
3. **Employees** — Attendant scheduling, tip tracking, labor cost per wash.
4. **E-Commerce** — Online membership sign-up, gift card purchases, subscription management.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Memberships | Table | Unlimited wash plans with tier, price, member count |
| Transactions | List | Today's washes with package, add-ons, payment |
| Members | Table | Members with plan, visit frequency, renewal date |
| Equipment | Table | Tunnel/bay equipment with maintenance schedule |
| Gift Cards | Table | Gift card inventory, sold, redeemed, balance |

**Pipeline Stages:**

```
Drive Up -> Package Selection -> Add-On Upsell -> Payment -> Wash -> Exit (Vacuum optional) -> Review Request / Membership Offer
```

**Unique Features:**
- License plate recognition (LPR) for member identification (no cards needed)
- Unlimited wash membership management (the core business model)
- Pay station / kiosk management (self-serve payment terminals)
- Tunnel sequence management and timing
- Weather-aware promotions (sunny day = push memberships)
- Fast transaction processing (under 45 seconds)
- Chemical usage tracking and equipment maintenance
- Multi-site management for chain car washes
- Membership analytics (churn, LTV, visit frequency)
- Gift card and promotional code management
- DRB Washify: purpose-built for tunnel and express car washes

**Payment Model:**
- Single wash pricing ($10-30 per wash with add-ons)
- Unlimited membership ($20-50/month per vehicle)
- Multi-vehicle membership discounts
- Gift cards
- Prepaid wash books (10 for the price of 8)
- Fleet accounts

---

## 4. TIRE SHOP

**Competitors studied:** Tekmetric, Shopmonkey, TireShop Manager, ASA Tiremaster

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Vehicle Owners |
| Services | Services / Installations |
| Appointments | Work Orders |
| Products | Tires / Parts |
| Staff | Technicians / Installers |

**Essential Tabs:**

1. **Dashboard** — Work orders today, tire inventory levels, revenue, appointments pending, popular tire sizes in stock.
2. **Work Orders** — Service details: vehicle info, tire size (e.g., 225/65R17), service type (new tires, rotation, balance, alignment, flat repair, TPMS), tire brand/model selected, quantities.
3. **Tire Inventory** — THE critical entity: tire inventory by size, brand, model, speed rating, load rating, DOT date, quantity, cost, retail price, margin. Searchable by vehicle fitment. Fast lookup by tire size is essential.
4. **Vehicles** — Vehicle database with VIN, tire size specs, last service, mileage, recommended rotation schedule.
5. **Customers** — Customer profiles with vehicles, tire purchase history, alignment records, warranty claims.
6. **Payments** — POS with financing options (tires are $400-2,000+ for a set), warranty fee collection.

**Optional Tabs:**

1. **Scheduling** — Appointment booking for tire installation, rotation, alignment. Bay assignment.
2. **Suppliers** — Tire distributor management (Tire Rack, ATD, NTB wholesale), ordering, delivery tracking.
3. **Warranties** — Road hazard warranty tracking, manufacturer warranty claims, warranty fee management.
4. **Marketing** — Seasonal promotions (winter tire season, spring all-season), tire rebate programs, service reminders.
5. **Reports** — Revenue by service type, tire brand sales, inventory turnover, margin analysis.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Work Orders | Pipeline | Jobs with vehicle, service, tires, status |
| Tire Inventory | Table | Tires by size, brand, model, quantity, cost |
| Vehicles | Table | Cars with tire specs, last rotation, alignment |
| Customers | Table | Vehicle owners with purchase history |
| Warranties | Table | Road hazard and manufacturer warranties |
| Suppliers | Table | Tire distributors with ordering info |

**Pipeline Stages:**

```
Appointment / Walk-in -> Vehicle Assessment -> Tire Selection (by size/budget) -> Quote Approved -> Tires Sourced -> Installation -> Balance / Alignment Check -> Quality Check -> Ready -> Paid -> Warranty Registered
```

**Unique Features:**
- Tire inventory management by size, brand, and fitment
- Vehicle-to-tire size matching (automatic lookup by VIN/year/make/model)
- DOT date tracking for tire age
- Road hazard warranty management
- Alignment check and report generation
- TPMS (Tire Pressure Monitoring System) sensor management
- Seasonal tire change tracking (winter/summer swaps)
- Tire manufacturer rebate program tracking
- Quick quote generation by tire size
- Financing for tire sets ($400-2,000+)

**Payment Model:**
- Pay at completion
- Financing for tire purchases (60-90 day same as cash, monthly payments)
- Road hazard warranty: additional $15-30 per tire
- Tire disposal/recycling fee ($3-5 per tire, legally required in many states)
- Fleet pricing for commercial accounts

---

## 5. BODY SHOP / COLLISION

**Competitors studied:** CCC ONE, Mitchell RepairCenter, Audatex, Body Shop Booster, ProgiPlanning

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Claimants |
| Services | Repairs |
| Appointments | Repair Orders |
| Products | Parts / Materials |
| Staff | Technicians / Painters / Estimators |
| Pipeline | Repair Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active repairs by stage, cycle time metrics, revenue, supplement status, parts on order, insurance communications. CCC ONE provides the industry standard dashboard.
2. **Repair Orders** — Repair details: vehicle info, damage description, photos (all angles), insurance claim info, estimator, assigned technician, parts needed, paint codes, OEM vs aftermarket parts decision. Comprehensive damage documentation.
3. **Estimates / Supplements** — Damage estimate creation: labor hours by operation (body, frame, paint, mechanical), parts (OEM vs aftermarket vs used), paint materials, betterment calculations. Supplement management for hidden damage discovered during repair. CCC ONE's AI helps write estimates faster.
4. **Insurance** — Insurance company interface: claim number, adjuster info, DRP (Direct Repair Program) status, supplement submissions, approval tracking, payment status. Insurance communication is a daily activity.
5. **Parts** — Parts ordering: OEM from dealer, aftermarket, recycled/used, LKQ. Parts status tracking (ordered, shipped, received, backordered). Mirror match verification.
6. **Customers** — Customer profiles: vehicle info, insurance carrier, rental car info, communication preferences. Customer updates on repair progress.

**Optional Tabs:**

1. **Production Board** — Visual production board showing all vehicles in shop by repair stage: disassembly, structural, body, paint prep, paint, reassembly, detail, QC. CCC ONE and Mitchell both offer production management.
2. **Photos** — Comprehensive photo documentation: pre-repair (all angles, damage close-ups), during repair (hidden damage, structural), post-repair. Required for insurance and quality.
3. **Rental** — Rental car coordination: customer pickup, duration tracking, insurance authorization, extensions.
4. **Reports** — Cycle time (CSI), touch time, supplement ratio, labor efficiency, parts cost ratio, insurance DRP performance metrics.
5. **Scheduling** — Estimate appointment scheduling, repair start date planning, capacity management.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Repair Orders | Pipeline | Collision repairs with vehicle, stage, insurance, estimate |
| Estimates | Table | Damage estimates with parts, labor, supplements |
| Insurance Claims | Table | Claims with carrier, adjuster, approval status |
| Parts Orders | Table | Parts with type (OEM/aftermarket), vendor, status |
| Production Board | Cards/Pipeline | Vehicles in shop by repair stage |
| Photos | Cards | Damage and repair documentation per vehicle |

**Pipeline Stages:**

```
Estimate Appointment -> Vehicle Drop-Off -> Disassembly/Teardown -> Hidden Damage Assessment -> Supplement Submitted -> Supplement Approved -> Parts Ordered -> Parts Received -> Structural Repair -> Body Work -> Paint Prep -> Paint -> Reassembly -> Detail -> Quality Control -> Customer Notified -> Pickup -> Invoice/Insurance Payment
```

**Unique Features:**
- Insurance estimate writing (CCC ONE, Mitchell, Audatex are the three platforms)
- Supplement management for hidden damage
- OEM repair procedure access (manufacturer-required methods)
- Paint code matching and paint material calculation
- DRP (Direct Repair Program) insurer management
- Production board with repair stage tracking
- Cycle time optimization (industry benchmark: 5-7 days for average repair)
- Pre/during/post repair photo documentation
- Parts sourcing (OEM vs aftermarket vs recycled decision matrix)
- Calibration management (ADAS systems require recalibration after collision)
- Rental car coordination
- CCC ONE: dominant platform, 25,000+ shops; Mitchell: second largest

**Payment Model:**
- Insurance pays directly (minus customer deductible)
- Customer deductible collected at pickup ($250-1,000 typical)
- Cash/self-pay customers: estimate approval + deposit
- Supplement payments from insurance during repair
- Total loss negotiation (when repair exceeds vehicle value)

---

## 6. TOWING COMPANY

**Competitors studied:** TowBook, ProTow, Beacon Software, TOPS, Omadi

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Motorists / Account Holders |
| Services | Tows / Services |
| Appointments | Calls / Dispatches |
| Products | N/A |
| Staff | Drivers / Operators / Dispatchers |

**Essential Tabs:**

1. **Dashboard** — Active calls, driver locations (GPS), trucks available, revenue today, impound lot capacity, motor club calls pending.
2. **Dispatch** — Call management: caller info, vehicle info, pickup location, destination, service type (tow, jumpstart, lockout, tire change, fuel delivery, winch-out), priority, truck/driver assignment. Real-time GPS dispatch to nearest available driver.
3. **Drivers / Trucks** — Driver profiles with license, certifications. Truck inventory: type (flatbed, wheel-lift, heavy-duty, rotator), capacity, current location, availability status. Truck-to-call matching based on vehicle type needing tow.
4. **Customers / Accounts** — Motor club accounts (AAA, insurance roadside), police/municipality contracts, commercial fleet accounts, individual customer records.
5. **Invoicing** — POS/invoicing per call: base rate, mileage, after-hours surcharge, storage fees, winch-out fees. Motor club rate schedules. Invoice by call or monthly for accounts.
6. **Impound / Storage** — Storage lot management: vehicle inventory, daily storage fees, lien processing, release authorization, photos of stored vehicles.

**Optional Tabs:**

1. **GPS / Tracking** — Real-time driver/truck GPS tracking, ETA calculation, route optimization.
2. **Motor Club** — Motor club call management (AAA, Agero, NSD): acceptance, ETA compliance, documentation, payment reconciliation.
3. **Reports** — Calls per day/driver, revenue by service type, motor club vs private ratio, response times, storage revenue.
4. **Compliance** — DOT compliance, FMCSA regulations, driver hours of service, truck inspections, insurance certificates.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Calls/Dispatches | List | Active and recent calls with pickup, dest, status |
| Drivers | Cards | Operators with truck, location, availability |
| Trucks | Cards | Fleet with type, capacity, location, status |
| Impound | Table | Stored vehicles with fees, lien status, photos |
| Accounts | Table | Motor clubs, fleet, municipality contracts |
| Invoices | Table | Per-call billing with rates, mileage, fees |

**Pipeline Stages:**

```
Call Received -> Dispatched -> En Route -> On Scene -> Loaded/Service Complete -> En Route to Destination -> Delivered -> Invoice Created -> Paid
```

(For impound: Vehicle Stored -> Daily Fee Accruing -> Owner Contacted -> Lien Filed (if unclaimed) -> Released or Auctioned)

**Unique Features:**
- Real-time GPS dispatch to nearest available driver
- Truck type matching (flatbed for AWD, wheel-lift for FWD, heavy-duty for trucks)
- Motor club integration (AAA, insurance roadside programs)
- Impound lot management with daily storage fees
- Lien processing for abandoned vehicles
- Police/municipality rotation list management
- After-hours and holiday rate management
- Mileage-based pricing calculations
- Photo documentation of vehicle condition at pickup
- DOT compliance and driver hours tracking
- TowBook is the industry leader for small-to-mid size operators

**Payment Model:**
- Per-call pricing: base rate ($75-150) + per-mile ($3-7/mile)
- After-hours premium (25-50% surcharge)
- Motor club rates (negotiated, often lower than retail)
- Storage fees ($25-75/day)
- Lien processing fees
- Fleet/account billing (monthly invoicing)
- Impound release fees

---

# RETAIL

## 7. BOUTIQUE / CLOTHING STORE

**Competitors studied:** Shopify POS, Lightspeed, Square POS, Vend (now Lightspeed)

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Shoppers |
| Services | N/A |
| Appointments | Personal Shopping / Styling |
| Products | Apparel / Accessories |
| Staff | Sales Associates / Stylists |

**Essential Tabs:**

1. **Dashboard** — Sales today, top-selling items, inventory alerts (low stock, new arrivals), foot traffic, average transaction, online orders to fulfill. Shopify POS syncs online and in-store metrics.
2. **Inventory** — Product catalog with variants: style, size (XS-XXL), color, SKU, cost, retail price, quantity per variant, barcode. New arrival flagging, markdown management. Shopify and Lightspeed both handle variant-heavy inventory.
3. **POS** — In-store checkout: barcode scanning, discount application, customer lookup, split payment, gift cards, returns/exchanges. Shopify POS includes staff checkout and customer-facing display.
4. **Customers** — Customer profiles: purchase history, sizes, style preferences, birthday, loyalty points, contact info. VIP tagging for high-spend customers.
5. **Orders** — E-commerce orders: BOPIS (buy online, pickup in store), ship-from-store, online returns. Unified commerce across channels.
6. **Reports** — Sales by category, margin analysis, inventory turnover, sell-through rate, customer lifetime value, staff performance.

**Optional Tabs:**

1. **E-Commerce** — Online store management synced with POS inventory. Shopify POS is the leader here (unified online + in-store).
2. **Loyalty** — Points-based or spend-tier loyalty program, VIP rewards, birthday rewards.
3. **Staff** — Sales associate scheduling, commission tracking, individual performance metrics.
4. **Marketing** — New arrival announcements, sale promotions, email campaigns, social media.
5. **Purchasing** — Vendor/wholesale ordering, purchase orders, receiving, cost tracking.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Products | Table | Apparel with variants (size, color), SKU, stock |
| Transactions | List | POS sales with items, discounts, payment |
| Customers | Table | Shoppers with purchase history, preferences, loyalty |
| Orders (Online) | List | E-commerce orders with fulfillment status |
| Inventory | Table | Stock levels by variant with reorder alerts |
| Purchase Orders | Table | Vendor orders with items, ship date, receiving |

**Unique Features:**
- Variant management (size x color matrix tracking)
- Markdown/sale management with scheduled price changes
- BOPIS (buy online, pick up in store)
- Seasonal inventory rotation (spring/summer, fall/winter)
- Size run tracking and reorder by size
- Customer style preferences for personal shopping
- Visual merchandising / product display planning
- Consignment tracking (if applicable)
- Trunk show / pop-up event management
- Shopify POS: $39/mo (Basic) + $89/mo for POS Pro

**Payment Model:**
- POS retail (full payment at checkout)
- Credit card, debit, cash, mobile wallets, gift cards
- Layaway (rare but some boutiques offer)
- Returns/exchanges with store credit or refund
- E-commerce shipping with standard payment

---

## 8. JEWELRY STORE

**Competitors studied:** Lightspeed, Edge by The Edge, Shopify POS, JewelMate, JTS (Jeweler's Touch Software)

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Clients |
| Services | Repairs / Custom Design |
| Appointments | Appointments / Consultations |
| Products | Jewelry / Watches / Gems |
| Staff | Sales Associates / Jewelers / Gemologists |

**Essential Tabs:**

1. **Dashboard** — Sales today, high-value items sold, custom orders in progress, repair status, inventory value, layaway balances.
2. **Inventory** — Detailed inventory: item type (ring, necklace, bracelet, earring, watch), materials (gold karat, platinum, silver), gemstones (type, carat, clarity, color, cut), serial number, certification, cost, retail price, display location. Lightspeed supports serialized inventory for high-value items.
3. **POS** — High-value transaction processing with extra security. Tax calculation (state-specific jewelry tax). Insurance documentation.
4. **Customers** — Customer profiles: purchase history, ring sizes, style preferences, anniversary/birthday dates, wish list. Relationship-driven selling (know their partner's preferences for surprise gifts).
5. **Custom Orders** — Custom jewelry design: consultation, CAD design, stone selection, setting choice, production timeline, pricing. This is a significant revenue stream.
6. **Repairs** — Jewelry repair tracking: intake (photo + condition), repair type (sizing, stone setting, clasp, cleaning, rhodium plating), technician assignment, status, completion date.

**Optional Tabs:**

1. **Appraisals** — Jewelry appraisal management: item description, photos, valuation, certificate generation. For insurance purposes.
2. **Layaway** — High-value layaway management: payment schedule, balance tracking, item hold policy.
3. **Trade-In** — Used jewelry trade-in evaluation, scrap gold pricing, consignment.
4. **Marketing** — Anniversary reminders, holiday promotions (Valentine's, Christmas), engagement season campaigns, milestone reminders.
5. **Reports** — Revenue by category, margin by metal type, inventory aging, custom order profitability, average sale.
6. **E-Commerce** — Online catalog with high-quality product photography, ship-to-store, custom order inquiries.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Inventory | Table | Jewelry with materials, gems, serial, certification |
| Custom Orders | Pipeline | Design orders with CAD, stone, setting, status |
| Repairs | Pipeline | Repair jobs with item, type, tech, status |
| Customers | Table | Clients with sizes, preferences, dates, wish list |
| Appraisals | Table | Valuations with item, photos, certificate |
| Layaway | Table | Payment plans with item, balance, schedule |

**Pipeline Stages:**

Custom order:
```
Consultation -> Design / CAD -> Stone Selection -> Client Approval -> Production -> Quality Check -> Ready -> Pickup / Delivery -> Appraisal Offered
```

Repair:
```
Intake (Photo + Condition) -> Estimate -> Approved -> In Repair -> Quality Check -> Ready -> Customer Notified -> Picked Up -> Paid
```

**Unique Features:**
- Serialized inventory tracking (unique ID per high-value item)
- Gemstone 4C tracking (carat, clarity, color, cut)
- Custom design workflow with CAD and client approval
- Jewelry repair management (sizing, stone setting, cleaning)
- Appraisal certificate generation
- Layaway management for high-value purchases
- Metal and gemstone cost tracking by weight/market price
- Anniversary and occasion-based marketing
- Insurance documentation for purchased items
- Trade-in and scrap evaluation
- Lightspeed supports serialized inventory starting at $89/month

**Payment Model:**
- Full payment at purchase (card, cash, check)
- Layaway (installment payments, item held until paid)
- Custom order: deposit (30-50%) + balance at completion
- Repair: pay at pickup
- Financing through third-party (Synchrony, Affirm)
- Average transaction: $200-5,000+ (wide range)

---

## 9. THRIFT / CONSIGNMENT STORE

**Competitors studied:** ConsignCloud, SimpleConsign, ConsignPro, Ricochet

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Consignors (sellers) / Shoppers (buyers) |
| Services | Consignment |
| Appointments | Intake Appointments |
| Products | Consigned Items / Donated Items |
| Staff | Associates / Intake Specialists |

**Essential Tabs:**

1. **Dashboard** — Sales today, items received, consignor payouts due, inventory count, top categories, items approaching expiration date.
2. **Inventory** — Item management: consignor ID, category (clothing, accessories, furniture, home goods, electronics), description, condition, price, days on floor, expiration/markdown schedule. Both ConsignCloud and SimpleConsign center on item tracking.
3. **Consignors** — Consignor profiles: account, items consigned, split percentage, payout balance, payout history, active items, expired items. Consignor portal for tracking their items and earnings.
4. **POS** — Retail checkout: barcode scanning, discount application, consignor commission auto-calculation, tax, returns. Price tag printing.
5. **Payouts** — Consignor payout management: calculate earnings per sold item based on split agreement, batch payouts (monthly/bi-weekly), payout methods (check, direct deposit, store credit).
6. **Reports** — Sales by category, consignor performance, inventory turnover, markdown effectiveness, days-on-floor analysis.

**Optional Tabs:**

1. **Intake** — New item intake workflow: consignor check-in, item sorting, pricing, tagging, quality assessment.
2. **Markdowns** — Automatic markdown schedule: 30 days = 25% off, 60 days = 50% off, 90 days = return to consignor or donate. ConsignCloud and SimpleConsign both support automated markdown rules.
3. **Marketing** — New arrivals announcements, sale events, consignor recruitment, social media.
4. **E-Commerce** — Online store integration (Shopify, eBay, Poshmark) for additional selling channels.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Items | Table | Consigned goods with consignor, price, days on floor |
| Consignors | Table | Sellers with split %, items, balance, payouts |
| Transactions | List | POS sales with items, commissions, payment |
| Payouts | Table | Consignor earnings with calculation, status |
| Intake | List | New items being processed for floor |
| Markdowns | Table | Scheduled price reductions by item/date |

**Pipeline Stages:**

Item lifecycle:
```
Intake/Received -> Quality Check -> Priced/Tagged -> On Floor -> Markdown 1 (30 days) -> Markdown 2 (60 days) -> Final Markdown (90 days) -> Sold OR Returned to Consignor / Donated
```

**Unique Features:**
- Consignor management with split-percentage agreements (typically 40-60% to consignor)
- Automatic markdown scheduling based on days on floor
- Consignor portal for item tracking and earnings
- Batch payout processing (checks, direct deposit, store credit)
- Item expiration management (return or donate after X days)
- Consignor contract management
- Tag printing and barcode generation
- Multi-consignor inventory tracking per item
- Buy-outright vs consignment tracking
- SimpleConsign pricing: $159-359/month per location

**Payment Model:**
- Retail POS (customers pay full marked price)
- Consignor split (40/60, 50/50, 60/40 - store/consignor)
- Store credit option for consignors
- Returns policy (store credit only, typical for consignment)
- Clearance events for aged inventory

---

## 10. PET STORE

**Competitors studied:** Lightspeed, Shopify POS, PetExec, Square

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Pet Owners |
| Services | Grooming / Training / Boarding |
| Appointments | Grooming / Training Appointments |
| Products | Pet Supplies / Food / Animals |
| Staff | Associates / Groomers / Trainers |

**Essential Tabs:**

1. **Dashboard** — Sales today, grooming appointments, inventory alerts (food reorders), loyalty program stats, popular products.
2. **Inventory** — Product catalog: food/treats (brand, formula, size, weight), supplies (toys, beds, leashes, bowls), animals (species, breed, age, health status if selling live animals), medications/supplements. Reorder automation for staple items.
3. **POS** — Retail checkout with barcode scanning, loyalty point redemption, subscription discount for auto-ship customers.
4. **Customers / Pet Profiles** — Customer profiles linked to pet(s): species, breed, age, weight, allergies, vaccination records, grooming preferences, food preferences. Multiple pets per customer.
5. **Grooming** — Grooming appointments: pet info, service (bath, haircut, nail trim, teeth cleaning), groomer assignment, notes (behavior, matting, skin conditions), before/after photos.
6. **Reports** — Sales by category, food subscription retention, grooming revenue, customer lifetime value.

**Optional Tabs:**

1. **Subscriptions** — Autoship/subscription management for recurring food/supply orders. Recurring revenue driver.
2. **Training** — Training class management: group classes (puppy, obedience, agility), private sessions, trainer scheduling.
3. **Loyalty** — Points program, birthday treats, pet adoption anniversary rewards.
4. **Marketing** — New product announcements, adoption events, seasonal promotions, health tips newsletter.
5. **E-Commerce** — Online ordering with local delivery or ship, autoship enrollment.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Products | Table | Pet supplies with category, brand, variants, stock |
| Pets | Table | Pet profiles with species, breed, age, health |
| Customers | Table | Pet owners with pets, purchase history, loyalty |
| Grooming | Calendar | Grooming appointments with pet, service, groomer |
| Subscriptions | Table | Autoship programs with product, frequency, billing |
| Training | Calendar | Training classes/sessions with trainer, participants |

**Unique Features:**
- Pet profiles linked to customer accounts (species, breed, health, vaccinations)
- Grooming appointment management with pet-specific notes
- Food/supply subscription management (autoship)
- Vaccination record tracking (required for grooming/boarding)
- Live animal inventory management (if applicable)
- Pet birthday and adoption anniversary tracking
- Breed-specific product recommendations
- Weight tracking for food portioning recommendations
- Training class enrollment and progression

**Payment Model:**
- Retail POS (standard checkout)
- Grooming services (pay at service, $30-150)
- Subscription/autoship (monthly recurring)
- Training (per-class or package)
- Loyalty points redemption
- Pet adoption fees (if partnering with shelters)

---

## 11. GIFT SHOP

**Competitors studied:** Shopify POS, Square POS, Lightspeed, Clover

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Shoppers |
| Services | Gift Wrapping / Engraving |
| Appointments | N/A |
| Products | Gifts / Souvenirs / Cards |
| Staff | Associates |

**Essential Tabs:**

1. **Dashboard** — Sales today, top items, seasonal inventory alerts, gift card sales, e-commerce orders.
2. **Inventory** — Diverse product catalog: gifts, cards, candles, home decor, local artisan goods, souvenirs, seasonal items. Category and vendor tracking. Gift shops have high SKU diversity with low quantity per item.
3. **POS** — Fast checkout, gift wrapping add-on, gift message cards, gift receipts (price hidden), gift card sales.
4. **Customers** — Basic profiles: purchase history, gift preferences, loyalty status. Gift registry if offered.
5. **Reports** — Sales by category, seasonal trends, vendor performance, gift card liability tracking.

**Optional Tabs:**

1. **Gift Cards** — Gift card inventory, sales tracking, redemption, balance management. Gift cards are a major revenue category.
2. **E-Commerce** — Online store for shipping gifts, local delivery.
3. **Loyalty** — Simple loyalty program (spend-based or visit-based).
4. **Vendors / Artisans** — Local artisan and vendor management, wholesale ordering, consignment tracking for local makers.
5. **Seasonal** — Seasonal inventory planning (Christmas, Valentine's, Mother's Day, graduation).

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Products | Table | Gifts with category, vendor, price, stock |
| Transactions | List | Sales with items, gift wrapping, gift card |
| Gift Cards | Table | Gift card inventory and redemption tracking |
| Vendors | Table | Suppliers and artisans with ordering info |
| Customers | Table | Shoppers with purchase history, preferences |

**Unique Features:**
- Gift wrapping service management and pricing
- Gift receipt generation (price hidden from recipient)
- Gift card management (high percentage of revenue)
- Seasonal inventory planning and rotation
- Local artisan/maker consignment tracking
- Gift registry option
- High SKU diversity with low quantity per item
- Personalization services (engraving, monogramming)
- Tourist/souvenir-specific inventory (location-based shops)

**Payment Model:**
- Standard retail POS
- Gift cards (purchase + redemption tracking)
- Gift wrapping fee ($2-10)
- Personalization/engraving fee ($5-25)
- E-commerce with shipping

---

## 12. SMOKE / VAPE SHOP

**Competitors studied:** Lightspeed, Korona POS, BLAZE Smoke Shop POS, Square POS

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers |
| Services | N/A |
| Appointments | N/A |
| Products | Tobacco / Vape / CBD / Accessories |
| Staff | Budtenders / Associates |

**Essential Tabs:**

1. **Dashboard** — Sales today, top products, inventory alerts, age verification compliance, loyalty stats.
2. **Inventory** — Product catalog: vape devices, e-liquids (brand, flavor, nicotine level, size), tobacco products, cigars, CBD, accessories (coils, batteries, cases), glass. Age-restricted product flagging. Lot tracking for regulatory compliance.
3. **POS** — Age verification at checkout (mandatory ID scan or manual check), restricted product compliance, tax calculation (tobacco taxes vary by state/locality), customer lookup for loyalty.
4. **Customers** — Customer profiles: purchase history, preferred brands/flavors, loyalty points, age verification on file.
5. **Reports** — Sales by category, compliance reports (age verification), inventory value, margin by product type, top-selling flavors/brands.

**Optional Tabs:**

1. **Loyalty** — Points program, VIP tiers for frequent customers, birthday rewards.
2. **E-Commerce** — Online catalog (with age verification gate), local delivery.
3. **Compliance** — Age verification logs, tobacco license management, state/local regulatory compliance, labeling requirements.
4. **Marketing** — New product announcements, flavor spotlights, loyalty promotions (limited by advertising regulations).

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Products | Table | Tobacco, vape, CBD with brand, flavor, strength, stock |
| Transactions | List | Sales with age verification, products, tax |
| Customers | Table | Shoppers with preferences, loyalty, age verified |
| Compliance | Table | Age verification logs, license status |

**Unique Features:**
- Age verification at every sale (legal requirement)
- Tobacco/vape tax calculation (complex, varies by jurisdiction)
- Nicotine strength and flavor tracking for inventory
- Regulatory compliance documentation
- Restricted product inventory management
- Flavor ban compliance tracking (varies by state/city)
- CBD product separate tracking and compliance
- Limited advertising options (tobacco advertising restrictions)
- Bulk discount management
- Loyalty important for retention (limited marketing channels)

**Payment Model:**
- Standard retail POS
- Cash-heavy (some payment processors restrict tobacco/vape)
- Loyalty points redemption
- No subscription model typical
- Average transaction: $15-50

---

## 13. BOOKSTORE

**Competitors studied:** Bookmanager, IndieCommerce (ABA), Lightspeed, Shopify POS, Basil Books

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Readers |
| Services | Events / Book Clubs |
| Appointments | Author Events / Signings |
| Products | Books / Gifts / Stationery |
| Staff | Booksellers / Associates |

**Essential Tabs:**

1. **Dashboard** — Sales today, bestsellers, events this month, special orders pending, inventory alerts, online orders to fulfill.
2. **Inventory** — Book inventory: title, author, ISBN, publisher, category/genre, format (hardcover, paperback, audio), cost, retail price, quantity, location in store. Book-specific metadata is essential. Bookmanager specializes in book inventory management with publisher catalog integration.
3. **POS** — Retail checkout: barcode (ISBN) scanning, customer lookup, loyalty, gift cards, book club pricing, special order pickup.
4. **Special Orders** — Customer book orders: title/ISBN, customer, estimated arrival, notification preference. Special ordering is a core service for independent bookstores.
5. **Events** — Author events, book signings, book club meetings, children's story time, workshops. Event management with RSVPs, seating, book sales at events.
6. **Reports** — Sales by genre/category, bestseller lists, publisher performance, event impact on sales.

**Optional Tabs:**

1. **Book Clubs** — Book club management: reading selections, meeting schedule, member communication, book orders for group.
2. **E-Commerce** — Online storefront (IndieCommerce powered by ABA, or Shopify/Bookshop.org integration), ship-to-customer.
3. **Loyalty** — Reader rewards, frequent buyer cards, genre-based recommendations.
4. **Marketing** — Newsletter with book recommendations, event announcements, seasonal reading lists.
5. **Vendors / Publishers** — Publisher and distributor ordering, returns management (books are returnable to publishers).

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Books | Table | Inventory with title, author, ISBN, genre, stock |
| Transactions | List | POS sales with items, discounts, payment |
| Special Orders | Table | Customer orders with title, status, notification |
| Events | Calendar | Author events, signings, book clubs |
| Customers | Table | Readers with purchase history, preferences, loyalty |
| Publishers | Table | Distributor accounts with ordering info |

**Unique Features:**
- ISBN-based inventory management
- Publisher catalog integration for ordering
- Book returnability tracking (unique to books: unsold inventory can be returned)
- Special order management for customer-requested titles
- Author event and book signing management
- Book club administration
- Genre-based section organization
- Staff picks and recommendation features
- Children's story time event scheduling
- IndieCommerce / Bookshop.org e-commerce integration
- Seasonal and holiday book list curation

**Payment Model:**
- Standard retail POS
- Gift cards
- Special order: pay at pickup or prepay
- Book club group orders (potential discount)
- E-commerce with shipping
- Author event tickets (usually free, but some ticketed)

---

## 14. COMPETITOR COMPARISON

### Automotive

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **Shopmonkey** | General auto repair | $179/mo | Intuitive UX, digital inspections, parts integration |
| **Tekmetric** | Auto repair (modern) | $179/mo | Smart Jobs, DVI, 70+ integrations, 13K+ shops |
| **Shop-Ware** | Progressive shops | Custom | Digital-first, customer texting, DVI |
| **CCC ONE** | Body shops | Custom | Insurance network, estimating, 25K+ shops |
| **Mitchell** | Body/collision | Custom | Repair procedures, insurance integration |
| **DRB Washify** | Car washes | Custom | Membership management, LPR, pay stations |
| **Urable** | Auto detailing | Custom | Detailing-specific CRM, scheduling, booking |
| **TowBook** | Towing companies | Custom | Dispatch, impound, motor club integration |

### Retail

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **Shopify POS** | Multi-channel retail | $39/mo + $89 POS Pro | Unified online + in-store, largest app ecosystem |
| **Lightspeed** | Inventory-heavy retail | $89/mo | Advanced inventory with variants, serialized items, multi-location |
| **Square POS** | Simple retail | Free | Free POS, easy setup, integrated payments |
| **ConsignCloud** | Consignment stores | Pay per add-on | Consignment-specific, automated splits, payout management |
| **SimpleConsign** | Consignment stores | $159-359/mo | Consignor portal, Shopify integration, established |
| **BloomNation** | Florists (POS) | Custom | Florist-specific POS, delivery routing, wire alternative |
| **Bookmanager** | Bookstores | Custom | Book-specific, ISBN management, publisher catalogs |

**Red Pine Gaps/Opportunities:**
- Automotive: Vehicle as a linked entity is unique; all auto businesses need VIN/make/model tracking
- Auto repair platforms are expensive ($179+/month); small shops may want a simpler/cheaper option
- Car wash memberships are a recurring revenue model that could integrate with loyalty
- Retail: Shopify POS dominates, but $39/mo + $89 POS Pro per location adds up
- Consignment tracking is niche but poorly served (only 2-3 real competitors)
- Pet stores need both retail POS AND service booking (grooming, training)
- All retail businesses need inventory with variants, but complexity varies hugely
- Review management is never built into retail POS systems
- Client portals barely exist in retail (huge opportunity for loyalty/engagement)

---

## 15. TEMPLATE CONFIG RECOMMENDATIONS

### Auto Repair Shop

```typescript
{
  templateId: 'auto_repair',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Work Orders',
    staff: 'Technicians',
    products: 'Parts'
  },
  portalConfig: {
    primaryAction: 'schedule_service',
    bookingMode: 'appointment',
    chatProminence: 'high',
    reviewPrompt: 'after_pickup',
    preferenceFields: ['vehicle_info', 'service_needed', 'preferred_date', 'urgency']
  },
  essentialTabs: ['dashboard', 'work_orders', 'dvi', 'estimates', 'customers', 'vehicles'],
  optionalTabs: ['parts', 'technicians', 'schedule', 'marketing', 'reports', 'payments'],
  defaultView: { work_orders: 'pipeline', vehicles: 'table', estimates: 'pipeline', customers: 'table' },
  pipelineStages: ['scheduled', 'checked_in', 'inspection', 'estimate_sent', 'approved', 'parts_ordered', 'in_progress', 'qc', 'ready', 'picked_up', 'paid'],
  paymentModel: 'pay_at_pickup',
  bookingFlow: 'appointment_to_work_order',
  specialFields: { vehicleTracking: true, vinDecode: true, dvi: true }
}
```

### Auto Detailing

```typescript
{
  templateId: 'auto_detailing',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Customers',
    services: 'Packages',
    appointments: 'Appointments',
    staff: 'Detailers',
    products: 'Products'
  },
  portalConfig: {
    primaryAction: 'book_detail',
    bookingMode: 'appointment',
    chatProminence: 'medium',
    reviewPrompt: 'after_service',
    preferenceFields: ['vehicle_type', 'service_package', 'preferred_date', 'location']
  },
  essentialTabs: ['dashboard', 'appointments', 'booking', 'packages', 'customers', 'payments'],
  optionalTabs: ['memberships', 'inventory', 'marketing', 'reports'],
  defaultView: { appointments: 'calendar', packages: 'cards', customers: 'table' },
  pipelineStages: ['booked', 'confirmed', 'drop_off', 'in_progress', 'inspection', 'ready', 'notified', 'picked_up'],
  paymentModel: 'pay_at_service_or_deposit',
  bookingFlow: 'online_booking',
  specialFields: { vehicleTracking: true, vehicleSizePricing: true }
}
```

### Car Wash

```typescript
{
  templateId: 'car_wash',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Members',
    services: 'Wash Packages',
    appointments: null,
    staff: 'Attendants',
    products: 'Add-ons'
  },
  portalConfig: {
    primaryAction: 'join_membership',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_visit',
    preferenceFields: ['wash_preference', 'vehicle_type']
  },
  essentialTabs: ['dashboard', 'memberships', 'pos', 'customers', 'payments', 'marketing'],
  optionalTabs: ['equipment', 'reports', 'employees', 'ecommerce'],
  defaultView: { memberships: 'table', pos: 'list', customers: 'table' },
  pipelineStages: ['drive_up', 'package_selected', 'payment', 'wash', 'exit'],
  paymentModel: 'membership_or_single_wash',
  bookingFlow: 'drive_up'
}
```

### Tire Shop

```typescript
{
  templateId: 'tire_shop',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Work Orders',
    staff: 'Technicians',
    products: 'Tires & Parts'
  },
  portalConfig: {
    primaryAction: 'find_tires',
    bookingMode: 'appointment',
    chatProminence: 'medium',
    reviewPrompt: 'after_service',
    preferenceFields: ['vehicle_info', 'tire_size', 'budget', 'brand_preference']
  },
  essentialTabs: ['dashboard', 'work_orders', 'tire_inventory', 'vehicles', 'customers', 'payments'],
  optionalTabs: ['scheduling', 'suppliers', 'warranties', 'marketing', 'reports'],
  defaultView: { work_orders: 'pipeline', tire_inventory: 'table', vehicles: 'table' },
  pipelineStages: ['scheduled', 'vehicle_in', 'tire_selected', 'approved', 'installation', 'balance_alignment', 'qc', 'ready', 'paid'],
  paymentModel: 'pay_at_pickup_with_financing',
  bookingFlow: 'appointment_or_walk_in',
  specialFields: { vehicleTracking: true, tireSizeManagement: true }
}
```

### Body Shop / Collision

```typescript
{
  templateId: 'body_shop',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Customers',
    services: 'Repairs',
    appointments: 'Repair Orders',
    staff: 'Technicians',
    products: 'Parts & Materials'
  },
  portalConfig: {
    primaryAction: 'schedule_estimate',
    bookingMode: 'estimate_appointment',
    chatProminence: 'high',
    reviewPrompt: 'after_pickup',
    preferenceFields: ['vehicle_info', 'damage_description', 'insurance_carrier', 'photos']
  },
  essentialTabs: ['dashboard', 'repair_orders', 'estimates', 'insurance', 'parts', 'customers'],
  optionalTabs: ['production_board', 'photos', 'rental', 'reports', 'scheduling'],
  defaultView: { repair_orders: 'pipeline', estimates: 'table', insurance: 'table', production_board: 'cards' },
  pipelineStages: ['estimate', 'drop_off', 'disassembly', 'supplement', 'parts_ordered', 'parts_received', 'structural', 'body', 'paint_prep', 'paint', 'reassembly', 'detail', 'qc', 'ready', 'pickup'],
  paymentModel: 'insurance_plus_deductible',
  bookingFlow: 'estimate_to_repair',
  specialFields: { vehicleTracking: true, insuranceClaims: true, supplementManagement: true }
}
```

### Towing Company

```typescript
{
  templateId: 'towing',
  familyId: 'automotive',
  labelOverrides: {
    clients: 'Customers',
    services: 'Services',
    appointments: 'Calls',
    staff: 'Drivers',
    products: null
  },
  portalConfig: {
    primaryAction: 'request_tow',
    bookingMode: 'dispatch',
    chatProminence: 'high',
    reviewPrompt: 'after_service',
    preferenceFields: ['service_type', 'vehicle_info', 'pickup_location', 'destination']
  },
  essentialTabs: ['dashboard', 'dispatch', 'drivers', 'customers', 'invoicing', 'impound'],
  optionalTabs: ['gps', 'motor_club', 'reports', 'compliance'],
  defaultView: { dispatch: 'list', drivers: 'cards', impound: 'table' },
  pipelineStages: ['call_received', 'dispatched', 'en_route', 'on_scene', 'loaded', 'delivered', 'invoiced', 'paid'],
  paymentModel: 'per_call_billing',
  bookingFlow: 'emergency_dispatch'
}
```

### Boutique / Clothing Store

```typescript
{
  templateId: 'boutique',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Customers',
    services: null,
    appointments: null,
    staff: 'Associates',
    products: 'Products'
  },
  portalConfig: {
    primaryAction: 'shop_new_arrivals',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['style_preference', 'sizes', 'favorite_brands']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'customers', 'orders', 'reports'],
  optionalTabs: ['ecommerce', 'loyalty', 'staff', 'marketing', 'purchasing'],
  defaultView: { inventory: 'table', pos: 'list', customers: 'table', orders: 'list' },
  pipelineStages: ['browsing', 'checkout', 'completed'],
  paymentModel: 'retail_pos',
  bookingFlow: 'walk_in_or_online',
  specialFields: { variantManagement: true, sizeTracking: true }
}
```

### Jewelry Store

```typescript
{
  templateId: 'jewelry_store',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Clients',
    services: 'Custom & Repair',
    appointments: 'Consultations',
    staff: 'Associates',
    products: 'Jewelry'
  },
  portalConfig: {
    primaryAction: 'browse_collection',
    bookingMode: 'consultation',
    chatProminence: 'medium',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['occasion', 'style', 'budget', 'ring_size', 'metal_preference']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'customers', 'custom_orders', 'repairs'],
  optionalTabs: ['appraisals', 'layaway', 'trade_in', 'marketing', 'reports', 'ecommerce'],
  defaultView: { inventory: 'table', custom_orders: 'pipeline', repairs: 'pipeline', customers: 'table' },
  pipelineStages: ['browsing', 'consultation', 'custom_design', 'production', 'ready', 'purchased'],
  paymentModel: 'retail_with_layaway_and_financing',
  bookingFlow: 'walk_in_or_consultation',
  specialFields: { serializedInventory: true, gemstoneTracking: true }
}
```

### Thrift / Consignment Store

```typescript
{
  templateId: 'consignment',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Consignors & Shoppers',
    services: 'Consignment',
    appointments: 'Intake Appointments',
    staff: 'Associates',
    products: 'Consigned Items'
  },
  portalConfig: {
    primaryAction: 'consign_items',
    bookingMode: 'intake_appointment',
    chatProminence: 'medium',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['item_categories', 'preferred_split']
  },
  essentialTabs: ['dashboard', 'inventory', 'consignors', 'pos', 'payouts', 'reports'],
  optionalTabs: ['intake', 'markdowns', 'marketing', 'ecommerce'],
  defaultView: { inventory: 'table', consignors: 'table', payouts: 'table' },
  pipelineStages: ['intake', 'priced', 'on_floor', 'markdown_1', 'markdown_2', 'sold_or_returned'],
  paymentModel: 'retail_pos_with_consignor_splits',
  bookingFlow: 'intake_appointment',
  specialFields: { consignorManagement: true, autoMarkdowns: true, payoutTracking: true }
}
```

### Pet Store

```typescript
{
  templateId: 'pet_store',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Pet Owners',
    services: 'Grooming & Training',
    appointments: 'Grooming Appointments',
    staff: 'Associates & Groomers',
    products: 'Pet Supplies'
  },
  portalConfig: {
    primaryAction: 'book_grooming',
    bookingMode: 'appointment',
    chatProminence: 'medium',
    reviewPrompt: 'after_service',
    preferenceFields: ['pet_type', 'pet_breed', 'grooming_preferences', 'food_brand']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'customers', 'grooming', 'reports'],
  optionalTabs: ['subscriptions', 'training', 'loyalty', 'marketing', 'ecommerce'],
  defaultView: { inventory: 'table', grooming: 'calendar', customers: 'table' },
  pipelineStages: ['browsing', 'checkout', 'grooming_booked', 'grooming_complete'],
  paymentModel: 'retail_pos_plus_services',
  bookingFlow: 'walk_in_or_appointment',
  specialFields: { petProfiles: true, groomingScheduling: true }
}
```

### Gift Shop

```typescript
{
  templateId: 'gift_shop',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Customers',
    services: 'Gift Wrapping',
    appointments: null,
    staff: 'Associates',
    products: 'Gifts & Cards'
  },
  portalConfig: {
    primaryAction: 'shop_gifts',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['occasion', 'recipient', 'budget']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'customers', 'reports'],
  optionalTabs: ['gift_cards', 'ecommerce', 'loyalty', 'vendors', 'seasonal'],
  defaultView: { inventory: 'table', pos: 'list', customers: 'table' },
  pipelineStages: ['browsing', 'checkout', 'completed'],
  paymentModel: 'retail_pos',
  bookingFlow: 'walk_in_or_online'
}
```

### Smoke / Vape Shop

```typescript
{
  templateId: 'smoke_shop',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Customers',
    services: null,
    appointments: null,
    staff: 'Associates',
    products: 'Products'
  },
  portalConfig: {
    primaryAction: 'browse_products',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['product_preference', 'brand', 'flavor']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'customers', 'reports'],
  optionalTabs: ['loyalty', 'ecommerce', 'compliance', 'marketing'],
  defaultView: { inventory: 'table', pos: 'list', customers: 'table' },
  pipelineStages: ['browsing', 'age_verified', 'checkout', 'completed'],
  paymentModel: 'retail_pos',
  bookingFlow: 'walk_in',
  specialFields: { ageVerification: true, tobaccoTaxCalc: true }
}
```

### Bookstore

```typescript
{
  templateId: 'bookstore',
  familyId: 'retail',
  labelOverrides: {
    clients: 'Readers',
    services: 'Events',
    appointments: 'Author Events',
    staff: 'Booksellers',
    products: 'Books'
  },
  portalConfig: {
    primaryAction: 'browse_books',
    bookingMode: 'event_rsvp',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['genres', 'favorite_authors', 'format_preference']
  },
  essentialTabs: ['dashboard', 'inventory', 'pos', 'special_orders', 'events', 'reports'],
  optionalTabs: ['book_clubs', 'ecommerce', 'loyalty', 'marketing', 'publishers'],
  defaultView: { inventory: 'table', special_orders: 'table', events: 'calendar' },
  pipelineStages: ['browsing', 'checkout', 'completed'],
  paymentModel: 'retail_pos',
  bookingFlow: 'walk_in_or_online',
  specialFields: { isbnManagement: true, publisherReturns: true }
}
```

---

## Sources

### Automotive
- Shopmonkey: https://www.shopmonkey.io/pricing
- Tekmetric: https://www.tekmetric.com/pricing
- Shop-Ware: https://shop-ware.com/
- CCC ONE: https://www.cccis.com/collision-repairers
- Mitchell: https://www.mitchell.com/
- DRB Washify: https://drb.com/tunnel_solutions/point-of-sale/washify
- Urable: https://urable.com/
- TowBook: https://www.towbook.com/

### Retail
- Shopify POS: https://www.shopify.com/pos/pricing
- Lightspeed Retail: https://www.lightspeedhq.com/pos/retail/pricing/
- Square POS: https://squareup.com/us/en/point-of-sale
- ConsignCloud: https://consigncloud.com/
- SimpleConsign: https://www.simpleconsign.com/
- Bookmanager: https://www.bookmanager.com/
- BloomNation: https://www.bloomnation.com/
