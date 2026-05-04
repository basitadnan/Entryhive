import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Crown, Lock, Bell, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/lib/dbClient';
import { toast } from 'sonner';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';

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
  if (days === 0) return { text: "🎯 Today is your test day! You've got this!", emoji: '🎯', color: 'text-green-400' };
  if (days === 1) return { text: "🔔 Good luck tomorrow! Quick-revise your flashcards tonight!", emoji: '🔔', color: 'text-amber-400' };
  if (days <= 3) return { text: `⚡ ${days} days left! Revise your weak areas and flashcards.`, emoji: '⚡', color: 'text-amber-400' };
  if (days <= 7) return { text: `📚 ${days} days to go! Keep practicing mock tests.`, emoji: '📚', color: 'text-blue-400' };
  if (days <= 14) return { text: `💪 ${days} days left! You're on the right track.`, emoji: '💪', color: 'text-primary' };
  return { text: `🗓️ ${days} days until your test. Stay consistent!`, emoji: '🗓️', color: 'text-muted-foreground' };
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
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Account info & settings</p>
        </div>
      </div>

      {/* User Info */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                <span className="text-2xl font-bold text-primary">
                  {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-[10px] font-bold uppercase text-white">Edit</span>
              <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = new Image();
                  img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // Resize to 150x150 for super small Base64 size
                    canvas.width = 150;
                    canvas.height = 150;
                    ctx.drawImage(img, 0, 0, 150, 150);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
                    
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
          <div>
            <p className="font-semibold text-lg">{user?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">NAT Group</p>
            <p className="text-sm font-medium mt-0.5">{groupLabel}</p>
          </div>
          {isPremium ? (
            <span className="bg-gradient-to-r from-primary to-emerald-400 text-xs font-semibold px-3 py-1 rounded-full text-white flex items-center gap-1">
              <Crown className="w-3 h-3" /> Premium
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => navigate('/premium')} className="text-xs border-primary/50 text-primary">
              Upgrade
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
          <span className="text-muted-foreground">🔥 Streak</span>
          <span className="font-semibold">{user?.streak || 1} day{(user?.streak || 1) !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* Test Date Section */}
      <Card className={`p-5 space-y-4 ${!isPremium ? 'opacity-70' : ''}`}>
        <div className="flex items-center gap-3">
          <Calendar className={`w-5 h-5 ${isPremium ? 'text-amber-400' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">NAT Test Date</h3>
            <p className="text-xs text-muted-foreground">Get a reminder 1 day before your test</p>
          </div>
          {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>

        {!isPremium ? (
          <div className="bg-secondary rounded-xl p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">This feature is for premium users only.</p>
            <Button size="sm" onClick={() => navigate('/premium')} className="text-xs">
              Unlock Premium
            </Button>
          </div>
        ) : (
          <>
            {/* Countdown Banner */}
            {message && testDate && (
              <div className={`rounded-xl p-4 bg-secondary border border-border`}>
                <p className={`text-sm font-medium ${message.color}`}>{message.text}</p>
                {countdown === 1 && (
                  <button
                    onClick={() => navigate('/flashcards')}
                    className="text-xs text-primary mt-2 underline"
                  >
                    → Open Flashcards now
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Your test date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDate}
                  disabled={!testDate || saving}
                  className="flex-1 h-9 text-sm"
                >
                  {saved ? (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Saved!</>
                  ) : saving ? 'Saving...' : (
                    <><Calendar className="w-4 h-4 mr-1" /> Save Date</>
                  )}
                </Button>
                {(user?.test_date || testDate) && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveDate}
                    className="text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-semibold text-primary flex items-center gap-1">
                <Bell className="w-3 h-3" /> How it works
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Set your NAT test date above</li>
                <li>• The app shows a countdown each time you open it</li>
                <li>• 1 day before your test: a special "Good Luck" banner appears with a reminder to revise flashcards</li>
                <li>• On test day: a special motivational message greets you!</li>
              </ul>
            </div>
          </>
        )}
      </Card>

      {/* Change Group */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Change NAT Group</p>
            <p className="text-xs text-muted-foreground">Switch to a different track</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => navigate('/select-group')}
          >
            Change
          </Button>
        </div>
      </Card>
    </div>
  );
}