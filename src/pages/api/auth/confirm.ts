import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

// Handle POST request for access token authentication
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authentication credentials",
        }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;

    // Set auth cookies
    cookies.set("sb-access-token", access_token, {
      path: "/",
      secure: true,
      httpOnly: true,
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      secure: true,
      httpOnly: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to authenticate",
      }),
      { status: 500 }
    );
  }
};

// Handle GET request for OTP verification and other auth methods
export const GET: APIRoute = async ({ url, redirect, cookies }) => {
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/profile";

  // Handle PKCE flow with code
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      if (data.session) {
        // Set auth cookies
        cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          secure: true,
          httpOnly: true,
        });
        cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          secure: true,
          httpOnly: true,
        });
      }

      return redirect(next);
    } catch (error) {
      return redirect(
        `/signin?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Failed to authenticate"
        )}`
      );
    }
  }

  // Handle magic link/OTP verification
  if (token_hash && type) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (error) throw error;

      return redirect(`${next}?verified=true`);
    } catch (error) {
      return redirect(
        `/signin?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Failed to verify email"
        )}`
      );
    }
  }

  return redirect(
    `/signin?error=${encodeURIComponent("Invalid confirmation link")}`
  );
};
