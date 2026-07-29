/**
 * EntryHive NTS NAT Flashcards
 * ----------------------------
 * Real content, not MCQ "shortcut tricks" — actual vocab with usage,
 * actual formulas with WHY/WHEN to use them, actual reasoning rules.
 *
 * Includes a proper spaced-repetition scheduler (SM-2 — the same core
 * algorithm Anki uses) so cards a student keeps getting wrong come back
 * sooner, and cards they know well stop showing up every day.
 */

// ---------------------------------------------------------------
// 1. CARD DATA
// ---------------------------------------------------------------
const englishCards = [
  { topic: 'Vocabulary', front: 'Ephemeral', back: 'Lasting for a very short time. Ex: "Fame on social media is often ephemeral, gone within days."' },
  { topic: 'Vocabulary', front: 'Ubiquitous', back: 'Present everywhere at once. Ex: "Smartphones have become ubiquitous in modern life."' },
  { topic: 'Vocabulary', front: 'Pragmatic', back: 'Dealing with things sensibly and realistically, not idealistically. Ex: "She took a pragmatic approach to the budget cuts."' },
  { topic: 'Vocabulary', front: 'Ambivalent', back: 'Having mixed feelings or contradictory ideas about something. Ex: "He felt ambivalent about the job offer — excited but nervous."' },
  { topic: 'Vocabulary', front: 'Candid', back: 'Truthful and straightforward; frank. Ex: "I appreciate your candid feedback on my essay."' },
  { topic: 'Vocabulary', front: 'Meticulous', back: 'Showing great attention to detail; very careful and precise. Ex: "The report was meticulous, with every figure double-checked."' },
  { topic: 'Vocabulary', front: 'Ostentatious', back: 'Designed to impress or attract notice; showy. Ex: "His ostentatious car drew stares on the street."' },
  { topic: 'Vocabulary', front: 'Resilient', back: 'Able to recover quickly from difficulties; tough. Ex: "Despite the setback, the team remained resilient."' },
  { topic: 'Vocabulary', front: 'Ambiguous', back: 'Open to more than one interpretation; unclear. Ex: "The instructions were ambiguous, so nobody knew what to do."' },
  { topic: 'Vocabulary', front: 'Conundrum', back: 'A confusing and difficult problem or question. Ex: "Choosing between two great job offers was a real conundrum."' },
  { topic: 'Grammar', front: 'Subject-verb agreement rule', back: 'A singular subject takes a singular verb; a plural subject takes a plural verb. Watch for words between subject and verb: "The list of items IS on the table" (not "are" — "list" is the subject, singular).' },
  { topic: 'Grammar', front: 'When to use "who" vs "whom"', back: '"Who" is a subject pronoun (does the action) — "Who called you?" "Whom" is an object pronoun (receives the action) — "Whom did you call?" Trick: if you can replace it with "he/she," use who; if with "him/her," use whom.' },
  { topic: 'Grammar', front: 'Difference between "affect" and "effect"', back: '"Affect" is almost always a verb meaning to influence: "The weather affected the game." "Effect" is almost always a noun meaning the result: "The effect of the weather was a delay."' },
  { topic: 'Grammar', front: 'Parallel structure rule', back: 'Items in a list or comparison must use the same grammatical form. Wrong: "She likes running, to swim, and hiking." Right: "She likes running, swimming, and hiking."' },
  { topic: 'Grammar', front: 'Dangling modifier — what it is and how to fix it', back: 'A modifier that doesn\'t clearly attach to the word it\'s meant to describe. Wrong: "Walking to school, the rain started." (rain doesn\'t walk) Right: "Walking to school, I got caught in the rain."' },
  { topic: 'Grammar', front: 'Comma splice — what it is and how to fix it', back: 'Joining two independent clauses with only a comma. Wrong: "I studied hard, I still failed." Fix with a period, semicolon, or conjunction: "I studied hard, but I still failed."' },
  { topic: 'Comprehension', front: 'How to find the "main idea" of a passage quickly', back: 'Read the first and last sentence of each paragraph first — authors usually state their main point there, with the middle sentences providing supporting detail or examples.' },
  { topic: 'Comprehension', front: 'How to answer "tone" questions', back: 'Look at the author\'s word choice (diction), not just the topic. Words like "unfortunately," "remarkably," or "clearly" signal the author\'s attitude toward the subject.' },
  { topic: 'Comprehension', front: 'How to answer "inference" questions correctly', back: 'The correct answer must be a logical conclusion FROM the text, not something stated outright, and not something requiring outside knowledge. If it needs a big leap or isn\'t supported by the passage, it\'s wrong.' },
  { topic: 'Comprehension', front: 'Skimming vs scanning — when to use each', back: 'Skim FIRST to get the overall gist/structure (read fast, don\'t stop at unknown words). Scan AFTER you have a specific question, running your eyes over the text to locate a name, date, or keyword instead of rereading everything.' },
  { topic: 'Vocabulary', front: 'Eloquent', back: 'Fluent and persuasive in speaking or writing. Ex: "Her eloquent speech moved the entire audience."' },
  { topic: 'Vocabulary', front: 'Frugal', back: 'Sparing or economical with money or resources; not wasteful. Ex: "He lived a frugal life despite his large salary."' },
  { topic: 'Vocabulary', front: 'Innate', back: 'Existing from birth rather than acquired; natural. Ex: "She has an innate talent for music."' },
  { topic: 'Vocabulary', front: 'Meager', back: 'Lacking in quantity or richness; deficient. Ex: "They survived on a meager income for years."' },
  { topic: 'Vocabulary', front: 'Novice', back: 'A person new to and inexperienced in a field or situation. Ex: "As a novice cook, he burned the rice twice."' },
  { topic: 'Vocabulary', front: 'Obsolete', back: 'No longer produced or used; out of date. Ex: "Floppy disks are now obsolete technology."' },
  { topic: 'Vocabulary', front: 'Plausible', back: 'Seeming reasonable or probable; believable. Ex: "His excuse for being late sounded plausible."' },
  { topic: 'Vocabulary', front: 'Redundant', back: 'No longer needed or useful; superfluous, or unnecessarily repetitive in wording. Ex: "\'Free gift\' is redundant since gifts are already free."' },
  { topic: 'Vocabulary', front: 'Tedious', back: 'Too long, slow, or dull; tiresome or monotonous. Ex: "Filling out the same form five times was tedious."' },
  { topic: 'Vocabulary', front: 'Vindicate', back: 'To clear someone of blame or suspicion by proving they were right. Ex: "New evidence finally vindicated the accused man."' },
  { topic: 'Vocabulary', front: 'Austere', back: 'Severe or strict in manner, attitude, or appearance; without luxury. Ex: "The monks lived an austere life with few possessions."' },
  { topic: 'Vocabulary', front: 'Benevolent', back: 'Well-meaning and kindly; charitable. Ex: "The benevolent donor funded the entire school."' },
  { topic: 'Vocabulary', front: 'Coherent', back: 'Logical and consistent; easy to follow. Ex: "He gave a coherent explanation despite being nervous."' },
  { topic: 'Grammar', front: 'Difference between "less" and "fewer"', back: 'Use "fewer" for countable nouns (things you can count individually): "fewer books." Use "less" for uncountable/mass nouns (things measured, not counted): "less water," "less time."' },
  { topic: 'Grammar', front: 'Basic rule for modal verbs (can, could, may, might, must, should)', back: 'Modals are always followed by the BASE form of the verb, never "to" or -ing/-ed forms. Correct: "She can swim," "He must go." Wrong: "She can to swim," "He must going."' },
  { topic: 'Grammar', front: 'The 3 main types of conditional sentences', back: 'Zero conditional (general truth): "If you heat ice, it melts." First conditional (real future possibility): "If it rains, I will stay home." Second conditional (hypothetical/unreal): "If I were rich, I would travel." Verb tense in the "if" clause signals which type.' },
  { topic: 'Grammar', front: 'Basic rule for articles: "a" vs "an" vs "the"', back: 'Use "a" before a word starting with a CONSONANT SOUND, "an" before a VOWEL SOUND (sound matters, not spelling — "an hour" because "h" is silent, "a university" because "u" sounds like "yu"). Use "the" for specific/already-mentioned things.' },
  { topic: 'Grammar', front: 'Subject-verb agreement with collective nouns', back: 'Collective nouns (team, family, group, jury) usually take a SINGULAR verb when acting as one unit: "The team is winning." They take a plural verb only when members are considered individually/separately, which is rarer in standard usage.' },
  { topic: 'Grammar', front: 'Commonly confused word pairs: its/it\'s, their/there/they\'re', back: '"Its" = possessive (belonging to it): "The dog wagged its tail." "It\'s" = it is/it has: "It\'s raining." "Their" = possessive: "their house." "There" = place: "over there." "They\'re" = they are: "they\'re coming."' },
  { topic: 'Grammar', front: 'Gerund vs infinitive after certain verbs', back: 'Some verbs are followed by a gerund (-ing): "enjoy swimming," "avoid arguing." Others take an infinitive (to + verb): "want to go," "decide to leave." There\'s no single rule — these have to be learned per verb, but consistent misuse (like "enjoy to swim") is a common error to watch for.' },
  { topic: 'Grammar', front: 'Degrees of comparison — positive, comparative, superlative', back: 'Positive: "tall." Comparative (between 2): "taller" / "more beautiful." Superlative (3+): "tallest" / "most beautiful." Short adjectives (1-2 syllables) usually take -er/-est; longer ones use more/most. Never combine both: "more taller" is wrong.' },
];

const quantitativeCards = [
  { topic: 'Percentages', front: 'Formula: Percentage change', back: '((New Value − Old Value) / Old Value) × 100. Use this for both increase and decrease — a negative result just means a decrease.' },
  { topic: 'Percentages', front: 'Why "successive percentage change" isn\'t just addition', back: 'If a price rises 20% then falls 20%, you do NOT end up back at the original price. Multiply the multipliers: 1.20 × 0.80 = 0.96 → a net 4% DECREASE, because the second 20% is taken off a larger base.' },
  { topic: 'Profit & Loss', front: 'Formula: Profit % and Loss %', back: 'Profit % = (Profit / Cost Price) × 100. Loss % = (Loss / Cost Price) × 100. Always divide by COST PRICE, never selling price — a common mistake.' },
  { topic: 'Time, Speed, Distance', front: 'Core relationship between speed, distance and time', back: 'Distance = Speed × Time. Rearranged: Speed = Distance/Time, Time = Distance/Speed. For relative speed: if moving toward each other, ADD speeds; if same direction, SUBTRACT speeds.' },
  { topic: 'Time & Work', front: 'How to combine work rates', back: 'If A can finish a job in "a" days, A\'s work rate is 1/a per day. Combined rate of A and B working together = 1/a + 1/b. Time to finish together = 1 / (combined rate).' },
  { topic: 'Averages', front: 'Formula: Simple average', back: 'Average = Sum of all values / Number of values. To find a missing value: (Average × Count) − Sum of known values.' },
  { topic: 'Interest', front: 'Difference between simple and compound interest', back: 'Simple Interest = (P × R × T)/100 — interest is the same every year, calculated only on the original principal. Compound Interest = P(1 + R/100)^T − P — interest is calculated on principal PLUS previously earned interest, so it grows faster over time.' },
  { topic: 'Algebra', front: 'Quadratic formula', back: 'For ax² + bx + c = 0, x = (−b ± √(b² − 4ac)) / 2a. The term under the root (b² − 4ac) is the discriminant: positive = 2 real roots, zero = 1 real root, negative = no real roots.' },
  { topic: 'Algebra', front: 'The 3 key algebraic identities', back: '(a+b)² = a² + 2ab + b² | (a−b)² = a² − 2ab + b² | a² − b² = (a+b)(a−b). Recognizing these instantly saves major time on simplification questions.' },
  { topic: 'Geometry', front: 'Pythagorean theorem — and why it only works on right triangles', back: 'In a right-angled triangle: a² + b² = c², where c is the hypotenuse (side opposite the right angle). It only applies when one angle is exactly 90°.' },
  { topic: 'Geometry', front: 'Sum of interior angles of a polygon', back: 'Sum = (n − 2) × 180°, where n = number of sides. E.g., a hexagon (n=6): (6−2)×180° = 720° total, so 720/6 = 120° per angle if regular.' },
  { topic: 'Geometry', front: 'Area formulas you must have memorized', back: 'Triangle = ½ × base × height. Circle = πr². Rectangle = length × width. Trapezoid = ½ × (sum of parallel sides) × height.' },
  { topic: 'Statistics', front: 'Difference between mean, median, and mode', back: 'Mean = average (sum ÷ count). Median = the middle value when data is sorted (use average of two middle values if even count). Mode = the most frequently occurring value. Median is best when data has extreme outliers.' },
  { topic: 'Probability', front: 'Basic probability formula', back: 'Probability = (Number of favorable outcomes) / (Total possible outcomes). For independent events (like two separate coin flips), multiply the individual probabilities together.' },
  { topic: 'Ratios', front: 'How to solve ratio-sharing problems reliably', back: 'If money/quantity is split in ratio a:b:c, total parts = a+b+c. Each part\'s value = Total ÷ (a+b+c). Then multiply each ratio number by that value to get each share.' },
  { topic: 'Number System', front: 'Difference between LCM and HCF, and when to use each', back: 'HCF (Highest Common Factor) is the LARGEST number that divides all given numbers exactly — use it for splitting things into equal groups. LCM (Least Common Multiple) is the SMALLEST number divisible by all given numbers — use it for finding when repeating events coincide (e.g., bells ringing together).' },
  { topic: 'Number System', front: 'Quick divisibility rules worth memorizing', back: 'Divisible by 2: ends in even digit. By 3: digit sum divisible by 3. By 4: last two digits divisible by 4. By 5: ends in 0 or 5. By 6: divisible by both 2 and 3. By 9: digit sum divisible by 9. These save huge time vs long division.' },
  { topic: 'Number System', front: 'What makes a number "prime"', back: 'A prime number has EXACTLY two factors: 1 and itself. It must be greater than 1 (1 itself is NOT prime). Quick check: test divisibility only up to the square root of the number — if nothing divides it evenly, it\'s prime.' },
  { topic: 'Exponents', front: 'Core laws of exponents', back: 'aᵐ × aⁿ = aᵐ⁺ⁿ (multiply → add powers). aᵐ ÷ aⁿ = aᵐ⁻ⁿ (divide → subtract powers). (aᵐ)ⁿ = aᵐⁿ (power of a power → multiply). a⁰ = 1 (anything to the power 0, except 0 itself). a⁻ⁿ = 1/aⁿ (negative power = reciprocal).' },
  { topic: 'Set Theory', front: 'Formula for the union of two sets', back: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B). You subtract the intersection because elements in BOTH sets would otherwise be counted twice. This is the single most-tested set theory formula.' },
  { topic: 'Mixtures', front: 'Rule of alligation — mixing two quantities of different value/concentration', back: 'To mix a cheaper item (price/concentration C1) with a costlier one (C2) to get a mean value (M): ratio of cheaper:costlier = (C2 − M) : (M − C1). This avoids setting up full equations for every mixture problem.' },
  { topic: 'Age Problems', front: 'Standard approach to solve age-based word problems', back: 'Assign a variable to the unknown present age (e.g., son\'s age = x), express every other age in terms of it (father = x+24, etc.), then translate the "years ago/hence" condition into an equation using those same expressions plus/minus the year shift. Solve for x.' },
  { topic: 'Clock Problems', front: 'Formula for the angle between hour and minute hands', back: 'Angle = |30H − 5.5M|, where H = hour (12-hour format) and M = minutes. The minute hand moves 6°/minute; the hour hand moves 0.5°/minute — the formula is just their combined relative motion.' },
  { topic: 'Coordinate Geometry', front: 'Distance formula between two points', back: 'Distance = √[(x₂−x₁)² + (y₂−y₁)²]. This is just the Pythagorean theorem applied to horizontal and vertical differences between the two points.' },
  { topic: 'Coordinate Geometry', front: 'Midpoint and slope formulas', back: 'Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2) — literally the average of the x\'s and average of the y\'s. Slope = (y₂−y₁)/(x₂−x₁) — "rise over run," how steep the line is between two points.' },
  { topic: 'Mensuration', front: 'Volume and surface area of a cube and cuboid', back: 'Cube (side a): Volume = a³, Surface Area = 6a². Cuboid (l×w×h): Volume = l×w×h, Surface Area = 2(lw + wh + hl). Volume tells you space inside; surface area tells you total outer covering.' },
  { topic: 'Mensuration', front: 'Volume and surface area of a cylinder', back: 'Volume = πr²h (circle area × height). Curved Surface Area = 2πrh. Total Surface Area = 2πrh + 2πr² (curved surface plus the two circular ends).' },
  { topic: 'Mensuration', front: 'Volume of a sphere and a cone', back: 'Sphere: Volume = (4/3)πr³. Cone: Volume = (1/3)πr²h — exactly one-third of a cylinder with the same base and height, which is a useful fact for comparison-based questions.' },
  { topic: 'Sequences', front: 'Sum of an arithmetic progression (AP)', back: 'Sum = n/2 × [2a + (n−1)d], where n = number of terms, a = first term, d = common difference. Equivalent shortcut: Sum = n/2 × (first term + last term).' },
  { topic: 'Sequences', front: 'Sum of a geometric progression (GP)', back: 'Sum = a(rⁿ−1)/(r−1) for r ≠ 1, where a = first term, r = common ratio, n = number of terms. Recognize a GP by a CONSTANT RATIO between consecutive terms (vs. AP\'s constant difference).' },
  { topic: 'Permutation & Combination', front: 'What "n!" (factorial) means and why it matters', back: 'n! = n × (n−1) × (n−2) × ... × 1. It represents the number of ways to arrange n distinct items in a row. 0! is defined as 1. Factorials are the building block of every permutation/combination formula.' },
  { topic: 'Data Interpretation', front: 'Fastest way to answer data interpretation questions from a chart/table', back: 'Read the question FIRST, then go hunting in the chart for only the specific values needed — don\'t try to absorb every number in the chart upfront. For "percentage of total" questions, identify the total row/column first before calculating.' },
];

const analyticalCards = [
  { topic: 'Syllogism', front: 'What makes a syllogism logically valid', back: 'A syllogism has two premises and a conclusion. The conclusion is valid ONLY if it necessarily follows from BOTH premises — not just if it sounds true in real life. "All A are B, All B are C" validly gives "All A are C," but "Some A are B, Some B are C" does NOT validly give "Some A are C."' },
  { topic: 'Blood Relations', front: 'How to solve blood relation puzzles without confusion', back: 'Draw a simple family tree as you read — use "+" for male, "-" for female, and arrows for generations. Solving in your head causes most errors; a 10-second sketch prevents them.' },
  { topic: 'Direction Sense', front: 'Core rule for direction problems', back: 'Always assume the person starts facing North unless stated otherwise. A right turn from North → East. A right turn from East → South. Track each turn as a 90° rotation on a mental (or drawn) compass.' },
  { topic: 'Coding-Decoding', front: 'How to crack letter-shifting codes', back: 'Check if each letter of the word is shifted by a consistent number in the alphabet (e.g., CAT → DBU means every letter shifted +1). Once you find the pattern, apply the SAME shift to decode the target word.' },
  { topic: 'Series', front: 'How to approach number series questions', back: 'First check simple differences between consecutive terms. If differences aren\'t constant, check if the DIFFERENCES themselves form a pattern (2nd-level differences), or check for multiplication/squares/cubes patterns.' },
  { topic: 'Statement & Assumption', front: 'What counts as a valid "assumption"', back: 'An assumption is something the speaker must believe is true for their statement to make sense — but it is NOT stated outright. If the statement would fall apart without that hidden belief, it\'s a valid assumption.' },
  { topic: 'Statement & Conclusion', front: 'Difference between "assumption" and "conclusion" questions', back: 'A conclusion must follow LOGICALLY and DIRECTLY from the statement given — nothing more, nothing less. An assumption is something taken for granted BEFORE the statement can hold true. Don\'t bring outside knowledge into either.' },
  { topic: 'Seating Arrangement', front: 'Best strategy for circular seating arrangement puzzles', back: 'Draw a circle and place the most specific clue first (e.g., "X sits between Y and Z"). Fill in relative positions before absolute ones. Remember "left" and "right" depend on whether people face inward or outward — check this first.' },
  { topic: 'Venn Diagrams', front: 'How to read overlapping-set problems correctly', back: 'The overlapping region between two circles represents elements belonging to BOTH categories. "Only A" means the part of circle A NOT overlapping with B — don\'t include the shared region unless the question says "A" without "only."' },
  { topic: 'Cause & Effect', front: 'How to tell which of two statements is the cause', back: 'The cause must happen chronologically BEFORE the effect and must be a plausible trigger for it. If two statements could both be independent effects of a third, unstated cause, neither is the cause of the other.' },
  { topic: 'Analogies', front: 'How to solve word analogy questions (A is to B as C is to ?)', back: 'First name the EXACT relationship between the first pair in your own words (e.g., "part-to-whole," "tool-to-user," "cause-to-effect") before looking at the options. Then find the option that shares that SAME specific relationship — not just a vaguely related word.' },
  { topic: 'Classification', front: 'Strategy for "odd one out" / classification questions', back: 'Don\'t just look at surface similarity — find the SHARED category or rule connecting most items (e.g., all are mammals, all are prime numbers, all follow a spelling pattern), then identify which single item breaks that specific rule.' },
  { topic: 'Statement & Course of Action', front: 'What makes a "course of action" valid', back: 'A valid course of action must be practical, directly address the problem stated, and be something that can realistically be implemented — not just a generic wish. If it\'s too extreme, unrelated to the actual cause, or just restates the problem, it\'s not valid.' },
  { topic: 'Input-Output Reasoning', front: 'How to approach input-output (word/number rearrangement) questions', back: 'Compare each step to the one before it and isolate exactly ONE change per step (e.g., words reordered alphabetically, numbers shifted by a fixed rule). Once you identify the single operation being applied each step, predict the next step by applying it again.' },
  { topic: 'Ranking & Ordering', front: 'Best strategy for ranking/ordering puzzles (tallest, oldest, etc.)', back: 'Draw a simple vertical or horizontal line and place each clue as you read, adjusting positions as new clues arrive — don\'t try to hold the whole order in your head. Comparative clues ("taller than," "before") are usually easier to place first than absolute ones.' },
  { topic: 'Symbol-Based Reasoning', front: 'How to handle questions where symbols replace math operators (e.g., @ means +)', back: 'Immediately substitute the REAL operator wherever the symbol appears before doing any calculation — do this on paper, not mentally, since holding a fake operator in your head under time pressure is where most mistakes happen.' },
  { topic: 'Data Sufficiency', front: 'What "sufficient" actually means in data sufficiency questions', back: 'A statement is "sufficient" only if it ALONE lets you find one definite answer — not a probable one. If a statement allows more than one possible answer, or requires assuming outside information, it is NOT sufficient, even if it seems helpful.' },
  { topic: 'Puzzles', front: 'General rule for solving linear arrangement puzzles', back: 'Start with the clue that gives the MOST fixed information (e.g., "X is at one end") rather than relative clues (e.g., "X is somewhere left of Y") — fixed-position clues eliminate the most possibilities immediately and anchor the rest of the puzzle.' },
  { topic: 'Statement & Assumption', front: 'Common trap in assumption questions: confusing "possible" with "necessary"', back: 'An assumption must be something the statement CANNOT be true without — not just something that could plausibly also be true. If the statement still makes complete sense without that idea, it\'s not a valid assumption, just a related possibility.' },
];

const physicsCards = [
  { topic: 'Kinematics', front: "Newton's First Law (Law of Inertia)", back: 'An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted on by a net external force. This is WHY seatbelts matter — your body wants to keep moving when the car suddenly stops.' },
  { topic: 'Kinematics', front: "Newton's Second Law", back: 'F = ma (Force = mass × acceleration). Doubling the mass with the same force HALVES the acceleration — this is why heavier objects are harder to speed up or slow down.' },
  { topic: 'Kinematics', front: "Newton's Third Law", back: 'For every action, there is an equal and opposite reaction. When you push on a wall, the wall pushes back on you with equal force — that\'s why you don\'t go through it.' },
  { topic: 'Energy', front: 'Difference between kinetic and potential energy', back: 'Kinetic energy = ½mv² — energy of motion. Potential energy (gravitational) = mgh — stored energy due to position/height. Total mechanical energy (KE+PE) stays constant if no friction/air resistance acts.' },
  { topic: 'Waves', front: 'Relationship between wave speed, frequency and wavelength', back: 'v = fλ (speed = frequency × wavelength). If frequency increases while speed stays constant (like light in the same medium), wavelength must decrease proportionally.' },
  { topic: 'Electricity', front: "Ohm's Law and what it actually tells you", back: 'V = IR (Voltage = Current × Resistance). It tells you that for a fixed resistance, increasing voltage increases current proportionally — this is why higher-resistance components draw less current at the same voltage.' },
  { topic: 'Electricity', front: 'Series vs parallel circuits — key difference', back: 'In series, current is the SAME through every component, but voltage divides across them. In parallel, voltage is the SAME across every branch, but current divides based on each branch\'s resistance.' },
  { topic: 'Thermodynamics', front: 'First Law of Thermodynamics', back: 'Energy cannot be created or destroyed, only converted — ΔU = Q − W (change in internal energy = heat added minus work done by the system). This is just conservation of energy applied to heat and work.' },
  { topic: 'Modern Physics', front: 'What defines "photoelectric effect" and why it mattered', back: 'Light striking a metal surface can eject electrons — but ONLY if the light\'s frequency exceeds a minimum threshold, regardless of intensity. This proved light behaves as discrete packets (photons) of energy, not just waves.' },
  { topic: 'Rotational Motion', front: 'What torque is and its formula', back: 'Torque (τ) = Force × perpendicular distance from the pivot (τ = rF sinθ). It measures a force\'s tendency to cause rotation — same force applied farther from the pivot (like a longer wrench) produces more torque.' },
  { topic: 'Rotational Motion', front: 'What "moment of inertia" represents', back: 'Moment of inertia is rotational motion\'s equivalent of mass — it measures an object\'s resistance to changes in rotational speed. It depends not just on mass but on HOW that mass is distributed relative to the axis (mass farther from the axis = higher moment of inertia).' },
  { topic: 'Gravitation', front: "Newton's Law of Universal Gravitation", back: 'F = G(m₁m₂)/r², where G is the gravitational constant. Force is directly proportional to the product of the two masses and inversely proportional to the SQUARE of the distance between them — double the distance, and force drops to 1/4.' },
  { topic: 'Fluid Mechanics', front: "Archimedes' Principle in plain terms", back: 'An object submerged in a fluid experiences an upward buoyant force equal to the WEIGHT of fluid it displaces. This is why objects float when their weight is less than the weight of water they push aside.' },
  { topic: 'Fluid Mechanics', front: "Pascal's Principle", back: 'Pressure applied to an enclosed, incompressible fluid is transmitted EQUALLY in all directions throughout the fluid. This is the working principle behind hydraulic lifts and brakes — a small force on a small piston creates a large force on a larger piston.' },
  { topic: 'Oscillations', front: 'What makes motion "Simple Harmonic Motion" (SHM)', back: 'Motion is SHM when the restoring force (and acceleration) is always directed toward the equilibrium position and is directly proportional to displacement from it (F = −kx). A pendulum swinging at small angles and a mass on a spring are classic examples.' },
  { topic: 'Optics', front: 'Difference between concave and convex lenses', back: 'A convex (converging) lens is thicker in the middle and bends light rays INWARD to a focal point — used to correct farsightedness. A concave (diverging) lens is thinner in the middle and spreads light rays OUTWARD — used to correct nearsightedness.' },
  { topic: 'Optics', front: 'The lens formula', back: '1/f = 1/v − 1/u, where f = focal length, v = image distance, u = object distance. This single formula lets you calculate any one of the three values if the other two are known, for both lenses and mirrors (with appropriate sign conventions).' },
  { topic: 'Electromagnetism', front: "Faraday's Law of Electromagnetic Induction", back: 'A changing magnetic field through a coil induces an EMF (voltage) in that coil — the faster the change, the greater the induced EMF. This is the core principle behind generators, transformers, and induction charging.' },
];

const chemistryCards = [
  { topic: 'Atomic Structure', front: 'What determines an element\'s identity', back: 'The number of PROTONS (atomic number) defines what element it is. Neutrons can vary (creating isotopes) and electrons can be gained/lost (creating ions) without changing which element it is.' },
  { topic: 'Periodic Table', front: 'How atomic radius trends across the periodic table', back: 'Atomic radius DECREASES left to right across a period (more protons pull electrons in tighter) and INCREASES top to bottom down a group (more electron shells are added).' },
  { topic: 'Bonding', front: 'Ionic vs covalent bonds — the core difference', back: 'Ionic bonds form when electrons are TRANSFERRED (usually metal + non-metal), creating charged ions that attract each other. Covalent bonds form when electrons are SHARED (usually non-metal + non-metal).' },
  { topic: 'Equilibrium', front: "Le Chatelier's Principle in plain terms", back: 'If you disturb a system at equilibrium (by changing concentration, pressure, or temperature), the system shifts to counteract that change and restore a new equilibrium. E.g., adding more reactant pushes the reaction to make more product.' },
  { topic: 'Acids & Bases', front: 'What pH actually measures', back: 'pH measures hydrogen ion (H⁺) concentration on a log scale: pH = −log[H⁺]. Below 7 = acidic (more H⁺), above 7 = basic/alkaline (fewer H⁺), 7 = neutral. Each whole number step is a 10x change in H⁺ concentration.' },
  { topic: 'Organic Chemistry', front: 'How to tell alkanes, alkenes, and alkynes apart', back: 'Alkanes have only single C-C bonds (general formula CnH2n+2). Alkenes have at least one C=C double bond (CnH2n). Alkynes have at least one C≡C triple bond (CnH2n-2). More bonds between carbons = fewer hydrogens attached.' },
  { topic: 'Electrochemistry', front: 'What oxidation and reduction actually mean', back: 'Oxidation = LOSS of electrons (increase in oxidation state). Reduction = GAIN of electrons (decrease in oxidation state). Remember "OIL RIG": Oxidation Is Loss, Reduction Is Gain.' },
  { topic: 'States of Matter', front: 'The Ideal Gas Law', back: 'PV = nRT (Pressure × Volume = moles × gas constant × Temperature). It combines Boyle\'s Law (P and V inversely related at constant T) and Charles\'s Law (V and T directly related at constant P) into one equation.' },
  { topic: 'Thermochemistry', front: 'Exothermic vs endothermic reactions', back: 'Exothermic reactions RELEASE heat to the surroundings (products have lower energy than reactants) — the surroundings get warmer. Endothermic reactions ABSORB heat from the surroundings (products have higher energy) — the surroundings get cooler.' },
  { topic: 'Reaction Kinetics', front: 'What "activation energy" means and why catalysts matter', back: 'Activation energy is the minimum energy needed for a reaction to start — it\'s the "energy barrier" reactants must overcome. Catalysts speed up reactions by providing an alternative pathway with LOWER activation energy, without being consumed themselves.' },
  { topic: 'Organic Chemistry', front: 'How to identify an alcohol, aldehyde, and ketone by their functional group', back: 'Alcohol: −OH group attached to a carbon chain (e.g., ethanol). Aldehyde: −CHO group, always at the END of a carbon chain. Ketone: C=O group located INSIDE the carbon chain (not at the end) — this positioning is the key distinguishing clue.' },
  { topic: 'Organic Chemistry', front: 'What makes a compound "aromatic"', back: 'Aromatic compounds contain a benzene-like ring with alternating double bonds that allow electrons to be delocalized (spread) around the entire ring, giving it unusual stability compared to normal alkenes with isolated double bonds.' },
  { topic: 'Organic Chemistry', front: 'Carboxylic acid vs ester — structural difference', back: 'A carboxylic acid has a −COOH group (e.g., acetic acid). An ester has the −COOH\'s hydrogen replaced by an alkyl group, forming −COOR (e.g., the fruity-smelling esters used in flavorings) — esters form when a carboxylic acid reacts with an alcohol.' },
  { topic: 'Polymers', front: 'Difference between addition and condensation polymerization', back: 'Addition polymerization joins monomers with NO byproduct (e.g., polyethylene from ethylene). Condensation polymerization joins monomers while releasing a small molecule like water as a byproduct (e.g., proteins forming from amino acids via peptide bonds).' },
];

const biologyCards = [
  { topic: 'Cell Biology', front: 'Key differences between plant and animal cells', back: 'Plant cells have a cell wall, chloroplasts, and a large central vacuole. Animal cells lack all three but have centrioles (used in cell division) which most plant cells don\'t have.' },
  { topic: 'Cell Division', front: 'Mitosis vs meiosis — what actually differs', back: 'Mitosis produces 2 identical diploid daughter cells (for growth/repair). Meiosis produces 4 genetically different haploid cells (for sexual reproduction) — it involves TWO divisions and includes crossing over, which mitosis doesn\'t.' },
  { topic: 'Photosynthesis', front: 'The overall photosynthesis equation and what it means', back: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants take in carbon dioxide and water, use sunlight to convert them into glucose (food/energy storage), and release oxygen as a byproduct.' },
  { topic: 'Human Physiology', front: 'Path of blood through the heart (simplified)', back: 'Deoxygenated blood: body → right atrium → right ventricle → lungs (gets oxygenated). Oxygenated blood: lungs → left atrium → left ventricle → body. The left side always pumps oxygenated blood; the right side always pumps deoxygenated blood.' },
  { topic: 'Genetics', front: 'Dominant vs recessive alleles', back: 'A dominant allele shows its trait even with just ONE copy (Aa or AA). A recessive allele only shows its trait when there are TWO copies (aa) — it\'s "masked" by a dominant allele if present.' },
  { topic: 'Enzymes', front: 'Why enzymes are so specific to their substrate', back: 'Enzymes work via a "lock and key" (or induced fit) mechanism — their active site\'s shape only fits a specific substrate molecule, which is why each enzyme usually catalyzes only one type of reaction.' },
  { topic: 'Biomolecules', front: 'The 4 major classes of biomolecules and their basic roles', back: 'Carbohydrates: quick energy and structure (sugars, starch). Proteins: structure, enzymes, transport (made of amino acids). Lipids: long-term energy storage and cell membranes. Nucleic acids (DNA/RNA): store and transmit genetic information.' },
  { topic: 'Plant Anatomy', front: 'Function of xylem vs phloem in plants', back: 'Xylem transports WATER and dissolved minerals UPWARD from roots to leaves, in one direction only. Phloem transports FOOD (glucose from photosynthesis) in BOTH directions, from where it\'s made to where it\'s needed or stored.' },
  { topic: 'Transport in Plants', front: 'What drives water movement up a tall tree (transpiration pull)', back: 'Water evaporates from leaf surfaces (transpiration), creating negative pressure that pulls more water up through the xylem due to cohesion (water molecules sticking to each other) and adhesion (water sticking to xylem walls) — no pump is needed.' },
  { topic: 'Human Physiology', front: 'Path of food through the human digestive system', back: 'Mouth (mechanical + starch digestion) → esophagus → stomach (protein digestion via acid/pepsin) → small intestine (main nutrient absorption, with help from liver/pancreas enzymes) → large intestine (water absorption) → rectum.' },
  { topic: 'Human Physiology', front: 'How gas exchange happens in the lungs', back: 'In the alveoli (tiny air sacs), oxygen diffuses from inhaled air INTO the blood (where concentration is lower), while carbon dioxide diffuses OUT of the blood into the air to be exhaled — driven purely by concentration gradients, not active pumping.' },
  { topic: 'Human Physiology', front: 'What the kidneys actually do (excretory system)', back: 'Kidneys filter blood to remove metabolic waste (like urea) and excess water/salts, forming urine. They also help regulate blood pressure and maintain the body\'s water/electrolyte balance — not just "waste removal" but active internal balance control.' },
  { topic: 'Nervous System', front: 'How a nerve impulse travels (basic concept)', back: 'A stimulus triggers a change in electrical charge across a neuron\'s membrane (an "action potential") that travels down the neuron. At the end, it triggers release of chemical neurotransmitters across a synapse to signal the next neuron.' },
  { topic: 'Reproduction', front: 'Difference between asexual and sexual reproduction', back: 'Asexual reproduction involves ONE parent and produces genetically IDENTICAL offspring (e.g., budding, binary fission). Sexual reproduction involves TWO parents combining genetic material, producing genetically VARIED offspring — this variation is important for evolution.' },
  { topic: 'Evolution', front: 'Core idea of natural selection', back: 'Organisms with traits better suited to their environment are more likely to survive and reproduce, passing those traits to offspring. Over many generations, this shifts the population toward traits that improve survival — Darwin\'s "survival of the fittest."' },
];

const computerCards = [
  { topic: 'Number Systems', front: 'How to convert binary to decimal', back: 'Multiply each binary digit by 2 raised to its position power (starting at 0 from the right) and sum them. E.g., 1011 = (1×2³)+(0×2²)+(1×2¹)+(1×2⁰) = 8+0+2+1 = 11.' },
  { topic: 'Programming', front: 'Difference between a "loop" and a "conditional"', back: 'A conditional (if/else) makes a decision and runs code ONCE based on a condition. A loop (for/while) repeats a block of code MULTIPLE times, either a fixed number of times or until a condition changes.' },
  { topic: 'Data Structures', front: 'Stack vs Queue — core difference', back: 'A stack is LIFO (Last In, First Out) — like a stack of plates, you remove from the top. A queue is FIFO (First In, First Out) — like a line of people, first one in line is served first.' },
  { topic: 'OOP', front: 'What "inheritance" means in object-oriented programming', back: 'Inheritance lets a new class (child/subclass) reuse the properties and methods of an existing class (parent/superclass), while also being able to add or override its own — avoiding rewriting the same code.' },
  { topic: 'Networks', front: 'Difference between LAN and WAN', back: 'LAN (Local Area Network) covers a small area like one building (e.g., an office network). WAN (Wide Area Network) spans large geographic distances, connecting multiple LANs — the internet is the largest WAN.' },
  { topic: 'Databases', front: 'What a "primary key" does in a database table', back: 'A primary key uniquely identifies each row/record in a table — no two rows can share the same primary key value, and it can\'t be null. This prevents duplicate or ambiguous records.' },
  { topic: 'Logic Gates', front: 'AND vs OR vs NOT gate outputs', back: 'AND gate: output is 1 only if BOTH inputs are 1. OR gate: output is 1 if AT LEAST ONE input is 1. NOT gate: simply flips the input (1→0, 0→1).' },
  { topic: 'Operating Systems', front: 'What an operating system actually does (core role)', back: 'An OS manages hardware resources (CPU, memory, storage, devices) and acts as an intermediary between hardware and application software — handling tasks like process scheduling, memory allocation, and file management so apps don\'t need to control hardware directly.' },
  { topic: 'Programming', front: 'Difference between an array and a string', back: 'An array is a collection of multiple values (often of the same type) stored under one variable name, accessed by index. A string is technically a special case — an array/sequence of characters — but is usually treated as its own data type with text-specific operations (like concatenation).' },
  { topic: 'Programming', front: 'What a "function" does and why it matters', back: 'A function is a reusable, named block of code that performs a specific task and can accept inputs (parameters) and return an output. It avoids rewriting the same logic repeatedly and makes code easier to test and debug in isolated pieces.' },
  { topic: 'Web Basics', front: "Difference between the internet and the World Wide Web", back: 'The internet is the physical/technical infrastructure — the global network of connected computers. The Web (WWW) is a SERVICE that runs on top of the internet, made of interlinked web pages accessed via browsers using HTTP/HTTPS. The internet also carries email, file transfer, and other services besides the Web.' },
  { topic: 'Cybersecurity', front: 'Difference between a virus and a worm', back: 'A virus needs a HOST file or program to attach to and requires some user action (like opening a file) to spread. A worm is standalone malicious software that can self-replicate and spread across networks WITHOUT any user action or host file needed.' },
  { topic: 'Software Development', front: 'What "debugging" means and why it\'s a distinct skill', back: 'Debugging is the process of finding and fixing errors (bugs) in code by systematically narrowing down where the program\'s actual behavior diverges from its intended behavior — often using techniques like adding print statements or using a debugger tool to inspect variable values step by step.' },
];

const mathsCards = [
  { topic: 'Trigonometry', front: 'The three basic trig ratios (SOH-CAH-TOA)', back: 'Sine = Opposite/Hypotenuse. Cosine = Adjacent/Hypotenuse. Tangent = Opposite/Adjacent. All defined relative to a chosen angle in a right triangle.' },
  { topic: 'Trigonometry', front: 'The fundamental Pythagorean identity', back: 'sin²θ + cos²θ = 1 for any angle θ. This comes directly from the Pythagorean theorem applied to the unit circle, and is the base for deriving most other trig identities.' },
  { topic: 'Calculus', front: 'What a derivative actually represents', back: 'The derivative of a function at a point gives the INSTANTANEOUS RATE OF CHANGE (or slope of the tangent line) at that exact point — not an average rate, but the rate at that precise instant.' },
  { topic: 'Calculus', front: 'What a definite integral actually represents', back: 'A definite integral calculates the exact AREA under a curve between two x-values. It\'s the reverse operation of differentiation — this connection is called the Fundamental Theorem of Calculus.' },
  { topic: 'Sequences', front: 'Formula for the nth term of an arithmetic sequence', back: 'aₙ = a₁ + (n−1)d, where a₁ is the first term and d is the common difference. Use this to jump directly to any term without listing every one before it.' },
  { topic: 'Combinatorics', front: 'Difference between permutation and combination', back: 'Permutation (order matters): nPr = n!/(n−r)!. Combination (order doesn\'t matter): nCr = n!/(r!(n−r)!). Ask yourself: "does rearranging the same items count as different?" If yes → permutation, if no → combination.' },
  { topic: 'Matrices', front: 'Rule for when two matrices can be multiplied', back: 'Matrix A (size m×n) can be multiplied by Matrix B (size n×p) ONLY if the number of columns in A equals the number of rows in B. The result will be size m×p.' },
  { topic: 'Sets & Functions', front: 'Difference between a "relation" and a "function"', back: 'A relation is any set of ordered pairs connecting inputs to outputs. A function is a SPECIAL relation where each input has EXACTLY ONE output — no input maps to two different outputs. This is testable visually with the "vertical line test" on a graph.' },
  { topic: 'Binomial Theorem', front: 'What the binomial theorem lets you do', back: 'It gives a formula to expand (a+b)ⁿ directly without multiplying it out term by term: (a+b)ⁿ = Σ [nCr × a^(n−r) × b^r]. The coefficients nCr come straight from combinations — this is why they match Pascal\'s Triangle.' },
  { topic: 'Inverse Trig Functions', front: 'What "arcsin," "arccos," and "arctan" actually give you', back: 'These are the INVERSE of the regular trig functions — instead of "given an angle, find the ratio," they answer "given a ratio, find the angle." E.g., if sin(30°) = 0.5, then arcsin(0.5) = 30°.' },
  { topic: 'Vectors', front: 'Difference between a scalar and a vector quantity', back: 'A scalar has only MAGNITUDE (size) — like mass or temperature. A vector has both MAGNITUDE and DIRECTION — like velocity or force. This distinction matters because vectors must be added using direction-aware rules (like the triangle/parallelogram method), not simple arithmetic.' },
  { topic: 'Limits', front: 'What a "limit" means in calculus (intuitive definition)', back: 'A limit describes the value a function APPROACHES as the input gets closer and closer to some point — even if the function isn\'t actually defined AT that exact point. Limits are the foundation that both derivatives and integrals are built on.' },
  { topic: 'Applications of Derivatives', front: 'How derivatives are used to find maximum/minimum points of a function', back: 'Set the first derivative equal to zero and solve — these are the "critical points" where the function is momentarily flat (a peak or valley). Then check the SECOND derivative: positive means it\'s a minimum, negative means it\'s a maximum.' },
  { topic: 'Definite Integrals', front: 'Why the limits of integration matter in a definite integral', back: 'The limits (bounds) tell you exactly WHERE on the x-axis to start and stop measuring the area under the curve. Changing the bounds changes which region\'s area you\'re calculating — swapping the upper and lower limit flips the sign of the result.' },
];

const RAW_CARDS = {
  english: englishCards,
  quantitative: quantitativeCards,
  analytical: analyticalCards,
  physics: physicsCards,
  chemistry: chemistryCards,
  biology: biologyCards,
  computer_science: computerCards,
  mathematics: mathsCards,
};

// Assign stable IDs: "SubjectInitial-index" e.g. "English-0"
export const FLASHCARDS = {};
for (const subject of Object.keys(RAW_CARDS)) {
  FLASHCARDS[subject] = RAW_CARDS[subject].map((card, i) => ({
    id: `${subject}-${i}`,
    section: subject,
    topic: card.topic,
    front: card.front,
    back: card.back,
  }));
}

export const SUBJECTS = Object.keys(FLASHCARDS);

// ---------------------------------------------------------------
// 2. DECK BUILDING
// ---------------------------------------------------------------
/**
 * buildDeck(subject, topics?)
 * subject: one of SUBJECTS, or 'all' for every card across every subject
 * topics: optional array of topic names to filter to (e.g. ['Grammar'])
 */
export function buildDeck(subject, topics = null) {
  let deck;
  if (subject === 'all') {
    deck = Object.values(FLASHCARDS).flat();
  } else {
    if (!FLASHCARDS[subject]) {
      throw new Error(`Unknown subject "${subject}". Valid: ${SUBJECTS.join(', ')}, or "all"`);
    }
    deck = FLASHCARDS[subject];
  }
  if (topics && topics.length > 0) {
    deck = deck.filter((c) => topics.includes(c.topic));
  }
  return deck;
}

export function listTopics(subject) {
  if (!FLASHCARDS[subject]) {
    throw new Error(`Unknown subject "${subject}". Valid: ${SUBJECTS.join(', ')}`);
  }
  return [...new Set(FLASHCARDS[subject].map((c) => c.topic))];
}

// ---------------------------------------------------------------
// 3. SPACED REPETITION ENGINE (SM-2 algorithm)
// ---------------------------------------------------------------
// This is the real learning mechanism — not a gimmick. It tracks, per card,
// how easy the user finds it and reschedules future reviews accordingly.

export function initCardState() {
  return {
    repetition: 0, // how many times reviewed successfully in a row
    interval: 0, // days until next review
    efactor: 2.5, // "ease factor" — how easy this card is for this user (min 1.3)
    dueDate: new Date().toISOString().slice(0, 10), // due immediately the first time
  };
}

/**
 * reviewCard(state, quality)
 * quality: 0-5 self-graded recall rating
 *   0 = total blackout        3 = correct but with real difficulty
 *   1 = wrong, but familiar   4 = correct after a short hesitation
 *   2 = wrong, close guess    5 = perfect, instant recall
 */
export function reviewCard(state, quality) {
  if (quality < 0 || quality > 5) throw new Error('quality must be between 0 and 5');

  let { repetition, interval, efactor } = state;

  if (quality < 3) {
    // Forgot it — reset repetitions, review again very soon (same session ideally)
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) interval = 1;
    else if (repetition === 2) interval = 6;
    else interval = Math.round(interval * efactor);
  }

  // Update ease factor based on how hard/easy this recall was
  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    repetition,
    interval,
    efactor: Math.round(efactor * 100) / 100,
    dueDate: due.toISOString().slice(0, 10),
  };
}

/**
 * getDueCards(deck, statesMap, referenceDate?)
 */
export function getDueCards(deck, statesMap, referenceDate = new Date()) {
  const today = referenceDate.toISOString().slice(0, 10);
  return deck.filter((card) => {
    const state = statesMap[card.id];
    if (!state) return true; // never studied = due
    return state.dueDate <= today;
  });
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
