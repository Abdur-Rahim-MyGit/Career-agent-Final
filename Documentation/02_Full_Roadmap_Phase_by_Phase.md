# 02 - Project Roadmap & Implementation Milestones

This roadmap is designed for the engineering team to execute the transition from the current AI-heavy prototype to the production-ready Hybrid Rule Engine architecture.

---

## Phase 1: Environment & PostgreSQL Database Setup
**Goal:** Establish the foundational infrastructure and relational database that stores the AI-generated Knowledge Graph.
- [ ] Initialize the Python Microservice directory (`/ml-service`).
- [ ] Connect the Express API to a remote PostgreSQL instance (via Prisma).
- [ ] Design Prisma Models for:
  - `Student` (Profiles, Login Auth)
  - `Skill` (Master list from AI generator)
  - `Role` (Profiles and Salary ranges)
  - `RoleSkill` (Mapping tables bridging Roles to Skills with Priority/Importance weights)
  - `CareerDirection` (Clusters of roles)
  - `LearningResource` (Courses, Certs tied to Skills)

## Phase 2: Refactoring Artificial Intelligence to Static Knowledge Generation
**Goal:** Stop calling OpenRouter/Claude in real-time, relying instead on pre-built JSON databases.
- [ ] Audit `backend/generate_skills_db.js`. Ensure it successfully parses the Excel reference sheets into pristine JSON.
- [ ] Create a Database Seed script (`backend/seed.js`) that injects `role_skills_db.json` into the production PostgreSQL database.
- [ ] Modify the Admin panel to allow Placement Officers to trigger a "Quarterly Data Rebuild," pulling fresh prompts via Claude API and updating the DB only upon manual approval.

## Phase 3: The Runtime Rule Engine Construction (Node.js)
**Goal:** Rewrite `backend/engine.js` so it calculates career matching instantaneously using local database metrics.
- [ ] Deprecate the `generateAIResponse()` function currently making HTTP calls to LLMs during student onboarding.
- [ ] Build the `calculateDirectionScore()` function using Degree, Interest, and Experience arrays.
- [ ] Build the `calculateRoleDistance()` to map missing skills and deliver "You are N skills away" logic.
- [ ] Build the `calculateSkillPriority()` to generate the sorted Learning Roadmap array.
- [ ] Refactor `/api/onboarding` to ingest student data, pass it through the new Rule Engine, and instantly return the JSON analysis.

## Phase 4: Frontend Integration & React Dashboards
**Goal:** Connect the Student UI and Placement Officer UI to the newly refactored APIs.
- [ ] Update the **Onboarding Flow UI** to POST structured data (degree id, explicit interest tags, skill arrays) to the API.
- [ ] Update the **Student Dashboard UI** to parse the deterministic engine output:
  - Render the **Top 3 Career Matches** with % fit scores.
  - Render the **Learning Roadmap Timeline**, prioritizing Foundation -> Specialization -> Edge skills.
  - Dynamically render Course and Certification links tagged to the missing skills.
- [ ] Build the **Placement Officer Dashboard**:
  - GET `/api/admin/cohort-stats`
  - Display green/amber/red engagement indicators for students based on their Roadmap progress.

## Phase 5: Python Microservice & Automated Scraping
**Goal:** Introduce smart automation that maintains the platform's career data relevancy.
- [ ] Set up FastAPI inside `/ml-service`.
- [ ] Build `job_scraper.py` using BeautifulSoup/Playwright to hit job boards, parse NLP descriptions, and identify newly emerging "Edge" skills.
- [ ] Build `resume_parser.py` using HuggingFace sentence-transformers to auto-fill student onboarding forms.
- [ ] Scaffold cron jobs (e.g., via GitHub Actions or Render CRON) to execute the scraper daily and append findings to an Admin Staging table.

## Phase 6: Production Hardening & Testing
**Goal:** Guarantee system stability before rolling out to universities.
- [ ] Write Jest unit tests for `engine.js` edge cases (e.g., student selects completely contrasting degree and interest).
- [ ] Implement Redis caching for the `/api/roles` and `/api/career-directions` endpoints, minimizing database strain.
- [ ] Configure CI/CD pipelines (Vercel for Frontend, Railway/Docker for Backend + ML Service).
- [ ] Execute security audits (JWT expiration, database injection prevention).
