import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Stethoscope, Monitor } from 'lucide-react';

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
    <div className="p-4 pt-8">
      <h1 className="text-2xl font-bold mb-2">Welcome to NAT Prep! 👋</h1>
      <p className="text-muted-foreground mb-6">Select your NAT group to get started</p>

      <div className="space-y-3">
        {groups.map((g) => (
          <Card
            key={g.id}
            className={`p-4 cursor-pointer transition-all border-2 ${selected === g.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            onClick={() => setSelected(g.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{g.icon}</span>
              <div>
                <h3 className="font-semibold">{g.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {g.subjects.map(s => (
                    <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-card border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>NAT-I Test Pattern:</strong> 90 MCQs in 120 minutes — 20 English, 20 Analytical, 20 Quantitative, 30 Subject-specific
        </p>
      </div>

      <Button
        className="w-full mt-6 bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
        disabled={!selected || saving}
        onClick={handleSave}
      >
        {saving ? 'Saving...' : 'Continue →'}
      </Button>
    </div>
  );
}