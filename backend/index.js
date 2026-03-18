const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// 3. Main Onboarding Engine
app.post('/api/onboarding', async (req, res) => {
  try {
    const studentData = req.body;
    console.log('Processing Onboarding Data...');

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
      const finalRecord = { ...initialRecord, status: 'completed', output_generated_report: analysis };
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
      const mongoRecord = new CareerAnalysisModel({
        student_name: studentName,
        student_email: studentEmail,
        primary_role: primaryRole,
        input_data: studentData,
        output_data: analysis
      });
      await mongoRecord.save();
      console.log('✅ Analysis saved to MongoDB');
    } catch (mongoErr) {
      console.error('⚠️ Failed to save to MongoDB:', mongoErr.message);
    }

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

app.get('/api/roles', (req, res) => {
  res.json(roles);
});

app.get('/', (req, res) => {
  res.json({ message: 'SMAART Engine Active', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SMAART Backend running on http://localhost:${PORT}`);
});
