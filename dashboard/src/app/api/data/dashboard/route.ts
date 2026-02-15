// Dashboard Aggregation API - F4 Quick stats for dashboard overview

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// GET /api/data/dashboard - Get aggregated dashboard stats
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Run all counts in parallel
    const [
      clientsResult,
      appointmentsResult,
      tasksResult,
      invoicesResult,
      leadsResult,
      productsResult,
      revenueResult,
      upcomingAppointmentsResult,
      pendingTasksResult,
      recentClientsResult,
    ] = await Promise.all([
      // Total counts
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),

      // Revenue (paid invoices)
      supabase.from('invoices').select('amount_cents').eq('user_id', user.id).eq('status', 'paid'),

      // Upcoming appointments (next 7 days)
      supabase
        .from('appointments')
        .select('id, title, start_time, client_id')
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: true })
        .limit(5),

      // Pending tasks
      supabase
        .from('tasks')
        .select('id, title, priority, due_date')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .limit(5),

      // Recent clients
      supabase
        .from('clients')
        .select('id, name, email, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate total revenue
    const totalRevenue = (revenueResult.data || []).reduce(
      (sum, inv) => sum + (inv.amount_cents || 0),
      0
    );

    // Calculate leads by stage
    const { data: leadsByStage } = await supabase
      .from('leads')
      .select('stage')
      .eq('user_id', user.id);

    const leadStages = (leadsByStage || []).reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate tasks by status
    const { data: tasksByStatus } = await supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id);

    const taskStatuses = (tasksByStatus || []).reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        // Counts
        counts: {
          clients: clientsResult.count || 0,
          appointments: appointmentsResult.count || 0,
          tasks: tasksResult.count || 0,
          invoices: invoicesResult.count || 0,
          leads: leadsResult.count || 0,
          products: productsResult.count || 0,
        },

        // Revenue
        revenue: {
          total_cents: totalRevenue,
          total_formatted: `$${(totalRevenue / 100).toFixed(2)}`,
        },

        // Breakdowns
        leadsByStage: leadStages,
        tasksByStatus: taskStatuses,

        // Recent items
        upcomingAppointments: upcomingAppointmentsResult.data || [],
        pendingTasks: pendingTasksResult.data || [],
        recentClients: recentClientsResult.data || [],
      },
    });
  } catch (error) {
    console.error('GET dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
