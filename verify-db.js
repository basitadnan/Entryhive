import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error("Error: Missing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, or VITE_GEMINI_API_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

// Use multiple models to get around per-model rate limits
const MODEL_NAMES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
let currentModelIndex = 0;

function getNextModel() {
  const modelName = MODEL_NAMES[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % MODEL_NAMES.length;
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json' }
  });
}

function getModelName() {
  // Return the name of the model that was LAST used (the one before current index)
  const idx = (currentModelIndex - 1 + MODEL_NAMES.length) % MODEL_NAMES.length;
  return MODEL_NAMES[idx];
}

const TABLES = [
  'english_questions', 'analytical_questions', 'quantitative_questions',
  'physics_questions', 'chemistry_questions', 'mathematics_questions',
  'biology_questions', 'computer_science_questions', 'commerce_questions',
  'accounting_questions', 'economics_questions'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry with model rotation and exponential backoff
async function callGeminiWithRetry(prompt, maxRetries = 9) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const model = getNextModel();
    const modelName = getModelName();
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('429') || msg.includes('503')) {
        // Parse the suggested retry delay if available
        const retryMatch = msg.match(/retry in ([\d.]+)s/i);
        let waitTime = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) * 1000 : (5000 * Math.pow(2, Math.floor(attempt / MODEL_NAMES.length)));
        waitTime = Math.min(waitTime, 120000); // Cap at 2 minutes
        
        console.log(`    [${modelName}] Rate limited. Waiting ${Math.round(waitTime/1000)}s before trying next model...`);
        await sleep(waitTime);
      } else {
        console.error(`    [${modelName}] Non-rate-limit error: ${msg.substring(0, 150)}`);
        return null;
      }
    }
  }
  console.error(`    All ${maxRetries} retry attempts exhausted.`);
  return null;
}

async function verifyTable(table, fixMode) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Auditing table: ${table}`);
  console.log(`${'='.repeat(60)}`);

  const { data: questions, error } = await supabase.from(table).select('*').order('id');
  if (error) {
    console.error(`Error fetching from ${table}:`, error.message);
    return { mismatches: 0, fixed: 0 };
  }
  if (!questions || questions.length === 0) {
    console.log(`No questions found in ${table}.`);
    return { mismatches: 0, fixed: 0 };
  }

  console.log(`Found ${questions.length} questions. Processing in batches of 25...`);
  const batchSize = 25;
  let mismatchCount = 0;
  let fixedCount = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(questions.length / batchSize);
    console.log(`\n  Batch ${batchNum}/${totalBatches} (${batch.length} questions)...`);

    const formattedQuestions = batch.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      current_correct_index: q.correct_option,
      explanation: q.explanation
    }));

    const prompt = `You are an expert academic evaluator. Check the logical correctness of these multiple-choice questions from the "${table}" subject table.

For EACH question:
1. Read the question and all options carefully.
2. Determine the objectively correct answer.
3. Check if "current_correct_index" (0-based) points to the right option.
4. If the current index is WRONG, provide the correct index and a clear explanation.
5. If the current index is RIGHT, mark is_correct as true.

Return a JSON array with one entry per question:
[
  {
    "id": "<question uuid>",
    "is_correct": true | false,
    "calculated_correct_option_index": 0 | 1 | 2 | 3,
    "explanation": "<Clear step-by-step explanation of the correct answer>"
  }
]

Questions:
${JSON.stringify(formattedQuestions, null, 2)}`;

    const verifiedBatch = await callGeminiWithRetry(prompt);
    
    if (!verifiedBatch || !Array.isArray(verifiedBatch)) {
      console.log(`  ⚠️  Skipped batch ${batchNum} (API failure after retries)`);
      continue;
    }

    for (const v of verifiedBatch) {
      const original = batch.find(q => q.id === v.id);
      if (!original) continue;

      if (v.calculated_correct_option_index !== original.correct_option) {
        mismatchCount++;
        console.log(`\n  🔴 [MISMATCH] ID: ${original.id}`);
        console.log(`     Q: ${original.question.substring(0, 100)}...`);
        original.options.forEach((opt, idx) => {
          const markers = [];
          if (idx === original.correct_option) markers.push('MARKED');
          if (idx === v.calculated_correct_option_index) markers.push('TRUE');
          console.log(`     ${idx}: ${opt} ${markers.length ? `(${markers.join(' + ')})` : ''}`);
        });

        if (fixMode) {
          const { error: updateErr } = await supabase
            .from(table)
            .update({
              correct_option: v.calculated_correct_option_index,
              explanation: v.explanation
            })
            .eq('id', original.id);

          if (!updateErr) {
            fixedCount++;
            console.log(`     ✅ FIXED in Supabase`);
          } else {
            console.error(`     ❌ Failed to update: ${updateErr.message}`);
          }
        }
      }
    }

    console.log(`  ✓ Batch ${batchNum} done.`);
    // Small delay between batches
    await sleep(2000);
  }

  console.log(`\n  📊 ${table} summary: ${mismatchCount} mismatches${fixMode ? `, ${fixedCount} fixed` : ''}`);
  return { mismatches: mismatchCount, fixed: fixedCount };
}

async function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');
  const tableArgIndex = args.indexOf('--table');
  const startArgIndex = args.indexOf('--start');
  let targetTable = null;
  let startFromTable = null;

  if (tableArgIndex !== -1 && args[tableArgIndex + 1]) {
    targetTable = args[tableArgIndex + 1];
  }
  if (startArgIndex !== -1 && args[startArgIndex + 1]) {
    startFromTable = args[startArgIndex + 1];
  }

  console.log(`Mode: ${fixMode ? '🔧 FIX (will update Supabase)' : '🔍 DRY RUN (report only)'}`);
  console.log(`Models: ${MODEL_NAMES.join(' → ')} (rotating)`);
  console.log('');

  let totalMismatches = 0;
  let totalFixed = 0;

  if (targetTable) {
    if (!TABLES.includes(targetTable)) {
      console.error(`Invalid table. Choose from:\n${TABLES.join(', ')}`);
      process.exit(1);
    }
    const result = await verifyTable(targetTable, fixMode);
    totalMismatches += result.mismatches;
    totalFixed += result.fixed;
  } else {
    let started = !startFromTable;
    for (const table of TABLES) {
      if (!started) {
        if (table === startFromTable) started = true;
        else { console.log(`Skipping ${table} (--start)...`); continue; }
      }
      const result = await verifyTable(table, fixMode);
      totalMismatches += result.mismatches;
      totalFixed += result.fixed;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏁 FINAL REPORT`);
  console.log(`Total mismatches: ${totalMismatches}`);
  if (fixMode) console.log(`Total fixed: ${totalFixed}`);
  console.log(`${'='.repeat(60)}`);
}

main();
