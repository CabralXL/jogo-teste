import { WINNING_COMBINATIONS } from '../constants';
import { BoardState, Player, WinResult } from '../types';

export const checkWinner = (board: BoardState): WinResult => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination, isDraw: false };
    }
  }

  if (!board.includes(null)) {
    return { winner: null, line: null, isDraw: true };
  }

  return { winner: null, line: null, isDraw: false };
};

export const isBoardFull = (board: BoardState): boolean => {
  return !board.includes(null);
};