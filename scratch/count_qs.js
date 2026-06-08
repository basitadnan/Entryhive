import fs from 'fs';

const fileContent = fs.readFileSync('src/lib/questionBank.js', 'utf-8');

// Use regex to find all arrays named <something>Questions and count their length by parsing or executing
// A safer way is to just grep for `id:` or `{id:` which is present in every question.
const matches = fileContent.match(/\{id:/g);

console.log(`Total questions found via regex matching '{id:': ${matches ? matches.length : 0}`);

// Also let's count per subject by finding arrays
let subjectCounts = {};
let currentSubject = 'Unknown';

const lines = fileContent.split('\n');
let count = 0;

for (let line of lines) {
  if (line.includes('const ') && line.includes('Questions = [')) {
    if (count > 0) {
      subjectCounts[currentSubject] = count;
    }
    currentSubject = line.match(/const (.*?) = \[/)[1];
    count = 0;
  } else if (line.includes('const ') && line.includes('QuestionsExtra = [')) {
    if (count > 0) {
      subjectCounts[currentSubject] = count;
    }
    currentSubject = line.match(/const (.*?) = \[/)[1];
    count = 0;
  } else if (line.includes('const ') && line.includes(' = [')) {
      if (line.includes('newQuantQuestions') || line.includes('workAgePercentageProbabilityQuestions') || line.includes('countrySocietyStatements')) {
        if (count > 0) {
            subjectCounts[currentSubject] = count;
          }
          currentSubject = line.match(/const (.*?) = \[/)[1];
          count = 0;
      }
  }

  if (line.trim().startsWith('{id:')) {
    count++;
  }
}
if (count > 0) {
  subjectCounts[currentSubject] = count;
}

console.log("\nBreakdown by array:");
for (let [subject, c] of Object.entries(subjectCounts)) {
  console.log(`${subject}: ${c}`);
}
