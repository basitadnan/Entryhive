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
  const { signUp } = useAuth();
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
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center glow-primary">
              <span className="text-primary font-extrabold text-lg">N</span>
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
