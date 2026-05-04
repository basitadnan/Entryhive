// Learning tips, tricks, and strategies for NAT preparation

export const learningContent = {
  english: {
    title: "English Tips & Tricks",
    icon: "📚",
    description: "Covers vocabulary, analogies, sentence completion, antonyms, synonyms, and reading comprehension.",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    topics: [
      {
        title: "Vocabulary - Root Word Method",
        tips: [
          "Break the word into prefix + root + suffix. Latin/Greek roots appear in 80% of NAT vocab.",
          'Example: "Benevolent" → bene (good) + vol (wish) = wishing good → Synonym: Kind, Generous',
          "Prefixes: un-, dis-, in-, non- often signal antonyms.",
          "Suffixes: -ful = having; -less = without; -ness = state of.",
          "Learn 10 new words daily with mnemonics for NAT preparation."
        ]
      },
      {
        title: "Analogies Strategy",
        tips: [
          "Find the relationship between the first word pair, then apply the same relationship.",
          "Common relationships: synonyms, antonyms, part-to-whole, tool-to-user, cause-to-effect.",
          "Example: Pen : Writer :: Scalpel : Surgeon (tool : user relationship).",
          "Always check all options before selecting — distractors are designed to confuse."
        ]
      },
      {
        title: "Sentence Completion",
        tips: [
          "Read the entire sentence first to understand the context.",
          "Look for clue words: 'despite', 'although', 'however' signal contrast.",
          "Words like 'moreover', 'furthermore', 'also' signal continuation.",
          "Eliminate obviously wrong options first, then choose the best fit."
        ]
      },
      {
        title: "Reading Comprehension",
        tips: [
          "Read questions BEFORE reading the passage to know what to look for.",
          "Focus on main idea, tone, and specific details asked.",
          "Don't assume information not stated in the passage.",
          "Time management: spend no more than 3 minutes per comprehension set."
        ]
      }
    ],
    keyFacts: [
      "3 Synonym + 4 Antonym = 7 questions in NAT English",
      "Words often tested: Ambiguous, Benevolent, Candid, Diligent, Eloquent",
      "5 Sentence Completion + 3 Analogy + 5 Comprehension = 13 more questions"
    ],
    commonMistakes: [
      "Choosing words that sound similar instead of same meaning",
      "Ignoring the word tone (positive/negative)",
      "Not reading all 4 options before selecting"
    ]
  },
  analytical: {
    title: "Analytical Reasoning Tips & Tricks",
    icon: "🧠",
    description: "Tests logical thinking, pattern recognition, and critical analysis through scenario-based and statement-based questions.",
    color: "text-pink-400",
    borderColor: "border-pink-500/30",
    topics: [
      {
        title: "Scenario-Based Questions",
        tips: [
          "Draw diagrams for seating arrangements — circular or linear.",
          "Use tables to organize given information systematically.",
          "Mark definite facts first, then work on possibilities.",
          "For blood relations, draw family trees to visualize relationships."
        ]
      },
      {
        title: "Statement-Based Logic",
        tips: [
          "Use Venn diagrams for 'All', 'Some', 'No' type statements.",
          "Remember: 'All A are B' does NOT mean 'All B are A'.",
          "'Some A are B' means at least one A is B, possibly all.",
          "Check each conclusion independently against the given statements."
        ]
      },
      {
        title: "Number Series & Patterns",
        tips: [
          "Check differences between consecutive numbers first.",
          "If differences aren't constant, check second-level differences.",
          "Common patterns: squares, cubes, primes, Fibonacci, doubling.",
          "Look for alternating patterns (odd position pattern, even position pattern)."
        ]
      },
      {
        title: "Coding-Decoding",
        tips: [
          "Check if letters are shifted by a fixed number (Caesar cipher).",
          "Check if letters are reversed or rearranged.",
          "Number codes: check if position values are used (A=1, B=2...).",
          "Some codes reverse the word then shift — try multiple approaches."
        ]
      }
    ],
    keyFacts: [
      "12 Scenario-based + 8 Statement-based = 20 questions",
      "Scenario questions carry more weight — practice these most",
      "Time allocation: about 1.5 minutes per analytical question"
    ],
    commonMistakes: [
      "Making assumptions not supported by given information",
      "Confusing 'definitely true' with 'possibly true'",
      "Not considering all possible arrangements"
    ]
  },
  quantitative: {
    title: "Quantitative Reasoning Tips & Tricks",
    icon: "🔢",
    description: "Tests arithmetic, algebra, and geometry skills with real-world problem scenarios.",
    color: "text-green-400",
    borderColor: "border-green-500/30",
    topics: [
      {
        title: "Arithmetic Shortcuts",
        tips: [
          "Percentage trick: X% of Y = Y% of X (e.g., 8% of 50 = 50% of 8 = 4).",
          "For ratio problems: if ratio is a:b with total T, first = aT/(a+b).",
          "Speed = Distance/Time. Convert units: multiply m/s by 3.6 for km/h.",
          "Simple Interest: SI = PRT/100. Compound Interest adds interest on interest."
        ]
      },
      {
        title: "Algebra Tricks",
        tips: [
          "For quadratics: sum of roots = -b/a, product of roots = c/a.",
          "(a+b)² = a² + 2ab + b². (a-b)² = a² - 2ab + b².",
          "a² - b² = (a+b)(a-b) — use for quick factoring.",
          "Substitution is often faster than solving simultaneous equations."
        ]
      },
      {
        title: "Geometry Formulas",
        tips: [
          "Circle: Area = πr², Circumference = 2πr. Use π = 22/7 for easy calculation.",
          "Triangle: Area = ½ × base × height. For right triangles: a² + b² = c².",
          "Rectangle: Area = l×w, Perimeter = 2(l+w).",
          "Volume of cube = s³, cylinder = πr²h, sphere = (4/3)πr³."
        ]
      },
      {
        title: "Data Interpretation",
        tips: [
          "Read graph titles and axis labels carefully before answering.",
          "For bar graphs: compare heights. For pie charts: calculate sector angles.",
          "Approximate when exact values aren't needed — save time.",
          "Watch for different scales on left and right y-axes."
        ]
      }
    ],
    keyFacts: [
      "13 Arithmetic + 4 Algebra + 3 Geometry = 20 questions",
      "Arithmetic is the highest weighted — master percentages, ratios, averages",
      "Memorize squares up to 25 and cubes up to 10"
    ],
    commonMistakes: [
      "Not converting units before calculation",
      "Forgetting to include all cases in probability",
      "Rushing arithmetic and making calculation errors"
    ]
  },
  physics: {
    title: "Physics Problem-Solving",
    icon: "⚡",
    topics: [
      {
        title: "Mechanics & Motion",
        tips: [
          "Kinematics equations: v = u + at, s = ut + ½at², v² = u² + 2as — pick based on missing variable.",
          "Newton's 2nd Law: F = ma. Always identify all forces acting on an object first.",
          "For projectile motion: Horizontal component stays constant. Vertical component uses gravity.",
          "Range is maximum at 45°. At 90° the object goes straight up and comes down.",
          "Momentum p = mv. In collisions: total momentum before = total momentum after."
        ]
      },
      {
        title: "Electricity & Circuits",
        tips: [
          "Ohm's Law: V = IR. If V doubles with R constant, I doubles.",
          "Series circuits: R_total = R1 + R2 + ... (resistances add up).",
          "Parallel circuits: 1/R_total = 1/R1 + 1/R2 (total resistance is LESS than any single resistor).",
          "Power: P = VI = I²R = V²/R. All three forms are equivalent.",
          "Current is same in series. Voltage is same in parallel — memorize this!"
        ]
      },
      {
        title: "Energy & Waves",
        tips: [
          "KE = ½mv². If speed doubles, KE quadruples. If mass doubles, KE doubles.",
          "PE = mgh. At maximum height, all KE becomes PE.",
          "Wave speed = frequency × wavelength. Higher frequency = shorter wavelength.",
          "Sound cannot travel in vacuum. Light can travel in vacuum.",
          "Convex lens: converges light (used in reading glasses). Concave lens: diverges light (for myopia)."
        ]
      },
      {
        title: "Key Formulae to Memorize",
        tips: [
          "g = 9.8 m/s² (use 10 for quick approximation in MCQs).",
          "Speed of light = 3 × 10⁸ m/s. Speed of sound in air ≈ 340 m/s.",
          "Work = Force × displacement (W = Fd). Units: Joule (J).",
          "Pressure = Force/Area (P = F/A). Units: Pascal (Pa).",
          "Escape velocity from Earth = 11.2 km/s. Orbital velocity = 7.9 km/s."
        ]
      }
    ],
    keyFacts: [
      "Mechanics carries the most weight — master Newton's Laws and kinematics",
      "Electricity: series vs parallel is tested very frequently",
      "Units of measurement: N (force), J (energy), W (power), Pa (pressure), Hz (frequency)"
    ],
    commonMistakes: [
      "Forgetting to square velocity in KE = ½mv²",
      "Mixing up series and parallel formulas",
      "Not converting m/s to km/h (multiply by 3.6)"
    ]
  },
  chemistry: {
    title: "Chemistry Key Concepts",
    icon: "🧪",
    topics: [
      {
        title: "Atomic Structure & Periodic Table",
        tips: [
          "Atomic number = protons = electrons (in neutral atom). Mass number = protons + neutrons.",
          "First 20 elements: H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, K, Ca.",
          "Periods = horizontal rows (7 total). Groups = vertical columns (18 total).",
          "Electronegativity increases right and up in the periodic table. F is most electronegative.",
          "Noble gases (Group 18) have full outer shells — they rarely react."
        ]
      },
      {
        title: "Chemical Bonding",
        tips: [
          "Ionic bond: metal + non-metal. Electron is TRANSFERRED. Example: NaCl.",
          "Covalent bond: non-metal + non-metal. Electrons are SHARED. Example: H₂O, CO₂.",
          "Valency of common elements: H=1, O=2, N=3, C=4, Cl=1, Na=1, Ca=2.",
          "Single bond = 2 shared electrons. Double bond = 4. Triple bond = 6.",
          "Hydrogen bonding occurs in water — that's why water has an unusually high boiling point."
        ]
      },
      {
        title: "Acids, Bases & Reactions",
        tips: [
          "pH scale: 0-6 = acidic, 7 = neutral, 8-14 = basic/alkaline.",
          "Common acids: HCl (hydrochloric), H₂SO₄ (sulfuric), HNO₃ (nitric), CH₃COOH (acetic/vinegar).",
          "Neutralization: Acid + Base → Salt + Water.",
          "Exothermic: heat is released (e.g., burning). Endothermic: heat is absorbed (e.g., cooking).",
          "Oxidation = loss of electrons (OIL). Reduction = gain of electrons (RIG). OIL RIG trick!"
        ]
      },
      {
        title: "Stoichiometry & Organic",
        tips: [
          "Molar mass: add atomic masses of all atoms. Example: H₂O = 2(1) + 16 = 18 g/mol.",
          "1 mole = 6.022 × 10²³ particles (Avogadro's number).",
          "Hydrocarbons: Alkanes (CₙH₂ₙ₊₂), Alkenes (CₙH₂ₙ), Alkynes (CₙH₂ₙ₋₂).",
          "Functional groups: -OH (alcohol), -COOH (carboxylic acid), -NH₂ (amine), -CHO (aldehyde).",
          "Allotropes of carbon: Diamond (hardest natural substance), Graphite (conductor), Fullerene."
        ]
      }
    ],
    keyFacts: [
      "NaCl molar mass = 58.5 g/mol. H₂O = 18 g/mol. CO₂ = 44 g/mol",
      "Catalyst speeds up reaction but is not consumed in the reaction",
      "Haber process: N₂ + 3H₂ → 2NH₃ (Iron catalyst, high pressure, 400°C)"
    ],
    commonMistakes: [
      "Confusing atomic number with mass number",
      "Forgetting to balance equations before calculating moles",
      "Mixing up OIL RIG — oxidation loses electrons, reduction gains"
    ]
  },
  mathematics: {
    title: "Mathematics Strategies",
    icon: "📐",
    topics: [
      {
        title: "Algebra & Quadratics",
        tips: [
          "Quadratic formula: x = (-b ± √(b²-4ac))/2a. Discriminant b²-4ac: >0 two real roots, =0 one root, <0 no real roots.",
          "Sum of roots = -b/a. Product of roots = c/a. Use this to avoid solving fully!",
          "(a+b)² = a²+2ab+b². (a-b)² = a²-2ab+b². (a+b)(a-b) = a²-b².",
          "For simultaneous equations: elimination or substitution. Elimination is faster for NAT.",
          "Laws of indices: aᵐ × aⁿ = aᵐ⁺ⁿ. aᵐ ÷ aⁿ = aᵐ⁻ⁿ. (aᵐ)ⁿ = aᵐⁿ."
        ]
      },
      {
        title: "Trigonometry",
        tips: [
          "SOH CAH TOA: sin=Opposite/Hypotenuse, cos=Adjacent/Hypotenuse, tan=Opposite/Adjacent.",
          "Special angles to memorize: sin30°=½, sin60°=√3/2, sin90°=1, cos0°=1, tan45°=1.",
          "Pythagorean identities: sin²θ+cos²θ=1. Divide by cos²θ: tan²θ+1=sec²θ.",
          "sin2θ = 2sinθcosθ. cos2θ = cos²θ - sin²θ = 1-2sin²θ.",
          "Quadrant signs: All positive (Q1), Sin positive (Q2), Tan positive (Q3), Cos positive (Q4). ASTC = All Students Take Calculus."
        ]
      },
      {
        title: "Calculus",
        tips: [
          "Differentiation: d/dx(xⁿ) = nxⁿ⁻¹. d/dx(sinx) = cosx. d/dx(cosx) = -sinx. d/dx(eˣ) = eˣ. d/dx(lnx) = 1/x.",
          "Integration is reverse of differentiation: ∫xⁿdx = xⁿ⁺¹/(n+1) + C.",
          "∫sinx dx = -cosx + C. ∫cosx dx = sinx + C. ∫eˣ dx = eˣ + C.",
          "Product rule: d/dx(uv) = u'v + uv'. Chain rule: d/dx[f(g(x))] = f'(g(x)) × g'(x).",
          "Definite integral = area under curve between limits."
        ]
      },
      {
        title: "Sequences, Matrices & Probability",
        tips: [
          "Arithmetic Progression (AP): nth term = a+(n-1)d. Sum = n/2[2a+(n-1)d].",
          "Geometric Progression (GP): nth term = arⁿ⁻¹. Sum = a(rⁿ-1)/(r-1).",
          "Matrix determinant (2×2): |A| = ad-bc for [[a,b],[c,d]].",
          "Permutation: ⁿPr = n!/(n-r)!. Combination: ⁿCr = n!/[r!(n-r)!].",
          "Probability: P(A) = favorable outcomes / total outcomes. P(A or B) = P(A)+P(B)-P(A and B)."
        ]
      }
    ],
    keyFacts: [
      "d/dx and ∫ are inverses of each other — use to check your work",
      "log rules: log(xy) = logx+logy. log(x/y) = logx-logy. log(xⁿ) = nlogx",
      "Standard angles: 0°, 30°, 45°, 60°, 90° — memorize sin, cos, tan values for all"
    ],
    commonMistakes: [
      "Forgetting the +C in indefinite integration",
      "Confusing permutation (order matters) with combination (order doesn't matter)",
      "Using wrong quadrant sign in trigonometry"
    ]
  },
  biology: {
    title: "Biology Study Guide",
    icon: "🧬",
    topics: [
      {
        title: "Cell Biology",
        tips: [
          "Plant cells have: cell wall, chloroplasts, large central vacuole — animal cells do NOT.",
          "Mitochondria = energy (ATP). Ribosomes = protein synthesis. Nucleus = control center.",
          "Cell membrane is selectively permeable — controls what enters and exits.",
          "Mitosis: 1 cell → 2 identical cells (growth, repair). Meiosis: 1 cell → 4 haploid cells (reproduction).",
          "Osmosis: water moves from low solute (high water) to high solute (low water) concentration."
        ]
      },
      {
        title: "Genetics & DNA",
        tips: [
          "DNA is double helix. A pairs with T, C pairs with G (in DNA). In RNA: A pairs with U.",
          "Dominant allele (capital) masks recessive (lowercase). Homozygous (AA or aa) vs Heterozygous (Aa).",
          "46 chromosomes in human somatic cells (23 pairs). Gametes have 23 chromosomes.",
          "Mendel's Laws: Law of Segregation and Law of Independent Assortment.",
          "Use Punnett square: Aa × Aa gives 25% AA, 50% Aa, 25% aa → 75% dominant phenotype."
        ]
      },
      {
        title: "Human Body Systems",
        tips: [
          "Heart: 4 chambers. Right side = deoxygenated blood (to lungs). Left side = oxygenated (to body).",
          "Kidney functional unit = nephron. Filters blood, produces urine. About 1 million nephrons per kidney.",
          "Nervous system: Central (brain + spinal cord) + Peripheral. Neuron is the basic unit.",
          "Hormones: Insulin (lowers blood sugar — produced by pancreas). Thyroxine (metabolism — thyroid).",
          "Digestion: Mouth → Esophagus → Stomach → Small intestine (absorption) → Large intestine → Rectum."
        ]
      },
      {
        title: "Plant Biology & Ecology",
        tips: [
          "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Occurs in chloroplasts, needs sunlight.",
          "Xylem: water and minerals go UP (from roots to leaves). Phloem: food goes DOWN (from leaves).",
          "Transpiration: water loss from leaves through stomata. Drives water up the xylem.",
          "Food chain: Producer → Primary Consumer → Secondary Consumer → Tertiary Consumer.",
          "Classification: Kingdom → Phylum → Class → Order → Family → Genus → Species (King Philip Came Over For Good Soup)."
        ]
      }
    ],
    keyFacts: [
      "Universal donor blood type: O-negative. Universal recipient: AB-positive",
      "Largest organ: Skin. Largest internal organ: Liver. Smallest bone: Stapes (in ear)",
      "Penicillin discovered by Alexander Fleming in 1928. First antibiotic."
    ],
    commonMistakes: [
      "Confusing mitosis (2 identical cells) with meiosis (4 haploid cells)",
      "Forgetting Xylem carries WATER up, Phloem carries FOOD down",
      "Mixing up dominant (capital letter) and recessive (lowercase) alleles"
    ]
  },
  commerce: {
    title: "Commerce Tips & Tricks",
    icon: "🏪",
    description: "Covers trade, business organizations, banking, insurance, and marketing.",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    topics: [
      {
        title: "Types of Trade",
        tips: [
          "Home Trade = buying/selling WITHIN a country. Foreign Trade = between countries.",
          "Export trade: goods/services sold ABROAD. Import trade: bought FROM abroad. Entrepot = re-export (buy→store→sell abroad).",
          "Wholesale trade: buys in bulk from producers, sells to retailers. Retail: sells directly to consumers.",
          "Common trick: Entrepôt trade means goods are IMPORTED then RE-EXPORTED — not manufactured locally.",
          "Visible trade = physical goods (cars, wheat). Invisible trade = services (banking, tourism, insurance)."
        ]
      },
      {
        title: "Business Organizations",
        tips: [
          "Sole Trader: one owner, unlimited liability, all profit kept but all loss personal.",
          "Partnership: 2–20 partners (banking max 10), governed by Partnership Act. Joint & Several liability.",
          "Private Ltd Company (Pvt Ltd): shares NOT publicly sold, minimum 2 shareholders. Public Ltd (PLC): shares on stock exchange.",
          "Co-operative Society: formed to help members, profit shared as dividend on PURCHASES (not shares).",
          "KEY TRICK: Unlimited liability = Sole trader & partnership (personal assets at risk). Limited liability = companies only.",
          "Memorandum of Association = external document (name, objectives). Articles of Association = internal rules."
        ]
      },
      {
        title: "Banking & Negotiable Instruments",
        tips: [
          "Cheque: unconditional written order to bank to pay. Drawer = account holder. Drawee = bank. Payee = receiver.",
          "Bearer cheque: paid to whoever presents it. Order cheque: paid only to named person or their order.",
          "Crossed cheque: two parallel lines — must be deposited in bank, cannot be cashed over counter.",
          "Bill of Exchange: written order by creditor to debtor to pay. Promissory Note: debtor's written promise to pay.",
          "Letter of Credit (L/C): bank guarantee of payment in international trade — most secure payment method.",
          "Central Bank (SBP in Pakistan): lender of last resort, issues currency, controls monetary policy. Commercial banks: accept deposits, give loans."
        ]
      },
      {
        title: "Insurance Principles",
        tips: [
          "Insurable Interest: you can only insure something you would suffer a LOSS from if it was damaged.",
          "Utmost Good Faith (Uberrimae Fidei): both parties must disclose ALL material facts — no hiding information.",
          "Indemnity: you cannot profit from insurance — only compensated for actual loss. (Applies to fire & marine, NOT life insurance.)",
          "Subrogation: after paying claim, insurer takes over your rights to claim from the responsible party.",
          "Contribution: if insured with multiple insurers, each pays proportionate share.",
          "Marine Insurance covers: hull (ship body), cargo (goods), freight (transport cost). Life insurance has NO indemnity principle."
        ]
      },
      {
        title: "Trade Documents & E-Commerce",
        tips: [
          "Invoice: document showing goods sold, price, and terms. Proforma invoice = preliminary/quote invoice.",
          "Bill of Lading: receipt from shipping company + title of goods. Most important document in sea trade.",
          "Consular Invoice: certified by importing country's consul — used for customs purposes.",
          "Channels of distribution: Manufacturer → Wholesaler → Retailer → Consumer (longest channel).",
          "E-Commerce advantages: 24/7 availability, global reach, lower costs, no physical store needed.",
          "Consumer Protection: Sale of Goods Act ensures goods are fit for purpose, as described, and of satisfactory quality."
        ]
      }
    ],
    keyFacts: [
      "SBP (State Bank of Pakistan) = central bank — controls monetary policy, issues currency",
      "Stock Exchange: primary market (new shares issued via IPO). Secondary market (existing shares traded)",
      "Warehousing function: time utility (available when needed), bonded warehouse = goods under customs control"
    ],
    commonMistakes: [
      "Confusing unlimited liability (sole trader/partnership) with limited liability (companies)",
      "Thinking indemnity applies to life insurance — it does NOT",
      "Mixing up Bill of Lading (sea transport receipt) with Bill of Exchange (payment instrument)"
    ]
  },
  accounting: {
    title: "Accounting Tips & Tricks",
    icon: "📊",
    description: "Covers the accounting equation, double entry, final accounts, depreciation, and financial analysis.",
    color: "text-teal-400",
    borderColor: "border-teal-500/30",
    topics: [
      {
        title: "Accounting Equation & Double Entry",
        tips: [
          "Golden Rule: Assets = Liabilities + Capital (Owner's Equity). ALWAYS balanced.",
          "Debit Rules: Debit increases Assets and Expenses. Credit increases Liabilities, Capital, and Revenue.",
          "Real accounts: debit what comes in, credit what goes out.",
          "Personal accounts: debit the receiver, credit the giver.",
          "Nominal accounts: debit all expenses/losses, credit all incomes/gains.",
          "TRICK: DEAD CLIC — Debits increase: Expenses, Assets, Drawings. Credits increase: Liabilities, Income, Capital."
        ]
      },
      {
        title: "Journal, Ledger & Trial Balance",
        tips: [
          "Journal: records transactions in chronological order (book of original entry).",
          "Ledger: individual accounts for each item — summarizes journal entries (book of final entry).",
          "Trial Balance: list of all ledger balances. Debit column = Credit column if no errors.",
          "Trial Balance does NOT catch: errors of omission, commission, principle, compensating errors.",
          "Closing Stock appears in Trading Account (credit side) AND Balance Sheet (current assets) — not in Trial Balance.",
          "KEY TRICK: If trial balance doesn't balance, check for arithmetic errors or single-sided entries first."
        ]
      },
      {
        title: "Final Accounts",
        tips: [
          "Trading Account: Sales − Cost of Goods Sold = Gross Profit. COGS = Opening Stock + Purchases − Closing Stock.",
          "Profit & Loss Account: Gross Profit − Expenses = Net Profit.",
          "Balance Sheet: Assets side (Fixed + Current assets). Liabilities side (Capital + Long-term + Current liabilities).",
          "Current assets: Stock, Debtors, Cash, Bank, Prepaid expenses. Fixed assets: Land, Buildings, Machinery.",
          "Current liabilities: Creditors, Bank overdraft, Accrued expenses. Long-term: Mortgage, Loans.",
          "TRICK: Balance Sheet is a POSITION statement (snapshot at a date). P&L is a PERFORMANCE statement (for a period)."
        ]
      },
      {
        title: "Depreciation Methods",
        tips: [
          "Straight-Line Method (SLM): same amount each year. Formula: (Cost − Residual Value) / Useful Life.",
          "Reducing Balance Method (RBM): fixed % on book value each year. Amount decreases over time.",
          "SLM: asset reaches zero value. RBM: asset never reaches zero (always a small book value).",
          "KEY TRICK: RBM gives higher depreciation in early years, lower in later years. SLM is constant every year.",
          "Depreciation is NOT a cash expense — it's an accounting adjustment to account for asset wear.",
          "Accumulated depreciation = total depreciation charged so far. Book Value = Cost − Accumulated Depreciation."
        ]
      },
      {
        title: "Stock Valuation & Ratios",
        tips: [
          "FIFO (First In First Out): oldest stock sold first. In rising prices → higher closing stock value → higher profit.",
          "LIFO (Last In First Out): newest stock sold first. In rising prices → lower closing stock value → lower profit.",
          "AVCO (Average Cost): weighted average of all stock. Smooths out price fluctuations.",
          "Current Ratio = Current Assets / Current Liabilities. Ideal ≈ 2:1.",
          "Quick (Acid Test) Ratio = (Current Assets − Stock) / Current Liabilities. Ideal ≈ 1:1.",
          "ROCE = Net Profit / Capital Employed × 100. Gross Profit Margin = Gross Profit / Sales × 100."
        ]
      }
    ],
    keyFacts: [
      "Accounting concepts: Going Concern (business continues), Accrual (record when earned not when cash received), Consistency (same methods each year), Prudence (don't anticipate profit, do anticipate losses)",
      "Debtors = people who OWE us money (asset). Creditors = people WE OWE money (liability)",
      "Bank Reconciliation Statement reconciles Cash Book balance with Bank Statement balance"
    ],
    commonMistakes: [
      "Putting Closing Stock in Trial Balance — it does NOT appear there",
      "Confusing FIFO (older stock first) with LIFO (newer stock first) in rising price scenarios",
      "Forgetting that depreciation is a non-cash expense — it doesn't affect cash flow directly"
    ]
  },
  economics: {
    title: "Economics Tips & Tricks",
    icon: "📈",
    description: "Covers microeconomics, macroeconomics, market structures, and international trade.",
    color: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    topics: [
      {
        title: "Demand, Supply & Elasticity",
        tips: [
          "Law of Demand: price ↑ → quantity demanded ↓ (inverse relationship). Demand curve slopes DOWNWARD.",
          "Law of Supply: price ↑ → quantity supplied ↑ (direct relationship). Supply curve slopes UPWARD.",
          "Shifts vs Movement: price change = movement ALONG curve. Other factors = SHIFT of the curve.",
          "Price Elasticity of Demand (PED) = % change in QD / % change in Price. PED > 1 = elastic. PED < 1 = inelastic.",
          "KEY TRICK: Luxury goods are elastic (many substitutes). Necessities are inelastic (few substitutes).",
          "Equilibrium: where demand = supply curves intersect. Surplus → price falls. Shortage → price rises."
        ]
      },
      {
        title: "Market Structures",
        tips: [
          "Perfect Competition: many sellers, identical products, no price control (price TAKERS), free entry/exit. Example: agriculture.",
          "Monopoly: one seller, unique product, price MAKER, barriers to entry. Example: WAPDA (electricity in Pakistan).",
          "Oligopoly: few large firms, interdependent, price rigidity. Example: telecom companies (Jazz, Telenor, Ufone).",
          "Monopolistic Competition: many firms, differentiated products, some price control. Example: restaurants.",
          "KEY TRICK: Only in perfect competition is price = MC = AC in long run. Monopoly always earns abnormal profit.",
          "Monopsony = one BUYER (single buyer market). Oligopsony = few buyers."
        ]
      },
      {
        title: "Macroeconomics — GDP & Inflation",
        tips: [
          "GDP = total value of goods & services produced IN a country in one year (by residents + foreigners).",
          "GNP = GDP + Net Factor Income from Abroad (by nationals only, wherever they are).",
          "GDP per capita = GDP / Population — measures average standard of living.",
          "Inflation: general rise in price level. CPI = Consumer Price Index (measures inflation in Pakistan).",
          "Types of Inflation: Demand-pull (too much demand) vs Cost-push (higher production costs).",
          "KEY TRICK: Hyperinflation = very rapid inflation (e.g., Zimbabwe). Deflation = falling prices — also harmful (reduces spending)."
        ]
      },
      {
        title: "Fiscal & Monetary Policy",
        tips: [
          "Fiscal Policy: government uses TAXATION and SPENDING. Expansionary = lower taxes + more spending (boosts economy).",
          "Monetary Policy: central bank (SBP) uses INTEREST RATES and MONEY SUPPLY. Expansionary = lower interest rates.",
          "To reduce inflation: raise interest rates (monetary) or increase taxes/cut spending (fiscal).",
          "Unemployment types: Cyclical (recession), Frictional (between jobs), Structural (skills mismatch), Seasonal.",
          "Phillips Curve: trade-off between inflation and unemployment — lower unemployment → higher inflation.",
          "KEY TRICK: SBP controls monetary policy in Pakistan. Federal Budget = fiscal policy by government."
        ]
      },
      {
        title: "International Trade & Pakistan Economy",
        tips: [
          "Comparative Advantage: produce what you're relatively BETTER at, even if not absolutely best — basis of free trade.",
          "Balance of Trade = Exports − Imports of visible goods only. Surplus = exports > imports.",
          "Balance of Payments = all transactions (goods, services, capital) between countries. Must always balance.",
          "Exchange Rate: appreciation → exports more expensive (less competitive). Depreciation → exports cheaper.",
          "Pakistan's main exports: Textiles & cotton (largest), rice, sports goods. Main imports: Machinery, petroleum.",
          "KEY TRICK: Current Account includes goods + services + remittances. Capital Account includes investments & loans. Remittances from overseas Pakistanis are Pakistan's important income source."
        ]
      }
    ],
    keyFacts: [
      "Pakistan's Central Bank = State Bank of Pakistan (SBP). GST = General Sales Tax (indirect tax in Pakistan)",
      "WTO (World Trade Organization): promotes free trade globally. IMF: provides loans to countries with balance of payments problems",
      "Gini Coefficient: measures income inequality. 0 = perfect equality. 1 = perfect inequality"
    ],
    commonMistakes: [
      "Confusing GDP (by location) with GNP (by nationality) — GDP includes foreigners working in Pakistan",
      "Thinking depreciation of currency is always bad — it helps exports by making them cheaper",
      "Mixing up fiscal policy (government) with monetary policy (central bank)"
    ]
  },
  computer_science: {
    title: "Computer Science Essentials",
    icon: "💻",
    topics: [
      {
        title: "Computer Fundamentals & Hardware",
        tips: [
          "CPU components: ALU (arithmetic), CU (control), Registers (temporary storage).",
          "Memory hierarchy: Registers > Cache > RAM > Hard Disk (speed decreases, size increases).",
          "RAM = volatile (data lost on power off). ROM = non-volatile (permanent).",
          "Input devices: keyboard, mouse, scanner. Output devices: monitor, printer, speakers.",
          "1 bit → 4 bits (nibble) → 8 bits (byte) → 1024 bytes (KB) → 1024 KB (MB) → 1024 MB (GB)."
        ]
      },
      {
        title: "Number Systems",
        tips: [
          "Binary (base 2): only 0 and 1. Convert by dividing by 2 and reading remainders upward.",
          "Decimal 10 = Binary 1010. Decimal 15 = Binary 1111 = Hexadecimal F.",
          "Hexadecimal uses: 0-9 then A(10), B(11), C(12), D(13), E(14), F(15).",
          "To convert Binary to Hex: group binary digits in sets of 4 from right.",
          "Octal (base 8): digits 0-7. Group binary in sets of 3 from right."
        ]
      },
      {
        title: "Programming & Data Structures",
        tips: [
          "Stack = LIFO (Last In First Out). Queue = FIFO (First In First Out). Remember: Stack like a pile of plates.",
          "Array: O(1) access by index, O(n) search. Linked List: O(n) access, easy insertion/deletion.",
          "Binary Search: O(log n) — requires SORTED array. Linear Search: O(n).",
          "Sorting: Bubble/Selection/Insertion = O(n²). Merge Sort/Quick Sort = O(n log n).",
          "OOP Pillars: Encapsulation (hide data), Inheritance (parent-child), Polymorphism (many forms), Abstraction (hide complexity)."
        ]
      },
      {
        title: "Databases & Networking",
        tips: [
          "SQL: SELECT (read), INSERT (add), UPDATE (modify), DELETE (remove). WHERE filters records.",
          "Primary key: uniquely identifies each record. Foreign key: links to another table's primary key.",
          "Normalization reduces data redundancy. 1NF → 2NF → 3NF (higher = less redundancy).",
          "IP Address identifies a device on a network. HTTP (web), FTP (files), SMTP (email), DNS (domain names).",
          "OSI Model: 7 layers. From bottom: Physical, Data Link, Network, Transport, Session, Presentation, Application."
        ]
      }
    ],
    keyFacts: [
      "ASCII: A=65, a=97, 0=48 — memorize these for coding questions",
      "Boolean logic: AND (both true), OR (at least one true), NOT (opposite), XOR (different values)",
      "Compiler: translates entire program. Interpreter: translates line by line."
    ],
    commonMistakes: [
      "Confusing Stack (LIFO) with Queue (FIFO)",
      "Forgetting RAM is volatile — data is lost when power is turned off",
      "Mixing up primary key and foreign key in database questions"
    ]
  }
};

export function getLearningContentForGroup(natGroup) {
  const common = ['english', 'analytical', 'quantitative'];
  let subjects = [];
  switch (natGroup) {
    case 'NAT-IE': subjects = ['physics', 'chemistry', 'mathematics']; break;
    case 'NAT-IM': subjects = ['physics', 'chemistry', 'biology']; break;
    case 'NAT-ICS': subjects = ['physics', 'computer_science', 'mathematics']; break;
    case 'NAT-ICOM': subjects = ['commerce', 'accounting', 'economics']; break;
    default: subjects = [];
  }
  
  const allSections = [...common, ...subjects];
  return allSections.map(key => ({
    key,
    ...learningContent[key]
  }));
}

export function getSubjectLearningContent(natGroup) {
  switch (natGroup) {
    case 'NAT-IE': return ['physics', 'chemistry', 'mathematics'].map(k => ({ key: k, ...learningContent[k] }));
    case 'NAT-IM': return ['physics', 'chemistry', 'biology'].map(k => ({ key: k, ...learningContent[k] }));
    case 'NAT-ICS': return ['physics', 'computer_science', 'mathematics'].map(k => ({ key: k, ...learningContent[k] }));
    case 'NAT-ICOM': return ['commerce', 'accounting', 'economics'].map(k => ({ key: k, ...learningContent[k] }));
    default: return [];
  }
}