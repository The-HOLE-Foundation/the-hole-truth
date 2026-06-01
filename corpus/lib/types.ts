// Types for the public-records jurisdiction corpus.
// Mirrors corpus/schema/jurisdiction.schema.json. The JSON schema is the
// canonical contract; this file is the TypeScript surface app code uses.

export type Certainty = "confirmed" | "uncertain" | "needs_escalation";

export type DayType =
  | "business"
  | "calendar"
  | "working_days_excluding_state_holidays";

export type DurationUnit = "days" | "hours";

export interface Duration {
  amount: number;
  unit: DurationUnit;
  day_type: DayType;
}

// SourcedField wraps every load-bearing fact with provenance. Consumers MUST
// surface the citation and source_url whenever they surface the value.
export interface SourcedField<TValue = unknown> {
  value: TValue;
  certainty: Certainty;
  citation: string;
  source_url: string;
  retrieved_on?: string;
  notes?: string;
}

export type DurationField = SourcedField<Duration | string>;

export interface ExemptionCategory {
  name: string;
  citation: string;
  summary: string;
}

export interface OpenQuestion {
  question: string;
  raised_on: string;
  blocks_field?: string;
}

export interface CorpusMeta {
  last_verified: string;
  primary_source_url: string;
  archived_source_url?: string;
  maintainers: string[];
  open_questions?: OpenQuestion[];
}

export interface Jurisdiction {
  schema_version: "0.1.0";
  id: JurisdictionId;
  name: string;
  level: "federal" | "state";
  law: {
    short_name: string;
    long_name: string;
    primary_citation: SourcedField<string>;
    constitutional_basis?: SourcedField<string>;
    last_amended?: SourcedField<string>;
  };
  response: {
    acknowledgment_deadline: DurationField;
    substantive_deadline: DurationField;
    extension_rules: SourcedField<string>;
    expedited_processing?: SourcedField<string>;
    constructive_denial?: SourcedField<string>;
  };
  fees: {
    search_fees: SourcedField<string>;
    copy_fees: SourcedField<string>;
    review_fees?: SourcedField<string>;
    fee_waiver: SourcedField<string>;
    advance_payment_threshold?: SourcedField<string>;
  };
  submission: {
    accepted_methods: SourcedField<SubmissionMethod[]>;
    required_identification: SourcedField<string>;
    purpose_statement_required?: SourcedField<boolean>;
    agency_designation?: SourcedField<string>;
  };
  exemptions: {
    categories: SourcedField<ExemptionCategory[]>;
    burden_of_proof: SourcedField<string>;
    segregability_rule?: SourcedField<string>;
  };
  appeal: {
    administrative_path: SourcedField<string>;
    judicial_path: SourcedField<string>;
    appeal_deadline?: DurationField;
    attorneys_fees?: SourcedField<string>;
  };
  requester_eligibility: SourcedField<string>;
  corpus_meta: CorpusMeta;
}

export type SubmissionMethod =
  | "mail"
  | "email"
  | "online_portal"
  | "fax"
  | "in_person"
  | "phone";

// The set of jurisdiction ids the corpus covers at v0. Add to this union
// when new jurisdictions are populated.
export type JurisdictionId =
  | "US-FED"
  | "US-TX"
  | "US-CA"
  | "US-NY"
  | "US-IL"
  | "US-FL";

export const JURISDICTION_IDS: readonly JurisdictionId[] = [
  "US-FED",
  "US-TX",
  "US-CA",
  "US-NY",
  "US-IL",
  "US-FL",
] as const;
