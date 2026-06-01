import Link from "next/link";
import { getAllJurisdictions } from "@/corpus/lib";
import { RECORD_TYPES } from "@/lib/record-types";
import { DraftForm } from "./DraftForm";

export const metadata = {
  title: "Draft a public-records request — The/Hole/Truth",
  description:
    "Pick a jurisdiction and a record type. We generate a legally-sound request with the correct statutory citation, pulled from a public corpus.",
};

export default function DraftPage() {
  const jurisdictions = getAllJurisdictions().map((j) => ({
    id: j.id,
    name: j.name,
    level: j.level,
    lawShortName: j.law.short_name,
    lawLongName: j.law.long_name,
    citation: j.law.primary_citation.citation,
    sourceUrl: j.law.primary_citation.source_url,
    certainty: j.law.primary_citation.certainty,
  }));

  const recordTypes = RECORD_TYPES.map((r) => ({
    id: r.id,
    label: r.label,
    helper: r.helper,
  }));

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
        <Link
          href="/"
          className="rounded underline-offset-4 hover:underline focus-visible:underline"
        >
          The/Hole/Truth
        </Link>
      </p>
      <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
        Draft a public-records request
      </h1>
      <p className="mt-4 max-w-prose text-base text-neutral-800 dark:text-neutral-200">
        Pick the jurisdiction whose records you want and the kind of record
        you&apos;re after. We generate a request letter with the correct
        statutory citation, pulled from a public corpus rather than written by
        a language model.
      </p>
      <p className="mt-2 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
        No account required. We don&apos;t store the draft, your description,
        or anything else from this page.
      </p>

      <DraftForm jurisdictions={jurisdictions} recordTypes={recordTypes} />
    </main>
  );
}
