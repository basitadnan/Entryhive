import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Calculator, Sigma, Triangle, Pi, BarChart3, Hash, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStaggerReveal } from '@/hooks/useScrollAnimation';

const formulaCategories = [
  {
    id: 'arithmetic',
    title: 'Arithmetic',
    icon: Calculator,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    borderActive: 'border-blue-500/30',
    formulas: [
      { name: 'Percentage', formula: 'Percentage = (Part ÷ Whole) × 100', note: 'Increase: New = Old × (1 + p/100)\nDecrease: New = Old × (1 − p/100)' },
      { name: 'Average (Mean)', formula: 'Average = Sum of all terms ÷ Number of terms' },
      { name: 'Ratio & Proportion', formula: 'a : b = a/b\nIf a : b = c : d, then ad = bc (cross multiply)' },
      { name: 'Speed, Distance & Time', formula: 'Speed = Distance ÷ Time\nDistance = Speed × Time\nTime = Distance ÷ Speed' },
      { name: 'Profit & Loss', formula: 'Profit = SP − CP\nLoss = CP − SP\nProfit% = (Profit ÷ CP) × 100\nLoss% = (Loss ÷ CP) × 100' },
      { name: 'Simple Interest', formula: 'SI = (P × R × T) ÷ 100\nAmount = P + SI', note: 'P = Principal, R = Rate%, T = Time in years' },
      { name: 'Compound Interest', formula: 'A = P(1 + R/100)ⁿ\nCI = A − P', note: 'n = number of compounding periods' },
      { name: 'LCM & HCF', formula: 'LCM × HCF = Product of two numbers\nLCM = smallest common multiple\nHCF = largest common factor' },
      { name: 'Discount', formula: 'Discount = Marked Price − Selling Price\nDiscount% = (Discount ÷ Marked Price) × 100' },
      { name: 'Work & Time', formula: 'If A does work in x days, A\'s rate = 1/x per day\nCombined rate: 1/x + 1/y\nTime together = xy ÷ (x + y)' },
      { name: 'Mixture & Alligation', formula: 'Weighted Average = (w₁×a₁ + w₂×a₂) ÷ (w₁ + w₂)', note: 'Used for mixing two quantities at different rates' },
      { name: 'Ages', formula: 'Set up equations from the given conditions.\nCommon pattern: "x years ago/hence" → subtract/add x from current ages.' },
      { name: 'Fraction to Percentage', formula: '1/2 = 50%    1/3 ≈ 33.3%    1/4 = 25%\n1/5 = 20%    1/6 ≈ 16.7%    1/8 = 12.5%\n2/3 ≈ 66.7%  3/4 = 75%     3/5 = 60%' },
    ]
  },
  {
    id: 'algebra',
    title: 'Algebra',
    icon: Sigma,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    borderActive: 'border-purple-500/30',
    formulas: [
      { name: 'Algebraic Identities', formula: '(a + b)² = a² + 2ab + b²\n(a − b)² = a² − 2ab + b²\na² − b² = (a − b)(a + b)\n(a + b)³ = a³ + 3a²b + 3ab² + b³\n(a − b)³ = a³ − 3a²b + 3ab² − b³' },
      { name: 'Quadratic Formula', formula: 'For ax² + bx + c = 0:\nx = (−b ± √(b² − 4ac)) ÷ 2a', note: 'Discriminant D = b² − 4ac\nD > 0 → two real roots\nD = 0 → one repeated root\nD < 0 → no real roots' },
      { name: 'Sum & Product of Roots', formula: 'Sum of roots = −b/a\nProduct of roots = c/a' },
      { name: 'Arithmetic Progression (AP)', formula: 'nth term: aₙ = a + (n−1)d\nSum of n terms: Sₙ = n/2 × [2a + (n−1)d]', note: 'a = first term, d = common difference' },
      { name: 'Geometric Progression (GP)', formula: 'nth term: aₙ = a × rⁿ⁻¹\nSum of n terms: Sₙ = a(rⁿ − 1) ÷ (r − 1)\nInfinite GP (|r|<1): S∞ = a ÷ (1 − r)', note: 'a = first term, r = common ratio' },
      { name: 'Exponent Rules', formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ\naᵐ ÷ aⁿ = aᵐ⁻ⁿ\n(aᵐ)ⁿ = aᵐⁿ\na⁰ = 1\na⁻ⁿ = 1/aⁿ\n√a = a^(1/2)' },
      { name: 'Logarithm Rules', formula: 'log(ab) = log a + log b\nlog(a/b) = log a − log b\nlog(aⁿ) = n × log a\nlog₁₀10 = 1    log₁₀1 = 0' },
      { name: 'Linear Equations', formula: 'Slope-intercept: y = mx + c\nSlope: m = (y₂ − y₁) ÷ (x₂ − x₁)\nPoint-slope: y − y₁ = m(x − x₁)' },
      { name: 'Factoring Patterns', formula: 'x² + (a+b)x + ab = (x+a)(x+b)\nDifference of cubes: a³ − b³ = (a−b)(a²+ab+b²)\nSum of cubes: a³ + b³ = (a+b)(a²−ab+b²)' },
    ]
  },
  {
    id: 'geometry',
    title: 'Geometry',
    icon: Triangle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    borderActive: 'border-green-500/30',
    formulas: [
      { name: 'Triangle', formula: 'Area = ½ × base × height\nPerimeter = a + b + c\nHeron\'s: Area = √(s(s−a)(s−b)(s−c))', note: 's = (a+b+c)/2 (semi-perimeter)' },
      { name: 'Rectangle', formula: 'Area = length × width\nPerimeter = 2(l + w)\nDiagonal = √(l² + w²)' },
      { name: 'Square', formula: 'Area = side²\nPerimeter = 4 × side\nDiagonal = side × √2' },
      { name: 'Circle', formula: 'Area = πr²\nCircumference = 2πr = πd\nDiameter = 2r', note: 'π ≈ 3.14159 or 22/7' },
      { name: 'Pythagorean Theorem', formula: 'a² + b² = c²', note: 'For right-angled triangles. c = hypotenuse\nCommon triples: (3,4,5), (5,12,13), (8,15,17)' },
      { name: 'Cube', formula: 'Volume = s³\nSurface Area = 6s²\nDiagonal = s√3' },
      { name: 'Rectangular Box (Cuboid)', formula: 'Volume = l × w × h\nSurface Area = 2(lw + wh + lh)\nDiagonal = √(l² + w² + h²)' },
      { name: 'Cylinder', formula: 'Volume = πr²h\nCurved SA = 2πrh\nTotal SA = 2πr(r + h)' },
      { name: 'Cone', formula: 'Volume = ⅓πr²h\nSlant height l = √(r² + h²)\nCurved SA = πrl' },
      { name: 'Sphere', formula: 'Volume = ⁴⁄₃πr³\nSurface Area = 4πr²' },
      { name: 'Angle Properties', formula: 'Sum of angles in triangle = 180°\nSum of angles in quadrilateral = 360°\nSum in polygon = (n−2) × 180°\nExterior angle = 360° ÷ n' },
    ]
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    icon: Pi,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    borderActive: 'border-amber-500/30',
    formulas: [
      { name: 'Basic Ratios', formula: 'sin θ = Opposite ÷ Hypotenuse\ncos θ = Adjacent ÷ Hypotenuse\ntan θ = Opposite ÷ Adjacent = sin θ ÷ cos θ' },
      { name: 'Standard Values', formula: '         0°    30°    45°    60°    90°\nsin      0    1/2    1/√2   √3/2    1\ncos      1    √3/2   1/√2   1/2     0\ntan      0    1/√3    1     √3      ∞' },
      { name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1\n1 + tan²θ = sec²θ\n1 + cot²θ = csc²θ' },
      { name: 'Reciprocal Identities', formula: 'csc θ = 1/sin θ\nsec θ = 1/cos θ\ncot θ = 1/tan θ = cos θ/sin θ' },
      { name: 'Double Angle', formula: 'sin 2θ = 2 sin θ cos θ\ncos 2θ = cos²θ − sin²θ = 2cos²θ − 1\ntan 2θ = 2tan θ ÷ (1 − tan²θ)' },
    ]
  },
  {
    id: 'probability',
    title: 'Probability & Statistics',
    icon: BarChart3,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    borderActive: 'border-rose-500/30',
    formulas: [
      { name: 'Basic Probability', formula: 'P(Event) = Favorable outcomes ÷ Total outcomes\n0 ≤ P(A) ≤ 1\nP(not A) = 1 − P(A)' },
      { name: 'Addition Rule', formula: 'P(A or B) = P(A) + P(B) − P(A and B)\nIf mutually exclusive: P(A or B) = P(A) + P(B)' },
      { name: 'Multiplication Rule', formula: 'P(A and B) = P(A) × P(B)  (if independent)\nP(A and B) = P(A) × P(B|A)  (if dependent)' },
      { name: 'Permutations', formula: 'ⁿPᵣ = n! ÷ (n−r)!\nArrangement of r items from n (order matters)' },
      { name: 'Combinations', formula: 'ⁿCᵣ = n! ÷ (r! × (n−r)!)\nSelection of r items from n (order doesn\'t matter)' },
      { name: 'Mean, Median, Mode', formula: 'Mean = Sum ÷ Count\nMedian = middle value (sorted data)\nMode = most frequent value' },
      { name: 'Factorial', formula: 'n! = n × (n−1) × (n−2) × ... × 1\n0! = 1    1! = 1' },
    ]
  },
  {
    id: 'number_properties',
    title: 'Number Properties',
    icon: Hash,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    borderActive: 'border-cyan-500/30',
    formulas: [
      { name: 'Divisibility Rules', formula: 'By 2: last digit even\nBy 3: sum of digits divisible by 3\nBy 4: last 2 digits divisible by 4\nBy 5: last digit 0 or 5\nBy 6: divisible by both 2 and 3\nBy 8: last 3 digits divisible by 8\nBy 9: sum of digits divisible by 9\nBy 11: alternating sum of digits divisible by 11' },
      { name: 'Number Types', formula: 'Natural: 1, 2, 3, ...\nWhole: 0, 1, 2, 3, ...\nIntegers: ..., −2, −1, 0, 1, 2, ...\nRational: p/q (q ≠ 0)\nIrrational: √2, π, e' },
      { name: 'Absolute Value', formula: '|x| = x if x ≥ 0\n|x| = −x if x < 0' },
      { name: 'Order of Operations', formula: 'BODMAS / PEMDAS:\nBrackets → Orders → Division/Multiplication → Addition/Subtraction' },
    ]
  },
];

function FormulaCard({ formula }) {
  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border shadow-sm space-y-2">
      <h4 className="font-bold text-foreground">{formula.name}</h4>
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap leading-relaxed bg-background/50 border border-border rounded-lg p-3 overflow-x-auto">
        {formula.formula}
      </pre>
      {formula.note && (
        <p className="text-xs text-muted-foreground italic pl-1 leading-relaxed">💡 {formula.note}</p>
      )}
    </div>
  );
}

function CategorySection({ category, isOpen, onToggle }) {
  const Icon = category.icon;
  const { containerProps, itemVariants } = useStaggerReveal({ stagger: 0.04 });

  return (
    <div className={`bg-card rounded-2xl overflow-hidden border-2 transition-colors ${isOpen ? `border-primary/30 shadow-md ${category.bg}` : 'border-border hover:border-primary/20 shadow-sm'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors ${isOpen ? 'bg-card' : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${category.bg} shadow-sm border border-border`}>
            <Icon className={`w-6 h-6 ${category.color}`} />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-foreground text-lg">{category.title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{category.formulas.length} formulas</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="overflow-hidden bg-card"
          >
            <motion.div
              className="px-5 pb-5 space-y-3"
              {...containerProps}
            >
              {category.formulas.map((f, i) => (
                <motion.div key={f.name} variants={itemVariants}>
                  <FormulaCard formula={f} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Formulas() {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState(formulaCategories.map(c => c.id));
  const [search, setSearch] = useState('');

  const toggle = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filtered = search.trim()
    ? formulaCategories.map(cat => ({
        ...cat,
        formulas: cat.formulas.filter(f =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.formula.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.formulas.length > 0)
    : formulaCategories;

  const totalFormulas = formulaCategories.reduce((s, c) => s + c.formulas.length, 0);

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto space-y-6 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-sm">
          <Calculator className="w-6 h-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Formulas</h1>
          <p className="text-sm text-muted-foreground">{totalFormulas} essential NAT quantitative formulas</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for a formula..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground transition-all shadow-sm"
        />
      </div>

      {/* Tip Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
        <span className="text-xl">💡</span>
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Pro Tip:</strong> Memorize fraction-to-percentage shortcuts (like 1/4 = 25%, 1/8 = 12.5%) — they save 10+ seconds per question in the NAT.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filtered.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <CategorySection
              category={cat}
              isOpen={openSections.includes(cat.id) || search.trim().length > 0}
              onToggle={() => toggle(cat.id)}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center bg-card rounded-2xl border border-border p-12 shadow-sm">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground">No formulas found</p>
          <p className="text-muted-foreground mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </motion.div>
  );
}
