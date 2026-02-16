import React, { useState } from 'react';

interface LobbyProps {
  onJoin: (password: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Bitte ein Wort eingeben');
      return;
    }
    onJoin(password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500 w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 w-full">
        <h2 className="text-4xl font-black text-black mb-2 tracking-tight">Start</h2>
        <p className="text-black mb-8 font-medium">Vier Gewinnt Multiplayer</p>

        {/* Hinweis Textbox - HIER IST DER TEXT */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
          <p className="text-blue-800 text-sm italic font-medium leading-relaxed">
            "Ein Passwort eingeben, irgendeins – und dann bitte an den Mitspieler weitergeben, sonst bringt das Ganze nix."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-left">
            <label className="text-xs uppercase text-black font-bold ml-1 mb-1 block tracking-wider">Geheimes Wort</label>
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="z.B. Pizza123"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder-gray-400"
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Spiel Beitreten
          </button>
        </form>
      </div>
    </div>
  );
};