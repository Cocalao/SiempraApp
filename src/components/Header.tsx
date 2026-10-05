/**
 * Barra superior de navegación para SIEMBRA.
 * Mantiene la regla visual limpia, optimizada para celular.
 */

import React from 'react';
import { Sprout, Plus } from 'lucide-react';

interface HeaderProps {
  cropCount: number;
  onOpenRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cropCount, onOpenRegister }) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 px-4 py-3 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-emerald-400">
              SIEMBRA
            </h1>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Huerto consciente · {cropCount} {cropCount === 1 ? 'cultivo' : 'cultivos'}
            </p>
          </div>
        </div>

        {/* Botón táctil para agregar cultivo (hitbox mínima de 44px) */}
        <button
          onClick={onOpenRegister}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform cursor-pointer"
          aria-label="Registrar nuevo cultivo"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo</span>
        </button>
      </div>
    </header>
  );
};
