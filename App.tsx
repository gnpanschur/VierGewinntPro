import React, { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BoardState, GameStatus, Player } from './types';
import { createEmptyBoard } from './utils/gameLogic';
import { Menu } from './components/Menu';
import { Lobby } from './components/Lobby';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';

// Verbindung zum Server herstellen
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SOCKET_URL = isDev ? `http://${window.location.hostname}:3001` : undefined;

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false
});

const DEFAULT_ROOM_NAME = "VierGewinnt-Lokal";

function App() {
  // Globaler State
  const [isConnected, setIsConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Lobby);
  const [roomName, setRoomName] = useState(DEFAULT_ROOM_NAME);
  
  // Eigener Spieler Status
  const [myColor, setMyColor] = useState<Player | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Spiel State
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Red);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [scoreRed, setScoreRed] = useState(0);
  const [scoreYellow, setScoreYellow] = useState(0);
  const [lastWinner, setLastWinner] = useState<Player | null>(null);

  // "2 Taps" Logik State
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  useEffect(() => {
    socket.connect();
    setIsConnected(true);

    socket.on('connect', () => {
      console.log("Verbunden mit Server ID:", socket.id);
    });

    socket.on('error_message', (msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 3000);
    });

    socket.on('player_assigned', (color) => {
      setMyColor(color);
      setGameStatus(GameStatus.Playing);
    });

    socket.on('game_update', (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setScoreRed(data.scores['Rot']);
      setScoreYellow(data.scores['Gelb']);
      setGameStatus(data.gameStatus);
      setWinningCells(data.winningCells);
      setLastWinner(data.winner);
      setPlayerCount(data.playerCount);
      setSelectedColumn(null);
    });

    return () => {
      socket.off('connect');
      socket.off('game_update');
      socket.off('player_assigned');
      socket.off('error_message');
    };
  }, []);

  // --- Actions ---

  const joinRoom = (pass: string) => {
    setRoomName(DEFAULT_ROOM_NAME);
    socket.emit('join_room', { roomName: DEFAULT_ROOM_NAME, password: pass });
  };

  const nextRound = () => {
    socket.emit('next_round', { roomName });
  };

  const exitGame = () => {
    window.location.reload();
  };

  const resetScores = () => {
    socket.emit('reset_scores', { roomName });
  };

  const handleColumnClick = useCallback((colIndex: number) => {
    if (gameStatus !== GameStatus.Playing) return;
    
    if (myColor !== currentPlayer) {
      setErrorMessage("Du bist nicht am Zug!");
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    if (playerCount < 2) {
      setErrorMessage("Warte auf Gegner...");
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    if (selectedColumn !== colIndex) {
      setSelectedColumn(colIndex);
      return;
    }

    socket.emit('make_move', { roomName, colIndex });
    
  }, [gameStatus, myColor, currentPlayer, selectedColumn, roomName, playerCount]);

  return (
    <div className="h-full flex flex-col relative w-full overflow-hidden">
      
      {/* Fehler Popup */}
      {errorMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-bounce border-2 border-white text-sm whitespace-nowrap">
          {errorMessage}
        </div>
      )}

      {/* HEADER BEREICH (Scoreboard) - Fixierte Höhe */}
      <div className="pt-4 px-4 flex-none z-10">
        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-top-4 fade-in duration-500">
             <ScoreBoard 
              scoreRed={scoreRed} 
              scoreYellow={scoreYellow} 
              currentPlayer={currentPlayer}
              isFinished={gameStatus === GameStatus.Finished}
              winner={lastWinner}
            />
            
            {/* Info wer ich bin */}
            <div className="mt-2 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm border border-white/50 text-xs">
              <span className="text-slate-500 mr-2 font-medium">Du bist:</span>
              <span className={`font-bold uppercase tracking-wider ${myColor === Player.Red ? 'text-red-500' : 'text-yellow-600'}`}>
                {myColor}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* HAUPT BEREICH (Board / Lobby) - Nimmt restlichen Platz ein und zentriert */}
      <div className="flex-grow flex flex-col justify-center items-center w-full px-2 py-2 overflow-hidden relative">
        
        {gameStatus === GameStatus.Lobby && (
          <Lobby onJoin={joinRoom} />
        )}

        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
          <div className="w-full flex flex-col items-center justify-center h-full">
             
             {playerCount < 2 && (
               <div className="absolute top-4 z-20 text-orange-600 bg-orange-100 px-4 py-2 rounded-lg font-bold animate-pulse border border-orange-200 text-sm shadow-md">
                 ⚠️ Warte auf Gegner...
               </div>
             )}

             <Board 
               board={board} 
               onColumnClick={handleColumnClick} 
               winningCells={winningCells}
               disabled={gameStatus === GameStatus.Finished || myColor !== currentPlayer || playerCount < 2}
               selectedColumn={selectedColumn}
               currentPlayer={currentPlayer}
             />
             
             {gameStatus === GameStatus.Playing && myColor === currentPlayer && (
               <p className="absolute bottom-2 text-slate-500 text-xs font-medium bg-white/80 px-3 py-1 rounded-full shadow-sm animate-pulse">
                 {selectedColumn !== null ? '👇 Tippen zum Bestätigen' : '👈 Spalte auswählen'}
               </p>
             )}
          </div>
        )}
      </div>

      {/* FOOTER BEREICH (Buttons) - Fixierte Höhe */}
      {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
        <div className="pb-6 pt-2 px-4 flex-none z-10 bg-gradient-to-t from-white/20 to-transparent">
          <div className="flex flex-col gap-3 w-full">
            {gameStatus === GameStatus.Finished && (
              <button 
                onClick={nextRound}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 transform transition active:scale-95 text-lg"
              >
                Nächste Runde
              </button>
            )}

            <div className="flex gap-3 w-full">
              <button 
                onClick={resetScores}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition shadow-md border border-slate-200 text-sm"
              >
                Reset 0:0
              </button>

              <button 
                onClick={exitGame}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-2xl transition shadow-sm border border-red-100 text-sm"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;