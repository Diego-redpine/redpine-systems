// Public Forms API — fetch form definition + submit responses (no auth required)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/public/forms?id=<form_id> — fetch form definition for rendering
export async function GET(request: NextRequest) {
  const formId = new URL(request.url).searchParams.get('id');
  if (!formId) {
    return NextResponse.json({ error: 'Form ID required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: form, error } = await supabase
    .from('forms')
    .select('id, name, description, type, fields, settings')
    .eq('id', formId)
    .eq('status', 'active')
    .single();

  if (error || !form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  return NextResponse.json({ form });
}

// POST /api/public/forms — submit a form response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, data, submittedByName, submittedByEmail } = body;

    if (!formId || !data) {
      return NextResponse.json({ error: 'formId and data are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify form exists and is active
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, user_id, fields, status')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.status !== 'active') {
      return NextResponse.json({ error: 'This form is no longer accepting submissions' }, { status: 400 });
    }

    // Insert submission
    const { error: insertError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        user_id: form.user_id,
        data,
        submitted_by_name: submittedByName || null,
        submitted_by_email: submittedByEmail || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      });

    if (insertError) {
      console.error('Form submission error:', insertError);
      return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }

    // Increment submission count on form
    await supabase
      .from('forms')
      .update({ submissions: ((form as Record<string, unknown>).submissions as number || 0) + 1 })
      .eq('id', formId);

    return NextResponse.json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.error('POST /api/public/forms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
