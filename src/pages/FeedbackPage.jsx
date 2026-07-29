import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, MessageSquare, Bug, Lightbulb, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const types = [
  { id: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', borderActive: 'border-blue-500/40' },
  { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-500/10', borderActive: 'border-rose-500/40' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10', borderActive: 'border-amber-500/40' },
];

export default function FeedbackPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }
    setLoading(true);
    await base44.entities.Feedback.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      type,
      message: message.trim(),
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center bg-card rounded-3xl border border-border shadow-sm"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">Thank You!</h2>
          <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">Your {type} has been submitted. We review all submissions and appreciate your help in improving Entry Hive!</p>
          <button className="btn-primary w-full max-w-xs py-3.5 rounded-xl font-bold" onClick={() => navigate('/')}>Go Home</button>
        </motion.div>
      </div>
    );
  }

  const selectedType = types.find(t => t.id === type);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <MessageSquare className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Send Feedback</h1>
          <p className="text-sm text-muted-foreground">Help us improve Entry Hive for everyone</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-3">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`p-4 rounded-2xl border-2 text-center transition-all group ${type === t.id ? `${t.bg} ${t.borderActive}` : 'border-border hover:border-primary/30 bg-card'}`}
          >
            <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center mx-auto mb-2`}>
              <t.icon className={`w-5 h-5 ${type === t.id ? t.color : 'text-muted-foreground group-hover:text-foreground'}`} />
            </div>
            <p className={`text-xs font-bold ${type === t.id ? t.color : 'text-muted-foreground group-hover:text-foreground'}`}>{t.label}</p>
          </button>
        ))}
      </div>

      {/* Message */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${selectedType.bg} flex items-center justify-center`}>
            <selectedType.icon className={`w-4 h-4 ${selectedType.color}`} />
          </div>
          <p className="font-display font-bold text-foreground">{selectedType.label}</p>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={
            type === 'bug' ? 'Describe the bug — what happened and what you expected...'
            : type === 'suggestion' ? 'Share your idea or suggestion for improving the app...'
            : 'Share your experience, what you love, or what could be better...'
          }
          rows={7}
          className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{message.length} characters</p>
          {message.length >= 10 && <p className="text-xs text-green-500 font-bold">✓ Ready to submit</p>}
        </div>
      </div>

      <button 
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-lg disabled:opacity-50" 
        onClick={handleSubmit} 
        disabled={loading}
      >
        <Send className="w-5 h-5" />
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}