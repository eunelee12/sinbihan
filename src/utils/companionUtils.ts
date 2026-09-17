import { CompanionPet, CharacterBase } from '../types';

export function getCompanionsList(char?: CharacterBase | null): CompanionPet[] {
  if (!char) return [];
  if (char.companions && char.companions.length > 0) {
    return char.companions;
  }
  if (char.companion) {
    return [char.companion];
  }
  return [];
}

export interface CompanionBonuses {
  xpMultiplier: number;
  speedMultiplier: number;
  healPerTick: number;
  hasShield: boolean;
  shieldCount: number;
}

export function calculateCompanionBonuses(companions: CompanionPet[]): CompanionBonuses {
  let xpBonusSum = 0;
  let speedBonusSum = 0;
  let healSum = 0;
  let shieldCount = 0;

  for (const pet of companions) {
    if (pet.bonusType === 'xp') {
      xpBonusSum += Math.max(0, pet.bonusValue - 1);
    } else if (pet.bonusType === 'speed') {
      speedBonusSum += Math.max(0, pet.bonusValue - 1);
    } else if (pet.bonusType === 'heal') {
      healSum += pet.bonusValue;
    } else if (pet.bonusType === 'shield') {
      shieldCount += 1;
    }
  }

  return {
    xpMultiplier: 1 + xpBonusSum,
    // Cap maximum speed multiplier to avoid uncontrolled clipping
    speedMultiplier: Math.min(2.5, 1 + speedBonusSum),
    healPerTick: healSum,
    hasShield: shieldCount > 0,
    shieldCount,
  };
}

/**
 * Generates an offset position (x, y) relative to character center for companion pet index
 */
export function getCompanionOffset(index: number, total: number): { x: number; y: number; delay: number } {
  // Preset formation coordinates for up to 8 companions
  const formations = [
    { x: -30, y: 12 },   // Left side
    { x: 30, y: 12 },    // Right side
    { x: -48, y: -8 },   // Upper Left
    { x: 48, y: -8 },    // Upper Right
    { x: 0, y: 40 },     // Behind bottom
    { x: -62, y: 24 },   // Far Left
    { x: 62, y: 24 },    // Far Right
    { x: 0, y: -36 },    // Top overhead
  ];

  if (index < formations.length) {
    const f = formations[index];
    return {
      x: f.x,
      y: f.y,
      delay: (index % 4) * 0.25,
    };
  }

  // Circular orbit for > 8 companions
  const angle = (index / total) * Math.PI * 2;
  const radius = 45 + Math.floor(index / 6) * 18;
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius),
    delay: (index % 5) * 0.2,
  };
}
