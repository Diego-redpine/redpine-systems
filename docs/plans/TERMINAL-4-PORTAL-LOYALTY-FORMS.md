# TERMINAL 4 — Portal Upgrades + Loyalty Config + Forms & Documents
## Scope: Industry portal add-ons, loyalty system, form templates, doc differentiation

**YOU OWN THESE FILES (modify/create):**

### Portal Files
- `dashboard/src/components/portal/sections/PortalBookingSection.tsx` (MODIFY — add "Book Again" shortcut, saved preferences)
- `dashboard/src/components/portal/sections/PortalHistorySection.tsx` (MODIFY — add "Reorder" shortcut)
- `dashboard/src/components/portal/sections/PortalCardsSection.tsx` (MODIFY — Apple Wallet visual)
- `dashboard/src/components/portal/sections/PortalLoyaltySection.tsx` (MODIFY — visual progress bar, earning rules display)
- `dashboard/src/components/portal/sections/PortalAccountSection.tsx` (MODIFY — family member management)
- `dashboard/src/lib/portal-templates.ts` (MODIFY — add industry-specific sections/preferences)

### Loyalty Config Files
- `dashboard/src/components/views/LoyaltyConfigPanel.tsx` (CREATE — owner-facing config)
- `dashboard/src/app/api/data/loyalty_config/route.ts` (CREATE — loyalty rules CRUD)

### Form/Doc Files
- `dashboard/src/components/views/FormTemplateLibrary.tsx` (CREATE — browse/search form templates)
- `dashboard/src/components/views/DocTypeRenderer.tsx` (CREATE — visual differentiation per doc type)
- `dashboard/src/lib/form-templates.ts` (CREATE — industry-specific form template data)

**DO NOT TOUCH:** Template files, booking API, commission logic, navigation/wiring files, editor, blog, marketplace components.

---

## TASK 1: Portal One-Tap Shortcuts (Sticky Note #11)

### PortalBookingSection.tsx
**Current:** Shows booking history and reschedule/cancel.

**Add:**
- **"Book Again" button** — prominent at top of booking history
  - Shows last booked service name and staff
  - One tap → pre-fills booking form with same service, same staff, next available slot
  - Button style: `bg-{brand_color} text-white rounded-xl px-6 py-3 font-semibold text-lg`
  - Below it: "Last visit: {date} with {staff_name} — {service_name}"

- **Saved preferences panel** (for salon/beauty businesses):
  - Color formula, allergies, preferred products
  - Read from `clients.custom_fields` JSONB or `portal_preferences` if you create it
  - Only show for industries where it makes sense (check `businessType` from portal config)

### PortalHistorySection.tsx
**Current:** Shows purchase/appointment history.

**Add:**
- **"Reorder" button** next to each past order/purchase
  - One tap → adds same items to cart and navigates to checkout
  - For restaurants: "Reorder this meal" with the exact items
  - For retail: "Buy again" with same products

---

## TASK 2: Apple Wallet Card Visual (Sticky Note #11)

### PortalCardsSection.tsx
**Current:** Lists saved payment methods.

**Redesign to Apple Wallet style:**
- Each card renders as a visual credit card graphic (rounded-2xl, gradient background)
- Show: last 4 digits, card brand icon (Visa/MC/Amex), expiry
- Cards stack with slight offset (like Apple Wallet)
- Default card has a checkmark badge
- "Add new card" button at bottom
- Swipe to delete on mobile (or X button on desktop)

```tsx
// Card visual example
<div className="w-full max-w-sm h-48 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 shadow-lg relative">
  <div className="flex justify-between items-start">
    <span className="text-sm opacity-70">Credit Card</span>
    <CardBrandIcon brand={card.brand} /> {/* Visa, MC, Amex SVG */}
  </div>
  <div className="mt-8 text-xl tracking-widest font-mono">
    •••• •••• •••• {card.last4}
  </div>
  <div className="mt-4 flex justify-between text-sm opacity-70">
    <span>{card.name || 'Card Holder'}</span>
    <span>{card.exp_month}/{card.exp_year}</span>
  </div>
  {card.isDefault && (
    <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1">
      <CheckIcon className="w-3 h-3 text-white" />
    </div>
  )}
</div>
```

---

## TASK 3: Loyalty Config UI (Sticky Note #11 + #12)

### Owner-Facing: LoyaltyConfigPanel.tsx (CREATE)
This is the configuration panel the business owner sees to set up their loyalty program.

**Sections:**
1. **Enable/Disable** toggle
2. **Earning Rules:**
   - Points per dollar spent (e.g., 1 point per $1)
   - Points per visit (e.g., 10 points per appointment)
   - Bonus points for specific actions (first visit, referral, review)
3. **Tier Configuration:**
   - Tier names (customizable — default: Bronze, Silver, Gold, Platinum)
   - Points threshold per tier (e.g., 0-100 = Bronze, 101-500 = Silver, etc.)
   - Benefits per tier (text descriptions — e.g., "10% off all services")
   - Tier colors (auto-assigned: bronze/silver/gold gradient)
4. **Rewards:**
   - Reward name, points cost, description
   - e.g., "Free haircut — 500 points", "$10 off — 200 points"
5. **Settings:**
   - Points expiry (never / 6 months / 1 year)
   - Auto-enroll all clients toggle

### Portal-Facing: PortalLoyaltySection.tsx Update
**Current:** Shows loyalty tier and points.

**Enhance with:**
- **Visual progress bar** (Starbucks-style):
  - Current tier with colored background
  - Progress bar showing points toward next tier
  - "{X} points to reach {next_tier}!" label
  - Star/gem icons per tier
- **Points history:**
  - "+10 pts — Appointment completed — Jan 15"
  - "-200 pts — Redeemed: $10 off — Jan 20"
- **Available rewards:**
  - Cards showing what they can redeem with current points
  - "Redeem" button (grayed out if not enough points)

### Migration
```sql
-- Loyalty configuration
CREATE TABLE IF NOT EXISTS loyalty_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  enabled BOOLEAN DEFAULT false,
  points_per_dollar INTEGER DEFAULT 1,
  points_per_visit INTEGER DEFAULT 10,
  tiers JSONB DEFAULT '[
    {"name": "Bronze", "min_points": 0, "color": "#CD7F32", "benefits": "Welcome to our loyalty program!"},
    {"name": "Silver", "min_points": 100, "color": "#C0C0C0", "benefits": "5% off all services"},
    {"name": "Gold", "min_points": 500, "color": "#FFD700", "benefits": "10% off all services + priority booking"},
    {"name": "Platinum", "min_points": 1000, "color": "#E5E4E2", "benefits": "15% off + free add-on per visit"}
  ]',
  rewards JSONB DEFAULT '[]',
  points_expiry_months INTEGER, -- null = never
  auto_enroll BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
ALTER TABLE loyalty_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY loyalty_config_user ON loyalty_config FOR ALL USING (user_id = auth.uid());

-- Client loyalty tracking
CREATE TABLE IF NOT EXISTS client_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_tier TEXT DEFAULT 'Bronze',
  points_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);
ALTER TABLE client_loyalty ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_loyalty_user ON client_loyalty FOR ALL USING (user_id = auth.uid());
```

---

## TASK 4: Family Accounts (Sticky Note #11)

### PortalAccountSection.tsx
**Current:** Shows profile info.

**Add "Family Members" section:**
- List of family members under this account
- "Add family member" button → mini form (name, relationship, date of birth)
- Each member can have their own:
  - Appointment history
  - Saved preferences
  - Loyalty points (shared or individual — owner configures)
- Switch between family members via dropdown at top of portal
- Store in `portal_family_members` or as JSONB on `portal_sessions`

### Migration
```sql
CREATE TABLE IF NOT EXISTS portal_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_client_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT DEFAULT '',
  date_of_birth DATE,
  notes TEXT DEFAULT '',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE portal_family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY family_user ON portal_family_members FOR ALL USING (user_id = auth.uid());
```

---

## TASK 5: Portal Industry Add-Ons (Sticky Note #11)

### portal-templates.ts Update
**Current:** 20 industry configs with generic section labels.

**Add industry-specific preferences to each config:**

```typescript
// Salon/Spa config additions:
preferences: {
  fields: ['color_formula', 'allergies', 'preferred_products', 'hair_type'],
  showBeforeAfterPhotos: true,
  showPrepaidPackages: true,
}

// Restaurant config additions:
preferences: {
  showReorderFavorites: true,
  showDailyDeals: true,
  showDeliveryTracking: true,
  showDietaryPreferences: true,
  fields: ['dietary_restrictions', 'favorite_table', 'spice_level'],
}

// Gym/Fitness config additions:
preferences: {
  showClassSchedule: true,
  showWorkoutProgress: true,
  showMembershipStatus: true,
  showCheckInQR: true,
  fields: ['fitness_goals', 'injuries', 'preferred_class_types'],
}

// Contractor config additions:
preferences: {
  showProjectTracker: true,
  showDocuments: true,
  showEstimateApproval: true,
  showPhotoProgress: true,
}

// Retail config additions:
preferences: {
  showWishlist: true,
  showShippingTracking: true,
  showReturns: true,
  showEarlyAccess: true,
}
```

The portal section components should read these configs and conditionally render features.

---

## TASK 6: Form Template Library (Sticky Note #4)

### form-templates.ts (CREATE)
Industry-specific form templates:

```typescript
export const FORM_TEMPLATES: FormTemplate[] = [
  // Salon/Beauty
  { id: 'salon_intake', name: 'Salon Client Intake', category: 'beauty', type: 'intake',
    fields: [name, email, phone, 'Hair type', 'Color history', 'Allergies', 'Preferred products'] },
  { id: 'allergy_waiver', name: 'Allergy & Sensitivity Waiver', category: 'beauty', type: 'waiver',
    fields: [name, signature, 'Known allergies', 'Skin sensitivities', 'Consent checkbox'] },

  // Fitness
  { id: 'fitness_intake', name: 'Fitness Assessment', category: 'fitness', type: 'intake',
    fields: [name, email, 'Current fitness level', 'Goals', 'Injuries', 'Medical conditions', 'Emergency contact'] },
  { id: 'liability_waiver', name: 'Liability Waiver', category: 'fitness', type: 'waiver',
    fields: [name, signature, 'Acknowledgment of risk', 'Emergency contact', 'Medical release'] },

  // Medical/Healthcare
  { id: 'medical_history', name: 'Medical History Form', category: 'healthcare', type: 'intake',
    fields: ['Patient name', 'DOB', 'Insurance', 'Current medications', 'Allergies', 'Conditions', 'Emergency contact'] },
  { id: 'hipaa_consent', name: 'HIPAA Consent Form', category: 'healthcare', type: 'waiver',
    fields: [name, signature, 'Privacy acknowledgment', 'Data sharing consent', 'Date'] },

  // Contractor/Home Services
  { id: 'service_estimate', name: 'Service Estimate Form', category: 'home_services', type: 'contact',
    fields: ['Property address', 'Service needed', 'Preferred date', 'Budget range', 'Photos upload', 'Notes'] },
  { id: 'work_authorization', name: 'Work Authorization', category: 'home_services', type: 'waiver',
    fields: [name, 'Property address', 'Scope of work', 'Authorization to proceed', signature, 'Date'] },

  // Education
  { id: 'student_enrollment', name: 'Student Enrollment', category: 'education', type: 'intake',
    fields: ['Student name', 'DOB', 'Guardian name', 'Guardian phone', 'Guardian email', 'Grade/Level', 'Medical info', 'Emergency contact'] },
  { id: 'photo_release', name: 'Photo Release Form', category: 'education', type: 'waiver',
    fields: ['Student name', 'Guardian name', 'Permission checkbox', signature, 'Date'] },

  // Restaurant
  { id: 'catering_request', name: 'Catering Request', category: 'food', type: 'contact',
    fields: ['Event date', 'Guest count', 'Dietary needs', 'Budget', 'Location', 'Contact name', 'Phone'] },

  // General
  { id: 'contact_form', name: 'Contact Form', category: 'general', type: 'contact',
    fields: [name, email, phone, 'Message'] },
  { id: 'feedback_survey', name: 'Customer Feedback Survey', category: 'general', type: 'survey',
    fields: ['Overall rating', 'Service quality', 'Staff friendliness', 'Would recommend?', 'Comments'] },
  { id: 'nda', name: 'Non-Disclosure Agreement', category: 'general', type: 'waiver',
    fields: [name, 'Company', 'Scope of confidentiality', 'Duration', signature, 'Date'] },
];
```

### FormTemplateLibrary.tsx (CREATE)
**Google Forms-style browser:**
- Category filter tabs (All, Beauty, Fitness, Healthcare, Home Services, Education, Food, General)
- Search bar
- Grid of template cards with:
  - Template name
  - Category badge
  - Type badge (intake / waiver / contact / survey)
  - "Use this template" button
  - Preview on click
- Clicking "Use this template" opens FormBuilder pre-filled with the template fields

---

## TASK 7: Document Type Visual Differentiation (Sticky Note #4)

### DocTypeRenderer.tsx (CREATE)
Per Sticky Note #4: "Each doc type looks different (waiver ≠ survey ≠ contract)"

Create visual wrappers that make each document type LOOK different:

**Waiver style:**
- Yellow/amber accent border
- Shield icon in header
- "WAIVER" badge
- Signature line at bottom

**Contract style:**
- Blue accent border
- Scale/gavel icon
- "CONTRACT" badge
- Dual signature lines (both parties)

**Survey style:**
- Green accent border
- Clipboard icon
- "SURVEY" badge
- Progress indicator (questions answered)

**Invoice style:**
- Red accent border
- Dollar icon
- "INVOICE" badge
- Line items table, total at bottom

These wrappers should be used in the document list view and the document editor to visually differentiate types at a glance.

---

## DESIGN RULES
- Colors from `config.colors` — NEVER hardcode
- Use `CustomSelect` for all dropdowns with `buttonColor` prop
- Use `CenterModal` for all modals
- Progress bars: use Tailwind `bg-{color}` with `rounded-full` and percentage width
- Card stacking (wallet): use `transform` and `translate-y` for offset effect

## WHEN DONE
Update `memory/MEMORY.md`:
- Add loyalty config, portal upgrades, form templates, doc types to "What's Built"
- Note new migration numbers
- Note portal industry add-on configs
