import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { motion } from 'framer-motion';

const groups = [
  { id: 'NAT-IE', label: 'Pre-Engineering (NAT-IE)', desc: 'Physics, Chemistry, Mathematics', icon: '⚡', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'NAT-IM', label: 'Pre-Medical (NAT-IM)', desc: 'Physics, Chemistry, Biology', icon: '🩺', subjects: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'NAT-ICS', label: 'Computer Science (NAT-ICS)', desc: 'Physics, Computer Science, Mathematics', icon: '💻', subjects: ['Physics', 'Computer Science', 'Mathematics'] },
  { id: 'NAT-ICOM', label: 'Commerce (NAT-ICOM)', desc: 'Commerce, Accounting, Economics', icon: '🏪', subjects: ['Commerce', 'Accounting', 'Economics'] },
];

export default function SelectGroup() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useOutletContext();

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.auth.updateMe({ 
      nat_group: selected, 
      last_active_date: new Date().toISOString().split('T')[0] 
    });
    setUser(prev => ({ ...prev, nat_group: selected }));
    setSaving(false);
    navigate('/');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pt-12">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Welcome to Entry Hive! 👋</h1>
        <p className="text-muted-foreground text-lg">Select your NAT group to get started</p>
      </motion.div>

      <div className="space-y-4">
        {groups.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className={`p-6 rounded-2xl cursor-pointer transition-all border-2 group ${selected === g.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'}`}
              onClick={() => setSelected(g.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${selected === g.id ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {g.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground text-lg">{g.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {g.subjects.map(s => (
                      <span key={s} className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${selected === g.id ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'}`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${selected === g.id ? 'border-primary bg-primary' : 'border-border'}`}>
                  {selected === g.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground"></div>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 rounded-2xl bg-card border border-border"
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">NAT-I Test Pattern:</strong> 90 MCQs in 120 minutes — 20 English, 20 Analytical, 20 Quantitative, 30 Subject-specific
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary-dark py-4 rounded-xl text-lg font-bold transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
          disabled={!selected || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Continue →'}
        </button>
      </motion.div>
    </div>
  );
}