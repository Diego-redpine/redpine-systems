import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/integrations/status - List user's payment + data connections
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = getSupabaseAdmin();

  // Fetch both connection types in parallel
  const [paymentResult, dataResult] = await Promise.all([
    supabase
      .from('payment_connections')
      .select('id, provider, account_id, is_active, connected_at, metadata')
      .eq('user_id', user.id),
    supabase
      .from('integration_connections')
      .select('id, provider, is_active, connected_at, metadata')
      .eq('user_id', user.id),
  ]);

  if (paymentResult.error) return serverErrorResponse(paymentResult.error);
  if (dataResult.error) return serverErrorResponse(dataResult.error);

  // Never expose tokens — only return safe fields
  return successResponse({
    paymentConnections: (paymentResult.data || []).map(conn => ({
      id: conn.id,
      provider: conn.provider,
      accountId: conn.account_id,
      isActive: conn.is_active,
      connectedAt: conn.connected_at,
      metadata: conn.metadata,
    })),
    dataConnections: (dataResult.data || []).map(conn => ({
      id: conn.id,
      provider: conn.provider,
      isActive: conn.is_active,
      connectedAt: conn.connected_at,
      metadata: conn.metadata,
    })),
  });
}
