// Conversation Messages API — fetch and send messages within a conversation
// GET: Fetch messages for a conversation
// POST: Send a new message (inserts into chat_messages; if SMS, sends via Twilio)

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/data/conversations/[id]/messages — Fetch messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const afterId = searchParams.get('after');

    const supabase = getSupabaseUser(request);

    // Verify the conversation belongs to this business
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, user_id, channel')
      .eq('id', conversationId)
      .eq('user_id', context.businessOwnerId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Fetch messages
    let query = supabase
      .from('chat_messages')
      .select('id, content, sender_type, sender_name, is_read, created_at, metadata')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Support polling: only fetch messages after a specific ID
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
      query = query.limit(200);
    }

    const { data: messages, error: msgError } = await query;

    if (msgError) {
      console.error('[Messages API] Fetch error:', msgError);
      return NextResponse.json(
        { success: false, error: msgError.message },
        { status: 500 }
      );
    }

    // Mark unread visitor messages as read
    if (messages && messages.length > 0) {
      const unreadIds = messages
        .filter((m) => m.sender_type === 'visitor' && !m.is_read)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    }

    return NextResponse.json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error('[Messages API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/data/conversations/[id]/messages — Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseUser(request);

    // Verify the conversation belongs to this business
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, user_id, channel, visitor_name, metadata')
      .eq('id', conversationId)
      .eq('user_id', context.businessOwnerId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get sender name
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('business_name')
      .eq('id', context.businessOwnerId)
      .single();

    const senderName = profile?.business_name || 'Staff';

    // Insert message into chat_messages
    const { data: message, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        content: content.trim(),
        sender_type: 'staff',
        sender_name: senderName,
        is_read: true,
        metadata: {
          channel: conversation.channel,
          sent_by: context.userId,
        },
      })
      .select('id, content, sender_type, sender_name, is_read, created_at')
      .single();

    if (msgError) {
      console.error('[Messages API] Insert error:', msgError);
      return NextResponse.json(
        { success: false, error: msgError.message },
        { status: 500 }
      );
    }

    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // If the channel is SMS, send the message via Twilio using the business's stored credentials
    let smsSent = false;
    if (conversation.channel === 'sms') {
      const convMeta = (conversation.metadata as Record<string, unknown>) || {};
      const recipientPhone = (convMeta.phone_number as string) || conversation.visitor_name;

      if (recipientPhone) {
        smsSent = await sendSmsViaBusinessTwilio(
          supabaseAdmin,
          context.businessOwnerId,
          recipientPhone,
          content.trim()
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: message,
      sms_sent: conversation.channel === 'sms' ? smsSent : undefined,
    });
  } catch (error) {
    console.error('[Messages API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Send SMS via the business owner's stored Twilio credentials
async function sendSmsViaBusinessTwilio(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  businessOwnerId: string,
  toPhone: string,
  messageBody: string
): Promise<boolean> {
  try {
    // Fetch business Twilio credentials from configs.integrations
    const { data: config } = await supabase
      .from('configs')
      .select('integrations')
      .eq('user_id', businessOwnerId)
      .single();

    const integrations = (config?.integrations as Record<string, unknown>) || {};
    const twilio = integrations.twilio as Record<string, unknown> | undefined;

    if (!twilio?.account_sid || !twilio?.auth_token || !twilio?.phone_number) {
      console.log('[SMS Send] Business does not have Twilio configured');
      return false;
    }

    const accountSid = twilio.account_sid as string;
    const authToken = twilio.auth_token as string;
    const fromPhone = twilio.phone_number as string;

    // Send via Twilio REST API
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: toPhone,
        From: fromPhone,
        Body: messageBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SMS Send] Twilio API error:', errorText);
      return false;
    }

    console.log(`[SMS Send] Message sent to ${toPhone}`);
    return true;
  } catch (err) {
    console.error('[SMS Send] Failed:', err);
    return false;
  }
}
