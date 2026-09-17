import React, { useState } from 'react';
import { AICharacter, PlayerCharacter, UserAccount } from '../types';
import { Shield, Users, Search, ArrowUpDown, ArrowLeft, Bot, User, Sparkles, Filter } from 'lucide-react';
import { getCompanionsList } from '../utils/companionUtils';

interface AdminDashboardProps {
  player: PlayerCharacter | null;
  allAccounts: Record<string, UserAccount>;
  aiCharacters: AICharacter[];
  onClose: () => void;
}

interface TableRowData {
  id: string;
  name: string;
  type: 'PLAYER' | 'AI';
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  location: string;
  companionName?: string;
  inventoryCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  player,
  allAccounts,
  aiCharacters,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PLAYER' | 'AI'>('ALL');
  const [sortField, setSortField] = useState<'level' | 'xp' | 'name' | 'hp'>('level');
  const [sortAsc, setSortAsc] = useState(false);

  // Combine real registered players and AI characters
  const rows: TableRowData[] = [];

  // 1. Registered Players
  (Object.values(allAccounts) as UserAccount[]).forEach((acc) => {
    // if active player is current in-memory player, use real-time data
    const pData = (player && player.name === acc.name) ? player : acc.playerData;
    const petList = getCompanionsList(pData);
    const companionLabel = petList.length > 0
      ? petList.map((p) => `${p.icon} ${p.name}`).join(', ')
      : undefined;

    rows.push({
      id: pData.id,
      name: pData.name,
      type: 'PLAYER',
      level: pData.level,
      xp: pData.xp,
      hp: pData.hp,
      maxHp: pData.maxHp,
      location: pData.location === 'castle' ? '의문의 성' : pData.location === 'wind_island' ? '바람의 섬' : '신비한 잔디 필드',
      companionName: companionLabel,
      inventoryCount: pData.inventory.reduce((sum, s) => sum + s.quantity, 0),
    });
  });

  // 2. 30 AI Characters
  aiCharacters.forEach((ai) => {
    const petList = getCompanionsList(ai);
    const companionLabel = petList.length > 0
      ? petList.map((p) => `${p.icon} ${p.name}`).join(', ')
      : undefined;

    rows.push({
      id: ai.id,
      name: ai.name,
      type: 'AI',
      level: ai.level,
      xp: ai.xp,
      hp: ai.hp,
      maxHp: ai.maxHp,
      location: '신비한 잔디 필드',
      companionName: companionLabel,
      inventoryCount: ai.inventory.length,
    });
  });

  // Filter
  const filteredRows = rows.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Sort
  filteredRows.sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') {
      cmp = a.name.localeCompare(b.name);
    } else {
      cmp = a[sortField] - b[sortField];
    }
    return sortAsc ? cmp : -cmp;
  });

  const totalCount = rows.length;
  const playerCount = rows.filter(r => r.type === 'PLAYER').length;
  const aiCount = rows.filter(r => r.type === 'AI').length;

  const handleSort = (field: 'level' | 'xp' | 'name' | 'hp') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for numbers
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white overflow-hidden animate-fadeIn font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #9333ea 0%, transparent 50%), #0f172a',
      }}
    >
      {/* Top Navigation Bar */}
      <header className="backdrop-blur-2xl bg-slate-900/60 border-b border-white/15 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl backdrop-blur-md">
            <Shield className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/50">ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              관리자 전용 모니터링 시스템
            </h1>
            <p className="text-xs text-indigo-200/80 font-medium">
              모든 모험가(플레이어 및 30명 인공지능)의 실시간 상태 및 인벤토리 현황
            </p>
          </div>
        </div>

        <button
          id="close-admin-btn"
          onClick={onClose}
          className="px-4 py-2.5 bg-white text-slate-950 hover:bg-indigo-50 active:scale-95 text-xs sm:text-sm font-black rounded-2xl shadow-xl flex items-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>게임 화면으로 복귀</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-300 text-2xl shadow-md">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] text-white/60 font-bold uppercase tracking-wider">총 캐릭터 수 (인공지능 포함)</div>
              <div className="text-3xl font-black text-white tracking-tight">{totalCount}명</div>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-md">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-200/70 font-bold uppercase tracking-wider">등록된 실제 플레이어</div>
              <div className="text-3xl font-black text-emerald-300 tracking-tight">{playerCount}명</div>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] text-indigo-200/70 font-bold uppercase tracking-wider">필드 인공지능 (AI) 캐릭터</div>
              <div className="text-3xl font-black text-indigo-200 tracking-tight">{aiCount}명</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="캐릭터 이름 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:bg-white/10 backdrop-blur-sm"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              전체 ({rows.length})
            </button>
            <button
              onClick={() => setTypeFilter('PLAYER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                typeFilter === 'PLAYER'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-white/5 text-emerald-200 hover:bg-white/10 border border-white/10'
              }`}
            >
              플레이어 ({playerCount})
            </button>
            <button
              onClick={() => setTypeFilter('AI')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                typeFilter === 'AI'
                  ? 'bg-indigo-400 text-slate-950 shadow-md'
                  : 'bg-white/5 text-indigo-200 hover:bg-white/10 border border-white/10'
              }`}
            >
              인공지능 AI ({aiCount})
            </button>
          </div>
        </div>

        {/* Scrollable Table View (PDF Page 1 명시 요구사항) */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/70 text-white/60 uppercase tracking-[0.15em] sticky top-0 z-10 border-b border-white/10 text-[11px] backdrop-blur-md">
                <tr>
                  <th className="py-3.5 px-4 font-bold">#</th>
                  <th
                    className="py-3.5 px-4 font-bold cursor-pointer hover:text-white"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>플레이어 이름</span>
                      <ArrowUpDown className="w-3 h-3 text-white/40" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold">구분</th>
                  <th
                    className="py-3.5 px-4 font-bold cursor-pointer hover:text-white"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center gap-1">
                      <span>레벨</span>
                      <ArrowUpDown className="w-3 h-3 text-white/40" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold cursor-pointer hover:text-white"
                    onClick={() => handleSort('xp')}
                  >
                    <div className="flex items-center gap-1">
                      <span>경험치 (XP)</span>
                      <ArrowUpDown className="w-3 h-3 text-white/40" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 font-bold cursor-pointer hover:text-white"
                    onClick={() => handleSort('hp')}
                  >
                    <div className="flex items-center gap-1">
                      <span>체력 (HP)</span>
                      <ArrowUpDown className="w-3 h-3 text-white/40" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold">보조 캐릭터</th>
                  <th className="py-3.5 px-4 font-bold">위치</th>
                  <th className="py-3.5 px-4 font-bold">도구 개수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-medium">
                {filteredRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-white/40 text-xs font-mono">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-base">{row.type === 'PLAYER' ? '🧑' : '🤖'}</span>
                      <span>{row.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.type === 'PLAYER' ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          플레이어
                        </span>
                      ) : (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          인공지능 (AI)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                        Lv.{row.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white font-mono">
                      <span className="font-bold text-indigo-300">{row.xp.toLocaleString()}</span> XP
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${Math.min(100, Math.max(0, (row.hp / row.maxHp) * 100))}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/70 font-mono">{row.hp}/{row.maxHp}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      {row.companionName ? (
                        <span className="text-indigo-200 font-semibold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{row.companionName}</span>
                      ) : (
                        <span className="text-white/30 text-xs">없음</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-white/70">
                      {row.location}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-white/50">
                      {row.inventoryCount}개
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-white/40 text-xs">
                      검색 조건과 일치하는 캐릭터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
