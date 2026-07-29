import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lock, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  buildDeck, 
  initCardState, 
  reviewCard, 
  getDueCards, 
  shuffle,
  SUBJECTS 
} from '@/lib/flashcardEngine';

export default function Flashcards() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;

  const [statesMap, setStatesMap] = useState({});
  const [deck, setDeck] = useState([]);
  const [queue, setQueue] = useState([]); // cards due today, acting as our active queue
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSection, setSelectedSection] = useState('all');
  
  const [cardsCompletedToday, setCardsCompletedToday] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Use a stable key that won't sync to other devices to keep it isolated
  const STORAGE_KEY = user?.id ? `entryhive_flashcards_state_${user.id}` : null;

  // 1. On Mount: Load states and full deck
  useEffect(() => {
    if (!STORAGE_KEY) return;
    
    // Load progress from local storage
    const savedStates = localStorage.getItem(STORAGE_KEY);
    const parsedStates = savedStates ? JSON.parse(savedStates) : {};
    setStatesMap(parsedStates);

    // Build the full deck
    const fullDeck = buildDeck('all');
    setDeck(fullDeck);
  }, [STORAGE_KEY]);

  // 2. Compute Due Cards when section changes
  useEffect(() => {
    if (deck.length === 0) return;

    let filteredDeck = deck;
    if (selectedSection !== 'all') {
      filteredDeck = deck.filter(c => c.section === selectedSection);
    }

    // Get cards that are new or whose due date is today or earlier
    const currentlyDue = getDueCards(filteredDeck, statesMap);
    
    setQueue(shuffle(currentlyDue));
    setIsFlipped(false);
    
    // Only mark session complete if there are no cards due from the start
    if (currentlyDue.length === 0) {
      setSessionComplete(true);
    } else {
      setSessionComplete(false);
    }
  }, [selectedSection, deck]); 
  // Notice we purposefully DO NOT depend on `statesMap` here so the queue doesn't fully recalculate mid-session.

  const currentCard = queue[0];

  const handleFlip = () => setIsFlipped(prev => !prev);

  // Quality: 1 (Again), 3 (Hard), 4 (Good), 5 (Easy)
  const handleGrade = (quality) => {
    if (!currentCard) return;

    const currentState = statesMap[currentCard.id] || initCardState();
    const newState = reviewCard(currentState, quality);

    // Save to local state and localStorage
    const newStatesMap = { ...statesMap, [currentCard.id]: newState };
    setStatesMap(newStatesMap);
    if (STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatesMap));
    }

    setCardsCompletedToday(prev => prev + 1);

    // Update queue
    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      const gradedCard = newQueue.shift(); // remove from front

      if (quality < 3) {
        // "Again" -> push back to the end of the queue to review again today
        newQueue.push(gradedCard);
      }
      
      if (newQueue.length === 0) {
        setSessionComplete(true);
      }

      return newQueue;
    });

    setIsFlipped(false);
  };

  const getSectionIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'english': return '📝';
      case 'quantitative': return '📐';
      case 'analytical': return '🧩';
      case 'physics': return '⚡';
      case 'chemistry': return '🧪';
      case 'biology': return '🧬';
      case 'computer': return '💻';
      case 'maths': return '🔢';
      default: return '📚';
    }
  };

  if (!isPremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-400"></div>
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 ring-8 ring-amber-500/5">
            <Lock className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Premium Flashcards</h2>
          <p className="text-muted-foreground max-w-md mb-8 leading-relaxed text-sm">
            Rapidly revise key facts using our smart SM-2 spaced repetition system. Cards you struggle with appear more often, while cards you know well are spaced out.
          </p>
          <button onClick={() => navigate('/premium')} className="btn-primary w-full max-w-sm py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Unlock Premium Access
          </button>
        </motion.div>
      </div>
    );
  }

  if (sessionComplete && deck.length > 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 text-center bg-card rounded-3xl border border-border shadow-sm space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-400"></div>
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto ring-8 ring-green-500/5 mb-2">
            <span className="text-5xl animate-bounce-slow">🎉</span>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">You're all caught up!</h2>
            <p className="text-muted-foreground text-lg">You have reviewed all due cards for <span className="font-bold text-primary">{selectedSection === 'all' ? 'All Sections' : selectedSection}</span> today.</p>
          </div>
          <div className="bg-secondary/50 p-6 rounded-2xl border border-border max-w-sm mx-auto">
            <p className="text-3xl font-display font-bold text-primary mb-1">{cardsCompletedToday}</p>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cards Reviewed Today</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary w-full max-w-sm mx-auto py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
          <BrainCircuit className="w-6 h-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Smart Flashcards</h1>
          <p className="text-sm text-muted-foreground">Spaced repetition (SM-2)</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Section Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1 -mx-1">
        <button
          onClick={() => setSelectedSection('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${selectedSection === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'}`}
        >
          All Sections
        </button>
        {SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSection(s)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors border flex items-center gap-2 ${selectedSection === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'}`}
          >
            <span>{getSectionIcon(s)}</span> {s}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
        {/* Progress header */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="font-bold text-foreground bg-secondary px-3 py-1 rounded-lg border border-border">
            <span className="text-primary">{queue.length}</span> cards due
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
            {cardsCompletedToday} reviewed today
          </span>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {currentCard && !sessionComplete && (
            <motion.div
              key={currentCard.id + (isFlipped ? '-flipped' : '')}
              initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative cursor-pointer select-none w-full"
              onClick={!isFlipped ? handleFlip : undefined}
              style={{ perspective: '1000px' }}
            >
              <div className={`relative w-full rounded-3xl border-2 transition-colors min-h-[300px] sm:min-h-[350px] flex flex-col items-center justify-center p-8 sm:p-12 text-center group ${isFlipped ? 'bg-primary/5 border-primary/30' : 'bg-card border-border hover:border-primary/30'}`}>
                
                {/* Decorative dots */}
                {!isFlipped && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                  </div>
                )}

                {!isFlipped ? (
                  <>
                    <span className="absolute top-6 left-6 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border text-muted-foreground bg-secondary border-border">
                      {currentCard.topic}
                    </span>
                    <p className="font-display text-xl sm:text-2xl font-bold text-foreground leading-relaxed max-w-lg mt-8">{currentCard.front}</p>
                    <div className="absolute bottom-6 w-full text-center">
                      <p className="text-sm font-bold text-primary/60 animate-pulse uppercase tracking-widest">Tap to reveal</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="absolute top-6 text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                      Answer
                    </span>
                    <p className="text-lg sm:text-xl text-foreground leading-relaxed max-w-lg font-medium">{currentCard.back}</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-8">
          {isFlipped && !sessionComplete ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => handleGrade(1)} className="py-3 rounded-xl border-2 border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500/10 transition-colors flex flex-col items-center justify-center">
                <span className="text-sm">Again</span>
                <span className="text-[10px] opacity-70 mt-0.5">&lt; 1m</span>
              </button>
              <button onClick={() => handleGrade(3)} className="py-3 rounded-xl border-2 border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold hover:bg-orange-500/10 transition-colors flex flex-col items-center justify-center">
                <span className="text-sm">Hard</span>
                <span className="text-[10px] opacity-70 mt-0.5">soon</span>
              </button>
              <button onClick={() => handleGrade(4)} className="py-3 rounded-xl border-2 border-green-500/20 bg-green-500/5 text-green-500 font-bold hover:bg-green-500/10 transition-colors flex flex-col items-center justify-center">
                <span className="text-sm">Good</span>
                <span className="text-[10px] opacity-70 mt-0.5">later</span>
              </button>
              <button onClick={() => handleGrade(5)} className="py-3 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 text-blue-500 font-bold hover:bg-blue-500/10 transition-colors flex flex-col items-center justify-center">
                <span className="text-sm">Easy</span>
                <span className="text-[10px] opacity-70 mt-0.5">days</span>
              </button>
            </div>
          ) : !sessionComplete ? (
            <div className="flex items-center justify-center">
              <button 
                onClick={handleFlip} 
                className="w-full max-w-sm py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                Show Answer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}