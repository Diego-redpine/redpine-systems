# Research #18: Food & Beverage Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 8 food & beverage business types based on competitor platform research.

---

## Table of Contents
1. [Restaurant (Full Service)](#1-restaurant-full-service)
2. [Cafe / Coffee Shop](#2-cafe--coffee-shop)
3. [Bakery](#3-bakery)
4. [Food Truck](#4-food-truck)
5. [Catering Company](#5-catering-company)
6. [Bar / Lounge / Nightclub](#6-bar--lounge--nightclub)
7. [Juice Bar / Smoothie Shop](#7-juice-bar--smoothie-shop)
8. [Meal Prep Service](#8-meal-prep-service)
9. [Competitor Comparison](#9-competitor-comparison)
10. [Template Config Recommendations](#10-template-config-recommendations)

---

## 1. RESTAURANT (FULL SERVICE)

**Competitors studied:** Toast, Square for Restaurants, TouchBistro, BentoBox, Popmenu, 7shifts

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Guests / Diners |
| Services | Menu Items |
| Appointments | Reservations |
| Products | Menu / Beverages |
| Staff | Front of House (FOH) / Back of House (BOH) |
| Pipeline | Guest Journey |

**Essential Tabs:**

1. **Dashboard** — Daily overview: covers/guests today, revenue (dine-in vs takeout vs delivery), average check size, table turnover rate, online orders pending, reservation count, staff on shift. Toast's dashboard surfaces real-time sales, labor costs, and top-selling items. Widget for kitchen order queue.
2. **Menu** — Full menu management with categories (appetizers, entrees, desserts, beverages), modifiers (extra cheese, no onion, etc.), pricing with time-based overrides (happy hour, brunch), allergen tags, nutritional info, photos. Separate menus for dine-in, takeout, and online ordering. Toast and Square both sync menu changes across all channels instantly.
3. **Orders** — Unified order management for dine-in, takeout, delivery, and online orders. Order status tracking (received, preparing, ready, picked up/delivered). Kitchen display system (KDS) integration. Coursing functionality (drag-and-drop items between courses). Square for Restaurants includes seat-level ordering.
4. **Reservations** — Table management with visual floor plan, reservation booking (online via Google/website + phone), waitlist management, estimated wait times, SMS notifications when table is ready. Toast Tables integrates with Google Maps for direct booking. Party size, special occasion notes, dietary preferences.
5. **Staff** — Employee profiles with role (server, cook, host, bartender, busser, manager), schedule management, shift swaps, time clock with GPS verification, tip tracking and pooling rules, BOH vs FOH designation, labor cost percentage. 7shifts saves restaurants up to 4 hours/week on scheduling alone.
6. **Payments** — POS integration, split checks (by seat, item, or amount), tab management, tip processing, gift card redemption, refunds, daily settlement reports, payment method breakdown.

**Optional Tabs:**

1. **Inventory** — Ingredient-level tracking, recipe costing, vendor management, purchase orders, waste logging, par levels with auto-alerts, food cost percentage tracking. MarketMan offers AI-powered recipe management and real-time COGS reporting. Critical for controlling food costs (target: 28-35% of revenue).
2. **Online Ordering** — Branded ordering website/portal, delivery zone management, order throttling for peak times, pickup scheduling, delivery tracking. Toast charges $0 commission on online orders. ChowNow saves restaurants average $16,000/year vs third-party apps.
3. **Marketing** — Email/SMS campaigns, loyalty programs, review management, social media posting, promotional offers (happy hour, prix fixe). Popmenu charges $300/mo for AI marketing add-on.
4. **Reviews** — Aggregate reviews from Google, Yelp, TripAdvisor; review response templates; review gating; star rating trends.
5. **Catering** — Event inquiry management, custom menus, proposals, deposits, delivery logistics for private events.
6. **Reports** — Revenue by daypart, menu item performance (food cost vs margin), labor cost percentage, server performance, table turnover, average check, guest return rate.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Menu Items | Table | Items with category, price, modifiers, allergens, photo |
| Reservations | Calendar | Bookings with party size, time, table, special requests |
| Orders | List | Active orders with status, channel (dine-in/takeout/delivery) |
| Tables | Cards | Floor plan view with status (open/occupied/reserved) |
| Staff | Table | Employees with role, schedule, tip earnings |
| Inventory Items | Table | Ingredients with stock level, par, vendor, unit cost |
| Vendors | Table | Suppliers with contact, items supplied, order history |
| Daily Sales | Table | Revenue breakdown by daypart, channel, category |

**Pipeline Stages:**

```
Reservation Request -> Confirmed -> Seated -> Order Placed -> Served -> Check Presented -> Paid -> Review Requested
```

**Unique Features:**
- Table management with visual floor plan and drag-and-drop seating
- Kitchen Display System (KDS) for order routing to stations (grill, fry, salad)
- Coursing (fire courses in sequence, hold dessert)
- Dynamic order throttling during peak times (Toast)
- Split checks by seat, item, or custom amount
- Time-based menu pricing (happy hour, brunch, dinner)
- Server sections and table assignment
- Allergen and dietary restriction flagging (nut-free, vegan, GF)
- Tip pooling with customizable rules (FOH only, all staff, by role)
- Wait time estimation and SMS/text notifications
- Dine-in, takeout, and delivery from one unified system
- Recipe costing with real-time food cost percentage

**Booking/Ordering Flow:**
- Dine-in: Reserve online/Google/phone -> Arrive -> Wait or be seated -> Order from server -> Eat -> Pay -> Review
- Takeout: Order online/phone -> Kitchen prepares -> Notify guest -> Pick up -> Pay (if not prepaid)
- Delivery: Order online -> Kitchen prepares -> Assign driver/third-party -> Deliver -> Confirm

**Payment Model:**
- POS with credit/debit/cash/mobile wallets
- Split checks, tabs, group billing
- Tips (percentage or custom, tip pooling)
- Gift cards (physical + digital)
- Online payment for takeout/delivery (prepay or pay on pickup)
- Toast processing: 2.49-2.99% + $0.15 per transaction
- Square processing: 2.6% + $0.10 (in-person), 2.9% + $0.30 (online)

**Staff-Specific Needs:**
- BOH (cooks, prep, dishwasher) vs FOH (servers, hosts, bartenders, bussers)
- Tip pooling rules vary by state law and restaurant policy
- 7shifts manages shift scheduling with labor cost forecasting
- Break tracking, overtime alerts, availability management
- Certifications tracking (food handler's permit, alcohol serving license)

---

## 2. CAFE / COFFEE SHOP

**Competitors studied:** Square for Restaurants, Toast, Clover, Lightspeed

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Regulars |
| Services | Menu Items / Drinks |
| Appointments | N/A (walk-in focused) |
| Products | Beverages / Pastries / Retail |
| Staff | Baristas / Team |

**Essential Tabs:**

1. **Dashboard** — Today's sales, transaction count, average ticket, top-selling drinks, peak hours heatmap, loyalty program enrollment, online orders pending. Quick view of staff on shift and inventory alerts.
2. **Menu** — Drink categories (espresso, drip, cold brew, specialty, tea, smoothies), food items (pastries, sandwiches, snacks), modifiers (milk type: oat/almond/whole, size, extra shot, flavor shots, temperature), seasonal specials. Quick-add favorites for speed.
3. **Orders** — Walk-in queue, mobile/online orders, order-ahead pickup times. Simple order flow optimized for high-volume, quick-service. Name on cup/order number for pickup.
4. **Payments** — Fast checkout (tap to pay, mobile wallets priority), loyalty point redemption, gift cards. Speed is critical - average transaction under 30 seconds.
5. **Loyalty** — Points-per-purchase or stamps-based (buy 10, get 1 free), digital loyalty cards, customer profiles with purchase history and preferences. Starbucks-style rewards drive repeat visits.
6. **Staff** — Barista scheduling, shift management, tip distribution, role assignment (opener, closer, bar, register).

**Optional Tabs:**

1. **Inventory** — Bean inventory (roast type, origin, roaster), milk/dairy alternatives stock, pastry/food inventory with shelf life tracking, retail merchandise (mugs, beans for sale).
2. **Online Ordering** — Order-ahead for pickup, subscription coffee programs, batch ordering for offices.
3. **Marketing** — Email campaigns, seasonal drink promotions, new menu item announcements, birthday rewards.
4. **Retail** — Bags of beans, mugs, tumblers, merchandise. Track retail inventory separately from food/bev.
5. **Reports** — Sales by hour (identify peak times), drink popularity, labor cost per transaction, customer frequency.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Menu Items | Table | Drinks and food with modifiers, sizes, prices |
| Orders | List | Transaction queue with status and pickup time |
| Customers | Table | Regulars with loyalty points, favorite orders, visit frequency |
| Inventory | Table | Beans, milks, syrups, food items with stock levels |
| Staff | Table | Baristas with schedule, role, tip share |

**Pipeline Stages:**

```
Walk-in / Online Order -> Order Placed -> Preparing -> Ready for Pickup -> Completed
```

**Unique Features:**
- Speed-optimized POS (average transaction under 30 seconds)
- Modifier-heavy ordering (milk type, size, shots, sweetness, temperature)
- Loyalty stamps or points program (essential for coffee shops)
- Order-ahead/mobile ordering
- Subscription programs (weekly coffee delivery, monthly bean subscription)
- Peak hour labor scheduling (morning rush = most staff)
- Tip jar / digital tip splitting
- Bean origin and roast tracking for specialty/third-wave shops
- Retail merchandise management alongside food/bev

**Payment Model:**
- Quick-pay POS (tap, mobile wallet, QR code priority)
- Average ticket: $4-8
- Loyalty redemption at checkout
- Gift cards (very high usage in coffee shops)
- Subscription billing for coffee programs
- Tipping (digital tip screen with suggested percentages)

---

## 3. BAKERY

**Competitors studied:** CakeBoss, Square, Toast, FlexiBake, Lightspeed

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers |
| Services | Products / Custom Orders |
| Appointments | Custom Orders / Pickup Times |
| Products | Baked Goods / Cakes / Pastries |
| Staff | Bakers / Decorators / Counter Staff |

**Essential Tabs:**

1. **Dashboard** — Daily sales, custom orders due today/this week, production schedule overview, low stock ingredients, revenue by category (bread, pastries, cakes, wholesale). CakeBoss shows upcoming orders on a visual calendar.
2. **Orders** — Custom cake/pastry orders with details (design, flavor, size, dietary needs, inscription, pickup date), walk-in sales, wholesale orders. Order status tracking (received, in production, decorating, ready for pickup/delivery). CakeBoss manages over 120 preloaded baking ingredients.
3. **Menu / Products** — Product catalog with categories (breads, cakes, cookies, pastries, seasonal), pricing, photos, allergen info, available sizes/servings. Custom order pricing calculator based on ingredients, labor, and complexity.
4. **Recipes** — Recipe management with ingredient lists, quantities by batch size, cost per recipe, scaling calculations (auto-adjust for different order sizes). Recipe costing to track true margin per product. CakeBoss and FlexiBake both center on recipe management.
5. **Inventory** — Ingredient inventory (flour, sugar, butter, eggs, specialty items), shelf life tracking, vendor management, purchase orders, waste tracking, par level alerts. FlexiBake handles nutritional label generation.
6. **Payments** — POS for counter sales, deposit collection for custom orders (typically 50% deposit), invoicing for wholesale accounts, gift cards.

**Optional Tabs:**

1. **Production** — Daily production schedule/plan (what to bake, quantities, timing), batch tracking, prep lists, equipment scheduling (ovens, mixers). Critical for bakeries with multiple daily production runs.
2. **Wholesale** — Wholesale customer management, recurring orders, delivery schedules, wholesale pricing tiers, accounts receivable.
3. **Marketing** — Email/SMS for seasonal specials, holiday pre-orders, new product announcements.
4. **Catering** — Event cake consultations, tasting appointments, event dessert packages.
5. **Reports** — Revenue by product category, recipe profitability, ingredient cost trends, waste percentage, production efficiency.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Custom Orders | Calendar | Cake/pastry orders with design, pickup date, status |
| Products | Cards | Product catalog with photos, pricing, allergens |
| Recipes | Table | Recipes with ingredients, cost, batch sizes |
| Ingredients | Table | Inventory with stock, par level, vendor, shelf life |
| Wholesale Accounts | Table | Business customers with recurring orders, terms |
| Production Schedule | Calendar | Daily baking plan with items, quantities, timing |

**Pipeline Stages:**

```
Inquiry (Custom Order) -> Consultation/Tasting -> Quote Sent -> Deposit Received -> In Production -> Decorating -> Quality Check -> Ready for Pickup/Delivery -> Completed -> Review Request
```

**Unique Features:**
- Recipe management with auto-scaling for batch sizes
- Ingredient-level cost tracking (true cost per item)
- Custom order workflow (consultation -> design -> deposit -> production -> pickup)
- Shelf life tracking and expiration alerts
- Production scheduling (what to bake each day, timing for oven slots)
- Allergen management (gluten-free, nut-free, dairy-free labeling)
- Nutritional information generation (FlexiBake)
- Wedding/event cake consultation booking
- Tasting appointment scheduling
- Photo gallery of past work (portfolio for custom cakes)
- Wholesale account management with net-30/60 terms

**Payment Model:**
- Counter POS for walk-in purchases
- Custom orders: 50% deposit at booking, balance due at pickup
- Wholesale: invoicing with net-15/30/60 terms
- Online ordering for pickup (prepay)
- CakeBoss pricing: $149 first year, then $20/year (indie baker focused)

---

## 4. FOOD TRUCK

**Competitors studied:** Square, Toast, Clover, GoTab

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers |
| Services | Menu Items |
| Appointments | Locations / Events |
| Products | Menu |
| Staff | Crew |

**Essential Tabs:**

1. **Dashboard** — Today's sales, location/event name, transaction count, average ticket, top sellers, weather integration (affects foot traffic), cash vs card breakdown. Revenue by location over time.
2. **Menu** — Streamlined menu (food trucks typically have 8-15 items), daily specials, sold-out tracking, modifier management, pricing. Menus may change by location or event. Quick 86 (mark items as sold out) from the POS.
3. **Orders** — Walk-up queue management, order numbers for pickup, online pre-orders for events. Speed-focused: average food truck transaction should be under 2 minutes.
4. **Locations / Schedule** — Weekly schedule of where the truck will be (addresses, events, festivals, regular spots), GPS-based location sharing with customers, event booking calendar. This is unique to food trucks and mission-critical.
5. **Payments** — Mobile POS (battery-powered, offline-capable), tap/card/mobile wallet, tipping. Square offers offline payment processing - reconnect within 24 hours to process. Cash handling.
6. **Inventory** — Simplified ingredient tracking (prep quantities for each location), par levels per event/location, supplier orders, waste tracking. Must plan inventory per-event since you can't restock mid-service.

**Optional Tabs:**

1. **Events / Catering** — Event booking (festivals, corporate events, weddings, private parties), catering quotes, deposit collection, event-specific menus. Toast Catering & Events syncs with Google Calendar.
2. **Marketing** — Social media schedule (announce daily location), email list, loyalty program, event announcements. Location-based marketing is critical for food trucks.
3. **Reports** — Revenue by location, best-performing events, item profitability, labor cost per event, sales by weather/day of week.
4. **Staff** — Crew scheduling per location/event, payroll, tip distribution.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Menu Items | Cards | Items with price, photo, modifiers, availability |
| Locations | Calendar | Weekly schedule of truck locations/events |
| Orders | List | Order queue with numbers and status |
| Events | Calendar | Booked events, festivals, catering gigs |
| Inventory | Table | Ingredients prepped per location/event |

**Pipeline Stages:**

```
Event Inquiry -> Quote Sent -> Deposit Received -> Menu Confirmed -> Prep Day -> Event Day -> Invoice/Final Payment -> Review Request
```

**Unique Features:**
- Location schedule publishing (where will you be today/this week)
- GPS-based location sharing with customers
- Offline payment processing (critical for outdoor/event locations)
- Simplified menu management (fewer items, daily changes)
- Event/festival booking and management
- Weather-aware scheduling (plan lighter inventory on rainy days)
- Quick 86 functionality (mark items sold out instantly)
- Per-event inventory planning and prep lists
- Social media integration for daily location announcements
- Catering inquiry management
- Battery-powered, mobile-first POS
- Compact receipt printing or digital receipts

**Payment Model:**
- Mobile POS with offline capability
- Card/tap/mobile wallet primary (many food trucks are cashless)
- Tips (digital tip prompt on POS)
- Catering: deposits + final invoice
- Square Free plan works well for food trucks (no monthly fee, 2.6% + $0.10)

---

## 5. CATERING COMPANY

**Competitors studied:** Total Party Planner, CaterTrax, Toast Catering, HoneyBook

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Event Hosts |
| Services | Menus / Packages |
| Appointments | Events / Tastings |
| Products | Menu Packages / Add-ons |
| Staff | Chefs / Servers / Event Staff |

**Essential Tabs:**

1. **Dashboard** — Upcoming events this week/month, revenue pipeline, proposals pending, deposits due, today's event prep checklist, staff assignments. Total Party Planner shows event-centric dashboard with recipe scaling and financials.
2. **Events** — Event management: date, venue, client, guest count, menu selection, dietary restrictions, timeline, setup requirements, equipment needed, staff assigned. Full event lifecycle management. CaterTrax handles online ordering, event management, and profitability forecasting.
3. **Proposals / Quotes** — Custom proposal builder with menu options, per-person pricing, package tiers, add-ons (rentals, bar service, dessert station), terms and conditions. Total Party Planner auto-adjusts ingredient quantities based on guest count.
4. **Menus** — Menu template library by event type (wedding, corporate, cocktail, buffet, plated), per-person pricing, dietary accommodation options, seasonal menu rotation. Recipe-to-menu linking for accurate costing.
5. **Clients** — Client CRM with event history, preferences, dietary notes, communication log, proposal history. Client portal for reviewing proposals, making payments, submitting preferences. Total Party Planner offers integrated client portal.
6. **Payments** — Deposit collection (typically 25-50% at booking), progress payments, final balance, invoicing, payment tracking. Multiple payment milestones per event.

**Optional Tabs:**

1. **Recipes / Kitchen** — Recipe management with auto-scaling for guest count, prep lists, production schedules, ingredient aggregation across events, shopping lists. Total Party Planner's recipe engine auto-adjusts quantities.
2. **Staff** — Event staffing: assign chefs, servers, bartenders, setup crew per event. Hourly staff scheduling, pay rates by role, staff availability.
3. **Inventory / Purchasing** — Equipment inventory (chafing dishes, linens, china), ingredient purchasing, vendor management, rental tracking.
4. **Reports** — Revenue per event, profit margin per event, popular menu items, client acquisition cost, seasonal trends, staff utilization.
5. **Tastings** — Tasting appointment scheduling, tasting menu management, conversion tracking from tasting to booking.
6. **Logistics** — Delivery scheduling, vehicle/transport management, setup timeline, venue requirements.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Events | Calendar | Events with date, venue, guest count, menu, status |
| Proposals | Pipeline | Proposals with status (draft, sent, viewed, accepted, declined) |
| Menus | Cards | Menu templates by event type with per-person pricing |
| Recipes | Table | Recipes with scaling, ingredients, cost per serving |
| Clients | Table | Client profiles with event history, preferences |
| Tastings | Calendar | Tasting appointments with menu selections |
| Staff Assignments | Calendar | Per-event staff scheduling |

**Pipeline Stages:**

```
Inquiry -> Consultation / Tasting -> Proposal Sent -> Proposal Viewed -> Revisions -> Accepted / Contract Signed -> Deposit Received -> Menu Finalized -> Prep / Shopping -> Event Day -> Final Invoice -> Paid -> Review Request
```

**Unique Features:**
- Auto-scaling recipes based on guest count
- Per-person pricing with multiple package tiers
- Event timeline management (setup, service, breakdown)
- Multi-event production calendar (prep schedules when multiple events overlap)
- Tasting management and booking
- Venue and logistics coordination
- Equipment inventory and rental tracking
- BEO (Banquet Event Order) generation
- Client portal for menu selection and payment
- Dietary restriction aggregation per event (3 vegan, 2 GF, etc.)
- Staff assignment and hourly tracking per event
- Total Party Planner pricing: $99-399/month + $299 setup

**Payment Model:**
- Deposit at booking (25-50% of event total)
- Progress payment milestones (e.g., 30 days before, final count payment)
- Final balance due before or day-of event
- Invoicing with net terms for corporate accounts
- Per-person pricing is standard ($25-200+ per guest depending on service level)
- Total Party Planner starts at $99/month

---

## 6. BAR / LOUNGE / NIGHTCLUB

**Competitors studied:** Toast, Lightspeed, Square, Lavu, Rezku

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Guests / Patrons |
| Services | Drinks / Menu |
| Appointments | Reservations / VIP Bookings |
| Products | Cocktails / Beverages / Bottle Service |
| Staff | Bartenders / Servers / Security / Promoters |

**Essential Tabs:**

1. **Dashboard** — Tonight's revenue, drink sales by category, tab count, average tab size, staff on shift, capacity count (critical for nightclubs), VIP reservations. Real-time view for busy nights.
2. **Menu / Drinks** — Cocktail menu, beer/wine/spirits list, food menu (if applicable), pricing, happy hour pricing with auto-switch, seasonal/featured cocktails. Lightspeed supports multiple menus assigned to specific devices and shifts.
3. **Tabs** — Tab management is the centerpiece: open/close tabs, pre-authorize credit cards, transfer tabs between bartenders, split tabs, add items across visits, close-out reminders. Lightspeed resolved 95% of billing disputes in under 2 minutes with time-stamped order logs.
4. **Payments** — Fast checkout, pre-authorization, split payments, automatic gratuity for large parties, cash handling, end-of-night settlement. Tab pre-auth prevents walkouts.
5. **Inventory** — Liquor inventory (by bottle/pour), beer (keg tracking, tap rotation), wine (by bottle), bar supplies. Pour cost tracking (target: 18-24%). Real-time deductions as items sell. Par level alerts.
6. **Staff** — Bartender scheduling, tip pooling (front bar, service bar, servers, barbacks), security staffing for events, promoter tracking, certifications (alcohol serving).

**Optional Tabs:**

1. **Events** — DJ/live music booking, theme nights, private events, bottle service packages, VIP table reservations, event cover charges.
2. **VIP / Bottle Service** — VIP table management, bottle service packages with pricing, minimum spend requirements, VIP guest lists, table reservations.
3. **Marketing** — Event promotion, happy hour specials, ladies' night promotions, social media scheduling, email/SMS to regulars.
4. **Reports** — Revenue by hour/night, drink cost analysis, pour cost percentage, staff performance, peak hours, event night vs regular night comparison.
5. **Security** — Capacity management, ID scanning, incident logging, guest blacklist.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Tabs | List | Open tabs with items, pre-auth amount, bartender |
| Drinks | Table | Menu with category, price, pour cost, happy hour price |
| Inventory (Liquor) | Table | Bottles/kegs with stock, par, pour cost |
| Events | Calendar | DJ nights, live music, promotions, private events |
| VIP Tables | Cards | VIP reservations with min spend, bottle selection |
| Staff | Table | Bartenders, servers, security with schedule and tips |

**Pipeline Stages:**

```
Walk-in / Reservation -> Seated/At Bar -> Tab Opened -> Drinks Ordered -> Tab Running -> Close Tab -> Tip Added -> Settled
```

**Unique Features:**
- Tab management with pre-authorization (hold card, no physical card retention)
- Pour cost tracking by spirit/cocktail
- Happy hour auto-pricing (time-based price switching)
- Bottle service / VIP table management with minimum spend
- Capacity management and door count (nightclub legal requirement)
- Keg tracking with pour count and tap rotation
- Event cover charge / door list management
- Promoter tracking (guest list attribution)
- Speed-focused ordering (bartender shortcuts, favorites)
- ID scanning integration for age verification
- Incident logging (security)
- Lightspeed Bar POS starts at $89/month

**Payment Model:**
- Tab-based (open tab with pre-auth, close at end of visit)
- Cash and card
- Auto-gratuity for large parties (18-20%)
- Bottle service with minimum spend
- Cover charges for events
- Happy hour pricing (time-based automatic discounts)
- Tip pooling (bartenders, barbacks, servers)

---

## 7. JUICE BAR / SMOOTHIE SHOP

**Competitors studied:** Square, Clover, Toast, SumUp, Orderific

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Customers / Health Enthusiasts |
| Services | Drinks / Bowls / Cleanses |
| Appointments | N/A (walk-in focused) |
| Products | Smoothies / Juices / Bowls / Cleanses |
| Staff | Team Members |

**Essential Tabs:**

1. **Dashboard** — Daily sales, transaction count, top-selling items, ingredient stock alerts, loyalty program stats, online order queue. Peak hours visualization.
2. **Menu** — Smoothies, fresh juices, acai bowls, wellness shots, cleanses, food items. Heavy modifier system: add protein, add spirulina, substitute almond milk, extra banana, boost options. Seasonal menu rotation. Clover's drag-and-drop menu editor handles complex modifiers well.
3. **Orders** — Walk-in queue, mobile/online pickup orders, order numbering system. Speed-focused like coffee shops but with more complex customization per order.
4. **Payments** — Quick checkout with tap/mobile wallet, loyalty redemption, gift cards. Digital tip prompt.
5. **Inventory** — Perishable ingredient tracking (fresh fruits, vegetables, proteins, supplements), shelf life alerts (critical for fresh produce), supplier orders, waste tracking. Track each ingredient down to the ounce (Clover integration).
6. **Loyalty** — Points or stamps program, cleanse program subscriptions, VIP tier for frequent customers, birthday rewards.

**Optional Tabs:**

1. **Cleanses / Programs** — Multi-day juice cleanse packages (3-day, 5-day, 7-day), subscription programs, dietary programs, prep and delivery scheduling for cleanses.
2. **Online Ordering** — Order-ahead for pickup, cleanse program ordering, subscription management.
3. **Marketing** — Health-focused content, seasonal menu promotions, cleanse challenge campaigns, new superfood announcements.
4. **Retail** — Supplements, protein powders, branded merchandise, health snacks.
5. **Reports** — Item popularity, ingredient cost analysis, waste percentage (critical for perishables), peak hours.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Menu Items | Cards | Drinks/bowls with ingredients, modifiers, pricing |
| Orders | List | Order queue with customizations and status |
| Customers | Table | Regulars with loyalty points, favorites, dietary prefs |
| Inventory | Table | Perishable ingredients with stock, shelf life, vendor |
| Cleanse Programs | Cards | Multi-day programs with daily juice selections |

**Pipeline Stages:**

```
Walk-in / Online Order -> Customization -> Payment -> Preparation -> Ready -> Picked Up
```

**Unique Features:**
- Heavy modifier/customization system (add-ons, substitutions, boosts)
- Perishable inventory management with shelf life tracking
- Juice cleanse program management (multi-day packages)
- Subscription programs for regular customers
- Nutritional information display per item
- Allergen flagging (nut-free, dairy-free important for health-conscious customers)
- Prep batch planning (daily juice prep quantities)
- Waste tracking (critical for fresh produce margins)
- Health/wellness branding throughout experience
- Average ticket: $8-15

**Payment Model:**
- Quick-service POS (counter service)
- Tap/card/mobile wallet (speed priority)
- Loyalty redemption
- Gift cards
- Subscription billing for cleanse/delivery programs
- Tips (digital prompt)

---

## 8. MEAL PREP SERVICE

**Competitors studied:** Sprwt, GoPrep, Bottle, HappyMealPrep, MealTrack

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Subscribers / Customers |
| Services | Meal Plans / Menus |
| Appointments | Delivery Windows / Pickup Times |
| Products | Meals / Plans |
| Staff | Chefs / Kitchen Staff / Drivers |

**Essential Tabs:**

1. **Dashboard** — Active subscribers, orders this week, meals to produce, delivery routes today, revenue, churn rate, new sign-ups. Sprwt dominates with production-to-delivery analytics.
2. **Menu / Meals** — Weekly rotating menu, meal categories (protein, low-carb, vegan, paleo, keto), nutritional info (calories, macros), allergens, portion sizes, pricing per meal or per plan. Sprwt's menu builder auto-calculates nutritional info.
3. **Orders / Subscriptions** — Subscription management (weekly, bi-weekly), one-time orders, order customization (swap meals, add extras, skip weeks), order cutoff dates, meal selection deadlines. GoPrep handles both subscriptions and one-time orders.
4. **Production** — Kitchen production reports: total meals per recipe, ingredient aggregation across all orders, prep schedules, batch cooking plans, packing slips per order. This is the operational core of a meal prep business.
5. **Delivery** — Route optimization, delivery zone management, driver assignment, delivery time windows, tracking, proof of delivery. Sprwt uses AI-powered route optimization.
6. **Payments** — Subscription billing (weekly/monthly auto-charge), one-time order payment, failed payment recovery, refunds for skipped weeks.

**Optional Tabs:**

1. **Inventory / Shopping** — Ingredient shopping lists auto-generated from orders, vendor management, purchase orders, inventory tracking, waste tracking.
2. **Customers** — Customer profiles with dietary preferences, allergies, subscription plan, order history, delivery address, communication preferences. Personalization is key for retention.
3. **Marketing** — Referral programs, win-back campaigns for churned subscribers, new menu announcements, promotional codes.
4. **Reports** — Subscriber growth/churn, revenue per meal, most popular meals, delivery efficiency, production cost analysis, customer lifetime value.
5. **Packaging** — Label generation (nutritional facts, ingredients, allergens, reheating instructions), packing slip management.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Meals | Cards | Individual meals with photo, macros, allergens, price |
| Subscriptions | Table | Active subscribers with plan, frequency, delivery day |
| Orders | Table | Weekly orders aggregated by customer and meal |
| Production Plan | Calendar | Daily/weekly production schedule with quantities |
| Delivery Routes | List | Optimized routes with drivers, addresses, time windows |
| Ingredients | Table | Shopping list aggregated from all orders |

**Pipeline Stages:**

```
Website Visit -> Free Trial / First Order -> Subscription Started -> Active Subscriber -> At-Risk (Skipping) -> Paused -> Cancelled -> Win-Back Campaign
```

**Unique Features:**
- Subscription management with skip/pause/cancel
- Weekly menu rotation with customer selection
- Auto-aggregated production reports (total meals to cook)
- Auto-generated shopping lists from orders
- Route optimization for delivery
- Nutritional label generation
- Dietary preference matching (keto, vegan, paleo, GF, etc.)
- Macro tracking per meal (calories, protein, carbs, fat)
- Order cutoff management (order by Wednesday for Monday delivery)
- Customer meal preferences learning over time
- Packaging and labeling automation
- Sprwt pricing: starts ~$100/month; GoPrep and Bottle offer custom pricing

**Payment Model:**
- Subscription billing (auto-charge weekly or monthly)
- Per-meal pricing ($8-15/meal typical)
- Plan pricing (5 meals/week, 10 meals/week, etc.)
- One-time orders available
- Failed payment recovery and dunning
- Promotional codes and first-order discounts
- Referral credits

---

## 9. COMPETITOR COMPARISON

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **Toast** | Full-service restaurants | $69/mo | All-in-one restaurant OS, $0 commission online ordering, Toast Tables for reservations |
| **Square for Restaurants** | Cafes, small restaurants | Free (Plus: $49/mo) | Free plan with unlimited devices, online ordering included, easy setup |
| **TouchBistro** | iPad-based restaurants | $69/mo | Hybrid (works offline), kitchen display system, iPad-native |
| **7shifts** | Restaurant scheduling | $34.99/mo/location | Scheduling-focused, saves 4 hrs/week, tip management, labor cost forecasting |
| **MarketMan** | Restaurant inventory | Custom pricing | AI recipe management, real-time COGS, vendor portal, multi-location HQ |
| **BentoBox** | Restaurant websites | $79/mo | Marketing-first website platform, SEO, events, integrated ordering |
| **Popmenu** | Restaurant marketing | ~$300/mo | AI marketing, dynamic menus, review management, SEO |
| **ChowNow** | Online ordering | $199/mo | Commission-free ordering, branded app, saves $16K/year vs third-party |
| **CakeBoss** | Home bakers | $149 first year | Recipe costing, 120+ preloaded ingredients, order tracking, affordable |
| **Arryved** | Breweries/taprooms | Custom | Built for craft beverage, QR ordering, flight management, self-pour |
| **Lightspeed** | Bars, multi-concept | $89/mo | Advanced inventory, bar tab management, multi-menu, analytics |
| **Total Party Planner** | Catering | $99-399/mo | Auto-scaling recipes, event BEOs, client portal, proposal builder |
| **CaterTrax** | Large-scale catering | Custom | Online ordering portal, production management, multi-location |
| **Sprwt** | Meal prep companies | ~$100/mo | Production automation, route optimization, subscription management |

**Red Pine Gaps/Opportunities:**
- Most F&B platforms are POS-first; Red Pine can be operations-first (scheduling, staff, inventory, marketing) with POS integration via Stripe
- No single platform handles the full F&B spectrum (restaurant + food truck + catering)
- Toast is the closest to all-in-one but expensive and restaurant-only
- Loyalty programs are fragmented across separate platforms
- Review management is usually an add-on, not built-in
- Menu management + website + online ordering in one platform is rare (BentoBox comes closest)

---

## 10. TEMPLATE CONFIG RECOMMENDATIONS

### Restaurant (Full Service)

```typescript
{
  templateId: 'restaurant',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Guests',
    services: 'Menu',
    appointments: 'Reservations',
    staff: 'Team',
    products: 'Menu Items'
  },
  portalConfig: {
    primaryAction: 'make_reservation',
    bookingMode: 'reservation',
    chatProminence: 'low',
    reviewPrompt: 'after_visit',
    preferenceFields: ['dietary_restrictions', 'seating_preference', 'occasion', 'party_size', 'favorite_dishes']
  },
  essentialTabs: ['dashboard', 'menu', 'orders', 'reservations', 'staff', 'payments'],
  optionalTabs: ['inventory', 'online_ordering', 'marketing', 'reviews', 'catering', 'reports'],
  defaultView: { menu: 'table', reservations: 'calendar', orders: 'list', staff: 'table' },
  pipelineStages: ['reservation_request', 'confirmed', 'seated', 'order_placed', 'served', 'check_presented', 'paid', 'review_requested'],
  paymentModel: 'pos_with_tips',
  bookingFlow: 'reservation_or_walkin'
}
```

### Cafe / Coffee Shop

```typescript
{
  templateId: 'cafe',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Customers',
    services: 'Menu',
    appointments: null,
    staff: 'Baristas',
    products: 'Drinks & Food'
  },
  portalConfig: {
    primaryAction: 'order_ahead',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['favorite_drink', 'milk_preference', 'dietary_restrictions', 'loyalty_tier']
  },
  essentialTabs: ['dashboard', 'menu', 'orders', 'payments', 'loyalty', 'staff'],
  optionalTabs: ['inventory', 'online_ordering', 'marketing', 'retail', 'reports'],
  defaultView: { menu: 'cards', orders: 'list', staff: 'table' },
  pipelineStages: ['order_placed', 'preparing', 'ready', 'completed'],
  paymentModel: 'quick_service_pos',
  bookingFlow: 'walk_in_or_order_ahead'
}
```

### Bakery

```typescript
{
  templateId: 'bakery',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Customers',
    services: 'Products',
    appointments: 'Custom Orders',
    staff: 'Bakers',
    products: 'Baked Goods'
  },
  portalConfig: {
    primaryAction: 'place_custom_order',
    bookingMode: 'order_based',
    chatProminence: 'medium',
    reviewPrompt: 'after_pickup',
    preferenceFields: ['dietary_restrictions', 'favorite_items', 'allergens', 'order_frequency']
  },
  essentialTabs: ['dashboard', 'orders', 'products', 'recipes', 'inventory', 'payments'],
  optionalTabs: ['production', 'wholesale', 'marketing', 'catering', 'reports'],
  defaultView: { orders: 'calendar', products: 'cards', recipes: 'table', inventory: 'table' },
  pipelineStages: ['inquiry', 'consultation', 'quote_sent', 'deposit_received', 'in_production', 'decorating', 'ready', 'completed'],
  paymentModel: 'deposit_plus_balance',
  bookingFlow: 'custom_order_or_walkin'
}
```

### Food Truck

```typescript
{
  templateId: 'food_truck',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Customers',
    services: 'Menu',
    appointments: 'Locations',
    staff: 'Crew',
    products: 'Menu Items'
  },
  portalConfig: {
    primaryAction: 'find_truck',
    bookingMode: 'none',
    chatProminence: 'medium',
    reviewPrompt: 'after_visit',
    preferenceFields: ['favorite_items', 'preferred_location', 'dietary_restrictions']
  },
  essentialTabs: ['dashboard', 'menu', 'orders', 'locations', 'payments', 'inventory'],
  optionalTabs: ['events', 'marketing', 'reports', 'staff'],
  defaultView: { menu: 'cards', orders: 'list', locations: 'calendar', events: 'calendar' },
  pipelineStages: ['event_inquiry', 'quote_sent', 'deposit_received', 'menu_confirmed', 'event_day', 'invoiced', 'paid'],
  paymentModel: 'mobile_pos',
  bookingFlow: 'walk_up_or_event_booking'
}
```

### Catering Company

```typescript
{
  templateId: 'catering',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Clients',
    services: 'Menus / Packages',
    appointments: 'Events',
    staff: 'Event Staff',
    products: 'Menu Packages'
  },
  portalConfig: {
    primaryAction: 'request_quote',
    bookingMode: 'event_based',
    chatProminence: 'high',
    reviewPrompt: 'after_event',
    preferenceFields: ['event_type', 'guest_count', 'dietary_restrictions', 'budget_range', 'service_style', 'venue']
  },
  essentialTabs: ['dashboard', 'events', 'proposals', 'menus', 'clients', 'payments'],
  optionalTabs: ['recipes', 'staff', 'inventory', 'reports', 'tastings', 'logistics'],
  defaultView: { events: 'calendar', proposals: 'pipeline', menus: 'cards', clients: 'table' },
  pipelineStages: ['inquiry', 'consultation', 'proposal_sent', 'revision', 'accepted', 'deposit_received', 'menu_finalized', 'prep', 'event_day', 'final_invoice', 'paid', 'review_requested'],
  paymentModel: 'milestone_deposits',
  bookingFlow: 'inquiry_to_event'
}
```

### Bar / Lounge / Nightclub

```typescript
{
  templateId: 'bar',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Guests',
    services: 'Drinks',
    appointments: 'Reservations',
    staff: 'Bartenders',
    products: 'Beverages'
  },
  portalConfig: {
    primaryAction: 'view_events',
    bookingMode: 'vip_reservation',
    chatProminence: 'low',
    reviewPrompt: 'after_visit',
    preferenceFields: ['favorite_drinks', 'vip_status', 'preferred_seating']
  },
  essentialTabs: ['dashboard', 'menu', 'tabs', 'payments', 'inventory', 'staff'],
  optionalTabs: ['events', 'vip', 'marketing', 'reports', 'security'],
  defaultView: { menu: 'table', tabs: 'list', inventory: 'table', events: 'calendar' },
  pipelineStages: ['walk_in', 'tab_opened', 'drinks_ordered', 'tab_running', 'close_tab', 'settled'],
  paymentModel: 'tab_based_pos',
  bookingFlow: 'walk_in_or_vip_reservation'
}
```

### Juice Bar / Smoothie Shop

```typescript
{
  templateId: 'juice_bar',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Customers',
    services: 'Menu',
    appointments: null,
    staff: 'Team',
    products: 'Drinks & Bowls'
  },
  portalConfig: {
    primaryAction: 'order_ahead',
    bookingMode: 'none',
    chatProminence: 'low',
    reviewPrompt: 'after_purchase',
    preferenceFields: ['dietary_goals', 'favorite_items', 'allergens', 'protein_preference']
  },
  essentialTabs: ['dashboard', 'menu', 'orders', 'payments', 'inventory', 'loyalty'],
  optionalTabs: ['cleanses', 'online_ordering', 'marketing', 'retail', 'reports'],
  defaultView: { menu: 'cards', orders: 'list', inventory: 'table' },
  pipelineStages: ['order_placed', 'customized', 'preparing', 'ready', 'picked_up'],
  paymentModel: 'quick_service_pos',
  bookingFlow: 'walk_in_or_order_ahead'
}
```

### Meal Prep Service

```typescript
{
  templateId: 'meal_prep',
  familyId: 'food_beverage',
  labelOverrides: {
    clients: 'Subscribers',
    services: 'Meal Plans',
    appointments: 'Deliveries',
    staff: 'Kitchen Staff',
    products: 'Meals'
  },
  portalConfig: {
    primaryAction: 'select_meals',
    bookingMode: 'subscription',
    chatProminence: 'medium',
    reviewPrompt: 'weekly',
    preferenceFields: ['dietary_plan', 'allergens', 'calorie_target', 'protein_preference', 'meals_per_week', 'delivery_day']
  },
  essentialTabs: ['dashboard', 'menu', 'subscriptions', 'production', 'delivery', 'payments'],
  optionalTabs: ['inventory', 'customers', 'marketing', 'reports', 'packaging'],
  defaultView: { menu: 'cards', subscriptions: 'table', production: 'calendar', delivery: 'list' },
  pipelineStages: ['trial', 'subscribed', 'active', 'at_risk', 'paused', 'cancelled', 'win_back'],
  paymentModel: 'subscription_billing',
  bookingFlow: 'subscription_with_weekly_selection'
}
```

---

## Sources

- Toast POS: https://pos.toasttab.com/pricing, https://pos.toasttab.com/restaurant-pos
- Square for Restaurants: https://squareup.com/us/en/point-of-sale/restaurants
- TouchBistro: https://www.touchbistro.com/pricing/
- 7shifts: https://www.7shifts.com/pricing/
- MarketMan: https://www.marketman.com/
- BentoBox: https://www.getbento.com/pricing/
- Popmenu: https://get.popmenu.com/pricing
- ChowNow: https://get.chownow.com/pricing/
- CakeBoss: https://cakeboss.com/
- Arryved: https://arryved.com/
- Lightspeed Bar POS: https://www.lightspeedhq.com/pos/restaurant/bar-pos-system/
- Total Party Planner: https://totalpartyplanner.com/pricing/
- CaterTrax: https://www.catertrax.com/
- Sprwt: https://sprwt.io/
- GoPrep: https://www.goprep.com/
