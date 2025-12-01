import React from 'react';
import { BoardState, CellValue, Player } from '../types';
import { getLowestEmptyRow } from '../utils/gameLogic';

interface BoardProps {
  board: BoardState;
  onColumnClick: (colIndex: number) => void;
  winningCells: [number, number][] | null;
  disabled: boolean;
  selectedColumn: number | null; // Für die "2 Taps" Logik
  currentPlayer: Player;
}

export const Board: React.FC<BoardProps> = ({ 
  board, 
  onColumnClick, 
  winningCells, 
  disabled, 
  selectedColumn,
  currentPlayer 
}) => {
  // Prüft ob eine Zelle Teil der Gewinnreihe ist
  const isWinningCell = (row: number, col: number) => {
    if (!winningCells) return false;
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="p-4 bg-blue-800 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] inline-block mx-auto border-4 border-blue-700 relative">
      {/* Das Gitter */}
      <div className="flex gap-2 md:gap-3 bg-blue-600 p-2 md:p-3 rounded-lg border-2 border-blue-500">
        {board[0].map((_, colIndex) => {
          const isSelected = selectedColumn === colIndex;
          
          return (
            <div 
              key={colIndex} 
              className={`flex flex-col gap-2 md:gap-3 group ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => !disabled && onColumnClick(colIndex)}
            >
              {/* Spalten-Indikator oben (Zeigt Auswahl an, statt Ghost-Stein) */}
              {!disabled && (
                <div className={`h-2 w-full rounded-full transition-all duration-300 mb-1 hidden md:block
                  ${isSelected ? 'bg-white opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'}
                `} />
              )}

              {board.map((row, rowIndex) => {
                const cell = row[colIndex];
                const isWinner = isWinningCell(rowIndex, colIndex);
                // Ghost Stein Logik wurde entfernt wie gewünscht.

                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-slate-900 shadow-inner overflow-hidden flex items-center justify-center transition-all
                      ${isSelected ? 'ring-2 ring-white/40 bg-slate-800' : ''}
                    `}
                  >
                    {/* Der echte Spielstein */}
                    {cell && (
                      <div 
                        className={`
                          w-full h-full rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3)]
                          transition-transform duration-500 ease-bounce-in
                          ${cell === Player.Red ? 'bg-red-500' : 'bg-yellow-400'}
                          ${isWinner ? 'ring-4 ring-white animate-pulse z-10' : ''}
                        `}
                        style={{ 
                          animation: !isWinner ? 'dropIn 0.5s' : 'none',
                        }}
                      />
                    )}
                    
                    {/* Glanz Effekt */}
                    {!cell && <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] pointer-events-none" />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Füße des Spielbretts */}
      <div className="absolute -bottom-4 -left-2 w-4 h-16 bg-blue-900 rounded-b-lg -z-10 rotate-12" />
      <div className="absolute -bottom-4 -right-2 w-4 h-16 bg-blue-900 rounded-b-lg -z-10 -rotate-12" />
      
      <style>{`
        @keyframes dropIn {
          0% { transform: translateY(-500%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};