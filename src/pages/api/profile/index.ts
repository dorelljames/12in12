import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get auth tokens from cookies
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Set the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    console.log("🚀 ~ constPOST:APIRoute= ~ user:", user);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get request body
    const body = await request.json();
    const { username, full_name, bio, avatar_url, social_links } = body;

    // Check if username is already taken (excluding current user)
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned
      console.error("Error checking username:", checkError);
      throw checkError;
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Username is already taken",
        }),
        { status: 400 }
      );
    }

    // Update profile
    const { error: updateError } = await supabase.from("profiles").upsert(
      {
        username,
        full_name,
        bio,
        avatar_url,
        user_id: user.id,
      },
      {
        onConflict: "user_id",
      }
    );

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    // Update social links
    if (social_links && social_links.length > 0) {
      // First, delete all existing social links
      const { error: deleteError } = await supabase
        .from("social_links")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting social links:", deleteError);
        throw deleteError;
      }

      // Then, insert new social links
      const { error: insertError } = await supabase.from("social_links").insert(
        social_links.map((link: { platform: string; url: string }) => ({
          user_id: user.id,
          platform: link.platform,
          url: link.url,
        }))
      );

      if (insertError) {
        console.error("Error inserting social links:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Oops, we failed to update your profile",
      }),
      { status: 500 }
    );
  }
};
