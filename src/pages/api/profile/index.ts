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
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get request body
    const body = await request.json();
    const { username, full_name, bio, avatar_url, social_links } = body;

    // Only run username check and profile upsert when profile fields are provided
    const hasProfileFields = username || full_name || bio || avatar_url;

    if (hasProfileFields) {
      // Check if username is already taken (excluding current user)
      if (username) {
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
      }

      // Build update data with only provided fields
      const updateData: Record<string, string> = { user_id: user.id };
      if (username) updateData.username = username;
      if (full_name) updateData.full_name = full_name;
      if (bio) updateData.bio = bio;
      if (avatar_url) updateData.avatar_url = avatar_url;

      // Update profile
      const { error: updateError } = await supabase.from("profiles").upsert(
        updateData,
        {
          onConflict: "user_id",
        }
      );

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }
    }

    // Update social links
    if (social_links) {
      if (social_links.length === 0) {
        // If empty array, delete all social links
        await supabase
          .from("social_links")
          .delete()
          .eq("user_id", user.id);
      } else {
        // Upsert each social link (unique on user_id + platform)
        const { error: upsertError } = await supabase
          .from("social_links")
          .upsert(
            social_links.map((link: { platform: string; url: string }) => ({
              user_id: user.id,
              platform: link.platform,
              url: link.url,
            })),
            { onConflict: "user_id,platform" }
          );

        if (upsertError) {
          console.error("Error updating social links:", upsertError);
          throw upsertError;
        }

        // Remove platforms that are no longer in the list
        const platforms = social_links.map(
          (link: { platform: string }) => link.platform
        );
        await supabase
          .from("social_links")
          .delete()
          .eq("user_id", user.id)
          .not("platform", "in", `(${platforms.join(",")})`);
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
