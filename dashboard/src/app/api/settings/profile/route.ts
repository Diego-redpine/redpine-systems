import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/settings/profile - Get current user's profile
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}

// PUT /api/settings/profile - Update profile fields
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const allowedFields = [
    'business_name',
    'phone',
    'address',
    'business_type',
    'hours',
    'notification_email',
    'notification_sms',
    'notification_push',
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}
