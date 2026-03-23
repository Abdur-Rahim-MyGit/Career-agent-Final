/**
 * SMAART Dataset Parser — Converts downloaded raw datasets into new JSON databases
 * 
 * RULE: This script creates NEW files only. It does NOT modify existing company databases.
 * 
 * Input:  backend/datasets/raw/*.xlsx, *.csv
 * Output: backend/datasets/processed/*.json (same schema as existing databases)
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'datasets', 'raw');
const OUT_DIR = path.join(__dirname, '..', 'datasets', 'processed');
const EXISTING_DIR = path.join(__dirname, '..', 'data');

// Ensure output dir exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Load existing data to avoid duplicates
const existingRoles = Object.keys(JSON.parse(fs.readFileSync(path.join(EXISTING_DIR, 'role_skills_db.json'), 'utf-8')));
const existingJobRoles = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'jobRolesData.json'), 'utf-8'));
const existingTitles = new Set(existingJobRoles.roles.map(r => r.role.toLowerCase()));

console.log(`\n=== SMAART Dataset Parser ===`);
console.log(`Existing roles: ${existingRoles.length}`);
console.log(`Existing job titles: ${existingTitles.size}`);
console.log(`Raw files directory: ${RAW_DIR}\n`);

// ─────────────────────────────────────────────
// 1. Parse indian-job-market-dataset-2025.xlsx (97K+ jobs)
// ─────────────────────────────────────────────
function parseKaggle97K() {
  const filePath = path.join(RAW_DIR, 'indian-job-market-dataset-2025.xlsx');
  if (!fs.existsSync(filePath)) { console.log('⏭  Skipping: indian-job-market-dataset-2025.xlsx not found'); return; }

  console.log('📦 Parsing indian-job-market-dataset-2025.xlsx (97K jobs)...');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);
  console.log(`   Found ${rows.length} rows`);

  // Extract unique job titles with family
  const titleMap = {};
  const salaryMap = {};

  for (const row of rows) {
    const title = (row['Job Title'] || row['job_title'] || row['Role'] || row['role'] || '').trim();
    const company = (row['Company'] || row['company_name'] || row['Company Name'] || '').trim();
    const location = (row['Location'] || row['location'] || row['Job Location'] || '').trim();
    const skills = (row['Key Skills'] || row['skills'] || row['Skills Required'] || row['key_skills'] || '').toString();
    const salaryStr = (row['Salary'] || row['salary'] || row['Salary Range'] || row['salary_range'] || '').toString();
    const experience = (row['Experience'] || row['experience'] || row['Experience Required'] || '').toString();
    
    if (!title || title.length < 2) continue;

    // Determine family from title/skills
    const family = guessFamily(title, skills);
    const key = title.toLowerCase();

    if (!existingTitles.has(key) && !titleMap[key]) {
      titleMap[key] = { role: title, family };
    }

    // Extract salary data
    const salary = parseSalary(salaryStr);
    if (salary && title) {
      if (!salaryMap[title]) salaryMap[title] = { salaries: [], locations: new Set(), companies: new Set(), skills: new Set() };
      if (salary.min) salaryMap[title].salaries.push(salary);
      if (location) salaryMap[title].locations.add(location);
      if (company) salaryMap[title].companies.add(company);
      if (skills) skills.split(/[,|;]/).forEach(s => { if (s.trim()) salaryMap[title].skills.add(s.trim()); });
    }
  }

  // Save new job titles
  const newTitles = Object.values(titleMap);
  const newJobRoles = { roles: newTitles };
  fs.writeFileSync(path.join(OUT_DIR, 'new_job_titles.json'), JSON.stringify(newJobRoles, null, 2));
  console.log(`   ✅ new_job_titles.json: ${newTitles.length} new unique titles (excluded ${existingTitles.size} existing)`);

  // Save new market data (aggregated salary/demand)
  const newMarketData = {};
  for (const [title, data] of Object.entries(salaryMap)) {
    if (existingRoles.includes(title)) continue; // Don't duplicate existing
    if (data.salaries.length === 0) continue;

    const mins = data.salaries.map(s => s.min).filter(Boolean);
    const maxs = data.salaries.map(s => s.max).filter(Boolean);
    
    newMarketData[title] = {
      demand_level: data.salaries.length > 50 ? 'High' : data.salaries.length > 10 ? 'Medium' : 'Low',
      salary_min_lpa: mins.length ? Math.round(Math.min(...mins)) : 3,
      salary_max_lpa: maxs.length ? Math.round(Math.max(...maxs)) : 12,
      ai_automation_risk: guessAiRisk(title),
      emerging_roles: Array.from(data.skills).slice(0, 3),
      hiring_companies: Array.from(data.companies).slice(0, 5),
      locations: Array.from(data.locations).slice(0, 5)
    };
  }
  fs.writeFileSync(path.join(OUT_DIR, 'new_market_data.json'), JSON.stringify(newMarketData, null, 2));
  console.log(`   ✅ new_market_data.json: ${Object.keys(newMarketData).length} new roles with salary/demand data`);
}

// ─────────────────────────────────────────────
// 2. Parse O*NET Skills.xlsx + Knowledge.xlsx + Abilities.xlsx + Technology Skills.xlsx
// ─────────────────────────────────────────────
function parseONET() {
  const skillsPath = path.join(RAW_DIR, 'Skills.xlsx');
  const knowledgePath = path.join(RAW_DIR, 'Knowledge.xlsx');
  const techSkillsPath = path.join(RAW_DIR, 'Technology Skills.xlsx');

  if (!fs.existsSync(skillsPath)) { console.log('⏭  Skipping: O*NET Skills.xlsx not found'); return; }

  console.log('📦 Parsing O*NET files (Skills, Knowledge, Technology Skills)...');

  // Parse Skills
  const skillsWb = XLSX.readFile(skillsPath);
  const skillsRows = XLSX.utils.sheet_to_json(skillsWb.Sheets[skillsWb.SheetNames[0]]);
  console.log(`   Skills.xlsx: ${skillsRows.length} rows`);

  // Parse Knowledge
  let knowledgeRows = [];
  if (fs.existsSync(knowledgePath)) {
    const knowledgeWb = XLSX.readFile(knowledgePath);
    knowledgeRows = XLSX.utils.sheet_to_json(knowledgeWb.Sheets[knowledgeWb.SheetNames[0]]);
    console.log(`   Knowledge.xlsx: ${knowledgeRows.length} rows`);
  }

  // Parse Technology Skills
  let techRows = [];
  if (fs.existsSync(techSkillsPath)) {
    const techWb = XLSX.readFile(techSkillsPath);
    techRows = XLSX.utils.sheet_to_json(techWb.Sheets[techWb.SheetNames[0]]);
    console.log(`   Technology Skills.xlsx: ${techRows.length} rows`);
  }

  // Group by occupation
  const occupations = {};

  // Process skills
  for (const row of skillsRows) {
    const title = (row['Title'] || row['O*NET-SOC Title'] || '').trim();
    const skill = (row['Element Name'] || row['Skill'] || '').trim();
    const importance = parseFloat(row['Data Value'] || row['Importance'] || 0);
    const scaleId = (row['Scale ID'] || '').trim();
    
    if (!title || !skill) continue;
    if (scaleId && scaleId !== 'IM') continue; // Only importance ratings
    if (existingRoles.includes(title)) continue;

    if (!occupations[title]) occupations[title] = { tech_skills: [], ai_tools: [] };
    const priority = importance >= 4 ? 'CRITICAL' : importance >= 3 ? 'HIGH' : importance >= 2 ? 'MEDIUM' : 'LOW';
    
    if (!occupations[title].tech_skills.find(s => s.skill_name === skill)) {
      occupations[title].tech_skills.push({
        skill_name: skill,
        priority,
        where_to_learn: suggestLearning(skill)
      });
    }
  }

  // Process technology skills
  for (const row of techRows) {
    const title = (row['Title'] || row['O*NET-SOC Title'] || '').trim();
    const tool = (row['Example'] || row['Commodity Title'] || row['Technology'] || '').trim();
    
    if (!title || !tool || existingRoles.includes(title)) continue;
    if (!occupations[title]) occupations[title] = { tech_skills: [], ai_tools: [] };

    if (isAiTool(tool) && !occupations[title].ai_tools.find(t => t.tool_name === tool)) {
      occupations[title].ai_tools.push({
        tool_name: tool,
        used_for: `Technology tool used in ${title}`,
        priority: 'MEDIUM',
        where_to_learn: 'Official documentation / YouTube tutorials'
      });
    } else if (!occupations[title].tech_skills.find(s => s.skill_name === tool)) {
      occupations[title].tech_skills.push({
        skill_name: tool,
        priority: 'MEDIUM',
        where_to_learn: suggestLearning(tool)
      });
    }
  }

  // Sort skills by priority and limit to top 10
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  for (const role of Object.values(occupations)) {
    role.tech_skills.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    role.tech_skills = role.tech_skills.slice(0, 12);
    role.ai_tools = role.ai_tools.slice(0, 4);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'new_roles_skills.json'), JSON.stringify(occupations, null, 2));
  console.log(`   ✅ new_roles_skills.json: ${Object.keys(occupations).length} new roles with skill profiles`);
}

// ─────────────────────────────────────────────
// 3. Parse Indian_Fresher_Salary_Skills_2025.csv
// ─────────────────────────────────────────────
function parseFresherData() {
  const filePath = path.join(RAW_DIR, 'Indian_Fresher_Salary_Skills_2025.csv');
  if (!fs.existsSync(filePath)) { console.log('⏭  Skipping: Indian_Fresher_Salary_Skills_2025.csv not found'); return; }

  console.log('📦 Parsing Indian_Fresher_Salary_Skills_2025.csv...');
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`   Found ${rows.length} rows`);

  const fresherData = {};
  for (const row of rows) {
    const title = (row['Job Role'] || row['role'] || row['Job Title'] || '').trim();
    const salary = parseFloat(row['Salary (LPA)'] || row['Annual Salary (LPA)'] || row['salary'] || 0);
    const skills = (row['Skills Required'] || row['skills'] || row['Key Skills'] || '').toString();
    const location = (row['Location'] || row['City'] || '').trim();
    const company = (row['Company'] || row['company'] || '').trim();

    if (!title) continue;
    if (!fresherData[title]) fresherData[title] = { salaries: [], skills: new Set(), locations: new Set(), companies: new Set() };
    if (salary) fresherData[title].salaries.push(salary);
    if (skills) skills.split(/[,|;]/).forEach(s => { if (s.trim()) fresherData[title].skills.add(s.trim()); });
    if (location) fresherData[title].locations.add(location);
    if (company) fresherData[title].companies.add(company);
  }

  // Convert to market_data format
  const fresherMarket = {};
  for (const [title, d] of Object.entries(fresherData)) {
    if (existingRoles.includes(title)) continue;
    fresherMarket[title] = {
      demand_level: d.salaries.length > 20 ? 'High' : d.salaries.length > 5 ? 'Medium' : 'Low',
      salary_min_lpa: d.salaries.length ? Math.round(Math.min(...d.salaries)) : 3,
      salary_max_lpa: d.salaries.length ? Math.round(Math.max(...d.salaries)) : 8,
      ai_automation_risk: guessAiRisk(title),
      emerging_roles: Array.from(d.skills).slice(0, 3),
      hiring_companies: Array.from(d.companies).slice(0, 5),
      locations: Array.from(d.locations).slice(0, 5),
      experience_level: 'Fresher'
    };
  }
  fs.writeFileSync(path.join(OUT_DIR, 'new_fresher_market.json'), JSON.stringify(fresherMarket, null, 2));
  console.log(`   ✅ new_fresher_market.json: ${Object.keys(fresherMarket).length} fresher roles`);
}

// ─────────────────────────────────────────────
// 4. Parse ai_jobs_market_2025_2026.csv
// ─────────────────────────────────────────────
function parseAiJobsMarket() {
  const filePath = path.join(RAW_DIR, 'ai_jobs_market_2025_2026.csv');
  if (!fs.existsSync(filePath)) { console.log('⏭  Skipping: ai_jobs_market_2025_2026.csv not found'); return; }

  console.log('📦 Parsing ai_jobs_market_2025_2026.csv...');
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`   Found ${rows.length} rows`);

  const aiJobTitles = {};
  for (const row of rows) {
    const title = (row['Job Title'] || row['job_title'] || row['Role'] || '').trim();
    const salary = (row['Salary'] || row['salary'] || row['Salary Range'] || '').toString();
    const skills = (row['Skills'] || row['skills'] || row['Key Skills'] || row['Skills Required'] || '').toString();
    const location = (row['Location'] || row['location'] || '').trim();

    if (!title) continue;
    const key = title.toLowerCase();
    if (!existingTitles.has(key)) {
      aiJobTitles[key] = { role: title, family: guessFamily(title, skills) };
    }
  }

  // Append to the new_job_titles.json if it exists, otherwise create
  const existingNewPath = path.join(OUT_DIR, 'new_job_titles.json');
  let combined = { roles: [] };
  if (fs.existsSync(existingNewPath)) {
    combined = JSON.parse(fs.readFileSync(existingNewPath, 'utf-8'));
  }
  const existingNewTitles = new Set(combined.roles.map(r => r.role.toLowerCase()));
  
  let addedCount = 0;
  for (const [key, val] of Object.entries(aiJobTitles)) {
    if (!existingNewTitles.has(key)) {
      combined.roles.push(val);
      addedCount++;
    }
  }
  fs.writeFileSync(existingNewPath, JSON.stringify(combined, null, 2));
  console.log(`   ✅ Added ${addedCount} AI/tech job titles → new_job_titles.json (total: ${combined.roles.length})`);
}

// ─────────────────────────────────────────────
// 5. Parse O*NET Job Zones for zone mapping
// ─────────────────────────────────────────────
function parseJobZones() {
  const filePath = path.join(RAW_DIR, 'Job Zones.xlsx');
  if (!fs.existsSync(filePath)) { console.log('⏭  Skipping: Job Zones.xlsx not found'); return; }

  console.log('📦 Parsing O*NET Job Zones...');
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`   Found ${rows.length} rows`);

  const zoneMapping = {};
  for (const row of rows) {
    const title = (row['Title'] || row['O*NET-SOC Title'] || '').trim();
    const zone = parseInt(row['Job Zone'] || row['Zone'] || 0);
    const education = (row['Education'] || row['Typical Education'] || '').trim();

    if (!title || existingRoles.includes(title)) continue;
    zoneMapping[title] = {
      job_zone: zone,
      education_required: education,
      employer_zone: zone >= 4 ? 'Green' : zone >= 3 ? 'Amber' : 'Red',
      skill_coverage_pct: zone >= 4 ? 60 : zone >= 3 ? 40 : 20
    };
  }

  fs.writeFileSync(path.join(OUT_DIR, 'new_job_zones.json'), JSON.stringify(zoneMapping, null, 2));
  console.log(`   ✅ new_job_zones.json: ${Object.keys(zoneMapping).length} roles with zone data`);
}

// ─────────────────────────────────────────────
// 6. Parse course_extractions_20.json.zip (NPTEL courses)
// ─────────────────────────────────────────────
function parseCourses() {
  const zipPath = path.join(RAW_DIR, 'course_extractions_20.json.zip');
  const jsonPath = path.join(RAW_DIR, 'course_extractions_20.json');

  // Check if unzipped JSON exists
  let data;
  if (fs.existsSync(jsonPath)) {
    console.log('📦 Parsing course_extractions_20.json...');
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } else if (fs.existsSync(zipPath)) {
    console.log('📦 course_extractions_20.json.zip found — please unzip first, then rerun');
    console.log('   Run: Expand-Archive -Path "' + zipPath + '" -DestinationPath "' + RAW_DIR + '"');
    return;
  } else {
    console.log('⏭  Skipping: No NPTEL course data found');
    return;
  }

  const courses = {};
  const items = Array.isArray(data) ? data : (data.courses || data.data || [data]);
  
  for (const course of items) {
    const name = (course.course_name || course.name || course.title || '').trim();
    const url = (course.url || course.course_url || course.link || '').trim();
    const instructor = (course.instructor || course.faculty || course.prof || '').trim();
    const institute = (course.institute || course.institution || course.college || '').trim();
    const duration = (course.duration || course.weeks || '').toString();
    const discipline = (course.discipline || course.subject || course.category || '').trim();

    if (!name) continue;
    courses[name] = {
      course_name: name,
      platform: 'NPTEL',
      instructor: instructor || 'IIT Faculty',
      institute: institute || '',
      duration_weeks: parseInt(duration) || 8,
      url: url || `https://nptel.ac.in/courses`,
      discipline: discipline || '',
      free: true,
      certification: true
    };
  }

  fs.writeFileSync(path.join(OUT_DIR, 'new_courses.json'), JSON.stringify(courses, null, 2));
  console.log(`   ✅ new_courses.json: ${Object.keys(courses).length} courses with URLs`);
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

const FAMILY_KEYWORDS = {
  'Information Technology': ['software','developer','programmer','engineer','devops','cloud','data','machine learning','ai ','frontend','backend','full stack','web','mobile','android','ios','cyber','blockchain','python','java ','javascript','react','node','database','network','sysadmin','it ','tech','qa ','testing','selenium','agile','scrum'],
  'BFSI': ['bank','finance','investment','insurance','accountant','auditor','actuari','loan','credit','treasury','wealth','stock','trading','mutual fund','chartered','ca '],
  'Healthcare & Pharma': ['doctor','nurse','pharmac','medical','health','clinical','dental','physio','hospital','radiol','patholog','surgeon','anesthes','dermat','cardio','neuro'],
  'Engineering & Manufacturing': ['mechanical','civil','electrical','chemical','industrial','manufacturing','production','quality','plant','maintenance','design engineer','automobile','structural'],
  'Education & Research': ['teacher','professor','lecturer','trainer','tutor','academic','research','education','school','college','faculty','librarian'],
  'Government & Public Sector': ['ias ','ips ','government','public','civil service','municipal','revenue','defense','military','navy','army','air force','police'],
  'Legal': ['lawyer','advocate','legal','attorney','judge','paralegal','law ','litigation','compliance','arbitr'],
  'Media & Communication': ['journalist','editor','writer','content','media','broadcast','anchor','reporter','publisher','author','copywriter','pr ','public relation'],
  'Sales, Marketing & Retail': ['sales','marketing','retail','brand','digital marketing','seo','sem','advertising','e-commerce','merchandis','store manager','customer','crm'],
  'Human Resources': ['hr ','human resource','recruit','talent','payroll','compensation','benefit','employee','workforce','staffing'],
  'Supply Chain & Logistics': ['supply chain','logistics','warehouse','procurement','inventory','transport','shipping','freight','distribution'],
  'Construction & Real Estate': ['construction','architect','real estate','property','surveyor','building','interior','urban planning'],
  'Agriculture & Food': ['agri','farm','food','crop','dairy','fishery','horticultur','veterinary','nutrition','forestry'],
  'Hospitality & Tourism': ['hotel','tourism','hospitality','chef','restaurant','travel','event','catering','concierge'],
  'Energy & Environment': ['energy','solar','wind','petroleum','oil','gas','environment','sustainability','renewable','power'],
  'Design & Creative': ['graphic','ui','ux','design','creative','animation','illustrat','visual','photograp','video','motion graphic','art director'],
  'Consulting & Strategy': ['consult','analyst','strategy','management consult','business analyst','advisory'],
  'Aviation & Aerospace': ['pilot','aviation','aerospace','aircraft','flight','airport'],
  'Telecom & Networking': ['telecom','5g','networking','fiber','rf ','wireless','tower'],
};

function guessFamily(title, skills = '') {
  const text = `${title} ${skills}`.toLowerCase();
  for (const [family, keywords] of Object.entries(FAMILY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return family;
    }
  }
  return 'Information Technology';
}

function guessAiRisk(title) {
  const lower = title.toLowerCase();
  const highRisk = ['data entry','clerk','typist','cashier','receptionist','telemarket','call center','transcription','bookkeep','teller'];
  const lowRisk = ['surgeon','nurse','therapist','counselor','psycholog','teacher','professor','artist','musician','chef','plumber','electrician','mechanic'];
  for (const k of highRisk) if (lower.includes(k)) return 'High';
  for (const k of lowRisk) if (lower.includes(k)) return 'Low';
  return 'Medium';
}

function parseSalary(str) {
  if (!str || str === 'Not Disclosed' || str === 'N/A') return null;
  const nums = str.match(/[\d.]+/g);
  if (!nums || nums.length === 0) return null;
  const values = nums.map(Number).filter(n => n > 0 && n < 200);
  if (values.length >= 2) return { min: Math.min(...values), max: Math.max(...values) };
  if (values.length === 1) return { min: values[0], max: values[0] * 1.5 };
  return null;
}

function suggestLearning(skill) {
  const lower = skill.toLowerCase();
  if (lower.includes('python') || lower.includes('java') || lower.includes('javascript')) return 'freeCodeCamp / Coursera (free audit)';
  if (lower.includes('sql') || lower.includes('database')) return 'W3Schools / Khan Academy (free)';
  if (lower.includes('excel') || lower.includes('microsoft')) return 'Microsoft Learn (free)';
  if (lower.includes('communication') || lower.includes('writing')) return 'Coursera free audit / LinkedIn Learning';
  if (lower.includes('management') || lower.includes('leadership')) return 'Coursera free audit / NPTEL';
  return 'NPTEL / Coursera free audit / YouTube tutorials';
}

function isAiTool(name) {
  const lower = name.toLowerCase();
  return lower.includes('ai') || lower.includes('copilot') || lower.includes('chatgpt') || lower.includes('machine learning') || lower.includes('tensorflow') || lower.includes('pytorch');
}

// ─────────────────────────────────────────────
// RUN ALL PARSERS
// ─────────────────────────────────────────────
console.log('════════════════════════════════════════════');
console.log('  Starting dataset parsing...');
console.log('════════════════════════════════════════════\n');

try { parseKaggle97K(); } catch (e) { console.log(`❌ Error parsing Kaggle 97K: ${e.message}`); }
console.log('');
try { parseONET(); } catch (e) { console.log(`❌ Error parsing O*NET: ${e.message}`); }
console.log('');
try { parseFresherData(); } catch (e) { console.log(`❌ Error parsing Fresher data: ${e.message}`); }
console.log('');
try { parseAiJobsMarket(); } catch (e) { console.log(`❌ Error parsing AI Jobs: ${e.message}`); }
console.log('');
try { parseJobZones(); } catch (e) { console.log(`❌ Error parsing Job Zones: ${e.message}`); }
console.log('');
try { parseCourses(); } catch (e) { console.log(`❌ Error parsing Courses: ${e.message}`); }

console.log('\n════════════════════════════════════════════');
console.log('  ✅ All parsing complete!');
console.log(`  Output directory: ${OUT_DIR}`);
console.log('  Existing company databases: UNTOUCHED');
console.log('════════════════════════════════════════════\n');

// Print summary
const outFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.json'));
console.log('📊 Generated files:');
for (const f of outFiles) {
  const size = fs.statSync(path.join(OUT_DIR, f)).size;
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf-8'));
  const count = data.roles ? data.roles.length : Object.keys(data).length;
  console.log(`   ${f}: ${count} entries (${(size / 1024).toFixed(1)} KB)`);
}
