/**
 * EntryHive Study Plan Generator
 * ------------------------------
 * A fully deterministic (no-AI-call-needed) study plan generator.
 * Feed it a track, a set of subjects, hours/day, and days left until the test —
 * it returns a complete day-by-day plan. No randomness, no flaky AI output,
 * works for ANY combination.
 */

// ---------------------------------------------------------------
// 1. TRACK DEFINITIONS
// ---------------------------------------------------------------
export const TRACKS = {
  ICS: ['English', 'Quantitative', 'Analytical', 'Maths', 'Computer', 'Physics'],
  ENGINEERING: ['English', 'Quantitative', 'Analytical', 'Maths', 'Chemistry', 'Physics'],
  MEDICAL: ['English', 'Quantitative', 'Analytical', 'Chemistry', 'Biology', 'Physics'],
  ICOM: ['English', 'Quantitative', 'Analytical', 'Commerce', 'Accounting', 'Economics'],
};

// ---------------------------------------------------------------
// 2. TOPIC BANKS (per subject). These rotate day-by-day so a 25-day
//    plan doesn't repeat the same topic back-to-back.
// ---------------------------------------------------------------
export const SUBJECT_TOPICS = {
  English: [
    'Vocabulary building (synonyms/antonyms)', 'Sentence correction & grammar rules',
    'Reading comprehension (short passages)', 'Reading comprehension (long passages)',
    'Analogies', 'Idioms & phrases', 'Fill in the blanks', 'Tenses deep-dive',
    'Prepositions & articles', 'Para-jumbles / sentence ordering',
    'Direct-indirect speech', 'Active-passive voice', 'One-word substitution',
    'Error spotting practice', 'Vocabulary + comprehension mixed test',
  ],
  Quantitative: [
    'Number systems & basic arithmetic', 'Percentages & ratios', 'Profit, loss & discount',
    'Time, speed & distance', 'Time & work', 'Algebraic expressions & equations',
    'Linear & quadratic equations', 'Averages & mixtures', 'Simple & compound interest',
    'Geometry — lines, angles, triangles', 'Geometry — circles & polygons',
    'Mensuration (area/volume)', 'Statistics — mean, median, mode',
    'Probability basics', 'Data interpretation (graphs/tables)',
  ],
  Analytical: [
    'Number & letter series', 'Logical sequences', 'Syllogisms',
    'Blood relations', 'Direction sense', 'Coding-decoding',
    'Seating arrangements', 'Puzzles (linear/circular)', 'Statement & assumptions',
    'Statement & conclusions', 'Cause & effect reasoning', 'Analogy-based reasoning',
    'Venn diagrams & set logic', 'Data sufficiency', 'Mixed logical reasoning test',
  ],
  Maths: [
    'Sets, functions & groups', 'Matrices & determinants', 'Quadratic equations',
    'Sequences & series', 'Permutation & combination', 'Binomial theorem',
    'Trigonometric identities', 'Trigonometric equations', 'Inverse trig functions',
    'Vectors', 'Limits & continuity', 'Differentiation', 'Applications of derivatives',
    'Integration', 'Definite integrals & applications',
  ],
  Physics: [
    'Vectors & kinematics', 'Force, motion & Newton\'s laws', 'Work, energy & power',
    'Rotational motion', 'Gravitation', 'Fluid mechanics (properties of matter)',
    'Oscillations (SHM)', 'Waves & sound', 'Thermodynamics', 'Electrostatics',
    'Current electricity', 'Electromagnetism', 'AC circuits', 'Optics',
    'Modern physics (atomic & nuclear)',
  ],
  Chemistry: [
    'Atomic structure', 'Periodic table & periodicity', 'Chemical bonding',
    'States of matter (gases/liquids)', 'Thermochemistry', 'Chemical equilibrium',
    'Reaction kinetics', 'Electrochemistry', 'Acids, bases & salts',
    'Hydrocarbons — alkanes/alkenes/alkynes', 'Aromatic compounds',
    'Functional groups (alcohols, aldehydes, ketones)', 'Carboxylic acids & esters',
    'Nitrogen-containing compounds (amines/amides)', 'Polymers & biomolecules',
  ],
  Biology: [
    'Cell structure & function', 'Biomolecules', 'Cell division (mitosis/meiosis)',
    'Enzymes', 'Plant tissues & anatomy', 'Photosynthesis',
    'Transport in plants', 'Human digestive system', 'Human respiratory system',
    'Human circulatory system', 'Human excretory system', 'Nervous system & coordination',
    'Reproduction (plants & humans)', 'Genetics & inheritance', 'Evolution & ecology',
  ],
  Computer: [
    'Number systems & data representation', 'Computer fundamentals & hardware',
    'Operating systems basics', 'Programming fundamentals (variables/loops)',
    'Conditional statements & functions', 'Arrays & strings',
    'Object-oriented programming basics', 'Data structures — stacks & queues',
    'Databases & SQL basics', 'Computer networks basics',
    'Internet & web basics', 'Cybersecurity basics', 'Software development concepts',
    'Boolean algebra & logic gates', 'Mixed MCQ practice test',
  ],
  Commerce: [
    'Principles of Commerce', 'Business organizations', 'Trade and its aids',
    'Business finance & sources', 'Banking & finance', 'Insurance principles',
    'Marketing & advertising', 'E-commerce & modern trade', 'Business management',
    'Entrepreneurship basics', 'Business communication', 'Contracts & laws',
    'Wholesale & retail trade', 'International trade', 'Mixed Commerce MCQ practice'
  ],
  Accounting: [
    'Accounting equations & principles', 'Journal & ledger', 'Trial balance',
    'Cash book & subsidiary books', 'Bank reconciliation statement',
    'Depreciation methods', 'Final accounts with adjustments', 'Partnership accounts',
    'Non-profit organizations', 'Single entry system', 'Company accounts (shares)',
    'Financial statements analysis', 'Cost accounting basics', 'Auditing basics',
    'Mixed Accounting MCQ practice'
  ],
  Economics: [
    'Microeconomics basics', 'Demand & supply', 'Elasticity of demand',
    'Consumer behavior (utility)', 'Production & cost analysis', 'Market structures',
    'Macroeconomics basics', 'National income', 'Money & banking',
    'Inflation & unemployment', 'Public finance & taxation', 'International trade theories',
    'Economic development', 'Pakistan economy overview', 'Mixed Economics MCQ practice'
  ]
};

// ---------------------------------------------------------------
// 3. PHASE LOGIC — behaviour changes based on how close the test is
// ---------------------------------------------------------------
function getPhase(daysLeft) {
  if (daysLeft <= 1) return 'FINAL_SPRINT';
  if (daysLeft <= 3) return 'INTENSIVE_REVISION';
  if (daysLeft <= 8) return 'FOCUSED_PRACTICE';
  if (daysLeft <= 15) return 'BUILDING';
  return 'FOUNDATION';
}

// % time split within each subject's block, per phase
const PHASE_SPLIT = {
  FOUNDATION: { concept: 0.6, practice: 0.4, mock: 0 },
  BUILDING: { concept: 0.4, practice: 0.6, mock: 0 },
  FOCUSED_PRACTICE: { concept: 0.2, practice: 0.5, mock: 0.3 },
  INTENSIVE_REVISION: { concept: 0.1, practice: 0.4, mock: 0.5 },
  FINAL_SPRINT: { concept: 0.7, practice: 0.3, mock: 0 }, // concept here = "quick revision", not new learning
};

const PHASE_LABELS = {
  FOUNDATION: 'Foundation Building',
  BUILDING: 'Concept + Practice Balance',
  FOCUSED_PRACTICE: 'Focused Practice & Timed Sets',
  INTENSIVE_REVISION: 'Intensive Revision',
  FINAL_SPRINT: 'Final Sprint (light, no new topics)',
};

function activityBlock(subject, topic, minutes, phase) {
  const split = PHASE_SPLIT[phase];
  const blocks = [];

  const conceptMin = Math.round(minutes * split.concept);
  const practiceMin = Math.round(minutes * split.practice);
  const mockMin = minutes - conceptMin - practiceMin;

  if (phase === 'FINAL_SPRINT') {
    if (conceptMin > 0) blocks.push({ type: 'Quick revision', topic, minutes: conceptMin, note: 'Skim notes/formula sheet — no new learning' });
    if (practiceMin > 0) blocks.push({ type: 'Light recall practice', topic, minutes: practiceMin, note: '10-15 easy MCQs to stay sharp, avoid burnout' });
    return blocks;
  }

  if (conceptMin > 0) blocks.push({ type: 'Concept learning', topic, minutes: conceptMin });
  if (practiceMin > 0) blocks.push({ type: 'Practice questions', topic, minutes: practiceMin });
  if (mockMin > 0) blocks.push({ type: 'Timed drill / mock analysis', topic, minutes: mockMin });

  return blocks;
}

// ---------------------------------------------------------------
// 4. CORE GENERATOR
// ---------------------------------------------------------------
export function generateStudyPlan({ track, subjects, hoursPerDay, daysLeft }) {
  const trackKey = String(track).toUpperCase();
  if (!TRACKS[trackKey]) {
    throw new Error(`Unknown track "${track}". Valid tracks: ${Object.keys(TRACKS).join(', ')}`);
  }
  const validSubjects = TRACKS[trackKey];
  const chosen = subjects.filter((s) => validSubjects.includes(s));
  if (chosen.length === 0) {
    throw new Error(`No valid subjects given for track "${trackKey}". Valid options: ${validSubjects.join(', ')}`);
  }
  if (!hoursPerDay || hoursPerDay <= 0) throw new Error('hoursPerDay must be > 0');
  if (!daysLeft || daysLeft <= 0) throw new Error('daysLeft must be > 0');

  const totalMinutes = Math.round(hoursPerDay * 60);
  const baseMinutesPerSubject = Math.floor(totalMinutes / chosen.length);
  const leftover = totalMinutes - baseMinutesPerSubject * chosen.length;

  const days = [];

  for (let d = daysLeft; d >= 1; d--) {
    const phase = getPhase(d);
    const isFullMockDay = d !== daysLeft && d > 3 && d % 5 === 0 && chosen.length > 1;

    const daySubjects = chosen.map((subject, idx) => {
      const topics = SUBJECT_TOPICS[subject];
      const topic = topics[d % topics.length];
      const minutes = baseMinutesPerSubject + (idx === 0 ? leftover : 0);

      if (isFullMockDay) {
        return {
          subject,
          topic: `Full mock test section — ${subject}`,
          minutes,
          blocks: [{ type: 'Full-length timed mock', topic: 'Mixed topics', minutes, note: 'Simulate real test conditions, then review mistakes' }],
        };
      }

      return {
        subject,
        topic,
        minutes,
        blocks: activityBlock(subject, topic, minutes, phase),
      };
    });

    days.push({
      dayLabel: `T-${d} day${d === 1 ? '' : 's'}`,
      daysLeft: d,
      phase,
      phaseLabel: isFullMockDay ? 'Full Mock Test Day' : PHASE_LABELS[phase],
      totalHours: hoursPerDay,
      subjects: daySubjects,
    });
  }

  return {
    track: trackKey,
    subjects: chosen,
    hoursPerDay,
    daysLeft,
    generatedPlan: days,
  };
}
