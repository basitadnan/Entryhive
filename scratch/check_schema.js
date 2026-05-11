import { db } from './src/lib/dbClient.js';

async function checkSchema() {
  try {
    const questions = await db.db.findMany('questions', { limit: 1 });
    console.log('Questions table exists. Sample:', questions);
  } catch (e) {
    console.log('Questions table likely does not exist or error:', e.message);
  }
}

checkSchema();
