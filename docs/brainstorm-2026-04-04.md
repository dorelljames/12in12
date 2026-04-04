# Brainstorm Session — April 4, 2026

## Context

After launching 12in12.pro and getting real builders to join, it was time to step back and figure out where to take this. The strict "12 products in 12 months" format had energy but also friction — builders wanted in but the pace was intimidating, and retention suffered.

This session worked through the key product decisions one at a time.

---

## Decision 1: Who is the core builder?

**Options explored:**
- Solo founders trying to find product-market fit
- Developers leveling up by building in public
- Creatives shipping side projects
- AI-augmented builders

**Decision:** Solo founders and indie hackers who ship multiple products to find what sticks. The "betting on yourself" identity is the sharpest angle — it's specific, underserved, and matches the founder's own story.

**Why this matters:** "Builder" is too generic. "Person who bets on themselves multiple times a year" is a movement.

---

## Decision 2: Loosen the "12 in 12" constraint?

**Options explored:**
- A) Keep it strict — the constraint IS the brand
- B) Flex the cadence but keep the number 12
- C) Reframe around the bet, not the number — any pace welcome

**Decision:** Option C. The platform serves anyone making builder bets at their own pace. "12 in 12" remains the flagship aspiration and brand name.

**Why:** The strict pace was the #1 barrier to joining AND the #1 reason for drop-off. People asking "can I do fewer?" were telling us they wanted in but needed flexibility. That's demand being turned away.

---

## Decision 3: What is "a bet" on the platform?

**Options explored:**
- Just a rebrand of "project"
- A richer concept with thesis, commitment, and outcome

**Decision:** A bet carries more meaning than a project. It implies a thesis ("I believe X will work"), a commitment (deadline), and an outcome (what happened). Not every builder will articulate a formal thesis, but the framing nudges them toward intentionality.

**Data model change:** Replace fixed `month` (January-December) with `started_at` and `deadline` (builder-set dates).

---

## Decision 4: Community, showcase, or launchpad?

**Options explored:**
- A) Community — builders help each other (invest in discussions, feedback)
- B) Showcase — builders display work (invest in SEO, profiles, discoverability)
- C) Launchpad — builders find users (invest in categorization, audience building)

**Decision:** Showcase + community. Launchpad is parked for later.

**Why:** We can't out-compete Product Hunt on distribution. But we CAN own the builder's journey over time. Nobody else shows "here are all the bets this person made, here's what they learned, here's what stuck." That story IS the showcase, and the community forms around following each other's journeys. Connecting products to users can emerge organically from good SEO and builders marking bets as "live."

---

## Decision 5: What replaces the 12-month grid on profiles?

**Options explored:**
- A) Timeline — chronological list
- B) Scorecard — stats-forward
- C) Story arc — narrative structure per bet
- D) Hybrid — bet cards + update timeline

**Decision:** Open to replacing the grid entirely. The profile should present bets well — dynamic bet cards rather than fixed calendar slots. The exact design is TBD but the 12-month grid is going away.

---

## Decision 6: What keeps builders coming back?

**Options explored:**
- A) Accountability loop — streaks, check-ins, public commitment
- B) Social loop — follow, feed, reactions
- C) Milestone loop — celebrations, badges, confetti
- D) Ritual loop — community events, demo days

**Decision:** Start with A (accountability) + C (milestones). But the deeper insight: the real retention driver is **people who care about your journey** and **a story worth telling**. Features should serve that, not replace it.

---

## Decision 7: How do builders tell their story?

**Options explored:**
- A) Freeform journal — text box, low friction, shallow
- B) Structured prompts — guided questions per update type
- C) Narrative milestones — prompts tied to status transitions

**Decision:** Option C. Status changes trigger storytelling prompts:
- Started → "What's your thesis?"
- Progress → "What shipped? What blocked? What's next?"
- Launched → "What did it take? What surprised you?"
- Outcome → "What happened? What did you learn?"

**Why:** Builders don't naturally write updates, but they do change statuses. Tying storytelling to actions they're already taking means every bet naturally accumulates a story arc.

---

## Decision 8: Who reads these stories?

**Options explored:**
- A) Builders only — by builders, for builders
- B) Dual-mode — builder narrative + product page for potential users
- C) Separate surfaces — /discover for users, profiles for builders

**Decision:** Option A. Builders only for now. Marketplace/user-matching is parked.

**Why:** Serving two audiences splits focus. Nail the builder experience first. Good SEO will naturally attract some end-users to project pages.

---

## Decision 9: Social layer — how do builders find each other?

**Options explored:**
- A) Minimal — shared feed, no follows, everyone sees everything
- B) Follow model — personalized feeds
- C) Cohort model — small groups with a lead

**Decision:** Start with A (shared community feed). Build toward C (cohorts) as the premium layer. B (follows) comes when the feed gets too noisy.

**Why cohorts are exciting:** Small groups where people know your name have the highest retention. A cohort of 8-12 builders with a lead who checks in creates real accountability. This is also the natural monetization path.

---

## Decision 10: Business model

**Options explored:**
- A) Free forever
- B) Free tier + paid cohorts
- C) Paid from the start

**Decision:** Option B. Free platform (top-of-funnel) + paid cohorts (high-touch accountability with a lead).

**Why:** The free platform is the content engine and community proof. Paid cohorts are where the real value lives. The lead's hands-on time is worth paying for.

---

## Decision 11: Communicate changes to existing users

**Decision:** Before shipping any of this, publish a blog post and email all existing users explaining what's changing and why.

**Why:** Real people joined under the "12 products in 12 months" pitch. Changing without explanation feels like bait-and-switch. Bringing them along turns a breaking change into a community moment.

---

## MVP Scope

**In (ship first):**
1. Reframe UI language: "products/projects" → "bets"
2. Replace 12-month grid with dynamic bet cards
3. Add started_at and deadline fields (replace calendar month)
4. Narrative prompts on status transitions
5. Shared community feed page
6. Clean up dead code and debug logs
7. Blog post + email to existing users

**Next up:**
- Richer structured prompts for updates
- Profile page redesign
- Email notifications via ZeptoMail
- Progress nudges

**Future:**
- Cohort system with paid tier
- Follow model
- Milestone celebrations
- Builder discovery
