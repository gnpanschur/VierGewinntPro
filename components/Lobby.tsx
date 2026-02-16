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
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[60vh] gap-6 w-full max-w-4xl mx-auto p-4 animate-in fade-in zoom-in duration-500">

      {/* FELD A: BLAU (Spiel erstellen) */}
      <div className="flex-1 w-full bg-blue-100/90 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-blue-500/20 border-2 border-blue-200">
        <h2 className="text-3xl font-black text-black mb-6 tracking-tight">Ich erstelle ein Spiel:</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase text-black font-bold ml-1 mb-1 block tracking-wider">1. Gib deinen Namen ein</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Dein Vorname"
              className="w-full bg-white border-2 border-blue-200 rounded-xl px-4 py-3 text-black font-bold text-lg focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-black font-bold ml-1 mb-1 block tracking-wider">2. Gib den Namen des Gegners ein</label>
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Gegner Vorname"
              className="w-full bg-white border-2 border-blue-200 rounded-xl px-4 py-3 text-black font-bold text-lg focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!opponentName.trim()}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xl uppercase tracking-wider"
          >
            Spiel erstellen
          </button>
        </form>
      </div>

      {/* FELD B: GELB (Spiel beitreten) */}
      <div className="flex-1 w-full bg-yellow-100/90 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-yellow-500/20 border-2 border-yellow-200">
        <h2 className="text-3xl font-black text-black mb-6 tracking-tight">Ich spiele mit:</h2>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase text-black font-bold ml-1 mb-1 block tracking-wider">1. Gib deinen Namen ein</label>
            <input
              type="text"
              value={joinerName}
              onChange={(e) => setJoinerName(e.target.value)}
              placeholder="Dein Vorname"
              className="w-full bg-white border-2 border-yellow-200 rounded-xl px-4 py-3 text-black font-bold text-lg focus:outline-none focus:border-yellow-500 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!joinerName.trim()}
            className="mt-4 w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xl uppercase tracking-wider"
          >
            Beitreten
          </button>
        </form>
      </div>

    </div>
  );
};