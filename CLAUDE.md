# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**12 in 12** is a community platform for the "12 products in 12 months" challenge. Builders create accounts, register monthly projects, share updates, receive comments, and maintain public profiles. Built with Astro SSR + Supabase + Cloudflare Workers.

## Commands

```bash
pnpm dev          # Dev server on http://localhost:1234
pnpm build        # Production build (Cloudflare Workers output)
pnpm preview      # Preview production build locally
pnpm test         # Run tests once
pnpm test:watch   # Run tests in watch mode
```

Tests use Vitest. Test files live next to the code they test (`*.test.ts`). No linter is configured.

## Tech Stack

- **Framework**: Astro 6 with SSR (`output: "server"`)
- **Deployment**: Cloudflare Workers via `@astrojs/cloudflare`
- **Database & Auth**: Supabase (PostgreSQL + Auth with PKCE flow)
- **Styling**: Tailwind CSS 3
- **Package Manager**: pnpm
- **Notion API**: Used for content/data integration

## Architecture

### Two Supabase Clients (`src/lib/supabase.ts`)

- `supabase` — anon key client for auth flows and user-scoped queries
- `supabaseAdmin` — service role client for admin operations (bypasses RLS)

Both import env vars from `astro:env/server`, not `import.meta.env`.

### Two Layout Components

- `Layout.astro` — Main site layout with analytics scripts, used by public pages
- `Base.astro` — Minimal layout with SEO meta tags, used by auth/dashboard pages

### Authentication Pattern

Auth uses Supabase PKCE flow with tokens stored in cookies (`sb-access-token`, `sb-refresh-token`). The middleware (`src/middleware/index.ts`) handles three route types:
- **Protected routes** (`/dashboard`): Require valid session, redirect to `/signin`
- **Redirect routes** (`/signin`, `/register`): Redirect authenticated users to `/profile`
- **Protected API routes** (`/api/guestbook`): Return 401 if unauthenticated

Most API routes handle auth inline by reading cookies and calling `supabase.auth.setSession()` rather than relying on middleware.

### API Routes (`src/pages/api/`)

All API endpoints are Astro server endpoints returning JSON. Pattern:
1. Extract cookies for auth tokens
2. Call `supabase.auth.setSession()` to validate
3. Perform Supabase queries
4. Return `new Response(JSON.stringify(...))` with status codes

Key route groups: `auth/`, `profile/`, `projects/`, `comments/`, `notifications/`, `updates/`

### Dynamic Routes

- `[username].astro` — Public builder profile pages
- `projects/[slug].astro` — Individual project detail pages

### Client-Side Interactivity

No frontend framework (React, Vue, etc.). All client-side behavior uses vanilla JS in `<script>` tags within Astro components. Forms use standard HTML form submission enhanced with JavaScript.

## Database

Supabase PostgreSQL with Row Level Security (RLS). Migrations live in `supabase/migrations/`.

Key tables: `profiles`, `products` (projects), `product_updates`, `comments`, `social_links`, `notifications`, `guestbook`

- `products.slug` is unique and used for URL routing
- `profiles.username` is unique and used for public profile URLs
- Notifications are created when comments are posted (notifies project owner)

## Environment Variables

Defined with type validation in `astro.config.mjs` under `env.schema`. Required secrets:
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_NOTION_TOKEN`

Access env vars via `astro:env/server` imports, not `process.env` or `import.meta.env`.
