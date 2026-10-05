/**
 * Tarjeta individual de cultivo para la vista de listado.
 * - Texto nunca menor a 16px.
 * - Alto contraste para exteriores.
 * - Botones secundarios para no competir con el botón principal de la pantalla.
 * - Táctil accesible con área mínima de 48px.
 */

import React, { useState } from 'react';
import { 
  Droplet, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Check, 
  MapPin
} from 'lucide-react';
import { Crop } from '../types/garden';
import { 
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

  const locationLabels = {
    maceta: '🪴 Maceta',
    balcon: '🌿 Balcón',
    huerto: '🌱 Huerto',
    mesa_cultivo: '🪵 Mesa',
  };

  return (
    <article className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-4 shadow-md space-y-3.5">
      {/* Encabezado del cultivo */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-white leading-tight">
              {crop.name}
            </h3>
            <span className="text-base text-stone-200 bg-stone-800 border border-stone-600 px-2.5 py-0.5 rounded-lg font-medium">
              {locationLabels[crop.location] || crop.location}
            </span>
          </div>
          {crop.variety && (
            <p className="text-base text-stone-300 mt-0.5 font-medium">{crop.variety}</p>
          )}
        </div>

        {/* Acciones secundarias: Editar / Borrar (hitbox >= 48px) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(crop)}
            className="min-h-[48px] min-w-[48px] rounded-xl text-stone-300 hover:text-white bg-stone-800 border border-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Editar ${crop.name}`}
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="min-h-[48px] min-w-[48px] rounded-xl text-stone-300 hover:text-red-400 bg-stone-800 border border-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Eliminar ${crop.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirmación de borrado */}
      {showConfirmDelete && (
        <div className="p-3.5 bg-red-950 border-2 border-red-500 rounded-xl space-y-2 text-white">
          <p className="font-bold text-base">
            ¿Eliminar <strong>{crop.name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(crop.id)}
              className="flex-1 min-h-[48px] px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-base rounded-xl cursor-pointer"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="flex-1 min-h-[48px] px-3 py-2 bg-stone-800 border border-stone-600 text-stone-200 font-bold text-base rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Módulo de Riego */}
      <div className={`p-3.5 rounded-xl border-2 flex flex-col gap-2.5 ${
        wateringInfo.needsWaterToday
          ? 'bg-amber-950/30 border-amber-500'
          : wateringInfo.urgency === 'watered_today'
          ? 'bg-emerald-950/30 border-emerald-600'
          : 'bg-stone-950/60 border-stone-700'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Droplet className={`w-5 h-5 ${
              wateringInfo.needsWaterToday ? 'text-amber-400' : 'text-sky-400'
            }`} />
            <strong className={`text-base ${
              wateringInfo.needsWaterToday ? 'text-amber-300 font-extrabold' : 'text-white'
            }`}>
              {wateringInfo.statusBadgeText}
            </strong>
          </div>
          <p className="text-base text-stone-200 leading-snug">
            {wateringInfo.adviceMessage}
          </p>
          <p className="text-base text-stone-300 font-medium">
            Regar cada {crop.wateringIntervalDays} días · Último: {formatSpanishDayMonth(crop.lastWateredDate)}
          </p>
        </div>

        {/* Botón secundario para marcar regado (área táctil >= 48px) */}
        <button
          onClick={() => onWaterToday(crop.id)}
          className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer border-2 ${
            wateringInfo.needsWaterToday
              ? 'bg-sky-950 border-sky-400 text-sky-200 hover:bg-sky-900'
              : wateringInfo.urgency === 'watered_today'
              ? 'bg-stone-800 border-stone-600 text-emerald-400 cursor-default'
              : 'bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700'
          }`}
        >
          {wateringInfo.urgency === 'watered_today' ? (
            <>
              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
              <span>Regado hoy</span>
            </>
          ) : (
            <>
              <Droplet className="w-5 h-5 text-sky-400" />
              <span>Marcar regado</span>
            </>
          )}
        </button>
      </div>

      {/* Módulo de Cosecha */}
      <div className="p-3.5 bg-stone-950/60 border-2 border-stone-700 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-base flex-wrap gap-1">
          <div className="flex items-center gap-1.5 text-stone-200 font-medium">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Cosecha:</span>
          </div>
          <strong className={`text-base ${
            harvestInfo.urgency === 'ready_today' || harvestInfo.urgency === 'overdue'
              ? 'text-emerald-400'
              : 'text-amber-300'
          }`}>
            {harvestInfo.statusText}
          </strong>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="h-3 w-full bg-stone-800 border border-stone-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                harvestInfo.progressPercent >= 100
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${harvestInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-base text-stone-300 font-medium mt-1">
            <span>Siembra: {formatSpanishDayMonth(crop.sowingDate)}</span>
            <span className="font-bold text-white">{harvestInfo.progressPercent}%</span>
            <span>Día: {formatSpanishDayMonth(harvestInfo.harvestDateStr)}</span>
          </div>
        </div>
      </div>

      {/* Notas familiares */}
      {crop.notes && (
        <p className="text-base text-stone-300 italic bg-stone-800/40 p-2.5 rounded-xl border border-stone-700">
          "{crop.notes}"
        </p>
      )}
    </article>
  );
};
