export type GameLocation = 'field' | 'castle' | 'wind_island';

export type ItemType = 
  | 'xp_potion_30'       // +30 XP 즉시
  | 'xp_potion_random'   // +1~50 XP 즉시
  | 'xp_crystal_large'   // +200 XP 즉시
  | 'heal_potion_50'     // +50 체력 회복
  | 'heal_potion_100'    // +100 체력 회복
  | 'shield'             // 방패 / 방어막
  | 'pet_egg'            // 보조캐릭터 알 (부화)
  | 'revive_normal'      // 일반 부활장치
  | 'revive_infinite'    // 무한 부활장치 (체력 10 회복)
  | 'revive_super'       // 슈퍼 부활장치 (체력 100% 회복)
  | 'trap_small'         // 함정: 체력 -5
  | 'trap_medium'        // 함정: -5~-40 체력 즉시
  | 'trap_large'         // 위험: 체력 -50 즉시
  | 'mystery_box'        // 미지의 상자
  | 'wind_gem';          // 바람의 보석

export interface GameItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'potion' | 'xp' | 'revive' | 'pet' | 'shield' | 'trap' | 'special';
  hpChange?: number;
  xpChange?: number;
  isHarmful?: boolean;
}

export interface InventorySlot {
  item: GameItem;
  quantity: number;
}

export interface CompanionPet {
  id: string;
  name: string;
  species: string;
  level: number;
  description: string;
  color: string;
  icon: string;
  bonusType: 'speed' | 'heal' | 'xp' | 'shield';
  bonusValue: number;
}

export interface CharacterBase {
  id: string;
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving?: boolean;
  avatarColor: string;
  companion?: CompanionPet;
  companions?: CompanionPet[];
}

export interface PlayerCharacter extends CharacterBase {
  inventory: InventorySlot[];
  equippedShield?: boolean;
  hasInfiniteRevive?: boolean;
  location: GameLocation;
}

export interface AICharacter extends CharacterBase {
  inventory: GameItem[];
  dialogue: string;
  personality: string;
  targetX: number;
  targetY: number;
  speed: number;
}

export interface FieldItemInstance {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  item: GameItem;
  respawnTime?: number;
}

export interface CastleChest {
  id: string;
  x: number;
  y: number;
  isOpened: boolean;
  item: GameItem;
}

export interface UserAccount {
  name: string;
  passwordHash: string;
  playerData: PlayerCharacter;
  lastLogin: string;
}
