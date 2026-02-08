'use client';

import React from 'react';
import { Player } from '@/lib/types';
import Card from './ui/Card';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  showRoles?: boolean;
  onVote?: (playerId: string) => void;
  votingMode?: boolean;
}

export default function PlayerList({
  players,
  currentPlayerId,
  showRoles = false,
  onVote,
  votingMode = false,
}: PlayerListProps) {
  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">Players ({players.length})</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between p-3 rounded-lg
              ${player.id === currentPlayerId ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800'}
              ${votingMode && player.id !== currentPlayerId ? 'cursor-pointer hover:bg-gray-700' : ''}
            `}
            onClick={() => votingMode && player.id !== currentPlayerId && onVote?.(player.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${player.ready ? 'bg-green-500' : 'bg-gray-600'}`} />
              <div>
                <p className="font-semibold">
                  {player.name}
                  {player.isHost && <span className="ml-2 text-yellow-400 text-sm">👑 Host</span>}
                  {player.id === currentPlayerId && <span className="ml-2 text-blue-400 text-sm">(You)</span>}
                </p>
                {showRoles && player.role && (
                  <p className={`text-sm ${player.role === 'saboteur' ? 'text-red-400' : 'text-blue-400'}`}>
                    {player.role === 'saboteur' ? '🔴 Saboteur' : '🔧 Fixer'}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{player.score}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
