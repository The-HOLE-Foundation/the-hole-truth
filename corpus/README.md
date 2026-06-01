# Statute Corpus

The corpus is the data layer behind every draft request, citation, and deadline the product surfaces. **Correctness is non-negotiable.** A wrong citation here becomes a wrong citation in a request that a real journalist or whistleblower files against a real agency.

## What lives here

```
corpus/
├── README.md                       (this file)
├── schema/
│   └── jurisdiction.schema.json    JSON Schema Draft-07 spec — canonical contract
├── jurisdictions/
│   ├── us-federal.json             US Federal FOIA
│   ├── us-ca.json                  California Public Records Act
│   ├── us-fl.json                  Florida Public Records Act
│   ├── us-il.json                  Illinois FOIA
│   ├── us-ny.json                  New York FOIL
│   └── us-tx.json                  Texas Public Information Act
├── lib/
│   ├── index.ts                    `getJurisdiction()` query layer
│   └── types.ts                    TypeScript types mirroring the JSON Schema
└── validate.mjs                    Standalone Node validator. Runs in CI.
```

## The non-negotiables

Every load-bearing fact in the corpus is wrapped in a `SourcedField`. That object MUST carry:

- `value` — the fact itself
- `certainty` — one of `confirmed | uncertain | needs_escalation`
- `citation` — a specific statutory reference (e.g. `5 U.S.C. § 552(a)(6)(A)(i)`), not a chapter name
- `source_url` — a direct `.gov` link to the cited authority

The validator fails the build if any of these is missing. **Do not relax these rules.** They are the audit trail.

### Certainty levels

| Level | Meaning | Surface to user? |
| --- | --- | --- |
| `confirmed` | Directly stated in the statute text. | Yes. |
| `uncertain` | Requires interpretation but the maintainer is confident in the answer. | Yes, with the citation visible. |
| `needs_escalation` | Open legal-interpretation question. | **No** — must be resolved by counsel or the CEO before surfacing. |

### When you don't know

**Do not invent.** Two acceptable moves when a statute is ambiguous:

1. Mark the field `needs_escalation`, add a note explaining the ambiguity, and add an entry to `corpus_meta.open_questions` pointing to the affected field.
2. Leave the field out entirely if it is optional in the schema.

## How a jurisdiction file is structured

Top-level fields (all required unless marked optional):

| Field | What it captures |
| --- | --- |
| `schema_version` | `0.1.0` — bump only with the schema. |
| `id` | `US-FED` for federal; `US-XX` USPS code for states. |
| `name` | Human-readable name. |
| `level` | `federal` or `state`. |
| `law` | Identity of the statute (short name, long name, primary citation, optional constitutional basis, last amended). |
| `response` | Acknowledgment + substantive deadlines, extension rules, expedited processing, constructive denial. |
| `fees` | Search/copy/review fees, fee waiver, advance payment thresholds. |
| `submission` | Accepted methods, ID requirements, purpose-statement requirements, agency designation. |
| `exemptions` | Categorical exemptions, burden of proof, segregability rule. |
| `appeal` | Administrative path, judicial path, appeal deadline, attorneys' fees. |
| `requester_eligibility` | Who may file. |
| `corpus_meta` | Last verified, primary source URL, maintainers, open questions. |

Deadlines use the `DurationField` shape: `{amount: number, unit: 'days'|'hours', day_type: 'business'|'calendar'|'working_days_excluding_state_holidays'}`. If a jurisdiction has no fixed numeric deadline (Florida), the `value` may be a narrative string but the certainty MUST be `uncertain` or `needs_escalation`.

## Using the corpus from app code

```ts
import { getJurisdiction, getJurisdictionIds } from "@/corpus/lib";

const tx = getJurisdiction("TX");
// or "US-TX", "tx", "us-tx" — case-insensitive, both forms accepted

if (!tx) {
  // Caller decides. Never silently fall back to federal.
  throw new Error("Unknown jurisdiction");
}

const deadline = tx.response.substantive_deadline;
// Always render the citation alongside the value:
//   `${deadline.value.amount} ${deadline.value.day_type} days (${deadline.citation})`
```

The loader returns `undefined` for unknown jurisdictions — it never throws and never falls back. That keeps the call site honest: if you don't know the jurisdiction, you can't draft a request.

## Updating a jurisdiction

1. Open the file under `jurisdictions/`.
2. Find the field on the authoritative `.gov` source. Update both `value` and `citation`/`source_url`.
3. Update `retrieved_on` on that field and `corpus_meta.last_verified` for the file.
4. If you can't confirm a fact, mark certainty `uncertain` or `needs_escalation` rather than guessing.
5. Run `npm run validate:corpus` locally before opening a PR.
6. The PR description should link the official-source diff (a Wayback snapshot of the prior text vs. the new text is ideal).

## Adding a new jurisdiction

1. Pick a stable `id`: `US-XX` (USPS code).
2. Copy an existing file as a template. The federal and NY files are the cleanest reference shapes.
3. Add the alias to `corpus/lib/index.ts` (`BY_ID`, `ALIAS_TO_ID`) and to `corpus/lib/types.ts` (`JurisdictionId` union and `JURISDICTION_IDS`).
4. Add the alias entry to `corpus/validate.mjs` (`LOADER_ALIASES`).
5. Run `npm run validate:corpus` and `npm run typecheck`.

## CI gate

GitHub Actions runs `npm run validate:corpus` on every PR and every push to `main`. The build fails if any jurisdiction file:

- Fails to parse as JSON.
- Is missing a required top-level field.
- Has any `SourcedField` without `value` / `certainty` / `citation` / a valid `source_url`.
- Uses a certainty value outside the allowed enum.
- Claims `confirmed` certainty on a deadline whose `value` is a narrative string (a contradiction).
- Is referenced by `corpus/lib/index.ts` but not present in `jurisdictions/`.

Warnings (non-failing): fields with certainty `needs_escalation` are listed in CI output so reviewers can verify the escalation queue is being worked.

## Coverage status (v0)

| Jurisdiction | File | Confirmed fields | Open questions |
| --- | --- | --- | --- |
| Federal FOIA | `us-federal.json` | High | 0 |
| Texas PIA | `us-tx.json` | Mixed | 2 (response deadline framing; full exemption enumeration) |
| California CPRA | `us-ca.json` | Mixed | 2 (post-recodification section verification; deadline framing) |
| New York FOIL | `us-ny.json` | High | 0 |
| Illinois FOIA | `us-il.json` | High | 0 |
| Florida Public Records | `us-fl.json` | Mixed | 3 (scope clarification; no fixed deadline; full exemption enumeration) |

See each file's `corpus_meta.open_questions` for the unresolved interpretation issues. These block surfacing the affected fields to users.

## Out of scope for v0

- All 50 states. Tracked as a separate milestone.
- County / city / local-government wrinkles. These vary too widely for a single-row model and need their own data structure.
- Statute history (versioning across amendments). v0 captures only the current text; amendment timeline tracking is a v1 concern.
