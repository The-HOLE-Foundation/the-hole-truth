# Contributing to The/Hole/Truth

Thanks for your interest. This is a 501(c)(3) public-interest project. Our
single most important constraint is **correctness over cleverness** — every
claim the product makes about the law must be traceable to a primary source.

## Maintainers (v0)

- **CEO** — Joseph Herrmann ([@joeherrmann](https://github.com/joeherrmann))
- **CTO** — agent-led, under CEO sign-off

For v0 the maintainer set is intentionally small. Hiring sequence is tracked
in [`HIRING_PLAN.md`](./HIRING_PLAN.md).

## How to file an issue

Use the repository's [Issues tab](https://github.com/The-HOLE-Foundation/the-hole-truth/issues).
Useful issues include:

- A clear title (what is wrong, what should happen).
- Reproduction steps when reporting a bug.
- A primary-source citation (statute, regulation, court order) when reporting
  a legal-domain error — e.g. "the Texas PIA response window in
  `corpus/jurisdictions/tx.json` cites the wrong subsection of § 552.221."

**Do not file security vulnerabilities as public issues.** See
[`SECURITY.md`](./SECURITY.md) for the private disclosure path.

## How to propose a change

1. Fork the repository.
2. Create a topic branch off `main`.
3. Make your change. Keep diffs focused — one concern per PR.
4. Run the local checks before pushing:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run validate:corpus
   npm run build
   ```

5. Sign your commits per the DCO requirement below.
6. Open a pull request against `main`. Describe what changed, why, and how it
   was verified.

For substantive code changes, the IC review loop documented in
[`docs/coderabbit-loop.md`](./docs/coderabbit-loop.md) is the expected
pre-merge checkpoint. Pure docs / config / typo PRs may skip it.

## Developer Certificate of Origin (DCO)

Every commit must be signed off under the
[Developer Certificate of Origin v1.1](https://developercertificate.org/).
The DCO is a lightweight, paperwork-free attestation that you have the right
to submit the code you are contributing — no CLA, no email, no notary.

Sign off by adding a `Signed-off-by:` trailer to your commit message. The
easiest way is to commit with `-s`:

```bash
git commit -s -m "fix(corpus): correct CA CPRA response-window citation"
```

That appends:

```text
Signed-off-by: Your Name <you@example.com>
```

to the commit message. The name and email must match a real identity you can
be reached at — typically your `git config user.name` and `user.email`.

The DCO is enforced on pull requests by the
[DCO GitHub App](https://github.com/apps/dco). If a commit is missing the
trailer, amend it (or rebase the branch) and force-push the topic branch:

```bash
git commit --amend -s --no-edit          # last commit only
git rebase --signoff main                # the whole branch
git push --force-with-lease
```

## Scope ground rules

- **Legal-domain claims need primary sources.** Statute citations, response
  windows, fee structures, exemption lists — every field in the jurisdiction
  corpus has to be traceable to an authoritative source (`leginfo.legislature.ca.gov`,
  `statutes.capitol.texas.gov`, etc.). Secondary summaries are not enough.
- **No hallucinated citations.** The v0 drafter generates statutory references
  by lookup, not by LLM. Tests in `test/drafter.test.ts` enforce this. If you
  introduce a code path that synthesizes a citation, add coverage proving it
  cannot drift from the corpus.
- **Accessibility (WCAG 2.2 AA) is a constraint, not a feature.** Public-records
  users include journalists on deadline, people with disabilities, and
  incarcerated requesters with limited tooling.
- **Out of scope for v0:** marketing copy, social integrations, statute-corpus
  data-license decisions (deferred to the v1 statute-pipeline issue), and
  any tracking of requester PII beyond what is strictly required to fulfill
  a request.

## License

By contributing, you agree that your contributions will be licensed under the
[Apache License, Version 2.0](./LICENSE), the same terms as the rest of the
project.
