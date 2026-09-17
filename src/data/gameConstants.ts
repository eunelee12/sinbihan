import { GameItem, CompanionPet, AICharacter } from '../types';

// PDF 명시 레벨 수열 기준
export const LEVEL_XP_REQUIREMENTS = [
  0,      // Level 1
  1000,   // Level 2
  2000,   // Level 3
  3000,   // Level 4
  5000,   // Level 5
  8000,   // Level 6
  10000,  // Level 7
  12000,  // Level 8
  14000,  // Level 9
  15000,  // Level 10
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level >= 10) return LEVEL_XP_REQUIREMENTS[9];
  return LEVEL_XP_REQUIREMENTS[level - 1];
}

export function getNextLevelXp(level: number): number {
  if (level >= 10) return LEVEL_XP_REQUIREMENTS[9];
  return LEVEL_XP_REQUIREMENTS[level];
}

export function getMaxHpForLevel(level: number): number {
  return 50 + (level - 1) * 15;
}

export const GAME_ITEMS: Record<string, GameItem> = {
  xp_potion_30: {
    id: 'xp_potion_30',
    type: 'xp_potion_30',
    name: 'XP 영약 (+30)',
    description: '즉시 30의 경험치(XP)를 획득합니다.',
    icon: '✨',
    color: '#8b5cf6',
    category: 'xp',
    xpChange: 30,
  },
  xp_potion_random: {
    id: 'xp_potion_random',
    type: 'xp_potion_random',
    name: '미지의 XP 물약 (+1~50)',
    description: '즉시 1 ~ 50 사이의 랜덤 경험치를 획득합니다.',
    icon: '🧪',
    color: '#a855f7',
    category: 'xp',
    xpChange: 25, // average/base
  },
  xp_crystal_large: {
    id: 'xp_crystal_large',
    type: 'xp_crystal_large',
    name: '찬란한 경험의 결정 (+200)',
    description: '신비한 마력이 깃든 큰 결정체. 즉시 200 XP를 부여합니다.',
    icon: '💎',
    color: '#3b82f6',
    category: 'xp',
    xpChange: 200,
  },
  heal_potion_50: {
    id: 'heal_potion_50',
    type: 'heal_potion_50',
    name: '체력 물약 (+50)',
    description: '체력을 50 포인트 즉시 회복합니다.',
    icon: '💧',
    color: '#06b6d4',
    category: 'potion',
    hpChange: 50,
  },
  heal_potion_100: {
    id: 'heal_potion_100',
    type: 'heal_potion_100',
    name: '고급 생명수 (+100)',
    description: '체력을 100 포인트 즉시 회복합니다.',
    icon: '💖',
    color: '#ec4899',
    category: 'potion',
    hpChange: 100,
  },
  shield: {
    id: 'shield',
    type: 'shield',
    name: '방어막 펜던트',
    description: '피해를 받을 때 1회 완전히 막아주는 마법 방어막을 부여합니다.',
    icon: '🛡️',
    color: '#eab308',
    category: 'shield',
  },
  pet_egg: {
    id: 'pet_egg',
    type: 'pet_egg',
    name: '보조캐릭터 알',
    description: '알이 깨지면 신비한 능력을 가진 보조캐릭터가 랜덤으로 부화합니다!',
    icon: '🥚',
    color: '#f59e0b',
    category: 'pet',
  },
  revive_normal: {
    id: 'revive_normal',
    type: 'revive_normal',
    name: '일반 부활장치',
    description: '체력이 0이 되어 쓰러졌을 때 그 자리에서 체력 50으로 즉시 부활합니다.',
    icon: '⚙️',
    color: '#10b981',
    category: 'revive',
    hpChange: 50,
  },
  revive_infinite: {
    id: 'revive_infinite',
    type: 'revive_infinite',
    name: '무한 부활장치',
    description: '사망 시 언제든지 체력 10을 회복하며 무한히 부활할 수 있는 기계 장치.',
    icon: '♾️',
    color: '#6366f1',
    category: 'revive',
    hpChange: 10,
  },
  revive_super: {
    id: 'revive_super',
    type: 'revive_super',
    name: '슈퍼 부활장치',
    description: '사망 시 최대 체력 100%로 완벽하게 부활합니다!',
    icon: '🌟',
    color: '#f43f5e',
    category: 'revive',
    hpChange: 999,
  },
  trap_small: {
    id: 'trap_small',
    type: 'trap_small',
    name: '날카로운 가시',
    description: '밟으면 체력이 5 감소합니다.',
    icon: '🌵',
    color: '#ef4444',
    category: 'trap',
    hpChange: -5,
    isHarmful: true,
  },
  trap_medium: {
    id: 'trap_medium',
    type: 'trap_medium',
    name: '독성 버섯 함정',
    description: '닿으면 체력이 5 ~ 40 사이로 즉시 감소합니다.',
    icon: '🍄',
    color: '#dc2626',
    category: 'trap',
    hpChange: -20,
    isHarmful: true,
  },
  trap_large: {
    id: 'trap_large',
    type: 'trap_large',
    name: '저주받은 흑마법구 (-50)',
    description: '치명적인 마법구. 닿으면 체력이 50 즉시 감소합니다.',
    icon: '☠️',
    color: '#991b1b',
    category: 'trap',
    hpChange: -50,
    isHarmful: true,
  },
  mystery_box: {
    id: 'mystery_box',
    type: 'mystery_box',
    name: '의문의 상자',
    description: '열면 진귀한 보물이나 대량의 XP, 강력한 부활 장치가 들어있습니다.',
    icon: '🎁',
    color: '#8b5cf6',
    category: 'special',
  },
  wind_gem: {
    id: 'wind_gem',
    type: 'wind_gem',
    name: '바람의 정수',
    description: '바람의 섬에서 생성되는 신비한 보석. 이동속도와 체력을 영구 보조합니다.',
    icon: '🌀',
    color: '#38bdf8',
    category: 'special',
    xpChange: 150,
    hpChange: 30,
  },
};

export const COMPANION_PETS_LIST: CompanionPet[] = [
  {
    id: 'pet_dragon',
    name: '아기 드래곤',
    species: '화염룡',
    level: 3,
    description: '주인을 든든히 지키며 체력을 서서히 재생시킵니다.',
    color: '#f97316',
    icon: '🐉',
    bonusType: 'heal',
    bonusValue: 2,
  },
  {
    id: 'pet_fairy',
    name: '숲의 요정',
    species: '엘프 페어리',
    level: 2,
    description: '주변의 마력을 모아 이동속도를 25% 상승시킵니다.',
    color: '#22c55e',
    icon: '🧚',
    bonusType: 'speed',
    bonusValue: 1.25,
  },
  {
    id: 'pet_robo',
    name: '꼬마 로보',
    species: '메카 드론',
    level: 4,
    description: '경험치 획득량을 30% 증가시켜 빠른 성장을 돕습니다.',
    color: '#06b6d4',
    icon: '🤖',
    bonusType: 'xp',
    bonusValue: 1.3,
  },
  {
    id: 'pet_jelly',
    name: '구름 젤리',
    species: '슬라임',
    level: 1,
    description: '주변 피해를 흡수하여 지속적인 방어막을 제공합니다.',
    color: '#a855f7',
    icon: '🟣',
    bonusType: 'shield',
    bonusValue: 1,
  },
  {
    id: 'pet_phoenix',
    name: '황금 불사조',
    species: '불사조',
    level: 5,
    description: '치명적인 피해를 방어하고 엄청난 XP와 회복을 제공하는 전설의 보조캐릭터.',
    color: '#eab308',
    icon: '🦅',
    bonusType: 'heal',
    bonusValue: 5,
  },
  {
    id: 'pet_fox',
    name: '달빛 여우',
    species: '구미호',
    level: 2,
    description: '발걸음을 가볍게 하고 신비한 기운으로 주인을 이끕니다.',
    color: '#38bdf8',
    icon: '🦊',
    bonusType: 'speed',
    bonusValue: 1.2,
  }
];

const AI_NAMES = [
  '루나', '카엘', '아린', '제온', '미르', '다온', '하람', '시우', '유나', '태오',
  '민서', '레오', '소율', '이준', '나래', '보나', '진우', '찬희', '도윤', '하은',
  '로운', '서하', '은우', '지안', '예린', '시아', '주원', '건우', '연우', '다인'
];

const AI_DIALOGUES = [
  '안녕! 신비한 세계에 온 걸 환영해. 좋은 아이템이 있으면 교환하자!',
  '의문의 성 깊은 곳에는 엄청난 보물이 숨겨져 있다고 해.',
  '바람의 섬에서는 신비한 정수를 얻을 수 있어!',
  '보조캐릭터 알을 부화시키면 모험이 훨씬 수월해질 거야.',
  '함정을 조심해! 체력이 0이 되면 도구로만 회복할 수 있어.',
  '서로 필요한 물건을 바꾸면 1000XP를 얻을 수 있으니 언제든 교환 신청해줘!',
  '난 오늘 고급 생명수를 구했어. 너와 교환할 수 있을까?',
  '레벨이 오르면 체력 최대치도 늘어난다는 사실을 잊지 마.',
  '무한 부활장치만 있으면 언제든 다시 일어설 수 있지!',
  '의문의 성 도착지까지 가면 1000XP를 단번에 얻을 수 있어.'
];

const AI_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', 
  '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', 
  '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

// Generate 30 AI Characters
export function generateInitialAiCharacters(): AICharacter[] {
  const characters: AICharacter[] = [];
  const mapWidth = 2400;
  const mapHeight = 2000;

  for (let i = 0; i < 30; i++) {
    const level = Math.floor(Math.random() * 8) + 1; // Level 1 to 8
    const baseMinXp = getXpForLevel(level);
    const baseMaxXp = getNextLevelXp(level);
    const xp = baseMinXp + Math.floor(Math.random() * (Math.max(100, baseMaxXp - baseMinXp)));
    const maxHp = getMaxHpForLevel(level);
    const hp = Math.max(20, Math.floor(maxHp * (0.6 + Math.random() * 0.4)));

    // Assign items for trade
    const randomItems: GameItem[] = [];
    const itemKeys = Object.keys(GAME_ITEMS).filter(k => !GAME_ITEMS[k].isHarmful);
    const itemCount = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < itemCount; c++) {
      const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
      randomItems.push(GAME_ITEMS[randomKey]);
    }

    const startX = 200 + Math.random() * (mapWidth - 400);
    const startY = 300 + Math.random() * (mapHeight - 600);

    // Some AI characters also have companion pets
    let companion: CompanionPet | undefined = undefined;
    if (Math.random() > 0.4) {
      companion = COMPANION_PETS_LIST[Math.floor(Math.random() * COMPANION_PETS_LIST.length)];
    }

    characters.push({
      id: `ai_${i + 1}`,
      name: AI_NAMES[i] || `모험가_${i + 1}`,
      level,
      xp,
      hp,
      maxHp,
      x: startX,
      y: startY,
      targetX: startX + (Math.random() * 200 - 100),
      targetY: startY + (Math.random() * 200 - 100),
      direction: 'down',
      speed: 1.2 + Math.random() * 0.8,
      avatarColor: AI_COLORS[i % AI_COLORS.length],
      dialogue: AI_DIALOGUES[i % AI_DIALOGUES.length],
      personality: ['친절한', '활발한', '신중한', '호기심 많은', '용감한'][i % 5],
      inventory: randomItems,
      companion,
    });
  }

  return characters;
}

// Generate Initial Field Items
export function generateInitialFieldItems() {
  const items: { id: string; type: string; x: number; y: number; item: GameItem }[] = [];
  const mapWidth = 2400;
  const mapHeight = 2000;

  const itemDistribution: { type: string; count: number }[] = [
    { type: 'xp_potion_30', count: 18 },
    { type: 'xp_potion_random', count: 15 },
    { type: 'xp_crystal_large', count: 8 },
    { type: 'heal_potion_50', count: 16 },
    { type: 'heal_potion_100', count: 10 },
    { type: 'shield', count: 7 },
    { type: 'pet_egg', count: 8 },
    { type: 'revive_normal', count: 6 },
    { type: 'revive_infinite', count: 4 },
    { type: 'revive_super', count: 3 },
    { type: 'trap_small', count: 14 },
    { type: 'trap_medium', count: 10 },
    { type: 'trap_large', count: 6 },
    { type: 'mystery_box', count: 12 },
    { type: 'wind_gem', count: 8 },
  ];

  let idCounter = 1;
  for (const dist of itemDistribution) {
    const baseItem = GAME_ITEMS[dist.type];
    if (!baseItem) continue;

    for (let i = 0; i < dist.count; i++) {
      items.push({
        id: `field_item_${idCounter++}`,
        type: dist.type,
        x: 100 + Math.random() * (mapWidth - 200),
        y: 200 + Math.random() * (mapHeight - 400),
        item: baseItem,
      });
    }
  }

  return items;
}

// Generate Castle Chests
export function generateCastleChests() {
  const chests = [
    { id: 'chest_1', x: 250, y: 350, isOpened: false, item: GAME_ITEMS.xp_crystal_large },
    { id: 'chest_2', x: 500, y: 280, isOpened: false, item: GAME_ITEMS.heal_potion_100 },
    { id: 'chest_3', x: 800, y: 350, isOpened: false, item: GAME_ITEMS.pet_egg },
    { id: 'chest_4', x: 200, y: 700, isOpened: false, item: GAME_ITEMS.revive_super },
    { id: 'chest_5', x: 450, y: 650, isOpened: false, item: GAME_ITEMS.mystery_box },
    { id: 'chest_6', x: 750, y: 750, isOpened: false, item: GAME_ITEMS.shield },
    { id: 'chest_7', x: 300, y: 1100, isOpened: false, item: GAME_ITEMS.revive_infinite },
    { id: 'chest_8', x: 600, y: 1050, isOpened: false, item: GAME_ITEMS.xp_potion_random },
    { id: 'chest_9', x: 850, y: 1150, isOpened: false, item: GAME_ITEMS.heal_potion_50 },
    { id: 'chest_10', x: 550, y: 1400, isOpened: false, item: GAME_ITEMS.wind_gem },
  ];
  return chests;
}
