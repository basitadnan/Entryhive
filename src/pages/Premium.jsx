import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { supabase } from '@/lib/supabaseClient';
import { verifyPaymentScreenshot } from '@/lib/aiClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Crown, Lock, Sparkles, Upload, Loader2, CheckCircle2, Image as ImageIcon, MessageCircle, Percent, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Premium() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  

  const [selectedPlan, setSelectedPlan] = useState(1); // 1 = 1 Month, 3 = 3 Months
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [applyingReferral, setApplyingReferral] = useState(false);

  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const isPremium = user?.is_premium === true && !user?.is_on_trial;

  // Check user's payment request status
  const { data: myPaymentRequests = [] } = useQuery({
    queryKey: ['my-payment-status', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_requests').select('*').eq('user_email', user?.email).order('created_at', { ascending: false }).limit(5);
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.email && !isPremium
  });

  const latestRequest = myPaymentRequests[0];

  // Pricing Logic
  const getPrice = (months) => {
    if (months === 1) return isReferralValid ? 400 : 450;
    if (months === 3) return isReferralValid ? 600 : 700;
    return 450;
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    setApplyingReferral(true);
    const cleanCode = referralCode.trim().toUpperCase();
    
    if (cleanCode === user.referral_code?.toUpperCase()) {
      toast.error("You cannot use your own referral code!");
      setApplyingReferral(false);
      return;
    }

    const referrers = await base44.entities.profiles.filter({ referral_code: cleanCode });
    if (referrers && referrers.length > 0) {
      setIsReferralValid(true);
      toast.success("Referral applied! Discount activated.");
    } else {
      toast.error("Invalid referral code.");
      setIsReferralValid(false);
    }
    setApplyingReferral(false);
  };

  const handleActivationCode = async () => {
    if (!activationCode.trim()) return;
    setIsActivating(true);
    const cleanCode = activationCode.trim().toUpperCase();
    
    try {
      const codes = await base44.entities.activation_codes.filter({ code: cleanCode });
      if (codes && codes.length > 0) {
        const codeRecord = codes[0];
        
        if (codeRecord.is_used) {
          toast.error("This code has already been used.");
        } else if (codeRecord.target_email && codeRecord.target_email.toLowerCase() !== user.email.toLowerCase()) {
          toast.error("This code is assigned to a different email.");
        } else {
          // Use Supabase directly to bypass any dbClient filtering if needed
          const { error: updateError } = await supabase.from('activation_codes').update({ 
            is_used: true, 
            used_by: user.email
          }).eq('id', codeRecord.id);

          if (updateError) throw updateError;

          const { error: profileError } = await supabase.from('profiles').update({ 
            is_premium: true 
          }).eq('id', user.id);

          if (profileError) throw profileError;

          setUser(prev => ({ ...prev, is_premium: true }));
          toast.success("🎉 Premium Activated!");
          setTimeout(() => navigate('/'), 1500);
        }
      } else {
        toast.error("Invalid activation code. Please check the spelling.");
      }
    } catch (err) {
      console.error("Activation Error:", err);
      toast.error("System error. Did you run the Supabase SQL queries?");
    } finally {
      setIsActivating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File is too large. Max 5MB."); return; }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitScreenshot = async () => {
    if (!preview) return toast.error("Please upload a payment screenshot.");
    setIsVerifying(true);
    toast.info("AI is analyzing your payment screenshot...");

    const expectedPrice = getPrice(selectedPlan);

    try {
      const aiResult = await verifyPaymentScreenshot(preview, expectedPrice);
      
      const { supabase } = await import('@/lib/supabaseClient');
      
      let finalStatus = aiResult.status;
      let finalReason = aiResult.reason;

      // Duplicate Transaction ID check
      if (aiResult.transactionId) {
        const { data: existingTx } = await supabase
          .from('payment_requests')
          .select('id')
          .eq('transaction_id', aiResult.transactionId)
          .maybeSingle();

        if (existingTx) {
          finalStatus = 'pending';
          finalReason = `Duplicate Transaction ID detected: ${aiResult.transactionId}. Original AI reason: ${aiResult.reason}`;
        }
      } else if (finalStatus === 'approved') {
         finalStatus = 'pending';
         finalReason = `Transaction ID not found or illegible. Original AI reason: ${aiResult.reason}`;
      }

      const { error: insertError } = await supabase.from('payment_requests').insert({
        user_email: user.email,
        user_id: user.id,
        plan_price: expectedPrice,
        status: finalStatus,
        ai_reason: finalReason,
        screenshot_url: preview,
        transaction_id: aiResult.transactionId,
        created_at: new Date().toISOString()
      });
      if (insertError) {
        console.error('Payment insert error:', insertError);
        toast.error(`Failed to save: ${insertError.message}`);
        setIsVerifying(false);
        return;
      }

      // Notify Admin
      await supabase.from('notifications').insert({
        user_email: 'admin',
        title: 'New Payment Request 💰',
        message: `${user.full_name || user.email} uploaded a screenshot for Rs. ${expectedPrice}.`,
        is_read: false
      });

      if (finalStatus === 'approved') {
        toast.success("Payment verified! Premium activated instantly.");
        await base44.auth.updateMe({ is_premium: true });
        setUser(prev => ({ ...prev, is_premium: true }));
      } else {
        toast.success("Screenshot uploaded! Admin will review it shortly.");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (e) {
      console.error(e);
      toast.error("Verification failed. Please try again or contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isPremium) {
    return (
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Card className="p-8 text-center bg-card border-primary/20">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4 drop-shadow-md" />
          <h2 className="text-2xl font-bold mb-2">You're Premium!</h2>
          <p className="text-muted-foreground">You have unlimited access to all features.</p>
          <Button className="mt-6 w-full text-black bg-primary font-bold hover:bg-primary/90" onClick={() => navigate('/')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20 overflow-x-hidden">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center">
        <Crown className="w-10 h-10 text-primary mx-auto mb-3 drop-shadow-md" />
        <h1 className="text-2xl font-bold">Go Premium</h1>
        <p className="text-muted-foreground text-sm mt-1">Unlock unlimited mock tests & AI features</p>
      </div>

      {/* Payment Status Notifications */}
      {latestRequest && latestRequest.status === 'rejected' && (
        <Card className="p-4 bg-red-500/10 border-red-500/30 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Payment Rejected</p>
            <p className="text-xs text-muted-foreground mt-1">Your last payment request (Rs. {latestRequest.plan_price}) was rejected. Please ensure you send the correct amount and upload a clear screenshot.</p>
            {latestRequest.ai_reason && <p className="text-[10px] text-muted-foreground mt-1 bg-black/40 p-2 rounded">Reason: {latestRequest.ai_reason}</p>}
          </div>
        </Card>
      )}

      {latestRequest && latestRequest.status === 'pending' && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-400">Payment Under Review</p>
            <p className="text-xs text-muted-foreground mt-1">Your payment of Rs. {latestRequest.plan_price} is being reviewed by the admin. You'll be activated shortly!</p>
          </div>
        </Card>
      )}

      {latestRequest && latestRequest.status === 'approved' && !isPremium && (
        <Card className="p-4 bg-green-500/10 border-green-500/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-400">Payment Approved!</p>
            <p className="text-xs text-muted-foreground mt-1">Your payment was approved. Please refresh the page or log out and back in to activate premium.</p>
          </div>
        </Card>
      )}

      {/* Referral Code */}
      <Card className="p-4 bg-card border-border">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Percent className="w-4 h-4 text-primary" /> Have a Referral Code?</h3>
        <div className="flex gap-2">
          <Input 
            value={referralCode} onChange={e => {setReferralCode(e.target.value); setIsReferralValid(false);}} 
            placeholder="Enter code for discount" 
            className="bg-black/40 border-border uppercase" 
            disabled={isReferralValid}
          />
          {!isReferralValid ? (
            <Button onClick={handleApplyReferral} disabled={applyingReferral || !referralCode.trim()} className="bg-primary/20 text-primary hover:bg-primary/30">
              {applyingReferral ? '...' : 'Apply'}
            </Button>
          ) : (
            <Button disabled className="bg-green-500/20 text-green-400 border border-green-500/30">Applied ✓</Button>
          )}
        </div>
        {isReferralValid && <p className="text-xs text-green-400 mt-2">Discount applied successfully!</p>}
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 3].map(months => (
          <button
            key={months}
            onClick={() => setSelectedPlan(months)}
            className={`p-4 rounded-xl border text-center transition-all ${
              selectedPlan === months 
                ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'border-border bg-secondary/30 hover:border-border'
            }`}
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{months} Month{months > 1 ? 's' : ''}</p>
            <div className="mt-2">
              {isReferralValid ? (
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground line-through text-xs">Rs. {months === 1 ? 450 : 700}</span>
                  <span className={`text-xl font-bold ${selectedPlan === months ? 'text-primary' : ''}`}>Rs. {getPrice(months)}</span>
                </div>
              ) : (
                <span className={`text-xl font-bold ${selectedPlan === months ? 'text-primary' : ''}`}>Rs. {getPrice(months)}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Payment Details */}
      <Card className="p-5 bg-card space-y-4 border-border">
        <h3 className="font-semibold text-sm border-b border-border/20 pb-2">Payment Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Easypaisa / JazzCash</span>
            <span className="font-mono font-medium tracking-wide">0333 7613822</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Title</span>
            <span className="font-medium">Adnan Abdul Basit</span>
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-xs text-primary leading-relaxed">
          <span className="font-bold">Instructions:</span> Send exactly <strong className="text-white">Rs. {getPrice(selectedPlan)}</strong> to the number above.
        </div>
      </Card>

      {/* METHOD 1: AI Verification Upload */}
      <Card className="p-5 bg-card space-y-4 border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
        <h3 className="font-semibold text-sm border-b border-border/20 pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Method 1: AI Instant Activation
        </h3>
        <p className="text-xs text-muted-foreground">Upload your successful payment screenshot for instant AI-powered verification.</p>
        
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

        {!preview ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Tap to upload screenshot</span>
            <span className="text-[10px] text-muted-foreground/60">JPG, PNG up to 5MB</span>
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img src={preview} alt="Payment Receipt" className="w-full max-h-48 object-cover opacity-80" />
            <button onClick={() => {setFile(null); setPreview('');}} className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">Change</button>
          </div>
        )}

        <Button 
          className="w-full h-12 text-black font-bold bg-primary hover:bg-primary/90" 
          disabled={!preview || isVerifying} onClick={handleSubmitScreenshot}
        >
          {isVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying with AI...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Activate</>}
        </Button>
      </Card>

      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest my-2">
        <div className="flex-1 border-t border-border/30"></div>
        OR
        <div className="flex-1 border-t border-border/30"></div>
      </div>

      {/* METHOD 2: Manual WhatsApp Code */}
      <Card className="p-5 bg-card space-y-4 border-border">
        <h3 className="font-semibold text-sm border-b border-border/20 pb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-400" /> Method 2: Manual Code
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Message us your email on WhatsApp after payment, and we will give you a unique activation code.
        </p>
        
        <a href="https://wa.me/923337613822" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-semibold mb-4">
          <MessageCircle className="w-4 h-4" /> Message WhatsApp 03337613822
        </a>

        <div className="flex gap-2">
          <Input value={activationCode} onChange={(e) => setActivationCode(e.target.value)} placeholder="NAT-XXXXXX" className="flex-1 bg-black/40 border-border font-mono uppercase" />
          <Button className="bg-secondary text-foreground hover:bg-secondary/80" disabled={!activationCode.trim() || isActivating} onClick={handleActivationCode}>
            {isActivating ? '...' : 'Activate'}
          </Button>
        </div>
      </Card>
      
    </div>
  );
}
