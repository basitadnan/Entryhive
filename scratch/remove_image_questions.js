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

// Regex to catch phrases that heavily imply an image/diagram is missing
const imageRegex = /\b(figure|diagram|shown below|following graph|in the graph|circuit|table below|following table|picture)\b/i;

let totalRemoved = 0;

for (const filename of files) {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  let questions = JSON.parse(content);
  
  const originalLength = questions.length;
  
  // Filter out questions that match the regex
  questions = questions.filter(q => {
    const text = (q.text || q.question || '').toLowerCase();
    // If it mentions figure, diagram, etc., we drop it
    return !imageRegex.test(text);
  });
  
  const removedCount = originalLength - questions.length;
  totalRemoved += removedCount;

  // Save the cleaned database back
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
  
  console.log(`${filename}: Removed ${removedCount} image-based questions. (Remaining: ${questions.length})`);
}

console.log(`\n✅ Total image-based questions removed: ${totalRemoved}`);
