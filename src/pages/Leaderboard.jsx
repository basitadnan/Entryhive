import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, Trophy, Medal, Crown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const { data: allResults = [], isLoading } = useQuery({
    queryKey: ['leaderboard-results'],
    queryFn: () => base44.entities.MockTestResult.filter({ completed: true }),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['leaderboard-users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Get best score per user
  const userBestScores = {};
  allResults.forEach(r => {
    const email = r.user_email;
    if (!userBestScores[email] || r.score_percentage > userBestScores[email].score) {
      userBestScores[email] = {
        score: r.score_percentage,
        nat_group: r.nat_group,
        correct: r.correct_answers,
        total: r.total_questions,
      };
    }
  });

  // Build leaderboard entries
  const leaderboard = Object.entries(userBestScores)
    .map(([email, data]) => {
      const u = allUsers.find(u => u.email === email);
      return {
        email,
        name: u?.full_name || email.split('@')[0],
        score: data.score,
        nat_group: data.nat_group,
        correct: data.correct,
        total: data.total,
      };
    })
    .sort((a, b) => b.score - a.score);

  const myRank = leaderboard.findIndex(e => e.email === user?.email);
  
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const getRankColors = (rank) => {
    if (rank === 0) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', icon: <Crown className="w-6 h-6 text-amber-500" /> };
    if (rank === 1) return { bg: 'bg-slate-300/10', border: 'border-slate-300/30', text: 'text-slate-400', icon: <Medal className="w-6 h-6 text-slate-400" /> };
    if (rank === 2) return { bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-700', icon: <Medal className="w-6 h-6 text-amber-700" /> };
    return { bg: 'bg-card', border: 'border-border', text: 'text-muted-foreground', icon: <span className="font-bold text-muted-foreground">#{rank + 1}</span> };
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Global Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top mock test performers across all groups</p>
        </div>
      </div>

      {/* My Rank Banner */}
      {myRank >= 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              #{myRank + 1}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Your Current Rank</p>
              <p className="text-xs text-muted-foreground">Best Score: {leaderboard[myRank].score}%</p>
            </div>
          </div>
          <Target className="w-5 h-5 text-primary opacity-50" />
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-background">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No Scores Yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to complete a mock test and claim the #1 spot!</p>
          <button onClick={() => navigate('/mock-test')} className="btn-primary py-2.5 px-6 rounded-xl">
            Take Mock Test
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {top3.map((entry, idx) => {
                const colors = getRankColors(idx);
                // Reorder visually for mobile (1, 2, 3) vs desktop (2, 1, 3)
                const orderClass = idx === 0 ? 'sm:order-2 sm:-translate-y-4' : idx === 1 ? 'sm:order-1' : 'sm:order-3';
                
                return (
                  <motion.div 
                    key={entry.email}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative bg-card rounded-3xl border-2 ${colors.border} p-6 flex flex-col items-center text-center shadow-sm overflow-hidden ${orderClass} ${entry.email === user?.email ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  >
                    <div className={`absolute top-0 w-full h-1 ${colors.bg}`}></div>
                    
                    <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mb-4`}>
                      {colors.icon}
                    </div>
                    
                    <h3 className="font-bold text-foreground text-lg line-clamp-1 mb-1">
                      {entry.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 bg-secondary px-2 py-1 rounded-full">{entry.nat_group}</p>
                    
                    <div className="mt-auto">
                      <p className={`font-display text-3xl font-bold ${colors.text}`}>{entry.score}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{entry.correct}/{entry.total} Correct</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rest of Leaderboard */}
          {others.length > 0 && (
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              {others.map((entry, idx) => {
                const rank = idx + 3;
                const isMe = entry.email === user?.email;
                
                return (
                  <div 
                    key={entry.email} 
                    className={`flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${isMe ? 'bg-primary/5' : ''}`}
                  >
                    <div className="w-8 flex justify-center text-muted-foreground font-bold">
                      #{rank + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate text-sm">
                        {entry.name} {isMe && <span className="text-primary text-xs ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{entry.nat_group}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-foreground">{entry.score}%</p>
                      <p className="text-xs text-muted-foreground">{entry.correct}/{entry.total}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border">
        <p className="text-xs text-muted-foreground">🏆 Leaderboard updates in real-time. Practice hard to climb the ranks!</p>
      </div>
    </div>
  );
}