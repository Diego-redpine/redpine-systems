import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';

// POST /api/team/accept — Staff accepts invite, links auth_user_id
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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invite token is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Find the invitation by token
    const { data: invitation, error: findError } = await supabase
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite token' },
        { status: 404 }
      );
    }

    // Link the user's auth account to this team membership
    const { data, error } = await supabase
      .from('team_members')
      .update({
        auth_user_id: user.id,
        status: 'active',
        invite_token: null, // Clear token after use
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)
      .select()
      .single();

    if (error) {
      console.error('POST /api/team/accept error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      businessOwnerId: invitation.business_owner_id,
    });
  } catch (error) {
    console.error('POST /api/team/accept error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
