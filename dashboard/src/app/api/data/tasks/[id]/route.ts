// Tasks by ID API - F4 CRUD endpoints + F1-B Pipeline Move

import { NextRequest, NextResponse } from 'next/server';
import { createCrudHandlers, getAuthenticatedUser, getSupabaseAdmin } from '@/lib/crud';
import { Task } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGetById, handlePut, handleDelete } = createCrudHandlers<Task>('tasks', {
  searchFields: ['title', 'description'],
  requiredFields: ['title'],
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

// PATCH /api/data/tasks/[id] - Move task to different pipeline stage (F1-B Task 13)
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

    // Update only the stage_id field
    const { data, error } = await supabase
      .from('tasks')
      .update({
        stage_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('PATCH tasks error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Task not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Task moved to stage ${stage_id}`,
    });
  } catch (error) {
    console.error('PATCH tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move task' },
      { status: 500 }
    );
  }
}
