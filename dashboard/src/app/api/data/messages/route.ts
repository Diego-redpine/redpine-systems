// Messages API - F4 CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Message } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Message>('messages', {
  searchFields: ['subject', 'content'],
  requiredFields: ['content'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
