// Public-records corpus query layer.
//
// Acceptance criterion from THE-4: `getJurisdiction('TX')` returns a
// structured object. This file is that surface.

import usFederal from "../jurisdictions/us-federal.json";
import usCa from "../jurisdictions/us-ca.json";
import usFl from "../jurisdictions/us-fl.json";
import usIl from "../jurisdictions/us-il.json";
import usNy from "../jurisdictions/us-ny.json";
import usTx from "../jurisdictions/us-tx.json";

import type { Jurisdiction, JurisdictionId } from "./types";
import { JURISDICTION_IDS } from "./types";

// Map full ids -> records.
const BY_ID: Readonly<Record<JurisdictionId, Jurisdiction>> = Object.freeze({
  "US-FED": usFederal as unknown as Jurisdiction,
  "US-TX": usTx as unknown as Jurisdiction,
  "US-CA": usCa as unknown as Jurisdiction,
  "US-NY": usNy as unknown as Jurisdiction,
  "US-IL": usIl as unknown as Jurisdiction,
  "US-FL": usFl as unknown as Jurisdiction,
});

// Allow lookup by either the full id ("US-TX") or the USPS code ("TX",
// "FED" for federal). Anything we can't map returns undefined.
const ALIAS_TO_ID: Readonly<Record<string, JurisdictionId>> = Object.freeze({
  "US-FED": "US-FED",
  FED: "US-FED",
  FEDERAL: "US-FED",
  "US-TX": "US-TX",
  TX: "US-TX",
  "US-CA": "US-CA",
  CA: "US-CA",
  "US-NY": "US-NY",
  NY: "US-NY",
  "US-IL": "US-IL",
  IL: "US-IL",
  "US-FL": "US-FL",
  FL: "US-FL",
});

/**
 * Look up a jurisdiction by id or USPS code.
 *
 * Accepts: "US-TX", "TX", "tx", "US-FED", "FED", "federal" (case-insensitive).
 * Returns undefined when no jurisdiction matches.
 *
 * Throws never — callers handle the undefined case explicitly so an
 * unknown jurisdiction never silently falls back to federal.
 */
export function getJurisdiction(idOrCode: string): Jurisdiction | undefined {
  if (typeof idOrCode !== "string") return undefined;
  const key = idOrCode.trim().toUpperCase();
  const id = ALIAS_TO_ID[key];
  if (!id) return undefined;
  return BY_ID[id];
}

/** Returns all populated jurisdictions in canonical order (federal first, then states alphabetically). */
export function getAllJurisdictions(): Jurisdiction[] {
  return JURISDICTION_IDS.map((id) => BY_ID[id]);
}

/** Returns the list of jurisdiction ids the v0 corpus covers. */
export function getJurisdictionIds(): readonly JurisdictionId[] {
  return JURISDICTION_IDS;
}

/** Type guard for callers who receive a string from request input. */
export function isJurisdictionId(value: unknown): value is JurisdictionId {
  return (
    typeof value === "string" &&
    (JURISDICTION_IDS as readonly string[]).includes(value)
  );
}

export type { Jurisdiction, JurisdictionId } from "./types";
export type {
  Certainty,
  Duration,
  DurationField,
  DurationUnit,
  ExemptionCategory,
  OpenQuestion,
  SourcedField,
  SubmissionMethod,
} from "./types";
