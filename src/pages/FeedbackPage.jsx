import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Bug, Lightbulb, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const types = [
  { id: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
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
      status: 'new',
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Thank You!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">Your {type} has been submitted. We review all submissions and appreciate your help in improving NAT Prep!</p>
          <Button className="bg-primary mt-2" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const selectedType = types.find(t => t.id === type);

  return (
    <div className="p-4 space-y-5 pb-10">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold">Send Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">Help us improve NAT Prep for everyone</p>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${type === t.id ? t.bg : 'border-border hover:border-primary/30'}`}
          >
            <t.icon className={`w-5 h-5 mx-auto mb-1 ${type === t.id ? t.color : 'text-muted-foreground'}`} />
            <p className={`text-xs font-semibold ${type === t.id ? t.color : 'text-muted-foreground'}`}>{t.label}</p>
          </button>
        ))}
      </div>

      {/* Message */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <selectedType.icon className={`w-4 h-4 ${selectedType.color}`} />
          <p className="font-semibold text-sm">{selectedType.label}</p>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={
            type === 'bug' ? 'Describe the bug — what happened and what you expected...'
            : type === 'suggestion' ? 'Share your idea or suggestion for improving the app...'
            : 'Share your experience, what you love, or what could be better...'
          }
          rows={6}
          className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground text-right">{message.length} characters</p>
      </Card>

      <Button className="w-full h-12 bg-primary font-semibold rounded-xl" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </div>
  );
}