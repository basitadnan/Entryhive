import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lightbulb, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { learningContent, getLearningContentForGroup, getSubjectLearningContent } from '@/lib/learningContent';

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

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-purple-400" />
        <div>
          <h1 className="text-xl font-bold">Study Smart</h1>
          <p className="text-sm text-muted-foreground">Tricks, shortcuts & concept guides</p>
        </div>
      </div>

      {!canAccess && (
        <Card className="p-3 bg-amber-500/10 border-amber-500/30">
          <p className="text-sm text-amber-400">🔒 You've used your free learning session. <button onClick={() => navigate('/premium')} className="underline font-semibold">Get Premium</button> for unlimited access.</p>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{stats.subjects}</p>
          <p className="text-xs text-muted-foreground">Subjects</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-purple-400">{stats.topics}</p>
          <p className="text-xs text-muted-foreground">Topics</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-amber-400">{stats.tricks}</p>
          <p className="text-xs text-muted-foreground">Tricks</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-secondary">
          <TabsTrigger value="subjects" className="flex-1">Subjects</TabsTrigger>
          <TabsTrigger value="topics" className="flex-1">Topics</TabsTrigger>
          <TabsTrigger value="tricks" className="flex-1">Tricks</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Cards */}
      <div className="space-y-3">
        {getDisplayContent().map((item) => (
          <Card
            key={item.key}
            className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors border-l-4 ${item.borderColor || 'border-primary/30'}`}
            onClick={() => handleNavigate(item.key)}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-muted-foreground">{item.topics?.length || (item.tips?.length ? 1 : 0)} topics</span>
            </div>
            <h3 className={`font-semibold mt-2 ${item.color || 'text-primary'}`}>{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description || ''}</p>
            {item.topics && (
              <p className="text-xs text-muted-foreground mt-2">
                {allContent.find(c => c.key === item.key)?.topics?.length || 0}/{90} questions ({((allContent.find(c => c.key === item.key)?.topics?.length || 0) / 90 * 100).toFixed(1)}%)
              </p>
            )}
            <p className={`text-xs mt-2 ${item.color || 'text-primary'}`}>Explore tricks →</p>
          </Card>
        ))}
      </div>
    </div>
  );
}