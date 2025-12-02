// server.js
// Dies ist das Backend. Starte es mit: node server.js

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup für Dateipfade in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Server statische Dateien aus dem "dist" Ordner (wo React hin gebaut wird)
app.use(express.static(path.join(__dirname, 'dist')));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- SPIEL LOGIK IM BACKEND ---
const ROWS = 6;
const COLS = 7;
const WIN_LENGTH = 4;

function createEmptyBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

function getLowestEmptyRow(board, colIndex) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][colIndex] === null) {
      return row;
    }
  }
  return null;
}

function checkWin(board, lastRow, lastCol, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    const winningCells = [[lastRow, lastCol]];

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow + dr * i;
      const c = lastCol + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.push([r, c]);
      } else break;
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow - dr * i;
      const c = lastCol - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.push([r, c]);
      } else break;
    }
    if (count >= WIN_LENGTH) return { winner: player, isDraw: false, winningCells };
  }
  const isFull = board.every(row => row.every(cell => cell !== null));
  if (isFull) return { winner: null, isDraw: true, winningCells: null };
  return { winner: null, isDraw: false, winningCells: null };
}

// Speicher für alle laufenden Spiele
const rooms = {}; 

io.on('connection', (socket) => {
  console.log('Ein Spieler hat sich verbunden:', socket.id);

  socket.on('join_room', ({ roomName, password }) => {
    // Raum Logik
    if (!rooms[roomName]) {
      // Neuen Raum erstellen
      rooms[roomName] = {
        password,
        board: createEmptyBoard(),
        currentPlayer: 'Rot', // Rot beginnt immer Runde 1
        roundStarter: 'Rot',
        players: [],
        scores: { 'Rot': 0, 'Gelb': 0 },
        gameStatus: 'PLAYING',
        winningCells: null,
        winner: null
      };
    }

    const room = rooms[roomName];

    // Passwort Check
    if (room.password !== password) {
      socket.emit('error_message', 'Falsches Passwort!');
      return;
    }

    // Spieler Limit Check
    if (room.players.length >= 2) {
      // Prüfen ob der Socket schon drin ist (Reconnect)
      const isAlreadyIn = room.players.find(p => p.id === socket.id);
      if (!isAlreadyIn) {
        socket.emit('error_message', 'Raum ist voll!');
        return;
      }
    }

    // Spieler zum Raum hinzufügen
    if (!room.players.find(p => p.id === socket.id)) {
      const color = room.players.length === 0 ? 'Rot' : 'Gelb';
      room.players.push({ id: socket.id, color });
      socket.join(roomName);
      
      // Dem Spieler sagen, welche Farbe er ist
      socket.emit('player_assigned', color);
    } else {
       // Reconnect Fall: Farbe wiederfinden
       const p = room.players.find(p => p.id === socket.id);
       socket.emit('player_assigned', p.color);
    }

    // Update an alle im Raum senden
    io.to(roomName).emit('game_update', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      scores: room.scores,
      gameStatus: room.gameStatus,
      winningCells: room.winningCells,
      winner: room.winner,
      playerCount: room.players.length
    });
  });

  socket.on('make_move', ({ roomName, colIndex }) => {
    const room = rooms[roomName];
    if (!room) return;

    // Validierungen
    if (room.gameStatus !== 'PLAYING') return;
    
    // Prüfen ob der Spieler der dran ist auch der Sender ist
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.color !== room.currentPlayer) return;

    // Zug ausführen
    const rowIndex = getLowestEmptyRow(room.board, colIndex);
    if (rowIndex === null) return; // Spalte voll

    room.board[rowIndex][colIndex] = player.color;

    // Sieg prüfen
    const result = checkWin(room.board, rowIndex, colIndex, player.color);

    if (result.winner) {
      room.gameStatus = 'FINISHED';
      room.winningCells = result.winningCells;
      room.winner = result.winner;
      room.scores[result.winner]++;
    } else if (result.isDraw) {
      room.gameStatus = 'FINISHED';
      room.winner = null; // Unentschieden
    } else {
      // Spieler wechseln
      room.currentPlayer = room.currentPlayer === 'Rot' ? 'Gelb' : 'Rot';
    }

    io.to(roomName).emit('game_update', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      scores: room.scores,
      gameStatus: room.gameStatus,
      winningCells: room.winningCells,
      winner: room.winner,
      playerCount: room.players.length
    });
  });

  socket.on('next_round', ({ roomName }) => {
    const room = rooms[roomName];
    if (!room) return;

    // Reset Brett
    room.board = createEmptyBoard();
    room.winningCells = null;
    room.winner = null;
    room.gameStatus = 'PLAYING';

    // Abwechselnd beginnen
    room.roundStarter = room.roundStarter === 'Rot' ? 'Gelb' : 'Rot';
    room.currentPlayer = room.roundStarter;

    io.to(roomName).emit('game_update', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      scores: room.scores,
      gameStatus: room.gameStatus,
      winningCells: room.winningCells,
      winner: room.winner,
      playerCount: room.players.length
    });
  });
  
  socket.on('reset_scores', ({ roomName }) => {
    const room = rooms[roomName];
    if (!room) return;
    room.scores = { 'Rot': 0, 'Gelb': 0 };
    io.to(roomName).emit('game_update', {
        // ... restliche Daten mitsenden, damit Frontend nicht crasht
        board: room.board,
        currentPlayer: room.currentPlayer,
        scores: room.scores,
        gameStatus: room.gameStatus,
        winningCells: room.winningCells,
        winner: room.winner,
        playerCount: room.players.length
    });
  });

  
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    // Optional: Spieler aus Raum entfernen oder Spiel pausieren
  });
});

// ALLE anderen Anfragen an React weiterleiten
app.get('*', (req, res) => {
  // Wenn wir im "dist" Ordner keine Datei finden (z.B. bei einem Refresh auf einer Unterseite),
  // senden wir die index.html zurück, damit React das Routing übernimmt.
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(3001, () => {
  console.log('SERVER LÄUFT AUF PORT 3001');
});