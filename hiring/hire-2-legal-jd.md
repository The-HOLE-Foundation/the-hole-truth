# Hire 2 — Legal Domain Expert (Contractor / Part-Time)

**Status:** Open. Drafted 2026-06-03 by CTO under [THE-84](https://github.com/The-HOLE-Foundation/the-hole-truth/issues) per CEO operating decision on [HIRING_NEXT_3.md](../HIRING_NEXT_3.md).
**Engagement shape:** Part-time contractor (~10 hr/week) OR scoped legal-domain agent. Not FTE for v0.
**Reporting line:** CTO operationally; CEO for legal sign-off and any interpretive call.

---

## What The/Hole/Truth is

A 501(c)(3) building a free public-records assistant. A member of the public picks a jurisdiction and a record type; the tool drafts a legally-sound request with the correct statutory citation and shows them how to file and follow up. Coverage scope is federal FOIA plus 50 state transparency statutes, with an initial focus on the high-volume jurisdictions (TX PIA, CA CPRA, NY FOIL, IL FOIA, FL Sunshine).

A wrong citation is worse than a missing one. That is the operating principle this role exists to enforce.

---

## What this role is (and what it is not)

**This role is a legal-accuracy role, not a legal-advice role.**

You will review statutory text and citations the engineering team writes into structured data (`corpus/jurisdictions/*.json`) and confirm — against the current code text, not a memory or a secondary source — whether each cited section says what we claim it says. You will not provide legal advice to any requester, to the team, or to the public. The product itself is explicit with users that it helps them draft a request and does not constitute legal advice; your role exists upstream of that disclaimer, to make sure the underlying facts the product tells users are accurate.

If you are an attorney, this is **not** the practice of law. If you are a paralegal, law student, or a non-attorney domain specialist, this is squarely within your competence.

## What you own

1. **Statutory citation review and sign-off** for every jurisdiction record in [`corpus/jurisdictions/`](../corpus/jurisdictions/). You do not write the JSON; the engineering team does. You review, sign off, or correct. A field is not marked `certainty: confirmed` until you say so and the CEO co-signs.
2. **Clear the five live `needs_escalation` fields** that ship with v0:
   - CA — `response.substantive_deadline` (post-recodification 10-day clock framing).
   - CA — `exemptions.categories` (post-recodification section numbers across §§ 7923.000–7930.215).
   - TX — `response.substantive_deadline` ("prompt" production vs. 10-business-day check-in framing).
   - FL — `response.acknowledgment_deadline` (no fixed deadline; "reasonable time" standard).
   - FL — `response.substantive_deadline` (no fixed deadline; "reasonable time" standard).
   See [`corpus/jurisdictions/us-ca.json`](../corpus/jurisdictions/us-ca.json), [`us-tx.json`](../corpus/jurisdictions/us-tx.json), [`us-fl.json`](../corpus/jurisdictions/us-fl.json) and the `notes` on each escalated field for the specific question to answer.
3. **Author a legal review protocol** that lives in the corpus repo (`corpus/REVIEW_PROTOCOL.md`). It defines: the checklist for adding a new jurisdiction, the definition of `confirmed`, who signs off, the escalation path, and what counts as a defensible source citation.
4. **Run the protocol you wrote.** One jurisdiction at a time. CEO sign-off required before any record is marked `confirmed`.
5. **A live open-questions queue** in the issue tracker — refreshed weekly with what is escalated to outside counsel or the CEO, why, and the proposed resolution.

## What you do not own

- Code. You will not be asked to write or change JSON, schema, validator code, UI, or anything else in the codebase. Engineering owns all of that.
- Corpus tooling. The validator, scripts, and CI checks are engineering's problem.
- UI copy. The way the product talks to users about a deadline or an exemption is a product decision that takes your accuracy input but is not yours to draft.
- Legal advice to users, donors, or staff. If a user asks the team a legal question, the team will refer them out. You are not the referral.

## Profile we are looking for

You will fit this role well if you are one or more of the following:

- A **paralegal** with prior work on records requests, public-records litigation support, or statutory research in any jurisdiction.
- A **law student** (2L, 3L, or post-graduate fellow) with a transparency-law, government-accountability, or media-law focus. Clinic experience preferred but not required.
- A **non-attorney domain specialist** at a transparency or open-government organization (Reporters Committee, MuckRock, NFOIC affiliates, state press associations, state ACLU records projects) with hands-on FOIA/PIA/CPRA experience.
- A **practicing attorney** willing to work at a paralegal-equivalent scope on a contractor basis. (Welcome — but understand the scope is citation accuracy, not appellate strategy.)

**Required**

- Ability to read a statute and tell us, citation by citation, whether the cited section actually says what we claim it says against the **current** code text. The single most common defect in this kind of data is citing a section that was renumbered or repealed.
- Comfort writing in plain English about why a field is `confirmed` vs. `uncertain` vs. `needs_escalation`. You will sometimes argue for "uncertain" against the engineer who wants "confirmed." That is the job.
- Willingness to say "I don't know, escalate to outside counsel" in writing. This is required, not penalized.

**Strongly preferred**

- Prior exposure to one or more of: TX PIA (Tex. Gov't Code Ch. 552), CA CPRA (Cal. Gov't Code Div. 10, Title 1), NY FOIL (Pub. Off. Law Art. 6), IL FOIA (5 ILCS 140), FL Ch. 119, federal FOIA (5 U.S.C. § 552).
- Familiarity with state Attorney General opinion letters as a source of interpretive guidance (especially TX OAG opinions).

**Not required**

- A bar license.
- Software experience. You will use GitHub through the web UI and Google Docs. The engineering team will handle anything more technical for you.
- Familiarity with any specific commercial legal research platform.

## How the work happens

- **Cadence:** Asynchronous, ~10 hr/week. You set your own hours within a weekly cycle. Weekly review checkpoint with the CTO; CEO co-reviews any escalation.
- **Throughput target:** One jurisdiction reviewed end-to-end per two-week cycle once the five live escalations are cleared.
- **Tools:** GitHub web UI for reading the corpus JSON. Google Docs for legal review memos. Whatever statutory research tools you already use — we do not require Westlaw or Lexis. The official-source URL in each record is the canonical source; if you cite something else, say so in the review.
- **Output format:** A short memo (200–500 words) per field reviewed, with the recommendation (`confirmed` / keep `uncertain` / escalate) and the source you verified against. Templates will be provided.

## Compensation and constraints

- **Rate range:** $2,000–$3,000/month for ~10 hr/week (≈ $50–$75/hr, contractor 1099). Negotiable based on profile.
- **Engagement length:** Minimum 90 days. Extension or conversion to part-time W-2 contemplated only when the corpus passes ~15 jurisdictions or v0.5 launches with real user volume, whichever comes first.
- **Spend approval gate:** No paid engagement is signed before the CEO confirms the fundraising line has cleared. This is a hard gate, not a formality. The agent track (below) is available if the gate has not yet cleared.
- **Conflicts:** Active practitioners must disclose any ongoing representation of any government agency that is a custodian of records in our jurisdictions of scope. Disclosure is not automatic disqualification; concealment is.

## Alternate path — legal-domain agent

The same role can be filled by a scoped legal-domain agent (an AI agent with web-fetch, corpus repo access, and a CEO escalation queue). The agent track is budget-zero on compensation (model spend flows through the standard infrastructure budget gate) and is sized to one jurisdiction at a time with CEO sign-off before any `confirmed` mark. The two-track sourcing plan is in [`hire-2-sourcing-plan.md`](./hire-2-sourcing-plan.md). The CEO will choose between tracks (or run both in parallel for the first cycle) before sourcing begins.

## How to apply

Email a one-paragraph note about your background and what record-types-and-jurisdictions you have actually worked on to **legal-search@thehole.truth**. Include any writing sample (one to three pages) that demonstrates statutory reading — a memo, a clinic brief, an AG opinion analysis, a public-records-appeal letter. We will respond with the take-home assessment described in [`hire-2-evaluation-rubric.md`](./hire-2-evaluation-rubric.md).

We will not screen on pedigree. Read the corpus, read the protocol skeleton, and send us writing.

---

**References**

- Strategic memo: [`HIRING_NEXT_3.md`](../HIRING_NEXT_3.md), §"Hire 2 — Legal Domain Expert".
- Corpus: [`corpus/`](../corpus/), [`corpus/README.md`](../corpus/README.md), [`corpus/V0_SCOPE.md`](../corpus/V0_SCOPE.md).
- Schema: [`corpus/schema/jurisdiction.schema.json`](../corpus/schema/jurisdiction.schema.json).
- The five live escalations are at [`us-ca.json`](../corpus/jurisdictions/us-ca.json) lines 41–48 and 121–135, [`us-tx.json`](../corpus/jurisdictions/us-tx.json) lines 34–41, and [`us-fl.json`](../corpus/jurisdictions/us-fl.json) lines 26–41.
