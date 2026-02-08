'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PlayerList from '@/components/PlayerList';
import { getSocket } from '@/lib/socket';
import { Player } from '@/lib/types';
import { GAME_CONSTANTS } from '@/lib/constants';

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.room as string;
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setCurrentPlayerId(socket.id || '');

    socket.emit('get-room-state', { roomId });

    socket.on('room-state', ({ players: roomPlayers, hostId }) => {
      setPlayers(roomPlayers);
      setIsHost(socket.id === hostId);
    });

    socket.on('player-joined', ({ player }) => {
      setPlayers((prev) => [...prev, player]);
    });

    socket.on('player-left', ({ playerId }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });

    socket.on('player-ready', ({ playerId, ready }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ready } : p))
      );
    });

    socket.on('game-starting', () => {
      router.push(`/game/${roomId}`);
    });

    return () => {
      socket.off('room-state');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('player-ready');
      socket.off('game-starting');
    };
  }, [roomId, router]);

  const handleToggleReady = () => {
    const socket = getSocket();
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit('toggle-ready', { roomId, ready: newReady });
  };

  const handleStartGame = () => {
    if (players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      alert(`Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`);
      return;
    }

    const allReady = players.every((p) => p.ready || p.isHost);
    if (!allReady) {
      alert('All players must be ready');
      return;
    }

    const socket = getSocket();
    socket.emit('start-game', { roomId });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && 
                   players.length >= GAME_CONSTANTS.MIN_PLAYERS && 
                   players.every((p) => p.ready || p.isHost);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Game Lobby</h1>
          <Card className="inline-block">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Room Code</p>
                <p className="text-3xl font-bold tracking-wider">{roomId}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyRoomCode}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              showRoles={false}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Game Settings</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Players</span>
                  <span className="font-semibold">{GAME_CONSTANTS.MAX_PLAYERS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rounds</span>
                  <span className="font-semibold">{GAME_CONSTANTS.DEFAULT_ROUNDS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Round Time</span>
                  <span className="font-semibold">{GAME_CONSTANTS.DEFAULT_ROUND_DURATION}s</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">Ready Check</h3>
              {!isHost && (
                <Button
                  variant={isReady ? 'success' : 'primary'}
                  size="lg"
                  className="w-full"
                  onClick={handleToggleReady}
                >
                  {isReady ? '✓ Ready' : 'Ready Up'}
                </Button>
              )}
              
              {isHost && (
                <div className="space-y-3">
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={handleStartGame}
                    disabled={!canStart}
                  >
                    Start Game
                  </Button>
                  {!canStart && (
                    <p className="text-sm text-gray-400 text-center">
                      {players.length < GAME_CONSTANTS.MIN_PLAYERS
                        ? `Need ${GAME_CONSTANTS.MIN_PLAYERS - players.length} more player(s)`
                        : 'Waiting for all players to ready up'}
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">Quick Guide</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Fixers try to fix bugs</p>
                <p>• Saboteurs try to prevent fixes</p>
                <p>• Press buzzer to submit code</p>
                <p>• Vote for suspected saboteurs</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
