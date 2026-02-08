'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'red' | 'blue' | 'none';
}

export default function Card({ children, className = '', glow = 'none' }: CardProps) {
  const glowStyles = {
    red: 'glow-red',
    blue: 'glow-blue',
    none: '',
  };
  
  return (
    <div className={`bg-codered-gray border border-gray-700 rounded-lg p-6 ${glowStyles[glow]} ${className}`}>
      {children}
    </div>
  );
}
