import english_questions from '@/data/questions/english_questions.json';
import analytical_questions from '@/data/questions/analytical_questions.json';
import quantitative_questions from '@/data/questions/quantitative_questions.json';
import physics_questions from '@/data/questions/physics_questions.json';
import chemistry_questions from '@/data/questions/chemistry_questions.json';
import mathematics_questions from '@/data/questions/mathematics_questions.json';
import biology_questions from '@/data/questions/biology_questions.json';
import computer_science_questions from '@/data/questions/computer_science_questions.json';
import commerce_questions from '@/data/questions/commerce_questions.json';
import accounting_questions from '@/data/questions/accounting_questions.json';
import economics_questions from '@/data/questions/economics_questions.json';

// FAST Specific Questions
import fast_english_questions from '@/data/questions/fast_english_questions.json';
import fast_basic_maths_questions from '@/data/questions/fast_basic_maths_questions.json';
import fast_advance_maths_questions from '@/data/questions/fast_advance_maths_questions.json';
import fast_iq_questions from '@/data/questions/fast_iq_questions.json';

const QUESTIONS_MAP = {
  english: english_questions,
  analytical: analytical_questions,
  quantitative: quantitative_questions,
  physics: physics_questions,
  chemistry: chemistry_questions,
  mathematics: mathematics_questions,
  biology: biology_questions,
  computer_science: computer_science_questions,
  commerce: commerce_questions,
  accounting: accounting_questions,
  economics: economics_questions,
  fast_english: fast_english_questions,
  fast_basic_maths: fast_basic_maths_questions,
  fast_advance_maths: fast_advance_maths_questions,
  fast_iq: fast_iq_questions,
};

// Utility to fix garbled UTF-8 characters (mojibake) from the database seed
function fixMojibake(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/Γê₧/g, '∞')
    .replace(/ΓåÆ/g, '→')
    .replace(/├ù/g, '×')
    .replace(/Γéë/g, '₉')
    .replace(/Γéà/g, '₅')
    .replace(/Γéä/g, '₄')
    .replace(/Γéâ/g, '₃')
    .replace(/Γéé/g, '₂')
    .replace(/Γéü/g, '₁')
    .replace(/Γéç/g, '₇')
    .replace(/ΓéÖ/g, 'ₙ')
    .replace(/Γü┤/g, '⁴')
    .replace(/Γü╡/g, '⁵')
    .replace(/Γü╢/g, '⁶')
    .replace(/Γü╕/g, '⁸')
    .replace(/Γü┐/g, 'ⁿ')
    .replace(/Γü╗/g, '⁻')
    .replace(/Γü║/g, '⁺')
    .replace(/┬╣/g, '¹')
    .replace(/┬▓/g, '²')
    .replace(/┬│/g, '³')
    .replace(/╬╕/g, 'θ')
    .replace(/┬░/g, '°')
    .replace(/Γëê/g, '≈')
    .replace(/ΓëÑ/g, '≥')
    .replace(/ΓêÆ/g, '-')
    .replace(/Γéå/g, '₆')
    .replace(/ΓéÇ/g, '₀')
    .replace(/Γü░/g, '⁰')
    .replace(/Γçî/g, '⇌')
    .replace(/┬▒/g, '±')
    .replace(/┬╜/g, '½')
    .replace(/Γ£ô/g, '✓')
    .replace(/╬⌐/g, 'Ω')
    .replace(/╬▒/g, 'α')
    .replace(/╬▓/g, 'β')
    .replace(/ΓêÜ/g, '√');
}

function fixOptionFormatting(opt) {
  if (typeof opt !== 'string') return opt;
  let fixed = fixMojibake(opt);
  // Remove "A. ", "B) ", "(C)", etc. from the start of the option
  fixed = fixed.replace(/^([a-zA-Z][\.\)]|\([a-zA-Z]\))\s*/, '');
  return fixed;
}

function processQuestion(q, section) {
  const bestText = q.question || q.question_text || q.text || '';
  
  let correctIndex = 0;
  if (typeof q.correct === 'number') {
    correctIndex = q.correct;
  } else if (typeof q.correct_answer_index === 'number') {
    correctIndex = q.correct_answer_index;
  } else if (typeof q.correct_option === 'number') {
    correctIndex = q.correct_option;
  } else if (Array.isArray(q.options) && q.correctAnswer) {
    const idx = q.options.indexOf(q.correctAnswer);
    correctIndex = idx !== -1 ? idx : 0;
  }
  
  return {
    ...q,
    section,
    difficulty: q.difficulty || 'medium',
    question: fixMojibake(bestText),
    question_text: fixMojibake(bestText),
    text: fixMojibake(bestText),
    options: Array.isArray(q.options) ? q.options.map(fixOptionFormatting) : [],
    explanation: fixMojibake(q.explanation || ''),
    correct: correctIndex
  };
}

export async function getQuestions(section, difficulty = 'all', count = 10, usedIds = [], subTopic = null) {
  const normalizedSection = section.toLowerCase();
  const questionsList = QUESTIONS_MAP[normalizedSection];
  
  console.log(`[getQuestions Local] requested section: "${section}", normalized: "${normalizedSection}"`);
  
  if (!questionsList) {
    console.log(`[getQuestions Local] WARNING: section "${normalizedSection}" not found, returning empty array.`);
    return [];
  }

  try {
    let pool = questionsList;
    
    if (difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }
    
    if (usedIds && usedIds.length > 0) {
      const usedSet = new Set(usedIds.map(String));
      pool = pool.filter(q => !usedSet.has(String(q.id)));
    }

    // Filter by subTopic locally if provided (optional feature support)
    if (subTopic) {
      pool = pool.filter(q => q.topic && q.topic.toLowerCase().includes(subTopic.toLowerCase()));
    }

    // Explicitly filter out analogy questions (indicated by '::') from analytical section
    if (normalizedSection === 'analytical') {
      pool = pool.filter(q => {
        const text = q.question || q.question_text || q.text || '';
        return !text.includes('::');
      });
    }

    // Shuffle array randomly
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    const finalSelection = shuffled.slice(0, count).map(q => processQuestion(q, normalizedSection));
    console.log(`[getQuestions Local] returning ${finalSelection.length} questions for ${normalizedSection}`);
    
    // Normalize fields for UI compatibility
    finalSelection.forEach(q => {
      q.question = q.question_text || q.question;
      q.text = q.question_text || q.text;
      q.correct = q.correct_answer_index !== undefined ? q.correct_answer_index : q.correct;
      q.correct_option = q.correct_answer_index !== undefined ? q.correct_answer_index : q.correct_option;
    });

    return finalSelection;

  } catch (err) {
    console.error(`[getQuestions Local] Error processing questions for ${normalizedSection}:`, err.message);
    return [];
  }
}


// ===== SUB-TOPIC CLASSIFIERS =====
// These classify questions by content since the DB doesn't have subtopic columns.

function classifyAnalytical(q) {
  const text = (q.question || '').toLowerCase();
  // Analogies (already filtered out but just in case)
  if (text.includes('::')) return 'analogy';
  // Statements-based: syllogisms, logical conclusions
  if (/\b(statement|conclusion|all .* are|some .* are|no .* are|if all|must be true|definitely true|cannot be determined|syllogism)\b/i.test(text)) return 'statements';
  // Scenario-based: seating, ordering, scheduling, relations, directions, coding, ranking
  if (/\b(sit|seat|row|circle|facing|direction|walk|north|south|east|west|rank|order|position|schedule|meeting|floor|shelf|stack|arrange|race|finish|older|taller|shorter|younger|brother|sister|father|mother|uncle|aunt|son|daughter|nephew|cousin|husband|wife|grandfather|grandmother|pointing|photograph|family|friend|coded|code|label|box|pet|occupation|task|assign|drink|house|paint|tournament|project|depends|train|depart|arrive)\b/i.test(text)) return 'scenario';
  // Default: series/pattern/odd-one-out → classify as scenario (logical reasoning)
  return 'scenario';
}

function classifyQuantitative(q) {
  const text = (q.question || '').toLowerCase();
  // Geometry
  if (/\b(triangle|circle|rectangle|square|area|perimeter|radius|diameter|circumference|angle|polygon|cone|sphere|cylinder|volume|surface area|parallel|perpendicular|hypotenuse|coordinate|midpoint|distance between|slope of line|equation of line|quadrilateral)\b/i.test(text)) return 'geometry';
  // Algebra
  if (/\b(solve|equation|expression|simplify.*x|factor|polynomial|quadratic|inequalit|variable|linear|simultaneous|x\s*[+=\-]|find x|value of x|if x|log|logarithm|exponent|indices|matrix|determinant|binomial|expansion)\b/i.test(text)) return 'algebra';
  // Default = Arithmetic (percentage, ratio, profit, loss, average, time, work, speed, series, probability etc.)
  return 'arithmetic';
}

function classifyEnglish(q) {
  const text = (q.question || '').toLowerCase();
  // Comprehension
  if (/\b(passage|paragraph|read the|according to the passage|the author|main idea|the text)\b/i.test(text)) return 'comprehension';
  // Antonym
  if (/\b(antonym|opposite|opposite of|opposite meaning)\b/i.test(text)) return 'antonym';
  // Synonym
  if (/\b(synonym|same meaning|similar meaning|means the same|closest in meaning|'' means)\b/i.test(text)) return 'synonym';
  // Analogy
  if (text.includes('::') || /\b(analogy|is to .* as)\b/i.test(text)) return 'analogy';
  // Default = Sentence completion (fill in the blank, choose correct word, preposition, grammar)
  return 'sentence_completion';
}

// Fetches from a section pool, classifies, and picks exact subtopic counts.
async function getClassifiedQuestions(section, classifier, subtopicCounts, usedIds = []) {
  // Fetch a large pool from the section
  const pool = await getQuestions(section, 'all', 500, usedIds);
  
  // Classify all questions
  const classified = {};
  for (const q of pool) {
    const type = classifier(q);
    if (!classified[type]) classified[type] = [];
    classified[type].push(q);
  }
  
  console.log(`[getClassifiedQuestions] ${section} pool breakdown:`, 
    Object.entries(classified).map(([k,v]) => `${k}:${v.length}`).join(', ')
  );
  
  const result = [];
  for (const [subtopic, count] of Object.entries(subtopicCounts)) {
    const available = classified[subtopic] || [];
    // Shuffle this subtopic pool
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count);
    result.push(...picked);
    
    // If not enough questions of this subtopic, fill from the general pool
    if (picked.length < count) {
      const deficit = count - picked.length;
      const pickedIds = new Set(result.map(q => q.id));
      const remaining = pool.filter(q => !pickedIds.has(q.id)).sort(() => 0.5 - Math.random());
      result.push(...remaining.slice(0, deficit));
      console.log(`[getClassifiedQuestions] ${section}/${subtopic}: needed ${count}, got ${picked.length}, filled ${Math.min(deficit, remaining.length)} from general pool`);
    }
  }
  
  return result;
}

export async function getMockTestQuestions(natGroup, usedIds = []) {
  // ===== NAT CURRICULUM (90 Questions, 120 min) =====
  // English (20): Sentence Completion 5, Analogy 3, Antonym 4, Comprehension 5, Synonym 3
  // Analytical (20): Scenario Based 12, Statements Based 8
  // Quantitative (20): Arithmetic 13, Algebra 4, Geometry 3
  // Subject (30): varies by group

  const isAU = natGroup?.startsWith('AU-');
  
  // ===== ENGLISH: same for NAT and AU =====
  const english = await getClassifiedQuestions('english', classifyEnglish, {
    sentence_completion: 5,
    analogy: 3,
    antonym: 4,
    comprehension: 5,
    synonym: 3,
  }, usedIds);
  
  // ===== ANALYTICAL =====
  let analytical;
  if (isAU) {
    // AU: 25 analytical → scale proportionally (15 scenario, 10 statements)
    analytical = await getClassifiedQuestions('analytical', classifyAnalytical, {
      scenario: 15,
      statements: 10,
    }, usedIds);
  } else {
    // NAT: 20 analytical → 12 scenario, 8 statements
    analytical = await getClassifiedQuestions('analytical', classifyAnalytical, {
      scenario: 12,
      statements: 8,
    }, usedIds);
  }
  
  // ===== QUANTITATIVE =====
  let quantitative;
  if (natGroup === 'AU-Pre-Medical') {
    // AU Pre-Medical: 15 quantitative → ~10 arith, 3 algebra, 2 geometry
    quantitative = await getClassifiedQuestions('quantitative', classifyQuantitative, {
      arithmetic: 10,
      algebra: 3,
      geometry: 2,
    }, usedIds);
  } else if (isAU) {
    // AU Pre-Engineering / CS: 25 quantitative → ~16 arith, 5 algebra, 4 geometry
    quantitative = await getClassifiedQuestions('quantitative', classifyQuantitative, {
      arithmetic: 16,
      algebra: 5,
      geometry: 4,
    }, usedIds);
  } else {
    // NAT: 20 quantitative → 13 arith, 4 algebra, 3 geometry
    quantitative = await getClassifiedQuestions('quantitative', classifyQuantitative, {
      arithmetic: 13,
      algebra: 4,
      geometry: 3,
    }, usedIds);
  }
  
  // ===== SUBJECT QUESTIONS =====
  let subjectQuestions = [];
  switch (natGroup) {
    case 'NAT-IE':
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('chemistry', 'all', 10, usedIds)),
        ...(await getQuestions('mathematics', 'all', 10, usedIds)),
      ];
      break;
    case 'NAT-IM':
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 8, usedIds)),
        ...(await getQuestions('chemistry', 'all', 8, usedIds)),
        ...(await getQuestions('biology', 'all', 14, usedIds)),
      ];
      break;
    case 'NAT-ICS':
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('computer_science', 'all', 10, usedIds)),
        ...(await getQuestions('mathematics', 'all', 10, usedIds)),
      ];
      break;
    case 'NAT-ICOM':
      subjectQuestions = [
        ...(await getQuestions('commerce', 'all', 10, usedIds)),
        ...(await getQuestions('accounting', 'all', 10, usedIds)),
        ...(await getQuestions('economics', 'all', 10, usedIds)),
      ];
      break;
    case 'AU-Pre-Engineering':
      // AU: 30 subject (10 Phys, 10 Chem, 10 Math)
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('chemistry', 'all', 10, usedIds)),
        ...(await getQuestions('mathematics', 'all', 10, usedIds)),
      ];
      break;
    case 'AU-Pre-Medical':
      // AU: 40 subject (10 Phys, 10 Chem, 20 Bio)
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('chemistry', 'all', 10, usedIds)),
        ...(await getQuestions('biology', 'all', 20, usedIds)),
      ];
      break;
    case 'AU-Computer-Science':
      // AU: 30 subject (10 Phys, 10 Comp, 10 Math)
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('computer_science', 'all', 10, usedIds)),
        ...(await getQuestions('mathematics', 'all', 10, usedIds)),
      ];
      break;
    case 'FAST':
      // FAST Mock Test Pattern (120 Questions)
      return [
        ...(await getQuestions('fast_english', 'all', 30, usedIds)),
        ...(await getQuestions('fast_basic_maths', 'all', 20, usedIds)),
        ...(await getQuestions('fast_advance_maths', 'all', 50, usedIds)),
        ...(await getQuestions('fast_iq', 'all', 20, usedIds)),
      ];
    default:
      subjectQuestions = [
        ...(await getQuestions('physics', 'all', 10, usedIds)),
        ...(await getQuestions('chemistry', 'all', 10, usedIds)),
        ...(await getQuestions('biology', 'all', 10, usedIds)),
      ];
  }

  const allQuestions = [...english, ...analytical, ...quantitative, ...subjectQuestions];
  console.log(`[getMockTestQuestions] Total: ${allQuestions.length} questions for ${natGroup} (E:${english.length}, A:${analytical.length}, Q:${quantitative.length}, S:${subjectQuestions.length})`);
  return allQuestions;
}

export function getAllSections(natGroup) {
  const common = ['english', 'analytical', 'quantitative'];
  switch (natGroup) {
    case 'NAT-IE': return [...common, 'physics', 'chemistry', 'mathematics'];
    case 'NAT-IM': return [...common, 'physics', 'chemistry', 'biology'];
    case 'NAT-ICS': return [...common, 'physics', 'computer_science', 'mathematics'];
    case 'NAT-ICOM': return [...common, 'commerce', 'accounting', 'economics'];
    default: return [...common, 'commerce', 'accounting', 'economics'];
  }
}

export function getSectionLabel(section) {
  const labels = {
    english: 'English',
    analytical: 'Analytical Reasoning',
    quantitative: 'Quantitative Reasoning',
    physics: 'Physics',
    chemistry: 'Chemistry',
    mathematics: 'Mathematics',
    biology: 'Biology',
    computer_science: 'Computer Science',
    commerce: 'Commerce',
    accounting: 'Accounting',
    economics: 'Economics',
    fast_english: 'FAST English',
    fast_basic_maths: 'FAST Basic Mathematics',
    fast_advance_maths: 'FAST Advance Mathematics',
    fast_iq: 'FAST Intelligence (IQ)',
  };
  return labels[section] || section;
}

export function getSectionIcon(section) {
  const icons = {
    english: '📚',
    analytical: '🧠',
    quantitative: '🔢',
    physics: '⚡',
    chemistry: '🧪',
    mathematics: '📐',
    biology: '🧬',
    computer_science: '💻',
    commerce: '🏪',
    accounting: '🧾',
    economics: '📊',
    fast_english: '📚',
    fast_basic_maths: '🧮',
    fast_advance_maths: '📐',
    fast_iq: '🧠',
  };
  return icons[section] || '📖';
}

export function getCustomQuestions() {
  try {
    return JSON.parse(localStorage.getItem('nat_custom_questions')) || [];
  } catch (e) {
    return [];
  }
}

export function addCustomQuestion(question) {
  const custom = getCustomQuestions();
  custom.push({ ...question, id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` });
  localStorage.setItem('nat_custom_questions', JSON.stringify(custom));
}

export function deleteCustomQuestion(id) {
  const custom = getCustomQuestions();
  localStorage.setItem('nat_custom_questions', JSON.stringify(custom.filter(q => q.id !== id)));
}