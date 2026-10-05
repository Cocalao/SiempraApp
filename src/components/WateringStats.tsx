/**
 * Componente de Estadísticas de Riego para SIEMBRA.
 * Utiliza recharts para comparar la frecuencia de riego semanal real frente a la programada.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. RESPONSIVE CONTAINER EN RECHARTS: Si el contenedor padre no tiene una altura fija
 *    (ej: `h-72`), `ResponsiveContainer` colapsa a 0px de alto en celulares.
 * 2. CÁLCULO DE LA VENTANA DE 7 DÍAS: Filtrar fechas de riego usando `getCalendarDaysDiff`
 *    en lugar de milisegundos crudos para no desfasar por cambios de horario de verano o medianoche.
 * 3. DECIMALES EN FRECUENCIA PROGRAMADA: Una planta con intervalo de 3 días se riega 7/3 = 2.333...
 *    veces por semana. Debe redondearse a 1 decimal (`Number.toFixed(1)`) para legibilidad en el eje Y.
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Crop } from '../types/garden';
import { getTodayLocalDateString, getCalendarDaysDiff } from '../utils/dateUtils';
import { AlertTriangle, CheckCircle, Droplet, TrendingUp, Info } from 'lucide-react';

interface WateringStatsProps {
  crops: Crop[];
}

export const WateringStats: React.FC<WateringStatsProps> = ({ crops }) => {
  const todayStr = getTodayLocalDateString();

  // Preparación de datos para Recharts
  const chartData = crops.map((crop) => {
    // 1. Frecuencia semanal programada según el intervalo botánico
    const scheduledPerWeek = Number((7 / Math.max(1, crop.wateringIntervalDays)).toFixed(1));

    // 2. Frecuencia semanal real: contar cuántas veces se regó en los últimos 7 días
    const history = crop.wateringHistory || (crop.lastWateredDate ? [crop.lastWateredDate] : []);
    
    // Filtramos riegos ocurridos en los últimos 7 días (diferencia entre 0 y 6 días con respecto a hoy)
    const realCountLast7Days = history.filter((dateStr) => {
      const diff = getCalendarDaysDiff(dateStr, todayStr);
      return diff >= 0 && diff <= 6;
    }).length;

    // Diferencia entre real y programado
    const diff = realCountLast7Days - scheduledPerWeek;
    let diagnosis: 'exceso' | 'optimo' | 'deficit' = 'optimo';

    if (diff >= 0.8) {
      diagnosis = 'exceso'; // Regado más de lo necesario -> ¡Riego por costumbre!
    } else if (diff <= -0.8) {
      diagnosis = 'deficit'; // Menos de lo necesario
    }

    return {
      id: crop.id,
      name: crop.name.length > 12 ? `${crop.name.slice(0, 10)}…` : crop.name,
      fullName: crop.name,
      location: crop.location,
      interval: crop.wateringIntervalDays,
      Programado: scheduledPerWeek,
      Real: realCountLast7Days,
      diagnosis,
      diff,
    };
  });

  // Métricas acumuladas de la familia
  const totalProgramado = chartData.reduce((acc, curr) => acc + curr.Programado, 0);
  const totalReal = chartData.reduce((acc, curr) => acc + curr.Real, 0);
  const overwateredCrops = chartData.filter((c) => c.diagnosis === 'exceso');

  // Tooltip personalizado con tema oscuro
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-stone-100">{data.fullName}</p>
          <p className="text-[11px] text-stone-400">Intervalo: cada {data.interval} días</p>
          <div className="pt-1 space-y-0.5">
            <p className="text-sky-300">
              Programado: <strong className="font-mono">{data.Programado}</strong> riegos/semana
            </p>
            <p className="text-violet-300">
              Real últimos 7d: <strong className="font-mono">{data.Real}</strong> riegos/semana
            </p>
          </div>
          {data.diagnosis === 'exceso' && (
            <p className="text-amber-400 text-[10px] font-semibold pt-1">
              ⚠️ Riego por costumbre: {Math.round(data.diff * 10) / 10} riegos de más.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Encabezado explicativo */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
        <div className="flex items-center gap-2 text-violet-400 font-bold text-xs tracking-tight">
          <TrendingUp className="w-4 h-4" />
          <span>Frecuencia Semanal: Real vs. Programada</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          Compara cuántas veces se regó cada planta en los últimos 7 días frente a lo que realmente necesita por calendario botánico.
        </p>
      </div>

      {/* 2. Tarjetas de resumen métrico */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-stone-400">Total riegos esta semana</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-400 font-mono tabular-nums">
              {totalReal}
            </span>
            <span className="text-xs text-stone-400">
              (ideal: ~{Math.round(totalProgramado)})
            </span>
          </div>
          <p className="text-[10px] text-stone-500">Suma de todos tus cultivos</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] text-stone-400">Cultivos con sobreriego</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono tabular-nums ${
              overwateredCrops.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {overwateredCrops.length}
            </span>
            <span className="text-xs text-stone-400">de {crops.length}</span>
          </div>
          <p className="text-[10px] text-stone-500">
            {overwateredCrops.length > 0 ? 'Regados por rutina' : '¡Excelente disciplina!'}
          </p>
        </div>
      </div>

      {/* 3. Alerta de sobreriego si aplica */}
      {overwateredCrops.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Alerta de Riego por Costumbre</span>
          </div>
          <p className="text-amber-200/90 text-[11px] leading-relaxed">
            Has regado <strong>{overwateredCrops.map(c => c.name).join(', ')}</strong> más veces de lo programado. 
            El exceso de agua en macetas produce pudrición radicular y hojas amarillas.
          </p>
        </div>
      )}

      {/* 4. Gráfico de Barras con Recharts */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-stone-200">Comparativa por Cultivo</span>
          <span className="text-[10px] text-stone-400">Eje Y: Riegos / semana</span>
        </div>

        {crops.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-stone-400">
            No hay cultivos para mostrar estadísticas.
          </div>
        ) : (
          /* PUNTO CRÍTICO: El contenedor DEBE tener altura fija (h-72) para ResponsiveContainer */
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#a8a29e" 
                  fontSize={11} 
                  tickLine={false} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#a8a29e" 
                  fontSize={11} 
                  tickLine={false} 
                  allowDecimals={false}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar 
                  dataKey="Programado" 
                  name="Programado" 
                  fill="#38bdf8" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="Real" 
                  name="Real (7d)" 
                  fill="#a855f7" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. Lista de diagnósticos detallados por planta */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider px-1">
          Diagnóstico Individual
        </h3>

        <div className="space-y-2">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-stone-100">{item.fullName}</span>
                <p className="text-[11px] text-stone-400">
                  Ideal: {item.Programado}/sem · Real: {item.Real}/sem
                </p>
              </div>

              <div>
                {item.diagnosis === 'exceso' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800/60">
                    <AlertTriangle className="w-3 h-3" />
                    Sobreriego (+{Math.round(item.diff * 10) / 10})
                  </span>
                ) : item.diagnosis === 'optimo' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/60">
                    <CheckCircle className="w-3 h-3" />
                    Óptimo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-950/60 px-2 py-1 rounded-lg border border-sky-800/60">
                    <Droplet className="w-3 h-3" />
                    Bajo riego
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
