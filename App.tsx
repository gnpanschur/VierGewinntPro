import React, { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BoardState, GameStatus, Player, PlayerInfo } from './types';
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
  const getInitialRoomName = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || DEFAULT_ROOM_NAME;
  };

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Lobby);
  const [roomName, setRoomName] = useState(getInitialRoomName);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

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



  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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
      if (data.players) {
        setPlayers(data.players.map((p: any) => ({
          ...p,
          isMe: p.id === socket.id
        })));
      }
    });

    return () => {
      socket.off('connect');
      socket.off('game_update');
      socket.off('player_assigned');
      socket.off('error_message');
    };
  }, []);

  // --- Actions ---

  const joinRoom = (name: string, roomToken: string) => {
    setRoomName(roomToken);
    // Push the room token to URL to make the URL shareable immediately if they didn't join via link
    window.history.replaceState(null, '', `?room=${roomToken}`);
    socket.emit('join_room', { roomName: roomToken, password: roomToken, playerName: name });
  };

  const toggleReady = () => {
    socket.emit('toggle_ready', { roomName });
  };

  const startGame = () => {
    socket.emit('start_game', { roomName });
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

    // Direct move execution without selection step
    socket.emit('make_move', { roomName, colIndex });

  }, [gameStatus, myColor, currentPlayer, roomName, playerCount]);

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
            <div className="mt-4 bg-white/90 backdrop-blur-md px-8 py-3 rounded-2xl shadow-md border-2 border-white/60 text-xl transform scale-110">
              <span className="text-black mr-3 font-bold">Du bist:</span>
              <span className={`font-black uppercase tracking-widest ${myColor === Player.Red ? 'text-red-600 drop-shadow-sm' : 'text-yellow-600 drop-shadow-sm'}`}>
                {myColor}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* HAUPT BEREICH (Board / Lobby) - Nimmt restlichen Platz ein und zentriert */}
      <div className="flex-grow flex flex-col justify-center items-center w-full px-2 py-2 overflow-hidden relative">

        {gameStatus === GameStatus.Lobby && (
          <Lobby
            players={players}
            roomName={roomName}
            onJoin={joinRoom}
            onToggleReady={toggleReady}
            onStartGame={startGame}
          />
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
              currentPlayer={currentPlayer}
            />


          </div>
        )}
      </div>

      {/* Fullscreen Button (Start) */}
      <button
        onClick={toggleFullScreen}
        className="flex-none mb-2 z-50 bg-white/40 hover:bg-white/60 text-black px-8 py-3 rounded-full backdrop-blur-md transition-all shadow-xl border-2 border-white/50 hover:scale-105 active:scale-95 flex items-center gap-3 self-center"
        title="Vollbild umschalten"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
        <span className="text-lg font-bold tracking-wider uppercase">Full-Screen</span>
      </button>
      {/* Fullscreen Button (End) */}

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
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-black font-bold rounded-2xl transition shadow-md border border-slate-200 text-sm"
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