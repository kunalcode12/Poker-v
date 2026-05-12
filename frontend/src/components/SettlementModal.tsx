import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, TrendingUp, History, ArrowRight, Users } from 'lucide-react';

interface Settlement {
  playerId: string;
  username: string;
  chipsAtExit: number;
  valueInRupees: number;
  netAmount: number;
  status: 'WIN' | 'LOSS';
  time: string;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export const SettlementModal = ({
  isOpen,
  onClose,
  settlements = [],
  instructions = [],
  entryAmount,
  gameType
}: {
  isOpen: boolean;
  onClose: () => void;
  settlements: Settlement[];
  instructions: Transaction[];
  entryAmount: number;
  gameType: 'FAKE' | 'REAL';
}) => {
  const [tab, setTab] = useState<'history' | 'payments'>('history');
  if (!isOpen) return null;

  const sorted = [...settlements].sort((a, b) => a.netAmount - b.netAmount);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-md sm:items-center sm:p-4 arcade-grid"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="neon-panel flex w-full flex-col border-2 border-black shadow-[10px_10px_0_#000] sm:max-w-lg"
          style={{ maxHeight: '88dvh' }}
        >
          {/* ── Header (fixed) ── */}
          <div className="flex-none flex items-center justify-between border-b-2 border-black bg-[#fff8ec] px-4 py-3 text-black">
            <div className="flex items-center gap-2.5">
              <div className="border-2 border-black bg-[#ffe84d] p-1.5 shadow-[3px_3px_0_#000]">
                <History className="text-black" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-tight">Empire Ledger</h2>
                <p className="font-arcade text-[9px] font-black uppercase tracking-widest text-black/55">{gameType} Mode · {sorted.length} records</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="border-2 border-black bg-[#ff2f92] p-1.5 text-white shadow-[3px_3px_0_#000] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Tabs (fixed, only show if REAL mode has payments) ── */}
          {gameType === 'REAL' && (
            <div className="flex-none flex border-b-2 border-black bg-black/55">
              {(['history', 'payments'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 font-arcade text-[11px] font-black uppercase tracking-widest transition
                    ${tab === t
                      ? 'bg-[#24f59f] text-black'
                      : 'text-stone-500 hover:text-white'}`}
                >
                  {t === 'history' ? 'History' : 'Who Pays Whom'}
                </button>
              ))}
            </div>
          )}

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">

            {/* HISTORY TAB */}
            {tab === 'history' && (
              <div className="p-3 space-y-1.5">
                {sorted.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-stone-500">
                    <Users size={32} strokeWidth={1} />
                    <p className="text-sm font-black uppercase">No exits recorded yet</p>
                    <p className="font-arcade text-[10px] uppercase tracking-widest">Players who leave early will appear here</p>
                  </div>
                ) : (
                  sorted.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center justify-between border-2 border-black bg-black/45 px-3 py-2.5 shadow-[4px_4px_0_#000] transition hover:bg-black/70"
                    >
                      {/* Left: name + time */}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-black uppercase text-white">{s.username}</span>
                        <span className="font-arcade text-[9px] text-stone-500">
                          {new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Middle: chips */}
                      <div className="hidden sm:flex flex-col items-center text-center mx-3">
                        <span className="text-[9px] font-black uppercase text-stone-500">Exit</span>
                        <span className="font-arcade text-xs text-stone-300">{s.chipsAtExit.toLocaleString()}</span>
                      </div>

                      {/* Right: net result */}
                      <div className={`flex items-center gap-1 font-black text-sm flex-shrink-0
                        ${s.status === 'WIN' ? 'text-[#24f59f]' : 'text-[#ff2f92]'}`}>
                        {s.status === 'WIN' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>
                          {s.status === 'WIN' ? '+' : ''}
                          {gameType === 'REAL' ? `₹${Math.abs(s.netAmount).toFixed(2)}` : `$${s.netAmount}`}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* WHO PAYS WHOM TAB */}
            {tab === 'payments' && (
              <div className="p-3 space-y-1.5">
                {instructions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-stone-500">
                    <TrendingUp size={32} strokeWidth={1} />
                    <p className="text-sm font-black uppercase">All settled</p>
                    <p className="font-arcade text-[10px] uppercase tracking-widest">No outstanding payments</p>
                  </div>
                ) : (
                  instructions.map((t, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between border-2 border-black bg-black/45 px-3 py-2.5 shadow-[4px_4px_0_#000] transition hover:bg-black/70"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="max-w-[90px] truncate font-black text-[#ff2f92]">{t.from}</span>
                        <ArrowRight size={12} className="flex-none text-stone-500" />
                        <span className="max-w-[90px] truncate font-black text-[#24f59f]">{t.to}</span>
                      </div>
                      <div className="ml-2 flex-none border-2 border-black bg-[#24f59f] px-3 py-1">
                        <span className="font-arcade text-sm font-black text-black">₹{t.amount.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Footer (fixed) ── */}
          <div className="flex-none flex items-center justify-between border-t-2 border-black bg-black/65 px-4 py-2.5 font-arcade text-[9px] font-black uppercase tracking-widest text-stone-500">
            <span>Entry · {gameType === 'REAL' ? `₹${entryAmount}` : 'Practice'}</span>
            <span>{sorted.length} player{sorted.length !== 1 ? 's' : ''} exited</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
