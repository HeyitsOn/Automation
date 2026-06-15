import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
  if (!_instance) {
    _instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _instance;
}

// Lazy proxy — createClient is only called on first property access (client-side),
// never at module evaluation time (which runs during SSR/build).
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getInstance() as any)[prop];
  },
});
