import React from 'react';
import { BoardState } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
  isGameActive: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, winningLine, isGameActive }) => {
  return (
    <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-900 rounded-2xl mx-auto max-w-fit">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinningCell={winningLine?.includes(index) ?? false}
          disabled={!isGameActive || value !== null}
        />
      ))}
    </div>
  );
};

export default Board;