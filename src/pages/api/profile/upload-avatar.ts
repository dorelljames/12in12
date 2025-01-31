import type { APIRoute } from "astro";
import { supabaseAdmin as supabase } from "../../../lib/supabase";

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

    // Get the file from form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "File must be an image" }), {
        status: 400,
      });
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 2MB" }),
        { status: 400 }
      );
    }

    // Create a unique file path including user ID and avatars folder
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

    // Delete old avatar if it exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single();

    if (profile?.avatar_url) {
      try {
        const oldFilePath = new URL(profile.avatar_url).pathname
          .split("/")
          .slice(-3)
          .join("/");
        if (oldFilePath) {
          await supabase.storage.from("avatars").remove([oldFilePath]);
        }
      } catch (error) {
        console.error("Error removing old avatar:", error);
        // Continue even if old avatar deletion fails
      }
    }

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload new avatar
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update user's profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { avatar_url: publicUrl },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload avatar",
      }),
      { status: 500 }
    );
  }
};
