import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';

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

  const rankBadge = (rank) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 text-center text-sm font-bold text-muted-foreground">#{rank + 1}</span>;
  };

  const rankCardColor = (rank) => {
    if (rank === 0) return 'border-amber-400/40 bg-amber-500/5';
    if (rank === 1) return 'border-slate-400/30 bg-slate-500/5';
    if (rank === 2) return 'border-amber-700/30 bg-amber-700/5';
    return '';
  };

  const myRank = leaderboard.findIndex(e => e.email === user?.email);

  return (
    <div className="p-4 space-y-5 pb-10">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top mock test scores across all students</p>
        </div>
      </div>

      {/* My Rank Banner */}
      {myRank >= 0 && (
        <Card className="p-4 bg-primary/5 border-primary/30">
          <p className="text-sm font-semibold text-primary">
            🎯 Your rank: #{myRank + 1} &nbsp;·&nbsp; Best score: {leaderboard[myRank].score}%
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No scores yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete a mock test to appear on the leaderboard!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, rank) => (
            <Card
              key={entry.email}
              className={`p-4 border-2 ${rankCardColor(rank)} ${entry.email === user?.email ? 'ring-2 ring-primary/40' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 shrink-0">
                  {rankBadge(rank)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">
                    {entry.name} {entry.email === user?.email && <span className="text-primary text-xs">(You)</span>}
                  </p>
                  {entry.nat_group && (
                    <p className="text-xs text-muted-foreground">{entry.nat_group}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-bold ${rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-amber-700' : 'text-primary'}`}>
                    {entry.score}%
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.correct}/{entry.total} correct</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-3 bg-secondary/50 text-center">
        <p className="text-xs text-muted-foreground">🏆 Scores update in real-time. Complete a mock test to compete!</p>
      </Card>
    </div>
  );
}