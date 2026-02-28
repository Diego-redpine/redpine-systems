import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { DEFAULT_PERMISSIONS } from '@/lib/coo-prompts';

export const dynamic = 'force-dynamic';

// GET — Fetch COO personality + permissions
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('configs')
    .select('coo_personality, coo_permissions')
    .eq('user_id', context.businessOwnerId)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    personality: data.coo_personality || 'friendly',
    permissions: data.coo_permissions || DEFAULT_PERMISSIONS,
  });
}

// PATCH — Update COO personality or permissions
export async function PATCH(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  // Validate personality
  if (body.personality) {
    const validPersonalities = ['professional', 'friendly', 'knowledgeable'];
    if (!validPersonalities.includes(body.personality)) {
      return NextResponse.json({ error: `Invalid personality. Must be: ${validPersonalities.join(', ')}` }, { status: 400 });
    }
    updates.coo_personality = body.personality;
  }

  // Validate permissions
  if (body.permissions) {
    const validValues = ['handles_it', 'asks_first'];
    for (const [key, value] of Object.entries(body.permissions)) {
      if (!validValues.includes(value as string)) {
        return NextResponse.json({ error: `Invalid permission value for ${key}. Must be: ${validValues.join(', ')}` }, { status: 400 });
      }
    }
    // Merge with existing permissions (don't overwrite unspecified keys)
    const supabase = getSupabaseUser(request);
    const { data: existing } = await supabase
      .from('configs')
      .select('coo_permissions')
      .eq('user_id', context.businessOwnerId)
      .single();

    updates.coo_permissions = { ...(existing?.coo_permissions || DEFAULT_PERMISSIONS), ...body.permissions };
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('configs')
    .update(updates)
    .eq('user_id', context.businessOwnerId)
    .select('coo_personality, coo_permissions')
    .single();

  if (error) {
    console.error('[COO Permissions] Update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
