/**
 * SMAART Dataset Re-Parser — Fixed column names + NPTEL courses
 * Creates NEW files only. Does NOT modify existing company databases.
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'datasets', 'raw');
const OUT_DIR = path.join(__dirname, '..', 'datasets', 'processed');
const EXISTING_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const existingRoles = Object.keys(JSON.parse(fs.readFileSync(path.join(EXISTING_DIR, 'role_skills_db.json'), 'utf-8')));
const existingJobRoles = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'jobRolesData.json'), 'utf-8'));
const existingTitles = new Set(existingJobRoles.roles.map(r => r.role.toLowerCase().trim()));

console.log(`Existing roles: ${existingRoles.length} | Existing titles: ${existingTitles.size}\n`);

// ── Family guesser ──
const FAMILY_KEYWORDS = {
  'Information Technology': ['software','developer','programmer','devops','cloud','data scientist','data analyst','data engineer','machine learning','ai ','frontend','backend','full stack','web','mobile','android','ios','cyber','blockchain','python','java ','javascript','react','node','qa ','testing','selenium','scrum','sap ','erp','it ','tech lead','architect'],
  'BFSI': ['bank','finance','investment','insurance','accountant','auditor','actuari','loan','credit','treasury','wealth','stock','trading','mutual fund','chartered','ca ','cfo','financial'],
  'Healthcare & Pharma': ['doctor','nurse','pharmac','medical','health','clinical','dental','physio','hospital','radiol','patholog','surgeon','anesthes','dermat','cardio','neuro','ayurved','homeopath'],
  'Engineering & Manufacturing': ['mechanical','civil','electrical','chemical','industrial','manufacturing','production','quality','plant','maintenance','design engineer','automobile','structural','metallurg','mining','petroleum','textile'],
  'Education & Research': ['teacher','professor','lecturer','trainer','tutor','academic','research','education','school','college','faculty','librarian','principal','counselor'],
  'Government & Public Sector': ['ias','ips','government','public','civil service','municipal','revenue','defense','military','navy','army','air force','police'],
  'Legal': ['lawyer','advocate','legal','attorney','judge','paralegal','litigation','compliance','arbitr'],
  'Media & Communication': ['journalist','editor','writer','content','media','broadcast','anchor','reporter','publisher','author','copywriter','public relation'],
  'Sales, Marketing & Retail': ['sales','marketing','retail','brand','digital marketing','seo','sem','advertising','e-commerce','merchandis','store manager','customer','crm','business development','bd ','bdm'],
  'Human Resources': ['hr ','human resource','recruit','talent','payroll','compensation','employee','workforce','staffing'],
  'Supply Chain & Logistics': ['supply chain','logistics','warehouse','procurement','inventory','transport','shipping','freight','distribution'],
  'Construction & Real Estate': ['construction','architect','real estate','property','surveyor','building','interior','urban plan'],
  'Agriculture & Food': ['agri','farm','food','crop','dairy','fishery','horticultur','veterinary','nutrition','forestry'],
  'Hospitality & Tourism': ['hotel','tourism','hospitality','chef','restaurant','travel','event','catering'],
  'Energy & Environment': ['energy','solar','wind','petroleum','oil','gas','environment','sustainability','renewable','power'],
  'Design & Creative': ['graphic','ui ','ux ','design','creative','animation','illustrat','visual','photograp','video','motion graphic','art director'],
  'Consulting & Strategy': ['consult','analyst','strategy','management consult','business analyst','advisory'],
  'Aviation & Aerospace': ['pilot','aviation','aerospace','aircraft','flight','airport'],
  'Telecom & Networking': ['telecom','5g','networking','fiber','rf ','wireless'],
};

function guessFamily(title, skills = '') {
  const text = ` ${title} ${skills} `.toLowerCase();
  for (const [family, keywords] of Object.entries(FAMILY_KEYWORDS)) {
    for (const kw of keywords) { if (text.includes(kw)) return family; }
  }
  return 'Information Technology';
}

function guessAiRisk(title) {
  const lower = title.toLowerCase();
  const highRisk = ['data entry','clerk','typist','cashier','receptionist','telemarket','call center','transcription','bookkeep','teller','operator','peon'];
  const lowRisk = ['surgeon','nurse','therapist','counselor','psycholog','teacher','professor','artist','musician','chef','plumber','electrician','mechanic','doctor'];
  for (const k of highRisk) if (lower.includes(k)) return 'High';
  for (const k of lowRisk) if (lower.includes(k)) return 'Low';
  return 'Medium';
}

// ─────────────────────────────────────────────
// 1. Re-parse indian-job-market-dataset-2025.xlsx with correct columns
// ─────────────────────────────────────────────
console.log('📦 [1/3] Parsing indian-job-market-dataset-2025.xlsx...');
const kagglePath = path.join(RAW_DIR, 'indian-job-market-dataset-2025.xlsx');
if (fs.existsSync(kagglePath)) {
  const wb = XLSX.readFile(kagglePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`   ${rows.length} rows | Columns: ${Object.keys(rows[0]).join(', ')}`);

  const titleMap = {};
  const marketMap = {};

  for (const row of rows) {
    // Correct column names from actual data
    const title = (row.title || '').trim();
    const skills = (row.tagsAndSkills || '').toString();
    const company = (row.companyName || '').trim();
    const location = (row.location || '').trim();
    const minSal = parseFloat(row.minimumSalary || 0) / 100000; // Convert to LPA
    const maxSal = parseFloat(row.maximumSalary || 0) / 100000;

    if (!title || title.length < 2) continue;

    const key = title.toLowerCase().trim();
    const family = guessFamily(title, skills);

    // New job titles
    if (!existingTitles.has(key) && !titleMap[key]) {
      titleMap[key] = { role: title, family };
    }

    // Market data aggregation
    if (!marketMap[title]) marketMap[title] = { salaries: [], companies: new Set(), locations: new Set(), skills: new Set() };
    if (minSal > 0) marketMap[title].salaries.push({ min: minSal, max: maxSal || minSal * 1.5 });
    if (company) marketMap[title].companies.add(company);
    if (location) marketMap[title].locations.add(location);
    if (skills) skills.split(',').forEach(s => { if (s.trim()) marketMap[title].skills.add(s.trim()); });
  }

  // Save new job titles
  const newTitles = Object.values(titleMap);
  
  // Also load AI jobs titles from previous run
  const aiJobsPath = path.join(RAW_DIR, 'ai_jobs_market_2025_2026.csv');
  if (fs.existsSync(aiJobsPath)) {
    const aiWb = XLSX.readFile(aiJobsPath);
    const aiRows = XLSX.utils.sheet_to_json(aiWb.Sheets[aiWb.SheetNames[0]]);
    for (const row of aiRows) {
      const t = (row['Job Title'] || row.title || row.job_title || '').trim();
      if (!t) continue;
      const k = t.toLowerCase().trim();
      if (!existingTitles.has(k) && !titleMap[k]) {
        titleMap[k] = { role: t, family: guessFamily(t, (row.Skills || row.skills || '').toString()) };
        newTitles.push(titleMap[k]);
      }
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'new_job_titles.json'), JSON.stringify({ roles: newTitles }, null, 2));
  console.log(`   ✅ new_job_titles.json: ${newTitles.length} NEW unique titles`);

  // Save new market data (only roles NOT in existing)
  const newMarket = {};
  for (const [title, d] of Object.entries(marketMap)) {
    if (existingRoles.includes(title)) continue;
    if (d.salaries.length === 0) continue;
    const mins = d.salaries.map(s => s.min);
    const maxs = d.salaries.map(s => s.max);
    newMarket[title] = {
      demand_level: d.salaries.length > 100 ? 'High' : d.salaries.length > 20 ? 'Medium' : 'Low',
      salary_min_lpa: Math.round(Math.min(...mins)),
      salary_max_lpa: Math.round(Math.max(...maxs)),
      ai_automation_risk: guessAiRisk(title),
      emerging_roles: Array.from(d.skills).slice(0, 3),
      hiring_companies: Array.from(d.companies).slice(0, 5),
      locations: Array.from(d.locations).slice(0, 5)
    };
  }
  fs.writeFileSync(path.join(OUT_DIR, 'new_market_data.json'), JSON.stringify(newMarket, null, 2));
  console.log(`   ✅ new_market_data.json: ${Object.keys(newMarket).length} roles with salary/demand data`);
} else { console.log('   ⏭ File not found'); }

// ─────────────────────────────────────────────
// 2. Parse NPTEL courses JSON (20MB unzipped)
// ─────────────────────────────────────────────
console.log('\n📦 [2/3] Parsing NPTEL course_extractions_20.json...');
const coursePath = path.join(RAW_DIR, 'course_extractions_20.json');
if (fs.existsSync(coursePath)) {
  const raw = fs.readFileSync(coursePath, 'utf-8');
  let data;
  try { data = JSON.parse(raw); } catch(e) { console.log(`   ❌ JSON parse error: ${e.message}`); data = null; }
  
  if (data) {
    const items = Array.isArray(data) ? data : (data.courses || data.data || Object.values(data));
    console.log(`   Found ${items.length} course entries`);
    
    // Examine first item to understand structure
    if (items.length > 0) {
      console.log(`   First item keys: ${Object.keys(items[0]).join(', ')}`);
    }

    const courses = {};
    for (const c of items) {
      const name = (c.course_name || c.name || c.title || c.courseName || c.Course || '').trim();
      const url = (c.url || c.course_url || c.link || c.courseUrl || c.URL || '').trim();
      const instructor = (c.instructor || c.faculty || c.prof || c.Professor || c.instructor_name || '').trim();
      const institute = (c.institute || c.institution || c.college || c.Institute || '').trim();
      const duration = (c.duration || c.weeks || c.Duration || '').toString();
      const discipline = (c.discipline || c.subject || c.category || c.Discipline || c.Department || '').trim();

      if (!name || name.length < 3) continue;
      courses[name] = {
        course_name: name,
        platform: 'NPTEL',
        instructor: instructor || 'IIT/IISc Faculty',
        institute: institute || '',
        duration_weeks: parseInt(duration) || 8,
        url: url || 'https://nptel.ac.in/courses',
        discipline: discipline || '',
        free: true,
        certification: true
      };
    }
    fs.writeFileSync(path.join(OUT_DIR, 'new_courses.json'), JSON.stringify(courses, null, 2));
    console.log(`   ✅ new_courses.json: ${Object.keys(courses).length} courses`);
  }
} else { console.log('   ⏭ File not found (need to unzip first)'); }

// ─────────────────────────────────────────────
// 3. Parse Indian_Fresher_Salary_Skills_2025.csv with correct columns
// ─────────────────────────────────────────────
console.log('\n📦 [3/3] Parsing Indian_Fresher_Salary_Skills_2025.csv...');
const fresherPath = path.join(RAW_DIR, 'Indian_Fresher_Salary_Skills_2025.csv');
if (fs.existsSync(fresherPath)) {
  const wb = XLSX.readFile(fresherPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`   ${rows.length} rows | Columns: ${Object.keys(rows[0]).join(', ')}`);
  
  const fresherData = {};
  for (const row of rows) {
    const title = (row['Job Role'] || row['Job_Role'] || row.role || row['Job Title'] || Object.values(row)[0] || '').trim();
    const salary = parseFloat(row['Salary (LPA)'] || row['Annual_Salary_LPA'] || row.salary || row['Salary_LPA'] || 0);
    const skills = (row['Key Skills'] || row['Skills_Required'] || row.skills || row['Key_Skills'] || '').toString();
    const location = (row['Location'] || row['City'] || row.location || '').trim();
    const company = (row['Company'] || row['Company_Name'] || row.company || '').trim();

    if (!title) continue;
    if (!fresherData[title]) fresherData[title] = { salaries: [], skills: new Set(), locations: new Set(), companies: new Set() };
    if (salary > 0) fresherData[title].salaries.push(salary);
    if (skills) skills.split(/[,|;]/).forEach(s => { if (s.trim()) fresherData[title].skills.add(s.trim()); });
    if (location) fresherData[title].locations.add(location);
    if (company) fresherData[title].companies.add(company);
  }

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
} else { console.log('   ⏭ File not found'); }

// ── FINAL SUMMARY ──
console.log('\n════════════════════════════════════════════');
console.log('  ✅ ALL PARSING COMPLETE');
console.log('  Existing company databases: UNTOUCHED');
console.log('════════════════════════════════════════════');
const outFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.json'));
let totalEntries = 0;
for (const f of outFiles) {
  const size = fs.statSync(path.join(OUT_DIR, f)).size;
  const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf-8'));
  const count = data.roles ? data.roles.length : Object.keys(data).length;
  totalEntries += count;
  console.log(`   ${f}: ${count} entries (${(size / 1024).toFixed(1)} KB)`);
}
console.log(`\n   TOTAL NEW ENTRIES: ${totalEntries}`);
