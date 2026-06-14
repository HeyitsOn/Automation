import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
  if (!_instance) {
    _instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _instance;
}

// Proxy so all existing imports work unchanged — client is only created on first request, not at build time
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getInstance() as any)[prop];
  },
});
