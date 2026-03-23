# SMAART — AI Model Dataset Strategy & Roadmap

> **Company**: SMAART Minds · **Version**: 1.0 · **Date**: March 2026  
> **Classification**: Internal — Engineering & Data Science Team

---

## Executive Summary

This document describes every dataset SMAART currently uses, how each dataset feeds the future AI model training pipeline, what additional data is needed, and the scope of the custom SMAART AI model. All data should come from **internal databases** — no real-time external AI fetching at production scale. The current Groq/OpenRouter calls are for **dataset bootstrapping only** (one-time generation), and student interaction data is the real training fuel.

---

## 1. Current Dataset Inventory

### 1.1 Backend JSON Databases (`backend/data/`)

| # | File | Size | Records | Schema | How Generated |
|---|------|------|---------|--------|---------------|
| 1 | **`role_skills_db.json`** | 511 KB | **254 roles** | Role → `{tech_skills[], soft_skills[], ai_tools{must_have[], nice_to_have[]}, priority_levels{critical[], high[], recommended[]}, where_to_learn[]}` | Groq API (one-time generation) |
| 2 | **`zone_matrix.json`** | 448 KB | **20 degrees × 254 roles** | Degree → `[{role, employer_zone, skill_coverage_pct, missing_skills[], matched_skills[]}]` | Groq API (one-time generation) |
| 3 | **`market_data.json`** | 36 KB | **254 roles** | Role → `{salary_min_lpa, salary_max_lpa, demand_level, ai_risk, growth_outlook, hiring_companies[]}` | Groq API (one-time generation) |
| 4 | **`projects.json`** | 128 KB | **189 roles** | Role → `[{title, description, difficulty, skills_practiced[], github_topic}]` | Groq API (one-time generation) |
| 5 | **`mockRoles.js`** | 12 KB | **254 role objects** | `{id, jobRole, family}` — used for API listing | Manually curated + Groq |

### 1.2 Frontend JSON Databases (`frontend/src/data/`)

| # | File | Size | Records | Schema | How Generated |
|---|------|------|---------|--------|---------------|
| 6 | **`jobRolesData.json`** | 163 KB | **~1,667 job titles** | `{roles: [{role, family}]}` — autocomplete dropdown | Groq API (one-time) |
| 7 | **`dropdownData.json`** | 54 KB | **2 domains** | `{domain → {degrees → [{name, specializations[]}]}}` | Manually curated + AI-assisted |

### 1.3 Training & Analysis Records (`backend/records/`)

| # | File | Records | Schema |
|---|------|---------|--------|
| 8 | **`training_log.json`** | **19 entries** (and growing) | `[{id, timestamp, prompt, completion}]` — every career analysis input/output pair |
| 9 | **`training_news_log.json`** | **0+ entries** | `[{source, title, tag, url, savedAt, userInterest}]` — user-bookmarked career news |
| 10 | **`analysis_*.json`** | **19 files** | Full career analysis results per user session |

### 1.4 Database Systems

| DB | Purpose | Training Value |
|----|---------|---------------|
| **PostgreSQL** (Prisma) | User accounts (name, email, role, onboardingData) | User demographics for cohort analysis |
| **MongoDB** | Career analysis results | Rich structured training data (input→output pairs) |
| **Redis** | Response caching (1hr TTL) | Not for training — ephemeral cache |

---

## 2. How Data Feeds the Future AI Model

### 2.1 What We're Building

> **Goal**: A custom SMAART AI model that can predict the best career direction for any Indian student based on their academic profile — **without needing external AI API calls** at inference time.

### 2.2 Training Data Sources → AI Model

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TRAINING DATA PIPELINE                            │
│                                                                      │
│  ①  training_log.json (prompt→completion pairs)                      │
│       └─ Input: "Student degree: B.Tech CSE | Target: AI Engineer"  │
│       └─ Output: Full career analysis JSON (roles, skills, roadmap) │
│       └─ VALUE: Fine-tuning data for our own model                  │
│                                                                      │
│  ②  role_skills_db.json (254 role profiles)                          │
│       └─ Skill taxonomy per role (critical/high/recommended)        │
│       └─ VALUE: Ground truth knowledge base for skill matching      │
│                                                                      │
│  ③  zone_matrix.json (20 degrees × 254 roles)                       │
│       └─ Degree→Role compatibility scores                           │
│       └─ VALUE: Training labels for degree→career recommendation    │
│                                                                      │
│  ④  market_data.json (254 roles)                                     │
│       └─ Salary ranges, demand levels, AI risk scores               │
│       └─ VALUE: Real-world signal for career ranking                │
│                                                                      │
│  ⑤  analysis_*.json (19 full analyses)                               │
│       └─ Complete user sessions with input profiles + AI output     │
│       └─ VALUE: End-to-end examples for model evaluation            │
│                                                                      │
│  ⑥  training_news_log.json (bookmarked news)                         │
│       └─ News items saved by users, tagged by career interest       │
│       └─ VALUE: Builds preference dataset for news recommendation   │
│                                                                      │
│  ⑦  dropdownData.json (education hierarchy)                          │
│       └─ Domain → Degree → Specialization taxonomy                  │
│       └─ VALUE: Input vocabulary and academic classification        │
│                                                                      │
│  ⑧  projects.json (189 roles)                                        │
│       └─ Recommended portfolio projects per career role             │
│       └─ VALUE: Project recommendation training data                │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.3 From Dataset to Model: Step-by-Step

| Phase | When | What Happens | Required Data Volume |
|-------|------|--------------|---------------------|
| **Phase 1: Bootstrap** (NOW) | Mar 2026 | Groq/OpenRouter generate initial datasets | ✅ Done (254 roles, 20 degrees) |
| **Phase 2: Collect** | Mar–Sep 2026 | Students use platform → `training_log.json` grows | Need **1,000+ entries** |
| **Phase 3: Curate** | Oct 2026 | Human review of training data, fix AI errors | Manual QA of 1,000 entries |
| **Phase 4: Fine-tune** | Nov 2026 | Fine-tune LLaMA/Mistral on curated data | JSONL format: `{"prompt":..., "completion":...}` |
| **Phase 5: Deploy** | Dec 2026 | Replace OpenRouter API with own model | Self-hosted inference |
| **Phase 6: Iterate** | 2027+ | Continuous learning from new student data | Ongoing |

---

## 3. Scope of the SMAART AI Model

### 3.1 What the Model Will Do (In-Scope)

| Capability | Input | Output | Training Data Source |
|-----------|-------|--------|---------------------|
| **Career Direction Prediction** | Degree + Specialization + CGPA + Skills | Top 3 matching career roles with scores | `zone_matrix.json` + `training_log.json` |
| **Skill Gap Analysis** | Student's current skills + target role | Missing skills (Critical/High/Recommended) | `role_skills_db.json` |
| **Learning Path Generation** | Skill gaps + role | Course sequence with links + timelines | `role_skills_db.json` (where_to_learn field) |
| **AI Risk Assessment** | Career role | AI automation risk level + reasoning | `market_data.json` |
| **Salary Estimation** | Role + experience level | Expected salary range (LPA) | `market_data.json` |
| **Project Recommendations** | Target role + current skills | Portfolio project suggestions | `projects.json` |
| **News Recommendation** | User's career interest | Relevant industry news items | `training_news_log.json` |

### 3.2 What the Model Will NOT Do (Out of Scope)

- ❌ General chat / conversation AI
- ❌ Resume writing
- ❌ Interview preparation
- ❌ Job application automation
- ❌ Real-time salary negotiation
- ❌ Company-specific hiring insights

### 3.3 Model Architecture (Planned)

```
Option A: Fine-tuned LLaMA 3 (7B or 13B)
  - Pros: Open-source, self-hostable, good quality
  - Cons: Requires GPU for inference

Option B: Fine-tuned Mistral 7B
  - Pros: Lighter, faster inference, excellent for structured output
  - Cons: Needs validation on Indian education context

Option C: Custom classifier + rule engine (hybrid)
  - Pros: No GPU needed, deterministic, faster
  - Cons: Less flexible, harder to maintain
  
Recommended: Option B (Mistral 7B fine-tune) for core predictions,
             with rule engine fallback for edge cases.
```

---

## 4. Data Gaps — What We Still Need

### 4.1 Critical Gaps (Must Fix Before Model Training)

| Gap | Current State | What's Needed | Priority |
|-----|--------------|---------------|----------|
| **More domains in dropdownData** | Only 2 domains (Engineering, Commerce) | Add: Arts, Science, Medical, Law, Management, Design, Agriculture | 🔴 Critical |
| **More degree programs** | 20 degrees | Need 40+ (MBA, BBA, MBBS, LLB, BA, M.Sc, etc.) | 🔴 Critical |
| **More specializations** | Limited per degree | Need comprehensive list per Indian university system | 🔴 Critical |
| **Non-IT roles coverage** | 23 added, many still basic | Need detailed skill profiles for all 254 roles | 🟡 High |
| **Training data volume** | Only 19 entries | Need **1,000+ entries** for meaningful fine-tuning | 🟡 High |

### 4.2 Enhancement Gaps (Nice to Have)

| Gap | Benefit | Source |
|-----|---------|--------|
| **Company-wise hiring data** | Show which companies hire for each role | Naukri/LinkedIn scraping or manual curation |
| **Course platform URLs** | Direct links to Coursera/Udemy/NPTEL courses | Manual curation needed |
| **Certification data** | Which certifications boost each role | Industry research needed |
| **Alumni success stories** | Inspiration + validation | College partnerships needed |
| **Regional salary data** | Different salaries per city (Mumbai vs Tier-2) | Government pay surveys |

### 4.3 Downloadable/External Datasets You Can Add

> **Important**: Below are datasets you can download and plug into the system to improve coverage.

| Dataset | What It Provides | Where to Get |
|---------|-----------------|--------------|
| **India Skills Report 2026** | National skill gap analysis by sector | [Wheebox India Skills Report](https://wheebox.com/india-skills-report.htm) |
| **AISHE (All India Survey on Higher Education)** | Complete list of degrees, colleges, enrolled students | [AISHE Data](https://aishe.gov.in/aishe/dataCollection) |
| **National Classification of Occupations (NCO)** | Official Indian occupation taxonomy (2,000+ roles) | [Ministry of Labour](https://www.ncs.gov.in/nco2015/Pages/NCOSearch.aspx) |
| **NASSCOM / IT-ITeS Sector Data** | IT sector skill demand, salary benchmarks | [NASSCOM](https://nasscom.in/knowledge-center) |
| **O*NET (US Occupation Network)** | 1,000+ detailed occupation profiles with skills | [O*NET Online](https://www.onetonline.org/find/) |
| **Kaggle Job Market Datasets** | Salary data, job postings, skill demand | [Kaggle](https://www.kaggle.com/search?q=indian+job+market) |
| **UGC Approved Degree List** | Complete list of recognized Indian degrees | [UGC Website](https://www.ugc.gov.in/) |
| **NPTEL Course Catalog** | Free Indian engineering courses with certificates | [NPTEL](https://nptel.ac.in/courses) |

---

## 5. Data Format Requirements for AI Model Training

### 5.1 Training Data Format (JSONL)

Every entry in `training_log.json` is automatically saved in this format:

```json
{
  "id": 1774114909721,
  "timestamp": "2026-03-21T17:41:59.846Z",
  "prompt": "Student degree: B.Tech Computer Science | Target role: AI Engineer | Zone: Green | Missing: TensorFlow, PyTorch | Generate career path:",
  "completion": "{\"status\":\"success\", \"matchedRoles\":[...], \"skillGaps\":[...], \"roadmap\":[...]}"
}
```

### 5.2 Export for Fine-Tuning

Run the export script to convert to OpenAI fine-tuning format:

```bash
cd backend
node dataset_builder/export_training_data.js
# Output: backend/records/training_data_export.jsonl
```

Output format:
```jsonl
{"messages": [{"role": "system", "content": "You are SMAART career advisor..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

### 5.3 Minimum Requirements for Fine-Tuning

| Metric | Minimum | Recommended | Current |
|--------|---------|-------------|---------|
| Training examples | 100 | 1,000+ | **19** |
| Unique degree types | 10 | 40+ | **20** |
| Unique roles covered | 50 | 200+ | **254** ✅ |
| Distinct specializations | 20 | 100+ | ~30 |
| Data quality (human-verified) | 50% | 100% | ~0% (AI-generated) |

---

## 6. Data Collection Strategy

### 6.1 Organic Collection (Platform Usage)

Every time a student completes the onboarding flow:
1. `training_log.json` gets a new entry (prompt + completion)
2. `analysis_*.json` gets the full result
3. MongoDB stores the structured analysis

**Target**: 1,000 entries by September 2026 through:
- College campus drives
- Partnership with placement cells
- Social media marketing

### 6.2 Manual Curation (Admin Team)

| Task | Data File | Who Does It |
|------|-----------|-------------|
| Add new domains (Medical, Law, Arts) | `dropdownData.json` | Admin team |
| Add more specializations | `dropdownData.json` | Domain experts |
| Verify salary data accuracy | `market_data.json` | Market research |
| Review AI-generated skill profiles | `role_skills_db.json` | Industry mentors |
| Add real course URLs | `role_skills_db.json` (where_to_learn) | Content team |

### 6.3 Automated Refresh (Admin Scripts)

```bash
# Run monthly to keep salary/demand data current
node dataset_builder/generate_market_data.js

# Run when adding new degree programs
node dataset_builder/generate_zone_matrix.js

# Run when adding new career roles
node dataset_builder/generate_projects.js
```

---

## 7. Answering Key Questions

### Q: Are 254 roles and 1,667 job titles enough?

**For MVP: Yes.** 254 career roles cover the major Indian job market. The 1,667 job titles are different job postings that map to these 254 roles (e.g., "Frontend Developer", "React Developer", "UI Engineer" all map to "Frontend Developer" role).

**For scale**: We should aim for **500+ roles** by including:
- Government sector (IAS, IPS, State Services)
- Creative industries (Film, Music, Gaming)
- Healthcare specializations (Radiology, Pathology, etc.)
- Agricultural sciences
- Sports management

**Dataset sources**: See Section 4.3 above for downloadable datasets.

### Q: What data comes from our own database vs external AI?

| Source | Used For | Status |
|--------|----------|--------|
| **Our JSON databases** | All role matching, skill gaps, salary data, learning paths | ✅ Internal — no external calls |
| **OpenRouter (Claude)** | Career analysis when user completes onboarding | ⚠️ External API — needs replacement |
| **Groq API** | Personalized career news | ⚠️ External API — needs replacement |

**Company rule compliance**: Once the custom model is trained (Phase 4–5), **both OpenRouter and Groq calls will be replaced** with self-hosted inference. All core data (roles, skills, salaries) already comes from internal databases.

### Q: How will this data train our own AI model?

1. **training_log.json** → Direct fine-tuning pairs (student profile → career recommendation)
2. **role_skills_db.json** → Knowledge base embedded into model context
3. **zone_matrix.json** → Classification labels (degree × role compatibility)
4. **market_data.json** → Real-world validation signals
5. **User bookmarked news** → News recommendation fine-tuning
6. **Analysis files** → Evaluation benchmark (test the model against historical correct answers)

---

## 8. Summary: Current vs Future State

| Aspect | Current (Mar 2026) | Future (Dec 2026) |
|--------|-------------------|-------------------|
| AI Provider | OpenRouter (Claude 3.5) + Groq (LLaMA 3.3) | **Self-hosted Mistral 7B** |
| Career Roles | 254 | 500+ |
| Degree Programs | 20 | 50+ |
| Domains | 2 (Engineering, Commerce) | 8+ (add Medical, Law, Arts, Science, Management, Design, Agriculture) |
| Training Data | 19 entries | **1,000+ entries** |
| Data Quality | AI-generated (unverified) | **Human-reviewed** |
| News System | Groq-generated per request | **Own recommendation model** |
| Cost per Analysis | ~$0.003 (API call) | **$0** (self-hosted) |
