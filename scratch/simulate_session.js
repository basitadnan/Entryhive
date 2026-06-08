import { getQuestions } from '../src/lib/questionBank.js';

function simulatePracticeSession(section) {
  let qs = getQuestions(section, 'all', 10, [], null);
  console.log(`\n--- SIMULATING: ${section} ---`);
  console.log(`Loaded ${qs.length} questions.`);
  if (qs.length > 0) {
    console.log(`First Question: [${qs[0].topic}] ${qs[0].question.substring(0, 50)}`);
  }
}

simulatePracticeSession('physics');
simulatePracticeSession('mathematics');
simulatePracticeSession('analytical');
simulatePracticeSession('computer_science');
