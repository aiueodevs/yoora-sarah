ALTER TABLE approvals
  ALTER COLUMN reference_id TYPE TEXT USING reference_id::text;

ALTER TABLE audit_events
  ALTER COLUMN reference_id TYPE TEXT USING reference_id::text;

ALTER TABLE issue_flags
  ALTER COLUMN reference_id TYPE TEXT USING reference_id::text;
