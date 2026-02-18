import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';
import { MembershipMember } from '@/types/data';

export const dynamic = 'force-dynamic';

const { handleGet, handlePost } = createCrudHandlers<MembershipMember>('memberships', {
  searchFields: ['client_name', 'client_email', 'plan_name'],
  requiredFields: ['client_name'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
