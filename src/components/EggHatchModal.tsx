import React, { useState, useEffect } from 'react';
import { CompanionPet } from '../types';
import { Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface EggHatchModalProps {
  pet: CompanionPet;
  currentCount?: number;
  onConfirm: () => void;
}

export const EggHatchModal: React.FC<EggHatchModalProps> = ({ pet, currentCount = 0, onConfirm }) => {
  const [stage, setStage] = useState<'cracking' | 'hatched'>('cracking');

  useEffect(() => {
    soundManager.playChestOpen();
    const timer = setTimeout(() => {
      setStage('hatched');
      soundManager.playTradeSuccess();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {
        // ignore
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn font-sans">
      <div className="relative w-full max-w-sm backdrop-blur-2xl bg-slate-900/85 border border-white/20 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl">
        {stage === 'cracking' ? (
          <div className="py-6 flex flex-col items-center">
            <div className="text-7xl animate-bounce mb-4">🥚</div>
            <h3 className="text-xl font-black text-white animate-pulse">
              알이 부화하고 있습니다...!
            </h3>
            <p className="text-xs text-indigo-200/80 mt-2 font-medium">두근두근... 어떤 보조캐릭터가 깨어날까요?</p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-scaleUp">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 text-indigo-200 text-xs font-bold rounded-full border border-indigo-400/40 mb-3 uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              {currentCount > 0 ? `새로운 ${currentCount + 1}번째 보조캐릭터 합류!` : '새로운 보조캐릭터 합류!'}
            </div>

            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-xl border border-white/30 backdrop-blur-md"
              style={{ backgroundColor: pet.color }}
            >
              {pet.icon}
            </div>

            <h2 className="text-2xl font-black text-white">{pet.name}</h2>
            <span className="text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 mt-1 mb-3">
              Lv.{pet.level} {pet.species}
            </span>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-xs text-white/80 leading-relaxed w-full backdrop-blur-md">
              {pet.description}
            </div>

            <button
              onClick={onConfirm}
              className="w-full py-3.5 px-4 bg-white hover:bg-indigo-50 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            >
              <Check className="w-4 h-4 text-indigo-600" />
              <span>동행 시작하기 (군단 합류)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
