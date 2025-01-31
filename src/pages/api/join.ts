import type { APIRoute } from "astro";
import { Client } from "@notionhq/client";
import { supabaseAdmin as supabase } from "../../lib/supabase";

// Function to normalize email addresses by removing + suffix
function normalizeEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const normalizedLocal = localPart.split("+")[0];
  return `${normalizedLocal}@${domain}`;
}

const notion = new Client({
  auth: import.meta.env.PUBLIC_NOTION_TOKEN,
});

const DATABASE_ID = import.meta.env.PUBLIC_NOTION_DATABASE_ID;

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
        }
      );
    }

    // Check if user already exists in Supabase
    const {
      data: { users: existingUsers },
      error: getUserError,
    } = await supabase.auth.admin.listUsers();

    // Normalize the input email
    const normalizedEmail = normalizeEmail(email!);

    // Check for existing users with normalized email
    const existingUser = existingUsers.find(
      (user) => normalizeEmail(user.email || "") === normalizedEmail
    );

    if (getUserError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to check user existence",
        }),
        {
          status: 500,
        }
      );
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "This email is already registered. Please sign in instead.",
        }),
        {
          status: 400,
        }
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

    // Let's create the supabase user
    const { error } = await supabase.auth.signInWithOtp({
      email: email!,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: import.meta.env.DEV
          ? "http://localhost:1234/api/auth/confirm"
          : "https://12in12.pro/api/auth/confirm",
      },
    });

    if (error) {
      console.log("🚀 ~ constPOST:APIRoute= ~ error:", error);
      return new Response(error.message, { status: 500 });
    }

    // Get the user ID from the OTP signup - we need to list users again to get the newly created user
    const {
      data: { users: allUsers },
    } = await supabase.auth.admin.listUsers();

    // Use normalized email to find the new user
    const newUser = allUsers.find(
      (user) => normalizeEmail(user.email || "") === normalizedEmail
    );

    if (!newUser?.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create user profile",
        }),
        {
          status: 500,
        }
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
        }
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
      }
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
      }
    );
  }
};
