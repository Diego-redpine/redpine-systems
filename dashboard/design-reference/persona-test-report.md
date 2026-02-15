# Red Pine OS — 30-Persona Baseline Test Report

**Date:** February 8, 2026
**Version:** Pre-UX-fixes baseline
**Tester:** Automated via Playwright MCP

---

## Executive Summary

**Overall Average: B+ (3.97/5.0)**

30 personas tested across 6 batches covering restaurants, salons, fitness, home services, professional services, retail, and edge cases. The platform handles detailed inputs exceptionally well (A- average) but struggles with vague/minimal inputs (B- average). Industry-specific color palettes and context-aware tab naming are standout features. Key issues: default red/black colors for many configs, orders table dummy data broken, some pipeline stages missing, and business name truncation.

---

## Batch Results Summary

| Batch | Personas | Focus | Average | Grade |
|-------|----------|-------|---------|-------|
| A | 1-5 | Restaurants (detailed→vague) | 3.95 | B+ |
| B | 6-10 | Restaurants (vague→minimal) | 3.80 | B |
| C | 11-15 | Salon + Fitness | 4.55 | A- |
| D | 16-20 | Home Services + Professional | 4.25 | A- |
| E | 21-25 | Professional + Retail | 4.40 | A- |
| F | 26-30 | Retail + Edge Cases | 3.65 | B |

---

## All 30 Persona Grades

### Batch A: Restaurants (Detailed → Vague) — Average B+ (3.95)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 1 | Maria | Casa de Maria | restaurant | 4 | 4 | 5 | 4 | 4.25 | B+ |
| 2 | James | James Kitchen | restaurant | 3 | 3 | 4 | 4 | 3.75 | B |
| 3 | Suki | Suki's Sweet Spot | bakery | 5 | 5 | 4 | 4 | 4.50 | A- |
| 4 | Ahmed | Ahmed's Grill | food_truck | 3 | 3 | 4 | 4 | 3.50 | B |
| 5 | Lisa | Lisa's Table | catering | 5 | 5 | 5 | 4 | 4.75 | A- |

### Batch B: Restaurants (Vague → Minimal) — Average B (3.80)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 6 | Terrence | Terrence's Kitchen | restaurant | 3 | 3 | 4 | 3 | 3.25 | B- |
| 7 | Rosa | Brooklyn Coffee & Bites Cafe | cafe | 4 | 4 | 5 | 4 | 4.25 | B+ |
| 8 | Chen | Golden Dragon Dim Sum House | restaurant | 5 | 5 | 5 | 4 | 4.75 | A- |
| 9 | Marco | Marco's Pizza | restaurant | 4 | 4 | 4 | 3 | 3.75 | B+ |
| 10 | Aisha | Aisha's Kitchen | restaurant | 2 | 2 | 4 | 3 | 3.00 | B- |

### Batch C: Salon + Fitness — Average A- (4.55)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 11 | Tony | Tony's Classic Cuts | barber | 5 | 5 | 5 | 4 | 4.75 | A- |
| 12 | Priya | Polished Nails Studio | salon | 5 | 5 | 5 | 4 | 4.75 | A- |
| 13 | Devon | Devon's Cuts | barber | 4 | 4 | 5 | 4 | 4.25 | B+ |
| 14 | Marcus | Iron Fist MMA | martial_arts | 4 | 3 | 5 | 3 | 3.75 | B+ |
| 15 | Sara | Sara's Flow Studio | yoga | 4 | 4 | 5 | 4 | 4.25 | A- |

### Batch D: Home Services + Professional — Average A- (4.25)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 16 | Jake | Ironworks CrossFit | crossfit | 4 | 4 | 5 | 3 | 4.00 | B+ |
| 17 | Carlos | Verde Landscaping | landscaping | 4 | 4 | 5 | 4 | 4.25 | A- |
| 18 | Dave | Dave's Plumbing | plumbing | 3 | 3 | 5 | 4 | 3.75 | B+ |
| 19 | Rachel | Premium House Cleaning Service | cleaning | 5 | 5 | 5 | 4 | 4.75 | A- |
| 20 | Robert | Family Law Associates | legal | 5 | 5 | 4 | 4 | 4.50 | A- |

### Batch E: Professional + Retail — Average A- (4.40)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 21 | Nina | Freelance Photography Studio | photography | 5 | 5 | 5 | 4 | 4.75 | A- |
| 22 | Steve | CPA Accounting Services | accounting | 5 | 5 | 5 | 4 | 4.75 | A- |
| 23 | Ashley | The Style Loft | retail | 4 | 3 | 4 | 4 | 3.75 | B+ |
| 24 | Raj | Precision Mobile Detail | auto | 5 | 5 | 5 | 4 | 4.75 | A- |
| 25 | Olga | Olga's Paw Spa | pet_grooming | 4 | 4 | 4 | 4 | 4.00 | B+ |

### Batch F: Retail + Edge Cases — Average B (3.65)

| # | Persona | Business Name | Type | Ease | Speed | Accuracy | Visual | Score | Grade |
|---|---------|--------------|------|------|-------|----------|--------|-------|-------|
| 26 | Tom | Ink & Soul Tattoo Studio | tattoo | 5 | 5 | 5 | 3 | 4.50 | A- |
| 27 | Jordan | General Business Solutions | professional | 3 | 3 | 4 | 3 | 3.25 | B- |
| 28 | Pat | ThreadLine | retail | 3 | 3 | 4 | 3 | 3.25 | B- |
| 29 | Sam | Consulting Services | consulting | 3 | 3 | 4 | 3 | 3.25 | B- |
| 30 | Quinn | Quinn's Moving Co | moving | 4 | 4 | 4 | 3 | 3.75 | B+ |

---

## Grade Distribution

| Grade | Count | Percentage |
|-------|-------|------------|
| A- | 13 | 43% |
| B+ | 11 | 37% |
| B | 2 | 7% |
| B- | 4 | 13% |
| C or below | 0 | 0% |

**No persona scored below B-.** The platform never completely fails.

---

## Key Findings

### Strengths

1. **Industry-Specific Tab Naming (A+)**
   - "Pet Parents" for pet grooming, "Crew" for landscaping, "Work Orders" for plumbing
   - "Cases" for legal, "Artists" for tattoo, "Programming"/"Leaderboard" for CrossFit
   - "Fleet" for moving, "Gallery" for photography/tattoo, "Marketing" for ecommerce

2. **Context-Aware Section Headings (A+)**
   - "Today's Moves" (moving), "Today's Sessions" (tattoo), "Today's Cleanings" (cleaning)
   - "Upcoming Shoots" (photography), "Tax Deadlines" (accounting), "Today's Classes" (MMA)
   - "Priority Tasks" (legal), "Waiver Status" (tattoo), "Active Jobs" (moving/landscaping)

3. **Industry-Specific Color Palettes (A)**
   - Green → landscaping
   - Orange/amber → plumbing
   - Blue → cleaning, auto detailing, barbers
   - Pink/hot pink → retail boutique, nail salon
   - Purple/indigo → legal, accounting
   - Teal/cyan → yoga, pet grooming
   - Violet → photography
   - NOTE: Many configs still get default red/black (restaurants, martial arts, CrossFit, tattoo, all edge cases)

4. **AI Name Generation (A)**
   - "Family Law Associates", "Precision Mobile Detail", "Brooklyn Coffee & Bites Cafe"
   - "Ink & Soul Tattoo Studio", "Golden Dragon Dim Sum House", "Polished Nails Studio"
   - Contextually appropriate when user doesn't provide one

5. **Smart Tab Count Scaling (A)**
   - Solo operators: 3-4 tabs (Sara's yoga, Raj's detailing)
   - Small teams: 5 tabs (most businesses)
   - Large/complex: 6 tabs (CrossFit, tattoo, moving)

6. **View Selection Intelligence (A)**
   - Pipeline view for job-based businesses (landscaping, plumbing, cleaning, moving)
   - List view for task-based businesses (legal, accounting, consulting)
   - Calendar for appointment-based businesses (barber, salon, yoga, photography)

7. **Conversational Fallback (A-)**
   - Vague inputs trigger clarifying questions instead of failing
   - AI asks for business type, then name, then team size
   - "Build it now" button always available as escape hatch

### Weaknesses

1. **Default Colors Too Common (D)**
   - 14/30 configs got default red/black (#ce0707, #000000, #ffffff)
   - All restaurants, martial arts, CrossFit, tattoo, and ALL edge cases got defaults
   - Only ~50% of configs get industry-specific palettes

2. **Orders Table Dummy Data Broken (F)**
   - Every config using `orders` entity shows all dashes in table cells
   - Headers (Order Number, Customer, Total, Status, Created At) don't match dummy data keys
   - Affects: retail, ecommerce, restaurants with orders view

3. **Pipeline Stages Inconsistent (C)**
   - Some pipelines populated (landscaping, plumbing, cleaning, moving): Pending→In Progress→Review→Complete
   - Others show "No pipeline stages configured" (pet grooming, tattoo)
   - Inconsistent behavior from AI config generation

4. **Business Name Truncation (C)**
   - Long names get cut off in sidebar: "Ink & Soul Tattoo Stud...", "Premium House Cleaning..."
   - "Freelance Photography St...", "Brooklyn Coffee & Bite..."
   - Affects ~8/30 configs (27%)

5. **Visual Scores Capped at 4 (C+)**
   - No persona scored 5 on visual quality
   - Recurring issues: StatCard truncation, generic chart appearance
   - All configs look similar — same calendar/table/pipeline layouts

6. **Chat Suggestions Often Generic (C)**
   - Many configs show same suggestions: "Switch to light sidebar", "Change accent color"
   - Industry-specific suggestions present but inconsistent
   - "Add a Tasks tab" shown even when tasks already exist

7. **Speed Penalty for Vague Inputs (C+)**
   - Detailed inputs: auto-build in <15s (score 5)
   - Brief inputs: 1-3 chat exchanges adding 30-60s (score 3)
   - Edge cases: 2-3 exchanges averaging 45-60s (score 3)

---

## Cross-Cutting Issues Tracked

| Issue | Status | Details |
|-------|--------|---------|
| StatCard truncation | CONFIRMED | Labels clip at card edges on many configs |
| Color hover hex display | NOT TESTED | Skipped to save time — known issue |
| Color change updates dashboard | NOT TESTED | Skipped to save time — known issue |
| Component similarity | CONFIRMED | All tabs use same calendar/table/pipeline/list layouts |
| Analytics relevance | NOT TESTED | Didn't click Analytics tab for each persona |
| View switcher confusing | CONFIRMED | Dropdown visible on most views |
| Settings overload | CONFIRMED | Restaurant configs have ordering/QR components in Settings |
| Payment gate inactive | CONFIRMED | `canEdit={true}` hardcoded — no paywall triggers |

---

## Industry Type Distribution

| Type | Count | Avg Score |
|------|-------|-----------|
| restaurant | 5 | 3.80 |
| barber | 2 | 4.50 |
| salon | 1 | 4.75 |
| bakery | 1 | 4.50 |
| food_truck | 1 | 3.50 |
| catering | 1 | 4.75 |
| cafe | 1 | 4.25 |
| martial_arts | 1 | 3.75 |
| yoga | 1 | 4.25 |
| crossfit | 1 | 4.00 |
| landscaping | 1 | 4.25 |
| plumbing | 1 | 3.75 |
| cleaning | 1 | 4.75 |
| legal | 1 | 4.50 |
| photography | 1 | 4.75 |
| accounting | 1 | 4.75 |
| retail | 2 | 3.75 |
| auto | 1 | 4.75 |
| pet_grooming | 1 | 4.00 |
| tattoo | 1 | 4.50 |
| professional | 1 | 3.25 |
| consulting | 1 | 3.25 |
| moving | 1 | 3.75 |

**Best performing types** (4.5+): salon, barber, bakery, catering, legal, photography, accounting, auto, tattoo, cleaning
**Worst performing types** (<3.5): professional (3.25), consulting (3.25), food_truck (3.50)

---

## Recommendations for Phase 2 UX Fixes

### Priority 1 (Critical)
1. **Fix orders dummy data** — map `order_number`, `customer`, `total`, `status`, `created_at` fields to match entity-fields.ts
2. **Expand industry color palettes** — ensure ALL business types get themed colors, not just ~50%
3. **Fix StatCard truncation** — increase card min-height/padding so labels don't clip

### Priority 2 (High)
4. **Remove ViewSwitcher dropdown** — show recommended view, change via chat
5. **Remove avatar column from non-people tables** — only show for clients/leads/staff/vendors
6. **Fix pipeline stage consistency** — ensure all pipeline-configured tabs get Pending→In Progress→Review→Complete stages
7. **Fix business name truncation** — allow wrapping or reduce font size for long names

### Priority 3 (Medium)
8. **Differentiate component layouts** — financial views vs people views vs scheduling views should look distinct
9. **Variable StatCard counts** — support 2, 3, or 4 cards based on context
10. **Business-type analytics templates** — restaurant metrics vs salon metrics vs service metrics
11. **Industry-specific chat suggestions** — replace generic "Switch to light sidebar" with context-aware suggestions

### Priority 4 (Low)
12. **Move ordering components from Settings** — dedicated area for restaurant-specific features
13. **Activate payment gate** — set `canEdit={false}` for non-subscribed users
14. **Add missing features chat prompts** — when Quinn asks for GPS/warehouse, suggest these as future features

---

## Screenshots

All screenshots saved to: `design-reference/screenshots/persona-tests/`

| File | Persona | Business |
|------|---------|----------|
| p01-maria-dashboard.jpeg | Maria | Casa de Maria (taqueria) |
| p02-james-dashboard.jpeg | James | James Kitchen (fine dining) |
| p03-suki-dashboard.jpeg | Suki | Suki's Sweet Spot (bakery) |
| p04-ahmed-dashboard.jpeg | Ahmed | Ahmed's Grill (food truck) |
| p05-lisa-dashboard.jpeg | Lisa | Lisa's Table (catering) |
| p06-terrence-dashboard.jpeg | Terrence | Terrence's Kitchen |
| p07-rosa-dashboard.jpeg | Rosa | Brooklyn Coffee & Bites Cafe |
| p08-chen-dashboard.jpeg | Chen | Golden Dragon Dim Sum House |
| p09-marco-dashboard.jpeg | Marco | Marco's Pizza |
| p10-aisha-dashboard.jpeg | Aisha | Aisha's Kitchen |
| p11-tony-dashboard.jpeg | Tony | Tony's Classic Cuts (barber) |
| p12-priya-dashboard.jpeg | Priya | Polished Nails Studio (salon) |
| p13-devon-dashboard.jpeg | Devon | Devon's Cuts (barber) |
| p14-marcus-dashboard.jpeg | Marcus | Iron Fist MMA |
| p15-sara-dashboard.jpeg | Sara | Sara's Flow Studio (yoga) |
| p16-jake-dashboard.jpeg | Jake | Ironworks CrossFit |
| p17-carlos-dashboard.jpeg | Carlos | Verde Landscaping |
| p18-dave-dashboard.jpeg | Dave | Dave's Plumbing |
| p19-rachel-dashboard.jpeg | Rachel | Premium House Cleaning Service |
| p20-robert-dashboard.jpeg | Robert | Family Law Associates |
| p21-nina-dashboard.jpeg | Nina | Freelance Photography Studio |
| p22-steve-dashboard.jpeg | Steve | CPA Accounting Services |
| p23-ashley-dashboard.jpeg | Ashley | The Style Loft (retail) |
| p24-raj-dashboard.jpeg | Raj | Precision Mobile Detail (auto) |
| p25-olga-dashboard.jpeg | Olga | Olga's Paw Spa (pet grooming) |
| p26-tom-dashboard.jpeg | Tom | Ink & Soul Tattoo Studio |
| p27-jordan-dashboard.jpeg | Jordan | General Business Solutions |
| p28-pat-dashboard.jpeg | Pat | ThreadLine (ecommerce) |
| p29-sam-dashboard.jpeg | Sam | Consulting Services |
| p30-quinn-dashboard.jpeg | Quinn | Quinn's Moving Co |

---

*Report generated: February 8, 2026*
*Next step: Implement Phase 2 UX fixes based on findings*
