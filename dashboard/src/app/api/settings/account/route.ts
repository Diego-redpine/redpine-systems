import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// POST /api/settings/account - Account operations
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const { action } = body;

  if (!action) return badRequestResponse('action is required');

  const supabase = getSupabaseAdmin();

  switch (action) {
    case 'change_password': {
      const { newPassword } = body;
      if (!newPassword || newPassword.length < 6) {
        return badRequestResponse('Password must be at least 6 characters');
      }

      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (error) return serverErrorResponse(error);
      return successResponse({ message: 'Password updated successfully' });
    }

    case 'delete_account': {
      // Cancel Stripe subscription if active
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_subscription_id')
        .eq('id', user.id)
        .single();

      if (profile?.stripe_subscription_id) {
        try {
          const { stripe } = await import('@/lib/stripe');
          await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        } catch (stripeErr) {
          console.error('Failed to cancel Stripe subscription:', stripeErr);
        }
      }

      // Delete user data
      const tables = ['clients', 'appointments', 'invoices', 'payments', 'expenses', 'todos', 'products', 'staff', 'leads', 'messages', 'documents'];
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', user.id);
      }

      // Delete profile and auth user
      await supabase.from('profiles').delete().eq('id', user.id);
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) return serverErrorResponse(error);
      return successResponse({ message: 'Account deleted' });
    }

    default:
      return badRequestResponse(`Unknown action: ${action}`);
  }
}
