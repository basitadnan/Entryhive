import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// High-frequency topics based on NAT past paper analysis
const IMPORTANT_TOPICS = {
  english: {
    label: 'English',
    icon: '📚',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    topics: [
      {
        name: 'Synonyms & Antonyms',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '6–8 questions',
        tips: [
          'Benevolent (Kind), Diligent (Hardworking), Candid (Frank), Eloquent (Articulate)',
          'Focus on: Ambiguous, Ephemeral, Ubiquitous, Tenacious, Pragmatic',
          'Antonyms: Verbose↔Concise, Affluent↔Poor, Lethargic↔Energetic',
        ],
      },
      {
        name: 'Sentence Completion',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'Look for contrast clue words: despite, although, however → opposite meaning needed',
          'Continuation clues: moreover, furthermore → similar tone needed',
          'Most tested words: altruistic, resilience, derogatory, compelling, conviction',
        ],
      },
      {
        name: 'Analogies',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Tool-to-user: Pen:Writer, Scalpel:Surgeon, Hammer:Carpenter',
          'Cause-to-effect: Drought:Famine, Virus:Epidemic',
          'Part-to-whole and capital city questions appear frequently',
        ],
      },
      {
        name: 'Reading Comprehension',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'Pakistan-related passages (CPEC, Indus River, education, environment) are most common',
          'Read questions FIRST, then find answers in the passage',
          'Never assume information not directly stated in the passage',
        ],
      },
    ],
  },
  analytical: {
    label: 'Analytical Reasoning',
    icon: '🧠',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    topics: [
      {
        name: 'Seating & Arrangement',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '5–6 questions',
        tips: [
          'Always draw a diagram — linear or circular based on the question',
          'Mark fixed positions first, then fill in the rest',
          'Circular arrangements: one person fixed, then arrange others relative to them',
        ],
      },
      {
        name: 'Number Series & Patterns',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'Common patterns: +2, +4, +6 (differences). Squares: 1,4,9,16,25. Fibonacci: 1,1,2,3,5,8',
          'If differences are unequal, check 2nd-level differences',
          'Alternating series: odd positions follow one pattern, even positions another',
        ],
      },
      {
        name: 'Blood Relations',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Draw a family tree — never try to solve blood relation questions in your head',
          '"My mother\'s only son" = me. "My father\'s brother\'s son" = my cousin',
          'Common trick: "pointing to X, he said..." — figure out who X is to the speaker',
        ],
      },
      {
        name: 'Logical Statements',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '3–4 questions',
        tips: [
          '"All A are B" ≠ "All B are A". Never reverse a universal statement',
          '"Some A are B" means at least one — could be all',
          'Use Venn diagrams for All/Some/No type questions',
        ],
      },
    ],
  },
  quantitative: {
    label: 'Quantitative Reasoning',
    icon: '🔢',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    topics: [
      {
        name: 'Percentages & Profit/Loss',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '5–6 questions',
        tips: [
          'Profit% = (Profit/Cost Price) × 100. Loss% = (Loss/Cost Price) × 100',
          'Shortcut: X% of Y = Y% of X. E.g. 8% of 50 = 50% of 8 = 4',
          'Discount on Marked Price, not cost price — common trick question',
        ],
      },
      {
        name: 'Ratio, Proportion & Averages',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'If ratio is a:b with total T → first part = aT/(a+b)',
          'Average = Sum/Count. If one value added, new avg = (old sum + new value)/(n+1)',
          'Work problems: Total work = Workers × Days. Inverse proportionality',
        ],
      },
      {
        name: 'Speed, Distance & Time',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Speed = Distance/Time. To convert m/s to km/h: multiply by 3.6',
          'Relative speed: same direction = subtract. Opposite direction = add',
          'Train problems: train length must be added to tunnel/platform length',
        ],
      },
      {
        name: 'Simple & Compound Interest',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'SI = P×R×T/100. Always on original principal.',
          'CI: amount = P(1 + R/100)ⁿ. Interest is charged on accumulated amount',
          'Annual compounding is most common in NAT questions',
        ],
      },
    ],
  },
  physics: {
    label: 'Physics',
    icon: '⚡',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    topics: [
      {
        name: 'Newton\'s Laws & Kinematics',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'F = ma (2nd Law). Every action has equal & opposite reaction (3rd Law)',
          'Kinematics: v = u+at, s = ut+½at², v² = u²+2as. g = 9.8 m/s² (use 10 for MCQs)',
          'Projectile at 45° = maximum range. At 90° = maximum height',
        ],
      },
      {
        name: 'Electricity & Circuits',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Ohm\'s Law: V = IR. Power: P = VI = I²R = V²/R',
          'Series: R_total = R1+R2 (resistances add). Current is SAME throughout',
          'Parallel: 1/R = 1/R1+1/R2 (total less than smallest). Voltage is SAME',
        ],
      },
      {
        name: 'Energy, Work & Power',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'KE = ½mv². If speed doubles → KE quadruples (v² relationship)',
          'W = F×d (work). P = W/t (power). Units: Joule, Watt',
          'Conservation of energy: KE + PE = constant (in absence of friction)',
        ],
      },
      {
        name: 'Optics & Waves',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'Convex lens: converges light, used for reading/farsightedness',
          'Concave lens: diverges light, used for myopia (nearsightedness)',
          'Speed = frequency × wavelength. Sound needs medium, light doesn\'t',
        ],
      },
    ],
  },
  chemistry: {
    label: 'Chemistry',
    icon: '🧪',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    topics: [
      {
        name: 'Atomic Structure & Periodic Table',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Atomic number = protons. Mass number = protons + neutrons. Isotopes differ in neutrons',
          'Periods: horizontal (7 total). Groups: vertical (18 total)',
          'Memorize first 20 elements. Noble gases (Group 18) are inert/non-reactive',
        ],
      },
      {
        name: 'Chemical Bonding',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Ionic: metal + non-metal, electron TRANSFERRED (NaCl, MgO)',
          'Covalent: non-metal + non-metal, electrons SHARED (H₂O, CO₂, N₂)',
          'Valencies: H=1, O=2, N=3, C=4, Na=1, Ca=2, Cl=1',
        ],
      },
      {
        name: 'Acids, Bases & pH',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'pH < 7 = acidic. pH = 7 = neutral. pH > 7 = basic/alkaline',
          'Common acids: HCl (hydrochloric), H₂SO₄ (sulfuric), CH₃COOH (acetic/vinegar)',
          'Neutralization: Acid + Base → Salt + Water',
        ],
      },
      {
        name: 'Chemical Reactions',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'Exothermic: heat released (combustion, respiration)',
          'Endothermic: heat absorbed (photosynthesis, cooking)',
          'OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons)',
        ],
      },
    ],
  },
  mathematics: {
    label: 'Mathematics',
    icon: '📐',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    topics: [
      {
        name: 'Algebra & Quadratics',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '5–6 questions',
        tips: [
          'Quadratic formula: x = (-b ± √(b²-4ac))/2a. Sum of roots = -b/a, Product = c/a',
          '(a+b)² = a²+2ab+b². (a-b)² = a²-2ab+b². a²-b² = (a+b)(a-b)',
          'Laws of indices: aᵐ×aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1',
        ],
      },
      {
        name: 'Trigonometry',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'SOH CAH TOA. Special values: sin30°=½, cos60°=½, tan45°=1, sin90°=1',
          'sin²θ + cos²θ = 1 (most frequently tested identity)',
          'ASTC rule: All positive (Q1), Sin (Q2), Tan (Q3), Cos (Q4)',
        ],
      },
      {
        name: 'Calculus (Differentiation)',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'd/dx(xⁿ) = nxⁿ⁻¹. d/dx(sinx) = cosx. d/dx(cosx) = -sinx. d/dx(eˣ) = eˣ',
          '∫xⁿdx = xⁿ⁺¹/(n+1)+C. ∫sinx = -cosx+C. ∫cosx = sinx+C',
          'Don\'t forget the +C in indefinite integration — common mistake',
        ],
      },
      {
        name: 'Sequences & Series (AP/GP)',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'AP nth term = a+(n-1)d. Sum = n/2[2a+(n-1)d]',
          'GP nth term = arⁿ⁻¹. Sum = a(rⁿ-1)/(r-1)',
          'Identify AP or GP first — check if differences are constant (AP) or ratios (GP)',
        ],
      },
    ],
  },
  biology: {
    label: 'Biology',
    icon: '🧬',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    topics: [
      {
        name: 'Cell Biology',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Mitochondria = energy (ATP). Chloroplast = photosynthesis. Ribosome = protein synthesis',
          'Plant cell has: cell wall, chloroplasts, large vacuole — animal cell does NOT',
          'Mitosis → 2 identical cells (growth). Meiosis → 4 haploid cells (reproduction)',
        ],
      },
      {
        name: 'Genetics & Heredity',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'DNA double helix: A-T and C-G pairs. RNA has Uracil instead of Thymine',
          '46 chromosomes (23 pairs) in human body cells. Gametes have 23',
          'Dominant (capital) masks recessive (lowercase). Aa × Aa → 75% dominant phenotype',
        ],
      },
      {
        name: 'Human Body Systems',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'Kidney functional unit = nephron. Liver detoxifies blood. Pancreas makes insulin',
          'Blood type O = universal donor. AB = universal recipient',
          'Largest organ = skin. Largest internal organ = liver. Smallest bone = stapes (ear)',
        ],
      },
      {
        name: 'Plant Biology',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in chloroplasts)',
          'Xylem carries WATER up from roots. Phloem carries FOOD down from leaves',
          'Transpiration: water loss through leaf stomata drives water movement',
        ],
      },
    ],
  },
  computer_science: {
    label: 'Computer Science',
    icon: '💻',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    topics: [
      {
        name: 'Computer Fundamentals & Memory',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '5–6 questions',
        tips: [
          'RAM = volatile (lost on power off). ROM = non-volatile. Cache = fastest memory',
          '1 byte = 8 bits. 1 KB = 1024 bytes. 1 MB = 1024 KB. 1 GB = 1024 MB',
          'CPU parts: ALU (arithmetic), CU (control unit), Registers (temporary storage)',
        ],
      },
      {
        name: 'Data Structures & Algorithms',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '4–5 questions',
        tips: [
          'Stack = LIFO (Last In First Out). Queue = FIFO (First In First Out)',
          'Binary Search = O(log n) — requires sorted data. Linear Search = O(n)',
          'Bubble/Selection Sort = O(n²). Merge Sort = O(n log n) — best for large data',
        ],
      },
      {
        name: 'Number Systems',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Binary (base 2), Octal (base 8), Decimal (base 10), Hex (base 16)',
          'Decimal 10 = Binary 1010. Decimal 15 = Binary 1111 = Hex F',
          'To convert Decimal to Binary: divide by 2 repeatedly and read remainders upward',
        ],
      },
      {
        name: 'Programming & OOP',
        frequency: 'Medium',
        freqColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        weight: '2–3 questions',
        tips: [
          'OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction',
          'Compiler: translates whole program. Interpreter: translates line by line',
          'Variable = stores data. Function = reusable block. Loop = repetition',
        ],
      },
    ],
  },
  commerce: {
    label: 'Commerce',
    icon: '🏪',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    topics: [
      {
        name: 'Types of Trade & Trade Documents',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Entrepôt trade = import goods then RE-EXPORT them without processing — often tested as a tricky term',
          'Visible trade = physical goods. Invisible trade = services (tourism, banking, insurance)',
          'Bill of Lading = most important sea trade document (receipt + title of goods from shipping company)',
          'Letter of Credit (L/C) = most SECURE payment method in international trade (bank guarantees payment)',
        ],
      },
      {
        name: 'Business Organizations',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'KEY TRICK: Unlimited liability = Sole Trader & Partnership (personal assets at risk)',
          'Limited liability = Companies only (shareholders can only lose their investment)',
          'Co-operative: profit distributed as dividend on PURCHASES, not on capital shares',
          'Pvt Ltd: shares NOT publicly traded. Public Ltd (PLC): shares listed on Stock Exchange',
          'Partnership: max 20 partners (10 for banking). Governed by Partnership Act 1932',
        ],
      },
      {
        name: 'Banking & Negotiable Instruments',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Cheque parties: Drawer (account holder who writes it), Drawee (bank), Payee (receiver)',
          'Crossed cheque: must be DEPOSITED, cannot be cashed at counter — reduces fraud risk',
          'Bill of Exchange: creditor orders debtor to pay. Promissory Note: debtor PROMISES to pay',
          'SBP (State Bank of Pakistan) = central bank = lender of last resort, issues currency',
        ],
      },
      {
        name: 'Insurance Principles',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Insurable Interest: must have financial stake in what you insure — must exist at time of loss',
          'Indemnity: compensation = actual loss only. You CANNOT profit from insurance',
          'KEY TRICK: Indemnity does NOT apply to Life Insurance (can\'t put monetary value on life)',
          'Subrogation: insurer takes your right to sue third party AFTER paying your claim',
          'Utmost Good Faith: both sides must disclose ALL material facts — hiding info = void policy',
        ],
      },
    ],
  },
  accounting: {
    label: 'Accounting',
    icon: '📊',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    topics: [
      {
        name: 'Accounting Equation & Double Entry',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Accounting Equation: Assets = Liabilities + Capital. ALWAYS balanced after every transaction',
          'DEAD CLIC trick: Debits increase Expenses, Assets, Drawings. Credits increase Liabilities, Income, Capital',
          'KEY TRICK: Buying an asset on credit → Asset ↑ AND Liability ↑ (equation still balanced)',
          'Owner withdrawing cash = Drawings → reduces Capital, reduces Cash (both sides affected)',
        ],
      },
      {
        name: 'Final Accounts (Trading, P&L, Balance Sheet)',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '5–6 questions',
        tips: [
          'Gross Profit = Sales − Cost of Goods Sold. COGS = Opening Stock + Purchases − Closing Stock',
          'Net Profit = Gross Profit − All Expenses (rent, wages, depreciation etc.)',
          'KEY TRICK: Closing Stock appears in Trading Account (credit) AND Balance Sheet (current asset) — NOT in Trial Balance',
          'Accrued expenses (unpaid) → add to expense in P&L AND show as current liability in Balance Sheet',
          'Prepaid expenses (paid in advance) → reduce expense in P&L AND show as current asset in Balance Sheet',
        ],
      },
      {
        name: 'Depreciation',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Straight Line (SLM): fixed amount yearly = (Cost − Residual Value) / Useful Life',
          'Reducing Balance (RBM): fixed % on book value — amount DECREASES each year',
          'KEY TRICK: RBM gives HIGHER depreciation in early years. SLM is constant throughout',
          'Depreciation is a NON-CASH expense — reduces profit but does NOT directly affect cash',
          'Book Value = Cost − Accumulated Depreciation. Never negative (asset retired when value reaches zero)',
        ],
      },
      {
        name: 'Stock Valuation & Financial Ratios',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'FIFO (First In First Out): rising prices → HIGHER closing stock → HIGHER profit',
          'LIFO (Last In First Out): rising prices → LOWER closing stock → LOWER profit',
          'AVCO: weighted average smooths out price changes',
          'Current Ratio = Current Assets / Current Liabilities. Ideal = 2:1',
          'Quick Ratio = (Current Assets − Stock) / Current Liabilities. Ideal = 1:1 (excludes illiquid stock)',
        ],
      },
    ],
  },
  economics: {
    label: 'Economics',
    icon: '📈',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    topics: [
      {
        name: 'Demand, Supply & Elasticity',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'Law of Demand: price ↑ → demand ↓ (inverse). Demand curve slopes DOWNWARD left to right',
          'Law of Supply: price ↑ → supply ↑ (direct). Supply curve slopes UPWARD left to right',
          'KEY TRICK: Movement ALONG curve = price change. SHIFT of curve = income, tastes, prices of other goods',
          'PED > 1 = Elastic (luxury goods, many substitutes). PED < 1 = Inelastic (necessities like medicine)',
          'Substitute goods: if price of tea rises → demand for coffee rises (positive cross elasticity)',
          'Complementary goods: if price of cars rises → demand for petrol falls (negative cross elasticity)',
        ],
      },
      {
        name: 'Market Structures',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Perfect Competition: many sellers, identical products, price TAKERS, free entry/exit. Example: wheat farmers',
          'Monopoly: one seller, unique product, price MAKER, high barriers. Example: WAPDA (electricity)',
          'Oligopoly: few large firms (Jazz, Telenor, Ufone in telecom), price RIGIDITY, interdependent',
          'KEY TRICK: Only in Perfect Competition P = MC = AC in long run (zero abnormal profit)',
          'Monopoly always earns abnormal profit due to barriers to entry — cannot be competed away',
        ],
      },
      {
        name: 'GDP, Inflation & Unemployment',
        frequency: 'Very High',
        freqColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        weight: '4–5 questions',
        tips: [
          'GDP = total value of goods & services produced IN a country (includes foreigners working there)',
          'GNP = GDP + Net Factor Income from Abroad (Pakistan nationals abroad included, foreigners excluded)',
          'KEY TRICK: GDP measures location. GNP measures nationality — most tested distinction',
          'Inflation types: Demand-pull (excess demand) vs Cost-push (higher input costs e.g. oil prices)',
          'Unemployment: Cyclical (recession), Frictional (between jobs), Structural (skills mismatch), Seasonal (farming)',
          'Phillips Curve: lower unemployment ↔ higher inflation (short-run trade-off)',
        ],
      },
      {
        name: 'Fiscal Policy, Monetary Policy & International Trade',
        frequency: 'High',
        freqColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        weight: '3–4 questions',
        tips: [
          'Fiscal Policy = government (taxation & spending). Monetary Policy = Central Bank (SBP) — interest rates & money supply',
          'To control inflation: raise interest rates (monetary) OR increase taxes/reduce spending (fiscal)',
          'Comparative Advantage: produce what you\'re relatively BETTER at — basis of all international trade',
          'Balance of Trade = Exports − Imports (goods only). Surplus = exports > imports',
          'KEY TRICK: Currency depreciation → exports become CHEAPER (more competitive). Imports become expensive',
          'Pakistan main exports: Textiles & cotton. Main import: Petroleum & machinery',
        ],
      },
    ],
  },
};

const GROUP_SECTIONS = {
  'NAT-IE': ['english', 'analytical', 'quantitative', 'physics', 'chemistry', 'mathematics'],
  'NAT-IM': ['english', 'analytical', 'quantitative', 'physics', 'chemistry', 'biology'],
  'NAT-ICS': ['english', 'analytical', 'quantitative', 'physics', 'computer_science', 'mathematics'],
  'NAT-ICOM': ['english', 'analytical', 'quantitative', 'commerce', 'accounting', 'economics'],
};

export default function ImportantTopics() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  const sections = GROUP_SECTIONS[user?.nat_group] || Object.keys(IMPORTANT_TOPICS);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Star className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Important Topics</h1>
          <p className="text-sm text-muted-foreground">High-frequency topics from past NAT papers</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Free badge */}
      <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-2xl p-4 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-sm text-foreground leading-relaxed font-medium">This resource is 100% free and does not require a premium subscription.</p>
      </div>

      {/* Section pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveSection(null)}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${!activeSection ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
        >
          All Topics
        </button>
        {sections.map(sec => {
          const s = IMPORTANT_TOPICS[sec];
          if (!s) return null;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(activeSection === sec ? null : sec)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${activeSection === sec ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {(activeSection ? [activeSection] : sections).map((sec, sectionIndex) => {
          const data = IMPORTANT_TOPICS[sec];
          if (!data) return null;
          return (
            <motion.div 
              key={sec} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-2xl">
                <span className="text-2xl w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border">{data.icon}</span>
                <h2 className={`font-display font-bold text-xl ${data.color}`}>{data.label}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.topics.map((topic, i) => (
                  <div key={i} className={`bg-card rounded-2xl p-6 border-2 transition-all hover:shadow-md ${data.border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg mb-2">{topic.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${topic.freqColor}`}>● {topic.frequency} Frequency</span>
                          <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">· {topic.weight}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg ${data.bg} flex items-center justify-center shrink-0 border ${data.border}`}>
                        <BookOpen className={`w-4 h-4 ${data.color}`} />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {topic.tips.map((tip, j) => (
                        <div key={j} className="flex items-start gap-3 bg-secondary/50 p-3 rounded-xl border border-border">
                          <p className="text-sm text-foreground font-medium leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}