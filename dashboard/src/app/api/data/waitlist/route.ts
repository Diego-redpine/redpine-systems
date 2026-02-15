import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Record<string, unknown>>('waitlist', {
  searchFields: ['customer_name', 'customer_phone'],
  requiredFields: ['customer_name', 'party_size'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
