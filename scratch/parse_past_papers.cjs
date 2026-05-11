const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Adnan\\Videos\\LEmu Video';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));

const results = [];

function getTrack(filename) {
    const fn = filename.toLowerCase();
    if (fn.includes('ics')) return 'ICS';
    if (fn.includes('nat-ie')) return 'Engineering';
    if (fn.includes('nat-im')) return 'Medical';
    if (fn.includes('nat-ia')) return 'Arts';
    if (fn.includes('nat-gs')) return 'General Science';
    return 'General';
}

function parseFile(filename, content) {
    if (!content.trim()) return null;

    const questions = [];
    let currentSection = 'General';
    const track = getTrack(filename);
    
    const lines = content.split('\n');
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Detect Section
        if (line.match(/Quantitative/i)) currentSection = 'Quantitative';
        else if (line.match(/Verbal/i)) currentSection = 'English';
        else if (line.match(/Analytical/i)) currentSection = 'Analytical';
        else if (line.match(/Subject|Computer|Physics|Math|Biology|Chemistry/i)) {
            // For subject section, try to be specific
            if (line.match(/Computer/i)) currentSection = 'Computer Science';
            else if (line.match(/Physics/i)) currentSection = 'Physics';
            else if (line.match(/Math/i)) currentSection = 'Mathematics';
            else if (line.match(/Biology/i)) currentSection = 'Biology';
            else if (line.match(/Chemistry/i)) currentSection = 'Chemistry';
            else currentSection = 'Subject';
        }

        const qMatch = line.match(/^(\d+)[.)]\s+(.*)/);
        if (qMatch) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = {
                section: currentSection,
                question_text: qMatch[2],
                options: [],
                correct_answer_index: null,
                explanation: '',
                difficulty: 'medium',
                is_past_paper: true,
                track: track,
                source_paper: filename.replace('.txt', '')
            };
            continue;
        }

        const oMatch = line.match(/^([A-Ea-e]|[a-e])[\).]\s+(.*)/) || line.match(/^\(([a-e])\)\s+(.*)/);
        if (oMatch && currentQuestion) {
            currentQuestion.options.push(oMatch[2].trim());
            continue;
        }

        const aMatch = line.match(/Answer:\s*([A-Ea-e])/i);
        if (aMatch && currentQuestion) {
            const letter = aMatch[1].toUpperCase();
            currentQuestion.correct_answer_index = letter.charCodeAt(0) - 65;
            continue;
        }

        if (currentQuestion && currentQuestion.options.length === 0) {
            currentQuestion.question_text += ' ' + line;
        }
    }
    if (currentQuestion) questions.push(currentQuestion);
    return questions;
}

files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const parsedQuestions = parseFile(file, content);
    if (parsedQuestions && parsedQuestions.length > 0) {
        results.push(...parsedQuestions);
    }
});

fs.writeFileSync('parsed_questions_flat.json', JSON.stringify(results, null, 2));
console.log(`Parsed total ${results.length} questions.`);
