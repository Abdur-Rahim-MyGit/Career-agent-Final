/**
 * SMAART Data Loader — Merges existing company databases + new imported datasets
 * 
 * RULE: Existing company data ALWAYS takes priority over new imported data.
 * If a role exists in both, the company version is used.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PROCESSED_DIR = path.join(__dirname, 'datasets', 'processed');

function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`[DataLoader] Warning: Could not load ${filePath}: ${e.message}`);
    return null;
  }
}

/**
 * Get merged role_skills database
 * Company data (254 roles) + O*NET data (923 new roles) = ~1,177 roles
 */
function getRoleSkillsDB() {
  const existing = loadJSON(path.join(DATA_DIR, 'role_skills_db.json')) || {};
  const imported = loadJSON(path.join(PROCESSED_DIR, 'new_roles_skills.json')) || {};

  // Existing takes priority — only add roles NOT in existing
  const merged = { ...existing };
  let addedCount = 0;
  for (const [role, data] of Object.entries(imported)) {
    if (!merged[role]) {
      merged[role] = data;
      addedCount++;
    }
  }
  console.log(`[DataLoader] role_skills: ${Object.keys(existing).length} existing + ${addedCount} new = ${Object.keys(merged).length} total`);
  return merged;
}

/**
 * Get merged market data
 * Company data (254 roles) + Kaggle data (20,709 new roles) = ~20,963 roles
 */
function getMarketData() {
  const existing = loadJSON(path.join(DATA_DIR, 'market_data.json')) || {};
  const imported = loadJSON(path.join(PROCESSED_DIR, 'new_market_data.json')) || {};
  const fresher = loadJSON(path.join(PROCESSED_DIR, 'new_fresher_market.json')) || {};

  const merged = { ...existing };
  let addedCount = 0;
  for (const [role, data] of Object.entries(imported)) {
    if (!merged[role]) { merged[role] = data; addedCount++; }
  }
  for (const [role, data] of Object.entries(fresher)) {
    if (!merged[role]) { merged[role] = data; addedCount++; }
  }
  console.log(`[DataLoader] market_data: ${Object.keys(existing).length} existing + ${addedCount} new = ${Object.keys(merged).length} total`);
  return merged;
}

/**
 * Get merged job titles for autocomplete
 * Existing (1,667) + Kaggle (53,561 new) = ~55,228 total
 */
function getJobTitles() {
  const existingPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'jobRolesData.json');
  const existing = loadJSON(existingPath) || { roles: [] };
  const imported = loadJSON(path.join(PROCESSED_DIR, 'new_job_titles.json')) || { roles: [] };

  const existingSet = new Set(existing.roles.map(r => r.role.toLowerCase()));
  const merged = [...existing.roles];
  let addedCount = 0;
  for (const item of imported.roles) {
    if (!existingSet.has(item.role.toLowerCase())) {
      merged.push(item);
      addedCount++;
    }
  }
  console.log(`[DataLoader] job_titles: ${existing.roles.length} existing + ${addedCount} new = ${merged.length} total`);
  return { roles: merged };
}

/**
 * Get zone matrix (existing only — new zones need degree mapping which requires manual curation)
 */
function getZoneMatrix() {
  const existing = loadJSON(path.join(DATA_DIR, 'zone_matrix.json')) || {};
  const zones = loadJSON(path.join(PROCESSED_DIR, 'new_job_zones.json')) || {};
  console.log(`[DataLoader] zone_matrix: ${Object.keys(existing).length} degrees | job_zones: ${Object.keys(zones).length} O*NET zones`);
  return { zoneMatrix: existing, jobZones: zones };
}

/**
 * Get NPTEL course database
 */
function getCourses() {
  const courses = loadJSON(path.join(PROCESSED_DIR, 'new_courses.json')) || {};
  console.log(`[DataLoader] courses: ${Object.keys(courses).length} NPTEL courses loaded`);
  return courses;
}

/**
 * Get projects database (existing only)
 */
function getProjects() {
  const existing = loadJSON(path.join(DATA_DIR, 'projects.json')) || {};
  console.log(`[DataLoader] projects: ${Object.keys(existing).length} roles with projects`);
  return existing;
}

/**
 * Get total degree programs count from dropdownData.json (the actual education taxonomy)
 * This counts all degree programs across UG, PG, PhD, Professional levels
 */
function getDegreeCount() {
  const dropdown = loadJSON(path.join(__dirname, '..', 'frontend', 'src', 'data', 'dropdownData.json'));
  if (!dropdown || !dropdown.education) return 20; // fallback
  let count = 0;
  for (const level of Object.values(dropdown.education)) {
    for (const domain of Object.values(level)) {
      count += Object.keys(domain).length;
    }
  }
  console.log(`[DataLoader] degrees: ${count} degree programs from dropdownData.json`);
  return count;
}

module.exports = {
  getRoleSkillsDB,
  getMarketData,
  getJobTitles,
  getZoneMatrix,
  getCourses,
  getProjects,
  getDegreeCount,
};
