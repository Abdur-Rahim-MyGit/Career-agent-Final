-- Core Intelligence Tables
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    job_family VARCHAR(255),
    sector VARCHAR(255),
    min_salary DECIMAL,
    max_salary DECIMAL,
    ai_exposure_score INTEGER,
    narrative_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- Technical, Soft, AI-Tool
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_skills (
    role_id INTEGER REFERENCES roles(id),
    skill_id INTEGER REFERENCES skills(id),
    importance INTEGER CHECK (importance BETWEEN 1 AND 10),
    is_must_have BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE IF NOT EXISTS degree_role_recommendations (
    id SERIAL PRIMARY KEY,
    degree_group VARCHAR(255),
    specialisation VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    match_score INTEGER
);

-- Student & Progress Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    degree_level VARCHAR(100),
    degree_group VARCHAR(100),
    specialisation VARCHAR(255),
    currently_pursuing BOOLEAN DEFAULT TRUE,
    engagement_score INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role_type VARCHAR(50), -- Primary, Secondary, Tertiary
    sector_array TEXT[], -- PostgreSQL Array
    preferred_salary VARCHAR(100),
    org_type_array TEXT[],
    location_array TEXT[]
);

CREATE TABLE IF NOT EXISTS work_experience (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    org_name VARCHAR(255),
    designation VARCHAR(255),
    sector VARCHAR(255),
    exp_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS student_skill_completions (
    user_id INTEGER REFERENCES users(id),
    skill_id INTEGER REFERENCES skills(id),
    status VARCHAR(50) DEFAULT 'In-Progress', -- In-Progress, Completed
    verified_at TIMESTAMP,
    verification_url TEXT,
    PRIMARY KEY (user_id, skill_id)
);
