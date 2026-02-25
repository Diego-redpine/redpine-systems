import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers('coupons', {
  searchFields: ['code'],
  requiredFields: ['code', 'type', 'value'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
