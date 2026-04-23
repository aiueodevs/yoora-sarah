INSERT INTO users (email, full_name, is_active)
VALUES
  ('owner@yoora.local', 'Yoora Owner', TRUE),
  ('design.lead@yoora.local', 'Design Lead', TRUE),
  ('pattern.lead@yoora.local', 'Pattern Lead', TRUE),
  ('planner@yoora.local', 'Production Planner', TRUE),
  ('ops.qa@yoora.local', 'Ops QA Lead', TRUE),
  ('admin.tech@yoora.local', 'Admin Data Tech', TRUE)
ON CONFLICT DO NOTHING;

UPDATE users AS target
SET
  full_name = source.full_name,
  is_active = source.is_active,
  updated_at = now()
FROM (
  VALUES
    ('owner@yoora.local', 'Yoora Owner', TRUE),
    ('design.lead@yoora.local', 'Design Lead', TRUE),
    ('pattern.lead@yoora.local', 'Pattern Lead', TRUE),
    ('planner@yoora.local', 'Production Planner', TRUE),
    ('ops.qa@yoora.local', 'Ops QA Lead', TRUE),
    ('admin.tech@yoora.local', 'Admin Data Tech', TRUE)
) AS source(email, full_name, is_active)
WHERE LOWER(target.email) = LOWER(source.email);

INSERT INTO user_role_assignments (user_id, role_id)
SELECT
  users.user_id,
  roles.role_id
FROM (
  VALUES
    ('owner@yoora.local', 'owner'),
    ('design.lead@yoora.local', 'design_lead'),
    ('pattern.lead@yoora.local', 'pattern_lead'),
    ('planner@yoora.local', 'planner'),
    ('ops.qa@yoora.local', 'ops_qa'),
    ('admin.tech@yoora.local', 'admin_data_tech')
) AS assignments(email, role_code)
JOIN users
  ON LOWER(users.email) = LOWER(assignments.email)
JOIN roles
  ON roles.code = assignments.role_code
ON CONFLICT (user_id, role_id) DO NOTHING;
