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
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl shadow-blue-900/5 border border-white/60">
        
        {/* Player Red */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === Player.Yellow && !isFinished ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-2 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="font-bold text-red-600 uppercase tracking-wider text-xs md:text-sm">Rot</span>
          </div>
          <span className="text-4xl md:text-5xl font-black text-slate-800">{scoreRed}</span>
        </div>

        {/* Status Text Center */}
        <div className="px-2 md:px-8 text-center min-w-[120px]">
          {isFinished ? (
            winner ? (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200 shadow-sm animate-bounce">
                 <div className="text-sm uppercase font-bold tracking-widest mb-1">Gewinner</div>
                 <div className="text-xl md:text-2xl font-black">{winner}</div>
              </div>
            ) : (
              <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200">
                Unentschieden!
              </div>
            )
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Am Zug</span>
              <div className={`px-6 py-2 rounded-full font-bold shadow-lg transform transition-all duration-300 ${currentPlayer === Player.Red ? 'bg-red-500 text-white shadow-red-200 scale-110' : 'bg-yellow-400 text-yellow-900 shadow-yellow-200 scale-110'}`}>
                {currentPlayer}
              </div>
            </div>
          )}
        </div>

        {/* Player Yellow */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === Player.Red && !isFinished ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
             <span className="font-bold text-yellow-600 uppercase tracking-wider text-xs md:text-sm">Gelb</span>
             <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
          </div>
          <span className="text-4xl md:text-5xl font-black text-slate-800">{scoreYellow}</span>
        </div>

      </div>
    </div>
  );
};