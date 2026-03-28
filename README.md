# SMAART Career Intelligence Platform

The SMAART Career Intelligence Platform is a next-generation AI platform aimed at providing real-time career analytics, skill pathways, and highly contextual role matching for students.

It is built to operate efficiently and cost-effectively at massive scale (millions of users, specifically targeting the diverse Indian job market).

## 📊 Platform Data Coverage

| Metric | Count |
|--------|-------|
| Career Roles with Skills | **1,177** |
| Job Titles (Autocomplete) | **55,228** |
| Salary/Market Entries | **20,963** |
| Degree Programs | **104** |
| NPTEL Courses with URLs | **1,893** |
| Indian Cities | **102** |
| Job Families/Sectors | **27** |

## Architecture & Tech Stack

### 1. **Core Backend (Node.js, Express)**

Handles user authentication, rate limiting, deterministic rule-engine processing, and API routing.

- **Security:** JWT Authentication, Bcrypt Hashing, Helmet HTTP Headers.
- **Database:** Prisma ORM connected to PostgreSQL (for the relational Knowledge Graph). MongoDB (for unstructured analysis logs). Redis (optional caching).

### 2. **ML Microservice (Python, Flask, Hugging Face)**

Handles the heavy NLP processing of student resumes using pre-trained AI language models.

- **Hugging Face (`sentence-transformers`):** Allows semantic, non-exact keyword matching (e.g. matching "crafted web apps" to "React" and "Node.js").
- **Predictive Matching:** XGBoost pipeline to rank the success probability of a student against a specific role.
- **Automated Data Scraping:** Includes a scraper system that pulls live market trends.

### 3. **Frontend (React, Vite)**

Provides an intuitive dashboard and real-time visualization (`Recharts`) of the student's career roadmaps.

## 🗄️ Databases

The platform uses **8 types of databases**. See [`SMAART_Database_Guide.md`](SMAART_Database_Guide.md) for the complete schema documentation.

| Type | Technology | Purpose |
|------|-----------|---------|
| Relational | PostgreSQL (Prisma) | Users, roles, skills, student profiles |
| Document | MongoDB | Career analysis logs (unstructured) |
| Cache | Redis (optional) | API response caching |
| Company Data | JSON files (`backend/data/`) | 254 curated career roles — **DO NOT EDIT** |
| Imported Data | JSON files (`backend/datasets/processed/`) | 78K+ entries from Kaggle/O*NET/NPTEL |
| Frontend Data | JSON files (`frontend/src/data/`) | Dropdowns, cities, job titles |
| Training Data | JSON files (`backend/records/`) | AI model fine-tuning logs |
| Raw Sources | xlsx/csv (`backend/datasets/raw/`) | Downloaded source files (not in git) |

### AI Training Data Pipeline

Every career analysis generates a training entry in `backend/records/training_log.json`. When we reach 1,000+ entries, we export to JSONL format for custom model fine-tuning.

```
Student submits profile → AI generates analysis → Saved to training_log.json
                                                 → Saved as analysis_*.json
                                                 → At 1,000+ entries → Export to JSONL
                                                 → Fine-tune custom SMAART AI model
```

**Key rule:** All data is served from internal databases. AI is only used for generating recommendations and learning path links — not for data storage.

## 🚀 Getting Started (For Collaborators)

If you have just pulled or cloned this repository, follow these simple steps to get everything running locally on Windows.

> We provide **two batch scripts** so you can get up and running with a single double-click:
>
> | Script | Purpose |
> |--------|---------|
> | [`setup_windows.bat`](setup_windows.bat) | **One-time setup** — installs Python venv, pip packages, Node modules, and runs Prisma generate |
> | [`start_windows.bat`](start_windows.bat) | **Daily launcher** — opens 3 terminal windows for ML Service, Backend, and Frontend |

### 1. Install Dependencies & Virtual Environment

Double-click **`setup_windows.bat`** or run the following commands manually:

```bash
# ML Service Setup (Python)
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt      # see ml-service/requirements.txt
cd ..

# Backend Setup (Node.js)
cd backend
npm install
npx prisma generate
cd ..

# Frontend Setup (React / Vite)
cd frontend
npm install
cd ..
```

> **Tip:** A consolidated [`requirements.txt`](requirements.txt) at the project root lists every dependency across all three services for quick reference.

### 2. Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/smaart
MONGO_URI=mongodb://localhost:27017/smaart
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_jwt_secret
```

> `setup_windows.bat` will auto-copy `.env.example → .env` if the file is missing.

### 3. Launch the Platform

Once setup is complete, double-click **`start_windows.bat`** to start all 3 servers simultaneously in separate terminal windows.

Alternatively, manually run these commands in 3 separate terminals:

**Terminal 1 (ML Service — Port 5001):**

```bash
cd ml-service
.venv\Scripts\activate
python app.py
```

**Terminal 2 (Backend — Port 5000):**

```bash
cd backend
npm run dev
```

**Terminal 3 (Frontend — Port 5173):**

```bash
cd frontend
npm run dev
```

## 📁 Key Documentation Files

| File | Purpose |
|------|---------|
| [`requirements.txt`](requirements.txt) | Consolidated platform dependency list (Python + Node.js) |
| [`ml-service/requirements.txt`](ml-service/requirements.txt) | Python/ML pip dependencies (Flask, PyTorch, HuggingFace, XGBoost) |
| [`setup_windows.bat`](setup_windows.bat) | One-click dependency installer for Windows |
| [`start_windows.bat`](start_windows.bat) | One-click platform launcher for Windows |
| [`SMAART_Database_Guide.md`](SMAART_Database_Guide.md) | Complete database schemas and architecture |
| [`SMAART_Data_Import_Format_Guide.md`](SMAART_Data_Import_Format_Guide.md) | Exact JSON formats for data import |
| [`SMAART_Dataset_Download_Guide.md`](SMAART_Dataset_Download_Guide.md) | Where to download additional datasets |
| [`SMAART_AI_Dataset_Strategy.md`](SMAART_AI_Dataset_Strategy.md) | AI model training pipeline |
| [`SMAART_Technical_Architecture.md`](SMAART_Technical_Architecture.md) | System architecture and API documentation |

## Production Roadmap

- **Sprint 3**: Continuous scraping cron jobs to automate job market research.
- **Sprint 4**: Admin Dashboard for Knowledge Graph verification.
- **Sprint 5**: Containerization via Docker for scaling on AWS/Vercel.
- **Sprint 6**: Custom AI model training with 1,000+ student entries.
