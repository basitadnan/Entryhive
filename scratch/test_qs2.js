import { getQuestions } from '../src/lib/questionBank.js';

console.log("TESTING ANALYTICAL:");
const anaQs = getQuestions('analytical', 'all', 10, [], null);
console.log(`Returned ${anaQs.length} questions.`);
anaQs.forEach(q => console.log(`[${q.topic || 'No topic'}] ${q.question}`));
