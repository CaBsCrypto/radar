import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';

interface ChileSilhouetteBadgeProps {
  className?: string;
  onClick?: () => void;
  variant?: 'compact' | 'card' | 'hero';
}

export const ChileSilhouetteBadge: React.FC<ChileSilhouetteBadgeProps> = ({
  className = '',
  onClick,
  variant = 'compact'
}) => {
  if (variant === 'hero') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-500/30 shadow-xl shadow-blue-500/5 ${onClick ? 'cursor-pointer hover:border-blue-400 transition-all' : ''} ${className}`}
      >
        {/* The Chile Silhouette Mini Icon */}
        <div className="w-10 sm:w-12 h-20 sm:h-24 flex-shrink-0 flex items-center justify-center p-1 bg-slate-950/80 rounded-xl border border-blue-500/20">
          <svg viewBox="0 0 100 320" className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(96,165,250,0.5)]">
            <path
              d="M 45,5 C 50,7 56,12 55,20 C 53,26 50,32 51,40 C 52,48 56,60 55,75 C 54,90 51,105 50,120 C 49,135 48,150 46,165 C 44,180 43,195 42,210 C 41,225 39,240 40,255 C 41,270 48,285 58,295 C 65,300 58,308 48,305 C 40,300 36,285 34,270 C 32,255 30,240 32,225 C 33,210 35,195 36,180 C 37,165 39,150 40,135 C 41,120 40,105 38,90 C 37,75 36,60 38,45 C 40,30 42,15 45,5 Z"
              fill="#60a5fa"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
            {/* Santiago Pin */}
            <circle cx="48" cy="140" r="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
            {/* Puerto Montt Pin */}
            <circle cx="40" cy="225" r="2.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Ecosistema País • Chile
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white font-['Outfit'] mt-0.5">
            4.300 km de Potencial en Inteligencia Artificial
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Desde la energía solar del Desierto de Atacama hasta los vientos australes de Magallanes: una geografía única para cómputo verde, minería 4.0 y hubs de investigación global.
          </p>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-xs text-slate-300 shadow-md ${onClick ? 'cursor-pointer hover:border-blue-400 hover:text-white transition-all' : ''} ${className}`}
    >
      <div className="w-4 h-7 flex-shrink-0">
        <svg viewBox="0 0 40 120" className="w-full h-full">
          <path
            d="M 18,2 C 22,5 24,10 23,16 C 21,22 19,30 20,40 C 21,55 19,70 17,85 C 16,95 18,105 24,112 C 20,116 14,112 12,102 C 11,88 12,74 14,60 C 15,46 14,32 14,20 C 15,10 16,4 18,2 Z"
            fill="#60a5fa"
          />
          <circle cx="19" cy="52" r="2" fill="#ffffff" />
        </svg>
      </div>
      <span className="font-semibold text-white">Chile</span>
      <span className="text-[10px] text-blue-400 font-medium">16 Regiones</span>
    </div>
  );
};
