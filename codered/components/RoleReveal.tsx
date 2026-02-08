'use client';

import React from 'react';
import Modal from './ui/Modal';
import { PlayerRole } from '@/lib/types';

interface RoleRevealProps {
  isOpen: boolean;
  role: PlayerRole;
  task: string;
}

export default function RoleReveal({ isOpen, role, task }: RoleRevealProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Your Role" showCloseButton={false}>
      <div className="text-center space-y-6">
        <div className={`text-8xl ${role === 'saboteur' ? 'animate-pulse' : ''}`}>
          {role === 'saboteur' ? '🔴' : '🔧'}
        </div>
        
        <div>
          <h3 className={`text-3xl font-bold mb-2 ${role === 'saboteur' ? 'text-red-500' : 'text-blue-500'}`}>
            {role === 'saboteur' ? 'SABOTEUR' : 'FIXER'}
          </h3>
          <p className="text-gray-300">
            {role === 'saboteur' 
              ? 'Your goal is to prevent bugs from being fixed without getting caught!'
              : 'Your goal is to fix the bug in the code!'
            }
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Current Task:</h4>
          <p className="text-sm text-gray-300">{task}</p>
        </div>

        <div className="text-sm text-gray-400">
          <p>Game starting in a few seconds...</p>
        </div>
      </div>
    </Modal>
  );
}
