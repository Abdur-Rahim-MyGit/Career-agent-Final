const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../IT_Workforce_Intelligence_225_Roles_Free_Resources.xlsx');
const outputPath = path.join(__dirname, 'data/role_skills_db.json');

try {
  const workbook = xlsx.readFile(excelPath);
  
  const techSheet = workbook.Sheets['Technical Skills'];
  const aiSheet = workbook.Sheets['AI Tools'];

  const techRows = xlsx.utils.sheet_to_json(techSheet, { defval: '' });
  const aiRows = xlsx.utils.sheet_to_json(aiSheet, { defval: '' });

  const roleDB = {};

  techRows.forEach(row => {
    let role = String(row['Role']).trim();
    if (!role) return;
    if (!roleDB[role]) roleDB[role] = { tech_skills: [], ai_tools: [] };
    
    roleDB[role].tech_skills.push({
      skill_name: row['Skill Name'],
      priority: row['Priority'],
      where_to_learn: row['Where to Certify / Learn']
    });
  });

  aiRows.forEach(row => {
    let role = String(row['Role']).trim();
    if (!role) return;
    if (!roleDB[role]) roleDB[role] = { tech_skills: [], ai_tools: [] };
    
    roleDB[role].ai_tools.push({
      tool_name: row['AI Tool Name'],
      used_for: row['What It\'s Used For'],
      priority: row['Priority'],
      where_to_learn: row['Where to Learn / Certify']
    });
  });

  fs.writeFileSync(outputPath, JSON.stringify(roleDB, null, 2));
  console.log(`Successfully generated DB with ${Object.keys(roleDB).length} roles.`);

} catch (error) {
  console.error('Error standardizing excel data:', error.message);
}
