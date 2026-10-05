/**
 * Componente de Aviso del Día Estimado de Cosecha.
 * - Texto nunca menor a 16px.
 * - Alto contraste para exteriores.
 * - Estado vacío con frase que invita a la acción.
 * - Compatible con pantallas desde 320px.
 */

import React from 'react';
import { Sparkles, Calendar, Clock, Plus } from 'lucide-react';
import { Crop } from '../types/garden';
import { 
  getHarvestStatus, 
  formatSpanishDate, 
  formatSpanishDayMonth 
} from '../utils/dateUtils';

interface HarvestAvisosProps {
  crops: Crop[];
  onOpenRegister: () => void;
}

export const HarvestAvisos: React.FC<HarvestAvisosProps> = ({ crops, onOpenRegister }) => {
  const cropsWithHarvest = crops.map(crop => ({
    crop,
    harvest: getHarvestStatus(crop.sowingDate, crop.daysToHarvest),
  }));

  const sortedCrops = [...cropsWithHarvest].sort((a, b) => {
    if (a.harvest.daysRemaining <= 0 && b.harvest.daysRemaining <= 0) {
      return a.harvest.daysRemaining - b.harvest.daysRemaining;
    }
    if (a.harvest.daysRemaining <= 0) return -1;
    if (b.harvest.daysRemaining <= 0) return 1;
    return a.harvest.daysRemaining - b.harvest.daysRemaining;
  });

  const readyToHarvest = cropsWithHarvest.filter(
    item => item.harvest.urgency === 'ready_today' || item.harvest.urgency === 'overdue'
  );

  const readySoon = cropsWithHarvest.filter(
    item => item.harvest.urgency === 'ready_soon'
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Alerta de cosechas listas */}
      {readyToHarvest.length > 0 ? (
        <div className="bg-amber-950/60 border-2 border-amber-400 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-lg">
            <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
            <span>¡Momento de Cosecha Familiar!</span>
          </div>
          <p className="text-base text-stone-100 font-medium leading-relaxed">
            Tienes <strong>{readyToHarvest.length} {readyToHarvest.length === 1 ? 'planta lista' : 'plantas listas'}</strong> para recolectar hoy.
            Cosechar en su punto óptimo evita que se amarguen las hojas.
          </p>
        </div>
      ) : readySoon.length > 0 ? (
        <div className="bg-emerald-950/40 border-2 border-emerald-600 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-lg">
            <Clock className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Próximas Cosechas en Camino</span>
          </div>
          <p className="text-base text-stone-200 font-medium">
            Tienes {readySoon.length} {readySoon.length === 1 ? 'planta' : 'plantas'} que alcanzarán su maduración en menos de 15 días.
          </p>
        </div>
      ) : null}

      {/* Lista de avisos de cosecha */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white px-1">
          Avisos del Día Estimado de Cosecha
        </h3>

        {/* ESTADO VACÍO: Cuando no hay cultivos todavía */}
        {crops.length === 0 ? (
          <div className="bg-stone-900 border-2 border-dashed border-stone-700 rounded-3xl p-6 text-center space-y-3">
            <p className="text-lg font-bold text-white">
              Aún no registraste ninguna siembra
            </p>
            <p className="text-base text-stone-300 leading-relaxed font-medium">
              Agrega tu primera planta con el día en que la sembraste. SIEMBRA calculará automáticamente la fecha exacta estimada para recolectar tus frutos.
            </p>
            {/* Único botón principal de esta pantalla vacía */}
            <button
              onClick={onOpenRegister}
              className="w-full min-h-[52px] px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-stone-950 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Registrar mi primer cultivo</span>
            </button>
          </div>
        ) : (
          sortedCrops.map(({ crop, harvest }) => {
            const isReady = harvest.daysRemaining <= 0;

            return (
              <article
                key={crop.id}
                className={`bg-stone-900 border-2 rounded-2xl p-4 shadow-md space-y-3 ${
                  isReady
                    ? 'border-amber-400 bg-stone-900'
                    : 'border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {crop.name}
                    </h4>
                    <p className="text-base text-stone-300 font-medium">
                      {crop.variety || crop.location}
                    </p>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl text-base font-extrabold shrink-0 border ${
                    isReady
                      ? 'bg-amber-400 text-stone-950 border-amber-300'
                      : 'bg-stone-800 text-stone-200 border-stone-600'
                  }`}>
                    {harvest.statusText}
                  </div>
                </div>

                {/* Fecha estimada de cosecha destacada */}
                <div className="p-3 bg-stone-950 border-2 border-stone-700 rounded-xl space-y-1">
                  <span className="text-base text-stone-300 block font-medium">
                    Día estimado para cosechar:
                  </span>
                  <strong className="text-lg font-extrabold text-amber-300 block">
                    📅 {formatSpanishDate(harvest.harvestDateStr)}
                  </strong>
                  <span className="text-base text-stone-400 block font-medium">
                    Sembrado: {formatSpanishDayMonth(crop.sowingDate)}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-base text-stone-200 font-medium">
                    <span>Ciclo biológico:</span>
                    <strong className="font-bold text-white">{harvest.daysSinceSowing} de {crop.daysToHarvest} días ({harvest.progressPercent}%)</strong>
                  </div>
                  <div className="h-3 w-full bg-stone-800 border border-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        harvest.progressPercent >= 100
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${harvest.progressPercent}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
