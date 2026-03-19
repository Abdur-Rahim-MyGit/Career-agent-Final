const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

async function getMLPrediction(studentData, roleName) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/match`, {
      student_skills: (studentData.skills || []).map(s => s.name || s),
      role_name: roleName,
      degree_group: studentData.education?.degreeGroup || '',
      experience: (studentData.experience || []).map(e => e.role || '')
    }, { timeout: 8000 });
    return response.data;
  } catch (e) {
    console.warn('[ML SERVICE] Unavailable, using JSON fallback:', e.message);
    return null;
  }
}

let roleSkillsDB = {};
try {
  roleSkillsDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/role_skills_db.json'), 'utf8'));
} catch (err) {
  console.warn("Could not load role_skills_db.json:", err.message);
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

  // Calculate missing skills across the primary role for the roadmap
  const pRoleData = roleSkillsDB[pRole] || { tech_skills: [] };
  const { missingSkills, mathingSkills } = calculateSkillGaps(skills, pRoleData);

  const preVerified = {
    primaryZone: { employer_zone: primaryTab.zone },
    secondaryZone: { employer_zone: secondaryTab.zone },
    tertiaryZone: { employer_zone: tertiaryTab.zone },
    primarySkillGap: {
      missing: missingSkills.map(m => m.skill_name),
      matched: mathingSkills,
      coveragePct: (missingSkills.length + mathingSkills.length) > 0 ? Math.round((mathingSkills.length / (missingSkills.length + mathingSkills.length)) * 100) : 0,
      source: 'local'
    }
  };

  if (primaryRole) {
    const mlResult = await getMLPrediction(studentData, primaryRole);
    if (mlResult) {
      preVerified.mlSemanticMatches = mlResult.semantic_matches || [];
      preVerified.mlSuccessProbability = mlResult.success_probability || null;
      if (mlResult.missing_skills && mlResult.missing_skills.length > 0) {
        preVerified.primarySkillGap = {
          ...preVerified.primarySkillGap,
          missing: mlResult.missing_skills,
          dataReady: true,
          source: 'ml'
        };
      }
    }
  }

  const probStr = preVerified.mlSuccessProbability ? Math.round(preVerified.mlSuccessProbability * 100) + '%' : 'Calculating';

  return {
    status: preVerified.mlSemanticMatches ? 'success_ml_assisted' : 'success_deterministic',
    generated_at: new Date().toISOString(),
    preVerified,
    primary: primaryTab,
    secondary: secondaryTab,
    tertiary: tertiaryTab,
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

module.exports = { processCareerIntelligence };
