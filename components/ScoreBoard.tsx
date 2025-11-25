import React from 'react';
import { ScoreState, Player, GameMode } from '../types';
import { PLAYER_O_COLOR, PLAYER_X_COLOR } from '../constants';

interface ScoreBoardProps {
  scores: ScoreState;
  currentPlayer: Player;
  gameMode: GameMode;
  onlinePlayerSymbol?: Player;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, currentPlayer, gameMode, onlinePlayerSymbol }) => {
  const activeClass = "bg-slate-700 ring-2 ring-cyan-500 scale-105";

  const getPlayerName = (symbol: Player) => {
    if (gameMode === 'PvAI') {
      return symbol === 'X' ? 'Você (X)' : 'IA (O)';
    }
    if (gameMode === 'Online' && onlinePlayerSymbol) {
      if (symbol === onlinePlayerSymbol) return 'Você';
      return 'Oponente';
    }
    return symbol === 'X' ? 'Jogador X' : 'Jogador O';
  };

  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto mb-8 gap-4 px-4">
      
      {/* Jogador X */}
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl w-1/3 transition-all duration-300 ${currentPlayer === 'X' ? activeClass : 'bg-slate-800'}`}>
        <span className={`text-xs sm:text-sm font-bold uppercase ${PLAYER_X_COLOR} truncate w-full text-center`}>
          {getPlayerName('X')}
        </span>
        <span className="text-2xl font-bold text-white">{scores.X}</span>
      </div>

      {/* Empates */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl w-1/3 bg-slate-800">
        <span className="text-xs sm:text-sm font-bold uppercase text-slate-400">Empates</span>
        <span className="text-2xl font-bold text-white">{scores.Draws}</span>
      </div>

      {/* Jogador O */}
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl w-1/3 transition-all duration-300 ${currentPlayer === 'O' ? activeClass : 'bg-slate-800'}`}>
        <span className={`text-xs sm:text-sm font-bold uppercase ${PLAYER_O_COLOR} truncate w-full text-center`}>
           {getPlayerName('O')}
        </span>
        <span className="text-2xl font-bold text-white">{scores.O}</span>
      </div>

    </div>
  );
};

export default ScoreBoard;