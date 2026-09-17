import React, { useEffect, useRef } from 'react';
import { PlayerCharacter, AICharacter, FieldItemInstance, GameLocation } from '../types';
import { Castle, Wind, Sparkles, Heart, AlertTriangle } from 'lucide-react';
import { FollowerCompanions } from './FollowerCompanions';

interface WorldMapProps {
  player: PlayerCharacter;
  aiCharacters: AICharacter[];
  fieldItems: FieldItemInstance[];
  onSelectAi: (ai: AICharacter) => void;
  onEnterLocation: (loc: GameLocation) => void;
  onCollectItem?: (fi: FieldItemInstance) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  player,
  aiCharacters,
  fieldItems,
  onSelectAi,
  onEnterLocation,
  onCollectItem,
}) => {
  const MAP_WIDTH = 2400;
  const MAP_HEIGHT = 2000;

  // Viewport calculation to center around player
  const viewportX = Math.max(
    Math.min(0, window.innerWidth / 2 - player.x),
    window.innerWidth - MAP_WIDTH
  );
  const viewportY = Math.max(
    Math.min(0, window.innerHeight / 2 - player.y),
    window.innerHeight - MAP_HEIGHT
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#7cb342] select-none">
      {/* World Map Plane with smooth translation */}
      <div
        className="absolute inset-0 transition-transform duration-75"
        style={{
          transform: `translate(${viewportX}px, ${viewportY}px)`,
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
        }}
      >
        {/* Grass ecosystem background with soft grid & pathways */}
        <div className="absolute inset-0 bg-[#8bc34a] bg-[radial-gradient(#7cb342_2px,transparent_2px)] [background-size:32px_32px]">
          {/* Decorative Trees, flowers & rocks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const tx = (i * 373) % (MAP_WIDTH - 200) + 100;
            const ty = (i * 487) % (MAP_HEIGHT - 300) + 150;
            const icons = ['🌲', '🌳', '🌸', '🌼', '🪨', '🌿', '🍄'];
            const icon = icons[i % icons.length];
            return (
              <span
                key={i}
                className="absolute text-2xl opacity-70 pointer-events-none select-none"
                style={{ left: `${tx}px`, top: `${ty}px` }}
              >
                {icon}
              </span>
            );
          })}

          {/* Dirt Pathway across world */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 200 400 Q 600 800 1200 1000 T 2200 1200"
              fill="none"
              stroke="#d7ccc8"
              strokeWidth="48"
              strokeLinecap="round"
              strokeDasharray="8 8"
            />
            <path
              d="M 1200 1000 Q 1400 500 1800 350"
              fill="none"
              stroke="#d7ccc8"
              strokeWidth="36"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 1. Landmark at Top: 바람의 섬 (Wind Island Portal & Sky Island representation) */}
        <div
          onClick={() => onEnterLocation('wind_island')}
          className="absolute top-20 left-1/3 -translate-x-1/2 backdrop-blur-2xl bg-sky-900/60 border border-white/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-white z-10 font-sans"
          style={{ width: '280px', height: '180px' }}
        >
          <div className="relative mb-2">
            <Wind className="w-12 h-12 text-sky-200 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 text-lg animate-bounce">☁️</span>
          </div>
          <h3 className="text-base font-black tracking-wide text-white">바람의 섬 (입구)</h3>
          <p className="text-[11px] text-sky-100 text-center mt-1 font-medium">
            클릭하여 구름 위의 바람의 섬으로 이동
          </p>
          <span className="mt-2 text-[10px] font-bold bg-white/15 px-3 py-1 rounded-full border border-white/25 uppercase tracking-wider backdrop-blur-sm">
            [클릭하면 섬 안으로 이동]
          </span>
        </div>

        {/* 2. Landmark: 의문의 성 (Mysterious Castle Gate) */}
        <div
          onClick={() => onEnterLocation('castle')}
          className="absolute top-28 right-1/4 backdrop-blur-2xl bg-indigo-950/65 border border-white/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-white z-10 font-sans"
          style={{ width: '300px', height: '200px' }}
        >
          <div className="relative mb-2">
            <Castle className="w-14 h-14 text-indigo-300 animate-pulse" />
            <span className="absolute -top-1 -right-2 text-xl animate-bounce">🏰</span>
          </div>
          <h3 className="text-base font-black tracking-wide text-white">의문의 성 (입구)</h3>
          <p className="text-[11px] text-indigo-200 text-center mt-1 font-medium">
            상자가 가득한 미지의 성! 최심부 도착 시 1000XP!
          </p>
          <span className="mt-2 text-[10px] font-bold bg-white/15 px-3.5 py-1 rounded-full border border-white/25 text-indigo-200 uppercase tracking-wider backdrop-blur-sm">
            [클릭하면 성 안으로 입장]
          </span>
        </div>

        {/* 3. Field Items & Traps on Ground */}
        {fieldItems.map((fi) => {
          const isHarmful = fi.item.isHarmful;
          return (
            <div
              key={fi.id}
              onClick={() => onCollectItem && onCollectItem(fi)}
              className={`absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-125 active:scale-95 z-10 ${
                isHarmful ? 'animate-pulse' : 'animate-bounce'
              }`}
              style={{
                left: `${fi.x}px`,
                top: `${fi.y}px`,
                animationDuration: isHarmful ? '1.5s' : '2s',
              }}
            >
              <div className="text-2xl filter drop-shadow-md">{fi.item.icon}</div>
              <div
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 border shadow-sm ${
                  isHarmful
                    ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                    : 'bg-slate-950/80 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {fi.item.name}
              </div>
            </div>
          );
        })}

        {/* 4. 30 AI Characters in the Open Field */}
        {aiCharacters.map((ai) => {
          const hpPercent = Math.min(100, Math.max(0, (ai.hp / ai.maxHp) * 100));
          return (
            <div
              key={ai.id}
              onClick={() => onSelectAi(ai)}
              className="absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group"
              style={{
                left: `${ai.x - 20}px`,
                top: `${ai.y - 30}px`,
              }}
            >
              {/* Overhead HP Bar (Always displayed on AI characters as per PDF Page 1) */}
              <div className="w-14 bg-slate-950/90 rounded-full h-1.5 border border-slate-700 overflow-hidden mb-0.5 shadow">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-[8px] font-extrabold text-white bg-slate-950/70 px-1 rounded-sm -mt-0.5 mb-0.5 shadow-sm">
                {ai.hp}/{ai.maxHp}
              </span>

              {/* AI Human Shape Avatar */}
              <div
                className="relative w-9 h-9 rounded-full border-2 border-white/80 shadow-md flex items-center justify-center text-lg transition-transform group-hover:ring-4 group-hover:ring-amber-400/50"
                style={{ backgroundColor: ai.avatarColor }}
              >
                🧑
              </div>

              {/* Name & Level Badge */}
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[9px] font-bold text-slate-900 bg-white/90 px-1.5 py-0.2 rounded-full shadow-sm border border-slate-300">
                  {ai.name} (Lv.{ai.level})
                </span>
              </div>

              {/* Speech bubble indicator on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-400/50 whitespace-nowrap shadow-lg">
                💬 클릭하여 대화/교환
              </div>

              {/* AI Follower Companions */}
              <FollowerCompanions character={ai} size="sm" />
            </div>
          );
        })}

        {/* 5. Player Character (사람 형태) & Follower Companion Squad */}
        <div
          className="absolute z-20 transition-all duration-100 flex flex-col items-center pointer-events-none"
          style={{
            left: `${player.x - 24}px`,
            top: `${player.y - 36}px`,
          }}
        >
          {/* Overhead Player HP Bar (Always displayed over player head as per PDF Page 1) */}
          <div className="w-16 bg-slate-950/90 rounded-full h-2 border border-slate-700 overflow-hidden mb-0.5 shadow-lg">
            <div
              className="bg-emerald-400 h-full transition-all duration-150"
              style={{ width: `${Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100))}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-white bg-slate-900/90 px-1.5 rounded -mt-0.5 mb-0.5 border border-slate-700 shadow-md">
            {player.hp}/{player.maxHp}
          </span>

          {/* Player Human Avatar */}
          <div className="relative w-11 h-11 rounded-full bg-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-2xl ring-4 ring-amber-400/60 animate-pulse">
            🧑
            {player.equippedShield && (
              <span className="absolute -top-1 -right-1 text-sm">🛡️</span>
            )}
          </div>

          {/* Player Name Badge */}
          <span className="text-[11px] font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200 mt-1 shadow-md">
            {player.name}
          </span>

          {/* Follower Companion Pets Squad */}
          <FollowerCompanions character={player} size="lg" />
        </div>
      </div>
    </div>
  );
};
