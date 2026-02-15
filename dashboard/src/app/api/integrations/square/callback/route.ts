import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/api-helpers';
import { getPaymentProcessor } from '@/lib/payment-providers';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

// GET /api/integrations/square/callback - Handle Square OAuth return
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id
  const error = searchParams.get('error');
  const origin = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(`${origin}/dashboard?integration=square&status=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?integration=square&status=error&message=missing_params`);
  }

  try {
    const processor = await getPaymentProcessor('square');
    const redirectUri = `${origin}/api/integrations/square/callback`;
    const result = await processor.handleCallback(code, redirectUri);

    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('payment_connections')
      .upsert(
        {
          user_id: state,
          provider: 'square',
          account_id: result.accountId,
          access_token: encrypt(result.accessToken),
          refresh_token: result.refreshToken ? encrypt(result.refreshToken) : null,
          token_expires_at: result.expiresAt?.toISOString() || null,
          metadata: result.metadata || {},
          is_active: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      );

    if (dbError) {
      console.error('Failed to save Square connection:', dbError);
      return NextResponse.redirect(`${origin}/dashboard?integration=square&status=error&message=save_failed`);
    }

    return NextResponse.redirect(`${origin}/dashboard?integration=square&status=success`);
  } catch (err) {
    console.error('Square callback error:', err);
    return NextResponse.redirect(`${origin}/dashboard?integration=square&status=error&message=oauth_failed`);
  }
}
