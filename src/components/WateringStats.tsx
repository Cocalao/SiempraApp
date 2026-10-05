/**
 * Componente de Estadísticas de Riego.
 * - Texto nunca menor a 16px (incluso en ejes y leyendas del gráfico).
 * - Alto contraste para exteriores.
 * - Sin palabras técnicas.
 * - Compatible con pantallas desde 320px.
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
import { AlertTriangle, CheckCircle, Droplet, TrendingUp, Plus } from 'lucide-react';

interface WateringStatsProps {
  crops: Crop[];
  onOpenRegister: () => void;
}

export const WateringStats: React.FC<WateringStatsProps> = ({ crops, onOpenRegister }) => {
  const todayStr = getTodayLocalDateString();

  const chartData = crops.map((crop) => {
    const scheduledPerWeek = Number((7 / Math.max(1, crop.wateringIntervalDays)).toFixed(1));
    const history = crop.wateringHistory || (crop.lastWateredDate ? [crop.lastWateredDate] : []);
    
    const realCountLast7Days = history.filter((dateStr) => {
      const diff = getCalendarDaysDiff(dateStr, todayStr);
      return diff >= 0 && diff <= 6;
    }).length;

    const diff = realCountLast7Days - scheduledPerWeek;
    let diagnosis: 'exceso' | 'optimo' | 'deficit' = 'optimo';

    if (diff >= 0.8) {
      diagnosis = 'exceso';
    } else if (diff <= -0.8) {
      diagnosis = 'deficit';
    }

    return {
      id: crop.id,
      name: crop.name.length > 8 ? `${crop.name.slice(0, 7)}…` : crop.name,
      fullName: crop.name,
      location: crop.location,
      interval: crop.wateringIntervalDays,
      Programado: scheduledPerWeek,
      Real: realCountLast7Days,
      diagnosis,
      diff,
    };
  });

  const totalProgramado = chartData.reduce((acc, curr) => acc + curr.Programado, 0);
  const totalReal = chartData.reduce((acc, curr) => acc + curr.Real, 0);
  const overwateredCrops = chartData.filter((c) => c.diagnosis === 'exceso');

  // Tooltip con texto >= 16px
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 border-2 border-stone-600 p-3.5 rounded-xl shadow-2xl text-base space-y-1">
          <p className="font-bold text-white text-lg">{data.fullName}</p>
          <p className="text-base text-stone-300">Cada {data.interval} días</p>
          <div className="pt-1 space-y-1">
            <p className="text-sky-300 font-semibold">
              Recomendado: <strong>{data.Programado}</strong> riegos/sem
            </p>
            <p className="text-violet-300 font-semibold">
              Real últimos 7d: <strong>{data.Real}</strong> riegos/sem
            </p>
          </div>
          {data.diagnosis === 'exceso' && (
            <p className="text-amber-300 text-base font-bold pt-1">
              ⚠️ Riego por costumbre: {Math.round(data.diff * 10) / 10} de más.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Encabezado */}
      <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-4 space-y-1">
        <div className="flex items-center gap-2 text-violet-300 font-bold text-lg">
          <TrendingUp className="w-6 h-6" />
          <span>Frecuencia Semanal de Riego</span>
        </div>
        <p className="text-base text-stone-200 leading-relaxed font-medium">
          Compara cuántas veces se regó cada planta en los últimos 7 días con lo que realmente necesita para evitar ahogarla.
        </p>
      </div>

      {/* ESTADO VACÍO */}
      {crops.length === 0 ? (
        <div className="bg-stone-900 border-2 border-dashed border-stone-700 rounded-3xl p-6 text-center space-y-3">
          <p className="text-lg font-bold text-white">
            Sin datos para comparar todavía
          </p>
          <p className="text-base text-stone-300 leading-relaxed font-medium">
            Cuando registres tus plantas y comiences a anotar sus riegos, acá verás el gráfico comparativo para saber si estás regando de más por costumbre.
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
        <>
          {/* Resumen métrico */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3.5 space-y-1">
              <span className="text-base text-stone-300 font-medium block">Riegos esta semana</span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-extrabold text-violet-300">
                  {totalReal}
                </span>
                <span className="text-base text-stone-300 font-medium">
                  (ideal: ~{Math.round(totalProgramado)})
                </span>
              </div>
            </div>

            <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3.5 space-y-1">
              <span className="text-base text-stone-300 font-medium block">Riego por costumbre</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-extrabold ${
                  overwateredCrops.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {overwateredCrops.length}
                </span>
                <span className="text-base text-stone-300 font-medium">plantas</span>
              </div>
            </div>
          </div>

          {/* Alerta de exceso de agua */}
          {overwateredCrops.length > 0 && (
            <div className="bg-amber-950/50 border-2 border-amber-500 rounded-2xl p-3.5 space-y-1 text-base">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <span>Alerta de Riego Excesivo</span>
              </div>
              <p className="text-stone-100 font-medium leading-relaxed">
                Regaste <strong>{overwateredCrops.map(c => c.name).join(', ')}</strong> más veces de lo programado. Deja secar la tierra para que las raíces no se pudran.
              </p>
            </div>
          )}

          {/* Gráfico de Barras con Recharts (texto nunca menor a 16px) */}
          <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-3.5 space-y-2">
            <span className="font-bold text-white text-base block px-1">
              Comparativa por cada planta (Riegos por semana)
            </span>

            <div className="h-80 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#44403c" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#fafaf9" 
                    fontSize={16} 
                    tickLine={false} 
                    interval={0}
                  />
                  <YAxis 
                    stroke="#fafaf9" 
                    fontSize={16} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ fontSize: '16px', paddingBottom: '12px', color: '#fff' }}
                  />
                  <Bar 
                    dataKey="Programado" 
                    name="Necesario" 
                    fill="#38bdf8" 
                    radius={[6, 6, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Real" 
                    name="Real (7d)" 
                    fill="#a855f7" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diagnóstico individual */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white px-1">
              Diagnóstico de cada planta
            </h3>

            <div className="space-y-2.5">
              {chartData.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900 border-2 border-stone-700 rounded-xl p-3.5 flex items-center justify-between text-base gap-2 flex-wrap"
                >
                  <div>
                    <strong className="font-bold text-white text-lg block">{item.fullName}</strong>
                    <span className="text-base text-stone-300 font-medium">
                      Ideal: {item.Programado}/sem · Real: {item.Real}/sem
                    </span>
                  </div>

                  <div>
                    {item.diagnosis === 'exceso' ? (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-amber-300 bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                        Sobreriego (+{Math.round(item.diff * 10) / 10})
                      </span>
                    ) : item.diagnosis === 'optimo' ? (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500">
                        <CheckCircle className="w-5 h-5" />
                        Óptimo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-sky-300 bg-sky-950 px-3 py-1.5 rounded-xl border border-sky-500">
                        <Droplet className="w-5 h-5" />
                        Bajo riego
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
