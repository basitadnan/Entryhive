import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using the same API key from your extraction script
const API_KEY = "AQ.Ab8RN6L3cNP6XYxEFryp1jqJefd9gGOXiqQuIaPh5ZnXg6XCrg";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = [
  'fast_english_questions.json',
  'fast_basic_maths_questions.json',
  'fast_advance_maths_questions.json',
  'fast_iq_questions.json'
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  for (const filename of files) {
    const filePath = path.join(DB_DIR, filename);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\n================================`);
    console.log(`Processing file: ${filename}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let questions = JSON.parse(content);
    
    // Find missing explanations
    let missingIndexes = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const exp = (q.explanation || '').trim().toLowerCase();
      // If it's missing, too short, or has the "not provided" placeholder
      if (!exp || exp.length < 10 || exp.includes('not provided') || exp.includes('placeholder')) {
        missingIndexes.push(i);
      }
    }
    
    console.log(`Found ${missingIndexes.length} missing explanations in ${filename}`);
    
    if (missingIndexes.length === 0) continue;
    
    const BATCH_SIZE = 10;
    for (let i = 0; i < missingIndexes.length; i += BATCH_SIZE) {
      const batchIndexes = missingIndexes.slice(i, i + BATCH_SIZE);
      const batchQuestions = batchIndexes.map(idx => ({
        id: questions[idx].id,
        text: questions[idx].text || questions[idx].question,
        options: questions[idx].options,
        correctAnswer: questions[idx].correctAnswer
      }));
      
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(missingIndexes.length/BATCH_SIZE)}...`);
      
      const prompt = `
      You are an expert test prep tutor. I will provide you with a JSON array of multiple-choice questions along with their correct answers.
      For each question, write a short, concise, and clear 1-2 sentence explanation of WHY the correct answer is correct.
      
      Questions:
      ${JSON.stringify(batchQuestions, null, 2)}
      
      Return ONLY a JSON object where the keys are the question "id" and the values are your generated explanation string.
      Do NOT wrap the JSON in markdown blocks (e.g., no \`\`\`json). Just return the raw JSON object.
      Example format:
      {
        "id1": "Explanation for id1...",
        "id2": "Explanation for id2..."
      }
      `;
      
      try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        // Clean up markdown block if model still outputs it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const explanations = JSON.parse(text);
        
        let addedInBatch = 0;
        for (const idx of batchIndexes) {
          const qId = questions[idx].id;
          if (explanations[qId]) {
            questions[idx].explanation = explanations[qId];
            addedInBatch++;
          }
        }
        
        console.log(`✅ Generated ${addedInBatch} explanations in this batch.`);
        
        // Save immediately so progress is not lost
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
        
      } catch (e) {
        console.error(`❌ Error generating batch:`, e.message);
      }
      
      // Don't wait after the very last batch of the very last file
      if (i + BATCH_SIZE < missingIndexes.length) {
        console.log(`Waiting 15 seconds to respect rate limits...`);
        await delay(15000);
      }
    }
    
    console.log(`Finished processing ${filename}`);
  }
  
  console.log(`\n🎉 All missing explanations have been generated and saved!`);
}

main();
