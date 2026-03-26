# SMAART — AI & API Architecture Guide

> **For Company Presentation** — This document explains exactly where AI is used, which APIs are called, how data flows, and how we build training datasets for our future custom AI model.

---

## Table of Contents

1. [AI Architecture Overview](#1-ai-architecture-overview)
2. [AI Layer 1: Deterministic Rule Engine](#2-ai-layer-1-deterministic-rule-engine)
3. [AI Layer 2: NLP Resume Parser (Hugging Face)](#3-ai-layer-2-nlp-resume-parser-hugging-face)
4. [AI Layer 3: Predictive Success Model (XGBoost)](#4-ai-layer-3-predictive-success-model-xgboost)
5. [AI Layer 4: Career News Generator (Groq AI)](#5-ai-layer-4-career-news-generator-groq-ai)
6. [AI Layer 5: Career Intelligence Generator (OpenRouter)](#6-ai-layer-5-career-intelligence-generator-openrouter)
7. [AI Layer 6: Admin Dataset Generator (Groq AI)](#7-ai-layer-6-admin-dataset-generator-groq-ai)
8. [API Keys — What Each One Does](#8-api-keys--what-each-one-does)
9. [Automatic Training Data Collection Pipeline](#9-automatic-training-data-collection-pipeline)
10. [How Training Data Feeds Future AI Models](#10-how-training-data-feeds-future-ai-models)
11. [Data Flow Diagram](#11-data-flow-diagram)
12. [File Reference Map](#12-file-reference-map)

---

## 1. AI Architecture Overview

SMAART uses a **6-layer AI architecture** where each layer handles a specific intelligence task:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMAART AI Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: RULE ENGINE (No API)          ← Core brain            │
│  ├── Zone classification (Green/Amber/Red)                      │
│  ├── Skill gap calculation                                      │
│  ├── Career direction scoring                                   │
│  └── Learning roadmap generation                                │
│                                                                 │
│  Layer 2: NLP RESUME PARSER             ← Hugging Face          │
│  ├── Semantic skill extraction                                  │
│  └── Cosine similarity matching                                 │
│                                                                 │
│  Layer 3: PREDICTIVE MODEL              ← XGBoost               │
│  └── Student success probability (0-100%)                       │
│                                                                 │
│  Layer 4: CAREER NEWS                   ← Groq API              │
│  └── Real-time Indian job market news                           │
│                                                                 │
│  Layer 5: CAREER INTELLIGENCE           ← OpenRouter API        │
│  └── AI-enriched learning paths & recommendations               │
│                                                                 │
│  Layer 6: DATASET BUILDER               ← Groq API (admin)      │
│  └── Zone matrix & market data generation                       │
│                                                                 │
│  TRAINING PIPELINE (Automatic)          ← No API needed          │
│  ├── Every analysis → training_log.json                         │
│  ├── Every feedback → rating attached to training entry          │
│  └── Export → JSONL for model fine-tuning                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Principle

> **Data comes from our Internal Databases. AI only processes and recommends — it never stores or generates the core data.**

This ensures:
- No dependency on external AI for core features
- Reproducible, deterministic results
- Complete data ownership for future model training

---

## 2. AI Layer 1: Deterministic Rule Engine

**File:** `backend/engine.js`  
**API Key Required:** ❌ None  
**What it does:** The core brain of SMAART

### How It Works

```
Student submits profile
        ↓
   engine.js reads from LOCAL databases:
   ├── role_skills_db.json    (1,177 roles with skills)
   ├── zone_matrix.json       (degree → role compatibility)
   ├── market_data.json       (salary, demand, AI risk)
   └── projects.json          (portfolio suggestions)
        ↓
   Calculates (no AI API call needed):
   ├── Zone Classification → Green / Amber / Red
   ├── Skill Coverage %   → e.g., 72% match
   ├── Missing Skills     → ["TensorFlow", "Docker"]
   ├── Matched Skills     → ["Python", "SQL"]
   ├── Learning Roadmap   → Critical → Important → Nice-to-have
   └── Direction Score    → How well the student fits each role
        ↓
   Returns structured JSON analysis
```

### Functions in `engine.js`

| Function | Purpose | Data Source |
|----------|---------|------------|
| `determineZone(degree, role)` | Classifies as Green/Amber/Red | `zone_matrix.json` |
| `calculateSkillGaps(studentSkills, roleData)` | Finds missing vs matched skills | `role_skills_db.json` |
| `calculateDirectionScore(role, studentData)` | Scores student-role fit (0-100) | Multiple databases |
| `generateRoleTab(role, studentData)` | Full role analysis with roadmap | All databases |
| `processCareerIntelligence(studentData)` | Master function — runs everything | All databases |

### Why This Matters

- **No internet needed** for core career analysis
- **Zero API cost** for the primary features
- **Deterministic** — same input always gives same output
- **Fast** — reads from JSON files in memory

---

## 3. AI Layer 2: NLP Resume Parser (Hugging Face)

**File:** `ml-service/resume_parser.py`  
**Model:** `all-MiniLM-L6-v2` (Hugging Face sentence-transformers)  
**API Key Required:** ❌ None (model runs locally)  
**Cost:** Free (runs on your machine)

### How It Works

```
Student uploads resume (text)
        ↓
Backend sends to ML Service (Flask, port 5001)
  POST /parse-resume { text: "resume content..." }
        ↓
resume_parser.py:
  1. Load pre-trained transformer model (all-MiniLM-L6-v2)
  2. Split resume into chunks (sentences, bullet points)
  3. Encode resume chunks → 384-dimension vectors
  4. Encode our 13 target skills → 384-dimension vectors
  5. Calculate cosine similarity between resume ↔ skills
  6. If similarity > 0.35 threshold → skill is matched
        ↓
Returns: { "extracted_skills": ["Python", "Machine Learning", "SQL"] }
```

### Why Semantic Matching (Not Keyword Search)

| Approach | Resume Text | Match? |
|----------|-------------|--------|
| **Keyword** | "built backend systems using express servers" | ❌ No "Node.js" keyword |
| **Semantic** | "built backend systems using express servers" | ✅ Matches "Node.js" (understands context) |
| **Keyword** | "guiding team members to success" | ❌ No "Leadership" keyword |
| **Semantic** | "guiding team members to success" | ✅ Matches "Leadership" (understands meaning) |

### Target Skill Categories

| # | Skill Domain | What It Matches |
|---|-------------|-----------------|
| 1 | Python | Python, Data Science, Django, Backend |
| 2 | Java | Spring Boot, Enterprise, Android |
| 3 | SQL | Database, PostgreSQL, MySQL, Queries |
| 4 | React | Frontend, Web Development, UI |
| 5 | Node.js | Backend, Express, JavaScript, APIs |
| 6 | C++ | Systems Programming, Graphics |
| 7 | AWS | Cloud, Infrastructure, Deployment |
| 8 | Machine Learning | AI, Deep Learning, TensorFlow |
| 9 | Data Analysis | Pandas, Analytics, Statistics |
| 10 | Communication | Presentation, Teamwork, Soft Skills |
| 11 | Leadership | Management, Mentoring, Guidance |
| 12 | Marketing | Digital, SEO, Campaigns, Growth |
| 13 | Project Management | Agile, Scrum, Jira, Planning |

---

## 4. AI Layer 3: Predictive Success Model (XGBoost)

**File:** `ml-service/app.py`  
**Model:** XGBoost (Gradient Boosting)  
**API Key Required:** ❌ None (runs locally)

### How It Works

```
Backend sends student features:
  POST /predict-success
  { "features": [skill_match_count, degree_relevance, market_demand] }
        ↓
XGBoost model predicts success probability:
  → e.g., 0.78 = 78% chance of placement success
        ↓
Returns: { "success_probability": 0.78 }
```

### Input Features

| Feature | Description | Example |
|---------|-------------|---------|
| `skill_match_count` | How many required skills the student has | 8 |
| `degree_relevance_score` | How relevant their degree is (from zone matrix) | 7 |
| `market_demand_score` | Current market demand for the role | 9 |

### Current Status

The model currently uses a bootstrapping formula. After collecting 1,000+ training entries, it will be replaced with a properly trained XGBoost model using real placement data.

---

## 5. AI Layer 4: Career News Generator (Groq AI)

**File:** `backend/index.js` (line 146-181)  
**API:** `https://api.groq.com/openai/v1/chat/completions`  
**Model:** `llama-3.3-70b-versatile`  
**API Key:** `GROQ_API_KEY`  
**Cost:** Free tier (limited requests/day)

### How It Works

```
User opens Market Insights page
  → Frontend sends: POST /api/career-news { interest: "AI Engineer" }
        ↓
Backend checks Redis cache (1-hour TTL)
  → If cached → return immediately (no API call)
  → If not cached ↓
        ↓
Backend calls Groq API:
  Model: llama-3.3-70b-versatile
  System prompt: "Generate 6 realistic Indian job market news..."
  User prompt: "Generate news for someone interested in AI Engineer..."
        ↓
Groq returns 6 news items with:
  - source: "LinkedIn", "India Today", "The Hindu", etc.
  - title: "AI Engineers demand surges 40% in Bangalore"
  - tag: "AI Hiring", "Layoff Alert", etc.
  - url: link to the publication
        ↓
Backend caches result for 1 hour → Returns to frontend
```

### Where the API Key Is Used

```javascript
// backend/index.js, line 155-169
const GROQ_KEY = process.env.GROQ_API_KEY;
await axios.post('https://api.groq.com/openai/v1/chat/completions', {
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'system', content: '...' }, { role: 'user', content: '...' }],
  temperature: 0.8,
  max_tokens: 1200,
}, { headers: { 'Authorization': `Bearer ${GROQ_KEY}` } });
```

---

## 6. AI Layer 5: Career Intelligence Generator (OpenRouter)

**File:** `backend/services/aiService.js`  
**API:** `https://openrouter.ai/api/v1/chat/completions`  
**Model:** `anthropic/claude-3.5-sonnet`  
**API Key:** `OPENROUTER_API_KEY`

### How It Works

```
After Rule Engine generates the base analysis
        ↓
aiService.js enriches it with AI-generated content:
  → Personalized learning path recommendations
  → Industry insight narratives
  → Career transition strategies
        ↓
OpenRouter API call:
  Model: Claude 3.5 Sonnet (via OpenRouter)
  Input: Student profile + skill gaps + zone data
  Output: Rich text recommendations
        ↓
Combined with Rule Engine output → Full career report
```

### Where the API Key Is Used

```javascript
// backend/services/aiService.js, line 7-21
const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
  model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
  messages: [{ role: 'user', content: prompt }],
}, {
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://smaart-platform.com',
    'X-Title': 'SMAART Platform',
  },
});
```

---

## 7. AI Layer 6: Admin Dataset Generator (Groq AI)

**Files:** `backend/dataset_builder/generate_zone_matrix.js`, `generate_market_data.js`, `generate_projects.js`  
**API:** Groq (same key)  
**Purpose:** One-time data generation (admin only — not used during normal operation)

### How It Works

These scripts were used by the admin team to **generate the initial databases**:

```
Admin runs: node generate_zone_matrix.js
        ↓
For each of 20 degrees × 254 roles:
  → Calls Groq API: "What is the employer zone for {degree} → {role}?"
  → Groq responds: { employer_zone: "Green", skill_coverage_pct: 85 }
  → Saved to zone_matrix.json
        ↓
This runs ONCE. After that, the data is stored locally and never regenerated.
```

| Script | Generated | Records | Status |
|--------|-----------|---------|--------|
| `generate_zone_matrix.js` | `zone_matrix.json` | 20 degrees × 254 roles | ✅ Complete |
| `generate_market_data.js` | `market_data.json` | 254 salary/demand entries | ✅ Complete |
| `generate_projects.js` | `projects.json` | 189 roles with projects | ✅ Complete |
| `admin_generate_ai_data.js` | Additional role data | 254 roles | ✅ Complete |

> **Important:** These scripts are NOT called during normal operation. They were run once to populate the databases. The data is now stored in JSON files and served directly.

---

## 8. API Keys — What Each One Does

| Key | Provider | Where Used | What It Does | Free Tier |
|-----|----------|-----------|--------------|-----------|
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai) | `aiService.js` | Routes to Claude 3.5 Sonnet for career enrichment | Pay-per-use |
| `GROQ_API_KEY` | [Groq](https://console.groq.com) | `index.js` (news), `dataset_builder/` (admin) | Llama 3.3 for news generation + one-time data generation | ✅ Free tier |
| `DATABASE_URL` | PostgreSQL | `prisma/schema.prisma` | User accounts, role-skill graph | Local install |
| `MONGO_URI` | MongoDB | `index.js` | Career analysis document storage | Local or Atlas free |
| `REDIS_URL` | Redis | `index.js` | Caching (optional — app works without it) | Local install |
| `JWT_SECRET` | Self-generated | `index.js` | Auth token signing | N/A |

### How to Obtain API Keys

| Key | How to Get |
|-----|-----------|
| `OPENROUTER_API_KEY` | 1. Go to [openrouter.ai](https://openrouter.ai) → 2. Sign up → 3. Go to Keys → 4. Create key |
| `GROQ_API_KEY` | 1. Go to [console.groq.com](https://console.groq.com) → 2. Sign up → 3. API Keys → 4. Create key |
| `DATABASE_URL` | Install PostgreSQL locally → Create database `smaart_db` → Use connection string |
| `MONGO_URI` | Install MongoDB locally → Default: `mongodb://127.0.0.1:27017/smaart_db` |

---

## 9. Automatic Training Data Collection Pipeline

### How User Data Becomes Training Data

Every time a student uses SMAART, their data automatically feeds into the training pipeline:

```
┌──────────────────────────────────────────────────────────────┐
│              AUTOMATIC TRAINING DATA PIPELINE                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: STUDENT SUBMITS PROFILE                              │
│  ├── Degree, skills, interests, target roles                  │
│  └── Saved to: input_user_data in analysis file               │
│                                                               │
│  Step 2: AI GENERATES ANALYSIS                                │
│  ├── Rule Engine calculates zones, skills, roadmaps           │
│  ├── ML Service extracts resume skills                        │
│  └── Saved to: output_generated_report in analysis file       │
│                                                               │
│  Step 3: AUTOMATIC TRAINING LOG (no user action needed)       │
│  ├── logTrainingData() in index.js (line 233)                 │
│  ├── Creates prompt/completion pair automatically              │
│  ├── Format:                                                  │
│  │   prompt: "Student degree: B.Tech CS | Target: AI          │
│  │           Engineer | Zone: Green | Missing: TensorFlow"    │
│  │   completion: "{...full analysis JSON...}"                 │
│  └── Saved to: backend/records/training_log.json              │
│                                                               │
│  Step 4: INDIVIDUAL RECORD SAVED                              │
│  ├── Full analysis saved as: analysis_{id}_{name}.json        │
│  └── Saved to: backend/records/                               │
│                                                               │
│  Step 5: STUDENT GIVES FEEDBACK (optional)                    │
│  ├── Rating (1-5 stars) on dashboard                          │
│  ├── POST /api/feedback { analysisId, rating, comment }       │
│  ├── Rating attached to training_log.json entry               │
│  └── High-rated entries (4-5 stars) = verified training data  │
│                                                               │
│  Step 6: MONGODB STORAGE                                      │
│  ├── Full analysis stored in MongoDB for retrieval            │
│  └── Includes: zone, skills, degree, college_code             │
│                                                               │
│  Step 7: POSTGRESQL STORAGE                                   │
│  ├── Summary stored in PostgreSQL for queries                 │
│  └── Includes: student_name, email, primary_role              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Where Each Piece Is Stored

| Data | Storage | File/Table | Purpose |
|------|---------|-----------|---------|
| Raw prompt/completion | JSON file | `backend/records/training_log.json` | Future model fine-tuning |
| Full analysis record | JSON file | `backend/records/analysis_*.json` | Audit trail |
| User feedback ratings | JSON file | `backend/records/feedback.json` | Quality scoring |
| News training data | JSON file | `backend/records/training_news_log.json` | News model training |
| MongoDB document | MongoDB | `career_analyses` collection | Full unstructured storage |
| PostgreSQL row | PostgreSQL | `career_analyses` table | Structured queries |

### Training Log Entry Format (Actual Example)

```json
{
  "id": 1774114909721,
  "timestamp": "2026-03-21T17:41:59.846Z",
  "prompt": "Student degree: B.Tech CS | Target role: AI Engineer | Zone: Green | Missing: TensorFlow, PyTorch | Generate career path:",
  "completion": "{full analysis JSON with zones, skills, roadmap...}",
  "zone": "Green",
  "degree": "B.Tech Computer Science",
  "role": "AI Engineer",
  "rating": null,
  "is_synthetic": false
}
```

---

## 10. How Training Data Feeds Future AI Models

### The 4-Phase Training Strategy

```
Phase 1: BOOTSTRAPPING (Current Stage)
├── Entries: 3 real + growing
├── Model: Use Rule Engine + external APIs
├── Goal: Collect 100 entries
└── Status: ✅ Active

Phase 2: PATTERN VALIDATION (100-500 entries)
├── Analyze: Which zones are most common?
├── Analyze: Which skill gaps repeat?
├── Action: Optimize the Rule Engine weights
└── Status: ⏳ Pending

Phase 3: FINE-TUNING READY (500-1,000 entries)
├── Export: training_log.json → training_export.jsonl
├── Script: node backend/dataset_builder/export_training_data.js
├── Filter: Only entries with rating ≥ 4 stars
├── Format: JSONL (industry standard for fine-tuning)
└── Status: ⏳ Pending

Phase 4: CUSTOM SMAART MODEL (1,000+ entries)
├── Train: Fine-tune base model on our JSONL data
├── Replace: Swap external API calls with our model
├── Result: Zero API cost + Indian market-specific intelligence
├── Benefit: Faster, cheaper, more accurate
└── Status: ⏳ Pending
```

### Export Training Data — How It Works

```bash
# Export ALL training entries to JSONL:
cd backend && node dataset_builder/export_training_data.js

# Export ONLY highly-rated entries (rating ≥ 4):
cd backend && node dataset_builder/export_training_data.js --rated
```

### Output Format (JSONL — One JSON per line)

```jsonl
{"prompt":"Student degree: B.Tech CS | Target role: AI Engineer | Zone: Green | Missing: TensorFlow","completion":"{...}","metadata":{"zone":"Green","degree":"B.Tech CS","role":"AI Engineer","rating":5,"timestamp":"2026-03-21T17:41:59Z"}}
{"prompt":"Student degree: MBA | Target role: Product Manager | Zone: Amber | Missing: Agile, Data Analytics","completion":"{...}","metadata":{"zone":"Amber","degree":"MBA","role":"Product Manager","rating":4,"timestamp":"2026-03-22T10:15:00Z"}}
```

### How an ML Engineer Uses This Data

```
1. Pull the repo
2. Run: node backend/dataset_builder/export_training_data.js
3. Get: backend/records/training_export.jsonl
4. Load into: Any fine-tuning framework (OpenAI, HuggingFace, LoRA)
5. Train: Custom SMAART career recommendation model
6. Deploy: Replace external API calls with local model
```

---

## 11. Data Flow Diagram

### Complete Student Journey (What Happens When a Student Uses SMAART)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Student    │     │   Frontend    │     │    Backend       │
│   Browser    │────▸│   React App  │────▸│    Node.js       │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          ▼                        ▼                        ▼
                 ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
                 │  Rule Engine    │    │   ML Service     │    │   AI APIs        │
                 │  (engine.js)    │    │   (Flask:5001)   │    │  (External)      │
                 │                 │    │                  │    │                  │
                 │ • Zone classify │    │ • Resume parse   │    │ • Career news    │
                 │ • Skill gaps    │    │   (HuggingFace)  │    │   (Groq/Llama)   │
                 │ • Roadmap gen   │    │ • Success predict│    │ • AI enrichment  │
                 │ • Scoring       │    │   (XGBoost)      │    │   (OpenRouter/   │
                 │                 │    │                  │    │    Claude)        │
                 │ Reads from:     │    │ Runs locally     │    │                  │
                 │ • role_skills   │    │ No API key       │    │ Uses API keys    │
                 │ • zone_matrix   │    │ needed           │    │ from .env        │
                 │ • market_data   │    │                  │    │                  │
                 │ • projects      │    │                  │    │                  │
                 └────────┬────────┘    └────────┬─────────┘    └────────┬─────────┘
                          │                      │                       │
                          └──────────┬───────────┘                       │
                                     ▼                                   │
                          ┌──────────────────┐                           │
                          │  Combined Result  │◀──────────────────────────┘
                          │  (Full Analysis)  │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
           ┌──────────────┐ ┌──────────┐ ┌──────────────────┐
           │ PostgreSQL   │ │ MongoDB  │ │ Training Log     │
           │ (Structured) │ │ (Full    │ │ (training_log    │
           │              │ │  Document│ │  .json)          │
           │ Summary row  │ │ Full JSON│ │ Prompt/Completion│
           │ for queries  │ │ for      │ │ for future       │
           │              │ │ retrieval│ │ model training   │
           └──────────────┘ └──────────┘ └──────────────────┘
```

---

## 12. File Reference Map

### AI Code Files

| File | Language | AI Type | API Key Used |
|------|----------|---------|-------------|
| `backend/engine.js` | JavaScript | Rule Engine (deterministic) | ❌ None |
| `backend/services/aiService.js` | JavaScript | LLM (Claude 3.5 via OpenRouter) | `OPENROUTER_API_KEY` |
| `backend/index.js` (L146-181) | JavaScript | LLM (Llama 3.3 via Groq) | `GROQ_API_KEY` |
| `ml-service/app.py` | Python | ML Service server | ❌ None |
| `ml-service/resume_parser.py` | Python | NLP (Hugging Face all-MiniLM-L6-v2) | ❌ None (local) |
| `backend/dataset_builder/*.js` | JavaScript | LLM data generation (admin) | `GROQ_API_KEY` |

### Training Data Files

| File | Purpose | Auto-Generated? |
|------|---------|----------------|
| `backend/records/training_log.json` | Prompt/completion pairs for fine-tuning | ✅ Yes, every analysis |
| `backend/records/analysis_*.json` | Individual analysis records | ✅ Yes, every analysis |
| `backend/records/feedback.json` | User ratings (1-5 stars) | ✅ Yes, on feedback |
| `backend/records/training_news_log.json` | News data for news model | ✅ Yes, on save |
| `backend/records/training_export.jsonl` | Exported JSONL for fine-tuning | ❌ Manual export |

### Database Files (Static — Loaded at Startup)

| File | Records | Source |
|------|---------|--------|
| `backend/data/role_skills_db.json` | 254 roles | Company-curated |
| `backend/data/market_data.json` | 254 entries | Generated by Groq |
| `backend/data/zone_matrix.json` | 20 × 254 | Generated by Groq |
| `backend/data/projects.json` | 189 roles | Generated by Groq |
| `backend/datasets/processed/*.json` | 78K+ entries | Parsed from Kaggle/O*NET |

---

## Quick Reference Card (For Presentation)

| Question | Answer |
|----------|--------|
| **Where is AI used?** | 6 layers: Rule Engine, Resume NLP, Success Prediction, Career News, Career Enrichment, Dataset Generation |
| **What APIs are called?** | OpenRouter (Claude 3.5), Groq (Llama 3.3), Hugging Face (local), XGBoost (local) |
| **What data does AI generate?** | Career news, enriched recommendations. NOT core data (that comes from databases) |
| **Is the app usable without APIs?** | Yes — Rule Engine + local databases work without internet |
| **How is training data collected?** | Automatically on every student analysis → training_log.json |
| **When can we train our own model?** | At 1,000+ entries → export JSONL → fine-tune |
| **Where is training data stored?** | `backend/records/training_log.json` + MongoDB + PostgreSQL |
| **What's the export format?** | JSONL (industry standard) via `export_training_data.js` |
| **Who can export training data?** | Any ML engineer with repo access |
| **Does user data leave our servers?** | Only for AI enrichment (OpenRouter/Groq). Core data stays local. |
