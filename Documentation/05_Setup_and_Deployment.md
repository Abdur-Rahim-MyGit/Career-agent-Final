# 05 - Environment Setup & Deployment Protocols

## Step 1: Environment Variables
The root of the repository requires specific environment variables to interface with databases, auth layers, and the AI Data generation scripts.

We are awaiting the `.env` file from the user to finalize this structure. Expected keys include:
```env
# Database Connections
DATABASE_URL="postgresql://user:pass@host:5432/smaart_db"
MONGO_URI="mongodb+srv://user:pass@cluster..."

# Authentication
JWT_SECRET="your_very_secure_string_here"

# Artificial Intelligence (Build Phase & Admin Fallback)
ANTHROPIC_API_KEY="sk-ant-api..."
OPENROUTER_API_KEY="sk-or-v1-..."

# ML Service Internal Network
ML_SERVICE_URL="http://localhost:8000"
```

## Step 2: Backend Installation
Navigate to `/backend`:
```bash
cd backend
npm install
# Assuming Prisma is used for PostgreSQL
npx prisma generate
npx prisma db push
npm run dev
```

## Step 3: Frontend Installation
Navigate to `/frontend`:
```bash
cd frontend
npm install
npm run dev
```

## Step 4: Python ML Service Installation
Navigate to `/ml-service`:
```bash
cd ml-service
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Step 5: Data Seeding
Before the Rule Engine can function locally, you MUST populate the local database with the generated Knowledge Graph.
```bash
cd backend
node scripts/seed.js
```
