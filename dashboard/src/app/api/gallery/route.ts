// Gallery Images API — list and upload photos
// Uses admin client for storage + DB operations (RLS policies may not be applied yet)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

const BUCKET_NAME = 'gallery';
let bucketEnsured = false;

/** Create the storage bucket if it doesn't exist (admin-only, runs once per cold start) */
async function ensureBucket() {
  if (bucketEnsured) return;
  const admin = getSupabaseAdmin();
  const { data } = await admin.storage.getBucket(BUCKET_NAME);
  if (!data) {
    await admin.storage.createBucket(BUCKET_NAME, { public: true, fileSizeLimit: 20 * 1024 * 1024 });
  }
  bucketEnsured = true;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('album_id');

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('gallery_images')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (albumId) {
    query = query.eq('album_id', albumId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const albumId = formData.get('album_id') as string | null;
  const caption = formData.get('caption') as string | null;
  const includeInGalleryRaw = formData.get('include_in_gallery');
  const includeInGallery = includeInGalleryRaw === null ? true : includeInGalleryRaw !== 'false';

  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  // Validate image type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
  }

  // Max 20MB
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Ensure storage bucket exists (creates on first upload)
  await ensureBucket();

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const folder = albumId || 'uncategorized';
  const filePath = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath);

  // Get next display_order
  const { count } = await supabase
    .from('gallery_images')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Save metadata to DB
  const { data: image, error: dbError } = await supabase
    .from('gallery_images')
    .insert({
      user_id: user.id,
      album_id: albumId || null,
      image_url: urlData.publicUrl,
      caption: caption || null,
      display_order: (count || 0),
      file_size: file.size,
      file_type: file.type,
      original_name: file.name,
      include_in_gallery: includeInGallery,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // If this is the first image in an album and album has no cover, set it
  if (albumId) {
    const { data: album } = await supabase
      .from('gallery_albums')
      .select('cover_image_url')
      .eq('id', albumId)
      .single();

    if (album && !album.cover_image_url) {
      await supabase
        .from('gallery_albums')
        .update({ cover_image_url: urlData.publicUrl })
        .eq('id', albumId);
    }
  }

  return NextResponse.json({ image }, { status: 201 });
}
