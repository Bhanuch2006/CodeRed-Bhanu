export type PlayerRole = 'fixer' | 'saboteur';

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  score: number;
  isHost: boolean;
  ready: boolean;
}

export interface BugTask {
  id: string;
  description: string;
  code: string;
  solution: string;
  language: string;
}

export interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  state: 'lobby' | 'role-reveal' | 'playing' | 'voting' | 'results' | 'game-over';
  currentTask?: BugTask;
  roundNumber: number;
  maxRounds: number;
  buzzerPressed: boolean;
  buzzerPlayerId?: string;
  roundStartTime?: number;
  roundDuration: number;
  votes: Map<string, string>;
}

export interface GameSettings {
  maxRounds: number;
  roundDuration: number;
  saboteurCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'join' | 'leave' | 'buzz' | 'vote' | 'round-start' | 'round-end';
  playerId: string;
  playerName: string;
  message: string;
}
