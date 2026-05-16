import { createBrowserClient } from "@supabase/ssr";

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "your-supabase-url-here") {
    // Return a mock client during build / when credentials aren't set
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signInWithOAuth: async () => ({ error: { message: "Supabase not configured" } }),
        signUp: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null }), order: () => ({ limit: async () => ({ data: [] }) }) }), order: () => ({ limit: async () => ({ data: [] }), data: [], error: null }), single: async () => ({ data: null }), data: [], error: null }), data: [], error: null }),
        insert: async () => ({ error: { message: "Supabase not configured" } }),
        update: () => ({ eq: async () => ({ error: { message: "Supabase not configured" } }) }),
        delete: () => ({ eq: async () => ({ error: { message: "Supabase not configured" } }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: "Supabase not configured" } }),
          createSignedUrl: async () => ({ error: { message: "Supabase not configured" } }),
          remove: async () => ({ error: null }),
        }),
      },
    };
  }

  supabase = createBrowserClient(url, key);
  return supabase;
}
