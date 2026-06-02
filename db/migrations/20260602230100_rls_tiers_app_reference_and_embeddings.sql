-- THE-23 (part 2 of 3): Lock down app.* derivative tables.
--
-- Scope and decided access tiers:
--
--   public-read (anon + authenticated SELECT; service_role full access)
--     - app.definitions
--     - app.exemptions
--     - app.jurisdiction_profiles
--     - app.request_requirements
--     - app.enforcement_mechanisms
--     - app.statute_unit_enrichments
--     - app.state_law_enrichments
--     - app.jurisdiction_orientation_maps
--   These 8 are derivative reference data — distilled from the public statute
--   corpus to power the FOIA workflow UI. They are intentionally public and
--   already have an anon/authenticated SELECT grant; we just formalise the
--   policy.
--
--   service-role-only
--     - app.statute_embeddings (partitioned parent + every current partition)
--   Embeddings are derived data with non-trivial compute cost (LLM inference)
--   and no application code in this repo currently consumes them through the
--   public REST surface (verified by repo grep before writing this migration).
--   Vector search should be exposed through purpose-built RPCs that we control,
--   not by handing out the raw embedding vectors. Flagging this decision in
--   the access-tier matrix so the next reviewer can flip it to public-read
--   with a one-line policy swap if intent differs.
--
-- See part 1 (statutes partitioned units / unit_annotations) for the rationale
-- on why parent AND every partition each get explicit RLS+policy.

BEGIN;

-- ---------------------------------------------------------------------------
-- public-read reference tables.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  ref_tables text[] := ARRAY[
    'definitions',
    'exemptions',
    'jurisdiction_profiles',
    'request_requirements',
    'enforcement_mechanisms',
    'statute_unit_enrichments',
    'state_law_enrichments',
    'jurisdiction_orientation_maps'
  ];
BEGIN
  FOREACH tbl IN ARRAY ref_tables LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('REVOKE ALL ON app.%I FROM anon, authenticated', tbl);
    EXECUTE format('GRANT SELECT ON app.%I TO anon, authenticated', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Public read access to %s" ON app.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Public read access to %s" '
      'ON app.%I FOR SELECT TO anon, authenticated USING (true)',
      tbl, tbl
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON app.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON app.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- service-role-only: app.statute_embeddings (parent + every partition).
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  parent_oid oid;
  tbl text;
BEGIN
  SELECT c.oid INTO parent_oid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'app' AND c.relname = 'statute_embeddings';

  IF parent_oid IS NULL THEN
    RAISE EXCEPTION 'app.statute_embeddings not found';
  END IF;

  FOR tbl IN
    SELECT 'statute_embeddings'
    UNION ALL
    SELECT c.relname
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    WHERE i.inhparent = parent_oid
  LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', tbl);

    -- Defense-in-depth: revoke the table-level grants that come from Supabase's
    -- default "GRANT ALL ON ALL TABLES" on the app schema.
    EXECUTE format('REVOKE ALL ON app.%I FROM anon, authenticated', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON app.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON app.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

COMMIT;
