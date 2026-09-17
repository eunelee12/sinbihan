import React from 'react';
import { PlayerCharacter, GameItem } from '../types';
import { Heart, Sparkles, RefreshCw, AlertTriangle, Backpack } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  player: PlayerCharacter;
  onUseItemToRevive: (item: GameItem) => void;
  onEmergencyRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  player,
  onUseItemToRevive,
  onEmergencyRespawn,
}) => {
  // Find usable recovery/revive items
  const usableItems = player.inventory.filter(
    slot => slot.quantity > 0 && (slot.item.category === 'potion' || slot.item.category === 'revive')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg backdrop-blur-2xl bg-slate-900/85 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/60 text-white text-center font-sans">
        {/* Game Over Title Badge */}
        <div className="inline-block p-4 sm:p-5 rounded-3xl bg-rose-500/15 border border-rose-400/30 mb-5 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300 block mb-1">DEFEATED</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
            GAME OVER
          </h1>
          <p className="text-xs text-rose-200/90 font-medium mt-1">체력이 0이 되었습니다!</p>
        </div>

        {/* Description from PDF */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-4 mb-5 text-xs sm:text-sm text-indigo-100/90 leading-relaxed backdrop-blur-md">
          <p className="text-indigo-200 font-bold mb-1">
            📜 "도구 사용만 가능, 회복하면 원래 체력 가지고 부활!"
          </p>
          <p className="text-white/60 text-xs">
            가방에 있는 <span className="text-indigo-300 font-semibold">회복 물약</span>이나 <span className="text-emerald-300 font-semibold">부활 장치</span>를 사용하여 그 자리에서 즉시 일어나세요!
          </p>
        </div>

        {/* Usable Items list */}
        <div className="mb-6">
          <div className="text-xs font-bold text-white/70 mb-2.5 flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <Backpack className="w-4 h-4 text-indigo-300" />
            <span>보유 중인 회복 및 부활 도구</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {usableItems.map((slot) => (
              <div
                key={slot.item.id}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-3 flex items-center justify-between gap-3 text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 bg-white/10 border border-white/15 rounded-xl">{slot.item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{slot.item.name}</span>
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold border border-indigo-400/30">
                        {slot.quantity}개 보유
                      </span>
                    </div>
                    <div className="text-xs text-white/50">{slot.item.description}</div>
                  </div>
                </div>

                <button
                  id={`revive-with-${slot.item.id}`}
                  onClick={() => onUseItemToRevive(slot.item)}
                  className="px-4 py-2 bg-white text-slate-950 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>사용하여 부활</span>
                </button>
              </div>
            ))}

            {usableItems.length === 0 && (
              <div className="py-5 bg-white/5 rounded-2xl border border-dashed border-white/10 text-xs text-white/40">
                보유한 회복/부활 도구가 없습니다.<br />
                아래 기본 부활을 통해 시작 지점으로 복귀할 수 있습니다.
              </div>
            )}
          </div>
        </div>

        {/* Emergency / Basic Respawn Button */}
        <button
          id="emergency-respawn-btn"
          onClick={onEmergencyRespawn}
          className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-2xl border border-white/20 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
        >
          <RefreshCw className="w-4 h-4 text-indigo-300" />
          <span>기본 부활 (체력 10 회복 & 시작 지점으로 이동)</span>
        </button>
      </div>
    </div>
  );
};
