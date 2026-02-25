# Unified Inbox Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Communications tab with a unified inbox that shows conversations from all channels (SMS, Instagram, WhatsApp, Facebook, TikTok, email, live chat) with channel-colored message bubbles and canned responses.

**Architecture:** CommunicationsTab wrapper (follows ReviewsTab pattern) with two subtabs — COO (placeholder) and Messages (UnifiedInbox). UnifiedInbox is a 3-panel layout: conversation list, message thread, and a slide-out contact drawer. All colors from `config.colors`. Demo data until real integrations.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, Supabase (PostgreSQL), existing `chat_*` tables.

---

### Task 1: Database Migration — Add `channel` Column

**Files:**
- Modify: `supabase/LATEST_MIGRATIONS.sql` (append at end)

**Context:** The `chat_conversations` table (migration 030, ~line 458 of LATEST_MIGRATIONS.sql) needs a `channel` column to track message source. Current schema has `status`, `visitor_name`, `metadata`, etc. but no explicit channel tracking.

**Step 1: Add migration SQL**

Append to the end of `supabase/LATEST_MIGRATIONS.sql`:

```sql
-- ════════════════════════════════════════════════════════════════
-- Migration 038: Add channel column to chat_conversations
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'live_chat';

COMMENT ON COLUMN public.chat_conversations.channel IS 'Message source: live_chat, sms, instagram, facebook, tiktok, whatsapp, email';

-- Index for filtering by channel
CREATE INDEX IF NOT EXISTS idx_chat_conversations_channel ON public.chat_conversations(channel);

-- Update existing rows to have explicit channel
UPDATE public.chat_conversations SET channel = 'live_chat' WHERE channel IS NULL;
```

**Step 2: Apply to Supabase**

Apply the migration via the Supabase MCP tool `apply_migration` with project ID from Supabase project list. Migration name: `add_chat_channel_column`.

**Step 3: Commit**

```bash
git add supabase/LATEST_MIGRATIONS.sql
git commit -m "feat: Add channel column to chat_conversations"
```

---

### Task 2: Channel Color Constants

**Files:**
- Create: `dashboard/src/lib/channel-colors.ts`

**Context:** Channel colors are used across multiple components (conversation list, message bubbles, filter chips). Centralize them in one file.

**Step 1: Create channel color constants file**

Create `dashboard/src/lib/channel-colors.ts`:

```typescript
export type MessageChannel =
  | 'live_chat'
  | 'sms'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'email';

export interface ChannelConfig {
  label: string;
  shortLabel: string;
  color: string;
  icon: 'chat' | 'sms' | 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'email';
}

export const CHANNEL_COLORS: Record<MessageChannel, ChannelConfig> = {
  live_chat: {
    label: 'Live Chat',
    shortLabel: 'Chat',
    color: '#3B82F6',
    icon: 'chat',
  },
  sms: {
    label: 'SMS',
    shortLabel: 'SMS',
    color: '#6B7280',
    icon: 'sms',
  },
  instagram: {
    label: 'Instagram',
    shortLabel: 'IG',
    color: '#E1306C',
    icon: 'instagram',
  },
  facebook: {
    label: 'Facebook',
    shortLabel: 'FB',
    color: '#1877F2',
    icon: 'facebook',
  },
  tiktok: {
    label: 'TikTok',
    shortLabel: 'TT',
    color: '#000000',
    icon: 'tiktok',
  },
  whatsapp: {
    label: 'WhatsApp',
    shortLabel: 'WA',
    color: '#25D366',
    icon: 'whatsapp',
  },
  email: {
    label: 'Email',
    shortLabel: 'Email',
    color: '#F59E0B',
    icon: 'email',
  },
};

export const ALL_CHANNELS: MessageChannel[] = [
  'live_chat', 'sms', 'instagram', 'facebook', 'tiktok', 'whatsapp', 'email',
];

/** Get a small SVG-compatible channel icon. Returns an SVG path string. */
export function getChannelIconPath(channel: MessageChannel): string {
  switch (channel) {
    case 'instagram':
      // Camera/rect icon
      return 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6';
    case 'facebook':
      return 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073';
    case 'tiktok':
      return 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43V7.56a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.8.02h-.39';
    case 'whatsapp':
      return 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413';
    case 'email':
      return 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z';
    case 'sms':
      return 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z';
    default: // live_chat
      return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
  }
}
```

**Step 2: Commit**

```bash
git add dashboard/src/lib/channel-colors.ts
git commit -m "feat: Add channel color constants and icon paths"
```

---

### Task 3: CommunicationsTab Wrapper Component

**Files:**
- Create: `dashboard/src/components/communications/CommunicationsTab.tsx`

**Context:** This follows the exact pattern of `dashboard/src/components/reviews/ReviewsTab.tsx` — subtab pills, stat cards, conditional content rendering. All colors from `DashboardColors` prop.

**Step 1: Create CommunicationsTab**

Create `dashboard/src/components/communications/CommunicationsTab.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import UnifiedInbox from './UnifiedInbox';

interface CommunicationsTabProps {
  colors: DashboardColors;
  activeSubTab?: string;
}

type SubTab = 'COO' | 'Messages';

interface CommsStats {
  unread: number;
  activeChats: number;
  totalConversations: number;
}

export default function CommunicationsTab({ colors, activeSubTab }: CommunicationsTabProps) {
  const [currentTab, setCurrentTab] = useState<SubTab>(
    (activeSubTab as SubTab) || 'Messages'
  );
  const [stats, setStats] = useState<CommsStats>({
    unread: 0,
    activeChats: 0,
    totalConversations: 0,
  });

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/data/chat_widget');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const conversations = json.data as Array<{ status: string; unread_count: number }>;
          setStats({
            unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
            activeChats: conversations.filter(c => c.status === 'active').length,
            totalConversations: conversations.length,
          });
        }
      }
    } catch {
      // Keep demo stats
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (activeSubTab && ['COO', 'Messages'].includes(activeSubTab)) {
      setCurrentTab(activeSubTab as SubTab);
    }
  }, [activeSubTab]);

  const SUB_TABS: SubTab[] = ['COO', 'Messages'];

  const statCards = [
    { label: 'Unread', value: stats.unread.toString(), highlight: stats.unread > 0 },
    { label: 'Active Chats', value: stats.activeChats.toString() },
    { label: 'Total Conversations', value: stats.totalConversations.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-2">
        {SUB_TABS.map(tab => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? buttonColor : 'transparent',
                color: isActive ? buttonText : textMuted,
                border: isActive ? 'none' : `1px solid ${borderColor}`,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-5 shadow-sm"
            style={{
              backgroundColor: card.highlight ? buttonColor : cardBg,
              border: card.highlight ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            <p className="text-sm font-medium mb-1"
              style={{ color: card.highlight ? getContrastText(buttonColor) : textMuted }}>
              {card.label}
            </p>
            <span className="text-2xl font-bold"
              style={{ color: card.highlight ? getContrastText(buttonColor) : textMain }}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      {currentTab === 'COO' && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${buttonColor}10` }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={buttonColor} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2" style={{ color: textMain }}>AI COO</p>
          <p className="text-sm" style={{ color: textMuted }}>Your AI Chief Operating Officer is coming soon</p>
        </div>
      )}

      {currentTab === 'Messages' && (
        <UnifiedInbox colors={colors} onStatsChange={fetchStats} />
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add dashboard/src/components/communications/CommunicationsTab.tsx
git commit -m "feat: Add CommunicationsTab wrapper with subtabs"
```

---

### Task 4: UnifiedInbox — 3-Panel Component

**Files:**
- Create: `dashboard/src/components/communications/UnifiedInbox.tsx`

**Context:** This is the main inbox component. 3-panel layout: conversation list (left, 320px), message thread (center, flex-1), contact drawer (right, slides out). Uses channel colors from `channel-colors.ts`. Canned responses from `chat_canned_responses` table (same pattern as `ChatInboxView.tsx` lines 93-98, 229-232, 463-509). Demo data for all channels.

**Key patterns to follow from ChatInboxView.tsx:**
- Color extraction: lines 112-119 (`buttonBg`, `buttonText`, `cardBg`, `textColor`, `headingColor`, `borderColor`, `bgColor`)
- Conversation list: lines 296-376 (search, filter, conversation items)
- Message rendering: lines 424-458 (system/visitor/staff messages)
- Reply bar: lines 460-509 (canned responses toggle, text input, send button)
- `formatTime()` helper: lines 249-259
- `getContrastText()` from `@/lib/view-colors`

**What's different from ChatInboxView:**
- Channel filter chips instead of status filter buttons
- Channel-colored left border on visitor messages
- Channel dot indicator next to conversation names
- Contact drawer that slides out from right
- Inline SVG channel icons using `getChannelIconPath()`

**Step 1: Create UnifiedInbox component**

Create `dashboard/src/components/communications/UnifiedInbox.tsx`. This is a large component (~600-700 lines). Key sections:

1. **Interfaces** — extend `Conversation` with `channel: MessageChannel`, extend `ChatMessage` with optional `channel`
2. **Demo data** — multi-channel conversations (Instagram, SMS, WhatsApp, live_chat, email, facebook)
3. **State** — conversations, selectedId, messages, replyText, channelFilter, searchQuery, showCanned, showContactDrawer
4. **ConversationList** (left panel):
   - Search input
   - Channel filter chips (All + each channel)
   - Scrollable list with channel dot + name + preview + time + unread badge
5. **MessageThread** (center panel):
   - Header: avatar, name, channel badge, "End Chat" button
   - Messages: visitor messages get `borderLeft: 3px solid ${channelColor}`, staff messages right-aligned neutral
   - System messages centered pill
   - Reply bar: canned responses button, text input, attach button, send button
6. **ContactDrawer** (right panel, 280px, slides in):
   - Contact avatar + name
   - Channel + email + phone
   - "Past Conversations" list
   - Close button

**Mobile behavior:** On screens < 768px, conversation list takes full width. Selecting a conversation replaces the list with the thread. Back button returns to list.

**Step 2: Commit**

```bash
git add dashboard/src/components/communications/UnifiedInbox.tsx
git commit -m "feat: Add UnifiedInbox 3-panel component with channel colors"
```

---

### Task 5: Wire CommunicationsTab into DashboardContent

**Files:**
- Modify: `dashboard/src/components/DashboardContent.tsx`

**Context:** The Reviews tab is wired at line 14 (import) and line 2025 (render). Follow the same pattern for Communications.

**Step 1: Add import**

Add after line 14 (`import ReviewsTab from './reviews/ReviewsTab';`):

```typescript
import CommunicationsTab from './communications/CommunicationsTab';
```

**Step 2: Add render condition**

Add after line 2025 (`{activeTab === 'reviews' && <ReviewsTab colors={colors} />}`):

```typescript
{activeTab === 'comms' && <CommunicationsTab colors={colors} />}
```

**Step 3: Commit**

```bash
git add dashboard/src/components/DashboardContent.tsx
git commit -m "feat: Wire CommunicationsTab into DashboardContent"
```

---

### Task 6: Update Navigation — Comms SubItems

**Files:**
- Modify: `dashboard/src/lib/navigation.ts`

**Context:** The `comms` nav item (line 44-48) currently has `subItems: ['Messages', 'Notes', 'Announcements']`. Update to reflect the new subtab structure. The sidebar will show "Comms" with subtabs "COO" and "Messages" (matching the CommunicationsTab subtabs). Keep Notes and Announcements as they'll eventually be separate subtabs.

**Step 1: Update subItems**

Change line 48 from:
```typescript
subItems: ['Messages', 'Notes', 'Announcements'],
```
To:
```typescript
subItems: ['COO', 'Messages', 'Notes', 'Announcements'],
```

**Step 2: Commit**

```bash
git add dashboard/src/lib/navigation.ts
git commit -m "feat: Add COO to Comms navigation subItems"
```

---

### Task 7: Type Check & Build Verification

**Step 1: Run TypeScript check**

```bash
cd ~/redpine-os/dashboard && npx tsc --noEmit
```

Expected: Zero errors.

**Step 2: Run build**

```bash
cd ~/redpine-os/dashboard && npm run build
```

Expected: Build succeeds. Look for `comms` route or communications components in the output.

**Step 3: Fix any issues found**

If TypeScript or build errors occur, fix them before proceeding.

---

### Task 8: Visual Verification with Playwright

**Step 1: Start dev server if not running**

```bash
cd ~/redpine-os/dashboard && npm run dev
```

**Step 2: Navigate to dashboard and click Comms tab**

Use Playwright to:
1. Navigate to `http://localhost:3000`
2. Log in with test account (luxe.nails.e2e@redpine.systems / TestNails2026!)
3. Click the "Comms" item in the sidebar
4. Take screenshot of the Communications tab
5. Verify: subtab pills visible (COO, Messages), stat cards showing, inbox layout correct
6. Click on a conversation in the list
7. Take screenshot of message thread with channel-colored bubbles
8. Verify channel dots on conversation list items

**Step 3: Check mobile view**

Resize browser to 375x667 and verify the inbox collapses to single-panel conversation list.

**Step 4: Compare to design reference**

Open `design-reference/reference-dashboard.webp` and verify the Communications tab matches the general aesthetic (rounded corners, generous padding, proper color system).

---

## Summary

| Task | Files | Estimated Lines |
|------|-------|----------------|
| 1. DB Migration | LATEST_MIGRATIONS.sql | ~12 |
| 2. Channel Colors | channel-colors.ts (new) | ~100 |
| 3. CommunicationsTab | CommunicationsTab.tsx (new) | ~140 |
| 4. UnifiedInbox | UnifiedInbox.tsx (new) | ~650 |
| 5. Wire into Dashboard | DashboardContent.tsx | ~2 |
| 6. Update Navigation | navigation.ts | ~1 |
| 7. Type Check & Build | — | — |
| 8. Visual Verification | — | — |

**Total new code:** ~900 lines across 3 new files + 2 small modifications + 1 migration.
