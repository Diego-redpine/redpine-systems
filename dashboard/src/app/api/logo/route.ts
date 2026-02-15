import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const configId = formData.get('configId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File must be under 2MB' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${configId || 'preview'}-${Date.now()}.${ext}`;
    const path = `logos/${filename}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(path);

    const logoUrl = urlData.publicUrl;

    // If configId provided, update the profile's logo_url
    if (configId) {
      // Find config's user_id
      const { data: config } = await supabase
        .from('configs')
        .select('user_id')
        .eq('id', configId)
        .single();

      if (config?.user_id) {
        await supabase
          .from('profiles')
          .update({ logo_url: logoUrl })
          .eq('id', config.user_id);
      }
    }

    return NextResponse.json({ success: true, url: logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
