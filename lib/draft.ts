// Pure request drafter. No LLM involved.
//
// The statutory citation and source URL in the output come directly from the
// jurisdiction corpus (`@/corpus/lib`). That's the central correctness
// guarantee for v0: if the cite is wrong, the corpus is wrong, and that's
// fixable in one place with the validator.
//
// Inputs are always validated before the template runs. Unknown jurisdiction
// or unknown record type throws — there is no silent fallback to federal or
// to a generic statute.

import { getJurisdiction } from "@/corpus/lib";
import { getRecordType, type RecordType } from "@/lib/record-types";

export interface DraftInput {
  jurisdictionId: string;
  recordTypeId: string;
  description?: string;
  agencyName?: string;
  requestDateIso?: string;
}

export interface DraftOutput {
  body: string;
  citation: string;
  sourceUrl: string;
  certainty: "confirmed" | "uncertain" | "needs_escalation";
  jurisdictionName: string;
  jurisdictionId: string;
  lawShortName: string;
  lawLongName: string;
  recordTypeLabel: string;
}

export class DrafterInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DrafterInputError";
  }
}

const FALLBACK_DATE = "2026-06-01";

function formatDate(iso: string | undefined): string {
  const value = iso ?? new Date().toISOString().slice(0, 10);
  // Guard against malformed input — fall through to a stable date rather
  // than throwing, since the date string is cosmetic, not load-bearing.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return FALLBACK_DATE;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return FALLBACK_DATE;
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addresseeFor(jurisdictionLevel: "federal" | "state"): string {
  return jurisdictionLevel === "federal"
    ? "the FOIA Officer"
    : "the Public Records Officer";
}

function descriptionParagraph(record: RecordType, userDescription: string | undefined): string {
  const phrase = record.requestPhrase;
  const trimmed = userDescription?.trim();
  if (!trimmed) {
    return `${capitalize(phrase)}.`;
  }
  // The user describes the specific records ("between 2024-01-01 and 2024-06-30
  // concerning incidents at the corner of Main & 5th"). Embed it cleanly.
  return `${capitalize(phrase)}. Specifically: ${trimmed}`;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s[0].toUpperCase() + s.slice(1);
}

export function draftRequest(input: DraftInput): DraftOutput {
  const jur = getJurisdiction(input.jurisdictionId);
  if (!jur) {
    throw new DrafterInputError(
      `Unknown jurisdiction: ${JSON.stringify(input.jurisdictionId)}. ` +
        `Supported v0 corpus: US-FED, US-TX, US-CA, US-NY, US-IL, US-FL.`,
    );
  }
  const record = getRecordType(input.recordTypeId);
  if (!record) {
    throw new DrafterInputError(
      `Unknown record type: ${JSON.stringify(input.recordTypeId)}.`,
    );
  }

  const primary = jur.law.primary_citation;
  // primary.citation is the formal cite (e.g. "Tex. Gov't Code § 552.001 et seq.")
  // primary.value is the short label (e.g. "Tex. Gov't Code Ch. 552")
  // We use `citation` in the letter body because that is the form an agency
  // is most likely to recognize as the legal hook.
  const citation = primary.citation;
  const sourceUrl = primary.source_url;
  const date = formatDate(input.requestDateIso);
  const addressee = input.agencyName?.trim()
    ? `the ${addresseeFor(jur.level)}, ${input.agencyName.trim()}`
    : addresseeFor(jur.level);

  const body = [
    date,
    "",
    `To ${addressee}:`,
    "",
    `This is a request under the ${jur.law.long_name} (${jur.law.short_name}), ${citation}, for the following records held by your agency:`,
    "",
    descriptionParagraph(record, input.description),
    "",
    "If you determine that any portion of these records is exempt from disclosure, please segregate and produce the non-exempt portions and identify each exemption you assert with reference to the specific statutory provision relied upon.",
    "",
    "I prefer to receive responsive records electronically (email or download link). If estimated charges will exceed $25, please notify me in advance with an itemized estimate so I can authorize the charge or narrow the scope.",
    "",
    "I also request a waiver of any fees. Disclosure of these records is in the public interest because providing them to the general public is likely to contribute significantly to public understanding of the operations or activities of government, and I am not seeking the records for a commercial purpose.",
    "",
    `Please acknowledge receipt of this request promptly. If you anticipate any delay beyond the period required by ${jur.law.short_name}, please notify me with the reason and an expected date of response.`,
    "",
    "Thank you for your assistance.",
    "",
    "Sincerely,",
    "[Your name]",
    "[Your email or mailing address]",
    "",
    "—",
    "Drafted with The/Hole/Truth. Statutory citation pulled from a public corpus, not generated by a language model.",
    `Authority: ${citation}`,
    `Source: ${sourceUrl}`,
  ].join("\n");

  return {
    body,
    citation,
    sourceUrl,
    certainty: primary.certainty,
    jurisdictionName: jur.name,
    jurisdictionId: jur.id,
    lawShortName: jur.law.short_name,
    lawLongName: jur.law.long_name,
    recordTypeLabel: record.label,
  };
}
