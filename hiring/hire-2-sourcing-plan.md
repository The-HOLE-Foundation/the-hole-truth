# Hire 2 — Two-Track Sourcing Plan

**Owner:** CTO. **Decision owner:** CEO.
**Drafted:** 2026-06-03. **Status:** Awaiting CEO selection between Track A, Track B, or run-both.

This document is the operating plan for sourcing the [Hire 2 — Legal Domain Expert](./hire-2-legal-jd.md). The CEO operating decision on [THE-6](https://github.com/The-HOLE-Foundation/the-hole-truth/issues) authorized a contractor or part-time agent at paralegal/law-student profile. This plan presents both tracks side-by-side and recommends a default. The CEO selects.

---

## Track A — Human contractor (paralegal, law student, or domain specialist)

**Sourcing channels** (priority order, cheapest signal first)

1. **National Freedom of Information Coalition (NFOIC) state-affiliate networks** — the 35+ state coalitions have working paralegals and law students who do this exact work. Email + LinkedIn outreach to the directors of the five v0 jurisdictions (TX FOI Foundation, First Amendment Coalition (CA), New York Coalition for Open Government, Illinois Press Association, Florida First Amendment Foundation). Expected response: 1–2 candidates per coalition, 5–10 total.
2. **Law school transparency / media-law clinics** — direct outreach to clinic directors at:
   - UT Austin Law — First Amendment Clinic.
   - UC Irvine Law — Press Freedom & Source Protection Clinic.
   - NYU Law — Technology Law & Policy Clinic.
   - University of Florida Brechner Center for the Advancement of the First Amendment.
   - Northwestern Pritzker Law — MacArthur Justice Center records-litigation team.
   Clinic directors routinely refer 3Ls and recent grads for short engagements. Expected response: 2–4 candidates total within ~10 business days.
3. **Reporters Committee for Freedom of the Press fellowship/alum network** — the RCFP Local Legal Initiative network has paralegal-grade researchers who already specialize in state PRA work. Ask the RCFP Open Government Program for a paralegal-referral conversation.
4. **MuckRock community + Lucy Parsons Labs** — practitioners who write PRAs every week. Long-shot but cheap.
5. **Targeted LinkedIn search** — paralegals with "FOIA," "public records," "CPRA," "PIA," or state-records terms in headline or experience. Boost: titles at state ACLU records projects, AG offices in retirement, state press association policy roles. Expected: noisy, ~20–40 contacts to yield 3–5 conversations.

**Pipeline timing (realistic)**

- Week 1: outreach drafted and sent. Take-home assessment finalized.
- Weeks 2–3: candidate responses, take-home distributed to interested respondents.
- Weeks 3–4: take-home scoring (CTO + CEO), short-list of 2–4 candidates.
- Week 5: live 30-min conversations with finalists, CEO present.
- Week 6: hire decision, contract drafted (subject to fundraising gate).
- Week 7: contract signed, onboarding begins (if gate cleared).

**Cost and budget gate**

- Compensation: $2,000–$3,000/month for ~10 hr/week.
- **Hard gate: no contract signed before the CEO confirms the fundraising line cleared.** Per the [HIRING_NEXT_3](../HIRING_NEXT_3.md) constraint. If the gate has not cleared at week-6 hire-decision time, the CTO will hold the candidate warm with a written status note and shift to Track B for the live workload until the gate clears.
- Bench cost: the outreach is free; CTO time on sourcing is ~6–8 hr total over 4 weeks.

**Risk surface**

- Active practitioner conflicts. Some paralegals at firms representing government agencies cannot work on this. We screen at intake via the JD's conflicts clause.
- Capacity drift. 10 hr/week is a small commitment, and small commitments are the easiest to deprioritize. Mitigation: minimum 90-day engagement clause in the contract, with the first jurisdiction reviewed end-to-end as a 30-day milestone.
- Pedigree filter. Tempting to over-index on law-school-name or firm-name signals. The JD explicitly says we will not, and we will hold to that.

**What success looks like in 30 days post-hire**

- Five live `needs_escalation` fields resolved to `confirmed` or escalated to outside counsel with written rationale.
- `corpus/REVIEW_PROTOCOL.md` merged.
- At least one new jurisdiction reviewed end-to-end under the new protocol.

---

## Track B — Legal-domain agent

**Shape**

A scoped agent created via Paperclip's `paperclip-create-agent` workflow, sized at one jurisdiction at a time with CEO sign-off as the terminal review gate. The agent does *not* mark fields `confirmed` autonomously; every promotion from `needs_escalation` or `uncertain` to `confirmed` requires CEO sign-off on the agent's memo. The agent's job is to produce defensible, citation-bearing memos at a faster cadence than a contractor can manage.

**Tool surface (minimum viable stub)**

- `web-fetch` against statute hosting domains (`leginfo.legislature.ca.gov`, `statutes.capitol.texas.gov`, `leg.state.fl.us`, `nysenate.gov`, `ilga.gov`, `law.cornell.edu/uscode/text/5/552`).
- Corpus repo read access (GitHub + local clone).
- The CEO escalation queue (a child-issue path on [THE-84](https://github.com/The-HOLE-Foundation/the-hole-truth/issues) per cleared field).
- Read-only access to a small reference cache of AG opinions and key case law (FL `Tribune Co. v. Cannella`, CA SB 1421 / SB 16 implementation guidance, TX OAG open-records decisions). Built once, updated when a new jurisdiction is added.

The agent does **not** get write access to `corpus/jurisdictions/`. Memos only. Engineering applies the JSON edit after sign-off.

**Setup cost**

- Agent profile and instructions: ~4–6 hr of CTO time to draft, applying the [HIRING_NEXT_3](../HIRING_NEXT_3.md) load-bearing distinction between legal accuracy and legal advice.
- Tool stub: minimal — the web-fetch + GitHub access is already available. The reference cache is the only net-new build, ~2 hr.
- Model spend: comes from the standard infrastructure budget, not headcount. Estimated ~$50–$150/month at the projected throughput of one jurisdiction per 1–2 weeks. Will be reported in the monthly infra cost review back to the CEO.

**Pipeline timing (realistic)**

- Days 1–2: agent profile, instructions, and reference cache built.
- Days 3–5: agent runs the take-home assessment on TX `substantive_deadline` as the calibration exercise. CTO and CEO review the memo against the rubric *as if it were a human candidate*.
- Days 6–14: if calibration passes, agent works the four remaining `needs_escalation` fields one at a time. Each produces a memo. CEO signs off (or rejects) per memo.
- Days 15–30: agent runs the first net-new jurisdiction (e.g., GA, WA, or whichever the CEO prioritizes next) under the protocol it co-authored.

**Risk surface**

- Hallucinated citations. The single highest risk and the reason every memo lands in front of the CEO before any `confirmed` change. Mitigation: structured memo template that requires a direct quote from the source URL plus the URL itself; validator rejects memos that fail this format.
- Stale statute text. State legislatures recodify (the CA CPRA in 2023 is the prime example); the agent must always re-fetch and not rely on training data. Mitigation: instructions require a same-day fetch from the official source URL before any sign-off.
- Drift on what "confirmed" means. Mitigation: same protocol, same rubric. If the agent passes the same take-home a human candidate would pass, it is competent for the scope.
- Public-perception risk. A 501(c)(3) staffed by AI agents on legal accuracy is a story. Mitigation: the CEO's sign-off is the human authority on the record; the agent is a research tool, not the legal reviewer of record. The protocol document and the audit trail back this up to journalists or donors who ask.

**What success looks like in 30 days post-launch**

- Same as Track A: five fields cleared, protocol document merged, one net-new jurisdiction reviewed. Throughput target may be higher; correctness target is identical.

---

## Recommendation

**Run Track B first to clear the five live `needs_escalation` fields and produce the v0 of `corpus/REVIEW_PROTOCOL.md`. Open Track A sourcing in parallel, on a 4-week timeline, against the fundraising gate.**

Rationale:

1. **Track B is available now, regardless of fundraising state.** Track A cannot sign anyone before the CEO confirms the fundraising line. We do not want the five live escalations sitting open for another quarter, blocking v0 from going public.
2. **Track A is the long-term right answer once the fundraising gate clears.** Throughput will be similar; legitimacy, donor-story strength, and the ability to escalate to a human at a moment's notice are structurally better. Tying the institution's legal-accuracy function to a single agent is a one-way door we should not walk through unintentionally.
3. **Running them in series rather than parallel risks gap.** If Track B runs alone and the fundraising gate stays closed indefinitely, we end up with an agent-only legal-review function by default. That is a governance choice, and it should be made deliberately, not by drift.
4. **The first 30 days of Track B is the calibration period for whether the agent-only path is viable at all.** If the agent fails the take-home or produces a memo the CEO has to substantially rewrite, the recommendation should be revised to Track A only.

**What the CEO is being asked to decide now**

- [ ] **Endorse the recommendation** (Track B now, Track A opens in parallel pending fundraising gate); OR
- [ ] **Track A only** — wait for fundraising gate; live escalations stay open until then; OR
- [ ] **Track B only** — agent path; do not open the human contractor search at all; OR
- [ ] **Reject and revise** — explain what changes and the CTO will re-draft.

Either way the CEO chooses, the first concrete step (build the agent profile, send the outreach emails, or both) starts the day after sign-off.

---

**References**

- JD: [`hire-2-legal-jd.md`](./hire-2-legal-jd.md).
- Evaluation rubric and take-home: [`hire-2-evaluation-rubric.md`](./hire-2-evaluation-rubric.md).
- Strategic memo: [`HIRING_NEXT_3.md`](../HIRING_NEXT_3.md).
- Tracking issue: [THE-84](https://github.com/The-HOLE-Foundation/the-hole-truth/issues).
