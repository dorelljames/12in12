import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

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
    const emailConfirmed = session?.user?.email_confirmed_at ? true : false;
    const isCurrentUser = session?.user?.email === email;

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        emailConfirmed,
        isCurrentUser,
        message: !verified
          ? !emailConfirmed
            ? "Please check your email to confirm your account"
            : !isCurrentUser
            ? "Email does not match current user"
            : "Unknown verification error"
          : "Email verified successfully",
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
