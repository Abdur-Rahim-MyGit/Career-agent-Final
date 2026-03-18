# SMAART Career Intelligence Platform

The SMAART Career Intelligence Platform is a next-generation AI platform aimed at providing real-time career analytics, skill pathways, and highly contextual role matching for students.

It is built to operate efficiently and cost-effectively at massive scale (millions of users, specifically targeting the diverse Indian job market).

## Architecture & Tech Stack

To ensure system resilience and deterministic behaviors at runtime, the platform is divided into:

### 1. **Core Backend (Node.js, Express)**
Handles user authentication, rate limiting, deterministic rule-engine processing, and API routing.
- **Security:** JWT Authentication, Bcrypt Hashing, Helmet HTTP Headers.
- **Database:** Prisma ORM connected to PostgreSQL (for the relational Knowledge Graph). MongoDB (for unstructured analysis logs).

### 2. **ML Microservice (Python, Flask, Hugging Face)**
Handles the heavy NLP processing of student resumes using pre-trained AI language models.
- **Hugging Face (`sentence-transformers`):** Allows semantic, non-exact keyword matching (e.g. matching "crafted web apps" to "React" and "Node.js").
- **Predictive Matching:** XGBoost pipeline to rank the success probability of a student against a specific role.
- **Automated Data Scraping:** Includes a scraper system that pulls live market trends to prevent hardcoded bias.

### 3. **Frontend (React, Vite, Tailwind CSS)**
Provides an intuitive dashboard and real-time visualization (`Recharts`) of the student’s career roadmaps.

## 🚀 Getting Started (For Collaborators)

If you have just pulled or cloned this repository, follow these simple steps to get everything running locally on Windows:

### 1. Install Dependencies & Virtual Environment
We have provided a one-click setup script. Simply double-click `setup_windows.bat` or run the following commands manually:

```bash
# ML Service Setup
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Backend Setup
cd backend
npm install
cd ..

# Frontend Setup
cd frontend
npm install
cd ..
```

### 2. Launch the Platform
Once setup is complete, you can start all servers at once by double-clicking `start_windows.bat`.

Alternatively, manually run these commands in 3 separate terminals:

**Terminal 1 (ML Service):**
```bash
cd ml-service
.venv\Scripts\activate
python app.py
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 3 (Frontend):**
```bash
cd frontend
npm run dev
```

This will run the ML Service on port 5001, Backend on port 5000, and Frontend on port 5173.

*(For full Docker deployment instructions, see `How_To_Run_Guide.md`)*

## Production Roadmap
- **Sprint 3**: Continuous scraping cron jobs to automate job market research via Claude.
- **Sprint 4**: Admin Dashboard for Knowledge Graph verification.
- **Sprint 5**: Containerization via Docker for scaling on AWS/Vercel.
