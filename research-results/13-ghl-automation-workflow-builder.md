# GoHighLevel (GHL) Automation / Workflow Builder — Deep Research

**Research Date:** 2026-02-24
**Sources:** Official GHL Help Portal, blog posts, third-party guides, changelog

---

## Table of Contents

1. [Workflow Builder UI](#1-workflow-builder-ui)
2. [Pre-built Automations / Recipes](#2-pre-built-automations--recipes)
3. [Available Triggers (Complete List)](#3-available-triggers-complete-list)
4. [Available Actions (Complete List)](#4-available-actions-complete-list)
5. [Automated Sequences & Examples](#5-automated-sequences--examples)
6. [If/Else Logic](#6-ifelse-logic)
7. [Wait/Delay Steps](#7-waitdelay-steps)
8. [AI in Automations](#8-ai-in-automations)
9. [Workflow Settings](#9-workflow-settings)
10. [Key Takeaways for Red Pine](#10-key-takeaways-for-red-pine)

---

## 1. Workflow Builder UI

### Overview

GHL's workflow builder has evolved through two major UI iterations:

1. **Classic Builder** — A vertical, linear step-by-step list. Trigger at top, actions stacked below. Simple but limited for complex branching.
2. **Advanced Builder** — A fully visual, freeform canvas (node-based). Released as a "Labs" feature, now the recommended default. This is where GHL is heading.

### Advanced Builder — Visual Canvas

The Advanced Builder is a **full drag-and-drop visual canvas** similar to tools like n8n, Make (Integromat), or Zapier's canvas view.

**Core mechanics:**
- Triggers, actions, conditions, and delays are **dragged from a panel** and placed anywhere on the canvas
- **Visual node connections** — click handles or the plus icon to connect elements with lines/arrows
- Instead of a vertical list, you see **all steps on one screen** and arrange them in a logical flow
- Multiple trigger paths, independent branches, and parallel logic **in one view**

**Key features:**

| Feature | Description |
|---------|-------------|
| **Multi-Select** | Marquee/Shift-drag to select and move groups of nodes simultaneously |
| **Copy-Paste** | Copy branches across workflows to reuse patterns |
| **Go-To Triggers** | Dashed-line connections that route triggers to specific actions (skip sequential flow) |
| **Delinked Nodes** | Independent clusters of actions that don't require linear connections — multiple triggers can launch separate branches within one workflow |
| **Auto-Layout (Tidy Up)** | One-click restructure of sprawling workflows into neat, readable lines. Works on entire workflow or selected branches only |
| **Enable/Disable Nodes** | Hover a node and click pause/play to disable or enable it. Disabled nodes are skipped; connections remain intact. No rewiring needed for testing |
| **Sticky Notes 2.0** | Image-ready documentation notes with color coding, placed anywhere on canvas |
| **Workflow Comments** | Inline collaboration tools for team annotation |
| **Right-Click Quick Actions** | Contextual menu for faster editing |
| **Stats Mode** | Cleaner performance visualization per node |
| **Workflow Switcher** | Navigate between workflows without leaving the builder |
| **Keyboard Shortcuts** | Comprehensive nav and editing shortcuts |

**Non-technical user experience:**
- The classic builder is very simple — literally just a vertical list of steps. Non-technical users can understand it quickly.
- The advanced builder is more powerful but more complex. GHL mitigates this with **AI Builder** (describe in plain English, AI builds it — see section 8) and **pre-built recipes/templates**.
- The **auto-layout** feature is critical — it lets users make a mess and then clean it up with one click.

**Important constraint:** Single enrollment per contact. Even with parallel branches, the same contact won't execute concurrently through multiple branches.

### Sources
- [Advanced Builder for Workflows — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000006635-advanced-builder-for-workflows)
- [Advanced Builder Changelog](https://ideas.gohighlevel.com/changelog/advanced-builder-a-new-era-for-workflow-design)
- [ConsultEvo Visual Builder Guide](https://consultevo.com/gohighlevel-workflow-visual-builder-guide/)

---

## 2. Pre-built Automations / Recipes

### Template Library

GHL provides a **Template Library** with curated, ready-to-use workflow recipes. Key facts:

- **17+ pre-built "recipe" workflows** available (number grows regularly)
- Accessible via: Automation > Workflows > Create Workflow > "Recipes" tab
- Filterable by **category** (e.g., Lead Nurture, Onboarding, Appointment, Review)
- Searchable by keyword
- Sortable by popularity
- All recipes are **fully customizable** after loading
- Users can also **save their own workflows as templates** for reuse
- Third-party marketplaces sell pre-built "snapshots" (sub-account templates with workflows included)

### Known Pre-built Recipes

| Recipe Name | Description |
|-------------|-------------|
| **Appointment Confirmation + Reminder + Survey + Review Request** | Full lifecycle: confirmation, reminders, post-appointment survey, positive result triggers review request |
| **Appointment Confirmation + Reminder** | Basic confirmation email/SMS + follow-up reminders before appointment |
| **Auto Missed Call Text-Back** | If a call is missed, auto-reply to lead via SMS and notify assigned user to follow up ASAP |
| **FB Messenger** | Auto-reply to inbound Facebook messages; if no response in 30 min, prompt lead to share phone number |
| **Birthday Template** | Birthday promotion workflow |
| **List Reactivation** | Re-engage cold leads from existing list without ad spend, using AI to filter positive responses |
| **Appointment Booking** | Detect booking intent on customer reply; send booking link or create manual SMS task |
| **GMB Business Message** | Notify users and auto-respond to Google My Business messaging channel |
| **No-Show Template** | Re-engage customers who missed appointments |
| **Fast Five** | "The odds of closing a lead decrease dramatically after 5 mins." Delivers the ultimate first-5-minute lead nurture sequence |
| **Webinar Registration Confirmation & Reminders** | Confirmation emails + reminders leading up to webinar |
| **Send Review Request** | Sends review requests when opportunities are won or appointments are marked as "showed" |
| **FAQ Auto Reply** | Tackles common inquiries across SMS, Facebook Messenger, etc. with automated responses |
| **Missed Call WhatsApp-Back** | WhatsApp version of missed call text-back |

### Industry-Specific Templates
GHL has added ready-made templates for popular niches:
- **Education** — course enrollment follow-ups
- **Health** — clinic appointment reminders
- **Finance** — lead nurture sequences
- **Real Estate** — property inquiry follow-ups
- **Beauty Salons** — missed-call-to-booked playbook

### Entry Points for Creating Workflows
Three paths from the landing page:
1. **AI Builder** — Describe automation in plain language
2. **Browse Templates** — Pre-built recipes
3. **Create from Scratch** — Blank canvas

### Sources
- [Template Library — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000005613-template-library-for-workflows)
- [HighLevel Workflow Recipes](https://gohighlevele.com/highlevel-help/highlevel-workflow-recipes/)
- [SupplyGem GHL Workflows Guide](https://supplygem.com/gohighlevel-workflows/)
- [Growthable Workflow Recipes](https://growthable.io/gohighlevel-tutorials/workflows/workflow-recipes-for-gohighlevel/)

---

## 3. Available Triggers (Complete List)

GHL has **91 workflow triggers** across **14 categories**. This is the complete list from official documentation:

### Contact (12 triggers)

| Trigger | Description |
|---------|-------------|
| Birthday Reminder | Fires on or around the contact's birthday |
| Contact Changed | Fires when specified contact fields change |
| Contact Created | Fires when a new contact record is added |
| Contact DND | Fires when Do Not Disturb preference changes |
| Contact Tag | Fires when a tag is added or removed |
| Custom Date Reminder | Fires before/on/after a custom date field |
| Note Added | Fires when a new note is added to a contact |
| Note Changed | Fires when an existing note is edited |
| Task Added | Fires when a task is created for a contact |
| Task Reminder | Fires when task reminder time is reached |
| Task Completed | Fires when a task is marked completed |
| Contact Engagement Score | Fires when engagement score changes |

### Events (24 triggers)

| Trigger | Description |
|---------|-------------|
| Inbound Webhook | Fires when an external system sends data via webhook |
| Scheduler | Native contactless trigger — starts workflow on a schedule (daily, weekly, etc.) for recurring jobs like reports, syncs, pings |
| Call Details | Fires on call events (answered, missed, voicemail, etc.) |
| Email Events | Fires on email interactions (open, click, bounce, unsubscribe) |
| Customer Replied | Fires when a contact replies to any message |
| Conversation AI Trigger | Fires based on Conversation AI bot interactions |
| Custom Trigger | User-defined trigger for custom integrations |
| Form Submitted | Fires when a GHL form is submitted |
| Survey Submitted | Fires when a GHL survey is completed |
| Trigger Link Clicked | Fires when a tracked trigger link is clicked |
| Facebook Lead Form Submitted | Fires on Facebook Lead Ads form submission |
| TikTok Form Submitted | Fires on TikTok lead form submission |
| Video Tracking | Fires on video engagement events |
| Number Validation | Fires when phone number validation completes |
| Messaging Error – SMS | Fires when an SMS fails to deliver |
| LinkedIn Lead Form Submitted | Fires on LinkedIn Lead Gen form submission |
| Funnel/Website PageView | Fires when a contact views a specific funnel/website page |
| Quiz Submitted | Fires when a quiz is completed |
| New Review Received | Fires when a new review is posted |
| Prospect Generated | Fires when a new prospect is generated |
| Click To WhatsApp Ads | Fires on WhatsApp ad click events |
| External Tracking Event | Fires on external tracking events |
| Google Lead Form Submitted | Fires on Google Ads lead form submission |
| Transcript Generated | Fires when a call/conversation transcript is created |

### Appointments (4 triggers)

| Trigger | Description |
|---------|-------------|
| Appointment Status | Fires when appointment status changes (confirmed, showed, no-show, cancelled) |
| Customer Booked Appointment | Fires when a customer books an appointment |
| Service Booking | Fires on service-type bookings |
| Rental Booking | Fires on rental-type bookings |

### Opportunities / Pipeline (5 triggers)

| Trigger | Description |
|---------|-------------|
| Opportunity Status Changed | Fires when opportunity status changes (open, won, lost, abandoned) |
| Opportunity Created | Fires when a new opportunity is created |
| Opportunity Changed | Fires when opportunity fields change |
| Pipeline Stage Changed | Fires when an opportunity moves between pipeline stages |
| Stale Opportunities | Fires when an opportunity has been inactive for a defined period |

### Affiliate (4 triggers)

| Trigger | Description |
|---------|-------------|
| Affiliate Created | Fires when a new affiliate is created |
| New Affiliate Sales | Fires when an affiliate generates a sale |
| Affiliate Enrolled In Campaign | Fires when an affiliate joins a campaign |
| Lead Created | Fires when an affiliate-attributed lead is created |

### Courses / Learning (12 triggers)

| Trigger | Description |
|---------|-------------|
| Category Started | Fires when a learner starts a course category |
| Category Completed | Fires when a learner completes a course category |
| Lesson Started | Fires when a learner starts a lesson |
| Lesson Completed | Fires when a learner completes a lesson |
| New Signup | Fires when a user signs up for a course/offer |
| Offer Access Granted | Fires when access to an offer is granted |
| Offer Access Removed | Fires when access is removed |
| Product Access Granted | Fires when product access is granted |
| Product Access Removed | Fires when product access is removed |
| Product Started | Fires when a learner starts a product/course |
| Product Completed | Fires when a learner completes a product/course |
| User Login | Fires when a learner logs in to the learning portal |

### Payments (12 triggers)

| Trigger | Description |
|---------|-------------|
| Invoice | Fires on invoice lifecycle events (created, sent, due, paid) |
| Payment Received | Fires when a payment is successfully captured |
| Order Form Submission | Fires when a checkout/order form is submitted |
| Order Submitted | Fires when an order is placed |
| Documents & Contracts | Fires on document lifecycle events (sent, viewed, signed) |
| Estimates | Fires on estimate events |
| Subscription | Fires on subscription events (created, renewed, cancelled, failed) |
| Refund | Fires when a refund is processed |
| Coupon Code Applied | Fires when a coupon code is applied |
| Coupon Redemption Limit Reached | Fires when coupon usage limit is hit |
| Coupon Code Expired | Fires when a coupon expires |
| Coupon Code Redeemed | Fires when a coupon is redeemed |

### Ecommerce / Stores (6 triggers)

| Trigger | Description |
|---------|-------------|
| Shopify Abandoned Cart | Fires on Shopify abandoned cart events |
| Shopify Order Placed | Fires when a Shopify order is placed |
| Shopify Order Fulfilled | Fires when a Shopify order is fulfilled |
| Order Fulfilled | Fires when any order is fulfilled |
| Product Review Submitted | Fires when a product review is submitted |
| Abandoned Checkout | Fires when a checkout is abandoned |

### IVR (1 trigger)

| Trigger | Description |
|---------|-------------|
| Start IVR Trigger | Fires when a caller reaches a configured IVR entry or option |

### Facebook / Instagram (2 triggers)

| Trigger | Description |
|---------|-------------|
| Facebook – Comment(s) On A Post | Fires when comments are added to a selected Facebook post |
| Instagram – Comment(s) On A Post | Fires when comments are added to a selected Instagram post |

### Communities (5 triggers)

| Trigger | Description |
|---------|-------------|
| Group Access Granted | Fires when a member is granted access to a community group |
| Group Access Revoked | Fires when group access is revoked |
| Private Channel Access Granted | Fires when access to a private channel is granted |
| Private Channel Access Revoked | Fires when private channel access is revoked |
| Community Group Member Leaderboard Level Changed | Fires when a member's leaderboard level changes |

### Certificates (1 trigger)

| Trigger | Description |
|---------|-------------|
| Certificates Issued | Fires when a course certificate is generated |

### Communication (2 triggers)

| Trigger | Description |
|---------|-------------|
| TikTok – Comment(s) On A Video | Fires when comments are added to a TikTok video |
| Transcript Generated | Fires when a call or conversation transcript is created |

### Sources
- [A List of Workflow Triggers — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers)
- [Growthable Triggers List](https://growthable.io/gohighlevel-tutorials/workflows/list-of-workflow-triggers-for-gohighlevel/)
- [Workflow Scheduler Trigger](https://help.gohighlevel.com/support/solutions/articles/155000006653-workflow-trigger-scheduler)

---

## 4. Available Actions (Complete List)

### Contact Management Actions

| Action | Description |
|--------|-------------|
| **Create Contact** | Adds a new contact to the system |
| **Find Contact** | Locates existing contacts for updates or referencing |
| **Update Contact Field** | Modifies specific contact information dynamically |
| **Add Contact Tag** | Organizes and segments contacts through tagging |
| **Remove Contact Tag** | Removes tags for list maintenance |
| **Assign to User** | Assigns a contact to a specific team member |
| **Remove Assigned User** | Removes user assignment from a contact |
| **Edit Conversation** | Marks, archives, or unarchives conversations |
| **Disable/Enable DND** | Controls Do Not Disturb outbound communication |
| **Add Note** | Adds a manual note to a contact record |
| **Add Task** | Creates a task related to a contact (or contact-less if no contact exists) |
| **Copy Contact** | Duplicates a contact into another sub-account |
| **Delete Contact** | Removes a contact from the system |
| **Modify Contact Engagement Score** | Adjusts engagement score metrics |
| **Add/Remove Contact Followers** | Manages shared contact visibility within teams |

### Communication Actions

| Action | Description |
|--------|-------------|
| **Send Email** | Sends personalized email to the contact |
| **Send SMS** | Sends text message to contact's phone number |
| **Send WhatsApp** | Sends WhatsApp message (when connected) |
| **Call** | Makes a phone call to the contact; if they pick up, rings a user |
| **Send Slack Message** | Posts to Slack channels for team notifications |
| **Messenger** | Manages inbound Facebook Messenger messages |
| **Instagram DM** | Engages customers via Instagram Direct Messages |
| **GMB Messaging** | Communicates through Google My Business |
| **Send Internal Notification** | Notifies team via email, SMS, or in-app notification |
| **Send Review Request** | Automates review request sending |
| **Send Live Chat Message** | Sends real-time chat message for customer support |
| **Facebook Interactive Messenger** | Responds to Facebook post comments |
| **Instagram Interactive Messenger** | Responds to Instagram post comments |
| **Reply in Comments** | Engages followers by responding to social media comments |
| **Manual Action** | Creates a manual task/action for human intervention |

### Conversation AI Actions

| Action | Description |
|--------|-------------|
| **Conversation AI** | Manages inbound conversations using AI (auto-pilot, suggestive, or off modes) |
| **Eliza AI Appointment Booking** | Automates appointment scheduling using AI chatbot |
| **Send to Eliza Agent Platform** | Routes contact to Eliza Agent Platform service |

### Flow Control / Logic Actions

| Action | Description |
|--------|-------------|
| **If/Else** | Creates conditional branches based on contact data, tags, opportunity status, etc. |
| **Wait Step** | Delays workflow execution (time-based, condition-based, or event-based) |
| **Goal Event** | Tracks milestones (form submit, payment, tag added, appointment status) — can skip steps or end workflow |
| **Split (A/B Test)** | Distributes contacts across up to 5 paths by percentage. Contacts stick to their assigned path on re-entry |
| **Go To (Add to Workflow)** | Enrolls contact into another workflow for complex multi-workflow journeys |
| **Remove from Workflow** | Removes contact from current, another, all-except-current, or all workflows |
| **Drip Mode** | Processes contacts in batches (1-10,000) at intervals (minutes/hours/days) instead of all at once |
| **Arrays** | Handles multiple values as a single unit for data manipulation |

### Data & Integration Actions

| Action | Description |
|--------|-------------|
| **Webhook (Outbound)** | Sends data from GHL to external applications |
| **Custom Webhook** | Full HTTP requests (GET/POST/PUT/DELETE) with auth options (Bearer, API key, Basic Auth, OAuth2) |
| **Google Sheets** | Updates or looks up data in spreadsheets |
| **Update Custom Value** | Dynamically updates custom fields based on events |
| **Text Formatter** | Transforms text data into desired formats |
| **Custom Code** | Executes custom JavaScript code within workflows. Can make HTTP requests. Premium action. |

### AI / GPT Actions

| Action | Description |
|--------|-------------|
| **GPT Powered by OpenAI** | Generates AI responses based on custom prompts. Supports GPT-3.5, GPT-4, GPT-4 Turbo, GPT-5, GPT-5 Mini, GPT-5 Nano. Output available as `{{chatgpt.1.response}}` variable for subsequent steps. |
| **AI Decision Maker** | Intelligent routing engine — describe conditions in plain English, AI evaluates contact data and routes to appropriate branch. Premium action ($0.01/execution). |

### Appointment Actions

| Action | Description |
|--------|-------------|
| **Update Appointment Status** | Changes appointment status (rescheduled, no-show, completed) |
| **Generate One Time Booking Link** | Creates unique, protected booking links for clients |

### Opportunity / Pipeline Actions

| Action | Description |
|--------|-------------|
| **Create/Update Opportunity** | Creates or updates pipeline opportunities |
| **Remove Opportunity** | Removes opportunities from specific pipelines |

### Payment Actions

| Action | Description |
|--------|-------------|
| **Stripe One-Time Charge** | Charges a one-time fee via Stripe using stored customer ID |
| **Send Invoice** | Automates invoice sending |
| **Send Documents and Contracts** | Sends contract templates to customers |

### Marketing / Ads Actions

| Action | Description |
|--------|-------------|
| **Add to Google Analytics** | Sends contact data for analytics |
| **Add to Google AdWords** | Manages Google Ads targeting |
| **Add to Custom Audience (Facebook)** | Segments audiences for Facebook ad targeting |
| **Remove from Custom Audience (Facebook)** | Manages Facebook audience segmentation |
| **Facebook Conversion API** | Sends conversion data for improved ad tracking |

### Affiliate Actions

| Action | Description |
|--------|-------------|
| **Add to Affiliate Manager** | Automates affiliate onboarding |
| **Update Affiliate** | Manages and updates affiliate information |
| **Add/Remove from Affiliate Campaign** | Manages affiliate campaign participation |

### Course Actions

| Action | Description |
|--------|-------------|
| **Course Grant Offer** | Grants course offers to contacts |
| **Course Revoke Offer** | Revokes previously granted course offers |

### IVR (Phone System) Actions

| Action | Description |
|--------|-------------|
| **Gather Input on Call** | Collects caller input (DTMF) to determine IVR path |
| **Play Message** | Plays audio message during IVR |
| **Connect to Call** | Forwards call to appropriate user or number |
| **End Call** | Terminates the call |
| **Record Voicemail** | Allows caller to leave voicemail |

### Community Actions

| Action | Description |
|--------|-------------|
| **Grant Group Access** | Grants access to specific community groups |
| **Revoke Group Access** | Removes access from community groups |

### Sources
- [A List of Workflow Actions — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000002294-what-are-workflow-actions-complete-list-)
- [Growthable Actions List](https://growthable.io/gohighlevel-tutorials/workflows/list-of-workflow-actions-for-gohighlevel/)
- [Custom Webhook Action](https://help.gohighlevel.com/support/solutions/articles/155000003305-workflow-action-custom-webhook)
- [Custom Code Action](https://help.gohighlevel.com/support/solutions/articles/155000002253-workflow-action-custom-code)
- [Drip Action](https://help.gohighlevel.com/support/solutions/articles/155000003360-workflow-action-drip)

---

## 5. Automated Sequences & Examples

### Typical Appointment Reminder Workflow

```
TRIGGER: Customer Booked Appointment
  |
  v
ACTION: Send Email — "Your appointment is confirmed!"
  |
  v
WAIT: Until 24 hours before appointment
  |
  v
ACTION: Send SMS — "Reminder: Your appointment is tomorrow at {{appointment.time}}"
  |
  v
WAIT: Until 1 hour before appointment
  |
  v
ACTION: Send SMS — "See you in 1 hour! {{business.address}}"
```

### Lead Nurture / Follow-Up Sequence

```
TRIGGER: Form Submitted
  |
  v
ACTION: Send Email — "Thanks for your interest!"
ACTION: Add Tag — "new_lead"
ACTION: Create Opportunity — Pipeline: Sales, Stage: New
  |
  v
WAIT: 5 minutes
  |
  v
ACTION: Send SMS — "Hi {{contact.first_name}}, thanks for reaching out!"
  |
  v
WAIT: 1 day
  |
  v
IF/ELSE: Did they reply?
  |         |
  YES       NO
  |         |
  v         v
Stop      ACTION: Send Email — follow-up #2
            |
            v
          WAIT: 2 days
            |
            v
          ACTION: Send SMS — "Still interested? Book a call: {{booking_link}}"
```

### "Fast Five" Speed-to-Lead Pattern

GHL's "Fast Five" recipe embodies the principle that **lead close rates drop dramatically after 5 minutes**:

```
TRIGGER: Form Submitted / Lead Created
  |
  v
ACTION: Send SMS — Instant auto-reply
ACTION: Send Email — Welcome + value prop
ACTION: Send Internal Notification — Alert sales team
  |
  v
WAIT: 2 minutes
  |
  v
ACTION: Call — Auto-dial the lead (if they answer, connect to sales rep)
  |
  v
IF/ELSE: Call answered?
  |         |
  YES       NO
  |         |
  v         v
End       WAIT: 3 minutes
            |
            v
          ACTION: Send SMS — "We tried calling, are you available?"
```

### Post-Appointment Survey + Review Request

```
TRIGGER: Appointment Status = "Showed"
  |
  v
WAIT: 2 hours
  |
  v
ACTION: Send Email — "How was your visit? Take our quick survey"
  |
  v
WAIT for Condition: Survey submitted
  |
  v
IF/ELSE: Survey score >= 4 stars?
  |         |
  YES       NO
  |         |
  v         v
Send      Send "How can
Review    we improve?"
Request   email
```

### No-Show Re-engagement

```
TRIGGER: Appointment Status = "No Show"
  |
  v
ACTION: Send SMS — "We missed you today! Want to reschedule?"
  |
  v
WAIT: 1 day
  |
  v
IF/ELSE: Replied?
  |         |
  YES       NO
  |         |
  v         v
Route     ACTION: Send Email — "Special offer to rebook"
to agent    |
            v
          WAIT: 3 days
            |
            v
          ACTION: Send SMS — Final attempt
```

### Birthday Promotion

```
TRIGGER: Birthday Reminder (fires days before birthday)
  |
  v
ACTION: Send SMS — "Happy Birthday {{contact.first_name}}! Here's a special gift..."
ACTION: Send Email — Birthday coupon/offer
ACTION: Add Tag — "birthday_promo_sent_2026"
```

### Sources
- [Appointment Follow-up Surveys](https://help.gohighlevel.com/support/solutions/articles/48001165881-how-to-build-automated-appointment-follow-up-surveys-in-workflow-builder)
- [Appointment Confirmation & Reminders](https://growthable.io/gohighlevel-tutorials/workflows/how-to-create-an-appointment-confirmation-and-appointment-reminders-campaign-in-workflows-for-gohighlevel/)
- [Automatic Email and SMS Followup](https://help.gohighlevel.com/support/solutions/articles/155000005060-getting-started-automatic-email-and-sms-followup)
- [Beauty Salon Operations Playbook](https://help.gohighlevel.com/support/solutions/articles/155000005252-from-missed-calls-to-fully-booked-the-operations-automation-playbook-for-beauty-salons)

---

## 6. If/Else Logic

### How It Works

The If/Else action evaluates contact-specific data and splits the workflow into **multiple branches**. Each branch represents a logical path based on whether conditions are met.

```
Contact hits If/Else step
  |
  v
All conditions evaluated
  |
  +--> Branch 1 (conditions met) --> Actions...
  |
  +--> Branch 2 (conditions met) --> Actions...
  |
  +--> None/Else (no conditions met) --> Fallback actions...
```

### Branch Structure

- **Conditional Branches**: User-defined paths with specific conditions
- **"None" (Else) Branch**: Auto-created, runs when NO conditions match. Cannot be removed. Can be renamed.
- **Multiple branches**: Add unlimited branches via "Add Branch"
- **Branch ordering matters**: System pushes the contact down the **first matching branch** (top-down priority)
- **Branches can be duplicated** (right-click > duplicate)
- **Branches can be reordered** via drag-and-drop (except the None branch, which stays at the bottom)

### Condition Logic

Conditions within a branch use **AND/OR** logic:

- **AND** — All conditions in the group must be true
- **OR** — At least one condition must be true
- **Segments** — Groups of conditions that can be combined for complex rules

### Operators Available

| Operator | Use Case |
|----------|----------|
| Is / Is Not | Exact match |
| Contains / Does Not Contain | Partial text match |
| Starts With / Ends With | Text prefix/suffix |
| Greater Than / Less Than | Numeric/date comparison |
| Before / After | Date comparison |
| Is Empty / Is Filled (Is Not Empty) | Check if field has any value |
| Includes / Does Not Include | Multi-select fields, tags |
| Equal To / Not Equal To | Alternative exact match |

### Filter Categories (What Can Be Checked)

| Category | Examples |
|----------|----------|
| **Contact Details** | First name, last name, email, phone, custom fields, source, city, state, country |
| **Tags** | Has tag / does not have tag |
| **Date - Time** | Current hour, time of day (15-min intervals), day of week |
| **Appointment** | Rescheduled (true/false), Start Date, End Date (only available with appointment triggers) |
| **Opportunity / Pipeline** | Pipeline stage, opportunity status, assigned pipeline |
| **Workflow Status** | Whether contact is active in another workflow |
| **Campaign Status** | Whether contact is in a campaign |
| **Last Activity** | Time since last interaction |
| **Dynamic Values** | Compare live outputs from earlier workflow steps or stored fields |
| **Numeric Fields** | Engagement scores, counts, totals |
| **Monetary Fields** | Invoice totals, amounts |
| **Select/Dropdown Fields** | Requires option IDs (not display names) when using Dynamic Values |

### Scenario Recipes (Pre-built Condition Templates)

GHL added **10 pre-built If/Else scenario recipes** — ready-made condition patterns you can load instead of building from scratch. These include prerequisite guidance for proper setup.

### AI Decision Maker (Alternative to If/Else)

Instead of manual conditions, the **AI Decision Maker** action:
- Accepts **plain English instructions** for routing logic
- Evaluates contact data using AI
- Routes to the most appropriate branch automatically
- Uses variable tags like `{{contact.engagement_score}}` in instructions
- Includes optional "Additional Context" field for nuanced decisions
- Has a permanent "Default Branch" for unmatched contacts
- **Premium action: $0.01 per execution**

**Example:** Instead of building 5 nested If/Else branches checking engagement score, industry, company size, etc., you write: "Route high-engagement enterprise contacts to the VIP branch, small businesses to the standard branch, and unqualified leads to the nurture branch."

### Sources
- [If/Else Workflow Action — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000002471-workflow-action-if-else)
- [If/Else New Features](https://help.gohighlevel.com/support/solutions/articles/155000001641-workflow-action-if-else-new-features)
- [If/Else Appointment Filters](https://help.gohighlevel.com/support/solutions/articles/155000004050-if-else-workflow-action-appointment-filter-options)
- [AI Decision Maker](https://help.gohighlevel.com/support/solutions/articles/155000005649-workflow-action-ai-decision-maker)
- [ConsultEvo If/Else Guide](https://consultevo.com/gohighlevel-if-else-workflow-guide/)

---

## 7. Wait/Delay Steps

### Six Wait Types

| Wait Type | Description |
|-----------|-------------|
| **Time Delay** | Wait for a fixed duration (minutes, hours, days, weeks) |
| **Event/Appointment Time** | Pause until before or after a scheduled event time (e.g., "2 hours before appointment") |
| **Overdue** | Pause relative to invoice due dates |
| **Wait for Condition** | Hold until specific CRM criteria are satisfied (field values, tags, etc.) |
| **Contact Reply** | Pause until contact responds on email or SMS channels |
| **Trigger Link / Email Events** | Pause until a link is clicked or email interaction occurs (opens, clicks, unsubscribes, bounces) |

### Time Delay Configuration

- **Units**: Minutes, Hours, Days, Weeks
- **Advanced scheduling**: Resume only on specific weekdays
- **Time window restrictions**: e.g., "Only resume between 9 AM and 5 PM"
- **Exact timestamp**: Wait until a specific date/time
- **Month/day/hour/minute offsets**: Granular timing control

### Wait for Condition

- Uses **Segments** (grouped rules) and **Conditions** (individual requirements)
- Operators: is, contains, is empty, etc.
- Multiple segments use **AND/OR** logic
- Workflow advances **as soon as any one segment becomes true**
- System evaluates all segments independently (no priority hierarchy)
- Can set a **timeout**: if condition isn't met within X time, proceed anyway or take alternate action

### "If Already in the Past" Handling

When the computed wait time is already in the past (e.g., waiting until 24 hours before an appointment that's in 12 hours):
- **Go to next step** — Skip the wait, proceed immediately
- **Go to specific step** — Jump to a defined action
- **Skip all remaining steps** — End the workflow

### Timezone Settings

| Option | Description |
|--------|-------------|
| Account Timezone | All time-based actions use the business's timezone |
| Contact Timezone | Actions execute based on each individual contact's timezone (ideal for national/global campaigns) |

### Sources
- [Wait Action — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000002470-workflow-action-wait)
- [ConsultEvo Wait Action Guide](https://consultevo.com/gohighlevel-wait-action-workflows/)
- [Growthable Wait Action Tutorial](https://growthable.io/gohighlevel-tutorials/workflows/using-the-wait-action-in-the-workflow-builder-for-gohighlevel/)

---

## 8. AI in Automations

GHL has invested heavily in AI across the entire automation system. Here is the complete AI suite:

### 8.1 Workflow AI Builder (Generate Workflows from Text)

**What it does:** Converts natural language descriptions into complete workflows.

**How to use:**
1. Open Workflows > Create Workflow
2. Type a description: "When form is submitted, send SMS to lead, wait 5 minutes for response — if no response create call task, if they respond add tag"
3. Click "Build Workflow" — AI generates the full trigger/action flow
4. Review and customize in the visual builder
5. Edit with natural language: "Add a 3-day wait between emails" or "Replace SMS with Slack notification"

**Capabilities:**
- Generate full workflows in seconds
- Add, remove, replace, modify, move actions via conversation
- Pre-written prompt templates available
- Autosave for AI-generated workflows
- AI chatbot assistant available inside the builder for iterative changes

**Pricing:** Free (with daily limits per sub-account)

**Example prompts:**
- "Send a welcome email series when someone fills out my contact form"
- "Create a birthday reminder workflow that sends SMS greetings"
- "Follow up with new leads three times via email and then text them a special offer"
- "When a high-value opportunity is created, notify my team on Slack"

### 8.2 Conversation AI Bot

**What it does:** AI chatbot that handles customer conversations across multiple channels.

**Modes:**
| Mode | Description |
|------|-------------|
| **Off** | Inactive (default). Training and testing still available |
| **Suggestive** | Generates response suggestions in the message composer for human review/editing before sending |
| **Auto-Pilot** | Automatically responds to incoming messages without human intervention |

**Supported Channels:**
- SMS
- Facebook Messenger
- Instagram DM
- Web Chat (SMS Chat)
- Live Chat

**Two Intents:**
1. **General Support / Q&A** — Answers queries based on training data
2. **Appointment Booking** — Asks customizable questions, then schedules calendar appointments

**Training Methods:**
- Public URLs / web links (crawls content)
- Manual Question-Answer pairs
- Bot training is **free** (no cost for training)

**Bot Trial:** Free testing with selectable intents. Thumbs up/down feedback to refine responses.

**Conversation Flow for Booking Bot:**
- Define custom questions the bot asks before sharing booking link
- Bot adapts based on user responses
- Can be customized with personality traits, instructions, and timeouts

**Pricing:** Token-based at OpenAI API rates (see pricing section below)

### 8.3 Voice AI Agents

**What it does:** AI-powered phone agents that handle inbound and outbound calls.

**Inbound Capabilities:**
- Automatically answer incoming calls during configured working hours
- Route after-hours calls to voicemail or other numbers
- Transfer calls to human agents based on defined conditions
- Natural speech understanding with context awareness
- Save collected information to contact records (name, email, address)
- Trigger workflows based on call content
- Send follow-up SMS messages
- Multiple languages supported

**Outbound Capabilities (2025-2026):**
- AI agents proactively reach out to contacts from workflow triggers
- Handle natural conversations, respond to objections
- Capture information and book appointments directly into calendar
- All without human intervention

**Configuration:**
- Assign any LC Phone or Twilio number to each agent
- Customize agent personality and responses
- Update knowledge base through agent goals and prompts
- Create multiple agents for different departments

**Requirements:** LC Phone or Twilio numbers required (regular phone numbers won't work)

### 8.4 AI Decision Maker (in Workflows)

**What it does:** Intelligent routing engine that replaces complex If/Else trees with plain English instructions.

- Describe conditions naturally: "Route VIP customers to the premium support branch"
- AI evaluates each contact's data and routes to the appropriate branch
- Uses variable tags: `{{contact.engagement_score}}`, `{{contact.industry}}`
- Default branch catches unmatched contacts
- **Pricing: $0.01 per execution**

### 8.5 GPT Action (in Workflows)

**What it does:** Generate AI text responses within workflow steps.

**Available Models:**
- GPT-3.5 Turbo (default)
- GPT-4
- GPT-4 Turbo
- GPT-5
- GPT-5 Mini
- GPT-5 Nano

**Configuration:**
- Custom prompt (can include dynamic variables from contact data)
- Optional system prompt for tone/behavior guidance
- Output available as `{{chatgpt.1.response}}` variable for subsequent steps
- Can be used in emails, SMS, stored in custom fields, sent via webhook, etc.

**Pricing:** Zero markup — you pay exactly what OpenAI charges (token-based)

### 8.6 Agent Studio

**What it does:** Multi-modal, specialized AI agent builder.

- Create custom AI agents with specific capabilities
- Interacts with Voice AI, Workflow AI, and Content AI
- Unified Agent Dashboard tracks every conversation, task, and workflow
- Multi-bot orchestration
- Custom prompt design
- Web Crawler training
- **Pricing:** Token-based at API rates

### 8.7 Content AI

**What it does:** Generates marketing content.

- Text generation: $0.0945 per 1,000 words
- Image generation: $0.063 per image

### 8.8 Funnel & Website AI

**What it does:** AI-assisted funnel and website building.

- **Pricing:** Free (1,000 prompts daily per sub-account)

### 8.9 AI-Powered Custom Code Generation

**What it does:** Within the Custom Code workflow action, AI can generate JavaScript code from natural language descriptions. Beta feature.

### Complete AI Pricing Summary

| AI Feature | Pricing |
|------------|---------|
| AI Employee Unlimited Plan | $97/month (excludes Agent Studio, Voice AI Widget, Voice AI Outbound) |
| Conversation AI | Token-based at OpenAI API rates (GPT-5: $1.25/$10 per 1M tokens in/out) |
| Voice AI | $0.06/min + LLM token costs |
| Workflow AI Decision Maker | $0.01 per execution |
| Workflow AI Builder | Free (daily limits) |
| Content AI (text) | $0.0945 per 1,000 words |
| Content AI (images) | $0.063 per image |
| Reviews AI | $0.01 per review |
| Funnel/Website AI | Free (1,000 prompts/day per sub-account) |

### Sources
- [Workflow AI Builder — HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/155000006100-workflow-ai-builder)
- [Conversation AI Bot Explained](https://help.gohighlevel.com/support/solutions/articles/155000001335-conversation-ai-bot-explained)
- [AI Voice Agents Overview](https://help.gohighlevel.com/support/solutions/articles/155000003911-ai-voice-agents-overview)
- [AI Decision Maker](https://help.gohighlevel.com/support/solutions/articles/155000005649-workflow-action-ai-decision-maker)
- [GPT Powered by OpenAI](https://help.gohighlevel.com/support/solutions/articles/155000000209-workflow-action-gpt-powered-by-openai)
- [AI Product Pricing Update](https://help.gohighlevel.com/support/solutions/articles/155000006652-ai-product-pricing-update)
- [GHL New AI Features 2025](https://ghlcentral.com/gohighlevel-new-ai-features-2025-michael-reimer/)
- [Voice AI Outbound Calling Guide](https://ai2flows.com/post/gohighlevel-voice-ai-outbound-calling-guide-2026)
- [Top 10 HighLevel AI Releases 2025](https://www.gohighlevel.com/post/the-top-10-highlevel-ai-releases-of-2025)

---

## 9. Workflow Settings

Every workflow has global settings that control behavior:

| Setting | Description |
|---------|-------------|
| **Allow Re-entry** | ON by default. When enabled, contacts can enter the workflow multiple times. Disable for one-time sequences (e.g., onboarding). |
| **Allow Multiple Opportunities** | Enables separate workflow instances for each opportunity tied to a contact |
| **Stop on Response** | When enabled, workflow ends for a contact if they respond to a message sent from this workflow. Voicemail detection prevents false triggers. |
| **Timezone** | Account timezone (business's TZ) or Contact timezone (each contact's individual TZ) |
| **Time Window** | Restricts when communication actions execute. Set start time, end time, and allowed days. |
| **Sender Details** | Default From Name, From Email, and From Number for communications |
| **Conversations – Mark as Read** | Auto-marks conversations as read when the workflow interacts with them |

### Bulk Actions for Workflow Management

From the workflow list page:
- Bulk publish/unpublish workflows
- Bulk delete workflows
- Bulk move to folders

### Execution Logs

GHL provides **execution logs** and **enrollment history** per workflow:
- See which contacts entered the workflow
- Track which actions executed
- View timestamps for each step
- Debug failed actions

### Sources
- [Workflow Settings Overview](https://help.gohighlevel.com/support/solutions/articles/48001239875-workflow-settings-overview)
- [Allow Re-Entry Default Setting](https://ideas.gohighlevel.com/changelog/allow-re-entry-default-setting-changes)

---

## 10. Key Takeaways for Red Pine

### What GHL Does Well (Must-Match)

1. **91 triggers covering every conceivable event** — form submissions, appointment booking, payment, pipeline changes, birthdays, custom dates, social media comments, webhooks, scheduled/cron jobs, e-commerce events, course completions.

2. **Rich action library** — Send SMS/email/WhatsApp, call, add/remove tags, move pipeline stages, create tasks, webhook integrations, custom code, A/B testing, drip control.

3. **Visual canvas builder** — Node-based drag-and-drop with multi-select, copy-paste, auto-layout, enable/disable testing. This is table stakes for a modern automation platform.

4. **Pre-built recipes** — 17+ templates for common workflows. Users don't start from scratch. Fast Five, appointment reminders, missed call text-back, review requests — these cover the 80% case.

5. **AI Builder** — Describe what you want in plain English, AI builds the workflow. This dramatically lowers the barrier for non-technical users.

6. **If/Else + AI Decision Maker** — Both traditional condition-based branching AND AI-powered routing. The AI Decision Maker at $0.01/execution is genuinely innovative.

7. **Wait step sophistication** — 6 types of waits: time delay, event/appointment time, overdue, condition, contact reply, trigger link/email events. Plus timezone handling, time windows, weekday filtering.

8. **Conversation AI across channels** — SMS, Facebook, Instagram, web chat, live chat. Suggestive + auto-pilot modes. Appointment booking intent built-in.

9. **Voice AI** — Inbound/outbound AI phone agents. This is a premium differentiator but increasingly expected.

10. **Workflow settings** — Re-entry control, stop on response, time windows, timezone per contact. These are essential for production-quality automation.

### What Red Pine Should Prioritize

**Phase 1 (Core — Must Have Before Launch):**
- Trigger: Form submitted, appointment booked, appointment status changed, payment received, pipeline stage changed, contact created, contact tag added/removed, custom date reminder
- Actions: Send SMS, send email, add/remove tag, move pipeline stage, wait/delay, if/else, create task, send internal notification, webhook
- Pre-built recipes: Appointment confirmation + reminder, missed call text-back, review request, lead nurture sequence
- Basic workflow builder (even linear/vertical is fine for v1, but plan for canvas)

**Phase 2 (Differentiation):**
- AI Builder (describe in plain English)
- Conversation AI (auto-respond across channels)
- Visual canvas builder (node-based)
- More triggers: birthday, invoice events, subscription events
- More actions: A/B split, drip mode, custom code
- Template library with industry-specific recipes

**Phase 3 (Premium):**
- Voice AI agents
- AI Decision Maker
- Agent Studio
- Advanced IVR
- E-commerce integrations

### Critical Design Decisions

1. **Linear builder first, canvas later** — GHL started with a vertical list builder and added the canvas later. This is a proven path.

2. **Recipes/templates are critical for adoption** — Non-technical users need pre-built workflows, not a blank canvas. Industry-specific templates (nail salon appointment reminders, pet groomer follow-ups) create instant value.

3. **AI Builder is the future** — "Describe what you want" is the endgame for automation. GHL's implementation proves it works and users want it. Plan architecture to support this.

4. **Per-business automation, not per-platform** — Each business gets its own workflows operating on its own data. This matches Red Pine's multi-tenant architecture.

5. **Execution logs are essential** — Users need to see what happened, when, and why. This is critical for debugging and trust.
