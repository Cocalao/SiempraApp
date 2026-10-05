/**
 * Barra superior de navegación para SIEMBRA.
 * - Texto nunca menor a 16px.
 * - Alto contraste para exteriores y luz solar directa.
 * - Botones secundarios con área táctil mínima de 48px.
 * - Adaptada desde 320px de ancho.
 */

import React from 'react';
import { Sprout, HardDrive, Plus } from 'lucide-react';

interface HeaderProps {
  cropCount: number;
  onOpenRegister: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cropCount, onOpenRegister, onOpenBackup }) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-700 px-3 py-2.5 shadow-md">
      <div className="w-full max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Marca y conteo (texto >= 16px) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight leading-none text-emerald-400 truncate">
              SIEMBRA
            </h1>
            <p className="text-base text-stone-300 mt-0.5 truncate font-medium">
              {cropCount === 0 ? 'Sin plantas' : `${cropCount} ${cropCount === 1 ? 'planta' : 'plantas'}`}
            </p>
          </div>
        </div>

        {/* Botones secundarios de cabecera (hitbox >= 48px) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenBackup}
            className="min-h-[48px] min-w-[48px] px-2.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 border border-stone-600 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Copia de seguridad y datos"
            title="Copia de seguridad y datos"
          >
            <HardDrive className="w-5 h-5 text-stone-200" />
          </button>

          <button
            onClick={onOpenRegister}
            className="min-h-[48px] px-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-emerald-400 font-bold text-base border border-emerald-600/70 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Registrar nueva planta"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Nueva</span>
          </button>
        </div>
      </div>
    </header>
  );
};
