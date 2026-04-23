CREATE TABLE briefs (
  brief_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT,
  created_by_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  campaign_name TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'approved', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX briefs_brand_id_idx ON briefs (brand_id);
CREATE INDEX briefs_created_by_user_id_idx ON briefs (created_by_user_id);
CREATE INDEX briefs_status_created_at_idx ON briefs (status, created_at DESC);

CREATE TABLE brief_references (
  brief_reference_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brief_id BIGINT NOT NULL REFERENCES briefs(brief_id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL,
  reference_url TEXT,
  reference_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX brief_references_brief_id_idx ON brief_references (brief_id);

CREATE TABLE design_generation_jobs (
  design_generation_job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brief_id BIGINT NOT NULL REFERENCES briefs(brief_id) ON DELETE RESTRICT,
  requested_by_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  variation_count BIGINT NOT NULL CHECK (variation_count > 0),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  prompt_version TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX design_generation_jobs_brief_id_idx ON design_generation_jobs (brief_id);
CREATE INDEX design_generation_jobs_requested_by_user_id_idx ON design_generation_jobs (requested_by_user_id);
CREATE INDEX design_generation_jobs_status_created_at_idx ON design_generation_jobs (status, created_at DESC);

CREATE TABLE design_options (
  design_option_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  design_generation_job_id BIGINT NOT NULL REFERENCES design_generation_jobs(design_generation_job_id) ON DELETE CASCADE,
  brief_id BIGINT NOT NULL REFERENCES briefs(brief_id) ON DELETE RESTRICT,
  candidate_code TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('generated', 'shortlisted', 'approved', 'rejected')),
  image_url TEXT,
  material_notes TEXT,
  rationale TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (design_generation_job_id, candidate_code)
);
CREATE INDEX design_options_design_generation_job_id_idx ON design_options (design_generation_job_id);
CREATE INDEX design_options_brief_id_idx ON design_options (brief_id);
CREATE INDEX design_options_brief_id_status_idx ON design_options (brief_id, status);

CREATE TABLE design_annotations (
  design_annotation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  design_option_id BIGINT NOT NULL REFERENCES design_options(design_option_id) ON DELETE CASCADE,
  author_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  annotation_type TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX design_annotations_design_option_id_idx ON design_annotations (design_option_id);
CREATE INDEX design_annotations_author_user_id_idx ON design_annotations (author_user_id);

