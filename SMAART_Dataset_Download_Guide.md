# SMAART — Dataset Download Guide

> **Action Required**: Download these datasets to expand SMAART's data coverage.  
> **Date**: March 2026 · **Current State**: 254 roles, 1,667 titles, 20 degrees, 2 domains

---

## 🔴 CRITICAL: What We Have vs What India Needs

| Data Type | Current Count | India Reality | Gap |
|-----------|--------------|---------------|-----|
| Career Roles | 254 | **2,000+** occupations exist (NCO-2015) | **Missing 1,746 roles** |
| Job Titles | 1,667 | **97,000+** unique job postings (Kaggle) | **Missing 95,000+ titles** |
| Degree Programs | 20 | **250+** recognized degree types (UGC) | **Missing 230 degrees** |
| Domains | 2 (Engg, Commerce) | **15+** (add Medical, Law, Arts, Science, Agriculture, Design, Management, Pharmacy, Architecture, Education, Hotel Mgmt, Media, Defence, Govt Services, Sports) | **Missing 13 domains** |
| Courses with Links | ~0 (text only) | **4,000+** NPTEL courses with URLs | **Missing all course links** |
| Salary Data Points | 254 | **97,000+** (Kaggle 2025 data) | **Need city-wise, experience-wise** |

---

## 📥 DOWNLOAD THESE NOW — Direct Links

### 1. 🏆 Indian Job Market Dataset 2025 — 97,000+ Jobs (HIGHEST PRIORITY)
- **What**: 97,000+ real Indian job listings with role titles, companies, skills, salary, experience
- **Format**: XLSX (can convert to JSON)
- **Download**: [https://www.kaggle.com/datasets/sauravjain/indian-job-market-dataset-2025](https://www.kaggle.com/datasets/sauravjain/indian-job-market-dataset-2025)
- **Fields**: Job Title, Company, Location, Skills Required, Experience, Salary (LPA)
- **How we'll use it**: Extract unique role titles → expand `jobRolesData.json` from 1,667 → 10,000+

### 2. 🏢 O*NET Occupation Database — 1,000+ Detailed Role Profiles
- **What**: World's most comprehensive occupation database — 1,000+ roles with skills, knowledge, abilities
- **Format**: CSV / Excel (tab-delimited text files)
- **Download**: [https://www.onetcenter.org/database.html#individual-files](https://www.onetcenter.org/database.html#individual-files)
- **Key Files to Download**:
  - `Occupation Data.txt` — All 1,000+ occupation titles
  - `Skills.txt` — Skills required per occupation (rated by importance)
  - `Knowledge.txt` — Knowledge areas per occupation
  - `Abilities.txt` — Required abilities
  - `Technology Skills.txt` — Tech tools & software per role
- **How we'll use it**: Map O*NET roles to Indian job titles, import skill profiles → expand `role_skills_db.json` from 254 → 800+

### 3. 🇮🇳 NCO 2015 — India's Official Occupation Classification (CSV)
- **What**: India's National Classification of Occupations — 2,000+ occupation codes with descriptions
- **Format**: CSV
- **Download**: [https://www.r-bloggers.com/2024/12/indias-2015-national-classification-of-occupations-data-file/](https://www.r-bloggers.com/2024/12/indias-2015-national-classification-of-occupations-data-file/)
- **Original Source**: Ministry of Labour and Employment
- **Fields**: NCO Code, Occupation Title, Description, Skill Level
- **How we'll use it**: Complete Indian occupation taxonomy → expand career roles to 500+

### 4. 📚 NPTEL Course Catalog — 4,000+ Free Courses with URLs
- **What**: All NPTEL (IIT/IISc) courses with names, instructors, timelines, and direct URLs
- **Format**: CSV (Kaggle dataset)
- **Download**: [https://www.kaggle.com/datasets/NPTELytics/nptel-courses](https://www.kaggle.com/datasets/NPTELytics/nptel-courses)
- **Fields**: Course Name, Instructor, Institute, Duration, URL, Discipline
- **How we'll use it**: Map courses to skills in `role_skills_db.json` → add real course links to learning paths

### 5. 💰 India Job Market & Salary Dataset (City-wise)
- **What**: Indian job titles with monthly salary data across cities and states
- **Format**: CSV
- **Download**: [https://www.kaggle.com/datasets/iamsouravbanerjee/india-job-market-salary-dataset](https://www.kaggle.com/datasets/iamsouravbanerjee/india-job-market-salary-dataset)
- **Fields**: Job Title, Location, Monthly Salary, State
- **How we'll use it**: Add city-wise salary data → make salary estimates region-specific

### 6. 💼 Indian Fresher Job Market 2025 — 500 Records
- **What**: Focused dataset for freshers — salary trends, skills, hiring processes
- **Format**: CSV
- **Download**: [https://www.kaggle.com/datasets/satyamnigam/indian-job-market-dataset-2024-25](https://www.kaggle.com/datasets/satyamnigam/indian-job-market-dataset-2024-25)
- **Fields**: Job Role, Company, Location, Skills, Annual Salary (LPA), Company Type
- **How we'll use it**: Fresher-specific salary baselines for new graduates

### 7. 📊 India Job Market & Salary Trends 2026
- **What**: Latest 2026 salary and job trend data
- **Format**: CSV
- **Download**: [https://www.kaggle.com/datasets/utkarshsaxena01/india-job-market-salary-trends-2026](https://www.kaggle.com/datasets/utkarshsaxena01/india-job-market-salary-trends-2026)
- **Fields**: Job Title, Company, Location, Experience, Skills, Min/Max Salary, Employment Type
- **How we'll use it**: Update `market_data.json` with latest 2026 salary ranges

### 8. 🎓 AISHE (All India Survey on Higher Education) Reports
- **What**: Complete list of all degrees, colleges, student enrollment in India
- **Format**: PDF / Excel Reports
- **Download**: [https://aishe.gov.in/aishe/home](https://aishe.gov.in/aishe/home) → go to Reports section
- **How we'll use it**: Extract all recognized degrees → expand `dropdownData.json` from 20 → 200+ degrees

### 9. 🏫 UGC Recognized Degree Programs
- **What**: Official list of all UGC-approved degree programs
- **Format**: PDF
- **Download**: [https://www.ugc.gov.in/deb](https://www.ugc.gov.in/deb) → Programs section
- **How we'll use it**: Verify and add all recognized Indian degrees to the platform

---

## 🔧 After You Download: What To Do With Each Dataset

### Step 1: Expand Job Roles (254 → 800+)
```
Download: O*NET (Occupation Data.txt) + NCO 2015 (CSV)
  → I will merge, deduplicate, and create Indian-relevant roles
  → Updates: role_skills_db.json, mockRoles.js
```

### Step 2: Expand Job Titles (1,667 → 10,000+)
```
Download: Kaggle 97K Indian Jobs (XLSX)
  → I will extract unique job titles, map to career families
  → Updates: jobRolesData.json
```

### Step 3: Expand Degrees (20 → 100+)
```
Download: AISHE reports + UGC list
  → I will create comprehensive degree taxonomy for India
  → Updates: dropdownData.json
  → Then rerun: node dataset_builder/generate_zone_matrix.js
```

### Step 4: Add Course Links
```
Download: NPTEL Kaggle dataset (4,000+ courses)
  → I will map courses to skills per role
  → Updates: role_skills_db.json (where_to_learn field)
```

### Step 5: Add City-wise Salary Data
```
Download: India Salary Dataset (CSV)
  → I will create city-wise salary tables
  → Updates: market_data.json
```

---

## 📋 Priority Order for Downloads

| Priority | Dataset | Impact | Time to Integrate |
|----------|---------|--------|-------------------|
| 🔴 **1** | Kaggle 97K Indian Jobs | Expands titles from 1,667 → 10,000+ | 30 mins |
| 🔴 **2** | O*NET Occupation Database | Adds 1,000+ role profiles with skills | 1 hour |
| 🔴 **3** | NCO 2015 CSV | Indian occupation taxonomy (2,000+ roles) | 45 mins |
| 🟡 **4** | NPTEL Course Catalog | 4,000+ free courses with URLs for learning paths | 30 mins |
| 🟡 **5** | Kaggle 2026 Salary Trends | Latest salary data | 20 mins |
| 🟢 **6** | India Salary Dataset | City-wise salary breakdown | 20 mins |
| 🟢 **7** | Kaggle Fresher Dataset | Fresher-specific data | 15 mins |
| 🟢 **8** | AISHE Reports | Complete degree list | 1 hour (manual PDF extraction) |
| 🟢 **9** | UGC Degree Programs | Official degree verification | 30 mins |

---

## After Integration: New Counts (Target)

| Data Type | Current | After Phase 1 (Top 3) | After All |
|-----------|---------|----------------------|-----------|
| Career Roles | 254 | **800+** | **1,500+** |
| Job Titles | 1,667 | **10,000+** | **25,000+** |
| Degree Programs | 20 | **50+** | **200+** |
| Domains | 2 | **8** | **15** |
| Skills per Role | ~15 avg | ~25 avg | ~30 avg |
| Course Links | ~0 | **4,000+** | **5,000+** |
| Salary Data Points | 254 | **1,000+** | **97,000+** |

---

## ⚡ Quick Start: Download These 3 First

1. **Go to**: https://www.kaggle.com/datasets/sauravjain/indian-job-market-dataset-2025 → Download
2. **Go to**: https://www.onetcenter.org/database.html#individual-files → Download "All Files"
3. **Go to**: https://www.r-bloggers.com/2024/12/indias-2015-national-classification-of-occupations-data-file/ → Download CSV

Place downloaded files in: `backend/datasets/raw/` — I will write scripts to parse and integrate them.
