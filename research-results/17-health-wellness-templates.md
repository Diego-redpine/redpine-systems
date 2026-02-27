# Research #17: Health & Wellness Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 10 health/wellness business types based on competitor platform research.

---

## Table of Contents
1. [Gym (CrossFit, Boutique Fitness, Traditional)](#1-gym)
2. [Yoga Studio](#2-yoga-studio)
3. [Pilates Studio](#3-pilates-studio)
4. [Personal Trainer](#4-personal-trainer)
5. [Nutritionist / Dietitian](#5-nutritionist--dietitian)
6. [Chiropractor](#6-chiropractor)
7. [Physical Therapy](#7-physical-therapy)
8. [Mental Health Practice](#8-mental-health-practice)
9. [Massage Therapy](#9-massage-therapy)
10. [Acupuncture](#10-acupuncture)

---

## 1. GYM

**Competitors studied:** Zen Planner, Mindbody, WellnessLiving, Wodify, Gymdesk, WodBoard, PushPress, Beyond the Whiteboard

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Members |
| Services | Classes / Programs |
| Appointments | Classes / Sessions |
| Products | Retail / Merchandise |
| Staff | Coaches / Trainers |
| Pipeline | Lead Funnel |

**Essential Tabs:**

1. **Dashboard** — Key metrics: active members, attendance today, revenue this month, new sign-ups, retention rate, upcoming classes. Daily snapshot similar to Zen Planner's "My Statistics" page. Widgets for member check-ins, revenue graphs, class occupancy rates.
2. **Members** — Full member profiles with membership type, payment history, attendance records, fitness goals, custom fields (emergency contact, health conditions), waivers, membership status (active/frozen/cancelled). Search, filter, bulk actions. Zen Planner and Wodify both center on member profiles with payment + attendance data.
3. **Schedule** — Class schedule (weekly calendar view), appointment booking for 1-on-1 sessions, recurring class setup, instructor assignment, room/area assignment, capacity limits, waitlists, online booking. Mindbody's single-screen schedule management is the gold standard.
4. **Memberships** — Membership plan management: monthly unlimited, annual, class packs (10/20/50), punch cards, day passes, trial passes, family plans, student rates. Auto-billing, freeze/pause options, cancellation management. Wodify and Zen Planner excel here.
5. **Payments** — Billing dashboard, recurring billing management, failed payment tracking, payment processing, POS for walk-ins, retail sales, invoice history, refunds, revenue reports.
6. **Reports** — Attendance reports, revenue reports, retention metrics, membership churn, class popularity, coach performance, member acquisition sources. Zen Planner's custom reporting dashboards are highly regarded.

**Optional Tabs:**

1. **Workouts / WODs** — Workout of the Day programming, workout calendar, exercise library, workout builder, performance tracking. Critical for CrossFit/functional fitness but optional for traditional gyms. Zen Planner and Wodify have dedicated WOD tracking.
2. **Leaderboard** — Member rankings for WODs, personal records (PRs), streaks, challenges. Social engagement feature. Wodify and Beyond the Whiteboard excel here. Displays on gym TV/monitor.
3. **Marketing** — Lead capture, automated email/SMS campaigns, referral programs, social media posting, promotional offers. Mindbody and WellnessLiving include marketing suites.
4. **Retail / Shop** — Inventory management for merchandise (apparel, supplements, equipment), POS integration, online store.
5. **Check-In** — Kiosk/tablet check-in app, member self-service, QR code scanning, front desk view. Mindbody Class Check-in and Wodify both offer this.
6. **Community** — Member social feed, announcements, challenges, goal tracking, in-app messaging. Wodify's social features drive engagement.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Members | Table | Member list with status, membership type, last visit, balance |
| Classes | Calendar | Weekly class schedule with instructor, capacity, waitlist |
| Memberships | Cards | Membership plan types with pricing, features, active count |
| WODs / Workouts | Calendar | Daily workout programming with exercises, sets, reps |
| Leaderboard | List | Ranked member performance by WOD, PRs, streaks |
| Attendance | Table | Check-in logs with date, member, class, coach |
| Coaches | Cards | Coach profiles with schedule, specialties, certifications |
| Leads | Pipeline | Prospect tracking from inquiry to trial to membership |
| Retail Products | Table | Inventory with SKU, price, stock level |

**Pipeline Stages:**

```
Lead → Trial/Guest Pass → Follow-Up → Signed Up → Active Member → At-Risk → Frozen → Cancelled → Win-Back
```

**Unique Features:**
- WOD/Workout of the Day programming and whiteboard display
- Leaderboards with PR tracking and member rankings
- Heart rate monitor integration (Wodify)
- Body composition and metrics tracking (weight, body fat, measurements)
- Workout tracking with RX vs Scaled performance logging
- Member challenges and streaks for engagement
- Equipment/room/area assignment per class
- Capacity management with waitlists
- Multi-location management for gym chains
- 24/7 access control integration (door/turnstile systems)
- Family/group account management with consolidated billing
- Kiosk/tablet check-in at front desk
- Dynamic pricing for peak/off-peak class times

---

## 2. YOGA STUDIO

**Competitors studied:** Mindbody, WellnessLiving, Vagaro, Momence, YOGO

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Members |
| Services | Classes / Workshops |
| Appointments | Classes / Sessions / Private Lessons |
| Products | Retail / Props |
| Staff | Teachers / Instructors |

**Essential Tabs:**

1. **Dashboard** — Daily overview: today's classes, attendance, revenue, new students, upcoming workshops. Class occupancy rates, teacher schedule at a glance. WellnessLiving's Isaac AI flags at-risk clients.
2. **Students** — Student profiles with class history, packages owned, payment status, health notes (injuries, pregnancy, conditions), preferences, attendance patterns. WellnessLiving tracks preferences and buying history.
3. **Schedule** — Weekly class schedule (Vinyasa, Yin, Hot Yoga, Restorative, etc.), teacher assignment, room assignment, recurring class setup, workshop scheduling, retreat booking. Teacher substitution management (Mindbody auto-substitution). Class capacity with waitlists.
4. **Pricing / Packages** — Drop-in rates, class packs (5/10/20), unlimited monthly memberships, annual memberships, intro offers (first month discounted), workshop pricing, teacher training pricing, gift cards. Mindbody's e-commerce handles all pricing types.
5. **Payments** — Transaction history, recurring billing, failed payment recovery, refunds, POS for in-studio purchases, gift card redemption.
6. **Teachers** — Teacher profiles, availability, specialties (Vinyasa, Yin, Ashtanga, etc.), certifications (RYT-200, RYT-500), pay rates, schedule, substitution preferences.

**Optional Tabs:**

1. **Workshops & Events** — Special workshops, retreats, teacher trainings, immersions, series classes. Separate from regular class schedule. Mindbody makes workshops and retreats bookable online.
2. **Marketing** — Email/SMS campaigns, new student welcome sequences, class reminders, promotional offers, referral programs, review requests.
3. **Retail** — Yoga mats, props, clothing, accessories, essential oils, books. Inventory management and POS.
4. **Reports** — Class attendance, revenue by class type, teacher performance, student retention, package utilization, popular class times.
5. **Online / Video** — On-demand video library, live-streamed classes, virtual class management. Post-COVID essential for many studios.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Student list with membership status, attendance, packages |
| Classes | Calendar | Weekly schedule with class type, teacher, room, capacity |
| Teachers | Cards | Teacher profiles with certifications, specialties, availability |
| Packages | Cards | Class packs and membership options with pricing |
| Workshops | Calendar | Special events, retreats, teacher trainings |
| Attendance | Table | Check-in records per class |
| Retail | Table | Products available for sale |

**Pipeline Stages:**

```
New Lead → Trial Class (Intro Offer) → Follow-Up → Regular Student → Loyal Member → At-Risk (Decreased Attendance) → Lapsed → Win-Back
```

**Unique Features:**
- Class packs (buy 10/20 classes at a discount) — fundamental pricing model
- Drop-in pricing alongside memberships
- Teacher substitution management (auto-notify students of sub)
- Workshop and retreat booking (multi-day events with deposits)
- Teacher training program management (200hr, 500hr certifications)
- Series classes (6-week beginner series, prenatal series)
- Equipment/prop tracking (bolsters, blocks per room)
- Intro offers and new student specials
- Multiple class styles within one schedule (Vinyasa, Yin, Hot, Restorative)
- Community board / announcements
- Spotify/music integration in studio
- Temperature tracking for hot yoga studios

---

## 3. PILATES STUDIO

**Competitors studied:** Mindbody, WellnessLiving, Mariana Tek, ClubReady, Momence, StudioGrowth, MyBestStudio

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Members |
| Services | Sessions / Classes |
| Appointments | Sessions / Private Lessons / Group Classes |
| Products | Retail / Accessories |
| Staff | Instructors / Teachers |

**Essential Tabs:**

1. **Dashboard** — Daily view: today's sessions (private + group), equipment utilization, revenue, client count, waitlist activity. Reformer/equipment availability at a glance.
2. **Clients** — Client profiles with session history, package balance, body goals, injury/health notes, preferred instructor, preferred equipment spot. 56% of pilates studios rely heavily on private training per PilatesBridge survey.
3. **Schedule** — Split view: Group classes AND private sessions on same calendar. Equipment-specific scheduling (Reformer #1-10, Tower, Chair, Cadillac). Room assignment. Instructor assignment. Waitlists. Mariana Tek's "pick-a-spot" for equipment/reformer selection is industry-leading.
4. **Packages & Memberships** — Private session packages (5/10/20), group class packs, unlimited monthly, duet sessions, intro packages, corporate packages. Mixed packages (combines private + group). StudioGrowth handles mixed packages.
5. **Payments** — Transaction processing, package tracking, auto-billing, POS, gift cards.
6. **Instructors** — Instructor profiles with certifications (comprehensive Pilates, mat only, apparatus), specialties, availability, pay rates (varies by private vs group).

**Optional Tabs:**

1. **Equipment** — Equipment inventory (Reformers, Towers/Cadillacs, Chairs, Barrels), maintenance schedules, utilization rates. Equipment-specific booking ensures no double-booking of apparatus.
2. **Marketing** — Client acquisition campaigns, referral programs, intro offers, email marketing.
3. **Reports** — Revenue by session type (private vs group), equipment utilization, instructor performance, client retention, package sell-through rates.
4. **Retail** — Grip socks, Pilates accessories, water bottles, branded merchandise.
5. **Waitlists** — Especially important for popular reformer classes; auto-notification when spots open.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Client list with package balance, last visit, preferred instructor |
| Group Classes | Calendar | Weekly group class schedule with equipment/room/capacity |
| Private Sessions | Calendar | 1-on-1 and duet session bookings per instructor |
| Equipment | Table | Reformers, towers, chairs — availability and maintenance |
| Packages | Cards | Session packages with type, price, sessions remaining |
| Instructors | Cards | Instructor profiles, certifications, availability |
| Waitlists | List | Clients waiting for specific classes/time slots |

**Pipeline Stages:**

```
Inquiry → Intro Session (Assessment) → Follow-Up → Package Purchase → Regular Client → Loyal (Auto-Renew) → At-Risk → Lapsed
```

**Unique Features:**
- Equipment-specific scheduling (book Reformer #3, Tower #2)
- Pick-a-spot booking (clients choose their preferred reformer/position in room)
- Private vs group session distinction — different pricing, scheduling, and capacity
- Duet sessions (2 clients, 1 instructor, shared equipment)
- Mixed packages (e.g., 4 privates + 8 group classes)
- Equipment utilization tracking and reporting
- Mat vs apparatus class types
- Instructor certification tracking (comprehensive vs mat-only)
- Intro assessment/evaluation before starting
- Small class sizes (8-12 for reformer vs 20+ for mat)
- Dynamic pricing for peak hours

---

## 4. PERSONAL TRAINER

**Competitors studied:** Trainerize (ABC Trainerize), My PT Hub, TrueCoach, Acuity Scheduling, FitBudd, TrainerFu

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Training Programs / Sessions |
| Appointments | Sessions / Consultations |
| Products | Supplements / Merchandise |
| Staff | Trainers / Coaches |

**Essential Tabs:**

1. **Dashboard** — Active client count, sessions today/this week, revenue, client compliance rates, upcoming sessions, recent client activity feed. My PT Hub shows a comprehensive activity feed.
2. **Clients** — Client profiles with goals, body metrics (weight, body fat %, measurements), progress photos, workout compliance, nutrition compliance, session history, intake forms/waivers, health questionnaire, session package balance. Trainerize excels at client progress tracking.
3. **Workouts** — Workout builder with exercise library (Trainerize: built-in library, My PT Hub: 8,000+ HD videos), program design (multi-week periodization), workout templates, exercise customization (sets, reps, tempo, rest, 1RM %), circuit/superset builder, workout assignment to clients.
4. **Schedule** — Session booking calendar, 1-on-1 sessions, small group training, consultation slots, availability management, online booking. Acuity Scheduling's self-booking is popular with PTs.
5. **Nutrition** — Meal plans, macro targets, food tracking/logging (Trainerize: photo food logging + barcode scanner, My PT Hub: 650,000+ food database), recipe library, nutrition compliance monitoring.
6. **Progress** — Body metrics tracking (weight, body fat, measurements, BMI), progress photos (before/after), workout performance graphs (strength progression, volume), personal records, compliance tracking, goal tracking.

**Optional Tabs:**

1. **Habits** — Daily habit tracking (water intake, sleep, steps, stretching), habit streaks, badges/achievements. Trainerize's habit coaching feature.
2. **Payments** — Session package sales, recurring billing, invoice management, payment processing. Trainerize uses Stripe; My PT Hub supports 190+ countries.
3. **Marketing** — Lead capture, referral programs, social proof, Google Ads management (My PT Hub), website builder.
4. **Community** — Group messaging, challenges with leaderboards, WOD sharing, client engagement. Trainerize's community features.
5. **Content** — On-demand workout library, video coaching sessions, educational content. Monetizable video sessions via Trainerize.
6. **Reports** — Revenue reports, client retention, session utilization, popular workout types.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Cards | Client cards with photo, goals, compliance status, next session |
| Workout Programs | Table | Multi-week programs with exercises, progressions |
| Exercises | Table | Exercise library with videos, muscle groups, equipment needed |
| Sessions | Calendar | Scheduled 1-on-1 and group training sessions |
| Meal Plans | Table | Nutrition plans with macros, meals, recipes |
| Body Metrics | Table | Weight, measurements, body fat tracking per client |
| Progress Photos | Cards | Before/after photo comparisons per client |
| Session Packages | Cards | Package types with sessions remaining per client |
| Leads | Pipeline | Prospect tracking from inquiry to paid client |

**Pipeline Stages:**

```
Lead / Inquiry → Free Consultation → Assessment / Evaluation → Trial Session → Package Purchase → Active Client → Progressing → Plateau / At-Risk → Completed Program → Alumni / Referral Source
```

**Unique Features:**
- Workout builder with exercise library (video demonstrations)
- Progressive overload programming (auto-increase weight/reps over weeks)
- Body composition tracking (weight, body fat %, measurements, BMI)
- Progress photo management (before/after comparisons)
- Macro tracking and nutrition logging with food database
- Wearable device integration (Apple Watch, Fitbit, Google Fit, Withings)
- Client compliance monitoring (did they do their workouts? track food?)
- Habit coaching with streaks and achievements
- Exercise video recording (trainers upload custom exercise demos)
- Session package management (buy 10/20 sessions)
- White-label branded app option
- In-app messaging (1-on-1 and group) with voice messages
- Automated check-ins (weekly surveys on progress, soreness, mood)
- Personal records (PR) tracking for key lifts

---

## 5. NUTRITIONIST / DIETITIAN

**Competitors studied:** Practice Better, Healthie, SimplePractice, NutriAdmin, That Clean Life, Nutritio

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients / Patients |
| Services | Consultations / Programs |
| Appointments | Sessions / Consultations / Follow-Ups |
| Products | Supplements |
| Documents | Intake Forms / Assessments |

**Essential Tabs:**

1. **Dashboard** — Today's appointments, active clients, revenue summary, outstanding invoices, recent client activity, upcoming follow-ups.
2. **Clients** — Client profiles with health history, dietary restrictions, allergies, lab results, goals, food journal entries, protocols assigned, intake forms, assessment notes, supplement recommendations. Practice Better centralizes all client data.
3. **Schedule** — Appointment calendar for initial consultations, follow-up sessions, telehealth sessions, group programs. Practice Better and Healthie both offer scheduling with automated reminders.
4. **Charting / Notes** — SOAP notes, ADIME notes (Assessment, Diagnosis, Intervention, Monitoring, Evaluation), GROW notes, clinical documentation templates. Healthie is ONC-Certified EHR. Practice Better includes pre-built templates.
5. **Protocols** — Treatment protocols with nutrient targets, hydration goals, foods to include/avoid, supplement recommendations, lifestyle recommendations. Practice Better's protocols feature is core to the platform.
6. **Billing** — Invoice management, payment processing (Stripe), insurance billing (Healthie integrates with ClaimMD), superbills, package pricing, program pricing.

**Optional Tabs:**

1. **Meal Plans** — Meal plan creation, recipe library (That Clean Life integration with Practice Better provides thousands of recipes), macro targets, calorie tracking, grocery lists, meal templates.
2. **Food Journal** — Client food and mood journaling, practitioner commentary, nutrition compliance tracking, hydration tracking, bowel movement logging. Practice Better and Healthie both offer robust journaling.
3. **Programs & Courses** — Group nutrition programs, online courses, subscription plans, automated wellness programs. Both Practice Better and Healthie support programs.
4. **Telehealth** — HIPAA-compliant video consultations, group webinars. Healthie integrates with Zoom. Practice Better has built-in video.
5. **Labs & Results** — Lab result tracking, e-labs integration (Healthie connects e-labs directly in patient charts), supplement prescribing (Fullscript integration).
6. **Reports** — Revenue reports, client retention, program completion rates, popular services.
7. **Resources** — Educational handouts, recipe collections, meal prep guides, supplement guides — shareable with clients via portal.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Client list with status, next appointment, protocol, balance |
| Appointments | Calendar | Consultations, follow-ups, telehealth sessions |
| Protocols | Table | Treatment protocols with nutrient targets, foods, supplements |
| Meal Plans | Cards | Meal plans with recipes, macros, grocery lists |
| Food Journals | List | Client food/mood entries with practitioner notes |
| Chart Notes | Table | SOAP/ADIME notes per client per session |
| Programs | Cards | Group nutrition programs with enrollment, duration |
| Lab Results | Table | Client lab work with reference ranges, trends |
| Intake Forms | Table | Health questionnaires, dietary assessments |

**Pipeline Stages:**

```
Inquiry → Discovery Call → Initial Consultation → Assessment → Active Protocol → Follow-Up Phase → Maintenance → Program Complete → Alumni / Referral
```

**Unique Features:**
- Meal plan builder with recipe library integration
- Food and mood journaling (client logs, practitioner reviews)
- Macro/micronutrient tracking and targets
- HIPAA compliance (required for healthcare nutritionists)
- Supplement dispensing integration (Fullscript, RupaHealth)
- Lab result tracking and trending
- ADIME/SOAP note templates specific to nutrition
- Dietary restriction and allergy tracking per client
- Group nutrition programs and challenges
- Client portal with food logging, messaging, resources
- Telehealth for remote consultations
- E-prescribe for supplements (not medications)
- Lifestyle tracking integration (Apple Health, Google Fit, Fitbit)
- Grocery list generation from meal plans

---

## 6. CHIROPRACTOR

**Competitors studied:** ChiroTouch, ChiroFusion, ChiroSpring, ALIGN, Jane App, ACOM Health

**HIPAA Required:** Yes

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Patients |
| Services | Treatments / Adjustments |
| Appointments | Visits / Appointments |
| Products | Supplements / Orthotics |
| Staff | Doctors / Providers / Associates |
| Documents | Charts / SOAP Notes |
| Pipeline | Care Plan |

**Essential Tabs:**

1. **Dashboard** — Daily schedule, patient check-in status, outstanding claims, revenue metrics, provider performance. ChiroTouch offers dual clinical + financial dashboards. Today's patient count, pending notes, billing alerts.
2. **Patients** — Patient records: demographics, insurance info, health history, treatment plans, visit history, X-ray/imaging storage, SOAP notes, intake forms, diagnoses (ICD-10), emergency contacts, referral source. ChiroTouch stores comprehensive patient data.
3. **Schedule** — Appointment calendar with patient flow tracking (checked-in, in treatment, checkout), provider schedules, room assignments, recurring visit scheduling, online booking. ChiroTouch has live patient check-in tracking.
4. **Charting / SOAP Notes** — SOAP note creation with pre-built macros (ChiroTouch: complete SOAP notes in 15 seconds), body diagrams, spinal diagrams, subjective/objective/assessment/plan documentation, diagnosis codes (ICD-10), procedure codes (CPT), treatment tracking per visit. ChiroTouch's Rheo AI automates SOAP notes.
5. **Billing & Claims** — Insurance claim submission (CMS-1500), electronic remittance advice (ERA), payment posting, patient billing, co-pay collection, integrated clearinghouse (ChiroFusion's unique selling point), superbill generation, accounts receivable tracking.
6. **Treatment Plans** — Care plan management: treatment frequency, duration, goals, re-evaluation dates, progress tracking. Plans for acute care, corrective care, and wellness/maintenance phases.

**Optional Tabs:**

1. **Insurance Verification** — Real-time insurance eligibility checks, coverage verification, authorization tracking. ChiroTouch CT Verify handles this.
2. **Imaging / X-Rays** — X-ray storage and viewing, imaging uploads, body charts, posture analysis photos.
3. **Reports** — Clinical reports (visits per patient, treatment outcomes), financial reports (collections, AR aging, payer mix), operational reports (provider productivity, appointment utilization).
4. **Patient Communication** — Automated appointment reminders, recall notices, birthday messages, review requests, two-way texting. ChiroTouch CT Engage handles this.
5. **Intake Forms** — Digital intake forms with health history, consent forms, financial agreements, HIPAA acknowledgment. ChiroTouch CT InForms with AI-powered intake.
6. **Retail / Supplements** — Supplement sales, orthotic devices, pillows, ice/heat products, POS.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Patients | Table | Patient list with status, next visit, care plan phase, balance |
| Appointments | Calendar | Daily/weekly schedule with check-in status, provider |
| SOAP Notes | Table | Visit documentation with date, provider, diagnosis, CPT codes |
| Treatment Plans | Pipeline | Care plans progressing through phases (Acute → Corrective → Wellness) |
| Insurance Claims | Table | Claims with status (pending, submitted, paid, denied), amounts |
| Imaging / X-Rays | Cards | Patient imaging files with dates and annotations |
| Diagnoses | Table | ICD-10 codes assigned to patients |
| Intake Forms | Table | Digital forms by patient with completion status |

**Pipeline Stages (Care Plan):**

```
New Patient → Initial Evaluation → Acute/Relief Care → Corrective/Rehabilitative Care → Wellness/Maintenance → Discharge → Recall/Reactivation
```

**Unique Features:**
- SOAP note macros (complete notes in 15-30 seconds)
- AI-powered SOAP note generation (ChiroTouch Rheo)
- Spinal/body diagrams with annotation tools
- ICD-10 and CPT code libraries built into charting
- Insurance claim submission with integrated clearinghouse
- Care plan phase tracking (acute, corrective, wellness)
- X-ray and imaging storage within patient records
- Compliance scanning (catches coding errors before claim submission)
- Auto-population of diagnosis codes from prior visits
- Superbill generation for patient self-submission
- Patient flow tracking (checked-in, exam room, with doctor, checkout)
- Multi-provider scheduling with room assignment
- Wellness plan setup for maintenance patients
- Recall management for lapsed patients

---

## 7. PHYSICAL THERAPY

**Competitors studied:** WebPT, Jane App, Clinicient (InsightEMR), AdvancedMD, Empower EMR

**HIPAA Required:** Yes

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Patients |
| Services | Treatments / Therapies |
| Appointments | Visits / Sessions |
| Products | Supplies / Equipment |
| Staff | Therapists / Clinicians / Providers |
| Documents | Documentation / Charts / Notes |

**Essential Tabs:**

1. **Dashboard** — Today's patients, pending documentation, outstanding claims, treatment outcomes summary, productivity metrics, compliance alerts (Medicare requirements). WebPT provides 50+ ready-to-use reports.
2. **Patients** — Patient records: demographics, insurance info, referral source (referring physician), diagnosis, treatment plan, visit history, outcomes data, home exercise programs assigned, intake forms, functional assessment scores. WebPT's patient management is industry-leading.
3. **Schedule** — Appointment calendar with multi-therapist view, recurring appointments, waitlist, online self-scheduling (24/7), room/equipment assignment, telehealth/virtual visit slots. Clinicient has a mobile schedule app.
4. **Documentation** — Specialty-specific note templates: Initial Evaluation, Daily/Progress Notes, Re-evaluation, Discharge Summary. SOAP format. Flow sheets. AI-accelerated documentation (WebPT). Built-in compliance checks for Medicare/insurance requirements. Customizable templates for different specialties (ortho, neuro, pelvic health, pediatrics).
5. **Home Exercise Programs (HEP)** — Exercise prescription builder with 5,500+ photo/video exercises (WebPT), searchable by body part, diagnosis, or keyword. Custom templates, treatment phases, patient adherence tracking, care plan delivery (print, email, text, app). Patient portal (StriveHub) for HEP access. Printed plans available in 29 languages.
6. **Billing & Claims** — Insurance claim submission, electronic benefits verification, authorization tracking, payment posting, ERA processing, accounts receivable, patient payment collection, superbills. WebPT integrates billing tightly with documentation for compliant charge capture.

**Optional Tabs:**

1. **Outcomes Tracking** — 200+ standardized outcome measures (WebPT), digital survey delivery, patient progress scoring (FOTO, DASH, ODI, etc.), outcomes reporting for quality improvement and MIPS compliance.
2. **Referral Management** — Track referring physicians, manage referral authorizations, referral fax management, physician communication.
3. **Patient Engagement** — Automated reminders, two-way secure messaging, NPS tracking, satisfaction surveys, review requests.
4. **Reports** — Clinical reports (outcomes, visit count, discharge rates), financial reports (collections, AR, payer mix, denial rates), operational reports (therapist productivity, cancellation rates, schedule utilization).
5. **Marketing** — Automated marketing tools, SEO, social media, review management. WebPT offers marketing services.
6. **Telehealth** — Virtual visits with integrated documentation, HIPAA-compliant video.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Patients | Table | Patient list with diagnosis, treatment plan, visit count, insurance |
| Appointments | Calendar | Multi-therapist schedule with status, room, visit type |
| Documentation | Table | Notes by patient, date, type (eval, daily, re-eval, discharge) |
| Treatment Plans | Pipeline | Plans progressing: Evaluation → Active Treatment → Re-eval → Discharge |
| Home Exercise Programs | Cards | HEP assigned per patient with exercises, adherence status |
| Outcomes | Table | Standardized test scores per patient with trend data |
| Insurance Claims | Table | Claims with status, amounts, payer, denial reasons |
| Referrals | Table | Referring physicians, authorization status, visit count approved |
| Exercises | Table | Exercise library with body part, video, difficulty level |

**Pipeline Stages (Treatment Plan):**

```
Referral Received → Initial Evaluation → Active Treatment (Frequency: 2-3x/week) → Progress Re-evaluation → Reduced Frequency → Discharge Planning → Discharge → Follow-Up / Wellness
```

**Unique Features:**
- Home Exercise Program (HEP) builder with 5,500+ video exercises
- Patient adherence tracking for HEP compliance
- Outcomes tracking with 200+ standardized assessments (DASH, ODI, LEFS, etc.)
- Functional assessment scoring and trending over time
- AI-generated documentation from session notes
- Medicare compliance alerts and MIPS reporting
- Specialty-specific templates (ortho, neuro, pelvic health, vestibular, pediatric)
- Electronic benefits verification before treatment
- Referral and authorization management
- Treatment phase progression tracking
- Flow sheets for ongoing metrics (ROM, strength, pain levels)
- Body diagrams for marking treatment areas
- Discharge summary generation
- Care plan delivery in 29 languages (printed)
- Integration with 60+ systems (EMRs, billing, marketing)

---

## 8. MENTAL HEALTH PRACTICE

**Competitors studied:** SimplePractice, TherapyNotes (Ensora), TheraNest, Jane App, ICANotes

**HIPAA Required:** Yes

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients (therapy) / Patients (psychiatry) |
| Services | Sessions / Services |
| Appointments | Sessions / Appointments |
| Products | N/A |
| Staff | Clinicians / Therapists / Providers |
| Documents | Notes / Documentation |

**Essential Tabs:**

1. **Dashboard (Home)** — Today's sessions, income this month, outstanding balances, unsigned notes, to-do list, upcoming appointments. SimplePractice home page shows income, appointments, notes, outstanding balances at a glance. TherapyNotes has a to-do list feature.
2. **Calendar** — Session calendar with day/week/month views, color-coded appointment statuses, recurring sessions, availability management, online booking, waitlist. SimplePractice: calendar is the first thing you see on login. TherapyNotes supports daily/weekly/monthly views.
3. **Clients** — Client profiles with: demographics, insurance details, emergency contacts, intake assessments, treatment plans, progress notes, psychotherapy notes (separate and more protected), billing records, documents/files (signed intake forms, consent forms), measures/assessment scores. SimplePractice organizes client profiles into Overview, Files, Measures, and Billing tabs.
4. **Notes & Documentation** — Progress notes (SOAP, DAP, BIRP, narrative formats), intake notes, treatment plans with goals and objectives, psychological evaluations, discharge summaries, group therapy notes. AI-assisted note generation (TherapyNotes TherapyFuel, TheraNest AI Session Assistant, SimplePractice AI Note Taker). Template library. Customizable note templates.
5. **Billing & Insurance** — Insurance claim submission (electronic EDI), ERA posting, patient invoicing, credit card processing, superbill generation, co-pay tracking, statement generation, batch invoicing. SimplePractice and TherapyNotes both integrate billing tightly with session documentation. Automated claim creation from session notes.
6. **Telehealth** — HIPAA-compliant video sessions integrated directly into the platform, screen sharing, session documentation during/after video calls. All major platforms (SimplePractice, TherapyNotes, TheraNest) include telehealth.

**Optional Tabs:**

1. **Treatment Plans** — Dedicated treatment plan management with diagnosis (ICD-10), treatment goals, objectives, interventions, frequency of treatment, review dates. TherapyNotes auto-populates diagnoses from intake into treatment plan and forward into progress notes.
2. **Measures / Assessments** — Standardized clinical measures: PHQ-9 (depression), GAD-7 (anxiety), PCL-5 (PTSD), AUDIT (alcohol), Columbia Suicide Severity Rating Scale, custom questionnaires. SimplePractice Measures tab graphs client scores over time. Measurement-Based Care.
3. **Client Portal** — Client-facing portal for: completing intake paperwork, viewing appointments, sending secure messages, making payments, accessing documents. TherapyNotes TherapyPortal and SimplePractice client portal.
4. **Secure Messaging** — HIPAA-compliant messaging between clinician and client between sessions.
5. **Reports / Analytics** — Income reports, appointment reports, insurance aging, client demographics, session statistics, clinician productivity. SimplePractice offers 17 report types across 4 categories.
6. **Settings / Forms** — Intake form builder, consent form templates, practice policies, client notification settings.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Client list with status (active/inactive), next session, balance |
| Sessions | Calendar | Appointment calendar with status, clinician, type |
| Progress Notes | Table | Session notes by client, date, note type, signature status |
| Treatment Plans | Table | Plans with diagnosis, goals, objectives, review date |
| Intake Assessments | Table | Initial evaluation documents per client |
| Insurance Claims | Table | Claims with status, payer, amount, date submitted |
| Measures / Scores | Table | PHQ-9, GAD-7, etc. scores per client over time |
| Diagnoses | Table | ICD-10 diagnoses assigned per client |
| Documents | Table | Signed forms, consent docs, uploaded files per client |
| Invoices / Payments | Table | Financial records per client |

**Pipeline Stages (Client Journey):**

```
Inquiry → Intake / Assessment → Treatment Planning → Active Treatment → Progress Review → Maintenance / Reduced Frequency → Termination → Post-Treatment Follow-Up
```

**Unique Features:**
- Psychotherapy notes (separate from progress notes with extra privacy protections)
- Treatment plan with goals, objectives, and interventions
- Standardized assessment scoring (PHQ-9, GAD-7, PCL-5, etc.) with graphed trends
- Measurement-Based Care tracking
- AI session assistants for note generation (reduces documentation by up to 90%)
- Insurance claim auto-creation from session documentation
- Superbill generation for out-of-network clients
- HIPAA-compliant secure messaging
- Telehealth with documentation integration
- Sliding scale fee management
- Group therapy session management
- Couples/family therapy session linking
- Supervisor/intern management (TheraNest supports multi-clinician with supervision)
- Waitlist management for new clients
- Client portal with intake form completion
- Automated insurance eligibility verification
- ePrescribe capability (psychiatrists — SimplePractice)
- Cancellation/no-show policy enforcement with automatic fees

---

## 9. MASSAGE THERAPY

**Competitors studied:** ClinicSense, Jane App, Vagaro, MassageBook, Noterro

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Clients |
| Services | Services / Treatments / Modalities |
| Appointments | Appointments / Sessions |
| Products | Products / Retail |
| Staff | Therapists / Practitioners |
| Documents | SOAP Notes / Treatment Notes |

**Essential Tabs:**

1. **Dashboard** — Today's appointments, revenue snapshot, upcoming sessions, recent activity, outstanding balances, client reminders. ClinicSense claims practitioners spend 72% less time on admin.
2. **Clients** — Client profiles with health history, treatment preferences (pressure level, focus areas, allergies/sensitivities, contraindications), intake form responses, consent form status, SOAP note history, treatment packages owned, appointment history. Vagaro lets therapists view profiles, SOAP notes, and history in one place.
3. **Schedule** — Appointment calendar with online booking, room/table assignment, service duration management, buffer time between sessions, recurring appointments, waitlist management, no-show protection. ClinicSense's No-Show Guard feature. Vagaro prevents double-booking with equipment assignment.
4. **SOAP Notes** — Treatment documentation: Subjective (client complaints, areas of concern), Objective (findings, techniques used), Assessment (response to treatment), Plan (home care, next session recommendations). Body charts/anatomy diagrams for marking treatment areas (Vagaro has Face and Full Body anatomy chart templates). Customizable templates with display logic (ClinicSense). Point-and-click charting.
5. **Payments** — Payment processing, treatment package sales, gift certificate management, insurance claim submission (for states that allow), invoice generation. ClinicSense integrates with Square. Vagaro handles all payment types.
6. **Intake Forms** — Health history questionnaire, consent forms, COVID screening (if applicable), contra-indication screening, HIPAA acknowledgment. Auto-sent based on service booked and new/returning client status (ClinicSense).

**Optional Tabs:**

1. **Treatment Packages** — Package creation (e.g., "6-session Deep Tissue Package"), series pricing, session tracking, auto-renewal. ClinicSense and Vagaro both emphasize packages for client retention.
2. **Marketing** — Email newsletters, wellness check-in emails for inactive clients, birthday emails, review requests (Google Reviews integration), referral automation, availability summaries. ClinicSense has built-in marketing automation.
3. **Reports** — Revenue reports, appointment statistics, client retention rates, popular services, peak booking times.
4. **Retail** — Products for sale: massage oils, CBD products, essential oils, wellness products. Inventory and POS.
5. **Gift Certificates** — Wellness-themed gift certificates, online purchase, redemption tracking. ClinicSense includes this.
6. **Insurance** — For massage therapists who accept insurance: claim submission, superbills, auto-accident or workers' comp documentation.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Clients | Table | Client list with last visit, treatment preferences, package balance |
| Appointments | Calendar | Session schedule with service type, room/table, therapist |
| SOAP Notes | Table | Treatment notes by client, date, therapist, service type |
| Intake Forms | Table | Health history forms with completion status per client |
| Treatment Packages | Cards | Package types with pricing, sessions included/remaining |
| Services / Modalities | Table | Service menu (Swedish, Deep Tissue, Hot Stone, etc.) with duration/price |
| Gift Certificates | Table | Issued certificates with balance, expiration, recipient |
| Body Charts | Cards | Anatomy diagrams with treatment area markings per session |

**Pipeline Stages:**

```
Inquiry → First Appointment → Post-Session Follow-Up → Regular Client (Monthly) → Package Purchase → Loyal Client → Decreased Visits → Lapsed → Win-Back Campaign
```

**Unique Features:**
- Body chart/anatomy diagrams for marking treatment areas (face and full body)
- SOAP note templates with point-and-click charting (not just text fields)
- Display logic in SOAP notes (show/hide sections based on client scenario)
- Pressure preference tracking per client
- Contraindication screening and health history management
- Treatment area focus tracking across sessions (track recurring issues)
- Room/table assignment per appointment
- Buffer time management between sessions
- No-Show Guard / cancellation protection tools
- Insurance billing for auto accident and workers' comp cases
- Gift certificate management with online purchase
- Wellness check-in automation for inactive clients
- Short codes for common documentation phrases
- Modality tracking (Swedish, Deep Tissue, Sports, Trigger Point, etc.)
- Treatment plan recommendations within SOAP notes

---

## 10. ACUPUNCTURE

**Competitors studied:** AcuSimple, AcuBliss, Unified Practice, Jane App, Smart TCM, Jasmine PM

**HIPAA Required:** Yes

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Patients |
| Services | Treatments / Sessions |
| Appointments | Visits / Sessions |
| Products | Herbs / Supplements / Formulas |
| Staff | Practitioners / Acupuncturists / Providers |
| Documents | Charts / SOAP Notes |

**Essential Tabs:**

1. **Dashboard** — Today's patients, upcoming visits, revenue summary, outstanding claims, recent chart notes. Reporting on income, AR, patient visits.
2. **Patients** — Patient records: demographics, health history (TCM-specific: constitution, patterns of disharmony), insurance info, treatment history, herbal prescriptions, intake forms, tongue/pulse records, diagnoses (TCM and ICD-10). AcuSimple and AcuBliss store comprehensive TCM patient data.
3. **Schedule** — Appointment calendar with multi-practitioner support, room tracking, online booking via patient portal, waitlist management, recurring appointments, automated reminders (email/text). All platforms offer online scheduling.
4. **Charting / SOAP Notes** — TCM-specific charting: acupuncture points used, moxa, cupping, gua sha, tuina, electroacupuncture notes. Drawing tools for body diagrams. SOAP note format with TCM additions. AI Scribe for auto-generating chart notes from recorded sessions (AcuBliss, AcuSimple, Jane App). Customizable templates. Tongue and pulse documentation.
5. **Herbal Pharmacy** — Herbal formula prescribing: AcuSimple has 400+ classical formulas, AcuBliss has materia medica reference with ingredient ratios. Custom prescription building (combine formulas, adjust dosages). Raw herb prescription labels with cooking instructions (AcuBliss). Inventory tracking across locations. Vendor integration (Spring Wind, Mayway, Evergreen). Supplement dispensing (Fullscript integration).
6. **Billing & Claims** — Insurance claim submission (CMS-1500), CPT code library specific to acupuncture, ICD-10 code reference, superbill generation, electronic claims, payment processing, accounts receivable, patient statements. AcuSimple includes insurance CPT and ICD-10 codes.

**Optional Tabs:**

1. **Reference Library** — Acupuncture point reference guide, single herb compendium, classical formula database, CPT code reference, ICD-10 code reference. AcuSimple includes a comprehensive reference library. AcuBliss has CAM Point Protocols.
2. **Patient Portal** — Secure patient access for scheduling, health forms, messaging, document access. All major platforms offer portals.
3. **Telehealth** — HIPAA-compliant video for follow-up consultations, herbal consults. AcuBliss and Unified Practice include telehealth.
4. **Reports** — Income reports, AR aging, patient visit reports, treatment outcome tracking, inventory reports.
5. **Intake Forms** — TCM-specific health questionnaires (diet, sleep, emotions, pain, digestion, etc.), consent forms, HIPAA acknowledgment, signature capture.
6. **Retail / Dispensary** — Herbs, supplements, wellness products for sale. Inventory management. Some practitioners run in-office herb dispensaries.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Patients | Table | Patient list with diagnosis, last visit, next appointment, balance |
| Appointments | Calendar | Daily/weekly schedule with practitioner, room, service type |
| Chart Notes | Table | SOAP notes with TCM-specific data per visit |
| Treatment Plans | Table | Ongoing plans with frequency, points, herbs, goals |
| Herbal Formulas | Table | Prescribed formulas with ingredients, dosages, modifications |
| Acupuncture Points | Table | Reference library of points with meridian, location, indications |
| Herbs / Materia Medica | Table | Single herb reference with properties, actions, dosages |
| Insurance Claims | Table | Claims with status, CPT codes, amounts |
| Intake Forms | Table | TCM questionnaires with completion status |
| Tongue & Pulse Records | Cards | Diagnostic records per visit with observations |

**Pipeline Stages (Treatment Plan):**

```
New Patient → Initial Consultation & Diagnosis → Treatment Series (Weekly Visits) → Re-evaluation → Reduced Frequency → Maintenance (Monthly) → Seasonal Tune-Up → Discharge
```

**Unique Features:**
- TCM-specific diagnosis documentation (patterns of disharmony, Zang-Fu diagnosis)
- Acupuncture point reference library with meridian mapping
- Herbal formula database with 400+ classical formulas
- Custom herbal prescription builder with materia medica reference
- Ingredient ratio adjustment based on classical formula proportions
- Raw herb prescription labels with auto-generated cooking instructions
- Tongue and pulse documentation per visit
- Body diagrams with point marking/drawing tools
- Moxa, cupping, gua sha, and electroacupuncture tracking
- Herbal inventory management across multiple locations
- Vendor integration for herb ordering (Spring Wind, Mayway, Evergreen)
- Supplement dispensing via Fullscript/RupaHealth
- AI Scribe with acupuncture point recognition in transcription
- Insurance billing with acupuncture-specific CPT codes
- Classical formula quick-reference during charting
- CAM (Complementary and Alternative Medicine) point protocols

---

## Cross-Industry Comparison Matrix

### Feature Requirements by Business Type

| Feature | Gym | Yoga | Pilates | PT | Nutrition | Chiro | Phys Therapy | Mental Health | Massage | Acupuncture |
|---------|-----|------|---------|----|-----------|----|-------------|--------------|---------|-------------|
| Class/Group Scheduling | **YES** | **YES** | **YES** | Mix | Group Programs | No | No | Group Therapy | No | No |
| Individual Appointments | Optional | Optional | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** |
| Memberships | **YES** | **YES** | **YES** | Packages | Packages | No | No | No | Packages | No |
| Class Packs | **YES** | **YES** | **YES** | Packages | No | No | No | No | No | No |
| Insurance Billing | No | No | No | No | Optional | **YES** | **YES** | **YES** | Optional | **YES** |
| SOAP Notes | No | No | No | No | Optional | **YES** | **YES** | Progress Notes | **YES** | **YES** |
| Treatment Plans | No | No | No | Workout Plans | Protocols | **YES** | **YES** | **YES** | Optional | **YES** |
| HIPAA Compliance | No | No | No | No | Optional | **YES** | **YES** | **YES** | Optional | **YES** |
| Telehealth | No | Virtual Class | No | Video Coach | **YES** | Optional | **YES** | **YES** | No | **YES** |
| Body Charts/Diagrams | No | No | No | Body Metrics | No | **YES** | **YES** | No | **YES** | **YES** |
| Exercise Library | WODs | No | No | **YES** | No | No | **YES** (HEP) | No | No | No |
| Food/Nutrition Tracking | No | No | No | **YES** | **YES** | No | No | No | No | No |
| Outcomes/Assessments | No | No | No | Progress | Lab Results | Imaging | **YES** | **YES** | No | TCM Diagnosis |
| Equipment Scheduling | Rooms | Rooms | **YES** | No | No | Rooms | Rooms | Rooms | Tables | Rooms |
| Leaderboard/Social | **YES** | No | No | Challenges | No | No | No | No | No | No |
| Retail/Products | **YES** | **YES** | Optional | Supplements | Supplements | Supplements | Supplies | No | **YES** | Herbs |
| Lead Pipeline/CRM | **YES** | Basic | Basic | **YES** | Basic | Basic | Referral Mgmt | Waitlist | Basic | Basic |
| Wearable Integration | Optional | No | No | **YES** | **YES** | No | No | No | No | No |
| Client Portal | Check-in App | Optional | Optional | App | **YES** | Portal | **YES** | **YES** | Optional | **YES** |
| AI Documentation | No | No | No | No | No | **YES** | **YES** | **YES** | No | **YES** |

### Primary vs Group Business Model

| Business Type | Primary Model | Class Size | Key Scheduling Need |
|--------------|---------------|------------|---------------------|
| Gym | Group | 10-30+ | Class schedule with capacity/waitlist |
| Yoga Studio | Group | 15-40 | Multi-class daily schedule with teacher |
| Pilates Studio | Mixed (56% private) | 1-2 private, 8-12 group | Equipment-specific booking |
| Personal Trainer | Individual | 1-4 | 1-on-1 session booking with program delivery |
| Nutritionist | Individual | 1 (telehealth or in-person) | Consultation scheduling with follow-ups |
| Chiropractor | Individual | 1 | High-volume short visits (15-30 min) |
| Physical Therapy | Individual | 1 | Multi-visit recurring schedule with auth tracking |
| Mental Health | Individual | 1 (some group) | Recurring weekly sessions (45-60 min) |
| Massage Therapy | Individual | 1 | Single sessions with buffer time (60-90 min) |
| Acupuncture | Individual | 1 | Treatment series with decreasing frequency |

### Insurance/Healthcare Compliance Requirements

| Business Type | Insurance Billing | HIPAA Required | Clinical Notes Required | Compliance Level |
|--------------|-------------------|----------------|------------------------|-----------------|
| Gym | No | No | No | Low |
| Yoga Studio | No | No | No | Low |
| Pilates Studio | No | No | No | Low |
| Personal Trainer | No | No | No | Low |
| Nutritionist | Optional | Recommended | SOAP/ADIME | Medium |
| Chiropractor | Yes | Yes | SOAP (required) | High |
| Physical Therapy | Yes | Yes | SOAP + Outcomes (required) | High |
| Mental Health | Yes | Yes | Progress Notes + Treatment Plans | High |
| Massage Therapy | Optional | Recommended | SOAP (recommended) | Medium |
| Acupuncture | Yes | Yes | SOAP + TCM (required) | High |

---

## Red Pine Template Recommendations

### Template Groupings

Based on this research, the 10 business types naturally cluster into 3 groups:

**Group A: Fitness/Wellness (Class-Based)**
- Gym, Yoga Studio, Pilates Studio
- Shared needs: class scheduling, memberships/packages, check-in, marketing
- No clinical documentation requirements
- Focus on member engagement, retention, and community

**Group B: Fitness/Health (1-on-1 Coaching)**
- Personal Trainer, Nutritionist/Dietitian
- Shared needs: client progress tracking, program delivery, session packages
- Optional or light clinical requirements
- Focus on client outcomes, compliance, and transformation

**Group C: Healthcare (Clinical)**
- Chiropractor, Physical Therapy, Mental Health, Massage Therapy, Acupuncture
- Shared needs: SOAP notes, insurance billing, treatment plans, HIPAA compliance
- Mandatory clinical documentation
- Focus on patient care, compliance, and claims management

### Recommended Default Tab Configurations

**Gym:** Dashboard | Members | Schedule | Memberships | Workouts | Payments
**Yoga Studio:** Dashboard | Students | Schedule | Packages | Teachers | Payments
**Pilates Studio:** Dashboard | Clients | Schedule | Packages | Instructors | Payments
**Personal Trainer:** Dashboard | Clients | Workouts | Schedule | Progress | Payments
**Nutritionist:** Dashboard | Clients | Schedule | Protocols | Charting | Billing
**Chiropractor:** Dashboard | Patients | Schedule | SOAP Notes | Billing | Treatment Plans
**Physical Therapy:** Dashboard | Patients | Schedule | Documentation | HEP | Billing
**Mental Health:** Dashboard | Calendar | Clients | Notes | Billing | Measures
**Massage Therapy:** Dashboard | Clients | Schedule | SOAP Notes | Packages | Payments
**Acupuncture:** Dashboard | Patients | Schedule | Charting | Herbal Pharmacy | Billing

---

## Sources

### Gym
- [Zen Planner Product](https://zenplanner.com/product/)
- [Zen Planner CrossFit Software](https://zenplanner.com/crossfit-gym-software/)
- [Mindbody Gym Software](https://www.mindbodyonline.com/business/fitness/gym-software)
- [WellnessLiving Fitness Software](https://www.wellnessliving.com/fitness/software/)
- [Wodify Features](https://www.wodify.com/products/core/features)
- [Wodify CrossFit](https://www.wodify.com/solutions/crossfit-functional-fitness)

### Yoga & Pilates
- [Mindbody Yoga Software](https://www.mindbodyonline.com/business/fitness/yoga-software)
- [Mindbody Pilates Software](https://www.mindbodyonline.com/business/fitness/pilates-software)
- [WellnessLiving Yoga Software](https://www.wellnessliving.com/yoga/software/)
- [WellnessLiving Pilates Software](https://www.wellnessliving.com/pilates/software/)
- [Mariana Tek Pilates](https://www.marianatek.com/pilates-studio-software/)

### Personal Trainer
- [Trainerize Features](https://www.trainerize.com/features/)
- [My PT Hub Features](https://www.mypthub.net/features/)
- [TrueCoach](https://truecoach.co/)
- [Acuity Scheduling Fitness](https://acuityscheduling.com/solutions/fitness)

### Nutritionist / Dietitian
- [Practice Better Nutritionists](https://practicebetter.io/who-we-serve/nutritionists)
- [Healthie Nutrition](https://www.gethealthie.com/nutrition)
- [NutriAdmin](https://nutriadmin.com)

### Chiropractor
- [ChiroTouch Practice Management](https://www.chirotouch.com/practice-management-software)
- [ChiroFusion Features](https://www.chirofusionsoftware.com/features/)
- [ChiroSpring](https://www.chirospring.com/)

### Physical Therapy
- [WebPT Physical Therapy](https://www.webpt.com/physical-therapy)
- [WebPT Home Exercise Program](https://www.webpt.com/products/home-exercise-program)
- [WebPT Outcomes](https://www.webpt.com/products/outcomes)
- [Clinicient EMR](https://www.clinicient.com/product/emr/)

### Mental Health
- [SimplePractice](https://www.simplepractice.com/)
- [TherapyNotes](https://www.therapynotes.com/)
- [TheraNest / Ensora Health](https://ensorahealth.com/product/theranest-mental-health/)

### Massage Therapy
- [ClinicSense Features](https://clinicsense.com/features)
- [ClinicSense SOAP Notes](https://clinicsense.com/features/soap-notes-software)
- [Vagaro Massage Software](https://www.vagaro.com/pro/massage-software)

### Acupuncture
- [AcuSimple](https://acusimple.com/)
- [AcuBliss Features](https://www.acubliss.app/features)
- [Unified Practice Features](https://unifiedpractice.com/features/)
- [Jane App Acupuncture](https://jane.app/acupuncture-us)
- [Smart TCM](https://www.smarttcm.com/)
