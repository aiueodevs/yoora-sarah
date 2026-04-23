CREATE TABLE pattern_jobs (
  pattern_job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  design_option_id BIGINT NOT NULL REFERENCES design_options(design_option_id) ON DELETE RESTRICT,
  size_chart_id BIGINT NOT NULL REFERENCES size_charts(size_chart_id) ON DELETE RESTRICT,
  requested_by_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'review')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pattern_jobs_design_option_id_idx ON pattern_jobs (design_option_id);
CREATE INDEX pattern_jobs_size_chart_id_idx ON pattern_jobs (size_chart_id);
CREATE INDEX pattern_jobs_requested_by_user_id_idx ON pattern_jobs (requested_by_user_id);

CREATE TABLE pattern_outputs (
  pattern_output_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pattern_job_id BIGINT NOT NULL REFERENCES pattern_jobs(pattern_job_id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('pdf', 'dxf', 'report')),
  file_url TEXT NOT NULL,
  fabric_estimate_m NUMERIC(8,2),
  grading_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pattern_outputs_pattern_job_id_idx ON pattern_outputs (pattern_job_id);

