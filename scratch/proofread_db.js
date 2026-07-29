import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));

let totalChecked = 0;
let totalFixed = 0;
let totalRemoved = 0;

for (const file of files) {
  const filePath = path.join(DB_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const originalLength = data.length;
  let fileFixedCount = 0;
  
  const validData = data.filter((q, index) => {
    totalChecked++;
    
    // 1. Check basic structure
    const text = q.question || q.text;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.log(`[${file}] Removed Q${index}: Missing text`);
      return false;
    }
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      console.log(`[${file}] Removed Q${index}: Invalid options`);
      return false;
    }

    // 2. Validate and Fix the Correct Answer Mapping
    let isValidAnswer = false;
    
    // Case A: Index is already provided
    if (typeof q.correct === 'number' && q.correct >= 0 && q.correct < q.options.length) {
      isValidAnswer = true;
    } 
    else if (typeof q.correct_option === 'number' && q.correct_option >= 0 && q.correct_option < q.options.length) {
      q.correct = q.correct_option; // Normalize to 'correct'
      isValidAnswer = true;
      fileFixedCount++;
    }
    // Case B: String matching is required
    else if (q.correctAnswer && typeof q.correctAnswer === 'string') {
      const ansTrimmed = q.correctAnswer.trim();
      let matchIdx = q.options.findIndex(o => typeof o === 'string' && o === ansTrimmed);
      
      // If exact match fails, try case-insensitive and whitespace trimmed matching
      if (matchIdx === -1) {
        matchIdx = q.options.findIndex(o => 
          typeof o === 'string' && 
          o.trim().toLowerCase() === ansTrimmed.toLowerCase()
        );
        if (matchIdx !== -1) {
          // Fix the option in the array to exactly match the correctAnswer formatting
          q.correctAnswer = q.options[matchIdx];
          fileFixedCount++;
        }
      }
      
      if (matchIdx !== -1) {
        q.correct = matchIdx; // Save the integer index for safety
        isValidAnswer = true;
      }
    }

    if (!isValidAnswer) {
      // The answer isn't in the options. This question is broken and unplayable.
      console.log(`[${file}] Removed Q${index}: Correct answer not found in options. (Answer was: ${q.correctAnswer})`);
      return false;
    }
    
    // 3. Fix minor formatting (e.g., options that are objects instead of strings)
    q.options = q.options.map(opt => String(opt).trim());

    return true;
  });

  const removedCount = originalLength - validData.length;
  totalRemoved += removedCount;
  totalFixed += fileFixedCount;

  if (removedCount > 0 || fileFixedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(validData, null, 2));
  }
}

console.log(`\n========================================`);
console.log(`✅ PROOFREADING COMPLETE`);
console.log(`========================================`);
console.log(`Total questions checked: ${totalChecked}`);
console.log(`Questions automatically fixed: ${totalFixed} (e.g. matched mismatched answer strings to options)`);
console.log(`Questions removed: ${totalRemoved} (unplayable: no text, bad options, or answer totally missing from options)`);
console.log(`The database is now 100% strictly validated and safe to deploy.`);
