# Blog Section Fix — Design Doc

**Date:** 2026-02-26
**Status:** Approved

---

## Problem Statement

The blog system in the website editor has three issues:

1. **No prebuilt section**: There is no "Blog" prebuilt section in the website editor sidebar. Users cannot add a blog feed to their website pages.
2. **Blog sub-tab always visible**: The Blog sub-tab in SiteView shows regardless of whether the user has a blog section on their site. It should only appear after adding the Blog prebuilt section.
3. **Posts get deleted**: Blog posts created in the UI vanish on page refresh because the create flow falls back to in-memory state when the API fails, and demo posts mask the empty state.
4. **No publish flow**: The editor has a simple draft/published toggle. It needs a proper publish modal with Post Now and Schedule options.

---

## Design

### 1. Blog Prebuilt Section (`blogWidget`)

Add `blogWidget` to `PREBUILT_SECTION_ITEMS` in `FreeFormSidebar.tsx` alongside existing prebuilt sections (Service Booking, Gallery, etc.).

**Section renderer**: New `blogWidget` case in `SectionRenderer` (`sections/index.tsx`) that renders a `BlogWidget` component showing a preview of the latest blog posts as cards inside the editor canvas.

**BlogWidget component** (`src/components/widgets/BlogWidget.tsx`): Shows 3 sample blog post cards in a responsive grid. In-builder mode shows placeholder cards. Accepts `heading`, `columns`, `accentColor` props matching the pattern of other widgets.

### 2. Blog Sub-tab Conditional Visibility

In `SiteView.tsx`, the Blog sub-tab is hidden by default. On mount, scan `localStorage` key `redpine-editor-autosave` for any section with `type === 'blogWidget'` across all pages. If found, include the Blog sub-tab in `SUB_TABS`.

**Detection function:**
```typescript
function hasBlogSection(): boolean {
  try {
    const raw = localStorage.getItem('redpine-editor-autosave');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.pages?.some((p: any) =>
      p.sections?.some((s: any) => s.type === 'blogWidget')
    );
  } catch { return false; }
}
```

Re-check on `storage` event and when returning from the editor (via a `focus` event or callback).

### 3. Publish Flow Modal

Replace the simple "Create/Update Post" button in `BlogEditor.tsx` with a publish modal.

**Flow:**
- User clicks **Publish** button → `CenterModal` opens
- Modal shows two options as clickable cards:
  - **Post Now**: Publishes immediately. Sets `status: 'published'`, `published_at: new Date().toISOString()`
  - **Schedule**: Expands to show date and time inputs. Sets `status: 'scheduled'`, `scheduled_at: selectedDateTime`
- Date input: `<input type="date">` (native HTML, no library)
- Time input: `<input type="time">` (native HTML, no library)
- Confirm button submits the post with the chosen publish method

**Save as Draft** remains a separate action (existing behavior, no modal needed).

### 4. Blog Wiring Fix

**Root cause:** `BlogList` initializes state with `DEMO_POSTS`. When the API returns empty data (authenticated user, no posts), the `json.data.length > 0` guard keeps demo data visible. Creating a post via a failed API call creates an in-memory post that vanishes on refresh.

**Fix:**
- Initialize `posts` state as empty array `[]`
- Move `DEMO_POSTS` to empty state visual (show as examples/inspiration, not editable data)
- Remove the `json.data.length > 0` guard — always use API data when authenticated
- Add clear error toasts when create/update/delete fails
- Track loading state to show spinner during initial fetch
- Add `scheduled` status support alongside `draft` and `published`

### 5. Database Migration

Add `scheduled_at` column to `blog_posts` table:

```sql
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
```

Update the blog_posts API to accept and return `scheduled_at` field.

---

## Files Changed

| File | Change |
|------|--------|
| `dashboard/src/components/editor/FreeFormSidebar.tsx` | Add `blogWidget` to `PREBUILT_SECTION_ITEMS` |
| `dashboard/src/components/editor/sections/index.tsx` | Add `blogWidget` case to `SectionRenderer` |
| `dashboard/src/components/widgets/BlogWidget.tsx` | **NEW** — Blog preview widget for editor canvas |
| `dashboard/src/components/SiteView.tsx` | Conditional Blog sub-tab via localStorage scan |
| `dashboard/src/components/blog/BlogEditor.tsx` | Add publish modal (Post Now / Schedule) with native date/time inputs |
| `dashboard/src/components/blog/BlogList.tsx` | Fix wiring: empty initial state, proper error handling, loading state, scheduled status |
| `dashboard/src/app/api/data/blog_posts/route.ts` | Accept `scheduled_at` field |
| `supabase/LATEST_MIGRATIONS.sql` | Add `scheduled_at` column to `blog_posts` |

---

## Not In Scope

- Rich text editor for blog content (existing "coming soon" note stays)
- Blog post public rendering changes (`BlogPost.tsx` — unchanged)
- Blog SEO/meta tag improvements
- Scheduled post auto-publishing cron job (future work — for now, scheduled posts are marked and displayed but actual publishing at the scheduled time requires a backend cron)
