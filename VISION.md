# 12in12 — Vision & Direction

## What is 12in12?

A community platform for builders who bet on themselves. Builders publicly commit to shipping products, tell the story of each bet — from thesis to outcome — and learn from each other's journeys.

The name "12 in 12" started as a challenge: build 12 products in 12 months. The spirit remains — make bets, ship fast, see what sticks — but the platform now serves builders at any pace.

## The Origin Story

12in12 was born from building [hapsay.com](https://hapsay.com). During that journey, having friends to share the ups and downs with — the excitement of early interest, the grind of business registration, the lessons along the way — made all the difference. The realization: every builder deserves that support system, and every build journey is worth telling.

After launching 12in12, real builders showed up. But feedback was clear: the strict 1-product-per-month pace was too rigid. Some couldn't sustain it. Others wanted in but felt intimidated by the commitment. The energy was there — the format needed to flex.

## Core Beliefs

### Betting on yourself is the identity
The word "bet" is intentional. It's not a side project, not a hobby, not a task on a kanban board. A bet says: "I believe this is worth my time, and I'm going to find out." That framing attracts builders who are serious about shipping, not just tinkering.

### The journey is the product
Nobody else shows the full arc of a builder's path — the thesis, the building, the shipping, the outcome, the lessons. Project trackers show status. 12in12 shows the story. That story is what other builders actually want to learn from.

### Flexible pace, not lower standards
Removing the strict 12-month calendar isn't about making it easier. It's about being honest: great products don't fit neatly into calendar months. Builders set their own deadlines and commit publicly. The accountability comes from the community, not the calendar.

### Builders serving builders
This is not a marketplace. This is not a Product Hunt alternative. The audience is other builders. The value is learning from each other's bets — what worked, what didn't, and why. Connecting builders' products to users may come later, but it's not the focus now.

### AI is an amplifier, not a community
AI tools are accelerating what builders can ship. But communities built around AI hype serve the hype, not the builders. 12in12 serves the humans making the bets. AI is welcome as a tool in their stack, not as the identity.

## Key Decisions & Why

### 1. Bets, not projects
**Decision:** Reframe "products/projects" as "bets" across the platform.

**Why:** "Project" is neutral and passive. "Bet" carries intention — it implies a thesis, stakes, and an outcome. It filters for builders who are serious about finding out what works. It also naturally prompts the question "what are you betting on?" which is a better conversation starter than "what are you building?"

### 2. Flexible cadence, keep the aspiration
**Decision:** Remove the fixed 12-month calendar grid. Builders set their own start dates and deadlines.

**Why:** The strict 1-per-month pace was the #1 barrier to joining and the #1 reason for drop-off. Builders asked "can I do fewer?" or "can I take longer?" — that's demand being turned away. The "12 in 12" brand still works as the flagship aspiration, but the platform welcomes any pace. A builder making 4 bets in a year is still betting on themselves.

### 3. Narrative milestones over manual updates
**Decision:** Status transitions trigger storytelling prompts. When a builder starts a bet, ships it, or marks an outcome, the platform asks them to tell that part of the story.

**Why:** Builders don't naturally write updates. But they do naturally change statuses. Tying the storytelling to actions they're already taking means every bet accumulates a narrative arc without extra effort. Readers get a consistent story structure across every builder's journey. This is what makes 12in12 different from a blog or a project tracker.

**Prompts by transition:**
- **Created/Started:** "What's your thesis? Who is this for and why do you believe it will work?"
- **Progress update:** "What did you ship this week? What blocked you? What's next?"
- **Shipped/Launched:** "It's live. What did it take to get here? What surprised you?"
- **Outcome (completed/parked/canceled):** "What happened? What did you learn? Would you make this bet again?"

### 4. Builders-only audience
**Decision:** The platform serves builders, not end-users of their products. No marketplace, no product discovery for non-builders.

**Why:** Trying to serve two audiences (builders AND their potential customers) splits focus and adds complexity before the core experience is proven. Good SEO on project pages will naturally attract some end-users. Builders attracting their own users is a byproduct of building in public — it doesn't need to be engineered as a feature.

**Revisit when:** There's clear demand from builders saying "I wish the people who need my product could find it here."

### 5. Shared feed as the community heartbeat
**Decision:** A community feed showing updates from all builders, visible to everyone. No follow system initially.

**Why:** With a small community (<100 active builders), a single shared feed creates the feeling of a living room where everyone can see what's happening. It's the simplest thing that creates community. A follow system adds complexity and only becomes necessary when the feed is too noisy to read everything.

### 6. Cohorts as the premium layer (future)
**Decision:** Small groups of builders with an assigned lead, offering structured accountability. This is the monetization path.

**Why:** The highest-retention communities are small groups where people know your name. A cohort of 8-12 builders with a lead who checks in weekly creates real accountability. This is the natural paid tier — the platform and shared feed are free (top-of-funnel), cohorts are where the high-touch value lives.

**Why not now:** Need to nail the free experience first. Cohorts require infrastructure (payments, group management, lead tools) and enough active builders to form groups.

### 7. Communicate changes, don't surprise users
**Decision:** Before shipping the reframe, publish a blog post and email existing users about what's changing and why.

**Why:** Real people joined under the "12 products in 12 months" pitch. Changing the model without explanation would feel like a bait-and-switch. Bringing them along with the story — "here's what we learned, here's where we're going" — turns a breaking change into a community moment.

## Roadmap

### MVP (next release)
- [ ] Reframe UI language: "products/projects" becomes "bets"
- [ ] Replace fixed 12-month calendar grid with dynamic bet cards on profile
- [ ] Add `started_at` and `deadline` fields to bets (replace calendar `month`)
- [ ] Add narrative prompts on status transitions
- [ ] Shared community feed page (all updates, all builders)
- [ ] Clean up dead code and debug logs
- [ ] Blog post + email to existing users about the direction change

### Next up
- [ ] Richer structured prompts for updates (what shipped / what blocked / what's next)
- [ ] Profile page redesign — bet cards + update timeline
- [ ] Email notifications via ZeptoMail (new comments, progress nudges)
- [ ] Progress nudges — email when a bet has been silent for X days

### Future
- [ ] Cohort system — small groups with assigned leads
- [ ] Follow model — personalized feeds
- [ ] Milestone celebrations — badges, confetti, shareable cards
- [ ] Paid tier — cohort subscriptions, payment infrastructure
- [ ] Builder discovery — find builders by tech stack, domain, or experience
- [ ] Connect bets to potential users (only if demand emerges)

## Metrics That Matter

- **Active builders:** How many builders posted an update in the last 30 days
- **Bets started:** New bets created per month
- **Stories told:** Updates with narrative content (not just status changes)
- **Completion rate:** % of bets that reach shipped/outcome status
- **Retention:** % of builders who return and update within 30 days
