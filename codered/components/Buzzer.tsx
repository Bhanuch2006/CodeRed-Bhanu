'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

interface BuzzerProps {
  onBuzz: () => void;
  disabled: boolean;
  buzzerPressed: boolean;
}

export default function Buzzer({ onBuzz, disabled, buzzerPressed }: BuzzerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBuzz = () => {
    if (!disabled && !buzzerPressed) {
      setIsAnimating(true);
      onBuzz();
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleBuzz}
        disabled={disabled || buzzerPressed}
        className={`
          w-32 h-32 rounded-full font-bold text-2xl transition-all duration-200
          ${buzzerPressed 
            ? 'bg-gray-600 cursor-not-allowed' 
            : disabled
            ? 'bg-gray-700 cursor-not-allowed opacity-50'
            : 'bg-codered-red hover:bg-red-700 hover:scale-110 active:scale-95 buzzer-pulse'
          }
          ${isAnimating ? 'scale-110' : ''}
        `}
      >
        {buzzerPressed ? 'BUZZED!' : 'BUZZ'}
      </button>
      
      {buzzerPressed && (
        <p className="text-yellow-400 font-semibold animate-pulse">
          Buzzer has been pressed!
        </p>
      )}
    </div>
  );
}
