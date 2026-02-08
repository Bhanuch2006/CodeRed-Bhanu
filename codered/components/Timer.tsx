'use client';

import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onComplete?: () => void;
  startTime: number;
}

export default function Timer({ duration, onComplete, startTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0 && onComplete) {
        onComplete();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, startTime, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  const getColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">Time Remaining</span>
        <span className={`text-2xl font-bold ${percentage <= 25 ? 'text-red-500 animate-pulse' : ''}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
