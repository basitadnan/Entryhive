import React from 'react';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield } from 'lucide-react';

export default function MockLogin() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Test Preview Login</h1>
          <p className="text-sm text-muted-foreground">Select a test account to preview the app features.</p>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-14 justify-start gap-4 hover:bg-primary/10 border-border/50"
            onClick={() => base44.auth.mockLogin('free@test.com')}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Free User</p>
              <p className="text-xs text-muted-foreground">free@test.com</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-14 justify-start gap-4 hover:bg-amber-500/10 border-amber-500/20"
            onClick={() => base44.auth.mockLogin('premium@test.com')}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-amber-500">Premium Admin</p>
              <p className="text-xs text-muted-foreground">premium@test.com</p>
            </div>
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          Note: This is a mock login screen for preview mode. No password required.
        </p>
      </Card>
    </div>
  );
}
