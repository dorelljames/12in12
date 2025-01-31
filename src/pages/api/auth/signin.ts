import type { APIRoute } from "astro";
import { supabase, supabaseAdmin } from "../../../lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const provider = formData.get("provider")?.toString();

  if (provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: import.meta.env.DEV
          ? "http://localhost:1234/api/auth/callback"
          : "https://12in12.pro/api/auth/callback",
      },
    });

    if (error) {
      return redirect(`/signin?error=${encodeURIComponent(error.message)}`);
    }

    return redirect(data.url);
  }

  if (!email) {
    return redirect("/signin?error=Email is required!");
  }

  try {
    // Check if user exists first
    const {
      data: { users },
    } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = users.some((user) => user.email === email);

    if (!userExists) {
      return redirect(
        `/signin?error=${encodeURIComponent(
          "No account associated with this email. Please use the link below to join the community..."
        )}`
      );
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Ensure we don't create new users
        emailRedirectTo: import.meta.env.DEV
          ? "http://localhost:1234/api/auth/callback"
          : "https://12in12.pro/api/auth/callback",
      },
    });

    if (error) {
      return redirect(`/signin?error=${encodeURIComponent(error.message)}`);
    }

    return redirect("/signin?success=true");
  } catch (err) {
    const error = err as Error;
    return redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }
};
