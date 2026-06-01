# Hiring Plan — The/Hole/Truth

**Owner:** CEO
**Date:** 2026-06-01
**Status:** v1 (founding)

## Mission frame

The/Hole/Truth is a 501c3 dedicated to the public's right to know. Translated to a product wedge so we can hire against it:

> **Build the cheapest, fastest, most correct path for any member of the public to (a) understand what records they're entitled to, (b) draft a legally-sound public-records request to the correct agency, and (c) track and escalate the response.**

Federal FOIA + 50 state transparency statutes + the major local-government wrinkles (TX PIA, CA CPRA, NY FOIL, IL FOIA, FL Sunshine).

Why this wedge:
- Concrete enough to ship.
- Aligns with 501c3 charitable purpose (public education + access).
- Has obvious surface area for the AI/agent stack (statute corpus → request drafting → status tracking).
- Sized for a small founding team without external counsel.

## Hiring philosophy

- **Hire slow, fire fast.** One mis-hire at this scale is a quarter of capacity gone.
- **Founder profile only for hires 1–3.** I need people who will own their function end-to-end, not specialists who need direction.
- **No leadership vacuums.** Every function needs a named owner before it starts producing meaningful work.
- **Be replaceable in execution, irreplaceable in judgment.** I delegate execution; I keep strategy, capital allocation, key hires, and existential risk.

## Headcount sequence

### Hire 1 — CTO / Founding Engineer (now)

**Why first:** product exists or it doesn't. Everything downstream needs running code.

**Scope:**
- Own the entire technical stack: web app, API, data pipeline, deployment, security.
- Choose the stack. I will push back if the choice is exotic without justification.
- Bootstrap the statute/jurisdiction data ingestion pipeline.
- Hire and manage future engineers.

**Profile (for the agent):** senior full-stack engineer with strong opinions on shipping, comfortable with AI/RAG patterns, biased toward boring tech that works.

**Acceptance bar for first 30 days:**
1. Working v0: user picks a jurisdiction + record type, the system drafts a request with the correct citation.
2. A README-level architecture doc.
3. A first three-engineer hiring sketch (when, what, why).

### Hire 2 — UX Designer (≤ 2 weeks after Hire 1)

**Why second:** this product is public-facing. If it is hostile or confusing, no one uses it and the mission fails. Cannot punt UX onto the engineer.

**Scope:**
- Information architecture for a multi-jurisdiction product that does not overwhelm laypeople.
- Accessibility (WCAG 2.2 AA minimum — public-records users include people with disabilities, journalists on deadline, and incarcerated requesters).
- Plain-language copy for legal concepts.

### Hire 3 — Legal Domain Expert / Statute Researcher (≤ 4 weeks after Hire 1)

**Why third:** the engineer can scaffold a statute database but cannot reliably populate it. Wrong citations = wrong product = liability and reputational damage. This role keeps us honest.

**Scope:**
- Maintain the per-jurisdiction statute corpus (response deadlines, fee structures, exemptions, appeal paths).
- Review AI-generated request templates before they ship.
- Track amendments to transparency laws across jurisdictions.

### Hire 4 — CMO / Head of Comms (when v1 ships, target ≤ 8 weeks)

**Why fourth, not later:** a 501c3 with no audience is a research project. Public awareness is part of the mission, not an afterthought.

**Scope:**
- Earn the first 10,000 users.
- Build relationships with journalism schools, FOI advocacy groups, transparency newsrooms.
- Own donor communications + impact reporting.

### Deliberately deferred

- **Second engineer.** Hire 1 should be enough to ship v0–v1. Adding a second engineer before there is a system to extend creates onboarding overhead the org cannot absorb.
- **General Counsel.** For a 501c3 we contract this until we have repeat-pattern legal work. Pro-bono counsel is the right model at this stage.
- **Operations / People.** Premature. The CEO covers this until the org breaks.

## Budget posture

Company monthly budget is currently $0. Before the CTO ships anything that incurs cost (hosting, API spend, paid data sources), they must propose the spend back to me with an expected return. Above 80% of any future budget, only critical-path work.

## Out of scope for this plan

- Long-term comp structure for paid contributors (we are agent-staffed first).
- Geographic expansion beyond the US — start with what we can be correct about.
- Partnerships and grants — separate workstream after v1.

## Open questions for the board

1. Does the board endorse the FOIA-assistant wedge, or is there a different first product?
2. Any constraint on infrastructure spend before v0 ships?
3. Is there an existing relationship with pro-bono counsel I should know about?
