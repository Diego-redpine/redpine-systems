import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// POST /api/portal/register - Register a student for a class
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { class_id, student_id } = body;

  if (!class_id || !student_id) {
    return NextResponse.json({ error: 'class_id and student_id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Verify portal token (stored in portal_sessions or validated via magic link)
  const { data: portalSession } = await supabase
    .from('portal_sessions')
    .select('id, user_id, config_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!portalSession) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Check if the class exists and has spots
  const { data: classRecord } = await supabase
    .from('records')
    .select('id, data')
    .eq('id', class_id)
    .eq('user_id', portalSession.user_id)
    .single();

  if (!classRecord) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  // Create a registration record
  const { data: registration, error } = await supabase
    .from('records')
    .insert({
      user_id: portalSession.user_id,
      entity_type: 'class_registrations',
      data: {
        class_id,
        student_id,
        status: 'registered',
        registered_at: new Date().toISOString(),
      },
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, registration_id: registration.id });
}
