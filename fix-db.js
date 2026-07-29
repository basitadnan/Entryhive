import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixQuestions() {
  console.log('Fixing Q3: "Statement: \'Some South Asian..."');
  let { data: q3 } = await supabase.from('analytical_questions').select('*').ilike('question', '%Some South Asian countries%');
  if (q3 && q3.length > 0) {
    const newExp = q3[0].explanation.replace(/ГåÆ/g, '→');
    await supabase.from('analytical_questions').update({ explanation: newExp }).eq('id', q3[0].id);
    console.log('Fixed Q3!');
  } else { console.log('Q3 not found.'); }

  console.log('Fixing Q4: "If ROSE is coded..."');
  let { data: q4 } = await supabase.from('analytical_questions').select('*').ilike('question', '%If ROSE is coded as%');
  if (q4 && q4.length > 0) {
    const newExp = q4[0].explanation.replace(/ГåÆ/g, '→');
    await supabase.from('analytical_questions').update({ explanation: newExp }).eq('id', q4[0].id);
    console.log('Fixed Q4!');
  } else { console.log('Q4 not found.'); }

  console.log('Fixing Q5: "What number comes next: 144..."');
  let { data: q5 } = await supabase.from('analytical_questions').select('*').ilike('question', '%What number comes next: 144%');
  if (q5 && q5.length > 0) {
    const newExp = q5[0].explanation.replace(/┬▓/g, '²').replace(/ГåÆ/g, '→');
    await supabase.from('analytical_questions').update({ explanation: newExp }).eq('id', q5[0].id);
    console.log('Fixed Q5!');
  } else { console.log('Q5 not found.'); }

  console.log('Fixing Q6: "Find the odd one out: 3, 5, 11..."');
  let { data: q6 } = await supabase.from('analytical_questions').select('*').ilike('question', '%Find the odd one out: 3, 5, 11%');
  if (q6 && q6.length > 0) {
    // Fix options array if it contains __()__
    const fixedOptions = q6[0].options.map(opt => {
      if (typeof opt === 'string') {
        return opt.replace(/__\((\d+)\)__/g, '$1').replace(/__/g, '');
      }
      return opt;
    });
    // Ensure uniqueness just in case
    const uniqueOptions = [...new Set(fixedOptions)];
    if(uniqueOptions.length < 4) {
      // If we accidentally collapsed options to be identical, let's just use standard options
      uniqueOptions.push('17', '5', '3'); // fallback
    }
    await supabase.from('analytical_questions').update({ options: uniqueOptions.slice(0,4) }).eq('id', q6[0].id);
    console.log('Fixed Q6!');
  } else { console.log('Q6 not found.'); }
}

fixQuestions();
