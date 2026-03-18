const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../IT_Workforce_Intelligence_225_Roles_Free_Resources.xlsx');

try {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log('Sheet Names:', sheetNames);
  
  let allData = {};

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    allData[sheetName] = data.slice(0, 3); // just sample 3 rows per sheet
  }
  
  fs.writeFileSync('excel_sample.json', JSON.stringify(allData, null, 2));
  console.log('Sample saved to excel_sample.json');
} catch (error) {
  console.error('Error reading excel:', error.message);
}
