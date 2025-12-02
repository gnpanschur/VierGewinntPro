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
      setError('Bitte Passwort eingeben');
      return;
    }
    onJoin(password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500 w-full max-w-md mx-auto">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700 w-full">
        <h2 className="text-3xl font-bold text-white mb-2">Lobby Login</h2>
        <p className="text-slate-400 mb-8">Vier Gewinnt Multiplayer</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="text-left">
            <label className="text-xs uppercase text-slate-500 font-bold ml-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Spiel Beitreten
          </button>
        </form>
      </div>
    </div>
  );
};