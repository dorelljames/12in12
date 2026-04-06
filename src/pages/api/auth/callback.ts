import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  if (!authCode && (!accessToken || !refreshToken)) {
    return new Response("No authentication credentials provided", {
      status: 400,
    });
  }

  let session;

  if (authCode) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      authCode as string
    );
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    session = data.session;
  } else {
    // Validate tokens with Supabase before trusting them
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken as string,
      refresh_token: refreshToken as string,
    });
    if (error || !data.session) {
      return new Response("Invalid authentication credentials", { status: 401 });
    }
    session = data.session;
  }

  cookies.set("sb-access-token", session.access_token, {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });
  cookies.set("sb-refresh-token", session.refresh_token, {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });

  return redirect("/profile");
};
