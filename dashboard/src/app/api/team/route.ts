import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { teamInviteEmail } from '@/lib/email-templates';

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

async function getBusinessName(businessOwnerId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('configs')
    .select('config')
    .eq('user_id', businessOwnerId)
    .limit(1)
    .single();
  return data?.config?.business_name || '';
}

// GET /api/team — List team members (owner only)
export async function GET(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only owners can view team list
    if (context.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owners can manage the team' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('business_owner_id', context.businessOwnerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/team error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('GET /api/team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// POST /api/team — Invite new team member (owner only)
export async function POST(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (context.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owners can invite team members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const businessName = await getBusinessName(context.businessOwnerId);

    // Check if already invited
    const { data: existing } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('business_owner_id', context.businessOwnerId)
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'deactivated') {
        // Reactivate
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const { data, error } = await supabase
          .from('team_members')
          .update({ status: 'pending', invite_token: inviteToken, name })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Send re-invite email
        const reInviteUrl = `${getBaseUrl(request)}/signup?invite=${inviteToken}`;
        try {
          await sendEmail({
            to: email.toLowerCase(),
            subject: `You're invited to join ${businessName || 'a team'} on Red Pine`,
            html: teamInviteEmail(name || '', businessName || 'the team', '', reInviteUrl),
          });
        } catch (emailErr) {
          console.error('Failed to send re-invite email:', emailErr);
        }

        return NextResponse.json({ success: true, data, inviteToken });
      }
      return NextResponse.json(
        { success: false, error: 'This email is already on your team' },
        { status: 409 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        business_owner_id: context.businessOwnerId,
        email: email.toLowerCase(),
        name: name || null,
        role: 'staff',
        status: 'pending',
        invite_token: inviteToken,
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/team error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Send invite email
    const inviteUrl = `${getBaseUrl(request)}/signup?invite=${inviteToken}`;
    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: `You're invited to join ${businessName || 'a team'} on Red Pine`,
        html: teamInviteEmail(name || '', businessName || 'the team', '', inviteUrl),
      });
    } catch (emailErr) {
      console.error('Failed to send invite email:', emailErr);
      // Don't fail the invite if email fails — member is still created
    }

    return NextResponse.json({
      success: true,
      data,
      inviteToken,
      inviteUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite team member' },
      { status: 500 }
    );
  }
}

// PUT /api/team — Update team member (owner only)
export async function PUT(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (context.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owners can update team members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, role, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (status) updates.status = status;

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .eq('business_owner_id', context.businessOwnerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PUT /api/team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/team — Remove team member (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (context.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only owners can remove team members' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('business_owner_id', context.businessOwnerId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    console.error('DELETE /api/team error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
