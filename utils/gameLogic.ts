import { BoardState, CellValue, Player, WinResult } from '../types';
import { ROWS, COLS, WIN_LENGTH } from '../constants';

// Erstellt ein leeres Spielfeld
export const createEmptyBoard = (): BoardState => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
};

// Findet die unterste freie Reihe in einer Spalte
export const getLowestEmptyRow = (board: BoardState, colIndex: number): number | null => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][colIndex] === null) {
      return row;
    }
  }
  return null;
};

// Prüft, ob das Spiel gewonnen wurde oder unentschieden ist
export const checkWin = (board: BoardState, lastRow: number, lastCol: number, player: Player): WinResult => {
  // Richtungen: [deltaRow, deltaCol]
  // Horizontal, Vertikal, Diagonal /, Diagonal \
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertikal
    [1, 1],  // Diagonal abwärts
    [1, -1]  // Diagonal aufwärts
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    const winningCells: [number, number][] = [[lastRow, lastCol]];

    // In positive Richtung prüfen
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow + dr * i;
      const c = lastCol + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.push([r, c]);
      } else {
        break;
      }
    }

    // In negative Richtung prüfen
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow - dr * i;
      const c = lastCol - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        winningCells.push([r, c]);
      } else {
        break;
      }
    }

    if (count >= WIN_LENGTH) {
      return { winner: player, isDraw: false, winningCells };
    }
  }

  // Prüfen auf Unentschieden (Brett voll)
  const isFull = board.every(row => row.every(cell => cell !== null));
  if (isFull) {
    return { winner: null, isDraw: true, winningCells: null };
  }

  return { winner: null, isDraw: false, winningCells: null };
};