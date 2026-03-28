const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const RECORDS_DIR = path.join(__dirname, 'records');
if (!fs.existsSync(RECORDS_DIR)) fs.mkdirSync(RECORDS_DIR, { recursive: true });

const { roles } = require('./data/mockRoles');
const { generateCareerIntelligence } = require('./services/aiService');
const { processCareerIntelligence } = require('./engine');
const dataLoader = require('./dataLoader');
const { initializeDB, executeQuery } = require('./db');
const { connectMongoDB, CareerAnalysisModel } = require('./mongoDb');

dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Redis (optional — app works without it) ──────────────────────────────────
let redisClient = null;
try {
  const { createClient } = require('redis');
  redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.on('error', () => { redisClient = null; }); // silent — Redis is optional
  redisClient.connect().catch(() => { redisClient = null; });
} catch (e) { /* Redis not installed or not running — app continues fine */ }

async function getCached(key) {
  if (!redisClient) return null;
  try { return await redisClient.get(key); } catch { return null; }
}
async function setCached(key, value, ttlSeconds = 3600) {
  if (!redisClient) return;
  try { await redisClient.set(key, value, { EX: ttlSeconds }); } catch {}
}

const PORT = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// ── Strict rate-limiter for auth endpoints (5 req / 60s per IP) ──
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts. Please wait 60 seconds.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Input validation helpers ──
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"'`;(){}]/g, '');
}
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}
function validatePassword(p) {
  if (typeof p !== 'string' || p.length < 8) return 'Password must be at least 8 characters';
  if (p.length > 128) return 'Password must be under 128 characters';
  return null;
}

initializeDB();
connectMongoDB();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = sanitize(req.body.name || '');
    const email = sanitize(req.body.email || '').toLowerCase();
    const password = req.body.password || '';
    const role = sanitize(req.body.role || 'STUDENT');

    // ── Validation ──
    if (!name || name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    const pwdErr = validatePassword(password);
    if (pwdErr) return res.status(400).json({ error: pwdErr });
    if (!['STUDENT', 'ADMIN', 'PO'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'An account with this email already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({ data: { name, email, passwordHash, role } });

    // ── Auto-login: return JWT so frontend can sign in immediately ──
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
    );
    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const email = sanitize(req.body.email || '').toLowerCase();
    const password = req.body.password || '';

    // ── Validation ──
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
    );
    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    // ── DB unavailable — fall back to demo mode ──
    console.error('Login DB error (falling back to demo):', err.message);
    const email = sanitize(req.body.email || '').toLowerCase();
    const password = req.body.password || '';
    if (isValidEmail(email) && password.length >= 8) {
      // Smart role detection for demo mode
      const demoRole = email.includes('admin') || email.includes('po') || email.includes('placement') ? 'ADMIN' : 'STUDENT';
      const demoUser = { id: 'demo_' + Date.now(), name: email.split('@')[0], email, role: demoRole };
      const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      console.log('⚠️  DB unavailable — demo login for', email);
      return res.json({ message: 'Logged in (demo mode)', token, user: demoUser, demo: true });
    }
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// ── Session validation (used by AuthContext on page refresh) ──
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    // Demo-mode users have IDs starting with 'demo_' — return JWT data directly
    if (String(req.user.id).startsWith('demo_')) {
      return res.json({ user: { id: req.user.id, name: req.user.id.replace('demo_','user_'), email: '', role: req.user.role || 'STUDENT' } });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    // DB error — if JWT has role, return it anyway
    if (req.user && req.user.id) {
      return res.json({ user: { id: req.user.id, name: 'User', email: '', role: req.user.role || 'STUDENT' } });
    }
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

app.post('/api/admin/generate-role', authMiddleware, async (req, res) => {
  const { roleTitle } = req.body;
  const prompt = `Generate a detailed career role profile for "${roleTitle}" in JSON format.`;
  try {
    const intelligence = await generateCareerIntelligence(prompt);
    const cleanJson = intelligence.replace(/```json|```/g, '').trim();
    res.json({ status: 'success', data: JSON.parse(cleanJson) });
  } catch (err) {
    res.status(500).json({ error: 'AI Generation failed', details: err.message });
  }
});

const axios = require('axios');

app.post('/api/parse-resume', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });
  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/parse-resume', { text: resumeText });
    res.json(mlResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to communicate with ML Service' });
  }
});

// ── Career News (Groq AI — personalized per user interest) ─────────────────
app.post('/api/career-news', async (req, res) => {
  const { interest } = req.body;
  const cacheKey = `career_news_${(interest || 'general').toLowerCase().replace(/\s+/g, '_')}`;

  // Check Redis cache first (1-hour TTL)
  const cached = await getCached(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  try {
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) return res.json({ news: [], source: 'no_api_key' });

    const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: 'You generate realistic Indian job market news items. Return ONLY a JSON array of 6 objects with keys: source (string — real publication name like "LinkedIn", "India Today", "The Hindu", "Economic Times", "Naukri", "X (Twitter)"), icon (emoji), title (1-line headline), url (real URL to that publication\'s jobs/careers section), tag (short category), tagColor (hex color).'
      }, {
        role: 'user',
        content: `Generate 6 current Indian job market news headlines relevant to someone interested in "${interest || 'technology'}". Include: hiring trends, layoff news, skill demand changes, government policies, and salary updates. Make them realistic for March 2026 India.`
      }],
      temperature: 0.8,
      max_tokens: 1200,
    }, { headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' } });

    const raw = groqRes.data.choices?.[0]?.message?.content || '[]';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const news = JSON.parse(cleaned);
    const result = { news, source: 'groq_ai', generatedAt: new Date().toISOString() };
    await setCached(cacheKey, JSON.stringify(result), 3600); // 1-hour cache
    res.json(result);
  } catch (err) {
    console.error('Career news generation failed:', err.message);
    res.json({ news: [], source: 'error', error: err.message });
  }
});

// ── Save News Item for Training Dataset ────────────────────────────────────
app.post('/api/save-news-training', async (req, res) => {
  try {
    const entry = { ...req.body, savedAt: new Date().toISOString() };
    const logPath = path.join(RECORDS_DIR, 'training_news_log.json');
    let existing = [];
    try { existing = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch {}
    existing.push(entry);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
    res.json({ saved: true, total: existing.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save', details: err.message });
  }
});

app.post('/api/predict-success', async (req, res) => {
  const { features } = req.body;
  if (!features) return res.status(400).json({ error: 'Missing features array' });
  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/predict-success', { features });
    res.json(mlResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to communicate with ML Service' });
  }
});

function makeProfileHash(studentData) {
  const key = JSON.stringify({
    education: studentData.education,
    preferences: studentData.preferences,
    skills: (studentData.skills || []).map(s => s.name || s).sort()
  });
  return crypto.createHash('sha256').update(key).digest('hex');
}

function findCachedRecord(hash) {
  try {
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
      if (data.profile_hash === hash) return data;
    }
  } catch (e) {}
  return null;
}

function buildTrainingPrompt(studentData, preVerified) {
  return `Student degree: ${studentData.education?.degreeGroup || 'Unknown'} | Target role: ${studentData.preferences?.primary?.jobRole || 'Unknown'} | Zone: ${preVerified?.primaryZone?.employer_zone || 'Unknown'} | Missing: ${(preVerified?.primarySkillGap?.missing || []).join(', ')} | Generate career path:`;
}

function logTrainingData(traceId, studentData, analysis, preVerified) {
  try {
    const logFile = path.join(RECORDS_DIR, 'training_log.json');
    let log = [];
    if (fs.existsSync(logFile)) {
      try { log = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch(e) { log = []; }
    }
    log.push({
      id: traceId,
      timestamp: new Date().toISOString(),
      prompt: buildTrainingPrompt(studentData, preVerified),
      completion: typeof analysis === 'object' ? JSON.stringify(analysis) : analysis,
      zone: preVerified?.primaryZone?.employer_zone || 'Unknown',
      degree: studentData.education?.degreeGroup || 'Unknown',
      role: studentData.preferences?.primary?.jobRole || 'Unknown',
      rating: null,
      is_synthetic: false
    });
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  } catch (e) {}
}

app.post('/api/onboarding', async (req, res) => {
  try {
    const studentData = req.body;
    console.log('Processing Onboarding Data...');

    const profileHash = makeProfileHash(studentData);
    const cached = findCachedRecord(profileHash);
    if (cached) {
      return res.json({ success: true, cached: true, analysisId: cached.traceId, data: cached });
    }

    const traceId = Date.now();
    const recordFilename = `analysis_${traceId}_${(studentData.name || 'unknown').replace(/\s+/g, '_')}.json`;
    const recordPath = path.join(RECORDS_DIR, recordFilename);
    const initialRecord = {
      timestamp: new Date().toISOString(),
      status: 'pending_analysis',
      input_user_data: studentData,
      output_generated_report: null,
      traceId
    };
    try { fs.writeFileSync(recordPath, JSON.stringify(initialRecord, null, 2)); } catch {}

    let analysis;
    try {
      analysis = await processCareerIntelligence(studentData);
      const finalRecord = { ...initialRecord, status: 'completed', output_data: analysis, output_generated_report: analysis, profile_hash: profileHash, created_at: new Date().toISOString() };
      fs.writeFileSync(recordPath, JSON.stringify(finalRecord, null, 2));
      console.log(`✅ Trace [${traceId}]: Analysis complete`);
    } catch (procErr) {
      const errorRecord = { ...initialRecord, status: 'failed', error: procErr.message };
      fs.writeFileSync(recordPath, JSON.stringify(errorRecord, null, 2));
      throw procErr;
    }

    const studentName = studentData.name || studentData.personalDetails?.name || 'Unknown';
    const studentEmail = studentData.email || studentData.personalDetails?.email || 'Unknown';
    const primaryRole = studentData.preferences?.primary?.jobRole || studentData.preferences?.primary?.role || 'Career Match';

    try {
      await executeQuery(
        `INSERT INTO career_analyses (student_name, student_email, primary_role, input_data, output_data) VALUES ($1, $2, $3, $4, $5)`,
        [studentName, studentEmail, primaryRole, JSON.stringify(studentData), JSON.stringify(analysis)]
      );
    } catch {}

    try {
      const pv = analysis.preVerified || {};
      const mongoRecord = new CareerAnalysisModel({
        student_name: studentName, student_email: studentEmail, primary_role: primaryRole,
        input_data: studentData, output_data: analysis, profile_hash: profileHash,
        college_code: req.body.collegeCode,
        zone_primary: pv?.primaryZone?.employer_zone || 'Unknown',
        zone_secondary: pv?.secondaryZone?.employer_zone || 'Unknown',
        zone_tertiary: pv?.tertiaryZone?.employer_zone || 'Unknown',
        missing_skills: pv?.primarySkillGap?.missing || [],
        matched_skills: pv?.primarySkillGap?.matched || [],
        skill_coverage_pct: pv?.primarySkillGap?.coveragePct || 0,
      });
      await mongoRecord.save();
    } catch {}

    logTrainingData(traceId, studentData, analysis, analysis.preVerified || null);

    res.json({ success: true, analysisId: String(traceId), status: 'success', analysis });
  } catch (err) {
    console.error('Error in onboarding:', err);
    res.status(500).json({ error: 'Career analysis failed', details: err.message });
  }
});

app.get('/api/admin/drafts', (req, res) => {
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    try { res.json(JSON.parse(fs.readFileSync(draftsPath, 'utf-8'))); } catch { res.json([]); }
  } else { res.json([]); }
});

app.post('/api/admin/drafts/approve', (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    res.json({ success: true });
  } else { res.status(404).json({ error: 'No drafts found' }); }
});

app.post('/api/admin/drafts/reject', (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    res.json({ success: true });
  } else { res.status(404).json({ error: 'No drafts found' }); }
});

app.get('/api/dashboard/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
        if (String(data.traceId) === id || String(data.id) === id || file.includes(id)) {
          return res.json({ success: true, source: 'local', data });
        }
      } catch {}
    }
    const result = await executeQuery('SELECT * FROM career_analyses WHERE id = $1', [id]);
    if (result && result.length > 0) return res.json({ success: true, source: 'postgres', data: result[0] });
    return res.status(404).json({ success: false, message: 'Analysis not found' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { analysisId, rating, comment } = req.body;
    if (!analysisId || !rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'analysisId and rating (1-5) required' });
    const feedbackFile = path.join(RECORDS_DIR, 'feedback.json');
    let feedbacks = [];
    if (fs.existsSync(feedbackFile)) { try { feedbacks = JSON.parse(fs.readFileSync(feedbackFile, 'utf8')); } catch {} }
    feedbacks.push({ analysisId, rating, comment: comment || '', timestamp: new Date().toISOString() });
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));
    try {
      const logFile = path.join(RECORDS_DIR, 'training_log.json');
      if (fs.existsSync(logFile)) {
        let log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        const idx = log.findIndex(e => String(e.id) === String(analysisId));
        if (idx !== -1) { log[idx].rating = rating; fs.writeFileSync(logFile, JSON.stringify(log, null, 2)); }
      }
    } catch {}
    res.json({ success: true, message: 'Feedback saved' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/po/:collegeCode/dashboard', async (req, res) => {
  try {
    const { collegeCode } = req.params;
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    const students = [];
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
        if (data.collegeCode === collegeCode || data.college_code === collegeCode) students.push(data);
      } catch {}
    }
    const zones = { Green: 0, Amber: 0, Red: 0 };
    const directions = {};
    students.forEach(s => {
      const z = s.preVerified?.primaryZone?.employer_zone || 'Amber';
      if (zones[z] !== undefined) zones[z]++;
      const role = s.preferences?.primary?.jobRole || 'Unknown';
      directions[role] = (directions[role] || 0) + 1;
    });
    res.json({ success: true, collegeCode, totalStudents: students.length, zones, directions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/market-insights', async (req, res) => {
  try {
    const cached = await getCached('market_insights');
    if (cached) return res.json(JSON.parse(cached));
    const mdPath = path.join(__dirname, 'data', 'market_data.json');
    if (!fs.existsSync(mdPath)) return res.json({ topDemand: [], topPaying: [], highRisk: [], lowRisk: [], totalRoles: 0 });
    const md = JSON.parse(fs.readFileSync(mdPath, 'utf8'));
    const topDemand = Object.entries(md).filter(([,v]) => v.demand_level === 'High').sort((a,b) => b[1].salary_max_lpa - a[1].salary_max_lpa).slice(0,10).map(([role,data]) => ({ role, ...data }));
    const topPaying = Object.entries(md).sort((a,b) => b[1].salary_max_lpa - a[1].salary_max_lpa).slice(0,10).map(([role,data]) => ({ role, ...data }));
    const highRisk = Object.entries(md).filter(([,v]) => v.ai_automation_risk === 'High').slice(0,10).map(([role,data]) => ({ role, ...data }));
    const lowRisk = Object.entries(md).filter(([,v]) => v.ai_automation_risk === 'Low').sort((a,b) => b[1].salary_max_lpa - a[1].salary_max_lpa).slice(0,10).map(([role,data]) => ({ role, ...data }));
    const result = { topDemand, topPaying, highRisk, lowRisk, totalRoles: Object.keys(md).length };
    await setCached('market_insights', JSON.stringify(result), 3600);
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/roles', async (req, res) => {
  const cached = await getCached('all_roles');
  if (cached) return res.json(JSON.parse(cached));
  await setCached('all_roles', JSON.stringify(roles), 3600);
  res.json(roles);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.json({ message: 'SMAART Engine Active', status: 'running' }));

// ── Expanded Dataset API Endpoints (merged company + imported data) ──
// All data from databases — no AI calls

app.get('/api/expanded-roles', async (req, res) => {
  try {
    const cached = await getCached('expanded_roles');
    if (cached) return res.json(JSON.parse(cached));
    const data = dataLoader.getRoleSkillsDB();
    await setCached('expanded_roles', JSON.stringify(data), 7200);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/expanded-market', async (req, res) => {
  try {
    const cached = await getCached('expanded_market');
    if (cached) return res.json(JSON.parse(cached));
    const data = dataLoader.getMarketData();
    await setCached('expanded_market', JSON.stringify(data), 7200);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/expanded-titles', async (req, res) => {
  try {
    const cached = await getCached('expanded_titles');
    if (cached) return res.json(JSON.parse(cached));
    const data = dataLoader.getJobTitles();
    await setCached('expanded_titles', JSON.stringify(data), 7200);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/courses', async (req, res) => {
  try {
    const cached = await getCached('all_courses');
    if (cached) return res.json(JSON.parse(cached));
    const data = dataLoader.getCourses();
    await setCached('all_courses', JSON.stringify(data), 7200);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/data-stats', (req, res) => {
  try {
    const roleSkills = dataLoader.getRoleSkillsDB();
    const market = dataLoader.getMarketData();
    const titles = dataLoader.getJobTitles();
    const courses = dataLoader.getCourses();
    const degreeCount = dataLoader.getDegreeCount();
    
    res.json({
      totalRolesWithSkills: Object.keys(roleSkills).length,
      totalMarketEntries: Object.keys(market).length,
      totalJobTitles: titles.roles.length,
      totalCourses: Object.keys(courses).length,
      totalDegrees: degreeCount,
      dataSource: 'Internal databases (company + imported datasets)',
      lastUpdated: new Date().toISOString()
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log(`🚀 SMAART Backend running on http://localhost:${PORT}`);
});
