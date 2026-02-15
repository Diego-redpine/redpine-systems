// Public Chat API — for website visitors (no auth required)
// POST: start a conversation or send a message
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { action, business_id } = body;

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    if (action === 'start') {
      // Start a new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: business_id,
          visitor_name: body.visitor_name || 'Visitor',
          visitor_email: body.visitor_email || null,
          visitor_page: body.visitor_page || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add system message
      await supabase.from('chat_messages').insert({
        conversation_id: data.id,
        sender_type: 'system',
        sender_name: 'System',
        content: 'Chat started',
      });

      return NextResponse.json({ conversation_id: data.id }, { status: 201 });
    }

    if (action === 'message') {
      const { conversation_id, content } = body;
      if (!conversation_id || !content) {
        return NextResponse.json({ error: 'conversation_id and content required' }, { status: 400 });
      }

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id,
        sender_type: 'visitor',
        sender_name: body.visitor_name || 'Visitor',
        content,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'poll') {
      // Poll for new messages (visitor polling for staff replies)
      const { conversation_id, after } = body;
      if (!conversation_id) {
        return NextResponse.json({ error: 'conversation_id required' }, { status: 400 });
      }

      let query = supabase
        .from('chat_messages')
        .select('id, content, sender_type, sender_name, created_at')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      if (after) query = query.gt('created_at', after);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ messages: data || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
