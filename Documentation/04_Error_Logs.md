# 04 - Error Logs & Troubleshooting Tracking

This document serves as a central registry for all blocking errors encountered during implementation, testing, and production. Keep logs detailed for rapid team debugging.

## Active Blockers

| Date       | Component           | Error Snippet / Description                             | Status | Assigned / Notes                                      |
|------------|---------------------|---------------------------------------------------------|--------|-------------------------------------------------------|
| 2026-xx-xx | `engine.js` (Rules) | OPENROUTER LLM timeout causing onboarding to fail.      | 🟡 FIX | Being removed completely in favor of local Rule DB.   |
| 2026-xx-xx | Setup               | Missing `.env` file credentials.                        | 🔴 BLK | Awaiting user input to provide the current `.env`.    |

## Resolved Issues

| Date       | Component | Error Resolved | Fix Applied |
|------------|-----------|----------------|-------------|
|            |           |                |             |

---

### Debugging Workflows for the Team

**1. Rule Engine Calculation Mismatch**
If the Student Dashboard shows an incorrect Top Career Match:
- *Check:* Verify the array payload transmitted to `/api/onboarding`.
- *Check:* Manually log `engine.calculateDirectionScore()` output array in Node.js terminal before it hits the database.

**2. Database Seed Failures**
If `seed.js` throws a foreign key constraint error when parsing `role_skills_db.json`:
- *Check:* Ensure the `Skills` table is fully populated *before* the `RoleSkill` associative table attempts to insert records.

**3. Job Scraper Timeouts**
If `ml-service/scraper.py` fails to retrieve daily updates:
- *Check:* Verify IP is not rate-limited or blocked by LinkedIn CAPTCHA.
- *Check:* Ensure Playwright headless browser configuration is working in the deployment container.
