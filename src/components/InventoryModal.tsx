import React from 'react';
import { PlayerCharacter, GameItem } from '../types';
import { Backpack, Sparkles, Heart, Shield, X, Egg, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getCompanionsList, calculateCompanionBonuses } from '../utils/companionUtils';

interface InventoryModalProps {
  player: PlayerCharacter;
  onClose: () => void;
  onUseItem: (item: GameItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  player,
  onClose,
  onUseItem,
}) => {
  const activeSlots = player.inventory.filter((slot) => slot.quantity > 0);
  const companions = getCompanionsList(player);
  const bonuses = calculateCompanionBonuses(companions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl backdrop-blur-2xl bg-slate-900/80 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white font-sans max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl backdrop-blur-md text-3xl">
            🎒
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 block mb-1">INVENTORY & SQUAD</span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              도구 가방 및 보조캐릭터
            </h2>
            <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
              도구를 사용하거나 동행 중인 여러 보조캐릭터의 시너지 능력을 확인하세요.
            </p>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Multiple Companion Pets Squad Status */}
          {companions.length > 0 ? (
            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐾</span>
                  <span className="font-black text-xs sm:text-sm text-white">
                    동행 중인 보조캐릭터 군단 ({companions.length}마리)
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 font-bold px-2 py-0.5 rounded-full border border-indigo-400/20">
                  모든 버프 중첩 적용
                </span>
              </div>

              {/* Combined Synergy Bar */}
              <div className="flex items-center gap-2 flex-wrap mb-3 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono">
                <span className="text-white/60 font-sans text-[10px] font-bold">총 시너지 효과:</span>
                {bonuses.speedMultiplier > 1 && (
                  <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                    ⚡ 이동속도 +{Math.round((bonuses.speedMultiplier - 1) * 100)}%
                  </span>
                )}
                {bonuses.xpMultiplier > 1 && (
                  <span className="text-sky-300 font-bold bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-400/30">
                    🌟 획득 경험치 +{Math.round((bonuses.xpMultiplier - 1) * 100)}%
                  </span>
                )}
                {bonuses.healPerTick > 0 && (
                  <span className="text-pink-300 font-bold bg-pink-500/20 px-2 py-0.5 rounded-md border border-pink-400/30">
                    💖 3초당 자동회복 +{bonuses.healPerTick} HP
                  </span>
                )}
                {bonuses.hasShield && (
                  <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                    🛡️ 상시 방어 보조
                  </span>
                )}
              </div>

              {/* Pets List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {companions.map((pet, idx) => (
                  <div
                    key={pet.id || `pet_slot_${idx}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-2xl p-1.5 bg-white/10 rounded-lg border border-white/10 flex-shrink-0">
                      {pet.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="font-bold text-xs text-white truncate">{pet.name}</span>
                        <span className="text-[9px] bg-indigo-500/30 text-indigo-200 font-bold px-1.5 py-0.2 rounded border border-indigo-400/30 flex-shrink-0">
                          Lv.{pet.level} {pet.species}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 truncate mt-0.5">{pet.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🥚</span>
                <span>보조캐릭터 알을 부화시켜 나만의 보조캐릭터 군단을 만들어보세요!</span>
              </div>
            </div>
          )}

          {/* Active Shield status */}
          {player.equippedShield && (
            <div className="bg-indigo-500/15 border border-indigo-400/30 rounded-2xl p-3 flex items-center gap-2 text-xs text-indigo-200 backdrop-blur-md">
              <Shield className="w-4 h-4 text-indigo-300 flex-shrink-0" />
              <span><strong>마법 방어막 활성화 중:</strong> 다음 피해를 1회 완벽히 무효화합니다.</span>
            </div>
          )}

          {/* Items Section Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-black text-xs sm:text-sm text-white/90">소지 도구 목록</span>
            <span className="text-[11px] text-white/50">
              총 {activeSlots.reduce((sum, s) => sum + s.quantity, 0)}개
            </span>
          </div>

          {/* Items Grid */}
          <div className="space-y-2.5">
            {activeSlots.map((slot) => {
              const item = slot.item;
              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all backdrop-blur-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{item.name}</span>
                        <span className="bg-indigo-500/20 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/20">
                          {slot.quantity}개 보유
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  <button
                    id={`use-item-${item.id}`}
                    onClick={() => onUseItem(item)}
                    className="flex-shrink-0 px-4 py-2 bg-white text-slate-950 hover:bg-indigo-100 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>사용</span>
                  </button>
                </div>
              );
            })}

            {activeSlots.length === 0 && (
              <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10 text-white/40 text-xs">
                가방에 보유 중인 도구가 없습니다.<br />
                필드나 의문의 성에서 아이템을 획득하거나 다른 모험가와 교환해보세요!
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-white/50 flex-shrink-0">
          팁: 보조캐릭터 알을 여러 개 부화시키면 모든 보조캐릭터가 동시에 동행하며 버프가 합산됩니다.
        </div>
      </div>
    </div>
  );
};

