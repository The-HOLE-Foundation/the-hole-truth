-- THE-23 (part 1 of 3): Lock down statutes.* partitioned reference tables.
--
-- Scope:
--   - statutes.units            (partitioned parent + every current partition)
--   - statutes.unit_annotations (partitioned parent + every current partition)
--
-- Access tier: public-read (anon + authenticated SELECT; service_role full access).
--   These are the canonical public statute corpus. They are intended to be world-
--   readable through the Supabase REST surface; today they are unprotected by RLS,
--   so we are formalising the intent rather than changing it.
--
-- Why both parent AND every partition get a policy:
--   In Postgres, a query routed through the partitioned parent uses the parent's
--   policies. A direct query against a single partition uses ONLY that partition's
--   policies. Enabling RLS on partitions with no policy would make direct partition
--   queries silently return 0 rows, which is a footgun for PostgREST consumers or
--   any code that addresses a partition by name. We apply the same public-read
--   policy on parent + every partition so the contract is uniform either way.
--
-- The DO loop discovers partitions through pg_inherits, so future partitions added
-- after this migration also need their own RLS+policy setup (handled by whatever
-- migration adds them).
--
-- Tier matrix: docs/security/rls-access-tiers.md
-- Follow-up to: db/migrations/20260602220000_rls_lockdown_planning_and_audit_tables.sql

BEGIN;

DO $$
DECLARE
  parents text[] := ARRAY['units', 'unit_annotations'];
  parent_name text;
  parent_oid oid;
  partition_rec record;
  tbl text;
BEGIN
  FOREACH parent_name IN ARRAY parents LOOP
    SELECT c.oid INTO parent_oid
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'statutes' AND c.relname = parent_name;

    IF parent_oid IS NULL THEN
      RAISE EXCEPTION 'statutes.% not found', parent_name;
    END IF;

    -- Parent + every partition gets the same treatment.
    FOR tbl IN
      SELECT parent_name
      UNION ALL
      SELECT c.relname
      FROM pg_inherits i
      JOIN pg_class c ON c.oid = i.inhrelid
      WHERE i.inhparent = parent_oid
    LOOP
      EXECUTE format('ALTER TABLE statutes.%I ENABLE ROW LEVEL SECURITY', tbl);

      EXECUTE format('REVOKE ALL ON statutes.%I FROM anon, authenticated', tbl);
      EXECUTE format('GRANT SELECT ON statutes.%I TO anon, authenticated', tbl);

      EXECUTE format(
        'DROP POLICY IF EXISTS "Public read access to %s" ON statutes.%I',
        tbl, tbl
      );
      EXECUTE format(
        'CREATE POLICY "Public read access to %s" '
        'ON statutes.%I FOR SELECT TO anon, authenticated USING (true)',
        tbl, tbl
      );

      EXECUTE format(
        'DROP POLICY IF EXISTS "Service role has full access to %s" ON statutes.%I',
        tbl, tbl
      );
      EXECUTE format(
        'CREATE POLICY "Service role has full access to %s" '
        'ON statutes.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        tbl, tbl
      );
    END LOOP;
  END LOOP;
END $$;

COMMIT;
