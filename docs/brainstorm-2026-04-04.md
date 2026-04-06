# Brainstorm Session — April 4, 2026

## Context

12in12.pro originally launched with the "12 products in 12 months" pitch. Real builders joined, but over time it died down. Coming back to it now after working on hapsay.com — which gave something solid to build around and share — the motivation is clearer: building is lonely, and having a community to share the journey with matters as much as the products themselves.

The strict format had energy but also friction — builders wanted in but the pace was intimidating, and retention suffered. This session worked through the key product decisions one at a time.

---

## Decision 1: Who is the core builder?

**Options explored:**
- Solo founders trying to find product-market fit
- Developers leveling up by building in public
- Creatives shipping side projects
- AI-augmented builders

**Initial decision:** Solo founders and indie hackers who ship multiple products to find what sticks.

**Revised after community input (April 6):** The community is broader than indie hackers. Real builders in the group chat showed:
- **NegosyoHub** — POS for small PH businesses (for profit)
- **ugnay.ph** — Emergency hotline directory, "pure vibe coded" (for impact)
- **hooperking.com** — Basketball player profiles for scouts (for impact)
- **parallelbooth.com** — P2P photobooth, personal fun project (for craft)
- **Code Wraith** — Combat platformer game on itch.io (for craft)
- **aiengineerpack.com** — AI tool credits pack (for profit)

**Final decision:** Anyone who builds and ships things they care about. The "betting on yourself" identity still works — but the bet isn't always about revenue. It's about committing your time and skills to something you believe in, for any reason.

**Why this matters:** "Builder" is too generic. "Person who bets on themselves" is a movement — whether they're betting on a business, a cause, or their own growth.

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

## Decision 12: Does "bet" still work for non-commercial projects? (April 6)

**Context:** After seeing community members share projects built for causes (emergency hotlines), fun (games, photobooth), and profit (POS systems), the question arose: does "bet" only apply to commercial ventures?

**Decision:** "Bet" stays and applies to everything. Betting on yourself means putting your time and skills on the line for something you believe in — whether that's a business, a cause, or personal growth.

---

## Decision 13: Motivation tags (April 6)

**Options explored:**
- A) Four tags — For Profit, For Impact, For Fun, For Learning
- B) Three tags — For Profit, For Impact, For Craft (craft = fun + learning)
- C) Two tags — Commercial and Personal

**Decision:** Option B. Three tags:
- **For Profit** — building a business (NegosyoHub, aiengineerpack)
- **For Impact** — solving a problem for a community (ugnay.ph, hooperking)
- **For Craft** — building to learn, have fun, or grow (parallelbooth, Code Wraith)

**Why three:** Four splits fun from learning, a distinction most builders won't care about. Two loses the ability to highlight cause/impact projects distinctly. Three is memorable and covers everything.

---

## Decision 14: Motivation can change (April 6)

**Options explored:**
- A) Locked on creation
- B) Changeable anytime
- C) Changeable, and the change is part of the story

**Decision:** Option C. When a builder switches motivation, the platform prompts: "This started as [old] and is now [new]. What changed?"

**Why:** The moment a hobby becomes a business is one of the most compelling builder stories. Capturing that transition adds narrative depth.

---

## Decision 15: Keep the "12 in 12" name (April 6)

**Decision:** Keep it. The name has recognition, a domain, and existing users. "12 in 12" becomes aspirational, not literal — like how "500 Startups" doesn't mean 500.

---

## MVP Scope (Updated April 6)

**In (ship first):**
1. Reframe UI language: "products/projects" → "bets"
2. Replace 12-month grid with dynamic bet cards
3. Add started_at and deadline fields (replace calendar month)
4. Add motivation field (profit / impact / craft)
5. Narrative prompts on status transitions (adapted per motivation)
6. Prompt on motivation change as narrative milestone
7. Shared community feed page (filterable by motivation)
8. Clean up dead code and debug logs
9. Blog post + email to existing users

**Next up:**
- Richer structured prompts for updates
- Profile page redesign
- Email notifications via ZeptoMail
- Progress nudges

**Future:**
- Cohort system with paid tier (cohorts can form around motivation)
- Follow model
- Milestone celebrations
- Builder discovery
