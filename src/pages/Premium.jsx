import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Crown, Sparkles, Upload, Loader2, CheckCircle2,
  Zap, Clock, CalendarDays, SlidersHorizontal, ArrowRight,
  Copy, Check, AlertTriangle, XCircle, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

// Generate unique Order ID
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'NP-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Custom plan pricing: logarithmic decay from Rs.50/day (1 day) to Rs.10/day (90 days)
function getCustomPricePerDay(days) {
  if (days <= 1) return 50;
  const perDay = 50 - (40 * Math.log(days) / Math.log(90));
  return Math.max(10, Math.round(perDay));
}

const PLANS = [
  {
    id: 'daily',
    name: 'Daily Plan',
    days: 1,
    price: 50,
    perDay: 50,
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    gradientBorder: 'border-blue-500/40 hover:border-blue-500/60',
    description: 'Try premium for a day',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    days: 30,
    price: 450,
    perDay: 15,
    icon: CalendarDays,
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20',
    gradientBorder: 'border-primary/40 hover:border-primary/60',
    description: 'Most popular choice',
    popular: true,
    discount: '70%',
  },
  {
    id: 'bimonthly',
    name: '2 Months Plan',
    days: 60,
    price: 800,
    perDay: 13,
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    gradientBorder: 'border-amber-500/40 hover:border-amber-500/60',
    description: 'Best value for serious prep',
    popular: false,
    discount: '74%',
  },
  {
    id: 'custom',
    name: 'Custom Plan',
    days: null,
    price: null,
    perDay: null,
    icon: SlidersHorizontal,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    gradientBorder: 'border-violet-500/40 hover:border-violet-500/60',
    description: 'Choose your own duration',
    popular: false,
  },
];

const FEATURES = [
  'Unlimited mock tests (all exams)',
  'Full past papers access',
  'AI-powered NAT Tutor',
  'Performance analytics & insights',
  'Study plan generator',
  'Mistake reviewer',
  'All subjects covered',
  'No hidden charges',
];

export default function Premium() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [customDays, setCustomDays] = useState(14);
  const [step, setStep] = useState('select'); // select | confirm | payment
  const [orderId, setOrderId] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState('');

  // Referral state
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState(null); // { code, email }
  const [validatingReferral, setValidatingReferral] = useState(false);

  const isPremium = user?.is_premium === true && !user?.is_on_trial;

  // Check existing payment requests
  const { data: myPaymentRequests = [], refetch: refetchMyPaymentRequests } = useQuery({
    queryKey: ['my-payment-status', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase.from('payment_requests').select('*').eq('user_email', user?.email).order('created_at', { ascending: false }).limit(5);
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.email && !isPremium
  });

  const latestRequest = myPaymentRequests[0];

  // Computed plan details
  const selectedPlan = useMemo(() => {
    const plan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];
    let computedPlan = { ...plan };
    if (plan.id === 'custom') {
      const perDay = getCustomPricePerDay(customDays);
      const totalPrice = perDay * customDays;
      const discount = Math.round((1 - perDay / 50) * 100);
      computedPlan = { ...plan, days: customDays, price: totalPrice, perDay, discount: discount > 0 ? `${discount}%` : null };
    }
    return computedPlan;
  }, [selectedPlanId, customDays]);

  const finalPrice = useMemo(() => {
    if (!appliedReferral) return selectedPlan.price;
    if (appliedReferral.discountPercent) {
      return Math.round(selectedPlan.price * (1 - appliedReferral.discountPercent / 100));
    }
    if (appliedReferral.code === 'CSCONNECT') return Math.round(selectedPlan.price * 0.75);
    return Math.round(selectedPlan.price * 0.9);
  }, [selectedPlan, appliedReferral]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast.success('Copied!');
  };

  const handleConfirmPlan = () => {
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    setStep('confirm');
  };

  const handleApplyReferral = async () => {
    if (!referralCodeInput.trim()) return;
    const code = referralCodeInput.trim().toUpperCase();
    if (code === user?.referral_code) {
      return toast.error("You cannot use your own referral code!");
    }
    setValidatingReferral(true);
    try {
      if (code === 'ENTRYHIVE') {
        const { count, error: countError } = await supabase
          .from('payment_requests')
          .select('id', { count: 'exact', head: true })
          .ilike('ai_reason', '%ENTRYHIVE%')
          .eq('status', 'approved');

        if (countError) {
          toast.error("Error validating ENTRYHIVE code");
          setAppliedReferral(null);
          return;
        }

        const usageCount = count || 0;
        if (usageCount < 5) {
          toast.success("ENTRYHIVE code applied! 60% Discount activated.");
          setAppliedReferral({ code, discountPercent: 60 });
        } else {
          toast.error("ENTRYHIVE code usage limit reached!");
          setAppliedReferral(null);
        }
        return;
      }

      if (code === 'CSCONNECT') {
        toast.success("CSCONNECT code applied! 25% Discount activated.");
        setAppliedReferral({ code, email: 'csconnect' });
        return;
      }

      if (code === 'FASTPREP') {
        const { count, error: countError } = await supabase
          .from('payment_requests')
          .select('id', { count: 'exact', head: true })
          .ilike('ai_reason', '%FASTPREP%')
          .eq('status', 'approved');

        if (countError) {
          toast.error("Error validating FASTPREP code");
          setAppliedReferral(null);
          return;
        }

        const usageCount = count || 0;
        if (usageCount < 10) {
          toast.success("Early bird FASTPREP applied! 50% Discount activated.");
          setAppliedReferral({ code, discountPercent: 50 });
        } else {
          toast.success("FASTPREP code applied! 30% Discount activated.");
          setAppliedReferral({ code, discountPercent: 30 });
        }
        return;
      }

      const { data, error } = await supabase.from('profiles').select('id, email').eq('referral_code', code).single();
      if (error || !data) {
        toast.error("Invalid referral code");
        setAppliedReferral(null);
      } else {
        toast.success("Code applied! 10% Discount activated.");
        setAppliedReferral({ code, email: data.email, referrer_id: data.id });
      }
    } catch (e) {
      toast.error("Error validating code");
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!orderId) {
      setOrderId(generateOrderId());
    }
    setStep('payment');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { 
      toast.error("File too large. Max 25MB."); 
      return; 
    }
    
    setFile(file);
    setIsProcessingImage(true);
    const reader = new FileReader();

    reader.onerror = () => {
      setIsProcessingImage(false);
      toast.error("Failed to read image file. Please try another.");
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result;
      if (!rawDataUrl) {
        setIsProcessingImage(false);
        toast.error("Failed to process image.");
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback: If canvas decoding fails, use raw data URL directly
        setPreview(rawDataUrl);
        setIsProcessingImage(false);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          setPreview(dataUrl || rawDataUrl);
        } catch (err) {
          console.warn("Canvas compression fallback:", err);
          setPreview(rawDataUrl);
        } finally {
          setIsProcessingImage(false);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!preview) return toast.error("Please upload your payment screenshot.");
    if (isProcessingImage) return toast.error("Please wait while image finishes processing.");
    setIsSubmitting(true);

    try {
      // 1. Resolve current user identity from context or active Supabase session
      let currentUserEmail = user?.email;
      let currentUserId = user?.id;
      let currentUserName = user?.full_name || '';

      if (!currentUserEmail || !currentUserId) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          currentUserEmail = authData.user.email;
          currentUserId = authData.user.id;
          currentUserName = authData.user.user_metadata?.full_name || authData.user.email;
        }
      }

      if (!currentUserEmail) {
        toast.error("Please log in to submit your payment.");
        setIsSubmitting(false);
        return;
      }

      // 2. Ensure Order ID exists
      const currentOrderId = orderId || generateOrderId();
      if (!orderId) {
        setOrderId(currentOrderId);
      }

      const planPriceNumber = Number(finalPrice) || Number(selectedPlan.price) || 0;
      const referralNote = appliedReferral
        ? ` (${appliedReferral.discountPercent ? `${appliedReferral.discountPercent}%` : (appliedReferral.code === 'CSCONNECT' ? '25%' : '10%')} OFF via ${appliedReferral.code})`
        : '';
      const orderDescription = `Order ${currentOrderId} - ${selectedPlan.name} - ${selectedPlan.days} days @ Rs.${selectedPlan.perDay}/day = Rs.${selectedPlan.price}${referralNote}`;

      const payload = {
        user_email: currentUserEmail,
        user_id: currentUserId,
        plan_price: planPriceNumber,
        transaction_id: currentOrderId,
        status: 'pending',
        ai_reason: orderDescription,
        screenshot_url: preview,
        created_at: new Date().toISOString()
      };

      // 3. Insert payment request
      let { error: insertError } = await supabase.from('payment_requests').insert(payload);

      // If RLS failed due to token refresh issue, attempt session refresh and retry once
      if (insertError && (insertError.code === '42501' || insertError.message?.includes('security policy') || insertError.message?.includes('JWT'))) {
        console.warn('Refreshing Supabase session and retrying payment insert...');
        try {
          await supabase.auth.refreshSession();
          const retry = await supabase.from('payment_requests').insert(payload);
          insertError = retry.error;
        } catch (refreshErr) {
          console.error('Session refresh failed:', refreshErr);
        }
      }

      if (insertError) {
        console.error('Payment insert error:', insertError);
        toast.error(`Failed to submit payment: ${insertError.message || 'Database error'}`);
        setIsSubmitting(false);
        return;
      }

      // 4. Track referral if applicable (fire and forget)
      if (appliedReferral && appliedReferral.code !== 'CSCONNECT') {
        const referralInsert = {
          referrer_email: appliedReferral.email,
          friend_email: currentUserEmail,
          status: 'pending',
          order_id: currentOrderId,
          created_date: new Date().toISOString()
        };
        if (appliedReferral.referrer_id) referralInsert.referrer_id = appliedReferral.referrer_id;
        if (currentUserId) referralInsert.referred_id = currentUserId;
        
        supabase.from('referrals').insert(referralInsert).catch((e) => console.warn('Referral recording failed:', e));
      }

      // 5. Notify admin (fire and forget)
      supabase.from('notifications').insert({
        user_email: 'admin',
        title: `New Order: ${currentOrderId} 💰`,
        message: `${currentUserName || currentUserEmail} ordered ${selectedPlan.name} (${selectedPlan.days} days) for Rs. ${selectedPlan.price}`,
        is_read: false
      }).catch((e) => console.warn('Admin notification failed:', e));

      // 6. Refetch user payment status
      refetchMyPaymentRequests();

      toast.success("Payment submitted successfully! Admin will review it shortly.");
      setStep('submitted');
    } catch (e) {
      console.error('Payment submit error:', e);
      toast.error(e.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already premium
  if (isPremium) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center p-12 bg-card rounded-3xl border-2 border-primary/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <Crown className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-lg" />
          <h2 className="font-display text-3xl font-black mb-3">You're Premium!</h2>
          <p className="text-muted-foreground font-medium mb-8">You have unlimited access to all features.</p>
          <button className="btn-primary h-14 px-10 rounded-2xl text-lg font-bold shadow-xl" onClick={() => navigate('/')}>
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // STEP: Submitted successfully
  if (step === 'submitted') {
    return (
      <div className="p-6 max-w-3xl mx-auto pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-card rounded-3xl border-2 border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-black mb-3 text-foreground">Payment Submitted!</h2>
          <p className="text-muted-foreground font-medium mb-2">Your order <span className="font-mono font-bold text-primary">{orderId}</span> is being reviewed.</p>
          <p className="text-sm text-muted-foreground mb-8">The admin will verify your payment and activate your premium access shortly. You'll receive a notification once done.</p>
          <button className="btn-primary h-14 px-10 rounded-2xl text-lg font-bold shadow-xl" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // STEP: Payment screen (send money + upload screenshot)
  if (step === 'payment') {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-24">
        <button onClick={() => setStep('confirm')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-black">Order Summary</h2>
              <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 text-sm">{orderId}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="text-muted-foreground font-medium">{selectedPlan.name} ({selectedPlan.days} days)</span>
              <div className="text-right">
                {appliedReferral && <span className="text-sm line-through text-muted-foreground mr-2">Rs. {selectedPlan.price.toLocaleString()}</span>}
                <span className="font-display text-2xl font-black text-foreground">Rs. {finalPrice.toLocaleString()}</span>
              </div>
            </div>
            {appliedReferral ? (
              <p className="text-xs text-primary font-bold">{appliedReferral.code === 'CSCONNECT' ? '25%' : '10%'} Referral Discount Applied!</p>
            ) : (
              <p className="text-xs text-muted-foreground">Rs. {selectedPlan.perDay}/day</p>
            )}
          </div>

          {/* Payment Accounts */}
          <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md space-y-5">
            <h3 className="font-display text-lg font-bold">Send Payment To</h3>

            {/* EasyPaisa */}
            <div className="bg-secondary/50 rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">EasyPaisa</p>
                  <p className="font-mono text-xl font-black text-foreground">0333 7613822</p>
                </div>
                <button
                  onClick={() => handleCopy('03337613822', 'ep')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${copied === 'ep' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-card border-border text-foreground hover:border-primary/40'}`}
                >
                  {copied === 'ep' ? <><Check className="w-4 h-4 inline mr-1" /> Copied</> : <><Copy className="w-4 h-4 inline mr-1" /> Copy</>}
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Account Name: <span className="text-foreground font-bold">Abdul Basit</span></p>
            </div>

            {/* JazzCash */}
            <div className="bg-secondary/50 rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">JazzCash</p>
                  <p className="font-mono text-xl font-black text-foreground">0336 9212378</p>
                </div>
                <button
                  onClick={() => handleCopy('03369212378', 'jc')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${copied === 'jc' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-card border-border text-foreground hover:border-primary/40'}`}
                >
                  {copied === 'jc' ? <><Check className="w-4 h-4 inline mr-1" /> Copied</> : <><Copy className="w-4 h-4 inline mr-1" /> Copy</>}
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Account Name: <span className="text-foreground font-bold">Linta Adnan</span></p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Send exactly Rs. {finalPrice.toLocaleString()} to either account above.
              </p>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md space-y-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Upload Payment Screenshot
            </h3>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            {isProcessingImage ? (
              <div className="w-full h-40 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm font-bold text-primary">Processing screenshot...</span>
                <span className="text-xs text-muted-foreground">Optimizing image format</span>
              </div>
            ) : !preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-bold">Tap to upload screenshot</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP up to 25MB</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-border">
                <img src={preview} alt="Payment Receipt" className="w-full max-h-60 object-cover" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(''); }} 
                  className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-card"
                >
                  Change
                </button>
              </div>
            )}

            <button
              type="button"
              className={`w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${preview && !isSubmitting && !isProcessingImage
                ? 'btn-primary shadow-xl cursor-pointer'
                : 'bg-secondary border-2 border-border text-muted-foreground cursor-not-allowed'
                }`}
              disabled={!preview || isSubmitting || isProcessingImage}
              onClick={handleSubmitPayment}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Submit Payment</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP: Confirmation screen
  if (step === 'confirm') {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-24">
        <button onClick={() => setStep('select')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border-2 border-border p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto border-2 border-amber-500/20">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-2xl font-black text-foreground">Confirm Your Plan</h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">
              You have selected the <span className="text-foreground font-bold">{selectedPlan.name}</span> for <span className="text-primary font-bold line-through mr-1">Rs. {selectedPlan.price.toLocaleString()}</span> <span className="text-primary font-bold text-xl">Rs. {finalPrice.toLocaleString()}</span> ({selectedPlan.days} days).
            </p>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-5 border border-border max-w-md mx-auto space-y-4">
            <div className="text-left">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Have a Referral Code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code for discount"
                  className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={referralCodeInput}
                  onChange={e => setReferralCodeInput(e.target.value.toUpperCase())}
                  disabled={appliedReferral || validatingReferral}
                />
                {!appliedReferral ? (
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
                    onClick={handleApplyReferral}
                    disabled={validatingReferral || !referralCodeInput.trim()}
                  >
                    {validatingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-xl text-sm border border-red-500/20"
                    onClick={() => { setAppliedReferral(null); setReferralCodeInput(''); }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {appliedReferral && (
                <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {appliedReferral.code === 'CSCONNECT' ? '25%' : '10%'} Discount Applied!
                </p>
              )}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-bold">
              ⚠️ This plan cannot be changed once confirmed. Please make sure this is the right plan for you.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-5 border border-border max-w-md mx-auto">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Order ID</p>
            <p className="font-mono text-3xl font-black text-primary">{orderId}</p>
          </div>

          <div className="flex gap-4 max-w-md mx-auto">
            <button
              className="flex-1 py-4 rounded-2xl bg-secondary border-2 border-border font-bold hover:bg-secondary/80 transition-colors"
              onClick={() => setStep('select')}
            >
              Go Back
            </button>
            <button
              className="flex-1 py-4 rounded-2xl btn-primary font-bold shadow-xl text-lg flex items-center justify-center gap-2"
              onClick={handleProceedToPayment}
            >
              Confirm <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP: Plan selection (default)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/10">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Go Premium</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-lg mx-auto">Unlock unlimited mock tests, AI tutor, past papers, and all premium features.</p>
      </div>

      {/* Payment Status Notifications */}
      {latestRequest && latestRequest.status === 'pending' && (
        <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
          <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-600 dark:text-amber-400">Payment Under Review</p>
            <p className="text-sm text-muted-foreground mt-1">Your payment of Rs. {latestRequest.plan_price} (Order: {latestRequest.transaction_id || 'N/A'}) is being reviewed. You'll be activated shortly!</p>
          </div>
        </div>
      )}

      {latestRequest && latestRequest.status === 'rejected' && (
        <div className="bg-rose-500/5 border-2 border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
          <XCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-500">Payment Rejected</p>
            <p className="text-sm text-muted-foreground mt-1">Your last payment was rejected. Please ensure you send the correct amount and upload a clear screenshot.</p>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isCustom = plan.id === 'custom';
          const displayPrice = isCustom ? getCustomPricePerDay(customDays) * customDays : plan.price;
          const displayPerDay = isCustom ? getCustomPricePerDay(customDays) : plan.perDay;
          const displayDays = isCustom ? customDays : plan.days;
          const displayDiscount = isCustom ? (getCustomPricePerDay(customDays) < 50 ? `${Math.round((1 - getCustomPricePerDay(customDays) / 50) * 100)}%` : null) : plan.discount;

          return (
            <motion.div key={plan.id} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-full text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : `border-border bg-card hover:border-primary/30 ${plan.gradientBorder}`
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl ${plan.bgColor} border flex items-center justify-center mb-5`}>
                  <plan.icon className={`w-6 h-6 ${plan.color}`} />
                </div>

                <p className="font-display text-lg font-bold text-foreground mb-1">{plan.name}</p>
                <p className="text-xs text-muted-foreground font-medium mb-4">{plan.description}</p>

                <div className="space-y-1">
                  <p className="font-display text-3xl font-black text-foreground">
                    Rs. {displayPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Rs. {displayPerDay}/day {displayDiscount && <span className="text-primary font-bold ml-1">· {displayDiscount} off</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{displayDays} day{displayDays > 1 ? 's' : ''}</p>
                </div>

                {isSelected && (
                  <div className="absolute top-4 left-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Plan Slider */}
      <AnimatePresence>
        {selectedPlanId === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-3xl border-2 border-violet-500/30 p-8 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-foreground">Choose Duration</h3>
                <div className="text-right">
                  <p className="font-display text-3xl font-black text-foreground">Rs. {(getCustomPricePerDay(customDays) * customDays).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-medium">Rs. {getCustomPricePerDay(customDays)}/day for {customDays} days</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="range"
                  min="2"
                  max="90"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value))}
                  className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>2 days</span>
                  <span className="text-violet-500 text-lg font-display font-black">{customDays} days</span>
                  <span>90 days</span>
                </div>
              </div>

              {/* Price breakdown milestones */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { d: 7, label: '1 Week' },
                  { d: 14, label: '2 Weeks' },
                  { d: 30, label: '1 Month' },
                  { d: 60, label: '2 Months' },
                ].map(({ d, label }) => (
                  <button
                    key={d}
                    onClick={() => setCustomDays(d)}
                    className={`p-3 rounded-xl text-center border transition-all ${customDays === d
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-violet-500/40'
                      }`}
                  >
                    <p className="text-xs font-bold">{label}</p>
                    <p className="font-display text-sm font-black mt-1">Rs. {(getCustomPricePerDay(d) * d).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features List */}
      <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-md">
        <h3 className="font-display text-xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Features Included
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Get Button */}
      <div className="sticky bottom-4 z-10">
        <button
          className="btn-primary w-full h-16 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
          onClick={handleConfirmPlan}
        >
          Get {selectedPlan.name} — Rs. {selectedPlan.price.toLocaleString()}
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
