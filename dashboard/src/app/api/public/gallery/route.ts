// Public Gallery API — fetch gallery for public website display (unauthenticated)
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const subdomain = new URL(request.url).searchParams.get('subdomain');
  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up business owner by subdomain
  const { data: config } = await supabase
    .from('configs')
    .select('user_id, config')
    .eq('subdomain', subdomain)
    .single();

  if (!config) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  // Fetch albums with image counts
  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('id, name, description, cover_image_url, display_order')
    .eq('user_id', config.user_id)
    .order('display_order', { ascending: true });

  // Fetch all images
  const { data: images } = await supabase
    .from('gallery_images')
    .select('id, image_url, thumbnail_url, caption, album_id, display_order')
    .eq('user_id', config.user_id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Calculate image counts per album
  const albumsWithCounts = (albums || []).map(album => ({
    ...album,
    image_count: (images || []).filter(img => img.album_id === album.id).length,
  }));

  return NextResponse.json({
    albums: albumsWithCounts,
    images: images || [],
    businessName: config.config?.business_name || '',
  });
}
