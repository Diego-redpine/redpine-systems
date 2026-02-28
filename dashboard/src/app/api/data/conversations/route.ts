// Conversations API — fetch conversations for the UnifiedInbox
// GET: List conversations with last message preview, unread count, channel type
// Supports ?search= for filtering by visitor name or email

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/data/conversations — List conversations for the unified inbox
export async function GET(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const channel = searchParams.get('channel') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const supabase = getSupabaseUser(request);

    // Build the conversations query
    let query = supabase
      .from('chat_conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', context.businessOwnerId)
      .order('updated_at', { ascending: false });

    // Filter by channel
    if (channel && channel !== 'all') {
      query = query.eq('channel', channel);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Search by visitor name or email
    if (search) {
      query = query.or(
        `visitor_name.ilike.%${search}%,visitor_email.ilike.%${search}%`
      );
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: conversations, error: convError, count } = await query;

    if (convError) {
      console.error('[Conversations API] Fetch error:', convError);
      return NextResponse.json(
        { success: false, error: convError.message },
        { status: 500 }
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        page,
        pageSize,
      });
    }

    // For each conversation, get the last message and unread count
    const conversationIds = conversations.map((c) => c.id);

    // Fetch latest message per conversation
    // We do this in a single query: get all messages for these conversations ordered by created_at desc
    const { data: allMessages } = await supabase
      .from('chat_messages')
      .select('id, conversation_id, content, sender_type, sender_name, created_at, is_read')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    // Build lookup maps
    const lastMessageMap: Record<string, {
      content: string;
      sender_type: string;
      created_at: string;
    }> = {};
    const unreadCountMap: Record<string, number> = {};
    const messageCountMap: Record<string, number> = {};

    if (allMessages) {
      for (const msg of allMessages) {
        const convId = msg.conversation_id;

        // Track message counts
        messageCountMap[convId] = (messageCountMap[convId] || 0) + 1;

        // Track unread count (messages from visitors that are not read)
        if (msg.sender_type === 'visitor' && !msg.is_read) {
          unreadCountMap[convId] = (unreadCountMap[convId] || 0) + 1;
        }

        // Track last message (first in desc order = most recent)
        if (!lastMessageMap[convId]) {
          lastMessageMap[convId] = {
            content: msg.content,
            sender_type: msg.sender_type,
            created_at: msg.created_at,
          };
        }
      }
    }

    // Assemble the response with enriched conversation data
    const enrichedConversations = conversations.map((conv) => {
      const metadata = (conv.metadata as Record<string, unknown>) || {};
      return {
        id: conv.id,
        visitor_name: (metadata.display_name as string) || conv.visitor_name || 'Visitor',
        visitor_email: conv.visitor_email || null,
        visitor_phone: (metadata.phone_number as string) || null,
        visitor_page: conv.visitor_page || null,
        channel: conv.channel || 'live_chat',
        status: conv.status || 'active',
        last_message: lastMessageMap[conv.id] || null,
        unread_count: unreadCountMap[conv.id] || 0,
        message_count: messageCountMap[conv.id] || 0,
        started_at: conv.started_at || conv.created_at,
        updated_at: conv.updated_at,
        client_id: conv.client_id || null,
        source: conv.source || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedConversations,
      count: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('[Conversations API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
