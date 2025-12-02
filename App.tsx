import React, { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BoardState, GameStatus, Player } from './types';
import { createEmptyBoard } from './utils/gameLogic';
import { Menu } from './components/Menu';
import { Lobby } from './components/Lobby';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';

// Verbindung zum Server herstellen
// UPDATE FÜR INTERNET:
// Wir prüfen, ob wir lokal entwickeln (localhost) oder ob die App produktiv läuft.
// Wenn produktiv (z.B. über ngrok), verbinden wir uns relativ zum Serverpfad.
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SOCKET_URL = isDev ? `http://${window.location.hostname}:3001` : undefined;

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false
});

// Da wir den Raumnamen aus der UI entfernt haben, nutzen wir intern einen festen Namen.
// So landen Host und Client automatisch im selben Spiel.
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

  // Spiel State (kommt jetzt vom Server)
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Red);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [scoreRed, setScoreRed] = useState(0);
  const [scoreYellow, setScoreYellow] = useState(0);
  const [lastWinner, setLastWinner] = useState<Player | null>(null);

  // "2 Taps" Logik State (Bleibt im Frontend, ist reine UI)
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  useEffect(() => {
    socket.connect();
    setIsConnected(true);

    socket.on('connect', () => {
      console.log("Verbunden mit Server ID:", socket.id);
    });

    socket.on('error_message', (msg) => {
      setErrorMessage(msg);
      // Kurze Zeit später Fehler ausblenden
      setTimeout(() => setErrorMessage(''), 3000);
    });

    socket.on('player_assigned', (color) => {
      setMyColor(color);
      console.log("Ich bin Spieler:", color);
      setGameStatus(GameStatus.Playing); // Sobald wir drin sind, zeigen wir das Brett
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
      // Wenn das Spiel vom Server aktualisiert wurde, resetten wir die lokale Auswahl
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
    // Wir nutzen immer den gleichen internen Raumnamen
    setRoomName(DEFAULT_ROOM_NAME);
    socket.emit('join_room', { roomName: DEFAULT_ROOM_NAME, password: pass });
  };

  const nextRound = () => {
    socket.emit('next_round', { roomName });
  };

  const restartCurrentRound = () => {
    // Im Multiplayer ist "Runde neustarten" oft gleich wie nächste Runde, 
    // oder wir nutzen es um das Spiel komplett zu resetten.
    // Hier senden wir next_round, um das Brett zu leeren.
    socket.emit('next_round', { roomName });
  };

  const exitGame = () => {
    // Einfach Seite neu laden oder State resetten
    window.location.reload();
  };

  const resetScores = () => {
    socket.emit('reset_scores', { roomName });
  };

  const handleColumnClick = useCallback((colIndex: number) => {
    if (gameStatus !== GameStatus.Playing) return;
    
    // Bin ich überhaupt dran?
    if (myColor !== currentPlayer) {
      setErrorMessage("Du bist nicht am Zug!");
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    // Warten auf zweiten Spieler?
    if (playerCount < 2) {
      setErrorMessage("Warte auf Gegner...");
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    // "2 Taps" Logik:
    if (selectedColumn !== colIndex) {
      // Tap 1: Auswählen
      setSelectedColumn(colIndex);
      return;
    }

    // Tap 2: Bestätigen -> An Server senden
    socket.emit('make_move', { roomName, colIndex });
    
  }, [gameStatus, myColor, currentPlayer, selectedColumn, roomName, playerCount]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 relative">
      
      {/* Fehler Popup */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl font-bold animate-bounce border-2 border-white">
          {errorMessage}
        </div>
      )}

      {/* Connection Status (klein unten) */}
      <div className="fixed bottom-2 right-2 text-xs text-slate-500 bg-white/50 px-2 py-1 rounded">
        Status: {isConnected ? 'Online' : 'Offline'} | ID: {socket.id}
      </div>

      {/* HEADER */}
      {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
        <div className="w-full flex flex-col items-center">
           <ScoreBoard 
            scoreRed={scoreRed} 
            scoreYellow={scoreYellow} 
            currentPlayer={currentPlayer}
            isFinished={gameStatus === GameStatus.Finished}
            winner={lastWinner}
          />
          {/* Info wer ich bin */}
          <div className="mb-4 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-white/50">
            <span className="text-slate-500 mr-2 font-medium">Du spielst als:</span>
            <span className={`font-bold ${myColor === Player.Red ? 'text-red-500' : 'text-yellow-600'}`}>
              {myColor}
            </span>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-grow flex flex-col justify-center items-center w-full px-4">
        
        {gameStatus === GameStatus.Lobby && (
          <Lobby onJoin={joinRoom} />
        )}

        {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
             
             {playerCount < 2 && (
               <div className="mb-4 text-orange-500 bg-orange-100 px-4 py-2 rounded-lg inline-block font-bold animate-pulse border border-orange-200">
                 ⚠️ Warte auf zweiten Spieler...
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
               <p className="mt-6 text-slate-500 text-sm font-medium animate-pulse bg-white/50 inline-block px-4 py-1 rounded-full">
                 {selectedColumn !== null ? '👇 Tippe erneut zum Bestätigen' : '👈 Tippe eine Spalte zum Auswählen'}
               </p>
             )}
             {gameStatus === GameStatus.Playing && myColor !== currentPlayer && (
               <p className="mt-6 text-slate-400 text-sm font-medium">
                 Gegner denkt nach...
               </p>
             )}
          </div>
        )}

      </div>

      {/* FOOTER CONTROLS */}
      {(gameStatus === GameStatus.Playing || gameStatus === GameStatus.Finished) && (
        <div className="mt-8 flex flex-wrap justify-center gap-4 px-4 w-full max-w-2xl">
          {gameStatus === GameStatus.Finished && (
            <button 
              onClick={nextRound}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 transform transition hover:-translate-y-1 w-full sm:w-auto"
            >
              Nächste Runde Starten
            </button>
          )}

          <div className="flex gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={resetScores}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition shadow-md border border-slate-200 text-sm"
            >
              Reset 0:0
            </button>

            <button 
              onClick={exitGame}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition shadow-sm border border-red-200 text-sm"
            >
              Verlassen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;