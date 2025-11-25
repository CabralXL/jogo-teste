export type Player = 'X' | 'O' | null;
export type BoardState = Player[];

export type GameMode = 'PvP' | 'PvAI' | 'Online';
export type Difficulty = 'Fácil' | 'Médio' | 'Impossível';

export interface WinResult {
  winner: Player;
  line: number[] | null;
  isDraw: boolean;
}

export interface ScoreState {
  X: number;
  O: number;
  Draws: number;
}

// Tipos para o serviço Online
export type OnlineMessage = 
  | { type: 'JOIN_REQUEST'; roomId: string }
  | { type: 'JOIN_ACCEPTED'; roomId: string }
  | { type: 'MAKE_MOVE'; index: number; player: Player }
  | { type: 'RESTART_GAME' }
  | { type: 'PLAYER_DISCONNECT' };
