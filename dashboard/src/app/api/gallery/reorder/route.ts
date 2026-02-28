// Gallery Reorder API — batch update display_order for images or albums
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseUser } from '@/lib/crud';

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { items, type } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 });
  }

  if (type !== 'images' && type !== 'albums') {
    return NextResponse.json({ error: 'type must be "images" or "albums"' }, { status: 400 });
  }

  const table = type === 'images' ? 'gallery_images' : 'gallery_albums';
  const supabase = getSupabaseUser(request);

  // Update each item's display_order
  const errors: string[] = [];
  for (const item of items) {
    if (!item.id || typeof item.display_order !== 'number') continue;

    const { error } = await supabase
      .from(table)
      .update({ display_order: item.display_order })
      .eq('id', item.id)
      .eq('user_id', user.id);

    if (error) {
      errors.push(`${item.id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
