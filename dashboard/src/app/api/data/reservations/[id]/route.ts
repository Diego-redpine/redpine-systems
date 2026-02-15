import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const { handleGetById, handlePut, handleDelete } = createCrudHandlers('reservations', {
  searchFields: ['title', 'description', 'contact_id'],
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
