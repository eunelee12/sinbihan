import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileDPadProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onDirectionRelease: () => void;
}

export const MobileDPad: React.FC<MobileDPadProps> = ({
  onDirectionPress,
  onDirectionRelease,
}) => {
  return (
    <div className="fixed bottom-6 left-6 z-30 pointer-events-auto select-none touch-none">
      <div className="relative w-36 h-36 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-full p-2 shadow-2xl flex items-center justify-center">
        {/* Center hub */}
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 shadow-inner flex items-center justify-center pointer-events-none backdrop-blur-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-400/80 shadow-sm" />
        </div>

        {/* Up Button */}
        <button
          id="dpad-up"
          onMouseDown={() => onDirectionPress('up')}
          onMouseUp={onDirectionRelease}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress('up'); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease(); }}
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-white/10 hover:bg-white active:bg-white text-white hover:text-slate-950 active:text-slate-950 rounded-t-2xl border-t border-x border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down Button */}
        <button
          id="dpad-down"
          onMouseDown={() => onDirectionPress('down')}
          onMouseUp={onDirectionRelease}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress('down'); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease(); }}
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-11 bg-white/10 hover:bg-white active:bg-white text-white hover:text-slate-950 active:text-slate-950 rounded-b-2xl border-b border-x border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left Button */}
        <button
          id="dpad-left"
          onMouseDown={() => onDirectionPress('left')}
          onMouseUp={onDirectionRelease}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease(); }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white active:bg-white text-white hover:text-slate-950 active:text-slate-950 rounded-l-2xl border-l border-y border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Button */}
        <button
          id="dpad-right"
          onMouseDown={() => onDirectionPress('right')}
          onMouseUp={onDirectionRelease}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease(); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white active:bg-white text-white hover:text-slate-950 active:text-slate-950 rounded-r-2xl border-r border-y border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
