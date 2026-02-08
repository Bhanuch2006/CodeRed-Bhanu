'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { getSocket } from '@/lib/socket';

export default function HomePage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const socket = getSocket();
    socket.emit('create-room', { playerName: playerName.trim() });
    
    socket.once('room-created', ({ roomId }) => {
      router.push(`/lobby/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    const socket = getSocket();
    socket.emit('join-room', { 
      roomId: roomCode.toUpperCase().trim(), 
      playerName: playerName.trim() 
    });
    
    socket.once('joined-room', () => {
      router.push(`/lobby/${roomCode.toUpperCase().trim()}`);
    });

    socket.once('error', ({ message }) => {
      setError(message);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            CODE<span className="text-red-500">RED</span>
          </h1>
          <p className="text-xl text-gray-300">
            Fix bugs or sabotage code. Can you trust your teammates?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="text-center hover:scale-105 transition-transform cursor-pointer" 
                onClick={() => setShowCreateModal(true)}>
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-2">Create Room</h2>
            <p className="text-gray-400 mb-4">Start a new game and invite friends</p>
            <Button variant="primary" size="lg" className="w-full">
              Create Game
            </Button>
          </Card>

          <Card className="text-center hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setShowJoinModal(true)}>
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">Join Room</h2>
            <p className="text-gray-400 mb-4">Enter a room code to join</p>
            <Button variant="secondary" size="lg" className="w-full">
              Join Game
            </Button>
          </Card>
        </div>

        <Card>
          <h3 className="text-xl font-bold mb-4">How to Play</h3>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-semibold text-blue-400">Fixers</p>
                <p className="text-sm">Fix the bugs in the code before time runs out</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="font-semibold text-red-400">Saboteurs</p>
                <p className="text-sm">Prevent fixes without getting caught</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-semibold text-yellow-400">Buzzer</p>
                <p className="text-sm">Press to submit your code and trigger voting</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError('');
        }}
        title="Create Room"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button variant="primary" size="lg" className="w-full" onClick={handleCreateRoom}>
            Create Room
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError('');
        }}
        title="Join Room"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 uppercase"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button variant="primary" size="lg" className="w-full" onClick={handleJoinRoom}>
            Join Room
          </Button>
        </div>
      </Modal>
    </div>
  );
}
