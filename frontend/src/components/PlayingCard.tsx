import { motion } from 'framer-motion';

interface PlayingCardProps {
  rank: string;
  suit: string;
  isHidden?: boolean;
  revealAllCards?: boolean;
  delay?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'
};

const SIZE_CLASSES = {
  xs:  'w-6 h-9 rounded-[5px] text-[7px]',
  sm:  'w-8 h-12 rounded-md text-[9px] md:text-[10px]',
  md:  'w-12 h-[68px] rounded-lg text-[11px] md:text-xs',
  lg:  'w-16 h-24 rounded-xl text-sm md:text-base',
  xl:  'w-[76px] h-[108px] rounded-2xl text-base md:text-lg',
};

export const PlayingCard = ({
  rank, suit, isHidden = false, delay = 0, size = 'sm'
}: PlayingCardProps) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const symbol = SUIT_SYMBOLS[suit] || suit;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
      className={`${sizeClass} relative flex-shrink-0 overflow-hidden border-2 border-black bg-[#fff8ec] font-black select-none shadow-[4px_4px_0_#000] ${isRed ? 'text-[#ff2f92]' : 'text-[#080812]'}`}
    >
      {isHidden ? (
        // Card back
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#8b5cf6,#ff2f92_50%,#07070f)]">
          <div className="absolute inset-[4px] rounded border border-white/35" />
          <div className="absolute inset-0 arcade-grid opacity-20" />
          <span className="font-arcade text-xs font-black text-white md:text-base">PE</span>
        </div>
      ) : (
        <>
          <div className="absolute left-0.5 top-0.5 flex flex-col items-center leading-none">
            <span className="font-black text-[9px] md:text-[11px]">{rank}</span>
            <span className="text-[8px] md:text-[10px]">{symbol}</span>
          </div>
          <div className="absolute bottom-0.5 right-0.5 flex rotate-180 flex-col items-center leading-none">
            <span className="font-black text-[9px] md:text-[11px]">{rank}</span>
            <span className="text-[8px] md:text-[10px]">{symbol}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base opacity-80 md:text-2xl">{symbol}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
