import React, { useState } from 'react';

interface OnlineLobbyProps {
  onCreateRoom: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
  onCancel: () => void;
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ onCreateRoom, onJoinRoom, onCancel }) => {
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  const handleJoin = () => {
    if (roomId.trim().length > 0) {
      onJoinRoom(roomId);
    }
  };

  const handleCreate = () => {
    // Gera um ID simples de 4 dígitos
    const newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
    onCreateRoom(newRoomId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl animate-bounce-in">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-globe text-3xl text-cyan-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Multiplayer Online</h2>
          <p className="text-slate-400 text-sm">
            Abra o jogo em duas abas do navegador para simular a conexão online.
          </p>
        </div>

        {mode === 'menu' ? (
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <i className="fas fa-plus-circle text-xl"></i>
              Criar Sala
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-sign-in-alt text-xl"></i>
              Entrar em Sala
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                ID da Sala
              </label>
              <input
                type="number"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Ex: 1234"
                className="w-full bg-slate-900 border border-slate-700 text-white text-center text-2xl font-mono p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleJoin}
              disabled={!roomId}
              className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Entrar
            </button>

             <button
              onClick={() => setMode('menu')}
              className="w-full py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Voltar
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <button
            onClick={onCancel}
            className="w-full py-2 text-red-400 hover:text-red-300 font-bold transition-colors text-sm"
          >
            Cancelar e voltar ao menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineLobby;