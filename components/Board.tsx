import React from 'react';
import { BoardState, CellValue, Player } from '../types';

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
    <div className="p-3 md:p-4 bg-blue-600 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] inline-block mx-auto border-b-8 border-blue-800 relative">
      {/* Das Gitter */}
      <div className="flex gap-2 md:gap-3 bg-blue-500 p-2 md:p-3 rounded-2xl border-4 border-blue-400/50 shadow-inner">
        {board[0].map((_, colIndex) => {
          const isSelected = selectedColumn === colIndex;
          
          return (
            <div 
              key={colIndex} 
              className={`flex flex-col gap-2 md:gap-3 group ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => !disabled && onColumnClick(colIndex)}
            >
              {/* Spalten-Indikator oben (Pfeil statt nur Balken) */}
              {!disabled && (
                <div className={`flex justify-center h-4 transition-all duration-300 mb-1 hidden md:flex
                  ${isSelected ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                `}>
                   <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white drop-shadow-md"></div>
                </div>
              )}

              {board.map((row, rowIndex) => {
                const cell = row[colIndex];
                const isWinner = isWinningCell(rowIndex, colIndex);

                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-blue-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center transition-all
                      ${isSelected ? 'ring-4 ring-white/30 bg-blue-900' : ''}
                    `}
                  >
                    {/* Der echte Spielstein */}
                    {cell && (
                      <div 
                        className={`
                          w-full h-full rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)]
                          transition-transform duration-500 ease-bounce-in border-2 border-black/5
                          ${cell === Player.Red ? 'bg-red-500' : 'bg-yellow-400'}
                          ${isWinner ? 'ring-4 ring-white animate-pulse z-10 brightness-110' : ''}
                        `}
                        style={{ 
                          animation: !isWinner ? 'dropIn 0.5s' : 'none',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Füße des Spielbretts */}
      <div className="absolute -bottom-6 -left-4 w-6 h-20 bg-blue-700 rounded-b-xl -z-10 rotate-12 border-r border-blue-900/30" />
      <div className="absolute -bottom-6 -right-4 w-6 h-20 bg-blue-700 rounded-b-xl -z-10 -rotate-12 border-l border-blue-900/30" />
      
      <style>{`
        @keyframes dropIn {
          0% { transform: translateY(-600%); opacity: 0; }
          60% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(-20%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};