'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CodeEditor from '@/components/CodeEditor';
import Buzzer from '@/components/Buzzer';
import PlayerList from '@/components/PlayerList';
import Timer from '@/components/Timer';
import RoleReveal from '@/components/RoleReveal';
import ActivityFeed from '@/components/ActivityFeed';
import { getSocket } from '@/lib/socket';
import { Player, BugTask, ActivityLog, PlayerRole } from '@/lib/types';

export default function GamePage() {
  const params = useParams();
  const roomId = params.room as string;
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [currentRole, setCurrentRole] = useState<PlayerRole | null>(null);
  const [currentTask, setCurrentTask] = useState<BugTask | null>(null);
  const [code, setCode] = useState('');
  const [roundNumber, setRoundNumber] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [gameState, setGameState] = useState<string>('role-reveal');
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [buzzerPlayerId, setBuzzerPlayerId] = useState<string | null>(null);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [roundDuration, setRoundDuration] = useState(180);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [votedFor, setVotedFor] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    setCurrentPlayerId(socket.id || '');

    socket.emit('get-game-state', { roomId });

    socket.on('game-state', (state) => {
      setPlayers(state.players);
      setCurrentTask(state.currentTask);
      setCode(state.currentTask?.code || '');
      setRoundNumber(state.roundNumber);
      setMaxRounds(state.maxRounds);
      setGameState(state.state);
      setBuzzerPressed(state.buzzerPressed);
      setBuzzerPlayerId(state.buzzerPlayerId);
      setRoundStartTime(state.roundStartTime || Date.now());
      setRoundDuration(state.roundDuration);
      
      const currentPlayer = state.players.find((p: Player) => p.id === socket.id);
      if (currentPlayer?.role) {
        setCurrentRole(currentPlayer.role);
      }
    });

    socket.on('role-assigned', ({ role }) => {
      setCurrentRole(role);
      setShowRoleReveal(true);
      setTimeout(() => setShowRoleReveal(false), 5000);
    });

    socket.on('round-started', ({ task, startTime, duration, roundNumber: rn }) => {
      setCurrentTask(task);
      setCode(task.code);
      setGameState('playing');
      setBuzzerPressed(false);
      setBuzzerPlayerId(null);
      setRoundStartTime(startTime);
      setRoundDuration(duration);
      setRoundNumber(rn);
      setVotedFor(null);
      addActivity('round-start', socket.id || '', 'You', `Round ${rn} started`);
    });

    socket.on('buzzer-pressed', ({ playerId, playerName }) => {
      setBuzzerPressed(true);
      setBuzzerPlayerId(playerId);
      addActivity('buzz', playerId, playerName, 'pressed the buzzer!');
    });

    socket.on('voting-started', () => {
      setGameState('voting');
    });

    socket.on('round-ended', ({ results }) => {
      setGameState('results');
      setPlayers(results.players);
      addActivity('round-end', '', 'System', 'Round ended');
    });

    socket.on('game-over', ({ winner, finalScores }) => {
      setGameState('game-over');
      setPlayers(finalScores);
    });

    socket.on('activity', (activity: ActivityLog) => {
      addActivity(activity.type, activity.playerId, activity.playerName, activity.message);
    });

    return () => {
      socket.off('game-state');
      socket.off('role-assigned');
      socket.off('round-started');
      socket.off('buzzer-pressed');
      socket.off('voting-started');
      socket.off('round-ended');
      socket.off('game-over');
      socket.off('activity');
    };
  }, [roomId]);

  const addActivity = (
    type: ActivityLog['type'],
    playerId: string,
    playerName: string,
    message: string
  ) => {
    const activity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      playerId,
      playerName,
      message,
    };
    setActivities((prev) => [...prev, activity]);
  };

  const handleBuzz = () => {
    const socket = getSocket();
    socket.emit('press-buzzer', { roomId, code });
  };

  const handleVote = (suspectId: string) => {
    if (votedFor) return;
    
    const socket = getSocket();
    socket.emit('vote', { roomId, suspectId });
    setVotedFor(suspectId);
    
    const suspect = players.find((p) => p.id === suspectId);
    addActivity('vote', currentPlayerId, 'You', `voted for ${suspect?.name}`);
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  if (gameState === 'game-over') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold">Game Over!</h1>
            <div className="text-6xl">🏆</div>
            
            <div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">Winner</h2>
              <p className="text-2xl">{sortedPlayers[0]?.name}</p>
              <p className="text-xl text-gray-400">{sortedPlayers[0]?.score} points</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">Final Scores</h3>
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center bg-gray-800 rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}</span>
                    <span className="font-semibold">{player.name}</span>
                    <span className="text-sm text-gray-400">
                      ({player.role === 'saboteur' ? '🔴 Saboteur' : '🔧 Fixer'})
                    </span>
                  </div>
                  <span className="text-xl font-bold">{player.score}</span>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <RoleReveal
        isOpen={showRoleReveal && gameState === 'role-reveal'}
        role={currentRole || 'fixer'}
        task={currentTask?.description || ''}
      />

      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Round {roundNumber}/{maxRounds}</h1>
            <p className="text-gray-400">
              You are a <span className={currentRole === 'saboteur' ? 'text-red-500' : 'text-blue-500'}>
                {currentRole === 'saboteur' ? 'Saboteur 🔴' : 'Fixer 🔧'}
              </span>
            </p>
          </div>
          <div className="w-64">
            {gameState === 'playing' && (
              <Timer
                duration={roundDuration}
                startTime={roundStartTime}
                onComplete={() => {}}
              />
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h3 className="text-xl font-bold mb-2">{currentTask?.description}</h3>
              <p className="text-sm text-gray-400 mb-4">
                Language: <span className="text-blue-400">{currentTask?.language}</span>
              </p>
              
              {gameState === 'playing' && (
                <CodeEditor
                  code={code}
                  onChange={handleCodeChange}
                  language={currentTask?.language || 'javascript'}
                  readOnly={buzzerPressed}
                  height="400px"
                />
              )}
              
              {gameState === 'voting' && (
                <div className="bg-gray-800 rounded p-4">
                  <pre className="text-sm overflow-x-auto">{code}</pre>
                </div>
              )}
            </Card>

            {gameState === 'playing' && (
              <Card className="text-center">
                <Buzzer
                  onBuzz={handleBuzz}
                  disabled={buzzerPressed}
                  buzzerPressed={buzzerPressed}
                />
                {buzzerPressed && buzzerPlayerId && (
                  <p className="mt-4 text-yellow-400">
                    {buzzerPlayerId === currentPlayerId 
                      ? 'You pressed the buzzer!' 
                      : `${players.find(p => p.id === buzzerPlayerId)?.name} pressed the buzzer!`}
                  </p>
                )}
              </Card>
            )}

            {gameState === 'voting' && (
              <Card>
                <h3 className="text-xl font-bold mb-4">Vote for Suspected Saboteur</h3>
                <p className="text-gray-400 mb-4">Who do you think sabotaged the code?</p>
                {votedFor ? (
                  <p className="text-green-400 text-center py-4">Vote submitted!</p>
                ) : (
                  <div className="space-y-2">
                    {players
                      .filter((p) => p.id !== currentPlayerId)
                      .map((player) => (
                        <button
                          key={player.id}
                          onClick={() => handleVote(player.id)}
                          className="w-full bg-gray-800 hover:bg-gray-700 rounded p-3 text-left transition-colors"
                        >
                          {player.name}
                        </button>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              showRoles={false}
            />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
