import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Share2, Users, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Referral() {
  const { user, setUser } = useOutletContext();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReferrals() {
      const data = await base44.entities.referrals.filter({ referrer_email: user.email });
      setReferrals(data);
      setLoading(false);
    }
    loadReferrals();
  }, [user.email]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    const text = `Hey! Use my referral code ${user.referral_code} to get 10% OFF on NAT Prep Premium! Download now and start preparing.`;
    if (navigator.share) {
      navigator.share({ title: 'NAT Prep Referral', text });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Share your code with friends. They get <span className="text-primary font-bold">10% OFF</span>, and you get <span className="text-primary font-bold">15 Days Premium FREE</span> for every successful referral!
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="p-6 relative overflow-hidden">
        <div className="relative z-10 space-y-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Your Referral Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black tracking-tighter text-primary">{user.referral_code}</span>
            <button 
              onClick={copyToClipboard}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <Button className="w-full gap-2 py-6 text-base" onClick={shareReferral}>
            <Share2 className="w-4 h-4" /> Share Code
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl" />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center space-y-1">
          <Users className="w-4 h-4 mx-auto text-muted-foreground" />
          <p className="text-2xl font-bold">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Friends Joined</p>
        </Card>
        <Card className="p-4 text-center space-y-1">
          <Gift className="w-4 h-4 mx-auto text-muted-foreground" />
          <p className="text-2xl font-bold">{referrals.filter(r => r.status === 'completed').length * 15}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Premium Earned</p>
        </Card>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <h3 className="font-semibold px-1">How it works</h3>
        <div className="space-y-2">
          {[
            { title: 'Share your code', desc: 'Send your unique code to your friends.' },
            { title: 'Friend buys Premium', desc: 'They get 10% instant discount using your code.' },
            { title: 'You get rewarded', desc: '15 days of Premium added to your account automatically.' }
          ].map((step, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl bg-card border border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold px-1">Recent Referrals</h3>
          <div className="space-y-2">
            {referrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ref.friend_email.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{ref.status}</p>
                  </div>
                </div>
                {ref.status === 'completed' && <span className="text-[10px] font-bold text-primary">+15 Days</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
