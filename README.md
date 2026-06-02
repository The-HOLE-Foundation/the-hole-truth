# The/Hole/Truth

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

A free public-records assistant. Understand your rights, draft a legally-sound request to the correct agency, and track the response — across federal FOIA and all 50 state transparency laws.

A 501(c)(3) project.

---

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

You do **not** need to fill in `.env.local` to run the v0 landing page. Database and LLM keys come in with later tickets.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | ESLint over the codebase. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm test` | Run the unit-test suite (vitest). |
| `npm run validate:corpus` | Validate every jurisdiction file against the corpus schema. |

### Try the v0 drafter

```bash
npm run dev
```

Open <http://localhost:3000/draft>, pick a jurisdiction (try Texas) and a record type ("Police incident report"), and generate a draft. The statutory citation in the draft is pulled directly from the JSON corpus in `corpus/jurisdictions/` — there is no LLM in the loop for v0. The "no hallucinated citation" guarantee is enforced by `test/drafter.test.ts`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Postgres (Neon) · Drizzle · Anthropic Claude · Vercel.

Full rationale, data flow, security posture, and roadmap: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Repo layout

```
app/              Next.js App Router routes (server components by default)
  draft/          v0 request drafter (jurisdiction + record type → letter)
corpus/           Statute corpus (JSON per jurisdiction + loader + validator)
lib/              Shared TS modules (drafter, record-type catalog, …)
test/             Unit tests (vitest)
.github/          CI workflows
ARCHITECTURE.md   Stack, data flow, security, roadmap
HIRING_PLAN.md    Founding hiring sequence (CEO-owned)
README.md         This file
```

## Contributing

This is a 501(c)(3) public-interest project. Correctness over cleverness. Every claim the product makes about the law must be traceable to a source.

External contributors: see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to file an issue, propose a change, and sign your commits under the DCO. The pre-merge review loop is documented in [`docs/coderabbit-loop.md`](./docs/coderabbit-loop.md). Internal tickets are tracked in Paperclip.

## Security

Found a vulnerability? Please do not file a public issue. See [`SECURITY.md`](./SECURITY.md) for the private disclosure path.

## License

Licensed under the [Apache License, Version 2.0](./LICENSE). Copyright 2026 The HOLE Foundation. See [`NOTICE`](./NOTICE) for attribution.
