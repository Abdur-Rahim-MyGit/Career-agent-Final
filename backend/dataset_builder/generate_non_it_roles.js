const fs = require('fs');
const path = require('path');

const ROLE_DB_PATH = path.join(__dirname, '..', 'data', 'role_skills_db.json');

const newRoles = {
  "Financial Analyst": {
    "tech_skills": [
      { "skill_name": "Financial Modeling", "priority": "CRITICAL", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Excel (Advanced)", "priority": "CRITICAL", "where_to_learn": "YouTube / Excel Exposure" },
      { "skill_name": "Accounting Principles", "priority": "HIGH", "where_to_learn": "edX free audit" },
      { "skill_name": "Corporate Finance", "priority": "HIGH", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Data Analysis (SQL/Tableau)", "priority": "MEDIUM", "where_to_learn": "SQLZoo / Tableau Public" }
    ],
    "ai_tools": [
      { "tool_name": "ChatGPT / Claude (Data Analysis)", "used_for": "Automating financial insights and summarizing reports", "priority": "HIGH", "where_to_learn": "OpenAI / Anthropic docs" },
      { "tool_name": "Power BI AI Insights", "used_for": "Automated trend analysis", "priority": "MEDIUM", "where_to_learn": "Microsoft Learn" }
    ]
  },
  "Accountant": {
    "tech_skills": [
      { "skill_name": "Tally ERP 9 / Prime", "priority": "CRITICAL", "where_to_learn": "Tally Education (free resources)" },
      { "skill_name": "GST & Taxation", "priority": "CRITICAL", "where_to_learn": "ClearTax free guides" },
      { "skill_name": "Bookkeeping", "priority": "HIGH", "where_to_learn": "AccountingCoach (free)" },
      { "skill_name": "Excel & Spreadsheets", "priority": "HIGH", "where_to_learn": "YouTube" }
    ],
    "ai_tools": [
      { "tool_name": "AI OCR Tools (Receipt Bank/Dext)", "used_for": "Automated invoice processing", "priority": "MEDIUM", "where_to_learn": "Vendor official docs" }
    ]
  },
  "Content Writer": {
    "tech_skills": [
      { "skill_name": "Copywriting", "priority": "CRITICAL", "where_to_learn": "HubSpot Academy (free)" },
      { "skill_name": "SEO Principles", "priority": "CRITICAL", "where_to_learn": "Google Digital Garage (free)" },
      { "skill_name": "Research Methodology", "priority": "HIGH", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Editing & Proofreading", "priority": "HIGH", "where_to_learn": "Grammarly Blog" },
      { "skill_name": "Content Management Systems (WordPress)", "priority": "MEDIUM", "where_to_learn": "WordPress.org free tutorials" }
    ],
    "ai_tools": [
      { "tool_name": "ChatGPT / Jasper AI", "used_for": "Ideation, drafting, and SEO optimization", "priority": "CRITICAL", "where_to_learn": "OpenAI docs" },
      { "tool_name": "Grammarly GO", "used_for": "AI-assisted editing", "priority": "HIGH", "where_to_learn": "Grammarly docs" }
    ]
  },
  "Human Resources Executive": {
    "tech_skills": [
      { "skill_name": "Talent Acquisition / Sourcing", "priority": "CRITICAL", "where_to_learn": "LinkedIn Learning (free tier)" },
      { "skill_name": "Employee Relations", "priority": "HIGH", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Performance Management", "priority": "HIGH", "where_to_learn": "edX free audit" },
      { "skill_name": "HR Information Systems (HRIS)", "priority": "MEDIUM", "where_to_learn": "YouTube" }
    ],
    "ai_tools": [
      { "tool_name": "AI ATS Tools (e.g., Eightfold)", "used_for": "Resume screening and candidate matching", "priority": "HIGH", "where_to_learn": "Vendor docs" },
      { "tool_name": "ChatGPT", "used_for": "Drafting job descriptions and policies", "priority": "MEDIUM", "where_to_learn": "OpenAI docs" }
    ]
  },
  "Corporate Lawyer": {
    "tech_skills": [
      { "skill_name": "Corporate Law & Governance", "priority": "CRITICAL", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Contract Drafting & Review", "priority": "CRITICAL", "where_to_learn": "edX free audit" },
      { "skill_name": "Mergers & Acquisitions (M&A)", "priority": "HIGH", "where_to_learn": "YouTube / Legal Blogs" },
      { "skill_name": "Legal Research", "priority": "HIGH", "where_to_learn": "LexisNexis / Manupatra guides" },
      { "skill_name": "Compliance Management", "priority": "MEDIUM", "where_to_learn": "Coursera free audit" }
    ],
    "ai_tools": [
      { "tool_name": "Harvey AI / CaseMine", "used_for": "AI-assisted legal research and document review", "priority": "HIGH", "where_to_learn": "Vendor docs" },
      { "tool_name": "ChatGPT / Claude", "used_for": "Summarizing lengthy legal documents", "priority": "MEDIUM", "where_to_learn": "Anthropic docs" }
    ]
  },
  "Compliance Officer": {
    "tech_skills": [
      { "skill_name": "Regulatory Compliance", "priority": "CRITICAL", "where_to_learn": "Coursera free audit" },
      { "skill_name": "Risk Assessment", "priority": "CRITICAL", "where_to_learn": "edX free audit" },
      { "skill_name": "Audit Procedures", "priority": "HIGH", "where_to_learn": "YouTube" },
      { "skill_name": "Policy Drafting", "priority": "MEDIUM", "where_to_learn": "LinkedIn Learning (free tier)" }
    ],
    "ai_tools": [
      { "tool_name": "AI Compliance Scanners", "used_for": "Automated policy monitoring and risk detection", "priority": "HIGH", "where_to_learn": "Vendor docs" }
    ]
  }
};

function main() {
  console.log('Loading role_skills_db.json...');
  let db = {};
  try {
    const data = fs.readFileSync(ROLE_DB_PATH, 'utf8');
    db = JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return;
  }

  let added = 0;
  for (const [role, data] of Object.entries(newRoles)) {
    if (!db[role]) {
      db[role] = data;
      added++;
      console.log(`Added new role: ${role}`);
    } else {
      console.log(`Role ${role} already exists in db. Skipping.`);
    }
  }

  if (added > 0) {
    fs.writeFileSync(ROLE_DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Successfully added ${added} roles to role_skills_db.json`);
  } else {
    console.log('No new roles were added.');
  }
}

main();
