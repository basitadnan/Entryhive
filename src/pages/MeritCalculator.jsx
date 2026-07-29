import React, { useState } from 'react';
import { Calculator, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MeritCalculator() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Calculator className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Merit Calculator</h1>
          <p className="text-sm text-muted-foreground">Calculate your university admission merit with ease</p>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Check Your Merit</p>
            <p className="text-xs text-muted-foreground">Enter your scores below to see where you stand for university admissions</p>
          </div>
        </div>
      </motion.div>

      {/* Iframe Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden"
      >
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 bg-background">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading Merit Calculator...</p>
          </div>
        )}

        <iframe
          src="https://unicalc.csconnect.pk/#universities"
          title="UniCalc Merit Calculator"
          className="w-full border-0"
          style={{ 
            height: '80vh', 
            minHeight: '600px',
            display: isLoading ? 'none' : 'block'
          }}
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write"
        />
      </motion.div>

      {/* Powered By Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-secondary/50 rounded-xl p-4 text-center border border-border"
      >
        <a 
          href="https://unicalc.csconnect.pk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors group"
        >
          <span>Powered by</span>
          <span className="font-bold text-foreground group-hover:text-emerald-500 transition-colors">UniCalc</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
        <p className="text-xs text-muted-foreground/60 mt-1">Merit calculation tool provided by CSConnect</p>
      </motion.div>
    </div>
  );
}
