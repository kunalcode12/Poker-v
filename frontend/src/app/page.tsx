"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Spade, Diamond, Club, Heart, LogIn, Plus } from 'lucide-react';
import { persistEmpireSessionFromSearch } from '@/lib/empireGameCenter';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Game selection state
  const [selectedGame, setSelectedGame] = useState<'POKER'>('POKER');

  // Real Money Mode states
  const [gameMode, setGameMode] = useState<'FAKE' | 'REAL'>('FAKE');
  const [entryAmount, setEntryAmount] = useState('10');

  const createUserId = () => Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    persistEmpireSessionFromSearch(window.location.search);
  }, []);

  const handleAction = (type: 'create' | 'join') => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return alert('Enter a username to play!');

    persistEmpireSessionFromSearch(window.location.search);
    localStorage.setItem('poker_username', trimmedUsername);
    localStorage.setItem('poker_userid', createUserId());

    if (type === 'create') {
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      // We pass settings in query params for the first joiner (host) to initialize the room
      router.push(`/room/${code}?action=create&mode=${gameMode}&entry=${entryAmount}&game=${selectedGame}`);
    } else {
      const normalizedRoomCode = roomCode.trim().toUpperCase();
      if (!normalizedRoomCode) return alert('Enter a room code');
      router.push(`/room/${normalizedRoomCode}?action=join&game=${selectedGame}`);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-stone-50 arcade-grid scanline">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(36,245,159,0.12),transparent_34rem)]" />
      <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-[#ff2f92]/25 blur-[90px]" />
      <div className="absolute top-20 -right-24 h-96 w-96 rounded-full bg-[#24f59f]/20 blur-[100px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between border-b-2 border-black bg-[#fff8ec]/95 px-4 py-3 text-black hard-shadow md:px-5 md:py-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center border-2 border-black bg-[#24f59f] hard-shadow-sm md:h-14 md:w-14">
              <Spade className="h-6 w-6 md:h-7 md:w-7" fill="currentColor" />
            </div>
            <div className="leading-none">
              <p className="font-arcade text-[11px] font-black uppercase tracking-[0.32em] md:text-xs">Empire of Bits</p>
              <p className="text-2xl font-black uppercase tracking-tight md:text-3xl">Poker Empire</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 font-arcade text-xs font-black uppercase tracking-[0.24em] md:flex">
            <span>Arcade</span>
            <span>Solana</span>
            <span>Viewer Loop</span>
          </div>
          <button
            onClick={() => handleAction('create')}
            className="eob-button bg-[#8b5cf6] px-5 py-3 font-arcade text-[11px] font-black uppercase tracking-[0.18em] text-white md:text-xs"
          >
            Play Now
          </button>
        </nav>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 border-2 border-black bg-[#ff2f92] px-5 py-3 text-black hard-shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
              <span className="font-arcade text-[11px] font-black uppercase tracking-[0.24em] md:text-xs">
                Airdrop Arcade Table Live
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-5xl text-6xl font-black uppercase leading-[0.84] tracking-[-0.08em] text-[#fff8ec] text-stroke-soft sm:text-8xl lg:text-9xl">
                Poker Empire
                <span className="mt-3 block w-fit border-2 border-black bg-[#24f59f] px-4 pb-3 pt-1 text-black hard-shadow">
                  On Solana
                </span>
              </h1>
              <p className="max-w-3xl border-2 border-black bg-[#ffe84d] p-5 font-arcade text-sm font-black uppercase leading-relaxed tracking-[0.08em] text-black hard-shadow">
                Texas Hold&apos;em enters Empire of Bits: interoperable arcade sessions, shared reward energy, and future viewer-triggered chaos through the Viewer-Influence Loop.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['01', 'Create private arena'],
                ['02', 'Invite players or bots'],
                ['03', 'Play practice or real mode'],
              ].map(([num, text]) => (
                <div key={num} className="border-2 border-black bg-black/55 p-4 backdrop-blur-xl hard-shadow-sm">
                  <p className="font-arcade text-3xl font-black text-[#24f59f]">{num}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-stone-200">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -right-3 -top-3 hidden h-24 w-24 border-2 border-black bg-[#ff2f92] hard-shadow md:block" />
            <div className="absolute -bottom-4 -left-3 hidden h-24 w-32 rotate-3 border-2 border-black bg-[#ffe84d] hard-shadow md:block" />

            <div className="relative neon-panel noise-mask orbital-glow border-2 border-black p-4 hard-shadow md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-arcade text-[10px] font-black uppercase tracking-[0.3em] text-[#24f59f]">
                    Match Console
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-[-0.04em] text-white">
                    Enter The Table
                  </h2>
                </div>
                <div className="flex gap-1.5">
                  <Heart className="h-5 w-5 text-[#ff2f92]" fill="currentColor" />
                  <Diamond className="h-5 w-5 text-[#39e8ff]" fill="currentColor" />
                  <Club className="h-5 w-5 text-[#24f59f]" fill="currentColor" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block font-arcade text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
                    Player Handle
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-2 border-black bg-[#fff8ec] px-4 py-3 text-lg font-black text-black outline-none hard-shadow-sm placeholder:text-black/35 focus:bg-white"
                    placeholder="e.g. BitBandit"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-arcade text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
                    Game Cartridge
                  </label>
                  <button
                    onClick={() => setSelectedGame('POKER')}
                    className={`w-full border-2 border-black px-4 py-3 text-left font-black uppercase transition hard-shadow-sm ${
                      selectedGame === 'POKER'
                        ? 'bg-[#24f59f] text-black'
                        : 'bg-black/50 text-stone-400'
                    }`}
                  >
                    Texas Hold&apos;em Poker
                    <span className="block font-arcade text-[10px] tracking-[0.16em] opacity-70">
                      Live multiplayer table
                    </span>
                  </button>
                </div>

                <div>
                  <label className="mb-2 block font-arcade text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
                    Economy Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGameMode('FAKE')}
                      className={`eob-button px-4 py-3 text-sm font-black uppercase ${
                        gameMode === 'FAKE' ? 'bg-[#39e8ff] text-black' : 'bg-black text-stone-300'
                      }`}
                    >
                      Practice
                    </button>
                    <button
                      onClick={() => setGameMode('REAL')}
                      className={`eob-button px-4 py-3 text-sm font-black uppercase ${
                        gameMode === 'REAL' ? 'bg-[#ffe84d] text-black' : 'bg-black text-stone-300'
                      }`}
                    >
                      Real
                    </button>
                  </div>
                </div>

                {gameMode === 'REAL' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-black bg-[#151126] p-4 hard-shadow-sm"
                  >
                    <label className="mb-2 block font-arcade text-[10px] font-black uppercase tracking-[0.18em] text-[#ffe84d]">
                      Entry Amount
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={entryAmount}
                        onChange={(e) => setEntryAmount(e.target.value)}
                        className="min-w-0 flex-1 border-2 border-black bg-[#fff8ec] px-4 py-2 text-xl font-black text-black outline-none"
                      />
                      <span className="font-arcade text-[10px] font-black uppercase tracking-[0.12em] text-stone-300">
                        ₹{entryAmount} = 10k chips
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('create')}
                    className="eob-button flex items-center justify-center gap-2 bg-[#ff2f92] px-4 py-4 font-black uppercase text-white"
                  >
                    <Plus size={18} /> Create
                  </button>

                  <button
                    onClick={() => setIsJoining(!isJoining)}
                    className="eob-button flex items-center justify-center gap-2 bg-[#8b5cf6] px-4 py-4 font-black uppercase text-white"
                  >
                    <LogIn size={18} /> Join
                  </button>
                </div>

                {isJoining && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 flex gap-3 border-2 border-black bg-black/45 p-3 hard-shadow-sm">
                      <input
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="min-w-0 flex-1 border-2 border-black bg-[#fff8ec] px-4 py-3 font-arcade text-lg font-black tracking-[0.25em] text-black outline-none placeholder:tracking-[0.18em]"
                        placeholder="CODE"
                        maxLength={8}
                      />
                      <button
                        onClick={() => handleAction('join')}
                        className="eob-button bg-[#24f59f] px-5 py-3 font-black uppercase text-black"
                      >
                        Go
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="relative z-10 mb-2 overflow-hidden border-y-2 border-black bg-[#24f59f] py-3 text-black hard-shadow">
          <div className="flex w-max animate-[pulse_4s_ease-in-out_infinite] items-center gap-10 px-4 font-arcade text-sm font-black uppercase tracking-[0.18em]">
            <span>Play properties</span>
            <span>Collect pots</span>
            <span>Invite bots</span>
            <span>Win the table</span>
            <span>Viewer events coming soon</span>
          </div>
        </div>
      </div>
    </main>
  );
}
