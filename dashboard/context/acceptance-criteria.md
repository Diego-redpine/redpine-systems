# Acceptance Criteria – Red Pine OS

Universal checklist for any UI change. Claude verifies these during Playwright checks.

---

## Universal Criteria (Every UI Change)

### Functionality
- [ ] Component renders without console errors
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] Data loads correctly (dummy mode or real mode based on user plan)
- [ ] CRUD operations work (create, read, update, delete)
- [ ] Search filters results correctly
- [ ] Pagination navigates pages
- [ ] View switching works (dropdown changes the view)

### Color System Compliance
- [ ] NO hardcoded colors anywhere — check the code, not just the render
- [ ] All backgrounds use `configColors.cards`, `configColors.background`, etc.
- [ ] All text uses `configColors.text`, `configColors.headings`
- [ ] All borders use `configColors.borders`
- [ ] All buttons use `configColors.buttons`
- [ ] Record colors use `record.color_primary` and `record.color_secondary`
- [ ] Dual-color gradient renders when both colors present

### Responsive
- [ ] Mobile (375px): Readable, no horizontal scroll, stacked layout
- [ ] Tablet (768px): Appropriate grid, touch-friendly
- [ ] Desktop (1280px+): Full layout, multi-column where appropriate

### States
- [ ] Empty state shows when data.length === 0
- [ ] Loading state shows while fetching
- [ ] Error state shows on API failure
- [ ] Hover states on interactive elements
- [ ] Focus states visible for keyboard navigation

### Interactions
- [ ] Click handlers fire correctly
- [ ] DetailPanel opens on record click
- [ ] Add button opens DetailPanel in create mode
- [ ] Delete confirms before removing
- [ ] Pipeline drag updates stage_id
- [ ] Calendar navigation changes date range

---

## View-Specific Criteria

### TableView
- [ ] Column headers render from entity-fields.ts
- [ ] Rows display correct data
- [ ] Sort arrows on headers, sorting works
- [ ] Color dot in first column (from record.color_primary)
- [ ] Row click opens DetailPanel
- [ ] Horizontal scroll when many columns

### CardView
- [ ] Responsive grid (1/2/3/4 columns based on width)
- [ ] Color bar at top of each card
- [ ] Dual-color gradient when both colors present
- [ ] Title, subtitle, badge, meta from entity-fields.ts
- [ ] Hover effect (subtle scale or shadow)
- [ ] Click opens DetailPanel

### PipelineView
- [ ] Columns render for each stage
- [ ] Stage header shows name + count
- [ ] Stage header colored with stage.color
- [ ] Cards stack vertically in columns
- [ ] Drag and drop between columns works
- [ ] Drop updates record.stage_id via API
- [ ] Card shape matches stage.card_style (default/rounded/arrow/minimal)
- [ ] Horizontal scroll when many stages

### CalendarView
- [ ] Day/Week/Month toggle present and working
- [ ] Time grid renders with hour markers
- [ ] Events positioned at correct times
- [ ] Event blocks show title
- [ ] Event color from record.color_primary or configColors.buttons
- [ ] Navigation (prev/next/today) updates view
- [ ] Date range change triggers data re-fetch

### ListView
- [ ] Items stack vertically
- [ ] Primary/secondary/trailing fields from entity-fields.ts
- [ ] Color dot for record.color_primary
- [ ] Checkbox renders for completable entities (todos, tasks)
- [ ] Checkbox toggle calls update API
- [ ] Bold styling when boldWhen condition met (e.g., unread messages)
- [ ] Click opens DetailPanel

---

## Component-Specific Criteria

### DetailPanel
- [ ] Slides in from right
- [ ] Edit mode: fields pre-filled, "Save Changes" button, Delete visible
- [ ] Create mode: fields empty, "Create" button, Delete hidden
- [ ] Color pickers for primary/secondary
- [ ] Dual-color preview shows gradient
- [ ] Save calls correct mutation (create or update)
- [ ] Delete confirms, then removes record
- [ ] Close button works

### ViewSwitcher
- [ ] Dropdown shows available views for this component
- [ ] Current view indicated
- [ ] Selecting new view switches display instantly
- [ ] View preference saves to config

### DataToolbar
- [ ] SearchBar renders with icon
- [ ] Search is debounced (500ms)
- [ ] FilterBar shows entity-specific filters
- [ ] Filter selection updates results
- [ ] Hidden for CalendarView

### Pagination
- [ ] Shows "X-Y of Z" count
- [ ] Previous/Next buttons with disabled states
- [ ] Page numbers with ellipsis for long lists
- [ ] Hidden when single page
- [ ] Hidden for PipelineView and CalendarView

### EmptyState
- [ ] Friendly message "No [entity] yet"
- [ ] Add button prominent
- [ ] Colors from configColors
- [ ] Clicking add opens DetailPanel in create mode

### AddRecordButton
- [ ] Shows "+ Add [entity]"
- [ ] Styled with configColors.buttons
- [ ] Click opens DetailPanel in create mode

---

## Verification Process

When Claude runs Playwright checks:

1. **Navigate** to http://localhost:3000
2. **Screenshot** the dashboard
3. **Switch** to affected component/view
4. **Screenshot** the view in various states:
   - With data
   - Empty (if testable)
   - After interaction (click, drag, search)
5. **Check console** for errors/warnings
6. **Interact** with key elements
7. **Report** results:
   - ✅ All criteria met
   - ❌ Failed: [list items with details]

---

## Quick Fail Checks

Immediate failures if ANY of these are true:

- 🚫 Hardcoded hex color in component code
- 🚫 Console error on render
- 🚫 TypeScript error
- 🚫 Broken on mobile (content overflows or unreadable)
- 🚫 No empty state (blank screen when no data)
- 🚫 Click does nothing (broken handler)

---

*Update this file as new components/features are added.*
