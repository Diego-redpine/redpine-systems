import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { FREE_MONTHLY_CREDITS, FREE_RESET_DAYS } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get or create credit record
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !credits) {
      // Auto-create on first access
      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, free_balance: FREE_MONTHLY_CREDITS, purchased_balance: 0 })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create credits:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to initialize credits' }, { status: 500 });
      }
      credits = newCredits;
    }

    // Check if free credits need reset
    const resetAt = new Date(credits.free_reset_at);
    const now = new Date();
    const daysSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= FREE_RESET_DAYS) {
      const { data: updated } = await supabase
        .from('user_credits')
        .update({ free_balance: FREE_MONTHLY_CREDITS, free_reset_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updated) credits = updated;
    }

    // Calculate next reset date
    const nextReset = new Date(credits.free_reset_at);
    nextReset.setDate(nextReset.getDate() + FREE_RESET_DAYS);

    return NextResponse.json({
      success: true,
      balance: {
        free_balance: credits.free_balance,
        purchased_balance: credits.purchased_balance,
        total: credits.free_balance + credits.purchased_balance,
        free_reset_at: credits.free_reset_at,
        next_reset: nextReset.toISOString(),
      },
    });
  } catch (e) {
    console.error('Credits balance error:', e);
    return NextResponse.json({ success: false, error: 'Failed to get balance' }, { status: 500 });
  }
}
