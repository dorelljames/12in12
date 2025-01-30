import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username } = await request.json();
    console.log("Claiming username:", username);

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Session:", session?.user?.id);

    if (!session) {
      console.log("No session found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "You must be logged in to claim a username",
        }),
        { status: 401 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned
      console.error("Error checking username:", checkError);
      throw checkError;
    }

    if (existingUser) {
      console.log("Username already taken:", username);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Username is already taken",
        }),
        { status: 400 }
      );
    }

    // Create or update profile with claimed username
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        username,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (upsertError) {
      console.error("Error upserting profile:", upsertError);
      throw upsertError;
    }

    console.log("Successfully claimed username:", username);
    return new Response(
      JSON.stringify({
        success: true,
        data: { username },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error claiming username:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to claim username",
      }),
      { status: 500 }
    );
  }
};
