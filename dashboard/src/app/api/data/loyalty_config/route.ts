import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/data/loyalty_config — Get user's loyalty config (single row)
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseUser(request);
  const { data, error } = await supabase
    .from('loyalty_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return serverErrorResponse(error);
  return successResponse(data || null);
}

// POST /api/data/loyalty_config — Upsert loyalty config
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const supabase = getSupabaseUser(request);

  const upsertData = {
    user_id: user.id,
    program_name: body.program_name ?? 'Rewards',
    points_per_dollar: body.points_per_dollar ?? 1,
    reward_threshold: body.reward_threshold ?? 100,
    reward_type: body.reward_type ?? 'discount',
    reward_value_cents: body.reward_value_cents ?? 500,
    reward_description: body.reward_description ?? null,
    tiers: body.tiers ?? [],
    bonus_rules: body.bonus_rules ?? [],
    is_active: body.is_active ?? false,
    welcome_bonus: body.welcome_bonus ?? 0,
    birthday_bonus: body.birthday_bonus ?? 0,
    referral_bonus: body.referral_bonus ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('loyalty_config')
    .upsert(upsertData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return serverErrorResponse(error);
  return successResponse(data);
}
