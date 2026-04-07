import type { APIRoute } from "astro";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { OPENAI_API_KEY } from "astro:env/server";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI enhancement is not configured" }),
        { status: 503 }
      );
    }

    // Auth check
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (authError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { text, field } = await request.json();

    if (!text || text.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Please write at least a few words first" }),
        { status: 400 }
      );
    }

    const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

    const prompts: Record<string, string> = {
      description:
        "You are a writing assistant for builders. Take the user's rough description of their project/bet and polish it into a clear, compelling 2-3 sentence description. Keep the builder's voice and intent. Don't add information that isn't there. Don't use buzzwords or hype. Just make it read well.",
      lessons_learned:
        "You are a writing assistant for builders. Take the user's rough notes about what they learned and polish them into clear, insightful reflections. Keep it authentic and first-person. Don't add lessons they didn't mention.",
      update:
        "You are a writing assistant for builders sharing progress updates. Take the user's rough update and polish it into a clear, readable update. Keep it concise and authentic. Don't add information that isn't there.",
    };

    const systemPrompt = prompts[field] || prompts.description;

    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: systemPrompt,
      prompt: text,
    });

    return new Response(
      JSON.stringify({ enhanced: result.text }),
      { status: 200 }
    );
  } catch (error) {
    console.error("AI enhance error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to enhance text",
      }),
      { status: 500 }
    );
  }
};
