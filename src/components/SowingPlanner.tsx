/**
 * Componente: Planificador de Siembra para Fechas Especiales y Festividades.
 * 
 * Permite saber con precisión qué día sembrar para cosechar en fechas clave como:
 * - Calabazas para Halloween (31 de Octubre)
 * - Cempasúchil para Día de Muertos (1-2 de Noviembre)
 * - Cenas de Navidad y Año Nuevo
 * - Calculadora personalizada para cualquier fecha especial familiar.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. SIEMBRA INVERSA: No restar meses a ojo (ej: "octubre menos 3 meses"). Cada mes tiene
 *    distintos días (30, 31, 28) y los ciclos biológicos se miden en días naturales exactos.
 * 2. FESTIVIDADES DEL AÑO ACTUAL VS SIGUIENTE: Si el usuario consulta cuando ya pasó la ventana
 *    de siembra del año corriente, la app debe proyectar la fecha exacta del próximo año y advertir
 *    claramente que para este año ya no se alcanza al aire libre.
 */

import React, { useState } from 'react';
import { Calendar, Sparkles, Plus, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { HarvestObjectiveTemplate, PlantLocation } from '../types/garden';
import { FESTIVE_HARVEST_OBJECTIVES, PRESET_CROPS } from '../utils/storage';
import { 
  getFestiveSowingPlan, 
  calculateSowingDate, 
  formatSpanishDate, 
  getCalendarDaysDiff,
  getTodayLocalDateString,
  addDaysToDate 
} from '../utils/dateUtils';

interface SowingPlannerProps {
  onStartCropFromObjective: (objectiveData: {
    name: string;
    variety: string;
    location: PlantLocation;
    sowingDate: string;
    daysToHarvest: number;
    wateringIntervalDays: number;
    notes: string;
  }) => void;
}

export const SowingPlanner: React.FC<SowingPlannerProps> = ({
  onStartCropFromObjective,
}) => {
  const todayStr = getTodayLocalDateString();

  // Estados de la calculadora personalizada
  const [customCropName, setCustomCropName] = useState('Tomate Cherry');
  const [customDaysToHarvest, setCustomDaysToHarvest] = useState(75);
  // Por defecto sugerimos una fecha meta en 3 meses
  const [customTargetDate, setCustomTargetDate] = useState(() => addDaysToDate(todayStr, 90));
  const [customLocation, setCustomLocation] = useState<PlantLocation>('maceta');

  // Cálculo inverso para la calculadora personalizada
  const calculatedSowingDate = calculateSowingDate(customTargetDate, customDaysToHarvest);
  const daysDiffToSowing = getCalendarDaysDiff(todayStr, calculatedSowingDate);
  const daysUntilHarvest = getCalendarDaysDiff(todayStr, customTargetDate);

  // Al elegir un preset en la calculadora personalizada
  const handleSelectCustomPreset = (presetName: string) => {
    const preset = PRESET_CROPS.find(p => p.name === presetName);
    if (!preset) return;
    setCustomCropName(preset.name);
    setCustomDaysToHarvest(preset.defaultDaysToHarvest);
    setCustomLocation(preset.locationDefault);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner de introducción */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-emerald-100 shadow-sm space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs tracking-tight">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Planificador de Siembra Inversa</span>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          ¿Quieres tener <strong>calabazas para Halloween</strong> o <strong>cempasúchil para Día de Muertos</strong>? 
          Calcula la fecha exacta en que debes sembrar para llegar a tiempo a la cosecha.
        </p>
      </div>

      {/* SECCIÓN 1: Festividades y Metas Populares */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider px-1">
          Fechas Clave y Festividades
        </h3>

        <div className="space-y-3">
          {FESTIVE_HARVEST_OBJECTIVES.map((item) => {
            const plan = getFestiveSowingPlan(item.targetMonthDay, item.daysToHarvest);

            return (
              <div
                key={item.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all"
              >
                {/* Cabecera del objetivo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={item.eventName}>
                      {item.emoji}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-100 leading-tight">
                        {item.cropName}
                      </h4>
                      <p className="text-xs text-stone-400">
                        Meta: <strong>{item.eventName}</strong> ({formatSpanishDate(plan.targetHarvestDateStr, true)})
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-1 rounded-lg font-bold shrink-0 ${
                    plan.status === 'sow_now'
                      ? 'bg-emerald-500 text-stone-950'
                      : plan.status === 'upcoming'
                      ? 'bg-sky-900/70 text-sky-300 border border-sky-700/50'
                      : 'bg-stone-800 text-stone-400'
                  }`}>
                    {plan.statusBadge}
                  </span>
                </div>

                {/* Recuadro de fecha óptima de siembra */}
                <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">
                      Día óptimo de siembra
                    </span>
                    <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                      🌱 {formatSpanishDate(plan.optimalSowingDateStr)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Ciclo necesario</span>
                    <span className="text-xs font-mono text-stone-300">
                      {item.daysToHarvest} días
                    </span>
                  </div>
                </div>

                {/* Diagnóstico y explicación temporal */}
                <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-800/30 p-2.5 rounded-xl border border-stone-800/40">
                  {plan.description} {item.tips}
                </p>

                {/* Botón de acción: Sembrar y programar */}
                <button
                  onClick={() =>
                    onStartCropFromObjective({
                      name: item.cropName,
                      variety: item.variety || item.eventName,
                      location: item.locationDefault,
                      // Si la fecha óptima ya pasó o es lejana, sembramos con fecha de hoy o fecha sugerida
                      sowingDate: plan.status === 'sow_now' ? todayStr : plan.optimalSowingDateStr,
                      daysToHarvest: item.daysToHarvest,
                      wateringIntervalDays: item.defaultIntervalDays,
                      notes: `Objetivo: Cosechar para ${item.eventName}. ${item.tips}`,
                    })
                  }
                  className="w-full min-h-[44px] px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Programar siembra para {item.eventName}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: Calculadora Personalizada de Siembra Inversa */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3.5 mt-6">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs tracking-tight">
          <Sparkles className="w-4 h-4" />
          <span>Calculadora Inversa Personalizada</span>
        </div>
        <p className="text-xs text-stone-400 leading-normal">
          ¿Tienes un cumpleaños, reunión o fecha especial? Elige cuándo quieres cosechar y te diremos cuándo sembrar.
        </p>

        {/* Plantillas rápidas para la calculadora */}
        <div>
          <label className="block text-[11px] text-stone-400 mb-1.5 font-medium">
            Seleccionar cultivo:
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_CROPS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectCustomPreset(p.name)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  customCropName === p.name
                    ? 'bg-sky-900/60 border-sky-500 text-sky-200'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                {p.iconName} {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de configuración */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Nombre de la planta o variedad
            </label>
            <input
              type="text"
              value={customCropName}
              onChange={(e) => setCustomCropName(e.target.value)}
              className="w-full h-10 px-3 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                ¿Cuándo quieres cosechar?
              </label>
              <input
                type="date"
                value={customTargetDate}
                onChange={(e) => setCustomTargetDate(e.target.value)}
                className="w-full h-10 px-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Días de ciclo total
              </label>
              <input
                type="number"
                min="5"
                max="365"
                value={customDaysToHarvest}
                onChange={(e) => setCustomDaysToHarvest(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-sky-500 text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Resultado del cálculo inverso */}
        <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">Fecha en que debes sembrar:</span>
            <span className="font-bold text-amber-300">
              📅 {formatSpanishDate(calculatedSowingDate)}
            </span>
          </div>

          <div className="text-[11px] text-stone-300 pt-1 border-t border-stone-800/80">
            {daysUntilHarvest <= 0 ? (
              <span className="text-red-400">
                ⚠️ La fecha de cosecha elegida ya pasó o es hoy. Elige una fecha futura.
              </span>
            ) : daysDiffToSowing === 0 ? (
              <span className="text-emerald-400 font-semibold">
                🌱 ¡Hoy es el día exacto de siembra para alcanzar esa fecha!
              </span>
            ) : daysDiffToSowing > 0 ? (
              <span className="text-sky-300">
                ⏳ Tienes tiempo: debes sembrar dentro de <strong>{daysDiffToSowing} días</strong> (el {formatSpanishDate(calculatedSowingDate, true)}).
              </span>
            ) : (
              <span className="text-amber-400">
                ⚠️ La fecha ideal de siembra fue hace {Math.abs(daysDiffToSowing)} días. Si siembras hoy ({formatSpanishDate(todayStr, true)}), tu cosecha estará lista aproximadamente el {formatSpanishDate(addDaysToDate(todayStr, customDaysToHarvest))}.
              </span>
            )}
          </div>
        </div>

        {/* Botón para iniciar el cultivo con esta configuración */}
        <button
          onClick={() =>
            onStartCropFromObjective({
              name: customCropName,
              variety: `Meta: Cosecha ${formatSpanishDate(customTargetDate, true)}`,
              location: customLocation,
              // Si la fecha recomendada ya pasó, sembramos hoy; si es hoy o futura, usamos la fecha calculada
              sowingDate: daysDiffToSowing < 0 ? todayStr : calculatedSowingDate,
              daysToHarvest: customDaysToHarvest,
              wateringIntervalDays: 3,
              notes: `Calculado para cosechar el ${formatSpanishDate(customTargetDate)}.`,
            })
          }
          className="w-full min-h-[44px] px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar y Cuidar este Cultivo</span>
        </button>
      </div>
    </div>
  );
};
