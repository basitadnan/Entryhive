import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const result = await loginWithPassword(email.trim(), password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.error?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

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
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue preparing</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold gap-2 glow-primary"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-border/30">
            <p className="text-sm text-muted-foreground pt-4">
              New here?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">Create Account</Link>
            </p>
          </div>
        </Card>

        <button
          onClick={() => navigate('/')}
          className="mt-8 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mx-auto transition-colors"
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}
