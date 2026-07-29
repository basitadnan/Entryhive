import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));

let totalNoOptions = 0;
let totalNoPassage = 0;

for (const file of files) {
  const filePath = path.join(DB_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const originalLength = data.length;
  
  // Filter out questions
  const filtered = data.filter(q => {
    // Check missing options
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      totalNoOptions++;
      return false;
    }
    
    // Check missing passage
    // If the question mentions passage but is less than 40 words, it's missing the actual passage
    const text = (q.text || q.question || '').toLowerCase();
    const wordCount = text.split(/\s+/).length;
    if (
      wordCount < 40 && 
      (text.includes('according to the passage') || 
       text.includes('the author implies') || 
       text.includes('in the passage') || 
       text.includes('refer to the passage'))
    ) {
      totalNoPassage++;
      return false;
    }
    
    return true;
  });

  if (filtered.length !== originalLength) {
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    console.log(`Cleaned ${file}: Removed ${originalLength - filtered.length} broken questions.`);
  }
}

console.log(`\n✅ Data Cleaning Complete:`);
console.log(`- Removed ${totalNoOptions} questions with missing options.`);
console.log(`- Removed ${totalNoPassage} English questions missing their reading passages.`);
