// Notion OAuth Connect — redirects user to Notion authorization page

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/integrations/notion/callback`;
  const clientId = process.env.NOTION_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Notion integration not configured' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    owner: 'user',
    state: user.id,
  });

  return NextResponse.redirect(
    `https://api.notion.com/v1/oauth/authorize?${params.toString()}`
  );
}
