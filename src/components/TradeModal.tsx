import React, { useState } from 'react';
import { AICharacter, PlayerCharacter, GameItem } from '../types';
import { X, ArrowLeftRight, Check, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface TradeModalProps {
  ai: AICharacter;
  player: PlayerCharacter;
  onClose: () => void;
  onExecuteTrade: (playerItemId: string, aiItemId: string) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  ai,
  player,
  onClose,
  onExecuteTrade,
}) => {
  const [selectedPlayerItem, setSelectedPlayerItem] = useState<GameItem | null>(null);
  const [selectedAiItem, setSelectedAiItem] = useState<GameItem | null>(null);
  const [isAiAccepted, setIsAiAccepted] = useState(false);
  const [isPlayerAccepted, setIsPlayerAccepted] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Auto AI willingness logic based on personality & trade fair value
  const handleSelectAiItem = (item: GameItem) => {
    setSelectedAiItem(item);
    // Reset confirmation
    setIsPlayerAccepted(false);
    setIsAiAccepted(false);
  };

  const handleSelectPlayerItem = (item: GameItem) => {
    setSelectedPlayerItem(item);
    setIsPlayerAccepted(false);
    setIsAiAccepted(false);
  };

  const handlePlayerAccept = () => {
    if (!selectedPlayerItem || !selectedAiItem) return;
    setIsPlayerAccepted(true);
    // AI simulates evaluation
    setTimeout(() => {
      setIsAiAccepted(true);
    }, 400);
  };

  const handleConfirmFinalTrade = () => {
    if (!selectedPlayerItem || !selectedAiItem) return;
    setIsTrading(true);

    setTimeout(() => {
      soundManager.playTradeSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      onExecuteTrade(selectedPlayerItem.id, selectedAiItem.id);
      setTradeSuccess(true);
      setIsTrading(false);

      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl backdrop-blur-2xl bg-slate-900/80 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            교환 완료 시 양쪽 모두 +1000 XP 획득!
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>아이템 교환소</span>
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 font-medium">
            {ai.name} (AI) 님과 교환할 아이템을 1개씩 선택하고 교환을 확정하세요.
          </p>
        </div>

        {/* Trade Panels: Left (Player Offer) vs Right (AI Offer) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 1. Player Offer Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🧑</span> 나의 교환 도구 ({player.name})
                </span>
                {isPlayerAccepted && (
                  <span className="text-[11px] bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 확정 완료
                  </span>
                )}
              </div>

              {/* Selected Player Item Box */}
              <div className="min-h-[90px] bg-white/5 border border-white/15 rounded-xl p-3 flex items-center gap-3 mb-3 backdrop-blur-sm">
                {selectedPlayerItem ? (
                  <>
                    <div className="text-3xl p-2 bg-white/10 border border-white/15 rounded-xl flex-shrink-0">
                      {selectedPlayerItem.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{selectedPlayerItem.name}</div>
                      <div className="text-xs text-white/50 line-clamp-2 mt-0.5">{selectedPlayerItem.description}</div>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-white/40 py-3">
                    아래 인벤토리에서 건넬 도구를 선택하세요
                  </div>
                )}
              </div>

              {/* Player Inventory Selector */}
              <div className="text-[11px] font-bold text-white/60 mb-1.5 uppercase tracking-wider">나의 가방 속 도구:</div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {player.inventory.filter(slot => slot.quantity > 0).map((slot) => {
                  const isSelected = selectedPlayerItem?.id === slot.item.id;
                  return (
                    <button
                      key={slot.item.id}
                      onClick={() => handleSelectPlayerItem(slot.item)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      <span className="text-xl">{slot.item.icon}</span>
                      <span className="text-[10px] font-bold line-clamp-1 mt-1">{slot.item.name}</span>
                      <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-700' : 'text-indigo-300'}`}>x{slot.quantity}</span>
                    </button>
                  );
                })}
                {player.inventory.filter(slot => slot.quantity > 0).length === 0 && (
                  <div className="col-span-3 text-center py-4 text-xs text-white/40">
                    교환할 수 있는 도구가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. AI Offer Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🤖</span> 상대방 교환 도구 ({ai.name})
                </span>
                {isAiAccepted && (
                  <span className="text-[11px] bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 수락 완료
                  </span>
                )}
              </div>

              {/* Selected AI Item Box */}
              <div className="min-h-[90px] bg-white/5 border border-white/15 rounded-xl p-3 flex items-center gap-3 mb-3 backdrop-blur-sm">
                {selectedAiItem ? (
                  <>
                    <div className="text-3xl p-2 bg-white/10 border border-white/15 rounded-xl flex-shrink-0">
                      {selectedAiItem.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{selectedAiItem.name}</div>
                      <div className="text-xs text-white/50 line-clamp-2 mt-0.5">{selectedAiItem.description}</div>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-white/40 py-3">
                    아래에서 받고 싶은 상대의 도구를 선택하세요
                  </div>
                )}
              </div>

              {/* AI Inventory Selector */}
              <div className="text-[11px] font-bold text-white/60 mb-1.5 uppercase tracking-wider">{ai.name}님의 소지품:</div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {ai.inventory.map((item, idx) => {
                  const isSelected = selectedAiItem?.id === item.id;
                  return (
                    <button
                      key={`${item.id}_${idx}`}
                      onClick={() => handleSelectAiItem(item)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] font-bold line-clamp-1 mt-1">{item.name}</span>
                      <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-700' : 'text-indigo-300'}`}>{item.category}</span>
                    </button>
                  );
                })}
                {ai.inventory.length === 0 && (
                  <div className="col-span-3 text-center py-4 text-xs text-white/40">
                    상대방의 도구가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {tradeSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-bold rounded-2xl p-4 mb-4 text-center backdrop-blur-md animate-bounce">
            🎉 교환이 성공적으로 완료되었습니다! 1000 XP를 획득했습니다!
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isPlayerAccepted ? (
            <button
              id="accept-trade-btn"
              disabled={!selectedPlayerItem || !selectedAiItem}
              onClick={handlePlayerAccept}
              className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer ${
                selectedPlayerItem && selectedAiItem
                  ? 'bg-white text-slate-950 hover:bg-indigo-50 shadow-xl active:scale-98'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Check className="w-5 h-5 text-indigo-600" />
              <span>교환 제안 확정하기</span>
            </button>
          ) : (
            <button
              id="confirm-execute-trade-btn"
              disabled={!isAiAccepted || isTrading || tradeSuccess}
              onClick={handleConfirmFinalTrade}
              className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer ${
                isAiAccepted && !tradeSuccess
                  ? 'bg-white text-slate-950 hover:bg-indigo-50 shadow-xl active:scale-98'
                  : 'bg-white/10 text-white/60 border border-white/15 cursor-wait'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              <span>
                {tradeSuccess
                  ? '교환 완료!'
                  : isTrading
                  ? '교환 진행 중...'
                  : isAiAccepted
                  ? '두 플레이어 모두 동의 완료! [교환 실행하기]'
                  : `${ai.name} 님이 수락을 검토 중입니다...`}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-2xl border border-white/15 backdrop-blur-md transition-colors cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
