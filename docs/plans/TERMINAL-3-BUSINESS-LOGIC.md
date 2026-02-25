# TERMINAL 3 — Core Business Logic (Payments, Booking, Commissions)
## Scope: Wire the money flow — deposits, tips, commissions, auto-invoicing, service stacking, coupons

**YOU OWN THESE FILES (modify/create):**
- `dashboard/src/components/views/BookingSetupWizard.tsx` (MODIFY — add deposits, no-show, service stacking)
- `dashboard/src/components/views/AddCatalogItemWizard.tsx` (MODIFY — progressive disclosure, pricing per staff)
- `dashboard/src/components/views/StaffSetupWizard.tsx` (MODIFY — tiered commission UI)
- `dashboard/src/app/api/public/bookings/route.ts` (MODIFY — enforce deposits, multi-service)
- `dashboard/src/app/api/data/commissions/route.ts` (CREATE — commission calculation)
- `dashboard/src/app/api/data/coupons/route.ts` (CREATE — coupon CRUD)
- `dashboard/src/components/views/QuoteBuilder.tsx` (CREATE — estimate/quote builder)
- `dashboard/src/components/views/CouponManager.tsx` (CREATE — coupons/deals section)
- `dashboard/src/components/views/TipSelector.tsx` (CREATE — tip buttons at checkout)
- `dashboard/src/lib/commission-engine.ts` (CREATE — commission calculation logic)
- Any new migrations needed in `supabase/LATEST_MIGRATIONS.sql`

**DO NOT TOUCH:** Template files, portal, reviews, communications, editor, navigation/wiring files, DashboardContent tab rendering.

---

## TASK 1: Deposit System (Sticky Note #1)

### BookingSetupWizard.tsx Changes
**Current:** 4 steps (hours, settings, staff, review). No deposit config.

**Add to Step 2 (Appointment Settings):**
- Toggle: "Require deposit for bookings"
- When ON, show slider: 10% to 100% (default 50%)
- Label: "Deposit percentage: {value}%"
- Below slider: calculated example — "For a $100 service, client pays ${value} upfront"
- Save to `calendar_settings.deposit_percent` (need to add column)

### Booking API Changes (`/api/public/bookings/route.ts`)
**Current:** Creates appointment, no payment.

**Add:**
- When `calendar_settings.deposit_percent > 0`:
  - Calculate deposit amount from service price × deposit %
  - Create Stripe PaymentIntent for deposit amount (NOT full price)
  - Store `deposit_amount_cents` and `payment_intent_id` on appointment
  - Return `clientSecret` to frontend for Stripe Elements payment
- When `deposit_percent === 100`: full prepayment required
- When `deposit_percent === 0`: no payment needed (legacy behavior)

### Migration (add to LATEST_MIGRATIONS.sql)
```sql
-- 041: Deposit and tip support
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS deposit_percent INTEGER DEFAULT 0;
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS no_show_policy TEXT DEFAULT 'none' CHECK (no_show_policy IN ('none', 'charge_deposit', 'charge_full', 'charge_custom'));
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS no_show_fee_cents INTEGER DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_amount_cents INTEGER DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_payment_intent_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tip_amount_cents INTEGER DEFAULT 0;
```

---

## TASK 2: No-Show Protection (Sticky Note #1)

### BookingSetupWizard.tsx — Add to Step 2
- Toggle: "Enable no-show protection"
- When ON, show:
  - Radio: "Charge deposit amount" / "Charge full service price" / "Custom fee"
  - If custom: input field for fee amount
  - Card on file required toggle (forces portal card before booking)
- Save to `calendar_settings.no_show_policy` and `calendar_settings.no_show_fee_cents`

---

## TASK 3: Service Stacking (Sticky Note #1)

### Booking Flow Changes
**Current:** Single `service_id` on appointment.

**Changes:**
- Allow `service_ids: string[]` array on booking API (keep backward compat with single `service_id`)
- Calculate combined duration: sum of all service durations + buffers between
- Calculate combined price: sum of all service prices
- Store as comma-separated or JSONB array on appointment
- Public booking page: multi-select service picker (checkboxes instead of radio)

### Migration
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_ids TEXT[] DEFAULT '{}';
```

---

## TASK 4: Tips at Checkout (Sticky Note #2)

### TipSelector.tsx (CREATE)
A reusable tip selector component for checkout flows:
```
[15%] [18%] [20%] [Custom]    No tip
```
- 4 preset buttons (percentages of subtotal)
- Custom button opens input for dollar amount
- "No tip" option
- Shows calculated tip amount below
- Props: `subtotalCents: number`, `onTipChange: (tipCents: number) => void`

### Where to Use
- Portal checkout (`PortalBookingSection` after service selection)
- Public booking page (`/book/[subdomain]`) at payment step
- Order checkout (`/order/[subdomain]`) at payment step

### Tip Assignment
- Store `tip_amount_cents` on appointment/order
- If staff assigned, tip goes to that staff member
- If no staff (or round-robin), tip goes to pool

---

## TASK 5: Commission Engine (Sticky Note #2)

### commission-engine.ts (CREATE)
Core logic for calculating commissions:

```typescript
interface CommissionConfig {
  type: 'flat' | 'percentage' | 'tiered' | 'product';
  flat_amount_cents?: number;        // For flat type
  percentage?: number;               // For percentage type
  tiers?: { min_cents: number; max_cents: number; percentage: number }[];  // For tiered
  product_percentage?: number;       // Separate rate for product sales
}

function calculateCommission(
  config: CommissionConfig,
  transaction: { amount_cents: number; type: 'service' | 'product' | 'invoice' }
): number  // Returns commission in cents
```

### Commission Triggers
Commission should calculate when:
1. Appointment status → 'completed' (service commission)
2. Product sold (product commission)
3. Invoice paid (if staff assigned to invoice)

Create `/api/data/commissions/route.ts` for tracking:
- Staff ID, amount, source (service/product/invoice), transaction ID, date, status (pending/paid)

### StaffSetupWizard.tsx Changes
**Current:** Has `commission_percent` field. Missing tiered brackets.

**Add to Step 4 (Pay Structure):**
- When type is "Commission", show:
  - Percentage field (existing)
  - "Use tiered rates?" toggle
  - When tiered: add rows for brackets (0-$5k → 30%, $5k-$10k → 35%, $10k+ → 40%)
  - "Separate product commission rate?" toggle
  - When yes: separate % field for product sales

### Migration
```sql
-- Commission tracking
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  staff_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL CHECK (source_type IN ('service', 'product', 'invoice', 'tip')),
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY commissions_user ON commissions FOR ALL USING (user_id = auth.uid());

-- Store tiered config on staff
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS commission_config JSONB DEFAULT '{}';
```

---

## TASK 6: Auto-Invoicing (Sticky Note #2)

### Logic
When an appointment status changes to 'completed':
1. Look up the service(s) from the appointment
2. Generate invoice with line items (service name, price, duration)
3. Add tip as separate line item if present
4. Set invoice status to 'pending'
5. Link invoice to client and staff

This should be a server-side function called from the appointment status update API.

Add to existing `/api/data/appointments/[id]/route.ts` PATCH handler:
- Check if status is changing to 'completed'
- If yes, call `autoGenerateInvoice(appointment)` helper
- Helper creates invoice via Supabase insert

---

## TASK 7: Quote Builder (Sticky Note #2)

### QuoteBuilder.tsx (CREATE)
An estimate/quote builder modal (CenterModal):
- Line items: description, quantity, unit price, total
- Add/remove line items
- Subtotal, tax (optional), total
- Notes field
- "Send to Client" button (creates email with Resend)
- "Convert to Invoice" button (creates invoice from quote data)
- Status: draft → sent → approved → invoiced → expired

Uses existing `estimates` table from entity-fields.ts. Create CRUD API at `/api/data/estimates/route.ts` if it doesn't exist.

---

## TASK 8: Coupons & Deals (Sticky Note #7)

### CouponManager.tsx (CREATE)
A dedicated section for managing discounts:
- Create coupon: code, type (% off / $ off / free item), value, expiry date, usage limit, minimum order
- List all coupons with status (active/expired/depleted)
- Usage stats per coupon
- Toggle active/inactive

### Migration
```sql
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent_off', 'amount_off', 'free_item')),
  value INTEGER NOT NULL DEFAULT 0,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupons_user ON coupons FOR ALL USING (user_id = auth.uid());
```

### AddCatalogItemWizard.tsx Changes
**Current:** Shows 8+ fields immediately.

**Changes per Sticky Note #7 (GlossGenius simplicity):**
- Step 2 default: Show only 4 fields — Name, Price, Duration (services) or SKU (products), Category
- "Advanced options" expandable section with the rest: buffer, description, quantity, image
- Pricing per staff toggle: "Different price per staff?" → shows staff list with individual price fields

---

## TASK 9: Packages (Sticky Note #7)

Packages are already supported in the `packages` table (`item_type: 'package'`). Add UI for creating packages:
- Package name
- Select services to include
- Package price (can be discounted from sum of individual services)
- Validity period (e.g., "Use within 90 days")

This can be added as a tab or section within the service/product view.

---

## DESIGN RULES
- Colors from `config.colors` — NEVER hardcode
- Use `CustomSelect` for all dropdowns with `buttonColor` prop
- Use `CenterModal` for all modals
- Sliders: use native `<input type="range">` with Tailwind styling
- Currency: always store as cents, display with `$${(cents/100).toFixed(2)}`

## WHEN DONE
Update `memory/MEMORY.md`:
- Add deposit system, tips, commissions, auto-invoicing, coupons to "What's Built"
- Note commission engine location
- Note migration numbers added
