-- THE-22: Lock down planning.* and the statutes operational audit tables.
--
-- Until now these 17 tables were exposed to the anon + authenticated roles in
-- Supabase, which means anyone with the public anon key (shipped in the web
-- client bundle) could read and — for planning.* — modify every row.
--
-- This migration:
--   1. Enables RLS on each table.
--   2. Adds a single "Service role has full access" policy per table (matches
--      the convention already in use on planning.memories and
--      planning.postman_collections).
--   3. Revokes the table-level grants from anon and authenticated as
--      defense-in-depth, following the precedent set by
--      20260417040000_revoke_anon_writes_on_operational_tables.
--
-- service_role bypasses RLS in Supabase, so the policy is technically
-- redundant for that role, but it makes the access tier explicit at the
-- policy layer and matches existing planning.* policies.
--
-- Out of scope (deferred to follow-up issue):
--   - statutes.units_* and statutes.unit_annotations_* partitions (110 tables,
--     likely public-read reference data — needs explicit access-tier decision).
--   - app.statute_embeddings_*, app.exemptions, app.definitions,
--     app.jurisdiction_orientation_maps and other reference tables.

BEGIN;

-- ---------------------------------------------------------------------------
-- planning.* — internal team tooling. Service-role-only.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  planning_tables text[] := ARRAY[
    'docs', 'roadmap', 'decisions', 'table_specs', 'mcp_tools',
    'session_notes', 'projects', 'milestones', 'tasks', 'environments',
    'integrations', 'working_contexts', 'status_updates', 'data_issues'
  ];
BEGIN
  FOREACH tbl IN ARRAY planning_tables LOOP
    EXECUTE format('ALTER TABLE planning.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON planning.%I',
      tbl, tbl
    );

    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON planning.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );

    EXECUTE format(
      'REVOKE ALL ON planning.%I FROM anon, authenticated',
      tbl
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- statutes.* operational audit tables — service-role-only.
-- anon/authenticated currently have SELECT on these; revoke it.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  audit_tables text[] := ARRAY['load_batches', 'parser_runs', 'state_parsers'];
BEGIN
  FOREACH tbl IN ARRAY audit_tables LOOP
    EXECUTE format('ALTER TABLE statutes.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON statutes.%I',
      tbl, tbl
    );

    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON statutes.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );

    EXECUTE format(
      'REVOKE ALL ON statutes.%I FROM anon, authenticated',
      tbl
    );
  END LOOP;
END $$;

COMMIT;
