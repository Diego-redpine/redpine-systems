// Notion auth helper — retrieves and decrypts the stored Notion token

import { getSupabaseAdmin } from '@/lib/api-helpers';
import { decrypt } from '@/lib/encryption';

/**
 * Get the decrypted Notion access token for a user.
 * Notion tokens do not expire, so no refresh logic is needed.
 * Returns null if the user has no active Notion connection.
 */
export async function getNotionToken(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('integration_connections')
    .select('access_token, is_active')
    .eq('user_id', userId)
    .eq('provider', 'notion')
    .single();

  if (error || !data) return null;
  if (!data.is_active) return null;

  try {
    return decrypt(data.access_token);
  } catch {
    console.error('Failed to decrypt Notion token for user:', userId);
    return null;
  }
}

/** Standard headers for Notion API requests */
export function notionHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
}
