import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
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
  const strengthColor = ['bg-muted', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'][strength];
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-animation" />
      <div className="bg-orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/30 flex items-center justify-center glow-primary">
              <img src="./logo.png" alt="NAT Prep Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient">NAT</span>
              <span className="text-foreground">Prep</span>
            </span>
          </div>
        </div>

        <Card className="p-8 space-y-6 glass-card rounded-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join Pakistan's #1 NAT Prep platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full Name" className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email Address" className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  className="pl-11 pr-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold gap-2 glow-primary mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithGoogle()}
              className="w-full h-12 rounded-xl border-border/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3 font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-border/30">
            <p className="text-sm text-muted-foreground pt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </Card>

        <button onClick={() => navigate('/')} className="mt-8 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}
