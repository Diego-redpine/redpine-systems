// Reviews API - CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Review } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Review>('reviews', {
  searchFields: ['customer', 'comment', 'source'],
  requiredFields: ['customer', 'rating'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
