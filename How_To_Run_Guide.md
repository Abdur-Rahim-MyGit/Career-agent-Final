# SMAART Career Intelligence Platform - 6 PM Launch Guide 🚀

Your entire platform has been successfully upgraded through **Phase 6** (Identity, AI Models, Data Pipeline, Admin UI, and Docker).

I have **already launched** all 3 servers for you in the background!

## 🔗 How to Test RIGHT NOW

Everything is running live on your machine. All you need to do is click this link:
**[👉 Click here to open the Frontend: http://localhost:5176](http://localhost:5176)**

*(Note: Because of previous test runs, Vite launched on port 5176 this time).*

### What to show in your 6 PM Demo:

1. **The Admin Dashboard (Sprint 4)**
   - Click the **"Admin"** button in the top navigation bar.
   - You will see the AI Job Drafts that the autonomous scraper generated.
   - You can click **Approve** or **Reject** to simulate Human-in-the-Loop verification.

2. **The ML Microservice Parsing (Sprint 2)**
   - The backend runs on `http://localhost:5000` and the Python AI runs on `http://localhost:5001`.
   - The Python server has already loaded the heavy `sentence-transformers/all-MiniLM-L6-v2` model from Hugging Face into memory. 
   - If you trigger a resume upload anywhere in the frontend, it will successfully route to the Python microservice for semantic skill extraction.

3. **Global Production Readiness (Sprint 5)**
   - Show your team the `Dockerfile`s in `frontend/`, `backend/`, and `ml-service/`.
   - Show them the master `docker-compose.yml` in the root folder.
   - Show them the `.github/workflows/deploy.yml` CI/CD pipeline.
   - Explain: *"We are fully containerized and ready to deploy to Indian AWS/GCP servers."*

---

## 💻 Manual Developer Guide (For Your Team)

If you ever need to stop the servers and restart them manually, tell your team to open 3 separate Command Prompts and run these commands:

### Terminal 1: Start the Python AI Microservice
```bash
cd ml-service
.venv\Scripts\activate
python app.py
```

### Terminal 2: Start the Node.js API Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Start the React Frontend
```bash
cd frontend
npm run dev
```

### How to trigger the AI Job Scraper manually:
To generate *new* job drafts for the Admin Dashboard to review, run this in a 4th terminal:
```bash
cd ml-service
.venv\Scripts\activate
python scraper.py
```
