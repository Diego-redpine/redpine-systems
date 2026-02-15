// Signatures API - CRUD endpoints

import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { Signature } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<Signature>('signatures', {
  searchFields: ['document', 'signer', 'signer_email'],
  requiredFields: ['document', 'signer'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
