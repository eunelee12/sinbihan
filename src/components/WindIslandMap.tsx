import React, { useState, useEffect } from 'react';
import { PlayerCharacter, GameItem } from '../types';
import { GAME_ITEMS } from '../data/gameConstants';
import { Wind, Sparkles, LogOut, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { FollowerCompanions } from './FollowerCompanions';

interface WindIslandMapProps {
  player: PlayerCharacter;
  onExitIsland: () => void;
  onGainXp: (amount: number) => void;
  onGainItem: (item: GameItem) => void;
}

export const WindIslandMap: React.FC<WindIslandMapProps> = ({
  player,
  onExitIsland,
  onGainXp,
  onGainItem,
}) => {
  const [islandItems, setIslandItems] = useState([
    { id: 'w1', x: 300, y: 300, item: GAME_ITEMS.wind_gem, collected: false },
    { id: 'w2', x: 600, y: 250, item: GAME_ITEMS.xp_crystal_large, collected: false },
    { id: 'w3', x: 450, y: 550, item: GAME_ITEMS.wind_gem, collected: false },
    { id: 'w4', x: 750, y: 480, item: GAME_ITEMS.heal_potion_100, collected: false },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const handleCollect = (id: string, item: GameItem) => {
    const target = islandItems.find((it) => it.id === id && !it.collected);
    if (!target) return;

    soundManager.playItemPickup();
    onGainItem(item);
    if (item.xpChange) {
      onGainXp(item.xpChange);
    }
    setToast(`바람의 섬에서 [${item.name}] 을(를) 채집했습니다!`);
    setTimeout(() => setToast(null), 2500);

    setIslandItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, collected: true } : it))
    );
  };

  // Auto-collect items on contact
  useEffect(() => {
    for (const it of islandItems) {
      if (!it.collected) {
        const dist = Math.hypot(player.x - it.x, player.y - it.y);
        if (dist < 55) {
          handleCollect(it.id, it.item);
        }
      }
    }
  }, [player.x, player.y, islandItems]);

  const MAP_W = 1000;
  const MAP_H = 1000;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-900 via-sky-800 to-indigo-950 select-none">
      {/* Floating Island Stage */}
      <div
        className="absolute inset-0 transition-transform duration-75"
        style={{
          transform: `translate(${Math.max(
            Math.min(0, window.innerWidth / 2 - player.x),
            window.innerWidth - MAP_W
          )}px, ${Math.max(
            Math.min(0, window.innerHeight / 2 - player.y),
            window.innerHeight - MAP_H
          )}px)`,
          width: `${MAP_W}px`,
          height: `${MAP_H}px`,
        }}
      >
        {/* Floating clouds & sky background */}
        <div className="absolute inset-0 bg-sky-950/40">
          <div className="absolute top-20 left-1/4 w-80 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-80 right-1/4 w-96 h-40 bg-teal-300/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Sky Island Landmass */}
        <div className="absolute top-24 left-24 right-24 bottom-24 bg-gradient-to-br from-emerald-800/80 via-teal-900/80 to-sky-950/90 backdrop-blur-xl rounded-[80px] border border-white/20 shadow-2xl p-8 flex flex-col items-center justify-between">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-5 text-center text-white max-w-md shadow-xl font-sans">
            <h2 className="text-xl sm:text-2xl font-black flex items-center justify-center gap-2">
              <Wind className="w-6 h-6 animate-spin text-indigo-300" style={{ animationDuration: '6s' }} />
              신비한 바람의 섬 (하늘 섬)
            </h2>
            <p className="text-xs text-indigo-200/90 mt-1 font-medium">
              구름 위에 떠 있는 신비한 섬. 바람의 정수와 고대 보석을 채집할 수 있습니다.
            </p>
          </div>

          {/* Island Collectibles */}
          {islandItems.map((it) => (
            <div
              key={it.id}
              onClick={() => handleCollect(it.id, it.item)}
              className={`absolute cursor-pointer transition-all transform hover:scale-125 ${
                it.collected ? 'opacity-0 pointer-events-none' : 'animate-bounce'
              }`}
              style={{ left: `${it.x}px`, top: `${it.y}px` }}
            >
              <div className="text-4xl filter drop-shadow-xl">{it.item.icon}</div>
              <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 text-white border border-white/20 mt-1 font-sans">
                {it.item.name}
              </div>
            </div>
          ))}

          {/* Portal back to Field */}
          <div
            onClick={onExitIsland}
            className="mb-8 px-6 py-4 backdrop-blur-2xl bg-white text-slate-950 hover:bg-indigo-50 active:scale-95 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-sm cursor-pointer transition-all uppercase tracking-wider font-sans"
          >
            <LogOut className="w-5 h-5 text-indigo-600" />
            <span>하강 포털 (지상 필드로 복귀)</span>
          </div>
        </div>

        {/* Player Character */}
        <div
          className="absolute z-20 transition-all duration-100 flex flex-col items-center pointer-events-none"
          style={{
            left: `${player.x - 20}px`,
            top: `${player.y - 30}px`,
          }}
        >
          {/* Overhead HP Bar */}
          <div className="w-16 bg-slate-950/90 rounded-full h-2 border border-slate-700 overflow-hidden mb-1 shadow-md">
            <div
              className="bg-emerald-400 h-full transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100))}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-white bg-slate-900/80 px-1 rounded -mt-0.5 mb-0.5">
            {player.hp}/{player.maxHp}
          </span>

          {/* Human Sprite */}
          <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-xl">
            🧑
          </div>

          <span className="text-[11px] font-bold text-sky-300 bg-slate-900/90 px-2 py-0.2 rounded-full border border-sky-500/40 mt-1">
            {player.name}
          </span>

          {/* Follower Companion Pets Squad */}
          <FollowerCompanions character={player} size="lg" />
        </div>
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 backdrop-blur-2xl bg-slate-900/90 border border-white/30 text-white px-6 py-3 rounded-3xl shadow-2xl font-black text-xs sm:text-sm font-sans animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
};
