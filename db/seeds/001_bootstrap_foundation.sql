INSERT INTO roles (code, name, description)
VALUES
  ('owner', 'Owner', 'Business owner with approval authority across brand and production decisions'),
  ('design_lead', 'Design Lead', 'Leads briefing, curation, and design approvals before owner sign-off'),
  ('pattern_lead', 'Pattern Lead', 'Owns pattern review, grading quality, and pattern sign-off'),
  ('planner', 'Planner', 'Owns forecast review, override rationale, and production draft planning'),
  ('ops_qa', 'Ops / QA', 'Validates readiness, raises issue flags, and protects execution quality'),
  ('admin_data_tech', 'Admin / Data / Tech', 'Maintains master data, monitoring, and platform reliability')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO brands (code, name, brand_type, parent_brand_id, is_active)
VALUES
  ('YS', 'Yoora Sarah', 'main', NULL, TRUE)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  brand_type = EXCLUDED.brand_type,
  parent_brand_id = EXCLUDED.parent_brand_id,
  is_active = EXCLUDED.is_active;

INSERT INTO brands (code, name, brand_type, parent_brand_id, is_active)
SELECT
  seed.code,
  seed.name,
  seed.brand_type,
  parent.brand_id,
  TRUE
FROM (
  VALUES
    ('YK', 'Yoora Kids', 'sub_brand'),
    ('YSC', 'Yoora Sarah Catalogue', 'catalogue')
) AS seed(code, name, brand_type)
JOIN brands AS parent
  ON parent.code = 'YS'
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  brand_type = EXCLUDED.brand_type,
  parent_brand_id = EXCLUDED.parent_brand_id,
  is_active = EXCLUDED.is_active;
