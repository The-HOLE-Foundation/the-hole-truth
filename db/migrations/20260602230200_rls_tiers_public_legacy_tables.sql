-- THE-23 (part 3 of 3): Decide access tiers for the legacy public.* tables
-- the Supabase advisor still flags as rls_enabled_no_policy.
--
-- All 16 tables already have ENABLE ROW LEVEL SECURITY but zero policies, so
-- right now they are effectively denied to anon/authenticated (default-deny).
-- They are still flagged because the absence of a policy is ambiguous about
-- intent. This migration records the deliberate intent per table.
--
-- Decided tiers:
--
--   public-read (anon + authenticated SELECT; service_role full access) -- 10
--     - public.agencies
--     - public.full_statutes
--     - public.statutes
--     - public.statutes_sections
--     - public.statute_inventory
--     - public.statute_enrichments
--     - public.holidays
--     - public.jurisdiction_scopes
--     - public.json_schemas
--     - public.db_docs
--
--   service-role-only (only service_role; anon/auth fully denied) -- 6
--     - public.auth_events
--     - public.edge_embedding_requests
--     - public.edge_request_logs
--     - public.compilation_errors
--     - public.statutes_extraction_logs
--     - public.waitlist_signups
--
-- Defense-in-depth:
--   These tables today carry the full anon/authenticated grant set (SELECT +
--   INSERT + UPDATE + DELETE + TRUNCATE + REFERENCES + TRIGGER) because
--   Supabase installs default grants on the public schema. RLS + no policy
--   denies all of those at runtime, but the grants themselves are still a
--   smell. For each table we REVOKE ALL and then GRANT only what the tier
--   needs (SELECT for public-read, nothing for service-role-only).
--
-- Out of scope for this migration (own follow-ups):
--   - public.usage_logs always-true INSERT policy (separate threat-model issue)
--   - 73 function_search_path_mutable findings
--   - security_definer view and function executable findings
--   - 3 materialized_view_in_api findings
--   - auth_leaked_password_protection advisor finding
--   - extension_in_public (citext, moddatetime)
--
-- Tier matrix: docs/security/rls-access-tiers.md

BEGIN;

-- ---------------------------------------------------------------------------
-- public-read.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  ref_tables text[] := ARRAY[
    'agencies',
    'full_statutes',
    'statutes',
    'statutes_sections',
    'statute_inventory',
    'statute_enrichments',
    'holidays',
    'jurisdiction_scopes',
    'json_schemas',
    'db_docs'
  ];
BEGIN
  FOREACH tbl IN ARRAY ref_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', tbl);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Public read access to %s" ON public.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Public read access to %s" '
      'ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      tbl, tbl
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON public.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- service-role-only.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  ops_tables text[] := ARRAY[
    'auth_events',
    'edge_embedding_requests',
    'edge_request_logs',
    'compilation_errors',
    'statutes_extraction_logs',
    'waitlist_signups'
  ];
BEGIN
  FOREACH tbl IN ARRAY ops_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Service role has full access to %s" ON public.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Service role has full access to %s" '
      'ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

COMMIT;
