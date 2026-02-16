import React, { useState } from 'react';

interface LobbyProps {
  onJoin: (password: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  // Create State
  const [creatorName, setCreatorName] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // Join State
  const [joinerName, setJoinerName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (opponentName.trim()) {
      onJoin(opponentName.trim().toLowerCase());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinerName.trim()) {
      onJoin(joinerName.trim().toLowerCase());
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] gap-3 md:gap-6 w-full max-w-md mx-auto p-2 pt-2 md:p-4 md:pt-8 animate-in fade-in zoom-in duration-500">

      {/* Header */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 mb-2 md:mb-4 drop-shadow-lg text-center leading-tight">
        VIER GEWINNT PRO
      </h1>

      {/* FELD A: BLAU (Spiel erstellen) */}
      <div className="flex-1 w-full bg-blue-100/90 backdrop-blur-md p-4 md:p-8 rounded-xl md:rounded-3xl shadow-xl shadow-blue-500/20 border-2 border-blue-200">
        <h2 className="text-lg md:text-3xl font-black text-black mb-3 md:mb-6 tracking-tight leading-none">Ich erstelle ein Spiel:</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-2 md:gap-4">
          <div>
            <label className="text-[10px] md:text-xs uppercase text-black font-bold ml-1 mb-0.5 block tracking-wider">1. Gib deinen Namen ein</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Dein Vorname"
              className="w-full bg-white border-2 border-blue-200 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-3 text-black font-bold text-sm md:text-lg focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label className="text-[10px] md:text-xs uppercase text-black font-bold ml-1 mb-0.5 block tracking-wider">2. Zwilling Name (Gegner)</label>
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Gegner Vorname"
              className="w-full bg-white border-2 border-blue-200 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-3 text-black font-bold text-sm md:text-lg focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!opponentName.trim()}
            className="mt-2 md:mt-4 w-full py-2.5 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg md:rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-xl uppercase tracking-wider"
          >
            Spiel erstellen
          </button>
        </form>
      </div>

      {/* FELD B: GELB (Spiel beitreten) */}
      <div className="flex-1 w-full bg-yellow-100/90 backdrop-blur-md p-4 md:p-8 rounded-xl md:rounded-3xl shadow-xl shadow-yellow-500/20 border-2 border-yellow-200">
        <h2 className="text-lg md:text-3xl font-black text-black mb-3 md:mb-6 tracking-tight leading-none">Ich spiele mit:</h2>

        <form onSubmit={handleJoin} className="flex flex-col gap-2 md:gap-4">
          <div>
            <label className="text-[10px] md:text-xs uppercase text-black font-bold ml-1 mb-0.5 block tracking-wider">1. Gib deinen Namen ein</label>
            <input
              type="text"
              value={joinerName}
              onChange={(e) => setJoinerName(e.target.value)}
              placeholder="Dein Vorname"
              className="w-full bg-white border-2 border-yellow-200 rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-3 text-black font-bold text-sm md:text-lg focus:outline-none focus:border-yellow-500 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!joinerName.trim()}
            className="mt-2 md:mt-4 w-full py-2.5 md:py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-lg md:rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-xl uppercase tracking-wider"
          >
            Beitreten
          </button>
        </form>
      </div>

    </div>
  );
};