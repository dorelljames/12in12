import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email } = await request.json();

    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ success: true, verified: false, message: "Not logged in" }),
        { status: 200 }
      );
    }

    const { data: { user }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !user) {
      return new Response(
        JSON.stringify({ success: true, verified: false, message: "Session invalid" }),
        { status: 200 }
      );
    }

    const verified = user.email === email && !!user.email_confirmed_at;

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        message: verified
          ? "Email verified successfully"
          : "Please check your email to confirm your account",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Failed to check verification status" }),
      { status: 500 }
    );
  }
};
