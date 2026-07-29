import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Send, Bot, Lock, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateCompletion } from '@/lib/aiClient';

const SYSTEM_PROMPT = `You are an expert NAT (National Aptitude Test) preparation assistant for Pakistani students. Keep answers concise and exam-focused. Use plain text formatting. Respond in a friendly, encouraging tone.`;

export default function ChatbotPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const isPremium = user?.is_premium;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = updated
        .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationHistory}\n\nRespond as the Assistant:`;
      const result = await generateCompletion(fullPrompt);

      setMessages(prev => [...prev, { role: 'assistant', content: result || 'No response received.' }]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-12 sm:p-20 text-center space-y-8 bg-card rounded-3xl border-2 border-border shadow-xl relative overflow-hidden w-full"
        >
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center shadow-lg border-2 border-amber-500/20">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="font-display text-3xl font-black text-foreground">NAT Tutor <span className="text-amber-500">Pro</span></h2>
            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              The AI Assistant is exclusive to Premium members. Upgrade to get instant answers to all your NAT questions.
            </p>
          </div>
          <button 
            className="bg-amber-500 text-white h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl hover:bg-amber-600 transition-colors relative z-10 flex items-center gap-2" 
            onClick={() => navigate('/premium')}
          >
            Upgrade to Premium <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Premium chat UI
  return (
    <div className="flex flex-col p-4 sm:p-6" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-card rounded-3xl border-2 border-border shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-foreground">NAT Tutor</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <p className="text-xs font-bold text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <button 
            onClick={clearChat} 
            className="p-2.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black mb-2">How can I help?</h2>
                <p className="text-sm text-muted-foreground font-medium">Ask me anything about NAT subjects</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {["Accounting equation", "Demand & supply", "English grammar tips", "Solve: 3x + 5 = 14"].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="p-3 text-sm font-bold bg-secondary border border-border hover:border-primary/40 rounded-xl transition-all text-foreground text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : 'bg-secondary border border-border text-foreground rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask about NAT topics..."
              rows={1}
              className="flex-1 resize-none bg-secondary rounded-xl px-4 py-3 text-sm font-medium outline-none border border-border focus:border-primary/50 placeholder:text-muted-foreground disabled:opacity-50 max-h-28"
            />
            <button
              className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !loading 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-secondary border border-border text-muted-foreground cursor-not-allowed'
              }`}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
