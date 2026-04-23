CREATE TABLE approvals (
  approval_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference_type TEXT NOT NULL,
  reference_id BIGINT NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reference_type, reference_id)
);

CREATE TABLE approval_actions (
  approval_action_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  approval_id BIGINT NOT NULL REFERENCES approvals(approval_id) ON DELETE CASCADE,
  actor_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX approval_actions_approval_id_idx ON approval_actions (approval_id);
CREATE INDEX approval_actions_actor_user_id_idx ON approval_actions (actor_user_id);
CREATE INDEX approval_actions_approval_id_created_at_idx ON approval_actions (approval_id, created_at DESC);

CREATE TABLE audit_events (
  audit_event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id BIGINT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_actor_user_id_idx ON audit_events (actor_user_id);
CREATE INDEX audit_events_reference_idx ON audit_events (reference_type, reference_id, created_at DESC);

CREATE TABLE issue_flags (
  issue_flag_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference_type TEXT NOT NULL,
  reference_id BIGINT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved')),
  summary TEXT NOT NULL,
  details TEXT,
  created_by_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX issue_flags_reference_idx ON issue_flags (reference_type, reference_id);
CREATE INDEX issue_flags_status_severity_idx ON issue_flags (status, severity);

