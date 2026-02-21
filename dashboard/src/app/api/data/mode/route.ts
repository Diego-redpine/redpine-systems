// Data Mode API - F4 Toggle between demo/real data
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/data/mode - Get current data mode
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      // Preview/unauthenticated users always get demo mode
      return NextResponse.json({
        success: true,
        data: { mode: 'demo', hasRealData: false, counts: {} },
      });
    }

    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Authenticated users ALWAYS get real mode (empty states, not dummy data)
    return NextResponse.json({
      success: true,
      data: {
        mode: 'real',
        hasRealData: true,
        counts: {},
      },
    });
  } catch (error) {
    console.error('GET mode error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get data mode' },
      { status: 500 }
    );
  }
}

// POST /api/data/mode - Seed demo data or clear it
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'seed' or 'clear'

    if (!action || !['seed', 'clear'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "seed" or "clear"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (action === 'clear') {
      // Clear all user data from all tables
      const tables = ['messages', 'documents', 'leads', 'staff', 'tasks', 'products', 'invoices', 'appointments', 'clients'];
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', user.id);
      }

      return NextResponse.json({
        success: true,
        message: 'All data cleared',
      });
    }

    if (action === 'seed') {
      // Seed demo data
      const now = new Date().toISOString();

      // Seed clients
      const { data: clients } = await supabase
        .from('clients')
        .insert([
          { user_id: user.id, name: 'Acme Corp', email: 'contact@acme.com', type: 'business', status: 'active', created_at: now },
          { user_id: user.id, name: 'Jane Smith', email: 'jane@email.com', phone: '555-0101', type: 'individual', status: 'active', created_at: now },
          { user_id: user.id, name: 'Tech Solutions', email: 'info@techsol.com', type: 'business', status: 'active', created_at: now },
        ])
        .select();

      // Seed appointments
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await supabase
        .from('appointments')
        .insert([
          {
            user_id: user.id,
            client_id: clients?.[0]?.id,
            title: 'Project Kickoff',
            start_time: tomorrow.toISOString(),
            end_time: new Date(tomorrow.getTime() + 3600000).toISOString(),
            status: 'confirmed',
            created_at: now
          },
          {
            user_id: user.id,
            client_id: clients?.[1]?.id,
            title: 'Follow-up Call',
            start_time: nextWeek.toISOString(),
            end_time: new Date(nextWeek.getTime() + 1800000).toISOString(),
            status: 'pending',
            created_at: now
          },
        ]);

      // Seed products
      await supabase
        .from('products')
        .insert([
          { user_id: user.id, name: 'Basic Plan', description: 'Entry level service', price_cents: 9900, quantity: 999, is_active: true, created_at: now },
          { user_id: user.id, name: 'Pro Plan', description: 'Professional service', price_cents: 29900, quantity: 999, is_active: true, created_at: now },
          { user_id: user.id, name: 'Enterprise Plan', description: 'Full service package', price_cents: 99900, quantity: 999, is_active: true, created_at: now },
        ]);

      // Seed tasks
      await supabase
        .from('tasks')
        .insert([
          { user_id: user.id, title: 'Review client proposal', status: 'pending', priority: 'high', created_at: now },
          { user_id: user.id, title: 'Update website content', status: 'in_progress', priority: 'medium', created_at: now },
          { user_id: user.id, title: 'Send weekly report', status: 'pending', priority: 'low', created_at: now },
        ]);

      // Seed invoices
      await supabase
        .from('invoices')
        .insert([
          { user_id: user.id, client_id: clients?.[0]?.id, invoice_number: 'INV-001', amount_cents: 150000, status: 'paid', created_at: now },
          { user_id: user.id, client_id: clients?.[1]?.id, invoice_number: 'INV-002', amount_cents: 29900, status: 'pending', created_at: now },
        ]);

      // Seed leads
      await supabase
        .from('leads')
        .insert([
          { user_id: user.id, name: 'New Prospect', email: 'prospect@company.com', source: 'website', stage: 'new', value_cents: 50000, created_at: now },
          { user_id: user.id, name: 'Referral Lead', email: 'referral@business.com', source: 'referral', stage: 'contacted', value_cents: 75000, created_at: now },
        ]);

      return NextResponse.json({
        success: true,
        message: 'Demo data seeded successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST mode error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process mode action' },
      { status: 500 }
    );
  }
}
