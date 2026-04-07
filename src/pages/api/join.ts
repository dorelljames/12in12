import type { APIRoute } from "astro";
import { Client } from "@notionhq/client";
import { supabaseAdmin as supabase } from "../../lib/supabase";
import {
  PUBLIC_NOTION_TOKEN,
  PUBLIC_NOTION_DATABASE_ID,
} from "astro:env/server";

const notion = new Client({
  auth: PUBLIC_NOTION_TOKEN,
});

const DATABASE_ID = PUBLIC_NOTION_DATABASE_ID;

// Look up auth user ID by email via direct DB query (RPC)
// admin.listUsers filter is broken, so we use a Postgres function instead
async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_user_id_by_email", {
    lookup_email: email,
  });
  if (error || !data) return null;
  return data as string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get("name")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const reason = data.get("reason")?.toString().trim();
    const username = data.get("username")?.toString().trim();

    // Validate fields
    const errors: Record<string, string> = {};

    if (!name) {
      errors.name = "Please tell us your name";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!reason) {
      errors.reason = "Please share what excites you about the program";
    } else if (reason.length < 10) {
      errors.reason =
        "Please provide a bit more detail (at least 10 characters)";
    }

    if (!username) {
      errors.username = "Username is required";
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 400 },
      );
    }

    // Check if username is taken
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "This username is already taken.",
        }),
        { status: 400 },
      );
    }

    // Try to create auth user — this reliably detects existing emails
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: email!,
        email_confirm: false,
      });

    const redirectUrl = import.meta.env.DEV
      ? "http://localhost:1234/api/auth/confirm"
      : "https://12in12.pro/api/auth/confirm";

    let authUserId: string;

    if (createError) {
      if (
        createError.status === 422 &&
        createError.message.includes("already been registered")
      ) {
        // Email already exists in Auth — check if they have a profile
        const existingUserId = await findUserIdByEmail(email!);
        if (!existingUserId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Something went wrong. Please try again...",
            }),
            { status: 500 },
          );
        }

        const { data: existingUserProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", existingUserId)
          .single();

        if (existingUserProfile) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "This email is already registered. Please sign in instead.",
            }),
            { status: 400 },
          );
        }

        // Orphaned auth user — recover by creating profile below
        authUserId = existingUserId;
      } else {
        return new Response(
          JSON.stringify({ success: false, error: createError.message }),
          { status: 500 },
        );
      }
    } else {
      // New user created
      authUserId = newUser.user!.id;
    }

    // Send magic link
    await supabase.auth.signInWithOtp({
      email: email!,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectUrl,
      },
    });

    // Create Notion entry
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: name! } }] },
        Email: { email: email! },
        Reason: { rich_text: [{ text: { content: reason! } }] },
        Username: { rich_text: [{ text: { content: username! } }] },
      },
    });

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authUserId,
      username: username,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create user profile",
        }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { name, email, username },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong. Please try again...",
      }),
      { status: 500 },
    );
  }
};
