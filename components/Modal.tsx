import React from 'react';
import { Player } from '../types';
import { PLAYER_O_COLOR, PLAYER_X_COLOR } from '../constants';

interface ModalProps {
  winner: Player;
  isDraw: boolean;
  onRestart: () => void;
}

const Modal: React.FC<ModalProps> = ({ winner, isDraw, onRestart }) => {
  if (!winner && !isDraw) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center w-full max-w-sm animate-bounce-in">
        
        <div className="mb-4">
          {isDraw ? (
            <i className="fas fa-handshake text-6xl text-slate-400"></i>
          ) : winner === 'X' ? (
             <svg className={`w-20 h-20 mx-auto ${PLAYER_X_COLOR}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg className={`w-20 h-20 mx-auto ${PLAYER_O_COLOR}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          )}
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">
          {isDraw ? 'Empate!' : 'Vencedor!'}
        </h2>
        
        {!isDraw && (
          <p className={`text-xl font-medium mb-6 ${winner === 'X' ? 'text-cyan-400' : 'text-amber-400'}`}>
             {winner === 'X' ? 'Jogador X' : 'Jogador O'} venceu a rodada!
          </p>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold rounded-xl transition-all shadow-[0_4px_0_rgb(8,145,178)] active:shadow-none active:translate-y-1 uppercase tracking-wider"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default Modal;