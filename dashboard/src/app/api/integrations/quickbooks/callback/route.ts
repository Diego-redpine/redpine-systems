// QuickBooks OAuth2 Callback — exchange code for tokens
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID || '';
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET || '';
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');
  const origin = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !realmId || !state) {
    return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=error&message=missing_params`);
  }

  try {
    const redirectUri = `${origin}/api/integrations/quickbooks/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=error&message=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Get company info
    let companyName = 'QuickBooks Company';
    try {
      const companyRes = await fetch(
        `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`,
        { headers: { 'Authorization': `Bearer ${tokens.access_token}`, 'Accept': 'application/json' } }
      );
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        companyName = companyData?.CompanyInfo?.CompanyName || companyName;
      }
    } catch { /* non-critical */ }

    // Save connection
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase
      .from('quickbooks_connections')
      .upsert({
        user_id: state,
        realm_id: realmId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        company_name: companyName,
        is_active: true,
        sync_status: 'idle',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (dbError) {
      return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=error&message=save_failed`);
    }

    return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=success`);
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?integration=quickbooks&status=error&message=oauth_failed`);
  }
}
