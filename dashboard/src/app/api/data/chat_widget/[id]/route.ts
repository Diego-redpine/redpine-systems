// Chat Conversation by ID — get messages, reply, update status
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// Get conversation with all messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*, chat_messages(id, content, sender_type, sender_name, is_read, created_at)')
      .eq('id', id)
      .eq('user_id', ctx.businessOwnerId)
      .order('created_at', { referencedTable: 'chat_messages', ascending: true })
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    // Mark visitor messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .eq('sender_type', 'visitor')
      .eq('is_read', false);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Send a staff reply or update conversation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // If sending a message
    if (body.message) {
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: id,
          sender_type: 'staff',
          sender_name: body.sender_name || 'Support',
          content: body.message,
        });
      if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', ctx.businessOwnerId);
    }

    // If updating status
    if (body.status) {
      const updates: Record<string, unknown> = { status: body.status, updated_at: new Date().toISOString() };
      if (body.status === 'ended') updates.ended_at = new Date().toISOString();

      await supabase
        .from('chat_conversations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', ctx.businessOwnerId);
    }

    // If assigning to staff
    if (body.assigned_staff_id !== undefined) {
      await supabase
        .from('chat_conversations')
        .update({ assigned_staff_id: body.assigned_staff_id, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', ctx.businessOwnerId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', ctx.businessOwnerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
