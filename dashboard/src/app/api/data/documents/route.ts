// Documents API - F4 CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Document } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Document>('documents', {
  searchFields: ['name', 'folder'],
  requiredFields: ['name', 'file_url'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
