/**
 * Tipos de datos centrales para la aplicación SIEMBRA.
 * Diseñado para resolver el problema de regar por costumbre y no por necesidad.
 */

export type PlantLocation = 'maceta' | 'huerto' | 'mesa_cultivo' | 'balcon';

export interface Crop {
  id: string;
  name: string; // Nombre del cultivo (ej: Tomate Cherry, Lechuga, Albahaca)
  variety?: string; // Sub-variedad o descripción (ej: Cuatro Estaciones, Genovesa)
  location: PlantLocation; // Dónde está plantado (maceta se seca más rápido que suelo directo)
  sowingDate: string; // Fecha de siembra en formato ISO YYYY-MM-DD
  wateringIntervalDays: number; // Intervalo de riego según necesidad real (ej: cada 3 días)
  lastWateredDate: string; // Última fecha en que se regó efectivamente (YYYY-MM-DD)
  wateringHistory?: string[]; // Historial de fechas en que se regó (YYYY-MM-DD) para calcular la frecuencia semanal real
  daysToHarvest: number; // Días estimados desde la siembra hasta la cosecha
  notes?: string; // Observaciones de la familia (ej: sol directo en la mañana)
  createdAt: number; // Timestamp de creación
}

export type TabType = 'cultivos' | 'riego' | 'cosecha' | 'estadisticas';

export interface PresetCropTemplate {
  name: string;
  defaultIntervalDays: number;
  defaultDaysToHarvest: number;
  locationDefault: PlantLocation;
  recommendation: string;
  iconName: string;
}
