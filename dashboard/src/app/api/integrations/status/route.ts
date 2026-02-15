import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/integrations/status - List user's payment connections
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('payment_connections')
    .select('id, provider, account_id, is_active, connected_at, metadata')
    .eq('user_id', user.id);

  if (error) return serverErrorResponse(error);

  // Never expose tokens — only return safe fields
  return successResponse(
    (data || []).map(conn => ({
      id: conn.id,
      provider: conn.provider,
      accountId: conn.account_id,
      isActive: conn.is_active,
      connectedAt: conn.connected_at,
      metadata: conn.metadata,
    }))
  );
}
