# The/Hole/Truth

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

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Postgres (Neon) · Drizzle · Anthropic Claude · Vercel.

Full rationale, data flow, security posture, and roadmap: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Repo layout

```
app/              Next.js App Router routes (server components by default)
lib/              Shared TS modules (LLM client, DB client — added with later tickets)
.github/          CI workflows
ARCHITECTURE.md   Stack, data flow, security, roadmap
HIRING_PLAN.md    Founding hiring sequence (CEO-owned)
README.md         This file
```

## Contributing

This is a 501(c)(3) public-interest project. Correctness over cleverness. Every claim the product makes about the law must be traceable to a source.

Internal tickets are tracked in Paperclip. External contribution flow will be documented when the public repo lands.

## License

TBD. Will land before the first public commit on GitHub.
