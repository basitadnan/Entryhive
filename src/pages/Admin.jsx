import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
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
  const [paymentFilter, setPaymentFilter] = useState('pending');
  
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
  const { data: usersList = [], isLoading: loadingUsers } = useQuery({ 
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

  // --- Horizontal Tabs Configuration ---
  const TABS = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'payments', label: 'Pays', icon: CreditCard },
    { id: 'codes', label: 'Codes', icon: Key },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'premium', label: 'Prem', icon: Crown },
    { id: 'questions', label: 'Bank', icon: Database },
    { id: 'cloud_bank', label: 'Cloud', icon: Database },
    { id: 'importer', label: 'Past Papers', icon: Upload },
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
                <p className="text-2xl font-bold">Rs. {localStorage.getItem('admin_manual_revenue') || totalRevenue.toLocaleString()}</p>
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

                    {p.screenshot_url && (
                      <div className="w-full md:w-48 flex-shrink-0 bg-black/40 rounded-lg p-1 border border-border">
                        <img src={p.screenshot_url} alt="Receipt" className="w-full h-auto object-contain rounded cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(p.screenshot_url, '_blank')} />
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
                            
                            // Try to update user using their email to ensure accuracy
                            const { data: usersData } = await supabase.from('profiles').select('id').eq('email', p.user_email);
                            if (usersData && usersData.length > 0) {
                              await supabase.from('profiles').update({ is_premium: true }).eq('id', usersData[0].id);
                            } else if (p.user_id) {
                              await supabase.from('profiles').update({ is_premium: true }).eq('id', p.user_id);
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

        {/* TAB: Activation Codes */}
        {activeTab === 'codes' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2">Activation Codes</h2>
            
            <Card className="p-4 bg-card border-border">
              <h3 className="text-sm font-semibold mb-2">Generate New Code</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="User's email address" className="bg-black/40 border-border focus:border-primary" />
                <Button className="bg-primary text-black font-bold whitespace-nowrap" disabled={creating} onClick={handleCreateCode}>
                  <Plus className="w-4 h-4 mr-2" /> Generate
                </Button>
              </div>
            </Card>

            <div className="space-y-2">
              {codes.length === 0 && <p className="text-muted-foreground text-sm">No activation codes generated.</p>}
              {codes.map(c => (
                <Card key={c.id} className="p-3 bg-secondary/10 border-border/30 flex justify-between items-center flex-wrap gap-2">
                  <div className="min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary font-bold tracking-wider">{c.code}</span>
                      {c.is_used ? <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold">Used</span> : <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold">Active</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[200px]">For: <strong className="text-white">{c.target_email}</strong></p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {navigator.clipboard.writeText(c.code); toast.success("Copied!");}}>
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.activation_codes.delete(c.id); queryClient.invalidateQueries({ queryKey: ['admin-codes'] }); toast.success("Deleted"); }}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB: All Users */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              All Users <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full font-mono">{usersList.length}</span>
            </h2>
            <div className="space-y-2">
              {usersList.length === 0 && <p className="text-muted-foreground text-sm">No users found or RLS policy blocked query.</p>}
              {usersList.map(u => (
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
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 text-primary flex items-center gap-2">
              <Crown className="w-5 h-5" /> Premium Users
            </h2>
            <div className="space-y-2">
              {premiumUsers.length === 0 && <p className="text-muted-foreground text-sm">No premium users found.</p>}
              {premiumUsers.map(u => (
                <Card key={u.id} className="p-3 bg-card border-primary/30 flex justify-between items-center">
                  <div className="truncate">
                    <p className="font-bold text-sm text-primary truncate">{u.full_name || 'No Name'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 ml-2"
                    onClick={async () => {
                      if (window.confirm(`Revoke premium for ${u.email}?`)) {
                        const { supabase } = await import('@/lib/supabaseClient');
                        await supabase.from('profiles').update({ is_premium: false }).eq('id', u.id);
                        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                        toast.success("Premium revoked");
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Question Bank */}
        {activeTab === 'questions' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              Question Bank <span className="text-xs font-normal text-muted-foreground ml-auto">{customQuestions.length} Total</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-xl font-bold text-blue-400">{customQuestions.filter(q => q.section === 'english').length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">English</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-xl font-bold text-pink-400">{customQuestions.filter(q => q.section === 'analytical').length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Analytical</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-xl font-bold text-green-400">{customQuestions.filter(q => q.section === 'quantitative').length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Quantitative</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-xl font-bold text-amber-400">{customQuestions.filter(q => !['english', 'analytical', 'quantitative'].includes(q.section)).length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Subject</p>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Importer */}
              <Card className="p-4 bg-card border-border text-center flex-1">
                <Upload className="w-5 h-5 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1">Bulk Import</h3>
                <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
                  Upload a .txt file (e.g. english.txt).
                </p>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-black cursor-pointer" />
              </Card>
              
              {/* Manual Form */}
              <Card className="p-4 bg-card border-border flex-[2]">
                <h3 className="font-bold text-sm mb-3">Add Single Question</h3>
                <div className="space-y-2">
                  <select value={qSection} onChange={e => setQSection(e.target.value)} className="w-full p-2 rounded-lg bg-black/40 border border-border text-xs focus:border-primary">
                    {getAllSections('NAT-ICOM').map(s => <option key={s} value={s}>{getSectionLabel(s)}</option>)}
                  </select>
                  <Input placeholder="Question Text" value={qText} onChange={e => setQText(e.target.value)} className="bg-black/40 border-border text-xs h-8" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Option A" value={qOptA} onChange={e => setQOptA(e.target.value)} className="bg-black/40 border-border text-xs h-8" />
                    <Input placeholder="Option B" value={qOptB} onChange={e => setQOptB(e.target.value)} className="bg-black/40 border-border text-xs h-8" />
                    <Input placeholder="Option C" value={qOptC} onChange={e => setQOptC(e.target.value)} className="bg-black/40 border-border text-xs h-8" />
                    <Input placeholder="Option D" value={qOptD} onChange={e => setQOptD(e.target.value)} className="bg-black/40 border-border text-xs h-8" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={qCorrect} onChange={e => setQCorrect(e.target.value)} className="w-full p-2 rounded-lg bg-black/40 border border-border text-xs">
                      <option value="0">Correct: A</option><option value="1">Correct: B</option><option value="2">Correct: C</option><option value="3">Correct: D</option>
                    </select>
                    <select value={qDifficulty} onChange={e => setQDifficulty(e.target.value)} className="w-full p-2 rounded-lg bg-black/40 border border-border text-xs">
                      <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                    </select>
                  </div>
                  <Button className="w-full bg-primary text-black font-bold h-8 text-xs" onClick={handleAddQuestion}>Add Question</Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB: Cloud Bank Importer Redirect */}
        {activeTab === 'cloud_bank' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              Cloud Bank Management <span className="text-xs font-normal text-muted-foreground ml-auto">{dbStats.bank} Total</span>
            </h2>
            <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-6 bg-green-500/5 border-green-500/20">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Database className="w-10 h-10 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">General Bank Importer</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Upload multiple <strong>.txt</strong> files for practice and mock tests. Automatic duplicate detection and category mapping.
                </p>
              </div>
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold h-14 px-8 rounded-2xl shadow-xl shadow-green-500/20" onClick={() => navigate('/admin/bank-importer')}>
                Open Bank Importer
              </Button>
            </Card>
          </div>
        )}

        {/* TAB: Importer Redirect (Past Papers) */}
        {activeTab === 'importer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold border-b border-border/30 pb-2 flex items-center gap-2">
              Past Paper Management <span className="text-xs font-normal text-muted-foreground ml-auto">{dbStats.past} Total</span>
            </h2>
            <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-6 bg-primary/5 border-primary/20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Smart Past Paper Importer</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Specifically for exam papers. Supports <strong>.json</strong> and <strong>.txt</strong> with track categorization.
                </p>
              </div>
              <Button size="lg" className="bg-primary text-black font-bold h-14 px-8 rounded-2xl shadow-xl shadow-primary/20" onClick={() => navigate('/admin/importer')}>
                Open Smart Importer
              </Button>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
