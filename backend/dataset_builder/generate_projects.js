const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const KEY = process.env.GROQ_API_KEY;
const OUTPUT = path.join(__dirname, '..', 'data', 'projects.json');
const roleDB = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'role_skills_db.json'), 'utf8'));
const ALL_ROLES = Object.keys(roleDB);

let projects = {};
if (fs.existsSync(OUTPUT)) {
  projects = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  console.log(`Resuming: ${Object.keys(projects).length} roles done`);
}

const save = () => fs.writeFileSync(OUTPUT, JSON.stringify(projects, null, 2));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ask(prompt) {
  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.3
  }, {
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return res.data.choices[0].message.content.trim();
}

async function main() {
  const pending = ALL_ROLES.filter(r => !projects[r]);
  console.log(`${pending.length} roles to process`);
  for (let i = 0; i < pending.length; i += 3) {
    const batch = pending.slice(i, i + 3);
    const prompt = `2 portfolio projects per role for Indian students to get their first job.\nProject 1=Beginner(10-15hrs,free tools). Project 2=Intermediate(20-30hrs,free tools).\nEach: title, level, skills_demonstrated(array), hours_estimate, tool, how_to_share\nRoles: ${JSON.stringify(batch)}\nReply ONLY valid JSON no explanation: {"RoleName": [{"title":"...","level":"Beginner","skills_demonstrated":["Excel"],"hours_estimate":12,"tool":"MS Excel (free)","how_to_share":"Post screenshot on LinkedIn"}]}`;
    try {
      let raw = await ask(prompt);
      raw = raw.replace(/```json|```/g, '').trim();
      const result = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
      Object.assign(projects, result);
      console.log(`✅ Batch ${Math.floor(i/3)+1}/${Math.ceil(pending.length/3)} — ${batch.join(', ')}`);
    } catch(e) { console.warn(`⚠️ Batch failed: ${e.message}`); }
    save();
    await sleep(500);
  }
  console.log(`\nDone! projects.json → ${Object.keys(projects).length} roles`);
}
main().catch(console.error);
