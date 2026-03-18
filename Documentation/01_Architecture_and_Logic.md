# 01 - Platform Architecture & Core Logic

## Overview
The SMAART Career Intelligence Platform operates on a **Hybrid AI Strategy**. Unlike standard LLM wrappers that call OpenAI/Claude on every user request (leading to high costs, latency, and hallucinations), SMAART separates the generation of intelligence from the delivering of intelligence.

### Track 1: The Build Phase (AI Generation)
- **Role:** Heavy lifting, data synthesis.
- **Actor:** Claude 3.5 Sonnet / Advanced Data Scripts.
- **Action:** Runs offline (e.g., quarterly) to scan job market inputs and produce a massive, structured **Knowledge Graph** (Skills, Roles, Salaries, Demand).
- **Output:** Structured JSON files (e.g., `role_skills_db.json`).
- **Validation:** Human experts (Placement Officers) review this mapped data via Excel templates before it goes into the live database.

### Track 2: The Runtime Phase (Rule Engine)
- **Role:** Lightning-fast, deterministic student personalization.
- **Actor:** Node.js Backend (`engine.js`).
- **Action:** A student inputs their Degree, Interests, Experience, and Skills. The Node.js engine uses mathematical formulas to "score" their profile against the Knowledge Graph.
- **Output:** Instant, highly explainable Career Dashboards containing Primary/Secondary roles, Skill Priorities, and active Learning Roadmaps.

---

## The Core Rule Engine Algorithms (Node.js Implementation)

To successfully replace runtime AI calls with a deterministic engine, the following 5 algorithms must be implemented in the backend:

### Algorithm 1: Career Direction Scoring
Calculates which broad career cluster fits the student best.
**Formula:**
`Total Score = (Degree Match Base) + (Interest Alignment Boost) + (Skill Overlap Points) + (Experience Bonus)`
- **Degree Match:** +40 points if the student's degree is natively aligned (e.g., BCom -> Corporate Finance).
- **Interest Match:** +30 points if the student explicitly selected this as a preference.
- **Skill Overlap:** +3 points per acquired skill that exists in the cluster.

### Algorithm 2: Role Distance 
Calculates how "far" a student is from being hireable for a specific role inside their winning Career Direction.
**Formula:**
`Distance = Count(Required Skills for Role) - Count(Student Acquired Skills matching Role)`
- Displays as a clear metric on the UI: "You are 3 skills away from being ready for Financial Analyst."

### Algorithm 3: Skill Priority Ranking
If a student is missing 10 skills across their Top 3 roles, which should they study first? Priority ranking determines the order of the learning roadmap.
**Formula:**
`Skill Priority Index = (Number of Target Roles Requiring This Skill * 10) + Market Importance Weight (High=5, Med=3, Low=1)`
- **Example:** SQL is required by 3 roles (30 pts) + High Importance (5 pts) = 35 Priority Score. This goes to the top of the roadmap.

### Algorithm 4: Skill Tier Classification
Dynamically groups skills to prevent overwhelming the student.
- **Foundation Skills:** Appear in >= 3 roles inside a cluster (e.g., Communication, Basic Excel).
- **Specialization Skills:** Appear in 1-2 roles (e.g., Financial Modeling).
- **Edge Skills:** Highly niche skills for 1 specific role (e.g., Blockchain Auditing).

### Algorithm 5: Engagement Score (Daily Cron)
Tracks student health for the Placement Officer Dashboard.
**Formula:**
`Health = (Learning Roadmap Progress %) + (Platform Login Recency)`
- Categorized into Green, Amber, Red alert zones.

---

## Machine Learning Optimization Layer (Python Microservice)
While the core system is deterministic Node.js, we will deploy a scalable Python microservice (`ml-service/`) for offline computation:
1. **Job Market Scraper:** A daily Python/Playwright script scraping LinkedIn/Naukri. It extracts job titles and required skills, detecting new trends to flag for the next Quarterly AI Build.
2. **Resume Parser (NLP/BERT):** An endpoint where a student uploads a PDF resume. The Python model extracts their existing skills and passes them to the Node.js API to auto-fill their Onboarding Profile.
3. **Recommendation Optimizer:** (Future Phase) An XGBoost model trained on successful alums to optimize the scoring weights in the Rule Engine.
