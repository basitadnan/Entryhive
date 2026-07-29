import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  'english_questions', 'analytical_questions', 'quantitative_questions',
  'physics_questions', 'chemistry_questions', 'mathematics_questions',
  'biology_questions', 'computer_science_questions', 'commerce_questions',
  'accounting_questions', 'economics_questions'
];

async function cleanAllTables() {
  console.log('Starting global database cleanup...');
  let totalFixed = 0;

  for (const table of TABLES) {
    console.log(`Checking table: ${table}`);
    const { data: rows, error } = await supabase.from(table).select('*');
    if (error || !rows) {
      console.log(`  Skipping ${table} (Empty or error)`);
      continue;
    }

    for (const row of rows) {
      let needsUpdate = false;
      let newExp = row.explanation || '';
      let newQuestion = row.question || '';
      let newOptions = [...(row.options || [])];

      // Fix explanation
      if (newExp.includes('ГåÆ') || newExp.includes('┬▓')) {
        newExp = newExp.replace(/ГåÆ/g, '→').replace(/┬▓/g, '²');
        needsUpdate = true;
      }

      // Fix question text
      if (newQuestion.includes('ГåÆ') || newQuestion.includes('┬▓')) {
        newQuestion = newQuestion.replace(/ГåÆ/g, '→').replace(/┬▓/g, '²');
        needsUpdate = true;
      }

      // Fix options (remove strange __ around numbers)
      for (let i = 0; i < newOptions.length; i++) {
        if (typeof newOptions[i] === 'string' && newOptions[i].match(/^__\(?\d+\)?__$/)) {
          newOptions[i] = newOptions[i].replace(/__\(?(\d+)\)?__/g, '$1');
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        // Ensure options are unique just in case cleaning made duplicates
        const uniqueOptions = [...new Set(newOptions)];
        const updateData = {
          explanation: newExp,
          question: newQuestion,
          options: uniqueOptions.length === row.options.length ? newOptions : row.options // Only update if lengths match to avoid breaking correct_option index
        };
        
        const { error: updateErr } = await supabase.from(table).update(updateData).eq('id', row.id);
        if (!updateErr) {
          totalFixed++;
          console.log(`  Fixed question ID: ${row.id}`);
        } else {
          console.error(`  Failed to fix question ID: ${row.id}`);
        }
      }
    }
  }

  console.log(`\nCleanup complete! Fixed ${totalFixed} formatting issues across all tables.`);
}

cleanAllTables();
