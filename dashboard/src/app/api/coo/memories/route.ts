import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { loadMemories } from '@/lib/coo-memory';

export const dynamic = 'force-dynamic';

// GET — Load all active COO memories for the authenticated user
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseUser(request);
  const memories = await loadMemories(context.businessOwnerId, supabase);

  return NextResponse.json({
    success: true,
    data: memories,
    count: memories.length,
  });
}

// POST — Manually add a memory (owner can pin important notes)
export async function POST(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { category, content } = body;

  if (!category || !content) {
    return NextResponse.json({ error: 'category and content required' }, { status: 400 });
  }

  const validCategories = ['goal', 'preference', 'client_note', 'milestone', 'decision', 'concern', 'idea'];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: `Invalid category. Must be: ${validCategories.join(', ')}` }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('coo_memories')
    .insert({
      user_id: context.businessOwnerId,
      category,
      content,
      confidence: 1.0, // Manual entries are full confidence
    })
    .select()
    .single();

  if (error) {
    console.error('[COO Memories] Insert error:', error);
    return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// DELETE — Remove a memory
export async function DELETE(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);
  const { error } = await supabase
    .from('coo_memories')
    .delete()
    .eq('id', id)
    .eq('user_id', context.businessOwnerId);

  if (error) {
    console.error('[COO Memories] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
