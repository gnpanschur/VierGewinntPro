import React from 'react';
import { BoardState, CellValue, Player } from '../types';

interface BoardProps {
  board: BoardState;
  onColumnClick: (colIndex: number) => void;
  winningCells: [number, number][] | null;
  disabled: boolean;
  currentPlayer: Player;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onColumnClick,
  winningCells,
  disabled,
  currentPlayer
}) => {
  const isWinningCell = (row: number, col: number) => {
    if (!winningCells) return false;
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    // Das Board behält das Seitenverhältnis 7:6 bei und füllt maximal die Breite ODER Höhe
    <div className="relative w-full max-w-[95%] aspect-[7/6] max-h-[65vh]">
      <div className="w-full h-full p-2 bg-blue-600 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-b-8 border-blue-800 flex flex-col">

        {/* Das Gitter */}
        <div className="flex-1 flex gap-[1.5%] bg-blue-500 p-[2%] rounded-xl border-4 border-blue-400/50 shadow-inner h-full">
          {board[0].map((_, colIndex) => {

            return (
              <div
                key={colIndex}
                className={`flex-1 flex flex-col justify-between group ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => !disabled && onColumnClick(colIndex)}
              >


                {board.map((row, rowIndex) => {
                  const cell = row[colIndex];
                  const isWinner = isWinningCell(rowIndex, colIndex);

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        relative w-full aspect-square rounded-full bg-blue-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] overflow-hidden
                      `}
                    >
                      {/* Der Stein */}
                      {cell && (
                        <div
                          className={`
                            w-full h-full rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)]
                            border border-black/5
                            ${cell === Player.Red ? 'bg-red-500' : 'bg-yellow-400'}
                            ${isWinner ? 'animate-pulse brightness-110' : ''}
                          `}
                          style={{
                            animation: !isWinner ? 'dropIn 0.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'pulse 1s infinite',
                          }}
                        />
                      )}

                      {/* Gewinn-Indikator Ring */}
                      {isWinner && (
                        <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-50"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Füße des Spielbretts - rein dekorativ */}
      <div className="absolute -bottom-4 -left-2 w-[5%] h-[15%] bg-blue-700 rounded-b-lg -z-10 rotate-12" />
      <div className="absolute -bottom-4 -right-2 w-[5%] h-[15%] bg-blue-700 rounded-b-lg -z-10 -rotate-12" />

      <style>{`
        @keyframes dropIn {
          0% { transform: translateY(-500%); opacity: 0; }
          60% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(-10%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};