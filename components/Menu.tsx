import React from 'react';

interface MenuProps {
  onStart: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 mb-8 drop-shadow-lg">
        VIER GEWINNT
      </h1>
      <p className="text-slate-300 text-xl mb-12 max-w-md">
        Das klassische Strategiespiel für zwei Personen. Wer zuerst 4 Steine in einer Reihe hat, gewinnt!
      </p>
      
      <button
        onClick={onStart}
        className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95"
      >
        <span className="relative z-10">Spiel Starten</span>
        <div className="absolute inset-0 h-full w-full rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
      </button>

      <div className="mt-16 flex gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500 shadow-lg animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-12 h-12 rounded-full bg-yellow-400 shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-12 h-12 rounded-full bg-red-500 shadow-lg animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-12 h-12 rounded-full bg-yellow-400 shadow-lg animate-bounce" style={{ animationDelay: '0.6s' }}></div>
      </div>
    </div>
  );
};