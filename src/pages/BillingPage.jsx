import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Crown, Clock, CheckCircle2, XCircle, 
  FileText, CalendarDays, DollarSign, ShoppingBag,
  Copy, MessageCircle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;

  // Fetch all payment requests for this user
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['billing-orders', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_email', user?.email)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user?.email
  });

  const completedOrders = orders.filter(o => o.status === 'approved');
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.plan_price || 0), 0);
  const totalDays = completedOrders.reduce((sum, o) => {
    const match = o.ai_reason?.match(/-\s*([^-]+?)\s*-\s*(\d+)\s*days/i);
    return sum + (match ? parseInt(match[2]) : 30);
  }, 0);

  const statusConfig = {
    pending: { label: 'Verification Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    approved: { label: 'Approved', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-black text-foreground">Billing & Subscription</h1>
      </div>

      {/* Current Plan */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-xl font-bold text-foreground">Current Plan</h2>
          {isPremium ? (
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> Premium Active
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-lg">
              No Active Plan
            </span>
          )}
        </div>
        {!isPremium && (
          <button className="btn-primary px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2 text-sm" onClick={() => navigate('/premium')}>
            Subscribe Now <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {isPremium && (
          <p className="text-sm text-muted-foreground font-medium">You have unlimited access to all features.</p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
            <p className="font-display text-2xl font-black text-foreground mt-1">{orders.length}</p>
          </div>
          <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
            <p className="font-display text-2xl font-black text-foreground mt-1">{completedOrders.length}</p>
          </div>
          <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Days</p>
            <p className="font-display text-2xl font-black text-foreground mt-1">{totalDays} days</p>
          </div>
          <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <p className="font-display text-2xl font-black text-foreground mt-1">PKR {totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Payment History</h2>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground font-medium">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">No orders yet.</p>
            <button className="btn-primary px-6 py-2 rounded-xl text-sm font-bold mt-4" onClick={() => navigate('/premium')}>Get Premium</button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Order ID</th>
                    <th className="text-left pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Plan</th>
                    <th className="text-left pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 font-mono font-bold text-primary">{order.transaction_id || `#${order.id?.substring(0, 8)}`}</td>
                        <td className="py-4 text-muted-foreground font-medium">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="py-4 font-medium text-foreground">
                          {order.ai_reason?.split(' - ')?.[1] || `Rs. ${order.plan_price} Plan`}
                        </td>
                        <td className="py-4 font-display font-bold text-foreground">PKR {order.plan_price?.toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${sc.bg} ${sc.color}`}>
                            <sc.icon className="w-3.5 h-3.5" />
                            {sc.label}
                          </span>
                          {order.status === 'rejected' && order.rejection_reason && (
                            <div className="mt-2 text-[10px] text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20 max-w-[200px]">
                              <span className="font-bold uppercase">Reason:</span> {order.rejection_reason}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {orders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                return (
                  <div key={order.id} className="bg-secondary/30 rounded-2xl p-5 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-sm">{order.transaction_id || `#${order.id?.substring(0, 8)}`}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                        <sc.icon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">
                        {order.ai_reason?.split(' - ')?.[1] || `Rs. ${order.plan_price} Plan`}
                      </span>
                      <span className="font-display font-bold text-foreground">PKR {order.plan_price?.toLocaleString()}</span>
                    </div>
                    {order.status === 'rejected' && order.rejection_reason && (
                      <div className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
                        <span className="font-bold uppercase">Reason:</span> {order.rejection_reason}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Need Help */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 shadow-md space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Need Help?</h2>
        <p className="text-sm text-muted-foreground font-medium">For payment issues or questions, reach out on WhatsApp:</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-secondary px-4 py-2.5 rounded-xl font-mono font-bold text-foreground border border-border flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            03337613822
          </span>
          <button 
            onClick={() => { navigator.clipboard.writeText('03337613822'); toast.success('Copied!'); }}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-secondary border border-border hover:border-primary/40 transition-colors"
          >
            <Copy className="w-4 h-4 inline mr-1" /> Copy
          </button>
          <a 
            href="https://wa.me/923337613822" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
          >
            Open WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
