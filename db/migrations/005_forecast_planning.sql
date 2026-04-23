CREATE TABLE forecast_runs (
  forecast_run_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  collection_id BIGINT NOT NULL REFERENCES collections(collection_id) ON DELETE RESTRICT,
  requested_by_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  model_version TEXT,
  confidence_score NUMERIC(5,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX forecast_runs_collection_id_idx ON forecast_runs (collection_id);
CREATE INDEX forecast_runs_requested_by_user_id_idx ON forecast_runs (requested_by_user_id);
CREATE INDEX forecast_runs_collection_id_created_at_idx ON forecast_runs (collection_id, created_at DESC);

CREATE TABLE forecast_recommendations (
  forecast_recommendation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast_run_id BIGINT NOT NULL REFERENCES forecast_runs(forecast_run_id) ON DELETE CASCADE,
  recommendation_summary TEXT,
  projected_total_units BIGINT,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (forecast_run_id)
);
CREATE INDEX forecast_recommendations_forecast_run_id_idx ON forecast_recommendations (forecast_run_id);

CREATE TABLE forecast_size_mix (
  forecast_size_mix_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast_recommendation_id BIGINT NOT NULL REFERENCES forecast_recommendations(forecast_recommendation_id) ON DELETE CASCADE,
  size_code TEXT NOT NULL,
  recommended_units BIGINT NOT NULL CHECK (recommended_units >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (forecast_recommendation_id, size_code)
);
CREATE INDEX forecast_size_mix_forecast_recommendation_id_idx ON forecast_size_mix (forecast_recommendation_id);

CREATE TABLE forecast_color_mix (
  forecast_color_mix_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast_recommendation_id BIGINT NOT NULL REFERENCES forecast_recommendations(forecast_recommendation_id) ON DELETE CASCADE,
  color_code TEXT NOT NULL,
  recommended_units BIGINT NOT NULL CHECK (recommended_units >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (forecast_recommendation_id, color_code)
);
CREATE INDEX forecast_color_mix_forecast_recommendation_id_idx ON forecast_color_mix (forecast_recommendation_id);

CREATE TABLE allocation_recommendations (
  allocation_recommendation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast_recommendation_id BIGINT NOT NULL REFERENCES forecast_recommendations(forecast_recommendation_id) ON DELETE CASCADE,
  channel_code TEXT NOT NULL,
  recommended_units BIGINT NOT NULL CHECK (recommended_units >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (forecast_recommendation_id, channel_code)
);
CREATE INDEX allocation_recommendations_forecast_recommendation_id_idx ON allocation_recommendations (forecast_recommendation_id);

CREATE TABLE production_plans (
  production_plan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast_run_id BIGINT NOT NULL REFERENCES forecast_runs(forecast_run_id) ON DELETE RESTRICT,
  created_by_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'released')),
  planner_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX production_plans_forecast_run_id_idx ON production_plans (forecast_run_id);
CREATE INDEX production_plans_created_by_user_id_idx ON production_plans (created_by_user_id);
CREATE INDEX production_plans_status_created_at_idx ON production_plans (status, created_at DESC);

CREATE TABLE production_plan_lines (
  production_plan_line_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  production_plan_id BIGINT NOT NULL REFERENCES production_plans(production_plan_id) ON DELETE CASCADE,
  style_id BIGINT REFERENCES styles(style_id) ON DELETE SET NULL,
  size_code TEXT NOT NULL,
  color_code TEXT NOT NULL,
  planned_units BIGINT NOT NULL CHECK (planned_units >= 0),
  channel_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX production_plan_lines_production_plan_id_idx ON production_plan_lines (production_plan_id);
CREATE INDEX production_plan_lines_style_id_idx ON production_plan_lines (style_id);

