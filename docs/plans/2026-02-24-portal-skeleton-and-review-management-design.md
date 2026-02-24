# Design: Portal Skeleton + Review Management

**Date:** 2026-02-24
**Sources:** Sticky #11 (Portal), Sticky #6 (Reviews), Research #16 (Client Portal Ecosystems), Research #14 (GHL Review Management)
**Status:** Approved

---

## 1. Portal Skeleton — Architecture

### Route Structure

Portal is **authenticated routes on the business website** (same domain, Brand Board colors, layout system). Not a separate `site_projects` entity.

```
luxe-nails.redpine.systems/              → Public website (existing)
luxe-nails.redpine.systems/portal        → Portal landing (requires auth)
luxe-nails.redpine.systems/portal/account      → Profile & preferences
luxe-nails.redpine.systems/portal/history      → Payment history + "Book Again"
luxe-nails.redpine.systems/portal/loyalty      → Points, tier, progress bar
luxe-nails.redpine.systems/portal/messages     → Two-way chat + announcements
luxe-nails.redpine.systems/portal/reviews      → Leave & view reviews
luxe-nails.redpine.systems/portal/cards        → Saved payment methods
luxe-nails.redpine.systems/portal/notifications → Notification preferences
luxe-nails.redpine.systems/portal/book         → Book appointment / reorder
```

### Auth Flow

- Magic link login (email or SMS — no password)
- Session stored in `portal_sessions` (already exists)
- Cookie set on website domain for chat widget recognition
- Family accounts: one login, profile switcher for dependents

### Layout

Every `/portal/*` page shares a universal shell:
- **Top bar**: Business logo (from Brand Board), client name + avatar, notification bell
- **Side nav** (mobile = bottom tab bar): icons for each portal section
- **Colors/fonts**: 100% from Brand Board config — no portal-specific theming

### Auto-Generation (Shopify Pattern)

When a business completes onboarding, portal routes auto-generate. `shouldHavePortal()` returns `true` for ALL business types. `getPortalPages()` returns the universal skeleton with industry-specific config flags (not completely different page sets).

The skeleton is universal — every business gets the same 8 core sections. The template controls **flavor**:

| Skeleton Section | Config Flags per Industry |
|-----------------|--------------------------|
| Account | `preferenceFields`: salon gets color formula/allergies, lawn care gets gate code/property notes, restaurant gets dietary prefs, gym gets fitness goals |
| History | `primaryAction`: "Book Again" vs "Reorder" vs "Schedule Again" vs "Book Class" |
| Loyalty | Same for all — reads from existing `loyalty_members` + `loyalty_config` |
| Messaging | `chatProminence`: 'primary' (salon/spa) or 'secondary' (lawn care/contractor) |
| Reviews | `reviewPrompt`: "Rate your visit" / "Rate the service" / "Rate your meal" |
| Cards | Same for all — Stripe saved payment methods |
| Notifications | `defaultCategories`: which notification types are on/off by default |
| Book/Reorder | `bookingMode`: 'service' / 'class' / 'menu' / 'scheduler' |

---

## 2. Portal Skeleton — The 8 Sections

### 2a. Account/Profile
- Name, email, phone, avatar upload
- Industry-specific preferences stored in `custom_fields` JSONB (template sets which fields appear)
- Family members list (add/remove dependents)
- Password-less — magic link only, "Send me a new login link" button

### 2b. Payment History
- List of past invoices from `invoices` table, filtered by this client
- Each row: date, service/product name, amount, status (paid/refunded)
- **"Book Again"** button on appointment-type invoices → pre-fills booking with same service + staff
- **"Reorder"** button on product-type invoices → adds to cart
- Tap any invoice → receipt detail view (downloadable PDF)

### 2c. Loyalty Bar
- Reads from existing `loyalty_members` table (points, tier, total_orders, total_spent_cents)
- Reads reward config from `loyalty_config` (points_per_dollar, reward_threshold, reward_value)
- Visual progress bar: current points → next reward threshold
- Tier badge (bronze/silver/gold) with current tier highlighted
- "Points earned this month" summary
- Available rewards shown with one-tap redeem
- **No loyalty engine changes** — display only, upgrade separately

### 2d. Messaging
- **Two-way chat**: same `chat_conversations` + `chat_messages` tables
- Conversation linked to `client_id` (authenticated)
- Real-time via polling (Supabase realtime upgrade path later)
- **Announcements feed**: business pushes updates — read-only, separate from chat
- Template controls prominence: `chatProminence: 'primary'` (salon) = chat front-and-center, `'secondary'` (lawn care) = announcements prominent with chat accessible under "Contact"

### 2e. Reviews
- Client can leave a review (star rating + text)
- Shows their past reviews with business responses
- If review gate ON: positive submission → "Thanks! Would you also leave us a review on Google?" with direct link. Negative → private feedback to business only
- Integrates with loyalty: if business has enabled points-for-reviews, shows "Earn X points for a review" nudge

### 2f. Saved Cards
- Apple Wallet visual style — card showing last 4 digits, brand logo (Visa/MC/Amex), expiry
- Powered by Stripe customer payment methods (already integrated)
- Add/remove cards, set default payment method
- Cards work for booking deposits, invoices, and product purchases

### 2g. Notification Preferences
- Toggle matrix: email (on by default), SMS (opt-in), push (when PWA ready)
- Categories: Booking reminders, Payment receipts, Loyalty updates, Promotions, Messages
- Frequency: immediate vs. daily digest for promotions
- One-tap "Pause all" for vacation mode

### 2h. Book / Reorder
- Full booking flow embedded in portal (service selection → staff → time → confirm)
- Reads from existing booking system
- Pre-fills saved preferences (favorite staff, usual service)
- "Your usual" shortcut at top if they have 3+ bookings of the same service
- Payment via saved card, one-tap confirm

---

## 3. Adaptive Chat Widget

One widget, three states — embedded on every page of the website:

| State | Detection | Behavior |
|-------|-----------|----------|
| **Anonymous visitor** | No cookie, no session | "Hi! How can we help?" → name/email form → creates `chat_conversation` with visitor metadata → sets cookie |
| **Returning visitor** | Cookie detected, no portal session | "Welcome back!" → resumes last conversation → no form required |
| **Logged-in client** | Portal session detected | "Hey Sarah!" → full client context, loyalty tier → chat = portal messaging thread |

### Merge Logic
When a visitor (State 1/2) creates a portal account, match by email/phone → link existing `chat_conversations` to their `client_id`. Business owner sees one continuous thread.

### Receptionist Agent
$15/mo add-on handles auto-replies across all three states through the same conversation system.

---

## 4. Review Management — Architecture

### Sidebar Placement
New top-level sidebar tab: **"Reviews"** with **star icon**

### Sub-Sections
Rendered as sub-tabs within the Reviews tab (consistent with how People/Money tabs work):

```
Reviews (star icon)
├── Inbox        → All reviews, all platforms, one view
├── Requests     → Outbound review request campaigns
├── Gate         → Review routing settings
├── Widgets      → Review display widgets for website
└── (Analytics)  → Stat cards + trends inline, per Sticky #12
```

---

## 5. Review Inbox

- All reviews in one list: Google, Facebook, Yelp, direct (portal), email-requested
- Each review row: customer name, star rating, platform icon, date, snippet, status badge (new/replied/hidden)
- **Contact matching**: fuzzy name match + email/phone + time correlation → links review to client record. Shows "Matched to: Sarah Johnson" or "Unmatched" with manual link option
- Click a review → expanded view with:
  - Full review text
  - Client history sidebar (if matched): visits, spend, loyalty tier
  - Response composer with three modes:
    1. **Manual** — type response, send to platform
    2. **AI Suggest** — AI generates response using business context (Brand Board voice, services, client history). Edit before sending. Included in platform.
    3. **AI Auto-pilot** — Reputation Agent ($15/mo). Auto-responds based on star rating rules, configurable delay, brand voice training
- Platform integration: Google + Facebook read/write at launch. Other platforms read-only (owner pastes review page URL)
- Reviews also appear in Comms inbox as notification type (review notification type already exists in NotificationPanel)

---

## 6. Review Gate

### Progressive Disclosure Design

**Simple mode** (default — what 90% of users need):
- Toggle: ON/OFF
- Label: "Positive reviews (4-5 stars) are directed to leave public reviews. Lower ratings go to private feedback."
- Link: "Customize settings"

**Expanded mode** (click "Customize settings"):
- Star threshold slider (1-5, default: 4)
- Positive path: checkboxes for Google, Facebook, Yelp (which platforms to direct to)
- Negative path: editable private feedback message
- Team notification toggle: on/off, via email / in-app / SMS

### Gate Activation Points
The gate activates when clients leave reviews through:
- Portal review section
- Post-appointment email/SMS review request
- QR code at physical location
- Review request link

---

## 7. Review Requests

### Event-Triggered Automation

| Trigger | Default Timing | Channel |
|---------|---------------|---------|
| Appointment completed | 2 hours after | SMS + email |
| Invoice paid | 24 hours after | Email |
| Manual send | Immediate | Owner chooses |
| Bulk campaign | Scheduled | Email |

### Request Flow
1. Client receives message: "How was your visit with [staff name]?"
2. Link goes to portal review page (if account exists) or branded review landing page (if not)
3. Review gate routes the response
4. Follow-up drip: Day 1 SMS, Day 3 email, Day 6 final email. Stops when review submitted (tracking link detects click)

### Pre-Built Templates
Industry-specific request messages (nail salon ≠ contractor). Business can edit.

---

## 8. Review Widget

- Drag-and-drop section in the website editor (not separate embed code)
- **4 layouts at launch**: List, Grid, Carousel, Floating Badge
- Fully styled from Brand Board — no mismatched colors
- Filters: minimum star rating, max reviews shown, platforms included
- AI summary option: one-line summary at top ("4.9 stars from 127 happy clients")
- Auto-updates when new reviews come in
- "Write a Review" button → routes through review gate

---

## 9. Integration Loop: Portal + Reviews

```
Client visits business
       ↓
Appointment completes → auto review request (Reviews)
       ↓
Client opens portal → sees "Leave a review" nudge (Portal)
       ↓
Review gate routes response (Reviews)
       ↓
Points awarded for review (Portal loyalty bar updates)
       ↓
Business responds from Review Inbox (Reviews)
       ↓
Client sees response in Portal reviews section (Portal)
       ↓
Widget shows review on public website (Reviews)
       ↓
New visitor sees reviews → books appointment → cycle repeats
```

---

## 10. Database Changes

### New Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `review_gate_config` | Per-business gate settings | `user_id`, `enabled`, `star_threshold` (default 4), `positive_platforms` (JSONB array), `negative_message` (text), `notify_team` (bool), `notify_channels` (JSONB) |
| `review_requests` | Outbound request tracking | `user_id`, `client_id`, `trigger_type` (enum), `channel` (enum), `sent_at`, `clicked_at`, `completed_at`, `review_id` (FK), `drip_step` (int) |
| `review_widgets` | Widget display configs | `user_id`, `layout_type` (enum: list/grid/carousel/badge), `min_rating` (int), `max_reviews` (int), `platforms` (JSONB), `show_ai_summary` (bool), `style_overrides` (JSONB) |

### Existing Table Modifications

| Table | Change |
|-------|--------|
| `reviews` | Add: `client_id` (FK to clients — contact matching), `platform_review_id` (text — external ID), `is_gated` (bool), `request_id` (FK to review_requests — attribution) |
| `chat_conversations` | Add: `visitor_cookie_id` (text — pre-auth matching), `source` (enum: 'widget_anonymous', 'widget_returning', 'portal', 'sms', 'email') |
| `portal_sessions` | Add: `cookie_id` (text — links to chat widget cookie for session merge) |

### No Changes To
`loyalty_config`, `loyalty_members`, `invoices`, `clients` — portal reads these as-is.

---

## 11. Navigation Changes

### Sidebar Addition
Add "Reviews" as a top-level tab in `navigation.ts`:
- Icon: star (from `nav-icons.tsx`)
- Section: Operations (after Comms)
- Sub-items: Inbox, Requests, Gate, Widgets

### Portal (No Sidebar Change)
Portal routes are client-facing on the website. They don't appear in the business owner's sidebar. The owner manages portal settings through existing Site tab or Settings.

---

## 12. What's NOT in This Build

- No multi-platform write (Google + Facebook write only, others read-only)
- No video testimonials
- No NPS surveys (separate feature)
- No competitor analysis (moral stance — no comparative reporting)
- No Apple Wallet pass (loyalty upgrade, separate later)
- No Receptionist Agent AI logic (just the hook point — agent built separately)
- No cross-business universal identity (Tier 3, post-launch)
- No loyalty engine upgrades (portal just displays what exists)
- No real-time websockets (polling first, Supabase realtime upgrade path)
