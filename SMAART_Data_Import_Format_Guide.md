# SMAART — Data Import Format Guide

> **RULE**: New datasets go into **NEW files** — existing databases will NOT be modified.  
> **All data comes from databases, not AI. AI is only for recommending links and learning paths.**

---

## 📂 Folder Structure: Where To Place Your Downloaded Files

```
backend/datasets/
├── raw/                  ← YOU PUT DOWNLOADED FILES HERE
│   ├── kaggle_97k_jobs.xlsx        (from Kaggle)
│   ├── onet_occupations.csv        (from O*NET)
│   ├── nco_2015_india.csv          (from R-bloggers)
│   ├── nptel_courses.csv           (from Kaggle)
│   └── india_salary_2026.csv       (from Kaggle)
│
├── processed/            ← I WILL CREATE PARSED FILES HERE (same schema as existing)
│   ├── new_roles_skills.json       (mirrors role_skills_db.json format)
│   ├── new_market_data.json        (mirrors market_data.json format)
│   ├── new_job_titles.json         (mirrors jobRolesData.json format)
│   ├── new_zone_matrix.json        (mirrors zone_matrix.json format)
│   ├── new_projects.json           (mirrors projects.json format)
│   └── new_courses.json            (NEW — course links for learning paths)
```

---

## 📋 EXISTING DATABASE SCHEMAS (DO NOT MODIFY THESE FILES)

### Database 1: `backend/data/role_skills_db.json`
**254 roles** · Company data · DO NOT EDIT

```json
{
  "Role Name Here": {
    "tech_skills": [
      {
        "skill_name": "C# Programming",
        "priority": "CRITICAL",
        "where_to_learn": "Microsoft Learn (free)"
      },
      {
        "skill_name": "ASP.NET Core",
        "priority": "HIGH",
        "where_to_learn": "Coursera free audit"
      },
      {
        "skill_name": "Azure DevOps",
        "priority": "MEDIUM",
        "where_to_learn": "Microsoft Learn (free)"
      },
      {
        "skill_name": "Blazor WebAssembly",
        "priority": "LOW",
        "where_to_learn": "Microsoft Learn (free)"
      }
    ],
    "ai_tools": [
      {
        "tool_name": "GitHub Copilot (free for students)",
        "used_for": "AI pair programmer for code",
        "priority": "HIGH",
        "where_to_learn": "GitHub Education free pack"
      }
    ]
  }
}
```

**Priority levels**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`

---

### Database 2: `backend/data/zone_matrix.json`
**20 degrees × 254 roles** · Company data · DO NOT EDIT

```json
{
  "Bachelor of Technology": {
    ".NET Developer": {
      "employer_zone": "Amber",
      "skill_coverage_pct": 40
    },
    "AI Engineer": {
      "employer_zone": "Green",
      "skill_coverage_pct": 75
    }
  },
  "Bachelor of Commerce": {
    "Financial Analyst": {
      "employer_zone": "Green",
      "skill_coverage_pct": 65
    }
  }
}
```

**employer_zone values**: `Green` (>60% match), `Amber` (30-60%), `Red` (<30%)  
**skill_coverage_pct**: 0 to 100 (integer)

---

### Database 3: `backend/data/market_data.json`
**254 roles** · Company data · DO NOT EDIT

```json
{
  "Role Name Here": {
    "demand_level": "Medium",
    "salary_min_lpa": 6,
    "salary_max_lpa": 18,
    "ai_automation_risk": "High",
    "emerging_roles": [
      "Cloud Architect",
      "DevOps Engineer",
      "Full Stack Developer"
    ]
  }
}
```

**demand_level values**: `High`, `Medium`, `Low`  
**ai_automation_risk values**: `High`, `Medium`, `Low`  
**salary in LPA** (Lakhs Per Annum): integer values

---

### Database 4: `backend/data/projects.json`
**189 roles** · Company data · DO NOT EDIT

```json
{
  "Role Name Here": [
    {
      "title": "To-Do List App",
      "level": "Beginner",
      "skills_demonstrated": ["C#", "Windows Forms"],
      "hours_estimate": 12,
      "tool": "Visual Studio Community",
      "how_to_share": "Post GitHub repository link on LinkedIn"
    },
    {
      "title": "E-commerce Website",
      "level": "Intermediate",
      "skills_demonstrated": ["ASP.NET", "SQL Server"],
      "hours_estimate": 40,
      "tool": "Visual Studio + SQL Server Express",
      "how_to_share": "Deploy on Azure free tier and share link"
    }
  ]
}
```

**level values**: `Beginner`, `Intermediate`, `Advanced`

---

### Database 5: `frontend/src/data/jobRolesData.json`
**~1,667 job titles** · Company data · DO NOT EDIT

```json
{
  "roles": [
    { "role": ".NET Developer", "family": "Information Technology" },
    { "role": "AI Engineer", "family": "Information Technology" },
    { "role": "Financial Analyst", "family": "BFSI" },
    { "role": "Civil Engineer", "family": "Engineering & Manufacturing" }
  ]
}
```

**family values** (27 families available):
Information Technology, BFSI, Healthcare & Pharma, Engineering & Manufacturing, Education & Research, Government & Public Sector, Legal, Media & Communication, Sales Marketing & Retail, Human Resources, Supply Chain & Logistics, Construction & Real Estate, Agriculture & Food, Hospitality & Tourism, Energy & Environment, Design & Creative, Social Sector & NGO, Aviation & Aerospace, Telecom & Networking, Sports & Fitness, Textile & Apparel, Chemicals & Plastics, Printing & Packaging, Gems & Jewellery, Transportation & Automobile, Space & Emerging Tech, Consulting & Strategy

---

### Database 6: `frontend/src/data/dropdownData.json`
**Education + Jobs taxonomy** · Company data · DO NOT EDIT

```json
{
  "education": {
    "Undergraduate (UG)": {
      "Arts & Humanities": {
        "Bachelor of Arts": ["English","Hindi","History","Philosophy","Political Science"],
        "Bachelor of Fine Arts": ["Painting","Sculpture","Applied Arts"]
      },
      "Engineering & Technology": {
        "Bachelor of Technology": ["Computer Science","IT","Electronics & Communication","Mechanical","Civil"],
        "Bachelor of Engineering": ["Computer Science","Electronics","Mechanical"]
      }
    },
    "Postgraduate (PG)": {
      "...same structure..."
    }
  },
  "jobs": {
    "Information Technology": ["Software Developer","Data Analyst","..."],
    "BFSI": ["Financial Analyst","Investment Banker","..."]
  }
}
```

**Education levels**: `Undergraduate (UG)`, `Postgraduate (PG)`, `Doctoral (PhD-Research)`, `Professional-Integrated`  
**17 UG domains**: Arts & Humanities, Science, Commerce & Management, Engineering & Technology, Computer Science & IT, Medicine & Health Sciences, Pharmacy, Law, Education, Architecture & Planning, Design, Agriculture & Allied Sciences, Hotel Management & Tourism, Journalism & Mass Communication, Social Work, Library Science, Vocational

---

### Database 7: `backend/data/mockRoles.js`
**Role list for API** · Company data · DO NOT EDIT

```javascript
const roles = [
  {
    id: 1,
    title: "Software Developer",
    job_family: "Engineering",
    sector: "IT",
    min_salary: 6,
    max_salary: 18,
    ai_exposure: 85,
    summary: "Build and maintain complex software applications.",
    skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker"]
  }
];
```

---

## 🆕 NEW FILES I WILL CREATE (Same Schema, New Data)

When you give me the downloaded datasets, I will create these **new files** in `backend/datasets/processed/`:

| New File | Same Schema As | What It Contains |
|----------|---------------|------------------|
| `new_roles_skills.json` | `role_skills_db.json` | New roles extracted from O*NET/NCO datasets |
| `new_market_data.json` | `market_data.json` | New salary/demand data from Kaggle datasets |
| `new_job_titles.json` | `jobRolesData.json` | New job titles from 97K Kaggle dataset |
| `new_zone_matrix.json` | `zone_matrix.json` | New degree×role mappings |
| `new_projects.json` | `projects.json` | New portfolio projects for new roles |
| `new_courses.json` | NEW format (below) | NPTEL/free course links for learning paths |

### New Course Database Schema (NEW — `new_courses.json`):
```json
{
  "Python Programming": {
    "course_name": "Programming, Data Structures and Algorithms Using Python",
    "platform": "NPTEL",
    "instructor": "Prof. Madhavan Mukund, IIT Madras",
    "duration_weeks": 8,
    "url": "https://nptel.ac.in/courses/106106145",
    "free": true,
    "certification": true
  }
}
```

---

## 📌 HOW THE APP WILL LOAD DATA

The backend will merge old + new at startup (existing data takes priority):

```
Startup Load Order:
1. Load existing role_skills_db.json           (254 roles — UNTOUCHED)
2. Load new_roles_skills.json                  (500+ new roles — ADDED)
3. Merge → Combined 754+ roles in memory

Same for market_data, zone_matrix, projects, job titles
```

**Company Rule**: Existing data = ground truth. New data = supplementary. No conflicts.

---

## ⚡ WHAT TO DO NOW

1. **Download files** from Kaggle/O*NET/NCO (search names from previous message)
2. **Place files** in `backend/datasets/raw/`
3. **Tell me** "Files are ready" — I will immediately:
   - Parse each downloaded file
   - Create new JSON files in the exact same schema
   - Write the merge logic in the backend
   - Zero changes to existing company databases
