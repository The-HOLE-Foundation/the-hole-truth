# Hire 1 — Evaluation rubric

**Owner:** CTO
**Last updated:** 2026-06-03
**Use:** Score every candidate (agent or human) against this rubric before recommending hire. Re-score at the 30-day review. Never substitute vibes.

Companion docs: [JD](./hire-1-fullstack-jd.md) · [Onboarding](./hire-1-onboarding.md) · [Candidate agent](./hire-1-candidate-agent.md)

---

## Scoring scheme

Each item below is **pass / fail** at intake (screening) and **scored 0–3** at the 30-day review:

- **0** — not demonstrated or actively wrong
- **1** — partial, requires meaningful CTO intervention to remain on track
- **2** — meets the bar, ships without follow-up
- **3** — exceeds the bar in a way that reduces work for other roles

A candidate must clear every screening pass/fail before any 30-day review counts. The 30-day review must total ≥ 18 (out of 27) AND have no zero scores on items marked **must-pass**.

---

## Part A — Intake screening (pass/fail; required before hire)

For an **agent** candidate, this is satisfied by reviewing the adapter config, `AGENTS.md`, and reading the candidate-agent dossier:

| # | Item | Pass requires |
|---|---|---|
| A1 | Stack literacy (TS/Next.js 15) | The candidate-agent prompt or human-portfolio code shows idiomatic RSC + Server Actions; no class-component-era patterns; no `useEffect`-for-data-fetching anti-patterns. |
| A2 | Scope discipline | The candidate explicitly declines the do-not-own list (foia-search MCP internals, citation legal accuracy, AI model selection). For agents, this is named in `AGENTS.md`. |
| A3 | Accessibility commitment | Candidate names WCAG 2.2 AA as non-negotiable and gives one concrete example of how they would enforce it (Radix primitives, axe-core in CI, screenreader smoke). |
| A4 | Correctness framing | Candidate names "a wrong citation is worse than a missing one" or equivalent in their own words. Not just quoted from the JD. |
| A5 | Safety defaults | Candidate states: no secrets in commits, no `--no-verify`, no PII logged. For agents, these appear verbatim in `AGENTS.md`. |
| A6 | Honest about gaps | Candidate names at least one stack item they do not know yet (Cloudflare Workers, `@opennextjs/cloudflare`, Anthropic prompt caching are all acceptable) AND the smallest first task they would use to learn it. A candidate who claims fluency in every stack item is failing this. |
| A7 | Review process fit | Candidate accepts daily heartbeat cadence, CEO PR review during probation, CodeRabbit on every PR, no merge without two approvals. |
| A8 | Governance literacy | For agent candidates: `AGENTS.md` includes the Paperclip execution contract verbatim, the comment-on-every-touch rule, the blocked/unblock rule, the "always update task before exiting heartbeat" rule. For human candidates: candidate has reviewed the JD and confirmed they understand the cadence. |

**Any A-item failure blocks the hire.** No "we'll fix it in onboarding" exceptions. Re-screen after the candidate revises.

---

## Part B — 30-day review (scored; ≥ 18/27 to retain)

Items marked **(must-pass)** must score at least 1; a 0 on a must-pass item ends the engagement even if total ≥ 18.

| # | Item | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| B1 **(must-pass)** | v0 `/draft` preview URL up, citation correctness verified | URL doesn't exist or fails on any of `US-FED`/`US-TX`/`US-CA` | URL exists, citations correct on at least one jurisdiction, gaps documented | URL up, deterministic citations on all three sampled jurisdictions, no hallucinations across 20-sample draft set | Above + automated nightly test asserts the same in CI |
| B2 **(must-pass)** | CI under 5 min PR-to-status, green | CI broken or > 10 min | CI green, 5–10 min | CI green, < 5 min sustained for the last 7 days | Above + a documented strategy for keeping it < 5 min as the suite grows |
| B3 **(must-pass)** | Citation hallucination rate | Any hallucinated citation shipped to a preview URL | Caught and reverted before merge; one slipped to preview but was caught within 24h | Zero hallucinated citations across review window AND an integration test that would catch them | Above + the test is property-based (random jurisdiction sampling), not just fixture-based |
| B4 | Corpus delta report | Not built | Built but never used by CTO | Built, used at least once by CTO, plain-markdown output | Above + handed off cleanly to a non-engineer reviewer, with positive feedback |
| B5 | ADR-001 quality | Not written | Written but reads like task notes, no real tradeoff named | Real tradeoff, alternatives considered, decision justified, CTO signed off in writing | Above + the ADR has been cited by a later decision (sign of durable thinking) |
| B6 | Accessibility evidence | No axe / screenreader pass | Manual axe pass only, ad hoc | Automated axe in CI + at least one keyboard-only walkthrough recorded | Above + a documented accessibility regression caught and fixed during the window |
| B7 | Scope discipline | Multiple out-of-scope PRs or unilateral changes to do-not-own areas | One out-of-scope drift, corrected after CTO pushback | Stayed in scope; declined out-of-scope work with a re-route comment | Above + created a child issue for an out-of-scope gap they noticed (visibility without freelancing) |
| B8 | Communication / heartbeat hygiene | Missed > 3 heartbeats with no comment; silent on blocked tasks | Heartbeats logged but comments shallow ("WIP", "still working") | Daily comment with concrete progress, next action, and any blockers named | Above + proactively flags risks to v0 ship date before they become blockers |
| B9 | CTO bandwidth absorbed | CTO still doing all three day-0 categories (CI, corpus tooling, `/draft` iteration) | Absorbed one category partially | Absorbed at least one category fully; CTO has not touched it in 14 days | Absorbed two or more categories AND the CTO has redirected freed time into a v1 scoping deliverable |

Max score: **27**. Pass: **≥ 18 with no must-pass zero.**

---

## Part C — Failure modes (immediate halt regardless of score)

Any of the following ends the engagement on the day it occurs, with a CTO-written incident note in the issue tracker:

1. **Secret in a commit** — credential, token, `.env`, anything that should not be in git history. Surface, revert, halt.
2. **`--no-verify`, force-push to `main`, or skipped CodeRabbit on a probation-window PR.**
3. **PII logged in plaintext** — requester identity, IP, anything that could be subpoenaed and used against a requester.
4. **Hallucinated citation merged to `main`.** Caught at preview-URL review is recoverable; merged-to-main is not.
5. **Editing `corpus/jurisdictions/*.json` content without Hire 2 (or CEO in their absence) sign-off.**
6. **Bypassing the CEO PR review gate** during the probation window.

A halt is not necessarily termination — the CTO and CEO confer. But the work stops until that conversation happens.

---

## Part D — Agent-specific signals (in addition to A and B)

For agent candidates, also evaluate:

| # | Signal | What good looks like |
|---|---|---|
| D1 | Wake context use | Reads the wake payload first, acknowledges new comments, doesn't reflexively re-fetch the full thread on every heartbeat. |
| D2 | Heartbeat exit discipline | Always updates the issue before exiting; uses `in_review`, `blocked`, or `done` accurately — never leaves work in `in_progress` with no live continuation. |
| D3 | Child-issue use | Creates bounded child issues for parallel or long work rather than polling. |
| D4 | Tool restraint | Doesn't reach for browser, web fetch, or web search when the answer is in the repo. |
| D5 | Cost awareness | Notices when its own heartbeat cadence is generating disproportionate model spend and flags it to CTO before the bill arrives. |

D-items inform the renewal conversation at day 30 but do not override the A/B/C results.

---

## Comparison: agent vs. human FTE (for future reference)

At day 30 the CTO writes a one-page comparison covering:

- Throughput: PRs merged, ADRs written, tests added, CI minutes saved.
- Cost: model spend vs. an FTE equivalent at $0 comp.
- Bus factor: who else can take over the work the hire did?
- Compounding: did the hire's deliverables make the next hire faster, or just close current tickets?

If the agent hire scores well on B and D but the *compounding* score is weak, the CTO escalates to the CEO to discuss conversion to a human FTE per the THE-6 decision. This is not a default outcome; it is the exit ramp the CEO explicitly preserved.
