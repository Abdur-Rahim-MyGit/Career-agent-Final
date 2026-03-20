const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const KEY = process.env.GROQ_API_KEY;
const OUTPUT = path.join(__dirname, '..', 'data', 'market_data.json');
const roleDB = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'role_skills_db.json'), 'utf8'));
const ALL_ROLES = Object.keys(roleDB);

let marketData = {};
if (fs.existsSync(OUTPUT)) {
  marketData = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  console.log(`Resuming: ${Object.keys(marketData).length} roles done`);
}

const save = () => fs.writeFileSync(OUTPUT, JSON.stringify(marketData, null, 2));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ask(prompt) {
  const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 700,
    temperature: 0.3
  }, {
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return res.data.choices[0].message.content.trim();
}

async function main() {
  const pending = ALL_ROLES.filter(r => !marketData[r]);
  console.log(`${pending.length} roles to process`);
  for (let i = 0; i < pending.length; i += 4) {
    const batch = pending.slice(i, i + 4);
    const prompt = `Indian job market 2024-25 data for these roles:\ndemand_level: "High"/"Medium"/"Low"\nsalary_min_lpa: entry-level salary in LPA (number only)\nsalary_max_lpa: senior salary in LPA (number only)\nai_automation_risk: "High"/"Medium"/"Low"\nemerging_roles: array of 2-3 AI-augmented adjacent roles\nRoles: ${JSON.stringify(batch)}\nReply ONLY valid JSON no explanation: {"RoleName": {"demand_level":"High","salary_min_lpa":4.0,"salary_max_lpa":12.0,"ai_automation_risk":"Medium","emerging_roles":["AI Analyst"]}}`;
    try {
      let raw = await ask(prompt);
      raw = raw.replace(/```json|```/g, '').trim();
      const result = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
      Object.assign(marketData, result);
      console.log(`✅ Batch ${Math.floor(i/4)+1}/${Math.ceil(pending.length/4)} — ${batch.join(', ')}`);
    } catch(e) { console.warn(`⚠️ Batch ${Math.floor(i/4)+1}: ${e.message}`); }
    save();
    await sleep(500);
  }
  console.log(`\nDone! market_data.json → ${Object.keys(marketData).length} roles`);
}
main().catch(console.error);
