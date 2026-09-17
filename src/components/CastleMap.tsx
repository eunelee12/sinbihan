import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, CastleChest, GameItem } from '../types';
import { generateCastleChests } from '../data/gameConstants';
import { Castle, Sparkles, LogOut, Heart, Trophy, AlertTriangle, Key } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { FollowerCompanions } from './FollowerCompanions';

interface CastleMapProps {
  player: PlayerCharacter;
  onUpdatePlayer: (updater: (prev: PlayerCharacter) => PlayerCharacter) => void;
  onExitCastle: () => void;
  onGainXp: (amount: number) => void;
  onGainItem: (item: GameItem) => void;
  onDamagePlayer: (amount: number) => void;
}

export const CastleMap: React.FC<CastleMapProps> = ({
  player,
  onUpdatePlayer,
  onExitCastle,
  onGainXp,
  onGainItem,
  onDamagePlayer,
}) => {
  const [chests, setChests] = useState<CastleChest[]>(() => generateCastleChests());
  const [reachedGoal, setReachedGoal] = useState(false);
  const [lootAlert, setLootAlert] = useState<{ message: string; icon: string } | null>(null);

  // Goal area definition
  const GOAL_X = 550;
  const GOAL_Y = 180;
  const GOAL_RADIUS = 90;

  // Check goal trigger
  useEffect(() => {
    const distToGoal = Math.hypot(player.x - GOAL_X, player.y - GOAL_Y);
    if (distToGoal < GOAL_RADIUS && !reachedGoal) {
      setReachedGoal(true);
      soundManager.playLevelUp();
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 }
        });
      } catch {
        // ignore
      }
      onGainXp(1000);
      setLootAlert({
        message: '🏆 의문의 성 최심부 도착! 1000 XP 보너스를 획득했습니다!',
        icon: '🏆',
      });
      setTimeout(() => setLootAlert(null), 3500);
    }
  }, [player.x, player.y, reachedGoal, onGainXp]);

  const handleOpenChest = (chestId: string) => {
    const target = chests.find((c) => c.id === chestId && !c.isOpened);
    if (!target) return;

    soundManager.playChestOpen();
    onGainItem(target.item);
    if (target.item.xpChange) {
      onGainXp(target.item.xpChange);
    }
    setLootAlert({
      message: `상자를 열어 [${target.item.name}] 을(를) 획득했습니다!`,
      icon: target.item.icon,
    });
    setTimeout(() => setLootAlert(null), 2500);

    setChests((prev) =>
      prev.map((c) => (c.id === chestId ? { ...c, isOpened: true } : c))
    );
  };

  // Traps in castle
  const castleTraps = [
    { x: 380, y: 500, damage: 15, name: '바닥 가시' },
    { x: 650, y: 520, damage: 20, name: '독 안개' },
    { x: 420, y: 900, damage: 25, name: '어둠의 저주' },
    { x: 700, y: 950, damage: 15, name: '스파이크 함정' },
  ];

  const lastTrapHit = useRef<{ [idx: number]: number }>({});

  // Auto-collect chests and trigger traps on contact
  useEffect(() => {
    // 1. Check chests contact
    for (const chest of chests) {
      if (!chest.isOpened) {
        const dist = Math.hypot(player.x - chest.x, player.y - chest.y);
        if (dist < 55) {
          handleOpenChest(chest.id);
        }
      }
    }

    // 2. Check traps contact with cooldown
    const now = Date.now();
    castleTraps.forEach((trap, idx) => {
      const dist = Math.hypot(player.x - trap.x, player.y - trap.y);
      if (dist < 45) {
        const lastHit = lastTrapHit.current[idx] || 0;
        if (now - lastHit > 1500) {
          lastTrapHit.current[idx] = now;
          onDamagePlayer(trap.damage);
          setLootAlert({
            message: `⚠️ [${trap.name}] 함정에 걸려 체력이 ${trap.damage} 감소했습니다!`,
            icon: '☠️',
          });
          setTimeout(() => setLootAlert(null), 2500);
        }
      }
    });
  }, [player.x, player.y, chests, onDamagePlayer]);

  // Map viewport dimensions
  const MAP_W = 1200;
  const MAP_H = 1600;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none">
      {/* Castle Dungeon Viewport */}
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
        {/* Dungeon Stone Floor Pattern */}
        <div className="absolute inset-0 bg-[#161922] bg-[radial-gradient(#252a36_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Dungeon Walls & Borders */}
          <div className="absolute inset-x-0 top-0 h-16 bg-slate-900 border-b-4 border-purple-900/60 shadow-xl flex items-center justify-around text-purple-400">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                🔥
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-16 bg-slate-900 border-r-4 border-purple-900/60" />
          <div className="absolute inset-y-0 right-0 w-16 bg-slate-900 border-l-4 border-purple-900/60" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-slate-900 border-t-4 border-purple-900/60" />
        </div>

        {/* Castle Landmark: Arrival / Goal Area at Top (도착지 - 도착하면 1000XP) */}
        <div
          className="absolute rounded-3xl p-6 flex flex-col items-center justify-center border-4 transition-all"
          style={{
            left: `${GOAL_X - 110}px`,
            top: `${GOAL_Y - 80}px`,
            width: '220px',
            height: '160px',
            backgroundColor: reachedGoal ? '#064e3b' : '#312e81',
            borderColor: reachedGoal ? '#34d399' : '#818cf8',
            boxShadow: reachedGoal ? '0 0 40px #10b981' : '0 0 30px #6366f1',
          }}
        >
          <Trophy className={`w-12 h-12 mb-2 ${reachedGoal ? 'text-amber-300 animate-bounce' : 'text-indigo-300 animate-pulse'}`} />
          <div className="text-sm font-black text-white text-center">
            {reachedGoal ? '🎉 도착 완료! (1000 XP 획득)' : '🏰 도착지 (도착 시 1000XP)'}
          </div>
          <div className="text-[11px] text-indigo-200 mt-1 font-semibold">
            {reachedGoal ? '성 탐험 완료' : '이곳에 발을 디디세요'}
          </div>
        </div>

        {/* Castle Mystery Chests (상자들 - 클릭하거나 다가가면 아이템 획득) */}
        {chests.map((chest) => (
          <div
            key={chest.id}
            onClick={() => handleOpenChest(chest.id)}
            className={`absolute flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 ${
              chest.isOpened ? 'opacity-60' : 'animate-bounce'
            }`}
            style={{
              left: `${chest.x}px`,
              top: `${chest.y}px`,
              animationDuration: '2s',
            }}
          >
            <div className="text-3xl filter drop-shadow-md">
              {chest.isOpened ? '📭' : '🎁'}
            </div>
            <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-amber-500/40 mt-0.5">
              {chest.isOpened ? '개봉됨' : '보물 상자'}
            </div>
          </div>
        ))}

        {/* Traps inside Castle */}
        {castleTraps.map((trap, idx) => (
          <div
            key={idx}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${trap.x}px`, top: `${trap.y}px` }}
          >
            <div className="text-2xl animate-pulse">☠️</div>
            <div className="text-[9px] text-rose-400 font-bold bg-rose-950/80 px-1 rounded border border-rose-600/40">
              {trap.name} (-{trap.damage})
            </div>
          </div>
        ))}

        {/* Entrance / Exit Door at bottom */}
        <div
          onClick={onExitCastle}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-t from-emerald-900 to-slate-900 border-2 border-emerald-400/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-950"
        >
          <LogOut className="w-8 h-8 text-emerald-400 mb-1" />
          <span className="text-xs font-bold text-emerald-200">🚪 성 출구 (필드로 나가기)</span>
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

          {/* Player Human Sprite */}
          <div className="relative w-10 h-10 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-xl">
            🧑
            {player.equippedShield && (
              <span className="absolute -top-1 -right-1 text-xs">🛡️</span>
            )}
          </div>

          <span className="text-[11px] font-bold text-amber-300 bg-slate-900/90 px-2 py-0.2 rounded-full border border-amber-500/40 mt-1">
            {player.name}
          </span>

          {/* Follower Companion Pets Squad */}
          <FollowerCompanions character={player} size="lg" />
        </div>
      </div>

      {/* Castle UI overlay */}
      <div className="fixed top-20 left-4 z-30 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-4 shadow-2xl text-white max-w-xs font-sans">
        <div className="flex items-center gap-2 text-indigo-200 font-black text-xs mb-1.5 uppercase tracking-wider">
          <Castle className="w-4 h-4 text-indigo-300" />
          <span>의문의 성 내부 탐험 중</span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          상자를 클릭해 아이템을 모으고 북쪽 최심부 도착지로 이동하여 1000 XP를 획득하세요!
        </p>
      </div>

      {/* Loot Toast Alert */}
      {lootAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 backdrop-blur-2xl bg-slate-900/90 border border-white/30 text-white px-6 py-3.5 rounded-3xl shadow-2xl flex items-center gap-3 animate-bounce font-black text-xs sm:text-sm font-sans">
          <span className="text-2xl">{lootAlert.icon}</span>
          <span>{lootAlert.message}</span>
        </div>
      )}
    </div>
  );
};
