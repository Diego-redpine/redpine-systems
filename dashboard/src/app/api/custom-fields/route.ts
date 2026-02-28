// Custom Field Definitions API — CRUD for user-defined fields
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/crud';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getAuthClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = request.headers.get('cookie') || '';
          return cookieHeader.split(';').map(c => {
            const [name, ...rest] = c.trim().split('=');
            return { name, value: rest.join('=') };
          }).filter(c => c.name);
        },
        setAll: () => {},
      },
    }
  );
}

// GET — list custom field definitions for a specific entity type
export async function GET(request: NextRequest) {
  const supabase = getAuthClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entityType = request.nextUrl.searchParams.get('entity_type');
  const admin = getSupabaseUser(request);

  let query = admin
    .from('custom_field_definitions')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true });

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST — create a new custom field definition
export async function POST(request: NextRequest) {
  const supabase = getAuthClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { entity_type, field_label, field_type, is_required, options } = body;

  if (!entity_type || !field_label) {
    return NextResponse.json({ error: 'entity_type and field_label are required' }, { status: 400 });
  }

  // Generate field_key from label
  const field_key = field_label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  const admin = getSupabaseUser(request);

  // Get the max display_order for this entity
  const { data: existing } = await admin
    .from('custom_field_definitions')
    .select('display_order')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { data, error } = await admin
    .from('custom_field_definitions')
    .insert({
      user_id: user.id,
      entity_type,
      field_key,
      field_label,
      field_type: field_type || 'text',
      is_required: is_required || false,
      options: options || [],
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A field with this name already exists for this entity' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE — remove a custom field definition
export async function DELETE(request: NextRequest) {
  const supabase = getAuthClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fieldId = request.nextUrl.searchParams.get('id');
  if (!fieldId) {
    return NextResponse.json({ error: 'Field ID is required' }, { status: 400 });
  }

  const admin = getSupabaseUser(request);

  const { error } = await admin
    .from('custom_field_definitions')
    .delete()
    .eq('id', fieldId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
