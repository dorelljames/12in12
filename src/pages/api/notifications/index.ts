import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Fetch notifications with related data
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      comment:comments(
        id,
        product:products(
          title,
          slug
        ),
        profile:profiles(
          full_name,
          avatar_url
        ),
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // Transform the data to include actor name and project title
  const transformedNotifications = notifications.map((notification) => ({
    ...notification,
    actor_name: notification.comment?.profile?.full_name || "Some builder",
    actor_avatar_url: notification.comment?.profile?.avatar_url,
    project_title: notification.comment?.product?.title,
    project_slug: notification.comment?.product?.slug,
  }));

  return new Response(
    JSON.stringify({ notifications: transformedNotifications }),
    {
      status: 200,
    }
  );
};
