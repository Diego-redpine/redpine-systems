# Unified Inbox — Communications Tab Design

**Date:** 2026-02-24
**Source:** Sticky #3 (Communication), GHL research

## Goal

Replace the toolbar chat with a full Communications tab in the TopBar. Two subtabs: COO (placeholder) and Messages (unified inbox). The Messages hub uses a clean 3-panel layout with channel-colored message bubbles.

## Architecture

- **CommunicationsTab** wrapper follows ReviewsTab pattern (subtab pills + stat cards + conditional content)
- **UnifiedInbox** component is the 3-panel Messages hub (conversation list, message thread, contact drawer)
- **Channel color system** maps each source to a color for bubble accents and conversation list dots
- **Canned responses** reuse existing `chat_canned_responses` table
- COO subtab is a placeholder with empty state — not built in this phase

## Layout: Clean 3-Panel

```
┌─────────────────────────────────────────────────────┐
│  Communications  >  COO  |  Messages                │
├──────────────┬──────────────────────────────────────│
│ [Search...]  │  Maria Lopez           [IG icon]     │
│              │                                      │
│ 🟣 Maria L.  │  ┌─────────────────────┐              │
│   Hey, do.. │  │ Hey do you have     │ 🟣 IG        │
│   IG · 2m   │  │ appointments open?  │              │
│              │  └─────────────────────┘              │
│ 💬 James K.  │                                      │
│   Thanks f..│        ┌─────────────────────┐        │
│   SMS · 1h  │        │ Yes! I have 3pm and │  You   │
│              │        │ 5pm available today │        │
│ 🟢 Ana R.    │        └─────────────────────┘        │
│   Booking.. │                                      │
│   WA · 3h   │  ┌─────────────────────┐              │
│              │  │ 3pm works! Can I    │ 🟣 IG        │
│ 🔵 LiveChat  │  │ book online?        │              │
│   Widget    │  └─────────────────────┘              │
│   🔵 · 5h   │                                      │
│              │  [Type a reply... ]  [Send] [📎]     │
└──────────────┴──────────────────────────────────────┘
```

## Channel Color System

| Channel    | Color     | Hex       | Use                          |
|------------|-----------|-----------|------------------------------|
| Instagram  | Gradient  | #E1306C   | Left border gradient on bubble |
| Facebook   | Blue      | #1877F2   | Left border blue             |
| TikTok     | Black     | #000000   | Left border black            |
| WhatsApp   | Green     | #25D366   | Left border green            |
| SMS        | Gray      | #6B7280   | Left border gray             |
| Live Chat  | Blue-500  | #3B82F6   | Left border blue-500         |
| Email      | Amber     | #F59E0B   | Left border amber            |

## Data Model

Add `channel` column to `chat_conversations`:
```sql
ALTER TABLE chat_conversations ADD COLUMN channel TEXT DEFAULT 'live_chat';
-- Values: live_chat, sms, instagram, facebook, tiktok, whatsapp, email
```

## Component Tree

```
CommunicationsTab.tsx
  ├── Stat cards (Unread, Active, Total)
  ├── Subtab pills: [COO] [Messages]
  ├── COO subtab → placeholder empty state
  └── Messages subtab → UnifiedInbox.tsx
      ├── ConversationList (left, 320px)
      │   ├── Search input
      │   ├── Channel filter chips
      │   └── Conversation items with channel dot
      ├── MessageThread (center, flex-1)
      │   ├── Header with contact + channel badge
      │   ├── Messages with channel-colored left border
      │   └── ReplyBar (input + send + attach + canned)
      └── ContactDrawer (right, slides out)
          └── Contact card + past conversations
```

## What's Included

- CommunicationsTab wrapper with subtabs
- UnifiedInbox 3-panel component
- Channel color system on bubbles and conversation list
- Canned responses (existing table)
- Channel filter chips
- Search conversations
- Contact drawer (slide-out)
- COO subtab placeholder
- Mobile responsive
- Demo data with multi-channel conversations
- DB migration for channel column

## What's NOT Included (Future)

- Actual Twilio/Meta/TikTok API integrations
- Real-time message push
- COO AI functionality
- Automation triggers
