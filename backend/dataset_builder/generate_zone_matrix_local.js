/**
 * generate_zone_matrix_local.js
 * Generates zone_matrix.json using a deterministic algorithm.
 * NO API calls. NO internet. Runs in under 5 seconds.
 * Uses the same scoring logic as engine.js calculateDirectionScore.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'data', 'zone_matrix.json');
const ROLE_DB_PATH = path.join(__dirname, '..', 'data', 'role_skills_db.json');

const roleDB = JSON.parse(fs.readFileSync(ROLE_DB_PATH, 'utf8'));
const ALL_ROLES = Object.keys(roleDB);

// 20 key Indian degrees with their domain keywords
// These keywords determine how well the degree aligns with a role
const DEGREES = {
  'Bachelor of Technology': ['technology', 'engineering', 'software', 'computer', 'IT', 'systems', 'network', 'data', 'hardware', 'electronics'],
  'Bachelor of Engineering': ['engineering', 'technology', 'systems', 'hardware', 'software', 'electronics', 'computer', 'network'],
  'Bachelor of Computer Applications': ['computer', 'software', 'application', 'IT', 'programming', 'web', 'database', 'systems'],
  'Bachelor of Science': ['science', 'data', 'research', 'analytics', 'mathematics', 'statistics', 'computer', 'physics'],
  'Bachelor of Commerce': ['commerce', 'finance', 'business', 'accounting', 'economics', 'management', 'analytics', 'ERP', 'SAP'],
  'Bachelor of Business Administration': ['business', 'management', 'operations', 'analytics', 'product', 'consulting', 'ERP', 'SAP', 'scrum', 'agile'],
  'Bachelor of Arts': ['communication', 'content', 'writing', 'design', 'UX', 'UI', 'creative', 'media', 'research'],
  'Bachelor of Laws': ['legal', 'compliance', 'governance', 'GRC', 'audit', 'risk', 'policy'],
  'Bachelor of Medicine & Bachelor of Surgery': ['health', 'medical', 'clinical', 'pharma', 'biotech'],
  'Bachelor of Pharmacy': ['pharma', 'chemistry', 'biotech', 'medical', 'health', 'clinical'],
  'Bachelor of Architecture': ['design', 'architecture', 'UI', 'UX', 'creative', 'visual', 'frontend'],
  'Master of Technology': ['technology', 'engineering', 'software', 'computer', 'IT', 'systems', 'network', 'data', 'hardware', 'ML', 'AI', 'research'],
  'Master of Computer Applications': ['computer', 'software', 'application', 'IT', 'programming', 'web', 'database', 'systems', 'AI', 'ML'],
  'Master of Business Administration': ['business', 'management', 'operations', 'product', 'consulting', 'ERP', 'SAP', 'scrum', 'agile', 'analytics', 'finance', 'strategy'],
  'Master of Science': ['science', 'data', 'research', 'analytics', 'AI', 'ML', 'statistics', 'computer'],
  'Master of Commerce': ['commerce', 'finance', 'accounting', 'economics', 'management', 'ERP', 'SAP', 'FinOps', 'analytics'],
  'Master of Science (CS/IT)': ['computer', 'software', 'IT', 'data', 'AI', 'ML', 'systems', 'network', 'cloud', 'security'],
  'Post Graduate Diploma in Management': ['management', 'business', 'product', 'operations', 'analytics', 'consulting', 'agile', 'scrum'],
  'Bachelor of Design': ['design', 'UI', 'UX', 'creative', 'visual', 'frontend', 'motion', 'product', 'interaction'],
  'Diploma in Engineering (Polytechnic)': ['engineering', 'hardware', 'network', 'systems', 'electronics', 'IT', 'support', 'technician']
};

// Role family keywords — used to calculate skill coverage
// The more keywords match between degree and role name/family, the higher the coverage
const ROLE_FAMILIES = {
  software: ['Developer', 'Engineer', 'Architect', 'Programmer', 'Full Stack', 'Back End', 'Front End', 'Web', 'Mobile', 'iOS', 'Android'],
  data: ['Data', 'Analytics', 'BI', 'Business Intelligence', 'Scientist', 'Analyst', 'Snowflake', 'Spark', 'Big Data'],
  cloud: ['Cloud', 'DevOps', 'Infrastructure', 'Platform', 'SRE', 'Site Reliability', 'AWS', 'Azure', 'GCP'],
  security: ['Security', 'Cyber', 'SOC', 'Threat', 'Forensics', 'Penetration', 'Vulnerability', 'CISO', 'GRC'],
  ai: ['AI', 'ML', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'LLM', 'Generative'],
  management: ['Manager', 'Director', 'VP', 'CTO', 'Chief', 'Lead', 'Head', 'Scrum Master', 'Product', 'Program'],
  design: ['Designer', 'UX', 'UI', 'Creative', 'Motion', 'Visual', 'Interaction'],
  hardware: ['Hardware', 'Embedded', 'FPGA', 'VLSI', 'RTL', 'Firmware', 'Electronics', 'Semiconductor', 'Chip'],
  network: ['Network', 'Linux', 'Windows', 'Systems Admin', 'Infrastructure', 'Storage', 'IT Help'],
  consulting: ['Consultant', 'SAP', 'Oracle', 'Salesforce', 'ServiceNow', 'Workday', 'ERP']
};

function getRoleFamily(roleName) {
  const lower = roleName.toLowerCase();
  for (const [family, keywords] of Object.entries(ROLE_FAMILIES)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return family;
  }
  return 'general';
}

function calculateZone(degreeName, roleName) {
  const degreeKeywords = DEGREES[degreeName].map(k => k.toLowerCase());
  const roleNameLower = roleName.toLowerCase();
  const roleFamily = getRoleFamily(roleName);

  // Count how many degree keywords appear in the role name
  const directMatches = degreeKeywords.filter(kw => roleNameLower.includes(kw)).length;

  // Family alignment score
  const familyAlignmentMap = {
    'Bachelor of Technology':              { software: 3, data: 2, cloud: 3, security: 2, ai: 2, hardware: 3, network: 2, consulting: 1, management: 0, design: 0 },
    'Bachelor of Engineering':             { software: 2, data: 1, cloud: 2, security: 1, ai: 1, hardware: 3, network: 2, consulting: 1, management: 0, design: 0 },
    'Bachelor of Computer Applications':  { software: 3, data: 2, cloud: 2, security: 1, ai: 1, hardware: 1, network: 2, consulting: 1, management: 0, design: 1 },
    'Bachelor of Science':                 { software: 1, data: 3, cloud: 1, security: 1, ai: 2, hardware: 1, network: 1, consulting: 0, management: 0, design: 0 },
    'Bachelor of Commerce':                { software: 0, data: 2, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 2, management: 1, design: 0 },
    'Bachelor of Business Administration': { software: 0, data: 1, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 2, management: 3, design: 0 },
    'Bachelor of Arts':                    { software: 0, data: 0, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 0, management: 1, design: 3 },
    'Bachelor of Laws':                    { software: 0, data: 0, cloud: 0, security: 1, ai: 0, hardware: 0, network: 0, consulting: 1, management: 1, design: 0 },
    'Bachelor of Medicine & Bachelor of Surgery': { software: 0, data: 0, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 0, management: 0, design: 0 },
    'Bachelor of Pharmacy':                { software: 0, data: 1, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 0, management: 0, design: 0 },
    'Bachelor of Architecture':            { software: 1, data: 0, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 0, management: 0, design: 3 },
    'Master of Technology':                { software: 3, data: 3, cloud: 3, security: 2, ai: 3, hardware: 3, network: 2, consulting: 1, management: 1, design: 0 },
    'Master of Computer Applications':    { software: 3, data: 3, cloud: 2, security: 2, ai: 2, hardware: 1, network: 2, consulting: 1, management: 0, design: 1 },
    'Master of Business Administration':   { software: 0, data: 2, cloud: 0, security: 0, ai: 1, hardware: 0, network: 0, consulting: 3, management: 3, design: 0 },
    'Master of Science':                   { software: 1, data: 3, cloud: 1, security: 1, ai: 3, hardware: 1, network: 1, consulting: 0, management: 0, design: 0 },
    'Master of Commerce':                  { software: 0, data: 2, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 2, management: 1, design: 0 },
    'Master of Science (CS/IT)':           { software: 3, data: 3, cloud: 3, security: 3, ai: 3, hardware: 1, network: 2, consulting: 1, management: 0, design: 1 },
    'Post Graduate Diploma in Management': { software: 0, data: 2, cloud: 0, security: 0, ai: 1, hardware: 0, network: 0, consulting: 3, management: 3, design: 0 },
    'Bachelor of Design':                  { software: 1, data: 0, cloud: 0, security: 0, ai: 0, hardware: 0, network: 0, consulting: 0, management: 0, design: 3 },
    'Diploma in Engineering (Polytechnic)':{ software: 1, data: 0, cloud: 1, security: 0, ai: 0, hardware: 2, network: 2, consulting: 0, management: 0, design: 0 }
  };

  const familyScore = (familyAlignmentMap[degreeName] || {})[roleFamily] || 0;
  const totalScore = (directMatches * 0.5) + (familyScore * 0.5);

  let employer_zone, skill_coverage_pct;

  if (totalScore >= 2.5) {
    employer_zone = 'Green';
    skill_coverage_pct = Math.min(90, 55 + (totalScore * 5));
  } else if (totalScore >= 1.0) {
    employer_zone = 'Amber';
    skill_coverage_pct = Math.min(54, 25 + (totalScore * 10));
  } else {
    employer_zone = 'Red';
    skill_coverage_pct = Math.min(24, 5 + (totalScore * 10));
  }

  return {
    employer_zone,
    skill_coverage_pct: Math.round(skill_coverage_pct)
  };
}

function main() {
  console.log(`Generating zone_matrix.json for ${Object.keys(DEGREES).length} degrees × ${ALL_ROLES.length} roles...`);
  console.log('No API calls. Running locally.\n');

  const zoneMatrix = {};
  let total = 0;

  for (const degree of Object.keys(DEGREES)) {
    zoneMatrix[degree] = {};
    for (const role of ALL_ROLES) {
      zoneMatrix[degree][role] = calculateZone(degree, role);
      total++;
    }
    const green = Object.values(zoneMatrix[degree]).filter(v => v.employer_zone === 'Green').length;
    const amber = Object.values(zoneMatrix[degree]).filter(v => v.employer_zone === 'Amber').length;
    const red   = Object.values(zoneMatrix[degree]).filter(v => v.employer_zone === 'Red').length;
    console.log(`✅ ${degree}`);
    console.log(`   Green: ${green} | Amber: ${amber} | Red: ${red}`);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(zoneMatrix, null, 2));
  console.log(`\nDone! ${total} role-degree pairs written to ${OUTPUT}`);
  console.log('100% complete. No API. No rate limits.');
}

main();
