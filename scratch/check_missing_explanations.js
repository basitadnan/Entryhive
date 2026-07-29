import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = [
  'fast_english_questions.json',
  'fast_basic_maths_questions.json',
  'fast_advance_maths_questions.json',
  'fast_iq_questions.json'
];

let totalMissing = 0;
let totalQuestions = 0;

for (const filename of files) {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(content);
  
  totalQuestions += questions.length;
  
  const missing = questions.filter(q => {
    const exp = (q.explanation || '').trim().toLowerCase();
    return !exp || exp.length < 10 || exp.includes('not provided') || exp.includes('placeholder');
  });
  
  console.log(`${filename}: ${missing.length} missing explanations out of ${questions.length}`);
  totalMissing += missing.length;
}

console.log(`\nTotal questions: ${totalQuestions}`);
console.log(`Total missing explanations: ${totalMissing}`);
