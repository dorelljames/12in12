import type { APIRoute } from "astro";
import { Client } from "@notionhq/client";
import { supabaseAdmin as supabase } from "../../lib/supabase";
import { normalizeEmail } from "../../lib/utils";
import {
  PUBLIC_NOTION_TOKEN,
  PUBLIC_NOTION_DATABASE_ID,
} from "astro:env/server";

const notion = new Client({
  auth: PUBLIC_NOTION_TOKEN,
});

const DATABASE_ID = PUBLIC_NOTION_DATABASE_ID;

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

    // If there are any errors, return them
    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors,
        }),
        {
          status: 400,
        },
      );
    }

    // Check if user already exists in Supabase
    const normalizedEmail = normalizeEmail(email!);

    // Check existing profiles by normalized email pattern
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

    // Try to find user by email via admin API
    const {
      data: { users: matchedUsers },
      error: getUserError,
    } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${normalizedEmail}`,
      perPage: 1,
    });

    if (getUserError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to check user existence",
        }),
        { status: 500 },
      );
    }

    if (matchedUsers && matchedUsers.length > 0) {
      const existingUser = matchedUsers[0];

      // Check if this auth user already has a profile
      const { data: existingUserProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", existingUser.id)
        .single();

      if (existingUserProfile) {
        // Fully registered user — direct them to sign in
        return new Response(
          JSON.stringify({
            success: false,
            error: "This email is already registered. Please sign in instead.",
          }),
          { status: 400 },
        );
      }

      // Orphaned auth user (exists in Auth but no profile) — recover their account
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: name! } }] },
          Email: { email: email! },
          Reason: { rich_text: [{ text: { content: reason! } }] },
          Username: { rich_text: [{ text: { content: username! } }] },
        },
      });

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: existingUser.id,
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

      // Resend magic link to complete sign-in
      const redirectUrl = import.meta.env.DEV
        ? "http://localhost:1234/api/auth/confirm"
        : "https://12in12.pro/api/auth/confirm";

      await supabase.auth.signInWithOtp({
        email: existingUser.email!,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectUrl,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: { name, email, username },
        }),
        { status: 200 },
      );
    }

    // Create Notion entry
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name!,
              },
            },
          ],
        },
        Email: {
          email: email!,
        },
        Reason: {
          rich_text: [
            {
              text: {
                content: reason!,
              },
            },
          ],
        },
        Username: {
          rich_text: [
            {
              text: {
                content: username!,
              },
            },
          ],
        },
      },
    });

    // Create the supabase user via OTP
    const redirectUrl = import.meta.env.DEV
      ? "http://localhost:1234/api/auth/confirm"
      : "https://12in12.pro/api/auth/confirm";

    const { error } = await supabase.auth.signInWithOtp({
      email: email!,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 },
      );
    }

    // Find the newly created user by email
    const {
      data: { users: newUsers },
      error: findError,
    } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${email}`,
      perPage: 1,
    });

    const newUser = newUsers?.[0];

    if (findError || !newUser?.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create user profile",
        }),
        { status: 500 },
      );
    }

    // Create the initial profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: newUser.id,
      username: username,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create user profile",
        }),
        {
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name,
          email,
          username,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong. Please try again...",
      }),
      {
        status: 500,
      },
    );
  }
};
