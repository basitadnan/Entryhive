import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const { signUp, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);
  
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    const { error } = await signUp(form.email.trim(), form.password, form.fullName.trim());
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! You can now sign in.');
      navigate('/login');
    }
    setLoading(false);
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['bg-muted', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'][strength];
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center bg-card">
              <img src="/logo.png" alt="Entry Hive Logo" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 10v6M2 10l10-5 10 5-10 5z'/%3E%3Cpath d='M6 12v5c3 3 9 3 12 0v-5'/%3E%3C/svg%3E"; e.target.className="w-6 h-6" }} />
            </div>
            <span className="font-display text-3xl font-black tracking-tight text-foreground">
              NAT<span className="text-primary">Prep</span>
            </span>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl">
          <div className="text-center space-y-2 mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground font-medium">Join Pakistan's #1 Entry Hive platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="flex items-center gap-2 px-1 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 3) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed mt-2 font-medium">
              By creating an account, you agree to our{' '}
              <Link to="/legal" className="text-primary hover:underline underline-offset-4">Privacy Policy & Terms of Service</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 bg-secondary border border-border hover:bg-secondary/80 hover:border-primary/30 transition-all rounded-xl flex items-center justify-center gap-3 font-bold text-foreground shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-border">
            <p className="text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="mt-8 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}
