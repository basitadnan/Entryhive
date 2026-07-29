import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../src/data/questions');

const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));

const replacements = [
  { from: /ΓÇö/g, to: '—' },
  { from: /ΓÇô/g, to: '–' },
  { from: /ΓÇÖ/g, to: "’" },
  { from: /ΓÇ£/g, to: '“' },
  { from: /ΓÇ¥/g, to: '”' },
  { from: /├╖/g, to: '÷' },
  { from: /├ù/g, to: '×' },
  { from: /Γê₧/g, to: '∞' },
  { from: /ΓåÆ/g, to: '→' },
  { from: /Γéë/g, to: '₉' },
  { from: /Γéà/g, to: '₅' },
  { from: /Γéä/g, to: '₄' },
  { from: /Γéâ/g, to: '₃' },
  { from: /Γéé/g, to: '₂' },
  { from: /Γéü/g, to: '₁' },
  { from: /Γéç/g, to: '₇' },
  { from: /ΓéÖ/g, to: 'ₙ' },
  { from: /Γü┤/g, to: '⁴' },
  { from: /Γü╡/g, to: '⁵' },
  { from: /Γü╢/g, to: '⁶' },
  { from: /Γü╕/g, to: '⁸' },
  { from: /Γü┐/g, to: 'ⁿ' },
  { from: /Γü╗/g, to: '⁻' },
  { from: /Γü║/g, to: '⁺' },
  { from: /┬╣/g, to: '¹' },
  { from: /┬▓/g, to: '²' },
  { from: /┬│/g, to: '³' },
  { from: /╬╕/g, to: 'θ' },
  { from: /┬░/g, to: '°' },
  { from: /Γëê/g, to: '≈' },
  { from: /ΓëÑ/g, to: '≥' },
  { from: /Γëñ/g, to: '≤' },
  { from: /Γëá/g, to: '≠' },
  { from: /╧Ç/g, to: 'π' },
  { from: /╬ö/g, to: 'Δ' },
  { from: /╬╗/g, to: 'λ' },
  { from: /╬╝/g, to: 'μ' },
  { from: /╧ü/g, to: 'ρ' },
  { from: /╧â/g, to: 'σ' },
  { from: /ΓÇÖ/g, to: "'" },
  { from: /ΓÇÿ/g, to: "'" }
];

let totalReplaced = 0;

function cleanString(str) {
  if (typeof str !== 'string') return str;
  let newStr = str;
  for (const { from, to } of replacements) {
    newStr = newStr.replace(from, to);
  }
  return newStr;
}

for (const file of files) {
  const filePath = path.join(DB_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Quick check if file even contains any of the corrupted starting chars
  if (!content.includes('Γ') && !content.includes('├') && !content.includes('┬') && !content.includes('╬') && !content.includes('╧')) {
    continue;
  }
  
  let questions = JSON.parse(content);
  let changed = false;
  
  for (let q of questions) {
    const origQ = JSON.stringify(q);
    
    if (q.question) q.question = cleanString(q.question);
    if (q.text) q.text = cleanString(q.text);
    if (q.explanation) q.explanation = cleanString(q.explanation);
    if (q.correctAnswer) q.correctAnswer = cleanString(q.correctAnswer);
    if (Array.isArray(q.options)) {
      q.options = q.options.map(cleanString);
    }
    
    if (JSON.stringify(q) !== origQ) {
      changed = true;
      totalReplaced++;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
    console.log(`Cleaned formatting in ${file}`);
  }
}

console.log(`\n✅ Fixed formatting errors in ${totalReplaced} questions across the entire database!`);
