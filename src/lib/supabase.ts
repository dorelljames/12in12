import { createClient } from "@supabase/supabase-js";

if (!import.meta.env.PUBLIC_SUPABASE_URL) {
  throw new Error("PUBLIC_SUPABASE_URL is required");
}

if (!import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("PUBLIC_SUPABASE_ANON_KEY is required");
}

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
    },
  }
);

if (!import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
}

export const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
