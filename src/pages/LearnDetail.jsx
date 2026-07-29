import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, Bookmark } from 'lucide-react';
import { learningContent } from '@/lib/learningContent';
import { motion, AnimatePresence } from 'framer-motion';


export default function LearnDetail() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useOutletContext();
  const [expandedTopics, setExpandedTopics] = useState({0: true});

  const content = learningContent[section];

  useEffect(() => {
    async function trackUsage() {
      const newCount = (user?.learn_count || 0) + 1;
      await base44.auth.updateMe({ learn_count: newCount });
      setUser(prev => ({ ...prev, learn_count: newCount }));
    }
    trackUsage();
  }, []);

  if (!content) {
    return <div className="p-6 text-center text-muted-foreground">Content not found</div>;
  }

  const toggleTopic = (idx) => {
    setExpandedTopics(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Sections with full topic structure
  const hasTopics = content.topics && content.topics.length > 0;
  // Sections with just tips (physics, chemistry, etc.)
  const hasTips = content.tips && content.tips.length > 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/learn')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Learn
        </button>
      </div>
      
      <h1 className="font-display text-2xl font-bold text-foreground">{content.title}</h1>

      {hasTopics && (
        <div className="space-y-4">
          {content.topics.map((topic, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                onClick={() => toggleTopic(idx)}
              >
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <span className="font-bold text-foreground text-left">{topic.title}</span>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedTopics[idx] ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {expandedTopics[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedTopics[idx] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {topic.tips.map((tip, tipIdx) => (
                        <div key={tipIdx} className="p-4 rounded-xl bg-secondary/50 border border-border">
                          <div className="flex items-start gap-3">
                            <span className="text-xs text-primary font-bold mt-0.5 bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">{tipIdx + 1}</span>
                            <p className="text-sm leading-relaxed text-foreground">{tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Key Facts */}
          {content.keyFacts && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="font-display font-bold text-foreground">Key Facts to Remember</h3>
              </div>
              <div className="space-y-3">
                {content.keyFacts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {content.commonMistakes && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="font-display font-bold text-foreground">Common Mistakes to Avoid</h3>
              </div>
              <div className="space-y-3">
                {content.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasTips && !hasTopics && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          {content.tips.map((tip, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-start gap-3">
                <span className="text-xs text-primary font-bold mt-0.5 bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm leading-relaxed text-foreground">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}