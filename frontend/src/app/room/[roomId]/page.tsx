"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { PokerTable } from '@/components/PokerTable';
import { ArenaMonitoring } from '@/components/ArenaMonitoring';
import {
  buildGameCenterRedirectUrl,
  EMPIRE_POINTS_OPERATION,
  EMPIRE_REWARD_POINTS,
  getEmpireSession,
  updateWinnerPoints,
} from '@/lib/empireGameCenter';

type PlayerState = {
  id: string;
  username: string;
  isBot?: boolean;
};

type GameState = {
  state?: string;
  winnerIds?: string[];
  players?: PlayerState[];
  winMessage?: string;
} & Record<string, unknown>;

type RewardRedirectState = {
  points: number;
  countdown: number;
  playerWon: boolean;
};

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [error, setError] = useState('');
  const [rewardRedirect, setRewardRedirect] = useState<RewardRedirectState | null>(null);
  const awardedRoundsRef = useRef<Set<string>>(new Set());
  const redirectTimeoutRef = useRef<number | null>(null);
  const redirectCountdownRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const storedName = localStorage.getItem('poker_username') || 'Guest';
    const userId = localStorage.getItem('poker_userid') || Math.random().toString(36).substring(2, 9);
    const gameName = searchParams.get('game') === 'TEEN_PATTI' ? 'TEEN_PATTI' : 'POKER';
    const createRoom = searchParams.get('action') !== 'join';
    localStorage.setItem('poker_userid', userId);
    setCurrentUserId(userId);

    socket.emit('join_room', {
      roomId,
      userId,
      username: storedName,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedName}`,
      gameType: searchParams.get('mode') || 'FAKE',
      gameName,
      entryAmount: parseInt(searchParams.get('entry') || '0'),
      createRoom
    });

    socket.on('game_state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('error', (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('game_state');
      socket.off('error');
    };
  }, [socket, isConnected, roomId, searchParams]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      if (redirectCountdownRef.current) {
        window.clearInterval(redirectCountdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!gameState || gameState.state !== 'showdown' || !currentUserId) return;

    const winnerIds = gameState.winnerIds ?? [];
    if (winnerIds.length === 0) return;

    const currentPlayer = gameState.players?.find((player) => player.id === currentUserId);
    if (!currentPlayer || currentPlayer.isBot) return;

    const playerWon = winnerIds.includes(currentUserId);
    const awardKey = `${roomId}:${currentUserId}:${winnerIds.join(',')}:${gameState.winMessage ?? ''}`;
    if (awardedRoundsRef.current.has(awardKey)) return;

    const startRedirect = (won: boolean, points: number) => {
      setRewardRedirect({
        points,
        countdown: 3,
        playerWon: won,
      });

      if (redirectCountdownRef.current) {
        window.clearInterval(redirectCountdownRef.current);
      }
      redirectCountdownRef.current = window.setInterval(() => {
        setRewardRedirect((current) =>
          current
            ? {
                ...current,
                countdown: Math.max(0, current.countdown - 1),
              }
            : current,
        );
      }, 1000);

      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        window.location.href = buildGameCenterRedirectUrl(won, points);
      }, 3000);
    };

    awardedRoundsRef.current.add(awardKey);

    if (!playerWon) {
      startRedirect(false, 0);
      return;
    }

    const { wallet } = getEmpireSession();
    if (!wallet) {
      console.warn('Empire wallet missing; skipping winner points update.');
      return;
    }

    (async () => {
      try {
        await updateWinnerPoints(wallet, EMPIRE_REWARD_POINTS, EMPIRE_POINTS_OPERATION);

        startRedirect(true, EMPIRE_REWARD_POINTS);
      } catch (err) {
        console.error('Error updating points in backend:', err);
      }
    })();
  }, [gameState, currentUserId, roomId]);

  const rewardRedirectModal = rewardRedirect && (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-5 text-center backdrop-blur-md">
      <div className="neon-panel max-w-md border-2 border-black bg-[#fff8ec] p-6 text-black hard-shadow">
        <p className="font-arcade text-[10px] font-black uppercase tracking-[0.32em] text-[#ff2f92]">
          {rewardRedirect.playerWon ? 'Winner Reward Synced' : 'Game Result Synced'}
        </p>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">
          {rewardRedirect.playerWon ? `+${rewardRedirect.points} Points` : 'No Points Earned'}
        </h2>
        <p className={`mt-3 border-2 border-black px-4 py-3 font-arcade text-[11px] font-black uppercase tracking-[0.16em] hard-shadow-sm ${
          rewardRedirect.playerWon ? 'bg-[#24f59f]' : 'bg-[#ff2f92] text-white'
        }`}>
          Redirecting to game center in {rewardRedirect.countdown}s
        </p>
      </div>
    </div>
  );

  if (!gameState) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#07070f]">
        <ArenaMonitoring />
        {rewardRedirectModal}
        <div className="arcade-grid scanline flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center">
          <div className="relative grid h-24 w-24 place-items-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#24f59f]/20 border-t-[#24f59f]" />
            <div className="absolute inset-3 animate-ping rounded-full border border-[#ff2f92]/40" />
            <span className="font-arcade text-2xl font-black text-[#ffe84d]">PE</span>
          </div>
          <div>
            <p className="font-arcade text-[10px] font-black uppercase tracking-[0.35em] text-[#24f59f]">Poker Empire</p>
            <p className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white text-stroke-soft">Syncing Arena</p>
            <p className="mt-2 font-arcade text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Room {roomId}</p>
          </div>
          {error && (
            <p className="max-w-sm border-2 border-black bg-[#ff2f92] px-4 py-3 text-center font-arcade text-[10px] font-black uppercase tracking-[0.16em] text-white hard-shadow">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#07070f] select-none">
      <ArenaMonitoring />
      {rewardRedirectModal}
      {error && (
        <div className="absolute left-1/2 top-16 z-[60] -translate-x-1/2 animate-bounce whitespace-nowrap border-2 border-black bg-[#ff2f92] px-5 py-2 font-arcade text-[10px] font-black uppercase tracking-[0.18em] text-white hard-shadow">
          {error}
        </div>
      )}
      <PokerTable gameState={gameState} roomId={roomId} currentUserId={currentUserId} />
    </div>
  );
}
