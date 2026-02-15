// Forms API - CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Form } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Form>('forms', {
  searchFields: ['name', 'description'],
  requiredFields: ['name'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
