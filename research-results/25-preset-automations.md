# Research #25: Pre-Set Automations for Red Pine OS

**Research Date:** 2026-02-24
**Purpose:** Study how major platforms provide pre-built automations; design Red Pine's toggle-on/off automation system per industry family
**Sources:** GoHighLevel, HubSpot, Mailchimp, ActiveCampaign, Zapier, Monday.com, Keap/Infusionsoft, plus industry-specific platforms (GlossGenius, Vagaro, WellnessLiving, ServiceTitan, Housecall Pro, HoneyBook, Klaviyo)

---

## Table of Contents

1. [Platform-by-Platform Analysis](#1-platform-by-platform-analysis)
   - 1.1 GoHighLevel
   - 1.2 HubSpot
   - 1.3 Mailchimp
   - 1.4 ActiveCampaign
   - 1.5 Zapier
   - 1.6 Monday.com
   - 1.7 Keap/Infusionsoft
2. [Cross-Platform Patterns & Best Practices](#2-cross-platform-patterns--best-practices)
3. [Industry Automation Blueprints](#3-industry-automation-blueprints)
   - 3.1 Beauty & Body
   - 3.2 Health & Wellness
   - 3.3 Food & Beverage
   - 3.4 Home Services
   - 3.5 Professional Services
   - 3.6 Creative Services
   - 3.7 Education & Childcare
   - 3.8 Automotive
   - 3.9 Retail & Boutique
4. [Universal Automations (All Industries)](#4-universal-automations-all-industries)
5. [Red Pine Implementation Spec](#5-red-pine-implementation-spec)
6. [Database Schema Proposal](#6-database-schema-proposal)
7. [Key Takeaways](#7-key-takeaways)

---

## 1. Platform-by-Platform Analysis

### 1.1 GoHighLevel

**Source:** [Template Library for Workflows](https://help.gohighlevel.com/support/solutions/articles/155000005613-template-library-for-workflows), [Workflow Recipes](https://gohighlevele.com/highlevel-help/highlevel-workflow-recipes/), [GHL Templates Guide 2025](https://gohighlevelexpertteam.com/gohighlevel-templates-guide-2025-funnels-workflows-snapshots-explained/)

#### What comes out of the box?

GHL provides **17+ pre-built "recipe" workflows** in a Template Library, plus an ecosystem of **Snapshots** (full sub-account templates including workflows, funnels, emails, SMS templates, and more).

**Known Pre-Built Recipes:**

| Recipe | What It Does |
|--------|-------------|
| Appointment Confirmation + Reminder + Survey + Review Request | Full lifecycle: confirmation, reminders, post-appointment survey, positive result triggers review request |
| Appointment Confirmation + Reminder | Basic confirmation + follow-up reminders before appointment |
| Auto Missed Call Text-Back | If a call is missed, auto-reply to lead via SMS and notify assigned user |
| FB Messenger Auto-Reply | Auto-reply to inbound Facebook messages; prompt for phone number after 30 min |
| Birthday Template | Birthday promotion workflow |
| List Reactivation | Re-engage cold leads without ad spend, AI filters positive responses |
| Appointment Booking | Detect booking intent in customer reply; send booking link or create task |
| GMB Business Message | Notify users and auto-respond to Google Business messages |
| No-Show Template | Re-engage customers who missed appointments |
| Fast Five | First-5-minute lead nurture (odds of closing drop dramatically after 5 min) |
| Webinar Registration + Reminders | Confirmation emails + reminders leading up to webinar |
| Send Review Request | Review request when opportunity is won or appointment is "showed" |
| FAQ Auto Reply | Automated responses to common inquiries across SMS, Messenger, etc. |
| Missed Call WhatsApp-Back | WhatsApp version of missed call text-back |

**Industry-Specific Templates (added 2025):**
- Education: course enrollment follow-ups
- Health: clinic appointment reminders
- Finance: lead nurture sequences
- Real Estate: property inquiry follow-ups
- Beauty Salons: missed-call-to-booked playbook

#### Can users toggle on/off?

- **Workflows** have an Active/Inactive toggle (Published/Draft status)
- Individual **nodes** within workflows can be enabled/disabled (hover and click pause/play)
- Disabled nodes are skipped but connections remain intact -- useful for testing

#### Can users customize steps?

- **Everything is editable** once a recipe is loaded into the workflow editor
- Users can add/remove steps, change messaging, adjust timing, modify conditions
- Three entry paths: (1) AI Builder (describe in plain language), (2) Browse Templates, (3) Create from Scratch
- Users can also **save their own workflows as templates** for reuse

#### How are they organized?

- Filterable by **category** (Lead Nurture, Onboarding, Appointment, Review)
- Searchable by keyword
- Sortable by popularity
- Snapshots organized by **industry vertical** (salon, dental, real estate, fitness, mortgage, coaching)

---

### 1.2 HubSpot

**Source:** [HubSpot Workflows Guide](https://knowledge.hubspot.com/workflows/create-workflows), [HubSpot Automations Guide 2025](https://www.pixcell.io/blog/hubspot-automations), [Essential Workflows 2025](https://huble.com/blog/10-hubspot-workflows-to-implement), [Zapier HubSpot Workflows 2026](https://zapier.com/blog/hubspot-workflow-examples/)

#### What comes out of the box?

HubSpot offers a **template library** accessible via Automation > Workflows > Create workflow > "From template." Templates are organized by Marketing Hub, Sales Hub, and Service Hub.

**Key Template Types:**

| Template Category | Examples |
|-------------------|----------|
| Lead Nurturing | Email drip series after form submission, MQL-to-SQL handoff |
| Lead Routing | Auto-assign leads to sales reps based on region/industry |
| Customer Onboarding | Welcome series for new customers, product setup guidance |
| Re-engagement | Win-back campaigns for inactive contacts |
| Internal Notifications | Alert sales team when a deal reaches a stage |
| Event Management | Email reminders at specific dates before/after events |
| Deal Management | Update deal stages, assign tasks, send notifications |
| Feedback Collection | NPS surveys, post-interaction follow-ups |

#### Can users toggle on/off?

- Workflows have **Active/Inactive** status
- Must be turned off before editing (to prevent contacts from skipping steps during changes)
- Individual workflow actions cannot be individually toggled (unlike GHL)

#### Can users customize steps?

- Full customization: add/remove actions, change conditions, adjust delays
- Supports If/Then branching, delays, internal notifications, external actions
- AI-powered triggers introduced in 2025 (cross-hub automation)

#### How are they organized?

- By **Hub** (Marketing, Sales, Service)
- By **object type** (Contact, Company, Deal, Custom Object)
- By **trigger type** (data values, form submissions, emails, calls, schedule-based)
- Searchable and filterable by category/keyword
- Compatibility check shows whether template works with user's subscription tier

---

### 1.3 Mailchimp

**Source:** [Automation Flow Templates](https://mailchimp.com/help/use-pre-built-journey-maps/), [Customer Journey Builder](https://mailchimp.com/features/automations/customer-journey-builder/), [Mailchimp Automations](https://mailchimp.com/automations/)

#### What comes out of the box?

Mailchimp offers **80+ pre-built automation flow templates** (rebranded from "Customer Journeys" to "Flows" in mid-2025). Classic Automation Builder was discontinued June 2025.

**Template Categories (5 groups):**

| Category | Purpose | Example Templates |
|----------|---------|-------------------|
| **Find & Welcome New Contacts** | First impressions | Welcome new email subscribers, Welcome SMS subscribers, Thank new customers, Greet first-time buyers |
| **Nurture Leads** | Convert interest to purchase | Nurture pop-up subscribers, Product recommendation series, Educational content drip |
| **Re-engage Contacts** | Win back inactive users | Recover lost customers, Re-engage lapsed subscribers, Abandoned cart recovery (new vs. returning), Browse abandonment |
| **Support & Manage Contacts** | Operations & feedback | Post-purchase follow-up, Collect feedback, Identify high-value customers, Find unengaged contacts |
| **Transactional** | Order lifecycle | Order confirmation, Shipping notification, Refund confirmation, Delivery update |

**Specific Templates Documented:**

- Welcome new contacts (91.43% open rate on average)
- Recover abandoned carts (50.5% open rate, 3.33% conversion rate)
- Celebrate customer birthdays (promotion + tagging)
- Create repeat customers (post-first-purchase nudge)
- Re-engage lapsed subscribers
- Cross-sell opportunities
- Tag customers who made specific purchases

#### Can users toggle on/off?

- Flows can be **paused** (contacts already in the flow continue; no new contacts enter)
- Flows can be **turned off** entirely (all contacts stop)
- No individual step toggle -- must edit the flow to remove/add steps

#### Can users customize steps?

- Full drag-and-drop customization of the journey map
- Add/remove emails, delays, conditions, branching logic
- AI-powered (Intuit Assist) can generate fully designed, on-brand emails within templates
- Filterable by Channels, Topics, or Apps & Integrations

#### How are they organized?

- By the **5 categories** above (Find & Welcome, Nurture, Re-engage, Support, Transactional)
- By **Channel** (email, SMS)
- By **Topic** (ecommerce, engagement, lifecycle)
- By **App/Integration** (Shopify, WooCommerce, etc.)

---

### 1.4 ActiveCampaign

**Source:** [Automation Recipes](https://www.activecampaign.com/recipes), [How to Use Recipes](https://help.activecampaign.com/hc/en-us/articles/360013630199), [Active/Inactive Toggle](https://help.activecampaign.com/hc/en-us/articles/360000374270), [Fitness Recipes](https://www.activecampaign.com/blog/11-fitness-automation-recipes-to-help-your-contacts-go-the-distance)

#### What comes out of the box?

ActiveCampaign has **984 pre-built automation recipes** -- the largest library of any platform studied. Available to all plans for free.

**Organization by Use Case (Primary):**

| Category | Description |
|----------|-------------|
| Customer Support | Ticket routing, satisfaction surveys, escalation workflows |
| Marketing Automation | Welcome series, drip campaigns, cart abandonment, re-engagement |
| Project Management | Task assignment, milestone notifications, status updates |
| Sales Automation | Lead scoring, deal routing, pipeline management, follow-up sequences |

**Organization by Industry (13 verticals):**

| Industry | Specific Recipes |
|----------|-----------------|
| Accounting & Finance | Lead nurture, client onboarding, tax season reminders |
| Agency & Consulting | Proposal follow-up, project kickoff, retainer renewal |
| Creators & Influencers | Content calendar, audience engagement, sponsorship tracking |
| Ecommerce & Retail | Abandoned cart (2-part), post-purchase, loyalty, winback |
| Education & Online Courses | Welcome series, enrollment confirmation, course completion |
| Events & Entertainment | Registration confirmation, event reminders, post-event follow-up |
| Fitness & Wellness | Workout goals upsell, guest pass on forward, membership renewal |
| Healthcare | Appointment reminders, patient onboarding, follow-up care |
| Media & Publishing | Subscriber engagement, content recommendations, renewal reminders |
| Non-Profit | Donor welcome, campaign updates, recurring donation follow-up |
| Real Estate | Property inquiry, showing follow-up, listing alerts |
| SaaS & Technology | Trial onboarding, feature adoption, churn prevention |
| Travel & Hospitality | Booking confirmation, pre-arrival series, post-stay review |

**Recipe Menu Categories:**
- Recommended (curated for you)
- Increase Revenue
- Increase Traffic
- Automate Sales Team
- Boost Contact Satisfaction
- Manage & Track Contacts

**Notable Specific Recipes:**
- 5-day email drip campaign
- 7-day drip email sequence
- 7-week lead nurture
- Cart abandonment (2-part: 3-hour delay + follow-up)
- Product Interest Targeted Follow-Up
- Engagement Tagging (track opens, clicks, activity levels)
- Workout Goals Upsell (fitness: triggers on shopping page visit)
- Guest Pass from Email Forward (fitness: triggers when contact forwards an email)

#### Can users toggle on/off?

- **Active/Inactive toggle** on top right of Automation Builder
- Best practice: switch to Inactive before editing, then back to Active
- When Active: contacts enter and progress through the automation
- When Inactive: no new contacts enter; existing contacts pause at their current step

#### Can users customize steps?

- **Full customization** via drag-and-drop builder
- **Import Wizard** walks through each step during recipe import, showing author notes and customization options
- Can add/remove actions, conditions, wait steps, If/Else branches
- Compatible Features filter (email marketing, CRM, forms, SMS, lead scoring, sales routing)

#### How are they organized?

- **Dual-axis**: by Use Case AND by Industry
- Searchable by keyword
- Filterable by compatible features
- Each recipe has a detail page with description, use case, and walkthrough

---

### 1.5 Zapier

**Source:** [Workflow Automation Templates](https://zapier.com/templates), [Popular Zaps](https://zapier.com/blog/popular-zaps/), [Zapier Statistics 2026](https://sqmagazine.co.uk/zapier-statistics/)

#### What comes out of the box?

Zapier offers thousands of pre-configured "Zap templates" across **8,000+ integrated applications**. Over 2.2 million businesses use Zapier.

**Template Categories:**

| Category | Popular Templates |
|----------|-------------------|
| Marketing | New subscriber -> CRM + welcome email, RSS -> social media, campaign tracking |
| Productivity | Form submission -> spreadsheet + notification, task sync across tools |
| Sales/CRM | New lead -> CRM assignment + email sequence, deal stage -> Slack notification |
| Support | Ticket creation -> assignment + notification, survey response -> CRM |
| Web-App Building | Form data -> database, webhook -> multi-step workflow |

**Most Popular Zaps by Pattern:**

1. **Lead Management**: Form submission -> CRM entry -> team notification -> email sequence
2. **Content Distribution**: RSS feed -> social media scheduler (Buffer)
3. **Team Communication**: App event -> Slack/Teams notification
4. **Email Follow-up**: Customer action -> targeted email campaign
5. **Data Sync**: New record in App A -> create/update in App B

#### Can users toggle on/off?

- Zaps have an **on/off toggle switch** (binary state)
- Turning off stops the zap from running; no new triggers are processed
- Re-enabling resumes from the next trigger event (does not reprocess missed triggers)

#### Can users customize steps?

- Full customization: change trigger apps, modify filter conditions, add/remove steps
- Multi-step Zaps support branching (Paths)
- AI-powered Zap creation via natural language description

#### How are they organized?

- By **app** (find templates for specific tools)
- By **category** (marketing, productivity, sales, support)
- By **use case** (descriptions like "Send a Slack message for every new Google Form response")
- Searchable, filterable

---

### 1.6 Monday.com

**Source:** [Monday.com Automations](https://support.monday.com/hc/en-us/articles/360001222900), [Automation Recipes Guide](https://everhour.com/blog/monday-automations/), [Custom Automations](https://support.monday.com/hc/en-us/articles/360012254440)

#### What comes out of the box?

Monday.com provides automation recipes organized into **8 functional categories**, following a natural-language "When X, Then Y" sentence pattern.

**Automation Categories:**

| Category | Pattern Example | Use |
|----------|----------------|-----|
| **Notifications** | "When status changes, notify person" | Keep team informed |
| **Status Change** | "When date arrives, change status to something" | Auto-progress items |
| **Recurring** | "Every week, create item" | Recurring tasks |
| **Due Dates** | "When date arrives and status is X, notify" | Deadline management |
| **Item Creation** | "When item created, assign person and set date" | Onboarding items |
| **Move Item** | "When status is X, move to group Y" | Pipeline progression |
| **Subitems** | "When all subitems done, change parent status" | Rollup logic |
| **Dependencies** | "When date changes, adjust dependent dates" | Timeline management |

#### Can users toggle on/off?

- Individual automations can be **enabled/disabled** from the automation panel
- Board-level toggle to enable/disable all automations on a board
- No per-step toggle within a recipe

#### Can users customize steps?

- Pre-made recipes are customizable: change column references, statuses, people, dates
- **Custom automation builder**: build from scratch using trigger/condition/action sentence structure
- **AI-powered**: describe what you want in natural language, Monday AI translates to recipe
- Custom templates can be saved and shared within the account

#### How are they organized?

- By the **8 functional categories** above
- **Custom Templates** section for user-created recipes
- Searchable
- AI suggests automations based on board activity patterns

---

### 1.7 Keap/Infusionsoft

**Source:** [12 Proven Templates](https://keap.com/product-updates/12-proven-automation-templates-for-free-in-your-keap-app), [8 Campaigns](https://keap.com/small-business-automation-blog/marketing/automation/8-infusionsoft-campaigns), [Automation Templates](https://help.keap.com/help/automation-templates)

#### What comes out of the box?

Keap provides **12 Proven Automation Templates** organized into 4 categories, plus legacy Infusionsoft campaign templates.

**12 Templates by Category:**

| Category | Template | What It Does |
|----------|----------|-------------|
| **Marketing** | Contact Us Form | Captures website visitors into CRM, triggers follow-up |
| **Marketing** | Lead Magnet Offer | Delivers tripwire to initial subscribers, core offer to purchasers |
| **Marketing** | Newsletter Sign-Up | Welcome email + nurture series trigger |
| **Sales** | Bonus Content Offer | Bonus content as upsell to help close deals |
| **Sales** | Free Upgrade | Limited-time promotion upgrading purchase to next tier |
| **Sales** | Loyalty Coupon | Post-purchase coupon to encourage repeat business |
| **Service** | Referral Request | Auto-request referral from happy customers post-purchase |
| **Service** | Holiday Greeting | Seasonal messages to maintain client relationships |
| **Service** | Bring A Friend | Special deal for clients who bring in new people |
| **Operations** | Staff Birthday | Notify management + send automated birthday messages |
| **Operations** | Failed Payment Follow-Up | Follow-up task + customer email on failed payment |
| **Operations** | Employee of the Month | Monthly nomination survey + dashboard results |

**Legacy Infusionsoft Campaigns (Top 8):**

| Campaign | Impact |
|----------|--------|
| Clean Your Contact List | Used by 200+ customers, cleaned 900,000 emails |
| Birthday Reminders | 200+ customers, nearly 500,000 birthday emails sent |
| Grow Social Following | 150,000+ social invitations sent |
| Focus on Hottest Leads | 88,000+ lead score goals reached |
| Hard Bounce Recovery | Phone follow-up sequence for invalid emails |
| Abandoned Cart Recovery | 7.3% global order recovery rate, 300+ orders recovered |
| Automate Contact Requests | Immediate auto-response + team assignment |
| Business-in-a-Box | 3 bundled workflows: lead follow-up + welcome + sales (< 30 min setup) |

#### Can users toggle on/off?

- Automations have **Active/Inactive** status
- "When-Then" easy automations can be toggled independently
- Drag-and-drop advanced workflows can be published/unpublished
- AI-powered "Plays" can be enabled/disabled

#### Can users customize steps?

- Full customization via drag-and-drop builder
- "When-Then" quick automations for simple one-step rules
- Advanced workflows for multi-step, branching logic
- AI-powered "Plays" generate complete workflows from prompts

#### How are they organized?

- By **4 business areas**: Marketing, Sales, Service, Operations
- Accessible from within the app under automation templates
- Strategy Guide kept up-to-date with latest campaigns
- Searchable by use case

---

## 2. Cross-Platform Patterns & Best Practices

### Pattern Summary

| Feature | GHL | HubSpot | Mailchimp | ActiveCampaign | Zapier | Monday | Keap |
|---------|-----|---------|-----------|----------------|--------|--------|------|
| **Pre-built templates** | 17+ recipes + snapshots | 50+ templates | 80+ flows | 984 recipes | 1000s of Zap templates | 100s of recipes | 12 templates + 8 campaigns |
| **Toggle on/off** | Yes (workflow + node level) | Yes (workflow level) | Yes (pause/stop) | Yes (Active/Inactive) | Yes (on/off) | Yes (automation level) | Yes (Active/Inactive) |
| **Customize steps** | Full editor | Full editor | Full editor | Full editor + Import Wizard | Full editor | Sentence builder + custom | Full editor + When-Then |
| **By industry** | Yes (5+ niches) | Limited | By app/integration | Yes (13 industries) | By app category | No | By business area |
| **By use case** | Yes (categories) | Yes (Hub-based) | Yes (5 categories) | Yes (6 use cases) | Yes (5 categories) | Yes (8 categories) | Yes (4 areas) |
| **AI creation** | Yes (describe in English) | Yes (2025) | Yes (Intuit Assist) | No (manual) | Yes (AI Zaps) | Yes (AI recipes) | Yes (AI Plays) |
| **Per-node toggle** | Yes | No | No | No | No | No | No |
| **Import wizard** | No (direct load) | No | No | Yes (step-by-step) | No | No | No |

### Key Insights for Red Pine

1. **ActiveCampaign's dual-axis (use case + industry) is the gold standard** for organization. 984 recipes give users incredible specificity. Red Pine should follow this pattern.

2. **Toggle is expected at the workflow level.** Only GHL offers per-node toggle. For Red Pine's simplicity goal, workflow-level toggle (on/off) is sufficient.

3. **The "Import Wizard" pattern from ActiveCampaign is excellent.** Walking users through each customizable field during setup reduces overwhelm. Red Pine should adopt this.

4. **Mailchimp's 5 lifecycle categories are clean and intuitive.** They map well to the customer journey. Red Pine should use a similar lifecycle-based organization.

5. **Keap's 4 business areas (Marketing, Sales, Service, Operations) provide a secondary axis** that helps users find automations by department need.

6. **AI-powered creation is now table stakes.** GHL, HubSpot, Mailchimp, Zapier, Monday, and Keap all have AI builders. Red Pine's COO should be able to suggest and create automations.

7. **"Business-in-a-Box" bundled approach (Keap) is powerful for onboarding.** Activating a bundle of essential automations in < 30 minutes is the target experience.

8. **GHL's 73% abandonment rate proves that even great automations fail without simplicity.** Red Pine's toggle-on/off approach is the right call.

---

## 3. Industry Automation Blueprints

### How to Read These Tables

Each automation includes:
- **Name**: Human-readable label shown in the toggle panel
- **Trigger**: What event starts the automation
- **Action**: What happens (may be multi-step)
- **Channel**: Email, SMS, In-App notification, or Push
- **Delay**: Time between trigger and action
- **Default**: Whether it's ON or OFF by default when a business first sets up
- **Toggleable**: Always YES for Red Pine

---

### 3.1 Beauty & Body
*Salons, barbershops, nail studios, spas, medspas, tattoo/piercing, lash/brow, tanning*

**Sources:** [GlossGenius](https://glossgenius.com/), [Vagaro](https://www.goodcall.com/appointment-scheduling-software/vagaro-vs-glossgenius), [Booksy Automation Hacks](https://biz.booksy.com/en-us/blog/small-business-automation-spa-salon), [Phorest](https://www.phorest.com/us/)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Appointment Confirmation** | Client books appointment | Send confirmation with date, time, service, stylist, and address | Email + SMS | Immediate | ON |
| 2 | **24-Hour Reminder** | 24 hours before appointment | Send reminder with option to confirm/cancel/reschedule | SMS | 24hrs before | ON |
| 3 | **2-Hour Reminder** | 2 hours before appointment | Final "See you soon!" with directions/parking info | SMS | 2hrs before | OFF |
| 4 | **Post-Visit Thank You** | Appointment marked complete | Thank you message with receipt and service summary | Email | 30 min after | ON |
| 5 | **Review Request** | Appointment marked complete | Request Google/Yelp review with direct link | Email + SMS | 2 hrs after | ON |
| 6 | **Rebooking Nudge** | No future appointment booked within X days of last visit | "Time to rebook!" with scheduling link | Email + SMS | Service-specific (e.g., 4 weeks for hair, 2 weeks for nails) | ON |
| 7 | **No-Show Follow-Up** | Appointment marked no-show | Friendly "We missed you" + rebook link + cancellation policy reminder | Email + SMS | 1 hr after | ON |
| 8 | **Birthday Discount** | Client birthday (from profile) | Happy birthday message with special offer/discount code | Email + SMS | On birthday | ON |
| 9 | **New Client Welcome** | First appointment completed | Welcome to the family + loyalty program intro + referral offer | Email | 1 day after | ON |
| 10 | **Lapsed Client Win-Back** | No visit in 60+ days | "We miss you" + incentive to return | Email + SMS | 60 days after last visit | ON |
| 11 | **Product Recommendation** | Service completed (tagged) | Recommend aftercare products based on service received | Email | 1 day after | OFF |
| 12 | **Loyalty Milestone** | Client reaches loyalty tier/milestone | Congratulations + reward notification | Email + In-App | Immediate | ON |

**Industry insight:** GlossGenius achieves 75%+ rebooking rates with automated checkout-integrated rebooking prompts. Automated reminders reduce no-shows from 15-30% to under 5%.

---

### 3.2 Health & Wellness
*Gyms, fitness studios, yoga, personal training, chiropractors, massage therapy, acupuncture, mental health*

**Sources:** [WellnessLiving](https://www.wellnessliving.com/blog/put-business-autopilot-top-5-ways-automate-fitness-studio/), [Momence](https://momence.com/), [ActiveCampaign Fitness Recipes](https://www.activecampaign.com/blog/11-fitness-automation-recipes-to-help-your-contacts-go-the-distance), [Whippy AI](https://www.whippy.ai/blog/text-automation-fitness-studios)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Class/Session Reminder** | 24 hours before class | Reminder with class name, instructor, what to bring | SMS | 24hrs before | ON |
| 2 | **Welcome New Member** | Membership purchased | Welcome email with facility info, schedule, first-visit tips | Email | Immediate | ON |
| 3 | **Membership Renewal Reminder** | 7 days before membership expires | Renewal reminder with pricing + benefits summary | Email + SMS | 7 days before expiry | ON |
| 4 | **Membership Expiry Warning** | 1 day before membership expires | Final reminder: "Your membership expires tomorrow" | SMS | 1 day before expiry | ON |
| 5 | **Missed Class Follow-Up** | Client no-show to class | Friendly check-in + link to book next class | Email | 2 hrs after | OFF |
| 6 | **Progress Milestone** | Client completes X sessions/classes | Congratulations message + encourage next goal | Email + In-App | Immediate | ON |
| 7 | **Trial-to-Member Conversion** | Trial period at day 7 (of 14-day trial) | Highlight benefits, share testimonials, offer membership | Email | Day 7 of trial | ON |
| 8 | **Review Request** | After 5th visit | Request review once client has sufficient experience | Email + SMS | After 5th visit | ON |
| 9 | **Inactivity Alert** | No visit in 14+ days | "We miss you" + motivational message + class suggestions | Email + SMS | 14 days after last visit | ON |
| 10 | **Birthday Wellness Offer** | Client birthday | Birthday message + free class/session or discount | Email + SMS | On birthday | ON |
| 11 | **Referral Request** | After 10th visit | Ask happy member to refer a friend + incentive | Email | After 10th visit | OFF |
| 12 | **Class Waitlist Notification** | Spot opens in full class | Notify waitlisted client with booking link | SMS + In-App | Immediate | ON |

**Industry insight:** WellnessLiving offers 100+ templated email/SMS notification presets ready to use from day one. Multi-channel (email + SMS + push) is standard for fitness engagement.

---

### 3.3 Food & Beverage
*Restaurants, cafes, bakeries, food trucks, bars, catering, meal prep services*

**Sources:** [Restaurant Marketing Automation Guide](https://stackfood.app/blog/restaurant-marketing-automation/), [TouchBistro Automated Emails](https://www.touchbistro.com/blog/types-of-automated-restaurant-emails/), [Olo Restaurant Automation](https://www.olo.com/blog/guide-to-restaurant-marketing-automation/), [Campaign Monitor Guide](https://www.campaignmonitor.com/resources/guides/email-marketing-for-restaurants/)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Welcome + First-Time Offer** | New loyalty/account signup | Welcome email with menu highlights + first-time discount | Email | Immediate | ON |
| 2 | **Order Confirmation** | Online order placed | Confirmation with order details, estimated time, pickup/delivery info | Email + SMS | Immediate | ON |
| 3 | **Post-Visit Review Request** | Visit/order completed | Request Google/Yelp review | Email | 2 hrs after | ON |
| 4 | **Loyalty Points Update** | Purchase made | Points earned notification + progress to next reward | Email + In-App | Immediate | ON |
| 5 | **Loyalty Reward Available** | Points reach reward threshold | "You've earned a reward!" notification | Email + SMS + In-App | Immediate | ON |
| 6 | **Birthday Treat** | Client birthday | Free item or discount for birthday celebration | Email + SMS | 3 days before birthday | ON |
| 7 | **Lapsed Customer Win-Back** | No order/visit in 30+ days | "We miss you" + special offer to return | Email + SMS | 30 days after last visit | ON |
| 8 | **Catering Follow-Up** | Catering inquiry submitted | Auto-acknowledge + set task for owner to respond | Email + In-App | Immediate | ON |
| 9 | **Seasonal Menu Launch** | New seasonal menu published | Announce new menu with featured items | Email | Immediate | OFF |
| 10 | **Event/Special Night Promo** | Event created on calendar | Promote upcoming event to matching audience segment | Email | 7 days before event | OFF |

**Industry insight:** Welcome emails in food/bev see 91.43% open rates. Restaurant email marketing averages $36-44 ROI per $1 spent. Abandoned cart recovery within 1 hour is critical.

---

### 3.4 Home Services
*HVAC, plumbing, electrical, cleaning, landscaping, painting, roofing, pest control, handyman*

**Sources:** [Service Labs Email Marketing](https://servicelabsgroup.com/marketing-strategy/email-marketing-strategies-for-home-service-contractors/), [Hatch HVAC Follow-Up Data](https://www.usehatchapp.com/blog/hvac-estimate-follow-up-response-rates), [Aginto Seasonal Promotions](https://blog.aginto.com/seasonal-promotions-for-home-service-providers/), [Housecall Pro](https://www.housecallpro.com/features/recurring-service-plans/)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Estimate Follow-Up** | Estimate sent, no response | "Following up on your estimate" + link to approve | Email + SMS | 48 hrs after sent | ON |
| 2 | **Estimate Reminder (2nd)** | Still no response after first follow-up | Second follow-up: "Still interested? Happy to answer questions" | Email + SMS | 5 days after sent | ON |
| 3 | **Job Confirmation** | Job/appointment scheduled | Confirmation with date, time, technician name, what to expect | Email + SMS | Immediate | ON |
| 4 | **Day-Before Reminder** | 24 hours before job | "We'll be there tomorrow" with arrival window and tech details | SMS | 24hrs before | ON |
| 5 | **On-My-Way Notification** | Tech dispatched / en route | "Your technician is on the way!" with ETA | SMS | Immediate | ON |
| 6 | **Post-Job Review Request** | Job marked complete | Thank you + request Google review | Email + SMS | 2 hrs after | ON |
| 7 | **Post-Job Invoice** | Job marked complete | Send invoice with payment link | Email | 1 hr after | ON |
| 8 | **Payment Reminder** | Invoice unpaid after X days | "Friendly reminder: invoice #X is due" | Email + SMS | 7 days after invoice | ON |
| 9 | **Seasonal Service Reminder** | Date-based (e.g., spring, fall) | "Time for your seasonal [HVAC/lawn/gutter] service" | Email + SMS | Seasonal (configurable) | ON |
| 10 | **Annual Service Anniversary** | 12 months since last service | "It's been a year since your last [service]. Time for maintenance?" | Email + SMS | 12 months after | ON |
| 11 | **Referral Request** | Job completed + positive review | "Know someone who needs [service]? Refer a friend for $X off" | Email | 3 days after review | OFF |
| 12 | **New Customer Welcome** | First job completed | Welcome + maintenance tips + service plan options | Email | 1 day after | ON |

**Industry insight:** HVAC estimate follow-up campaigns average 60% response rate, with best performers hitting 90%. It takes 8-12 touches to close 80% of deals. Reactivation campaigns achieve 15-25% open rates and convert 1-3% of dormant customers within 30 days.

---

### 3.5 Professional Services
*Law firms, accounting, consulting, financial advisors, insurance, real estate agents, marketing agencies*

**Sources:** [PracticePanther](https://www.practicepanther.com/), [CosmoLex](https://www.cosmolex.com/features/legal-crm-software/), [Actionstep CRM](https://www.actionstep.com/crm/), [EngageBay Law Firm CRM](https://www.engagebay.com/blog/law-firm-crm-guide/)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **New Inquiry Auto-Response** | Contact form / inquiry submitted | Acknowledge receipt + set expectation for response time | Email | Immediate | ON |
| 2 | **Consultation Confirmation** | Consultation booked | Confirmation with date, time, preparation checklist, location/link | Email | Immediate | ON |
| 3 | **Consultation Reminder** | 24 hours before consultation | Reminder with any documents to bring / prep steps | Email + SMS | 24hrs before | ON |
| 4 | **Client Onboarding Welcome** | New client contract signed | Welcome packet with portal access, key contacts, next steps | Email | Immediate | ON |
| 5 | **Document Request** | Onboarding started, missing documents | Request specific documents needed for engagement | Email | 1 day after onboarding | ON |
| 6 | **Document Reminder** | Requested documents not received | Follow-up reminder for outstanding documents | Email + SMS | 7 days after request | ON |
| 7 | **Invoice Sent Notification** | Invoice generated | Send invoice with payment link + due date | Email | Immediate | ON |
| 8 | **Payment Overdue Reminder** | Invoice past due | Escalating reminders: friendly -> firm | Email + SMS | 7, 14, 30 days past due | ON |
| 9 | **Engagement Complete Follow-Up** | Project/case marked complete | Thank you + satisfaction survey + referral request | Email | 3 days after completion | ON |
| 10 | **Periodic Check-In** | 90 days since last interaction | "How's everything going?" + offer to schedule a review | Email | 90 days after last interaction | OFF |
| 11 | **Annual Review Reminder** | 11 months since engagement start | "Time for your annual review/renewal" | Email | 11 months | OFF |
| 12 | **Referral Thank You** | Referral tagged/recorded | Thank referrer + update on referral status | Email | Immediate | ON |

**Industry insight:** Law firms using onboarding automation cut onboarding time from 10+ days to 3 days. PracticePanther saves 8+ hours per week through automated workflows.

---

### 3.6 Creative Services
*Photography, videography, graphic design, web development, event planning, DJs, florists*

**Sources:** [HoneyBook CRM](https://www.honeybook.com/crm-for-photographers), [OpenClaw for Agencies](https://www.serif.ai/openclaw/creative-design-agencies), [Bloom.io](https://bloom.io/), [StoryChief Agency Workflow](https://storychief.io/blog/creative-agency-workflow-process)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Inquiry Auto-Response** | New inquiry/lead submitted | Immediate acknowledgment + portfolio link + availability mention | Email | Immediate | ON |
| 2 | **Inquiry Follow-Up** | Inquiry with no response in 48hrs | "Still interested? Let's discuss your project" | Email | 48 hrs | ON |
| 3 | **Proposal Sent Notification** | Proposal/quote sent | Notification to client with proposal link + what to expect | Email | Immediate | ON |
| 4 | **Proposal Follow-Up** | Proposal not viewed/accepted in 3 days | "Wanted to follow up on the proposal" | Email | 3 days after sent | ON |
| 5 | **Contract + Deposit Reminder** | Contract sent, not signed | Reminder to sign contract and pay deposit | Email | 3 days after sent | ON |
| 6 | **Project Kickoff** | Contract signed + deposit paid | Welcome to the project + timeline + next steps + questionnaire | Email | Immediate | ON |
| 7 | **Session/Event Reminder** | 48 hours before shoot/event | Preparation checklist + location details + what to wear/bring | Email + SMS | 48hrs before | ON |
| 8 | **Milestone Update** | Project milestone reached | Progress update to client (e.g., "Editing is 50% complete") | Email | Immediate | OFF |
| 9 | **Gallery/Deliverable Ready** | Files uploaded to gallery/portal | "Your [photos/designs/files] are ready to view!" | Email + SMS | Immediate | ON |
| 10 | **Post-Project Review Request** | Project marked complete | Thank you + request review + share with friends | Email | 3 days after delivery | ON |
| 11 | **Anniversary/Follow-Up** | 11 months after event (e.g., wedding anniversary) | "Happy anniversary! Need updated photos?" | Email | 11 months | OFF |
| 12 | **Payment Milestone Reminder** | Payment milestone approaching (e.g., 50% due before event) | Reminder of upcoming payment with amount + due date | Email | 7 days before due | ON |

**Industry insight:** HoneyBook automates inquiry response + payment follow-ups. Tave sends automated invoice reminders. Creative businesses that respond to inquiries within 5 minutes are 100x more likely to close.

---

### 3.7 Education & Childcare
*Tutoring centers, music schools, dance studios, language schools, daycare, preschool, online courses*

**Sources:** [ActiveCampaign Online Courses](https://www.activecampaign.com/blog/email-automations-for-online-courses), [LearnWorlds Email Sequences](https://www.learnworlds.com/email-sequences-launch-online-course-examples/), [ClassCard Engagement](https://www.classcardapp.com/blog/automation-to-elevate-student-engagement), [Learning Revolution](https://www.learningrevolution.net/email-sequences/)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Enrollment Confirmation** | Student enrolled in class/program | Confirmation with schedule, materials needed, instructor info | Email | Immediate | ON |
| 2 | **Welcome Series** | First enrollment | 3-email series: Welcome + what to expect + tips for success | Email | Day 0, 2, 5 | ON |
| 3 | **Class Reminder** | 24 hours before class | Reminder with class details + any homework due | Email + SMS | 24hrs before | ON |
| 4 | **Missed Class Follow-Up** | Student absent | "We missed you today" + makeup options + materials covered | Email | 2 hrs after | ON |
| 5 | **Progress Report** | End of month/term | Summary of attendance, achievements, areas for growth | Email | Monthly/term-end | OFF |
| 6 | **Term/Semester Renewal** | 14 days before term ends | Re-enrollment reminder with pricing + class schedule | Email + SMS | 14 days before | ON |
| 7 | **Payment Reminder** | Tuition payment due | Reminder with amount, due date, payment link | Email | 7 days before due | ON |
| 8 | **Review Request (Parent)** | After first month of enrollment | Request review from parents/guardians | Email | 30 days after enrollment | ON |
| 9 | **Referral Program** | After 3 months of enrollment | Refer a friend program with discount incentive | Email | 90 days after enrollment | OFF |
| 10 | **Student Achievement** | Achievement/milestone recorded | Congratulations message + certificate (if applicable) | Email + In-App | Immediate | ON |
| 11 | **Inactivity Re-Engagement** | No class attendance in 21+ days | "Is everything okay?" + offer to adjust schedule | Email + SMS | 21 days after last class | ON |
| 12 | **Summer/Break Camp Promo** | Seasonal (configurable) | Promote seasonal programs to current families | Email | Configurable | OFF |

**Industry insight:** Welcome email sequences in education consist of 3-5 emails in the first week. Re-engagement emails are triggered after 2 weeks of inactivity. Automated notifications for drip content should be sent 15+ hours after release.

---

### 3.8 Automotive
*Auto repair shops, oil change, tire shops, body shops, car detailing, car wash, dealerships*

**Sources:** [DemandForce Oil Change Reminders](https://www.demandforce.com/oil-change-reminder/), [Ari Service Reminders](https://ari.app/features/service-reminders/), [AutoVitals](https://blog.autovitals.com/the-importance-of-vehicle-service-reminders), [Steer CRM](https://steercrm.com/products/service-reminders), [Apptoto Auto Reminders](https://www.apptoto.com/reminders/auto-service-appointment-reminder-examples)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Appointment Confirmation** | Service appointment booked | Confirmation with date, time, services, estimated cost | Email + SMS | Immediate | ON |
| 2 | **Day-Before Reminder** | 24 hours before appointment | Reminder with arrival instructions + drop-off info | SMS | 24hrs before | ON |
| 3 | **Vehicle Ready Notification** | Service marked complete | "Your vehicle is ready for pickup!" with total + payment link | SMS + Email | Immediate | ON |
| 4 | **Post-Service Review Request** | Vehicle picked up | Thank you + request Google review | Email + SMS | 4 hrs after pickup | ON |
| 5 | **Oil Change Reminder** | Based on last oil change date + mileage interval | "Your oil change is due" with scheduling link | Email + SMS | Service-interval based (e.g., 3 months or 3,000 miles) | ON |
| 6 | **Tire Rotation Reminder** | Based on last rotation + mileage interval | "Time for tire rotation" with scheduling link | Email + SMS | Service-interval based (e.g., 6 months or 5,000 miles) | ON |
| 7 | **Annual Inspection Reminder** | Based on last inspection date | "Your annual inspection is due next month" | Email + SMS | 30 days before due | ON |
| 8 | **Declined Service Follow-Up** | Customer declines recommended service | "We noticed you deferred [brake pads]. Here's why it matters" | Email | 14 days after declined | ON |
| 9 | **Seasonal Service Campaign** | Season change (configurable) | "Winter prep" / "Summer AC check" campaign | Email | Seasonal (configurable) | OFF |
| 10 | **New Customer Welcome** | First service completed | Welcome + maintenance schedule + loyalty program intro | Email | 1 day after | ON |
| 11 | **Lapsed Customer Win-Back** | No visit in 6+ months | "We haven't seen you in a while" + oil change special | Email + SMS | 6 months after last visit | ON |
| 12 | **Warranty Expiry Reminder** | Warranty end date approaching | "Your warranty expires soon. Schedule a pre-expiry check" | Email | 30 days before expiry | OFF |

**Industry insight:** Automated service reminders increase customer loyalty and average repair orders. Text reminders reduce no-shows by 40%. 55% of automotive customers prefer text over email. Oil change reminders typically fire 3 days before the 12-month mark from last service.

---

### 3.9 Retail & Boutique
*Clothing stores, jewelry shops, gift shops, pet stores, bookstores, specialty retail, ecommerce*

**Sources:** [Klaviyo Flows](https://www.firstpier.com/resources/list-of-klaviyo-flows), [TargetBay Ecommerce Flows](https://targetbay.com/blog/ecommerce-brands-email-flows/), [WooCommerce Cart Recovery](https://woocommerce.com/posts/abandoned-cart-emails/), [Bloomreach Cart Recovery](https://www.bloomreach.com/en/blog/real-time-abandoned-cart-recovery-boosts-sales)

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Welcome Series** | New customer/subscriber signup | 3-email series: Brand story + bestsellers + first-purchase offer | Email | Day 0, 2, 5 | ON |
| 2 | **First Purchase Thank You** | First order placed | Thank you + shipping info + "what to expect" | Email | Immediate | ON |
| 3 | **Order Confirmation** | Any order placed | Order details + tracking (when available) + estimated delivery | Email | Immediate | ON |
| 4 | **Shipping Notification** | Order shipped | Tracking number + delivery estimate | Email + SMS | Immediate | ON |
| 5 | **Post-Purchase Follow-Up** | Order delivered | "How are you enjoying your purchase?" + care tips + review request | Email | 5 days after delivery | ON |
| 6 | **Review Request** | Order delivered | Request product review with direct link | Email | 7 days after delivery | ON |
| 7 | **Abandoned Cart Recovery** | Cart abandoned (items added, no checkout) | "You left something behind" + cart contents + checkout link | Email + SMS | 1 hr after abandonment | ON |
| 8 | **Abandoned Cart Follow-Up** | Still abandoned after first email | Second reminder with urgency or small discount | Email | 24 hrs after first email | ON |
| 9 | **Birthday Discount** | Customer birthday | Birthday offer with exclusive discount code | Email + SMS | 7 days before birthday | ON |
| 10 | **VIP/Loyalty Reward** | Customer reaches spending threshold | "You're now a VIP!" + exclusive benefits + reward | Email + In-App | Immediate | ON |
| 11 | **Win-Back Campaign** | No purchase in 60+ days | "We miss you" + personalized recommendations + incentive | Email | 60 days after last purchase | ON |
| 12 | **Cross-Sell Recommendation** | Purchase completed | Related product recommendations based on purchase | Email | 14 days after purchase | OFF |
| 13 | **Back-in-Stock Alert** | Product restocked that customer was interested in | "Good news! [Product] is back in stock" | Email + SMS | Immediate | ON |
| 14 | **New Arrival Announcement** | New products added to store | Curated new arrivals email | Email | Weekly (configurable) | OFF |

**Industry insight:** Cart recovery emails see 50.5% open rate and 3.33% conversion rate. 45% of all cart recoveries happen within the first 2 hours. Loyalty program members spend 12-18% more annually. 83% say loyalty programs influence their repeat purchases.

---

## 4. Universal Automations (All Industries)

These automations apply across every Red Pine business type and should be available in every template.

| # | Automation Name | Trigger | Action | Channel | Delay | Default |
|---|----------------|---------|--------|---------|-------|---------|
| 1 | **Welcome Email** | New client/contact added | Welcome message with business info + what to expect | Email | Immediate | ON |
| 2 | **Appointment/Booking Confirmation** | Any appointment booked | Confirmation details | Email + SMS | Immediate | ON |
| 3 | **Appointment Reminder (24hr)** | 24hrs before appointment | Reminder with confirm/cancel options | SMS | 24hrs before | ON |
| 4 | **No-Show Follow-Up** | Appointment marked no-show | "We missed you" + rebook link | Email + SMS | 1 hr after | ON |
| 5 | **Review Request** | Service/order completed | Request review on Google | Email + SMS | 2 hrs after | ON |
| 6 | **Birthday Message** | Contact birthday | Birthday greeting + optional offer | Email + SMS | On birthday | ON |
| 7 | **Invoice Sent** | Invoice generated | Send invoice with payment link | Email | Immediate | ON |
| 8 | **Payment Received** | Payment processed | Receipt/thank you | Email | Immediate | ON |
| 9 | **Payment Overdue** | Invoice past due date | Escalating reminders (7, 14, 30 days) | Email + SMS | 7 days past due | ON |
| 10 | **Failed Payment Alert** | Payment fails (subscription/card) | Notify client to update payment method | Email + SMS | Immediate | ON |
| 11 | **New Lead Auto-Response** | Contact form / inquiry submitted | Immediate acknowledgment + expected response time | Email | Immediate | ON |
| 12 | **Referral Request** | Client has X completed visits/orders | Ask happy client for referral + incentive | Email | After milestone | OFF |
| 13 | **Lapsed Client Win-Back** | No interaction in X days | "We miss you" + incentive | Email + SMS | Configurable | ON |
| 14 | **Loyalty Points Update** | Points earned/redeemed | Points balance notification | In-App + Email | Immediate | ON |
| 15 | **Staff Assignment Notification** | Client assigned to staff member | Notify staff of new assignment | In-App | Immediate | ON |

---

## 5. Red Pine Implementation Spec

### 5.1 Design Philosophy

Following the master spec's principle: **"Pre-built automations toggle on/off"** (Sticky Note #3 - Communication). Users should never need to build automations from scratch. They toggle pre-built ones on/off and customize the content.

**The Red Pine Approach:**

```
1. During onboarding, COO AI suggests automations based on industry
2. User sees a panel of toggle switches (like iPhone notification settings)
3. Each toggle has a preview/customize button
4. Clicking customize opens a simple wizard (ActiveCampaign Import Wizard style)
5. User adjusts: message text, timing, channel preferences
6. Toggle ON -> automation is live
7. Toggle OFF -> automation pauses (no new contacts enter)
```

### 5.2 Organization Model

**Primary axis: Lifecycle Stage** (Mailchimp-inspired)
- **Attract** — Lead capture, auto-response, inquiry follow-up
- **Convert** — Estimate follow-up, consultation reminders, proposal nudges
- **Deliver** — Booking confirmations, reminders, on-my-way alerts
- **Retain** — Review requests, rebooking nudges, loyalty, win-back
- **Grow** — Referrals, cross-sell, seasonal campaigns, birthday offers

**Secondary axis: Industry** (ActiveCampaign-inspired)
- Each industry template loads a curated set of automations from the universal + industry-specific pools

**Tertiary: Channel filter**
- Filter by Email, SMS, In-App, or Push

### 5.3 Automation Card UI

Each automation in the panel should display:

```
+--------------------------------------------------+
| [Toggle Switch]  Appointment Reminder (24hr)     |
|                                                   |
| Trigger: 24hrs before appointment                |
| Action:  Send SMS reminder with confirm option   |
| Channel: SMS                                      |
|                                                   |
| [Preview]  [Customize]           Runs: 142 times |
+--------------------------------------------------+
```

- **Toggle switch**: ON/OFF, takes effect immediately (no save button needed)
- **Preview**: Shows example of what the client will receive
- **Customize**: Opens wizard to edit message text, timing, channel
- **Runs count**: Shows how many times this automation has fired (social proof + trust)

### 5.4 Customization Wizard (per automation)

When user clicks "Customize":

**Step 1: Message Content**
- Pre-written template with merge fields ({{client_name}}, {{service_name}}, {{date}}, etc.)
- User can edit text or use COO AI to rewrite
- Preview of final message with real data

**Step 2: Timing**
- Adjust delay (e.g., change 24hrs to 48hrs for reminders)
- For recurring: adjust interval (e.g., rebooking every 4 weeks vs 6 weeks)

**Step 3: Channel**
- Choose: Email, SMS, Both, or In-App
- Respect contact's communication preferences (DND settings)

**Step 4: Conditions (Advanced -- collapsible)**
- Add simple conditions: "Only for service type X", "Only for new clients", etc.
- Progressive disclosure: hidden by default, shown for power users

### 5.5 COO AI Integration

The AI COO should:
1. **During onboarding**: "I've set up 8 automations for your nail salon. Want me to walk you through them?"
2. **After launch**: "You had 5 no-shows this week. Want me to turn on the 2-hour reminder? It reduces no-shows by 40%."
3. **Ongoing optimization**: "Your review request is getting 32% response rate. I could test sending it 4 hours after instead of 2 hours. Want to try?"
4. **Proactive suggestions**: "Your birthday automation sent 12 offers this month. 8 clients redeemed them. That's $480 in extra revenue."

### 5.6 Automation Count per Industry Template

| Industry | Universal | Industry-Specific | Total Available |
|----------|-----------|-------------------|-----------------|
| Beauty & Body | 15 | 12 | ~22 (deduplicated) |
| Health & Wellness | 15 | 12 | ~22 |
| Food & Beverage | 15 | 10 | ~20 |
| Home Services | 15 | 12 | ~22 |
| Professional Services | 15 | 12 | ~22 |
| Creative Services | 15 | 12 | ~22 |
| Education & Childcare | 15 | 12 | ~22 |
| Automotive | 15 | 12 | ~22 |
| Retail & Boutique | 15 | 14 | ~24 |

**Default ON at launch**: ~12-15 per industry (conservative, essential ones)
**Default OFF at launch**: ~7-10 per industry (optional, promotional, advanced)

### 5.7 SMS vs Email Strategy

| Automation Type | Recommended Channel | Reason |
|----------------|--------------------|---------|
| Appointment reminders | SMS (primary) | 98% open rate, read within 3 min |
| Review requests | Email + SMS | Email for link-heavy content, SMS for nudge |
| Welcome messages | Email (primary) | More room for branding, imagery, detail |
| Birthday offers | Email + SMS | SMS for urgency, email for visuals |
| Invoice/payment | Email (primary) | Record-keeping, payment links |
| No-show follow-up | SMS (primary) | Urgency, personal touch |
| Win-back campaigns | Email + SMS | Email for incentive details, SMS for attention |
| On-my-way alerts | SMS only | Real-time, location-based |
| Seasonal promos | Email (primary) | Visual, detailed content |
| Loyalty updates | In-App + Email | In-app for real-time, email for summary |

---

## 6. Database Schema Proposal

### `automation_templates` table

```sql
CREATE TABLE automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- e.g., 'appointment-reminder-24hr'
  name TEXT NOT NULL,                           -- e.g., 'Appointment Reminder (24hr)'
  description TEXT,                             -- Human-readable description
  category TEXT NOT NULL,                       -- 'attract', 'convert', 'deliver', 'retain', 'grow'
  trigger_type TEXT NOT NULL,                   -- e.g., 'time_before_appointment', 'event_completed', 'date_based'
  trigger_config JSONB NOT NULL DEFAULT '{}',   -- e.g., {"hours_before": 24, "event": "appointment"}
  action_type TEXT NOT NULL,                    -- e.g., 'send_message', 'create_task', 'update_record'
  action_config JSONB NOT NULL DEFAULT '{}',    -- e.g., {"channels": ["sms"], "template_key": "reminder_24hr"}
  default_delay_minutes INTEGER,               -- Delay in minutes (null = immediate)
  channels TEXT[] NOT NULL DEFAULT '{}',        -- ['email', 'sms', 'in_app', 'push']
  industries TEXT[] NOT NULL DEFAULT '{}',      -- ['beauty_body', 'health_wellness', ...] or ['universal']
  is_universal BOOLEAN DEFAULT false,           -- true if available to all industries
  default_enabled BOOLEAN DEFAULT false,        -- Whether ON by default for new businesses
  sort_order INTEGER DEFAULT 0,
  message_templates JSONB NOT NULL DEFAULT '{}', -- {"sms": "Hi {{client_name}}...", "email": {"subject": "...", "body": "..."}}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `business_automations` table (per-business config)

```sql
CREATE TABLE business_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  automation_template_id UUID REFERENCES automation_templates(id),
  is_enabled BOOLEAN DEFAULT false,
  custom_delay_minutes INTEGER,                 -- Override default delay
  custom_channels TEXT[],                       -- Override default channels
  custom_message_templates JSONB DEFAULT '{}',  -- Override default messages
  custom_conditions JSONB DEFAULT '{}',         -- Additional conditions
  runs_count INTEGER DEFAULT 0,                 -- How many times fired
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, automation_template_id)
);
```

### `automation_logs` table (execution history)

```sql
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  business_automation_id UUID REFERENCES business_automations(id),
  contact_id UUID,                              -- The client who received the automation
  trigger_event JSONB NOT NULL,                 -- What triggered it
  action_taken TEXT NOT NULL,                   -- What was done
  channel TEXT NOT NULL,                        -- Which channel was used
  status TEXT NOT NULL DEFAULT 'sent',          -- 'sent', 'delivered', 'opened', 'clicked', 'failed'
  metadata JSONB DEFAULT '{}',                  -- Additional context
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_business_automations_business ON business_automations(business_id);
CREATE INDEX idx_business_automations_template ON business_automations(automation_template_id);
CREATE INDEX idx_business_automations_enabled ON business_automations(business_id, is_enabled);
CREATE INDEX idx_automation_logs_business ON automation_logs(business_id, created_at DESC);
CREATE INDEX idx_automation_logs_contact ON automation_logs(contact_id, created_at DESC);
CREATE INDEX idx_automation_templates_industry ON automation_templates USING GIN(industries);
```

---

## 7. Key Takeaways

### What We Learned

1. **ActiveCampaign leads in recipe volume (984)**, but most businesses only use 5-15 automations. Quality > quantity. Red Pine should launch with ~20-25 per industry, all vetted and ready to go.

2. **The toggle-on/off pattern is universal.** Every platform has it. The differentiator is how EASY Red Pine makes it. One screen, all automations visible, toggle switches, done.

3. **Industry-specific is a massive advantage.** Only ActiveCampaign (13 industries) and GoHighLevel (5+ niches) organize by industry. Most platforms are generic. Red Pine's 9 industry families with pre-loaded, industry-relevant automations is a genuine differentiator.

4. **The "Import Wizard" from ActiveCampaign is the best customization UX.** Walking users through each field during setup (not after) prevents confusion. Red Pine's customize wizard should follow this pattern.

5. **AI creation is table stakes in 2025-2026.** The COO should be able to suggest, create, and optimize automations. But the pre-built library should be the default path for 80% of users.

6. **SMS is king for time-sensitive automations** (reminders, on-my-way, no-show). Email is king for content-heavy automations (welcome series, reports, seasonal promos). Multi-channel (SMS + Email) is ideal for review requests and win-back campaigns.

7. **Default ON matters.** Keap's "Business-in-a-Box" gets users to value in < 30 minutes. Red Pine should pre-enable the essential automations (confirmations, reminders, reviews) and let users add more over time.

8. **The execution stats build trust.** Showing "Runs: 142 times" and "Recovered $2,340 in revenue" on each automation card gives users confidence that the system is working.

9. **Timing matters immensely.** Abandoned cart: 1 hour. Review requests: 2-4 hours. Birthday: day-of or 3-7 days before. No-show: 1 hour. Win-back: 30-60 days. Estimate follow-up: 48 hours. These are industry-proven defaults.

10. **DND/preference compliance is non-negotiable.** Every automation must respect the client's communication preferences. If they opted out of SMS, the automation falls back to email only.

### Red Pine Competitive Advantage

| Feature | GHL | HubSpot | Mailchimp | ActiveCampaign | Red Pine |
|---------|-----|---------|-----------|----------------|----------|
| Pre-built automations | 17+ | 50+ | 80+ | 984 | ~200 across 9 industries |
| Toggle on/off | Yes | Yes | Yes | Yes | Yes (simpler UI) |
| Industry-specific | 5 niches | No | No | 13 industries | 9 families (~40 templates) |
| AI-powered | Yes | Yes | Yes | No | COO suggests + optimizes |
| One-screen view | No | No | No | No | **YES** (toggle panel) |
| Default ON at setup | No | No | No | No | **YES** (pre-enabled essentials) |
| Customize wizard | No | No | No | Yes | **YES** (simplified) |
| Execution stats shown | No | Limited | Limited | Limited | **YES** (per-automation) |
| Price | $97-497/mo | $45-3600/mo | $13-350/mo | $29-259/mo | **$29-45/mo** |

### Implementation Priority

**Phase 1 (Launch):**
- 15 universal automations (all industries)
- 10-12 industry-specific per family (top 3 families: Beauty, Home Services, Professional)
- Toggle panel UI
- Basic customization (message text + timing)
- Email channel only (SMS in Phase 2)

**Phase 2 (Month 2-3):**
- SMS channel integration
- Multi-channel support (Email + SMS)
- Remaining 6 industry families
- COO AI automation suggestions
- Execution stats dashboard

**Phase 3 (Month 4-6):**
- Advanced conditions (service type, client segment)
- A/B testing (COO suggests timing variants)
- Custom automation builder (for power users)
- Automation performance analytics
- Community-shared automation templates

---

*Research completed 2026-02-24. Total automations cataloged: ~200 across 9 industries + universal set.*
