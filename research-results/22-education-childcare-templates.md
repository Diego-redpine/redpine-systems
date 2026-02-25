# Research #22: Education & Childcare Industry Templates

**Date:** February 24, 2026
**Objective:** Document features, tabs, entities, views, pipeline stages, and terminology for 8 education and childcare business types based on competitor platform research.

---

## Table of Contents
1. [Tutoring Center / Private Tutor](#1-tutoring-center--private-tutor)
2. [Music School / Lessons](#2-music-school--lessons)
3. [Dance Studio](#3-dance-studio)
4. [Daycare / Childcare Center](#4-daycare--childcare-center)
5. [Driving School](#5-driving-school)
6. [Language School](#6-language-school)
7. [Martial Arts Studio](#7-martial-arts-studio)
8. [Swim School / Aquatics](#8-swim-school--aquatics)
9. [Competitor Comparison](#9-competitor-comparison)
10. [Template Config Recommendations](#10-template-config-recommendations)

---

## INDUSTRY OVERVIEW

Education and childcare businesses share key characteristics: students as primary clients (often with parents/guardians as the billing contact), class/session-based scheduling, skill progression tracking, and strong safety/compliance requirements. The billing relationship is unique: the student receives the service, but the parent/guardian pays. Sibling discounts, family billing, and guardian communication are universal needs. Platforms like Jackrabbit, iClassPro, and Pike13 dominate the class-based segment, while brightwheel and Procare lead childcare.

---

## 1. TUTORING CENTER / PRIVATE TUTOR

**Competitors studied:** TutorCruncher, TutorBird, Teachworks, MyTutor, Pike13

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Families |
| Services | Subjects / Sessions |
| Appointments | Lessons / Sessions |
| Products | Study Materials / Packages |
| Staff | Tutors / Instructors |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Lessons today, active students, revenue this month, hours tutored, tutor availability, upcoming assessments. TutorCruncher shows lesson hours, revenue, and attendance analytics.
2. **Students** — Student profiles: name, grade level, school, subjects, learning goals, assessment results, session history, progress notes, guardian/parent contact info. Parent as billing contact, student as service recipient.
3. **Schedule** — Lesson scheduling: one-on-one sessions, small group sessions, recurring weekly slots, tutor-student matching, room/location assignment, virtual vs in-person. TutorCruncher uses intelligent tutor-student matching based on skills and location.
4. **Tutors** — Tutor profiles: subjects taught, qualifications, availability, hourly rate, performance ratings, background check status. Tutor matching to students based on subject expertise and location.
5. **Billing** — Invoicing to parents/guardians, package-based billing (10-pack of sessions), hourly billing, subscription billing (weekly recurring), sibling discounts, payment tracking. TutorCruncher automates invoicing and payment processing.
6. **Communication** — Parent updates: session summaries, progress reports, scheduling changes, payment reminders. Two-way messaging with parents. Lesson notes visible to parents after each session.

**Optional Tabs:**

1. **Assessments** — Diagnostic assessments, progress testing, score tracking over time, grade improvement reports. Data-driven proof of progress is key for retention.
2. **Subjects / Curriculum** — Subject catalog, grade-level curriculum outlines, learning milestones, resource library.
3. **Reports** — Hours by tutor, revenue per subject, student progress trends, tutor utilization, family retention rate.
4. **Marketing** — Referral programs (word-of-mouth is primary), Google reviews, seasonal campaigns (back-to-school, exam prep, summer).
5. **Resources** — Worksheets, study guides, practice tests, video content library.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Students with grade, subjects, guardian, progress |
| Lessons | Calendar | Sessions with tutor, student, subject, location |
| Tutors | Cards | Tutor profiles with subjects, availability, rating |
| Families | Table | Guardian contacts with students, billing, balance |
| Assessments | Table | Test scores and progress data per student |
| Packages | Cards | Session packages with price, sessions remaining |
| Invoices | Table | Parent billing with amount, status, family |

**Pipeline Stages:**

```
Inquiry -> Free Assessment / Trial Session -> Package/Plan Selected -> Enrolled -> Active (Regular Sessions) -> Progress Review -> Re-Enrollment / Package Renewal -> Referral Request
```

**Unique Features:**
- Parent/guardian as billing contact, student as service recipient
- Tutor-student matching (by subject, level, location, personality)
- Session notes/reports shared with parents after each lesson
- Progress tracking with assessment data over time
- Package-based billing (buy 10/20 sessions at a discount)
- Virtual and in-person session support
- Sibling discounts and family billing
- Whiteboard/screen sharing for virtual tutoring
- Homework help tracking
- Standardized test prep programs (SAT, ACT, GRE)
- TutorCruncher pricing: $12/month + 0.8% of revenue

**Payment Model:**
- Hourly billing ($30-150/hour depending on subject and level)
- Session packages (10-pack, 20-pack at discount)
- Monthly subscription (4 sessions/month, 8 sessions/month)
- Sibling discounts (10-20% off second child)
- Registration/assessment fee ($25-100 one-time)
- Payment to parents, not students

**Scheduling Model:**
- Recurring weekly sessions (Tuesday 4pm math)
- One-time sessions for test prep or specific needs
- Small group sessions (2-4 students, reduced rate per student)
- Virtual sessions via video conferencing
- Flexible rescheduling with 24-hour notice

---

## 2. MUSIC SCHOOL / LESSONS

**Competitors studied:** My Music Staff, Jackrabbit Music, Pike13, Fons, Music Teacher's Helper

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Families |
| Services | Lessons / Programs |
| Appointments | Lessons / Rehearsals |
| Products | Instruments / Sheet Music / Accessories |
| Staff | Teachers / Instructors |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Lessons today, active students, revenue, recital/performance countdown, teacher schedules, instruments rented out.
2. **Students** — Student profiles: instrument(s), level (beginner/intermediate/advanced), lesson day/time, teacher, practice log, repertoire, performance history, guardian contact. My Music Staff tracks practice assignments and progress.
3. **Schedule** — Lesson calendar: private lessons (30/45/60 min), group classes (ensemble, theory, ear training), rehearsal slots, recital dates. Teacher room/studio assignment. My Music Staff and Jackrabbit Music both manage complex lesson schedules.
4. **Teachers** — Teacher profiles: instruments taught, certifications, availability, room assignment, pay rate (per lesson or hourly), background check status.
5. **Billing** — Monthly tuition billing (most common), per-lesson billing, semester packages, registration fees. Auto-billing on 1st of month. Sibling discounts. Jackrabbit automates tuition processing.
6. **Performances / Recitals** — Recital management: date, venue, program order, student assignments, rehearsal schedule, tickets/RSVPs. This is a highlight of music school operations (2-3 recitals per year).

**Optional Tabs:**

1. **Practice Log** — Student practice tracking: minutes practiced per day/week, pieces practiced, teacher assignments. Visible to parents and teachers. Gamification (streaks, milestones).
2. **Repertoire** — Music library: pieces by level, instrument, genre. Student repertoire history (what they've learned).
3. **Retail / Rentals** — Instrument rentals (common for beginners), sheet music sales, accessories (strings, reeds, picks, metronomes), method books.
4. **Marketing** — Open house events, trial lessons, seasonal enrollment campaigns, referral programs.
5. **Reports** — Revenue per teacher, student retention, popular instruments, recital participation.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Students with instrument, level, teacher, guardian |
| Lessons | Calendar | Private and group lessons with teacher, room, time |
| Teachers | Cards | Instructor profiles with instruments, schedule |
| Recitals | Calendar | Performance events with program, participants |
| Practice Log | Table | Student practice records with assignments |
| Rentals | Table | Instrument rentals with student, instrument, due date |
| Families | Table | Guardian contacts with students, billing |

**Pipeline Stages:**

```
Inquiry -> Trial Lesson -> Enrolled -> Active Student -> First Recital -> Continuing Student -> Level Advancement -> Ensemble/Group Participation -> Summer Program -> Annual Re-Enrollment
```

**Unique Features:**
- Private lesson scheduling with teacher-student matching
- Monthly tuition auto-billing model
- Recital/performance management (program, rehearsals, venue)
- Practice log tracking for students (with parent visibility)
- Instrument rental tracking and management
- Level progression tracking (beginner -> intermediate -> advanced)
- Music library/repertoire management
- Group class enrollment (ensemble, theory, choir)
- Summer camp/intensive program management
- Makeup lesson policy management (tokens or reschedule within X days)
- My Music Staff pricing: ~$14-19/month; Jackrabbit Music: starting at $49/month

**Payment Model:**
- Monthly tuition (most common): $100-300/month for weekly lessons
- Per-lesson billing ($30-80 per 30-min lesson)
- Semester package (16 lessons at discount)
- Registration fee ($25-75 annual)
- Sibling discount (10-20%)
- Instrument rental ($20-50/month)
- Recital fee ($25-50 per student)

**Scheduling Model:**
- Recurring weekly private lessons (30, 45, or 60 minutes)
- Group classes (weekly ensemble, theory, choir)
- Makeups within 24-hour cancellation window
- Summer camps and intensive workshops
- Recital rehearsals (additional scheduling before performances)

---

## 3. DANCE STUDIO

**Competitors studied:** Jackrabbit Class, DanceStudio-Pro, iClassPro, StudioDirector, ClassManager

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Dancers / Students / Families |
| Services | Classes / Programs |
| Appointments | Classes / Rehearsals |
| Products | Costumes / Dancewear / Shoes |
| Staff | Teachers / Choreographers / Instructors |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Classes today, active dancers, revenue, recital countdown, costume orders due, enrollment numbers vs capacity. Jackrabbit Class shows KPI dashboards with enrollment, attendance, and revenue metrics.
2. **Classes** — Class schedule: style (ballet, jazz, tap, hip hop, contemporary, lyrical, acro), level (tiny tots, beginner, intermediate, advanced, competitive), age group, teacher, studio/room, capacity, waitlist. Jackrabbit and iClassPro both manage complex class schedules.
3. **Students / Dancers** — Student profiles: age, classes enrolled, performance history, costume sizes, emergency contact, medical info, guardian contact, tuition balance.
4. **Billing** — Monthly tuition auto-billing, multi-class discounts, family/sibling discounts, costume fees, competition fees, registration fees. Jackrabbit Class automates tuition processing based on classes enrolled.
5. **Attendance** — Check-in for each class, attendance reporting, makeup class tracking. Jackrabbit offers QR code or kiosk check-in.
6. **Performances / Recitals** — Recital management: date, venue, program/show order, costumes, rehearsal schedule, ticket sales, backstage assignments. The annual recital is the biggest event of the year.

**Optional Tabs:**

1. **Costumes** — Costume management per class: vendor, style, sizing per student, order tracking, distribution. Coordinating costumes for 100+ students across 20+ classes is a major operation.
2. **Competitions** — Competition event management: event dates, routines entered, dancers assigned, fees, travel logistics, results tracking.
3. **Retail** — Dancewear sales: shoes, leotards, tights, warm-ups. In-studio or online store.
4. **Marketing** — Open house, trial classes, seasonal enrollment campaigns, social media showcasing performances.
5. **Reports** — Enrollment by class/age/style, retention, attendance rates, revenue per class, costume/competition expenses.
6. **Communication** — Parent communication: class updates, schedule changes, costume info, performance details, weather closings.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Classes | Calendar | Classes with style, level, teacher, room, capacity |
| Students | Table | Dancers with age, classes, costumes, guardian |
| Attendance | Table | Check-in records per class, per student |
| Performances | Calendar | Recitals with program, rehearsals, costumes |
| Costumes | Table | Costume orders per class with sizes, vendor |
| Competitions | Calendar | Competition events with entries, fees, results |
| Families | Table | Guardian contacts with students, billing |

**Pipeline Stages:**

```
Inquiry -> Trial Class -> Enrolled -> Active Dancer -> First Recital -> Returning Student (next season) -> Competition Team (optional) -> Advanced/Pre-Professional -> Summer Intensive -> Annual Re-Enrollment
```

**Unique Features:**
- Multi-class enrollment per student (ballet + jazz + tap)
- Age and level-based class organization
- Costume management per class (sizing, ordering, distribution)
- Annual recital production management (the biggest event of the year)
- Competition team management (travel, fees, routines, results)
- Studio/room management (multiple rooms with different floors)
- Skill progression by style and level
- Summer camp and intensive programs
- Drop-in class options alongside monthly enrollment
- Dress code enforcement by class level
- Jackrabbit Class pricing: $49-315/month based on student count

**Payment Model:**
- Monthly tuition based on number of classes ($60-200+/month)
- Registration fee ($25-75 annual)
- Multi-class discount (10-20% for 2+ classes)
- Sibling discount (10-20% for additional children)
- Costume fees ($50-150 per class per year, billed separately)
- Competition fees ($50-200 per event)
- Drop-in rates ($15-25 per class)
- Summer camp fees ($150-400/week)

**Scheduling Model:**
- Recurring weekly classes (semester-based: fall, spring, summer)
- Multiple classes per week per student
- Rehearsal scheduling before performances
- Competition travel scheduling
- Summer camps and intensives (daily for 1-4 weeks)

**Safety/Compliance:**
- Background checks for all staff
- Emergency contact and medical info per student
- Allergy/medical condition alerts
- Photo/video release forms
- Studio insurance and liability waivers

---

## 4. DAYCARE / CHILDCARE CENTER

**Competitors studied:** brightwheel, Procare, HiMama (Lillio), KidKare, Kangarootime

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Children / Families |
| Services | Programs / Classrooms |
| Appointments | N/A (daily attendance) |
| Products | N/A |
| Staff | Teachers / Caregivers / Aides |
| Pipeline | Enrollment Pipeline / Waitlist |

**Essential Tabs:**

1. **Dashboard** — Children checked in today, staff ratios (critical for licensing), billing status, parent messages, daily activity feed, open enrollment spots. brightwheel shows real-time attendance and ratio monitoring.
2. **Children / Roster** — Child profiles: age, classroom assignment, schedule (full-time/part-time/drop-in), guardian contacts, pickup authorization list, allergies/medical conditions, immunization records, developmental milestones. brightwheel stores comprehensive child profiles.
3. **Attendance** — Real-time check-in/check-out: authorized pickup verification, digital signatures, timestamps, staff ratio monitoring per classroom. brightwheel's secure check-in is a standout feature. This is legally required documentation.
4. **Daily Reports** — Parent communication: meals/snacks, nap times, diaper changes, activities, photos/videos from the day, mood/behavior notes. Sent to parents via app. brightwheel reports 95% of families say this improves communication.
5. **Billing** — Tuition billing: weekly or monthly, full-time vs part-time rates, drop-in fees, sibling discounts, late pickup fees, subsidy tracking. Autopay reduces late payments by 90% per brightwheel data.
6. **Staff** — Staff profiles: classroom assignment, certifications (CPR, First Aid), background check status, training records, schedule, staff-to-child ratios per classroom.

**Optional Tabs:**

1. **Enrollment / Waitlist** — Enrollment pipeline: inquiry, tour scheduled, tour completed, application submitted, waitlist, enrolled. Waitlist management with priority ordering.
2. **Lesson Plans** — Curriculum planning: daily activity plans, developmental learning areas (cognitive, motor, social, language), theme weeks, assessment checkpoints.
3. **Immunizations** — Immunization tracking per child: required vaccinations, dates, upcoming due dates, exemptions. State licensing requirement.
4. **Food / Meals** — Meal planning, allergy management, CACFP (Child and Adult Care Food Program) compliance tracking, menu posting for parents.
5. **Communication** — Announcements, event notifications, weather closings, policy updates. Two-way messaging with individual parents.
6. **Reports** — Licensing compliance reports, attendance records, billing reports, staff certifications expiring, enrollment trends.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Children | Table | Child profiles with age, classroom, schedule, medical |
| Classrooms | Cards | Rooms with age range, capacity, current ratio, teacher |
| Attendance | Table | Daily check-in/out records with timestamps |
| Daily Reports | List | Per-child daily activity summaries with photos |
| Families | Table | Parent/guardian contacts with children, billing |
| Staff | Table | Teachers with certifications, classroom, schedule |
| Enrollment/Waitlist | Pipeline | Enrollment inquiries with tour, application status |
| Immunizations | Table | Vaccination records per child with due dates |

**Pipeline Stages:**

```
Inquiry -> Tour Scheduled -> Tour Completed -> Application Submitted -> Waitlist (if full) -> Enrollment Offered -> Paperwork Complete -> Enrolled -> Acclimation Period -> Active -> Annual Re-Enrollment
```

**Unique Features:**
- Real-time check-in/check-out with authorized pickup verification
- Staff-to-child ratio monitoring (legally mandated: varies by age, e.g., 1:4 for infants)
- Daily reports to parents (meals, naps, diapers, activities, photos)
- Immunization tracking and compliance
- Allergy/medical condition alerts (visible to all classroom staff)
- Lesson planning with developmental milestones
- CACFP food program compliance
- State licensing report generation
- Subsidy/voucher billing management
- Emergency contact management with priority ordering
- Parent app for real-time updates (free for parents)
- Photo and video sharing with parents (privacy-compliant)
- brightwheel pricing: custom, based on program size; saves 20 hours/month

**Payment Model:**
- Weekly or monthly tuition ($800-2,500/month full-time, varies by age and region)
- Part-time rates (3-day, MWF, TTh)
- Drop-in rates ($50-100/day)
- Registration fee ($50-200 annual)
- Sibling discount (5-15%)
- Late pickup fees ($1-5 per minute after closing)
- Subsidy/voucher processing
- Autopay enrollment strongly encouraged

**Safety/Compliance (CRITICAL):**
- State licensing compliance (ratios, square footage, health inspections)
- Background checks for all staff (FBI fingerprint + state)
- CPR/First Aid certification tracking
- Immunization record compliance
- Authorized pickup list with photo ID verification
- Emergency evacuation plans and drills
- Incident/accident reporting
- Allergy action plans
- Abuse reporting requirements
- Annual licensing inspections

---

## 5. DRIVING SCHOOL

**Competitors studied:** Drive Scout, DrivingSchoolSoftware.com, ScheduleRite, BookRides

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Learners |
| Services | Packages / Programs |
| Appointments | Driving Lessons / Classes |
| Products | Study Materials |
| Staff | Instructors / Driving Teachers |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Lessons today, active students, instructor schedules, revenue, vehicles in use, upcoming classroom sessions, certificate completions.
2. **Students** — Student profiles: age, permit/license status, program enrolled (teen, adult, defensive driving), lesson count completed, behind-the-wheel hours, classroom hours, certificate status, guardian contact (if minor).
3. **Schedule** — Driving lesson scheduling: instructor-student matching, vehicle assignment, pickup location, lesson duration (typically 1-2 hours), zone-based routing. Drive Scout's automated zoning system assigns students to instructor zones to minimize drive time.
4. **Instructors** — Instructor profiles: certifications, vehicle assigned, zone, availability, schedule, student assignments, driving record.
5. **Vehicles** — Fleet management: vehicle inventory, assignment per lesson, maintenance schedules, insurance, mileage tracking, inspection records.
6. **Billing** — Package-based pricing (30-hour teen program, 6-hour adult, etc.), payment plans, guardian billing for minors, registration fees.

**Optional Tabs:**

1. **Classroom** — Classroom schedule: theory classes (traffic laws, vehicle operation, safety), attendance tracking, online vs in-person, quiz/exam results.
2. **Certificates** — Certificate generation: course completion certificates, DMV-required documentation, behind-the-wheel hour logs. State compliance documentation.
3. **Marketing** — High school partnerships, seasonal promotions, Google ads, parent referrals.
4. **Reports** — Revenue per program, instructor utilization, vehicle utilization, student pass rates, student-to-enrollment conversion.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Learners with program, hours completed, permit status |
| Lessons | Calendar | Driving sessions with instructor, vehicle, location |
| Instructors | Cards | Driving teachers with zone, vehicle, schedule |
| Vehicles | Cards | Fleet with assignment, maintenance, mileage |
| Classroom Sessions | Calendar | Theory classes with topic, attendance |
| Certificates | Table | Completion certificates with status, expiration |
| Packages | Cards | Program offerings with hours, price |

**Pipeline Stages:**

```
Inquiry -> Registration -> Permit Obtained (if teen) -> Classroom Course Started -> Behind-the-Wheel Lessons -> Hours Completed -> Road Test Prep -> Certificate Issued -> DMV Test -> License Obtained -> Defensive Driving (optional)
```

**Unique Features:**
- Behind-the-wheel hour tracking (state-mandated minimums)
- Zone-based instructor routing (minimize non-productive drive time)
- Vehicle-lesson-instructor triple-assignment per booking
- Pickup and drop-off location management per lesson
- State-mandated curriculum tracking (varies by state)
- DMV compliance documentation and certificate generation
- Classroom + behind-the-wheel scheduling in one system
- Parent scheduling access for minor students
- Dual-control vehicle management
- Student progress tracking through milestones (parking, highway, night driving)
- Drive Scout: reduces scheduling time by 70%

**Payment Model:**
- Package pricing (teen: $300-800 for full program; adult: $200-500)
- Per-lesson pricing ($50-100/lesson)
- Payment plans (spread over program duration)
- Registration fee ($25-50)
- Guardian billing for minors
- Corporate/fleet training pricing

**Scheduling Model:**
- Individual behind-the-wheel lessons (1-2 hours)
- Classroom sessions (weekly or intensive weekend)
- Online classroom alternative
- Flexible scheduling around school hours (teens)
- Weekend and evening availability critical

---

## 6. LANGUAGE SCHOOL

**Competitors studied:** SchoolMint, Administrate, CoursePro, Pike13, Amidship

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Learners |
| Services | Courses / Programs |
| Appointments | Classes / Sessions |
| Products | Textbooks / Materials |
| Staff | Teachers / Instructors |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active students, classes today, enrollment pipeline, revenue, course completion rates, teacher utilization.
2. **Students** — Student profiles: native language, target language(s), proficiency level (A1-C2 using CEFR framework), course enrolled, attendance, placement test results, goals (travel, business, citizenship, academic).
3. **Courses / Classes** — Course catalog: language, level, format (group, private, intensive), schedule (weekly, daily intensive, weekend), teacher, room, capacity. Multiple levels per language (Beginner 1, Beginner 2, Intermediate 1, etc.).
4. **Schedule** — Class schedule: recurring sessions, group class timetable, private lesson booking, room assignment, virtual vs in-person.
5. **Billing** — Course-based billing (pay per course/semester), monthly tuition, private lesson packages, registration fees, material fees.
6. **Attendance** — Per-class attendance tracking, absence alerts, makeup policy tracking. Attendance often tied to visa/immigration compliance for international students.

**Optional Tabs:**

1. **Assessments / Placement** — Placement testing for new students, level assessments, progress tests, certification exam prep (TOEFL, IELTS, DELE, DELF).
2. **Materials** — Textbook sales, workbooks, online resource access, digital learning platform links.
3. **Teachers** — Teacher profiles: languages taught, qualifications (TESOL, CELTA), native language, availability.
4. **Marketing** — International student recruitment, corporate language training, community outreach, social media.
5. **Reports** — Enrollment by language/level, retention, progression rates, teacher performance, revenue per course.
6. **Immigration** — I-20 forms, F-1 visa compliance tracking, attendance reporting for SEVIS (international student programs).

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Learners with language, level, course, attendance |
| Courses | Cards | Language courses with level, schedule, capacity |
| Classes | Calendar | Class sessions with teacher, room, attendance |
| Assessments | Table | Placement and progress test results |
| Teachers | Cards | Instructors with languages, qualifications |
| Invoices | Table | Course fees, materials, billing status |

**Pipeline Stages:**

```
Inquiry -> Placement Test -> Level Assigned -> Course Selected -> Enrolled -> Active Student -> Mid-Course Assessment -> Course Completion -> Next Level / Re-enrollment -> Certification Exam (optional) -> Alumni
```

**Unique Features:**
- Proficiency level tracking (CEFR: A1, A2, B1, B2, C1, C2)
- Placement testing for accurate level assignment
- Multi-language course management
- Group + private lesson scheduling in one system
- Intensive program management (20-30 hours/week)
- Visa/immigration compliance tracking (I-20, SEVIS for US)
- Certification exam preparation tracking (TOEFL, IELTS, etc.)
- Conversation practice groups (informal sessions)
- Cultural events and immersion activities
- Corporate language training programs
- Online/virtual class support with screen sharing
- Multi-session course progression (Beginner 1 -> Beginner 2 -> Intermediate 1)

**Payment Model:**
- Per-course/semester pricing ($200-1,500 per course)
- Monthly tuition for ongoing programs ($100-400/month)
- Private lesson packages ($40-100/hour)
- Intensive program pricing ($500-3,000 for 2-8 weeks)
- Registration fee ($50-100)
- Material fee ($50-150)
- Corporate training: per-employee or per-group pricing

---

## 7. MARTIAL ARTS STUDIO

**Competitors studied:** Kicksite, Zen Planner, Spark Membership, Rain Retail, PerfectMind

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Students / Members |
| Services | Programs / Classes |
| Appointments | Classes / Training Sessions |
| Products | Uniforms / Equipment / Gear |
| Staff | Instructors / Senseis / Masters |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Active members, classes today, belt test upcoming, revenue, trial conversions, retention rate. Kicksite tracks member progress and billing.
2. **Students / Members** — Student profiles: art/discipline (karate, jiu-jitsu, taekwondo, MMA, krav maga), current rank/belt, enrollment date, attendance count, testing eligibility, guardian contact, medical info, emergency contact, waiver status.
3. **Classes** — Class schedule: by style, level, age group (little dragons, kids, teens, adults), instructor, mat/room, capacity. Multiple classes per day with different styles and levels.
4. **Belt / Rank Progression** — THE defining feature of martial arts software: belt/rank tracking per student, requirements for next rank (attendance minimums, skill checklist, time-in-rank), testing eligibility, test scheduling, promotion records. Kicksite makes belt tracking a core feature.
5. **Attendance** — Check-in per class, attendance streaks, attendance-toward-belt-test tracking, milestone badges. Kicksite offers check-in via QR code or kiosk.
6. **Billing** — Monthly membership billing, family plans, testing fees, uniform/equipment sales, auto-billing with failed payment management. Kicksite automates billing with flat-rate processing.

**Optional Tabs:**

1. **Testing / Promotions** — Belt test management: eligibility criteria, test scheduling, testing fees, results, promotion ceremonies. Belt tests every 2-4 months for most styles.
2. **Retail / Pro Shop** — Uniforms (gi/dobok), belts, sparring gear, weapons, pads, apparel, supplements. In-studio store or online.
3. **Tournaments** — Competition management: event registration, division assignments, results tracking, team management.
4. **Marketing** — Trial lesson offers, buddy passes, community events, school demonstrations, referral programs.
5. **Communication** — Parent updates, test announcements, schedule changes, event invitations.
6. **Reports** — Enrollment trends, retention, belt progression rates, revenue per program, trial conversion rate.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Students | Table | Members with rank, program, attendance, testing status |
| Classes | Calendar | Sessions with style, level, age group, instructor |
| Belt Progression | Pipeline | Students by rank with next-test eligibility |
| Attendance | Table | Check-in records with streak tracking |
| Belt Tests | Calendar | Scheduled tests with eligible students |
| Retail | Table | Uniforms, gear, equipment inventory |
| Families | Table | Guardian contacts with students, billing |

**Pipeline Stages:**

Student lifecycle:
```
Inquiry -> Trial Class -> Enrolled -> White Belt -> First Stripe/Advancement -> Belt Test 1 -> Continuing Training -> Advanced Belt -> Black Belt Track -> Leadership/Instructor Program
```

Enrollment:
```
Lead -> Trial Offer -> Trial Class -> Post-Trial Follow-Up -> Enrolled -> First Month -> 90-Day Review -> Long-Term Member -> Referral Request
```

**Unique Features:**
- Belt/rank progression tracking (the #1 differentiating feature)
- Attendance requirements for belt testing eligibility
- Skill checklist per rank level
- Belt test scheduling and ceremony management
- Age-group class organization (Little Ninjas, Kids, Teens, Adults)
- Multi-art support (karate, BJJ, MMA, taekwondo in one school)
- Sparring gear sizing and tracking per student
- Leadership/instructor program management
- Tournament management with division tracking
- Trial offer management (free class, buddy pass, 1-week trial)
- Student milestone celebrations (100 classes, 1-year anniversary)
- Kicksite pricing: $49-199/month based on student count

**Payment Model:**
- Monthly membership ($80-200/month)
- Family rates ($150-350/month for multiple members)
- Annual prepay discount (10-15% off)
- Belt testing fees ($25-75 per test)
- Uniform/gear purchases ($50-200)
- Registration fee ($50-100)
- Drop-in rates ($15-25 per class)
- Private lesson add-on ($50-100/session)

**Safety/Compliance:**
- Background checks for instructors
- Medical questionnaire for students
- Liability waivers (signed by guardian for minors)
- Emergency contact and medical info
- Safety equipment requirements by class/level
- Insurance requirements

---

## 8. SWIM SCHOOL / AQUATICS

**Competitors studied:** iClassPro, Jackrabbit Class, Jonas Club Software, SplashPoint, ClassForKids

**Label overrides:**

| Generic | Industry Term |
|---------|--------------|
| Clients | Swimmers / Students / Families |
| Services | Swim Levels / Programs |
| Appointments | Classes / Lessons |
| Products | Swim Gear / Accessories |
| Staff | Instructors / Lifeguards |
| Pipeline | Enrollment Pipeline |

**Essential Tabs:**

1. **Dashboard** — Classes today, pool utilization, active students, revenue, skill evaluations due, enrollment availability by level. iClassPro provides KPI dashboards with enrollment and attendance data.
2. **Classes** — Class schedule organized by swim level: parent-tot, water exploration, beginner, intermediate, advanced, competitive prep. Lane assignment, instructor assignment, maximum 4-6 students per group (safety critical). iClassPro organizes classes by time, level, instructor, and location.
3. **Students** — Student profiles: swim level, skill progression, attendance, medical info (seizure conditions, tubes in ears, special needs), guardian contacts, water comfort assessment.
4. **Skill Progression** — Level-based skill tracking: skills required per level, skill evaluation by instructor, level advancement, certificates/badges. iClassPro's "Skill Bank" tracks progressions and milestones with videos and descriptions. American Red Cross Learn-to-Swim levels are the standard framework.
5. **Attendance** — Per-class check-in, absence tracking, makeup class management. iClassPro offers makeup tokens for missed classes.
6. **Billing** — Session-based billing (8-week or 10-week sessions), monthly billing, registration fees, sibling discounts. Auto-billing with Jackrabbit or iClassPro.

**Optional Tabs:**

1. **Pool / Lane Management** — Pool schedule by lane, temperature tracking, maintenance logs, capacity monitoring. Shared pool time management if facility has multiple programs.
2. **Evaluations** — Skill evaluations per student: checklist per swim level, instructor notes, level-up recommendations, parent notification of progress.
3. **Makeups** — Makeup class management: tokens/credits for missed classes, available makeup slots, automated rescheduling. iClassPro automates this.
4. **Retail** — Swim gear: goggles, caps, swimsuits, kickboards. In-facility or online store.
5. **Private Lessons** — Private swim lesson scheduling alongside group classes, different pricing structure.
6. **Communication** — Parent communication: skill progress updates, schedule changes, pool closures, weather cancellations.

**Industry-Specific Entities:**

| Entity | Default View | Description |
|--------|-------------|-------------|
| Classes | Calendar | Swim classes with level, lane, instructor, capacity |
| Students | Table | Swimmers with level, skills, attendance, guardian |
| Skill Progression | Table/Cards | Per-student skill tracking by swim level |
| Evaluations | Table | Skill assessments with instructor, date, results |
| Pools/Lanes | Cards | Pool schedule with lane allocation, temperature |
| Makeups | Table | Available makeup slots and student credits |
| Families | Table | Guardian contacts with students, billing |

**Pipeline Stages:**

```
Inquiry -> Water Comfort Assessment -> Level Assigned -> Session Enrolled -> Active Swimmer -> Skill Evaluation -> Level Advancement -> Next Session -> Competitive Prep (optional) -> Swim Team
```

**Unique Features:**
- Swim level skill progression (Red Cross Learn-to-Swim or proprietary levels)
- Skill evaluation and advancement tracking per student
- Small class sizes (safety: 4-6 students per instructor for beginners)
- Lane/pool assignment per class
- Makeup class token/credit system
- Water temperature tracking
- Parent viewing area management
- Seasonal session enrollment (8-10 week sessions, 3-4 per year)
- Private lesson scheduling alongside group classes
- Baby/parent-tot swim classes (unique scheduling needs)
- Pool maintenance schedule integration
- Weather-related outdoor pool cancellation management
- iClassPro: tiered pricing based on student count

**Payment Model:**
- Session-based billing ($120-250 per 8-10 week session)
- Monthly billing ($80-150/month for weekly classes)
- Registration fee ($25-50 per session)
- Sibling discount (10-20%)
- Private lesson rates ($40-80 per 30-min lesson)
- Multi-session discount (sign up for year, save 10%)
- Competitive team: monthly dues ($100-200)

**Safety/Compliance (CRITICAL):**
- Instructor-to-student ratios strictly enforced (varies by age/level)
- Lifeguard certification and CPR/First Aid for all staff
- Pool chemical safety and water quality monitoring
- Emergency action plan posted and practiced
- Medical conditions requiring attention (seizures, ear tubes)
- Dry drowning awareness protocols
- Parent must remain on premises for young children
- Diaper policy for non-toilet-trained swimmers

---

## 9. COMPETITOR COMPARISON

| Platform | Best For | Starting Price | Key Differentiator |
|----------|----------|---------------|-------------------|
| **Jackrabbit Class** | Dance, gym, swim, cheer | $49/mo | Industry-standard for class businesses, tuition automation, KPI dashboards |
| **iClassPro** | Swim, gym, cheer | Tiered by students | Skill Bank progression, makeup tokens, mobile staff portal |
| **Pike13** | Multi-type education | $118/mo | General scheduling and billing, less industry-specific |
| **brightwheel** | Daycare/childcare | Custom | Parent communication app, daily reports, check-in, billing |
| **Procare** | Large childcare centers | Custom | Enterprise childcare, state compliance, CACFP |
| **Kicksite** | Martial arts | $49-199/mo | Belt tracking, attendance for testing, all features included |
| **My Music Staff** | Music lessons | ~$14-19/mo | Private lesson scheduling, practice log, studio-specific |
| **Jackrabbit Music** | Music schools | $49/mo | Music-specific Jackrabbit (recitals, instrument rentals) |
| **TutorCruncher** | Tutoring businesses | $12/mo + 0.8% | Tutor matching, automated billing, client pipeline |
| **Drive Scout** | Driving schools | Custom | Automated zoning, vehicle/instructor/student matching |
| **Zen Planner** | Martial arts, fitness | ~$117/mo | Belt tracking + fitness, member app, retention tools |

**Red Pine Gaps/Opportunities:**
- Skill/belt/level progression is a universal pattern that should be configurable
- Parent/guardian as billing contact with student as service recipient is universal
- Sibling discounts and family billing are expected everywhere
- Attendance tracking tied to progression (belt testing, level advancement) is unique to education
- Performance/recital management is shared across dance, music, martial arts, swim
- Safety compliance (ratios, certifications, medical info) is critical for child-serving businesses
- The parent communication app (brightwheel model) could be adapted for all education businesses
- Makeup class/token management is a common need
- Most platforms charge based on student count, not features

---

## 10. TEMPLATE CONFIG RECOMMENDATIONS

### Tutoring Center / Private Tutor

```typescript
{
  templateId: 'tutoring',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Students',
    services: 'Subjects',
    appointments: 'Lessons',
    staff: 'Tutors',
    products: 'Materials'
  },
  portalConfig: {
    primaryAction: 'book_session',
    bookingMode: 'lesson_booking',
    chatProminence: 'medium',
    reviewPrompt: 'monthly',
    preferenceFields: ['subjects', 'grade_level', 'learning_goals', 'preferred_tutor', 'format']
  },
  essentialTabs: ['dashboard', 'students', 'schedule', 'tutors', 'billing', 'communication'],
  optionalTabs: ['assessments', 'subjects', 'reports', 'marketing', 'resources'],
  defaultView: { students: 'table', schedule: 'calendar', tutors: 'cards', billing: 'table' },
  pipelineStages: ['inquiry', 'assessment', 'package_selected', 'enrolled', 'active', 'progress_review', 'renewal'],
  paymentModel: 'package_or_subscription',
  bookingFlow: 'assessment_to_enrollment',
  specialFields: { guardianContact: true, siblingDiscount: true }
}
```

### Music School / Lessons

```typescript
{
  templateId: 'music_school',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Students',
    services: 'Lessons',
    appointments: 'Lessons',
    staff: 'Teachers',
    products: 'Instruments & Supplies'
  },
  portalConfig: {
    primaryAction: 'schedule_trial_lesson',
    bookingMode: 'recurring_lesson',
    chatProminence: 'medium',
    reviewPrompt: 'after_recital',
    preferenceFields: ['instrument', 'experience_level', 'schedule_preference', 'lesson_length']
  },
  essentialTabs: ['dashboard', 'students', 'schedule', 'teachers', 'billing', 'performances'],
  optionalTabs: ['practice_log', 'repertoire', 'retail', 'marketing', 'reports'],
  defaultView: { students: 'table', schedule: 'calendar', teachers: 'cards', performances: 'calendar' },
  pipelineStages: ['inquiry', 'trial_lesson', 'enrolled', 'active', 'recital', 'continuing', 'level_advancement'],
  paymentModel: 'monthly_tuition',
  bookingFlow: 'trial_to_enrollment',
  specialFields: { guardianContact: true, siblingDiscount: true, practiceTracking: true }
}
```

### Dance Studio

```typescript
{
  templateId: 'dance_studio',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Dancers',
    services: 'Classes',
    appointments: 'Classes',
    staff: 'Instructors',
    products: 'Costumes & Dancewear'
  },
  portalConfig: {
    primaryAction: 'register_for_classes',
    bookingMode: 'class_enrollment',
    chatProminence: 'medium',
    reviewPrompt: 'after_recital',
    preferenceFields: ['dance_styles', 'age_group', 'experience_level', 'schedule_preference']
  },
  essentialTabs: ['dashboard', 'classes', 'students', 'billing', 'attendance', 'performances'],
  optionalTabs: ['costumes', 'competitions', 'retail', 'marketing', 'reports', 'communication'],
  defaultView: { classes: 'calendar', students: 'table', attendance: 'table', performances: 'calendar' },
  pipelineStages: ['inquiry', 'trial_class', 'enrolled', 'active', 'recital', 'returning', 'competition_team'],
  paymentModel: 'monthly_tuition_by_classes',
  bookingFlow: 'trial_to_enrollment',
  specialFields: { guardianContact: true, siblingDiscount: true, costumeManagement: true, multiClassDiscount: true }
}
```

### Daycare / Childcare Center

```typescript
{
  templateId: 'daycare',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Children',
    services: 'Programs',
    appointments: null,
    staff: 'Teachers',
    products: null
  },
  portalConfig: {
    primaryAction: 'schedule_tour',
    bookingMode: 'enrollment',
    chatProminence: 'high',
    reviewPrompt: 'quarterly',
    preferenceFields: ['child_age', 'schedule_needed', 'start_date', 'dietary_restrictions']
  },
  essentialTabs: ['dashboard', 'children', 'attendance', 'daily_reports', 'billing', 'staff'],
  optionalTabs: ['enrollment', 'lesson_plans', 'immunizations', 'meals', 'communication', 'reports'],
  defaultView: { children: 'table', attendance: 'table', daily_reports: 'list', staff: 'table' },
  pipelineStages: ['inquiry', 'tour_scheduled', 'tour_complete', 'application', 'waitlist', 'enrolled', 'acclimation', 'active'],
  paymentModel: 'weekly_or_monthly_tuition',
  bookingFlow: 'tour_to_enrollment',
  specialFields: { guardianContact: true, siblingDiscount: true, authorizedPickup: true, medicalInfo: true, immunizations: true, staffRatios: true }
}
```

### Driving School

```typescript
{
  templateId: 'driving_school',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Students',
    services: 'Programs',
    appointments: 'Lessons',
    staff: 'Instructors',
    products: 'Study Materials'
  },
  portalConfig: {
    primaryAction: 'enroll_in_program',
    bookingMode: 'lesson_booking',
    chatProminence: 'medium',
    reviewPrompt: 'after_completion',
    preferenceFields: ['program_type', 'permit_status', 'preferred_schedule', 'pickup_location']
  },
  essentialTabs: ['dashboard', 'students', 'schedule', 'instructors', 'vehicles', 'billing'],
  optionalTabs: ['classroom', 'certificates', 'marketing', 'reports'],
  defaultView: { students: 'table', schedule: 'calendar', instructors: 'cards', vehicles: 'cards' },
  pipelineStages: ['inquiry', 'registration', 'permit_obtained', 'classroom', 'btw_lessons', 'hours_complete', 'road_test_prep', 'certificate_issued'],
  paymentModel: 'package_based',
  bookingFlow: 'registration_to_scheduling',
  specialFields: { guardianContact: true, vehicleAssignment: true, hourTracking: true }
}
```

### Language School

```typescript
{
  templateId: 'language_school',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Students',
    services: 'Courses',
    appointments: 'Classes',
    staff: 'Teachers',
    products: 'Textbooks'
  },
  portalConfig: {
    primaryAction: 'take_placement_test',
    bookingMode: 'course_enrollment',
    chatProminence: 'medium',
    reviewPrompt: 'after_course_completion',
    preferenceFields: ['target_language', 'current_level', 'goal', 'format', 'schedule']
  },
  essentialTabs: ['dashboard', 'students', 'courses', 'schedule', 'billing', 'attendance'],
  optionalTabs: ['assessments', 'materials', 'teachers', 'marketing', 'reports', 'immigration'],
  defaultView: { students: 'table', courses: 'cards', schedule: 'calendar', assessments: 'table' },
  pipelineStages: ['inquiry', 'placement_test', 'level_assigned', 'enrolled', 'active', 'assessment', 'level_up', 'completion', 'next_course'],
  paymentModel: 'course_or_monthly',
  bookingFlow: 'placement_to_enrollment',
  specialFields: { proficiencyLevel: true, cefrTracking: true }
}
```

### Martial Arts Studio

```typescript
{
  templateId: 'martial_arts',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Students',
    services: 'Programs',
    appointments: 'Classes',
    staff: 'Instructors',
    products: 'Uniforms & Gear'
  },
  portalConfig: {
    primaryAction: 'try_a_free_class',
    bookingMode: 'trial_to_membership',
    chatProminence: 'medium',
    reviewPrompt: 'after_belt_promotion',
    preferenceFields: ['martial_art', 'experience_level', 'age_group', 'schedule_preference', 'goals']
  },
  essentialTabs: ['dashboard', 'students', 'classes', 'belt_progression', 'attendance', 'billing'],
  optionalTabs: ['testing', 'retail', 'tournaments', 'marketing', 'communication', 'reports'],
  defaultView: { students: 'table', classes: 'calendar', belt_progression: 'pipeline', attendance: 'table' },
  pipelineStages: ['inquiry', 'trial', 'enrolled', 'white_belt', 'advancing', 'belt_test', 'promoted', 'advanced', 'black_belt_track', 'leadership'],
  paymentModel: 'monthly_membership',
  bookingFlow: 'trial_to_membership',
  specialFields: { guardianContact: true, siblingDiscount: true, beltTracking: true, attendanceForTesting: true }
}
```

### Swim School / Aquatics

```typescript
{
  templateId: 'swim_school',
  familyId: 'education_childcare',
  labelOverrides: {
    clients: 'Swimmers',
    services: 'Swim Levels',
    appointments: 'Classes',
    staff: 'Instructors',
    products: 'Swim Gear'
  },
  portalConfig: {
    primaryAction: 'register_for_lessons',
    bookingMode: 'session_enrollment',
    chatProminence: 'medium',
    reviewPrompt: 'after_level_advancement',
    preferenceFields: ['child_age', 'swim_experience', 'schedule_preference', 'medical_conditions']
  },
  essentialTabs: ['dashboard', 'classes', 'students', 'skill_progression', 'attendance', 'billing'],
  optionalTabs: ['pool_management', 'evaluations', 'makeups', 'retail', 'private_lessons', 'communication'],
  defaultView: { classes: 'calendar', students: 'table', skill_progression: 'table', evaluations: 'table' },
  pipelineStages: ['inquiry', 'assessment', 'level_assigned', 'enrolled', 'active', 'evaluation', 'level_up', 'next_session', 'competitive_prep'],
  paymentModel: 'session_or_monthly',
  bookingFlow: 'assessment_to_enrollment',
  specialFields: { guardianContact: true, siblingDiscount: true, skillTracking: true, makeupTokens: true, medicalInfo: true, safetyRatios: true }
}
```

---

## Sources

- Jackrabbit Class: https://www.jackrabbitclass.com/pricing/, https://www.jackrabbitclass.com/features/
- iClassPro: https://www.iclasspro.com/swim-software-features
- Pike13: https://www.pike13.com/
- brightwheel: https://mybrightwheel.com/
- Procare: https://www.procaresoftware.com/
- Kicksite: https://kicksite.com/, https://kicksite.com/martial-arts-management-software/
- My Music Staff: https://www.mymusicstaff.com/
- Jackrabbit Music: https://www.jackrabbitclass.com/music/
- TutorCruncher: https://tutorcruncher.com/
- Drive Scout: https://drivescout.com/
- DrivingSchoolSoftware.com: https://www.drivingschoolsoftware.com/
- Zen Planner: https://zenplanner.com/
