import React from 'react';
import { AICharacter, PlayerCharacter } from '../types';
import { getNextLevelXp, getXpForLevel } from '../data/gameConstants';
import { ArrowLeftRight, Heart, Sparkles, User, X, Shield } from 'lucide-react';

interface AiCharacterModalProps {
  ai: AICharacter;
  player: PlayerCharacter;
  onClose: () => void;
  onStartTrade: (ai: AICharacter) => void;
}

export const AiCharacterModal: React.FC<AiCharacterModalProps> = ({
  ai,
  player,
  onClose,
  onStartTrade,
}) => {
  const currentLevelXp = getXpForLevel(ai.level);
  const nextLevelXp = getNextLevelXp(ai.level);
  const xpProgress = Math.min(100, Math.max(0, Math.floor(((ai.xp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100)));
  const hpPercent = Math.min(100, Math.max(0, Math.floor((ai.hp / ai.maxHp) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-slate-900/80 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* AI Character Header */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/30 backdrop-blur-md"
            style={{ backgroundColor: ai.avatarColor }}
          >
            🧑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{ai.name}</h2>
              <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
                AI 모험가
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium mt-0.5">성격: {ai.personality}</p>
          </div>
        </div>

        {/* Dialogue Bubble */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 mb-4 text-xs sm:text-sm text-indigo-100 leading-relaxed relative backdrop-blur-md">
          <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-indigo-300 mb-1">대화하기</div>
          "{ai.dialogue}"
        </div>

        {/* Stats Section: Level, XP, HP Bar */}
        <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-md">
          {/* Level & XP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-white font-mono font-bold text-xs rounded-xl">
                Lv. {ai.level}
              </span>
              <span className="text-xs text-white/70 font-medium">
                경험치: <strong className="text-indigo-300 font-mono">{ai.xp.toLocaleString()} XP</strong>
              </span>
            </div>
            <span className="text-[11px] text-white/50 font-mono">
              다음: {nextLevelXp.toLocaleString()} XP
            </span>
          </div>

          {/* XP Bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 border border-white/10 overflow-hidden">
            <div
              className="bg-indigo-400 h-full rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>

          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                체력 (HP)
              </span>
              <span className="text-emerald-200 font-mono">
                {ai.hp} / {ai.maxHp}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 border border-white/10 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* AI Companion Pet if exists */}
          {ai.companion && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/50">동행 보조캐릭터:</span>
              <span className="text-indigo-200 font-medium flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <span>{ai.companion.icon}</span>
                <span>{ai.companion.name} (Lv.{ai.companion.level})</span>
              </span>
            </div>
          )}
        </div>

        {/* AI Inventory preview */}
        <div className="mb-5">
          <div className="text-xs font-bold text-white/60 mb-2.5 flex items-center justify-between uppercase tracking-wider">
            <span>보유 교환 가능 물품</span>
            <span className="text-[11px] text-indigo-300 font-mono">교환 시 +1000 XP!</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ai.inventory.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-2 flex flex-col items-center text-center text-xs backdrop-blur-sm transition-all"
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-[11px] font-bold text-white line-clamp-1">{item.name}</span>
                <span className="text-[9px] text-white/50 line-clamp-1">{item.category}</span>
              </div>
            ))}
            {ai.inventory.length === 0 && (
              <div className="col-span-3 text-center py-3 text-xs text-white/40">
                보유한 도구가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Trade Action Button */}
        <button
          id="open-trade-btn"
          onClick={() => onStartTrade(ai)}
          className="w-full py-4 px-4 bg-white hover:bg-indigo-50 active:scale-[0.98] text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
        >
          <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
          <span>[교환] 아이템 교환하기 (+1000 XP 보너스)</span>
        </button>
      </div>
    </div>
  );
};

