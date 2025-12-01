import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import Controls from './components/Controls';
import Modal from './components/Modal';
import OnlineLobby from './components/OnlineLobby';
import { BoardState, Difficulty, GameMode, OnlineMessage, Player, ScoreState, WinResult } from './types';
import { checkWinner } from './services/gameLogic';
import { getBestMove } from './services/aiService';
import { playSound } from './services/soundService';
import { onlineService } from './services/onlineService';

const INITIAL_BOARD: BoardState = Array(9).fill(null);
const INITIAL_SCORES: ScoreState = { X: 0, O: 0, Draws: 0 };

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<GameMode>('PvAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Impossível');
  const [scores, setScores] = useState<ScoreState>(INITIAL_SCORES);
  const [result, setResult] = useState<WinResult>({ winner: null, line: null, isDraw: false });
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Online State
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState(false);
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(null);
  const [onlinePlayerSymbol, setOnlinePlayerSymbol] = useState<Player>(null);
  const [isOnlineReady, setIsOnlineReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSound = useCallback((type: 'click' | 'win' | 'draw') => {
    if (!isMuted) {
      playSound(type);
    }
  }, [isMuted]);

  // Clean up online connection on unmount or mode change
  useEffect(() => {
    return () => {
      onlineService.disconnect();
    };
  }, []);

  const resetGame = useCallback((isRemoteRequest = false) => {
    // If online and I clicked reset, tell the other player
    if (gameMode === 'Online' && !isRemoteRequest && isOnlineReady) {
      onlineService.send({ type: 'RESTART_GAME' });
    }

    setBoard(Array(9).fill(null));
    setIsXNext(true); // X always starts
    setResult({ winner: null, line: null, isDraw: false });
    setIsAiThinking(false);
  }, [gameMode, isOnlineReady]);

  const handleModeChange = (mode: GameMode) => {
    if (mode === 'Online') {
      setGameMode(mode);
      setIsOnlineLobbyOpen(true);
      resetGame();
      setScores(INITIAL_SCORES);
    } else {
      // Leaving online mode
      if (gameMode === 'Online') {
        onlineService.disconnect();
        setOnlineRoomId(null);
        setOnlinePlayerSymbol(null);
        setIsOnlineReady(false);
        setStatusMessage('');
      }
      setIsOnlineLobbyOpen(false); // Close lobby when switching modes
      setGameMode(mode);
      resetGame();
      setScores(INITIAL_SCORES);
    }
  };

  const updateScore = useCallback((winner: Player, isDraw: boolean) => {
    setScores((prev) => ({
      ...prev,
      X: winner === 'X' ? prev.X + 1 : prev.X,
      O: winner === 'O' ? prev.O + 1 : prev.O,
      Draws: isDraw ? prev.Draws + 1 : prev.Draws,
    }));
  }, []);

  const processMove = useCallback((index: number) => {
    handleSound('click');
    
    setBoard(prev => {
      const newBoard = [...prev];
      const currentPlayer = isXNext ? 'X' : 'O';
      newBoard[index] = currentPlayer;
      
      const gameResult = checkWinner(newBoard);
      if (gameResult.winner || gameResult.isDraw) {
        setResult(gameResult);
        updateScore(gameResult.winner, gameResult.isDraw);
        if (gameResult.winner) handleSound('win');
        if (gameResult.isDraw) handleSound('draw');
      }
      
      return newBoard;
    });

    setIsXNext(prev => !prev);
  }, [isXNext, updateScore, handleSound]);


  const handleCellClick = useCallback((index: number) => {
    // Basic checks: cell occupied, game over, or AI thinking
    if (board[index] || result.winner || result.isDraw || isAiThinking) return;

    // Online Mode Logic
    if (gameMode === 'Online') {
      if (!isOnlineReady) return; // Wait for opponent
      
      // Can only move if it's my turn AND my symbol
      const currentPlayer = isXNext ? 'X' : 'O';
      if (currentPlayer !== onlinePlayerSymbol) return;

      // Send move to opponent
      onlineService.send({ 
        type: 'MAKE_MOVE', 
        index: index, 
        player: onlinePlayerSymbol 
      });
    }

    processMove(index);

  }, [board, result, isAiThinking, gameMode, isOnlineReady, isXNext, onlinePlayerSymbol, processMove]);

  // AI Turn Effect
  useEffect(() => {
    if (gameMode === 'PvAI' && !isXNext && !result.winner && !result.isDraw) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board, difficulty, 'O');
        if (bestMove !== -1) {
          processMove(bestMove);
        }
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, difficulty, result, processMove]);


  // --- ONLINE LOGIC HANDLERS ---

  const handleOnlineMessage = useCallback((msg: OnlineMessage) => {
    switch (msg.type) {
      case 'JOIN_REQUEST':
        // I am Host (X), someone wants to join
        onlineService.send({ type: 'JOIN_ACCEPTED', roomId: onlineService.getRoomId()! });
        setIsOnlineReady(true);
        setStatusMessage('Oponente conectado! Jogo iniciado.');
        handleSound('click'); // Sound alert
        break;

      case 'JOIN_ACCEPTED':
        // I am Guest (O), host accepted me
        setIsOnlineReady(true);
        setStatusMessage('Conectado à sala! Jogo iniciado.');
        handleSound('click');
        break;

      case 'MAKE_MOVE':
        processMove(msg.index);
        break;

      case 'RESTART_GAME':
        resetGame(true);
        setStatusMessage('O oponente reiniciou o jogo.');
        break;

      case 'PLAYER_DISCONNECT':
        setIsOnlineReady(false);
        setStatusMessage('Oponente desconectou.');
        setScores(INITIAL_SCORES);
        setBoard(Array(9).fill(null));
        setResult({ winner: null, line: null, isDraw: false });
        // Optional: Kick back to lobby or just show waiting message
        if (onlinePlayerSymbol === 'O') {
           // If guest, kick out because room is dead
           setOnlineRoomId(null);
           setIsOnlineLobbyOpen(true);
        } else {
           // If host, go back to waiting
           setStatusMessage('Aguardando oponente...');
        }
        break;
    }
  }, [processMove, resetGame, handleSound, onlinePlayerSymbol]);

  const createRoom = (id: string) => {
    setOnlineRoomId(id);
    setOnlinePlayerSymbol('X'); // Host is always X
    setStatusMessage(`Sala criada: ${id}. Aguardando oponente...`);
    setIsOnlineReady(false); // Not ready until someone joins
    
    onlineService.connect(id, handleOnlineMessage);
    setIsOnlineLobbyOpen(false);
  };

  const joinRoom = (id: string) => {
    setOnlineRoomId(id);
    setOnlinePlayerSymbol('O'); // Guest is always O
    setStatusMessage('Conectando...');
    
    onlineService.connect(id, handleOnlineMessage);
    // Send hello to host
    setTimeout(() => {
        onlineService.send({ type: 'JOIN_REQUEST', roomId: id });
    }, 500); // Small delay to ensure connection is open

    setIsOnlineLobbyOpen(false);
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-8 bg-slate-950 text-slate-100">
      
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Sound Toggle */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute -top-6 right-4 sm:top-0 sm:right-6 text-slate-400 hover:text-white transition-colors p-2 z-20 bg-slate-800/50 rounded-full backdrop-blur-sm"
          title={isMuted ? "Ativar som" : "Desativar som"}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-lg`}></i>
        </button>

        {/* Online Status Banner */}
        {gameMode === 'Online' && (
          <div className="absolute -top-6 left-4 sm:top-0 sm:left-6 flex flex-col gap-1 z-20">
            <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50 shadow-lg flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnlineReady ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-xs text-slate-300 font-mono">
                Sala: <span className="text-white font-bold">{onlineRoomId || '...'}</span>
              </span>
            </div>
            {statusMessage && (
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold ml-1 animate-fade-in bg-slate-900/50 px-2 rounded">{statusMessage}</span>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center mt-8 sm:mt-0 relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl -z-10 rounded-full"></div>
          <div className="flex items-center justify-center gap-3 mb-2">
             <div className="relative">
               <svg className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </div>
             <div className="relative">
               <svg className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
             </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider filter drop-shadow-lg">
            TIC-TAC-TOE
          </h1>
          <p className="text-cyan-500 text-xs sm:text-sm mt-1 uppercase tracking-[0.3em] font-bold">Ultimate Edition</p>
        </div>

        {/* Score Board */}
        <ScoreBoard 
          scores={scores} 
          currentPlayer={isXNext ? 'X' : 'O'} 
          gameMode={gameMode} 
          onlinePlayerSymbol={onlinePlayerSymbol || undefined}
        />

        {/* Game Board */}
        <div className="relative group">
          {/* Glow effect behind board - Added pointer-events-none */}
          <div className="absolute -inset-1 pointer-events-none bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>
          
           <Board 
              board={board} 
              onCellClick={handleCellClick} 
              winningLine={result.line} 
              isGameActive={!result.winner && !result.isDraw}
            />
            
            {/* Status Indicators */}
            {isAiThinking && (
               <div className="absolute -bottom-10 left-0 right-0 text-center">
                 <span className="inline-flex items-center gap-2 px-4 py-1 bg-slate-800/80 rounded-full text-cyan-400 text-sm font-bold border border-cyan-500/30 animate-pulse">
                   <i className="fas fa-microchip"></i> IA Calculando...
                 </span>
               </div>
            )}
             {gameMode === 'Online' && !isOnlineReady && !result.winner && (
               <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-col text-center p-6 z-20 border border-slate-700">
                 <div className="relative">
                   <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
                   <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500 mb-4 relative z-10"></div>
                 </div>
                 <p className="text-white font-bold text-lg">Aguardando...</p>
                 <div className="mt-3 bg-slate-800 p-2 rounded-lg border border-slate-700 w-full">
                   <p className="text-slate-400 text-xs uppercase mb-1">ID da Sala</p>
                   <p className="text-cyan-400 font-mono text-xl tracking-widest">{onlineRoomId}</p>
                 </div>
               </div>
            )}
             {gameMode === 'Online' && isOnlineReady && !result.winner && !result.isDraw && onlinePlayerSymbol !== (isXNext ? 'X' : 'O') && (
                <div className="absolute -bottom-10 left-0 right-0 text-center">
                   <span className="inline-flex items-center gap-2 px-4 py-1 bg-slate-800/80 rounded-full text-slate-300 text-sm font-bold border border-slate-600">
                     <i className="fas fa-hourglass-half"></i> Vez do oponente
                   </span>
              </div>
             )}
        </div>

        {/* Controls */}
        <Controls 
          gameMode={gameMode}
          difficulty={difficulty}
          onModeChange={handleModeChange}
          onDifficultyChange={(d) => { setDifficulty(d); resetGame(); }}
          onReset={() => resetGame(false)}
        />

        {/* Footer */}
        <footer className="mt-12 text-slate-600 text-xs font-medium tracking-wide">
          <p>React • Tailwind • Web Audio API</p>
        </footer>

        {/* Winner Modal */}
        <Modal 
          winner={result.winner} 
          isDraw={result.isDraw} 
          onRestart={() => resetGame(false)} 
        />

        {/* Online Lobby Modal */}
        {isOnlineLobbyOpen && (
          <OnlineLobby 
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onCancel={() => handleModeChange('PvAI')} // Go back to default if cancelled
          />
        )}
      
      </div>
    </div>
  );
};

export default App;