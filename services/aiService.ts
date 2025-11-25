import { WINNING_COMBINATIONS } from '../constants';
import { BoardState, Difficulty, Player } from '../types';
import { checkWinner } from './gameLogic';

// Pontuações para o Minimax
const SCORES = {
  X: -10, // Humano (assumindo que humano é X)
  O: 10,  // AI (assumindo que AI é O)
  Tie: 0
};

export const getBestMove = (board: BoardState, difficulty: Difficulty, aiPlayer: Player = 'O'): number => {
  const availableMoves = board.map((val, idx) => val === null ? idx : null).filter((val) => val !== null) as number[];

  if (availableMoves.length === 0) return -1;

  // Nível Fácil: Movimento aleatório
  if (difficulty === 'Fácil') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // Nível Médio: 60% chance de jogada ótima, 40% aleatória
  if (difficulty === 'Médio') {
    if (Math.random() > 0.6) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
  }

  // Nível Impossível (e Médio quando cai na chance de jogada ótima)
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < availableMoves.length; i++) {
    const idx = availableMoves[i];
    board[idx] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer);
    board[idx] = null; // Backtracking

    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }

  return move;
};

const minimax = (board: BoardState, depth: number, isMaximizing: boolean, aiPlayer: Player): number => {
  const result = checkWinner(board);
  
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner && result.winner !== aiPlayer) return depth - 10;
  if (result.isDraw) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};