import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { calculateHealthScore } from '@/lib/health-score';

/**
 * GET /api/analytics/health-score
 * Returns the business health score for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseUser(request);
    const healthScore = await calculateHealthScore(context.businessOwnerId, supabase);

    return NextResponse.json({ success: true, data: healthScore });
  } catch (error) {
    console.error('[health-score] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}
