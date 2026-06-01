// Record-type catalog for the v0 request drafter.
//
// Each entry maps to a plain-language label, a one-sentence helper aimed at
// non-lawyers, and the exact `requestPhrase` the drafter splices into the
// "records sought" sentence of the letter. The phrasing is intentionally
// generic across jurisdictions — the jurisdiction-specific load-bearing
// content (statute name, citation, source URL) comes from the corpus, not
// from this file.
//
// Keep this list short for v0. Each entry has to clear the "would a member of
// the public recognize this category and would the resulting letter be
// understood by a public records officer" bar.

export interface RecordType {
  id: string;
  label: string;
  helper: string;
  requestPhrase: string;
}

export const RECORD_TYPES: readonly RecordType[] = [
  {
    id: "police_incident_report",
    label: "Police incident report",
    helper:
      "A report a law-enforcement agency creates about an incident — for example, a call for service, an arrest, or a use of force.",
    requestPhrase:
      "police incident report(s), including any narrative, supplements, supplements to supplements, and the associated dispatch (CAD) log",
  },
  {
    id: "body_worn_camera_footage",
    label: "Body-worn camera footage",
    helper:
      "Video and audio recorded by officers' body-worn cameras. Agencies often impose redaction fees; ask anyway.",
    requestPhrase:
      "body-worn camera footage and associated audio, plus the activation log identifying the officers and devices that recorded the encounter",
  },
  {
    id: "emails",
    label: "Emails",
    helper:
      "Email communications sent or received by named officials, agencies, or about a named topic, within a specified date range.",
    requestPhrase:
      "all email communications (including attachments and full message headers) sent or received by the persons or addresses identified below within the time period identified below",
  },
  {
    id: "contracts_and_procurement",
    label: "Contracts and procurement records",
    helper:
      "Executed contracts, statements of work, change orders, and procurement records (RFPs, proposals, scoring sheets).",
    requestPhrase:
      "executed contracts, statements of work, change orders, and procurement records (including any solicitation, responses, and scoring or evaluation materials)",
  },
  {
    id: "meeting_minutes_and_agendas",
    label: "Meeting minutes and agendas",
    helper:
      "Minutes, agendas, and supporting materials for meetings of a named board, commission, or governing body.",
    requestPhrase:
      "meeting agendas, minutes, audio or video recordings, and any supporting materials distributed to members of the body for the meeting(s) identified below",
  },
  {
    id: "budget_and_expenditures",
    label: "Budget and expenditure records",
    helper:
      "Adopted budgets, line-item expenditure ledgers, check registers, and credit-card statements for a named program or department.",
    requestPhrase:
      "adopted budget documents, line-item expenditure ledgers, check registers, and procurement-card or credit-card statements for the program or department identified below",
  },
  {
    id: "personnel_complaints_and_discipline",
    label: "Personnel complaints and discipline records",
    helper:
      "Sustained complaints, internal-affairs investigation files, and final disciplinary actions. State law varies on what is releasable; ask, and let the agency assert exemptions.",
    requestPhrase:
      "complaints, internal-affairs or equivalent investigation files, and final disciplinary records concerning the personnel identified below — and the same records in summary form if the originals are claimed exempt",
  },
] as const;

export function getRecordType(id: string): RecordType | undefined {
  return RECORD_TYPES.find((r) => r.id === id);
}

export function isRecordTypeId(value: unknown): boolean {
  return typeof value === "string" && RECORD_TYPES.some((r) => r.id === value);
}
