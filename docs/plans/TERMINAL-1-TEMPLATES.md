# TERMINAL 1 — Template Families + Registry
## Scope: Write 8 template families + update registry with ~80 business type aliases

**YOU OWN THESE FILES (create/modify only these):**
- `dashboard/src/lib/onboarding/templates/health-wellness.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/food-beverage.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/home-field-services.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/professional-services.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/creative-events.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/education-childcare.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/automotive.ts` (CREATE)
- `dashboard/src/lib/onboarding/templates/retail.ts` (CREATE)
- `dashboard/src/lib/onboarding/registry.ts` (MODIFY — add aliases for all families)

**DO NOT TOUCH:** Any component files, API routes, views, or other lib files.

---

## PATTERN TO FOLLOW

Read `dashboard/src/lib/onboarding/templates/beauty-body.ts` (570 lines) — this is your exact pattern. Every template file must:

1. Export the same TypeScript interfaces: `TemplateComponent`, `TemplateTab`, `TemplateConfig`, `TemplateResult`
2. Export a `Set` of all business types in the family (e.g., `HEALTH_WELLNESS_TYPES`)
3. Export a `Record<string, TemplateConfig>` with enterprise-first templates per business type
4. Export a getter function (e.g., `getHealthWellnessTemplate(businessType)`) that returns `TemplateResult | null`
5. Each template has 5-8 tabs with components using the correct view types
6. Components can be `_locked` (can't be removed by AI), `_removable` (AI can remove), or `_auto_progress` (auto-moves)
7. Pipeline components need `stages` array with stage names

## AVAILABLE VIEWS
- `'table'` — for lists (clients, invoices, products, inventory)
- `'calendar'` — for time-based (appointments, schedules, classes)
- `'pipeline'` — for progression (leads, jobs, patient intake)
- `'cards'` — for visual (staff, projects, equipment, reviews)
- `'list'` — for simple lists (todos, messages, notes)

## RESEARCH FILES (read these for each family)
- `research-results/17-health-wellness-templates.md` → health-wellness.ts
- `research-results/18-food-beverage-templates.md` → food-beverage.ts
- `research-results/19-home-services-templates.md` → home-field-services.ts
- `research-results/20-professional-services-templates.md` → professional-services.ts
- `research-results/21-creative-events-templates.md` → creative-events.ts
- `research-results/22-education-childcare-templates.md` → education-childcare.ts
- `research-results/23-automotive-retail-templates.md` → automotive.ts AND retail.ts

## BUSINESS TYPES PER FAMILY

### health-wellness.ts (10 types)
`gym`, `yoga_studio`, `pilates_studio`, `personal_trainer`, `nutritionist`, `chiropractor`, `physical_therapy`, `therapy_practice`, `massage_therapy`, `acupuncture`

### food-beverage.ts (8 types)
`restaurant`, `cafe`, `bakery`, `food_truck`, `catering`, `bar_lounge`, `juice_bar`, `meal_prep`

### home-field-services.ts (10 types)
`plumber`, `electrician`, `hvac`, `landscaper`, `cleaning_service`, `pest_control`, `handyman`, `roofing`, `painter`, `moving_company`

### professional-services.ts (8 types)
`law_firm`, `accounting`, `consultant`, `real_estate`, `insurance`, `marketing_agency`, `architecture`, `financial_advisor`

### creative-events.ts (8 types)
`photographer`, `videographer`, `dj_entertainer`, `event_planner`, `florist`, `wedding_planner`, `interior_designer`, `graphic_designer`

### education-childcare.ts (8 types)
`tutoring`, `music_school`, `dance_studio`, `daycare`, `driving_school`, `language_school`, `martial_arts`, `swim_school`

### automotive.ts (6 types)
`auto_repair`, `auto_detailing`, `car_wash`, `tire_shop`, `body_shop`, `towing`

### retail.ts (7 types)
`boutique`, `jewelry_store`, `thrift_store`, `pet_store`, `gift_shop`, `smoke_shop`, `bookstore`

## REGISTRY UPDATE

After all template files are created, update `registry.ts`:

1. Import all 8 getter functions
2. Add alias records for each family (same pattern as `BEAUTY_BODY_ALIASES`)
3. Update `TemplateFamily` type to include all 9 families
4. Update `detectTemplateType()` to check all alias records
5. Update `getTemplate()` to dispatch to correct getter

**Label overrides per research** (important!):
- Healthcare: "Patients" not "Clients"
- Gyms: "Members" not "Clients"
- Education: "Students" not "Clients", "Guardians" as secondary
- Restaurants: "Guests" not "Clients", "Menu" not "Services"
- Home services: "Jobs" not "Appointments", "Properties" not "Clients"
- Legal: "Cases" not "Projects"
- Real estate: "Listings" not "Products"

## EFFICIENCY TIP
Use background agents — you can write 2-3 template files in parallel since they're independent files with no shared state. Read the research file, follow the beauty-body pattern, write the template.

## WHEN DONE
Update `memory/MEMORY.md` to reflect that all 9 template families are complete (~90 business types covered).
