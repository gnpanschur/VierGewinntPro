import React, { useState } from 'react';
import './Lobby.css';
import { PlayerInfo } from '../types';

interface LobbyProps {
  players: PlayerInfo[];
  roomName: string;
  onJoin: (name: string, roomToken: string) => void;
  onStartGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ players, roomName, onJoin, onStartGame }) => {
  const [joinName, setJoinName] = useState('');

  const inviteLink = `${window.location.origin}?room=${roomName}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert("Link kopiert! Schicke ihn an deine Freunde.");
    }).catch((err) => {
      console.error('Failed to copy link: ', err);
    });
  };

  const myPlayerInfo = players.find(p => p.isMe);
  const isJoined = !!myPlayerInfo;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinName.trim()) {
      onJoin(joinName.trim(), roomName);
    }
  };

  const totalPlayers = players.length;
  // Spiel startet nur mit genau 2 Spielern
  const canStart = totalPlayers === 2;
  const isCreator = players.length > 0 && players[0].isMe;

  const slots = [];
  // Wir zeigen immer 4 Slots an (auch wenn nur 2 spielen für die Optik)
  for (let i = 0; i < 4; i++) {
    const p = players[i];
    const isActive = !!p;

    slots.push(
      <div key={i} className={`slot ${isActive ? 'active' : ''}`}>
        <span className="avatar">{p ? p.avatar : '❓'}</span>
        <span className="player-name">{p ? p.name : 'Offen'}</span>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card" id="lobby-root">
        <div className="lobby-header">
          <h1>Multiplayer Lobby</h1>
          <p>Warte auf Mitspieler...</p>
        </div>

        <div className="invite-box">
          <input type="text" id="invite-link" readOnly value={inviteLink} />
          <button className="copy-btn" onClick={handleCopyLink}>Link kopieren</button>
        </div>

        <div className="player-grid" id="player-grid">
          {slots}
        </div>

        <div className="lobby-footer">
          {!isJoined ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-2">
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Dein Vorname"
                className="w-full bg-[#0f172a] text-white border-2 border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#10b981] transition-all font-bold"
                required
              />
              <button
                type="submit"
                className="start-btn enabled mt-2"
                disabled={!joinName.trim()}
              >
                Beitreten
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {isCreator ? (
                <button
                  className={`start-btn ${canStart ? 'enabled' : ''}`}
                  disabled={!canStart}
                  onClick={onStartGame}
                >
                  {canStart ? "Spiel starten!" : `Warte auf Mitspieler (${totalPlayers}/2)`}
                </button>
              ) : (
                <div className="text-center text-slate-300 font-medium py-3">
                  Warte darauf, dass der Host das Spiel startet...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};