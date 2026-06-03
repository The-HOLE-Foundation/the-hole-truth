# First three-engineer hiring sketch

**Owner:** CTO
**Last updated:** 2026-06-03
**Status:** Post-v0 plan — current state is a one-CTO shop. These three hires are the near-term bench.

This sketch answers: who, what they own, and when we actually need them. Written at v0 scope-lock (path b: foia-draft-v0 in hole-backend calling foia-search MCP). It will be revised after v0 ships, because "what we needed to ship" is the best spec for the first real hires.

---

## Hire 1 — Full-Stack Product Engineer

**When:** Now. Before v0 ships, not after.

**Why now:** The CTO is currently wearing every hat — corpus tooling, Cloudflare Worker builds, Next.js surface, CI, and Paperclip orchestration. That works for planning and scaffolding. It stops working the moment v0 needs two things happening in parallel (e.g., debugging the foia-search MCP citation matching while the UI is being iterated). One-CTO bottleneck is the most likely reason v0 slips.

**What they own:**
- `apps/foia-draft-v0/` — the v0 user-facing surface (form → foia-search MCP call → drafted request → copy/download). This is the primary v0 deliverable.
- Corpus maintenance tooling — scripts to add jurisdictions, validate JSON against the schema, run the CI validator. The corpus accuracy belongs to the Legal Domain Expert (Hire 2); the tooling belongs here.
- CI/CD pipeline in hole-backend — wiring OpenNext + Cloudflare Pages/Workers deploys, keeping the test suite fast, managing environment secrets.
- Future: ownership of the TransparencyAI rewrite surface once TAI is off its `pending rewrite` status.

**What they do NOT own:** legal accuracy of any citation, the foia-search MCP's pgvector corpus quality, AI model selection.

**Stack fit required:** Comfortable in TypeScript/Next.js 16, some Cloudflare Workers experience (or eager to learn), able to read and contribute to monorepo builds. Familiarity with Vercel AI SDK a plus.

**Hiring note:** This role can be an agent hire — the work is structured enough for autonomous execution with review checkpoints. If going agent: daily heartbeat cadence, CEO reviews PRs before merge, the scope stays narrowly at `apps/foia-draft-v0/` until v0 ships.

**Acceptance bar — first 30 days:**
1. v0 `apps/foia-draft-v0/` user-facing surface (form → foia-search MCP call → drafted request → copy/download) is deployed to a preview URL and survives the existing v0 acceptance test (deterministic citation pulled from corpus, no hallucinated citations).
2. CI on `hole-backend` is green and fast (< 5 min PR-to-status), including the corpus validator and the citation-matching test.
3. At least one corpus-tooling improvement landed — concretely: a per-jurisdiction validator delta report so the Legal Domain Expert can review only what changed.
4. One written ADR for a design choice the hire actually had to make (auth deferral, MCP error surfacing, route shape — their call). CTO reviews and merges or rejects in writing.

**What we lose if delayed one quarter:**
- v0 slips ~1Q. The CMO/launch story slips with it.
- Bus factor on v0 design and operation stays at 1 (me) for another quarter — real existential risk for a 501(c)(3) where donors fund the institution, not the founder.
- The governance/CI/infra tail (THE-29, THE-42, THE-58, THE-65, THE-77, THE-79 and successors) keeps growing. Every week of accumulated debt makes the *next* hire's first month slower, not faster.

---

## Hire 2 — Legal Domain Expert

**When:** Concurrently with Hire 1. Needed before v0 is user-facing, not before v0 ships internally.

**Why now:** The v0 corpus ships six jurisdictions (`US-FED`, `US-TX`, `US-CA`, `US-NY`, `US-IL`, `US-FL`) with five fields flagged `certainty: needs_escalation`. Those fields must not be surfaced to users until a legal reviewer signs off. The foia-draft-v0 UI can ship behind a dev URL and be tested internally without Hire 2. But to open v0 to real users — even in beta — someone with legal domain expertise must clear those escalations or explicitly accept the risk in writing.

**What they own:**
- Statutory citation review and sign-off for every jurisdiction record in `corpus/jurisdictions/`. They do not write the JSON; the CTO or Hire 1 does. They review and either approve or correct.
- `corpus_meta.open_questions` clearance — the live escalations in CA (post-recodification section verification), TX (deadline framing), and FL (Sunshine scope: records vs. meetings law) all sit in their queue.
- Legal review protocol: a written process for how new jurisdictions are added, what the review checklist is, and who approves before a jurisdiction is marked `certainty: confirmed`.
- Long-term: advisory input on which record types to add to v1 and how to frame the fee-waiver and exemption language in the UI without constituting legal advice to users.

**What they do NOT own:** code, corpus tooling, UI decisions, or any content that hasn't been statute-verified.

**Hiring note:** This does not have to be a licensed attorney. A paralegal or law student with transparency-law specialization is sufficient for v0 citation review. The company should make clear that the tool helps users draft requests, not provide legal advice — the review responsibility is for citation accuracy, not legal strategy. If going agent: this role needs web-fetch tools + access to the corpus repo + the CEO's escalation queue. Scope should be one jurisdiction at a time with CEO sign-off before marking `confirmed`.

**Honesty note on "engineering" framing:** Hire 2 is not a software engineer in the conventional sense. I'm including the role in this engineering hiring sketch because in this product, **corpus correctness *is* the engineering bar** — a wrong citation is a worse defect than a 500 error. Engineering Hire 1 and Engineering Hire 3 are net-zero value without this role clearing the legal-review gate.

**Acceptance bar — first 30 days:**
1. Every `needs_escalation` field in the v0 corpus (TX, CA, FL — five fields total) is either resolved to `confirmed` with a recorded source URL and reviewer signature, or escalated to the CEO with a written recommendation. No field stays in `needs_escalation` for >2 weeks without a written status.
2. A written legal-review protocol lives in the corpus repo: checklist for adding a new jurisdiction, definition of "confirmed," who signs off, and what the escalation path looks like.
3. At least one new jurisdiction added end-to-end under the new protocol — proves the protocol works, not just that it exists.
4. A live "open questions to the CEO / outside counsel" queue in the issue tracker, refreshed weekly.

**What we lose if delayed one quarter:**
- v0 cannot open to real users. The deterministic drafter will surface fields the CTO is not qualified to certify, and we either ship them with a disclaimer (reputational risk) or hide them (product feels half-built).
- Corpus expansion past the v0 six stalls. We look like a regional pilot, not a national tool.
- Donor and partner conversations about correctness become claims rather than evidence — directly contradicts the 501(c)(3) charitable-purpose framing.

---

## Hire 3 — AI/ML Engineer (foia-search quality)

**When:** After v0 ships. Probably at v0.5 or when the CEO approves the next milestone.

**Why not now:** The foia-search MCP (`apps/foia-search-cf-sc-test/`) is already built — Cloudflare Worker, Scalekit OAuth, Supabase pgvector corpus. It works. The v0 acceptance bar is hit by calling it, not by improving it. The improvements that matter (citation coverage, recall accuracy, chunk quality) are a v0.5 concern once we've seen what real users are actually searching for.

**What they own:**
- foia-search MCP quality — pgvector corpus curation, chunking strategy, embedding model selection, recall/precision benchmarking.
- Citation matching test harness — the automated test in THE-5's acceptance bar ("citation matches corpus") is a proxy for quality. Hire 3 makes it rigorous.
- Long-term: the TransparencyAI rewrite (`apps/transparency-ai/`) is a LangChain/LangGraph backend queued for a TypeScript AI-SDK rewrite. This role either drives that rewrite or owns the integration between the new surface and the existing pipeline.
- AI spend budget: once real API spend happens (embeddings, Claude calls for drafting), Hire 3 tracks cost-per-request and optimizes.

**What they do NOT own:** the corpus's legal accuracy (Hire 2), the user-facing surface (Hire 1).

**Stack fit required:** Comfortable with pgvector + embeddings, TypeScript preferred, LangGraph/LangChain familiarity useful for the TAI rewrite context. Experience with Cloudflare Workers optional but helpful.

**Hiring note:** This is the highest-leverage future hire but not urgent at v0. Resist the temptation to hire this role first because it feels like the "AI company" hire — the product needs a working surface and legally correct citations more than it needs better retrieval right now.

**Acceptance bar — first 30 days:**
1. A reproducible recall/precision benchmark for foia-search exists, with a public-facing methodology doc and a baseline number we have committed to beating each quarter.
2. At least one measurable improvement to the benchmark — chunking strategy, embedding model, retrieval re-ranking, or corpus curation — landed and documented in an ADR.
3. AI cost-per-drafted-request is instrumented, reported weekly, and inside the budget envelope the CEO has approved.
4. A go/no-go criterion for the TransparencyAI rewrite is committed to writing: either we keep the existing LangChain/LangGraph backend, or we are actively executing the TypeScript AI-SDK rewrite under a named plan.

**What we lose if delayed one quarter:**
- Foia-search quality plateaus at v0-launch level. As real user queries roll in, the system fails on long-tail jurisdictions and complex records in ways that look like "the product doesn't work" — even though the citation surface is correct.
- TransparencyAI sits in "pending rewrite" for another quarter. Sunk-cost guilt grows. The decision to keep, rewrite, or kill it gets harder, not easier.
- Cost-per-request stays uninstrumented. The first surprise Anthropic / embeddings bill becomes a budget incident rather than a forecasted spend.

---

## Sequence summary

| Timeline | Hire | Urgency driver |
| --- | --- | --- |
| Now (pre-v0 ship) | Full-stack product engineer | CTO bottleneck on v0 execution |
| Concurrently | Legal domain expert | `needs_escalation` fields gate user-facing launch |
| After v0 ships | AI/ML engineer | foia-search quality lever; not on v0's critical path |

---

## Roles I would explicitly NOT hire (and why)

| Role I would NOT hire | Why not |
| --- | --- |
| **DevOps / SRE** | Cloudflare Workers + Pages + Vercel free tiers cover v0 at $0 spend. Hire 1 absorbs the wrangler/build/deploy surface. SRE becomes a real hire only when we leave managed services, cross a paid-traffic tier, or sign an enterprise/newsroom partnership with uptime obligations — none of those are on the near-term roadmap. |
| **Frontend / UI specialist** | v0 is a small server-rendered surface in `apps/foia-draft-v0/`. With WCAG 2.2 AA discipline + Radix primitives, a generalist + a design contributor (eventually) cover it. A frontend specialist this early gets bored, then leaves. |
| **A second product engineer in parallel with Hire 1** | Compounding onboarding cost would dominate any throughput gain at our current scope (one user-facing surface + one MCP backend + a six-jurisdiction corpus). Hire 1 + the CTO is the right shape until v0 ships. |
| **Mobile engineer** | Per architecture: no native apps on the roadmap. The web app must be excellent on mobile browsers. |
| **A "data engineer" for corpus ingestion** | The corpus pipeline is fine — JSON-per-jurisdiction + a schema + a validator. The bottleneck is legal review (Hire 2), not engineering. Hiring a data engineer here would have them inventing work. |
| **Founding-team CTO peer / "Director of Engineering"** | That's me; redundancy at that role kills velocity for the same reason a co-CEO would. Revisit at ~8 engineers, which is not on the current roadmap. |
| **ML / MLOps / RAG specialist *as Hire 1*** | The drafter is deliberately deterministic for v0. LLM use is bounded. Specializing the *first* hire on RAG quality is the "AI company" trap — we have a citation-correctness product, not a RAG-quality product. AI/ML becomes Hire 3, not Hire 1. |
| **In-house General Counsel** | Pro-bono counsel + Hire 2 (Legal Domain Expert) is the correct model for a 501(c)(3) at this stage. Revisit when we have repeat-pattern litigation or contract work — not before. |
| **CMO / growth before v0 ships** | This sketch is engineering-scoped, but flagging: the existing `HIRING_PLAN.md` puts CMO at hire 4 (≤ 8 weeks). I'd push that to "v0 has real users." Same logic as the UX-deferral above. |

---

## Capacity vs. roadmap chart

What we can ship at each capacity level. "Engineering capacity" counts the CTO + named engineering hires (the Legal Domain Expert and UX hire are tracked separately because they unblock engineering work but don't substitute for it).

| Window | Engineering capacity | What we can ship | What stalls or breaks |
| --- | --- | --- | --- |
| **Today** (one-CTO shop, pre-Hire-1) | 1 (CTO) | v0 corpus (6 jurisdictions) ✅, v0 stack scaffold ✅, v0 deterministic drafter (in `_default` workspace) ✅, foia-search MCP scaffold (in `hole-backend`) ✅. v0 path-b user surface in `apps/foia-draft-v0/` is in progress. Governance/CI/merging discipline maintained but accruing debt. | v0 user surface ships slowly; corpus growth past 6 stalls without a legal reviewer; bus factor = 1; governance backlog (THE-29/42/58/65/77/79 lineage) keeps growing. |
| **+ Hire 2 (Legal Domain Expert, concurrent)** | 1 eng + 1 legal | Same engineering output, but `needs_escalation` clears and v0 can credibly open to real users without disclaimers on five fields. Corpus can grow under a written protocol. | v0 *engineering* still bottlenecked on the CTO. The legal reviewer eventually starves for inputs because the corpus can't expand faster than the CTO can scaffold it. |
| **+ Hire 1 (Full-Stack Product Engineer)** | 2 eng + 1 legal | v0 ships end-to-end and is operationally healthy: foia-draft-v0 surface complete, CI fast and green, corpus tooling improvements, governance/CI tail closed. v0.5 (additional record types, additional jurisdictions, UI polish) becomes possible in parallel with the CTO scoping v1. | TransparencyAI rewrite stays parked; foia-search quality stays at v0 baseline; no FOIA-search instrumentation; AI cost surprises possible once real traffic lands. |
| **+ Hire 3 (AI/ML Engineer)** | 3 eng + 1 legal | foia-search quality benchmarked and improving quarter-over-quarter; TransparencyAI rewrite decided (kept, rewritten, or killed); AI cost-per-request instrumented; v1 scoping (request tracking + PII) starts in parallel with the CTO. | Security/threat-model work still relies on contractor cadence; v1 PII implementation still depends primarily on Hire 1's bandwidth. |
| **+ UX designer / contributor (per `HIRING_PLAN.md`)** | 3 eng + 1 legal + 1 UX | A defensible information architecture, plain-language copy, accessible component library, and a design system that scales as the product covers more jurisdictions and record types. | (No major engineering stalls — UX is unblocking engineering, not competing with it.) |
| **+ CMO (per `HIRING_PLAN.md`)** | 3 eng + 1 legal + 1 UX + 1 CMO | First 10,000 users; journalism / FOI advocacy partnerships; donor reporting; impact reports. | — |

Total headcount at end-of-curve: **5 (CTO + 2 engineers + Legal + UX + CMO) ≈ 6 paid heads.** Inside what a charitable 501(c)(3) at our stage can plausibly fund, and slow enough to honor the CEO's "hire slow, fire fast" stance from `HIRING_PLAN.md`.

---

## What this sketch doesn't cover

- **User research / design:** No UX hire until v0 has real users generating feedback. Pre-user design is waste. Tracked separately in `HIRING_PLAN.md`.
- **DevOps / infra:** Cloudflare + Vercel free tiers handle v0. Infrastructure complexity is a v1+ concern.
- **Security & privacy engineer (FTE):** A real concern for v1 (PII, request tracker is a magnet for retaliation per `ARCHITECTURE.md`) but the right shape is *contractor at month 3 → FTE at month 9*, not a slot in the first three engineering hires. Flagging explicitly so it's not forgotten when v1 scoping starts.
- **Sales / growth:** Out of scope for engineering hiring sketch.
- **All-50-states corpus expansion:** The Legal Domain Expert handles jurisdiction additions; the tooling belongs to Hire 1. No additional corpus-specific hire at v0.

---

## What I'd want from the CEO to sharpen this further

1. **Endorsement or rebuttal of "Hire 1 = now, before v0 ships."** `HIRING_PLAN.md` defers a second engineer until v1 ships. This memo argues earlier. If the CEO holds the original line, I'll plan around it — but I want the disagreement on the record so we are both choosing it.
2. **Confirmation that Hire 2 can start as a paralegal / law-student contractor**, not an attorney FTE. Five `needs_escalation` fields is a ~10-hour-a-week problem today.
3. **A target run-rate for paid headcount through Q4 2026** so the timing above can be costed honestly. Today's budget is $0 per `HIRING_PLAN.md`; none of this happens until that changes.
4. **A decision on whether AI cost (embeddings + Anthropic) counts as infrastructure spend** (existing budget approval flow) or as a hire-justifying spend (separate board approval). That determines when Hire 3 becomes a real conversation vs. a parked one.
