/**
 * Agent Event System — Emits business events to n8n webhook for agent processing.
 *
 * Events flow:
 * 1. API route calls emitAgentEvent() when business event happens
 * 2. Event is logged in agent_activity table
 * 3. If N8N_WEBHOOK_URL is set, event is forwarded to n8n for agent workflows
 * 4. n8n agents process event and call back via /api/agents/webhook/inbound
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type AgentEventType =
  | 'appointment.created'
  | 'appointment.completed'
  | 'appointment.cancelled'
  | 'appointment.no_show'
  | 'payment.received'
  | 'review.received'
  | 'message.received'
  | 'invoice.created'
  | 'order.placed'
  | 'order.completed'
  | 'client.created'
  | 'low_stock';

export interface AgentEvent {
  type: AgentEventType;
  userId: string;
  payload: Record<string, unknown>;
}

/**
 * Emit a business event for agent processing.
 * Logs to agent_activity and forwards to n8n if configured.
 * Fire-and-forget — never blocks the calling route.
 */
export async function emitAgentEvent(
  event: AgentEvent,
  supabase: SupabaseClient
): Promise<void> {
  // Log to agent_activity table
  await supabase
    .from('agent_activity')
    .insert({
      user_id: event.userId,
      agent_type: 'system',
      event_type: event.type,
      description: formatEventDescription(event),
      metadata: event.payload,
      status: 'completed',
    })
    .then(() => {});

  // Forward to n8n if configured
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: event.type,
        user_id: event.userId,
        payload: event.payload,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('[Agent Events] n8n webhook error:', err));
  }
}

function formatEventDescription(event: AgentEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'appointment.created':
      return `New appointment: ${p.service_name || 'appointment'} with ${p.client_name || 'client'}`;
    case 'appointment.completed':
      return `Appointment completed: ${p.service_name || 'appointment'} with ${p.client_name || 'client'}`;
    case 'appointment.cancelled':
      return `Appointment cancelled: ${p.service_name || 'appointment'} with ${p.client_name || 'client'}`;
    case 'appointment.no_show':
      return `No-show: ${p.client_name || 'client'} missed their appointment`;
    case 'payment.received':
      return `Payment received: $${((p.amount_cents as number) / 100).toFixed(2)} from ${p.client_name || 'client'}`;
    case 'review.received':
      return `New ${p.rating}-star review from ${p.reviewer_name || 'client'}`;
    case 'message.received':
      return `New message from ${p.sender_name || 'visitor'} via ${p.channel || 'chat'}`;
    case 'invoice.created':
      return `Invoice created: $${((p.amount_cents as number) / 100).toFixed(2)} for ${p.client_name || 'client'}`;
    case 'order.placed':
      return `New order #${p.order_number || ''}: $${((p.total_cents as number) / 100).toFixed(2)}`;
    case 'order.completed':
      return `Order #${p.order_number || ''} completed`;
    case 'client.created':
      return `New client: ${p.client_name || 'client'}`;
    case 'low_stock':
      return `Low stock alert: ${p.product_name || 'product'} (${p.quantity || 0} remaining)`;
    default:
      return `Event: ${event.type}`;
  }
}

/**
 * Agent catalog — defines available agents, pricing, and capabilities.
 */
export const AGENT_CATALOG = [
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    description: 'Sends 24h and 1h reminders before appointments via SMS and email.',
    price_cents: 0,
    included: true,
    triggers: ['cron:hourly'],
    stripe_price_id: null,
  },
  {
    id: 'review_requester',
    name: 'Review Requester',
    description: 'Sends review requests 2 hours after completed appointments.',
    price_cents: 0,
    included: true,
    triggers: ['appointment.completed'],
    stripe_price_id: null,
  },
  {
    id: 'receptionist',
    name: 'AI Receptionist',
    description: 'Automatically responds to booking inquiries, hours, and pricing questions. Escalates complex requests.',
    price_cents: 1500, // $15/mo
    included: false,
    triggers: ['message.received'],
    stripe_price_id: process.env.STRIPE_RECEPTIONIST_PRICE_ID || null,
  },
  {
    id: 'blog_writer',
    name: 'Blog Writer',
    description: 'Generates SEO-optimized blog posts based on your business and industry.',
    price_cents: 500, // $5/mo
    included: false,
    triggers: ['cron:weekly'],
    stripe_price_id: process.env.STRIPE_BLOG_AGENT_PRICE_ID || null,
  },
  {
    id: 'review_manager',
    name: 'Reputation Manager',
    description: 'Monitors reviews across Google and Facebook. Drafts responses and analyzes sentiment.',
    price_cents: 1500, // $15/mo
    included: false,
    triggers: ['review.received'],
    stripe_price_id: process.env.STRIPE_REVIEW_MANAGER_PRICE_ID || null,
  },
] as const;

export type AgentId = typeof AGENT_CATALOG[number]['id'];
