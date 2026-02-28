// Chat Conversations API — list and create conversations
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    let query = supabase
      .from('chat_conversations')
      .select('*, chat_messages(id, content, sender_type, sender_name, created_at)', { count: 'exact' })
      .eq('user_id', ctx.businessOwnerId)
      .order('updated_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`visitor_name.ilike.%${search}%,visitor_email.ilike.%${search}%`);

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get last message and unread count for each conversation
    const conversations = (data || []).map((conv: Record<string, unknown>) => {
      const messages = (conv.chat_messages as Record<string, unknown>[]) || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter((m: Record<string, unknown>) => m.sender_type === 'visitor' && !m.is_read).length;
      return {
        ...conv,
        last_message: lastMessage,
        unread_count: unreadCount,
        message_count: messages.length,
        chat_messages: undefined,
      };
    });

    return NextResponse.json({ data: conversations, total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseUser(request);
    const body = await request.json();
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: ctx.businessOwnerId,
        visitor_name: body.visitor_name || 'Visitor',
        visitor_email: body.visitor_email,
        visitor_page: body.visitor_page,
        status: 'active',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
