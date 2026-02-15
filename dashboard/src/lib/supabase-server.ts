import { createClient } from '@supabase/supabase-js';

// Server client - for use in API routes and server components
// Uses the service role key which BYPASSES Row Level Security (RLS)
// Only use this for admin operations or when you need to access all data
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Export a singleton instance for convenience in API routes
let serverClient: ReturnType<typeof createServerClient> | null = null;

export function getSupabaseServerClient() {
  if (!serverClient) {
    serverClient = createServerClient();
  }
  return serverClient;
}
