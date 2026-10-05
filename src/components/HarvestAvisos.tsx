/**
 * Componente de Aviso del Día Estimado de Cosecha para SIEMBRA.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. ORDENAMIENTO DE COSECHAS: Si ordenas solo por `daysRemaining`, los cultivos pasados de fecha
 *    (negativos, ej: -3 días) podrían quedar al final o al principio de forma confusa.
 *    Deben priorizarse: primero los listos hoy y retrasados (para no perder la cosecha),
 *    luego los que están más próximos (faltan pocos días).
 * 2. DESBORDAMIENTO DEL 100%: Si un cultivo se sembró hace 90 días con ciclo de 60,
 *    el progreso es 150%. En CSS una barra de `width: 150%` rompe el contenedor si no se acota.
 */

import React from 'react';
import { Sparkles, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Crop } from '../types/garden';
import { 
  getHarvestStatus, 
  formatSpanishDate, 
  formatSpanishDayMonth,
  getTodayLocalDateString 
} from '../utils/dateUtils';

interface HarvestAvisosProps {
  crops: Crop[];
  onOpenRegister: () => void;
}

export const HarvestAvisos: React.FC<HarvestAvisosProps> = ({ crops, onOpenRegister }) => {
  // Calculamos el diagnóstico de cosecha para todos los cultivos
  const cropsWithHarvest = crops.map(crop => ({
    crop,
    harvest: getHarvestStatus(crop.sowingDate, crop.daysToHarvest),
  }));

  // Ordenamos para que los más urgentes o próximos a cosechar aparezcan primero
  // Prioridad: listos hoy / vencidos -> próximos (1 a 15 días) -> lejanos
  const sortedCrops = [...cropsWithHarvest].sort((a, b) => {
    // Si ambos ya están listos (<= 0), el que esté más pasado va primero
    if (a.harvest.daysRemaining <= 0 && b.harvest.daysRemaining <= 0) {
      return a.harvest.daysRemaining - b.harvest.daysRemaining;
    }
    // Si uno está listo y el otro no, el listo va primero
    if (a.harvest.daysRemaining <= 0) return -1;
    if (b.harvest.daysRemaining <= 0) return 1;
    // Si ambos son futuros, el que falte menos días va primero
    return a.harvest.daysRemaining - b.harvest.daysRemaining;
  });

  const readyToHarvest = cropsWithHarvest.filter(
    item => item.harvest.urgency === 'ready_today' || item.harvest.urgency === 'overdue'
  );

  const readySoon = cropsWithHarvest.filter(
    item => item.harvest.urgency === 'ready_soon'
  );

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Alerta destacada si hay cosechas listas o por vencer */}
      {readyToHarvest.length > 0 ? (
        <div className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>¡Momento de Cosecha Familiar!</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Tienes <strong>{readyToHarvest.length} {readyToHarvest.length === 1 ? 'cultivo listo' : 'cultivos listos'}</strong> para recolectar hoy. 
            Cosechar en su punto óptimo evita que las hojas amarguen o los frutos caigan.
          </p>
        </div>
      ) : readySoon.length > 0 ? (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Próximas Cosechas en Camino</span>
          </div>
          <p className="text-xs text-emerald-200/80">
            Tienes {readySoon.length} cultivo{readySoon.length > 1 ? 's' : ''} que alcanzará su maduración en los próximos 15 días.
          </p>
        </div>
      ) : null}

      {/* 2. Tarjetas de cada cultivo con su aviso de cosecha */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider px-1">
          Avisos del Día Estimado de Cosecha
        </h3>

        {crops.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center text-stone-400 text-xs">
            Aún no has registrado cultivos. Añade uno con su fecha de siembra para ver la fecha estimada de cosecha.
          </div>
        ) : (
          sortedCrops.map(({ crop, harvest }) => {
            const isReady = harvest.daysRemaining <= 0;
            const isSoon = harvest.daysRemaining > 0 && harvest.daysRemaining <= 15;

            return (
              <div
                key={crop.id}
                className={`bg-stone-900 border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                  isReady
                    ? 'border-amber-500/70 bg-stone-900/90'
                    : isSoon
                    ? 'border-emerald-700/60'
                    : 'border-stone-800'
                }`}
              >
                {/* Cabecera con nombre y etiqueta de aviso */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-stone-100 leading-snug">
                      {crop.name}
                    </h4>
                    <p className="text-xs text-stone-400">
                      {crop.variety || crop.location}
                    </p>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 ${
                    isReady
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : isSoon
                      ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/50'
                      : 'bg-stone-800 text-stone-300'
                  }`}>
                    {isReady ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>¡Listo para cosechar!</span>
                      </>
                    ) : (
                      <span>{harvest.statusText}</span>
                    )}
                  </div>
                </div>

                {/* Fecha estimada de cosecha grande y legible */}
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">
                      Día estimado de cosecha
                    </span>
                    <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                      📅 {formatSpanishDate(harvest.harvestDateStr)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Sembrado</span>
                    <span className="text-xs text-stone-300 font-medium">
                      {formatSpanishDayMonth(crop.sowingDate)}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso biológico */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Progreso del ciclo</span>
                    <span className="font-mono tabular-nums text-stone-200">
                      {harvest.daysSinceSowing} de {crop.daysToHarvest} días ({harvest.progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        harvest.progressPercent >= 100
                          ? 'bg-amber-400'
                          : harvest.progressPercent > 70
                          ? 'bg-emerald-400'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${harvest.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Recomendación de cosecha */}
                <p className="text-[11px] text-stone-400 leading-normal">
                  {isReady
                    ? 'Revisa el tamaño, color y aroma. Si la planta florece en exceso antes de cosechar, el sabor puede volverse amargo.'
                    : `Etapa actual: ${
                        harvest.progressPercent < 30
                          ? 'Brote y desarrollo de raíces.'
                          : harvest.progressPercent < 70
                          ? 'Crecimiento foliar activo.'
                          : 'Floración y engorde final.'
                      } Mantén el riego según necesidad.`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
