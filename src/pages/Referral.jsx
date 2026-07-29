import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Gift, Share2, Users, Copy, CheckCircle2, ArrowLeft, User, Wallet, Landmark, Smartphone, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Referral() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  // Payout Form State
  const [payoutMethod, setPayoutMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
      return data || { wallet_balance: 0 };
    },
    enabled: !!user?.id
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('referrals').select('*').eq('referrer_email', user.email).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: payoutInfo, refetch: refetchPayout } = useQuery({
    queryKey: ['payout_info', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('payout_info').select('*').eq('user_id', user.id).single();
      if (data) {
        setPayoutMethod(data.method);
        setAccountNumber(data.account_number);
        setAccountName(data.account_name);
      }
      return data || null;
    },
    enabled: !!user?.id
  });

  const { data: withdrawals = [], refetch: refetchWithdrawals } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('requested_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  const walletBalance = profile?.wallet_balance || 0;
  const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');
  const totalEarned = referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + (Number(r.commission_amount) || 0), 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    const text = `Hey! Use my referral code ${user.referral_code} to get 10% OFF on Entry Hive Premium! Download now and start preparing.`;
    if (navigator.share) {
      navigator.share({ title: 'Entry Hive Referral', text });
    } else {
      copyToClipboard();
    }
  };

  const handleSavePayoutInfo = async (e) => {
    e.preventDefault();
    if (!payoutMethod || !accountNumber || !accountName) {
      return toast.error("Please fill all payout details");
    }
    setIsSavingPayout(true);
    try {
      const { error } = await supabase.from('payout_info').upsert({
        user_id: user.id,
        method: payoutMethod,
        account_number: accountNumber,
        account_name: accountName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success("Payout info saved successfully!");
      setIsEditingPayout(false);
      refetchPayout();
    } catch (err) {
      toast.error(err.message || "Failed to save payout info");
    } finally {
      setIsSavingPayout(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (walletBalance < 300) return toast.error("Minimum withdrawal amount is Rs. 300");
    if (!payoutInfo) return toast.error("Please add payout details first");
    if (hasPendingWithdrawal) return toast.error("You already have a pending withdrawal request");
    
    setIsRequestingWithdrawal(true);
    try {
      const { error } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount: walletBalance,
        status: 'pending'
      });
      if (error) throw error;
      
      // Notify Admin
      await supabase.from('notifications').insert({
        user_email: 'admin',
        title: 'New Withdrawal Request 💸',
        message: `${user.full_name || user.email} requested a withdrawal of Rs.${walletBalance}.`,
        is_read: false
      });

      toast.success("Withdrawal request submitted!");
      refetchWithdrawals();
    } catch (err) {
      toast.error(err.message || "Failed to request withdrawal");
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 pb-24">
      
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
          <Wallet className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Refer & Earn Cash</h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Share your code with friends. They get <span className="text-primary font-bold">10% OFF</span>, and you earn <span className="text-emerald-500 font-bold">10% Cash Commission</span> straight to your wallet!
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Code Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-border p-6 relative overflow-hidden shadow-sm flex flex-col justify-center"
        >
          <div className="relative z-10 space-y-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Your Referral Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-3xl font-black tracking-tight text-primary">{user.referral_code}</span>
              <button 
                onClick={copyToClipboard}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors border border-border"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>
            <button className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20" onClick={shareReferral}>
              <Share2 className="w-5 h-5" /> Share Code
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </motion.div>

        {/* Wallet Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl border border-border p-6 relative overflow-hidden shadow-sm flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Wallet Balance</p>
                <h2 className="font-display text-4xl font-black text-emerald-500">Rs. {walletBalance}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <button 
              onClick={handleRequestWithdrawal}
              disabled={walletBalance < 300 || hasPendingWithdrawal || isRequestingWithdrawal}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                walletBalance >= 300 && !hasPendingWithdrawal 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-70'
              }`}
            >
              {isRequestingWithdrawal ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Withdrawal'}
            </button>
            
            {hasPendingWithdrawal ? (
              <p className="text-[10px] text-amber-500 text-center font-medium">You have a pending withdrawal request.</p>
            ) : walletBalance < 300 ? (
              <p className="text-[10px] text-muted-foreground text-center">Minimum withdrawal is Rs. 300</p>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="font-display text-2xl font-bold text-foreground">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Friends Joined</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <Gift className="w-5 h-5 text-amber-500 mb-2" />
          <p className="font-display text-2xl font-bold text-foreground">Rs. {totalEarned}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Total Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Withdrawals & Payout Info */}
        <div className="space-y-6">
          
          {/* Payout Info Section */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-foreground text-lg">Payout Details</h3>
              {payoutInfo && !isEditingPayout && (
                <button onClick={() => setIsEditingPayout(true)} className="text-xs font-bold text-primary hover:underline">Edit</button>
              )}
            </div>

            {!payoutInfo || isEditingPayout ? (
              <form onSubmit={handleSavePayoutInfo} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Payout Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
                      { id: 'jazzcash', label: 'JazzCash', icon: Smartphone },
                      { id: 'nayapay', label: 'NayaPay', icon: Smartphone },
                      { id: 'bank', label: 'Bank Transfer', icon: Landmark }
                    ].map(m => (
                      <div 
                        key={m.id}
                        onClick={() => setPayoutMethod(m.id)}
                        className={`p-2 border rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm font-medium ${
                          payoutMethod === m.id ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <m.icon className="w-4 h-4" /> {m.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Account Number / IBAN</label>
                  <input 
                    type="text" 
                    value={accountNumber} 
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="03XXXXXXXXX or PKXXBANK..."
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Account Title / Name</label>
                  <input 
                    type="text" 
                    value={accountName} 
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isSavingPayout} className="flex-1 btn-primary py-2 rounded-xl text-sm font-bold shadow-sm">
                    {isSavingPayout ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Details'}
                  </button>
                  {payoutInfo && (
                    <button type="button" onClick={() => {
                      setIsEditingPayout(false);
                      setPayoutMethod(payoutInfo.method);
                      setAccountNumber(payoutInfo.account_number);
                      setAccountName(payoutInfo.account_name);
                    }} className="flex-1 bg-secondary text-foreground py-2 rounded-xl text-sm font-bold border border-border">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-3 bg-secondary/50 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  {payoutInfo.method === 'bank' ? <Landmark className="w-4 h-4 text-primary" /> : <Smartphone className="w-4 h-4 text-primary" />}
                  <span className="capitalize">{payoutInfo.method}</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Account Number</p>
                  <p className="font-mono text-sm">{payoutInfo.account_number}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Account Name</p>
                  <p className="text-sm font-medium">{payoutInfo.account_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal History */}
          {withdrawals.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-foreground text-lg">Withdrawal History</h3>
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">Rs. {w.amount}</p>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        w.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        w.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>{w.status}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(w.requested_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {w.rejection_reason && w.status === 'rejected' && (
                      <div className="mt-2 text-xs text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{w.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Referrals & How it works */}
        <div className="space-y-6">
          {/* How it works */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-foreground text-lg">How it works</h3>
            <div className="space-y-3">
              {[
                { title: 'Share your code', desc: 'Send your unique code to your friends.' },
                { title: 'Friend buys Premium', desc: 'They get 10% instant discount using your code.' },
                { title: 'You earn Cash', desc: '10% commission is added to your wallet automatically.' },
                { title: 'Withdraw', desc: 'Request payout to Bank/EasyPaisa/JazzCash when balance reaches Rs. 300.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-4 p-3.5 rounded-2xl bg-card border border-border shadow-sm items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral History */}
          {referrals.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-foreground text-lg">Recent Referrals</h3>
              <div className="space-y-3">
                {referrals.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-foreground truncate max-w-[120px] sm:max-w-[150px]">{ref.friend_email.split('@')[0]}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{ref.status}</p>
                      </div>
                    </div>
                    {ref.status === 'completed' && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg inline-block">
                          +Rs. {ref.commission_amount || 0}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
