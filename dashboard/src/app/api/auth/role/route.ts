import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

// GET /api/auth/role — Returns the user's role and business context
// If user is a team member (staff), returns the owner's ID for data scoping
// If user has no team membership, they're a solo owner
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

    // Check if this user is a team member (staff) of another owner
    const { data: membership } = await supabase
      .from('team_members')
      .select('business_owner_id, role, status')
      .eq('auth_user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membership) {
      // User is a staff member — return the owner's ID for data scoping
      return NextResponse.json({
        success: true,
        role: membership.role,
        businessOwnerId: membership.business_owner_id,
        isOwner: membership.role === 'owner',
        isStaff: membership.role === 'staff',
        userId: user.id,
      });
    }

    // Check if user has their own config (is an owner)
    const { data: config } = await supabase
      .from('configs')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // Solo owner (default) — businessOwnerId is their own ID
    return NextResponse.json({
      success: true,
      role: 'owner',
      businessOwnerId: user.id,
      isOwner: true,
      isStaff: false,
      userId: user.id,
      configId: config?.id || null,
    });
  } catch (error) {
    console.error('GET /api/auth/role error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve role' },
      { status: 500 }
    );
  }
}
