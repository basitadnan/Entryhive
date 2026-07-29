import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Shield, 
  CreditCard, 
  Key, 
  LayoutDashboard, 
  Database, 
  Upload, 
  Trash2, 
  Check, 
  X, 
  Crown,
  TrendingUp,
  ArrowLeft,
  Plus,
  Copy,
  Loader2,
  Wallet,
  Download,
  Clock,
  Calendar,
  MessageSquareText
} from 'lucide-react';
import { toast } from 'sonner';
import { sendEmail } from '@/lib/emailClient';
import { addCustomQuestion, getCustomQuestions, deleteCustomQuestion, getSectionLabel, getAllSections } from '@/lib/questionBank';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NAT-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Admin() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for forms
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState(() => sessionStorage.getItem('adminPaymentFilter') || 'pending');
  
  // Grant premium state
  const [grantEmail, setGrantEmail] = useState('');
  const [grantDays, setGrantDays] = useState('30');
  const [granting, setGranting] = useState(false);
  const [withdrawalFilter, setWithdrawalFilter] = useState(() => sessionStorage.getItem('adminWithdrawalFilter') || 'pending');

  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [approvingPaymentId, setApprovingPaymentId] = useState(null);
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState(null);
  const [withdrawalRejectionReason, setWithdrawalRejectionReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [premiumSearch, setPremiumSearch] = useState('');

  React.useEffect(() => {
    sessionStorage.setItem('adminPaymentFilter', paymentFilter);
  }, [paymentFilter]);

  React.useEffect(() => {
    sessionStorage.setItem('adminWithdrawalFilter', withdrawalFilter);
  }, [withdrawalFilter]);
  
  // Custom questions state
  const [customQuestions, setCustomQuestions] = useState(getCustomQuestions());
  const [qSection, setQSection] = useState('english');
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('0');
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState('easy');
  const [qTopic, setQTopic] = useState('');

  // Queries
  const { data: codes = [], isLoading: loadingCodes } = useQuery({ 
    queryKey: ['admin-codes'], 
    queryFn: () => base44.entities.activation_codes.list('-created_date', 100), 
    enabled: !!user && user.role === 'admin' 
  });
  const { data: usersList = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery({ 
    queryKey: ['admin-users'], 
    queryFn: async () => {
    // Direct Supabase query with error visibility
    const { supabase } = await import('@/lib/supabaseClient');
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Admin Users Query Error:', error);
      toast.error(`Users query failed: ${error.message}`);
      return [];
    }
    console.log('Admin Users Query Result:', data);
    return data || [];
  }, enabled: !!user && user.role === 'admin' });
  
  const { data: payments = [], refetch: refetchPayments, isLoading: loadingPayments } = useQuery({ 
    queryKey: ['admin-payments'], 
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data, error } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Admin Payments Query Error:', error);
        toast.error(`Payments query failed: ${error.message}`);
        return [];
      }
      return data || [];
    }, 
    enabled: !!user && user.role === 'admin' 
  });

  const { data: feedbacks = [], isLoading: loadingFeedbacks } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data, error } = await supabase.from('Feedback').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Admin Feedbacks Query Error:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && user.role === 'admin'
  });

  
  const { data: withdrawalRequests = [], refetch: refetchWithdrawals } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      if (error) return [];
      const enriched = await Promise.all((data || []).map(async (w) => {
        const [profileRes, payoutRes] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('id', w.user_id).single(),
          supabase.from('payout_info').select('method, account_number, account_name').eq('user_id', w.user_id).single()
        ]);
        return {
          ...w,
          user_name: profileRes.data?.full_name || 'Unknown',
          user_email: profileRes.data?.email || 'Unknown',
          payout_method: payoutRes.data?.method || null,
          payout_account_number: payoutRes.data?.account_number || null,
          payout_account_name: payoutRes.data?.account_name || null
        };
      }));
      return enriched;
    },
    enabled: !!user && user.role === 'admin'
  });
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');

  const { data: allPracticeSessions = [] } = useQuery({ 
    queryKey: ['admin-practice-sessions'], 
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase.from('practice_sessions').select('user_email, completed');
      return data || [];
    }, 
    enabled: user?.role === 'admin' 
  });

  const { data: allMockTests = [] } = useQuery({ 
    queryKey: ['admin-mock-tests'], 
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase.from('mock_test_results').select('user_email, completed');
      return data || [];
    }, 
    enabled: user?.role === 'admin' 
  });

  const { data: dbStats = { total: 0, bank: 0, past: 0 } } = useQuery({
    queryKey: ['admin-db-stats'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { count: total } = await supabase.from('questions').select('*', { count: 'exact', head: true });
      const { count: bank } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', false);
      const { count: past } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', true);
      
      return {
        total: total || 0,
        bank: bank || 0,
        past: past || 0
      };
    },
    enabled: user?.role === 'admin',
    refetchInterval: 30000 // Refresh every 30s
  });

  const practiceCounts = React.useMemo(() => {
    const counts = {};
    (allPracticeSessions || []).forEach(s => {
      if (s.completed && s.user_email) {
        counts[s.user_email] = (counts[s.user_email] || 0) + 1;
      }
    });
    return counts;
  }, [allPracticeSessions]);

  const mockCounts = React.useMemo(() => {
    const counts = {};
    (allMockTests || []).forEach(m => {
      if (m.completed && m.user_email) {
        counts[m.user_email] = (counts[m.user_email] || 0) + 1;
      }
    });
    return counts;
  }, [allMockTests]);

  const isInitialLoading = !user;

  if (isInitialLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">Verifying Admin Access...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-4 text-center">
        <Card className="p-8 bg-card border-red-500/30">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You need admin privileges to access this page.</p>
          <Button className="mt-4 bg-red-500 text-white" onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  // --- Handlers ---
  const handleAddQuestion = () => {
    if (!qText || !qOptA || !qOptB || !qOptC || !qOptD) return toast.error('Please fill all required fields');
    addCustomQuestion({ section: qSection, question: qText, options: [qOptA, qOptB, qOptC, qOptD], correct: parseInt(qCorrect), explanation: qExplanation || 'No explanation provided.', difficulty: qDifficulty, topic: qTopic || 'General' });
    setCustomQuestions(getCustomQuestions());
    setQText(''); setQOptA(''); setQOptB(''); setQOptC(''); setQOptD(''); setQExplanation(''); setQTopic('');
    toast.success('Question added successfully!');
  };

  const handlePromoteAdmin = async (targetEmail) => {
    if (!window.confirm(`Are you sure you want to make ${targetEmail} an Admin?`)) return;
    const { supabase: sb } = await import('@/lib/supabaseClient');
    const { error } = await sb.from('profiles').update({ role: 'admin' }).eq('email', targetEmail);
    if (error) return toast.error('Failed to promote user');
    toast.success(`${targetEmail} is now an Admin!`);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let detectedSection = 'english';
    const allSecs = getAllSections('NAT-ICOM');
    for (const sec of allSecs) { if (file.name.toLowerCase().includes(sec)) detectedSection = sec; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n');
      let currentQ = null, added = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith('Q:')) {
          if (currentQ && currentQ.question && currentQ.options.length === 4) { currentQ.section = detectedSection; addCustomQuestion(currentQ); added++; }
          currentQ = { question: line.substring(2).trim(), options: [], correct: 0, explanation: '', difficulty: 'medium', topic: 'General' };
        } else if (line.startsWith('A:') && currentQ) { currentQ.options[0] = line.substring(2).trim(); }
        else if (line.startsWith('B:') && currentQ) { currentQ.options[1] = line.substring(2).trim(); }
        else if (line.startsWith('C:') && currentQ) { currentQ.options[2] = line.substring(2).trim(); }
        else if (line.startsWith('D:') && currentQ) { currentQ.options[3] = line.substring(2).trim(); }
        else if (line.startsWith('Correct:') && currentQ) { const val = line.substring(8).trim().toUpperCase(); currentQ.correct = val === 'A' ? 0 : val === 'B' ? 1 : val === 'C' ? 2 : val === 'D' ? 3 : 0; }
        else if (line.startsWith('Explanation:') && currentQ) { currentQ.explanation = line.substring(12).trim(); }
      }
      if (currentQ && currentQ.question && currentQ.options.length === 4) { currentQ.section = detectedSection; addCustomQuestion(currentQ); added++; }
      setCustomQuestions(getCustomQuestions());
      toast.success(`Imported ${added} questions into ${getSectionLabel(detectedSection)}`);
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleCreateCode = async () => {
    if (!newEmail.trim()) return toast.error('Enter user email');
    setCreating(true);
    const code = generateCode();
    
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const { error } = await supabase.from('activation_codes').insert({ 
        code, 
        target_email: newEmail.trim().toLowerCase(), 
        is_used: false
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-codes'] });
      toast.success(`Code created: ${code}`);
      setNewEmail('');
    } catch (err) {
      console.error("Code Creation Error:", err);
      toast.error(`Failed to create code: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Computed Stats
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const premiumUsers = usersList.filter(u => u.is_premium);
  const totalRevenue = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.plan_price || 0), 0);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      (u.full_name?.toLowerCase() || '').includes(userSearch.toLowerCase()) || 
      (u.email?.toLowerCase() || '').includes(userSearch.toLowerCase())
    );
  }, [usersList, userSearch]);

  const filteredPremiumUsers = useMemo(() => {
    return premiumUsers.filter(u => 
      (u.full_name?.toLowerCase() || '').includes(premiumSearch.toLowerCase()) || 
      (u.email?.toLowerCase() || '').includes(premiumSearch.toLowerCase())
    );
  }, [premiumUsers, premiumSearch]);

  // --- Horizontal Tabs Configuration ---
  const TABS = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'payments', label: 'Pays', icon: CreditCard },
    { id: 'withdrawals', label: 'Payouts', icon: Wallet },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'premium', label: 'Prem', icon: Crown },
    { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Management Console</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Button>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-sm font-semibold border ${
              activeTab === tab.id 
                ? 'bg-primary text-black border-primary' 
                : 'bg-black/40 text-muted-foreground border-border hover:border-primary/50 hover:text-white'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-primary'}`} />
            {tab.label}
            {tab.id === 'payments' && pendingPayments.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{pendingPayments.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-transparent mt-4">
          
        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4 bg-card border-border text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{usersList.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Total Users</p>
              </Card>
              <Card className="p-4 bg-card border-border text-center">
                <Crown className="w-6 h-6 text-primary mx-auto mb-2 drop-shadow-md" />
                <p className="text-2xl font-bold text-primary">{premiumUsers.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Premium</p>
              </Card>
              <Card className="p-4 bg-card border-border text-center">
                <CreditCard className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Pending</p>
              </Card>
              <Card className="p-4 bg-card border-border text-center relative group cursor-pointer" onClick={() => {
                const manual = prompt('Enter manual revenue amount to display (numbers only):');
                if (manual !== null && !isNaN(manual)) {
                  localStorage.setItem('admin_manual_revenue', manual);
                  toast.success('Revenue display updated!');
                  // Force re-render hack by setting state
                  setNewEmail(newEmail + ' '); setNewEmail(newEmail);
                }
              }}>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">EDIT</span>
                </div>
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">Rs. {(localStorage.getItem('admin_manual_revenue') ? Number(localStorage.getItem('admin_manual_revenue')) : 12455).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Revenue</p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB: Payment Requests */}
        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2">Payment Requests</h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-black/40 rounded-lg max-w-md">
              {['pending', 'approved', 'rejected'].map(filter => (
                <button
                  key={filter}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${paymentFilter === filter ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/5'}`}
                  onClick={() => setPaymentFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {payments.filter(p => p.status === paymentFilter).length === 0 ? <p className="text-muted-foreground text-sm">No {paymentFilter} payment requests.</p> : 
                payments.filter(p => p.status === paymentFilter).map(p => (
                  <Card key={p.id} className="p-4 bg-card border-border flex flex-col md:flex-row gap-4 items-start relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={async () => {
                        if (window.confirm('Delete this payment request completely?')) {
                          const { supabase } = await import('@/lib/supabaseClient');
                          await supabase.from('payment_requests').delete().eq('id', p.id);
                          toast.success('Deleted'); refetchPayments();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    {p.screenshot_url && p.status !== 'approved' && (
                      <div className="w-full md:w-48 flex-shrink-0 bg-black/40 rounded-lg p-1 border border-border">
                        <img src={p.screenshot_url} alt="Receipt" className="w-full h-auto object-contain rounded cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(p.screenshot_url, '_blank')} />
                      </div>
                    )}
                    {p.screenshot_url && p.status === 'approved' && (
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 gap-1.5"
                          onClick={() => window.open(p.screenshot_url, '_blank')}
                        >
                          <Download className="w-3.5 h-3.5" /> Download Proof
                        </Button>
                      </div>
                    )}
                    <div className="flex-1 w-full pr-8">
                      <div className="flex justify-between items-start mb-2">
                        <div className="truncate pr-2">
                          <p className="font-bold text-base truncate">{p.user_email}</p>
                          <p className="text-xs text-muted-foreground">Rs. {p.plan_price} • {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${p.status === 'approved' ? 'bg-green-500/20 text-green-400' : p.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {p.status}
                        </span>
                      </div>
                      
                      {p.ai_reason && (
                        <div className="bg-secondary p-2 rounded border border-border my-2">
                          <p className="text-[10px] text-muted-foreground font-mono leading-relaxed"><strong className="text-primary mr-1">AI Report:</strong>{p.ai_reason}</p>
                        </div>
                      )}

                      {p.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-border">
                          <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white w-full sm:w-auto" onClick={async () => {
                            const { supabase } = await import('@/lib/supabaseClient');
                            await supabase.from('payment_requests').update({ status: 'approved' }).eq('id', p.id);
                            
                            // Extract days from ai_reason or default to 30
                            let days = 30;
                            if (p.ai_reason) {
                              const match = p.ai_reason.match(/- (\d+) days/);
                              if (match && match[1]) {
                                days = parseInt(match[1], 10);
                              }
                            }
                            const expiryDate = new Date();
                            expiryDate.setDate(expiryDate.getDate() + days);

                            // Try to update user using their email to ensure accuracy
                            const { data: usersData } = await supabase.from('profiles').select('id').eq('email', p.user_email);
                            if (usersData && usersData.length > 0) {
                              await supabase.from('profiles').update({ is_premium: true, premium_expiry_date: expiryDate.toISOString() }).eq('id', usersData[0].id);
                            } else if (p.user_id) {
                              await supabase.from('profiles').update({ is_premium: true, premium_expiry_date: expiryDate.toISOString() }).eq('id', p.user_id);
                            }

                            // Create Notification for User
                            await supabase.from('notifications').insert({
                              user_email: p.user_email,
                              title: 'Payment Approved! 🎉',
                              message: `Your premium access for the ${p.plan_name || 'Selected'} plan has been activated. Enjoy!`,
                              is_read: false
                            });
                            
                            toast.success('Approved and Premium granted!'); refetchPayments();
                          }}><Check className="w-4 h-4 mr-1.5" /> Approve</Button>
                          
                          <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-600/30 w-full sm:w-auto" onClick={async () => {
                            const { supabase } = await import('@/lib/supabaseClient');
                            await supabase.from('payment_requests').update({ status: 'rejected' }).eq('id', p.id);

                            // Create Notification for User
                            await supabase.from('notifications').insert({
                              user_email: p.user_email,
                              title: 'Payment Rejected ❌',
                              message: 'Your payment request was rejected. Please check your screenshot and try again.',
                              is_read: false
                            });

                            toast.error('Payment rejected.'); refetchPayments();
                          }}><X className="w-4 h-4 mr-1.5" /> Reject</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              }
            </div>
          </div>
        )}

        {/* TAB: All Users */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border/30 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                All Users <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full font-mono">{filteredUsers.length}</span>
              </h2>
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full sm:w-64 bg-black/40 border-border"
              />
            </div>
            <div className="space-y-2">
              {filteredUsers.length === 0 && <p className="text-muted-foreground text-sm">No users found.</p>}
              {filteredUsers.map(u => (
                <Card key={u.id} className="p-3 bg-card border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="truncate">
                    <p className="font-bold text-sm truncate">{u.full_name || 'No Name'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {u.is_premium ? <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1"><Crown className="w-2.5 h-2.5"/> Prem</span> : <span className="text-[9px] bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded uppercase font-bold">Free</span>}
                      {u.role === 'admin' && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>}
                      {u.nat_group && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">{u.nat_group}</span>}
                      <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold">
                        {practiceCounts[u.email] || 0} Practice
                      </span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">
                        {mockCounts[u.email] || 0} Mock
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-2">
                    <p className="font-mono font-bold text-xs bg-black/40 px-1.5 py-0.5 rounded text-primary">{u.referral_code || 'NONE'}</p>
                    {u.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-[9px] font-bold border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => handlePromoteAdmin(u.email)}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Premium Users */}
        {activeTab === 'premium' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 text-primary flex items-center gap-2">
              <Crown className="w-5 h-5" /> Premium Users
            </h2>

            {/* Grant Premium Section */}
            <Card className="p-4 bg-card border-primary/20">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Grant Premium Access
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="User email" 
                  value={grantEmail} 
                  onChange={e => setGrantEmail(e.target.value)} 
                  className="flex-1 bg-secondary border-border text-sm"
                />
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Days" 
                    value={grantDays} 
                    onChange={e => setGrantDays(e.target.value)} 
                    className="w-24 bg-secondary border-border text-sm text-center"
                    min="1"
                  />
                  <Button 
                    size="sm" 
                    className="bg-primary text-black font-bold px-4 whitespace-nowrap"
                    disabled={granting || !grantEmail.trim() || !grantDays}
                    onClick={async () => {
                      const email = grantEmail.trim().toLowerCase();
                      const days = parseInt(grantDays);
                      if (!email || !days || days < 1) return toast.error('Enter valid email and days');
                      setGranting(true);
                      try {
                        const { supabase } = await import('@/lib/supabaseClient');
                        const { data: profileData, error: findErr } = await supabase.from('profiles').select('id').eq('email', email).single();
                        if (findErr || !profileData) throw new Error('User not found with that email');
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() + days);
                        const { error } = await supabase.from('profiles').update({ 
                          is_premium: true, 
                          premium_expiry_date: expiryDate.toISOString() 
                        }).eq('id', profileData.id);
                        if (error) throw error;
                        await supabase.from('notifications').insert({
                          user_email: email,
                          title: 'Premium Activated! 🎉',
                          message: `You've been granted ${days} days of premium access by the admin. Enjoy!`,
                          is_read: false
                        });
                        toast.success(`Premium granted to ${email} for ${days} days!`);
                        setGrantEmail('');
                        setGrantDays('30');
                        // Optimistically update UI
                        queryClient.setQueryData(['admin-users'], old => 
                          old ? old.map(user => user.email === email ? { ...user, is_premium: true, premium_expiry_date: expiryDate.toISOString() } : user) : old
                        );
                        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                      } catch (err) {
                        toast.error(err.message || 'Failed to grant premium');
                      } finally {
                        setGranting(false);
                      }
                    }}
                  >
                    {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Grant'}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Enter an email and number of days to grant premium access.</p>
            </Card>

            {/* Premium Users List */}
            <div className="space-y-2 mt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  Premium Roster <span className="bg-primary/20 text-xs px-2 py-0.5 rounded-full font-mono">{filteredPremiumUsers.length}</span>
                </h3>
                <Input
                  type="text"
                  placeholder="Search premium users..."
                  value={premiumSearch}
                  onChange={(e) => setPremiumSearch(e.target.value)}
                  className="w-full sm:w-64 bg-black/40 border-primary/20 focus:border-primary/50"
                />
              </div>
              {filteredPremiumUsers.length === 0 && <p className="text-muted-foreground text-sm">No premium users found.</p>}
              {filteredPremiumUsers.map(u => {
                const expiry = u.premium_expiry_date ? new Date(u.premium_expiry_date) : null;
                const now = new Date();
                const daysLeft = expiry ? Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))) : null;
                const hoursLeft = expiry ? Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60))) : null;
                const isExpiringSoon = daysLeft !== null && daysLeft <= 3;
                
                return (
                  <Card key={u.id} className="p-3 bg-card border-primary/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="truncate flex-1">
                        <p className="font-bold text-sm text-primary truncate">{u.full_name || 'No Name'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                        {expiry ? (
                          <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] font-bold ${isExpiringSoon ? 'text-amber-400' : 'text-green-400'}`}>
                            <Clock className="w-3 h-3" />
                            {daysLeft > 0 ? (
                              <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left ({expiry.toLocaleDateString('en-PK', { dateStyle: 'medium' })})</span>
                            ) : hoursLeft > 0 ? (
                              <span className="text-red-400">{hoursLeft} hour{hoursLeft !== 1 ? 's' : ''} left — expiring today!</span>
                            ) : (
                              <span className="text-red-400">Expired on {expiry.toLocaleDateString('en-PK', { dateStyle: 'medium' })}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> No expiry set (lifetime)</p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex-shrink-0"
                        onClick={async () => {
                          if (window.confirm(`Revoke premium for ${u.email}?`)) {
                            const { supabase } = await import('@/lib/supabaseClient');
                            const { error } = await supabase.from('profiles').update({ is_premium: false, premium_expiry_date: null }).eq('id', u.id);
                            if (error) {
                              toast.error('Failed to revoke: ' + error.message);
                              return;
                            }
                            // Optimistically update UI
                            queryClient.setQueryData(['admin-users'], old => 
                              old ? old.map(user => user.id === u.id ? { ...user, is_premium: false, premium_expiry_date: null } : user) : old
                            );
                            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                            toast.success(`Premium revoked for ${u.email}`);
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        
        {activeTab === 'withdrawals' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-500" /> Payout Requests
              {pendingWithdrawals.length > 0 && <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded-full font-mono">{pendingWithdrawals.length} pending</span>}
            </h2>
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg mb-4">
              {['pending', 'sent', 'rejected'].map(filter => (
                <button key={filter} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${withdrawalFilter === filter ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => setWithdrawalFilter(filter)}>{filter}</button>
              ))}
            </div>
            {withdrawalRequests.filter(w => w.status === withdrawalFilter).length === 0 ? (
              <Card className="p-8 text-center bg-card border-border">
                <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No {withdrawalFilter} withdrawal requests.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {withdrawalRequests.filter(w => w.status === withdrawalFilter).map(w => (
                  <Card key={w.id} className={`p-4 bg-card border-border ${w.status === 'pending' ? 'border-amber-500/30' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{w.user_name}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${w.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : w.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{w.status}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{w.user_email}</p>
                        <p className="text-2xl font-bold text-primary mt-2">Rs. {Number(w.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Requested {new Date(w.requested_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        {w.resolved_at && <p className="text-[10px] text-muted-foreground">Resolved {new Date(w.resolved_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                        {w.rejection_reason && <p className="text-xs text-red-400 mt-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">Reason: {w.rejection_reason}</p>}
                        {w.payout_method && (
                          <div className="mt-3 p-3 bg-secondary/50 rounded-xl border border-border/50 space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Payout Details</p>
                            <p className="text-sm font-bold">{w.payout_method === 'bank' ? '\u{1F3E6} Bank Transfer' : w.payout_method === 'easypaisa' ? '\u{1F4F1} EasyPaisa' : w.payout_method === 'jazzcash' ? '\u{1F4F1} JazzCash' : '\u{1F4F1} NayaPay'}</p>
                            <p className="text-sm font-mono">{w.payout_account_number}</p>
                            <p className="text-sm text-muted-foreground">{w.payout_account_name}</p>
                          </div>
                        )}
                      </div>
                      {w.status === 'pending' && (
                        <div className="flex flex-col gap-2 sm:w-48">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold w-full" onClick={async () => {
                            if (!window.confirm(`Mark Rs.${Number(w.amount).toLocaleString()} as SENT to ${w.user_name}?`)) return;
                            try {
                              const { supabase } = await import('@/lib/supabaseClient');
                              const { error } = await supabase.from('withdrawal_requests').update({ status: 'sent', resolved_at: new Date().toISOString() }).eq('id', w.id);
                              if (error) throw error;
                              const { error: rpcErr } = await supabase.rpc('increment_wallet', { p_user_id: w.user_id, p_amount: -Number(w.amount) });
                              if (rpcErr) throw rpcErr;
                              await supabase.from('notifications').insert({ user_email: w.user_email, title: 'Withdrawal Sent! \u{1F4B8}', message: `Your withdrawal of Rs.${Number(w.amount).toLocaleString()} has been sent to your ${w.payout_method || 'account'}.`, is_read: false });
                              toast.success('Marked as sent and wallet deducted.');
                              refetchWithdrawals();
                            } catch (err) { toast.error('Failed: ' + err.message); }
                          }}><Check className="w-4 h-4 mr-1.5" /> Mark as Sent</Button>
                          {rejectingWithdrawalId === w.id ? (
                            <div className="space-y-2">
                              <textarea value={withdrawalRejectionReason} onChange={(e) => setWithdrawalRejectionReason(e.target.value)} placeholder="Reason for rejection..." className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none min-h-[60px]" />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white flex-1" onClick={async () => {
                                  try {
                                    const { supabase } = await import('@/lib/supabaseClient');
                                    const { error } = await supabase.from('withdrawal_requests').update({ status: 'rejected', rejection_reason: withdrawalRejectionReason.trim() || 'No reason provided', resolved_at: new Date().toISOString() }).eq('id', w.id);
                                    if (error) throw error;
                                    await supabase.from('notifications').insert({ user_email: w.user_email, title: 'Withdrawal Rejected \u{274C}', message: `Your withdrawal of Rs.${Number(w.amount).toLocaleString()} was rejected. ${withdrawalRejectionReason.trim() ? `Reason: ${withdrawalRejectionReason.trim()}` : ''} Your wallet balance is unchanged.`, is_read: false });
                                    toast.success('Withdrawal rejected.');
                                    setRejectingWithdrawalId(null); setWithdrawalRejectionReason(''); refetchWithdrawals();
                                  } catch (err) { toast.error('Failed: ' + err.message); }
                                }}>Confirm</Button>
                                <Button size="sm" variant="outline" onClick={() => { setRejectingWithdrawalId(null); setWithdrawalRejectionReason(''); }}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-600/30 w-full" onClick={() => setRejectingWithdrawalId(w.id)}><X className="w-4 h-4 mr-1.5" /> Reject</Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Feedback */}
        {activeTab === 'feedback' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-blue-400" /> User Feedback
              <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full font-mono">{feedbacks.length}</span>
            </h2>
            <div className="space-y-3">
              {feedbacks.length === 0 && <p className="text-muted-foreground text-sm">No feedback received yet.</p>}
              {feedbacks.map(f => (
                <Card key={f.id} className="p-4 bg-card border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{f.user_name || 'Anonymous'}</p>
                      <p className="text-[10px] text-muted-foreground">{f.user_email || 'No email provided'}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      f.type === 'bug' ? 'bg-red-500/20 text-red-400' : 
                      f.type === 'suggestion' ? 'bg-green-500/20 text-green-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {f.type || 'Feedback'}
                    </span>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg border border-border mt-2">
                    <p className="text-sm whitespace-pre-wrap">{f.message}</p>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-muted-foreground">
                      {f.created_at ? new Date(f.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
