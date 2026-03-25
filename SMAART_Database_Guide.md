# SMAART — Complete Database Guide

> This document explains **every database** used in the SMAART Career Intelligence Platform, its purpose, schema, and where it lives.

---

## 🏗️ Database Architecture Overview

```
SMAART Platform
├── 1. PostgreSQL (Prisma ORM)         ← Users, Roles, Skills (relational)
├── 2. MongoDB                         ← Career analysis logs (unstructured)
├── 3. Redis                           ← API response caching (optional)
├── 4. Company JSON Databases          ← Core career data (DO NOT EDIT)
├── 5. Imported JSON Databases         ← Expanded data from Kaggle/O*NET
├── 6. Frontend Static Data            ← Dropdowns, cities, job listings
├── 7. AI Training Data (Records)      ← For future custom AI model
└── 8. Raw Downloaded Datasets         ← Source files (not in git)
```

---

## 1️⃣ PostgreSQL (Relational Database)

**Connection:** `DATABASE_URL` in `backend/.env`  
**ORM:** Prisma  
**Schema file:** `backend/prisma/schema.prisma`

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Student/admin accounts | `id`, `email`, `passwordHash`, `name`, `role` (STUDENT/ADMIN) |
| `StudentProfile` | Academic profile linked to User | `userId`, `degree`, `interests` (JSON), `completedSkills` (JSON) |
| `Role` | Career roles in knowledge graph | `id`, `title`, `category`, `description`, `requiredMatchScore` |
| `Skill` | Individual skills | `id`, `name`, `category` (technical/soft/tool), `uniquenessScore` |
| `RoleSkill` | Many-to-many: which skills belong to which role | `roleId`, `skillId`, `priority`, `weight` |

### When is it used?
- **User registration/login** → `User` table
- **Profile storage** → `StudentProfile` table
- **Knowledge graph queries** → `Role`, `Skill`, `RoleSkill` tables

---

## 2️⃣ MongoDB (Document Database)

**Connection:** `MONGO_URI` in `backend/.env`  
**Collection:** `CareerAnalysis`

### Purpose
Stores **full career analysis results** generated for each student. These are unstructured documents with nested JSON (skill maps, roadmaps, charts).

### When is it used?
- After a career analysis is generated → saved to MongoDB
- When student revisits dashboard → fetched from MongoDB by `analysisId`

---

## 3️⃣ Redis (Cache — Optional)

**Connection:** `REDIS_URL` in `backend/.env` (defaults to `redis://localhost:6379`)

### Purpose
Caches frequently accessed API responses to reduce load. The app works **without Redis** — it falls back to direct data loading.

### Cached Keys
| Key | TTL | Data |
|-----|-----|------|
| `all_roles` | 1 hour | mockRoles list |
| `expanded_roles` | 2 hours | Merged role-skill database |
| `expanded_market` | 2 hours | Merged market/salary data |
| `expanded_titles` | 2 hours | Merged job titles list |
| `all_courses` | 2 hours | NPTEL course catalog |

---

## 4️⃣ Company JSON Databases (DO NOT EDIT)

These are the **original company-curated databases**. They are the ground truth.

### Location: `backend/data/`

| File | Records | Purpose |
|------|---------|---------|
| `role_skills_db.json` | **254 roles** | Skills needed for each career role (tech_skills + ai_tools with priority and where_to_learn) |
| `market_data.json` | **254 roles** | Salary ranges (LPA), demand level, AI automation risk, emerging roles |
| `zone_matrix.json` | **20 degrees × 254 roles** | Employer zone (Green/Amber/Red) and skill coverage % for each degree-role pair |
| `projects.json` | **189 roles** | Portfolio project suggestions per role (title, level, skills, hours, tools) |

### Location: `backend/data/mockRoles.js`

| File | Records | Purpose |
|------|---------|---------|
| `mockRoles.js` | **254 roles** | API-ready role objects with id, title, job_family, sector, salary, ai_exposure, skills |

---

## 5️⃣ Imported JSON Databases (Expanded Data)

These were **parsed from downloaded Kaggle/O*NET/NPTEL datasets**. They use the **same schema** as the company databases.

### Location: `backend/datasets/processed/`

| File | Records | Source | Purpose |
|------|---------|--------|---------|
| `new_roles_skills.json` | **923 roles** | O*NET (Skills.xlsx + Knowledge.xlsx + Technology Skills.xlsx) | Additional role-skill profiles |
| `new_market_data.json` | **20,709 roles** | Kaggle 97K Indian Jobs | Salary/demand data for new roles |
| `new_job_titles.json` | **53,561 titles** | Kaggle 97K + AI Jobs CSV | Job title autocomplete expansion |
| `new_courses.json` | **1,893 courses** | NPTEL course_extractions_20.json | Course catalog with URLs |
| `new_job_zones.json` | **923 roles** | O*NET Job Zones.xlsx | Job zone compatibility data |
| `new_fresher_market.json` | **1 role** | Kaggle Fresher Salary CSV | Fresher salary baselines |

### How Merging Works (`backend/dataLoader.js`)
```
At startup:
1. Load company database (254 roles)     ← ALWAYS takes priority
2. Load imported database (923+ roles)   ← Only adds NEW roles
3. Merge → Combined 1,177+ roles

Rule: If a role exists in BOTH, the company version is kept.
```

---

## 6️⃣ Frontend Static Data

### Location: `frontend/src/data/`

| File | Records | Purpose |
|------|---------|---------|
| `dropdownData.json` | **104 degrees, 27 job families** | Education taxonomy (UG/PG/PhD/Professional → Domain → Degree → Specializations) and job family listings |
| `jobRolesData.json` | **1,667 roles** | Job title → family mapping for autocomplete |
| `indianCities.json` | **102 cities** | Indian city names for location dropdowns |

---

## 7️⃣ AI Training Data (Records)

### Location: `backend/records/`

| File | Count | Purpose |
|------|-------|---------|
| `training_log.json` | **3 entries** (growing) | Every AI-generated career analysis is logged here as prompt→completion pairs for future model fine-tuning |
| `analysis_*.json` | **19 files** | Individual career analysis results saved per student |

### AI Training Data Format (JSONL for fine-tuning)
```jsonl
{"prompt": "Student degree: B.Tech CS | Target role: AI Engineer | Zone: Green | Missing: TensorFlow, PyTorch", "completion": "{...full career analysis JSON...}"}
```

### How Training Data is Collected
1. Student submits career profile → AI generates analysis
2. Analysis is saved to `training_log.json` as prompt/completion pair
3. Analysis is also saved as individual `analysis_*.json` file
4. When we reach **1,000+ entries**, we export to JSONL for model fine-tuning
5. Export script: `backend/dataset_builder/export_training_data.js`

### AI Training Data Roadmap
| Milestone | Entries Needed | Status |
|-----------|---------------|--------|
| Phase 1: Bootstrapping | 0-100 | ✅ 3 entries collected |
| Phase 2: Pattern validation | 100-500 | ⏳ Pending |
| Phase 3: Fine-tuning ready | 500-1,000 | ⏳ Pending |
| Phase 4: Custom model training | 1,000+ | ⏳ Pending |

---

## 8️⃣ Raw Downloaded Datasets (Local Only)

### Location: `backend/datasets/raw/` (in `.gitignore` — NOT pushed to git)

| File | Size | Source |
|------|------|--------|
| `indian-job-market-dataset-2025.xlsx` | 31 MB | Kaggle |
| `Skills.xlsx` | 3.4 MB | O*NET |
| `Knowledge.xlsx` | 3.4 MB | O*NET |
| `Technology Skills.xlsx` | 1.0 MB | O*NET |
| `Abilities.xlsx` | 5.0 MB | O*NET |
| `Job Zones.xlsx` | 39 KB | O*NET |
| `Job Zone Reference.xlsx` | 7 KB | O*NET |
| `Education, Training, and Experience.xlsx` | 2.0 MB | O*NET |
| `AISHE Final Report 2020-21.xlsx` | 909 KB | AISHE India |
| `Indian_Fresher_Salary_Skills_2025.csv` | 70 KB | Kaggle |
| `ai_jobs_market_2025_2026.csv` | 384 KB | Kaggle |
| `course_extractions_20.json` | 20 MB | Kaggle NPTEL |

These are the **source files** that were parsed into the processed JSON databases (Section 5).

---

## 📊 Total Data Summary

| Category | Count |
|----------|-------|
| Career Roles with Skills | **1,177** (254 company + 923 O*NET) |
| Market/Salary Entries | **20,963** (254 company + 20,709 Kaggle) |
| Job Titles | **55,228** (1,667 company + 53,561 Kaggle) |
| Degree Programs | **104** (UG: 36, PG: 34, PhD: 22, Professional: 12) |
| NPTEL Courses with URLs | **1,893** |
| Indian Cities | **102** |
| AI Training Entries | **3** (growing toward 1,000) |
| Individual Analysis Records | **19** |

---

## 🔌 API Endpoints for Data Access

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/roles` | GET | Original 254 mockRoles |
| `/api/expanded-roles` | GET | Merged 1,177 roles with skills |
| `/api/expanded-market` | GET | Merged 20,963 salary/demand entries |
| `/api/expanded-titles` | GET | Merged 55,228 job titles |
| `/api/courses` | GET | 1,893 NPTEL courses |
| `/api/data-stats` | GET | Summary counts for all databases |

---

## 🔑 Environment Variables

| Variable | Database | Required |
|----------|----------|----------|
| `DATABASE_URL` | PostgreSQL (Prisma) | ✅ Yes |
| `MONGO_URI` | MongoDB | ✅ Yes |
| `REDIS_URL` | Redis cache | ❌ Optional |
| `GROQ_API_KEY` | Groq AI API | ✅ Yes |
| `OPENROUTER_API_KEY` | OpenRouter AI API | ✅ Yes |
| `JWT_SECRET` | Auth tokens | ✅ Yes |
