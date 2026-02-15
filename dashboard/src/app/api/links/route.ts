import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseAdmin } from '@/lib/crud';

// GET — fetch all links for a record (both directions)
export async function GET(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const recordId = searchParams.get('recordId');

  if (!entityType || !recordId) {
    return NextResponse.json({ error: 'entityType and recordId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch links where this record is source OR target
  const [sourceResult, targetResult] = await Promise.all([
    supabase
      .from('record_links')
      .select('*')
      .eq('user_id', context.businessOwnerId)
      .eq('source_entity', entityType)
      .eq('source_id', recordId),
    supabase
      .from('record_links')
      .select('*')
      .eq('user_id', context.businessOwnerId)
      .eq('target_entity', entityType)
      .eq('target_id', recordId),
  ]);

  const sourceLinks = sourceResult.data || [];
  const targetLinks = (targetResult.data || []).map(link => ({
    ...link,
    // Flip the perspective so the "target" from this record's view is the other record
    target_entity: link.source_entity,
    target_id: link.source_id,
    source_entity: link.target_entity,
    source_id: link.target_id,
  }));

  const allLinks = [...sourceLinks, ...targetLinks];

  // Resolve display labels for linked records
  const resolvedLinks = await Promise.all(
    allLinks.map(async (link) => {
      try {
        const { data } = await supabase
          .from(link.target_entity)
          .select('id, name, title, subject, invoice_number')
          .eq('id', link.target_id)
          .single();

        const label = data
          ? String(data.name || data.title || data.subject || data.invoice_number || link.target_id.slice(0, 8))
          : link.target_id.slice(0, 8);

        return { ...link, target_label: label };
      } catch {
        return { ...link, target_label: link.target_id.slice(0, 8) };
      }
    })
  );

  return NextResponse.json({ links: resolvedLinks });
}

// POST — create a new link
export async function POST(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { source_entity, source_id, target_entity, target_id, link_type } = body;

  if (!source_entity || !source_id || !target_entity || !target_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if link already exists (either direction)
  const { data: existing } = await supabase
    .from('record_links')
    .select('id')
    .eq('user_id', context.businessOwnerId)
    .or(
      `and(source_entity.eq.${source_entity},source_id.eq.${source_id},target_entity.eq.${target_entity},target_id.eq.${target_id}),` +
      `and(source_entity.eq.${target_entity},source_id.eq.${target_id},target_entity.eq.${source_entity},target_id.eq.${source_id})`
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Link already exists' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('record_links')
    .insert({
      user_id: context.businessOwnerId,
      source_entity,
      source_id,
      target_entity,
      target_id,
      link_type: link_type || 'related',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: data }, { status: 201 });
}

// DELETE — remove a link
export async function DELETE(request: NextRequest) {
  const context = await getBusinessContext(request);
  if (!context) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('record_links')
    .delete()
    .eq('id', id)
    .eq('user_id', context.businessOwnerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
