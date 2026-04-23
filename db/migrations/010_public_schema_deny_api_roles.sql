DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_anon_all ON public.%I;', table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_authenticated_all ON public.%I;', table_name);

    EXECUTE format(
      'CREATE POLICY deny_anon_all ON public.%I AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY deny_authenticated_all ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);',
      table_name
    );
  END LOOP;
END $$;
