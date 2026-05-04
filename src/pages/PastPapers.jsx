import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';

// Past paper questions compiled from NAT-I pattern (2025-2026 style questions)
const pastPaperSets = [
  {
    id: 'pp2025_1',
    title: 'NAT-I Practice Set — Series A',
    year: '2025',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      // English
      { id: 'pp1_1', section: 'English', question: "Choose the correct synonym of 'Conspicuous':", options: ['Hidden', 'Prominent', 'Dull', 'Secret'], correct: 1, explanation: "'Conspicuous' means clearly visible or attracting attention — synonym: prominent.", difficulty: 'medium', topic: 'Synonyms' },
      { id: 'pp1_2', section: 'English', question: "Choose the antonym of 'Meticulous':", options: ['Careful', 'Precise', 'Careless', 'Thorough'], correct: 2, explanation: "'Meticulous' means very careful; 'careless' is its antonym.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp1_3', section: 'English', question: "The manager, as well as his employees, _____ responsible.", options: ['are', 'were', 'is', 'have been'], correct: 2, explanation: "When 'as well as' joins subjects, the verb agrees with the first subject (manager = singular = is).", difficulty: 'medium', topic: 'Grammar' },
      { id: 'pp1_4', section: 'English', question: "Book : Library :: Painting : ___", options: ['Artist', 'Canvas', 'Gallery', 'Museum'], correct: 2, explanation: "Books are kept in a library; paintings are displayed in a gallery.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp1_5', section: 'English', question: "Choose the word closest in meaning to 'Magnanimous':", options: ['Petty', 'Generous', 'Stingy', 'Cruel'], correct: 1, explanation: "'Magnanimous' means very generous or forgiving.", difficulty: 'hard', topic: 'Synonyms' },
      // Analytical
      { id: 'pp1_6', section: 'Analytical', question: "Find the next number: 3, 9, 27, 81, ___", options: ['162', '243', '180', '270'], correct: 1, explanation: "Each number is multiplied by 3. 81 × 3 = 243.", difficulty: 'easy', topic: 'Pattern Recognition' },
      { id: 'pp1_7', section: 'Analytical', question: "If MANGO = 13,1,14,7,15, then APPLE = ?", options: ['1,16,16,12,5', '1,15,16,12,5', '1,16,15,12,5', '2,16,16,12,5'], correct: 0, explanation: "A=1, P=16, P=16, L=12, E=5 → 1,16,16,12,5.", difficulty: 'medium', topic: 'Coding' },
      { id: 'pp1_8', section: 'Analytical', question: "Statement: All birds can fly. Penguins are birds. Conclusion: Penguins can fly.", options: ['Definitely true', 'Definitely false', 'Cannot be determined', 'Probably true'], correct: 0, explanation: "Based purely on the given statements (not real-world facts), the conclusion logically follows.", difficulty: 'medium', topic: 'Statements Based' },
      { id: 'pp1_9', section: 'Analytical', question: "A man faces East. He turns 90° clockwise, then 180° anti-clockwise. Which direction does he now face?", options: ['North', 'South', 'East', 'West'], correct: 0, explanation: "East → 90° CW = South → 180° ACW = North.", difficulty: 'medium', topic: 'Direction' },
      { id: 'pp1_10', section: 'Analytical', question: "Complete: J, M, P, S, ___", options: ['U', 'V', 'W', 'X'], correct: 1, explanation: "Each letter skips 2: J(+3)M(+3)P(+3)S(+3)V.", difficulty: 'easy', topic: 'Pattern Recognition' },
      // Quantitative
      { id: 'pp1_11', section: 'Quantitative', question: "If 40% of a number is 120, what is 60% of the same number?", options: ['160', '180', '200', '240'], correct: 1, explanation: "40% = 120 → number = 300. 60% of 300 = 180.", difficulty: 'easy', topic: 'Percentage' },
      { id: 'pp1_12', section: 'Quantitative', question: "A shopkeeper marks a product 40% above cost and offers 20% discount. Profit percentage:", options: ['10%', '12%', '14%', '15%'], correct: 1, explanation: "CP=100, MP=140, SP=140×0.8=112. Profit=12%.", difficulty: 'hard', topic: 'Profit & Loss' },
      { id: 'pp1_13', section: 'Quantitative', question: "Two pipes fill a tank in 10 and 15 hours respectively. Together they fill it in:", options: ['5 hours', '6 hours', '8 hours', '12 hours'], correct: 1, explanation: "1/10 + 1/15 = 3+2/30 = 5/30 = 1/6. Time = 6 hours.", difficulty: 'medium', topic: 'Work & Time' },
      { id: 'pp1_14', section: 'Quantitative', question: "The average of 5 consecutive odd numbers is 25. The largest number is:", options: ['27', '29', '31', '33'], correct: 1, explanation: "Middle number = 25. Five consecutive odd: 21,23,25,27,29. Largest = 29.", difficulty: 'medium', topic: 'Average' },
      { id: 'pp1_15', section: 'Quantitative', question: "If x : y = 3 : 4 and y : z = 2 : 5, find x : z.", options: ['3:10', '6:20', '3:5', '6:10'], correct: 0, explanation: "x:y:z = 3:4 and 4 maps to 2 so ×2: y=4, z=10. x:z = 3:10.", difficulty: 'hard', topic: 'Ratio & Proportion' },
      // Subject (Physics style)
      { id: 'pp1_16', section: 'Subject', question: "A body is thrown horizontally from a height. The horizontal component of velocity:", options: ['Increases with time', 'Decreases with time', 'Remains constant', 'Becomes zero'], correct: 2, explanation: "In projectile motion, horizontal velocity remains constant (no horizontal acceleration).", difficulty: 'medium', topic: 'Mechanics' },
      { id: 'pp1_17', section: 'Subject', question: "The efficiency of a Carnot engine operating between 327°C and 27°C is:", options: ['30%', '40%', '50%', '60%'], correct: 2, explanation: "T_H = 600K, T_C = 300K. η = 1 - 300/600 = 0.5 = 50%.", difficulty: 'hard', topic: 'Thermodynamics' },
      { id: 'pp1_18', section: 'Subject', question: "The instrument used to measure very small distances is:", options: ['Thermometer', 'Vernier Callipers', 'Barometer', 'Ammeter'], correct: 1, explanation: "Vernier callipers are used to measure small lengths accurately.", difficulty: 'easy', topic: 'Measurement' },
      { id: 'pp1_19', section: 'Subject', question: "In simple harmonic motion, acceleration is maximum at:", options: ['Mean position', 'Extreme position', 'Any position', 'Half amplitude'], correct: 1, explanation: "In SHM, a = -ω²x. Acceleration is maximum at the extreme position (maximum displacement).", difficulty: 'medium', topic: 'Oscillations' },
      { id: 'pp1_20', section: 'Subject', question: "The value of Planck's constant is approximately:", options: ['6.63 × 10⁻³⁴ J·s', '6.63 × 10⁻²⁴ J·s', '9.1 × 10⁻³¹ J·s', '1.6 × 10⁻¹⁹ J·s'], correct: 0, explanation: "Planck's constant h ≈ 6.63 × 10⁻³⁴ J·s.", difficulty: 'easy', topic: 'Modern Physics' },
    ]
  },
  {
    id: 'pp2025_2',
    title: 'NAT-I Practice Set — Series B',
    year: '2025',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      { id: 'pp2_1', section: 'English', question: "Choose the synonym of 'Taciturn':", options: ['Talkative', 'Reserved', 'Angry', 'Happy'], correct: 1, explanation: "'Taciturn' means reserved or uncommunicative.", difficulty: 'hard', topic: 'Synonyms' },
      { id: 'pp2_2', section: 'English', question: "Antonym of 'Indigent':", options: ['Poor', 'Destitute', 'Affluent', 'Needy'], correct: 2, explanation: "'Indigent' means very poor; 'affluent' (wealthy) is the antonym.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp2_3', section: 'English', question: "'She is good _____ playing chess.'", options: ['in', 'at', 'on', 'with'], correct: 1, explanation: "'Good at' is the correct phrasal combination.", difficulty: 'easy', topic: 'Grammar' },
      { id: 'pp2_4', section: 'English', question: "Doctor : Stethoscope :: Carpenter : ___", options: ['Nail', 'Saw', 'Wood', 'Hammer'], correct: 1, explanation: "A doctor uses a stethoscope; a carpenter uses a saw.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp2_5', section: 'English', question: "Read: 'Pakistan's literacy rate has improved significantly due to government education programs.' The passage suggests literacy improvement is due to:", options: ['Private schools', 'Government programs', 'Foreign aid', 'Technology'], correct: 1, explanation: "The passage explicitly credits government education programs.", difficulty: 'easy', topic: 'Comprehension' },
      { id: 'pp2_6', section: 'Analytical', question: "Q, P, N, K, ___", options: ['G', 'H', 'F', 'I'], correct: 0, explanation: "Gaps: -1, -2, -3, -4. K(10) - 4 = G(7).", difficulty: 'medium', topic: 'Pattern Recognition' },
      { id: 'pp2_7', section: 'Analytical', question: "In a family, A is father of B. B is sister of C. C is married to D. How is A related to D?", options: ["Father", "Father-in-law", "Uncle", "Grandfather"], correct: 1, explanation: "A is father of B and C. C is married to D. So A is D's father-in-law.", difficulty: 'medium', topic: 'Relationships' },
      { id: 'pp2_8', section: 'Analytical', question: "If 6 × 4 = 46, 5 × 8 = 58, then 7 × 3 = ?", options: ['37', '73', '43', '34'], correct: 0, explanation: "Pattern: smaller digit first then larger. 3 < 7 → 37.", difficulty: 'medium', topic: 'Pattern Recognition' },
      { id: 'pp2_9', section: 'Analytical', question: "Hira is 12th from left and 8th from right. Total girls in row:", options: ['18', '19', '20', '21'], correct: 1, explanation: "Total = 12 + 8 - 1 = 19.", difficulty: 'easy', topic: 'Ranking' },
      { id: 'pp2_10', section: 'Analytical', question: "All pens are books. Some books are red. Conclusion: Some pens are red.", options: ['Definitely true', 'Definitely false', 'Cannot be determined', 'Probably true'], correct: 2, explanation: "We cannot confirm if the red books include pens.", difficulty: 'medium', topic: 'Statements Based' },
      { id: 'pp2_11', section: 'Quantitative', question: "A train travels at 72 km/h. Its speed in m/s:", options: ['18 m/s', '20 m/s', '22 m/s', '25 m/s'], correct: 1, explanation: "72 × 1000/3600 = 20 m/s.", difficulty: 'easy', topic: 'Speed' },
      { id: 'pp2_12', section: 'Quantitative', question: "Rs. 12,000 invested at 8% compound interest for 2 years. Total amount:", options: ['Rs. 13,920', 'Rs. 13,996.80', 'Rs. 14,000', 'Rs. 13,500'], correct: 1, explanation: "A = 12000(1.08)² = 12000 × 1.1664 = 13,996.80.", difficulty: 'hard', topic: 'Compound Interest' },
      { id: 'pp2_13', section: 'Quantitative', question: "The difference between a number and its 3/5 is 28. The number is:", options: ['60', '65', '70', '75'], correct: 2, explanation: "x - 3x/5 = 2x/5 = 28 → x = 70.", difficulty: 'medium', topic: 'Algebra' },
      { id: 'pp2_14', section: 'Quantitative', question: "A circle has area 154 cm². Its circumference (π = 22/7):", options: ['44 cm', '48 cm', '52 cm', '56 cm'], correct: 0, explanation: "πr² = 154 → r = 7. C = 2πr = 2 × 22/7 × 7 = 44 cm.", difficulty: 'medium', topic: 'Geometry' },
      { id: 'pp2_15', section: 'Quantitative', question: "If 2x + 3y = 12 and x = 3, find y:", options: ['1', '2', '3', '4'], correct: 1, explanation: "2(3) + 3y = 12 → 6 + 3y = 12 → y = 2.", difficulty: 'easy', topic: 'Algebra' },
      { id: 'pp2_16', section: 'Subject', question: "Which of the following has the highest ionization energy?", options: ['Na', 'Mg', 'Al', 'Ne'], correct: 3, explanation: "Noble gases (Ne) have the highest ionization energy due to their stable configuration.", difficulty: 'hard', topic: 'Periodic Trends' },
      { id: 'pp2_17', section: 'Subject', question: "The process of converting glucose into ethanol by yeast is called:", options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Hydrolysis'], correct: 2, explanation: "Fermentation converts glucose into ethanol and CO₂ using yeast.", difficulty: 'easy', topic: 'Organic Chemistry' },
      { id: 'pp2_18', section: 'Subject', question: "Which has the highest electrical conductivity?", options: ['Copper', 'Gold', 'Silver', 'Aluminium'], correct: 2, explanation: "Silver has the highest electrical conductivity of all metals.", difficulty: 'medium', topic: 'Materials' },
      { id: 'pp2_19', section: 'Subject', question: "The unit of capacitance is:", options: ['Ohm', 'Henry', 'Farad', 'Tesla'], correct: 2, explanation: "Capacitance is measured in Farads (F).", difficulty: 'easy', topic: 'Electricity' },
      { id: 'pp2_20', section: 'Subject', question: "Which law is expressed as F = q(v × B)?", options: ["Newton's Law", "Coulomb's Law", "Ampere's Law", "Lorentz Force Law"], correct: 3, explanation: "The Lorentz force law gives the force on a charge q moving with velocity v in a magnetic field B.", difficulty: 'hard', topic: 'Electromagnetism' },
    ]
  },
  {
    id: 'pp2026_1',
    title: 'NAT-I Practice Set — Series C',
    year: '2026',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      { id: 'pp3_1', section: 'English', question: "Choose the synonym of 'Perfidious':", options: ['Loyal', 'Treacherous', 'Honest', 'Brave'], correct: 1, explanation: "'Perfidious' means deceitful and treacherous.", difficulty: 'hard', topic: 'Synonyms' },
      { id: 'pp3_2', section: 'English', question: "Antonym of 'Zenith':", options: ['Peak', 'Summit', 'Nadir', 'Top'], correct: 2, explanation: "'Zenith' is the highest point; 'nadir' is the lowest.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp3_3', section: 'English', question: "'I wish I _____ a doctor.'", options: ['am', 'was', 'were', 'had been'], correct: 2, explanation: "Subjunctive mood uses 'were' for hypothetical wishes.", difficulty: 'medium', topic: 'Grammar' },
      { id: 'pp3_4', section: 'English', question: "Complete: 'The project was completed _____ schedule.'", options: ['before', 'ahead of', 'on', 'in'], correct: 1, explanation: "'Ahead of schedule' is the correct idiomatic phrase.", difficulty: 'easy', topic: 'Idioms' },
      { id: 'pp3_5', section: 'English', question: "Sun : Light :: Cloud : ___", options: ['Rain', 'Wind', 'Sky', 'Thunder'], correct: 0, explanation: "The sun produces light; clouds produce rain.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp3_6', section: 'Analytical', question: "2, 6, 18, 54, ___", options: ['108', '162', '216', '324'], correct: 1, explanation: "Each term is multiplied by 3. 54 × 3 = 162.", difficulty: 'easy', topic: 'Pattern Recognition' },
      { id: 'pp3_7', section: 'Analytical', question: "Zara is 5th from the top in a class of 40. Her rank from bottom:", options: ['34', '35', '36', '37'], correct: 2, explanation: "Rank from bottom = 40 - 5 + 1 = 36.", difficulty: 'easy', topic: 'Ranking' },
      { id: 'pp3_8', section: 'Analytical', question: "Pointing to a photo Bilal says 'She is the daughter of the only son of my grandfather.' How is she related to Bilal?", options: ['Sister', 'Daughter', 'Niece', 'Cousin'], correct: 0, explanation: "Only son of grandfather = Bilal's father. Daughter of Bilal's father = Bilal's sister.", difficulty: 'medium', topic: 'Relationships' },
      { id: 'pp3_9', section: 'Analytical', question: "No teachers are students. All students are learners. Conclusion: No teachers are learners.", options: ['True', 'False', 'Cannot be determined', 'Partially true'], correct: 2, explanation: "Teachers could still be learners — no teachers are students doesn't mean no teachers are learners.", difficulty: 'hard', topic: 'Statements Based' },
      { id: 'pp3_10', section: 'Analytical', question: "QAR, RBT, SCU, ___", options: ['TDV', 'TCV', 'SDV', 'UDV'], correct: 0, explanation: "Each letter in each position increases by 1: Q→R→S→T, A→B→C→D, R→T→U→V. TDV.", difficulty: 'medium', topic: 'Pattern Recognition' },
      { id: 'pp3_11', section: 'Quantitative', question: "The sum of a number and its reciprocal is 10/3. The number is:", options: ['1/3', '3', 'Both 3 and 1/3', '6'], correct: 2, explanation: "x + 1/x = 10/3. Solving: x = 3 or x = 1/3.", difficulty: 'hard', topic: 'Algebra' },
      { id: 'pp3_12', section: 'Quantitative', question: "In a class, ratio of boys to girls is 4:3. If 8 more girls join, ratio becomes 1:1. Total students originally:", options: ['42', '49', '56', '63'], correct: 2, explanation: "4x boys, 3x girls. 4x = 3x+8 → x=8. Total = 7×8 = 56.", difficulty: 'hard', topic: 'Ratio' },
      { id: 'pp3_13', section: 'Quantitative', question: "How many ways can 4 people be seated in 6 chairs?", options: ['24', '120', '360', '720'], correct: 2, explanation: "P(6,4) = 6×5×4×3 = 360.", difficulty: 'hard', topic: 'Permutations' },
      { id: 'pp3_14', section: 'Quantitative', question: "A boat covers 30 km downstream in 3 hours and 18 km upstream in 3 hours. Speed of current:", options: ['1 km/h', '2 km/h', '3 km/h', '4 km/h'], correct: 2, explanation: "Downstream = 10 km/h, Upstream = 6 km/h. Current = (10-6)/2 = 2. Wait: (10-6)/2=2... no: current = (10-6)/2=2. Answer: 2 km/h.", difficulty: 'hard', topic: 'Speed' },
      { id: 'pp3_15', section: 'Quantitative', question: "log₂ 64 = ?", options: ['4', '5', '6', '8'], correct: 2, explanation: "2⁶ = 64, so log₂ 64 = 6.", difficulty: 'easy', topic: 'Logarithms' },
      { id: 'pp3_16', section: 'Subject', question: "Which programming paradigm does Python primarily support?", options: ['Only procedural', 'Only OOP', 'Multi-paradigm', 'Only functional'], correct: 2, explanation: "Python supports multiple paradigms: procedural, OOP, and functional.", difficulty: 'easy', topic: 'Programming' },
      { id: 'pp3_17', section: 'Subject', question: "The time complexity of linear search in worst case:", options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2, explanation: "In the worst case, linear search checks all n elements → O(n).", difficulty: 'easy', topic: 'Algorithms' },
      { id: 'pp3_18', section: 'Subject', question: "Which SQL command removes all rows from a table without deleting the table?", options: ['DROP', 'DELETE', 'TRUNCATE', 'REMOVE'], correct: 2, explanation: "TRUNCATE removes all rows but keeps the table structure intact.", difficulty: 'medium', topic: 'Database' },
      { id: 'pp3_19', section: 'Subject', question: "In OSI model, which layer handles encryption?", options: ['Transport', 'Session', 'Presentation', 'Application'], correct: 2, explanation: "The Presentation layer (Layer 6) handles encryption, compression, and data formatting.", difficulty: 'medium', topic: 'Networking' },
      { id: 'pp3_20', section: 'Subject', question: "Which number system uses digits 0–7 only?", options: ['Binary', 'Octal', 'Hexadecimal', 'Decimal'], correct: 1, explanation: "Octal (base-8) uses digits 0 through 7.", difficulty: 'easy', topic: 'Number Systems' },
    ]
  },
  {
    id: 'pp2026_2',
    title: 'NAT-I Practice Set — Series D',
    year: '2026',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      { id: 'pp4_1', section: 'English', question: "Choose the synonym of 'Loquacious':", options: ['Silent', 'Talkative', 'Lazy', 'Arrogant'], correct: 1, explanation: "'Loquacious' means tending to talk a great deal.", difficulty: 'hard', topic: 'Synonyms' },
      { id: 'pp4_2', section: 'English', question: "Antonym of 'Transient':", options: ['Temporary', 'Brief', 'Permanent', 'Fleeting'], correct: 2, explanation: "'Transient' means lasting only a short time; 'permanent' is its antonym.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp4_3', section: 'English', question: "The teacher along with students _____ present.", options: ['are', 'were', 'is', 'have been'], correct: 2, explanation: "With 'along with', verb agrees with the main subject (teacher = singular = is).", difficulty: 'medium', topic: 'Grammar' },
      { id: 'pp4_4', section: 'English', question: "Pen : Write :: Knife : ___", options: ['Kitchen', 'Sharp', 'Cut', 'Steel'], correct: 2, explanation: "A pen is used to write; a knife is used to cut.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp4_5', section: 'English', question: "He said, 'I am going to school.' (Indirect speech):", options: ["He said that he was going to school.", "He told that he is going to school.", "He said that he is going to school.", "He said he goes to school."], correct: 0, explanation: "In indirect speech, 'am going' changes to 'was going'.", difficulty: 'medium', topic: 'Grammar' },
      { id: 'pp4_6', section: 'Analytical', question: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64", options: ['26', '37', '64', '50'], correct: 2, explanation: "Series: 1²+1, 2²+1, 3²+1... Pattern gives 8²+1=65 not 64. 64 is odd.", difficulty: 'hard', topic: 'Pattern Recognition' },
      { id: 'pp4_7', section: 'Analytical', question: "P is Q's brother. Q is R's sister. R is S's father. P is S's ___:", options: ["Brother", "Uncle", "Father", "Cousin"], correct: 1, explanation: "P→brother of Q→sister of R→father of S. P is uncle of S.", difficulty: 'medium', topic: 'Relationships' },
      { id: 'pp4_8', section: 'Analytical', question: "All that glitters is not gold. Gold glitters. Conclusion:", options: ['Gold is valuable', 'Gold may not be gold', 'Some glittering things are gold', 'Nothing is gold'], correct: 2, explanation: "If gold glitters and all glittering things aren't gold, it still means some glittering things (including gold) are gold.", difficulty: 'medium', topic: 'Statements Based' },
      { id: 'pp4_9', section: 'Analytical', question: "Nadia is 7th from left, Sana is 9th from right. They swap; Nadia is 11th from left. Total girls:", options: ['18', '19', '20', '21'], correct: 1, explanation: "After swap Nadia is at 9th from right = 11th from left → total = 11+9-1 = 19.", difficulty: 'medium', topic: 'Ranking' },
      { id: 'pp4_10', section: 'Analytical', question: "AZ, BY, CX, DW, ___", options: ['EV', 'FV', 'EU', 'FU'], correct: 0, explanation: "First letter goes A,B,C,D,E forward; second goes Z,Y,X,W,V backward. EV.", difficulty: 'easy', topic: 'Pattern Recognition' },
      { id: 'pp4_11', section: 'Quantitative', question: "A car travels 240 km in 4 hours. At the same speed, how far in 6 hours?", options: ['320 km', '360 km', '400 km', '420 km'], correct: 1, explanation: "Speed = 60 km/h. 60 × 6 = 360 km.", difficulty: 'easy', topic: 'Speed' },
      { id: 'pp4_12', section: 'Quantitative', question: "Simple interest on Rs. 5000 at 8% for 3 years:", options: ['Rs. 900', 'Rs. 1000', 'Rs. 1200', 'Rs. 1500'], correct: 2, explanation: "SI = (5000 × 8 × 3)/100 = 1200.", difficulty: 'easy', topic: 'Interest' },
      { id: 'pp4_13', section: 'Quantitative', question: "If 3x - 7 = 2x + 5, then x = ?", options: ['10', '11', '12', '13'], correct: 2, explanation: "3x - 2x = 5 + 7 → x = 12.", difficulty: 'easy', topic: 'Algebra' },
      { id: 'pp4_14', section: 'Quantitative', question: "The LCM of 12, 18, and 24 is:", options: ['36', '48', '72', '96'], correct: 2, explanation: "LCM(12,18,24) = 72.", difficulty: 'medium', topic: 'Number Theory' },
      { id: 'pp4_15', section: 'Quantitative', question: "A triangle has angles in ratio 2:3:5. The largest angle is:", options: ['60°', '72°', '90°', '108°'], correct: 2, explanation: "2x+3x+5x=180 → x=18. Largest = 5×18 = 90°.", difficulty: 'medium', topic: 'Geometry' },
      { id: 'pp4_16', section: 'Subject', question: "Newton's second law of motion states F = ___:", options: ['mv', 'ma', 'mv²', 'm/a'], correct: 1, explanation: "F = ma (Force = mass × acceleration).", difficulty: 'easy', topic: 'Mechanics' },
      { id: 'pp4_17', section: 'Subject', question: "The speed of light in vacuum is approximately:", options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 1, explanation: "Speed of light c ≈ 3×10⁸ m/s.", difficulty: 'easy', topic: 'Modern Physics' },
      { id: 'pp4_18', section: 'Subject', question: "Which type of lens is used to correct myopia (short-sightedness)?", options: ['Convex', 'Concave', 'Bifocal', 'Plano-convex'], correct: 1, explanation: "Concave (diverging) lenses are used to correct myopia.", difficulty: 'medium', topic: 'Optics' },
      { id: 'pp4_19', section: 'Subject', question: "The unit of electric resistance is:", options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correct: 2, explanation: "Electric resistance is measured in Ohms (Ω).", difficulty: 'easy', topic: 'Electricity' },
      { id: 'pp4_20', section: 'Subject', question: "Which of the following is NOT a vector quantity?", options: ['Force', 'Velocity', 'Speed', 'Displacement'], correct: 2, explanation: "Speed is a scalar quantity; force, velocity, and displacement are vectors.", difficulty: 'medium', topic: 'Mechanics' },
    ]
  },
  {
    id: 'pp2026_3',
    title: 'NAT-I Practice Set — Series E',
    year: '2026',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      { id: 'pp5_1', section: 'English', question: "Synonym of 'Verbose':", options: ['Concise', 'Wordy', 'Silent', 'Angry'], correct: 1, explanation: "'Verbose' means using more words than needed — synonym: wordy.", difficulty: 'medium', topic: 'Synonyms' },
      { id: 'pp5_2', section: 'English', question: "Antonym of 'Benevolent':", options: ['Kind', 'Generous', 'Malevolent', 'Caring'], correct: 2, explanation: "'Benevolent' means kind; 'malevolent' (wishing harm) is its antonym.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp5_3', section: 'English', question: "Neither the students nor the teacher _____ arrived.", options: ['have', 'has', 'had', 'are'], correct: 1, explanation: "With 'neither...nor', verb agrees with the nearest subject (teacher = singular = has).", difficulty: 'hard', topic: 'Grammar' },
      { id: 'pp5_4', section: 'English', question: "Thermometer : Temperature :: Barometer : ___", options: ['Wind', 'Rain', 'Pressure', 'Humidity'], correct: 2, explanation: "A thermometer measures temperature; a barometer measures pressure.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp5_5', section: 'English', question: "Rearrange to form a sentence: quickly / ran / the / boy / home", options: ['The boy ran quickly home.', 'Quickly ran the boy home.', 'The boy home ran quickly.', 'Home quickly ran the boy.'], correct: 0, explanation: "Correct order: The boy ran quickly home.", difficulty: 'easy', topic: 'Grammar' },
      { id: 'pp5_6', section: 'Analytical', question: "1, 4, 9, 16, 25, ___", options: ['30', '35', '36', '49'], correct: 2, explanation: "Perfect squares: 1²,2²,3²,4²,5²,6²=36.", difficulty: 'easy', topic: 'Pattern Recognition' },
      { id: 'pp5_7', section: 'Analytical', question: "If COLD = 3, 15, 12, 4 and WARM = 23, 1, 18, 13, then HEAT = ?", options: ['8,5,1,20', '8,5,1,19', '8,4,1,20', '7,5,1,20'], correct: 0, explanation: "H=8, E=5, A=1, T=20.", difficulty: 'medium', topic: 'Coding' },
      { id: 'pp5_8', section: 'Analytical', question: "Facing North, turn 90° right, then 180° right. Now facing:", options: ['North', 'South', 'East', 'West'], correct: 3, explanation: "North → 90°R = East → 180°R = West.", difficulty: 'medium', topic: 'Direction' },
      { id: 'pp5_9', section: 'Analytical', question: "Some cats are dogs. All dogs are animals. Which is definitely true?", options: ['All cats are animals', 'Some cats are animals', 'No cats are animals', 'All animals are cats'], correct: 1, explanation: "Some cats are dogs, and all dogs are animals → some cats are animals.", difficulty: 'medium', topic: 'Statements Based' },
      { id: 'pp5_10', section: 'Analytical', question: "Usman ranked 15th from top and 20th from bottom. Class size:", options: ['33', '34', '35', '36'], correct: 1, explanation: "Total = 15 + 20 - 1 = 34.", difficulty: 'easy', topic: 'Ranking' },
      { id: 'pp5_11', section: 'Quantitative', question: "What percent of 80 is 12?", options: ['10%', '12%', '15%', '20%'], correct: 2, explanation: "(12/80) × 100 = 15%.", difficulty: 'easy', topic: 'Percentage' },
      { id: 'pp5_12', section: 'Quantitative', question: "HCF of 36 and 48:", options: ['6', '9', '12', '18'], correct: 2, explanation: "HCF(36,48) = 12.", difficulty: 'easy', topic: 'Number Theory' },
      { id: 'pp5_13', section: 'Quantitative', question: "A bus covers a route in 5 hours at 60 km/h. At what speed to cover same in 4 hours?", options: ['65 km/h', '70 km/h', '75 km/h', '80 km/h'], correct: 2, explanation: "Distance = 300 km. New speed = 300/4 = 75 km/h.", difficulty: 'medium', topic: 'Speed' },
      { id: 'pp5_14', section: 'Quantitative', question: "Volume of a cube with side 5 cm:", options: ['25 cm³', '75 cm³', '100 cm³', '125 cm³'], correct: 3, explanation: "Volume = side³ = 5³ = 125 cm³.", difficulty: 'easy', topic: 'Geometry' },
      { id: 'pp5_15', section: 'Quantitative', question: "If a + b = 10 and a - b = 4, then a × b = ?", options: ['16', '20', '21', '24'], correct: 2, explanation: "a=7, b=3. a×b=21.", difficulty: 'medium', topic: 'Algebra' },
      { id: 'pp5_16', section: 'Subject', question: "pH of pure water at 25°C is:", options: ['5', '6', '7', '8'], correct: 2, explanation: "Pure water is neutral with pH = 7.", difficulty: 'easy', topic: 'Chemistry' },
      { id: 'pp5_17', section: 'Subject', question: "The chemical formula of common salt is:", options: ['NaOH', 'NaCl', 'KCl', 'CaCl₂'], correct: 1, explanation: "Common salt (table salt) is sodium chloride: NaCl.", difficulty: 'easy', topic: 'Chemistry' },
      { id: 'pp5_18', section: 'Subject', question: "Photosynthesis occurs in which organelle?", options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], correct: 2, explanation: "Photosynthesis takes place in chloroplasts, which contain chlorophyll.", difficulty: 'easy', topic: 'Biology' },
      { id: 'pp5_19', section: 'Subject', question: "The atomic number of Carbon is:", options: ['4', '6', '8', '12'], correct: 1, explanation: "Carbon has atomic number 6 (6 protons).", difficulty: 'easy', topic: 'Chemistry' },
      { id: 'pp5_20', section: 'Subject', question: "Law of conservation of energy states:", options: ['Energy can be created', 'Energy can be destroyed', 'Energy can neither be created nor destroyed', 'Energy only converts to heat'], correct: 2, explanation: "Energy cannot be created or destroyed, only converted from one form to another.", difficulty: 'easy', topic: 'Physics' },
    ]
  },
  {
    id: 'pp2026_4',
    title: 'NAT-I Practice Set — Series F',
    year: '2026',
    total: 20,
    sections: ['English', 'Analytical', 'Quantitative', 'Subject'],
    questions: [
      { id: 'pp6_1', section: 'English', question: "Synonym of 'Diligent':", options: ['Lazy', 'Hardworking', 'Careless', 'Slow'], correct: 1, explanation: "'Diligent' means showing careful and consistent effort — synonym: hardworking.", difficulty: 'easy', topic: 'Synonyms' },
      { id: 'pp6_2', section: 'English', question: "Antonym of 'Amiable':", options: ['Friendly', 'Pleasant', 'Hostile', 'Cheerful'], correct: 2, explanation: "'Amiable' means friendly; 'hostile' is its antonym.", difficulty: 'medium', topic: 'Antonyms' },
      { id: 'pp6_3', section: 'English', question: "She insisted ___ going with her friends.", options: ['on', 'in', 'at', 'for'], correct: 0, explanation: "'Insist on' is the correct preposition combination.", difficulty: 'easy', topic: 'Grammar' },
      { id: 'pp6_4', section: 'English', question: "The sentence 'I look forward to hear from you.' is:", options: ['Correct', 'Incorrect — should be hearing', 'Incorrect — should be heard', 'Incorrect — should be hears'], correct: 1, explanation: "'Look forward to' is followed by a gerund (hearing), not an infinitive.", difficulty: 'medium', topic: 'Grammar' },
      { id: 'pp6_5', section: 'English', question: "Sculptor : Statue :: Author : ___", options: ['Pen', 'Paper', 'Novel', 'Library'], correct: 2, explanation: "A sculptor makes a statue; an author writes a novel.", difficulty: 'easy', topic: 'Analogies' },
      { id: 'pp6_6', section: 'Analytical', question: "3, 7, 15, 31, 63, ___", options: ['95', '107', '127', '131'], correct: 2, explanation: "Each term = previous × 2 + 1. 63×2+1 = 127.", difficulty: 'medium', topic: 'Pattern Recognition' },
      { id: 'pp6_7', section: 'Analytical', question: "Walking 3 km North, then 4 km East, straight-line distance from start:", options: ['5 km', '6 km', '7 km', '8 km'], correct: 0, explanation: "Pythagorean theorem: √(3²+4²) = √25 = 5 km.", difficulty: 'medium', topic: 'Direction' },
      { id: 'pp6_8', section: 'Analytical', question: "Maria is Sara's mother. Sara is Aisha's sister. Aisha is Bilal's wife. How is Maria related to Bilal?", options: ['Mother', 'Mother-in-law', 'Aunt', 'Grandmother'], correct: 1, explanation: "Maria is mother of Sara and Aisha. Aisha married Bilal → Maria is Bilal's mother-in-law.", difficulty: 'medium', topic: 'Relationships' },
      { id: 'pp6_9', section: 'Analytical', question: "A is 3 ranks above B, B is 5 ranks below C, C is 2nd from top. A's rank from top:", options: ['2', '3', '4', '5'], correct: 2, explanation: "C=2nd. B=2+5=7th. A=7-3=4th.", difficulty: 'medium', topic: 'Ranking' },
      { id: 'pp6_10', section: 'Analytical', question: "If + means ×, × means ÷, - means +, ÷ means -. Find: 8 + 4 × 2 - 3 ÷ 1", options: ['18', '19', '20', '21'], correct: 0, explanation: "8+4=32, ×2=16, -3=19, ÷1=18.", difficulty: 'hard', topic: 'Coding' },
      { id: 'pp6_11', section: 'Quantitative', question: "Find the median of: 7, 3, 9, 1, 5", options: ['3', '5', '7', '9'], correct: 1, explanation: "Sorted: 1,3,5,7,9. Middle value = 5.", difficulty: 'easy', topic: 'Statistics' },
      { id: 'pp6_12', section: 'Quantitative', question: "A man sells an article for Rs. 880 at a loss of 20%. Cost price:", options: ['Rs. 1000', 'Rs. 1050', 'Rs. 1100', 'Rs. 1200'], correct: 2, explanation: "SP = CP × 0.8 → CP = 880/0.8 = 1100.", difficulty: 'medium', topic: 'Profit & Loss' },
      { id: 'pp6_13', section: 'Quantitative', question: "If 5 men complete a work in 12 days, 3 men complete in:", options: ['18 days', '20 days', '22 days', '24 days'], correct: 1, explanation: "Total work = 5×12=60. Time for 3 men = 60/3 = 20 days.", difficulty: 'medium', topic: 'Work & Time' },
      { id: 'pp6_14', section: 'Quantitative', question: "Perimeter of a rectangle is 56 cm, length is 18 cm. Width:", options: ['8 cm', '10 cm', '12 cm', '14 cm'], correct: 1, explanation: "2(l+w)=56 → l+w=28 → w=28-18=10 cm.", difficulty: 'easy', topic: 'Geometry' },
      { id: 'pp6_15', section: 'Quantitative', question: "In how many ways can letters of 'MATH' be arranged?", options: ['12', '16', '24', '48'], correct: 2, explanation: "4! = 4×3×2×1 = 24.", difficulty: 'medium', topic: 'Permutations' },
      { id: 'pp6_16', section: 'Subject', question: "Which data structure follows LIFO principle?", options: ['Queue', 'Stack', 'Array', 'Linked List'], correct: 1, explanation: "Stack follows Last In First Out (LIFO) principle.", difficulty: 'easy', topic: 'Data Structures' },
      { id: 'pp6_17', section: 'Subject', question: "Which of the following is a primary key property?", options: ['Can be null', 'Can repeat', 'Must be unique and not null', 'Optional'], correct: 2, explanation: "A primary key must be unique and cannot be null.", difficulty: 'easy', topic: 'Database' },
      { id: 'pp6_18', section: 'Subject', question: "Binary representation of decimal 13:", options: ['1011', '1101', '1100', '1010'], correct: 1, explanation: "13 = 8+4+1 = 1101 in binary.", difficulty: 'medium', topic: 'Number Systems' },
      { id: 'pp6_19', section: 'Subject', question: "Which sorting algorithm has best average-case complexity O(n log n)?", options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correct: 2, explanation: "Merge Sort has O(n log n) average and worst case complexity.", difficulty: 'medium', topic: 'Algorithms' },
      { id: 'pp6_20', section: 'Subject', question: "HTML stands for:", options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correct: 0, explanation: "HTML = HyperText Markup Language, the standard language for web pages.", difficulty: 'easy', topic: 'Web Basics' },
    ]
  }
];

const sectionColors = {
  'English': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Analytical': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Quantitative': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Subject': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function PaperSession({ paper, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = paper.questions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / paper.questions.length) * 100;

  const handleSelect = (i) => {
    if (showResult) return;
    setSelectedAnswer(i);
    setShowResult(true);
    setAnswers(prev => [...prev, { selected: i, correct: q.correct, isCorrect: i === q.correct }]);
  };

  const handleNext = () => {
    if (currentIndex < paper.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const correct = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correct / paper.questions.length) * 100);
    return (
      <div className="space-y-5">
        <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-emerald-500/5 border-primary/20">
          <div className="text-4xl mb-3">{score >= 70 ? '🏆' : score >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-1">Paper Complete!</h2>
          <p className="text-muted-foreground text-sm mb-4">{paper.title}</p>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-2xl font-bold text-primary">{score}%</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div><p className="text-2xl font-bold text-green-400">{correct}</p><p className="text-xs text-muted-foreground">Correct</p></div>
            <div><p className="text-2xl font-bold text-red-400">{paper.questions.length - correct}</p><p className="text-xs text-muted-foreground">Wrong</p></div>
          </div>
        </Card>

        <WeakAreaAnalysis questions={paper.questions} answers={paper.questions.map((q, i) => ({ selected: answers[i]?.selected, correct: q.correct, isCorrect: answers[i]?.isCorrect }))} />

        <div className="space-y-3">
          <h3 className="font-semibold">Review Answers</h3>
          {paper.questions.map((q, i) => {
            const ans = answers[i];
            return (
              <Card key={q.id} className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  {ans?.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border mr-2 ${sectionColors[q.section] || 'bg-secondary'}`}>{q.section}</span>
                    <p className="text-sm font-medium mt-1">{q.question}</p>
                  </div>
                </div>
                <div className="space-y-1 ml-6">
                  {q.options.map((opt, j) => (
                    <p key={j} className={`text-xs px-2 py-1 rounded ${j === q.correct ? 'bg-green-500/10 text-green-400' : j === ans?.selected && !ans?.isCorrect ? 'bg-red-500/10 text-red-400' : 'text-muted-foreground'}`}>
                      {String.fromCharCode(65 + j)}. {opt}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-6 italic">{q.explanation}</p>
                <div className="ml-6">
                  <AIExplainButton question={q.question} options={q.options} correctIndex={q.correct} explanation={q.explanation} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack}>All Papers</Button>
          <Button className="flex-1 bg-primary" onClick={() => { setFinished(false); setCurrentIndex(0); setAnswers([]); setSelectedAnswer(null); setShowResult(false); }}>
            <RotateCcw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-sm font-medium">{currentIndex + 1} / {paper.questions.length}</span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${sectionColors[q.section] || 'bg-secondary'}`}>{q.section}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' : q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{q.difficulty}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">{q.topic}</p>
        <h3 className="font-semibold text-base leading-relaxed mb-5">{q.question}</h3>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = 'w-full text-left p-3 rounded-xl border-2 transition-all text-sm font-medium ';
            if (!showResult) cls += selectedAnswer === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40';
            else if (i === q.correct) cls += 'border-green-500 bg-green-500/10 text-green-400';
            else if (i === selectedAnswer) cls += 'border-red-500 bg-red-500/10 text-red-400';
            else cls += 'border-border opacity-40';
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mt-4 p-3 rounded-xl ${selectedAnswer === q.correct ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <p className={`text-sm font-bold ${selectedAnswer === q.correct ? 'text-green-400' : 'text-red-400'}`}>
              {selectedAnswer === q.correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
            <AIExplainButton question={q.question} options={q.options} correctIndex={q.correct} explanation={q.explanation} />
          </div>
        )}
      </Card>

      {showResult && (
        <Button className="w-full bg-primary h-11 rounded-xl" onClick={handleNext}>
          {currentIndex < paper.questions.length - 1 ? 'Next Question' : 'Finish Paper'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

export default function PastPapers() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [activePaper, setActivePaper] = useState(null);

  if (!user?.is_premium) {
    return (
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Premium Feature</h2>
          <p className="text-sm text-muted-foreground max-w-xs">Past Papers are exclusive to Premium members. Upgrade to access full NAT past paper sets with detailed explanations.</p>
          <Button className="bg-primary mt-2" onClick={() => navigate('/premium')}>Unlock Premium</Button>
        </div>
      </div>
    );
  }

  if (activePaper) {
    return (
      <div className="p-4 pb-10">
        <PaperSession paper={activePaper} onBack={() => setActivePaper(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-10">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Past Papers</h1>
          <span className="bg-gradient-to-r from-primary to-emerald-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
        </div>
        <p className="text-sm text-muted-foreground">NAT-I style practice sets · 2025–2026</p>
      </div>

      {/* Section Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(sectionColors).map(([sec, cls]) => (
          <span key={sec} className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{sec}</span>
        ))}
      </div>

      {/* Paper Cards */}
      <div className="space-y-3">
        {pastPaperSets.map((paper, idx) => (
          <Card key={paper.id} className="p-4 cursor-pointer hover:bg-secondary/50 transition-all border-2 hover:border-primary/30" onClick={() => setActivePaper(paper)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{paper.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{paper.total} Questions · {paper.year}</p>
                  <div className="flex gap-1 mt-1.5">
                    {paper.sections.map(s => (
                      <span key={s} className={`text-xs px-1.5 py-0.5 rounded border ${sectionColors[s] || ''}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-amber-500/5 border-amber-500/20 text-center">
        <p className="text-xs text-amber-400 font-medium">📌 More past paper sets are added regularly. Check back often!</p>
      </Card>
    </div>
  );
}