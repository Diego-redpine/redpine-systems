# GoHighLevel Platform Architecture — Deep Research

> Research date: 2026-02-24
> Sources: Official GHL documentation, third-party reviews, marketplace guides

---

## Table of Contents

1. [Unified Conversations Inbox](#1-unified-conversations-inbox)
2. [Phone Number Provisioning](#2-phone-number-provisioning)
3. [Reseller/SaaS Model](#3-resellersaas-model)
4. [Snapshots (Template System)](#4-snapshots-template-system)

---

## 1. Unified Conversations Inbox

### 1.1 Overview

GoHighLevel's Conversations module is a **unified omnichannel inbox** that consolidates all customer communications across SMS, email, WhatsApp, Facebook Messenger, Instagram DMs, Google Business Messages, web chat (Live Chat), and Voice AI into a single interface. Every message from every channel lands in one place, tied to the contact record.

### 1.2 Four-Panel UI Layout

The redesigned Conversations experience (launched 2025) uses a **four-panel layout**, all panels collapsible:

**Panel 1 — Inbox Panel (far left)**
- Three inbox modes:
  - **My Inbox**: Conversations assigned to you or that you follow
  - **Team Inbox**: All conversations in the account (requires full data access permissions)
  - **Internal Chat**: Private team-only discussions, completely separate from customer threads
- Users with "assigned data" access only see My Inbox and Internal Chat (not Team Inbox)

**Panel 2 — Chat List Panel**
- Displays all conversations based on the selected inbox/folder/filter
- Bulk actions: Mark as Read/Unread, Star/Unstar, Delete
- Sorting by activity date
- SLA timers appear on each conversation card (see section 1.6)
- Channel icon indicator per conversation

**Panel 3 — Message History Panel (center, largest)**
- The main reading and reply area
- **Multi-channel timeline**: Shows ALL messages from ALL channels in chronological order for that contact
  - Email, SMS, WhatsApp, Facebook/Instagram messages, and Internal Comments all appear in one unified thread
- Message-type filter at top-right lets you isolate specific channel types within the timeline
- Consistent date formatting (e.g., "Jan 5") across all message types

**Panel 4 — Right Panel (contact details sidebar)**
- Slim, collapsible panel with three tabs:
  - **Contact Tab**: Name, phone, email, owner, tags, campaigns, DND settings — editable in-place
  - **Appointments Tab**: Book new appointments, view upcoming/past, reschedule — all without leaving conversations
  - **Opportunity Tab**: Create/view/edit sales opportunities associated with the contact
- Also shows documents, payments, and activity history

### 1.3 Cross-Channel Reply from One Thread

**Yes, you can reply on any channel from the same thread.** The composer includes a **channel selector dropdown** that lets you switch between available channels (SMS, Email, WhatsApp, Facebook, Instagram, etc.) without leaving the conversation thread.

Key behaviors:
- **Channel persistence**: If you collapse and reopen the composer, it remembers the last channel you selected
- You can move a conversation from SMS to email mid-thread — just switch the channel in the composer
- **Internal Comments** option lets you add private notes (customer is NOT notified) within the same thread
- Keyboard shortcut: Cmd/Ctrl + Enter to send

The email composer specifically supports:
- Full-view and inline reply modes
- Text formatting toolbar
- File attachments (paste from clipboard supported)
- Quick send functionality

### 1.4 Channel Integration Requirements

Each channel has setup prerequisites before it appears in the inbox:

| Channel | Setup Required |
|---------|---------------|
| SMS | LC Phone or Twilio number purchased + A2P 10DLC registration |
| Email | LC Email or Mailgun configured |
| WhatsApp | Twilio WhatsApp Business Account connected (LC Phone does NOT support WhatsApp) |
| Facebook Messenger | Facebook page connected via OAuth |
| Instagram DMs | Instagram business account connected via Facebook |
| Google Business Messages | GBP connected |
| Live Chat | Chat widget installed on website |
| Voice AI | Voice AI agent configured |

### 1.5 Filtering and Organization

**Advanced Filter Builder** (accessible via filter icon):
- Rule-based filtering with AND/OR operators
- Filter conditions: Channel type, tags, conversation owner, date range, status
- AND = show conversations matching ALL conditions
- OR = show conversations matching ANY condition
- Filters can be saved as custom folders in the Inbox Panel

**Conversation Assignment**:
- Assign conversations to specific team members or departments
- Private internal notes for team coordination
- Tag-based routing and automation triggers

### 1.6 SLA Timer System

Response-time targets with visual countdown timers:

**Configuration**:
- Navigate to Conversations > Settings > SLA Settings
- Two modes: **Common SLA** (same target for all channels) or **Channel-Specific SLA** (individual targets per channel, e.g., 5 min for SMS, 2 hours for email)
- Define "Due Soon" threshold (warning) and "Overdue" threshold (breach)
- Configure whether workflow/AI auto-responses count as valid responses

**Visual States**:

| Color | State | Meaning |
|-------|-------|---------|
| Grey | Active | SLA on track, within allowed time |
| Orange | Due Soon | Approaching deadline |
| Red | Overdue | Response deadline exceeded |

**Management Features**:
- Filter conversations by SLA status (Active, Due Soon, Overdue)
- Sort by "Longest Overdue" or "Next SLA Target"
- Timers pause once an agent responds or marks conversation as read
- Different targets per channel (Email, SMS, Facebook, WhatsApp, TikTok)
- Only applies to new messages after enabling (not retroactive)

### 1.7 AI-Powered Features

- **AI-proposed responses**: Context-aware suggested replies based on tone and intent
- **Approve/Edit/Reject** workflow for AI suggestions
- Learns from team's previous answers to maintain consistency
- Conversation AI has a public API for custom integrations
- **AI intent detection** and lead scoring
- Auto-responses configurable per channel

### 1.8 All-in-One Chat Widget (Customer-Facing)

The chat widget that embeds on customer websites supports six channels:
- Live Chat, SMS/Email, WhatsApp, Facebook, Instagram, Voice AI
- Visitors see channel options in the header and can switch between any enabled channels
- Unified color scheme across all channels
- Contact form fields for email/WhatsApp interactions
- Chat sessions remain active until manually ended or closed by inactivity timeout

### 1.9 Custom Conversation Providers (API)

GHL has an extensible architecture for third-party channel integrations:

**Provider Types**:
1. SMS (Default Replacement) — replaces Twilio/LC Phone
2. SMS (Custom Channel) — additional SMS provider alongside native
3. Email (Default Replacement) — replaces Mailgun/LC Email
4. Email (Custom Channel) — additional email alongside native
5. Call Provider — adds call logging/voicemail (not VoIP replacement)

**Architecture**:
- Each provider registers via the Developer Marketplace
- Requires: Provider name, type, **Delivery URL** (webhook endpoint)
- System assigns a `conversationProviderId` on creation
- **Inbound messages**: Use the "Add Inbound Message API" (scope: `conversations/message.write`)
- **Outbound messages**: GHL sends webhook events to the provider's Delivery URL when a user sends a message
- Only the marketplace app that created the provider can update message statuses
- Custom providers require premium workflow actions; standard workflow modules are unsupported
- Email triggers currently unsupported for custom channels

### 1.10 Automation Integration

- Trigger workflows directly from conversations
- "Customer Replied" workflow trigger fires on any channel
- WhatsApp supports interactive messages (buttons, lists) from workflows
- Bulk messaging (with limits) via SMS or email with contact data merge fields
- Auto-tag contacts based on conversation actions
- Automated follow-ups and reminders triggered from conversation events

---

## 2. Phone Number Provisioning

### 2.1 LC Phone (Lead Connector Phone) — Overview

LC Phone is **GoHighLevel's proprietary telephony service** that powers SMS and calling natively within the CRM. It was created to eliminate the need for third-party Twilio integration, reducing onboarding friction.

**Key characteristics**:
- **Instant activation** — no manual Twilio setup required; calls and SMS work immediately after enabling
- Twilio runs underneath, but GHL abstracts it away entirely
- LC Phone is now the **recommended default** for all new sub-accounts
- Twilio remains supported as an alternative (can run alongside or instead of LC Phone)
- Migration path exists in both directions (LC Phone <-> Twilio)

### 2.2 Phone Number Purchasing Process

**Step-by-step for sub-accounts**:

1. Navigate to **Settings > Phone Systems**
2. Click **"+ Add Number"** > **"Add Phone Number"**
3. Set filters:
   - Country selection
   - Specific digits or phrases (vanity search)
   - Capabilities: SMS, MMS, Voice (toggle each)
   - Number type: **Local** or **Toll-Free**
4. Browse available numbers (click "Refresh Results" for more options)
5. Select desired number > click **"Proceed to Buy"**

**Number availability** depends on inventory through Twilio's number pool, which changes regularly. Popular area codes (212, 310, 415) have limited availability.

**Identity verification**: For +1 numbers on LC Phone-managed accounts, one-time identity verification via **Persona** is required (government-issued ID + live selfie).

**International numbers**: Require a regulatory bundle or address in the number's country (most countries outside US/Canada).

### 2.3 Pricing — Phone Numbers

| Type | Monthly Cost |
|------|-------------|
| Local number (US/Canada) | $1.15/month |
| Toll-free number (US/Canada) | $2.15/month |
| International | Follows Twilio regional pricing |

### 2.4 Pricing — SMS/MMS

**SMS (per segment, US/Canada)**:
- Outbound: **$0.00747** (includes 10% discount from $0.0083 list price)
- Inbound: **$0.00747**
- Messages over 160 characters split into multiple segments, each billed separately

**MMS (per segment, US/Canada)**:
- Outbound: **$0.0220**
- Inbound (local): **$0.0165**
- Inbound (toll-free): **$0.0200**

**International SMS**: Varies by country. Examples:
- Trinidad & Tobago outbound: $0.2992/segment
- Puerto Rico: $0.0420/segment

**Carrier surcharges** (additional per message):
- AT&T, T-Mobile, Verizon, US Cellular: $0.003–$0.01 range per message

### 2.5 Pricing — Voice Calls

**Outbound calls**: $0.0166/minute total
- USA portion: $0.0126/min (10% LC Phone discount)
- Client minutes: $0.004/min

**Inbound calls (answered on web/mobile/desk phone)**: $0.01165/minute
- USA incoming: $0.00765/min
- Client minutes: $0.004/min

**Inbound calls (forwarded to US phone number)**: $0.02/minute for both legs

**International forwarding**: Uses Twilio international rates (significantly higher)

**Additional charges**:
| Service | Cost |
|---------|------|
| Call Recording | $0.0025/minute |
| Call Recording Storage | $0.0005/minute/month |
| Call Transcription | $0.024/minute |
| Voicemail Drops | $0.0180/minute |
| Conference Calls | $0.0018–$0.0040/participant/minute |
| Answering Machine Detection | $0.0075/call |

### 2.6 A2P 10DLC Registration (Mandatory for US SMS)

**What it is**: "Application to Person, 10-Digit Long Code" — a phone number registration process mandated by US carriers via The Campaign Registry (TCR) for all business SMS/MMS to US recipients.

**Who needs it**: ANY business sending messages to US recipients, even from Canadian numbers.

**Three-step registration**:

1. **Brand Registration** — Submit business information for TCR review. Must be approved before Campaign registration.
2. **Campaign Registration** — Define messaging use cases (notifications, marketing, authentication, etc.)
3. **Carrier Propagation** — Approval spreads to carriers within 3+ business days

**Registration types and costs**:

| Type | Best For | Daily Segment Limit | One-Time Fee | Monthly Fee |
|------|----------|---------------------|-------------|-------------|
| Toll-Free | Any user, no Tax ID needed | None | $0 | $0 |
| Sole Proprietor | Solo businesses without EIN | 3,000 | $20.95 | $2.21/mo |
| Low Volume Standard | Tax ID holders, <6K segments/day | 6,000 | $20.95 | $1.70/mo |
| Standard | High-volume senders | No set limit | $65.05 | $12.00/mo |

**Approval timeline**:
- Brand registration: Minutes to 7 days
- Toll-free: Possible 2 days (not guaranteed)
- Standard: Typically 4–6 weeks
- Pro tip: Submit toll-free first while awaiting local number approval

**Consequences of non-registration**:
- Message filtering after initial sends
- Higher per-message carrier fees
- Risk of suspension
- Potential campaign revocation and carrier fines

**Compliance requirements**:
- Explicit opt-in consent required before messaging
- Opt-out rate must stay below 3%
- Consent checkboxes must be separate for marketing vs. non-marketing
- Consent checkboxes cannot be pre-selected
- TCR assigns trust scores determining throughput limits

### 2.7 LC Phone vs. Twilio — Key Differences

| Feature | LC Phone | Twilio Direct |
|---------|----------|---------------|
| Setup complexity | Instant activation, zero config | Requires API keys, manual setup, coding knowledge |
| US/Canada pricing | 10% cheaper than Twilio | Standard pricing |
| International pricing | Same as Twilio (no savings) | Standard pricing |
| WhatsApp support | **NOT supported** | Fully supported |
| Volume discounts | None | Available for high volume |
| Rebilling for agencies | Built-in via SaaS mode | Manual configuration |
| A2P compliance | Built-in tools (opt-out links, DND, error monitoring) | Manual setup |
| Migration | Can move numbers to/from Twilio | Can move numbers to/from LC Phone |
| International numbers | Supported (regulatory bundles needed) | Supported |
| Video/advanced features | Limited | Extensive API capabilities |

**Bottom line**: LC Phone is easier and cheaper for US/Canada SMS/Voice. Twilio is required for WhatsApp and provides more flexibility for international or advanced use cases.

### 2.8 Number Assignment to Users

- Navigate to **My Staff** > Edit user profile
- Expand **"Call & Voicemail Settings"**
- Use "Inbound Number" dropdown to assign an LC number
- **One-to-one mapping**: Only one LC number can be assigned to one user
- All incoming calls to that number route specifically to the assigned user

### 2.9 Default Phone Preferences for New Sub-Accounts

Agency-level settings control whether new sub-accounts default to LC Phone or Twilio. This can be configured globally so all new accounts automatically provision with the preferred phone system.

---

## 3. Reseller/SaaS Model

### 3.1 GoHighLevel Pricing Tiers

| Plan | Price | Sub-Accounts | Key Features |
|------|-------|-------------|--------------|
| Starter | $97/month | 3 | Basic CRM, funnels, limited features |
| Unlimited (Freelancer) | $297/month (or $2,970/year) | Unlimited | Full platform, no white-labeling, basic rebilling |
| Agency Pro | $497/month (or $4,970/year) | Unlimited | **SaaS Mode**, white-labeling, markup rebilling, full reselling |

### 3.2 What is SaaS Mode?

SaaS Mode (available on the $497 Agency Pro plan) transforms GoHighLevel into a **white-label platform that agencies resell as their own software**. From the client's perspective, it appears to be the agency's proprietary CRM — no trace of HighLevel branding is visible.

### 3.3 White-Labeling — What Gets Customized

| Element | Customizable? |
|---------|---------------|
| Login domain (custom URL) | Yes — white-labeled desktop app |
| API domain URL (system-generated links) | Yes |
| Logo | Yes (agency logo everywhere) |
| Branding throughout UI | Yes |
| Email sender domain | Yes |
| Mobile app (custom branded) | Yes (separate setup) |
| Client-facing dashboard | Yes |
| All HighLevel references | Completely removed |

### 3.4 Sub-Account Architecture

**Hierarchy**: Agency Account > Sub-Accounts (Locations)

Each sub-account is a **completely isolated workspace**:
- Own CRM database (contacts, records)
- Own pipelines and opportunities
- Own funnels and websites
- Own calendars
- Own email and SMS automations
- Own workflows
- Own integrations and billing settings
- Own user accounts with role-based permissions

**Critical distinction**: "User accounts control who can access features. Sub-accounts control what data exists." Nothing is shared between sub-accounts unless explicitly copied (via snapshots).

**Data isolation**: Sub-accounts are siloed — contacts, conversations, integrations, users, and reporting data are completely separate. No cross-account data leakage.

### 3.5 SaaS Configurator — Feature Gating

The SaaS Configurator lets agencies create **tiered plans** with different feature sets:

**How it works**:
- Create up to **20 plans** per agency
- Each plan has a **feature set** that controls what the client can access
- **Location permissions** are applied to the sub-account based on the purchased plan
- **Feature inheritance**: Higher-tier plans automatically inherit all features from lower tiers
- Plans are organized into **categories** (pricing groups) with consistent currency
- Drag-and-drop reordering to position plan hierarchy

**Per-plan configuration**:
- Pricing (monthly/annual)
- Trial period (if any)
- Phone/SMS credits included
- Snapshot to auto-apply on account creation
- Feature toggles (enable/disable specific platform features)
- Rebilling settings
- Setup fees

**Feature gating enforcement**: When a client purchases a specific plan tier, the sub-account's permissions are automatically locked to that plan's feature set. Users within the sub-account cannot have more permissions than the sub-account level allows.

**Upgrading/downgrading**: Plan-based permissions add or remove features immediately when changed. Existing customers retain current entitlements if plans are reorganized.

### 3.6 Automated Client Onboarding Flow

When a customer purchases a SaaS plan via a sales funnel:

1. A **location/sub-account** is automatically created using customer name
2. A **user account** is generated with auto-assigned password
3. **Location permissions** match the purchased plan's feature set
4. **SaaS Mode** is automatically enabled on the sub-account
5. **Phone rebilling** activates per configurator settings
6. **Snapshot** (if configured) is auto-loaded with pre-built funnels, workflows, etc.
7. **Welcome email** sent with login credentials

Zero manual work for the agency — fully automated account provisioning.

### 3.7 Rebilling & Wallet System

**Three-tier billing flow**: HighLevel -> Agency -> Client

**Wallet system**: A pre-loaded credit wallet that auto-recharges from the agency's card on file. When sub-accounts use LC services (email, phone, AI), the usage deducts from the wallet. Below a minimum threshold, auto-recharge kicks in.

**Three rebilling scenarios**:

| Mode | Available On | How It Works |
|------|-------------|--------------|
| No Rebilling | $297/$497 | Agency wallet pays all sub-account usage; clients aren't billed separately |
| Rebilling WITHOUT Markup | $297/$497 | Sub-accounts charged same amount agency pays GHL; cost recovery only |
| Rebilling WITH Markup | **$497 only** | Agency adds profit margin on top of GHL's costs |

**Markup details**:
- $297 plan: Default 1.05x markup (5%, just covers Stripe fees)
- $497 plan: Custom markup — agency sets any multiplier for profit
- Configurable per sub-account OR globally in SaaS Configurator

**Rebillable services**:
- SMS/MMS messaging
- Voice calls
- Email sending
- Phone numbers
- AI features (Conversation AI)
- WordPress hosting
- Yext (listings management)
- WhatsApp

**Client visibility**: Clients can view their credit balance, usage/charges, and configure recharge settings via Settings > Company Billing in their sub-account.

### 3.8 Revenue Model Math

**Typical agency economics**:

| Metric | Amount |
|--------|--------|
| Agency pays GHL | $497/month |
| Charge per client | $297–$997/month |
| Example: 10 clients at $297 | $2,970/month revenue |
| Profit before phone costs | $2,473/month |
| Additional profit from phone markup | Variable (usage-based) |

**Phone rebilling profit example**: If LC Phone costs $0.00747/segment and agency marks up 2x, they earn ~$0.00747 profit per text sent by their client.

### 3.9 Payment Infrastructure

- **Payment processor**: Stripe only (PayPal not supported)
- **Setup**: Agency connects their Stripe account, creates product in Stripe, copies Stripe Product ID into SaaS Configurator
- **Currency**: Multi-currency available (edit in Stripe, then manually adjust GHL product settings)
- **Add-ons**: Optional one-time setup fees per plan
- **Subscription management**: Upgrades/downgrades handled through plan tier changes

### 3.10 What Agencies See vs. What Clients See

**Agency Dashboard**:
- All sub-accounts listed with overview metrics
- SaaS Configurator (plans, pricing, features, rebilling)
- Snapshot management
- Global settings, billing, Twilio/LC Phone configuration
- Client usage monitoring
- Sub-account creation/deletion
- Snapshot deployment

**Client Dashboard**:
- Their white-labeled sub-account only
- Only features enabled by their plan tier
- Their own CRM, funnels, workflows, calendars
- Company Billing page (credit balance, usage, recharge)
- No awareness of HighLevel or other sub-accounts

---

## 4. Snapshots (Template System)

### 4.1 What is a Snapshot?

A Snapshot is a **reusable template** that captures all the configuration and structural elements from a sub-account. It's a "digital blueprint" that can be loaded into other sub-accounts to instantly replicate an entire business setup — funnels, automations, pipelines, and more.

Think of it as: **Clone everything except the actual customer data.**

### 4.2 Complete List of What's INCLUDED in Snapshots

**Communication Assets**:
- Email templates (three types: Marketing > Emails, Marketing > Text & Email Templates, Marketing > HTML Builder)
- SMS templates
- Message templates
- Custom communications settings

**Websites & Funnels**:
- Funnels (all pages)
- Landing pages
- Websites
- Membership sites/products

**Automation & Workflows**:
- Workflows (with noted limitations)
- Trigger links
- Triggers (loaded in **Draft mode** — must manually activate)
- Campaigns (loaded **published** by default)

**CRM Structure**:
- Pipelines (with stages, probability weighting)
- Custom fields (**keys only** — values do NOT transfer)
- Custom values (**keys only** — data values do NOT transfer)
- Tags
- Folders

**Scheduling & Forms**:
- Calendars
- Forms
- Surveys

**Organization**:
- Teams (loaded **inactive** — must manually activate)
- Marketplace integrations

### 4.3 Complete List of What's EXCLUDED from Snapshots

| Excluded Item | Why |
|---------------|-----|
| Contacts | Privacy/data isolation |
| Conversations | Privacy |
| Appointments | Data, not configuration |
| Integrations (Stripe, Google, Facebook) | Security — OAuth tokens can't be cloned |
| Users | Security |
| Reporting data | Historical, not structural |
| Reputation data | Account-specific |
| Products created in Funnels | Stripe product IDs are account-specific |
| Tracking codes | Account-specific |
| Chat widget customizations | Account-specific |
| Tasks / manual actions | Active data, not template |
| Domain configurations | Account-specific |

### 4.4 Snapshot Creation Process

**Step-by-step**:

1. Navigate to **Agency View > Account Snapshots**
2. Click **"+ Create New Snapshot"**
3. Name the snapshot descriptively (e.g., "Spa Lead Generation Setup")
4. Choose the **source sub-account** (the account with the assets you want to capture)
5. **Asset selection**:
   - "Select All" to grab everything
   - Or expand categories to handpick specific items (e.g., only workflows + funnels, not calendars)
6. Click Create
7. **Retry feature**: If any categories fail to load, retry without restarting the entire process

**Updating snapshots**: Use the **Refresh** option to modify existing snapshots — add or remove assets after creation.

### 4.5 Snapshot Deployment

**Three deployment methods**:

1. **Direct application**: Load snapshot into any sub-account from the Agency dashboard
2. **Share link**: Generate a shareable URL that other GHL agencies can use to import your snapshot
3. **Auto-deploy via SaaS Configurator**: Attach a snapshot to a SaaS plan — when a client purchases that plan, the snapshot auto-loads into their new sub-account

**Reusability**: One snapshot can be applied to unlimited sub-accounts.

### 4.6 Assets Protected Snapshots (IP Protection)

A feature to prevent unauthorized duplication and re-sharing of snapshot contents:

- When creating a share link, enable the **"Assets Protection"** checkbox
- Recipients **cannot re-share or re-snapshot** the protected assets
- Protected items are marked as "Assets protected" and excluded from further snapshots
- Addresses the problem of customers reselling others' assets
- Preserves commercial value of intellectual property investments

### 4.7 Industry-Specific Snapshot Examples

**Free starter snapshots** (included with every GHL account):
- Basic templates for fitness, real estate, coaching, local business

**Common industry snapshots available in the marketplace**:

| Industry | Typical Contents |
|----------|-----------------|
| Dental | "Free Whitening for New Patients" funnel, appointment workflow, review request sequence, patient nurture emails |
| Real Estate | Home buyer lead capture forms, property listing funnels, "Home Buyer Lead Nurture" email/SMS/appointment sequence |
| Fitness | Lead capture pages, membership funnels, class booking calendar, automated follow-up messages, membership renewal workflows |
| Restaurants | Online ordering funnels, reservation calendars, review request automations |
| Coaching | Course/membership funnels, onboarding workflows, client intake forms |
| SaaS | Trial sign-up funnels, onboarding email sequences, churn prevention workflows |
| Spa/Med Spa | Service booking calendar, treatment package funnels, review collection |

### 4.8 Snapshot Marketplace & Distribution

**Distribution channels**:

| Channel | Description | Pricing |
|---------|-------------|---------|
| **HighLevel In-App Marketplace** | Official platform, free and paid options | Varies |
| **HighLevel Shop** | Official store | Starting at $297 |
| **Third-party directories** (ghlcentral.com, topghlsnapshots.com, etc.) | Curated marketplaces with hundreds of options | $97–$997+ |
| **Individual provider websites** | Agencies selling their own snapshots directly | Custom pricing |

**Top snapshot providers**:
- **Extendly**: "Ultimate AI Agency In-a-Box" — white-labeled onboarding, 1 year of updates, 3 months free support
- **HL Snaps by HL Pro Tools**: Real estate, fitness, restaurants — one-click install, 60-day refund, starting at $97
- **SaaS Coaching Academy**: Industry packs for real estate, SaaS, local business
- **Vitt Muller Premium Snapshots**: Reputation management system, multi-channel nurture — starting at $997

### 4.9 How Agencies Use Snapshots in Practice

**"SaaS-in-a-Box" model**:
1. Agency builds a master sub-account for a specific niche (e.g., dental practices)
2. Configures everything: funnels, workflows, pipelines, email sequences, calendars, forms
3. Creates a snapshot from that master account
4. Attaches snapshot to a SaaS plan in the configurator
5. Sells the plan to dental practices at $297–$997/month
6. Each new client gets the full setup instantly on sign-up
7. Agency customizes branding per client (logo, colors, business name)

**Key benefit**: "Build once, deploy to 10, 100, or 1,000 clients" — turning one-time service work into recurring SaaS revenue.

### 4.10 Snapshot Limitations and Gotchas

1. **Triggers load in Draft mode** — must be manually activated after import
2. **Campaigns load published** — may fire immediately if contacts exist
3. **Custom Values only copy keys, not data** — values must be re-entered
4. **Teams load inactive** — must be manually activated
5. **Funnel products don't transfer** — must recreate Stripe products in each account
6. **No integration tokens** — Stripe, Google, Facebook must be reconnected per account
7. **Chat widget customizations don't transfer** — must reconfigure per account
8. **Domain configs don't transfer** — each account needs its own domain setup

---

## Key Takeaways for Red Pine

### What GHL Does Well (and Red Pine Should Match or Beat)

1. **Unified Conversations**: Single-thread, multi-channel conversations with channel switching in the composer is the gold standard. The four-panel layout is well-designed. SLA timers are a smart feature for service businesses.

2. **Phone Provisioning**: LC Phone's instant activation and abstraction of Twilio complexity is excellent UX. The A2P compliance tooling is mature.

3. **Agency/Reseller Model**: The SaaS Configurator with feature gating, automatic account provisioning, and rebilling with markup is the core of their business model. It's what makes GHL an "agency platform" vs. a "business platform."

4. **Snapshots**: The ability to capture an entire account configuration and redeploy it instantly is powerful for scaling. IP protection on snapshots is smart.

### Where Red Pine Differentiates

1. **Red Pine is B2B-direct, not agency-reseller**: We don't need the SaaS configurator or sub-account hierarchy. Each business is a first-class citizen, not a "sub-account" managed by an agency middleman.

2. **AI-first onboarding vs. snapshot-based**: GHL relies on snapshots (manual templates built by agencies) for setup. Red Pine uses AI to generate unique configurations per business — no template marketplace needed.

3. **Website builder**: GHL's website/funnel builder is drag-and-drop but separate from the CRM. Red Pine's FreeForm editor is Canva-style with AI chat editing and portable components/embeds.

4. **Marketplace model**: GHL's marketplace is for agencies buying/selling snapshots. Red Pine's marketplace connects business owners with freelancers — fundamentally different value proposition.

5. **Pricing**: GHL's $97-$497/month is targeted at agencies. Red Pine's $29/month targets individual business owners directly.

### Conversations Inbox — Implementation Notes

For building Red Pine's conversation system:
- The four-panel layout is the right pattern
- Channel selector in the composer is essential
- Per-contact threading across channels is the correct data model
- SLA timers are valuable for service businesses but can be a later addition
- Internal team comments within threads are useful
- The Custom Conversation Provider API pattern is worth studying for extensibility

---

## Sources

- [All-in-One Chat Widget](https://help.gohighlevel.com/support/solutions/articles/155000004779-how-to-use-the-all-in-one-chat-widget)
- [New Conversations Experience](https://help.gohighlevel.com/support/solutions/articles/155000006610-getting-started-with-the-new-conversations-experience)
- [Conversation Filters & Bulk Actions](https://help.gohighlevel.com/support/solutions/articles/48001222121-overview-of-conversation-filters)
- [Right Panel in Conversations](https://help.gohighlevel.com/support/solutions/articles/155000001321-right-panel-expandable-sidebar-in-conversations)
- [Conversation SLAs](https://help.gohighlevel.com/support/solutions/articles/155000006745-conversations-how-to-setup-track-slas)
- [2-Way SMS and Social Messaging](https://www.gohighlevel.com/post/highlevel-2-way-sms-and-social-messaging-features)
- [Conversation Provider API](https://marketplace.gohighlevel.com/docs/marketplace-modules/ConversationProviders/index.html)
- [LC Phone System Overview](https://help.gohighlevel.com/support/solutions/articles/48001223546-what-is-lc-lead-connector-phone-system-)
- [LC Phone Pricing & Billing Guide](https://help.gohighlevel.com/support/solutions/articles/48001223556-lc-phone-pricing-billing-guide)
- [Phone Number Purchasing](https://help.gohighlevel.com/support/solutions/articles/155000003226-how-to-purchase-a-phone-number-in-a-sub-account)
- [A2P 10DLC Registration](https://help.gohighlevel.com/support/solutions/articles/155000002380-what-is-a2p-10-dlc-brand-and-campaign-registration)
- [LC Phone vs Twilio Comparison](https://www.centripe.ai/lc-phone-vs-twilio)
- [SaaS Mode Full Setup Guide](https://help.gohighlevel.com/support/solutions/articles/48001184920-saas-mode-full-setup-guide-faq)
- [SaaS Configurator — Plan Category and Level](https://help.gohighlevel.com/support/solutions/articles/155000006506-saas-configurator-modify-plan-category-and-plan-level)
- [Rebilling, Reselling, and Wallets](https://help.gohighlevel.com/support/solutions/articles/155000002095-rebilling-reselling-and-wallets-explained)
- [Phone Rebilling Configuration](https://help.gohighlevel.com/support/solutions/articles/48001177740-activate-saas-mode-request-payment-and-configure-twilio-rebilling)
- [Sub-Account Guide](https://ghl-services-playbooks-automation-crm-marketing.ghost.io/highlevel-sub-account-guide-setup-transfer-optimization-for-agencies/)
- [White Label CRM](https://www.gohighlevel.com/white-label-crm)
- [GHL SaaS Mode Guide 2026](https://ghlbuilds.com/what-is-ghl-saas/)
- [Snapshots Overview](https://help.gohighlevel.com/support/solutions/articles/48000982511-snapshots-overview)
- [Creating Snapshots](https://help.gohighlevel.com/support/solutions/articles/48000982512-creating-new-snapshots)
- [IP Protected Snapshots](https://help.gohighlevel.com/support/solutions/articles/155000002852-ip-protected-snapshots)
- [Snapshots SaaS-in-a-Box Guide](https://ghl-services-playbooks-automation-crm-marketing.ghost.io/gohighlevel-snapshots-explained-how-agencies-sell-saas-in-a-box/)
- [Best GHL Snapshots 2026](https://ghlcentral.com/best-go-highlevel-snapshots/)
- [GHL Marketplace & Snapshots Guide](https://fuelyourdigital.com/post/go-high-level-marketplace-snapshots-the-2025-expert-guide/)
- [GHL Conversations Management](https://ghl-services-playbooks-automation-crm-marketing.ghost.io/gohighlevel-conversations-manage-all-client-messages-in-one-place/)
- [GoHighLevel CRM Explained 2026](https://www.digital4design.com/blog/gohighlevel-crm-explained/)
- [GHL Pricing Plans Explained](https://passivesecrets.com/gohighlevel-pricing-plans/)
- [GHL SMS Pricing 2026](https://leadsflex.com/how-much-does-ghl-charge-for-text-messages/)
