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
    const file = formData.get("thumbnail") as File;
    const projectId = formData.get("projectId") as string;

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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 10MB" }),
        { status: 400 }
      );
    }

    // Create a unique file path including user ID and project thumbnails folder
    const fileExt = file.name.split(".").pop();
    const filePath = `thumbnails/${user.id}/${
      projectId ? projectId + "-" : ""
    }${Date.now()}.${fileExt}`;

    // If projectId is provided, delete old thumbnail if it exists
    if (projectId) {
      const { data: project } = await supabase
        .from("products")
        .select("thumbnail_url")
        .eq("id", projectId)
        .single();

      if (project?.thumbnail_url) {
        try {
          const oldFilePath = new URL(project.thumbnail_url).pathname
            .split("/")
            .slice(-3)
            .join("/");
          if (oldFilePath) {
            await supabase.storage.from("thumbnails").remove([oldFilePath]);
          }
        } catch (error) {
          console.error("Error removing old thumbnail:", error);
          // Continue even if old thumbnail deletion fails
        }
      }
    }

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload new thumbnail
    const { data, error: uploadError } = await supabase.storage
      .from("thumbnails")
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
    } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

    // If projectId is provided, update the project with new thumbnail URL
    if (projectId) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          thumbnail_url: publicUrl,
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project:", updateError);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { thumbnail_url: publicUrl },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload thumbnail",
      }),
      { status: 500 }
    );
  }
};
