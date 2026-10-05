/**
 * Barra superior de navegación para SIEMBRA.
 * Mantiene la regla visual limpia, optimizada para celular.
 */

import React from 'react';
import { Sprout, Plus, HardDrive } from 'lucide-react';

interface HeaderProps {
  cropCount: number;
  onOpenRegister: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cropCount, onOpenRegister, onOpenBackup }) => {
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

        {/* Acciones superiores: Respaldo / Datos y Nuevo cultivo */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenBackup}
            className="min-h-[44px] min-w-[44px] w-10 h-10 rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Copia de seguridad y datos"
            title="Copia de seguridad y datos"
          >
            <HardDrive className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRegister}
            className="min-h-[44px] px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform cursor-pointer"
            aria-label="Registrar nuevo cultivo"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
