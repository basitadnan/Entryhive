import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const models = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite-preview-06-17',
];

async function test() {
  for (const m of models) {
    try {
      console.log(`\nTesting: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("What is 2+2? Answer in one word.");
      console.log(`  ✅ SUCCESS: ${result.response.text().trim()}`);
    } catch (e) {
      // Check if it's a 429 (rate limit) vs 404 (not found) vs other
      const fullMsg = e.message;
      if (fullMsg.includes('429')) {
        console.log(`  ⚠️  AVAILABLE but RATE LIMITED (separate quota exists!)`);
      } else if (fullMsg.includes('404')) {
        console.log(`  ❌ NOT FOUND - model doesn't exist`);
      } else if (fullMsg.includes('503')) {
        console.log(`  ⚠️  AVAILABLE but BUSY (503) - try again later`);
      } else {
        console.log(`  ❌ ERROR: ${fullMsg.substring(0, 200)}`);
      }
    }
  }
}

test();
