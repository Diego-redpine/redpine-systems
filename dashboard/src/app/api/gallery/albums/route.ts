// Gallery Albums API — list, create, delete albums
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseUser } from '@/lib/crud';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseUser(request);

  // Fetch albums
  const { data: albums, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get image counts per album
  const albumIds = (albums || []).map(a => a.id);
  let imageCounts: Record<string, number> = {};

  if (albumIds.length > 0) {
    const { data: counts } = await supabase
      .from('gallery_images')
      .select('album_id')
      .eq('user_id', user.id)
      .in('album_id', albumIds);

    if (counts) {
      for (const row of counts) {
        if (row.album_id) {
          imageCounts[row.album_id] = (imageCounts[row.album_id] || 0) + 1;
        }
      }
    }
  }

  // Also count uncategorized images
  const { count: uncategorizedCount } = await supabase
    .from('gallery_images')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('album_id', null);

  const albumsWithCounts = (albums || []).map(album => ({
    ...album,
    image_count: imageCounts[album.id] || 0,
  }));

  return NextResponse.json({
    albums: albumsWithCounts,
    uncategorized_count: uncategorizedCount || 0,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Album name is required' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);

  // Get next display_order
  const { count } = await supabase
    .from('gallery_albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: album, error } = await supabase
    .from('gallery_albums')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      display_order: count || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ album }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);

  // Verify ownership
  const { data: album } = await supabase
    .from('gallery_albums')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  // Delete album (images get album_id set to null via FK ON DELETE SET NULL)
  const { error } = await supabase
    .from('gallery_albums')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
