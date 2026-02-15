// Calendar Settings API — CRUD for calendar configuration
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET — list calendar settings
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('calendar_settings')
    .select('*')
    .eq('user_id', context.businessOwnerId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST — create a new calendar setting
export async function POST(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, calendar_type, duration_minutes, buffer_minutes, max_per_day, max_group_size, assignment_mode, availability, staff_ids } = body;

  if (!name) {
    return NextResponse.json({ error: 'Calendar name is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('calendar_settings')
    .insert({
      user_id: context.businessOwnerId,
      name,
      calendar_type: calendar_type || 'one_on_one',
      duration_minutes: duration_minutes || 60,
      buffer_minutes: buffer_minutes || 0,
      max_per_day: max_per_day || null,
      max_group_size: max_group_size || null,
      assignment_mode: assignment_mode || 'manual',
      availability: availability || {},
      staff_ids: staff_ids || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PUT — update a calendar setting
export async function PUT(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'Calendar setting ID is required' }, { status: 400 });
  }

  delete updates.user_id;
  delete updates.created_at;
  updates.updated_at = new Date().toISOString();

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('calendar_settings')
    .update(updates)
    .eq('id', id)
    .eq('user_id', context.businessOwnerId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE — remove a calendar setting
export async function DELETE(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Calendar setting ID is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('calendar_settings')
    .delete()
    .eq('id', id)
    .eq('user_id', context.businessOwnerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
