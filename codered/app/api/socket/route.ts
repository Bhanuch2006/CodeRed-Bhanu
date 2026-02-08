import { Server as SocketIOServer } from 'socket.io';
import { NextRequest } from 'next/server';
import { roomManager } from '@/lib/roomManager';
import { validateBugFix } from '@/lib/validator';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    // @ts-ignore
    const httpServer = req.socket?.server;
    
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('create-room', ({ playerName }) => {
        const roomId = roomManager.createRoom(socket.id, playerName);
        socket.join(roomId);
        socket.emit('room-created', { roomId });
        
        const room = roomManager.getRoom(roomId);
        if (room) {
          io?.to(roomId).emit('room-state', {
            players: Array.from(room.players.values()),
            hostId: room.hostId,
          });
        }
      });

      socket.on('join-room', ({ roomId, playerName }) => {
        const player = roomManager.joinRoom(roomId, socket.id, playerName);
        
        if (!player) {
          socket.emit('error', { message: 'Unable to join room' });
          return;
        }

        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        
        const room = roomManager.getRoom(roomId);
        if (room) {
          io?.to(roomId).emit('player-joined', { player });
          io?.to(roomId).emit('room-state', {
            players: Array.from(room.players.values()),
            hostId: room.hostId,
          });
        }
      });

      socket.on('get-room-state', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (room) {
          socket.emit('room-state', {
            players: Array.from(room.players.values()),
            hostId: room.hostId,
          });
        }
      });

      socket.on('toggle-ready', ({ roomId, ready }) => {
        roomManager.setPlayerReady(roomId, socket.id, ready);
        io?.to(roomId).emit('player-ready', { playerId: socket.id, ready });
      });

      socket.on('start-game', ({ roomId }) => {
        io?.to(roomId).emit('game-starting');
        
        setTimeout(() => {
          roomManager.startGame(roomId);
          const room = roomManager.getRoom(roomId);
          
          if (room) {
            room.players.forEach((player) => {
              io?.to(player.id).emit('role-assigned', { role: player.role });
            });

            setTimeout(() => {
              roomManager.startRound(roomId);
              const updatedRoom = roomManager.getRoom(roomId);
              
              if (updatedRoom) {
                io?.to(roomId).emit('round-started', {
                  task: updatedRoom.currentTask,
                  startTime: updatedRoom.roundStartTime,
                  duration: updatedRoom.roundDuration,
                  roundNumber: updatedRoom.roundNumber,
                });
              }
            }, 5000);
          }
        }, 2000);
      });

      socket.on('get-game-state', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (room) {
          socket.emit('game-state', {
            players: Array.from(room.players.values()),
            currentTask: room.currentTask,
            roundNumber: room.roundNumber,
            maxRounds: room.maxRounds,
            state: room.state,
            buzzerPressed: room.buzzerPressed,
            buzzerPlayerId: room.buzzerPlayerId,
            roundStartTime: room.roundStartTime,
            roundDuration: room.roundDuration,
          });
        }
      });

      socket.on('press-buzzer', ({ roomId, code }) => {
        const pressed = roomManager.pressBuzzer(roomId, socket.id);
        
        if (pressed) {
          const room = roomManager.getRoom(roomId);
          const player = room?.players.get(socket.id);
          
          if (player && room) {
            io?.to(roomId).emit('buzzer-pressed', {
              playerId: socket.id,
              playerName: player.name,
            });

            // Validate the code
            if (room.currentTask) {
              const isCorrect = validateBugFix(room.currentTask, code);
              
              if (isCorrect) {
                player.score += player.role === 'fixer' ? 100 : -50;
              } else {
                player.score += player.role === 'saboteur' ? 150 : -20;
              }
            }

            // Start voting after a short delay
            setTimeout(() => {
              roomManager.endRound(roomId);
              io?.to(roomId).emit('voting-started');
            }, 2000);
          }
        }
      });

      socket.on('vote', ({ roomId, suspectId }) => {
        roomManager.submitVote(roomId, socket.id, suspectId);
        
        const room = roomManager.getRoom(roomId);
        if (room && room.votes.size === room.players.size) {
          // All votes are in, calculate results
          const voteCounts = new Map<string, number>();
          
          room.votes.forEach((suspectId) => {
            voteCounts.set(suspectId, (voteCounts.get(suspectId) || 0) + 1);
          });

          // Find most voted player
          let mostVoted = '';
          let maxVotes = 0;
          voteCounts.forEach((count, playerId) => {
            if (count > maxVotes) {
              maxVotes = count;
              mostVoted = playerId;
            }
          });

          // Award/deduct points based on voting
          if (mostVoted) {
            const suspect = room.players.get(mostVoted);
            if (suspect?.role === 'saboteur') {
              // Correctly identified saboteur
              room.players.forEach((player) => {
                if (room.votes.get(player.id) === mostVoted) {
                  player.score += 75; // Reward for catching saboteur
                }
              });
              if (suspect) suspect.score -= 50;
            } else {
              // False accusation
              room.players.forEach((player) => {
                if (room.votes.get(player.id) === mostVoted) {
                  player.score -= 30;
                }
              });
            }
          }

          setTimeout(() => {
            roomManager.calculateResults(roomId);
            io?.to(roomId).emit('round-ended', {
              results: {
                players: Array.from(room.players.values()),
                mostVoted,
              },
            });

            setTimeout(() => {
              if (room.roundNumber >= room.maxRounds) {
                const sortedPlayers = Array.from(room.players.values()).sort(
                  (a, b) => b.score - a.score
                );
                io?.to(roomId).emit('game-over', {
                  winner: sortedPlayers[0],
                  finalScores: sortedPlayers,
                });
              } else {
                roomManager.startRound(roomId);
                const updatedRoom = roomManager.getRoom(roomId);
                
                if (updatedRoom) {
                  io?.to(roomId).emit('round-started', {
                    task: updatedRoom.currentTask,
                    startTime: updatedRoom.roundStartTime,
                    duration: updatedRoom.roundDuration,
                    roundNumber: updatedRoom.roundNumber,
                  });
                }
              }
            }, 10000);
          }, 3000);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and remove player from all rooms
        const rooms = roomManager.getAllRooms();
        rooms.forEach((room) => {
          if (room.players.has(socket.id)) {
            const player = room.players.get(socket.id);
            roomManager.leaveRoom(room.id, socket.id);
            
            if (player) {
              io?.to(room.id).emit('player-left', { playerId: socket.id });
              
              const updatedRoom = roomManager.getRoom(room.id);
              if (updatedRoom) {
                io?.to(room.id).emit('room-state', {
                  players: Array.from(updatedRoom.players.values()),
                  hostId: updatedRoom.hostId,
                });
              }
            }
          }
        });
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
