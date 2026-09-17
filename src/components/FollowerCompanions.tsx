import React from 'react';
import { CharacterBase, CompanionPet } from '../types';
import { getCompanionsList, getCompanionOffset } from '../utils/companionUtils';

interface FollowerCompanionsProps {
  character?: CharacterBase | null;
  companions?: CompanionPet[];
  size?: 'sm' | 'md' | 'lg';
}

export const FollowerCompanions: React.FC<FollowerCompanionsProps> = ({
  character,
  companions: explicitCompanions,
  size = 'md',
}) => {
  const companions = explicitCompanions || getCompanionsList(character);

  if (!companions || companions.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <>
      {companions.map((pet, idx) => {
        const offset = getCompanionOffset(idx, companions.length);
        const duration = 1.1 + (idx % 3) * 0.25;

        return (
          <div
            key={pet.id || `pet_${idx}`}
            className="absolute flex items-center justify-center select-none group pointer-events-auto cursor-help"
            style={{
              left: `${offset.x}px`,
              top: `${offset.y}px`,
              zIndex: 15,
            }}
          >
            {/* Companion Animated Icon */}
            <div
              className={`${sizeClasses} filter drop-shadow-md animate-bounce transform transition-transform hover:scale-125`}
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `${offset.delay}s`,
              }}
            >
              {pet.icon}
            </div>

            {/* Mini Name Badge on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 backdrop-blur-xl bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap shadow-xl pointer-events-none z-50">
              {pet.name} (Lv.{pet.level})
            </div>
          </div>
        );
      })}
    </>
  );
};
