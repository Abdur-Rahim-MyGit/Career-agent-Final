const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const jobsPath = path.join(__dirname, '../india_jobs_detailed.xlsx');
const jobsWB = xlsx.readFile(jobsPath);
const sheet = jobsWB.Sheets["All Sectors - Master List"];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

fs.writeFileSync('job_preview.json', JSON.stringify(rows.slice(0, 10), null, 2));
