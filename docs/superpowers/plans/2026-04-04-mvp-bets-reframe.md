# MVP: Bets Reframe & Community Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform 12in12 from a fixed 12-month project tracker into a flexible builder community centered on "bets" with narrative storytelling and a shared community feed.

**Architecture:** Six sequential tasks: (1) clean up dead code/debug logs, (2) database migration adding `started_at`/`deadline` columns and making `month` nullable, (3) update API routes to accept new fields and remove month-uniqueness constraint, (4) reframe UI language and replace the 12-month grid with dynamic bet cards, (5) add narrative prompts to the project modal on status transitions, (6) build a new `/feed` page showing all builder updates.

**Tech Stack:** Astro 6 SSR, Supabase PostgreSQL, Tailwind CSS 3, TypeScript, Cloudflare Workers

**Reference:** See `VISION.md` for full product context and decision rationale.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Delete | `src/pages/api/auth/register.ts` | Dead code — old password auth, unused |
| Delete | `src/pages/api/signup.json.ts` | Dead code — duplicate of `/api/join` |
| Modify | `src/middleware/index.ts` | Remove debug `console.log("ehree")` |
| Modify | `src/pages/api/updates.ts` | Remove debug console.logs |
| Modify | `src/pages/api/profile/index.ts` | Remove debug console.logs |
| Modify | `src/pages/api/profile/claim.ts` | Remove debug console.logs |
| Modify | `src/pages/api/join.ts` | Remove debug console.logs |
| Modify | `src/pages/api/comments/index.ts` | Remove debug console.logs |
| Modify | `src/pages/api/auth/confirm.ts` | Remove debug console.logs |
| Modify | `src/components/WelcomeSteps.astro` | Remove debug console.logs |
| Modify | `src/components/ProfileBanner.astro` | Remove debug console.logs |
| Create | `supabase/migrations/20240325000000_add_bet_fields.sql` | Add `started_at`, `deadline` columns; make `month` nullable |
| Modify | `src/pages/api/projects/index.ts` | Accept `started_at`/`deadline`; remove month-uniqueness check |
| Modify | `src/pages/api/projects/[id].ts` | Accept `started_at`/`deadline` in updates |
| Modify | `src/components/ProjectModal.astro` | Replace month field with started_at/deadline; add narrative prompt textarea; reframe labels to "bet" language |
| Modify | `src/components/ShareUpdateModal.astro` | Reframe "project" → "bet" labels |
| Modify | `src/pages/[username].astro` | Replace 12-month grid with dynamic bet cards; update language |
| Modify | `src/pages/projects.astro` | Remove month filter dropdown; update language to "bets"; use `import.meta.env` → `astro:env/server` |
| Modify | `src/pages/projects/[slug].astro` | Update language to "bet" |
| Modify | `src/components/Navbar.astro` | Update nav links text ("Projects" → "Bets", add "Feed") |
| Modify | `src/pages/index.astro` | Update landing page copy |
| Create | `src/pages/feed.astro` | New community feed page — all updates from all builders |

---

## Task 1: Clean Up Dead Code and Debug Logs

**Files:**
- Delete: `src/pages/api/auth/register.ts`
- Delete: `src/pages/api/signup.json.ts`
- Modify: `src/middleware/index.ts:29` — remove `console.log("ehree")`
- Modify: `src/pages/api/updates.ts:62-63` — remove debug logs
- Modify: `src/pages/api/profile/index.ts` — remove debug logs
- Modify: `src/pages/api/profile/claim.ts` — remove debug logs
- Modify: `src/pages/api/join.ts` — remove debug logs
- Modify: `src/pages/api/comments/index.ts` — remove debug logs
- Modify: `src/pages/api/auth/confirm.ts` — remove debug logs
- Modify: `src/components/WelcomeSteps.astro` — remove debug logs
- Modify: `src/components/ProfileBanner.astro` — remove debug logs

- [ ] **Step 1: Delete dead API routes**

```bash
rm src/pages/api/auth/register.ts
rm src/pages/api/signup.json.ts
```

- [ ] **Step 2: Remove debug console.logs from all files**

In `src/middleware/index.ts`, delete line 29: `console.log("ehree");`

In each of the remaining files, search for `console.log` and remove all debug/development logs. Keep `console.error` calls that log actual errors in catch blocks — those are operational logging.

Specifically:
- `src/pages/api/updates.ts:62-63` — remove the two rocket emoji console.logs
- `src/pages/api/profile/index.ts` — remove all `console.log("🚀` lines
- `src/pages/api/profile/claim.ts` — remove all `console.log` lines
- `src/pages/api/join.ts` — remove all `console.log("🚀` lines
- `src/pages/api/comments/index.ts` — remove all `console.log` lines
- `src/pages/api/auth/confirm.ts` — remove all `console.log` lines
- `src/components/WelcomeSteps.astro` — remove all `console.log` lines in `<script>` tags
- `src/components/ProfileBanner.astro` — remove all `console.log` lines in `<script>` tags

- [ ] **Step 3: Verify the dev server starts**

Run: `pnpm dev`
Expected: Server starts on http://localhost:1234 with no errors. Visit a few pages to confirm nothing broke.

- [ ] **Step 4: Fix `projects.astro` Supabase import**

`src/pages/projects.astro:6-12` currently creates its own Supabase client using `import.meta.env` instead of using the shared client from `src/lib/supabase.ts`. Fix this:

Replace:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

With:
```typescript
import { supabase } from "../lib/supabase";
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead code, debug logs, and fix supabase import"
```

---

## Task 2: Database Migration — Add Bet Fields

**Files:**
- Create: `supabase/migrations/20240325000000_add_bet_fields.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20240325000000_add_bet_fields.sql`:

```sql
-- Add flexible date fields for bets (replacing fixed calendar months)
ALTER TABLE products ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deadline timestamptz;

-- Make month nullable so new bets don't need it
ALTER TABLE products ALTER COLUMN month DROP NOT NULL;

-- Backfill: set started_at from created_at for existing products
UPDATE products SET started_at = created_at WHERE started_at IS NULL;
```

- [ ] **Step 2: Apply the migration**

Run the migration against the Supabase instance. If using Supabase CLI:

```bash
supabase db push
```

Or apply manually via the Supabase dashboard SQL editor by copying the SQL above.

- [ ] **Step 3: Verify the migration**

Check that the columns exist by querying:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('started_at', 'deadline', 'month');
```

Expected: `started_at` (timestamptz, YES), `deadline` (timestamptz, YES), `month` (nullable).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20240325000000_add_bet_fields.sql
git commit -m "feat: add started_at and deadline columns to products table"
```

---

## Task 3: Update API Routes for Bet Fields

**Files:**
- Modify: `src/pages/api/projects/index.ts`
- Modify: `src/pages/api/projects/[id].ts`

- [ ] **Step 1: Update POST `/api/projects` to accept new fields and remove month-uniqueness**

In `src/pages/api/projects/index.ts`:

1. Add `started_at` and `deadline` to the destructured body (line 35-45):

```typescript
const {
  title,
  description,
  status,
  month,
  started_at,
  deadline,
  profileId,
  github_url,
  demo_url,
  tech_stack,
  lessons_learned,
  thumbnail_url,
} = body;
```

2. **Remove** the month-uniqueness check (lines 67-80 — the `existingProject` query and the `if (existingProject)` block). This constraint no longer applies since bets aren't locked to one-per-month.

3. Update the insert object (line 99-116) to include the new fields:

```typescript
const { data, error } = await supabase
  .from("products")
  .insert([
    {
      title,
      description,
      status,
      month: month || null,
      started_at: started_at || new Date().toISOString(),
      deadline: deadline || null,
      profile_id: profileId,
      github_url: github_url || null,
      demo_url: demo_url || null,
      tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
      lessons_learned: lessons_learned || null,
      thumbnail_url: thumbnail_url || null,
      slug,
    },
  ])
  .select()
  .single();
```

- [ ] **Step 2: Update PUT `/api/projects/[id]` to accept new fields**

In `src/pages/api/projects/[id].ts`:

1. Add `started_at` and `deadline` to the destructured body (line 36-45):

```typescript
const {
  title,
  description,
  status,
  started_at,
  deadline,
  github_url,
  demo_url,
  tech_stack,
  lessons_learned,
  thumbnail_url,
} = body;
```

2. Add the new fields to the update object (line 98-113):

```typescript
const { data, error } = await supabase
  .from("products")
  .update({
    title,
    description,
    status,
    started_at: started_at || undefined,
    deadline: deadline || undefined,
    github_url: github_url || null,
    demo_url: demo_url || null,
    tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
    lessons_learned: lessons_learned || null,
    thumbnail_url: thumbnail_url || null,
    ...(slug && { slug }),
  })
  .eq("id", id)
  .select()
  .single();
```

- [ ] **Step 3: Verify by testing the API**

Start dev server. Use the browser or curl to create a bet without a month:

```bash
# After signing in and getting cookies, test creating a bet:
curl -X POST http://localhost:1234/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Bet","description":"Testing","status":"not_started","profileId":"<your-profile-id>","started_at":"2026-04-04T00:00:00Z","deadline":"2026-05-04T00:00:00Z"}'
```

Expected: 200 with the created bet. No month required.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/projects/index.ts src/pages/api/projects/[id].ts
git commit -m "feat: accept started_at/deadline fields, remove month-uniqueness constraint"
```

---

## Task 4: Reframe UI — "Bets" Language and Dynamic Bet Cards

**Files:**
- Modify: `src/components/Navbar.astro` — nav link labels
- Modify: `src/pages/[username].astro` — replace 12-month grid with bet cards, update copy
- Modify: `src/pages/projects.astro` — update heading/copy, remove month filter
- Modify: `src/pages/projects/[slug].astro` — update copy
- Modify: `src/pages/index.astro` — update landing copy
- Modify: `src/components/SearchFilter.astro` — update labels

This is the largest task. The key changes:

- [ ] **Step 1: Update Navbar**

In `src/components/Navbar.astro`, change the "Projects" link text to "Bets" and add a "Feed" link pointing to `/feed`. Find the nav links section and update.

- [ ] **Step 2: Rewrite `[username].astro` server-side logic**

Replace the 12-month grid logic (lines 49-89) with dynamic bet cards. The new approach:

1. Remove the `months` array and `productGrid` map (lines 50-89)
2. Use `products` directly — already fetched and sorted by `created_at` desc
3. Update stats calculations to count from `products` directly instead of `productGrid`
4. Remove `getCurrentStreak` function (lines 122-140) — streaks based on calendar months no longer make sense. Replace with a simpler count: total bets, active bets, shipped bets.
5. Update SEO description to use "bets" language

Replace the `productGrid` approach:

```typescript
// Stats from actual bets
const totalBets = products?.length || 0;
const shippedBets = products?.filter(
  (p) => p.status === "completed"
).length || 0;
const activeBets = products?.filter(
  (p) => p.status === "in_progress"
).length || 0;
```

- [ ] **Step 3: Rewrite `[username].astro` template — replace grid with bet cards**

Replace the 12-month grid HTML (the section that iterates over `productGrid` and renders 12 month slots) with a dynamic layout:

1. **Stats bar** — show "X bets made / Y shipped / Z active" instead of streak + completed/in-progress
2. **Bet cards** — render each product as a card showing: title, status badge, description preview, tech stack tags, started date (from `started_at` or `created_at`), deadline if set
3. **Empty state** — if no bets, show "No bets yet" with a CTA to create one (if owner)
4. **Create bet button** — not tied to a specific month slot. A single "New Bet" button that opens the ProjectModal

Update the `ProjectModal` usage — currently passed `month=""`, keep this but it will be handled in Task 5.

The template for a bet card:

```html
<div class="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors">
  <div class="flex items-start justify-between mb-3">
    <h3 class="text-lg font-semibold text-white">{product.title}</h3>
    <span class={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
      <span class={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></span>
      {statusConfig.label}
    </span>
  </div>
  <p class="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
  <div class="flex items-center justify-between text-xs text-gray-500">
    <span>Started {new Date(product.started_at || product.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
    {product.deadline && <span>Due {new Date(product.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
  </div>
  {product.tech_stack?.length > 0 && (
    <div class="flex flex-wrap gap-1.5 mt-3">
      {product.tech_stack.map(tech => (
        <span class="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">{tech}</span>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 4: Update `projects.astro` page**

1. Change heading from "Builder Projects" to "Builder Bets"
2. Change subtitle copy
3. Remove the month dropdown filter (months no longer define the structure)
4. Keep status filter and tech stack filter (both still relevant)
5. Update stat labels: "Total Projects" → "Total Bets", etc.
6. Update SEO title/description strings

- [ ] **Step 5: Update `projects/[slug].astro`**

Read the file first, then update any "project" text labels visible to users to say "bet". Keep code-level variable names as-is (renaming `products` table is not part of MVP).

- [ ] **Step 6: Update `index.astro` landing page**

Update key marketing copy: "12 products in 12 months" → "Make bets on yourself as a builder" and similar. Keep the page structure, just refresh the messaging. Read the file first to see current copy.

- [ ] **Step 7: Verify all pages render correctly**

Start dev server. Navigate through:
- Landing page (`/`)
- Projects/Bets page (`/projects`)
- A builder's profile (`/[username]`)
- A project detail page (`/projects/[slug]`)

Expected: All pages render with updated "bets" language. Profile shows bet cards instead of 12-month grid. No broken layouts.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: reframe UI from projects to bets, replace 12-month grid with bet cards"
```

---

## Task 5: Add Narrative Prompts to Project Modal

**Files:**
- Modify: `src/components/ProjectModal.astro`

The goal: when a builder changes status, show a contextual prompt that guides their storytelling.

- [ ] **Step 1: Replace month field with started_at and deadline**

In `src/components/ProjectModal.astro`, replace the hidden `month` input with visible date fields:

```html
<div class="grid grid-cols-2 gap-4">
  <div>
    <label class="block text-sm font-medium text-gray-200 mb-2">
      Started
    </label>
    <input
      type="date"
      name="started_at"
      value={project?.started_at ? new Date(project.started_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
      class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
    />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-200 mb-2">
      Deadline (optional)
    </label>
    <input
      type="date"
      name="deadline"
      value={project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
      class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
    />
  </div>
</div>
```

Update the Props interface to include the new fields:

```typescript
interface Props {
  profileId: string;
  project?: {
    id?: string;
    title?: string;
    description?: string;
    status?: "completed" | "in_progress" | "not_started";
    started_at?: string;
    deadline?: string;
    github_url?: string;
    demo_url?: string;
    tech_stack?: string[];
    lessons_learned?: string;
    thumbnail_url?: string;
  };
}
```

Remove the `month` prop from both the interface and `Astro.props` destructuring. Remove `month` from the modal title display.

- [ ] **Step 2: Add narrative prompt that changes with status**

Add a dynamic prompt area above the description field that changes based on the selected status. Add this HTML:

```html
<div id="narrativePrompt" class="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 mb-4">
  <p class="text-sm text-emerald-400 font-medium mb-1" id="promptTitle">What's your thesis?</p>
  <p class="text-xs text-gray-400" id="promptHint">Who is this for and why do you believe it will work?</p>
</div>
```

Add this JavaScript in the `<script>` tag to update the prompt on status change:

```typescript
const statusSelect = document.querySelector('[name="status"]') as HTMLSelectElement;
const promptTitle = document.getElementById("promptTitle");
const promptHint = document.getElementById("promptHint");

const prompts = {
  not_started: {
    title: "What's your thesis?",
    hint: "Who is this for and why do you believe it will work?"
  },
  in_progress: {
    title: "What are you building?",
    hint: "What's the core problem you're solving? What does the first version look like?"
  },
  completed: {
    title: "What happened?",
    hint: "Did it work? What did you learn? Would you make this bet again?"
  }
};

statusSelect?.addEventListener("change", () => {
  const prompt = prompts[statusSelect.value as keyof typeof prompts] || prompts.not_started;
  if (promptTitle) promptTitle.textContent = prompt.title;
  if (promptHint) promptHint.textContent = prompt.hint;
});
```

- [ ] **Step 3: Update the form submission to send new fields**

In the `<script>` tag's form submit handler, ensure `started_at` and `deadline` are included in the data sent to the API. The existing FormData → JSON flow should handle this automatically since the fields have `name` attributes. Verify `month` is no longer sent.

Update the `showProjectModal` window function to handle the new fields instead of month:

```typescript
window.showProjectModal = (projectData) => {
  // ... existing field population ...
  const startedAtInput = projectForm.querySelector('[name="started_at"]') as HTMLInputElement;
  const deadlineInput = projectForm.querySelector('[name="deadline"]') as HTMLInputElement;

  if (startedAtInput) startedAtInput.value = projectData.started_at 
    ? new Date(projectData.started_at).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  if (deadlineInput) deadlineInput.value = projectData.deadline 
    ? new Date(projectData.deadline).toISOString().split('T')[0] 
    : '';

  // Trigger prompt update for current status
  const statusSelect = projectForm.querySelector('[name="status"]') as HTMLSelectElement;
  statusSelect?.dispatchEvent(new Event('change'));

  // ... rest of existing logic ...
};
```

- [ ] **Step 4: Update modal title and button labels**

Change `modalTitle`:
```typescript
const modalTitle = project?.id ? "Edit Bet" : "New Bet";
const submitButtonText = project?.id ? "Save Changes" : "Create Bet";
```

Update the `<h3>` to just show `{modalTitle}` without ` - {month}`.

- [ ] **Step 5: Update `ShareUpdateModal.astro` labels**

Change "Related Project" to "Related Bet" in the select label. Change `activeProducts` filter label from showing `(product.month)` to showing the start date:

```typescript
<option value={product.id} selected={product.id === update?.product_id}>
  {product.title}
</option>
```

- [ ] **Step 6: Update `[username].astro` to pass new props**

Wherever `ProjectModal` is rendered, remove the `month` prop. Change:
```html
{isOwned && <ProjectModal profileId={profile.id} month="" />}
```
To:
```html
{isOwned && <ProjectModal profileId={profile.id} />}
```

Update any JavaScript that calls `showProjectModal` to pass `started_at`/`deadline` instead of `month`.

- [ ] **Step 7: Verify modal works**

Start dev server. Log in, go to your profile, click "New Bet". Verify:
- Date fields show instead of month
- Narrative prompt changes when you switch status
- Form submits correctly to the API
- Editing an existing bet populates the date fields

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add narrative prompts on status transitions, replace month with date fields"
```

---

## Task 6: Build Community Feed Page

**Files:**
- Create: `src/pages/feed.astro`
- Modify: `src/components/Navbar.astro` (already updated in Task 4 with "Feed" link)

- [ ] **Step 1: Create the feed page**

Create `src/pages/feed.astro`. This page shows all `product_updates` from all builders, newest first, with builder profile info and the related bet.

```astro
---
import Layout from "../layouts/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Footer from "../components/Footer.astro";
import { supabase } from "../lib/supabase";

// Fetch recent updates from all builders
const { data: updates } = await supabase
  .from("product_updates")
  .select(`
    *,
    profiles:profile_id (
      username,
      full_name,
      avatar_url
    ),
    products:product_id (
      title,
      slug,
      status
    )
  `)
  .order("created_at", { ascending: false })
  .limit(50);

const getTypeConfig = (type: string) => {
  const configs: Record<string, { emoji: string; label: string; color: string }> = {
    progress: { emoji: "📈", label: "Progress", color: "text-blue-400" },
    milestone: { emoji: "🏆", label: "Milestone", color: "text-amber-400" },
    launch: { emoji: "🚀", label: "Launch", color: "text-emerald-400" },
    learning: { emoji: "💡", label: "Learning", color: "text-purple-400" },
  };
  return configs[type] || configs.progress;
};

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
---

<Layout title="Community Feed - 12 in 12">
  <Navbar />
  <main class="bg-gray-900 pt-24 pb-16 min-h-screen">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-white mb-2">Community Feed</h1>
        <p class="text-gray-400">See what builders are shipping, learning, and launching</p>
      </div>

      {updates && updates.length > 0 ? (
        <div class="space-y-4">
          {updates.map((update) => {
            const typeConfig = getTypeConfig(update.type);
            const profile = update.profiles;
            const product = update.products;
            return (
              <article class="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <div class="flex items-start gap-3">
                  <a href={`/${profile?.username}`} class="flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || profile.username}
                        class="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-medium">
                        {(profile?.full_name || profile?.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </a>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <a href={`/${profile?.username}`} class="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                        {profile?.full_name || profile?.username}
                      </a>
                      <span class={`text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.emoji} {typeConfig.label}
                      </span>
                      <span class="text-xs text-gray-500">{timeAgo(update.created_at)}</span>
                    </div>
                    {product && (
                      <a href={`/projects/${product.slug}`} class="text-xs text-gray-400 hover:text-gray-300 transition-colors mb-2 block">
                        on {product.title}
                      </a>
                    )}
                    <p class="text-gray-300 text-sm whitespace-pre-line">{update.content}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div class="text-center py-16">
          <p class="text-gray-400 text-lg">No updates yet. Be the first to share!</p>
        </div>
      )}
    </div>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: Verify the Navbar "Feed" link was added in Task 4**

Confirm the Navbar has a link to `/feed`. If not, add it.

- [ ] **Step 3: Verify the feed page**

Start dev server. Navigate to `/feed`. Expected:
- Shows updates from all builders, newest first
- Each update shows avatar, name (linked to profile), type badge, time ago, content
- If a bet is linked, shows "on [bet title]" linked to the project page
- Empty state shows if no updates exist

- [ ] **Step 4: Commit**

```bash
git add src/pages/feed.astro
git commit -m "feat: add community feed page showing all builder updates"
```

---

## Summary

After completing all 6 tasks, the platform will:

1. Use "bets" language throughout (not "projects/products")
2. Support flexible timing with `started_at`/`deadline` instead of fixed calendar months
3. Show dynamic bet cards on profiles instead of a 12-month grid
4. Prompt builders with narrative questions when they change bet status
5. Have a community feed at `/feed` showing all builder activity
6. Be free of dead code and debug logs

All database table/column names stay as-is (`products`, `product_updates`) — renaming tables is unnecessary churn. The UI language change is what matters to users.
