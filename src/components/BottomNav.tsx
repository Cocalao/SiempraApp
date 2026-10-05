/**
 * Navegación inferior fija optimizada para el pulgar en celulares.
 * Respeta el límite del 15% de altura y objetivos táctiles >= 44px.
 */

import React from 'react';
import { Sprout, Droplets, Sparkles, BarChart3 } from 'lucide-react';
import { TabType } from '../types/garden';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  needsWaterCount: number;
  readyHarvestCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  needsWaterCount,
  readyHarvestCount,
}) => {
  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 safe-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {/* Pestaña 1: Cultivos */}
        <button
          onClick={() => onTabChange('cultivos')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'cultivos'
              ? 'text-emerald-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sprout className={`w-5 h-5 ${currentTab === 'cultivos' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Cultivos</span>
        </button>

        {/* Pestaña 2: Riego Consciente */}
        <button
          onClick={() => onTabChange('riego')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'riego'
              ? 'text-sky-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Droplets className={`w-5 h-5 ${currentTab === 'riego' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {needsWaterCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-stone-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {needsWaterCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Riego</span>
        </button>

        {/* Pestaña 3: Cosecha Estimada */}
        <button
          onClick={() => onTabChange('cosecha')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'cosecha'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${currentTab === 'cosecha' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {readyHarvestCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-stone-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {readyHarvestCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Cosecha</span>
        </button>

        {/* Pestaña 4: Estadísticas */}
        <button
          onClick={() => onTabChange('estadisticas')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'estadisticas'
              ? 'text-violet-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${currentTab === 'estadisticas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Estadísticas</span>
        </button>
      </div>
    </nav>
  );
};
