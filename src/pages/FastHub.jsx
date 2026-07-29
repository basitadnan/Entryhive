import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Archive, ArrowLeft, Building, Lock, Sparkles, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';
import { useAuth } from '@/lib/AuthContext';

export default function FastHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    sounds.click();
    navigate(path);
  };

  // Removed strict premium check from Hub so free users can see the Practice and Mock Test options and utilize their free limits.
  const SECTIONS = [
    {
      id: 'practice',
      title: 'Practice Questions',
      description: 'Topic-wise practice tailored to FAST patterns',
      icon: BookOpen,
      path: '/fast/practice',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'mock-test',
      title: 'Mock Tests',
      description: 'Full-length mock tests simulating the real FAST exam',
      icon: FileText,
      path: '/fast/mock',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'past-papers',
      title: 'Past Papers',
      description: 'Review previous years papers and solutions',
      icon: Archive,
      path: '/fast/past-papers',
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
          <Building className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">FAST University Hub</h1>
          <p className="text-sm text-muted-foreground">Dedicated preparation for Engineering and Computer Programs</p>
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
          <Info className="w-5 h-5 text-primary" /> Important Note
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong>English Essay</strong> section is not included in this preparation module because this hub is tailored specifically for <strong>Engineering and Computer Programs</strong> weightages. However, you can still practice other relevant subjects thoroughly using the options above.
        </p>
      </motion.div>
    </div>
  );
}
