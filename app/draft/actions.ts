"use server";

import { draftRequest, DrafterInputError, type DraftOutput } from "@/lib/draft";

export type DraftActionResult =
  | { ok: true; draft: DraftOutput }
  | { ok: false; error: string };

export async function draftRequestAction(input: {
  jurisdictionId: string;
  recordTypeId: string;
  description?: string;
  agencyName?: string;
}): Promise<DraftActionResult> {
  try {
    const draft = draftRequest(input);
    return { ok: true, draft };
  } catch (err) {
    if (err instanceof DrafterInputError) {
      return { ok: false, error: err.message };
    }
    return {
      ok: false,
      error: "Unexpected error generating draft. Please try again.",
    };
  }
}
