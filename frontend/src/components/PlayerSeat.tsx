/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { chipsToRupees } from '@/utils/currency';

interface PlayerSeatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any | null;
  isCurrentTurn: boolean;
  isDealer: boolean;
  isWinner: boolean;
  revealAllCards: boolean;
  gameType?: 'FAKE' | 'REAL';
  entryAmount?: number;
  isMobile?: boolean;
}

// ── Action bubble ──────────────────────────────────────────────────────────
const ActionTag = ({ action }: { action: string }) => {
  const [visible, setVisible] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!action) return;
    setVisible(action);
    const t = setTimeout(() => setVisible(null), 2500);
    return () => clearTimeout(t);
  }, [action]);

  if (!visible) return null;

  const colour =
    visible.toLowerCase().includes('fold')  ? 'bg-[#ff2f92] text-white' :
    visible.toLowerCase().includes('raise') ? 'bg-[#ffe84d] text-black' :
    visible.toLowerCase().includes('all')   ? 'bg-[#8b5cf6] text-white' :
    'bg-[#39e8ff] text-black';

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.7 }}
      animate={{ opacity: 1, y: -36, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      className={`absolute left-1/2 top-0 z-50 -translate-x-1/2 whitespace-nowrap border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#000] pointer-events-none md:text-[9px] ${colour}`}
    >
      {visible}
    </motion.div>
  );
};

// ── Empty seat ─────────────────────────────────────────────────────────────
const EmptySeat = ({ isMobile }: { isMobile: boolean }) => (
  <div
    className={`grid place-items-center rounded-full border-2 border-dashed border-white/15 bg-black/25 orbital-glow
      ${isMobile ? 'w-11 h-11' : 'w-16 h-16'}`}
  >
    <span className="h-2 w-2 rounded-full bg-[#24f59f]/40" />
  </div>
);

// ── Player Seat (circular design) ─────────────────────────────────────────
export const PlayerSeat = ({
  player, isCurrentTurn, isDealer, isWinner, revealAllCards,
  gameType, entryAmount, isMobile = false
}: PlayerSeatProps) => {

  if (!player) return <EmptySeat isMobile={isMobile} />;

  const hasFolded = player.hasFolded && !revealAllCards;

  // Sizes — xs cards on mobile prevent horizontal collision
  const circleSize  = isMobile ? 'w-11 h-11' : 'w-[74px] h-[74px]';
  const imgSize     = isMobile ? 'w-9 h-9'   : 'w-[66px] h-[66px]';
  const nameSize    = isMobile ? 'text-[8px] max-w-[52px]' : 'text-xs max-w-[82px]';
  const chipsSize   = isMobile ? 'text-[8px]' : 'text-xs md:text-sm';
  const cardGap     = isMobile ? 'gap-[3px]'  : 'gap-1.5';
  const cardOffset  = isMobile ? 'mb-[-5px]'  : 'mb-[-10px]';

  // Glow colour based on state
  const ringColour =
    isWinner       ? 'ring-[#ffe84d] ring-[3px] shadow-[0_0_28px_rgba(255,232,77,0.55)]' :
    isCurrentTurn  ? 'ring-[#24f59f] ring-[3px] shadow-[0_0_30px_rgba(36,245,159,0.45)]' :
    hasFolded      ? 'ring-white/10 ring-1 opacity-45 grayscale' :
    'ring-white/20 ring-1';

  return (
    <div className={`relative flex flex-col items-center transition-all duration-200 ${isCurrentTurn ? 'scale-110' : 'scale-100'}`}>

      {/* ── Cards fan (sits above the circle) ── */}
      <div className={`flex items-end justify-center ${cardGap} ${cardOffset} z-10 relative`}>
        <AnimatePresence>
          {player.hand?.map((card: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: hasFolded ? 0.2 : 1 }}
              transition={{ delay: idx * 0.12, type: 'spring', stiffness: 300, damping: 24 }}
              className={idx === 0 ? '-rotate-6' : 'rotate-6'}
            >
              <PlayingCard
                rank={card.rank}
                suit={card.suit}
                isHidden={card.rank === '?'}
                revealAllCards={revealAllCards}
                delay={0}
                size={isMobile ? 'sm' : 'lg'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Circular avatar frame ── */}
      <div className={`relative z-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-black bg-[#111126] ring ${circleSize} ${ringColour} hard-shadow-sm`}>
        <img
          src={player.avatarUrl}
          alt={player.username}
          className={`${imgSize} rounded-full object-cover`}
        />

        {/* Folded dim overlay */}
        {hasFolded && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/75">
            <span className="-rotate-12 border border-[#ff2f92] px-1 font-arcade text-[7px] font-black uppercase tracking-widest text-[#ff2f92]">Out</span>
          </div>
        )}
      </div>

      {/* ── Dealer badge ── */}
      {isDealer && (
        <div className={`absolute z-30 flex items-center justify-center rounded-full border-2 border-black bg-[#ffe84d] font-black text-black shadow-[3px_3px_0_#000]
          ${isMobile ? 'w-3.5 h-3.5 text-[6px] -top-0.5 -right-0.5' : 'w-5 h-5 text-[8px] -top-1 -right-1'}`}>
          D
        </div>
      )}

      {/* ── Winner crown ── */}
      {isWinner && (
        <motion.span
          initial={{ y: 0, scale: 0 }}
          animate={{ y: isMobile ? -28 : -36, scale: 1 }}
          className={`absolute left-1/2 -translate-x-1/2 top-0 z-40 ${isMobile ? 'text-base' : 'text-2xl'} pointer-events-none`}
        >
          👑
        </motion.span>
      )}

      {/* ── Bet chip (floats above avatar) ── */}
      {player.currentBet > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute left-1/2 z-30 -translate-x-1/2
            whitespace-nowrap border-2 border-black bg-[#ffe84d] font-arcade font-black text-black shadow-[3px_3px_0_#000]
            ${isMobile ? 'text-[7px] px-1.5 py-0' : 'text-[9px] px-2 py-0.5'}
          `}
          style={{ top: isMobile ? -16 : -22 }}
        >
          ${player.currentBet}
        </motion.div>
      )}

      {/* ── Action bubble ── */}
      <AnimatePresence>
        <ActionTag action={player.lastAction} />
      </AnimatePresence>

      {/* ── Name + chips (below the circle) ── */}
      <div className="z-20 mt-1 flex flex-col items-center rounded-lg border border-white/10 bg-black/50 px-2 py-1 backdrop-blur-md">
        <span className={`truncate text-center font-black uppercase leading-none text-white ${nameSize}`}>
          {player.username}
        </span>
        <span className={`font-arcade font-black leading-none text-[#24f59f] ${chipsSize}`}>
          ${player.chips.toLocaleString()}
        </span>
        {gameType === 'REAL' && (
          <span className={`font-bold leading-none text-[#24f59f]/55 ${isMobile ? 'text-[6px]' : 'text-[8px]'}`}>
            {chipsToRupees(player.chips, entryAmount || 0)}
          </span>
        )}
      </div>
    </div>
  );
};
