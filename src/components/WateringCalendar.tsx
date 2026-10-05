/**
 * Calendario de Riego por Cultivo.
 * Cumple con:
 * - 1. Uso desde 320px (carrusel deslizable con una mano).
 * - 2. Texto nunca menor a 16px y alto contraste para exteriores.
 * - 4. Botones secundarios en tarjetas para preservar la jerarquía.
 * - 5. Estado vacío claro que invita a la acción.
 */

import React, { useState } from 'react';
import { Droplet, CheckCircle2, Calendar as CalendarIcon, ShieldCheck, Plus } from 'lucide-react';
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
  onOpenRegister: () => void;
}

export const WateringCalendar: React.FC<WateringCalendarProps> = ({
  crops,
  onWaterToday,
  onOpenRegister,
}) => {
  const todayStr = getTodayLocalDateString();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Generamos los próximos 7 días para el carrusel deslizable
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

  const cropsNeedingWaterToday = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return status.needsWaterToday;
  });

  const cropsMoistToday = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return !status.needsWaterToday;
  });

  const getCropsForDate = (targetDateStr: string) => {
    return crops.filter(c => {
      const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
      
      if (targetDateStr === todayStr) {
        return status.needsWaterToday || status.urgency === 'watered_today';
      }

      const daysDiff = (parseLocalDate(targetDateStr).getTime() - parseLocalDate(c.lastWateredDate).getTime()) / (1000 * 60 * 60 * 24);
      const roundedDays = Math.round(daysDiff);
      return roundedDays > 0 && (roundedDays % c.wateringIntervalDays === 0);
    });
  };

  const cropsForSelectedDay = getCropsForDate(selectedDateStr);

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Alerta pedagógica anti-riego por costumbre y Test del Dedo */}
      <section className="bg-sky-950/40 border-2 border-sky-600 rounded-2xl p-4 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2 text-sky-300 font-bold text-lg">
          <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
          <span>Regla de Oro: Regar por Necesidad</span>
        </div>
        <p className="text-base text-stone-200 leading-relaxed font-medium">
          Regar por costumbre todos los días ahoga las raíces de tus macetas. 
          <strong> Antes de regar:</strong> introduce 2 cm tu dedo en la tierra.
        </p>

        {/* Guía rápida de diagnóstico con texto >= 16px */}
        <div className="bg-stone-900 border-2 border-stone-700 rounded-xl p-3.5 space-y-2.5">
          <strong className="text-base font-bold text-sky-300 block">
            ¿Cómo está la tierra a 2 cm de profundidad?
          </strong>
          <div className="space-y-2 text-base">
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-700">
              <span className="font-bold text-amber-300 block">🍂 Dedo seco y limpio:</span>
              <span className="text-stone-200">Suelo seco. <strong>Sí toca regar</strong>.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-700">
              <span className="font-bold text-emerald-400 block">🪴 Dedo fresco con tierra pegada:</span>
              <span className="text-stone-200">Humedad activa. <strong>¡No riegues hoy!</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Resumen rápido de hoy */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3.5 space-y-1">
          <span className="text-base font-medium text-stone-300 block">Necesitan agua hoy</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-400">
              {cropsNeedingWaterToday.length}
            </span>
            <span className="text-base text-stone-300 font-medium">
              de {crops.length}
            </span>
          </div>
        </div>

        <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3.5 space-y-1">
          <span className="text-base font-medium text-stone-300 block">Tierra húmeda</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-400">
              {cropsMoistToday.length}
            </span>
            <span className="text-base text-stone-300 font-medium">descansan</span>
          </div>
        </div>
      </div>

      {/* 3. Selector de días con scroll horizontal (ideal para 320px) */}
      <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between text-base font-bold text-stone-200 px-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            <span>Calendario semanal</span>
          </div>
          <span className="text-stone-300 text-base font-medium">
            {formatSpanishDate(selectedDateStr, true)}
          </span>
        </div>

        {/* Carrusel horizontal táctil con botones anchos >= 56px */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {weekDays.map((d) => {
            const isSelected = selectedDayOffset === d.offset;
            const countForDay = getCropsForDate(d.dateStr).length;

            return (
              <button
                key={d.offset}
                onClick={() => setSelectedDayOffset(d.offset)}
                className={`min-w-[58px] min-h-[58px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 border-white text-stone-950 font-extrabold shadow-lg'
                    : 'bg-stone-800 border-stone-700 text-stone-200 hover:border-stone-500'
                }`}
                aria-pressed={isSelected}
              >
                <span className="text-base font-semibold leading-tight">
                  {d.isToday ? 'Hoy' : d.dayName}
                </span>
                <span className="text-lg font-bold leading-tight mt-0.5">
                  {d.dayNumber}
                </span>
                {countForDay > 0 && (
                  <span className={`w-2 h-2 rounded-full mt-1 ${isSelected ? 'bg-stone-950' : 'bg-sky-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Lista de cultivos según el día seleccionado */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white px-1">
          {selectedDayOffset === 0
            ? 'Plan de riego para hoy'
            : `Riegos del ${formatSpanishDayMonth(selectedDateStr)}`}
        </h3>

        {/* ESTADO VACÍO: cuando no hay cultivos cargados */}
        {crops.length === 0 ? (
          <div className="bg-stone-900 border-2 border-dashed border-stone-700 rounded-3xl p-6 text-center space-y-3">
            <p className="text-lg font-bold text-white">
              Aún no tienes plantas registradas
            </p>
            <p className="text-base text-stone-300 leading-relaxed">
              Registra tu primer cultivo para que SIEMBRA arme tu calendario de riego personalizado según la necesidad de cada maceta.
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
        ) : cropsForSelectedDay.length === 0 ? (
          <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-5 text-center space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-lg font-bold text-white">
              Ninguna planta necesita agua este día
            </p>
            <p className="text-base text-stone-300">
              Todas retienen humedad adecuada para esta fecha. ¡Déjalas respirar!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cropsForSelectedDay.map((crop) => {
              const status = getWateringStatus(crop.lastWateredDate, crop.wateringIntervalDays);

              return (
                <div
                  key={crop.id}
                  className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-lg font-bold text-white block">
                        {crop.name}
                      </span>
                      <span className="text-base text-stone-300 font-medium">
                        Regar cada {crop.wateringIntervalDays} días · {crop.variety || crop.location}
                      </span>
                    </div>
                  </div>

                  {/* Botón secundario para marcar regado */}
                  {selectedDayOffset === 0 && (
                    <button
                      onClick={() => onWaterToday(crop.id)}
                      className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer border-2 ${
                        status.urgency === 'watered_today'
                          ? 'bg-stone-800 border-stone-600 text-emerald-400 cursor-default'
                          : 'bg-sky-950 border-sky-400 text-sky-200 hover:bg-sky-900'
                      }`}
                    >
                      {status.urgency === 'watered_today' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[3]" />
                          <span>Regado hoy</span>
                        </>
                      ) : (
                        <>
                          <Droplet className="w-5 h-5 text-sky-400" />
                          <span>Marcar regado hoy</span>
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
    </div>
  );
};
