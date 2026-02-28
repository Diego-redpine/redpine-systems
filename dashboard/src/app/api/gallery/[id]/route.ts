// Gallery Image API — update and delete individual images
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseUser } from '@/lib/crud';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Only allow updating these fields
  const allowedFields = ['caption', 'album_id', 'display_order', 'include_in_gallery'];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);

  const { data: image, error } = await supabase
    .from('gallery_images')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  return NextResponse.json({ image });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseUser(request);

  // Get image to find storage path
  const { data: image } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  // Delete from storage
  const url = new URL(image.image_url);
  const storagePath = url.pathname.split('/gallery/').pop();
  if (storagePath) {
    await supabase.storage.from('gallery').remove([decodeURIComponent(storagePath)]);
  }

  // Delete from DB
  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
