import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const recordId = searchParams.get('recordId');

  if (!entityType || !recordId) {
    return NextResponse.json({ error: 'entityType and recordId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('record_attachments')
    .select('*')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attachments: data });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const entityType = formData.get('entityType') as string | null;
  const recordId = formData.get('recordId') as string | null;

  if (!file || !entityType || !recordId) {
    return NextResponse.json({ error: 'file, entityType, and recordId required' }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${entityType}/${recordId}/${Date.now()}.${fileExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from('record-attachments')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('record-attachments')
    .getPublicUrl(filePath);

  // Save metadata to DB
  const { data: attachment, error: dbError } = await supabase
    .from('record_attachments')
    .insert({
      user_id: user.id,
      entity_type: entityType,
      record_id: recordId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type || null,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ attachment });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Get attachment to find storage path
  const { data: attachment } = await supabase
    .from('record_attachments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!attachment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete from storage (extract path from URL)
  const url = new URL(attachment.file_url);
  const storagePath = url.pathname.split('/record-attachments/').pop();
  if (storagePath) {
    await supabase.storage.from('record-attachments').remove([storagePath]);
  }

  // Delete from DB
  const { error } = await supabase
    .from('record_attachments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
