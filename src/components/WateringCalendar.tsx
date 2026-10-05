/**
 * Calendario de Riego por Cultivo para SIEMBRA.
 * 
 * RESUELVE EL PROBLEMA CENTRAL:
 * "El huerto se riega por costumbre y no por necesidad".
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. PROYECCIÓN DE RIEGO A FUTURO: Al calcular los días siguientes en un calendario semanal,
 *    si un cultivo se riega cada 3 días, los próximos riegos caen en (últimoRiego + N*intervalo).
 *    Si solo se proyecta 1 ciclo, el calendario semanal parecería vacío para los días posteriores.
 * 2. ZONA HORARIA EN PROYECCIONES: Al generar los próximos 7 días, usar siempre `parseLocalDate`
 *    y `addDaysToDate` para evitar saltos o duplicación de días en meses de 30 o 31 días.
 */

import React, { useState } from 'react';
import { Droplet, AlertCircle, CheckCircle2, Calendar as CalendarIcon, Info, ShieldCheck } from 'lucide-react';
import { Crop } from '../types/garden';
import { 
  getTodayLocalDateString, 
  addDaysToDate, 
  formatSpanishDayMonth, 
  formatSpanishDate,
  getWateringStatus,
  parseLocalDate
} from '../utils/dateUtils';

interface WateringCalendarProps {
  crops: Crop[];
  onWaterToday: (cropId: string) => void;
}

export const WateringCalendar: React.FC<WateringCalendarProps> = ({
  crops,
  onWaterToday,
}) => {
  const todayStr = getTodayLocalDateString();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Generamos los próximos 7 días para el selector horizontal
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDaysToDate(todayStr, i);
    const dateObj = parseLocalDate(dateStr);
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNumber = dateObj.getDate();
    return {
      offset: i,
      dateStr,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
      dayNumber,
      isToday: i === 0,
    };
  });

  const selectedDateStr = addDaysToDate(todayStr, selectedDayOffset);

  // Clasificación para el día de HOY: Necesidad real vs Suelo húmedo
  const cropsNeedingWaterToday = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return status.needsWaterToday;
  });

  const cropsMoistToday = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return !status.needsWaterToday;
  });

  /**
   * Determina si un cultivo tiene proyectado riego en una fecha específica del calendario.
   * PUNTO CRÍTICO: Una planta se riega en lastWateredDate + (k * intervalDays).
   */
  const getCropsForDate = (targetDateStr: string) => {
    return crops.filter(c => {
      const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
      
      // Si la fecha objetivo es hoy y necesita riego o ya fue regado hoy
      if (targetDateStr === todayStr) {
        return status.needsWaterToday || status.urgency === 'watered_today';
      }

      // Si es una fecha futura, verificamos si coincide con los múltiplos del ciclo de riego
      const daysDiff = (parseLocalDate(targetDateStr).getTime() - parseLocalDate(c.lastWateredDate).getTime()) / (1000 * 60 * 60 * 24);
      const roundedDays = Math.round(daysDiff);
      
      // Debe ser posterior a hoy y múltiplo del intervalo
      return roundedDays > 0 && (roundedDays % c.wateringIntervalDays === 0);
    });
  };

  const cropsForSelectedDay = getCropsForDate(selectedDateStr);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Alerta pedagógica anti-riego por costumbre y Test Interactivo del Dedo */}
      <div className="bg-sky-950/40 border border-sky-800/60 rounded-2xl p-4 text-sky-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs tracking-tight">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Regla de Oro: Riego por Necesidad</span>
        </div>
        <p className="text-xs text-sky-200/90 leading-relaxed">
          En huertos familiares y macetas, regar a diario por rutina ahoga las raíces. 
          <strong> Antes de regar:</strong> introduce 2 cm tu dedo en la tierra.
        </p>

        {/* Guía rápida táctil de diagnóstico del sustrato */}
        <div className="bg-stone-900/80 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
          <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wide">
            Diagnóstico rápido del sustrato (Test de los 2 cm):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-300 block">🍂 Dedo seco y limpio:</span>
              <span className="text-stone-300">Sustrato agotado. <strong>Sí toca regar</strong>.</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-emerald-300 block">🪴 Dedo fresco con tierra:</span>
              <span className="text-stone-300">Humedad activa. <strong>¡No riegues hoy!</strong></span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-sky-300 block">🌊 Dedo empapado / barro:</span>
              <span className="text-stone-300">Exceso peligroso. Revisa el drenaje de la maceta.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Resumen rápido de hoy */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-stone-400">Necesitan agua hoy</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-400 tabular-nums">
              {cropsNeedingWaterToday.length}
            </span>
            <span className="text-xs text-stone-400">
              de {crops.length}
            </span>
          </div>
          <p className="text-[10px] text-stone-500">Sustrato seco según su ciclo</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-stone-400">Descanso (tierra húmeda)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">
              {cropsMoistToday.length}
            </span>
            <span className="text-xs text-stone-400">cultivos</span>
          </div>
          <p className="text-[10px] text-stone-500">No regar por hábito</p>
        </div>
      </div>

      {/* 3. Carrusel / Selector de días de la semana */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Calendario de la semana</span>
          </div>
          <span className="text-[11px] text-stone-400">
            {formatSpanishDate(selectedDateStr, true)}
          </span>
        </div>

        {/* Botones de días horizontales (hitbox amplia para el pulgar) */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => {
            const isSelected = selectedDayOffset === d.offset;
            const scheduledForThisDay = getCropsForDate(d.dateStr).length;

            return (
              <button
                key={d.offset}
                onClick={() => setSelectedDayOffset(d.offset)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <span className={`text-[10px] ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                  {d.isToday ? 'Hoy' : d.dayName}
                </span>
                <span className="text-sm font-bold tabular-nums mt-0.5">
                  {d.dayNumber}
                </span>
                {/* Indicador de gotas si hay riegos previstos */}
                <span className="h-1.5 flex items-center justify-center mt-1">
                  {scheduledForThisDay > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-stone-950' : 'bg-sky-400'}`} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Lista de cultivos según el día seleccionado */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider px-1">
          {selectedDayOffset === 0
            ? 'Plan de Riego para Hoy'
            : `Riegos programados para el ${formatSpanishDayMonth(selectedDateStr)}`}
        </h3>

        {crops.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center text-stone-400 text-xs">
            No tienes cultivos registrados todavía. Usa el botón "Nuevo" arriba para registrar tu primera planta.
          </div>
        ) : cropsForSelectedDay.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-stone-200">
              Ningún cultivo requiere riego este día
            </p>
            <p className="text-[11px] text-stone-400">
              Todos los cultivos retienen humedad adecuada para esta fecha.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cropsForSelectedDay.map((crop) => {
              const status = getWateringStatus(crop.lastWateredDate, crop.wateringIntervalDays);

              return (
                <div
                  key={crop.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-100">
                        {crop.name}
                      </span>
                      <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
                        Cada {crop.wateringIntervalDays} días
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Último riego: {formatSpanishDayMonth(crop.lastWateredDate)} · {crop.variety || crop.location}
                    </p>
                  </div>

                  {/* Si es hoy, permitir marcar como regado directamente */}
                  {selectedDayOffset === 0 && (
                    <button
                      onClick={() => onWaterToday(crop.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
                        status.urgency === 'watered_today'
                          ? 'bg-stone-800 text-stone-400 cursor-default'
                          : 'bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold shadow-sm'
                      }`}
                    >
                      {status.urgency === 'watered_today' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Listo</span>
                        </>
                      ) : (
                        <>
                          <Droplet className="w-4 h-4" />
                          <span>Regar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Cultivos que NO deben regarse hoy (para reforzar el problema del usuario) */}
      {selectedDayOffset === 0 && cropsMoistToday.length > 0 && (
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Plantas que NO necesitan riego hoy (¡Déjalas descansar!)</span>
          </div>

          <div className="space-y-2">
            {cropsMoistToday.map((crop) => {
              const status = getWateringStatus(crop.lastWateredDate, crop.wateringIntervalDays);
              return (
                <div
                  key={crop.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-800/50 last:border-none"
                >
                  <span className="text-stone-300 font-medium">{crop.name}</span>
                  <span className="text-[11px] text-stone-400">
                    {status.statusBadgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
