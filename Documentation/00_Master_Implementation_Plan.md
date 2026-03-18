# SMAART Career Intelligence Platform - Master Implementation Plan

*This document serves as the single, exhaustive blueprint for the engineering team to transition the current SMAART AI prototype into a highly scalable, production-ready Hybrid AI architecture, exactly as detailed in the official architecture documents.*

---

## 1. Core Problem & Platform Goal
Currently, the SMAART prototype connects directly to the Claude API (via OpenRouter) every time a student requests career guidance. 
**The Problem:** Running live LLMs is slow, expensive at scale, and prone to hallucinations. 
**The Solution (Hybrid AI Architecture):**
1. **The Build Phase (Data Generation):** Use Claude AI 4 times a year (quarterly) to generate a massive, structured "Knowledge Graph" of Skills, Roles, Salaries, and Courses. This data is manually verified by Placement Officers via Excel and saved to PostgreSQL.
2. **The Runtime Phase (Core Platform):** When a student logs in, **ZERO AI calls are made.** Instead, a lightning-fast, deterministic **Node.js Rule Engine** mathematically matches the student's profile against the Knowledge Graph to generate their dashboard.
3. **The ML Phase (Optimization):** Dedicated Python scripts scrape job demand daily and extract resume skills to auto-fill profiles.

By shifting the AI from runtime to build-time, the platform gains massive scalability and near-zero runtime costs.

---

## 2. System Architecture Layout

### A. The Knowledge Graph Database (PostgreSQL)
The foundation of the platform. Required tables:
- `Skills`: Master dictionary of 500-700 industry skills.
- `Roles`: Profiles for 300+ career roles (e.g., Data Analyst, Financial Modeler).
- `Role_Skills_Map`: Associative table indicating priority and market importance of a skill for a specific role.
- `Career_Directions`: Clusters of related roles (e.g., "Corporate Finance").
- `Learning_Resources`: Mapping courses and certs to specific skills.

### B. Core Processing Backend (Node.js & Express)
The runtime engine currently housed in `backend/engine.js`. **Must be refactored** to remove `generateAIResponse()`.
It relies on 4 Core Deterministic Algorithms:
1. **Direction Scoring:** `Score = Degree Match + Interest Match + Target Role Match + Current Skill Overlap`
2. **Skill Priority Ranking:** `Priority = (Number of Target Roles requiring skill * 10) + Importance Weight`. Determines learning order.
3. **Role Distance Calculation:** `Distance = Required Skills - Acquired Skills`. Shows how close a student is to being hireable.
4. **Skill Tiering:** Dynamically groups skills into Foundation (used in 3+ roles), Specialization (1-2 roles), and Edge (Niche).

### C. ML & Automation Layer (Python FastAPI)
A separate microservice (`/ml-service`) executing offline analytics:
1. **Daily Job Scraper:** Parses LinkedIn/Naukri to track rising/falling skill demand.
2. **Resume Parser:** NLP/BERT model allowing students to upload PDFs and auto-complete their profiles.

### D. Frontend Interfaces (React)
1. **Student Dashboard:** Renders the Career Match Scores, Role Distance gaps, and personalized Skill Learning Roadmaps.
2. **Placement Officer (PO) Dashboard:** Renders cohort metrics (e.g., Engagement Health Score = Learning Progress % + Login Recency).

---

## 3. Step-by-Step Execution Roadmap

### Phase 1: Database & Environment Initialization (Days 1-5)
1. Initialize the monorepo structure: `/backend`, `/frontend`, `/ml-service`, `/data-scripts`.
2. Connect `backend/` to PostgreSQL using Prisma ORM. 
3. Define the relational database schema corresponding to the `role_skills_db.json` structure already exported by the current prototype.

### Phase 2: Refactoring the Data Ingestion (Days 6-10)
1. Ensure the `generate_skills_db.js` script successfully parses Placement Officer Excel files into JSON format.
2. Write a `seed.js` script that takes `role_skills_db.json` and cleanly inserts the hierarchical data (Skills -> Roles -> Directions) into the PostgreSQL tables.

### Phase 3: Building the Deterministic Rule Engine (Days 11-20)
*This is the most critical phase: Rewriting `backend/engine.js`.*
1. Delete the OpenRouter API logic. 
2. Write the Node.js function `calculateDirectionScore(studentProfile, knowledgeGraph)` that assigns numerical weights.
3. Write `calculateRoleDistance(studentSkills, targetRoleSkills)` to find the gap.
4. Write `calculateSkillPriority(missingSkills, targetRoles)` to generate the chronological roadmap.
5. Update `/api/onboarding` to run these synchronous functions and instantly save the result to Postgres & MongoDB.

### Phase 4: Frontend Component Integration (Days 21-30)
1. Connect the `Student Onboarding Form` to POST structured arrays (Degree ID, Interests, Skills) up to `/api/onboarding`.
2. Update the `Dashboard` UI cards to parse the numerical outputs from the Rule Engine (e.g., rendering "85% Match to Corporate Finance").
3. Connect the `Placement Officer Dashboard` to the MongoDB logs to view live Student Engagement Scores.

### Phase 5: Machine Learning Python Microservice (Days 31-40)
1. Setup a Python virtual environment and install `FastAPI`, `BeautifulSoup`, and `sentence-transformers`.
2. Build `scraper.py` configured via Cron to pull daily job demand and append to an Admin Staging Table for quarterly UI review.
3. Build `/api/ml/parse-resume` to accept PDFs and return an array of matched skills.

### Phase 6: Automated Testing & Review (Days 41-45)
1. Run Unit Tests on the `engine.js` scoring logic to verify math predictability.
2. Simulate 1,000 student hits against the API to benchmark response times without the Claude bottleneck.
3. Deploy architecture natively to Render/Railway for backend and Vercel for frontend.

---

## 4. Current State Tracker

### ✅ Completed
- Environment `.env` initialized inside `backend/`.
- Prototype Codebase audited. 
- Discovered structural flaw: `backend/engine.js` is acting as an LLM router instead of a Deterministic Engine.

### 🚀 Immediate Next Steps (Pending)
1. Initialize PostgreSQL schemas.
2. Write `backend/seed.js` to migrate `role_skills_db.json` into the production database.
3. Completely rewrite `backend/engine.js` to execute the 4 mathematical algorithms detailed above.
