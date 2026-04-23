CREATE TABLE telemetry_events (
  telemetry_event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  surface TEXT NOT NULL CHECK (surface IN ('web', 'portal', 'api')),
  event_name TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('buyer', 'internal', 'system')),
  actor_id TEXT,
  route TEXT,
  outcome TEXT NOT NULL DEFAULT 'info' CHECK (outcome IN ('info', 'success', 'failure')),
  reference_type TEXT,
  reference_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX telemetry_events_created_at_idx
  ON telemetry_events (created_at DESC);

CREATE INDEX telemetry_events_surface_name_idx
  ON telemetry_events (surface, event_name, created_at DESC);

CREATE INDEX telemetry_events_actor_idx
  ON telemetry_events (actor_type, actor_id, created_at DESC);

CREATE INDEX telemetry_events_reference_idx
  ON telemetry_events (reference_type, reference_id, created_at DESC);
