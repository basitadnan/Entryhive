import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/lib/dbClient';

export default function FeedbackPopup({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const hasSeen = localStorage.getItem('has_seen_general_review_popup');
    const loginCount = parseInt(localStorage.getItem('login_count') || '0', 10);
    
    if (!hasSeen && loginCount >= 2) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('has_seen_general_review_popup', 'true');
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating first!');
      return;
    }
    if (!message.trim() || message.length < 5) {
      toast.error('Please write a quick review!');
      return;
    }
    
    setLoading(true);
    try {
      const finalMessage = `[Rating: ${rating}/5 Stars]\n\n${message.trim()}`;
      
      await base44.entities.Feedback.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        type: 'popup_feedback',
        message: finalMessage,
      });
      
      toast.success('Thank you for your feedback!');
      handleClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="p-6 relative">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              
              <h2 className="text-xl font-bold font-display mb-1">How are we doing? 🚀</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We'd love a general review! Let us know what you like, any problems you're facing, or features you want added.
              </p>
              
              <div className="flex gap-2 mb-4 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Share your thoughts... (e.g., I love X, but I wish you added Y, and I found a bug in Z)"
                rows={4}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4" /> Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
