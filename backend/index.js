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
// records dir
const RECORDS_DIR = path.join(__dirname, 'records');
if (!fs.existsSync(RECORDS_DIR)) fs.mkdirSync(RECORDS_DIR, { recursive: true });

const { roles } = require('./data/mockRoles');
const { generateCareerIntelligence } = require('./services/aiService');
const { processCareerIntelligence } = require('./engine');
const { initializeDB, executeQuery } = require('./db');
const { connectMongoDB, CareerAnalysisModel } = require('./mongoDb');

dotenv.config();

// Prisma Client for Auth
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors());
app.use(express.json());

// Rate Limiting to prevent DDoS and scraping
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for dev testing
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter specifically to API routes
app.use('/api/', apiLimiter);

// Initialize Databases
initializeDB();
connectMongoDB();

// --- API ROUTES ---

// Auth Middleware
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

// 0. Authentication (Register / Login)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'STUDENT'
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Validate password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    // Create and assign token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// 1. AI Intelligence Generation (Admin Only)
app.post('/api/admin/generate-role', async (req, res) => {
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

// 2. ML Microservice Gateway: Resume Parser & Predictive ML
app.post('/api/parse-resume', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });
  
  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/parse-resume', {
      text: resumeText
    });
    res.json(mlResponse.data);
  } catch (err) {
    console.error(`ML Parse Error: ${err.message}`);
    res.status(500).json({ error: 'Failed to communicate with ML Service' });
  }
});

app.post('/api/predict-success', async (req, res) => {
  const { features } = req.body;
  if (!features) return res.status(400).json({ error: 'Missing features array' });
  
  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/predict-success', {
      features: features
    });
    res.json(mlResponse.data);
  } catch (err) {
    console.error(`ML Prediction Error: ${err.message}`);
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

function logTrainingData(traceId, studentData, analysis, preVerified) {
  try {
    const logFile = path.join(RECORDS_DIR, 'training_log.json');
    let log = [];
    if (fs.existsSync(logFile)) {
      try { log = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch(e) { log = []; }
    }
    const entry = {
      id: traceId,
      timestamp: new Date().toISOString(),
      prompt: buildTrainingPrompt(studentData, preVerified),
      completion: typeof analysis === 'object' ? analysis.tab4CareerPath || JSON.stringify(analysis) : analysis,
      zone: preVerified?.primaryZone?.employer_zone || 'Unknown',
      degree: studentData.education?.degreeGroup || 'Unknown',
      role: studentData.preferences?.primary?.jobRole || 'Unknown',
      rating: null,       // filled later by /api/feedback
      is_synthetic: false
    };
    log.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('[TRAINING LOG ERROR - non-fatal]', e.message);
    // NEVER throw — this must not fail the main response
  }
}

function buildTrainingPrompt(studentData, preVerified) {
  return `Student degree: ${studentData.education?.degreeGroup || 'Unknown'} | Domain: ${studentData.education?.domain || 'Unknown'} | Target role: ${studentData.preferences?.primary?.jobRole || 'Unknown'} | Skills: ${(studentData.skills || []).map(s => s.name || s).join(', ')} | Zone: ${preVerified?.primaryZone?.employer_zone || 'Unknown'} | Missing: ${(preVerified?.primarySkillGap?.missing || []).join(', ')} | Generate career path:`;
}

// 3. Main Onboarding Engine
app.post('/api/onboarding', async (req, res) => {
  try {
    const studentData = req.body;
    console.log('Processing Onboarding Data...');

    const profileHash = makeProfileHash(studentData);
    const cached = findCachedRecord(profileHash);
    if (cached) {
      console.log('[CACHE HIT] Returning cached result for hash:', profileHash.slice(0, 8));
      return res.json({ success: true, cached: true, data: cached });
    }

    // --- IMMEDIATE Safety Fallback: Save user input draft ---
    const recordsDir = path.join(__dirname, 'records');
    if (!fs.existsSync(recordsDir)) fs.mkdirSync(recordsDir);
    const traceId = Date.now();
    const recordFilename = `analysis_${traceId}_${studentData.personalDetails?.name?.replace(/\s+/g, '_') || 'unknown'}.json`;
    const recordPath = path.join(recordsDir, recordFilename);
    const initialRecord = {
      timestamp: new Date().toISOString(),
      status: 'pending_analysis',
      input_user_data: studentData,
      output_generated_report: null
    };
    try {
      fs.writeFileSync(recordPath, JSON.stringify(initialRecord, null, 2));
      console.log(`📡 Trace [${traceId}]: User data captured locally.`);
    } catch (fsErr) {
      console.error('⚠️ Critical: Failed to save initial safety copy:', fsErr.message);
    }

    // Process using the intelligence engine
    let analysis;
    try {
      analysis = await processCareerIntelligence(studentData);
      
      // Update record with analysis
      const finalRecord = {
        ...initialRecord,
        status: 'completed',
        output_generated_report: analysis,
        profile_hash: profileHash,
        created_at: new Date().toISOString()
      };
      fs.writeFileSync(recordPath, JSON.stringify(finalRecord, null, 2));
      console.log(`✅ Trace [${traceId}]: Analysis appended to record.`);
    } catch (procErr) {
      console.error(`❌ Trace [${traceId}]: Analysis failed, record remains as-is.`, procErr.message);
      const errorRecord = { ...initialRecord, status: 'failed', error: procErr.message };
      fs.writeFileSync(recordPath, JSON.stringify(errorRecord, null, 2));
      throw procErr; // Rethrow to let the main catch handle it
    }

    // Save to Databases
    const studentName = studentData.personalDetails?.name || 'Unknown User';
    const studentEmail = studentData.personalDetails?.email || 'Unknown Email';
    const primaryRole = studentData.preferences?.primary?.role || 'Career Match';

    // Save to PostgreSQL
    const pgQuery = `
      INSERT INTO career_analyses (student_name, student_email, primary_role, input_data, output_data)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;
    const pgParams = [
      studentName,
      studentEmail,
      primaryRole,
      JSON.stringify(studentData),
      JSON.stringify(analysis)
    ];
    try {
      await executeQuery(pgQuery, pgParams);
      console.log('✅ Analysis saved to PostgreSQL');
    } catch (pgErr) {
      console.error('⚠️ Failed to save to PostgreSQL:', pgErr.message);
    }

    // Save to MongoDB
    try {
      const preVerifiedData = analysis.preVerified || {};
      const analysisResult = analysis.analysis || analysis;

      const mongoRecord = new CareerAnalysisModel({
        student_name: studentName,
        student_email: studentEmail,
        primary_role: primaryRole,
        input_data: studentData,
        output_data: analysis,
        profile_hash: profileHash,
        college_code: req.body.collegeCode,
        zone_primary: preVerifiedData?.primaryZone?.employer_zone || 'Unknown',
        zone_secondary: preVerifiedData?.secondaryZone?.employer_zone || 'Unknown',
        zone_tertiary: preVerifiedData?.tertiaryZone?.employer_zone || 'Unknown',
        missing_skills: preVerifiedData?.primarySkillGap?.missing || [],
        matched_skills: preVerifiedData?.primarySkillGap?.matched || [],
        skill_coverage_pct: preVerifiedData?.primarySkillGap?.coveragePct || 0,
        path_text: analysisResult?.tab4CareerPath || '',
        future_scope_text: analysisResult?.tab5FutureScope || ''
      });
      await mongoRecord.save();
      console.log('✅ Analysis saved to MongoDB');
    } catch (mongoErr) {
      console.error('⚠️ Failed to save to MongoDB:', mongoErr.message);
    }

    logTrainingData(traceId, studentData, analysis.analysis || analysis, analysis.preVerified || null);

    res.json({
      status: 'success',
      recommendations: {
        primary: studentData.preferences.primary.role || 'Career Match',
        secondary: studentData.preferences.secondary.role || 'Secondary Path',
        tertiary: studentData.preferences.tertiary.role || 'Alternative Option'
      },
      analysis
    });
  } catch (err) {
    console.error('Error in onboarding:', err);
    res.status(500).json({ error: 'Career analysis failed', details: err.message });
  }
});

// --- ADMIN DRAFTS ENDPOINTS ---
app.get('/api/admin/drafts', (req, res) => {
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    try {
      const data = fs.readFileSync(draftsPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch(e) {
      res.json([]);
    }
  } else {
    res.json([]);
  }
});

app.post('/api/admin/drafts/approve', (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    console.log(`✅ Admin approved draft ${id}. Moved to Knowledge Graph.`);
    res.json({ success: true, message: "Draft approved." });
  } else {
    res.status(404).json({ error: "No drafts found" });
  }
});

app.post('/api/admin/drafts/reject', (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    console.log(`❌ Admin rejected draft ${id}. Deleted.`);
    res.json({ success: true, message: "Draft rejected." });
  } else {
    res.status(404).json({ error: "No drafts found" });
  }
});

app.get('/api/dashboard/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Step 1: Search /records folder
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
      if (data.id === id || data.analysisId === id || file.includes(id)) {
        return res.json({ success: true, source: 'local', data });
      }
    }
    // Step 2: Fallback to PostgreSQL
    const result = await executeQuery('SELECT * FROM career_analyses WHERE id = $1', [id]);
    if (result && result.length > 0) {
      return res.json({ success: true, source: 'postgres', data: result[0] });
    }
    return res.status(404).json({ success: false, message: 'Analysis not found' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { analysisId, rating, comment } = req.body;
    if (!analysisId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'analysisId and rating (1-5) required' });
    }
    
    // Save to feedback.json
    const feedbackFile = path.join(RECORDS_DIR, 'feedback.json');
    let feedbacks = [];
    if (fs.existsSync(feedbackFile)) {
      try { feedbacks = JSON.parse(fs.readFileSync(feedbackFile, 'utf8')); } catch(e) {}
    }
    feedbacks.push({ analysisId, rating, comment: comment || '', timestamp: new Date().toISOString() });
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));

    // Update training_log entry with rating
    try {
      const logFile = path.join(RECORDS_DIR, 'training_log.json');
      if (fs.existsSync(logFile)) {
        let log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        const idx = log.findIndex(e => e.id === analysisId);
        if (idx !== -1) { log[idx].rating = rating; fs.writeFileSync(logFile, JSON.stringify(log, null, 2)); }
      }
    } catch(e) {} // non-fatal

    res.json({ success: true, message: 'Feedback saved' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/po/:collegeCode/dashboard', async (req, res) => {
  try {
    const { collegeCode } = req.params;
    // Read all records and filter by collegeCode
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    const students = [];
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
        if (data.collegeCode === collegeCode || data.college_code === collegeCode) students.push(data);
      } catch(e) {}
    }
    // Build analytics
    const zones = { Green: 0, Amber: 0, Red: 0 };
    const directions = {};
    const locations = {};
    students.forEach(s => {
      const z = s.preVerified?.primaryZone?.employer_zone || 'Amber';
      if (zones[z] !== undefined) zones[z]++;
      const role = s.preferences?.primary?.jobRole || 'Unknown';
      directions[role] = (directions[role] || 0) + 1;
    });
    res.json({ success: true, collegeCode, totalStudents: students.length, zones, directions, students: students.map(s => ({ id: s.id || s.analysisId, name: s.name, zone: s.preVerified?.primaryZone?.employer_zone, lastActive: s.created_at })) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/roles', (req, res) => {
  res.json(roles);
});

app.get('/', (req, res) => {
  res.json({ message: 'SMAART Engine Active', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SMAART Backend running on http://localhost:${PORT}`);
});
