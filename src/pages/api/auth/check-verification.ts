import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the user is logged in and their email matches
    const verified =
      session?.user?.email === email && session?.user?.email_confirmed_at;

    return new Response(
      JSON.stringify({
        success: true,
        verified,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking verification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to check verification status",
      }),
      { status: 500 }
    );
  }
};
