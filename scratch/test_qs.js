import { getQuestions } from '../src/lib/questionBank.js';

console.log("TESTING MATHEMATICS:");
const mathQs = getQuestions('mathematics', 'all', 10, [], null);
console.log(`Returned ${mathQs.length} questions.`);
mathQs.forEach(q => console.log(`[${q.topic || 'No topic'}] ${q.question}`));

console.log("\nTESTING PHYSICS:");
const physQs = getQuestions('physics', 'all', 10, [], null);
console.log(`Returned ${physQs.length} questions.`);
physQs.forEach(q => console.log(`[${q.topic || 'No topic'}] ${q.question}`));
