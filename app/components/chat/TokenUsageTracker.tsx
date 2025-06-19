import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenUsage {
  hourlyTokensUsed: number;
  lastResetHour: string;
}

interface TokenUsageTrackerProps {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  onUpgradeClick?: () => void;
}

export default function TokenUsageTracker({ 
  promptTokens = 0, 
  completionTokens = 0, 
  totalTokens = 0,
  onUpgradeClick 
}: TokenUsageTrackerProps) {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ hourlyTokensUsed: 0, lastResetHour: '' });

  // Initialize token usage from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tokenUsage');
      if (stored) {
        const parsed = JSON.parse(stored) as TokenUsage;
        const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH format
        
        // Reset if it's a new hour (for tracking purposes only)
        if (parsed.lastResetHour !== currentHour) {
          const newUsage = { hourlyTokensUsed: 0, lastResetHour: currentHour };
          setTokenUsage(newUsage);
          localStorage.setItem('tokenUsage', JSON.stringify(newUsage));
        } else {
          setTokenUsage(parsed);
        }
      } else {
        const currentHour = new Date().toISOString().slice(0, 13);
        const initialUsage = { hourlyTokensUsed: 0, lastResetHour: currentHour };
        setTokenUsage(initialUsage);
        localStorage.setItem('tokenUsage', JSON.stringify(initialUsage));
      }
    } catch (error) {
      console.error('Error parsing token usage from localStorage:', error);
      // Reset to default values if parsing fails
      const currentHour = new Date().toISOString().slice(0, 13);
      const initialUsage = { hourlyTokensUsed: 0, lastResetHour: currentHour };
      setTokenUsage(initialUsage);
      localStorage.setItem('tokenUsage', JSON.stringify(initialUsage));
    }
  }, []);

  // Update token usage when new tokens are used (for tracking purposes only)
  useEffect(() => {
    if (totalTokens > 0) {
      try {
        const newUsage = {
          ...tokenUsage,
          hourlyTokensUsed: tokenUsage.hourlyTokensUsed + totalTokens
        };
        setTokenUsage(newUsage);
        localStorage.setItem('tokenUsage', JSON.stringify(newUsage));
      } catch (error) {
        console.error('Error updating token usage:', error);
      }
    }
  }, [totalTokens]);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      window.location.href = '/pricing';
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500 shadow-lg rounded-lg relative w-full max-w-chat mx-auto z-prompt p-3 mb-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="i-ph:brain text-green-400"></div>
              <span className="text-sm font-medium text-green-400">
                🎉 UNLIMITED TOKENS!
                <span className="text-xs text-green-300 ml-2">({tokenUsage.hourlyTokensUsed.toLocaleString()} used this hour)</span>
              </span>
            </div>
            <div className="text-green-400 text-xs font-semibold px-3 py-1 rounded bg-green-900/30">
              🚀 UNLIMITED
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
} 