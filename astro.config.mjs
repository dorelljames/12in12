// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind()],
  adapter: cloudflare(),
  redirects: {
    "/login": "/signin",
    "/register": "/signin",
    "/forgot-password": "/signin",
    "/forgot": "/signin",
  },
  env: {
    schema: {
      PUBLIC_NOTION_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
      PUBLIC_NOTION_DATABASE_ID: envField.string({
        context: "server",
        access: "public",
        default: "1723f8eda070805daf58f1a9ce5a5982",
      }),
      PUBLIC_SUPABASE_URL: envField.string({
        context: "server",
        access: "public",
        default: "https://xhuxnorklwvihqnchucf.supabase.co",
      }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      DISCORD_INVITE_URL: envField.string({
        context: "server",
        access: "public",
        default: "https://discord.gg/SGXHPpCTZ4",
      }),
    },
    validateSecrets: true,
  },
});
