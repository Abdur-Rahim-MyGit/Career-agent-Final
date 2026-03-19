ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS profile_hash VARCHAR(64);
ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS college_code VARCHAR(10);
ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS zone_primary VARCHAR(10);

CREATE TABLE IF NOT EXISTS degrees (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50),
  domain VARCHAR(100),
  degree_group VARCHAR(150),
  abbreviation VARCHAR(30),
  specialisations TEXT
);

CREATE TABLE IF NOT EXISTS job_roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE,
  job_family VARCHAR(150),
  sector VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS role_skills (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255),
  skill_type VARCHAR(20),
  skill_name VARCHAR(255),
  priority VARCHAR(20),
  where_to_learn TEXT
);

CREATE TABLE IF NOT EXISTS zone_matrix (
  id SERIAL PRIMARY KEY,
  degree_group VARCHAR(150),
  role_name VARCHAR(255),
  employer_zone VARCHAR(10),
  skill_coverage_pct INTEGER,
  UNIQUE(degree_group, role_name)
);

CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE,
  demand_level VARCHAR(10),
  salary_min_lpa DECIMAL(5,1),
  salary_max_lpa DECIMAL(5,1),
  ai_automation_risk VARCHAR(10),
  emerging_roles JSONB
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER REFERENCES career_analyses(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zone_results (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER REFERENCES career_analyses(id),
  preference_tier VARCHAR(20),
  final_zone VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_gap_results (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER REFERENCES career_analyses(id),
  target_role VARCHAR(255),
  missing_skill VARCHAR(255),
  priority_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_path_outputs (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER REFERENCES career_analyses(id),
  path_text TEXT,
  future_scope_text TEXT,
  is_synthetic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
