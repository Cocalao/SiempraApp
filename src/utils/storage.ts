/**
 * Persistencia en el navegador (localStorage) para SIEMBRA.
 * 
 * PUNTOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. MODO INCÓGNITO O PRIVADO: En algunos navegadores móviles estrictos, acceder a `localStorage`
 *    lanza una excepción (SecurityError / QuotaExceededError). Siempre usamos try/catch.
 * 2. CORRUPCIÓN DE JSON: Si alguien editó manualmente o quedó un string inválido en cache,
 *    `JSON.parse` arroja error de sintaxis y bloquea la pantalla blanca de la app.
 * 3. TIPADO: Los campos numéricos como `wateringIntervalDays` y `daysToHarvest` al venir
 *    de un `<input type="number">` suelen llegar como string si no se convierten explícitamente.
 */

import { Crop, PresetCropTemplate } from '../types/garden';
import { addDaysToDate, getTodayLocalDateString } from './dateUtils';

const STORAGE_KEY = 'siembra_cultivos_v1';

/**
 * Plantillas predefinidas de cultivos familiares con sus necesidades reales de riego y tiempos.
 * Ayudan a la familia a elegir sin tener que buscar en libros de botánica.
 */
export const PRESET_CROPS: PresetCropTemplate[] = [
  {
    name: 'Tomate Cherry',
    defaultIntervalDays: 3, // En maceta necesita agua regular pero sin encharcar
    defaultDaysToHarvest: 75,
    locationDefault: 'maceta',
    recommendation: 'Sensible al exceso de agua (se rajan los frutos). Riega a la base, nunca las hojas.',
    iconName: '🍅',
  },
  {
    name: 'Albahaca',
    defaultIntervalDays: 2,
    defaultDaysToHarvest: 35,
    locationDefault: 'maceta',
    recommendation: 'Le gusta la humedad constante pero odia el agua estancada. Riega cuando la superficie esté tibia.',
    iconName: '🌿',
  },
  {
    name: 'Lechuga',
    defaultIntervalDays: 2,
    defaultDaysToHarvest: 45,
    locationDefault: 'mesa_cultivo',
    recommendation: 'Raíces poco profundas. Riega poco volumen con mayor frecuencia.',
    iconName: '🥬',
  },
  {
    name: 'Pimiento / Ají',
    defaultIntervalDays: 4,
    defaultDaysToHarvest: 85,
    locationDefault: 'maceta',
    recommendation: 'Tolera mejor la falta de agua que el encharcamiento. Deja secar el primer centímetro.',
    iconName: '🌶️',
  },
  {
    name: 'Romero / Aromáticas',
    defaultIntervalDays: 6,
    defaultDaysToHarvest: 60,
    locationDefault: 'maceta',
    recommendation: '¡Cuidado con regar por costumbre! Planta mediterránea: el exceso pudre sus raíces rápidamente.',
    iconName: '🌱',
  },
  {
    name: 'Zanahoria',
    defaultIntervalDays: 3,
    defaultDaysToHarvest: 70,
    locationDefault: 'huerto',
    recommendation: 'Humedad moderada y profunda para que la raíz baje recta y no se bifurque.',
    iconName: '🥕',
  },
];

/**
 * Genera datos iniciales de ejemplo si es la primera vez que la familia abre la aplicación.
 * Las fechas se anclan dinámicamente a la fecha actual del usuario para que los indicadores
 * de riego y cosecha muestren estados reales e ilustrativos de inmediato.
 */
export function generateInitialCrops(): Crop[] {
  const today = getTodayLocalDateString();
  
  return [
    {
      id: 'demo-tomate',
      name: 'Tomate Cherry',
      variety: 'Maceta grande 20L',
      location: 'maceta',
      // Sembrado hace 52 días de un ciclo de 75 días -> Faltan 23 días para cosechar
      sowingDate: addDaysToDate(today, -52),
      wateringIntervalDays: 3,
      // Último riego hace 3 días -> ¡Toca regar hoy!
      lastWateredDate: addDaysToDate(today, -3),
      daysToHarvest: 75,
      notes: 'Ubicado en el patio con sol directo de mañana.',
      createdAt: Date.now() - 52 * 86400000,
    },
    {
      id: 'demo-albahaca',
      name: 'Albahaca Genovesa',
      variety: 'Jardinera ventana',
      location: 'balcon',
      // Sembrada hace 28 días de un ciclo de 35 días -> ¡Casi lista para cosechar!
      sowingDate: addDaysToDate(today, -28),
      wateringIntervalDays: 2,
      // Regada hoy -> Tierra húmeda, NO regar por costumbre
      lastWateredDate: today,
      daysToHarvest: 35,
      notes: 'Para hacer pesto en familia. Pellizcar flores.',
      createdAt: Date.now() - 28 * 86400000,
    },
    {
      id: 'demo-romero',
      name: 'Romero Silvestre',
      variety: 'Maceta barro terraza',
      location: 'maceta',
      // Sembrado hace 20 días de un ciclo de 60 días
      sowingDate: addDaysToDate(today, -20),
      wateringIntervalDays: 6,
      // Regado hace 1 día -> Próximo riego en 5 días
      lastWateredDate: addDaysToDate(today, -1),
      daysToHarvest: 60,
      notes: 'Cuidado con el exceso de agua. Regar solo cuando la tierra esté bien seca.',
      createdAt: Date.now() - 20 * 86400000,
    },
  ];
}

/**
 * Carga los cultivos guardados en localStorage con manejo seguro de errores.
 */
export function loadCropsFromStorage(): Crop[] {
  if (typeof window === 'undefined') {
    return generateInitialCrops();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialCrops();
      saveCropsToStorage(initial);
      return initial;
    }
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Los datos de cultivos en localStorage no eran un array válido.');
      return generateInitialCrops();
    }
    
    return parsed;
  } catch (err) {
    console.error('Error al leer de localStorage:', err);
    return generateInitialCrops();
  }
}

/**
 * Guarda los cultivos en localStorage protegiendo contra excepciones de cuota o modo privado.
 */
export function saveCropsToStorage(crops: Crop[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
    return true;
  } catch (err) {
    console.error('No se pudo guardar en localStorage (posible modo privado o cuota excedida):', err);
    return false;
  }
}
