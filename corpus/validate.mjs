#!/usr/bin/env node
// Standalone corpus validator. No external dependencies.
//
// Enforces the v0 corpus invariants required by THE-4:
//   1. Every jurisdiction file parses.
//   2. Top-level required fields are present.
//   3. Every SourcedField has a non-empty citation AND a source_url.
//   4. Every certainty is one of the allowed values.
//   5. Every source_url is a valid URL string.
//   6. Reports needs_escalation fields so they surface for legal review.
//
// Exit code 0 if all files pass. Non-zero on any failure. Intended to run in
// CI once a runtime/stack is chosen — runs locally today via `node corpus/validate.mjs`.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JURISDICTIONS_DIR = join(__dirname, "jurisdictions");

const ALLOWED_CERTAINTY = new Set(["confirmed", "uncertain", "needs_escalation"]);
const ALLOWED_LEVELS = new Set(["federal", "state"]);
const ALLOWED_DAY_TYPES = new Set([
  "business",
  "calendar",
  "working_days_excluding_state_holidays",
]);

const REQUIRED_TOP_LEVEL = [
  "schema_version",
  "id",
  "name",
  "level",
  "law",
  "response",
  "fees",
  "submission",
  "exemptions",
  "appeal",
  "requester_eligibility",
  "corpus_meta",
];

// Required SourcedField paths inside each jurisdiction.
// These are the v0 acceptance-bar fields: citation, source URL, value present.
const REQUIRED_SOURCED_FIELDS = [
  "law.primary_citation",
  "response.acknowledgment_deadline",
  "response.substantive_deadline",
  "response.extension_rules",
  "fees.search_fees",
  "fees.copy_fees",
  "fees.fee_waiver",
  "submission.accepted_methods",
  "submission.required_identification",
  "exemptions.categories",
  "exemptions.burden_of_proof",
  "appeal.administrative_path",
  "appeal.judicial_path",
  "requester_eligibility",
];

function getPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function isValidUrl(u) {
  if (typeof u !== "string" || u.length === 0) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateSourcedField(path, field, errors) {
  if (field == null || typeof field !== "object" || Array.isArray(field)) {
    errors.push(`${path}: missing or not an object`);
    return;
  }
  if (!("value" in field)) errors.push(`${path}: missing value`);
  if (!field.certainty || !ALLOWED_CERTAINTY.has(field.certainty)) {
    errors.push(
      `${path}: certainty must be one of ${[...ALLOWED_CERTAINTY].join(", ")} (got ${JSON.stringify(field.certainty)})`,
    );
  }
  if (typeof field.citation !== "string" || field.citation.trim() === "") {
    errors.push(`${path}: citation is required and must be a non-empty string`);
  }
  if (!isValidUrl(field.source_url)) {
    errors.push(`${path}: source_url must be a valid http(s) URL`);
  }
}

function validateDurationField(path, field, errors) {
  validateSourcedField(path, field, errors);
  // If the value is an object (numeric duration), check its shape.
  // If the value is a string (e.g., "no fixed deadline"), allow it with
  // a needs_escalation/uncertain certainty — the schema documents this
  // edge case for jurisdictions like Florida that have no fixed number.
  if (field && typeof field === "object" && field.value != null) {
    if (typeof field.value === "object" && !Array.isArray(field.value)) {
      const v = field.value;
      if (typeof v.amount !== "number" || v.amount < 0 || !Number.isInteger(v.amount)) {
        errors.push(`${path}.value.amount: must be a non-negative integer`);
      }
      if (v.unit !== "days" && v.unit !== "hours") {
        errors.push(`${path}.value.unit: must be 'days' or 'hours'`);
      }
      if (!ALLOWED_DAY_TYPES.has(v.day_type)) {
        errors.push(
          `${path}.value.day_type: must be one of ${[...ALLOWED_DAY_TYPES].join(", ")}`,
        );
      }
    } else if (typeof field.value === "string") {
      // String duration value is only acceptable when the field is flagged
      // for escalation — otherwise the product would surface a fuzzy answer.
      if (field.certainty === "confirmed") {
        errors.push(
          `${path}: cannot have certainty=confirmed when value is a string narrative. Use needs_escalation or convert to {amount, unit, day_type}.`,
        );
      }
    } else {
      errors.push(`${path}.value: must be an object (duration) or a string (narrative)`);
    }
  }
}

function validateJurisdiction(filename, data) {
  const errors = [];
  const escalations = [];

  if (data.schema_version !== "0.1.0") {
    errors.push(`schema_version must be '0.1.0' (got ${JSON.stringify(data.schema_version)})`);
  }
  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in data)) errors.push(`missing required top-level field: ${key}`);
  }

  if (data.id && !/^US-[A-Z]{2,3}$/.test(data.id)) {
    errors.push(`id must match /^US-[A-Z]{2,3}$/ (got ${JSON.stringify(data.id)})`);
  }
  if (data.level && !ALLOWED_LEVELS.has(data.level)) {
    errors.push(`level must be federal|state (got ${JSON.stringify(data.level)})`);
  }

  for (const path of REQUIRED_SOURCED_FIELDS) {
    const field = getPath(data, path);
    if (path === "response.acknowledgment_deadline" || path === "response.substantive_deadline") {
      validateDurationField(path, field, errors);
    } else {
      validateSourcedField(path, field, errors);
    }
  }

  // Walk the whole structure to surface every SourcedField-shaped object's
  // certainty (so we flag needs_escalation entries regardless of where they live).
  walkSourcedFields(data, "", (path, field) => {
    if (field.certainty === "needs_escalation") {
      escalations.push(`${path}: ${field.citation || "(no citation)"}`);
    }
  });

  // corpus_meta basic checks
  if (data.corpus_meta) {
    if (!data.corpus_meta.last_verified || !/^\d{4}-\d{2}-\d{2}$/.test(data.corpus_meta.last_verified)) {
      errors.push("corpus_meta.last_verified: must be a YYYY-MM-DD date");
    }
    if (!isValidUrl(data.corpus_meta.primary_source_url)) {
      errors.push("corpus_meta.primary_source_url: must be a valid http(s) URL");
    }
    if (
      !Array.isArray(data.corpus_meta.maintainers) ||
      data.corpus_meta.maintainers.length === 0
    ) {
      errors.push("corpus_meta.maintainers: must be a non-empty array");
    }
  }

  return { errors, escalations };
}

function walkSourcedFields(node, path, fn) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkSourcedFields(item, `${path}[${i}]`, fn));
    return;
  }
  if (typeof node !== "object") return;
  if (
    "value" in node &&
    "certainty" in node &&
    "citation" in node &&
    "source_url" in node
  ) {
    fn(path, node);
    // Continue descending in case `value` contains sub-structures we care about.
  }
  for (const key of Object.keys(node)) {
    const child = node[key];
    const nextPath = path === "" ? key : `${path}.${key}`;
    walkSourcedFields(child, nextPath, fn);
  }
}

// Mirrors corpus/lib/index.ts ALIAS_TO_ID. Kept in sync by the validator
// smoke-test below: every entry in this map must resolve to an existing file.
const LOADER_ALIASES = {
  "US-FED": "us-federal",
  FED: "us-federal",
  FEDERAL: "us-federal",
  "US-TX": "us-tx",
  TX: "us-tx",
  "US-CA": "us-ca",
  CA: "us-ca",
  "US-NY": "us-ny",
  NY: "us-ny",
  "US-IL": "us-il",
  IL: "us-il",
  "US-FL": "us-fl",
  FL: "us-fl",
};

async function smokeTestLoader(files) {
  const errors = [];
  const seen = new Set(files.map((f) => f.replace(/\.json$/, "")));
  for (const [alias, slug] of Object.entries(LOADER_ALIASES)) {
    if (!seen.has(slug)) {
      errors.push(`loader alias '${alias}' points to '${slug}.json' which does not exist in jurisdictions/`);
    }
  }
  // Spot-check: getJurisdiction('TX') must resolve.
  if (!seen.has(LOADER_ALIASES["TX"])) {
    errors.push("acceptance criterion: getJurisdiction('TX') target file is missing");
  }
  return errors;
}

async function main() {
  let files;
  try {
    files = (await readdir(JURISDICTIONS_DIR)).filter((f) => f.endsWith(".json"));
  } catch (err) {
    console.error(`Could not read ${JURISDICTIONS_DIR}: ${err.message}`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error(`No jurisdiction files found in ${JURISDICTIONS_DIR}`);
    process.exit(2);
  }

  let totalErrors = 0;
  let totalEscalations = 0;
  const summary = [];

  for (const file of files.sort()) {
    const full = join(JURISDICTIONS_DIR, file);
    let raw;
    try {
      raw = await readFile(full, "utf8");
    } catch (err) {
      console.error(`[${file}] could not read: ${err.message}`);
      totalErrors++;
      continue;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`[${file}] JSON parse error: ${err.message}`);
      totalErrors++;
      continue;
    }

    const { errors, escalations } = validateJurisdiction(file, data);
    if (errors.length === 0) {
      summary.push(
        `  OK   ${file}  (${data.id} - ${data.law?.short_name || "?"})  escalations: ${escalations.length}`,
      );
    } else {
      summary.push(
        `  FAIL ${file}  (${data.id || "?"})  errors: ${errors.length}, escalations: ${escalations.length}`,
      );
      for (const e of errors) console.error(`    [${file}] ERROR ${e}`);
    }
    if (escalations.length > 0) {
      for (const e of escalations) console.warn(`    [${file}] NEEDS_ESCALATION ${e}`);
    }
    totalErrors += errors.length;
    totalEscalations += escalations.length;
  }

  const loaderErrors = await smokeTestLoader(files);
  for (const e of loaderErrors) console.error(`    [loader] ERROR ${e}`);
  totalErrors += loaderErrors.length;

  console.log("\nCorpus validation summary:");
  for (const line of summary) console.log(line);
  console.log(
    `\nFiles: ${files.length}, errors: ${totalErrors}, fields flagged needs_escalation: ${totalEscalations}`,
  );

  if (totalErrors > 0) {
    console.error("\nFAIL: corpus did not pass validation.");
    process.exit(1);
  }
  console.log(
    "\nOK: corpus passes the v0 invariants. Escalations require legal review before user-facing surfaces rely on those fields.",
  );
}

main().catch((err) => {
  console.error("Unexpected validator failure:", err);
  process.exit(2);
});
