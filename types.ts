// Definiert die Spielerfarben
export enum Player {
  Red = 'Rot',
  Yellow = 'Gelb'
}

// Der Zustand einer einzelnen Zelle auf dem Brett
export type CellValue = Player | null;

// Das gesamte Spielfeld (6 Reihen x 7 Spalten)
export type BoardState = CellValue[][];

// Der aktuelle Status des Spiels
export enum GameStatus {
  Lobby = 'LOBBY',
  Menu = 'MENU',
  Playing = 'PLAYING',
  Finished = 'FINISHED'
}

// Ergebnis einer Prüfung auf Sieg
export interface WinResult {
  winner: Player | null;
  isDraw: boolean;
  winningCells: [number, number][] | null; // Koordinaten der gewinnenden Steine
}

// Spielerinformationen für die Lobby
export interface PlayerInfo {
  id: string;
  color: string;
  name: string;
  avatar: string;
  isMe: boolean;
}