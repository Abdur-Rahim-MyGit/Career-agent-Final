# SMAART Platform — Technical Architecture Document

> **Version**: 2.0 · **Date**: March 2026 · **For**: Dev Team Reference

---

## 1. System Overview

SMAART is an AI-powered career intelligence platform that analyses a student's academic profile and matches them against 254+ verified career roles in the Indian job market. The platform provides skill gap analysis, learning roadmaps, AI automation risk assessment, and a digital skills passport.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vite + React)                 │
│  localhost:5173                                              │
│  ┌────────┐ ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Home  │ │ Onboarding│ │Dashboard │ │Market Insights │  │
│  └────────┘ └───────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐     │
│  │Skills Passport│ │Learning Path  │ │  AI Tools Tab  │     │
│  └──────────────┘ └───────────────┘ └────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP /api/*
┌──────────────────────────▼──────────────────────────────────┐
│                  BACKEND (Express.js)                        │
│  localhost:5000                                              │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │ Auth API │ │ Career Engine│ │ Career News (Groq AI)│    │
│  └──────────┘ └──────────────┘ └──────────────────────┘    │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │Market API│ │ Admin Scripts│ │ Training Data Logger │    │
│  └──────────┘ └──────────────┘ └──────────────────────┘    │
└──────┬───────────┬───────────┬───────────┬──────────────────┘
       │           │           │           │
  ┌────▼────┐ ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐
  │PostgreSQL│ │ MongoDB │ │ Redis  │ │JSON Files│
  │(Prisma)  │ │(Mongoose│ │(Cache) │ │(Datasets)│
  └─────────┘ └─────────┘ └────────┘ └──────────┘
```

---

## 2. API Keys & External Services

| Service | Env Variable | Purpose | Where Used |
|---------|-------------|---------|------------|
| **Groq API** | `GROQ_API_KEY` | LLM for dataset generation + career news | `dataset_builder/*.js`, `/api/career-news` |
| **OpenRouter API** | `OPENROUTER_API_KEY` | AI career analysis (Claude 3.5 Sonnet) | `services/aiService.js`, `/api/career-analysis` |
| **PostgreSQL** | `DATABASE_URL` | User accounts, auth | `prisma/schema.prisma` |
| **MongoDB** | `MONGO_URI` | Career analysis history storage | `mongoDb.js` |
| **Redis** | `REDIS_URL` | Response caching (optional) | `index.js` (getCached/setCached) |
| **ML Service** | `ML_SERVICE_URL` | Resume parsing, success prediction | `localhost:5001` Python service |

### .env File Location
```
backend/.env
```

### How API Keys Are Used

#### Groq API (Dataset Generation + News)
- **What**: Calls Groq's LLaMA 3.3 70B model
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Used for**:
  1. **Dataset generation** (admin scripts — run manually):
     - `generate_zone_matrix.js` — Creates degree↔role compatibility matrix
     - `generate_market_data.js` — Creates salary & demand data for roles
     - `generate_projects.js` — Creates project recommendations per role
  2. **Live career news** (user-facing — runs per request):
     - `POST /api/career-news` — Generates personalized news based on user's career interest
     - Cached in Redis for 1 hour per interest keyword
- **Auth**: `Authorization: Bearer <GROQ_API_KEY>` header

#### OpenRouter API (Career Analysis)
- **What**: Calls Claude 3.5 Sonnet via OpenRouter proxy
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Used for**:
  1. **Career analysis** — The core AI analysis when user completes onboarding
  2. **Admin role generation** — `POST /api/admin/generate-role`
- **Auth**: `Authorization: Bearer <OPENROUTER_API_KEY>` header
- **File**: `backend/services/aiService.js`

---

## 3. Databases & Data Flow

### 3.1 PostgreSQL (Prisma ORM)
- **Purpose**: User accounts (registration, login, JWT auth)
- **Schema**: `backend/prisma/schema.prisma`
- **Tables**: `User` (id, name, email, passwordHash, role, onboardingData)
- **Connection**: `DATABASE_URL` in `.env`

### 3.2 MongoDB (Mongoose)
- **Purpose**: Stores full career analysis results
- **Collection**: `careerAnalyses`
- **Schema**: `backend/mongoDb.js` → `CareerAnalysisModel`
- **Fields**: analysisId, userId, roleTitle, matchScore, skills, roadmap, etc.

### 3.3 Redis (Optional Cache)
- **Purpose**: Caches API responses to reduce Groq/OpenRouter costs
- **Cache keys**: `career_news_<interest>`, `roles_list`, `career_directions`
- **TTL**: 1 hour for news, 1 hour for static data
- **Graceful fallback**: App works without Redis

### 3.4 JSON File Databases (Static Data)

| File | Path | Records | What It Contains |
|------|------|---------|-----------------|
| `role_skills_db.json` | `backend/data/` | 254 roles | Tech skills + AI tools per role (with priority levels) |
| `zone_matrix.json` | `backend/data/` | 20 degrees × 254 roles | Degree-to-role compatibility scores |
| `market_data.json` | `backend/data/` | 254 roles | Salary ranges, demand levels, AI risk |
| `projects.json` | `backend/data/` | 189 roles | Recommended portfolio projects |
| `mockRoles.js` | `backend/data/` | 254 roles | Role titles for API responses |
| `jobRolesData.json` | `frontend/src/data/` | 1,667 titles | Autocomplete suggestions for role search |
| `dropdownData.json` | `frontend/src/data/` | 4 domains | Education hierarchy (domain → degree → specialization) |
| `aiToolsData.json` | `frontend/src/data/` | Per-role | AI tools (must-have + nice-to-have) per role |

### 3.5 Training Data Files

| File | Path | Format |
|------|------|--------|
| `training_log.json` | `backend/records/` | `[{prompt, completion}]` — for future model fine-tuning |
| `training_news_log.json` | `backend/records/` | Saved news items per user — for future news model |
| `export_training_data.js` | `backend/dataset_builder/` | Script to export training data in JSONL format |

---

## 4. Data Fetching Flow (How Data Gets to the UI)

### 4.1 Career Analysis (Main Flow)
```
User fills Onboarding form
  → Frontend POST /api/career-analysis { degree, specialization, skills, interest }
    → Backend: engine.js processCareerIntelligence()
      → Looks up zone_matrix.json for degree compatibility
      → Looks up role_skills_db.json for skill matching
      → Looks up market_data.json for salary/demand data
      → Calls OpenRouter (Claude 3.5) for AI-powered analysis via aiService.js
      → Saves result to MongoDB
      → Returns JSON { matchedRoles, skillGaps, roadmap, marketData }
    → Frontend stores in localStorage + renders Dashboard
```

### 4.2 Market Insights Page
```
User navigates to /insights
  → Frontend GET /api/market-insights
    → Backend reads market_data.json
    → Returns { totalRoles, topDemand, highestPaying, highAiRisk, futureSafe }
  → Frontend also calls POST /api/career-news { interest }
    → Backend checks Redis cache
    → If miss: calls Groq API (LLaMA 3.3 70B) for personalized news
    → Caches result for 1 hour
    → Returns { news: [...] }
```

### 4.3 Skills & AI Tools
```
Dashboard loads → reads from localStorage (previous analysis)
  → role_skills_db.json provides: tech_skills per role (with priority)
  → aiToolsData.json provides: must_have + nice_to_have AI tools per profession
  → Learning path: courses with redirect URLs from role_skills_db.json where_to_learn field
```

---

## 5. Admin Operations

### 5.1 Admin Scripts (Run Manually)
These scripts use the **Groq API** to generate/refresh dataset files:

```bash
# Generate/update zone matrix (degree × role compatibility)
cd backend && node dataset_builder/generate_zone_matrix.js

# Generate market data (salaries, demand, AI risk)
cd backend && node dataset_builder/generate_market_data.js

# Generate project recommendations
cd backend && node dataset_builder/generate_projects.js

# Generate non-IT roles
cd backend && node dataset_builder/generate_non_it_roles.js

# Export training data in JSONL format
cd backend && node dataset_builder/export_training_data.js
```

### 5.2 Admin API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/admin/generate-role` | JWT (admin) | Generate new role via AI |
| POST | `/api/career-news` | None | Personalized news via Groq |
| POST | `/api/save-news-training` | None | Save news for training data |

### 5.3 What Admin Can Change
1. **Add new roles**: Run admin scripts or use `/api/admin/generate-role`
2. **Update salary data**: Rerun `generate_market_data.js`
3. **Add degree programs**: Edit `dropdownData.json` + rerun `generate_zone_matrix.js`
4. **Refresh news**: News auto-refreshes every 1 hour (Redis TTL) or on user click "Refresh News"

---

## 6. News System

### How News Works
1. **On page load**: Frontend calls `POST /api/career-news` with user's stored career interest
2. **Backend**: Checks Redis for cached news for that interest
3. **If no cache**: Calls Groq API to generate 6 realistic Indian job market news headlines tailored to the user's interest
4. **Cache**: Stores result in Redis for 1 hour
5. **Fallback**: If Groq fails, frontend shows static curated news

### News Personalization
- If user selected "AI Engineer" during onboarding → news focuses on AI/ML hiring, layoffs in related areas
- If user selected "Digital Marketing" → news focuses on marketing trends, SEO changes, social media jobs
- Interest stored in `localStorage.smaart_interest`

### News Updates
- News is **NOT the same for everyone** — it's personalized by career interest
- News is **refreshed every 1 hour** per interest category (Redis TTL)
- User can click **"Refresh News"** button to force-regenerate
- Each Groq call generates fresh headlines based on current date context

### News Training Data
- Users can **bookmark/save** news items
- Saved items stored in:
  - `localStorage.smaart_saved_news` (client-side)
  - `backend/records/training_news_log.json` (server-side)
- **Future use**: This data can be used to train a news recommendation model
  - Fields: `{ source, title, tag, tagColor, url, savedAt, userInterest }`

---

## 7. Future Training Dataset Plan

### Current Training Data Sources
1. **`training_log.json`** — Career analysis prompts + completions
2. **`training_news_log.json`** — Bookmarked news items per user
3. **`role_skills_db.json`** — Role→skill mappings (ground truth)
4. **`zone_matrix.json`** — Degree→role compatibility (ground truth)

### How to Use for Future AI Model Training
1. **Collect 1,000+ student entries** through the platform
2. Run `export_training_data.js` to export in JSONL format
3. Fine-tune a model on:
   - Input: Student profile (degree, specialization, CGPA, skills)
   - Output: Matched roles + skill gaps + roadmap
4. **News model**: Use saved news preferences to build a recommendation engine
5. **Format**: OpenAI fine-tuning format `{"prompt": "...", "completion": "..."}`

### Dataset Quality Notes
- Current datasets are **Groq AI-generated** — good for MVP, need human validation at scale
- Non-IT roles (23 added): Chartered Accountant, Teacher, Lawyer, Doctor, etc.
- Coverage gap: Some niche roles may lack detailed skill data

---

## 8. Running the Platform

### Start Backend
```bash
cd backend
npm install
npx prisma generate
node index.js
# Runs on localhost:5000
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on localhost:5173
```

### Required Services
| Service | Required? | Fallback |
|---------|-----------|----------|
| PostgreSQL | No | Demo mode login (auto-generates users) |
| MongoDB | No | Analysis stored in localStorage only |
| Redis | No | No caching, direct API calls |
| Groq API | Yes (for news) | Static curated news shown |
| OpenRouter | Yes (for analysis) | Error shown if missing |
