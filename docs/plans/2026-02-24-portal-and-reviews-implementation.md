# Portal Skeleton + Review Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the universal client portal skeleton (8 sections as authenticated website routes) and the Review Management tab (inbox, gate, requests, widgets).

**Architecture:** Portal is authenticated `/portal/*` routes on the business website (same domain, Brand Board colors). Reviews is a new top-level sidebar tab with star icon. Both share a database migration. The adaptive chat widget bridges anonymous visitors and authenticated portal clients.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, Supabase (PostgreSQL + RLS), Stripe (saved cards), existing CRUD factory pattern.

**Design Doc:** `docs/plans/2026-02-24-portal-skeleton-and-review-management-design.md`

---

## Build Order

Two parallel tracks after the shared database migration:

```
Task 1: Database Migration (shared)
       ├── Track A: Portal
       │   ├── Task 2: Portal Templates Rewrite
       │   ├── Task 3: Portal Shell Layout
       │   ├── Task 4: Portal API Extensions
       │   ├── Task 5: Portal Account Section
       │   ├── Task 6: Portal Payment History
       │   ├── Task 7: Portal Loyalty Bar
       │   ├── Task 8: Portal Messaging
       │   ├── Task 9: Portal Reviews Section
       │   ├── Task 10: Portal Saved Cards
       │   ├── Task 11: Portal Notifications
       │   ├── Task 12: Portal Booking
       │   └── Task 13: Adaptive Chat Widget
       └── Track B: Reviews
           ├── Task 14: Reviews Navigation + Tab Shell
           ├── Task 15: Review Inbox
           ├── Task 16: Review Gate Settings
           ├── Task 17: Review Requests
           └── Task 18: Review Widgets
```

**Parallelizable:** Tasks 2-4 must come before Tasks 5-13. Task 14 is independent and can run parallel to Track A. Tasks 15-18 depend on Task 14.

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/038_portal_and_reviews.sql`
- Modify: `supabase/LATEST_MIGRATIONS.sql` (append)

**Step 1: Write the migration SQL**

```sql
-- Migration 038: Portal Skeleton + Review Management
-- Adds review gate, review requests, review widgets tables
-- Extends reviews, chat_conversations, portal_sessions

-- ============================================================
-- NEW TABLE: review_gate_config (one per business)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_gate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  star_threshold INTEGER NOT NULL DEFAULT 4 CHECK (star_threshold BETWEEN 1 AND 5),
  positive_platforms JSONB NOT NULL DEFAULT '["google"]'::jsonb,
  negative_message TEXT NOT NULL DEFAULT 'We''re sorry to hear that. Please tell us how we can improve.',
  notify_team BOOLEAN NOT NULL DEFAULT true,
  notify_channels JSONB NOT NULL DEFAULT '["in_app"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE review_gate_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review gate config"
  ON review_gate_config FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NEW TABLE: review_requests (outbound review request tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'appointment_completed', 'invoice_paid', 'bulk_campaign')),
  channel TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'sms', 'both')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  drip_step INTEGER NOT NULL DEFAULT 1,
  tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_requests_user ON review_requests(user_id);
CREATE INDEX idx_review_requests_client ON review_requests(client_id);
CREATE INDEX idx_review_requests_token ON review_requests(tracking_token);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review requests"
  ON review_requests FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NEW TABLE: review_widgets (widget display configs)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Review Widget',
  layout_type TEXT NOT NULL DEFAULT 'carousel'
    CHECK (layout_type IN ('list', 'grid', 'carousel', 'badge')),
  min_rating INTEGER NOT NULL DEFAULT 4 CHECK (min_rating BETWEEN 1 AND 5),
  max_reviews INTEGER NOT NULL DEFAULT 10,
  platforms JSONB NOT NULL DEFAULT '["direct", "google", "facebook"]'::jsonb,
  show_ai_summary BOOLEAN NOT NULL DEFAULT false,
  style_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE review_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review widgets"
  ON review_widgets FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- EXTEND: reviews table (contact matching + gate + attribution)
-- ============================================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS platform_review_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_gated BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES review_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);

-- ============================================================
-- EXTEND: chat_conversations (widget source + cookie tracking)
-- ============================================================
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS visitor_cookie_id TEXT;
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'widget_anonymous'
  CHECK (source IN ('widget_anonymous', 'widget_returning', 'portal', 'sms', 'email'));
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_cookie ON chat_conversations(visitor_cookie_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client ON chat_conversations(client_id);

-- ============================================================
-- EXTEND: portal_sessions (cookie linking for chat merge)
-- ============================================================
ALTER TABLE portal_sessions ADD COLUMN IF NOT EXISTS cookie_id TEXT;

-- ============================================================
-- NEW TABLE: portal_notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_reminders BOOLEAN NOT NULL DEFAULT true,
  payment_receipts BOOLEAN NOT NULL DEFAULT true,
  loyalty_updates BOOLEAN NOT NULL DEFAULT true,
  promotions BOOLEAN NOT NULL DEFAULT false,
  messages BOOLEAN NOT NULL DEFAULT true,
  channel_email BOOLEAN NOT NULL DEFAULT true,
  channel_sms BOOLEAN NOT NULL DEFAULT false,
  channel_push BOOLEAN NOT NULL DEFAULT false,
  digest_promotions BOOLEAN NOT NULL DEFAULT true,
  pause_all BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

ALTER TABLE portal_notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification prefs"
  ON portal_notification_preferences FOR ALL USING (auth.uid() = user_id);
```

**Step 2: Apply the migration**

Run: `cd /Users/Diego21/redpine-os && npx supabase db push` or apply via Supabase dashboard SQL editor.

**Step 3: Append to LATEST_MIGRATIONS.sql**

Append the migration content to `supabase/LATEST_MIGRATIONS.sql` for reference.

**Step 4: Commit**

```bash
git add supabase/migrations/038_portal_and_reviews.sql supabase/LATEST_MIGRATIONS.sql
git commit -m "feat: add migration 038 — portal skeleton + review management tables"
```

---

## Task 2: Portal Templates Rewrite

**Files:**
- Modify: `dashboard/src/lib/portal-templates.ts`

**Context:** The current file has 4 separate template functions (Studio, Fitness, Professional, Education) that return different page sets. We need to replace this with a universal skeleton that returns the same 8 sections for ALL business types, with industry-specific config flags.

**Step 1: Define the portal config type**

At the top of `portal-templates.ts`, add:

```typescript
export interface PortalConfig {
  preferenceFields: { key: string; label: string; type: 'text' | 'textarea' | 'select'; options?: string[] }[];
  primaryAction: 'book_again' | 'reorder' | 'schedule_again' | 'book_class';
  primaryActionLabel: string;
  chatProminence: 'primary' | 'secondary';
  reviewPrompt: string;
  bookingMode: 'service' | 'class' | 'menu' | 'scheduler';
  defaultNotifications: { promotions: boolean };
}
```

**Step 2: Create the industry config map**

```typescript
const INDUSTRY_CONFIGS: Record<string, Partial<PortalConfig>> = {
  // Beauty & Personal Care
  nail_salon: { preferenceFields: [{ key: 'nail_shape', label: 'Preferred Nail Shape', type: 'select', options: ['Almond', 'Coffin', 'Oval', 'Square', 'Stiletto', 'Round'] }, { key: 'gel_type', label: 'Preferred Gel Type', type: 'text' }, { key: 'allergies', label: 'Allergies', type: 'textarea' }], chatProminence: 'primary', reviewPrompt: 'Rate your visit' },
  hair_salon: { preferenceFields: [{ key: 'color_formula', label: 'Color Formula', type: 'textarea' }, { key: 'stylist_notes', label: 'Stylist Notes', type: 'textarea' }], chatProminence: 'primary', reviewPrompt: 'Rate your appointment' },
  barbershop: { preferenceFields: [{ key: 'cut_style', label: 'Preferred Style', type: 'text' }], chatProminence: 'primary', reviewPrompt: 'Rate your cut' },
  spa: { preferenceFields: [{ key: 'allergies', label: 'Allergies/Sensitivities', type: 'textarea' }, { key: 'pressure', label: 'Preferred Pressure', type: 'select', options: ['Light', 'Medium', 'Firm', 'Deep'] }], chatProminence: 'primary', reviewPrompt: 'Rate your experience' },

  // Fitness & Wellness
  gym: { primaryAction: 'book_class', primaryActionLabel: 'Book Class', bookingMode: 'class', chatProminence: 'secondary', reviewPrompt: 'Rate the class', preferenceFields: [{ key: 'fitness_goals', label: 'Fitness Goals', type: 'textarea' }] },
  fitness: { primaryAction: 'book_class', primaryActionLabel: 'Book Class', bookingMode: 'class', chatProminence: 'secondary', reviewPrompt: 'Rate the session' },
  yoga_studio: { primaryAction: 'book_class', primaryActionLabel: 'Book Class', bookingMode: 'class', chatProminence: 'secondary', reviewPrompt: 'Rate the class' },
  martial_arts: { primaryAction: 'book_class', primaryActionLabel: 'Book Class', bookingMode: 'class', chatProminence: 'secondary', reviewPrompt: 'Rate the class' },

  // Food & Beverage
  restaurant: { primaryAction: 'reorder', primaryActionLabel: 'Reorder', bookingMode: 'menu', chatProminence: 'secondary', reviewPrompt: 'Rate your meal', preferenceFields: [{ key: 'dietary', label: 'Dietary Preferences', type: 'textarea' }] },
  cafe: { primaryAction: 'reorder', primaryActionLabel: 'Order Again', bookingMode: 'menu', chatProminence: 'secondary', reviewPrompt: 'Rate your visit' },
  bakery: { primaryAction: 'reorder', primaryActionLabel: 'Order Again', bookingMode: 'menu', chatProminence: 'secondary', reviewPrompt: 'Rate your order' },

  // Home Services
  lawn_care: { primaryAction: 'schedule_again', primaryActionLabel: 'Schedule Service', bookingMode: 'scheduler', chatProminence: 'secondary', reviewPrompt: 'Rate the service', preferenceFields: [{ key: 'gate_code', label: 'Gate Code', type: 'text' }, { key: 'property_notes', label: 'Property Notes', type: 'textarea' }] },
  cleaning: { primaryAction: 'schedule_again', primaryActionLabel: 'Schedule Cleaning', bookingMode: 'scheduler', chatProminence: 'secondary', reviewPrompt: 'Rate the service', preferenceFields: [{ key: 'access_notes', label: 'Access Instructions', type: 'textarea' }] },
  plumbing: { primaryAction: 'schedule_again', primaryActionLabel: 'Schedule Service', bookingMode: 'scheduler', chatProminence: 'secondary', reviewPrompt: 'Rate the service' },
  electrical: { primaryAction: 'schedule_again', primaryActionLabel: 'Schedule Service', bookingMode: 'scheduler', chatProminence: 'secondary', reviewPrompt: 'Rate the service' },

  // Professional
  dental: { chatProminence: 'secondary', reviewPrompt: 'Rate your appointment', preferenceFields: [{ key: 'insurance', label: 'Insurance Provider', type: 'text' }] },
  medical: { chatProminence: 'secondary', reviewPrompt: 'Rate your visit', preferenceFields: [{ key: 'insurance', label: 'Insurance Provider', type: 'text' }] },
  legal: { chatProminence: 'secondary', reviewPrompt: 'Rate the service' },
  accounting: { chatProminence: 'secondary', reviewPrompt: 'Rate the service' },
  consulting: { chatProminence: 'secondary', reviewPrompt: 'Rate the consultation' },
};
```

**Step 3: Create the default config + resolver**

```typescript
const DEFAULT_CONFIG: PortalConfig = {
  preferenceFields: [],
  primaryAction: 'book_again',
  primaryActionLabel: 'Book Again',
  chatProminence: 'primary',
  reviewPrompt: 'Rate your experience',
  bookingMode: 'service',
  defaultNotifications: { promotions: false },
};

export function getPortalConfig(businessType?: string): PortalConfig {
  if (!businessType) return DEFAULT_CONFIG;
  const type = businessType.toLowerCase().replace(/\s+/g, '_');
  const override = INDUSTRY_CONFIGS[type];
  if (!override) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...override };
}
```

**Step 4: Rewrite `shouldHavePortal` to always return true**

```typescript
export function shouldHavePortal(_businessType?: string): boolean {
  return true; // Every business gets a portal (Sticky #11)
}
```

**Step 5: Rewrite `getPortalPages` for the universal skeleton**

Replace ALL the existing getStudioPortalPages/getFitnessPortalPages/etc functions and the bottom getPortalPages with a single universal function that returns 8 pages using the same block structure but with config flags embedded in block props.

**Step 6: Commit**

```bash
git add dashboard/src/lib/portal-templates.ts
git commit -m "feat: rewrite portal templates — universal skeleton for all industries"
```

---

## Task 3: Portal Shell Layout

**Files:**
- Create: `dashboard/src/components/portal/PortalShell.tsx`
- Create: `dashboard/src/components/portal/PortalNav.tsx`
- Create: `dashboard/src/components/portal/PortalTopBar.tsx`

**Context:** Every `/portal/*` page shares a universal shell: top bar (logo, client name, notification bell), side nav (desktop) / bottom tab bar (mobile), Brand Board colors.

**Step 1: Create PortalTopBar**

```typescript
// Props: businessName, businessLogo, clientName, clientAvatar, accentColor, onNotificationClick
// Layout: logo left, business name center, client avatar + bell icon right
// Uses Brand Board colors from config.colors
```

**Step 2: Create PortalNav**

```typescript
// Props: activeSection, onNavigate, accentColor, chatProminence
// 8 nav items with icons: Account, History, Loyalty, Messages, Reviews, Cards, Notifications, Book
// Desktop: vertical side nav (left)
// Mobile: bottom tab bar (show top 5, "More" for rest)
// Active state: accentColor background, white text
```

**Step 3: Create PortalShell**

```typescript
// Props: children, config (Brand Board), portalConfig (industry), clientData
// Composes: PortalTopBar + PortalNav + content area
// Reads colors from config.colors (buttons for accent, background for bg, etc.)
// Never hardcodes colors
```

**Step 4: Commit**

```bash
git add dashboard/src/components/portal/
git commit -m "feat: portal shell layout — top bar, nav, responsive shell"
```

---

## Task 4: Portal API Extensions

**Files:**
- Modify: `dashboard/src/app/api/portal/data/route.ts`
- Create: `dashboard/src/app/api/portal/chat/route.ts`
- Create: `dashboard/src/app/api/portal/cards/route.ts`
- Create: `dashboard/src/app/api/portal/notifications/route.ts`
- Create: `dashboard/src/app/api/data/review-gate/route.ts`
- Create: `dashboard/src/app/api/data/review-requests/route.ts`
- Create: `dashboard/src/app/api/data/review-widgets/route.ts`

**Step 1: Extend portal/data GET with new types**

Add to existing switch statement in `portal/data/route.ts`:

```typescript
// type=loyalty — fetch from loyalty_members + loyalty_config
// type=reviews — fetch client's own reviews + business responses
// type=cards — proxy to Stripe API for saved payment methods
// type=notifications — fetch from portal_notification_preferences
// type=chat — fetch chat_conversations + chat_messages for this client
```

**Step 2: Create portal/chat route**

```typescript
// GET: fetch conversation + messages for authenticated portal client
// POST: send a new message (sender_type: 'visitor', linked to client_id)
// Uses portal session token for auth
```

**Step 3: Create portal/cards route**

```typescript
// GET: list saved payment methods from Stripe (via customer ID)
// POST: create SetupIntent for adding new card
// DELETE: detach a payment method
```

**Step 4: Create portal/notifications route**

```typescript
// GET: fetch notification preferences for client
// POST: update preferences (toggle matrix)
```

**Step 5: Create review management CRUD routes**

Using the existing `createCrudHandlers` pattern from `crud.ts`:

```typescript
// api/data/review-gate/route.ts
const { handleGet, handlePost } = createCrudHandlers('review_gate_config', {
  searchFields: [],
  requiredFields: [],
});

// api/data/review-requests/route.ts
const { handleGet, handlePost } = createCrudHandlers('review_requests', {
  searchFields: ['client_id', 'trigger_type'],
  requiredFields: ['trigger_type'],
});

// api/data/review-widgets/route.ts
const { handleGet, handlePost } = createCrudHandlers('review_widgets', {
  searchFields: ['name'],
  requiredFields: ['layout_type'],
});
```

**Step 6: Commit**

```bash
git add dashboard/src/app/api/portal/ dashboard/src/app/api/data/review-gate/ dashboard/src/app/api/data/review-requests/ dashboard/src/app/api/data/review-widgets/
git commit -m "feat: portal + review API routes — chat, cards, notifications, gate, requests, widgets"
```

---

## Task 5: Portal Account Section

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalAccountSection.tsx`

**Context:** Name, email, phone, avatar upload, industry-specific preference fields from `getPortalConfig()`, family members list. Password-less (magic link only).

**Step 1: Build the component**

```typescript
// Props: clientData, portalConfig, accentColor, onUpdate
// Sections:
//   1. Profile card (avatar, name, email, phone — editable)
//   2. Preferences card (dynamic fields from portalConfig.preferenceFields)
//   3. Family members card (list + add/remove)
//   4. "Send me a new login link" button
// Uses existing POST /api/portal/data action=update_profile for saves
// Preference fields saved to client.custom_fields JSONB
// Styling: rounded-2xl cards, p-6, Brand Board accent color on buttons
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalAccountSection.tsx
git commit -m "feat: portal account section — profile, preferences, family"
```

---

## Task 6: Portal Payment History

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalHistorySection.tsx`

**Context:** List invoices for this client. Each row shows date, service, amount, status badge. "Book Again" / "Reorder" button per row (label from `portalConfig.primaryActionLabel`). Tap to expand receipt.

**Step 1: Build the component**

```typescript
// Props: invoices[], portalConfig, accentColor, onBookAgain(invoice), onViewReceipt(invoice)
// Layout:
//   1. StatCard row: Total Spent, Visits This Month, Last Visit
//   2. Invoice list (card-style rows, not flat table)
//      Each row: date | service description | amount | status pill badge | [Book Again] button
//   3. Expanded receipt view (modal or slide-over): line items, total, PDF download
// Status badges: paid=green, sent=blue, overdue=red, draft=gray
// Currency formatting: (amount_cents / 100).toFixed(2)
// Fetches from GET /api/portal/data?type=billing
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalHistorySection.tsx
git commit -m "feat: portal payment history — invoice list, book again, receipt view"
```

---

## Task 7: Portal Loyalty Bar

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalLoyaltySection.tsx`

**Context:** Display-only from existing `loyalty_members` + `loyalty_config`. Visual progress bar, tier badge, points summary, available rewards.

**Step 1: Build the component**

```typescript
// Props: loyaltyData (from GET /api/portal/data?type=loyalty), accentColor
// loyaltyData shape: { points, tier, total_orders, total_spent_cents, reward_threshold, reward_value_cents, points_per_dollar }
// Layout:
//   1. Tier badge (bronze/silver/gold) — large, styled with tier colors
//   2. Progress bar: current points / reward_threshold, accentColor fill
//   3. Stats row: Total Points | Points This Month | Total Orders
//   4. Available rewards card (if points >= threshold):
//      "You have a reward available! $X off your next visit" [Redeem] button
//   5. Points-to-next-reward: "X more points until your next reward"
// Progress bar calculation: (points % reward_threshold) / reward_threshold * 100
// Tier colors: bronze=#CD7F32, silver=#C0C0C0, gold=#FFD700
// If no loyalty data: show "This business hasn't set up a loyalty program yet" empty state
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalLoyaltySection.tsx
git commit -m "feat: portal loyalty bar — tier badge, progress bar, rewards"
```

---

## Task 8: Portal Messaging

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalMessagesSection.tsx`

**Context:** Two-way chat (same `chat_conversations` + `chat_messages` tables) plus announcements feed. Template controls prominence via `portalConfig.chatProminence`.

**Step 1: Build the component**

```typescript
// Props: clientId, userId, portalConfig, accentColor
// Layout depends on chatProminence:
//   'primary': Chat takes 2/3, Announcements sidebar 1/3
//   'secondary': Announcements takes 2/3, "Contact Us" button opens chat overlay
// Chat section:
//   - Message list (scrollable, newest at bottom)
//   - Each message: sender_name, content, timestamp, sender_type styling
//     visitor messages = right-aligned, accentColor bg
//     staff messages = left-aligned, gray bg
//     system messages = centered, italic
//   - Input bar at bottom: text input + send button
//   - Sends POST /api/portal/chat with sender_type='visitor'
//   - Polls GET /api/portal/chat every 5 seconds for new messages
// Announcements section:
//   - List of business announcements (read-only cards)
//   - Each: title, content, date, optional image
//   - Fetches from GET /api/portal/data?type=announcements
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalMessagesSection.tsx
git commit -m "feat: portal messaging — two-way chat + announcements"
```

---

## Task 9: Portal Reviews Section

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalReviewsSection.tsx`

**Context:** Client can leave a review (star picker + text). Shows past reviews with business responses. Review gate routes positive/negative. Points-for-reviews nudge if loyalty is active.

**Step 1: Build the component**

```typescript
// Props: clientId, userId, portalConfig, accentColor, loyaltyActive
// Layout:
//   1. "Leave a Review" card (if no recent review):
//      - Star picker (1-5, interactive, accentColor filled stars)
//      - Text area for comment
//      - Submit button
//      - If loyaltyActive: "Earn X points for your review!" nudge
//   2. After submission (if gate is ON):
//      - If stars >= threshold: "Thanks! Would you also leave us a review on Google?"
//        [Leave Google Review] button (direct link to GMB review page)
//      - If stars < threshold: "Thank you for your feedback. We'll use this to improve."
//        (private feedback sent to business, not posted publicly)
//   3. "Your Reviews" section:
//      - List of past reviews with star display, date, text
//      - Business response shown indented below if exists
// Fetches gate config from review_gate_config via portal API
// Submits via POST /api/public/reviews (already exists)
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalReviewsSection.tsx
git commit -m "feat: portal reviews section — star picker, gate routing, review history"
```

---

## Task 10: Portal Saved Cards

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalCardsSection.tsx`

**Context:** Apple Wallet visual style. Shows saved Stripe payment methods. Add/remove cards, set default.

**Step 1: Build the component**

```typescript
// Props: clientId, accentColor
// Layout:
//   1. Card stack (visual credit card representations):
//      - Each card: brand logo (Visa/MC/Amex/Discover), last 4 digits, expiry
//      - Card background: dark gradient (Visa=blue, MC=red/orange, Amex=green, default=gray-900)
//      - Default badge on primary card
//      - Hover: "Set as default" | "Remove" options
//   2. "+ Add Card" button → opens Stripe Elements CardElement in a modal
//      Uses POST /api/portal/cards to create SetupIntent
//      On success, refreshes card list
// Card brand detection from payment method card.brand field
// Brand colors: visa=#1A1F71, mastercard=#EB001B, amex=#006FCF, discover=#FF6600
// Empty state: "No saved cards. Add one to speed up checkout."
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalCardsSection.tsx
git commit -m "feat: portal saved cards — Apple Wallet style, Stripe integration"
```

---

## Task 11: Portal Notification Preferences

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalNotificationsSection.tsx`

**Context:** Toggle matrix for notification categories and channels. "Pause all" for vacation mode.

**Step 1: Build the component**

```typescript
// Props: clientId, userId, accentColor
// Fetches from GET /api/portal/notifications
// Layout:
//   1. "Pause All Notifications" toggle (prominent, at top)
//      When ON: grays out everything below, shows "Notifications paused"
//   2. Channel toggles row:
//      Email [ON by default] | SMS [OFF by default, opt-in] | Push [disabled until PWA]
//   3. Category matrix (card per category):
//      | Category           | Email | SMS | Push |
//      | Booking reminders  |  ✓    |  ○  |  -   |
//      | Payment receipts   |  ✓    |  ○  |  -   |
//      | Loyalty updates    |  ✓    |  ○  |  -   |
//      | Promotions         |  ○    |  ○  |  -   |
//      | Messages           |  ✓    |  ○  |  -   |
//      ✓ = on, ○ = off, - = not available yet
//   4. Promotions frequency: "Immediate" / "Daily digest" toggle
// Saves via POST /api/portal/notifications
// Push column shows "Coming soon" tooltip
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalNotificationsSection.tsx
git commit -m "feat: portal notification preferences — toggle matrix, pause all"
```

---

## Task 12: Portal Booking

**Files:**
- Create: `dashboard/src/components/portal/sections/PortalBookingSection.tsx`

**Context:** Full booking flow embedded. Mode from `portalConfig.bookingMode`. Pre-fills saved preferences. "Your usual" shortcut.

**Step 1: Build the component**

```typescript
// Props: clientId, portalConfig, accentColor, invoiceHistory[]
// Layout varies by bookingMode:
//   'service': Service selection → Staff selection → Time slot → Confirm
//   'class': Class schedule list → Select → Confirm
//   'menu': Menu browsing → Cart → Checkout
//   'scheduler': Service selection → Date picker → Time → Confirm
// Shared features:
//   1. "Your usual" shortcut card at top (if 3+ identical bookings):
//      Shows most booked service + preferred staff + usual day/time
//      One-tap [Book Your Usual] button
//   2. Recent services section (from invoice history):
//      Quick-book cards for each previously booked service
//   3. Full booking flow below
// Payment: uses saved default card, one-tap confirm
// Fetches services from GET /api/portal/data?type=services (new type to add)
// Fetches availability from existing booking API
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/sections/PortalBookingSection.tsx
git commit -m "feat: portal booking — service/class/menu/scheduler modes, your usual shortcut"
```

---

## Task 13: Adaptive Chat Widget

**Files:**
- Create: `dashboard/src/components/portal/ChatWidget.tsx`
- Create: `dashboard/src/app/api/portal/chat/route.ts` (if not created in Task 4)

**Context:** One widget, three states (anonymous → returning → authenticated). Embedded on every page of the website. Cookie-based recognition. Session merge on portal signup.

**Step 1: Build the widget component**

```typescript
// Props: businessConfig, portalSession (nullable)
// State detection:
//   1. Check portalSession (from PortalContext) → State 3 (authenticated)
//   2. Check localStorage/cookie for visitor_cookie_id → State 2 (returning)
//   3. Else → State 1 (anonymous)
//
// State 1 (Anonymous):
//   - Floating button (bottom-right corner, accentColor)
//   - On click: expand to chat panel
//   - First view: "Hi! How can we help?" + name/email form
//   - On submit: create chat_conversation with visitor metadata, set cookie
//   - Then: show message input
//
// State 2 (Returning):
//   - Floating button with unread count badge
//   - On click: "Welcome back, [name]!" + resume last conversation
//   - No form required (cookie has conversation_id)
//
// State 3 (Authenticated):
//   - Floating button with "Hey [name]!" tooltip + loyalty tier badge
//   - On click: full chat with client context
//   - Messages linked to client_id in chat_conversations
//   - Same thread as portal messaging section
//
// Merge logic (on portal login):
//   If cookie exists with conversation_id AND client creates/logs into portal:
//   POST /api/portal/chat/merge — links conversation to client_id
//
// Visual: rounded-2xl panel, 350px wide, 500px tall, shadow-xl
// Minimized: 56px circle button with chat icon
// Transition: smooth slide-up animation
```

**Step 2: Commit**

```bash
git add dashboard/src/components/portal/ChatWidget.tsx
git commit -m "feat: adaptive chat widget — 3 states, cookie tracking, session merge"
```

---

## Task 14: Reviews Navigation + Tab Shell

**Files:**
- Modify: `dashboard/src/lib/navigation.ts`
- Modify: `dashboard/src/lib/entity-fields.ts`
- Create: `dashboard/src/components/reviews/ReviewsTab.tsx`

**Context:** Add "Reviews" as a new top-level sidebar tab with star icon. Remove "Reviews" from Comms sub-items. Create the tab shell with sub-tabs: Inbox, Requests, Gate, Widgets.

**Step 1: Update navigation.ts**

In the `operations` section, add after `comms`:

```typescript
{
  id: 'reviews',
  icon: 'star',
  label: 'Reviews',
  defaultLabel: 'Reviews',
  subItems: ['Inbox', 'Requests', 'Gate', 'Widgets'],
},
```

Remove `'Reviews'` from the comms subItems array (change to `['Messages', 'Notes', 'Announcements']`).

**Step 2: Update entity-fields.ts**

Add entity field configs for the new review sub-entities:

```typescript
review_requests: {
  card: { title: 'client_id', subtitle: 'trigger_type', badge: 'channel', meta: ['sent_at'] },
  list: { primary: 'client_id', secondary: 'trigger_type', trailing: 'sent_at' },
  table: { columns: ['client_id', 'trigger_type', 'channel', 'sent_at', 'clicked_at', 'completed_at', 'drip_step'] },
  calendar: null,
  pipeline: null,
},

review_widgets: {
  card: { title: 'name', subtitle: 'layout_type', badge: 'min_rating', meta: ['max_reviews'] },
  list: { primary: 'name', secondary: 'layout_type', trailing: 'min_rating' },
  table: { columns: ['name', 'layout_type', 'min_rating', 'max_reviews', 'show_ai_summary'] },
  calendar: null,
  pipeline: null,
},
```

**Step 3: Create ReviewsTab shell**

```typescript
// Props: colors (from config), activeSubTab
// Layout:
//   Sub-tab bar: Inbox | Requests | Gate | Widgets (pill buttons, accentColor active)
//   Stat cards row: Total Reviews | Avg Rating | This Month | Pending Response
//   Content area: renders active sub-tab component
// Fetches review stats on mount for stat cards
```

**Step 4: Commit**

```bash
git add dashboard/src/lib/navigation.ts dashboard/src/lib/entity-fields.ts dashboard/src/components/reviews/ReviewsTab.tsx
git commit -m "feat: reviews top-level tab — star icon, sub-tabs shell, stat cards"
```

---

## Task 15: Review Inbox

**Files:**
- Create: `dashboard/src/components/reviews/ReviewInbox.tsx`
- Create: `dashboard/src/components/reviews/ReviewDetail.tsx`

**Context:** All reviews from all platforms in one list. Each row shows customer, stars, platform, date, status. Click to expand detail with response composer (manual, AI suggest, AI auto-pilot placeholder).

**Step 1: Build ReviewInbox list**

```typescript
// Props: colors
// Fetches from GET /api/data/reviews
// Layout:
//   Filter bar: Platform (all/google/facebook/direct/yelp) | Rating (all/5/4/3/2/1) | Status (all/new/replied/hidden)
//   Review list (card-style rows):
//     Each row: avatar/initial | customer name | star display (filled/empty) | platform icon | date | status pill | snippet
//     Click → opens ReviewDetail
// Platform icons: Google "G", Facebook "f", Yelp "Y", Direct "★"
// Status pills: new=blue, published=green, replied=gray, hidden=red
// Empty state: "No reviews yet. Send your first review request!"
```

**Step 2: Build ReviewDetail panel**

```typescript
// Props: review, colors, clientData (if matched)
// Layout (slide-over panel from right):
//   Top: customer name, star display, platform, date
//   Body: full review text
//   Contact match section:
//     If matched: "Matched to: Sarah Johnson" with link to client record
//       Client sidebar: visits, total spend, loyalty tier, last appointment
//     If unmatched: "Not matched" + [Link to Client] dropdown
//   Response section:
//     Tab bar: Manual | AI Suggest | Auto-pilot
//     Manual: text area + [Send Response] button
//     AI Suggest: [Generate Response] button → shows AI response in editable text area → [Send]
//       (placeholder — actual AI integration is Reputation Agent, separate build)
//     Auto-pilot: "Upgrade to Reputation Agent ($15/mo) for automatic responses"
//       with settings preview (star-based rules, delay, brand voice)
//   Actions: [Publish] [Hide] [Delete] buttons
```

**Step 3: Commit**

```bash
git add dashboard/src/components/reviews/ReviewInbox.tsx dashboard/src/components/reviews/ReviewDetail.tsx
git commit -m "feat: review inbox — list, filters, detail panel, response composer"
```

---

## Task 16: Review Gate Settings

**Files:**
- Create: `dashboard/src/components/reviews/ReviewGate.tsx`

**Context:** Progressive disclosure. Simple mode: toggle ON/OFF with smart defaults. Expanded mode: star threshold slider, platform checkboxes, feedback message editor, team notification settings.

**Step 1: Build the component**

```typescript
// Props: colors
// Fetches from GET /api/data/review-gate (creates default if none exists)
// Layout:
//   Card with rounded-2xl, p-6:
//     Header: "Review Gate" + large toggle switch (ON/OFF)
//     When OFF: "All reviews go directly to your inbox."
//     When ON:
//       Description: "Positive reviews (4-5 stars) are directed to leave public reviews. Lower ratings go to private feedback."
//       Expandable "Customize settings" link:
//         Expanded reveals:
//           1. Star threshold slider (1-5, shows current value):
//              Label: "Route to public review if rating is X stars or above"
//           2. Positive path platforms:
//              ☑ Google  ☑ Facebook  ☐ Yelp
//              Each needs the business's review page URL (text input when checked)
//           3. Negative path message:
//              Text area with default: "We're sorry to hear that..."
//              Preview button
//           4. Team notifications:
//              Toggle: "Notify team on negative feedback"
//              Channels: ☑ In-app  ☐ Email  ☐ SMS
//       [Save] button (accentColor)
// Saves via POST /api/data/review-gate
```

**Step 2: Commit**

```bash
git add dashboard/src/components/reviews/ReviewGate.tsx
git commit -m "feat: review gate — progressive disclosure, threshold slider, platform routing"
```

---

## Task 17: Review Requests

**Files:**
- Create: `dashboard/src/components/reviews/ReviewRequests.tsx`
- Create: `dashboard/src/app/api/reviews/send-request/route.ts`

**Context:** Event-triggered review request automation. Manual send, bulk campaigns. Drip follow-up (Day 1 SMS, Day 3 email, Day 6 final). Tracking links.

**Step 1: Build the settings + list component**

```typescript
// Props: colors
// Layout:
//   1. Automation settings card:
//      "Automatically request reviews after:"
//      ☑ Appointment completed — [2 hours] after — via [SMS + Email]
//      ☑ Invoice paid — [24 hours] after — via [Email]
//      Each row: toggle | trigger label | timing dropdown | channel dropdown
//      Follow-up drip toggle:
//        "Send follow-up reminders?"
//        Day 1: SMS | Day 3: Email | Day 6: Final email
//        "Stop when review is submitted"
//   2. Manual send card:
//      Client search/select dropdown + [Send Request] button
//   3. Request history table:
//      Columns: Client | Trigger | Channel | Sent | Clicked | Completed | Drip Step
//      Status: sent=blue, clicked=yellow, completed=green
//      Fetches from GET /api/data/review-requests
```

**Step 2: Build the send-request API**

```typescript
// POST /api/reviews/send-request
// Body: { client_id, trigger_type, channel }
// Creates review_request record with tracking_token
// Generates review link: /review/{subdomain}?token={tracking_token}
// Sends email (via Resend) and/or SMS (placeholder for Twilio) with review link
// Returns: { request_id, tracking_token }
```

**Step 3: Commit**

```bash
git add dashboard/src/components/reviews/ReviewRequests.tsx dashboard/src/app/api/reviews/send-request/
git commit -m "feat: review requests — automation settings, manual send, drip tracking"
```

---

## Task 18: Review Widgets

**Files:**
- Create: `dashboard/src/components/reviews/ReviewWidgetBuilder.tsx`
- Create: `dashboard/src/components/reviews/ReviewWidgetPreview.tsx`

**Context:** Visual widget builder with 4 layout types (list, grid, carousel, badge). Live preview. Brand Board colors. Generates embed code for external use + available as website editor section.

**Step 1: Build the widget builder**

```typescript
// Props: colors
// Fetches existing widgets from GET /api/data/review-widgets
// Layout:
//   Left panel (settings):
//     1. Widget name text input
//     2. Layout type selector (4 visual cards):
//        List | Grid | Carousel | Floating Badge
//        Each card shows mini preview icon
//     3. Filters:
//        Minimum rating: [4 stars ▾] dropdown
//        Max reviews: [10 ▾] dropdown
//        Platforms: ☑ Direct ☑ Google ☑ Facebook ☐ Yelp
//     4. AI summary toggle: "Show one-line AI summary at top"
//     5. [Save Widget] button
//   Right panel (live preview):
//     ReviewWidgetPreview component renders actual widget
//     Updates in real-time as settings change
//   Bottom:
//     "This widget is automatically available as a section in your website editor."
```

**Step 2: Build the widget preview**

```typescript
// Props: config (layout_type, min_rating, max_reviews, etc.), reviews[], colors
// Renders the actual widget exactly as it would appear on the website
// Layout types:
//   List: vertical stack of review cards
//   Grid: 2-3 column grid of review cards
//   Carousel: single review with left/right arrows, auto-rotate every 5s
//   Badge: floating compact badge — "★ 4.9 (127 reviews)" that expands on hover
// Each review card: customer initial/avatar, star display, review text (truncated), date
// AI summary: "4.9 stars from 127 happy clients" at top if enabled
// All colors from Brand Board (accentColor for stars, background, text)
```

**Step 3: Commit**

```bash
git add dashboard/src/components/reviews/ReviewWidgetBuilder.tsx dashboard/src/components/reviews/ReviewWidgetPreview.tsx
git commit -m "feat: review widget builder — 4 layouts, live preview, Brand Board colors"
```

---

## Post-Implementation

### Wire up portal page to new shell

**Files:**
- Modify: `dashboard/src/app/portal/[subdomain]/page.tsx`

Replace the existing ChaiBuilder widget rendering with the new PortalShell + section components. Keep the magic link auth flow, replace the content rendering:

```typescript
// 1. Import PortalShell + all 8 section components
// 2. Use URL path to determine active section (/portal/loyalty → PortalLoyaltySection)
// 3. Wrap in PortalShell with Brand Board config
// 4. Mount ChatWidget on every page
```

### Wire up Reviews tab to main dashboard

**Files:**
- Modify: the main dashboard layout/routing to render ReviewsTab when "reviews" tab is active

### Integration test checklist

- [ ] Portal login via magic link
- [ ] All 8 portal sections render with correct data
- [ ] Brand Board colors applied throughout portal
- [ ] Chat widget shows correct state (anonymous/returning/authenticated)
- [ ] Reviews tab visible in sidebar with star icon
- [ ] Review inbox lists reviews with filters
- [ ] Review gate toggle works (simple + expanded modes)
- [ ] Review requests can be sent manually
- [ ] Review widget preview matches selected layout
- [ ] Mobile responsive (portal bottom tab bar, review tab stacking)
