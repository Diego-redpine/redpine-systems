import { NextRequest, NextResponse } from 'next/server';
import { createCrudHandlers, getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';
import { MembershipMember } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGetById, handlePut, handleDelete } = createCrudHandlers<MembershipMember>('memberships', {
  searchFields: ['client_name', 'client_email', 'plan_name'],
  requiredFields: ['client_name'],
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetById(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handlePut(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDelete(request, id);
}

// PATCH - Move member to different plan (pipeline stage)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { stage_id } = body;

    if (!stage_id) {
      return NextResponse.json(
        { success: false, error: 'stage_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('memberships')
      .update({
        stage_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('PATCH memberships error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Member not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Member moved to plan ${stage_id}`,
    });
  } catch (error) {
    console.error('PATCH memberships error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move member' },
      { status: 500 }
    );
  }
}
