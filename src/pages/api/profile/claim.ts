import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username } = await request.json();

    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ success: false, error: "You must be logged in to claim a username" }),
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "You must be logged in to claim a username" }),
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
      throw checkError;
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Username is already taken" }),
        { status: 400 }
      );
    }

    // Create or update profile with claimed username
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        username,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ success: true, data: { username } }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to claim username",
      }),
      { status: 500 }
    );
  }
};
