import React from 'react';
import { Player } from '../types';
import { PLAYER_O_COLOR, PLAYER_X_COLOR } from '../constants';

interface CellProps {
  value: Player;
  onClick: () => void;
  isWinningCell: boolean;
  disabled: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, isWinningCell, disabled }) => {
  const baseClasses = "h-24 w-24 sm:h-32 sm:w-32 bg-slate-800 rounded-xl flex items-center justify-center text-5xl sm:text-6xl cursor-pointer transition-all duration-200 shadow-lg cell-shadow border-b-4 border-slate-950";
  const hoverClasses = !disabled && !value ? "hover:bg-slate-700" : "";
  const winningClasses = isWinningCell ? "bg-green-500/20 ring-4 ring-green-500" : "";
  
  const textClass = value === 'X' ? PLAYER_X_COLOR : PLAYER_O_COLOR;

  // Render SVG icons for clearer visuals
  const renderContent = () => {
    if (value === 'X') {
      return (
        <svg className={`w-12 h-12 sm:w-16 sm:h-16 ${textClass} drop-shadow-lg`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
    }
    if (value === 'O') {
      return (
        <svg className={`w-12 h-12 sm:w-16 sm:h-16 ${textClass} drop-shadow-lg`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${hoverClasses} ${winningClasses}`}
    >
      <div className={`transform transition-transform duration-300 ${value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Cell;