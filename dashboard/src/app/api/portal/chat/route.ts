// Portal Chat — authenticated two-way messaging
// GET: fetch conversation + messages for portal client
// POST: send a new message (sender_type: 'visitor')
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

// GET: Fetch conversation and messages
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const afterId = searchParams.get('after'); // For polling: only new messages after this ID
  const supabase = getSupabaseAdmin();

  // Find or create conversation for this client
  let { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id, subject, last_message_at, source, created_at')
    .eq('user_id', session.user_id)
    .eq('client_id', session.client_id)
    .eq('source', 'portal')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    // Also check for conversations without source=portal (might be from widget)
    const { data: anyConv } = await supabase
      .from('chat_conversations')
      .select('id, subject, last_message_at, source, created_at')
      .eq('user_id', session.user_id)
      .eq('client_id', session.client_id)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    conversation = anyConv;
  }

  if (!conversation) {
    return NextResponse.json({ conversation: null, messages: [] });
  }

  // Fetch messages (optionally after a specific message for polling)
  let query = supabase
    .from('chat_messages')
    .select('id, content, sender_type, sender_name, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });

  if (afterId) {
    // Get the created_at of the after message to filter
    const { data: afterMsg } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('id', afterId)
      .single();

    if (afterMsg) {
      query = query.gt('created_at', afterMsg.created_at);
    }
  } else {
    query = query.limit(100);
  }

  const { data: messages } = await query;

  return NextResponse.json({
    conversation,
    messages: messages || [],
  });
}

// POST: Send a new message
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

  const { content } = body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: 'Message too long (max 5000 chars)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Get client name
  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', session.client_id)
    .single();

  const senderName = client?.name || 'Client';

  // Find or create conversation
  let { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('user_id', session.user_id)
    .eq('client_id', session.client_id)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    const { data: newConv, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: session.user_id,
        client_id: session.client_id,
        source: 'portal',
        subject: 'Portal Chat',
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }
    conversation = newConv;
  }

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversation!.id,
      content: content.trim(),
      sender_type: 'visitor',
      sender_name: senderName,
    })
    .select('id, content, sender_type, sender_name, created_at')
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Update conversation last_message_at
  await supabase
    .from('chat_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversation!.id);

  return NextResponse.json({ success: true, message });
}
