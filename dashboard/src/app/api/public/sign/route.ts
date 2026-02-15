// Public Signing API — fetch waiver details and submit signature

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/public/sign?id=<waiver_id> — fetch waiver for signing
export async function GET(request: NextRequest) {
  const waiverId = new URL(request.url).searchParams.get('id');
  if (!waiverId) {
    return NextResponse.json({ error: 'Waiver ID required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: waiver } = await supabase
    .from('waivers')
    .select('id, name, description, template_content, client, user_id, status')
    .eq('id', waiverId)
    .single();

  if (!waiver) {
    return NextResponse.json({ error: 'Waiver not found' }, { status: 404 });
  }

  if (waiver.status === 'signed') {
    return NextResponse.json({ error: 'This waiver has already been signed' }, { status: 400 });
  }

  if (waiver.status === 'expired') {
    return NextResponse.json({ error: 'This waiver has expired' }, { status: 400 });
  }

  // Get business name
  const { data: config } = await supabase
    .from('configs')
    .select('config')
    .eq('user_id', waiver.user_id)
    .single();

  return NextResponse.json({
    id: waiver.id,
    name: waiver.name,
    description: waiver.description,
    template_content: waiver.template_content,
    client: waiver.client,
    businessName: config?.config?.business_name || '',
  });
}

// POST /api/public/sign — submit a signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { waiver_id, signer, signer_email, signature_data } = body;

    if (!waiver_id || !signer || !signature_data) {
      return NextResponse.json(
        { error: 'waiver_id, signer, and signature_data are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch waiver
    const { data: waiver } = await supabase
      .from('waivers')
      .select('id, user_id, name, status')
      .eq('id', waiver_id)
      .single();

    if (!waiver) {
      return NextResponse.json({ error: 'Waiver not found' }, { status: 404 });
    }

    if (waiver.status === 'signed') {
      return NextResponse.json({ error: 'Already signed' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Update waiver status
    const { error: updateError } = await supabase
      .from('waivers')
      .update({
        status: 'signed',
        date_signed: now,
        signature_data,
        client: signer,
        client_email: signer_email || null,
        updated_at: now,
      })
      .eq('id', waiver_id);

    if (updateError) {
      console.error('Waiver update error:', updateError);
      return NextResponse.json({ error: 'Failed to record signature' }, { status: 500 });
    }

    // Create signature record
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    await supabase
      .from('signatures')
      .insert({
        user_id: waiver.user_id,
        document: waiver.name,
        document_id: waiver.id,
        signer,
        signer_email: signer_email || null,
        status: 'completed',
        signature_data,
        signed_at: now,
        method: 'email',
        ip_address: ip,
      });

    return NextResponse.json({ success: true, message: 'Signature recorded' });
  } catch (error) {
    console.error('POST /api/public/sign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
