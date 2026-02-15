// QuickBooks OAuth2 Connect — redirect user to Intuit authorization
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext } from '@/lib/crud';

export const dynamic = 'force-dynamic';

const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID || '';
const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const SCOPES = 'com.intuit.quickbooks.accounting';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!QB_CLIENT_ID) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/integrations/quickbooks/callback`;
    const state = ctx.userId; // Use userId as state for verification

    const authUrl = new URL(QB_AUTH_URL);
    authUrl.searchParams.set('client_id', QB_CLIENT_ID);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
