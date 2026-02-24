// Widget Chat — unauthenticated chat for anonymous/returning visitors
// GET: fetch messages by conversation_id (no auth required, just conversation_id)
// POST: create conversation or send message
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

// GET: Fetch messages for an existing conversation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');
  const subdomain = searchParams.get('subdomain');
  const afterId = searchParams.get('after');

  if (!conversationId || !subdomain) {
    return NextResponse.json({ error: 'conversation_id and subdomain required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Verify subdomain owns this conversation
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('subdomain', subdomain)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  // Verify conversation belongs to this business
  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', profile.user_id)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Fetch messages
  let query = supabase
    .from('chat_messages')
    .select('id, content, sender_type, sender_name, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (afterId) {
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

  return NextResponse.json({ messages: messages || [] });
}

// POST: Create conversation or send message
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { content, subdomain, visitor_id, visitor_name, visitor_email, conversation_id } = body;

  if (!content || !subdomain) {
    return NextResponse.json({ error: 'content and subdomain required' }, { status: 400 });
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: 'Message too long (max 5000 chars)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Resolve subdomain to business user
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('subdomain', subdomain)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  let convId = conversation_id;

  // If no conversation exists, create one
  if (!convId) {
    const source = visitor_id ? 'widget_returning' : 'widget_anonymous';

    const { data: newConv, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: profile.user_id,
        visitor_cookie_id: visitor_id || null,
        source,
        subject: visitor_name ? `Chat with ${visitor_name}` : 'Website Chat',
        last_message_at: new Date().toISOString(),
        metadata: {
          visitor_name: visitor_name || 'Visitor',
          visitor_email: visitor_email || '',
        },
      })
      .select('id')
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    convId = newConv.id;
  }

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: convId,
      content: content.trim(),
      sender_type: 'visitor',
      sender_name: visitor_name || 'Visitor',
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
    .eq('id', convId);

  return NextResponse.json({
    success: true,
    message,
    conversation_id: convId,
  });
}
