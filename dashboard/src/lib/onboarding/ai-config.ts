/**
 * AI config generation functions for onboarding.
 * Ported from onboarding/app.py — analyze_business, analyze_with_template, generate_website_copy.
 * Uses raw fetch to Anthropic Messages API (matching existing /api/chat pattern).
 */

import type { RawConfig } from './validation';
import type { WebsiteCopy } from './website-sections';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Remove markdown code fences (```json ... ```) from AI output. */
function stripCodeBlocks(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json?\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  return cleaned;
}

/** Minimal Anthropic Messages API caller. Throws on HTTP errors. */
async function callAnthropic({
  model,
  maxTokens,
  system,
  messages,
}: {
  model: string;
  maxTokens: number;
  system?: string;
  messages: { role: string; content: string }[];
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages,
  };
  if (system) body.system = system;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ── analyzeWithTemplate ──────────────────────────────────────────────────

/**
 * Use AI to customize a template for a specific business.
 * Much shorter prompt than analyzeBusiness since the template provides the skeleton.
 * Ported from app.py lines 406-461.
 */
export async function analyzeWithTemplate(
  description: string,
  template: Record<string, unknown>,
  businessType: string,
): Promise<RawConfig> {
  console.log(`Template path: customizing ${businessType} template`);

  const templateJson = JSON.stringify(template, null, 2);

  const prompt = `You are customizing a business platform template for a specific business.

Business description: ${description}
Business type: ${businessType}

Here is the starting template (JSON):
${templateJson}

Your job is to CUSTOMIZE this template for the specific business described above. Return ONLY valid JSON.

## RULES:
1. **NEVER remove components with "_locked": true** — these are essential and must stay
2. **You CAN remove tabs marked "_removable": true** if the business is solo (no staff/team mentioned)
3. **Customize labels** to match the business (e.g. "Staff" → "Barbers", "Clients" → "Pets & Owners")
4. **Add components** the user specifically mentioned that aren't in the template
5. **Remove unlocked components** the user clearly doesn't need
6. **Keep the tab structure** — don't reorganize tabs, just add/remove within them
7. **Set pipeline stages** if the user described specific progression (belt ranks, loyalty tiers, etc.)
8. **Extract the business name** from the description — keep it in the SAME LANGUAGE the user wrote in
9. **Tab and component labels should be in English** — the dashboard UI is English, only business_name stays in the user's language

## OUTPUT FORMAT:
Return the FULL config as JSON (same structure as template):
{
    "business_name": "extracted business name",
    "business_type": "${businessType}",
    "tabs": [ ... customized tabs ... ],
    "summary": "one sentence about what was configured"
}

Do NOT include "colors" — colors are handled separately.
Keep "_locked" and "_removable" flags on components — they'll be stripped later.
Every component MUST have a "view" field.`;

  const rawResponse = await callAnthropic({
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  console.log(`Template customization response: ${rawResponse.slice(0, 200)}...`);

  const cleaned = stripCodeBlocks(rawResponse);
  return JSON.parse(cleaned) as RawConfig;
}

// ── analyzeBusiness ──────────────────────────────────────────────────────

/**
 * Full AI config generation from scratch with a comprehensive prompt.
 * Ported from app.py lines 526-1037.
 * The prompt below is copied VERBATIM from the Flask source.
 */
export async function analyzeBusiness(description: string): Promise<RawConfig> {
  console.log(`Analyzing: ${description}`);

  const prompt = `Analyze this business and create a custom dashboard configuration.

Business description: ${description}

LANGUAGE: The description may be in any language. Extract the business_name in the user's original language. All tab labels and component labels should be in English (the dashboard UI is English).

Return ONLY valid JSON (no markdown, no code blocks):
{
    "business_name": "extracted or generated name",
    "business_type": "barber, barbershop, salon, hair_salon, nail_salon, lash_brow, makeup_artist, med_spa, landscaping, restaurant, cafe, retail, fitness, auto, cleaning, photography, tutoring, pet_grooming, dental, construction, real_estate, freelancer, martial_arts, legal, professional, accounting, consulting, medical, veterinary, plumbing, electrical, catering, event_planning, hotel, spa, bakery, florist, daycare, moving, pest_control, hvac, roofing, tattoo, music_studio, dance_studio, yoga, crossfit, coworking, property_management, insurance, recruiting, other",
    "colors": {
        "sidebar_bg": "#1A1A2E",
        "sidebar_icons": "#A0AEC0",
        "sidebar_buttons": "#3B82F6",
        "sidebar_text": "#E2E8F0",
        "background": "#F5F5F5",
        "buttons": "#3B82F6",
        "cards": "#FFFFFF",
        "text": "#1A1A1A",
        "headings": "#111827",
        "borders": "#E5E7EB"
    },
    "tabs": [
        {
            "id": "tab_1",
            "label": "Dashboard",
            "icon": "home",
            "components": [{ "id": "calendar", "label": "Today", "view": "calendar" }]
        },
        ... more tabs (each component MUST include "view" field) ...
    ],
    "summary": "one sentence describing what was configured"
}

## COLOR GENERATION RULES

Generate a cohesive color palette that matches the business personality. The sidebar_bg is the dominant brand color.

**Industry color guidance:**
- Barber/tattoo/auto: Dark & bold — sidebar_bg: #1A1A2E or #0F172A, buttons: electric blue/red
- Salon/spa/yoga: Soft & elegant — sidebar_bg: #2D2B3D or #1E293B, buttons: rose/purple/teal
- Medical/dental: Clean & trustworthy — sidebar_bg: #1E3A5F or #0F4C81, buttons: #3B82F6 blue
- Landscaping/garden: Natural & earthy — sidebar_bg: #1B4332 or #14532D, buttons: #22C55E green
- Restaurant/bakery/cafe: Warm & inviting — sidebar_bg: #3C1518 or #1C1917, buttons: #F59E0B amber
- Construction/electrical/plumbing: Industrial & sturdy — sidebar_bg: #1E293B or #0C1222, buttons: #F59E0B or #EF4444
- Legal/accounting/consulting: Professional & refined — sidebar_bg: #1E293B or #0F172A, buttons: #6366F1 indigo
- Fitness/martial arts/crossfit: Energetic & bold — sidebar_bg: #0F172A or #1A1A2E, buttons: #EF4444 red or #F97316 orange
- Photography/creative: Modern & minimal — sidebar_bg: #18181B or #1C1917, buttons: #8B5CF6 purple
- Real estate: Sophisticated — sidebar_bg: #1E293B, buttons: #0EA5E9 sky blue
- Retail: Inviting & commercial — sidebar_bg: #1E1B4B or #0F172A, buttons: #8B5CF6 or #EC4899
- Pet/vet: Friendly & warm — sidebar_bg: #1E3A3A or #164E63, buttons: #14B8A6 teal
- Events/catering: Celebratory — sidebar_bg: #2D1B4E or #1E1B4B, buttons: #A855F7 purple or #EC4899 pink
- Moving/cleaning: Dependable — sidebar_bg: #1E293B, buttons: #3B82F6 blue
- Education/tutoring/dance: Inspiring — sidebar_bg: #1E293B or #1B2E4B, buttons: #6366F1 indigo
- Property management: Professional — sidebar_bg: #1E293B, buttons: #0EA5E9

**Rules:**
- NEVER use #ce0707, #DC2626, or #EF4444 as the buttons color — these are generic defaults. Each business MUST get a unique, industry-appropriate accent color from the guidance above.
- sidebar_bg should ALWAYS be dark (near-black with a color tint)
- sidebar_text should ALWAYS be light (#E2E8F0 or #F1F5F9)
- sidebar_icons should be muted light (#A0AEC0 or #94A3B8)
- background should be light gray (#F5F5F5 or #F8FAFC)
- cards should be white (#FFFFFF)
- text should be dark (#1A1A1A or #111827)
- buttons should be the ONE accent color that defines the brand — pick from the industry guidance above, do NOT default to red
- sidebar_buttons should match or complement the buttons color

## VIEW ASSIGNMENT RULES

Every component in a tab MUST have a "view" field. Use these defaults:
- **pipeline**: clients, leads, jobs, workflows, cases, tickets, waivers, memberships (when tracking status flow). Clients should ALWAYS default to pipeline — every business has a client journey (new → active → loyal, belt stages, rewards tiers, etc.). Use "contacts" component with "list" view for the general address book. Memberships pipeline: stages = plan names (e.g. Basic, Premium, VIP), cards = members.
- **calendar**: calendar, appointments, schedules, shifts, classes, reservations, social_media
- **cards**: staff, equipment, fleet, tables, rooms, menus, recipes, courses, packages, venues, portfolios, galleries, listings, images, reviews
- **list**: contacts, todos, messages, notes, announcements, checklists, knowledge, community, chat_widget
- **route**: routes (map view with territory polygons and stop lists — only for field service businesses like landscaping, plumbing, cleaning, pest control, delivery)
- **table**: everything else (products, inventory, invoices, payments, expenses, payroll, estimates, vendors, assets, contracts, documents, uploads, forms, signatures, orders, attendance, inspections, permits, prescriptions, treatments, properties, guests, campaigns, loyalty, surveys, subscriptions, time_tracking, reputation, portal)

## PIPELINE STAGES

When a component uses "view": "pipeline", also include a "stages" array with 3-6 industry-specific stage names.

**clients pipeline stages by industry (REQUIRED — every clients component must have stages):**
- Martial arts: ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]
- Salon/spa: ["New Client", "Regular", "VIP", "Ambassador"]
- Fitness/gym: ["Trial", "New Member", "Active", "Loyal", "Champion"]
- Retail: ["First Purchase", "Returning", "Regular", "Gold Member", "VIP"]
- Restaurant/cafe: ["First Visit", "Returning", "Regular", "Loyalty Member"]
- Real estate: ["Prospect", "Showing", "Offer", "Under Contract", "Closed"]
- Medical/dental: ["New Patient", "Active", "Ongoing Care", "Recall"]
- Contractor/landscaping: ["Estimate", "Scheduled", "In Progress", "Complete", "Recurring"]
- Legal/accounting: ["Prospect", "Onboarding", "Active Client", "Retainer"]
- Pet grooming/vet: ["New Pet", "Regular", "Frequent", "Premium"]
- Photography: ["Inquiry", "Booked", "Shoot Complete", "Delivered"]
- Education/tutoring: ["Enrolled", "In Progress", "Advanced", "Graduated"]
- General: ["New", "Active", "Loyal", "VIP"]

**leads stages by industry:**
- General: ["New", "Contacted", "Qualified", "Proposal", "Won"]
- Contractor: ["Inquiry", "Estimate Sent", "Approved", "Scheduled", "Complete"]
- Salon/fitness: ["Inquiry", "Consulted", "Trial", "Member"]
- Real estate: ["New Lead", "Showing", "Offer", "Under Contract", "Closed"]

**jobs/work orders stages:**
- General: ["New", "In Progress", "Review", "Complete", "Invoiced"]
- Contractor: ["Estimated", "Approved", "Scheduled", "In Progress", "Complete", "Invoiced"]

**cases stages:**
- Legal: ["Filed", "Discovery", "Negotiation", "Trial", "Closed"]
- Recruiting: ["Sourced", "Screening", "Interview", "Offer", "Placed"]

**tickets stages:**
- General: ["New", "In Progress", "Waiting", "Resolved"]

**waivers stages:**
- General: ["Draft", "Sent", "Viewed", "Signed"]

Example component with pipeline:
{ "id": "clients", "label": "Students", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"] }
{ "id": "leads", "label": "Prospects", "view": "pipeline", "stages": ["Inquiry", "Consulted", "Trial", "Member"] }

## COMPONENT REGISTRY (68 components available)

**People - Managing contacts and relationships:**
- clients: Client pipeline — tracks client journey through stages (belt ranks, loyalty tiers, sales stages). Use this for your PRIMARY customer/member/student/patient list.
- contacts: Contact directory — every name, phone number, and email in your CRM. Use this as the general address book alongside the clients pipeline.
- leads: Leads pipeline, prospect tracking, conversion funnel
- staff: Staff cards, employee management, roles
- vendors: Vendor list, supplier contacts, ordering
- guests: Guest list with RSVP status, party size, dietary preferences

**Things - Physical items and inventory:**
- products: Product catalog with SKU, stock levels, pricing
- inventory: Stock tracking, low stock alerts, reorder points
- equipment: Equipment list, maintenance tracking, assignments
- assets: Asset management, depreciation, location tracking
- listings: Property listings with address, price, bedrooms, status
- properties: Rental property management, tenants, leases
- venues: Venue management with capacity, address, amenities

**Time - Scheduling and calendar:**
- calendar: Calendar view (day/week/month), event management
- appointments: Appointment booking, availability, confirmations
- schedules: Schedule grid, recurring events, team schedules
- shifts: Shift scheduler, staff assignments, coverage
- time_tracking: Employee hours, billable time, project tracking

**Money - Financial management:**
- invoices: Invoice creation, tracking, payment status
- payments: Payment processing, transaction history
- expenses: Expense logging, categories, receipts
- payroll: Payroll management, pay periods, deductions
- estimates: Quotes, proposals, estimate-to-invoice conversion
- packages: Service menu — bookable services customers see during booking. Each service has a name, price, and duration
- subscriptions: Recurring subscription management, billing cycles

**Tasks - Work management:**
- todos: Task checklists, due dates, priorities
- jobs: Job cards, work orders, job tracking
- projects: Project boards, milestones, team assignments
- workflows: Workflow automation, process templates
- cases: Legal case management, case tracking, court dates
- checklists: Task checklists with completion tracking, assignees

**Communication - Messaging and notes:**
- messages: Message inbox, client communication
- notes: Notes editor, internal memos
- announcements: Announcement feed, team updates
- reviews: Review management, reputation tracking
- campaigns: Marketing campaigns (email/social/ad), reach, conversions
- loyalty: Loyalty programs, points, tiers, rewards
- surveys: Customer surveys, responses, completion rates
- tickets: Support tickets with priority, status, assignee
- knowledge: FAQ articles, help docs, categories
- community: Member forum, discussions, events
- chat_widget: Website live chat, lead capture, auto-responses
- social_media: Social media scheduling, content calendar, analytics
- reputation: Review aggregation from Google, Yelp, Facebook

**Files - Document management:**
- documents: File manager, folders, sharing
- contracts: Contract management, signatures, renewals
- images: Image gallery, before/after photos
- uploads: Upload manager, file attachments
- portfolios: Portfolio showcase, case studies, project gallery
- galleries: Photo galleries with client access, proofing

**Signing & Compliance:**
- waivers: Waiver templates, digital signatures, print copies, expiry tracking
- forms: Custom forms, intake forms, questionnaires, submissions
- signatures: E-signature tracking, signed documents, countersigning

**Hospitality & Food:**
- reservations: Table/room/resource reservations with date/time
- tables: Restaurant table status (open/occupied/reserved), capacity
- menus: Menu items, categories, pricing, dietary flags
- orders: Order management, customer, items, total, status
- rooms: Room management for hotels/spas/studios, hourly rates
- recipes: Recipe management, ingredients, portions, cost, prep time

**Education & Programs:**
- classes: Class schedules, enrollment, instructors, capacity
- membership_plans: Plan management — name, price, description, features, interval. Use cards view. Always paired with \`memberships\` as sub-tabs.
- memberships: Members pipeline — stages ARE the plans (e.g. Basic, Premium, VIP), cards ARE the members. Move member = change plan. Use pipeline view. Always paired with \`membership_plans\` in a "Memberships" tab.
- courses: Course catalog, modules, duration, progress
- attendance: Check-in logs, participation tracking

**Field Service:**
- inspections: Inspection checklists, inspector, pass/fail results
- routes: Service routes, stops, driver, vehicle, ETAs
- fleet: Vehicle fleet, make/model, mileage, next service
- permits: Building/work permits, authority, status, expiry

**Health & Medical:**
- prescriptions: Medication prescriptions, dosage, frequency, refills
- treatments: Treatment plans, provider, follow-up care

**Digital & Online:**
- client_portal: Client-facing portal for schedule, billing, progress, documents, account

## AVAILABLE ICONS

home, people, box, clock, dollar, check, chat, folder, briefcase, star, tool, calendar, mail, file, target, truck, users, grid, calculator, wallet, edit, megaphone, image, upload, layout, clipboard, archive, rotate, settings, chart, zap, heart, shield, globe, package, book, shopping-cart, map

## INDUSTRY TEMPLATES (use as starting points, customize based on details)

**Barber/Salon:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients, view: pipeline, stages: ["New Client", "Regular", "VIP", "Ambassador"]), loyalty (Rewards)
- Schedule: calendar (Schedule, view: calendar)
- Services: packages (Service Menu, view: cards)
- Staff: staff (Barbers/Stylists), shifts (Shifts, view: table) [if multiple staff]
- Payments: payments (Payments), invoices (Receipts)

**Landscaping:**
- Dashboard: (empty — platform-managed)
- Customers: clients (Customers, view: pipeline, stages: ["Estimate", "Scheduled", "In Progress", "Complete", "Recurring"]), leads (Leads)
- Jobs: calendar (Schedule, view: calendar), jobs (Jobs), estimates (Estimates), routes (Routes)
- Crew: staff (Crew), shifts (Assignments, view: table), equipment (Equipment), fleet (Vehicles)
- Billing: invoices (Invoices), payments (Payments), expenses (Expenses)

**Restaurant/Cafe:**
- Dashboard: (empty — platform-managed)
- Reservations: calendar (Schedule, view: calendar), tables (Table Layout), waitlist (Waitlist)
- Menu: menus (Menu Items), recipes (Recipes), inventory (Inventory)
- Orders: orders (Online Orders), loyalty (Loyalty Program)
- Team: staff (Staff, view: cards), shifts (Shifts, view: table), tip_pools (Tips)
- Finances: payments (Sales), invoices (Invoices), expenses (Expenses), suppliers (Suppliers)

**Martial Arts Studio:**
- Dashboard: (empty — platform-managed)
- Students: clients (Students, view: pipeline, stages: use belt stages user provides e.g. ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]), contacts (Families, view: list)
- Schedule: calendar (Schedule, view: calendar)
- Memberships: membership_plans (Plans, view: cards), memberships (Members, view: pipeline, stages: ["Basic", "Advanced", "Elite", "Cancelled"])
- Programs: classes (Class Types, view: cards), waivers (Waivers, view: pipeline), client_portal (Client Portal)
- Team: staff (Instructors), shifts (Staff Shifts, view: table)
- Billing: payments (Payments), invoices (Invoices)

**Fitness Studio/Gym:**
- Dashboard: (empty — platform-managed)
- Members: clients (Members, view: pipeline, stages: ["Trial", "New Member", "Active", "Loyal", "Champion"]), leads (Prospects)
- Memberships: membership_plans (Plans, view: cards), memberships (Members, view: pipeline, stages: ["Day Pass", "Basic", "Premium", "VIP", "Cancelled"])
- Schedule: calendar (Schedule, view: calendar)
- Programs: classes (Class Types, view: cards), waivers (Waivers), client_portal (Client Portal)
- Team: staff (Trainers), shifts (Staff Schedule, view: table)
- Billing: payments (Payments), invoices (Invoices)

**Real Estate:**
- Dashboard: (empty — platform-managed)
- Leads: leads (Leads), clients (Clients)
- Properties: listings (Listings), properties (Properties), images (Photos)
- Pipeline: jobs (Deals), todos (Tasks)
- Documents: documents (Documents), contracts (Contracts), signatures (Signatures)

**Freelancer/Consultant:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Prospects), client_portal (Client Portal)
- Projects: projects (Projects), time_tracking (Time Tracking)
- Billing: invoices (Invoices), payments (Payments), estimates (Quotes)
- Files: documents (Documents), contracts (Contracts)

**Retail Store:**
- Dashboard: (empty — platform-managed)
- Products: products (Products), inventory (Inventory), orders (Orders)
- Customers: clients (Customers, view: pipeline, stages: ["First Purchase", "Returning", "Regular", "Gold Member", "VIP"]), leads (Leads), loyalty (Loyalty Program)
- Sales: invoices (Invoices), payments (Payments)
- Staff: staff (Staff), shifts (Shifts)

**Auto Shop:**
- Dashboard: (empty — platform-managed)
- Customers: clients (Customers)
- Schedule: calendar (Schedule, view: calendar), jobs (Work Orders)
- Parts: inventory (Parts), products (Products), inspections (Inspections)
- Billing: invoices (Invoices), payments (Payments), estimates (Estimates)

**Cleaning Service:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Leads)
- Jobs: jobs (Jobs), routes (Routes), checklists (Checklists)
- Team: staff (Cleaners), shifts (Assignments), fleet (Vehicles)
- Billing: invoices (Invoices), payments (Payments), subscriptions (Subscriptions)

**Photography/Creative:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Inquiries)
- Schedule: calendar (Schedule, view: calendar)
- Gallery: galleries (Client Galleries), portfolios (Portfolio), images (Photos)
- Business: invoices (Invoices), contracts (Contracts), payments (Payments)

**Tutoring/Education:**
- Dashboard: (empty — platform-managed)
- Students: clients (Students), leads (Inquiries), attendance (Attendance), client_portal (Student Portal)
- Schedule: calendar (Schedule, view: calendar)
- Materials: documents (Curriculum), notes (Session Notes), courses (Courses)
- Memberships: membership_plans (Plans, view: cards), memberships (Enrolled Students, view: pipeline, stages: ["Trial", "Monthly", "Semester", "Annual", "Cancelled"])
- Billing: invoices (Invoices), payments (Payments)

**Pet Grooming/Veterinary:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Pet Parents), notes (Pet Profiles)
- Schedule: calendar (Schedule, view: calendar)
- Medical: treatments (Treatments), prescriptions (Prescriptions) [vet only]
- Team: staff (Groomers/Vets), shifts (Schedule, view: table)
- Payments: payments (Payments), invoices (Receipts)

**Dental/Medical:**
- Dashboard: (empty — platform-managed)
- Patients: clients (Patients), forms (Intake Forms), client_portal (Patient Portal)
- Schedule: calendar (Schedule, view: calendar)
- Clinical: treatments (Treatment Plans), prescriptions (Prescriptions), notes (Notes)
- Records: documents (Records), waivers (Consent Forms), signatures (Signatures)
- Billing: invoices (Invoices), payments (Payments)
- Staff: staff (Staff), shifts (Schedule, view: table)

**Construction/Electrical/Plumbing:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Leads)
- Projects: jobs (Work Orders), schedules (Timeline), estimates (Estimates)
- Resources: staff (Crew), equipment (Equipment), fleet (Vehicles), inventory (Materials)
- Compliance: inspections (Inspections), permits (Permits), checklists (Safety Checklists)
- Billing: invoices (Invoices), payments (Payments), expenses (Expenses)

**Event Planning/Catering:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Inquiries), guests (Guest Lists)
- Events: calendar (Schedule, view: calendar), venues (Venues)
- Vendors: vendors (Vendors), menus (Menus) [catering]
- Business: invoices (Invoices), payments (Payments), contracts (Contracts)

**Legal/Accounting:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Prospects), client_portal (Client Portal)
- Cases: cases (Cases), documents (Documents), contracts (Contracts)
- Work: time_tracking (Time Tracking), todos (Tasks)
- Billing: invoices (Invoices), payments (Payments), estimates (Proposals)

**Hotel/Spa:**
- Dashboard: (empty — platform-managed)
- Guests: clients (Guests), reservations (Reservations, view: table), client_portal (Guest Portal)
- Schedule: calendar (Schedule, view: calendar), rooms (Rooms)
- Services: treatments (Treatments), packages (Packages)
- Staff: staff (Staff), shifts (Shifts, view: table)
- Billing: invoices (Invoices), payments (Payments)

## RULES FOR GOOD CONFIGS

1. **ONE universal calendar — NO redundant sub-tabs.** The calendar component has built-in filter chips (All | Appointments | Classes | Shifts) and a view toggle (calendar/list). It already shows ALL time-based events with color coding (Appointment=blue, Class=purple, Shift=green).
   Do NOT add appointments, classes, shifts, schedules, or reservations as sub-components on the same tab as a calendar — they are REDUNDANT because the calendar already displays them via filter chips.
   Non-time entities (rooms, tables, equipment, venues, jobs) are fine alongside the calendar.
   The ONLY component that should have view: "calendar" is the "calendar" component itself.
   If you need a class-type catalog or shift management, put them on a SEPARATE tab (e.g., Programs for class types, Team for shifts).
   Example for a fitness Schedule tab — just the calendar, nothing else:
   - {"id": "calendar", "label": "Schedule", "view": "calendar"}
2. **ALWAYS start with a Dashboard tab** but with EMPTY components: \`[]\`. Dashboard is platform-managed and will be populated by the system. The AI should include the Dashboard tab entry (for nav) but with no components.
3. **Use 3-5 user tabs** (plus Dashboard = 4-6 total) - small businesses need simplicity
4. **Each tab should have 1-4 components** - don't overwhelm
5. **Use industry-appropriate labels:**
   - Barber: "Clients" not "Customers"
   - Restaurant: "Guests" or "Reservations" not "Clients"
   - Fitness: "Members" not "Clients"
   - Medical: "Patients" not "Clients"
   - Construction: "Projects" not "Jobs"
6. **Solo operators don't need Staff tabs** - only add if they mention employees/team
7. **Match complexity to business size (tab counts EXCLUDE Dashboard):**
   - Solo: 3 tabs + Dashboard = 4 total, 4-6 components
   - Small team (2-5): 4 tabs + Dashboard = 5 total, 6-10 components
   - Larger team: 5-6 tabs + Dashboard = 6-7 total, 8-14 components
8. **Group logically by workflow, not by component category**
9. **Use industry-specific components when relevant:**
   - Restaurant/cafe: reservations, tables, menus, orders, recipes
   - Fitness/martial arts: classes, memberships, waivers, attendance
   - Medical/dental: treatments, prescriptions, forms (intake)
   - Construction/electrical/plumbing: inspections, permits, fleet, checklists
   - Real estate: listings, properties
   - Photography/creative: galleries, portfolios
   - Events/catering: venues, guests, menus
   - Legal: cases, time_tracking
   - Salon/barber: loyalty, packages, galleries (showcase cuts/styles)
   - Nail tech/lash/brows: galleries (showcase work)
   - Tattoo artist: portfolios or galleries (showcase art)
   - Landscaping/cleaning/detailing: galleries (before/after photos)
   - Restaurant/bakery/food truck: galleries (food photos)
   - Florist/wedding planner: galleries (arrangements/events)
   - Interior design/architecture: portfolios (project showcase)
   - Service businesses with vehicles: fleet, routes
10. **Waivers are important for physical activities** - martial arts, fitness, sports, adventure
11. **ALWAYS prefer industry-specific components over generic ones:**
    - Restaurant with food = MUST use menus, recipes (not just products)
    - Hotel with spa = MUST use rooms, treatments (not just appointments)
    - Moving company = MUST use fleet, routes, checklists (not just jobs)
    - Catering = MUST use menus, recipes, guests (not just products, clients)
    - Property mgmt = MUST use properties, inspections (not just clients, tickets)
    - Recruiting = MUST use cases for placements, time_tracking for billing
    - Tattoo/piercing = MUST use waivers, portfolios or galleries
    - Nail tech/lash/brows/salon/barber = MUST use galleries (to showcase work on website)
    - Landscaping/cleaning/auto detailing = MUST use galleries (before/after photos)
    - Restaurant/bakery/food truck = MUST use galleries (food photos)
    - Florist/wedding/event planner = MUST use galleries (arrangements/events)
    - Interior design/architecture = MUST use portfolios (project showcase)
    - Any business that showcases visual work = MUST use galleries or portfolios (connects to website gallery widget automatically)
    - Any business with vehicles/trucks = MUST use fleet
    - Any business with food/cooking = MUST use recipes
    - Any business with class schedules = MUST use classes (not just appointments)
12. **Pipeline stages MUST reflect what the user describes:**
    - If user mentions belt stages (white, yellow, orange, green, blue, brown, black) → use THOSE as stages, not generic CRM stages
    - If user mentions tiers (Bronze, Silver, Gold) → use those
    - If user describes their own process → use their words
    - The system auto-colors stages based on color words in the name (e.g. "White Belt" → white, "Gold Plan" → gold, "Black Belt" → black)
    - Generic CRM stages (New, Active, Loyal, VIP) are ONLY for businesses with no specific progression described
    - ALWAYS include the stages array on pipeline components: {"id": "clients", "label": "Students", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]}
13. **Membership program uses TWO sub-tabs in its own "Memberships" tab:**
    - \`membership_plans\` (label: "Plans", view: cards) — create/manage plans with name, price, description, features
    - \`memberships\` (label: "Members", view: pipeline) — stages = plan names, cards = members
    - ALWAYS give memberships its own tab labeled "Memberships" — never nest inside another tab.
    - Any business with recurring memberships (fitness, martial arts, salon, spa, tutoring, yoga, dance) should use this.
    - Example: {"id": "membership_plans", "label": "Plans", "view": "cards"}, {"id": "memberships", "label": "Members", "view": "pipeline", "stages": ["Basic", "Premium", "VIP", "Cancelled"]}
14. **Kids/family businesses need Families, not Prospects:**
    - Kids martial arts, daycare, tutoring, dance → use contacts as "Families" or "Parents & Guardians" (view: list)
    - Do NOT add leads/prospects pipeline for businesses that primarily serve families with children
    - The parent/guardian is the one paying, signing waivers, and communicating — so family contact info is essential
    - Only add leads/prospects if the user specifically mentions needing a sales pipeline
15. **Client Portal sub-tab for client-facing businesses:**
    - Studios (martial arts, dance, yoga, fitness, boxing, music) → add \`client_portal\` sub-tab in the Programs tab
    - Professional services (legal, accounting, consulting, medical, dental, spa) → add \`client_portal\` sub-tab in the Clients tab
    - DO NOT add portal for: restaurants, cafes, retail, food trucks, bars (no repeat-client portal needed)
    - The portal lets clients view their schedule, billing, progress, documents, and account
    - Example: {"id": "client_portal", "label": "Client Portal", "view": "route"}
16. **Programs tab should default to pipeline view:**
    - Programs represent client journeys (belt progression, membership tiers, course levels)
    - Use pipeline view as the default for the main component in Programs tab
    - Example for martial arts: {"id": "programs", "label": "Programs", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Green Belt", "Blue Belt", "Red Belt", "Black Belt"]}
17. **Maximum 7 user-configured tabs** (+ Dashboard = 8 total). If more are needed, consolidate related functions into one tab with sub-components.
18. **Services + Calendar + Staff family group:**
    - \`packages\` (Service Menu), \`calendar\`, and \`staff\` form a logical unit for appointment-based businesses
    - If a business offers bookable services, ensure it has all three: packages (Service Menu) + calendar + staff
    - The booking flow connects them: customer picks service → picks date/time → optionally picks staff member
    - Appointment-based businesses: salon, barber, spa, med spa, lash/brow, tattoo, pet grooming, massage, dental, chiropractic, photography

## GOOD vs BAD CONFIG EXAMPLES

**GOOD - Solo Barber "Tony's Cuts":**
{
    "tabs": [
        { "id": "tab_1", "label": "Dashboard", "icon": "home", "components": [] },
        { "id": "tab_2", "label": "Clients", "icon": "people", "components": [{ "id": "clients", "label": "Clients", "view": "pipeline" }] },
        { "id": "tab_3", "label": "Schedule", "icon": "calendar", "components": [{ "id": "calendar", "label": "Schedule", "view": "calendar" }] },
        { "id": "tab_4", "label": "Payments", "icon": "dollar", "components": [{ "id": "payments", "label": "Payments", "view": "table" }] }
    ]
}
Why it's good: Simple, 4 tabs, Dashboard empty (platform-managed), ONE calendar on Schedule (no redundant appointments sub-tab), all views explicit.

**BAD - Same barber:**
{
    "tabs": [
        { "id": "tab_1", "label": "People", "icon": "people", "components": [{ "id": "clients", "label": "Clients" }, { "id": "leads", "label": "Leads" }, { "id": "staff", "label": "Staff" }, { "id": "vendors", "label": "Vendors" }] },
        { "id": "tab_2", "label": "Money", "icon": "dollar", "components": [{ "id": "invoices", "label": "Invoices" }, { "id": "payments", "label": "Payments" }, { "id": "expenses", "label": "Expenses" }, { "id": "payroll", "label": "Payroll" }, { "id": "estimates", "label": "Estimates" }] }
    ]
}
Why it's bad: Generic labels, too many components, includes Staff/Payroll for a solo barber, no Dashboard tab.

**GOOD - Landscaping company with 5 crew:**
{
    "tabs": [
        { "id": "tab_1", "label": "Dashboard", "icon": "home", "components": [] },
        { "id": "tab_2", "label": "Customers", "icon": "people", "components": [{ "id": "clients", "label": "Customers", "view": "pipeline" }, { "id": "leads", "label": "Leads", "view": "pipeline" }] },
        { "id": "tab_3", "label": "Jobs", "icon": "briefcase", "components": [{ "id": "calendar", "label": "Schedule", "view": "calendar" }, { "id": "jobs", "label": "Jobs", "view": "pipeline" }, { "id": "estimates", "label": "Estimates", "view": "table" }] },
        { "id": "tab_4", "label": "Crew", "icon": "users", "components": [{ "id": "staff", "label": "Crew", "view": "cards" }, { "id": "shifts", "label": "Assignments", "view": "table" }] },
        { "id": "tab_5", "label": "Billing", "icon": "dollar", "components": [{ "id": "invoices", "label": "Invoices", "view": "table" }, { "id": "payments", "label": "Payments", "view": "table" }] }
    ]
}
Why it's good: Dashboard empty (platform-managed), ONE calendar on Jobs tab, no redundant sub-tabs alongside calendar, shifts on Crew tab (not calendar tab), all views explicit.

Now analyze the business description and create a perfect config.`;

  const rawResponse = await callAnthropic({
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  console.log(`Claude response: ${rawResponse}`);

  const cleaned = stripCodeBlocks(rawResponse);
  console.log(`Cleaned JSON: ${cleaned}`);

  return JSON.parse(cleaned) as RawConfig;
}

// ── generateWebsiteCopy ──────────────────────────────────────────────────

/**
 * Generate personalized website copy using Haiku 4.5.
 * Returns a WebsiteCopy dict with text fields.
 * Has fallback defaults on failure (never throws).
 * Ported from app.py lines 1143-1191.
 */
export async function generateWebsiteCopy(
  businessName: string,
  businessType: string,
  description: string,
): Promise<WebsiteCopy> {
  try {
    const rawResponse = await callAnthropic({
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 800,
      system: 'You generate website marketing copy for small businesses. Return ONLY valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Business: ${businessName} (Type: ${businessType})
Description: ${description}

Return JSON:
{
  "hero_headline": "powerful headline, 4-8 words, no quotes",
  "hero_subheadline": "one compelling sentence about the business",
  "hero_cta": "call to action button text, 2-4 words",
  "about_title": "about section heading",
  "about_text": "2-3 engaging sentences about what makes this business special",
  "features_title": "section heading for key selling points",
  "features": ["selling point 1 (1-2 sentences)", "selling point 2 (1-2 sentences)", "selling point 3 (1-2 sentences)"],
  "cta_headline": "motivating call to action heading",
  "cta_text": "short persuasive sentence",
  "cta_button": "action button text, 2-4 words"
}`,
      }],
    });

    const cleaned = stripCodeBlocks(rawResponse);
    return JSON.parse(cleaned) as WebsiteCopy;
  } catch (e) {
    console.error(`Website copy generation failed, using defaults: ${e}`);
    const typeLabel = businessType.replace(/_/g, ' ');
    return {
      hero_headline: `Welcome to ${businessName}`,
      hero_subheadline: `${businessName} — your trusted ${typeLabel} partner.`,
      hero_cta: 'Get Started',
      about_title: `About ${businessName}`,
      about_text: `${businessName} is dedicated to providing exceptional ${typeLabel} services. We pride ourselves on quality, reliability, and customer satisfaction.`,
      features_title: 'Why Choose Us',
      features: [
        'Professional & experienced team',
        'Committed to quality service',
        'Customer satisfaction guaranteed',
      ],
      cta_headline: 'Ready to Get Started?',
      cta_text: 'Contact us today to learn more.',
      cta_button: 'Contact Us',
    };
  }
}
