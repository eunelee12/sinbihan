import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlayerCharacter,
  AICharacter,
  FieldItemInstance,
  GameLocation,
  UserAccount,
  GameItem,
  CompanionPet,
} from './types';
import {
  generateInitialAiCharacters,
  generateInitialFieldItems,
  calculateLevel,
  getMaxHpForLevel,
  COMPANION_PETS_LIST,
  GAME_ITEMS,
} from './data/gameConstants';
import {
  getLastLoggedInUser,
  saveCurrentPlayer,
  getStoredUsers,
  logoutUser,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { getCompanionsList, calculateCompanionBonuses } from './utils/companionUtils';
import confetti from 'canvas-confetti';

import { LoginScreen } from './components/LoginScreen';
import { HUD } from './components/HUD';
import { WorldMap } from './components/WorldMap';
import { CastleMap } from './components/CastleMap';
import { WindIslandMap } from './components/WindIslandMap';
import { AiCharacterModal } from './components/AiCharacterModal';
import { TradeModal } from './components/TradeModal';
import { InventoryModal } from './components/InventoryModal';
import { GameOverModal } from './components/GameOverModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MobileDPad } from './components/MobileDPad';
import { EggHatchModal } from './components/EggHatchModal';

export default function App() {
  // Authentication & Player State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [player, setPlayer] = useState<PlayerCharacter | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GameLocation>('field');

  // World Entities (30 AI Characters & Field Items)
  const [aiCharacters, setAiCharacters] = useState<AICharacter[]>(() => generateInitialAiCharacters());
  const [fieldItems, setFieldItems] = useState<FieldItemInstance[]>(() => generateInitialFieldItems());

  // UI Modal States
  const [selectedAi, setSelectedAi] = useState<AICharacter | null>(null);
  const [tradingAi, setTradingAi] = useState<AICharacter | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [hatchingPet, setHatchingPet] = useState<CompanionPet | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon?: string } | null>(null);

  // Settings & Controls
  const [isMuted, setIsMuted] = useState(false);
  const [showDpad, setShowDpad] = useState(false);
  const activeDirections = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Check auto login on load & detect mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      setShowDpad(true);
    }
    const savedUser = getLastLoggedInUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      setPlayer(savedUser.playerData);
      setCurrentLocation(savedUser.playerData.location || 'field');
    }
  }, []);

  // Show floating Toast alert
  const showToast = (text: string, icon?: string) => {
    setToastMessage({ text, icon });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Gain XP & Handle Level Up logic
  const handleGainXp = useCallback((amount: number) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const petBonuses = calculateCompanionBonuses(getCompanionsList(prev));
      const finalAmount = Math.floor(amount * petBonuses.xpMultiplier);

      const newXp = prev.xp + finalAmount;
      const oldLevel = prev.level;
      const newLevel = calculateLevel(newXp);

      if (newLevel > oldLevel) {
        const newMaxHp = getMaxHpForLevel(newLevel);
        setTimeout(() => {
          soundManager.playLevelUp();
          try {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 },
            });
          } catch {
            // ignore
          }
          showToast(`🌟 레벨 업! [Lv.${newLevel}] 달성! (최대 체력이 ${newMaxHp}로 증가)`, '🌟');
        }, 0);

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          maxHp: newMaxHp,
          hp: newMaxHp, // restore full hp upon level up
        };
      }

      return {
        ...prev,
        xp: newXp,
      };
    });
  }, []);

  // Take damage or heal player
  const handleDamagePlayer = useCallback((amount: number) => {
    setPlayer((prev) => {
      if (!prev || prev.hp <= 0) return prev;
      if (prev.equippedShield && amount > 0) {
        setTimeout(() => {
          soundManager.playChestOpen();
          showToast('🛡️ 마법 방어막이 피해를 완벽하게 흡수했습니다!', '🛡️');
        }, 0);
        return { ...prev, equippedShield: false };
      }

      const nextHp = Math.max(0, prev.hp - amount);
      if (nextHp === 0 && prev.hasInfiniteRevive) {
        setTimeout(() => {
          soundManager.playRevive();
          showToast('♾️ 무한 부활장치 발동! 체력 10으로 부활했습니다.', '♾️');
        }, 0);
        return { ...prev, hp: 10 };
      }

      setTimeout(() => {
        soundManager.playDamage();
      }, 0);

      return {
        ...prev,
        hp: nextHp,
      };
    });
  }, []);

  const handleHealPlayer = useCallback((amount: number) => {
    soundManager.playItemPickup();
    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + amount),
      };
    });
  }, []);

  // Gain Item into Inventory
  const handleGainItem = useCallback((item: GameItem, count = 1) => {
    soundManager.playItemPickup();
    setPlayer((prev) => {
      if (!prev) return prev;
      const inv = [...prev.inventory];
      const existingIdx = inv.findIndex((slot) => slot.item.id === item.id);
      if (existingIdx >= 0) {
        inv[existingIdx] = {
          ...inv[existingIdx],
          quantity: inv[existingIdx].quantity + count,
        };
      } else {
        inv.push({ item, quantity: count });
      }
      return {
        ...prev,
        inventory: inv,
      };
    });
  }, []);

  // Use Item from Inventory
  const handleUseItem = useCallback(
    (item: GameItem) => {
      if (!player) return;
      const slot = player.inventory.find((s) => s.item.id === item.id);
      if (!slot || slot.quantity <= 0) return;

      // Decrement quantity
      setPlayer((prev) => {
        if (!prev) return prev;
        const inv = prev.inventory
          .map((s) => (s.item.id === item.id ? { ...s, quantity: s.quantity - 1 } : s))
          .filter((s) => s.quantity > 0);
        return { ...prev, inventory: inv };
      });

      // Item Effect handling
      if (item.type === 'pet_egg') {
        // Hatch random pet
        const availablePets = COMPANION_PETS_LIST;
        const randomPet = availablePets[Math.floor(Math.random() * availablePets.length)];
        setHatchingPet(randomPet);
        setShowInventory(false);
      } else if (item.category === 'potion' || item.hpChange) {
        handleHealPlayer(item.hpChange || 50);
        showToast(`💧 [${item.name}] 사용 완료! 체력이 회복되었습니다.`, item.icon);
      } else if (item.type === 'shield') {
        soundManager.playChestOpen();
        setPlayer((prev) => (prev ? { ...prev, equippedShield: true } : prev));
        showToast('🛡️ 마법 방어막이 활성화되었습니다!', '🛡️');
      } else if (item.type === 'revive_infinite') {
        soundManager.playRevive();
        setPlayer((prev) => (prev ? { ...prev, hasInfiniteRevive: true, hp: Math.max(prev.hp, 20) } : prev));
        showToast('♾️ 무한 부활장치가 활성화되었습니다!', '♾️');
      } else if (item.category === 'revive') {
        soundManager.playRevive();
        const reviveHp = item.hpChange && item.hpChange > 100 ? player.maxHp : (item.hpChange || 50);
        setPlayer((prev) => (prev ? { ...prev, hp: Math.min(prev.maxHp, reviveHp) } : prev));
        showToast(`🌟 [${item.name}] 작동! 체력 ${reviveHp}으로 부활했습니다.`, '🌟');
      } else if (item.type === 'mystery_box') {
        // Special mystery box rewards
        soundManager.playChestOpen();
        handleGainXp(300);
        handleGainItem(GAME_ITEMS.heal_potion_100);
        showToast('🎁 의문의 상자 개봉! 300 XP와 고급 생명수를 획득했습니다!', '🎁');
      } else if (item.xpChange) {
        handleGainXp(item.xpChange);
        showToast(`✨ [${item.name}] 사용 완료! ${item.xpChange} XP를 획득했습니다.`, '✨');
      }
    },
    [player, handleHealPlayer, handleGainItem, handleGainXp]
  );

  // Execute Trade with AI
  const handleExecuteTrade = useCallback(
    (playerItemId: string, aiItemId: string) => {
      if (!player || !tradingAi) return;

      const playerItemSlot = player.inventory.find((s) => s.item.id === playerItemId);
      const aiItem = tradingAi.inventory.find((i) => i.id === aiItemId);

      if (!playerItemSlot || !aiItem) return;

      // Transfer items
      // 1. Remove player item, add ai item
      setPlayer((prev) => {
        if (!prev) return prev;
        const inv = prev.inventory
          .map((s) => (s.item.id === playerItemId ? { ...s, quantity: s.quantity - 1 } : s))
          .filter((s) => s.quantity > 0);

        const existingAiItemIdx = inv.findIndex((s) => s.item.id === aiItem.id);
        if (existingAiItemIdx >= 0) {
          inv[existingAiItemIdx] = {
            ...inv[existingAiItemIdx],
            quantity: inv[existingAiItemIdx].quantity + 1,
          };
        } else {
          inv.push({ item: aiItem, quantity: 1 });
        }

        return { ...prev, inventory: inv };
      });

      // 2. Update AI inventory
      setAiCharacters((prev) =>
        prev.map((ai) => {
          if (ai.id === tradingAi.id) {
            const newAiInv = ai.inventory.filter((i) => i.id !== aiItemId);
            newAiInv.push(playerItemSlot.item);
            return {
              ...ai,
              inventory: newAiInv,
              xp: ai.xp + 1000,
              level: calculateLevel(ai.xp + 1000),
            };
          }
          return ai;
        })
      );

      // 3. Grant 1000 XP reward (PDF Page 2 specification: 교환 시 경험치 1000XP)
      handleGainXp(1000);
      showToast(`🤝 교환 성공! [${aiItem.name}] 획득 및 1000 XP 보너스 부여!`, '🎉');
    },
    [player, tradingAi, handleGainXp]
  );

  // Auto Sync Player changes to local persistence
  useEffect(() => {
    if (currentUser && player) {
      const updatedAccount: UserAccount = {
        ...currentUser,
        playerData: {
          ...player,
          location: currentLocation,
        },
      };
      saveCurrentPlayer(updatedAccount);
    }
  }, [player, currentUser, currentLocation]);

  // Pet Passive Healing Tick Loop across all companions
  useEffect(() => {
    if (!player) return;
    const currentBonuses = calculateCompanionBonuses(getCompanionsList(player));
    if (currentBonuses.healPerTick > 0) {
      const healInterval = setInterval(() => {
        setPlayer((prev) => {
          if (!prev || prev.hp <= 0 || prev.hp >= prev.maxHp) return prev;
          const liveBonuses = calculateCompanionBonuses(getCompanionsList(prev));
          if (liveBonuses.healPerTick <= 0) return prev;
          return {
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + liveBonuses.healPerTick),
          };
        });
      }, 3000);
      return () => clearInterval(healInterval);
    }
  }, [player?.companion, player?.companions]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) activeDirections.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) activeDirections.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) activeDirections.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) activeDirections.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) activeDirections.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) activeDirections.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) activeDirections.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) activeDirections.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Keep refs for instant frame-rate collision checking
  const playerRef = useRef<PlayerCharacter | null>(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const fieldItemsRef = useRef<FieldItemInstance[]>(fieldItems);
  useEffect(() => {
    fieldItemsRef.current = fieldItems;
  }, [fieldItems]);

  // Collect a field item immediately
  const handleCollectFieldItem = useCallback(
    (targetFi: FieldItemInstance) => {
      // Remove from field items state & ref
      setFieldItems((prev) => prev.filter((fi) => fi.id !== targetFi.id));
      fieldItemsRef.current = fieldItemsRef.current.filter((fi) => fi.id !== targetFi.id);

      if (targetFi.item.isHarmful) {
        const dmg = Math.abs(targetFi.item.hpChange || 15);
        handleDamagePlayer(dmg);
        showToast(`⚠️ [${targetFi.item.name}] 에 걸려 체력이 ${dmg} 감소했습니다!`, '💥');
      } else {
        soundManager.playItemPickup();
        handleGainItem(targetFi.item);
        if (targetFi.item.xpChange) {
          handleGainXp(targetFi.item.xpChange);
        }
        showToast(`✨ [${targetFi.item.name}] 을(를) 획득하여 가방에 보관했습니다!`, targetFi.item.icon);
      }
    },
    [handleDamagePlayer, handleGainItem, handleGainXp]
  );

  // Main Movement & Entity Collision Loop (60 FPS)
  useEffect(() => {
    if (!player || player.hp <= 0) return;

    const gameLoop = setInterval(() => {
      const { up, down, left, right } = activeDirections.current;
      if (!up && !down && !left && !right) return;

      setPlayer((prev) => {
        if (!prev || prev.hp <= 0) return prev;

        // Base Speed with Companion Speed multiplier (stacks from multiple pets)
        const petBonuses = calculateCompanionBonuses(getCompanionsList(prev));
        const speed = 5 * petBonuses.speedMultiplier;

        let nextX = prev.x;
        let nextY = prev.y;
        let nextDir = prev.direction;

        if (up) {
          nextY -= speed;
          nextDir = 'up';
        }
        if (down) {
          nextY += speed;
          nextDir = 'down';
        }
        if (left) {
          nextX -= speed;
          nextDir = 'left';
        }
        if (right) {
          nextX += speed;
          nextDir = 'right';
        }

        // Boundary constraints
        const maxW = currentLocation === 'field' ? 2300 : currentLocation === 'castle' ? 1150 : 900;
        const maxH = currentLocation === 'field' ? 1900 : currentLocation === 'castle' ? 1500 : 900;
        nextX = Math.max(60, Math.min(maxW, nextX));
        nextY = Math.max(80, Math.min(maxH, nextY));

        // Instant Collision Check on every movement frame
        if (currentLocation === 'field') {
          const currentItems = fieldItemsRef.current;
          const hit = currentItems.find((fi) => Math.hypot(nextX - fi.x, nextY - fi.y) < 52);
          if (hit) {
            handleCollectFieldItem(hit);
          }
        }

        return {
          ...prev,
          x: nextX,
          y: nextY,
          direction: nextDir,
        };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [player?.hp, player?.companion, player?.companions, currentLocation, handleCollectFieldItem]);

  // Continuous Field Items Collision Detection Loop (30 FPS check for stationary / warp)
  useEffect(() => {
    if (currentLocation !== 'field') return;

    const collisionInterval = setInterval(() => {
      const p = playerRef.current;
      if (!p || p.hp <= 0) return;

      const currentItems = fieldItemsRef.current;
      const hit = currentItems.find((fi) => Math.hypot(p.x - fi.x, p.y - fi.y) < 52);
      if (hit) {
        handleCollectFieldItem(hit);
      }
    }, 1000 / 30);

    return () => clearInterval(collisionInterval);
  }, [currentLocation, handleCollectFieldItem]);

  // AI Characters Wander Simulation Loop
  useEffect(() => {
    const aiWanderInterval = setInterval(() => {
      setAiCharacters((prev) =>
        prev.map((ai) => {
          // Check if reached target
          const dist = Math.hypot(ai.targetX - ai.x, ai.targetY - ai.y);
          let newTargetX = ai.targetX;
          let newTargetY = ai.targetY;

          if (dist < 20 || Math.random() < 0.1) {
            newTargetX = Math.max(100, Math.min(2200, ai.x + (Math.random() * 400 - 200)));
            newTargetY = Math.max(150, Math.min(1850, ai.y + (Math.random() * 400 - 200)));
          }

          const angle = Math.atan2(newTargetY - ai.y, newTargetX - ai.x);
          const nextX = ai.x + Math.cos(angle) * ai.speed;
          const nextY = ai.y + Math.sin(angle) * ai.speed;

          return {
            ...ai,
            x: nextX,
            y: nextY,
            targetX: newTargetX,
            targetY: newTargetY,
          };
        })
      );
    }, 200);

    return () => clearInterval(aiWanderInterval);
  }, []);

  // Login handler
  const handleLoginSuccess = (account: UserAccount) => {
    const users = getStoredUsers();
    const latest = users[account.name] || account;
    setCurrentUser(latest);
    setPlayer(latest.playerData);
    setCurrentLocation(latest.playerData.location || 'field');
  };

  const handleLogout = () => {
    if (currentUser && player) {
      const updatedAccount: UserAccount = {
        ...currentUser,
        playerData: {
          ...player,
          location: currentLocation,
        },
      };
      saveCurrentPlayer(updatedAccount);
    }
    logoutUser();
    setCurrentUser(null);
    setPlayer(null);
  };

  const handleToggleMute = () => {
    soundManager.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // If not logged in, render LoginScreen
  if (!player || !currentUser) {
    return (
      <div className="w-full h-screen">
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenAdmin={() => setShowAdmin(true)}
        />
        {showAdmin && (
          <AdminDashboard
            player={null}
            allAccounts={getStoredUsers()}
            aiCharacters={aiCharacters}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Top HUD (Level, XP, Location Switcher, Tool Bag, Admin, Dpad, Audio) */}
      <HUD
        player={player}
        currentLocation={currentLocation}
        onOpenInventory={() => setShowInventory(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onEnterLocation={(loc) => {
          setCurrentLocation(loc);
          if (loc === 'field') {
            setPlayer((p) => (p ? { ...p, x: 1100, y: 1000 } : p));
          } else if (loc === 'castle') {
            setPlayer((p) => (p ? { ...p, x: 550, y: 1350 } : p));
          } else if (loc === 'wind_island') {
            setPlayer((p) => (p ? { ...p, x: 500, y: 500 } : p));
          }
        }}
        onLogout={handleLogout}
        showDpad={showDpad}
        onToggleDpad={() => setShowDpad(!showDpad)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* World Map View depending on location */}
      {currentLocation === 'field' && (
        <WorldMap
          player={player}
          aiCharacters={aiCharacters}
          fieldItems={fieldItems}
          onSelectAi={(ai) => setSelectedAi(ai)}
          onCollectItem={handleCollectFieldItem}
          onEnterLocation={(loc) => {
            setCurrentLocation(loc);
            if (loc === 'castle') setPlayer((p) => (p ? { ...p, x: 550, y: 1350 } : p));
            if (loc === 'wind_island') setPlayer((p) => (p ? { ...p, x: 500, y: 500 } : p));
          }}
        />
      )}

      {currentLocation === 'castle' && (
        <CastleMap
          player={player}
          onUpdatePlayer={setPlayer}
          onExitCastle={() => {
            setCurrentLocation('field');
            setPlayer((p) => (p ? { ...p, x: 1600, y: 350 } : p));
          }}
          onGainXp={handleGainXp}
          onGainItem={handleGainItem}
          onDamagePlayer={handleDamagePlayer}
        />
      )}

      {currentLocation === 'wind_island' && (
        <WindIslandMap
          player={player}
          onExitIsland={() => {
            setCurrentLocation('field');
            setPlayer((p) => (p ? { ...p, x: 800, y: 350 } : p));
          }}
          onGainXp={handleGainXp}
          onGainItem={handleGainItem}
        />
      )}

      {/* On-screen Mobile D-Pad (Touch / Option for Keyboard users) */}
      {showDpad && (
        <MobileDPad
          onDirectionPress={(dir) => {
            activeDirections.current = {
              up: dir === 'up',
              down: dir === 'down',
              left: dir === 'left',
              right: dir === 'right',
            };
          }}
          onDirectionRelease={() => {
            activeDirections.current = {
              up: false,
              down: false,
              left: false,
              right: false,
            };
          }}
        />
      )}

      {/* AI Character Detail Popup */}
      {selectedAi && (
        <AiCharacterModal
          ai={selectedAi}
          player={player}
          onClose={() => setSelectedAi(null)}
          onStartTrade={(ai) => {
            setSelectedAi(null);
            setTradingAi(ai);
          }}
        />
      )}

      {/* Item Trade Modal */}
      {tradingAi && (
        <TradeModal
          ai={tradingAi}
          player={player}
          onClose={() => setTradingAi(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}

      {/* Inventory: 도구 가방 Modal */}
      {showInventory && (
        <InventoryModal
          player={player}
          onClose={() => setShowInventory(false)}
          onUseItem={handleUseItem}
        />
      )}

      {/* Companion Pet Egg Hatching Modal */}
      {hatchingPet && (
        <EggHatchModal
          pet={hatchingPet}
          currentCount={getCompanionsList(player).length}
          onConfirm={() => {
            const uniqueHatchedPet: CompanionPet = {
              ...hatchingPet,
              id: `${hatchingPet.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            };
            setPlayer((prev) => {
              if (!prev) return prev;
              const currentList = getCompanionsList(prev);
              const newList = [...currentList, uniqueHatchedPet];
              return {
                ...prev,
                companion: uniqueHatchedPet,
                companions: newList,
              };
            });
            setHatchingPet(null);
            showToast(`🐣 [${uniqueHatchedPet.name}] 이(가) 보조캐릭터 군단에 합류했습니다!`, uniqueHatchedPet.icon);
          }}
        />
      )}

      {/* Admin Dashboard */}
      {showAdmin && (
        <AdminDashboard
          player={player}
          allAccounts={getStoredUsers()}
          aiCharacters={aiCharacters}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* GAME OVER Screen (when HP is 0) */}
      {player.hp <= 0 && (
        <GameOverModal
          player={player}
          onUseItemToRevive={(item) => {
            handleUseItem(item);
          }}
          onEmergencyRespawn={() => {
            soundManager.playRevive();
            setPlayer((prev) =>
              prev
                ? {
                    ...prev,
                    hp: 15,
                    x: 1100,
                    y: 1000,
                    location: 'field',
                  }
                : prev
            );
            setCurrentLocation('field');
            showToast('🌱 안전한 시작 지점에서 회복했습니다.', '🌱');
          }}
        />
      )}

      {/* Global Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900/95 border border-amber-400 text-amber-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp font-bold text-xs sm:text-sm">
          {toastMessage.icon && <span className="text-xl">{toastMessage.icon}</span>}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
