import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { loginExistingUser, registerNewUser, getStoredUsers } from '../utils/storage';
import { Sparkles, Shield, User, Key, ArrowRight, BookOpen, UserPlus, LogIn, History, Star, Backpack } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: (account: UserAccount) => void;
  onOpenAdmin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenAdmin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [characterName, setCharacterName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>([]);

  // Load saved accounts on device
  useEffect(() => {
    const usersObj = getStoredUsers();
    const list = Object.values(usersObj).sort((a, b) => {
      const timeA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const timeB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      return timeB - timeA;
    });
    setSavedAccounts(list);

    // If there are existing accounts and name is empty, default to the most recent one
    if (list.length > 0 && !characterName) {
      setCharacterName(list[0].name);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!characterName.trim()) {
      setErrorMessage('캐릭터 이름을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result =
        mode === 'login'
          ? loginExistingUser(characterName, password)
          : registerNewUser(characterName, password);

      setIsLoading(false);

      if (result.success && result.account) {
        soundManager.playLevelUp();
        onLoginSuccess(result.account);
      } else {
        soundManager.playDamage();
        setErrorMessage(result.message);
      }
    }, 200);
  };

  const handleSelectSavedAccount = (acc: UserAccount) => {
    setMode('login');
    setCharacterName(acc.name);
    setPassword('');
    setErrorMessage('');
    setInfoMessage(`[${acc.name}] 캐릭터가 선택되었습니다. 비밀번호를 입력해주세요.`);
  };

  const handleQuickGuest = () => {
    setMode('register');
    const guestNum = Math.floor(Math.random() * 900) + 100;
    setCharacterName(`용사_${guestNum}`);
    setPassword('1234');
    setErrorMessage('');
    setInfoMessage('신규 캐릭터 이름과 비밀번호(1234)가 자동 생성되었습니다.');
  };

  return (
    <div
      className="min-h-screen w-full text-white font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto select-none py-10"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #9333ea 0%, transparent 50%), #0f172a',
      }}
    >
      {/* Ambient glass light pulses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-purple-500/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute top-1/2 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Frosted Glass Card Container */}
      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative z-10 my-auto">
        {/* Game Title Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white shadow-xl backdrop-blur-lg mb-3 transform hover:scale-105 transition-transform">
            <Sparkles className="w-7 h-7 text-indigo-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <span className="px-3 py-0.5 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-200 mb-2 inline-block">
            2D RPG ADVENTURE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            신비한 세계의 모험
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1 font-medium">
            30명의 인공지능 모험가와 함께하는 탐험 및 아이템 교환 RPG
          </p>
        </div>

        {/* Tab Switcher: Login (Continue) vs Register (New Character) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/30 border border-white/10 rounded-2xl mb-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>기존 캐릭터 이어하기</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>새 캐릭터 생성</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 mb-4 text-xs text-indigo-100/90 leading-relaxed flex items-start gap-2.5 backdrop-blur-md">
          <BookOpen className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
          <div className="text-[11px]">
            {mode === 'login' ? (
              <>
                <strong className="text-white font-bold">캐릭터 이어하기:</strong> 이전에 생성한 캐릭터 이름과 비밀번호를 입력하면 기존의 레벨, 경험치(XP), 아이템 정보가 그대로 유지되어 모험을 계속합니다.
              </>
            ) : (
              <>
                <strong className="text-white font-bold">새로운 캐릭터 생성:</strong> 새 캐릭터 이름과 비밀번호를 등록하면 기본 장비와 함께 레벨 1부터 모험을 시작합니다.
              </>
            )}
          </div>
        </div>

        {/* Error / Info alerts */}
        {errorMessage && (
          <div className="bg-rose-500/25 border border-rose-400/50 text-rose-100 text-xs sm:text-sm rounded-xl p-3.5 mb-4 flex items-center gap-2.5 backdrop-blur-md animate-shake">
            <span className="text-rose-300 font-bold text-base flex-shrink-0">⚠️</span>
            <span className="font-semibold leading-snug">{errorMessage}</span>
          </div>
        )}
        {infoMessage && (
          <div className="bg-indigo-500/25 border border-indigo-400/40 text-indigo-100 text-xs rounded-xl p-3 mb-4 backdrop-blur-md flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-[0.15em]">
              {mode === 'login' ? '캐릭터 이름' : '새 캐릭터 이름'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="character-name-input"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="예: 모험가루나, 빛의기사"
                maxLength={16}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/30 backdrop-blur-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1 uppercase tracking-[0.15em]">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="character-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                maxLength={24}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/30 backdrop-blur-sm transition-all"
              />
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-2.5">
            <button
              type="submit"
              id="start-game-btn"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white text-slate-950 font-black text-sm sm:text-base rounded-2xl hover:bg-indigo-50 active:scale-[0.98] shadow-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>모험 세계로 입장 중...</span>
              ) : mode === 'login' ? (
                <>
                  <span>모험 이어서 하기 (로그인)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </>
              ) : (
                <>
                  <span>새 캐릭터로 모험 시작</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </>
              )}
            </button>

            {mode === 'register' && (
              <button
                type="button"
                id="quick-guest-btn"
                onClick={handleQuickGuest}
                className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-indigo-200 text-xs font-medium rounded-xl border border-white/10 backdrop-blur-md transition-colors"
              >
                🎲 자동 캐릭터 이름 & 비밀번호 채우기
              </button>
            )}
          </div>
        </form>

        {/* Saved Characters on This Device (Quick Selector) */}
        {savedAccounts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-white/70 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-300" />
                이 기기에 저장된 캐릭터 ({savedAccounts.length}명)
              </span>
              <span className="text-[10px] text-white/40">클릭하여 선택</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
              {savedAccounts.map((acc) => {
                const isSelected = characterName.trim().toLowerCase() === acc.name.toLowerCase();
                const p = acc.playerData;
                const petCount = p.companions?.length || (p.companion ? 1 : 0);
                const itemCount = p.inventory.reduce((sum, slot) => sum + slot.quantity, 0);

                return (
                  <button
                    key={acc.name}
                    type="button"
                    onClick={() => handleSelectSavedAccount(acc)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-400/60 shadow-md ring-1 ring-indigo-400/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: p.avatarColor || '#3b82f6' }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white truncate">{p.name}</span>
                          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-1.5 py-0.2 rounded border border-indigo-400/30 flex-shrink-0">
                            Lv.{p.level}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/50 truncate flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-300" />
                            {p.xp.toLocaleString()} XP
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Backpack className="w-2.5 h-2.5 text-indigo-300" />
                            {itemCount}개
                          </span>
                          {petCount > 0 && <span>🐾 펫 {petCount}마리</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-indigo-300 font-semibold flex-shrink-0 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                      선택
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer & Admin link */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-1.5 text-white/70 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-indigo-300" />
            30명의 AI 플레이어 활동 중
          </span>
          <button
            type="button"
            id="open-admin-from-login"
            onClick={onOpenAdmin}
            className="text-indigo-300 hover:text-white font-semibold underline underline-offset-2 transition-colors cursor-pointer text-[11px]"
          >
            관리자 대시보드 보기
          </button>
        </div>
      </div>
    </div>
  );
};


