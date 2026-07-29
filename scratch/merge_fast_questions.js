import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUTS_DIR = path.join(__dirname, 'fast_outputs');
const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = fs.readdirSync(OUTPUTS_DIR).filter(f => f.endsWith('.json'));

const mappedFiles = {
  'english': 'fast_english_questions.json',
  'basic_maths': 'fast_basic_maths_questions.json',
  'advance_maths': 'fast_advance_maths_questions.json',
  'iq': 'fast_iq_questions.json',
  'physics': 'fast_physics_questions.json'
};

// Load existing
const db = {};
for (const [subject, filename] of Object.entries(mappedFiles)) {
  const filePath = path.join(DB_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      db[subject] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${filename}:`, e);
      db[subject] = [];
    }
  } else {
    db[subject] = [];
  }
}

let addedCount = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(OUTPUTS_DIR, file), 'utf8');
  let questions;
  try {
    questions = JSON.parse(content);
  } catch (e) {
    console.log(`Skipping invalid JSON file: ${file}`);
    continue;
  }
  
  if (!Array.isArray(questions)) continue;
  
  for (const q of questions) {
    let subject = q.subject;
    if (subject) subject = subject.toLowerCase();
    
    if (!subject || !db[subject]) {
      // Map unknown subjects if needed, or fallback to iq
      if (subject === 'maths' || subject === 'math') subject = 'basic_maths';
      else subject = 'iq'; // default fallback just in case
    }
    
    const uniqueId = `fast_${subject}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    db[subject].push({
      id: uniqueId,
      text: q.text || q.question || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      subject: subject
    });
    addedCount++;
  }
}

// Save back
for (const [subject, filename] of Object.entries(mappedFiles)) {
  const filePath = path.join(DB_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(db[subject], null, 2));
  console.log(`Saved ${db[subject].length} total questions to ${filename}`);
}

console.log(`\n✅ Successfully added ${addedCount} new questions from extracted PDFs into the database!`);
