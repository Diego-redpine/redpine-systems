// Products by ID API - F4 CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Product } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGetById, handlePut, handleDelete } = createCrudHandlers<Product>('products', {
  searchFields: ['name', 'description', 'sku', 'category'],
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
