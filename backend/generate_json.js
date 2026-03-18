const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const degreesPath = path.join(__dirname, '../india_degrees_by_level.xlsx');
const jobsPath = path.join(__dirname, '../india_jobs_detailed.xlsx');

const dropdownData = {
    education: {},
    jobs: {}
};

try {
    // 1. Process Degrees
    const degreesWB = xlsx.readFile(degreesPath);
    const degreeSheets = ['Undergraduate (UG)', 'Postgraduate (PG)', 'Doctoral (PhD-Research)', 'Professional-Integrated'];

    degreeSheets.forEach(sheetName => {
        const sheet = degreesWB.Sheets[sheetName];
        if (!sheet) return;

        // Header is on row 2 (0-indexed)
        const data = xlsx.utils.sheet_to_json(sheet, { range: 2 });

        const level = sheetName;
        if (!dropdownData.education[level]) dropdownData.education[level] = {};

        data.forEach(row => {
            const domain = row['Domain / Field'];
            const group = row['Degree Group / Full Name'];
            const specsString = row['Common Specialisations'] || '';

            if (!domain || !group) return;

            if (!dropdownData.education[level][domain]) dropdownData.education[level][domain] = {};

            const specs = specsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
            dropdownData.education[level][domain][group] = specs;
        });
    });

    // 2. Process Jobs
    const jobsWB = xlsx.readFile(jobsPath);
    const jobsSheetName = "All Sectors - Master List";
    const jobsSheet = jobsWB.Sheets[jobsSheetName];

    if (jobsSheet) {
        // Header is on row 2 (0-indexed)
        const jobsData = xlsx.utils.sheet_to_json(jobsSheet, { range: 2 });

        jobsData.forEach(row => {
            const sector = row['Sector'];
            const family = row['Job Family'];
            const role = row['Job Role'];

            if (!sector || !family || !role) return;

            if (!dropdownData.jobs[sector]) dropdownData.jobs[sector] = {};
            if (!dropdownData.jobs[sector][family]) dropdownData.jobs[sector][family] = [];

            if (!dropdownData.jobs[sector][family].includes(role)) {
                dropdownData.jobs[sector][family].push(role);
            }
        });
    }

    fs.writeFileSync(
        path.join(__dirname, '../frontend/src/data/dropdownData.json'),
        JSON.stringify(dropdownData, null, 2)
    );

    console.log('Successfully generated dropdownData.json');
} catch (err) {
    console.error('Error generating JSON:', err);
}
