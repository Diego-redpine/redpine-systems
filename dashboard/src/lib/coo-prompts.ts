/**
 * COO Prompt System — Personality-specific prompts and proactive triggers.
 *
 * Three personality types set during onboarding:
 * - professional: Concise, data-driven, corporate tone
 * - friendly: Warm, casual, encouraging tone (default)
 * - knowledgeable: Detailed, educational, advisory tone
 */

export type CooPersonality = 'professional' | 'friendly' | 'knowledgeable';

export interface CooPermissions {
  cancellation_rebooking: 'handles_it' | 'asks_first';
  review_requests: 'handles_it' | 'asks_first';
  appointment_reminders: 'handles_it' | 'asks_first';
  client_reminders: 'handles_it' | 'asks_first';
  invoice_generation: 'handles_it' | 'asks_first';
  waitlist_offers: 'handles_it' | 'asks_first';
}

export const DEFAULT_PERMISSIONS: CooPermissions = {
  cancellation_rebooking: 'asks_first',
  review_requests: 'asks_first',
  appointment_reminders: 'handles_it',
  client_reminders: 'asks_first',
  invoice_generation: 'asks_first',
  waitlist_offers: 'asks_first',
};

export const PERMISSION_LABELS: Record<keyof CooPermissions, { label: string; description: string }> = {
  cancellation_rebooking: {
    label: 'Cancellation Rebooking',
    description: 'When a client cancels, offer alternative times automatically',
  },
  review_requests: {
    label: 'Review Requests',
    description: 'Send review requests after completed appointments',
  },
  appointment_reminders: {
    label: 'Appointment Reminders',
    description: 'Send 24h and 1h reminder messages to clients',
  },
  client_reminders: {
    label: 'Client Follow-ups',
    description: 'Reach out to inactive clients after 30+ days',
  },
  invoice_generation: {
    label: 'Invoice Generation',
    description: 'Auto-create invoices when appointments are completed',
  },
  waitlist_offers: {
    label: 'Waitlist Offers',
    description: 'Offer cancelled slots to waitlisted clients',
  },
};

const PERSONALITY_PROMPTS: Record<CooPersonality, string> = {
  professional: `You are the AI Chief Operating Officer for this business. You are concise, data-driven, and results-oriented.

Tone: Corporate but not stiff. Think management consultant — efficient, clear, action-oriented.
Style:
- Lead with data and metrics when available
- Use bullet points for clarity
- Keep responses under 3 sentences unless analyzing data
- Proactively surface KPIs and trends
- Say "I recommend" not "maybe you could"
- No emojis, no exclamation marks`,

  friendly: `You are the AI Chief Operating Officer for this business. You are warm, supportive, and encouraging — like a trusted business partner who genuinely cares.

Tone: Casual and approachable. Think helpful coworker who has your back.
Style:
- Use the owner's name when you know it
- Celebrate wins ("Great week — revenue is up!")
- Frame problems as solvable ("A few cancellations, but I've got ideas")
- Keep it conversational, not robotic
- One suggestion at a time, don't overwhelm
- Light humor is fine, but don't force it
- No emojis`,

  knowledgeable: `You are the AI Chief Operating Officer for this business. You are a strategic advisor — thoughtful, thorough, and educational.

Tone: Mentor-like. Think experienced business consultant who explains the "why" behind recommendations.
Style:
- Explain reasoning behind suggestions
- Reference industry best practices when relevant
- Offer context ("Most businesses in your space see 15-20% no-show rates")
- Provide options with trade-offs when decisions are needed
- Use "Here's why..." and "In my experience..." naturally
- Detailed but not verbose — substance over filler
- No emojis`,
};

interface BusinessContext {
  businessName?: string;
  businessType?: string;
  services?: Array<{ name: string; price_cents?: number }>;
  staffCount?: number;
  clientCount?: number;
}

interface ProactiveContext {
  todayAppointments?: number;
  todayCancellations?: number;
  unreadMessages?: number;
  pendingInvoices?: number;
  recentReviews?: Array<{ rating: number; content: string }>;
  weeklyRevenue?: number;
  lastWeekRevenue?: number;
}

/**
 * Build the complete COO system prompt with personality, memories, and business context.
 */
export function buildCooSystemPrompt(
  personality: CooPersonality,
  memoryJournal: string,
  businessContext: BusinessContext,
  permissions: CooPermissions
): string {
  const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.friendly;

  const businessSection = buildBusinessSection(businessContext);
  const permissionsSection = buildPermissionsSection(permissions);

  return `${personalityPrompt}

LANGUAGE RULE: Always respond in the SAME LANGUAGE the user writes in.

${businessSection}

${permissionsSection}

${memoryJournal}

CRITICAL RULES:
- You can take actions on behalf of the owner (send messages, create invoices, modify appointments)
- ALWAYS check permissions before acting. If permission is "asks_first", present the action and wait for confirmation
- If permission is "handles_it", take the action and report what you did
- Log every action in the activity feed regardless of permission level
- Never share data between businesses
- If unsure about something, ask — don't guess
- When referencing past interactions, use your memory journal naturally (don't say "according to my records")`;
}

function buildBusinessSection(ctx: BusinessContext): string {
  const parts = ['--- Business Context ---'];

  if (ctx.businessName) parts.push(`Business: ${ctx.businessName}`);
  if (ctx.businessType) parts.push(`Type: ${ctx.businessType}`);
  if (ctx.staffCount) parts.push(`Team size: ${ctx.staffCount} staff members`);
  if (ctx.clientCount) parts.push(`Clients: ${ctx.clientCount}`);
  if (ctx.services?.length) {
    parts.push(`Services: ${ctx.services.map(s => s.name).join(', ')}`);
  }

  parts.push('--- End Business Context ---');
  return parts.join('\n');
}

function buildPermissionsSection(permissions: CooPermissions): string {
  const parts = ['--- Your Permission Levels ---'];

  for (const [key, value] of Object.entries(permissions)) {
    const label = PERMISSION_LABELS[key as keyof CooPermissions]?.label || key;
    parts.push(`${label}: ${value === 'handles_it' ? 'You handle this automatically' : 'Ask before acting'}`);
  }

  parts.push('--- End Permissions ---');
  return parts.join('\n');
}

/**
 * Generate a proactive greeting message based on current business state.
 * Called when the owner opens the COO chat or logs in.
 */
export function buildProactiveGreeting(
  personality: CooPersonality,
  ctx: ProactiveContext,
  ownerName?: string
): string | null {
  const parts: string[] = [];
  const name = ownerName || 'there';
  const hour = new Date().getHours();

  // Time-based greeting
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Today's appointments
  if (ctx.todayAppointments !== undefined && ctx.todayAppointments > 0) {
    parts.push(`You have ${ctx.todayAppointments} appointment${ctx.todayAppointments > 1 ? 's' : ''} today.`);
  }

  // Cancellations
  if (ctx.todayCancellations && ctx.todayCancellations > 0) {
    parts.push(`${ctx.todayCancellations} cancellation${ctx.todayCancellations > 1 ? 's' : ''} today — want me to offer those slots to the waitlist?`);
  }

  // Unread messages
  if (ctx.unreadMessages && ctx.unreadMessages > 0) {
    parts.push(`${ctx.unreadMessages} unread message${ctx.unreadMessages > 1 ? 's' : ''} waiting for you.`);
  }

  // Pending invoices
  if (ctx.pendingInvoices && ctx.pendingInvoices > 0) {
    parts.push(`${ctx.pendingInvoices} invoice${ctx.pendingInvoices > 1 ? 's' : ''} pending payment.`);
  }

  // Revenue comparison
  if (ctx.weeklyRevenue !== undefined && ctx.lastWeekRevenue !== undefined && ctx.lastWeekRevenue > 0) {
    const change = ((ctx.weeklyRevenue - ctx.lastWeekRevenue) / ctx.lastWeekRevenue * 100).toFixed(0);
    const direction = Number(change) >= 0 ? 'up' : 'down';
    parts.push(`Revenue this week is ${direction} ${Math.abs(Number(change))}% vs last week.`);
  }

  // Recent reviews
  if (ctx.recentReviews?.length) {
    const avg = ctx.recentReviews.reduce((s, r) => s + r.rating, 0) / ctx.recentReviews.length;
    if (avg >= 4) {
      parts.push(`Recent reviews are strong — ${avg.toFixed(1)} star average.`);
    } else if (avg < 3) {
      parts.push(`Heads up: recent review ratings dipped to ${avg.toFixed(1)} stars. Want me to look into it?`);
    }
  }

  if (parts.length === 0) return null;

  // Personality-specific framing
  switch (personality) {
    case 'professional':
      return `${timeGreeting}. Quick status update:\n\n${parts.join('\n')}`;
    case 'friendly':
      return `${timeGreeting}, ${name}! Here's what's happening:\n\n${parts.join('\n')}`;
    case 'knowledgeable':
      return `${timeGreeting}, ${name}. Let me bring you up to speed:\n\n${parts.join('\n')}`;
  }
}

/**
 * Available proactive trigger types and their descriptions.
 */
export const PROACTIVE_TRIGGERS = {
  login_summary: 'Daily summary when owner opens dashboard',
  appointment_completed: 'Suggest review request after appointment completion',
  cancellation: 'Offer to rebook cancelled appointment slot',
  no_response_24h: 'Alert when client message goes unanswered for 24h',
  milestone_reached: 'Celebrate business milestones (100 clients, revenue goals)',
  low_stock: 'Alert when product inventory is low',
} as const;

export type ProactiveTrigger = keyof typeof PROACTIVE_TRIGGERS;
