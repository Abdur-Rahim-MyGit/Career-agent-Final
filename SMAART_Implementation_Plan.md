# SMAART Career Intelligence Platform - Implementation Plan

## Goal Description
Transform the existing prototype into a production-ready, highly scalable **Hybrid AI Career Intelligence Platform**. Currently, `backend/engine.js` creates a dynamic intelligence report via an expensive and inconsistent runtime LLM call. This plan will refactor the platform so that intelligence is derived **deterministically** from the pre-generated Knowledge Graph (populated by `backend/generate_skills_db.js`), driving career matching calculations at near-zero runtime cost.

## User Review Required
> [!IMPORTANT]
> - Replacing runtime LLM calls in `backend/engine.js` with functional deterministic algorithms per the SMAART architecture model!
> - The existing Excel parser (`generate_skills_db.js`) is correctly seeding the JSON DB. We'll leverage these exported JSONs rather than repeatedly calling LLMs on the server. Do you agree with this shift to a pure rule-based approach?
> - We'll create a dedicated Python microservice later specifically for the ML models, preventing Node.js feature bloat.

## Proposed Changes

### Core Rule Engine (Node.js)
The heart of the runtime platform (processing incoming data via `POST /api/onboarding`)

#### [MODIFY] backend/engine.js
- **Remove:** The `processCareerIntelligence` function currently sending a massive prompt to OpenRouter/Claude.
- **Add:** The **Direction Scoring Algorithm**, adding weights mapping student input (Degree + Interests + Skills) to `role_skills_db.json`. 
- **Add:** The **Role Distance Algorithm**, measuring the gap between `student_skills` and `required_skills` in the selected primary, secondary, and tertiary paths.
- **Add:** The **Skill Priority Ranking**, factoring in how many times a skill appears across the target career path. 

#### [MODIFY] backend/index.js
- Ensure proper routing and saving of the newly calculated deterministic reports into PostgreSQL (`db.js`) and MongoDB (`mongoDb.js`).

### AI Data Generation & Scraping Pipelines
We will build out the asynchronous scripts to maintain the knowledge graph.

#### [NEW] ml-service/scraper.py
- Python implementation of the Daily Job Scraper using BeautifulSoup/Playwright to refresh demand and salaries independent of the Node.js backend.

#### [NEW] ml-service/resume_parser.py
- Implementation of the NLP/BERT based resume scanner that extracts skills to automatically feed the Node.js onboarding API.

## Verification Plan

### Automated Tests
- Test the `engine.js` algorithms with multiple mock student profiles to ensure the Direction Scoring calculates differences consistently vs. random LLM outputs.
- Test the API boundary for `POST /api/onboarding` for valid response structures corresponding to the Student Dashboard's expected format.

### Manual Verification
- Deploy and execute the new `engine.js` locally.
- Validate the generated dashboard recommendations match manually estimated "Role Distances" and "Skill Priorities".
