INSERT INTO fabrics (code, name, composition, notes)
VALUES
  ('COT-STRETCH-01', 'Cotton Stretch Poplin', '97% Cotton, 3% Spandex', 'Baseline shirting fabric for daily womenswear capsules'),
  ('RAYON-SOFT-01', 'Soft Rayon Twill', '100% Rayon', 'Fluid drape baseline for dresses and relaxed silhouettes'),
  ('CVC-KIDS-01', 'Kids CVC Jersey', '60% Cotton, 40% Polyester', 'Comfort-first knit baseline for Yoora Kids essentials')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  composition = EXCLUDED.composition,
  notes = EXCLUDED.notes;

INSERT INTO size_charts (brand_id, code, name, gender_scope, is_active)
SELECT
  brands.brand_id,
  seed.code,
  seed.name,
  seed.gender_scope,
  TRUE
FROM (
  VALUES
    ('YS', 'YS-WOMEN-CORE', 'Yoora Sarah Women Core', 'women'),
    ('YK', 'YK-KIDS-CORE', 'Yoora Kids Core', 'kids')
) AS seed(brand_code, code, name, gender_scope)
JOIN brands
  ON brands.code = seed.brand_code
ON CONFLICT (brand_id, code) DO UPDATE
SET
  name = EXCLUDED.name,
  gender_scope = EXCLUDED.gender_scope,
  is_active = EXCLUDED.is_active;

WITH seeded_entries AS (
  SELECT
    size_charts.size_chart_id,
    entries.size_code,
    entries.bust_cm,
    entries.waist_cm,
    entries.hip_cm,
    entries.length_cm
  FROM (
    VALUES
      ('YS-WOMEN-CORE', 'S', 84.0, 68.0, 92.0, 118.0),
      ('YS-WOMEN-CORE', 'M', 88.0, 72.0, 96.0, 120.0),
      ('YS-WOMEN-CORE', 'L', 94.0, 78.0, 102.0, 122.0),
      ('YK-KIDS-CORE', '4', 58.0, 54.0, 60.0, 64.0),
      ('YK-KIDS-CORE', '6', 62.0, 57.0, 64.0, 70.0),
      ('YK-KIDS-CORE', '8', 66.0, 60.0, 68.0, 76.0)
  ) AS entries(size_chart_code, size_code, bust_cm, waist_cm, hip_cm, length_cm)
  JOIN size_charts
    ON size_charts.code = entries.size_chart_code
)
INSERT INTO size_chart_entries (size_chart_id, size_code, bust_cm, waist_cm, hip_cm, length_cm)
SELECT
  seeded_entries.size_chart_id,
  seeded_entries.size_code,
  seeded_entries.bust_cm,
  seeded_entries.waist_cm,
  seeded_entries.hip_cm,
  seeded_entries.length_cm
FROM seeded_entries
ON CONFLICT (size_chart_id, size_code) DO UPDATE
SET
  bust_cm = EXCLUDED.bust_cm,
  waist_cm = EXCLUDED.waist_cm,
  hip_cm = EXCLUDED.hip_cm,
  length_cm = EXCLUDED.length_cm;

INSERT INTO collections (brand_id, name, campaign_name, season_code, launch_date, status)
SELECT
  brands.brand_id,
  seed.name,
  seed.campaign_name,
  seed.season_code,
  seed.launch_date,
  seed.status
FROM (
  VALUES
    ('YS', 'Essentials Capsule 01', 'Core Silhouette Refresh', '2026-Q2', DATE '2026-05-12', 'planned'),
    ('YK', 'Playwear Drop 01', 'Active Kids Base Set', '2026-Q2', DATE '2026-05-19', 'planned'),
    ('YSC', 'Catalogue Refresh 01', 'Catalogue Hero Update', '2026-Q2', DATE '2026-05-26', 'active')
) AS seed(brand_code, name, campaign_name, season_code, launch_date, status)
JOIN brands
  ON brands.code = seed.brand_code
WHERE NOT EXISTS (
  SELECT 1
  FROM collections existing
  WHERE existing.brand_id = brands.brand_id
    AND existing.name = seed.name
);

UPDATE collections AS target
SET
  campaign_name = seed.campaign_name,
  season_code = seed.season_code,
  launch_date = seed.launch_date,
  status = seed.status,
  updated_at = now()
FROM (
  VALUES
    ('YS', 'Essentials Capsule 01', 'Core Silhouette Refresh', '2026-Q2', DATE '2026-05-12', 'planned'),
    ('YK', 'Playwear Drop 01', 'Active Kids Base Set', '2026-Q2', DATE '2026-05-19', 'planned'),
    ('YSC', 'Catalogue Refresh 01', 'Catalogue Hero Update', '2026-Q2', DATE '2026-05-26', 'active')
) AS seed(brand_code, name, campaign_name, season_code, launch_date, status)
JOIN brands
  ON brands.code = seed.brand_code
WHERE target.brand_id = brands.brand_id
  AND target.name = seed.name;
