CREATE TABLE brands (
  brand_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand_type TEXT NOT NULL CHECK (brand_type IN ('main', 'sub_brand', 'catalogue')),
  parent_brand_id BIGINT REFERENCES brands(brand_id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX brands_parent_brand_id_idx ON brands (parent_brand_id);

CREATE TABLE collections (
  collection_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  campaign_name TEXT,
  season_code TEXT,
  launch_date DATE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'planned', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX collections_brand_id_idx ON collections (brand_id);

CREATE TABLE fabrics (
  fabric_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  composition TEXT,
  drape_score NUMERIC(5,2),
  comfort_score NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE size_charts (
  size_chart_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  gender_scope TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, code)
);
CREATE INDEX size_charts_brand_id_idx ON size_charts (brand_id);

CREATE TABLE size_chart_entries (
  size_chart_entry_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  size_chart_id BIGINT NOT NULL REFERENCES size_charts(size_chart_id) ON DELETE CASCADE,
  size_code TEXT NOT NULL,
  bust_cm NUMERIC(6,2),
  waist_cm NUMERIC(6,2),
  hip_cm NUMERIC(6,2),
  length_cm NUMERIC(6,2),
  sleeve_cm NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (size_chart_id, size_code)
);
CREATE INDEX size_chart_entries_size_chart_id_idx ON size_chart_entries (size_chart_id);

CREATE TABLE styles (
  style_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(brand_id) ON DELETE RESTRICT,
  collection_id BIGINT REFERENCES collections(collection_id) ON DELETE SET NULL,
  fabric_id BIGINT REFERENCES fabrics(fabric_id) ON DELETE SET NULL,
  style_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  silhouette TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'production_ready', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX styles_brand_id_idx ON styles (brand_id);
CREATE INDEX styles_collection_id_idx ON styles (collection_id);
CREATE INDEX styles_fabric_id_idx ON styles (fabric_id);

