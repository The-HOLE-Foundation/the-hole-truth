"use client";

import { useCallback, useId, useMemo, useRef, useState, useTransition } from "react";
import { draftRequestAction } from "./actions";
import type { DraftOutput } from "@/lib/draft";

interface JurisdictionOption {
  id: string;
  name: string;
  level: "federal" | "state";
  lawShortName: string;
  lawLongName: string;
  citation: string;
  sourceUrl: string;
  certainty: "confirmed" | "uncertain" | "needs_escalation";
}

interface RecordTypeOption {
  id: string;
  label: string;
  helper: string;
}

interface DraftFormProps {
  jurisdictions: readonly JurisdictionOption[];
  recordTypes: readonly RecordTypeOption[];
}

export function DraftForm({ jurisdictions, recordTypes }: DraftFormProps) {
  const formId = useId();
  const jurisdictionHelpId = `${formId}-jurisdiction-help`;
  const recordHelpId = `${formId}-record-help`;
  const descriptionHelpId = `${formId}-description-help`;
  const agencyHelpId = `${formId}-agency-help`;

  const [jurisdictionId, setJurisdictionId] = useState<string>("US-TX");
  const [recordTypeId, setRecordTypeId] = useState<string>("police_incident_report");
  const [description, setDescription] = useState<string>("");
  const [agencyName, setAgencyName] = useState<string>("");

  const [draft, setDraft] = useState<DraftOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const previewRef = useRef<HTMLDivElement | null>(null);

  const selectedJurisdiction = useMemo(
    () => jurisdictions.find((j) => j.id === jurisdictionId),
    [jurisdictionId, jurisdictions],
  );
  const selectedRecord = useMemo(
    () => recordTypes.find((r) => r.id === recordTypeId),
    [recordTypeId, recordTypes],
  );

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setCopyStatus("");
      startTransition(async () => {
        const result = await draftRequestAction({
          jurisdictionId,
          recordTypeId,
          description: description.trim() || undefined,
          agencyName: agencyName.trim() || undefined,
        });
        if (!result.ok) {
          setDraft(null);
          setError(result.error);
          return;
        }
        setDraft(result.draft);
        // Move focus to the preview heading so AT users land on the new content.
        requestAnimationFrame(() => {
          previewRef.current?.querySelector<HTMLElement>("[data-preview-heading]")?.focus();
        });
      });
    },
    [agencyName, description, jurisdictionId, recordTypeId],
  );

  const onCopy = useCallback(async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopyStatus("Draft copied to clipboard.");
    } catch {
      setCopyStatus(
        "Couldn't copy automatically — select the text and copy with your keyboard.",
      );
    }
  }, [draft]);

  const onDownload = useCallback(() => {
    if (!draft) return;
    const blob = new Blob([draft.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Use the snapshot stored on `draft` so the filename can never drift
    // from the body when the user changes the form after generating.
    link.download = `request-${draft.jurisdictionId}-${draft.recordTypeId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopyStatus("Draft downloaded as a .txt file.");
  }, [draft]);

  return (
    <div className="mt-10">
      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">
            1. Pick a jurisdiction
          </legend>
          <p id={jurisdictionHelpId} className="text-sm text-neutral-700 dark:text-neutral-300">
            Which government&apos;s records? Federal agencies are covered by
            FOIA; each state has its own transparency law.
          </p>
          <ul className="space-y-2" aria-describedby={jurisdictionHelpId}>
            {jurisdictions.map((j) => {
              const optionId = `${formId}-jur-${j.id}`;
              const checked = jurisdictionId === j.id;
              return (
                <li key={j.id}>
                  <label
                    htmlFor={optionId}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition focus-within:ring-2 focus-within:ring-current ${
                      checked
                        ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-900"
                        : "border-neutral-300 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
                    }`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name="jurisdiction"
                      value={j.id}
                      checked={checked}
                      onChange={() => setJurisdictionId(j.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span className="flex-1">
                      <span className="block text-base font-medium">
                        {j.name}{" "}
                        <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                          ({j.lawShortName})
                        </span>
                      </span>
                      <span className="block text-sm text-neutral-700 dark:text-neutral-300">
                        {j.lawLongName} —{" "}
                        <span className="font-mono text-[0.85em]">
                          {j.citation}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">2. Pick a record type</legend>
          <p id={recordHelpId} className="text-sm text-neutral-700 dark:text-neutral-300">
            Pick the closest category. You can describe the specifics in the
            next field — dates, names, addresses.
          </p>
          <ul className="space-y-2" aria-describedby={recordHelpId}>
            {recordTypes.map((r) => {
              const optionId = `${formId}-rec-${r.id}`;
              const checked = recordTypeId === r.id;
              return (
                <li key={r.id}>
                  <label
                    htmlFor={optionId}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition focus-within:ring-2 focus-within:ring-current ${
                      checked
                        ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-900"
                        : "border-neutral-300 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
                    }`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name="recordType"
                      value={r.id}
                      checked={checked}
                      onChange={() => setRecordTypeId(r.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span className="flex-1">
                      <span className="block text-base font-medium">
                        {r.label}
                      </span>
                      <span className="block text-sm text-neutral-700 dark:text-neutral-300">
                        {r.helper}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor={`${formId}-agency`} className="text-lg font-semibold">
            3. Which agency? (optional)
          </label>
          <p id={agencyHelpId} className="text-sm text-neutral-700 dark:text-neutral-300">
            Name the specific agency or office that holds the records — for
            example, &ldquo;City of Austin Police Department&rdquo;. Leaving
            this blank produces a generic addressee you can edit afterwards.
          </p>
          <input
            id={`${formId}-agency`}
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            autoComplete="off"
            spellCheck="true"
            aria-describedby={agencyHelpId}
            className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100"
            placeholder="City of Austin Police Department"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={`${formId}-description`} className="text-lg font-semibold">
            4. Describe the specific records (optional)
          </label>
          <p id={descriptionHelpId} className="text-sm text-neutral-700 dark:text-neutral-300">
            Be as specific as you can — dates, names, addresses, case numbers.
            Specific requests get answered faster.
          </p>
          <textarea
            id={`${formId}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            aria-describedby={descriptionHelpId}
            className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100"
            placeholder="Incident reports from January 1, 2024 through June 30, 2024 concerning calls for service at the intersection of Main St and 5th Ave."
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-5 py-3 text-base font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-100"
          >
            {pending ? "Drafting…" : "Generate draft"}
          </button>
          {selectedJurisdiction && selectedRecord ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Drafting a <strong>{selectedRecord.label}</strong> request under{" "}
              <strong>
                {selectedJurisdiction.lawShortName} — {selectedJurisdiction.name}
              </strong>
              .
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-md border border-red-600 bg-red-50 p-3 text-sm text-red-900 dark:border-red-400 dark:bg-red-950/40 dark:text-red-100"
          >
            {error}
          </div>
        ) : null}
      </form>

      {/*
        Status span is the only live region — it announces a short
        "Draft ready" cue so screen readers don't auto-announce the entire
        request body. The body itself is reachable via focus moved to the
        preview heading after submit.
      */}
      <span data-preview-status aria-live="polite" className="sr-only">
        {draft ? "Draft ready." : ""}
      </span>
      <div ref={previewRef} className="mt-10">
        {draft ? (
          <section
            aria-labelledby={`${formId}-preview-title`}
            className="rounded-lg border border-neutral-300 p-4 sm:p-6 dark:border-neutral-700"
          >
            <h2
              id={`${formId}-preview-title`}
              tabIndex={-1}
              data-preview-heading
              className="font-serif text-2xl"
            >
              Preview
            </h2>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              Citation:{" "}
              <span className="font-mono">{draft.citation}</span>
              {" — "}
              <a
                href={draft.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-4 hover:no-underline"
              >
                source ↗
              </a>
              {draft.certainty !== "confirmed" ? (
                <>
                  {" "}
                  <span className="ml-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    {draft.certainty === "needs_escalation"
                      ? "needs legal review"
                      : "marked uncertain"}
                  </span>
                </>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center justify-center rounded-md border border-neutral-900 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:border-neutral-100 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-100"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center justify-center rounded-md border border-neutral-900 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:border-neutral-100 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-100"
              >
                Download .txt
              </button>
              {copyStatus ? (
                <span role="status" className="self-center text-sm text-neutral-700 dark:text-neutral-300">
                  {copyStatus}
                </span>
              ) : null}
            </div>
            <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
              {draft.body}
            </pre>
          </section>
        ) : null}
      </div>
    </div>
  );
}
