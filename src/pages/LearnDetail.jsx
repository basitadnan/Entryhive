import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, Bookmark } from 'lucide-react';
import { learningContent } from '@/lib/learningContent';


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
    return <div className="p-4 text-center text-muted-foreground">Content not found</div>;
  }

  const toggleTopic = (idx) => {
    setExpandedTopics(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Sections with full topic structure
  const hasTopics = content.topics && content.topics.length > 0;
  // Sections with just tips (physics, chemistry, etc.)
  const hasTips = content.tips && content.tips.length > 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/learn')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-bold text-lg">{content.title}</h1>
      </div>

      {hasTopics && (
        <div className="space-y-3">
          {content.topics.map((topic, idx) => (
            <Card key={idx} className="overflow-hidden">
              <button
                className="w-full p-4 flex items-center justify-between"
                onClick={() => toggleTopic(idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <span className="font-semibold text-sm">{topic.title}</span>
                </div>
                {expandedTopics[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedTopics[idx] && (
                <div className="px-4 pb-4 space-y-3">
                  {topic.tips.map((tip, tipIdx) => (
                    <div key={tipIdx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-primary font-bold mt-0.5">{tipIdx + 1}.</span>
                        <p className="text-sm leading-relaxed">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {/* Key Facts */}
          {content.keyFacts && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bookmark className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Key Facts to Remember</h3>
              </div>
              <div className="space-y-2">
                {content.keyFacts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{fact}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Common Mistakes */}
          {content.commonMistakes && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="font-semibold text-sm">Common Mistakes to Avoid</h3>
              </div>
              <div className="space-y-2">
                {content.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{mistake}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {hasTips && !hasTopics && (
        <Card className="p-4 space-y-3">
          {content.tips.map((tip, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <span className="text-xs text-primary font-bold mt-0.5">{i + 1}.</span>
                <p className="text-sm leading-relaxed">{tip}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}