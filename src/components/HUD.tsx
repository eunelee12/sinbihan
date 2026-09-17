import React from 'react';
import { PlayerCharacter, GameLocation } from '../types';
import { getNextLevelXp, getXpForLevel } from '../data/gameConstants';
import { Backpack, Castle, Wind, ShieldAlert, Volume2, VolumeX, LogOut, Smartphone, Sparkles, Heart, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getCompanionsList, calculateCompanionBonuses } from '../utils/companionUtils';

interface HUDProps {
  player: PlayerCharacter;
  currentLocation: GameLocation;
  onOpenInventory: () => void;
  onOpenAdmin: () => void;
  onEnterLocation: (loc: GameLocation) => void;
  onLogout: () => void;
  showDpad: boolean;
  onToggleDpad: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  currentLocation,
  onOpenInventory,
  onOpenAdmin,
  onEnterLocation,
  onLogout,
  showDpad,
  onToggleDpad,
  isMuted,
  onToggleMute,
}) => {
  const currentLevelXp = getXpForLevel(player.level);
  const nextLevelXp = getNextLevelXp(player.level);
  const xpInCurrentLevel = Math.max(0, player.xp - currentLevelXp);
  const requiredXpForNext = Math.max(1, nextLevelXp - currentLevelXp);
  const xpPercent = player.level >= 10 ? 100 : Math.min(100, Math.floor((xpInCurrentLevel / requiredXpForNext) * 100));

  const companions = getCompanionsList(player);
  const bonuses = calculateCompanionBonuses(companions);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
      {/* Top Left: Player Level & XP Badge & Companion Squad */}
      <div className="pointer-events-auto backdrop-blur-2xl bg-slate-900/60 border border-white/20 rounded-3xl p-3 sm:px-5 sm:py-3.5 shadow-2xl shadow-black/60 text-white flex flex-col gap-2 transition-all max-w-sm sm:max-w-md">
        <div className="flex items-center gap-4">
          {/* Level Emblem */}
          <div className="relative flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/25 text-white shadow-lg backdrop-blur-md">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">LV.</span>
            <span className="text-xl font-black leading-none text-white">{player.level}</span>
            {player.level >= 10 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400"></span>
              </span>
            )}
          </div>

          {/* Name & XP Details */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5 truncate max-w-[130px]">
                {player.name}
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {player.xp.toLocaleString()} XP
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-1.5">
              <div className="w-full bg-white/10 rounded-full h-1.5 border border-white/10 overflow-hidden relative backdrop-blur-sm">
                <div
                  className="bg-indigo-400 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/50 mt-1 font-mono">
                <span className="uppercase tracking-wider">{player.level >= 10 ? 'MAX LEVEL' : `Next: ${nextLevelXp.toLocaleString()} XP`}</span>
                <span className="font-bold text-indigo-200">{xpPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Companion Pets Squad Display */}
        {companions.length > 0 && (
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-indigo-200">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span>🐾</span>
                <span>보조캐릭터 동행 ({companions.length}마리)</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300/90 font-bold">
                {bonuses.speedMultiplier > 1 && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-400/30">
                    속도+{Math.round((bonuses.speedMultiplier - 1) * 100)}%
                  </span>
                )}
                {bonuses.xpMultiplier > 1 && (
                  <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-400/30">
                    XP+{Math.round((bonuses.xpMultiplier - 1) * 100)}%
                  </span>
                )}
                {bonuses.healPerTick > 0 && (
                  <span className="bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded border border-pink-400/30">
                    회복+{bonuses.healPerTick}
                  </span>
                )}
              </div>
            </div>

            {/* Companion Pets Badges */}
            <div className="flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto">
              {companions.map((pet, i) => (
                <div
                  key={pet.id || `pet_${i}`}
                  className="flex items-center gap-1 text-[10px] text-white/90 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm"
                  title={`${pet.name} (Lv.${pet.level}): ${pet.description}`}
                >
                  <span>{pet.icon}</span>
                  <span className="font-bold truncate max-w-[80px]">{pet.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Right: Action Controls (도구 꺼내는 곳, 의문의 성, 바람의 섬, 관리자, 사운드, D-pad, 로그아웃) */}
      <div className="pointer-events-auto flex items-center flex-wrap gap-2">
        {/* Location switcher / navigation buttons */}
        {currentLocation === 'field' && (
          <>
            <button
              id="enter-castle-hud-btn"
              onClick={() => onEnterLocation('castle')}
              className="px-3.5 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              title="의문의 성 안으로 들어가기"
            >
              <Castle className="w-4 h-4 text-purple-300" />
              <span>의문의 성 입장</span>
            </button>

            <button
              id="enter-wind-island-hud-btn"
              onClick={() => onEnterLocation('wind_island')}
              className="px-3.5 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              title="바람의 섬으로 이동"
            >
              <Wind className="w-4 h-4 text-sky-300" />
              <span>바람의 섬 이동</span>
            </button>
          </>
        )}

        {currentLocation !== 'field' && (
          <button
            id="return-to-field-btn"
            onClick={() => onEnterLocation('field')}
            className="px-3.5 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>🌿 필드로 나가기</span>
          </button>
        )}

        {/* Inventory: 도구 꺼내는 곳 Button (PDF Page 1 명시) */}
        <button
          id="open-inventory-btn"
          onClick={onOpenInventory}
          className="px-4 py-2.5 bg-white text-slate-950 hover:bg-indigo-50 text-xs font-black rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
        >
          <Backpack className="w-4 h-4 text-slate-950" />
          <span>도구 가방</span>
          {player.inventory.length > 0 && (
            <span className="bg-slate-950 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
              {player.inventory.reduce((acc, slot) => acc + slot.quantity, 0)}
            </span>
          )}
        </button>

        {/* Admin Dashboard button */}
        <button
          id="open-admin-btn"
          onClick={onOpenAdmin}
          className="px-3.5 py-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white text-xs font-bold rounded-2xl border border-white/20 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          title="관리자 전용 페이지"
        >
          <ShieldAlert className="w-4 h-4 text-indigo-300" />
          <span className="hidden sm:inline">관리자</span>
        </button>

        {/* Mobile D-Pad Toggle */}
        <button
          id="toggle-dpad-btn"
          onClick={onToggleDpad}
          className={`p-2.5 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer ${
            showDpad
              ? 'bg-indigo-600/80 text-white border-indigo-400 shadow-lg'
              : 'bg-white/10 text-white/60 border-white/20 hover:text-white hover:bg-white/15'
          }`}
          title="방향키 버튼 켜기/끄기"
        >
          <Smartphone className="w-4 h-4" />
        </button>

        {/* Sound Mute Toggle */}
        <button
          id="toggle-sound-btn"
          onClick={onToggleMute}
          className="p-2.5 backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-2xl border border-white/20 transition-all cursor-pointer"
          title="사운드 켜기/끄기"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Logout button */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="p-2.5 backdrop-blur-xl bg-white/10 hover:bg-rose-500/20 text-white/80 hover:text-rose-300 rounded-2xl border border-white/20 hover:border-rose-400/40 transition-all cursor-pointer"
          title="로그아웃"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

