// Portal Verify — validates token and returns session info
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: NextRequest) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up session by token
  const { data: session, error } = await supabase
    .from('portal_sessions')
    .select('id, client_id, user_id, email, expires_at')
    .eq('token', token)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
  }

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('portal_sessions').delete().eq('id', session.id);
    return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 401 });
  }

  // Get client info
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone')
    .eq('id', session.client_id)
    .single();

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    },
    session_id: session.id,
  });
}
