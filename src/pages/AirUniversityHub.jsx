import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Archive, ArrowLeft, GraduationCap, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';
import { useAuth } from '@/lib/AuthContext';

export default function AirUniversityHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    sounds.click();
    navigate(path);
  };

  if (!user?.is_premium) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-12 sm:p-20 text-center space-y-8 bg-card rounded-[40px] border-2 border-border shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center rotate-6 shadow-lg shadow-primary/20 border-2 border-primary/20">
              <Lock className="w-12 h-12 text-primary -rotate-6" />
            </div>
            <div className="absolute -top-3 -right-3 bg-primary text-white p-2 rounded-xl shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="font-display text-4xl font-black text-foreground">Premium Access</h2>
            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              Unlock the Air University preparation hub, including pattern-specific mock tests and practice sessions.
            </p>
          </div>
          <button className="btn-primary h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl relative z-10" onClick={() => navigate('/premium')}>
            Upgrade to Premium
          </button>
        </motion.div>
      </div>
    );
  }

  const SECTIONS = [
    {
      id: 'practice',
      title: 'Practice Questions',
      description: 'Topic-wise practice tailored to Air University patterns',
      icon: BookOpen,
      path: '/air-university/practice',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'mock-test',
      title: 'Mock Tests',
      description: 'Full-length mock tests simulating the real exam',
      icon: FileText,
      path: '/air-university/mock-test',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'past-papers',
      title: 'Past Papers',
      description: 'Review previous years papers and solutions',
      icon: Archive,
      path: '/air-university/past-papers',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Air University Hub</h1>
          <p className="text-sm text-muted-foreground">Dedicated preparation for Pre-Engineering, Pre-Medical, and Computer Science</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleNavigate(section.path)}
              className="bg-card rounded-3xl border border-border p-8 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 transition-all cursor-pointer group flex flex-col items-start"
            >
              <div className={`w-14 h-14 rounded-2xl ${section.bgColor} ${section.borderColor} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${section.color}`} />
              </div>
              
              <h2 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {section.title}
              </h2>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            </motion.div>
          );
        })}
      </div>
      
      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8"
      >
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Supported Tracks
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Air University section specifically supports the <strong>Pre-Engineering</strong>, <strong>Pre-Medical</strong>, and <strong>Computer Science</strong> tracks. Tests and practice sessions are dynamically adapted to match their precise weightages.
        </p>
      </motion.div>
    </div>
  );
}
