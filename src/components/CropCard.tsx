/**
 * Tarjeta individual de cultivo para la vista de listado.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. REGAR POR IMPULSO: Se debe mostrar visualmente si el suelo aún está húmedo para
 *    desincentivar pulsar "Regar" cuando la planta no lo necesita.
 * 2. BORRADO ACCIDENTAL: En pantallas táctiles de celulares, los botones pequeños
 *    de eliminar se tocan sin querer si no hay confirmación o separación adecuada.
 */

import React, { useState } from 'react';
import { 
  Droplet, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Check, 
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { Crop } from '../types/garden';
import { 
  formatSpanishDate, 
  formatSpanishDayMonth,
  getHarvestStatus, 
  getWateringStatus 
} from '../utils/dateUtils';

interface CropCardProps {
  crop: Crop;
  onWaterToday: (cropId: string) => void;
  onEdit: (crop: Crop) => void;
  onDelete: (cropId: string) => void;
}

export const CropCard: React.FC<CropCardProps> = ({
  crop,
  onWaterToday,
  onEdit,
  onDelete,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const wateringInfo = getWateringStatus(crop.lastWateredDate, crop.wateringIntervalDays);
  const harvestInfo = getHarvestStatus(crop.sowingDate, crop.daysToHarvest);

  // Mapeo legible de ubicaciones
  const locationLabels = {
    maceta: '🪴 Maceta',
    balcon: '🌿 Balcón',
    huerto: '🌱 Huerto en tierra',
    mesa_cultivo: '🪵 Mesa de cultivo',
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3.5 transition-all">
      {/* Encabezado del cultivo */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-stone-100 leading-tight">
              {crop.name}
            </h3>
            <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
              {locationLabels[crop.location] || crop.location}
            </span>
          </div>
          {crop.variety && (
            <p className="text-xs text-stone-400 mt-0.5">{crop.variety}</p>
          )}
        </div>

        {/* Acciones de edición / borrado */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(crop)}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Editar ${crop.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-8 h-8 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Eliminar ${crop.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmación defensiva de borrado para evitar toques accidentales en celular */}
      {showConfirmDelete && (
        <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs space-y-2">
          <p className="text-red-200">
            ¿Eliminar el registro de <strong>{crop.name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(crop.id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 1. Módulo de Riego Consciente */}
      <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        wateringInfo.needsWaterToday
          ? 'bg-amber-950/20 border-amber-800/40'
          : wateringInfo.urgency === 'watered_today'
          ? 'bg-emerald-950/20 border-emerald-800/40'
          : 'bg-stone-800/40 border-stone-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Droplet className={`w-4 h-4 ${
              wateringInfo.needsWaterToday ? 'text-amber-400' : 'text-sky-400'
            }`} />
            <span className={`text-xs font-semibold ${
              wateringInfo.needsWaterToday ? 'text-amber-300' : 'text-stone-200'
            }`}>
              {wateringInfo.statusBadgeText}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-tight">
            {wateringInfo.adviceMessage}
          </p>
          <p className="text-[10px] text-stone-500">
            Regar cada {crop.wateringIntervalDays} días · Último: {formatSpanishDayMonth(crop.lastWateredDate)}
          </p>
        </div>

        {/* Botón táctil para registrar el riego de hoy */}
        <button
          onClick={() => onWaterToday(crop.id)}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
            wateringInfo.needsWaterToday
              ? 'bg-sky-500 hover:bg-sky-400 text-stone-950 shadow-sm'
              : wateringInfo.urgency === 'watered_today'
              ? 'bg-stone-800 text-stone-400 cursor-default'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
          }`}
        >
          {wateringInfo.urgency === 'watered_today' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Regado hoy</span>
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4 text-sky-400" />
              <span>Marcar regado</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Módulo de Aviso de Cosecha */}
      <div className="p-3 bg-stone-800/30 border border-stone-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Cosecha estimada:</span>
          </div>
          <span className={`font-semibold ${
            harvestInfo.urgency === 'ready_today' || harvestInfo.urgency === 'overdue'
              ? 'text-emerald-400'
              : harvestInfo.urgency === 'ready_soon'
              ? 'text-amber-400'
              : 'text-stone-300'
          }`}>
            {harvestInfo.statusText}
          </span>
        </div>

        {/* Barra de progreso del ciclo biológico */}
        <div>
          <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                harvestInfo.progressPercent >= 100
                  ? 'bg-emerald-400'
                  : harvestInfo.progressPercent > 70
                  ? 'bg-amber-400'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${harvestInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
            <span>Siembra: {formatSpanishDayMonth(crop.sowingDate)}</span>
            <span className="tabular-nums font-mono">{harvestInfo.progressPercent}% del ciclo</span>
            <span>Día est.: {formatSpanishDayMonth(harvestInfo.harvestDateStr)}</span>
          </div>
        </div>
      </div>

      {/* Notas familiares si existen */}
      {crop.notes && (
        <p className="text-[11px] text-stone-400 italic bg-stone-800/20 px-2.5 py-1.5 rounded-lg border border-stone-800/50">
          "{crop.notes}"
        </p>
      )}
    </div>
  );
};
