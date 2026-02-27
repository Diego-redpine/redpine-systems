# Blog Section Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the blog system in the website editor — add a Blog prebuilt section, make the Blog sub-tab conditional on that section existing, add a publish modal with Post Now/Schedule, and fix the wiring bug where posts vanish on refresh.

**Architecture:** The blog prebuilt section (`blogWidget`) follows the same pattern as `serviceWidget`, `galleryWidget`, etc. — registered in `FreeFormSidebar.tsx`, rendered by `SectionRenderer` in `sections/index.tsx`, backed by a new `BlogWidget.tsx` component. SiteView detects the section via localStorage scan. BlogEditor gets a publish modal with native `<input type="date">` and `<input type="time">`. BlogList is fixed to not use demo data as initial state.

**Tech Stack:** React, TypeScript, Tailwind CSS, Supabase (blog_posts table), CenterModal, lucide-react icons

---

### Task 1: Create BlogWidget Component

**Files:**
- Create: `dashboard/src/components/widgets/BlogWidget.tsx`

**Step 1: Create the BlogWidget component**

Create `dashboard/src/components/widgets/BlogWidget.tsx`. This widget shows a preview of blog posts inside the website editor canvas. Follow the same export pattern as `ReviewCarousel` (named export).

```tsx
'use client';

import React from 'react';

interface BlogWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  columns?: number;
  accentColor?: string;
  viewportWidth?: number;
  [key: string]: unknown;
}

const DEMO_BLOG_POSTS = [
  { id: '1', title: 'Welcome to Our Blog', excerpt: 'We are excited to share updates, tips, and insights with you.', date: '2 days ago', tag: 'News' },
  { id: '2', title: '5 Tips for Getting Started', excerpt: 'Make the most of your experience with these helpful tips.', date: '1 week ago', tag: 'Tips' },
  { id: '3', title: 'What\'s New This Month', excerpt: 'Check out the latest updates and improvements we\'ve made.', date: '2 weeks ago', tag: 'Updates' },
];

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const BlogWidget: React.FC<BlogWidgetProps> = ({
  inBuilder,
  heading = 'Our Blog',
  columns = 3,
  accentColor = '#1A1A1A',
  viewportWidth,
}) => {
  const isMobile = (viewportWidth || 1280) < 480;
  const cols = isMobile ? 1 : columns;

  return (
    <div style={{ padding: '48px 32px', fontFamily: FONT_STACK }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' }}>
        {heading}
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>
        Latest stories and updates
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
        {DEMO_BLOG_POSTS.map(post => (
          <div
            key={post.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              cursor: inBuilder ? 'default' : 'pointer',
            }}
          >
            {/* Cover placeholder */}
            <div style={{
              height: 140,
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={accentColor} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, backgroundColor: `${accentColor}10`, padding: '2px 8px' }}>
                  {post.tag}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{post.date}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.3 }}>
                {post.title}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add dashboard/src/components/widgets/BlogWidget.tsx
git commit -m "feat: add BlogWidget component for website editor prebuilt section"
```

---

### Task 2: Register Blog Prebuilt Section in Sidebar + Renderer

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormSidebar.tsx:176-184`
- Modify: `dashboard/src/components/editor/sections/index.tsx`

**Step 1: Add blogWidget to FreeFormSidebar.tsx**

In `FreeFormSidebar.tsx`, add the `FileText` icon import (already imported at line 22) and add a new entry to `PREBUILT_SECTION_ITEMS` array (line 176-184). Add it at the end of the array, before the closing bracket:

```typescript
// Add to PREBUILT_SECTION_ITEMS array (after the reviewCarousel entry on line 183):
  { type: 'blogWidget', label: 'Blog', icon: FileText, description: 'Blog posts feed section' },
```

**Step 2: Add blogWidget case to SectionRenderer in sections/index.tsx**

Import `BlogWidget` and add a new case before the `default:` case:

```typescript
// Add import at top (after ReviewCarousel import):
import { BlogWidget } from '@/components/widgets/BlogWidget';

// Add case before default (after reviewCarousel case, before line 172):
    case 'blogWidget':
      return (
        <div style={wrapStyle}>
          <BlogWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Blog'}
            columns={isMobile ? 1 : (props.columns as number) || 3}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
          />
        </div>
      );
```

**Step 3: Commit**

```bash
git add dashboard/src/components/editor/FreeFormSidebar.tsx dashboard/src/components/editor/sections/index.tsx
git commit -m "feat: register blogWidget prebuilt section in sidebar and renderer"
```

---

### Task 3: Make Blog Sub-tab Conditional in SiteView

**Files:**
- Modify: `dashboard/src/components/SiteView.tsx`

**Step 1: Add blog section detection function and conditional sub-tab**

Add a `hasBlogSection()` helper function before the component, and use state + effect to conditionally include the blog tab. The blog tab should re-check when the window regains focus (user returns from editor).

In `SiteView.tsx`, make these changes:

1. Remove `blog` from `BASE_SUB_TABS` (line 33-34).

2. Add a helper function before the component:

```typescript
function hasBlogSection(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('redpine-editor-autosave');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.pages?.some((p: { sections?: { type: string }[] }) =>
      p.sections?.some((s) => s.type === 'blogWidget')
    ) ?? false;
  } catch {
    return false;
  }
}
```

3. Inside the component, add state + effect:

```typescript
const [showBlog, setShowBlog] = useState(false);

useEffect(() => {
  setShowBlog(hasBlogSection());
  const onFocus = () => setShowBlog(hasBlogSection());
  window.addEventListener('focus', onFocus);
  window.addEventListener('storage', onFocus);
  return () => {
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('storage', onFocus);
  };
}, []);
```

4. Update the `SUB_TABS` computation to conditionally include blog:

```typescript
const SUB_TABS = (() => {
  let tabs = [...BASE_SUB_TABS];
  if (showBlog) {
    tabs.splice(1, 0, { id: 'blog', label: 'Blog' });
  }
  if (!showPortal) {
    tabs = tabs.filter(t => t.id !== 'portal');
  }
  return tabs;
})();
```

**Step 2: Commit**

```bash
git add dashboard/src/components/SiteView.tsx
git commit -m "feat: blog sub-tab only shows when blogWidget section exists in editor"
```

---

### Task 4: Fix BlogList Wiring (Posts Vanishing)

**Files:**
- Modify: `dashboard/src/components/blog/BlogList.tsx`

**Step 1: Fix the initialization and API handling**

Replace the current BlogList implementation to fix these bugs:
- Remove `DEMO_POSTS` as initial state — start with `[]`
- Add `isLoading` state for initial fetch
- Remove the `json.data.length > 0` guard — always use API data
- Keep demo posts only as visual examples in the empty state
- Add `'scheduled'` to the status filter tabs
- Proper error toast on create/update/delete failures

Key changes in `BlogList.tsx`:

1. Change initial state:
```typescript
const [posts, setPosts] = useState<BlogPost[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

2. Update `BlogPost` interface to support scheduled status:
```typescript
status: 'draft' | 'published' | 'scheduled';
```
Also add `scheduled_at?: string;` field.

3. Fix `fetchPosts`:
```typescript
const fetchPosts = useCallback(async () => {
  try {
    const res = await fetch('/api/data/blog_posts');
    if (res.ok) {
      const json = await res.json();
      setPosts(json.data || []);
    }
  } catch {
    // Keep empty — no fake data
  } finally {
    setIsLoading(false);
  }
}, []);
```

4. Fix `handleSave` — remove the demo fallback on API failure. Show error toast instead:
```typescript
// In the create branch:
const res = await fetch('/api/data/blog_posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(post),
});
if (res.ok) {
  fetchPosts();
  toast.success('Post created');
} else {
  toast.error('Failed to create post');
}
```

Same pattern for update and delete — on failure, show `toast.error()` instead of silently falling back to in-memory state.

5. Add loading spinner:
```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonBg, borderTopColor: 'transparent' }} />
    </div>
  );
}
```

6. Update filter tabs to include scheduled:
```typescript
const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
// Filter tabs: all, published, scheduled, draft
```

7. In the empty state, show example posts as non-interactive inspiration cards with a subtle "Examples" label, not editable data.

**Step 2: Commit**

```bash
git add dashboard/src/components/blog/BlogList.tsx
git commit -m "fix: blog posts no longer vanish — remove demo fallback, add proper error handling"
```

---

### Task 5: Add Publish Modal to BlogEditor

**Files:**
- Modify: `dashboard/src/components/blog/BlogEditor.tsx`

**Step 1: Add the publish modal**

Update `BlogEditor.tsx` with a publish modal that appears when clicking "Publish". The modal shows two options: Post Now and Schedule.

Key changes:

1. Add state:
```typescript
const [showPublishModal, setShowPublishModal] = useState(false);
const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
const [scheduleDate, setScheduleDate] = useState('');
const [scheduleTime, setScheduleTime] = useState('09:00');
```

2. Import `CenterModal`:
```typescript
import CenterModal from '@/components/ui/CenterModal';
```

3. Update `BlogPost` interface to include `scheduled`:
```typescript
status: 'draft' | 'published' | 'scheduled';
scheduled_at?: string;
```

4. Replace the existing "Create/Update Post" button with two buttons:
   - **Save Draft** (secondary style) — saves with `status: 'draft'`
   - **Publish** (primary style) — opens the publish modal

5. The publish modal uses `CenterModal` with `title="Publish Post"`. Inside:

```tsx
<CenterModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish Post" maxWidth="max-w-md">
  <div className="space-y-4">
    {/* Post Now card */}
    <button
      onClick={() => setPublishMode('now')}
      className="w-full text-left p-4 border-2 transition-colors"
      style={{
        borderColor: publishMode === 'now' ? buttonBg : borderColor,
        backgroundColor: publishMode === 'now' ? `${buttonBg}08` : 'transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${buttonBg}10` }}>
          <svg className="w-5 h-5" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: textMain }}>Post Now</p>
          <p className="text-xs" style={{ color: textMuted }}>Publish immediately</p>
        </div>
      </div>
    </button>

    {/* Schedule card */}
    <button
      onClick={() => setPublishMode('schedule')}
      className="w-full text-left p-4 border-2 transition-colors"
      style={{
        borderColor: publishMode === 'schedule' ? buttonBg : borderColor,
        backgroundColor: publishMode === 'schedule' ? `${buttonBg}08` : 'transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${buttonBg}10` }}>
          <svg className="w-5 h-5" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: textMain }}>Schedule</p>
          <p className="text-xs" style={{ color: textMuted }}>Pick a date and time</p>
        </div>
      </div>
    </button>

    {/* Schedule date/time fields (shown only when schedule selected) */}
    {publishMode === 'schedule' && (
      <div className="space-y-3 pt-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>Date</label>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
            style={{ borderColor, color: textMain }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>Time</label>
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
            style={{ borderColor, color: textMain }}
          />
        </div>
      </div>
    )}

    {/* Confirm button */}
    <button
      onClick={handlePublish}
      disabled={publishMode === 'schedule' && !scheduleDate}
      className="w-full px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
      style={{ backgroundColor: buttonBg, color: buttonText }}
    >
      {publishMode === 'now' ? 'Publish Now' : 'Schedule Post'}
    </button>
  </div>
</CenterModal>
```

6. Add `handlePublish` function:
```typescript
const handlePublish = () => {
  if (!title.trim()) return;
  const payload: Partial<BlogPost> = {
    title: title.trim(),
    slug: slug || slugify(title),
    excerpt: excerpt.trim(),
    content,
    tags,
  };
  if (publishMode === 'now') {
    payload.status = 'published';
    payload.published_at = new Date().toISOString();
  } else {
    payload.status = 'scheduled';
    payload.scheduled_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
  }
  onSave(payload);
  setShowPublishModal(false);
};
```

7. Update the header bar buttons:
```tsx
<div className="flex items-center gap-2">
  <button
    onClick={handleSaveDraft}
    className="px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-80"
    style={{ borderColor, color: textMain }}
  >
    Save Draft
  </button>
  <button
    onClick={() => setShowPublishModal(true)}
    disabled={!title.trim()}
    className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
    style={{ backgroundColor: buttonBg, color: buttonText }}
  >
    {post ? 'Update & Publish' : 'Publish'}
  </button>
</div>
```

Where `handleSaveDraft`:
```typescript
const handleSaveDraft = () => {
  if (!title.trim()) return;
  onSave({
    title: title.trim(),
    slug: slug || slugify(title),
    excerpt: excerpt.trim(),
    content,
    status: 'draft',
    tags,
  });
};
```

**Step 2: Commit**

```bash
git add dashboard/src/components/blog/BlogEditor.tsx
git commit -m "feat: add publish modal with Post Now and Schedule options"
```

---

### Task 6: Add scheduled_at to DB Migration + API

**Files:**
- Modify: `supabase/LATEST_MIGRATIONS.sql`
- Modify: `dashboard/src/app/api/data/blog_posts/route.ts`

**Step 1: Add migration**

Append to `supabase/LATEST_MIGRATIONS.sql`:

```sql
-- Migration 044: Blog scheduling support
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
```

**Step 2: Run migration against Supabase**

```bash
cd /Users/Diego21/redpine-os && npx supabase db push
```

Or if using direct SQL, run the ALTER TABLE statement against the Supabase dashboard.

**Step 3: Update API to pass through scheduled_at**

The API route at `dashboard/src/app/api/data/blog_posts/route.ts` already passes through all fields in the PUT handler (`const { id, ...updates } = body`), so `scheduled_at` will be accepted automatically. No API changes needed — the `createCrudHandlers` for POST also passes through all fields.

**Step 4: Commit**

```bash
git add supabase/LATEST_MIGRATIONS.sql
git commit -m "feat: add scheduled_at column to blog_posts table (migration 044)"
```

---

### Task 7: Update BlogList for Scheduled Status Display

**Files:**
- Modify: `dashboard/src/components/blog/BlogList.tsx`

**Step 1: Update status badge display**

In the blog post cards, add support for the `scheduled` status badge:

```typescript
// In the status badge section of each post card:
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'published': return { bg: '#10B98120', color: '#10B981', label: 'Published' };
    case 'scheduled': return { bg: '#3B82F620', color: '#3B82F6', label: 'Scheduled' };
    default: return { bg: '#F59E0B20', color: '#F59E0B', label: 'Draft' };
  }
};
```

Add scheduled date display below the badge when status is 'scheduled':
```tsx
{post.status === 'scheduled' && post.scheduled_at && (
  <span className="text-xs" style={{ color: '#3B82F6' }}>
    {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
  </span>
)}
```

**Step 2: Commit**

```bash
git add dashboard/src/components/blog/BlogList.tsx
git commit -m "feat: display scheduled status badge and date on blog post cards"
```

---

### Task 8: Verify Everything Works End-to-End

**Step 1: Start the dev server**

```bash
cd /Users/Diego21/redpine-os/dashboard && npm run dev
```

**Step 2: Verify in browser**

1. Open http://localhost:3000, navigate to Website tab
2. Confirm Blog sub-tab is NOT visible (no blogWidget section yet)
3. Click into the page editor (Pages → edit any page)
4. In the sidebar, find "Blog" under prebuilt sections
5. Add the Blog section — verify it renders the BlogWidget with 3 demo post cards
6. Save and close the editor
7. Return to Website tab — Blog sub-tab should now be visible
8. Click Blog sub-tab — verify BlogList shows (empty state if no posts, loading spinner first)
9. Create a new post — verify it persists after refresh
10. Test the Publish button — verify the modal appears with Post Now and Schedule options
11. Test Schedule — pick a date and time, confirm the post shows as "Scheduled" with the date

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: verify blog section end-to-end wiring"
```
