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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const amount = body.amount ?? 1;

    const supabase = getSupabaseAdmin();

    // Get current balance
    let { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!credits) {
      // Auto-create
      const { data: newCredits } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, free_balance: FREE_MONTHLY_CREDITS, purchased_balance: 0 })
        .select()
        .single();
      credits = newCredits;
    }

    if (!credits) {
      return NextResponse.json({ success: false, error: 'Failed to access credits' }, { status: 500 });
    }

    // Check if free credits need reset
    const resetAt = new Date(credits.free_reset_at);
    const now = new Date();
    const daysSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= FREE_RESET_DAYS) {
      credits.free_balance = FREE_MONTHLY_CREDITS;
      credits.free_reset_at = now.toISOString();
    }

    const total = credits.free_balance + credits.purchased_balance;
    if (total < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        balance: { free_balance: credits.free_balance, purchased_balance: credits.purchased_balance, total },
      }, { status: 402 });
    }

    // Deduct: free first, then purchased
    let freeDeduct = Math.min(credits.free_balance, amount);
    let purchasedDeduct = amount - freeDeduct;

    const updates: Record<string, unknown> = {
      free_balance: credits.free_balance - freeDeduct,
      purchased_balance: credits.purchased_balance - purchasedDeduct,
      updated_at: now.toISOString(),
    };
    if (daysSinceReset >= FREE_RESET_DAYS) {
      updates.free_reset_at = now.toISOString();
    }

    const { data: updated, error } = await supabase
      .from('user_credits')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Credit deduction error:', error);
      return NextResponse.json({ success: false, error: 'Failed to deduct credits' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      consumed: amount,
      balance: {
        free_balance: updated.free_balance,
        purchased_balance: updated.purchased_balance,
        total: updated.free_balance + updated.purchased_balance,
      },
    });
  } catch (e) {
    console.error('Credits consume error:', e);
    return NextResponse.json({ success: false, error: 'Failed to consume credits' }, { status: 500 });
  }
}
