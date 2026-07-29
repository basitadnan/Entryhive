import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'fast_outputs');
const outputDir = path.join(__dirname, '../src/data/questions');

const grouped = {};

// Read all JSON files
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));

let totalCombined = 0;
let duplicates = 0;

files.forEach(file => {
    try {
        const raw = fs.readFileSync(path.join(inputDir, file), 'utf8');
        const questions = JSON.parse(raw);
        
        questions.forEach(q => {
            const subj = q.subject || 'general';
            if (!grouped[subj]) {
                grouped[subj] = [];
            }
            
            // Basic deduplication based on exact question text
            const isDuplicate = grouped[subj].some(existing => existing.text === q.text);
            if (!isDuplicate) {
                // generate a clean ID
                q.id = `fast_${subj}_${grouped[subj].length + 1}_${Math.random().toString(36).substr(2, 5)}`;
                grouped[subj].push(q);
                totalCombined++;
            } else {
                duplicates++;
            }
        });
    } catch (e) {
        console.error('Error parsing', file, e);
    }
});

console.log(`Combined ${totalCombined} unique questions! (Skipped ${duplicates} duplicates)`);

// Write grouped outputs
for (const [subj, qs] of Object.entries(grouped)) {
    const filename = `fast_${subj}_questions.json`;
    const outputPath = path.join(outputDir, filename);
    
    let existingQs = [];
    if (fs.existsSync(outputPath)) {
        existingQs = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    }
    
    // We overwrite completely since this is the new fresh batch, or we can append. 
    // Since this is the first real run, let's just overwrite.
    fs.writeFileSync(outputPath, JSON.stringify(qs, null, 2), 'utf8');
    console.log(`Wrote ${qs.length} questions to ${filename}`);
}
