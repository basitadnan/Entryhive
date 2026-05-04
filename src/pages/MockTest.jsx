import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Clock, AlertTriangle } from 'lucide-react';

export default function MockTest() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;
  const mockCount = user?.mock_count || 0;
  const canAccess = isPremium || mockCount < 1;

  const groupLabel = {
    'NAT-IE': 'Pre-Engineering',
    'NAT-IM': 'Pre-Medical',
    'NAT-ICS': 'Computer Science',
  }[user?.nat_group] || '';

  const handleStart = () => {
    if (!canAccess) {
      navigate('/premium');
      return;
    }
    navigate('/mock-test-session');
  };

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-xl font-bold">Mock Test</h1>
          <p className="text-sm text-muted-foreground">Full NAT-I exam simulation</p>
        </div>
      </div>

      {!canAccess && (
        <Card className="p-3 bg-amber-500/10 border-amber-500/30">
          <p className="text-sm text-amber-400">🔒 You've used your free mock test. <button onClick={() => navigate('/premium')} className="underline font-semibold">Get Premium</button> for unlimited access.</p>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Test Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Group</span>
            <span className="text-sm font-medium">{groupLabel}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Total Questions</span>
            <span className="text-sm font-medium">90 MCQs</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Time Limit</span>
            <span className="text-sm font-medium">120 Minutes</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Sections</span>
            <span className="text-sm font-medium">English, Analytical, Quantitative, Subject</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Marking</span>
            <span className="text-sm font-medium">No negative marking</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-400">Important Instructions</p>
            <ul className="text-muted-foreground mt-2 space-y-1 list-disc list-inside text-xs">
              <li>Once started, the timer cannot be paused</li>
              <li>You can navigate between questions</li>
              <li>Unanswered questions count as wrong</li>
              <li>Review your answers before submitting</li>
            </ul>
          </div>
        </div>
      </Card>

      <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-semibold" onClick={handleStart}>
        <Clock className="w-4 h-4 mr-2" /> Start Mock Test (120 min)
      </Button>
    </div>
  );
}