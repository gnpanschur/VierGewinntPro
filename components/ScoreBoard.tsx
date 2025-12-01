import React from 'react';
import { Player } from '../types';

interface ScoreBoardProps {
  scoreRed: number;
  scoreYellow: number;
  currentPlayer: Player;
  isFinished: boolean;
  winner: Player | null;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ scoreRed, scoreYellow, currentPlayer, isFinished, winner }) => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto mb-6 px-4">
      {/* Score Cards */}
      <div className="flex justify-between items-center bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700">
        
        {/* Player Red */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === Player.Yellow && !isFinished ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <span className="font-bold text-red-400 uppercase tracking-wider text-sm md:text-base">Spieler Rot</span>
          </div>
          <span className="text-4xl font-black text-white">{scoreRed}</span>
        </div>

        {/* Status Text Center */}
        <div className="px-4 text-center">
          {isFinished ? (
            winner ? (
              <div className="text-xl md:text-2xl font-bold animate-pulse text-green-400">
                {winner} gewinnt! 🎉
              </div>
            ) : (
              <div className="text-xl md:text-2xl font-bold text-slate-400">
                Unentschieden!
              </div>
            )
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm uppercase mb-1">Am Zug</span>
              <div className={`px-4 py-1 rounded-full font-bold text-slate-900 ${currentPlayer === Player.Red ? 'bg-red-500' : 'bg-yellow-400'}`}>
                {currentPlayer}
              </div>
            </div>
          )}
        </div>

        {/* Player Yellow */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === Player.Red && !isFinished ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-1">
             <span className="font-bold text-yellow-400 uppercase tracking-wider text-sm md:text-base">Spieler Gelb</span>
             <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
          </div>
          <span className="text-4xl font-black text-white">{scoreYellow}</span>
        </div>

      </div>
    </div>
  );
};