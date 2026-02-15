import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Record<string, unknown>>('waste_log', {
  searchFields: ['item_name', 'reason', 'logged_by'],
  requiredFields: ['item_name', 'quantity'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
