import React, { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { chipsToRupees } from '@/utils/currency';

interface ActionPanelProps {
  roomId: string;
  canAct: boolean;
  currentHighestBet: number;
  lastRaiseAmount: number;
  playerBet: number;
  playerChips: number;
  gameType?: 'FAKE' | 'REAL';
  entryAmount?: number;
  isMobile?: boolean;
  turnDeadline?: number; // epoch ms when the current turn expires
}

// ── Turn Countdown Ring ───────────────────────────────────────────────────────
const TurnTimer = ({ deadline, urgent }: { deadline: number; urgent: boolean }) => {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
  );

  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [deadline]);

  const TOTAL = 30;
  const r = 14;
  const circumference = 2 * Math.PI * r;
  const fraction = Math.min(1, secondsLeft / TOTAL);
  const dashOffset = circumference * (1 - fraction);
  const isUrgent = urgent || secondsLeft <= 10;
  const color = isUrgent ? '#ff2f92' : '#24f59f';

  return (
    <div className="flex flex-none items-center gap-1">
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90 flex-none">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.5s' }}
        />
      </svg>
      <span
        className={`min-w-[22px] font-arcade text-xs font-black tabular-nums ${
          isUrgent ? 'animate-pulse text-[#ff2f92]' : 'text-[#24f59f]'
        }`}
      >
        {secondsLeft}s
      </span>
    </div>
  );
};

export const ActionPanel = ({
  roomId, canAct, currentHighestBet, lastRaiseAmount,
  playerBet, playerChips, gameType, entryAmount, isMobile = false,
  turnDeadline = 0
}: ActionPanelProps) => {
  const { socket } = useSocket();
  const callAmount = Math.min(currentHighestBet - playerBet, playerChips);
  const minRaise = currentHighestBet + (lastRaiseAmount || 20);
  const [raiseVal, setRaiseVal] = useState(Math.min(minRaise, playerChips + playerBet));

  useEffect(() => {
    const nextMin = currentHighestBet + (lastRaiseAmount || 20);
    setRaiseVal(Math.min(nextMin, playerChips + playerBet));
  }, [currentHighestBet, lastRaiseAmount, playerChips, playerBet]);

  const emit = useCallback((action: string, amount?: number) => {
    socket?.emit('action', { roomId, action, amount });
  }, [socket, roomId]);

  const isAllIn = raiseVal >= playerChips + playerBet;
  const showTimer = turnDeadline > 0;

  // ── Waiting state ──────────────────────────────────────────────────────────
  if (!canAct) {
    return (
      <div className={`flex w-full flex-col items-center justify-center gap-3 border-t-2 border-black bg-[#090813]/95 backdrop-blur-xl
        ${isMobile ? 'h-[94px]' : 'py-3'}`}>
        <div className="flex items-center gap-3">
          <span className="font-arcade text-[10px] font-black uppercase tracking-[0.24em] text-stone-500 md:text-xs">
            Waiting for turn
          </span>
          {showTimer && <TurnTimer deadline={turnDeadline} urgent={false} />}
        </div>
      </div>
    );
  }

  // ── Mobile Layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="safe-area-bottom flex h-[94px] w-full flex-col justify-between border-t-2 border-black bg-[#090813]/95 px-2 pb-2 pt-2 backdrop-blur-xl">
        {/* Timer + Slider row */}
        <div className="flex items-center gap-2 px-1">
          {showTimer && <TurnTimer deadline={turnDeadline} urgent />}
          <span className="flex-none font-arcade text-[9px] font-black uppercase tracking-wider text-stone-400">Raise</span>
          <input
            type="range"
            min={Math.min(minRaise, playerChips + playerBet)}
            max={playerChips + playerBet}
            step={10}
            value={raiseVal}
            onChange={e => setRaiseVal(Number(e.target.value))}
            className="flex-1 accent-[#24f59f]"
            style={{ height: 4 }}
          />
          <span className="flex-none font-arcade text-[10px] font-black text-[#24f59f]">
            ${raiseVal}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* FOLD */}
          <button
            onClick={() => emit('fold')}
            className="border-2 border-black bg-[#ff2f92] py-2.5 text-xs font-black uppercase text-white shadow-[3px_3px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Fold
          </button>

          {/* CHECK / CALL */}
          {callAmount === 0 ? (
            <button
              onClick={() => emit('check')}
              className="border-2 border-black bg-[#39e8ff] py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => emit('call')}
              className="flex flex-col items-center gap-0 border-2 border-black bg-[#39e8ff] py-2.5 text-[11px] font-black uppercase text-black shadow-[3px_3px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>Call</span>
              <span className="font-arcade text-[9px] text-black/70">${callAmount}</span>
            </button>
          )}

          {/* RAISE / ALL-IN */}
          <button
            onClick={() => emit('raise', raiseVal)}
            className={`flex flex-col items-center gap-0 border-2 border-black py-2.5 text-[11px] font-black uppercase shadow-[3px_3px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
              ${isAllIn
                ? 'bg-[#8b5cf6] text-white'
                : 'bg-[#24f59f] text-black'
              }`}
          >
            <span>{isAllIn ? '⚡ All-In' : 'Raise'}</span>
            {!isAllIn && <span className="font-arcade text-[9px] text-black/70">${raiseVal}</span>}
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop Layout ─────────────────────────────────────────────────────────
  return (
    <div className="w-full border-t-2 border-black bg-[#090813]/95 px-6 py-4 backdrop-blur-xl">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {/* Raise slider + timer */}
        <div className="flex items-center gap-4 border-2 border-black bg-black/45 px-4 py-2 shadow-[5px_5px_0_#000]">
          <span className="flex-none font-arcade text-xs font-black uppercase tracking-widest text-stone-400">
            Raise amount
          </span>
          <input
            type="range"
            min={Math.min(minRaise, playerChips + playerBet)}
            max={playerChips + playerBet}
            step={10}
            value={raiseVal}
            onChange={e => setRaiseVal(Number(e.target.value))}
            className="flex-1 accent-[#24f59f]"
          />
          <div className="flex-none text-right">
            <span className="font-arcade text-sm font-black text-[#24f59f]">
              ${raiseVal.toLocaleString()}
            </span>
            {gameType === 'REAL' && (
              <p className="text-[10px] font-medium text-[#24f59f]/55">
                {chipsToRupees(raiseVal, entryAmount || 0)}
              </p>
            )}
          </div>
          {/* Turn countdown ring — visible to the active player */}
          {showTimer && <TurnTimer deadline={turnDeadline} urgent />}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => emit('fold')}
            className="eob-button bg-[#ff2f92] py-3.5 text-sm font-black uppercase text-white"
          >
            Fold
          </button>

          {callAmount === 0 ? (
            <button
              onClick={() => emit('check')}
              className="eob-button bg-[#39e8ff] py-3.5 text-sm font-black uppercase text-black"
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => emit('call')}
              className="eob-button flex flex-col items-center gap-0.5 bg-[#39e8ff] py-3.5 text-sm font-black uppercase text-black"
            >
              <span>Call ${callAmount}</span>
              {gameType === 'REAL' && (
                <span className="text-[10px] font-medium opacity-70 normal-case">
                  {chipsToRupees(callAmount, entryAmount || 0)}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => emit('raise', raiseVal)}
            className={`eob-button flex flex-col items-center gap-0.5 py-3.5 text-sm font-black uppercase
              ${isAllIn
                ? 'bg-[#8b5cf6] text-white'
                : 'bg-[#24f59f] text-black'
              }`}
          >
            <span>{isAllIn ? '⚡ All-In' : `Raise $${raiseVal.toLocaleString()}`}</span>
            {gameType === 'REAL' && !isAllIn && (
              <span className="text-[10px] font-medium opacity-70 normal-case">
                {chipsToRupees(raiseVal, entryAmount || 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
