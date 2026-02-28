import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';

/**
 * POST /api/emergency/close
 * Emergency mode: Cancel all of today's appointments for the authenticated user's business.
 * Returns the count of cancelled appointments.
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseUser(request);

    // Get today's date range in ISO format
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Fetch all of today's non-cancelled appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('user_id', context.businessOwnerId)
      .gte('date', todayStart)
      .lt('date', todayEnd)
      .neq('status', 'cancelled');

    if (fetchError) {
      console.error('[emergency/close] Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        cancelled: 0,
        message: 'No appointments to cancel today',
      });
    }

    // Cancel each appointment
    const ids = appointments.map((a: { id: string }) => a.id);
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', context.businessOwnerId);

    if (updateError) {
      console.error('[emergency/close] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to cancel appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cancelled: ids.length,
      message: `Emergency close: ${ids.length} appointment${ids.length !== 1 ? 's' : ''} cancelled`,
    });
  } catch (error) {
    console.error('[emergency/close] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
