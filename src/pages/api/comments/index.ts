import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  try {
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
      });
    }

    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(comments));
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch comments" }), {
      status: 500,
    });
  }
};

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
    const { productId, content } = await request.json();

    if (!productId || !content) {
      return new Response(
        JSON.stringify({ error: "Product ID and content are required" }),
        { status: 400 }
      );
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        product_id: productId,
        user_id: user.id,
        content,
      })
      .select(
        `
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(comment));
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create comment" }), {
      status: 500,
    });
  }
};
