/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { PlayerSeat } from './PlayerSeat';
import { PlayingCard } from './PlayingCard';
import { ActionPanel } from './ActionPanel';
import { useSocket } from '@/context/SocketContext';
import { LogOut, History, Maximize2, Users, Play, BookOpen, Copy } from 'lucide-react';
import { chipsToRupees } from '@/utils/currency';
import { SettlementModal } from './SettlementModal';
import { HandRankingsPanel } from './HandRankingsPanel';
import { useRouter } from 'next/navigation';

/*
  Seat layout — players sit OUTSIDE the rectangular table.
  All positions are absolute within the arena container.

  Desktop (6 seats):          Mobile (6 seats):
    [3]   [4]   [5]             [3]  [4]  [5]
  [2]  ┌────────┐  [6]       [2] ┌──────┐ [6]
       │ Table  │               │Table │
  [1]  └────────┘ (empty)    [1] └──────┘ (same)
         [Hero]                    [Hero]
*/

// 6 seat positions as CSSProperties.
// Index 0 = Hero (bottom-center), 1-5 = opponents going counter-clockwise.
const buildPositions = (mobile: boolean): React.CSSProperties[] => {
  if (mobile) {
    return [
      // Hero — bottom center
      { bottom: 2, left: '50%', transform: 'translateX(-50%)' },
      // Bottom-left (moved inward slightly)
      { bottom: '18%', left: 2 },
      // Top-left (moved inward slightly)
      { top: '18%', left: 2 },
      // Top-center — pushed down so cards are always visible
      { top: '6%', left: '50%', transform: 'translateX(-50%)' },
      // Top-right (closer to table)
      { top: '18%', right: '10%' },
      // Bottom-right (closer to table)
      { bottom: '18%', right: '10%' },
    ];
  }
  return [
    // Hero — bottom center
    { bottom: 8, left: '50%', transform: 'translateX(-50%)' },
    // Bottom-left
    { bottom: '16%', left: 16 },
    // Top-left
    { top: '16%', left: 16 },
    // Top-center (direct opponent)
    { top: 8, left: '50%', transform: 'translateX(-50%)' },
    // Top-right
    { top: '16%', right: 16 },
    // Bottom-right
    { bottom: '16%', right: 16 },
  ];
};

export const PokerTable = ({
  gameState,
  roomId,
  currentUserId
}: {
  gameState: any;
  roomId: string;
  currentUserId: string;
}) => {
  const { socket } = useSocket();
  const router = useRouter();
  const userId = currentUserId;
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleLeave = () => {
    if (window.confirm('Leave the match?')) {
      socket?.emit('leave_room', { roomId });
      router.push('/');
    }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };
  const handleCopyRoom = async () => {
    await navigator.clipboard?.writeText(roomId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 1400);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('error', (err: any) => {
      console.error('[Socket Error]', err);
    });
    return () => {
      socket.off('error');
    };
  }, [socket]);

  // Rotate so Hero is always index 0
  const heroIdx = gameState.players.findIndex((p: any) => p.id === userId);
  const seatedPlayers: (any | null)[] = Array(6).fill(null);
  gameState.players.forEach((p: any, i: number) => {
    const slot = heroIdx === -1 ? i : (i - heroIdx + gameState.players.length) % gameState.players.length;
    if (slot < 6) seatedPlayers[slot] = p;
  });

  const heroPlayer = gameState.players.find((p: any) => p.id === userId);
  const isHeroTurn =
    gameState.players[gameState.currentTurnIndex]?.id === userId &&
    gameState.state !== 'waiting' &&
    gameState.state !== 'showdown';

  const positions = buildPositions(isMobile);
  const gameLabel = gameState.gameName === 'TEEN_PATTI' ? 'Teen Patti' : "Texas Hold'em";

  return (
    <div className="arcade-grid-room scanline flex min-h-0 flex-1 flex-col overflow-hidden bg-[#07070f]">

      {/* ═══ HEADER ══════════════════════════════════════ */}
      <header className={`relative z-40 flex-none border-b-2 border-black bg-[#fff8ec] text-black hard-shadow-sm flex items-center justify-between
        ${isMobile ? 'px-2 py-1.5' : 'px-5 py-2'}`}>

        <div className="flex items-center gap-2">
          {/* Room pill */}
          <button onClick={handleCopyRoom} className={`group flex flex-col border-2 border-black bg-[#24f59f] leading-none shadow-[4px_4px_0_#000] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]
            ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'}`}>
            <span className="flex items-center gap-1 font-arcade text-[8px] font-black uppercase tracking-widest text-black/55">
              {copiedRoom ? 'Copied' : 'Room'} <Copy size={isMobile ? 8 : 10} className="opacity-60 group-hover:opacity-100" />
            </span>
            <span className={`font-arcade font-black leading-none text-black ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {roomId}
            </span>
          </button>
          {gameState.gameType === 'REAL' && (
            <span className={`border-2 border-black bg-[#ffe84d] font-arcade font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#000]
              ${isMobile ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-3 py-1.5'}`}>
              ₹{gameState.entryAmount}
            </span>
          )}
          <span className={`border-2 border-black bg-[#ff2f92] font-arcade font-black uppercase tracking-widest text-white shadow-[4px_4px_0_#000]
            ${isMobile ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-3 py-1.5'}`}>
            {gameLabel}
          </span>
        </div>

        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {[
          { icon: <Maximize2 size={isMobile ? 12 : 14} />, onClick: toggleFullscreen, label: null, style: 'bg-[#39e8ff] text-black' },
            { icon: <BookOpen size={isMobile ? 12 : 14} />, onClick: () => setIsRankingsOpen(true), label: 'Guide', style: 'bg-[#24f59f] text-black' },
            { icon: <History size={isMobile ? 12 : 14} />, onClick: () => setIsSettlementOpen(true), label: 'History', style: 'bg-[#ffe84d] text-black' },
            { icon: <LogOut size={isMobile ? 12 : 14} />, onClick: handleLeave, label: 'Leave', style: 'bg-[#ff2f92] text-white' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick}
              className={`border-2 border-black transition shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] ${btn.style}
                ${isMobile ? 'p-1.5' : 'px-3 py-1.5 flex items-center gap-1.5'}`}>
              {btn.icon}
              {!isMobile && btn.label && <span className="font-arcade text-[10px] font-black uppercase tracking-wider">{btn.label}</span>}
            </button>
          ))}
        </div>
      </header>

      <SettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        settlements={gameState.settlements || []}
        instructions={gameState.instructions || []}
        entryAmount={gameState.entryAmount}
        gameType={gameState.gameType}
      />

      <HandRankingsPanel
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />

      {/* ═══ ARENA ══════════════════════════════════════ */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="absolute left-8 top-8 hidden border-2 border-black bg-[#ffe84d] px-4 py-2 font-arcade text-[10px] font-black uppercase tracking-[0.2em] text-black hard-shadow md:block">
          Viewer Influence Loop Ready
        </div>
        <div className="absolute bottom-8 right-8 hidden border-2 border-black bg-[#8b5cf6] px-4 py-2 font-arcade text-[10px] font-black uppercase tracking-[0.2em] text-white hard-shadow md:block">
          Airdrop Arcade
        </div>

        {/* ── RECTANGULAR FELT TABLE ───────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center justify-center overflow-hidden border-2 border-black orbital-glow"
          style={{
            width:  isMobile ? '62%' : '62%',
            height: isMobile ? '48%' : '58%',
            minWidth:  isMobile ? 190 : 430,
            minHeight: isMobile ? 116 : 260,
            borderRadius: isMobile ? 24 : 38,
            background: 'radial-gradient(circle at 50% 38%, rgba(57,232,255,0.24), transparent 34%), linear-gradient(135deg, #14204a 0%, #101126 42%, #170b2d 100%)',
            boxShadow: '10px 10px 0 #000, 0 20px 70px rgba(0,0,0,0.68), inset 0 0 0 10px rgba(36,245,159,0.18), inset 0 0 60px rgba(255,47,146,0.16)',
          }}
        >
          {/* Felt inner border */}
          <div className="pointer-events-none absolute rounded-[28px] border-2 border-white/10"
            style={{ inset: isMobile ? 4 : 8 }} />
          <div className="arcade-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Pot — main pot or multiple side pots */}
          {gameState.pot > 0 && (
            <div className={`relative z-10 flex items-center gap-1.5 border-2 border-black bg-[#ffe84d] text-black shadow-[5px_5px_0_#000]
              ${isMobile ? 'px-2 py-0.5 mb-1' : 'px-4 py-1.5 mb-3'}`}>
              <div className={`rounded-full bg-black ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
              <span className={`font-arcade font-black ${isMobile ? 'text-[10px]' : 'text-base'}`}>
                ${gameState.pot.toLocaleString()}
              </span>
              {gameState.gameType === 'REAL' && !isMobile && (
                <span className="text-[10px] font-black text-black/55">
                  ({chipsToRupees(gameState.pot, gameState.entryAmount)})
                </span>
              )}
            </div>
          )}

          {/* Side pot breakdown (shown when there are multiple pots) */}
          {!isMobile && gameState.sidePots && gameState.sidePots.length > 1 && (
            <div className="flex gap-1 mb-1">
              {gameState.sidePots.map((sp: any, i: number) => (
                <span key={i} className="border border-white/15 bg-black/50 px-1.5 py-0.5 font-arcade text-[8px] text-stone-300">
                  {i === 0 ? 'main' : 'side'} ${sp.amount}
                </span>
              ))}
            </div>
          )}

          {/* Community cards */}
          <div className={`z-10 flex justify-center ${isMobile ? 'gap-0.5' : 'gap-3'}`}>
            {gameState.communityCards?.map((card: any, idx: number) => (
              <PlayingCard key={idx} rank={card.rank} suit={card.suit}
                revealAllCards={false} delay={idx * 0.08}
                size={isMobile ? 'md' : 'xl'} />
            ))}
          </div>

          {/* Waiting overlay */}
          {gameState.state === 'waiting' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/55 px-4 backdrop-blur-[2px]">
              <p className={`border-2 border-black bg-[#fff8ec] px-4 py-2 font-arcade font-black uppercase tracking-widest text-black hard-shadow-sm ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                {gameState.players.length} / {gameState.maxPlayers || 6} Players
              </p>
              <div className="flex gap-2 items-center justify-center">
                {gameState.players.length >= 2 ? (
                  <button onClick={() => socket?.emit('start_game', { roomId })}
                    className={`eob-button flex items-center gap-1 bg-[#24f59f] font-black uppercase text-black
                      ${isMobile ? 'px-3 py-1 text-[10px]' : 'px-6 py-2 text-sm'}`}>
                    <Play size={isMobile ? 10 : 14} fill="currentColor" /> START
                  </button>
                ) : (
                  <span className={`flex items-center gap-1 border-2 border-black bg-black/80 font-arcade font-black uppercase text-stone-300 shadow-[4px_4px_0_#000]
                    ${isMobile ? 'px-2.5 py-1 text-[9px]' : 'px-5 py-2 text-xs'}`}>
                    <Users size={isMobile ? 9 : 12} /> Waiting
                  </span>
                )}
                
                {gameState.players.length < (gameState.maxPlayers || 6) && (
                  <button onClick={() => socket?.emit('add_bot', { roomId })}
                    className={`eob-button whitespace-nowrap bg-[#8b5cf6] font-black uppercase text-white
                      ${isMobile ? 'px-3 py-1 text-[10px]' : 'px-6 py-2 text-sm'}`}>
                    + Bot
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Winner banner */}
          {gameState.state === 'showdown' && gameState.winMessage && (
            <div className="pointer-events-none absolute inset-x-0 z-40 flex justify-center" style={{ top: isMobile ? -44 : -78 }}>
              <div className={`animate-bounce border-2 border-black bg-[#ffe84d] text-center font-black uppercase text-black shadow-[9px_9px_0_#000]
                ${isMobile ? 'max-w-[92vw] px-4 py-2 text-[10px]' : 'max-w-3xl px-8 py-4 text-xl'}`}>
                <span className="block font-arcade text-[9px] tracking-[0.28em] text-black/60 md:text-xs">Congratulations</span>
                <span className="block leading-tight">{gameState.winMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── PLAYER SEATS (all positioned in the arena, NOT inside the table) ── */}
        {positions.map((pos, idx) => {
          const p = seatedPlayers[idx];
          return (
            <div key={idx} className="absolute z-20" style={pos}>
              <PlayerSeat
                player={p}
                isCurrentTurn={!!p && gameState.state !== 'waiting' && gameState.players[gameState.currentTurnIndex]?.id === p.id}
                isDealer={!!p && gameState.players[gameState.dealerIndex]?.id === p.id}
                isWinner={!!p && !!gameState.winnerIds?.includes(p.id)}
                revealAllCards={gameState.state === 'showdown'}
                gameType={gameState.gameType}
                entryAmount={gameState.entryAmount}
                isMobile={isMobile}
              />
            </div>
          );
        })}
      </div>

      {/* ═══ ACTION PANEL ══════════════════════════════ */}
      {heroPlayer && gameState.state !== 'waiting' && (
        <div className="flex-none z-50">
          <ActionPanel
            roomId={roomId}
            canAct={isHeroTurn}
            currentHighestBet={gameState.currentHighestBet}
            lastRaiseAmount={gameState.lastRaiseAmount}
            playerBet={heroPlayer.currentBet}
            playerChips={heroPlayer.chips}
            gameType={gameState.gameType}
            entryAmount={gameState.entryAmount}
            isMobile={isMobile}
            turnDeadline={gameState.turnDeadline || 0}
          />
        </div>
      )}
    </div>
  );
};
