# TERMINAL 2 — Wiring Fixes + Website Tab + Blog
## Scope: Connect orphaned components, fix navigation, add Blog sub-tab

**YOU OWN THESE FILES (modify only these):**
- `dashboard/src/components/MarketplaceView.tsx` (MODIFY — wire freelancers, remove templates sub-tab)
- `dashboard/src/components/SiteView.tsx` (MODIFY — add Blog + Templates sub-tabs)
- `dashboard/src/components/DashboardContent.tsx` (MODIFY — wire Dashboard tab to Goal Forest)
- `dashboard/src/components/blog/BlogList.tsx` (CREATE)
- `dashboard/src/components/blog/BlogEditor.tsx` (CREATE)
- `dashboard/src/components/blog/BlogPost.tsx` (CREATE)
- `dashboard/src/app/site/[subdomain]/blog/page.tsx` (CREATE — public blog page)
- `dashboard/src/app/site/[subdomain]/blog/[slug]/page.tsx` (CREATE — public blog post)

**DO NOT TOUCH:** Template files, API routes (unless creating blog API), portal, reviews, communications, onboarding, editor core files.

---

## TASK 1: Wire Orphaned Components (P0 — do this FIRST)

### 1a. MarketplaceView.tsx
**Current state:** 3 sub-tabs (agents, templates, freelancers). Templates and Freelancers show `ComingSoonCard`.

**Changes:**
- REMOVE the `'templates'` sub-tab entirely (templates move to Website tab per Sticky Note #5)
- KEEP `'agents'` sub-tab (already works with `AgentMarketplace`)
- REPLACE `ComingSoonCard` for `'freelancers'` with actual `<FreelancerMarketplace />` import
- Result: 2 sub-tabs only — AI Agents, Freelancers

```tsx
// Import at top:
import FreelancerMarketplace from './FreelancerMarketplace';

// Sub-tabs should be:
const subTabs = [
  { id: 'agents', label: 'AI Agents' },
  { id: 'freelancers', label: 'Freelancers' },
];

// Render:
{activeSubTab === 'agents' && <AgentMarketplace colors={colors} />}
{activeSubTab === 'freelancers' && <FreelancerMarketplace colors={colors} />}
```

### 1b. SiteView.tsx — Add Templates + Blog sub-tabs
**Current sub-tabs:** Pages, Gallery, Portal, Analytics, SEO, Settings

**Add these sub-tabs (per Sticky Note #5):**
- `{ id: 'blog', label: 'Blog' }` — after Gallery
- `{ id: 'templates', label: 'Templates' }` — after Blog

**Render:**
```tsx
import TemplateMarketplace from '../TemplateMarketplace';
// Blog components imported from ./blog/

{activeSubTab === 'blog' && <BlogList colors={colors} />}
{activeSubTab === 'templates' && <TemplateMarketplace colors={colors} />}
```

**New sub-tab order:** Pages, Gallery, Blog, Templates, Portal, Analytics, SEO, Settings

### 1c. DashboardContent.tsx — Wire Dashboard Tab
**Current state:** Dashboard tab renders a "coming soon" placeholder.
**`PineTreeWidget.tsx`** (328 lines) exists as a floating button — it has the pixel art tree, growth stages, milestones.

**Changes:**
- When `isDashboardTab` is true, render `PineTreeWidget` as the main view (NOT as floating button)
- Add `StatCards` below it for quick business stats
- Add `ActivityFeedView` below stats

The Dashboard tab should show:
1. **PineTreeWidget** (Goal Forest — full width, not floating)
2. **Quick stats row** (StatCards with key metrics)
3. **ActivityFeedView** (recent activity)

Read `PineTreeWidget.tsx` to understand its props and render it in the dashboard area instead of as a fixed-position floating element.

NOTE: The full pixel art Goal Forest scene (blue sky, mountains, pine forest) is a FUTURE build. For now, just wire the existing PineTreeWidget into the Dashboard tab instead of the placeholder. That's the quick win.

---

## TASK 2: Blog System (New Feature)

### Why
Sticky Note #5 says: "Blog: Sub-tab in Website tab"

### Blog Components to Create

**BlogList.tsx** — List of blog posts with:
- Grid of post cards (title, excerpt, date, status: draft/published)
- "New Post" button
- Filter by status (All, Published, Drafts)
- Search
- Uses `CenterModal` pattern for the editor

**BlogEditor.tsx** — Blog post editor with:
- Title field
- Rich text editor (reuse `RichTextEditor` from `components/editors/`)
- Featured image upload
- SEO fields (meta title, meta description, slug)
- Category/tags
- Publish/Draft toggle
- Save button

**BlogPost.tsx** — Single blog post view (for the public website):
- Title, author, date
- Featured image
- Content body (rendered from rich text)
- Share buttons
- "Back to Blog" link

### Blog Database
Create a new API route at `dashboard/src/app/api/data/blog_posts/route.ts` using the standard CRUD pattern from `crud.ts`.

The `blog_posts` table should be added. For now, you can use the existing `documents` table with a `type: 'blog_post'` field, OR create a migration for a dedicated `blog_posts` table. Prefer using documents if it avoids a new migration.

If you need a migration, add to `supabase/LATEST_MIGRATIONS.sql` as migration 041:
```sql
-- 041: Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT DEFAULT '',
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_posts_user ON blog_posts FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_blog_posts_user ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(user_id, slug);
```

### Public Blog Pages
- `/site/[subdomain]/blog/page.tsx` — Lists published posts for that business
- `/site/[subdomain]/blog/[slug]/page.tsx` — Single post view

These follow the same pattern as the existing `/site/[subdomain]/page.tsx` — fetch config by subdomain, render with business colors.

### Blog in PublicWebsiteRenderer
Add a "Blog" link to the website navigation when the business has blog posts. Read `PublicWebsiteRenderer.tsx` to understand the nav structure.

---

## DESIGN RULES (from CLAUDE.md)
- Colors from `config.colors` — NEVER hardcode
- Use `CustomSelect` for all dropdowns with `buttonColor` prop
- Use `CenterModal` for all modals
- Rounded corners: `rounded-xl` minimum on cards
- Generous padding: `p-6` on cards
- Status badges as pills: `px-3 py-1 rounded-full`

## WHEN DONE
Update `memory/MEMORY.md`:
- Add blog system to "What's Built"
- Note that TemplateMarketplace is now in Website tab
- Note that FreelancerMarketplace is now wired in Marketplace tab
- Note that Dashboard tab now shows PineTreeWidget instead of placeholder
