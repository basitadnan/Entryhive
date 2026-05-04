import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Shuffle, BookOpen, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllSections, getSectionLabel, getSectionIcon } from '@/lib/questionBank';
import { getLearningContentForGroup } from '@/lib/learningContent';

function generateFlashcards(natGroup) {
  const cards = [];

  // Section-based key facts from learning content
  const content = getLearningContentForGroup(natGroup);
  content.forEach(section => {
    if (section.keyFacts) {
      section.keyFacts.forEach((fact, i) => {
        cards.push({
          id: `${section.key}-kf-${i}`,
          front: `📌 ${section.title.replace(" Tips & Tricks", "").replace(" Problem-Solving", "").replace(" Key Concepts", "").replace(" Strategies", "").replace(" Study Guide", "").replace(" Essentials", "")}`,
          back: fact,
          section: section.key,
          type: 'fact',
        });
      });
    }
    if (section.topics) {
      section.topics.forEach(topic => {
        if (topic.tips && topic.tips.length > 0) {
          cards.push({
            id: `${section.key}-${topic.title}`,
            front: `💡 ${topic.title}`,
            back: topic.tips[0],
            section: section.key,
            type: 'tip',
          });
        }
      });
    }
    if (section.tips) {
      section.tips.slice(0, 3).forEach((tip, i) => {
        cards.push({
          id: `${section.key}-tip-${i}`,
          front: `⚡ ${section.title.split(' ')[0]} ${section.title.split(' ')[1] || ''}`,
          back: tip,
          section: section.key,
          type: 'tip',
        });
      });
    }
    if (section.commonMistakes) {
      section.commonMistakes.forEach((mistake, i) => {
        cards.push({
          id: `${section.key}-cm-${i}`,
          front: `⚠️ Common Mistake: ${section.title.replace(" Tips & Tricks", "").replace(" Problem-Solving", "").replace(" Key Concepts", "").replace(" Strategies", "").replace(" Study Guide", "").replace(" Essentials", "")}`,
          back: `Avoid: ${mistake}`,
          section: section.key,
          type: 'mistake',
        });
      });
    }
  });

  return cards;
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function Flashcards() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;

  const [allCards, setAllCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSection, setSelectedSection] = useState('all');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);

  const sections = user?.nat_group ? getAllSections(user.nat_group) : [];

  useEffect(() => {
    if (user?.nat_group) {
      const cards = generateFlashcards(user.nat_group);
      setAllCards(cards);
      setFilteredCards(shuffle(cards));
    }
  }, [user?.nat_group]);

  useEffect(() => {
    if (selectedSection === 'all') {
      setFilteredCards(shuffle(allCards));
    } else {
      setFilteredCards(shuffle(allCards.filter(c => c.section === selectedSection)));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setKnown(0);
    setReview(0);
  }, [selectedSection, allCards]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = () => setIsFlipped(prev => !prev);

  const handleKnow = () => {
    setKnown(k => k + 1);
    goNext();
  };

  const handleReview = () => {
    setReview(r => r + 1);
    goNext();
  };

  const goNext = () => {
    if (currentIndex + 1 >= filteredCards.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setFilteredCards(shuffle(selectedSection === 'all' ? allCards : allCards.filter(c => c.section === selectedSection)));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setKnown(0);
    setReview(0);
  };

  if (!isPremium) {
    return (
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold">Flashcards — Premium Only</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Flashcard mode is exclusively for premium users. Rapidly revise key facts, tips, and tricks for all NAT sections using our smart flashcard system.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['60+ flashcards per track', 'Section-wise filtering', 'Track known vs review', 'Shuffled every session'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span> {f}
              </div>
            ))}
          </div>
          <Button onClick={() => navigate('/premium')} className="w-full bg-gradient-to-r from-primary to-emerald-400">
            Unlock Premium
          </Button>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    const total = known + review;
    const pct = total > 0 ? Math.round((known / total) * 100) : 0;
    return (
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Card className="p-8 text-center space-y-4">
          <p className="text-5xl">{pct >= 70 ? '🎉' : '💪'}</p>
          <h2 className="text-xl font-bold">Session Complete!</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">{known}</p>
              <p className="text-sm text-muted-foreground">I Know This</p>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-400">{review}</p>
              <p className="text-sm text-muted-foreground">Need Review</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{pct}% mastered this session</p>
          <Button onClick={handleRestart} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" /> Shuffle & Restart
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">Rapid revision mode</p>
        </div>
      </div>

      {/* Section Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedSection('all')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedSection === 'all' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
        >
          All Sections
        </button>
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSection(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedSection === s ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >
            {getSectionIcon(s)} {getSectionLabel(s).split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {filteredCards.length}</span>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400">✓ {known}</span>
          <span className="text-amber-400">↺ {review}</span>
        </div>
        <button onClick={handleRestart} className="text-xs flex items-center gap-1 hover:text-foreground">
          <Shuffle className="w-3 h-3" /> Shuffle
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / filteredCards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      {currentCard && (
        <div
          className="relative cursor-pointer select-none"
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '260px',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {getSectionLabel(currentCard.section)}
              </span>
              <p className="text-lg font-semibold text-center leading-relaxed">{currentCard.front}</p>
              <p className="text-xs text-muted-foreground">Tap to reveal</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="text-xs uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Answer
              </span>
              <p className="text-base text-center leading-relaxed">{currentCard.back}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {isFlipped ? (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleReview}
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 h-12"
          >
            ↺ Need Review
          </Button>
          <Button
            onClick={handleKnow}
            className="bg-green-600 hover:bg-green-700 h-12"
          >
            ✓ I Know This
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button onClick={handleFlip} className="flex-1 mx-2">
            Flip Card
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setIsFlipped(false); goNext(); }} disabled={currentIndex + 1 >= filteredCards.length}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}