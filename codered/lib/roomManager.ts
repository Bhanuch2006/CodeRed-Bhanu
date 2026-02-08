import { Room, Player, BugTask, PlayerRole } from './types';
import { BUG_TASKS, GAME_CONSTANTS } from './constants';
import { v4 as uuidv4 } from 'uuid';

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(hostId: string, hostName: string): string {
    const roomId = this.generateRoomCode();
    
    const room: Room = {
      id: roomId,
      hostId,
      players: new Map(),
      state: 'lobby',
      roundNumber: 0,
      maxRounds: GAME_CONSTANTS.DEFAULT_ROUNDS,
      buzzerPressed: false,
      roundDuration: GAME_CONSTANTS.DEFAULT_ROUND_DURATION,
      votes: new Map(),
    };

    const host: Player = {
      id: hostId,
      name: hostName,
      score: 0,
      isHost: true,
      ready: false,
    };

    room.players.set(hostId, host);
    this.rooms.set(roomId, room);
    
    return roomId;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    if (room.players.size >= GAME_CONSTANTS.MAX_PLAYERS) return null;
    if (room.state !== 'lobby') return null;

    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
      ready: false,
    };

    room.players.set(playerId, player);
    return player;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    } else if (playerId === room.hostId) {
      // Transfer host to another player
      const newHost = Array.from(room.players.values())[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  setPlayerReady(roomId: string, playerId: string, ready: boolean): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.ready = ready;
    }
  }

  startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.assignRoles(room);
    room.state = 'role-reveal';
    
    setTimeout(() => {
      this.startRound(roomId);
    }, GAME_CONSTANTS.ROLE_REVEAL_DURATION);
  }

  private assignRoles(room: Room): void {
    const players = Array.from(room.players.values());
    const saboteurCount = Math.max(1, Math.floor(players.length / 3));
    
    // Shuffle players
    const shuffled = players.sort(() => Math.random() - 0.5);
    
    // Assign saboteurs
    for (let i = 0; i < saboteurCount; i++) {
      shuffled[i].role = 'saboteur';
    }
    
    // Assign fixers
    for (let i = saboteurCount; i < shuffled.length; i++) {
      shuffled[i].role = 'fixer';
    }
  }

  startRound(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.roundNumber++;
    room.state = 'playing';
    room.buzzerPressed = false;
    room.buzzerPlayerId = undefined;
    room.roundStartTime = Date.now();
    
    // Select random task
    room.currentTask = this.getRandomTask();
  }

  pressBuzzer(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.buzzerPressed) return false;

    room.buzzerPressed = true;
    room.buzzerPlayerId = playerId;
    return true;
  }

  submitVote(roomId: string, voterId: string, suspectId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.votes.set(voterId, suspectId);
  }

  endRound(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'voting';
    room.votes.clear();
  }

  calculateResults(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'results';
    
    setTimeout(() => {
      if (room.roundNumber >= room.maxRounds) {
        room.state = 'game-over';
      } else {
        this.startRound(roomId);
      }
    }, GAME_CONSTANTS.RESULTS_DURATION);
  }

  private getRandomTask(): BugTask {
    const index = Math.floor(Math.random() * BUG_TASKS.length);
    return { ...BUG_TASKS[index] };
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager();
