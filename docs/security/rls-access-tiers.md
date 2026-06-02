# Supabase RLS access-tier matrix

This file records the **intended access tier** for every table the public Supabase API can reach. "Public read" is still a policy — it just happens to be `USING (true)`. Every table should appear here with a deliberate tier.

## Tiers

| Tier | Who can read | Who can write | Policy template |
|------|--------------|---------------|-----------------|
| `service-role-only` | service_role | service_role | `FOR ALL TO service_role USING (true) WITH CHECK (true)` plus `REVOKE ALL FROM anon, authenticated` |
| `public-read` | anon, authenticated, service_role | service_role | `FOR SELECT TO anon, authenticated USING (true)` plus a service_role ALL policy |
| `authenticated-read` | authenticated, service_role | service_role | `FOR SELECT TO authenticated USING (true)` plus a service_role ALL policy |
| `user-owned` | owner via `auth.uid()` | owner via `auth.uid()` | `USING ((SELECT auth.uid()) = user_id)` per command |

The default for any new table is `service-role-only`. If you want to publish data through PostgREST, you must opt in with one of the wider tiers and write it down here.

## Current state

### `planning.*` — internal team tooling

All 16 tables are `service-role-only`. They contain agent-internal coordination data (tasks, roadmap, ADRs, integration secrets metadata, session logs, MCP tool specs, data-quality issues) that has no business being on the public surface.

Locked down by [`20260602220000_rls_lockdown_planning_and_audit_tables.sql`](../../db/migrations/20260602220000_rls_lockdown_planning_and_audit_tables.sql) (THE-22):

- `planning.docs`
- `planning.roadmap`
- `planning.decisions`
- `planning.table_specs`
- `planning.mcp_tools`
- `planning.session_notes`
- `planning.projects`
- `planning.milestones`
- `planning.tasks`
- `planning.environments`
- `planning.integrations`
- `planning.working_contexts`
- `planning.status_updates`
- `planning.data_issues`

Already locked down before THE-22:

- `planning.memories` — service-role-only, mirrors Mem0 via webhook
- `planning.postman_collections` — service-role write, **authenticated read** for the Postman dashboard (one minor exception to the tier above)

### `statutes.*` operational audit tables — service-role-only

Locked down by the same migration (THE-22):

- `statutes.load_batches` — corpus load audit records (7 rows)
- `statutes.parser_runs` — parser execution log (0 rows)
- `statutes.state_parsers` — generated parser source code, prompts, costs (53 rows)

### `statutes.*` reference tables — `public-read`

- `statutes.jurisdiction_laws` — already had `jurisdiction_laws_public_read` (anon/authenticated SELECT)
- `statutes.golden_truth` — already had `Public read` (PUBLIC role SELECT)
- `statutes.units` (partitioned parent + every partition) — added by THE-23, [`20260602230000_rls_tiers_statutes_partitions.sql`](../../db/migrations/20260602230000_rls_tiers_statutes_partitions.sql)
- `statutes.unit_annotations` (partitioned parent + every partition) — added by THE-23, same migration

Partitioned-table footnote: queries through the parent use the parent's policies; direct queries against a single partition use only that partition's policies. We add the public-read policy on parent AND every partition so direct partition access doesn't silently return 0 rows.

### `app.*` derivative reference data — `public-read`

Added by THE-23, [`20260602230100_rls_tiers_app_reference_and_embeddings.sql`](../../db/migrations/20260602230100_rls_tiers_app_reference_and_embeddings.sql):

- `app.definitions`
- `app.exemptions`
- `app.jurisdiction_profiles`
- `app.request_requirements`
- `app.enforcement_mechanisms`
- `app.statute_unit_enrichments`
- `app.state_law_enrichments`
- `app.jurisdiction_orientation_maps`

### `app.*` embeddings — `service-role-only`

Added by THE-23, same `app` migration:

- `app.statute_embeddings` (partitioned parent + every partition)

Embeddings are derived data with non-trivial compute cost and no current client/edge consumers. Vector search should be exposed through purpose-built RPCs we control, not by handing out raw embedding vectors over PostgREST. Flip to `public-read` with a one-line policy swap if intent changes.

### `public.*` legacy reference tables — `public-read`

Added by THE-23, [`20260602230200_rls_tiers_public_legacy_tables.sql`](../../db/migrations/20260602230200_rls_tiers_public_legacy_tables.sql):

- `public.agencies`
- `public.full_statutes`
- `public.statutes`
- `public.statutes_sections`
- `public.statute_inventory`
- `public.statute_enrichments`
- `public.holidays`
- `public.jurisdiction_scopes`
- `public.json_schemas`
- `public.db_docs`

### `public.*` operational / logs — `service-role-only`

Added by THE-23, same `public` migration:

- `public.auth_events`
- `public.edge_embedding_requests`
- `public.edge_request_logs`
- `public.compilation_errors`
- `public.statutes_extraction_logs`
- `public.waitlist_signups`

### Out of scope of THE-22 / THE-23 (each gets its own issue)

- `public.usage_logs` always-true INSERT policy (`rls_policy_always_true` advisor finding).
- 73 `function_search_path_mutable` findings.
- 16 `*_security_definer_function_executable` findings.
- 6 `security_definer_view` findings.
- 3 `materialized_view_in_api` findings.
- `auth_leaked_password_protection` advisor finding.
- `extension_in_public` for `citext` and `moddatetime`.

## How to add a row

When you create a new table:

1. Decide the tier (default to `service-role-only` unless you have a real reason).
2. In the same migration, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and add the matching policy from the template above.
3. Add the row to the appropriate section of this file in the same PR.

If you skip step 3 the CodeRabbit/CTO review should bounce the PR.
