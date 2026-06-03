# Hire 2 — Candidate Evaluation Rubric and Take-Home Assessment

**Owner:** CTO + CEO (co-review).
**Drafted:** 2026-06-03.

This rubric is applied identically to candidates from both sourcing tracks ([Track A — human contractor](./hire-2-sourcing-plan.md#track-a--human-contractor-paralegal-law-student-or-domain-specialist) and [Track B — legal-domain agent](./hire-2-sourcing-plan.md#track-b--legal-domain-agent)). A candidate from either track that does not pass the take-home does not advance, full stop. We do not relax the bar for the agent track or for any candidate's pedigree.

---

## Stage 1 — Intake screen (10 minutes per applicant)

**Pass/fail signals** (CTO reviews first; sends pass list to CEO weekly)

- One-paragraph background note actually describes what records or jurisdictions the candidate has worked on. **Fail** if generic.
- Writing sample is one to three pages and demonstrates statutory reading (memo, brief, AG opinion analysis, public-records-appeal letter). **Fail** if the sample is litigation-strategy or persuasion writing with no statute work.
- No active conflict that would prevent work on any of the v0 jurisdictions (TX, CA, NY, IL, FL, federal). **Fail** if undisclosed at intake; disclosed conflicts are a conversation, not a disqualifier.

Pass rate target: ~30–50% of intake reaches Stage 2.

## Stage 2 — Take-home assessment (target ≤ 90 minutes of candidate time)

The candidate is given **one** of the five live `needs_escalation` fields in the v0 corpus and asked to produce a written review memo. We default-assign the **Texas substantive-deadline field** for human candidates because it is the cleanest standalone interpretive question; the agent track runs the same TX assessment as its calibration cycle so the CEO can compare outputs directly. The Florida and California fields are held in reserve for finalists if a second sample is needed.

**The prompt** (text given to the candidate)

> The/Hole/Truth's v0 corpus has the following record for Texas's substantive-response deadline under the Public Information Act:
>
> ```json
> {
>   "value": { "amount": 10, "unit": "days", "day_type": "business" },
>   "certainty": "needs_escalation",
>   "citation": "Tex. Gov't Code § 552.221(a), (d)",
>   "source_url": "https://statutes.capitol.texas.gov/Docs/GV/htm/GV.552.htm",
>   "retrieved_on": "2026-06-01",
>   "notes": "Statute requires 'prompt' production with no fixed number of days. 10 business days is the practical norm derived from § 552.221(d) and AG opinions, but it is not a statutory deadline for production itself. Needs legal review before being surfaced to users as 'the deadline.'"
> }
> ```
>
> Please write a 300–600 word memo answering, in this order:
>
> 1. What does Tex. Gov't Code § 552.221 actually say about the production timeline? Quote the operative language directly from the official source.
> 2. Where does the "10 business days" framing come from? Cite specifically — section, subsection, AG opinion, judicial decision — and explain whether the source is a statutory rule or an interpretive gloss.
> 3. Should we mark this field `confirmed` with `value: {amount: 10, unit: "days", day_type: "business"}`? If yes, why is that defensible. If no, what should the corpus say instead and what `certainty` should it carry. Be specific: propose the exact JSON values you would write.
> 4. If the answer is "the statute does not provide a fixed number," how should the product surface this to a user who picks Texas and asks "when do I get a response?" Write one or two sentences of user-facing text you would be willing to defend to a reporter.
> 5. What is the next escalation question, if any, that needs to go to outside counsel before this field can be sealed?
>
> **Required formatting**: cite section and subsection numbers directly, include the official-source URL you actually re-fetched (do not rely on the URL in the corpus record alone), and use direct quotations for any operative statutory language.

**Time-boxed**: candidates are told the assessment is targeted at 90 minutes and we will not read past ~600 words; this is a calibration on judgment and clarity, not endurance.

## Stage 3 — Rubric scoring

Each take-home is scored independently by the CTO and the CEO using the same rubric, then the two scores are reconciled in a 15-minute conversation. Score on a 0–3 scale per dimension; a passing memo scores **at least 2 on every dimension** and **at least 14 of 18 total**. A 3 on any one dimension does not rescue a 0 or 1 on another.

| # | Dimension | 0 | 1 | 2 | 3 |
|---|-----------|---|---|---|---|
| 1 | **Statute reading** — Did they re-read the actual statute text? | Quoted from memory or the notes field. | Quoted the statute but missed § 552.221(d) or the "prompt" language. | Quoted the operative "promptly" language in (a) and the 10-business-day check-in in (d) accurately. | Plus identified that (d) is a certification-on-delay obligation, not a production deadline. |
| 2 | **Citation precision** — Section and subsection cited correctly. | Cited only the chapter, or cited a wrong section. | Cited the right section, missed subsection precision. | Cited § 552.221(a) and (d) precisely. | Plus distinguished § 552.221 from § 552.301's separate 10-day AG-ruling-request clock, which is a common confusion. |
| 3 | **Defensibility judgment** — Did they refuse to mark `confirmed` on this field? | Marked `confirmed` with no qualifications. | Marked `confirmed` with a verbal hedge but no JSON revision. | Refused `confirmed`; proposed `uncertain` or kept `needs_escalation` with rationale. | Plus proposed the exact JSON they would write, e.g., shifting `value` to a narrative string and setting `certainty: "uncertain"`. |
| 4 | **User-facing translation** — Sentence they wrote for the product UI. | Promised a 10-business-day deadline as a hard rule. | Hedged but still implied a numeric deadline as the answer. | Honestly conveyed "no fixed statutory deadline; agencies must produce promptly and certify any delay over ~10 business days." | Plus the sentence is plain-English, no jargon, no implied legal advice. |
| 5 | **Escalation discipline** — Did they identify the next question for counsel? | Skipped or said "no escalation needed." | Named a question but it is not the load-bearing one. | Named the right question (e.g., "Is a sub-numeric value defensible to surface to users, or do we surface only a narrative?"). | Plus framed the question in a way outside counsel could answer in a 15-minute call. |
| 6 | **Source discipline** — Did they actually re-fetch and verify? | Relied on the corpus URL with no evidence of re-fetch. | Re-fetched but cited only the URL, no excerpt. | Re-fetched, included an excerpt that matches the current code text, included the URL. | Plus noted any discrepancy between the corpus `retrieved_on` date and the current state of the official source. |

**Pass:** ≥ 14/18 total, no individual score below 2.
**Borderline (12–13/18 or one dimension at 1):** CEO reviews directly; may advance to Stage 4 conditionally.
**Fail (<12/18 or any dimension at 0):** Does not advance. Polite-decline template.

**Agent-track calibration note:** the agent's memo is scored on the same rubric. If the agent fails on dimension 4 (user-facing translation) or dimension 5 (escalation discipline) — both of which are judgment calls — the CTO will revise the agent's instructions and re-run once. A second failure on the same dimension means Track B is not viable at this scope, and the CEO is notified to consider Track A only.

## Stage 4 — Live conversation (30 minutes)

Only human candidates. Format:

- 5 min: candidate background, what they have worked on.
- 10 min: walk through their take-home memo together. Ask "what would you change if a user pushed back?" and "what would you tell us if we said please mark it `confirmed`?"
- 5 min: working-style fit — async cadence, weekly checkpoints, willingness to escalate in writing.
- 5 min: conflicts disclosure, references.
- 5 min: candidate questions.

**Pass signal:** candidate holds their position under push-back where appropriate, revises where appropriate. We are explicitly testing whether they will tell the CTO "no" when the CTO is wrong.

## Stage 5 — Decision

CTO and CEO co-decide. A "no" from either is a no. Decision logged on [THE-84](https://github.com/The-HOLE-Foundation/the-hole-truth/issues) with one paragraph of reasoning and the take-home score. Polite-decline communicated within 5 business days for non-advancing candidates.

If the decision is to hire under Track A and the fundraising gate has not yet cleared, the candidate is offered a written "warm hold": signed engagement letter to start within 14 days of CEO fundraising confirmation, no compensation accrues until the start date. If the candidate cannot accept a warm hold, we move to the next candidate or default to Track B for the interim live workload.

---

## What we are *not* using as a signal

- The candidate's law school name or firm name.
- Bar membership.
- Years of experience (a strong 1L can outscore a 15-year practitioner on this rubric, and the rubric is the bar).
- Familiarity with our specific tech stack. They will never touch it.
- Speed of response to the take-home. We give the time budget; rushing is not rewarded.
- Persuasiveness or tone of writing. Citation accuracy and judgment is the bar; pretty prose is a nice-to-have.

---

**References**

- JD: [`hire-2-legal-jd.md`](./hire-2-legal-jd.md).
- Sourcing plan: [`hire-2-sourcing-plan.md`](./hire-2-sourcing-plan.md).
- TX substantive-deadline source field: [`corpus/jurisdictions/us-tx.json`](../corpus/jurisdictions/us-tx.json) lines 34–41.
- Texas PIA statute (official source): https://statutes.capitol.texas.gov/Docs/GV/htm/GV.552.htm
