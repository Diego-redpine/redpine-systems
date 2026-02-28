// Leads by ID API - F4 CRUD endpoints + F1-B Pipeline Move

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createCrudHandlers, getAuthenticatedUser, getSupabaseUser } from '@/lib/crud';
import { Lead } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGetById, handlePut, handleDelete } = createCrudHandlers<Lead>('leads', {
  searchFields: ['name', 'email', 'source'],
  requiredFields: ['name'],
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

// PATCH /api/data/leads/[id] - Move lead to different pipeline stage (F1-B Task 13)
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

    const supabase = getSupabaseUser(request);

    // Update only the stage_id field
    const { data, error } = await supabase
      .from('leads')
      .update({
        stage_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('PATCH leads error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Lead not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Lead moved to stage ${stage_id}`,
    });
  } catch (error) {
    console.error('PATCH leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move lead' },
      { status: 500 }
    );
  }
}
