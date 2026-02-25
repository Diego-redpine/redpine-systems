import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers('commissions', {
  searchFields: ['staff_id', 'source_type'],
  requiredFields: ['staff_id', 'amount_cents', 'source_type'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
