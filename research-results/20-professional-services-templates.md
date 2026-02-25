# Research #20: Professional Services Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 8 professional service business types based on competitor platform research.

---

## Table of Contents
1. [Law Firm / Solo Attorney](#1-law-firm--solo-attorney)
2. [Accounting / Bookkeeping Firm](#2-accounting--bookkeeping-firm)
3. [Business Consultant](#3-business-consultant)
4. [Real Estate Agent / Agency](#4-real-estate-agent--agency)
5. [Insurance Agent / Agency](#5-insurance-agent--agency)
6. [Marketing / Creative Agency](#6-marketing--creative-agency)
7. [Architecture Firm](#7-architecture-firm)
8. [Financial Advisor / Planner](#8-financial-advisor--planner)
9. [Competitor Comparison](#9-competitor-comparison)
10. [Template Config Recommendations](#10-template-config-recommendations)

---

## INDUSTRY OVERVIEW

Professional services businesses sell expertise and time rather than physical products. The common thread is billable hours, client relationship management, document-heavy workflows, and long client lifecycles. These businesses rely on trust, reputation, and referrals. Key platform needs: time tracking, billing (hourly/retainer/project), document management, client portal, and compliance features specific to each profession.

---

## 1. LAW FIRM / SOLO ATTORNEY

**Competitors studied:** Clio, MyCase, PracticePanther, CosmoLex, Smokeball

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Practice Areas / Legal Services |
| Appointments | Consultations / Court Dates |
| Products | N/A |
| Staff | Attorneys / Associates / Paralegals |
| Pipeline | Case Pipeline / Intake Pipeline |

**Essential Tabs:**

1. **Dashboard** — Billable hours today/week/month, revenue collected, outstanding balances, upcoming deadlines (statute of limitations, filing dates), court dates this week, new client inquiries, trust account balance. Clio's dashboard surfaces key financial and deadline metrics.
2. **Matters / Cases** — The core entity: case details (client, practice area, opposing party, court, judge, case number), related contacts, documents, notes, time entries, invoices, events, tasks. Clio Manage organizes everything by matter. Status tracking (active, pending, closed).
3. **Time Tracking** — Billable hour tracking is mission-critical. Start/stop timers, manual entry, activity descriptions, rate per attorney, non-billable time tracking, minimum billing increments (6-minute, 15-minute). Clio tracks time with precision for accurate billing.
4. **Billing / Invoices** — Generate invoices from tracked time + expenses, trust/retainer account management (IOLTA compliance), payment collection, LEDES billing format for insurance defense, custom billing templates. Clio's billing engine handles complex fee structures.
5. **Documents** — Secure document storage, version control, document templates (contracts, pleadings, letters), e-signatures, document assembly/automation. Attorney-client privilege requires secure access controls. Clio integrates with NetDocuments and Dropbox.
6. **Calendar** — Court dates, filing deadlines, statute of limitations, client meetings, depositions, mediations. Deadline management with automated reminders. Integration with court calendars.

**Optional Tabs:**

1. **Contacts** — Related parties per matter: opposing counsel, experts, witnesses, judges, mediators. Contact roles and relationships.
2. **Tasks** — Task assignment to attorneys and paralegals, deadline tracking, workflow checklists per matter type (e.g., personal injury intake checklist).
3. **Trust Accounting** — IOLTA trust account management (required by bar), client ledger, trust-to-operating transfers, three-way reconciliation. Compliance is non-negotiable.
4. **Client Portal** — Secure portal for clients to view case status, messages, documents, invoices. Clio Connect provides this.
5. **Intake** — New client intake forms, conflict checks, engagement letters, fee agreements. Lead pipeline from inquiry to signed retainer.
6. **Reports** — Billable hour reports, realization rate, utilization rate, aged receivables, matter profitability, attorney productivity.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Matters/Cases | Table | Cases with client, area, status, deadlines, balance |
| Time Entries | Table | Billable hours with attorney, description, rate |
| Contacts | Table | Related parties with role (opposing counsel, witness) |
| Documents | Table | Files with matter, version, access permissions |
| Invoices | Table | Bills with time entries, expenses, trust credits |
| Court Dates | Calendar | Hearings, trials, depositions, filing deadlines |
| Tasks | List | Assignments with deadline, assignee, matter |
| Trust Ledger | Table | IOLTA transactions per client |

**Pipeline Stages:**

```
Inquiry -> Conflict Check -> Initial Consultation -> Engagement Letter Sent -> Retainer Received -> Active Matter -> Discovery -> Settlement/Trial Prep -> Resolution -> Closed -> Follow-Up
```

**Unique Features:**
- Billable hour tracking with start/stop timers and 6-minute increments
- IOLTA trust accounting (required by state bar)
- Conflict checking before taking new cases
- Statute of limitations and deadline management
- Court date calendar with automated reminders
- Document assembly and automation (merge fields into templates)
- LEDES billing format for insurance defense work
- Retainer/evergreen retainer management
- Attorney-client privilege access controls on documents
- E-signature for engagement letters and settlements
- Clio AI (Duo): document summarization, case detail retrieval
- Clio pricing: EasyStart $49/user/mo, Complete $159/user/mo

**Billing Model:**
- Hourly billing (most common): tracked time x attorney rate
- Flat fee (traffic tickets, simple wills, uncontested divorces)
- Contingency (personal injury: 33-40% of settlement)
- Retainer (monthly retainer against hourly billing)
- Hybrid (retainer + hourly overage)
- Trust account deposits required before work begins
- LEDES invoicing for insurance/corporate clients

**Compliance Requirements:**
- IOLTA trust accounting (bar requirement)
- Conflict of interest checking
- Client confidentiality and privilege
- Record retention policies (varies by state, typically 5-7 years)
- Bar CLE (continuing education) tracking

---

## 2. ACCOUNTING / BOOKKEEPING FIRM

**Competitors studied:** Canopy, Karbon, TaxDome, Jetpack Workflow, Practice Ignition (Ignition)

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Services / Engagements |
| Appointments | Meetings |
| Products | N/A |
| Staff | CPAs / Accountants / Bookkeepers |
| Pipeline | Client Pipeline / Tax Season Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active clients, tasks due this week, tax deadlines, outstanding invoices, engagement letters pending, team workload distribution. Seasonal spike visualization (January-April tax season).
2. **Clients** — Client profiles: entity type (individual, LLC, S-corp, C-corp, partnership, trust), tax ID, fiscal year, services engaged (tax prep, bookkeeping, payroll, advisory), document list, communication history. Canopy's CRM centralizes all client info.
3. **Tasks / Workflow** — Task management per client: tax return preparation steps, bookkeeping tasks, audit preparation, recurring deadlines. Workflow templates by engagement type (1040, 1120S, quarterly bookkeeping). Karbon's workflow engine standardizes every step.
4. **Documents** — Secure document exchange (bank statements, receipts, W-2s, 1099s), document requests to clients, e-signatures, organized by client and tax year. Canopy's document management with client portal is a standout.
5. **Time Tracking** — Billable hours per client/engagement, timer functionality, activity descriptions, rate by staff level (partner, senior, staff).
6. **Billing / Invoices** — Invoice generation from time entries, flat-fee billing per engagement, recurring invoicing for monthly bookkeeping, payment collection. Canopy and Karbon both offer integrated billing.

**Optional Tabs:**

1. **Tax Returns** — Tax return status tracking (not started, in progress, review, e-filed, accepted/rejected), extension deadlines, estimated payments tracking. Critical during tax season.
2. **Client Portal** — Secure portal for clients to upload documents, view/sign engagement letters, pay invoices, message the firm. Canopy and TaxDome both offer client portals.
3. **Calendar** — Tax deadlines (April 15, October 15, quarterly estimates), client meetings, IRS/state notice deadlines.
4. **Reports** — Revenue by service type, staff utilization, realization rate, client profitability, seasonal workload analysis.
5. **IRS Notices** — IRS transcript retrieval, notice management, resolution tracking. Canopy's standout feature.
6. **Proposals / Engagement Letters** — Fee proposals, engagement letter generation with e-signature, scope of work definition.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Clients with entity type, services, tax year status |
| Tax Returns | Pipeline | Returns with status (prep, review, filed, accepted) |
| Tasks | List | Workflow tasks per client/engagement with deadlines |
| Documents | Table | Client documents organized by type and year |
| Time Entries | Table | Billable hours with client, engagement, staff |
| Invoices | Table | Bills with service type, amount, payment status |
| Engagement Letters | Table | Proposals with signing status |
| IRS Notices | Table | Notices with resolution status and deadline |

**Pipeline Stages:**

```
Prospect -> Consultation -> Proposal/Engagement Letter Sent -> Signed -> Onboarding (Document Collection) -> Work In Progress -> Review -> Delivered/Filed -> Client Follow-Up -> Recurring
```

**Unique Features:**
- Tax season workflow management (January-April sprint)
- IRS transcript retrieval and notice management (Canopy unique feature)
- Engagement letter generation with e-signature
- Client document request portal (request specific docs, track what's missing)
- Workflow templates per engagement type (1040, 1120S, bookkeeping)
- Deadline management (tax filing dates, extensions, quarterly estimates)
- Staff workload balancing (critical during tax season)
- Entity type tracking (individual vs business, state/federal)
- Recurring services management (monthly bookkeeping, quarterly payroll)
- Multi-year client history tracking
- Canopy pricing: modular (CRM, workflow, billing, documents sold separately)
- Karbon pricing: starts at ~$59/user/month

**Billing Model:**
- Flat fee per engagement (1040 prep: $200-500, business return: $500-2000)
- Hourly billing for advisory/consulting work
- Monthly recurring for bookkeeping ($200-2000/month)
- Annual engagement with monthly billing
- Value pricing (based on complexity, not hours)
- Retainer for ongoing advisory

**Compliance Requirements:**
- Preparer Tax Identification Number (PTIN) maintenance
- CPE (Continuing Professional Education) tracking
- Client data security (SOC 2 compliance for cloud platforms)
- IRS e-file authorization
- State-specific licensing requirements

---

## 3. BUSINESS CONSULTANT

**Competitors studied:** HoneyBook, Dubsado, Toggl Track, Monday.com, Bonsai

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Engagements / Projects |
| Appointments | Sessions / Meetings |
| Products | Deliverables |
| Staff | Consultants / Associates |
| Pipeline | Sales Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active engagements, revenue this month, upcoming sessions, proposals pending, hours logged, invoices outstanding.
2. **Projects / Engagements** — Project management per client: scope, deliverables, milestones, timeline, budget, time tracking, documents, notes. Project status and health tracking.
3. **Clients** — Client CRM: company info, key contacts, engagement history, notes, contracts, invoices. Relationship management over long lifecycles.
4. **Calendar** — Client sessions, workshops, deadlines, follow-ups, strategy reviews.
5. **Proposals / Contracts** — Proposal builder with scope, deliverables, timeline, pricing, terms. Contract generation with e-signature. Dubsado's proposal-to-contract-to-invoice flow is seamless.
6. **Invoices / Payments** — Invoice from project milestones or time entries, retainer billing, payment plans, expense tracking. Multiple billing models per client.

**Optional Tabs:**

1. **Time Tracking** — Hours per client/project, billable vs non-billable, utilization tracking. Toggl Track is the gold standard for consultant time tracking.
2. **Documents** — Client deliverables, strategy documents, reports, presentations, shared workspace.
3. **Tasks** — Personal and project task management, delegation, deadline tracking.
4. **Marketing** — Content marketing, LinkedIn presence, referral network, speaking engagements, lead pipeline.
5. **Reports** — Revenue per client, project profitability, utilization rate, pipeline value, client retention.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Engagements | Pipeline | Active projects with client, status, budget, timeline |
| Clients | Table | Companies/individuals with history, contracts, balance |
| Proposals | Pipeline | Proposals with sent, viewed, accepted status |
| Sessions | Calendar | Client meetings, workshops, strategy reviews |
| Time Entries | Table | Hours logged per client/project |
| Invoices | Table | Bills with project, milestones, payment status |
| Deliverables | Table | Project outputs with due dates, status |

**Pipeline Stages:**

```
Lead -> Discovery Call -> Proposal Sent -> Negotiation -> Contract Signed -> Kickoff -> In Progress -> Milestone Delivery -> Wrap-Up -> Retainer/Renewal -> Referral Request
```

**Unique Features:**
- Flexible billing (hourly, project-based, retainer, value-based)
- Proposal-to-contract-to-invoice workflow
- Client session scheduling with video conferencing
- Deliverable tracking with milestones
- Scope management (prevent scope creep with documented agreements)
- Project health indicators (on-budget, on-time, at-risk)
- Knowledge base / document library per client
- CRM with long sales cycle tracking
- Referral and network management
- Dubsado pricing: Starter $20/mo, Premier $40/mo
- HoneyBook pricing: Starter $29/mo, Premium $109/mo (annual)

**Billing Model:**
- Hourly billing ($100-500+/hour depending on specialty)
- Project-based flat fee with milestones
- Monthly retainer ($2,000-10,000+/month)
- Value-based pricing (tied to outcomes)
- Day rate ($1,000-5,000/day)
- Payment plans for larger engagements

---

## 4. REAL ESTATE AGENT / AGENCY

**Competitors studied:** Follow Up Boss, kvCORE (BoldTrail), LionDesk, Wise Agent, Sierra Interactive

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Leads / Contacts |
| Services | Listings / Transactions |
| Appointments | Showings / Open Houses |
| Products | Properties / Listings |
| Staff | Agents / Realtors |
| Pipeline | Deal Pipeline / Transaction Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active listings, pending deals, closed this month/quarter/year, commission earned, new leads, showing schedule, upcoming closings.
2. **Contacts / CRM** — Lead and client database: buyer vs seller, lead source, communication history, property preferences (location, bedrooms, budget), relationship stage. Follow Up Boss centers on lead response time and follow-up automation.
3. **Listings** — Active listings: property details (MLS#, address, beds/baths, sqft, price, photos), showing schedule, days on market, price history, marketing materials, open house schedule.
4. **Transactions / Deals** — Deal pipeline: offer submitted, under contract, inspection, appraisal, closing. Document tracking per transaction (purchase agreement, disclosures, inspection reports, title docs). Commission tracking.
5. **Calendar** — Showings, open houses, inspections, appraisals, closings, client appointments.
6. **Communication** — Email/SMS outreach, drip campaigns for leads, automated follow-ups, bulk marketing. kvCORE auto-nurtures leads with relevant listings.

**Optional Tabs:**

1. **Marketing** — Property marketing materials, social media posts, open house promotions, farming/neighborhood campaigns, IDX website management.
2. **Documents** — Purchase agreements, disclosures, addenda, inspection reports, title documents. E-signature integration (DocuSign, dotloop).
3. **Reports** — Commission tracking, lead source ROI, conversion rates, pipeline value, year-over-year performance.
4. **Team** — Agent management, lead routing, commission splits, performance tracking.
5. **Open Houses** — Open house scheduling, sign-in sheet (digital lead capture), follow-up automation.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Contacts | Table | Leads and clients with stage, source, preferences |
| Listings | Cards | Properties with photos, price, status, showings |
| Transactions | Pipeline | Deals with stage, dates, commission, documents |
| Showings | Calendar | Property showings with buyer, listing, time |
| Open Houses | Calendar | Open house events with listing, sign-in leads |
| Commission | Table | Earned and pending commissions per transaction |

**Pipeline Stages:**

Buyer pipeline:
```
Lead -> Pre-Qualification -> Active Search -> Showing Properties -> Offer Submitted -> Under Contract -> Inspection -> Appraisal -> Clear to Close -> Closed -> Post-Close Follow-Up
```

Seller/Listing pipeline:
```
Lead -> Listing Presentation -> Price Agreement -> Listing Active -> Showings -> Offer Received -> Under Contract -> Inspection/Appraisal -> Closing -> Closed -> Referral Request
```

**Unique Features:**
- MLS integration and IDX website for property search
- Lead routing and automated nurture campaigns
- Property showing scheduling and feedback collection
- Transaction management with document tracking
- Commission tracking and split calculations
- Open house lead capture with automatic follow-up
- Drip campaigns based on buyer preferences
- CMA (Comparative Market Analysis) generation
- Escrow/closing timeline management
- Annual sphere-of-influence marketing (past client follow-up)
- Follow Up Boss pricing: $58/user/mo (Grow plan)
- kvCORE pricing: varies, typically $300-500+/mo for teams

**Billing Model:**
- Commission-based (2.5-3% of sale price per side)
- Split with brokerage (70/30, 80/20, 100% with fees)
- Flat-fee listings available
- No direct client billing (commission from transaction)
- Marketing expenses self-funded

---

## 5. INSURANCE AGENT / AGENCY

**Competitors studied:** AgencyZoom, HawkSoft, Applied Epic, EZLynx, Better Agency

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Policyholders / Clients |
| Services | Policies / Lines of Business |
| Appointments | Reviews / Consultations |
| Products | Insurance Products |
| Staff | Agents / Producers / CSRs |
| Pipeline | Sales Pipeline |

**Essential Tabs:**

1. **Dashboard** — Policies in force, new business this month, renewals upcoming, premium volume, commission earned, leads in pipeline, retention rate.
2. **Clients / Policyholders** — Client profiles: personal info, all policies (auto, home, life, commercial), claims history, coverage gaps, annual review date, referral source. Household/business grouping.
3. **Policies** — Policy management: carrier, policy number, coverage type, premium, deductible, effective dates, renewal date, status (active, cancelled, lapsed). Multiple policies per client.
4. **Pipeline / Sales** — New business pipeline: lead source, quoted carriers, premium, close probability, follow-up dates. Cross-sell/upsell opportunities for existing clients.
5. **Renewals** — Renewal tracking: policies expiring in 30/60/90 days, re-marketing needed, rate increases, retention actions.
6. **Communication** — Client outreach: policy renewal reminders, claims follow-up, cross-sell campaigns, annual review invitations. Automated touchpoints throughout the year.

**Optional Tabs:**

1. **Claims** — Claim tracking: claim number, carrier, status, dates, adjuster info, settlement. Limited involvement (carrier handles) but tracking important.
2. **Quotes** — Comparative quoting across carriers, proposal generation, bind requests.
3. **Marketing** — Referral programs, community events, educational content, review requests.
4. **Commissions** — Commission tracking per policy, carrier statements, override tracking, production goals.
5. **Documents** — Policy documents, applications, certificates of insurance, claims documentation.
6. **Reports** — Book of business value, retention rate, new business, carrier mix, producer performance, loss ratio.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Policyholders with policies, premium total, review date |
| Policies | Table | Active policies with carrier, type, premium, renewal |
| Pipeline | Pipeline | New business opportunities with quote status |
| Renewals | Table | Upcoming renewals sorted by date |
| Claims | Table | Open claims with carrier, status, dates |
| Quotes | Table | Comparative quotes across carriers |
| Commissions | Table | Earned commissions by policy, carrier |

**Pipeline Stages:**

```
Lead -> Initial Contact -> Needs Assessment -> Quote/Proposal Sent -> Follow-Up -> Application Submitted -> Underwriting -> Bound -> Policy Issued -> Welcome Kit -> Annual Review -> Renewal -> Cross-Sell
```

**Unique Features:**
- Multi-policy per client management (bundle: auto + home + umbrella)
- Carrier comparative quoting (rates from multiple carriers)
- Renewal tracking and proactive re-marketing
- Cross-sell/upsell identification (coverage gap analysis)
- Commission tracking per policy and carrier
- Annual review scheduling and tracking
- Claims assistance tracking
- Certificate of insurance generation
- Household/business grouping for related policies
- Retention campaigns for at-risk policies
- Book of business valuation

**Billing Model:**
- Commission from carriers (percentage of premium)
- No direct billing to clients (carrier bills the policyholder)
- Commission rates vary: 10-20% for P&C, 50-100%+ first year for life
- Renewal commissions (ongoing revenue per policy)
- Override/bonus commissions from carriers

---

## 6. MARKETING / CREATIVE AGENCY

**Competitors studied:** Monday.com, Wrike, ClickUp, HoneyBook, Asana, AgencyAnalytics

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Accounts |
| Services | Services / Campaigns |
| Appointments | Meetings / Reviews |
| Products | Deliverables |
| Staff | Creatives / Strategists / Account Managers |
| Pipeline | New Business Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active projects, campaign performance summaries, team capacity, upcoming deadlines, revenue, client health scores. Monday.com and Asana offer project-centric dashboards.
2. **Projects** — Project/campaign management: scope, deliverables, tasks, timeline (Gantt), budget, team assignment, client approval tracking. Project types: website build, ad campaign, social media management, branding, SEO, content.
3. **Clients / Accounts** — Account management: company info, contacts, contract terms, retainer amount, campaign history, brand guidelines, assets. Long-term relationship tracking.
4. **Tasks** — Task management with assignment, deadlines, priority, dependencies, subtasks. Creative workflow stages per task (brief, draft, internal review, client review, approved, published). Monday.com and ClickUp offer detailed task workflows.
5. **Calendar** — Content calendars, campaign launch dates, client review meetings, internal deadlines.
6. **Invoices / Billing** — Retainer billing, project billing, hourly billing, expense tracking, time tracking per client/project. Profitability per account.

**Optional Tabs:**

1. **Time Tracking** — Hours per client/project, billable vs non-billable, utilization by team member. Critical for agencies billing hourly or tracking retainer efficiency.
2. **Reports / Analytics** — Campaign performance reporting, client dashboards, SEO rankings, ad spend ROI. AgencyAnalytics aggregates data from 80+ marketing platforms for client reporting.
3. **Assets** — Digital asset management: logos, brand files, photos, videos, copy documents. Version control for creative assets.
4. **Content Calendar** — Social media scheduling, blog post calendar, email campaign calendar. Visual planning tool.
5. **Proposals** — New business proposals with scope, strategy, pricing, team bios. Template library per service type.
6. **Approvals** — Client approval workflows for creative deliverables (designs, copy, campaigns). Proof review with markup tools.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline/Cards | Campaigns with client, type, status, deadline |
| Tasks | List/Cards | Creative tasks with assignee, stage, deadline |
| Clients | Table | Accounts with contract, retainer, campaign history |
| Deliverables | Table | Creative outputs with approval status |
| Time Entries | Table | Hours per client/project with billable flag |
| Content Calendar | Calendar | Scheduled content across channels |
| Proposals | Pipeline | New business pitches with status |

**Pipeline Stages:**

New business:
```
Lead -> Discovery Call -> Pitch/Proposal Sent -> Presentation -> Negotiation -> Signed -> Onboarding -> Active Account
```

Project:
```
Brief -> Strategy -> Creative -> Internal Review -> Client Review -> Revisions -> Approved -> Production -> Launch -> Reporting -> Optimization
```

**Unique Features:**
- Creative workflow stages (brief -> draft -> review -> approve -> publish)
- Client approval/proofing workflows with markup
- Content calendar with multi-channel scheduling
- Client reporting dashboards (aggregated marketing analytics)
- Brand asset management and version control
- Retainer utilization tracking (hours used vs allocated)
- Scope management (prevent scope creep)
- Time tracking with profitability analysis per account
- Resource/capacity planning across team
- Template library for proposals and deliverables

**Billing Model:**
- Monthly retainer ($2,000-20,000+/month)
- Project-based pricing ($5,000-100,000+ per project)
- Hourly billing ($75-300/hour by role)
- Performance-based (percentage of ad spend managed)
- Hybrid (retainer + project + hourly overages)
- Expense pass-through (ad spend, stock photos, tools)

---

## 7. ARCHITECTURE FIRM

**Competitors studied:** Houzz Pro, Monograph, BQE CORE, Deltek Ajera, Archisnapper

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Projects / Phases |
| Appointments | Meetings / Site Visits |
| Products | Drawings / Deliverables |
| Staff | Architects / Designers / Drafters |
| Pipeline | Project Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active projects by phase, team utilization, fee budget vs actual, proposals pending, upcoming deadlines.
2. **Projects** — Project management: project type (residential, commercial, institutional), phases (schematic design, design development, construction documents, construction administration), fee structure, team assignment, timeline, deliverables.
3. **Time Tracking** — Phase-based time tracking (hours per phase per project), budget monitoring, utilization rates. Monograph focuses specifically on architecture time and fee tracking.
4. **Billing** — Fee structures: lump sum by phase, hourly, percentage of construction cost. Invoice generation tied to project phases and milestones. Reimbursable expenses.
5. **Documents** — Drawing sets, specifications, RFIs, submittals, change orders, site photos, meeting minutes. Version control for drawing revisions.
6. **Contacts** — Clients, contractors, engineers, consultants, jurisdictions. Multi-party coordination per project.

**Optional Tabs:**

1. **RFIs / Submittals** — Request for Information tracking, submittal reviews, contractor coordination during construction.
2. **Construction Administration** — Site visit logs, observation reports, punch lists, change orders, substantial completion tracking.
3. **Proposals** — Fee proposals with scope, phases, team, timeline, terms.
4. **Reports** — Project profitability, phase budget tracking, team utilization, fee earned vs billed vs collected.
5. **Calendar** — Design review meetings, jurisdictional reviews, site visits, construction meetings.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Projects | Pipeline | Projects with phase, team, fee, timeline |
| Time Entries | Table | Hours per project phase with budget comparison |
| Documents | Table | Drawings, specs, RFIs organized by project |
| RFIs | Table | Requests for information with status |
| Change Orders | Table | Scope changes with cost impact |
| Contacts | Table | Clients, contractors, consultants per project |
| Proposals | Pipeline | Fee proposals with status |

**Pipeline Stages:**

```
Inquiry -> Proposal/Fee Agreement -> Pre-Design -> Schematic Design -> Design Development -> Construction Documents -> Permitting -> Bidding/Negotiation -> Construction Administration -> Closeout
```

**Unique Features:**
- Phase-based project management (AIA standard phases)
- Fee tracking per phase (budget vs actual hours)
- Drawing/document version control
- RFI and submittal management
- Construction administration site visit logs
- Change order tracking with fee impact
- Multi-consultant coordination (structural, MEP, civil engineers)
- Building code and zoning reference
- Permitting process tracking
- AIA contract management (standard industry contracts)
- Monograph pricing: starts at free for time tracking, paid plans for budgets/billing

**Billing Model:**
- Lump sum by phase (most common for residential)
- Hourly with not-to-exceed cap
- Percentage of construction cost (typically 8-15%)
- Milestone billing tied to phase completion
- Reimbursable expenses (printing, travel, permits)

---

## 8. FINANCIAL ADVISOR / PLANNER

**Competitors studied:** Wealthbox, Redtail CRM, Orion, RightCapital, MoneyGuide

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Households |
| Services | Plans / Strategies |
| Appointments | Meetings / Reviews |
| Products | Portfolios / Plans |
| Staff | Advisors / Planners / Paraplanners |
| Pipeline | Prospect Pipeline |

**Essential Tabs:**

1. **Dashboard** — Assets under management (AUM), new clients, review meetings this week, compliance tasks due, pipeline value, revenue.
2. **Clients / Households** — Household management: client couples, dependents, accounts (brokerage, IRA, 401k, trust), net worth, risk tolerance, financial goals, life events. Wealthbox and Redtail both organize by household.
3. **Planning** — Financial plan management: goals (retirement, education, estate), projections, scenarios, action items. Integration with planning tools (RightCapital, MoneyGuide, eMoney).
4. **Portfolios / Accounts** — Account overview: holdings, performance, allocation, rebalancing alerts. Integration with custodians (Schwab, Fidelity, Pershing).
5. **Calendar** — Annual review meetings, prospect meetings, compliance deadlines, client birthday/anniversary touches.
6. **Communication** — Client outreach: review reminders, market commentary, educational content, birthday/anniversary messages. Compliance-archived communication.

**Optional Tabs:**

1. **Pipeline / Prospects** — Prospect tracking: referral source, meeting scheduled, proposal presented, assets to transfer. Long sales cycle (weeks to months).
2. **Documents** — Financial plans, investment policy statements, ADV disclosures, account applications, beneficiary forms.
3. **Compliance** — ADV filing reminders, disclosure delivery tracking, communication archival, trade documentation. SEC/FINRA compliance requirements.
4. **Tasks** — Action items per client: account opening, beneficiary updates, RMD processing, annual review prep.
5. **Reports** — AUM growth, revenue by fee type, client retention, referral tracking, advisor productivity.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Households | Table | Client families with accounts, AUM, advisor |
| Accounts | Table | Investment accounts with type, custodian, balance |
| Financial Plans | Cards | Plans with goals, projections, last update |
| Meetings/Reviews | Calendar | Client reviews with agenda, notes, action items |
| Prospects | Pipeline | Potential clients with stage, AUM, probability |
| Tasks | List | Action items per client with deadline |
| Compliance Items | Table | Required disclosures, filings, deadlines |

**Pipeline Stages:**

```
Referral/Lead -> Introduction Meeting -> Discovery/Data Gathering -> Plan Presentation -> Implementation -> Account Transfers -> Onboarding Complete -> Ongoing Management -> Annual Review -> Re-engagement
```

**Unique Features:**
- Household-level client management (couples, dependents, trusts)
- AUM (Assets Under Management) tracking and reporting
- Financial planning tool integration (RightCapital, MoneyGuide)
- Custodian integration (Schwab, Fidelity data feeds)
- Compliance-archived communication (SEC/FINRA requirement)
- Annual review scheduling and tracking
- Client life event tracking (retirement, inheritance, marriage, child)
- Risk tolerance profiling
- Beneficiary tracking and updates
- Required Minimum Distribution (RMD) calculations
- ADV disclosure management
- Wealthbox pricing: $49/user/mo; Redtail: $99/user/mo (up to 5 users)

**Billing Model:**
- AUM fee (0.50-1.50% of assets managed annually, billed quarterly)
- Flat fee per plan ($1,000-5,000 for comprehensive financial plan)
- Hourly consulting ($150-400/hour)
- Subscription model ($100-300/month for ongoing planning)
- Commission on insurance/annuity products (if applicable)

**Compliance Requirements:**
- SEC/FINRA registration and ADV filing
- Communication archival (all emails, texts must be retained)
- Trade documentation and best execution
- Anti-money laundering (AML) compliance
- Client suitability documentation
- Cybersecurity program requirements

---

## 9. COMPETITOR COMPARISON

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **Clio** | Law firms | $49/user/mo | Legal-specific: trust accounting, conflict checks, court calendar, AI |
| **Canopy** | Accounting firms | Modular pricing | IRS transcript retrieval, modular purchase, client portal |
| **Karbon** | Accounting workflow | ~$59/user/mo | Team workflow automation, email-to-task, standardized processes |
| **TaxDome** | Tax firms | ~$50/user/mo | All-in-one for tax firms, client portal, document exchange |
| **Follow Up Boss** | Real estate agents | $58/user/mo | Lead response speed, deal pipeline, calling/texting built-in |
| **kvCORE/BoldTrail** | Real estate teams | $300-500+/mo | IDX website, AI lead nurture, listing marketing automation |
| **HoneyBook** | Consultants/creatives | $29/mo (annual) | Proposal-to-payment workflow, templates, booking |
| **Dubsado** | Service-based businesses | $20/mo | Unlimited clients, powerful workflow automation, branded forms |
| **Monday.com** | Agencies/teams | $9/seat/mo | Flexible project management, automation, integrations |
| **Monograph** | Architecture firms | Free - paid | Architecture-specific time/fee tracking, phase budgets |
| **Wealthbox** | Financial advisors | $49/user/mo | Advisor CRM, household management, custodian integration |

**Red Pine Gaps/Opportunities:**
- Professional services platforms are siloed by profession (legal can't use accounting software)
- Time tracking + billing integration is the core need across all types
- Client portal with document exchange is universally needed but poorly executed
- Proposal/contract/invoice workflow is the same pattern across consulting, creative, legal
- Most platforms charge per user, making team growth expensive
- Compliance features (trust accounting, communication archival) are profession-specific
- No platform offers both project management AND CRM well (agencies struggle with this split)

---

## 10. TEMPLATE CONFIG RECOMMENDATIONS

### Law Firm / Solo Attorney

```typescript
{
  templateId: 'law_firm',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Practice Areas',
    appointments: 'Consultations',
    staff: 'Attorneys',
    products: null
  },
  portalConfig: {
    primaryAction: 'request_consultation',
    bookingMode: 'consultation',
    chatProminence: 'high',
    reviewPrompt: 'after_case_closed',
    preferenceFields: ['practice_area', 'case_type', 'urgency', 'consultation_type']
  },
  essentialTabs: ['dashboard', 'matters', 'time_tracking', 'billing', 'documents', 'calendar'],
  optionalTabs: ['contacts', 'tasks', 'trust_accounting', 'portal', 'intake', 'reports'],
  defaultView: { matters: 'table', time_entries: 'table', calendar: 'calendar', documents: 'table' },
  pipelineStages: ['inquiry', 'conflict_check', 'consultation', 'engagement_sent', 'retainer_received', 'active', 'discovery', 'resolution', 'closed'],
  paymentModel: 'hourly_with_trust',
  bookingFlow: 'consultation_request'
}
```

### Accounting / Bookkeeping Firm

```typescript
{
  templateId: 'accounting',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Engagements',
    appointments: 'Meetings',
    staff: 'Accountants',
    products: null
  },
  portalConfig: {
    primaryAction: 'upload_documents',
    bookingMode: 'meeting',
    chatProminence: 'medium',
    reviewPrompt: 'after_filing',
    preferenceFields: ['entity_type', 'services_needed', 'fiscal_year', 'state']
  },
  essentialTabs: ['dashboard', 'clients', 'tasks', 'documents', 'time_tracking', 'billing'],
  optionalTabs: ['tax_returns', 'portal', 'calendar', 'reports', 'irs_notices', 'proposals'],
  defaultView: { clients: 'table', tasks: 'list', tax_returns: 'pipeline', documents: 'table' },
  pipelineStages: ['prospect', 'consultation', 'proposal_sent', 'signed', 'onboarding', 'in_progress', 'review', 'delivered', 'recurring'],
  paymentModel: 'flat_fee_or_hourly',
  bookingFlow: 'consultation_then_engagement'
}
```

### Business Consultant

```typescript
{
  templateId: 'consultant',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Engagements',
    appointments: 'Sessions',
    staff: 'Consultants',
    products: 'Deliverables'
  },
  portalConfig: {
    primaryAction: 'book_consultation',
    bookingMode: 'discovery_call',
    chatProminence: 'high',
    reviewPrompt: 'after_engagement',
    preferenceFields: ['industry', 'challenge', 'budget_range', 'timeline']
  },
  essentialTabs: ['dashboard', 'projects', 'clients', 'calendar', 'proposals', 'invoices'],
  optionalTabs: ['time_tracking', 'documents', 'tasks', 'marketing', 'reports'],
  defaultView: { projects: 'pipeline', clients: 'table', proposals: 'pipeline', calendar: 'calendar' },
  pipelineStages: ['lead', 'discovery', 'proposal_sent', 'negotiation', 'signed', 'kickoff', 'in_progress', 'delivery', 'wrapup', 'retainer'],
  paymentModel: 'retainer_or_project',
  bookingFlow: 'discovery_call_to_proposal'
}
```

### Real Estate Agent / Agency

```typescript
{
  templateId: 'real_estate',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Transactions',
    appointments: 'Showings',
    staff: 'Agents',
    products: 'Listings'
  },
  portalConfig: {
    primaryAction: 'search_properties',
    bookingMode: 'showing',
    chatProminence: 'high',
    reviewPrompt: 'after_closing',
    preferenceFields: ['buyer_or_seller', 'location', 'budget', 'bedrooms', 'timeline', 'pre_approved']
  },
  essentialTabs: ['dashboard', 'contacts', 'listings', 'transactions', 'calendar', 'communication'],
  optionalTabs: ['marketing', 'documents', 'reports', 'team', 'open_houses'],
  defaultView: { contacts: 'table', listings: 'cards', transactions: 'pipeline', calendar: 'calendar' },
  pipelineStages: ['lead', 'qualified', 'active_search', 'offer_submitted', 'under_contract', 'inspection', 'appraisal', 'clear_to_close', 'closed', 'follow_up'],
  paymentModel: 'commission_based',
  bookingFlow: 'lead_to_showing'
}
```

### Insurance Agent / Agency

```typescript
{
  templateId: 'insurance',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Policyholders',
    services: 'Policies',
    appointments: 'Reviews',
    staff: 'Agents',
    products: 'Insurance Products'
  },
  portalConfig: {
    primaryAction: 'get_quote',
    bookingMode: 'consultation',
    chatProminence: 'high',
    reviewPrompt: 'after_policy_issue',
    preferenceFields: ['coverage_type', 'current_carrier', 'policy_count', 'renewal_date']
  },
  essentialTabs: ['dashboard', 'clients', 'policies', 'pipeline', 'renewals', 'communication'],
  optionalTabs: ['claims', 'quotes', 'marketing', 'commissions', 'documents', 'reports'],
  defaultView: { clients: 'table', policies: 'table', pipeline: 'pipeline', renewals: 'table' },
  pipelineStages: ['lead', 'contact', 'needs_assessment', 'quote_sent', 'follow_up', 'application', 'underwriting', 'bound', 'issued', 'annual_review'],
  paymentModel: 'commission_from_carrier',
  bookingFlow: 'quote_request_to_consultation'
}
```

### Marketing / Creative Agency

```typescript
{
  templateId: 'agency',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Services',
    appointments: 'Meetings',
    staff: 'Team',
    products: 'Deliverables'
  },
  portalConfig: {
    primaryAction: 'request_proposal',
    bookingMode: 'discovery_call',
    chatProminence: 'medium',
    reviewPrompt: 'quarterly',
    preferenceFields: ['services_needed', 'budget', 'industry', 'timeline', 'goals']
  },
  essentialTabs: ['dashboard', 'projects', 'clients', 'tasks', 'calendar', 'invoices'],
  optionalTabs: ['time_tracking', 'reports', 'assets', 'content_calendar', 'proposals', 'approvals'],
  defaultView: { projects: 'cards', tasks: 'list', clients: 'table', calendar: 'calendar' },
  pipelineStages: ['lead', 'discovery', 'pitch', 'negotiation', 'signed', 'onboarding', 'active', 'ongoing'],
  paymentModel: 'retainer_or_project',
  bookingFlow: 'discovery_to_pitch'
}
```

### Architecture Firm

```typescript
{
  templateId: 'architecture',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Projects',
    appointments: 'Meetings',
    staff: 'Architects',
    products: 'Drawings'
  },
  portalConfig: {
    primaryAction: 'discuss_project',
    bookingMode: 'consultation',
    chatProminence: 'medium',
    reviewPrompt: 'after_project_completion',
    preferenceFields: ['project_type', 'scope', 'budget', 'timeline', 'location']
  },
  essentialTabs: ['dashboard', 'projects', 'time_tracking', 'billing', 'documents', 'contacts'],
  optionalTabs: ['rfis', 'construction_admin', 'proposals', 'reports', 'calendar'],
  defaultView: { projects: 'pipeline', time_entries: 'table', documents: 'table' },
  pipelineStages: ['inquiry', 'proposal', 'predesign', 'schematic_design', 'design_development', 'construction_docs', 'permitting', 'bidding', 'construction_admin', 'closeout'],
  paymentModel: 'phase_milestone_billing',
  bookingFlow: 'consultation_to_proposal'
}
```

### Financial Advisor / Planner

```typescript
{
  templateId: 'financial_advisor',
  familyId: 'professional_services',
  labelOverrides: {
    clients: 'Clients',
    services: 'Plans',
    appointments: 'Reviews',
    staff: 'Advisors',
    products: 'Portfolios'
  },
  portalConfig: {
    primaryAction: 'schedule_review',
    bookingMode: 'meeting',
    chatProminence: 'medium',
    reviewPrompt: 'after_annual_review',
    preferenceFields: ['goals', 'risk_tolerance', 'investable_assets', 'life_stage', 'services_interested']
  },
  essentialTabs: ['dashboard', 'clients', 'planning', 'accounts', 'calendar', 'communication'],
  optionalTabs: ['pipeline', 'documents', 'compliance', 'tasks', 'reports'],
  defaultView: { clients: 'table', accounts: 'table', calendar: 'calendar', pipeline: 'pipeline' },
  pipelineStages: ['referral', 'intro_meeting', 'discovery', 'plan_presentation', 'implementation', 'transfers', 'onboarded', 'ongoing', 'annual_review'],
  paymentModel: 'aum_fee_or_flat',
  bookingFlow: 'intro_meeting_to_plan'
}
```

---

## Sources

- Clio: https://www.clio.com/pricing/, https://www.clio.com/manage/
- Canopy: https://www.getcanopy.com/
- Karbon: https://karbonhq.com/
- TaxDome: https://taxdome.com/
- Follow Up Boss: https://www.followupboss.com/
- kvCORE/BoldTrail: https://insiderealestate.com/
- HoneyBook: https://www.honeybook.com/pricing
- Dubsado: https://www.dubsado.com/pricing
- Monday.com: https://monday.com/
- Monograph: https://monograph.com/
- Wealthbox: https://www.wealthbox.com/
- Redtail: https://corporate.redtailtechnology.com/
- Houzz Pro: https://www.houzz.com/pro
