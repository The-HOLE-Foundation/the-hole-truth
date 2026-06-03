# Hire 1 — Onboarding plan (30 days)

**Owner:** CTO
**Last updated:** 2026-06-03
**Companion docs:** [JD](./hire-1-fullstack-jd.md) · [Rubric](./hire-1-evaluation-rubric.md) · [Candidate agent](./hire-1-candidate-agent.md)

This plan operationalizes the 30-day acceptance bar from `HIRING_NEXT_3.md`. It assumes the hire is an agent (per THE-6 operating decision). For a human FTE the same milestones apply but the cadence stretches to roughly 6 weeks.

---

## Day 0 (CEO approves, CTO provisions)

- CTO confirms the agent config is provisioned (claude_local adapter, cwd at the project root, no timer heartbeat, wake-on-demand).
- CTO assigns the first onboarding issue (Day 1 work) and links the JD + rubric + candidate-agent docs in the issue description.
- CTO posts a "welcome + scope" comment on the new agent's first issue naming the four hard non-negotiables: correctness, accessibility, no PII, no secrets.

## Day 1 — Orient and prove the loop works

**Single issue, assigned by CTO.** Title: "Onboarding — read, run, and verify the v0 draft surface locally."

Deliverables in the first heartbeat:

- Read in order: `README.md`, `ARCHITECTURE.md`, `HIRING_NEXT_3.md`, `corpus/SCHEMA.md` (or equivalent), `app/draft/page.tsx`, `app/draft/actions.ts`, `app/draft/DraftForm.tsx`.
- Run `npm install && npm run dev` and load `/draft` in a browser. Submit one request for `US-TX` and one for `US-FED`. Capture the rendered output verbatim.
- Run the existing test suite (`npm run test` / `vitest`) and report timing + any flaky tests.
- Post a comment on the onboarding issue with: (a) what the surface currently does, (b) one paragraph on what is missing relative to the v0 acceptance bar, (c) one paragraph on the smallest first PR they would propose. The CTO converts (c) into the Day-2 issue.

**Success condition:** the agent has reproduced the current behavior, named the gap, and proposed a bounded first PR. No code changes yet.

## Days 2–7 — First PR

**Scope of first PR (CTO-defined, narrow on purpose):** wire the `/draft` Server Action to call the foia-search MCP and surface a real citation block in the rendered request, replacing whatever stub or placeholder is there. Add one integration test asserting the citation comes from the corpus, not from the model. Update the existing `vitest` suite, keep total CI under 5 minutes.

Required artifacts in the PR:

- Diff in `app/draft/*` only (no foia-search internals, no corpus content edits, no migration).
- One vitest integration test that loads a fixture jurisdiction record, submits the form, and asserts the rendered citation string is byte-identical to a field in the fixture. If the test could pass with a hallucinated citation, it is the wrong test.
- A short PR description naming what changed, what was tested, and what was deliberately left out of scope.
- CodeRabbit pass on the PR (per THE-37 / THE-40 Phase B). Address all findings or explain in a thread.
- CEO is added as the required reviewer. CTO is a second reviewer. No merge without CEO sign-off.

**Heartbeat cadence:** daily. End-of-day comment on the PR or issue thread with what shipped, what is left, and what is blocked.

## Days 8–14 — Corpus tooling delta report

**Second deliverable (acceptance bar item 3).** Land a per-jurisdiction validator delta report:

- Given a corpus diff between two refs, output a per-jurisdiction summary: fields changed, fields newly `needs_escalation`, fields cleared to `confirmed`.
- Runs in CI and posts the summary as a PR comment when `corpus/jurisdictions/*` changes.
- Output is plain markdown — when Hire 2 is hired, they read this directly without engineering help.

This is the first work product the Legal Domain Expert will consume. Build it as if a paralegal who is brilliant at law and unbothered by code is the user.

## Days 15–21 — CI hardening + ADR

- Trim CI to under 5 minutes PR-to-status. Cache `node_modules`, parallelize the suite if needed, kill any test that adds disproportionate time relative to its coverage.
- Write **ADR-001** (the first ADR for the hire) on a real design call they had to make in weeks 1–3. Likely candidates: how to surface a foia-search MCP error to the user without hallucinating a fallback citation; whether to render the draft request server-side or stream it; where in the corpus schema to record `last_reviewed_at`. The CTO reviews the ADR in writing — accepted, rejected with a counter, or accepted-with-revisions.

## Days 22–30 — Preview URL + v0 acceptance test

- Deploy `/draft` (or `apps/foia-draft-v0/`) to a preview URL. Vercel preview for now; OpenNext + Cloudflare Pages once that pipeline is staffed and the wrangler config lands. Either is acceptable as long as the URL is reachable, has TLS, and is reproducible from `main`.
- Confirm the v0 acceptance test passes against the preview URL: deterministic citation pulled from corpus for at least three jurisdictions (`US-FED`, `US-TX`, `US-CA`), zero hallucinated citations across 20 sampled drafts.
- Update `ARCHITECTURE.md` §3 (Deployment) and §6 (Data flow) to reflect what actually shipped, not the v0 plan. Diff reviewed by CTO.

---

## Daily rhythm

- **One heartbeat per day**, claude_local adapter, wake-on-demand only (no timer). The CTO or CEO triggers via the standard Paperclip flow.
- **One comment per heartbeat minimum**, ending with a clear next action. "Done" or "blocked-on-X" both count; silence does not.
- **PRs reviewed within 24h by CTO.** CEO is the required second reviewer during probation; CEO target is 48h.
- **No merge to `main` without both CTO and CEO approval** for the first 30 days. Both approvals must be in the PR thread.
- **CodeRabbit on every PR** at `in_review` (per Phase B).

## Reviewer + governance routing

- CTO: technical bar, scope, architecture decisions.
- CEO: strategic fit, hiring success/failure call, cross-cutting risk.
- Future Legal Domain Expert: any PR that touches corpus content (the tooling can ship without them; content cannot).
- CodeRabbit: AI review of every PR.

## What the hire is allowed to do unilaterally

- Touch `app/draft/**`, `apps/foia-draft-v0/**` (when split), `corpus/**` tooling files (validators, schema docs, delta-report scripts — *not* the JSON content), CI workflows in `.github/workflows/**`, and `package.json` for non-major version bumps with a CTO-reviewed PR.

## What the hire must escalate before touching

- Anything in `app/api/**` that exposes a new public endpoint.
- The `corpus/jurisdictions/*.json` content itself.
- Auth, secrets, environment variables, or anything that writes to a real database in CI.
- Removing or downgrading dependencies.
- Any change to deployment targets, Cloudflare account config, or DNS.

## Failure paths and what they trigger

- **Misses one acceptance-bar item at day 30:** CTO writes a re-scope memo. 14-day extension with a tighter rubric.
- **Misses two acceptance-bar items at day 30 OR a correctness incident (hallucinated citation in a shipped diff):** CTO escalates to CEO. Per THE-6 decision, this opens the human-FTE conversation; CEO decides whether to extend, close, or convert.
- **Repeated `--no-verify`, force-push, or secret leak:** immediate halt. CTO reverts and CEO is paged.

## What good looks like at the 30-day review

- Preview URL up, citations clean across the sampled draft set.
- CI under 5 minutes, green for the last 7 days.
- Delta report exists and was used by the CTO at least once.
- ADR-001 merged, with a CTO sign-off comment.
- The CTO has been freed from at least one task category they were owning at day 0 (CI, corpus tooling, or `/draft` iteration). If the CTO is still doing all three, the hire has not absorbed scope — that is a failure signal even if the four bullets above are checked.
