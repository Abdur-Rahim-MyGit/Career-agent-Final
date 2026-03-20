const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const KEY = process.env.GROQ_API_KEY;
const OUTPUT = path.join(__dirname, '..', 'data', 'zone_matrix.json');
const ROLE_DB_PATH = path.join(__dirname, '..', 'data', 'role_skills_db.json');
const DEGREES_XLS = path.join(__dirname, '..', '..', 'india_degrees_by_level.xlsx');

// Load roles
const roleDB = JSON.parse(fs.readFileSync(ROLE_DB_PATH, 'utf8'));
const ALL_ROLES = Object.keys(roleDB);

// Read degrees correctly from all 4 content sheets, column index 1 (Degree Group / Full Name), skip first 3 rows
const wb = xlsx.readFile(DEGREES_XLS);
const DEGREE_SHEETS = ['Undergraduate (UG)', 'Postgraduate (PG)', 'Doctoral (PhD-Research)', 'Professional-Integrated'];
const allDegrees = [];
for (const sheetName of DEGREE_SHEETS) {
  const ws = wb.Sheets[sheetName];
  if (!ws) continue;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
  for (let i = 3; i < rows.length; i++) {
    const val = rows[i][1];
    if (val && String(val).trim()) allDegrees.push(String(val).trim());
  }
}

// Use the 20 most important degrees for students — covers 95% of use cases
const DEGREES = [
  'Bachelor of Technology',
  'Bachelor of Engineering',
  'Bachelor of Computer Applications',
  'Bachelor of Science',
  'Bachelor of Commerce',
  'Bachelor of Business Administration',
  'Bachelor of Arts',
  'Bachelor of Laws',
  'Bachelor of Medicine & Bachelor of Surgery',
  'Bachelor of Pharmacy',
  'Bachelor of Architecture',
  'Master of Technology',
  'Master of Computer Applications',
  'Master of Business Administration',
  'Master of Science',
  'Master of Commerce',
  'Master of Science (CS/IT)',
  'Post Graduate Diploma in Management',
  'Bachelor of Design',
  'Diploma in Engineering (Polytechnic)'
].filter(d => allDegrees.includes(d));

console.log('Degrees to process:', DEGREES.length);
console.log('Roles to process:', ALL_ROLES.length);

// Resume progress
let zoneMatrix = {};
if (fs.existsSync(OUTPUT)) {
  zoneMatrix = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  console.log(`Resuming: ${Object.keys(zoneMatrix).length} degrees done`);
}

const save = () => fs.writeFileSync(OUTPUT, JSON.stringify(zoneMatrix, null, 2));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ask(prompt) {
  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.3
  }, {
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return res.data.choices[0].message.content.trim();
}

async function main() {
  for (const degree of DEGREES) {
    if (!zoneMatrix[degree]) zoneMatrix[degree] = {};
    const done = Object.keys(zoneMatrix[degree]).length;
    console.log(`\nProcessing: ${degree} (${done}/${ALL_ROLES.length} roles already done)`);

    for (let i = 0; i < ALL_ROLES.length; i += 4) {
      const batch = ALL_ROLES.slice(i, i + 4);
      if (batch.every(r => zoneMatrix[degree][r])) continue;

      const prompt = `For an Indian student with "${degree}" degree, rate these job roles from an employer's perspective.\n\nemployer_zone: "Green" = employer regularly hires this degree for this role. "Amber" = sometimes, student needs extra skills. "Red" = rarely, major reskilling needed.\nskill_coverage_pct: 0 to 100, what percentage of the role's required skills a typical ${degree} graduate already has.\n\nRoles: ${JSON.stringify(batch)}\n\nReply ONLY with valid JSON, no explanation, no markdown:\n{"RoleName": {"employer_zone": "Green", "skill_coverage_pct": 55}}`;

      try {
        let raw = await ask(prompt);
        raw = raw.replace(/```json|```/g, '').trim();
        const result = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
        Object.assign(zoneMatrix[degree], result);
        console.log(`  ✅ batch ${Math.floor(i/4)+1}/${Math.ceil(ALL_ROLES.length/4)}`);
      } catch(e) {
        console.warn(`  ⚠️  batch ${Math.floor(i/4)+1}: ${e.message}`);
      }
      save();
      await sleep(500);
    }
    console.log(`  Done: ${degree} — ${Object.keys(zoneMatrix[degree]).length} roles`);
  }
  console.log(`\nFinished! zone_matrix.json → ${Object.keys(zoneMatrix).length} degrees`);
}
main().catch(console.error);
