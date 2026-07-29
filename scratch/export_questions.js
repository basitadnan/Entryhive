import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase config in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  'english_questions', 'analytical_questions', 'quantitative_questions',
  'physics_questions', 'chemistry_questions', 'mathematics_questions',
  'biology_questions', 'computer_science_questions', 'commerce_questions',
  'accounting_questions', 'economics_questions'
];

async function exportAll() {
  const dir = join(__dirname, '../src/data/questions');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const table of TABLES) {
    console.log(`Fetching ${table}...`);
    // Fetch all rows
    let allData = [];
    let from = 0;
    const step = 1000;
    let done = false;

    while (!done) {
      const { data, error } = await supabase
        .from(table)
        .select('id, question, options, correct_option, explanation, difficulty')
        .range(from, from + step - 1);

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        break;
      }

      if (!data || data.length === 0) {
        done = true;
      } else {
        allData = allData.concat(data);
        if (data.length < step) {
          done = true;
        } else {
          from += step;
        }
      }
    }

    console.log(`Fetched ${allData.length} questions from ${table}.`);

    // Clean up fields just in case
    const cleaned = allData.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct_option: q.correct_option,
      explanation: q.explanation,
      difficulty: q.difficulty
    }));

    const filePath = join(dir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
    console.log(`Saved ${table}.json to ${filePath}`);
  }
  console.log("Export complete!");
}

exportAll();
