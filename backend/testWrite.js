const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'records');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const file = path.join(dir, 'test_manual.json');
fs.writeFileSync(file, JSON.stringify({ test: 'success' }, null, 2));
console.log('File written to:', file);
