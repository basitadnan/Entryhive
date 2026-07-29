import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Lightbulb, ChevronRight, Lock } from 'lucide-react';
import { learningContent, getLearningContentForGroup, getSubjectLearningContent } from '@/lib/learningContent';
import { motion } from 'framer-motion';

export default function Learn() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState('subjects');
  const isPremium = user?.is_premium === true;
  const learnCount = user?.learn_count || 0;
  const canAccess = isPremium || learnCount < 1;

  const allContent = getLearningContentForGroup(user?.nat_group);
  const subjectContent = getSubjectLearningContent(user?.nat_group);
  
  const commonSections = allContent.filter(c => ['english', 'analytical', 'quantitative'].includes(c.key));

  const handleNavigate = (key) => {
    if (!canAccess) {
      navigate('/premium');
      return;
    }
    navigate(`/learn/${key}`);
  };

  const getDisplayContent = () => {
    switch (tab) {
      case 'subjects': return allContent;
      case 'topics': return commonSections;
      case 'tricks': return subjectContent;
      default: return allContent;
    }
  };

  const stats = {
    subjects: allContent.length,
    topics: allContent.reduce((sum, c) => sum + (c.topics?.length || 1), 0),
    tricks: allContent.reduce((sum, c) => sum + (c.topics?.length || 0) + (c.tips?.length || 0), 0),
  };

  const tabs = [
    { id: 'subjects', label: 'Subjects' },
    { id: 'topics', label: 'Topics' },
    { id: 'tricks', label: 'Tricks' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Lightbulb className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Study Smart</h1>
          <p className="text-sm text-muted-foreground">Tricks, shortcuts & concept guides</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {!canAccess && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-500 font-bold">You've used your free learning session. <button onClick={() => navigate('/premium')} className="underline hover:no-underline">Get Premium</button> for unlimited access.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
          <p className="font-display text-3xl font-bold text-primary">{stats.subjects}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Subjects</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
          <p className="font-display text-3xl font-bold text-purple-500">{stats.topics}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Topics</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
          <p className="font-display text-3xl font-bold text-amber-500">{stats.tricks}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Tricks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1 border border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        {getDisplayContent().map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all group shadow-sm"
              onClick={() => handleNavigate(item.key)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
                  {item.topics?.length || (item.tips?.length ? 1 : 0)} topics
                </span>
              </div>
              <h3 className="font-display font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description || ''}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore tricks <ChevronRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}