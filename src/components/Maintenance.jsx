import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Hammer, Clock, Globe } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full space-y-8 z-10"
      >
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 backdrop-blur-xl mx-auto shadow-2xl shadow-primary/20"
          >
            <Hammer className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-background"
          />
        </div>

        <div className="space-y-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            Upgrade in Progress
          </motion.h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            We are performing essential maintenance to improve your experience. 
            Entry Hive will be back online shortly with new features and better stability.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Estimated Time</h3>
            <p className="text-xs text-muted-foreground mt-1">~ 1-2 Hours</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Status</h3>
            <p className="text-xs text-muted-foreground mt-1">Security Update</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Globe className="w-5 h-5 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Platform</h3>
            <p className="text-xs text-muted-foreground mt-1">Web & App</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-white/5 flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground">Follow us for updates</p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors border border-white/10">
              <span className="sr-only">Twitter</span>
              <div className="w-5 h-5 bg-white/20 rounded-sm" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors border border-white/10">
              <span className="sr-only">Facebook</span>
              <div className="w-5 h-5 bg-white/20 rounded-sm" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Floating Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5
          }}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  );
}
