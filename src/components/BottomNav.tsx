/**
 * Navegación inferior fija optimizada para celulares desde 320px de ancho.
 * - Texto de 16px visible y legible al sol.
 * - Hitbox táctil superior a 48px.
 * - Soporte para scroll horizontal suave en pantallas muy estrechas (320px).
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
      aria-label="Menú principal de la aplicación"
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t-2 border-stone-700 shadow-2xl safe-bottom"
    >
      <div className="w-full max-w-md mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1">
        {/* Pestaña 1: Cultivos / Plantas */}
        <button
          onClick={() => onTabChange('cultivos')}
          className={`flex-1 min-w-[75px] min-h-[52px] flex flex-col items-center justify-center px-1 transition-colors cursor-pointer ${
            currentTab === 'cultivos'
              ? 'text-emerald-400 font-bold bg-stone-800/80 rounded-xl'
              : 'text-stone-300 hover:text-white font-medium'
          }`}
          aria-current={currentTab === 'cultivos' ? 'page' : undefined}
        >
          <Sprout className={`w-6 h-6 ${currentTab === 'cultivos' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-base tracking-tight leading-tight mt-0.5">Plantas</span>
        </button>

        {/* Pestaña 2: Riego */}
        <button
          onClick={() => onTabChange('riego')}
          className={`flex-1 min-w-[75px] min-h-[52px] flex flex-col items-center justify-center px-1 transition-colors cursor-pointer relative ${
            currentTab === 'riego'
              ? 'text-sky-400 font-bold bg-stone-800/80 rounded-xl'
              : 'text-stone-300 hover:text-white font-medium'
          }`}
          aria-current={currentTab === 'riego' ? 'page' : undefined}
        >
          <div className="relative">
            <Droplets className={`w-6 h-6 ${currentTab === 'riego' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {needsWaterCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-amber-400 text-stone-950 text-base font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-stone-900">
                {needsWaterCount}
              </span>
            )}
          </div>
          <span className="text-base tracking-tight leading-tight mt-0.5">Riego</span>
        </button>

        {/* Pestaña 3: Cosecha */}
        <button
          onClick={() => onTabChange('cosecha')}
          className={`flex-1 min-w-[75px] min-h-[52px] flex flex-col items-center justify-center px-1 transition-colors cursor-pointer relative ${
            currentTab === 'cosecha'
              ? 'text-amber-300 font-bold bg-stone-800/80 rounded-xl'
              : 'text-stone-300 hover:text-white font-medium'
          }`}
          aria-current={currentTab === 'cosecha' ? 'page' : undefined}
        >
          <div className="relative">
            <Sparkles className={`w-6 h-6 ${currentTab === 'cosecha' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {readyHarvestCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-emerald-400 text-stone-950 text-base font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-stone-900">
                {readyHarvestCount}
              </span>
            )}
          </div>
          <span className="text-base tracking-tight leading-tight mt-0.5">Cosecha</span>
        </button>

        {/* Pestaña 4: Datos / Estadísticas */}
        <button
          onClick={() => onTabChange('estadisticas')}
          className={`flex-1 min-w-[75px] min-h-[52px] flex flex-col items-center justify-center px-1 transition-colors cursor-pointer ${
            currentTab === 'estadisticas'
              ? 'text-violet-300 font-bold bg-stone-800/80 rounded-xl'
              : 'text-stone-300 hover:text-white font-medium'
          }`}
          aria-current={currentTab === 'estadisticas' ? 'page' : undefined}
        >
          <BarChart3 className={`w-6 h-6 ${currentTab === 'estadisticas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-base tracking-tight leading-tight mt-0.5">Datos</span>
        </button>
      </div>
    </nav>
  );
};
