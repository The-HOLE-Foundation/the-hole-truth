import { describe, it, expect } from "vitest";

import { draftRequest, DrafterInputError } from "@/lib/draft";
import { getJurisdiction, getJurisdictionIds } from "@/corpus/lib";
import { RECORD_TYPES } from "@/lib/record-types";

describe("draftRequest — citation provenance", () => {
  it("TX + police_incident_report cites the TX corpus primary_citation verbatim", () => {
    const tx = getJurisdiction("TX");
    if (!tx) throw new Error("TX must exist in the corpus for this test to mean anything");
    const expectedCitation = tx.law.primary_citation.citation;
    const expectedSourceUrl = tx.law.primary_citation.source_url;

    const out = draftRequest({
      jurisdictionId: "US-TX",
      recordTypeId: "police_incident_report",
    });

    expect(out.citation).toBe(expectedCitation);
    expect(out.sourceUrl).toBe(expectedSourceUrl);
    expect(out.jurisdictionId).toBe("US-TX");
    expect(out.jurisdictionName).toBe("Texas");
    expect(out.lawShortName).toBe(tx.law.short_name);
    expect(out.lawLongName).toBe(tx.law.long_name);
    expect(out.recordTypeLabel).toBe("Police incident report");

    // The body must include the citation literally — this is the
    // "no hallucinated citation" guarantee for users.
    expect(out.body).toContain(expectedCitation);
    expect(out.body).toContain(expectedSourceUrl);
    // The body must also include the law's long name and short name so a
    // public records officer immediately recognises the legal hook.
    expect(out.body).toContain(tx.law.long_name);
    expect(out.body).toContain(tx.law.short_name);
  });

  it("accepts both the full id and the USPS code for the jurisdiction", () => {
    const requestDateIso = "2026-06-01";
    const a = draftRequest({ jurisdictionId: "US-TX", recordTypeId: "police_incident_report", requestDateIso });
    const b = draftRequest({ jurisdictionId: "TX", recordTypeId: "police_incident_report", requestDateIso });
    expect(a.body).toBe(b.body);
  });

  it("every populated jurisdiction can draft every v0 record type, and every draft cites the corpus", () => {
    for (const id of getJurisdictionIds()) {
      const jur = getJurisdiction(id);
      if (!jur) throw new Error(`corpus missing ${id}`);
      const expectedCitation = jur.law.primary_citation.citation;
      const expectedSource = jur.law.primary_citation.source_url;
      for (const rt of RECORD_TYPES) {
        const out = draftRequest({
          jurisdictionId: id,
          recordTypeId: rt.id,
        });
        expect(out.citation, `${id}/${rt.id} citation must match corpus`).toBe(expectedCitation);
        expect(out.sourceUrl, `${id}/${rt.id} source URL must match corpus`).toBe(expectedSource);
        expect(out.body).toContain(expectedCitation);
        expect(out.body).toContain(rt.requestPhrase[0].toUpperCase() + rt.requestPhrase.slice(1));
      }
    }
  });

  it("rejects unknown jurisdictions instead of silently falling back", () => {
    expect(() =>
      draftRequest({ jurisdictionId: "US-ZZ", recordTypeId: "police_incident_report" }),
    ).toThrow(DrafterInputError);
  });

  it("rejects unknown record types instead of silently falling back", () => {
    expect(() =>
      draftRequest({ jurisdictionId: "US-TX", recordTypeId: "definitely_not_a_record_type" }),
    ).toThrow(DrafterInputError);
  });

  it("uses generic addressee when no agency name is given", () => {
    const tx = draftRequest({
      jurisdictionId: "US-TX",
      recordTypeId: "police_incident_report",
      requestDateIso: "2026-06-01",
    });
    expect(tx.body).toContain("To the Public Records Officer:");

    const fed = draftRequest({
      jurisdictionId: "US-FED",
      recordTypeId: "police_incident_report",
      requestDateIso: "2026-06-01",
    });
    expect(fed.body).toContain("To the FOIA Officer:");
  });

  it("embeds the user's specific description when provided", () => {
    const out = draftRequest({
      jurisdictionId: "US-TX",
      recordTypeId: "police_incident_report",
      description: "All incident reports from 2024-01-01 through 2024-06-30 for the 78701 ZIP code.",
      requestDateIso: "2026-06-01",
    });
    expect(out.body).toContain("Specifically: All incident reports from 2024-01-01");
  });

  it("includes the named agency in the addressee line when provided", () => {
    const out = draftRequest({
      jurisdictionId: "US-TX",
      recordTypeId: "police_incident_report",
      agencyName: "City of Austin Police Department",
      requestDateIso: "2026-06-01",
    });
    expect(out.body).toContain("City of Austin Police Department");
  });
});
