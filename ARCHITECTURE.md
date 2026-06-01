# Architecture — The/Hole/Truth (v0)

**Owner:** CTO
**Status:** v0 foundation. Subject to revision as we learn.
**Last updated:** 2026-06-01

---

## 1. What we are building

A free public-records assistant. A member of the public should be able to:

1. **Understand** what records they're entitled to under federal FOIA or the relevant state transparency law.
2. **Draft** a legally-sound request to the correct agency, with the correct statutory citation.
3. **Track and escalate** the response.

Coverage scope: federal FOIA + all 50 state transparency statutes. Initial focus on the high-volume jurisdictions (TX PIA, CA CPRA, NY FOIL, IL FOIA, FL Sunshine).

The product north star is **correctness**. A wrong citation is worse than a missing one. Every claim the system makes must be traceable to a source.

---

## 2. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Web framework | **Next.js 15** (App Router, React Server Components) | Server-rendered out of the box. One language end-to-end (TypeScript). Built-in support for streaming LLM responses via Server Actions. Massive ecosystem of accessible UI primitives (Radix/shadcn). |
| Language | **TypeScript** | Strict types catch citation/jurisdiction bugs at compile time. One language across server, client, and data pipeline reduces our hiring surface. |
| Styling | **Tailwind CSS** | Utility-first keeps designer/engineer handoff short once Hire 2 lands. Pairs cleanly with Radix primitives for WCAG 2.2 AA components. |
| Database | **Postgres** (managed by Neon) | Boring. Relational fits the statute corpus (jurisdictions → statutes → sections → exemptions → fee rules). `pgvector` available when we need RAG. Neon's free tier covers v0 indefinitely; branching makes schema review safe. |
| ORM / migrations | **Drizzle** | TS-first, generates migrations from schema, runs on edge runtimes if we ever need to. Migration files are reviewable in PRs — that matters for "build for the audit." |
| LLM provider | **Anthropic Claude** (Sonnet for drafting, Haiku for cheap classification) | Best-in-class structured legal reasoning. **Prompt caching** is critical for our cost model — statute corpus is large and re-used per request. The **Citations API** gives us source-grounded outputs we can show to users, donors, and regulators. Single provider keeps our audit story simple. We will abstract the provider behind a thin interface so v2 can A/B if needed. |
| Hosting | **Vercel** (free Hobby tier for v0) | Native home for Next.js, zero-config deploys, free for our traffic profile. Reversible: a `@opennextjs/cloudflare` adapter exists if cost or sovereignty pushes us to Cloudflare Pages later. |
| CI | **GitHub Actions** | Free for public repos. We are public — the org is a 501(c)(3) and the code will be public. |
| Auth | **Deferred to v1** | v0 has no accounts and stores no user data. When we add accounts (for request tracking), we'll evaluate Clerk vs. Lucia vs. plain Postgres-sessions. |
| Email | **Deferred to v1** | The request-tracker (v1) will need outbound email. Postmark or Resend, decided at that time. |
| Observability | **Vercel built-ins + structured `pino` logs** for v0 | Sentry/Honeycomb added when traffic or incident volume warrants. |

### Why not the alternatives

- **Rails / Django**: equally defensible. We picked Next.js because the team will be small and TypeScript end-to-end shaves a real percentage off coordination cost. We do not need Rails magic; we need a thin, server-rendered surface over a clean data model.
- **A bespoke graph DB for statute relationships**: rejected. Postgres handles the corpus easily. A graph DB is a one-way door — see §8 (Reversibility).
- **Multiple LLM providers from day one**: rejected. Premature abstraction. We will use one provider until we have a concrete reason to add a second.
- **Static-site generator**: rejected. We need a request-drafting pipeline that runs server-side with secrets — that's a web server, not a static site.

### Defaults the CEO pre-approved

- Postgres + a server-rendered web framework + an LLM provider of our choice.

We are inside that pre-approved envelope. No exotic picks need defending. The single judgment call worth flagging is **Vercel over self-hosting**: it costs $0 at our v0 traffic and saves us infra time we don't have. We will re-evaluate at the first paid tier.

---

## 3. Deployment target

**Primary (v0):** Vercel — Hobby (free) plan, connected to the GitHub repo. Pushes to `main` deploy to production. PR branches deploy as preview URLs.

**Domain:** TBD. Until we register one, previews live on `*.vercel.app`. No spend incurred.

**Failover / portability:** Next.js standard build (`.next/`) is portable. If we ever leave Vercel:

- Self-host on any Node 20+ host via `next start`.
- Deploy to Cloudflare Pages via `@opennextjs/cloudflare`.

That portability is a deliberate two-way door.

**Production data:** Neon, single Postgres instance, single primary, daily automated backups (Neon free tier covers 7 days of point-in-time restore). No production data exists yet.

---

## 4. Data flow

```
                    ┌─────────────────────────────┐
                    │  User (browser)             │
                    │  - picks jurisdiction       │
                    │  - picks record type        │
                    │  - describes the records    │
                    └──────────────┬──────────────┘
                                   │ HTTPS, no auth (v0)
                                   ▼
                ┌─────────────────────────────────────┐
                │  Next.js (Vercel)                   │
                │  - Server Component renders form    │
                │  - Server Action handles draft      │
                └───┬──────────────────────┬──────────┘
                    │                      │
                    │ statute lookup       │ draft request
                    ▼                      ▼
        ┌─────────────────────┐   ┌────────────────────────┐
        │ Postgres (Neon)     │   │ Anthropic Claude API   │
        │ - jurisdictions     │   │ - prompt caching on    │
        │ - statutes          │   │   the statute context  │
        │ - sections          │   │ - Citations API for    │
        │ - exemptions        │   │   source-grounded text │
        │ - fee/timeline rules│   └────────────────────────┘
        └─────────────────────┘
```

For v0 the only live path is the marketing page. Statute lookup and draft generation are scoped in **THE-4** (statute corpus) and a follow-on UX ticket.

---

## 5. Secrets handling

**Principles:**

- No secret value ever lives in git.
- No secret is read from a file at runtime; all secrets flow through the runtime's env.
- Every secret has a documented rotation procedure before it ships to production.

**Mechanics:**

- `/.env.example` — committed. Lists every env var the app reads, with empty values and a one-line description. This is the canonical source of "what secrets does this app need."
- `/.env.local` — gitignored. Local dev secrets. Each engineer maintains their own.
- **Production:** secrets configured in Vercel project settings (encrypted at rest, scoped to environment). Loaded into the runtime as env vars.
- **Database:** Neon connection strings include a short-lived password; we use the pooled connection string for runtime and the direct string only for migrations.
- **LLM key:** Anthropic API key is server-side only. Never sent to the browser. Never logged.

**Rotation:**

- Anthropic key: rotate quarterly or on suspected compromise. Two-step: provision new key in Anthropic console, update Vercel env, redeploy, revoke old key.
- Postgres: rotate via Neon role refresh.

**What we do NOT store:**

- We do not collect or persist requester PII in v0.
- When v1 adds request tracking, requester contact info is the most sensitive data we hold. See §6.

---

## 6. Security posture

Public-records requesters are a population that includes journalists, whistleblowers, activists, and incarcerated requesters. Some of them are targets of retaliation. We design around that.

- **Minimize collection.** v0 collects nothing. v1 will collect only what's required to track a request.
- **Encrypt at rest.** Postgres on Neon is encrypted at rest by default. Application-level encryption for any field that names a requester will be evaluated before v1 ships.
- **TLS everywhere.** Enforced by Vercel.
- **No requester-identifying logs.** Application logs use structured fields with explicit allowlists. PII fields are redacted at the logger level, not at the call site.
- **No third-party tracking.** No Google Analytics, no Meta pixel, no session replay tools. Privacy-respecting analytics (Plausible or self-hosted) will be evaluated when we need traffic data.
- **Threat model the tracker before shipping.** The request-status tracker is a magnet for retaliation. A dedicated threat-modeling pass is a precondition for v1.

---

## 7. Accessibility

WCAG 2.2 AA from day one. Non-negotiable.

- Semantic HTML first. ARIA only when semantic HTML doesn't suffice.
- Radix UI primitives for any interactive widget more complex than a button or link.
- Keyboard-navigable. Skip-to-main-content link on every page.
- Color contrast meets AA in both light and dark schemes.
- Plain-language copy. Legal concepts translated into ordinary English with the citation underneath.
- Accessibility automated tests (axe) added to CI when interactive components land.

---

## 8. Reversibility (one-way vs. two-way doors)

| Decision | Door | Notes |
| --- | --- | --- |
| Postgres + Drizzle | Two-way | Schema is exportable; ORM is thin. |
| Next.js | Two-way | App Router code is portable Node; we can swap hosts. |
| Vercel | Two-way | Build artifact is standard. |
| Anthropic as sole LLM | Two-way | Abstracted behind a `LlmClient` interface (lands with THE-4). |
| TypeScript | Two-way | Trivial to call out to Python/Rust for heavy data work via subprocess or HTTP. |
| Public statute-data schema | **One-way** | Once we publish a schema downstream tools depend on, we own it. Schema changes will be versioned. |
| Public API for partners | **One-way** (future) | Out of scope for v0. Will require a deprecation policy when it lands. |

---

## 9. How to run locally

**Prerequisites:**

- Node.js 20 or newer (project tested on Node 22).
- npm 10 or newer.

**Setup:**

```bash
git clone <repo-url> hole-truth
cd hole-truth
cp .env.example .env.local      # fill in keys when needed; not required for v0 landing page
npm install
npm run dev                     # http://localhost:3000
```

**Other scripts:**

```bash
npm run build      # production build
npm run start      # run the production build locally
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

That's the contract. If a new dependency or script lands, this section must be updated in the same PR.

---

## 10. CI / Deploy path

- GitHub Actions runs `npm install`, `npm run lint`, `npm run typecheck`, and `npm run build` on every PR and on every push to `main`.
- Vercel auto-deploys `main` to production and every PR branch to a preview URL. The Vercel integration is configured in the GitHub repo settings (one-time CEO action when the repo lands on GitHub).
- No secrets are needed in GitHub Actions for v0 — the build does not contact any third-party service.

---

## 11. Roadmap (technical)

**v0 (shipped):** Public landing page. Repo + CI + deploy path proven. No user data, no LLM calls.

**v0.1 (shipped):** Statute corpus schema + ingestion for federal FOIA + 5 priority states (TX, CA, NY, IL, FL). Tracked as **THE-4**. JSON-per-jurisdiction with provenance on every load-bearing field; loader exposes `getJurisdiction()`.

**v0.2 (shipped — THE-5):** Request-drafting flow at `/draft`. User picks a jurisdiction + record type, system drafts a legally-sound request with the citation pulled verbatim from the corpus. **No LLM in the loop yet** — the v0 drafter is a pure template fed by typed corpus lookups, which is the simplest way to guarantee no hallucinated citations. The "no hallucinated citation" invariant is enforced by `test/drafter.test.ts`. **No PII collection.**

**v1:** Request tracking. Account creation, request status, follow-up generation, appeal drafting. PII enters the system here. Security threat-modeling required as a precondition.

**v1.x:** Public API for partner integrations (newsroom CMSes, FOI advocacy tooling).

**v2 considerations:** RAG over agency response patterns, multi-LLM evaluation, fine-tuned exemption classifier. None of this happens before v1 is in users' hands.

---

## 12. What is explicitly out of scope here

- The statute data pipeline: see **THE-4**.
- The request-drafting UX: separate ticket, post-corpus.
- Long-term hosting decisions: revisit at the first paid tier.
- Account / auth: revisit at v1.
- Mobile apps: not on the roadmap. The web app must be excellent on mobile browsers instead.
