import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Bot, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { generateCompletion } from '@/lib/aiClient';
import { useNavigate } from 'react-router-dom';

const SYSTEM_PROMPT = `You are an expert NAT (National Aptitude Test) preparation assistant for Pakistani students. You have deep knowledge of ALL NAT groups including the newly added NAT-ICOM (Commerce).

## About NAT (National Aptitude Test)
- NAT is conducted by the **National Testing Service (NTS)** of Pakistan
- It is required for admission to universities across Pakistan
- There are multiple NAT types:
  - **NAT-IE** (Pre-Engineering): English (20), Analytical (20), Quantitative (20), Physics (10), Chemistry (10), Mathematics (10) = 90 MCQs, 120 minutes
  - **NAT-IM** (Pre-Medical): English (20), Analytical (20), Quantitative (20), Physics (8), Chemistry (8), Biology (14) = 90 MCQs, 120 minutes
  - **NAT-ICS** (Computer Science): English (20), Analytical (20), Quantitative (20), Physics (10), Computer Science (10), Mathematics (10) = 90 MCQs, 120 minutes
  - **NAT-ICOM** (Commerce): English (20), Analytical (20), Quantitative (20), Commerce (10), Accounting (10), Economics (10) = 90 MCQs, 120 minutes
- Each correct answer: **+1 mark**, Wrong answer: **−0.25 (negative marking)**
- Minimum passing score varies by university (usually 50-60%)
- Test is offered multiple times per year at NTS centers across Pakistan

## Subjects You Help With:
- **English**: Grammar (tenses, prepositions, articles), Vocabulary (synonyms, antonyms), Analogies, Sentence completion, Reading comprehension
- **Analytical Reasoning**: Number series, Letter patterns, Blood relations, Seating arrangements, Logical deduction, Statement-conclusion
- **Quantitative Reasoning**: Arithmetic (%, ratio, profit/loss, speed-distance-time), Algebra, Geometry, Basic statistics
- **Physics**: Mechanics, Waves & Optics, Electricity & Magnetism, Thermodynamics, Modern Physics
- **Chemistry**: Atomic structure, Periodic table, Chemical bonding, Reactions, Stoichiometry, Organic chemistry
- **Mathematics**: Calculus, Trigonometry, Algebra, Coordinate geometry, Sequences & Series, Matrices
- **Biology**: Cell biology, Genetics, Human physiology, Plant biology, Ecology, Biochemistry
- **Computer Science**: Programming fundamentals, Data structures, Algorithms, Databases, Networking, OOP
- **Commerce (NAT-ICOM)**: Trade documents (invoice, bill of lading, letter of credit), Types of trade (home/foreign/entrepot), Business organizations (sole trader, partnership, company, cooperative), Banking (types, functions, cheques, drafts), Insurance (marine, fire, life, key person), Stock exchange, E-commerce, Channels of distribution, Consumer protection
- **Accounting (NAT-ICOM)**: Accounting equation (Assets=Liabilities+Capital), Double-entry bookkeeping (debit/credit rules), Journal, Ledger, Trial balance, Trading & Profit-Loss account, Balance sheet, Depreciation (straight-line & reducing balance), FIFO/LIFO/AVCO stock valuation, Bank reconciliation, Accruals & prepayments, Cash flow statement, Financial ratios (current ratio, quick ratio, ROCE, profit margin), Accounting concepts (going concern, accrual, consistency, prudence, historical cost), Partnership accounts (appropriation), Budgeting
- **Economics (NAT-ICOM)**: Microeconomics (demand, supply, elasticity, market structures: perfect competition, monopoly, oligopoly, consumer/producer surplus, externalities, public goods, market failure, indifference curves, PPF, comparative advantage), Macroeconomics (GDP, GNP, GDP per capita, inflation, deflation, unemployment types — cyclical/frictional/structural, business cycle, fiscal policy, monetary policy, circular flow, aggregate demand/supply, Phillips curve, multiplier), International economics (exchange rates, balance of payments, trade balance, free trade, tariffs, WTO/IMF), Pakistani economy (SBP, cotton/textile exports, GST, remittances, CPEC), Development economics (sustainable development, Gini coefficient)

## NAT-ICOM Exam Pattern Insights:
- Commerce questions focus on: trade terminology, trade documents, types of business organizations, banking instruments, insurance principles
- Accounting questions focus on: accounting equation, journal/ledger/trial balance, final accounts (trading a/c, P&L, balance sheet), depreciation, stock valuation, key accounting concepts
- Economics questions focus on: demand & supply laws, elasticity, market structures, GDP/GNP, inflation, unemployment, fiscal vs monetary policy, international trade

## Rules:
- Keep answers concise and exam-focused
- Use headings, bullet points, and bold text in markdown for clarity
- For fill-in-the-blank style NAT questions, clearly identify the answer word
- Give examples relevant to NAT MCQ format when helpful
- If asked non-NAT topics, politely redirect to exam prep
- Respond in a friendly, encouraging tone for Pakistani students
- For MCQ questions, explain the correct answer and why other options are wrong
- When solving math/science/accounting problems, show step-by-step working
- For Economics, relate concepts to Pakistan's economy where relevant`;

const MAX_MESSAGES = 6;

export default function ChatBot({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const isPremium = user?.is_premium;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg].slice(-MAX_MESSAGES);
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamingText('Thinking...');

    const conversationHistory = newMessages
      .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationHistory}\n\nRespond as the Assistant:`;

    const result = await generateCompletion(fullPrompt);

    const assistantMsg = { role: 'assistant', content: result };
    setMessages(prev => [...prev, assistantMsg].slice(-MAX_MESSAGES));
    setStreamingText('');
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingText('');
  };

  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const atLimit = userMsgCount >= MAX_MESSAGES / 2;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">NAT AI Assistant</p>
              <p className="text-xs text-primary">✦ Premium Feature</p>
            </div>
            <button onClick={clearChat} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Premium gate */}
          {!isPremium ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">Premium Feature</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  The AI Assistant is exclusive to Premium members. Upgrade to get instant answers to all your NAT questions.
                </p>
              </div>
              <Button
                className="bg-primary text-white w-full"
                onClick={() => { navigate('/premium'); setOpen(false); }}
              >
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && !streamingText && (
                  <div className="text-center pt-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Entry Hive Assistant</p>
                    <p className="text-xs text-muted-foreground px-4">Ask me anything about NAT subjects — Physics, Commerce, Accounting, Economics, English, Reasoning & more!</p>
                    <div className="flex flex-wrap gap-2 justify-center px-2">
                      {["Accounting equation explained", 'Law of demand & supply', 'English grammar tips', 'Solve: 3x + 5 = 14'].map(s => (
                        <button
                          key={s}
                          onClick={() => { setInput(s); inputRef.current?.focus(); }}
                          className="text-xs bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 px-2 py-1 rounded-full transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-secondary rounded-bl-sm'}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:my-1 [&_li]:my-0 [&_p]:my-1 [&_strong]:text-primary">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                      {streamingText === 'Thinking...' ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{streamingText}</p>
                      )}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {atLimit && (
                <div className="px-3 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-center">
                  <p className="text-xs text-amber-400">Limit reached — <button onClick={clearChat} className="underline">clear to continue</button></p>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || atLimit}
                    placeholder={atLimit ? 'Chat limit reached...' : 'Ask about NAT topics...'}
                    rows={1}
                    className="flex-1 resize-none bg-secondary rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary/50 placeholder:text-muted-foreground disabled:opacity-50 max-h-24"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-xl"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading || atLimit}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}