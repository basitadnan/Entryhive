import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = ['fast_english_questions.json', 'english_questions.json'];

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(DB_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  for (let q of data) {
    let text = (q.question || q.text || '').trim();
    
    // Skip normal questions
    if (text.split(' ').length > 4 || text.includes(':')) continue;

    // Fix format: Word (Synonym) -> Find the synonym of: Word
    if (text.toLowerCase().includes('(synonym)')) {
      const word = text.replace(/\(synonym\)/i, '').trim();
      text = `Find the synonym of: ${word}`;
      if(q.question) q.question = text;
      if(q.text) q.text = text;
      changed = true;
      totalFixed++;
      continue;
    }

    // Fix format: Word (Antonym) -> Find the antonym of: Word
    if (text.toLowerCase().includes('(antonym)')) {
      const word = text.replace(/\(antonym\)/i, '').trim();
      text = `Find the antonym of: ${word}`;
      if(q.question) q.question = text;
      if(q.text) q.text = text;
      changed = true;
      totalFixed++;
      continue;
    }

    // If it's just a single word (mostly in fast_english_questions)
    if (text.split(' ').length === 1) {
      // Hardcode the UNCOUTH exception since 'gracious' is an antonym
      if (text === 'UNCOUTH') {
        text = `Find the antonym of: ${text}`;
        q.correctAnswer = 'gracious'; // Fix missing answer
      } else if (text === 'SPATE') {
        text = `Find the synonym of: ${text}`;
        q.correctAnswer = 'flood'; // Fix wrong answer extraction
      } else {
        // The rest in that block were all synonyms
        text = `Find the synonym of: ${text}`;
      }
      if(q.question) q.question = text;
      if(q.text) q.text = text;
      changed = true;
      totalFixed++;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Fixed formatting in ${file}`);
  }
}

console.log(`\n✅ Successfully fixed ${totalFixed} short English questions!`);
