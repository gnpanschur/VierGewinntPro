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

  socket.on('join_room', ({ roomName, password, playerName }) => {
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
        gameStatus: 'LOBBY',
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
    let player = room.players.find(p => p.id === socket.id);
    if (!player) {
      const color = room.players.length === 0 ? 'Rot' : 'Gelb';
      player = {
        id: socket.id,
        color,
        name: playerName || 'Spieler',
        ready: false,
        avatar: color === 'Rot' ? '🔴' : '🟡'
      };
      room.players.push(player);
      socket.join(roomName);

      // Dem Spieler sagen, welche Farbe er ist
      socket.emit('player_assigned', color);
    } else {
      // Reconnect Fall: Farbe wiederfinden
      socket.emit('player_assigned', player.color);
      if (playerName) player.name = playerName;
      socket.join(roomName);
    }

    // Update an alle im Raum senden
    io.to(roomName).emit('game_update', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      scores: room.scores,
      gameStatus: room.gameStatus,
      winningCells: room.winningCells,
      winner: room.winner,
      playerCount: room.players.length,
      players: room.players
    });
  });

  socket.on('toggle_ready', ({ roomName }) => {
    const room = rooms[roomName];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = !player.ready;

      io.to(roomName).emit('game_update', {
        board: room.board,
        currentPlayer: room.currentPlayer,
        scores: room.scores,
        gameStatus: room.gameStatus,
        winningCells: room.winningCells,
        winner: room.winner,
        playerCount: room.players.length,
        players: room.players
      });
    }
  });

  socket.on('start_game', ({ roomName }) => {
    const room = rooms[roomName];
    if (!room) return;

    if (room.players.length >= 2 && room.players.every(p => p.ready)) {
      room.gameStatus = 'PLAYING';
      io.to(roomName).emit('game_update', {
        board: room.board,
        currentPlayer: room.currentPlayer,
        scores: room.scores,
        gameStatus: room.gameStatus,
        winningCells: room.winningCells,
        winner: room.winner,
        playerCount: room.players.length,
        players: room.players
      });
    } else {
      socket.emit('error_message', 'Noch nicht alle bereit!');
    }
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
      playerCount: room.players.length,
      players: room.players
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
      playerCount: room.players.length,
      players: room.players
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
      playerCount: room.players.length,
      players: room.players
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);

    // Find all rooms the user was in and remove them
    for (const [roomName, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        room.gameStatus = 'LOBBY'; // Reset game status when someone leaves
        room.board = createEmptyBoard();

        if (room.players.length === 0) {
          // Clean up empty rooms
          delete rooms[roomName];
          console.log(`Room ${roomName} deleted because it's empty.`);
        } else {
          // Notify remaining players
          io.to(roomName).emit('game_update', {
            board: room.board,
            currentPlayer: room.currentPlayer,
            scores: room.scores,
            gameStatus: room.gameStatus,
            winningCells: room.winningCells,
            winner: room.winner,
            playerCount: room.players.length,
            players: room.players
          });
        }
      }
    }
  });
});

// ALLE anderen Anfragen an React weiterleiten.
// WICHTIG: Wir nutzen hier '/.*/' statt '*', um den "Missing parameter name" Fehler in neueren Express Versionen zu vermeiden.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// WICHTIG: Render vergibt den Port dynamisch über process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER LÄUFT AUF PORT ${PORT}`);
});
