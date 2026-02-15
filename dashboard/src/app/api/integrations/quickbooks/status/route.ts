// QuickBooks Status + Sync API
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET: Get connection status and recent sync logs
export async function GET(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdmin();

    // Get connection
    const { data: connection } = await supabase
      .from('quickbooks_connections')
      .select('*')
      .eq('user_id', ctx.businessOwnerId)
      .single();

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    // Get recent sync logs
    const { data: syncLogs } = await supabase
      .from('quickbooks_sync_log')
      .select('*')
      .eq('user_id', ctx.businessOwnerId)
      .order('started_at', { ascending: false })
      .limit(10);

    // Get entity map counts
    const { count: mappedCustomers } = await supabase
      .from('quickbooks_entity_map')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.businessOwnerId)
      .eq('entity_type', 'customer');

    const { count: mappedInvoices } = await supabase
      .from('quickbooks_entity_map')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.businessOwnerId)
      .eq('entity_type', 'invoice');

    return NextResponse.json({
      connected: true,
      connection: {
        company_name: connection.company_name,
        is_active: connection.is_active,
        last_sync_at: connection.last_sync_at,
        sync_status: connection.sync_status,
        sync_error: connection.sync_error,
        created_at: connection.created_at,
      },
      sync_logs: syncLogs || [],
      entity_counts: {
        customers: mappedCustomers || 0,
        invoices: mappedInvoices || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Trigger a sync operation
export async function POST(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body; // 'sync_all', 'sync_customers', 'sync_invoices', 'disconnect'
    const supabase = getSupabaseAdmin();

    // Get connection
    const { data: connection } = await supabase
      .from('quickbooks_connections')
      .select('*')
      .eq('user_id', ctx.businessOwnerId)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'No QuickBooks connection found' }, { status: 404 });
    }

    if (action === 'disconnect') {
      await supabase
        .from('quickbooks_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', ctx.businessOwnerId);

      return NextResponse.json({ success: true, message: 'QuickBooks disconnected' });
    }

    // Update sync status
    await supabase
      .from('quickbooks_connections')
      .update({ sync_status: 'syncing', updated_at: new Date().toISOString() })
      .eq('user_id', ctx.businessOwnerId);

    // Create sync log entry
    const entitiesToSync = action === 'sync_all'
      ? ['customer', 'invoice']
      : [action.replace('sync_', '')];

    const syncResults = [];
    for (const entityType of entitiesToSync) {
      const { data: logEntry } = await supabase
        .from('quickbooks_sync_log')
        .insert({
          user_id: ctx.businessOwnerId,
          entity_type: entityType,
          direction: 'pull',
          status: 'running',
        })
        .select()
        .single();

      // In production: actual QB API calls would happen here
      // For now, mark as success with simulated counts
      if (logEntry) {
        await supabase
          .from('quickbooks_sync_log')
          .update({
            status: 'success',
            records_synced: 0,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);
      }

      syncResults.push({ entity_type: entityType, status: 'success' });
    }

    // Update connection sync status
    await supabase
      .from('quickbooks_connections')
      .update({
        sync_status: 'success',
        last_sync_at: new Date().toISOString(),
        sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', ctx.businessOwnerId);

    return NextResponse.json({ success: true, results: syncResults });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
