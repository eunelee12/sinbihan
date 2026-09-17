import { UserAccount, PlayerCharacter } from '../types';
import { GAME_ITEMS, getMaxHpForLevel } from '../data/gameConstants';

const USERS_STORAGE_KEY = 'mystic_adventure_users_v1';
const CURRENT_USER_KEY = 'mystic_adventure_current_user_v1';

export function getStoredUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredUsers(users: Record<string, UserAccount>) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function findExistingUser(name: string): { key: string; account: UserAccount } | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const users = getStoredUsers();

  // 1. Direct exact key match
  if (users[trimmed]) {
    return { key: trimmed, account: users[trimmed] };
  }

  // 2. Case-insensitive / whitespace-insensitive match
  const lowerTrimmed = trimmed.toLowerCase();
  for (const key of Object.keys(users)) {
    if (key.trim().toLowerCase() === lowerTrimmed) {
      return { key, account: users[key] };
    }
  }

  return null;
}

export function createNewPlayerData(name: string): PlayerCharacter {
  const initialMaxHp = getMaxHpForLevel(1);
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    level: 1,
    xp: 0,
    hp: initialMaxHp,
    maxHp: initialMaxHp,
    x: 1150,
    y: 1100,
    direction: 'down',
    avatarColor: '#3b82f6',
    location: 'field',
    inventory: [
      { item: GAME_ITEMS.heal_potion_50, quantity: 3 },
      { item: GAME_ITEMS.xp_potion_30, quantity: 3 },
      { item: GAME_ITEMS.pet_egg, quantity: 2 },
      { item: GAME_ITEMS.shield, quantity: 1 },
      { item: GAME_ITEMS.revive_normal, quantity: 1 },
    ],
  };
}

export function loginExistingUser(name: string, password: string): { success: boolean; message: string; account?: UserAccount } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, message: '캐릭터 이름을 입력해주세요.' };
  }
  if (!password || password.trim().length === 0) {
    return { success: false, message: '비밀번호를 입력해주세요.' };
  }

  const found = findExistingUser(trimmedName);
  if (!found) {
    return {
      success: false,
      message: `[${trimmedName}] 캐릭터를 찾을 수 없습니다. 캐릭터 이름을 확인하시거나 '새 캐릭터 생성'을 이용해주세요.`,
    };
  }

  const { key, account } = found;
  if (account.passwordHash !== password) {
    return {
      success: false,
      message: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.',
    };
  }

  // Update last login
  const users = getStoredUsers();
  account.lastLogin = new Date().toISOString();
  users[key] = account;
  saveStoredUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, account.name);

  return {
    success: true,
    message: `환영합니다, ${account.name}님! (Lv.${account.playerData.level}, ${account.playerData.xp.toLocaleString()} XP) 모험을 이어서 시작합니다.`,
    account,
  };
}

export function registerNewUser(name: string, password: string): { success: boolean; message: string; account?: UserAccount } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, message: '캐릭터 이름을 입력해주세요.' };
  }
  if (trimmedName.length < 2) {
    return { success: false, message: '캐릭터 이름은 최소 2글자 이상이어야 합니다.' };
  }
  if (!password || password.trim().length === 0) {
    return { success: false, message: '비밀번호를 입력해주세요.' };
  }
  if (password.length < 2) {
    return { success: false, message: '비밀번호는 최소 2글자 이상이어야 합니다.' };
  }

  const found = findExistingUser(trimmedName);
  if (found) {
    return {
      success: false,
      message: `이미 존재하는 캐릭터 이름입니다. '로그인' 탭에서 기존 비밀번호로 접속하거나 다른 이름을 입력해주세요.`,
    };
  }

  const newPlayerData = createNewPlayerData(trimmedName);
  const newAccount: UserAccount = {
    name: trimmedName,
    passwordHash: password,
    playerData: newPlayerData,
    lastLogin: new Date().toISOString(),
  };

  const users = getStoredUsers();
  users[trimmedName] = newAccount;
  saveStoredUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, trimmedName);

  return {
    success: true,
    message: `새로운 모험가 [${trimmedName}] 님이 생성되었습니다! 모험을 시작합니다.`,
    account: newAccount,
  };
}

export function authenticateUser(name: string, password: string): { success: boolean; message: string; account?: UserAccount; isNew?: boolean } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, message: '캐릭터 이름을 입력해주세요.' };
  }
  if (!password || password.trim().length === 0) {
    return { success: false, message: '비밀번호를 입력해주세요.' };
  }

  const found = findExistingUser(trimmedName);
  if (found) {
    const loginRes = loginExistingUser(trimmedName, password);
    return { ...loginRes, isNew: false };
  } else {
    const regRes = registerNewUser(trimmedName, password);
    return { ...regRes, isNew: true };
  }
}

export function saveCurrentPlayer(account: UserAccount) {
  if (!account || !account.name) return;
  const users = getStoredUsers();
  // If user was registered with slightly different casing, retain correct key
  const found = findExistingUser(account.name);
  const targetKey = found ? found.key : account.name;
  users[targetKey] = account;
  saveStoredUsers(users);
}

export function getLastLoggedInUser(): UserAccount | null {
  try {
    const currentName = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentName) return null;
    const found = findExistingUser(currentName);
    return found ? found.account : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

