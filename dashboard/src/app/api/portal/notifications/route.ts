// Portal Notifications — notification preference management
// GET: fetch notification preferences for client
// POST: update preferences (toggle matrix)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function validateSession(request: NextRequest) {
  const token = request.headers.get('x-portal-token')
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('portal_sessions')
    .select('client_id, user_id, config_id, expires_at, metadata')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;
  return session;
}

const DEFAULT_PREFERENCES = {
  booking_reminders: true,
  payment_receipts: true,
  loyalty_updates: true,
  promotions: false,
  messages: true,
  channel_email: true,
  channel_sms: false,
  channel_push: false,
  digest_promotions: true,
  pause_all: false,
};

// GET: Fetch notification preferences
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: prefs } = await supabase
    .from('portal_notification_preferences')
    .select('*')
    .eq('client_id', session.client_id)
    .eq('user_id', session.user_id)
    .single();

  if (!prefs) {
    return NextResponse.json({ preferences: DEFAULT_PREFERENCES });
  }

  return NextResponse.json({
    preferences: {
      booking_reminders: prefs.booking_reminders,
      payment_receipts: prefs.payment_receipts,
      loyalty_updates: prefs.loyalty_updates,
      promotions: prefs.promotions,
      messages: prefs.messages,
      channel_email: prefs.channel_email,
      channel_sms: prefs.channel_sms,
      channel_push: prefs.channel_push,
      digest_promotions: prefs.digest_promotions,
      pause_all: prefs.pause_all,
    },
  });
}

// POST: Update notification preferences
export async function POST(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { preferences } = body;
  if (!preferences || typeof preferences !== 'object') {
    return NextResponse.json({ error: 'Preferences object required' }, { status: 400 });
  }

  // Validate and sanitize — only allow known boolean fields
  const allowed = new Set([
    'booking_reminders', 'payment_receipts', 'loyalty_updates',
    'promotions', 'messages', 'channel_email', 'channel_sms',
    'channel_push', 'digest_promotions', 'pause_all',
  ]);

  const updates: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(preferences)) {
    if (allowed.has(key) && typeof value === 'boolean') {
      updates[key] = value;
    }
  }

  const supabase = getSupabaseAdmin();

  // Upsert preferences
  const { data: existing } = await supabase
    .from('portal_notification_preferences')
    .select('id')
    .eq('client_id', session.client_id)
    .eq('user_id', session.user_id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('portal_notification_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('portal_notification_preferences')
      .insert({
        client_id: session.client_id,
        user_id: session.user_id,
        ...DEFAULT_PREFERENCES,
        ...updates,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
