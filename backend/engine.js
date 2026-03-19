const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

async function getMLEnrichment(studentData, roleName, roleData) {
  try {
    // Step 1: Use extracted skills from resume text if available, else join skills array
    const skillText = (studentData.skills || []).join(', ');
    
    let semanticSkills = studentData.skills || [];
    try {
      const parseRes = await axios.post(`${ML_URL}/parse-resume`, { text: skillText }, { timeout: 6000 });
      if (parseRes.data?.extracted_skills?.length > 0) {
        semanticSkills = parseRes.data.extracted_skills;
      }
    } catch (e) {
      console.warn('[ML /parse-resume] Unavailable:', e.message);
    }

    // Step 2: Build features for success prediction
    // features = [skill_match_count, degree_relevance_score (0-10), market_demand_score (0-10)]
    const requiredSkills = (roleData?.tech_skills || []).map(s => s.skill_name.toLowerCase());
    const skillMatchCount = semanticSkills.filter(ss =>
      requiredSkills.some(rs => rs.includes(ss.toLowerCase()) || ss.toLowerCase().includes(rs))
    ).length;
    const degreeScore = 5; // default middle score — can be refined later
    const demandScore = 7; // default — will be replaced when market_data.json exists

    let successProbability = null;
    try {
      const predRes = await axios.post(`${ML_URL}/predict-success`,
        { features: [skillMatchCount, degreeScore, demandScore] },
        { timeout: 6000 }
      );
      successProbability = predRes.data?.success_probability || null;
    } catch (e) {
      console.warn('[ML /predict-success] Unavailable:', e.message);
    }

    return { semanticSkills, successProbability };
  } catch (e) {
    console.warn('[ML ENRICHMENT] Failed gracefully:', e.message);
    return { semanticSkills: studentData.skills || [], successProbability: null };
  }
}


let roleSkillsDB = {};
try {
  roleSkillsDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/role_skills_db.json'), 'utf8'));
} catch (err) {
  console.warn("Could not load role_skills_db.json:", err.message);
}

let zoneMatrix = {};
try {
  const zmPath = path.join(__dirname, 'data', 'zone_matrix.json');
  if (fs.existsSync(zmPath)) zoneMatrix = JSON.parse(fs.readFileSync(zmPath, 'utf8'));
} catch (err) { console.warn('zone_matrix.json not loaded:', err.message); }

let marketData = {};
try {
  const mdPath = path.join(__dirname, 'data', 'market_data.json');
  if (fs.existsSync(mdPath)) marketData = JSON.parse(fs.readFileSync(mdPath, 'utf8'));
} catch (err) { console.warn('market_data.json not loaded:', err.message); }

function getZoneFromMatrix(degreeGroup, roleName) {
  if (!zoneMatrix || !zoneMatrix[degreeGroup]) return null;
  return zoneMatrix[degreeGroup][roleName] || null;
}

function getMarketFromData(roleName) {
  if (!marketData) return null;
  return marketData[roleName] || null;
}

// Helper: Count matching keywords
const countKeywordMatches = (text, keywords) => {
  if (!text || !keywords || !keywords.length) return 0;
  const lowerText = text.toLowerCase();
  return keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
};

// ALGORITHM 1: Direction Scoring
// Scores how well a student's profile matches a Specific Role
const calculateDirectionScore = (studentData, roleName, roleData) => {
  let score = 0;
  
  // 1. Degree Match (Weight: 40%)
  const studentDegrees = studentData.education.map(e => e.degreeGroup.toLowerCase() + " " + (e.specialization || "").toLowerCase());
  const degreeString = studentDegrees.join(" ");
  
  // Check if role keywords appear in degree
  // Simple heuristic: if role is 'Data Analyst', does their degree relate to 'Data', 'Computer', 'Math'?
  const roleKeywords = roleName.split(' ');
  const degreeMatches = countKeywordMatches(degreeString, roleKeywords);
  score += Math.min(degreeMatches * 0.2, 0.4); // Max 40%

  // 2. Interest Match (Weight: 20%)
  // For the prototype, we assume if it's their selected primary/secondary, they have interest.
  score += 0.2; 

  // 3. Skill Match (Weight: 40%)
  const requiredTechSkills = roleData.tech_skills.map(s => s.skill_name.toLowerCase());
  const studentSkillsLower = studentData.skills.map(s => s.toLowerCase());
  
  const skillMatches = studentSkillsLower.filter(ss => 
    requiredTechSkills.some(rs => rs.includes(ss) || ss.includes(rs))
  ).length;
  
  const skillMatchRatio = requiredTechSkills.length > 0 ? (skillMatches / requiredTechSkills.length) : 0;
  score += (skillMatchRatio * 0.4);

  return score;
};

// ALGORITHM 2 & 3: Role Distance & Skill Priority Ranking
const calculateSkillGaps = (studentSkills, roleData) => {
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
  
  const missingSkills = [];
  const mathingSkills = [];

  roleData.tech_skills.forEach(skill => {
    const isMatched = studentSkillsLower.some(ss => ss.includes(skill.skill_name.toLowerCase()) || skill.skill_name.toLowerCase().includes(ss));
    if (isMatched) {
      mathingSkills.push(skill.skill_name);
    } else {
      missingSkills.push(skill);
    }
  });

  return { missingSkills, mathingSkills };
};

const determineZone = (score) => {
  if (score >= 0.6) return { zone: "Green", msg: "Strong alignment based on current skills and education." };
  if (score >= 0.3) return { zone: "Amber", msg: "Moderate alignment. You need to bridge specific skill gaps." };
  return { zone: "Red", msg: "This role usually requires a different background. Extra preparation required." };
};

const generateRoleTab = (roleName, studentData) => {
  // If role isn't in DB, fallback to generic
  const roleData = roleSkillsDB[roleName] || {
    tech_skills: [{skill_name: "Domain Knowledge", priority: "High"}],
    ai_tools: [{tool_name: "ChatGPT", priority: "Medium", used_for: "General Assistance"}]
  };

  const score = calculateDirectionScore(studentData, roleName, roleData);
  const { zone, msg } = determineZone(score);
  
  const { missingSkills, mathingSkills } = calculateSkillGaps(studentData.skills, roleData);
  
  // Format Must Have / Nice to have
  const mustHave = roleData.tech_skills
    .filter(s => s.priority === "High" || s.priority === "Critical")
    .map(s => ({ skill: s.skill_name, priority: s.priority, description: "Essential core skill." }));
    
  const niceToHave = roleData.tech_skills
    .filter(s => s.priority === "Medium" || s.priority === "Low")
    .map(s => s.skill_name);

  const aiTools = roleData.ai_tools.map(t => ({
    name: t.tool_name,
    category: "AI-Powered",
    usage: t.used_for,
    adoption_level: "Growing"
  }));

  return {
    zone: zone,
    zone_message: msg,
    preparation_time: zone === "Green" ? "1-2 months" : zone === "Amber" ? "3-5 months" : "6+ months",
    match_explanation: `Your alignment score is ${(score*100).toFixed(0)}%. You have ${mathingSkills.length} matching skills.`,
    tab1: {
      role_name: roleName,
      role_description: `Responsible for core operations within the ${roleName} domain.`,
      typical_employers_india: "MNCs, Startups, IT Consultancies",
      common_entry_paths: "Campus Placements, Internships",
      job_demand: "High Growth",
      salary_range: "3-8 LPA",
      ai_impact: `AI systems are augmenting ${roleName} roles significantly.`,
      emerging_roles: [{name: `AI-Enhanced ${roleName}`, description: "Uses AI tools daily."}]
    },
    tab2: { must_have: mustHave, nice_to_have: niceToHave },
    tab3: {
      ai_tools: aiTools.length ? aiTools : [{name: "General AI Tools", category: "Utility", usage: "Productivity", adoption_level: "High"}],
      ai_exposure: { percentage: "40%", level: "Moderate", tasks_assisted: "Repetitive drafting/coding", human_value: "Strategy & Review" },
      human_skills: ["Analytical Thinking", "Communication", "Problem Solving"]
    },
    tab5: {
      future_scope: `${roleName} is evolving rapidly with AI integration.`,
      target_audience: "Enterprise and Tech-forward companies.",
      growth_trajectory: "Expected to branch into more specialized architectural roles."
    }
  };
};

/**
 * processCareerIntelligence: Deterministic deep intelligence processor.
 * Completely replaces the old LLM runtime calls with local Rule Engine calculations.
 */
const processCareerIntelligence = async (studentData) => {
  const { preferences, skills } = studentData;
  const primaryRole = preferences.primary?.role || preferences.primary?.jobRole || "Target Role";
  const pRole = primaryRole;
  const sRole = preferences.secondary?.role || preferences.secondary?.jobRole || "Secondary Role";
  const tRole = preferences.tertiary?.role || preferences.tertiary?.jobRole || "Tertiary Role";

  const primaryTab = generateRoleTab(pRole, studentData);
  const secondaryTab = generateRoleTab(sRole, studentData);
  const tertiaryTab = generateRoleTab(tRole, studentData);

  let mlEnrichment = { semanticSkills: [], successProbability: null };
  try {
    const pRoleDataForML = roleSkillsDB[pRole] || { tech_skills: [] };
    mlEnrichment = await getMLEnrichment(studentData, pRole, pRoleDataForML);
  } catch (e) {}

  // Calculate missing skills across the primary role for the roadmap
  const pRoleData = roleSkillsDB[pRole] || { tech_skills: [] };
  const { missingSkills, mathingSkills } = calculateSkillGaps(skills, pRoleData);

  const degreeGroup = studentData.education?.[0]?.degreeGroup || studentData.education?.degreeGroup || '';

  // Try zone_matrix.json first (Member 2's data — more accurate)
  // Fall back to generateRoleTab() zone score (always available)
  const zoneFromMatrix = getZoneFromMatrix(degreeGroup, pRole);
  const marketFromData = getMarketFromData(pRole);

  const preVerified = {
    dataFilesReady: Object.keys(zoneMatrix).length > 0,
    primaryZone: zoneFromMatrix || { employer_zone: primaryTab.zone, skill_coverage_pct: 0 },
    secondaryZone: getZoneFromMatrix(degreeGroup, sRole) || { employer_zone: secondaryTab.zone },
    tertiaryZone: getZoneFromMatrix(degreeGroup, tRole) || { employer_zone: tertiaryTab.zone },
    primaryMarket: marketFromData || null,
    primarySkillGap: {
      missing: missingSkills.map(m => m.skill_name),
      matched: mathingSkills,
      coveragePct: (missingSkills.length + mathingSkills.length) > 0
        ? Math.round((mathingSkills.length / (missingSkills.length + mathingSkills.length)) * 100)
        : 0,
      dataReady: true,
      source: 'local'
    }
  };

  // Calculate skill coverage % for fallback zone
  const preVerified_skillCoverage = preVerified.primarySkillGap.coveragePct;
  // Fix: update fallback primaryZone with real coverage now that we have it
  if (!zoneFromMatrix) {
    preVerified.primaryZone.skill_coverage_pct = preVerified_skillCoverage;
  }

  const probStr = mlEnrichment.successProbability ? Math.round(mlEnrichment.successProbability * 100) + '%' : 'Calculating';

  return {
    status: mlEnrichment.semanticSkills.length > 0 ? 'success_ml_assisted' : 'success_deterministic',
    generated_at: new Date().toISOString(),
    preVerified,
    primary: primaryTab,
    secondary: secondaryTab,
    tertiary: tertiaryTab,
    ml_success_probability: mlEnrichment.successProbability,
    ml_semantic_skills: mlEnrichment.semanticSkills,
    combined_tab4: {
      combined_pathway_summary: `Your immediate focus must be learning the missing fundamentals for ${pRole}. Role success probability: ${probStr}`,
      skill_gap: {
        current_skills: skills.length ? skills : ["Basic Academics", "Communication"],
        missing_skills: preVerified.primarySkillGap.missing
      },
      learning_roadmap: [
        { step: "Step 1 - Foundation Skills", description: "Master prerequisites and theoretical fundamentals." },
        { step: "Step 2 - Core Technical Skills", description: `Learn ${missingSkills[0]?.skill_name || 'core technologies'}.` },
        { step: "Step 3 - Advanced Applications", description: "Apply skills in complex scenarios." },
        { step: "Step 4 - Projects & Portfolio", description: "Deploy market-ready portfolios demonstrating these skills." }
      ],
      certifications: [
        {name: `Certified ${pRole} Professional`, issuer: "Industry Standard Provider", difficulty: "Intermediate", duration: "3 months"}
      ],
      free_courses: [
        {course_name: `${pRole} Crash Course`, platform: "YouTube / Coursera", link_status: "Free"}
      ],
      projects: [
        {project_name: `${pRole} Capstone`, description: "A complete end-to-end implementation.", skills_demonstrated: missingSkills.slice(0, 3).map(s=>s.skill_name).join(', ')}
      ]
    }
  };
};

module.exports = { processCareerIntelligence, calculateDirectionScore, calculateSkillGaps, determineZone };
