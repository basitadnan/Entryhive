import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Crown, Lock, Bell, CheckCircle, Camera, Edit2 } from 'lucide-react';
import { base44 } from '@/lib/dbClient';
import { toast } from 'sonner';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';

function getTestCountdown(testDate) {
  if (!testDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(testDate);
  target.setHours(0, 0, 0, 0);
  const diff = differenceInDays(target, today);
  return diff;
}

function getCountdownMessage(days) {
  if (days < 0) return { text: `Your test was ${Math.abs(days)} day(s) ago.`, emoji: '📅', color: 'text-muted-foreground' };
  if (days === 0) return { text: "Today is your test day! You've got this!", emoji: '🎯', color: 'text-green-500' };
  if (days === 1) return { text: "Good luck tomorrow! Quick-revise your flashcards tonight!", emoji: '🔔', color: 'text-amber-500' };
  if (days <= 3) return { text: `${days} days left! Revise your weak areas and flashcards.`, emoji: '⚡', color: 'text-amber-500' };
  if (days <= 7) return { text: `${days} days to go! Keep practicing mock tests.`, emoji: '📚', color: 'text-blue-500' };
  if (days <= 14) return { text: `${days} days left! You're on the right track.`, emoji: '💪', color: 'text-primary' };
  return { text: `${days} days until your test. Stay consistent!`, emoji: '🗓️', color: 'text-muted-foreground' };
}

export default function Profile() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;

  const [testDate, setTestDate] = useState(user?.test_date || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const countdown = getTestCountdown(testDate || user?.test_date);
  const message = countdown !== null ? getCountdownMessage(countdown) : null;

  const handleSaveDate = async () => {
    setSaving(true);
    await base44.auth.updateMe({ test_date: testDate });
    setUser(prev => ({ ...prev, test_date: testDate }));
    setSaving(false);
    setSaved(true);
    toast.success('Test date saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveDate = async () => {
    await base44.auth.updateMe({ test_date: '' });
    setUser(prev => ({ ...prev, test_date: '' }));
    setTestDate('');
    toast.success('Test date removed');
  };

  const groupLabel = {
    'NAT-IE': '⚡ Pre-Engineering (NAT-IE)',
    'NAT-IM': '🩺 Pre-Medical (NAT-IM)',
    'NAT-ICS': '💻 Computer Science (NAT-ICS)',
  }[user?.nat_group] || 'No group selected';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Account info & settings</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* User Info */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-background shadow-lg ring-2 ring-primary/20" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg ring-2 ring-primary/20">
                <span className="font-display text-4xl sm:text-5xl font-bold text-primary">
                  {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg cursor-pointer hover:bg-primary-dark transition-colors border-2 border-background group-hover:scale-110">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = new Image();
                  img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 150;
                    canvas.height = 150;
                    ctx.drawImage(img, 0, 0, 150, 150);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                    
                    toast.loading("Updating profile picture...", { id: 'avatar' });
                    const newMe = await base44.auth.updateMe({ avatar_url: compressedBase64 });
                    if (newMe) setUser(newMe);
                    else setUser(prev => ({ ...prev, avatar_url: compressedBase64 }));
                    toast.success("Profile picture updated!", { id: 'avatar' });
                  };
                  img.src = event.target.result;
                };
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{user?.full_name || 'User'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <span className="bg-secondary text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                {groupLabel}
              </span>
              {isPremium ? (
                <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" /> Premium Plan
                </span>
              ) : (
                <button onClick={() => navigate('/premium')} className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--accent))]/20 transition-colors">
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-2xl p-4 text-center border border-border">
            <span className="text-2xl mb-1 block">🔥</span>
            <p className="font-display text-xl font-bold text-foreground">{user?.streak || 1}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Day Streak</p>
          </div>
          <div className="bg-secondary rounded-2xl p-4 text-center border border-border">
            <span className="text-2xl mb-1 block">🎯</span>
            <p className="font-display text-xl font-bold text-foreground">{user?.mock_count || 0}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Mocks Taken</p>
          </div>
        </div>
      </motion.div>

      {/* Test Date Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPremium ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-muted-foreground'}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">Test Date Countdown</h3>
            <p className="text-sm text-muted-foreground">Set your NAT test date to get custom reminders.</p>
          </div>
        </div>

        {isPremium ? (
          <div className="space-y-6">
            {/* Countdown Banner */}
            {message && testDate && (
              <div className={`rounded-2xl p-4 border flex items-start gap-3 ${message.color.replace('text-', 'bg-').replace('-400', '-500/10').replace('-500', '-500/10')} ${message.color.replace('text-', 'border-').replace('-400', '-500/20').replace('-500', '-500/20')}`}>
                <span className="text-2xl leading-none mt-0.5">{message.emoji}</span>
                <div>
                  <p className={`text-sm font-bold ${message.color}`}>{message.text}</p>
                  {countdown === 1 && (
                    <button onClick={() => navigate('/flashcards')} className="text-xs text-primary mt-2 font-bold underline hover:no-underline">
                      → Open Flashcards now
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDate}
                  disabled={!testDate || saving}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${saved ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20'} disabled:opacity-50`}
                >
                  {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved</> : saving ? 'Saving...' : 'Save Date'}
                </button>
                {(user?.test_date || testDate) && (
                  <button
                    onClick={handleRemoveDate}
                    className="px-4 py-3 rounded-xl bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-primary flex items-center gap-2 mb-3 uppercase tracking-wider">
                <Bell className="w-3.5 h-3.5" /> How it works
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" /> Set your NAT test date above</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" /> The app shows a countdown each time you open it</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" /> 1 day before your test: a special reminder to revise flashcards</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center max-w-sm mx-auto mt-4">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display font-bold text-foreground mb-2">Premium Feature</h3>
            <p className="text-sm text-muted-foreground mb-4">Set your test date and get personalized reminders and countdowns.</p>
            <button onClick={() => navigate('/premium')} className="btn-primary w-full py-2.5 rounded-xl text-sm">
              Unlock Premium
            </button>
          </div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-3xl border border-border p-6 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => navigate('/select-group')}
      >
        <div>
          <h3 className="font-display font-bold text-foreground text-lg mb-1">Study Track</h3>
          <p className="text-sm text-muted-foreground">Currently enrolled in {groupLabel}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
          <Edit2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

    </div>
  );
}