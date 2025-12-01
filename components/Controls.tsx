import React from 'react';
import { Difficulty, GameMode } from '../types';

interface ControlsProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  gameMode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  onReset,
}) => {
  const getButtonClass = (isActive: boolean) => 
    `flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 transform hover:scale-105 active:scale-95 ${
      isActive 
        ? 'bg-slate-600 text-white shadow-lg ring-1 ring-slate-500/50' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
    }`;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md px-4 mt-6">
      
      {/* Mode Selector */}
      <div className="flex bg-slate-800 p-1 rounded-xl gap-1 shadow-inner border border-slate-700/50">
        <button
          className={getButtonClass(gameMode === 'PvP')}
          onClick={() => onModeChange('PvP')}
        >
          <i className="fas fa-user-friends"></i> <span className="hidden sm:inline">Local</span>
        </button>
        <button
          className={getButtonClass(gameMode === 'PvAI')}
          onClick={() => onModeChange('PvAI')}
        >
          <i className="fas fa-robot"></i> <span className="hidden sm:inline">VS IA</span>
        </button>
        <button
          className={getButtonClass(gameMode === 'Online')}
          onClick={() => onModeChange('Online')}
        >
          <i className="fas fa-globe"></i> <span className="hidden sm:inline">Online</span>
        </button>
      </div>

      {/* Difficulty Selector (Only visible in PvAI) */}
      {gameMode === 'PvAI' && (
        <div className="flex justify-between items-center bg-slate-800 p-2 rounded-xl animate-fade-in border border-slate-700/50">
          <span className="text-xs uppercase font-bold text-slate-400 ml-2">Nível:</span>
          <div className="flex gap-1">
            {(['Fácil', 'Médio', 'Impossível'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                  difficulty === level
                    ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-3 bg-slate-700 hover:bg-slate-600 hover:scale-[1.02] active:scale-95 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_4px_0_rgb(51,65,85)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2 border border-slate-600"
      >
        <i className="fas fa-redo-alt"></i> 
        {gameMode === 'Online' ? 'Reiniciar Partida' : 'Reiniciar Tabuleiro'}
      </button>

    </div>
  );
};

export default Controls;