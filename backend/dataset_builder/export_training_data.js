const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'records', 'training_log.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'records', 'training_export.jsonl');

function exportTrainingData({ ratedOnly = false, minRating = 4 } = {}) {
  if (!fs.existsSync(LOG_FILE)) { console.log('No training_log.json found.'); return; }
  const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  
  let entries = log.filter(e => e.prompt && e.completion);
  if (ratedOnly) entries = entries.filter(e => e.rating && e.rating >= minRating);

  const jsonl = entries.map(e => JSON.stringify({
    prompt: e.prompt,
    completion: e.completion,
    metadata: { zone: e.zone, degree: e.degree, role: e.role, rating: e.rating, timestamp: e.timestamp }
  })).join('\n');

  fs.writeFileSync(OUTPUT_FILE, jsonl);
  console.log(`Exported ${entries.length} entries to training_export.jsonl`);
  console.log(`Rated entries (4+): ${log.filter(e => e.rating >= 4).length}`);
  console.log(`Total entries: ${log.length}`);
}

// Run: node export_training_data.js
// Run rated only: node export_training_data.js --rated
const ratedOnly = process.argv.includes('--rated');
exportTrainingData({ ratedOnly, minRating: 4 });
