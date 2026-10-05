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
      wateringIntervalDays: 3, // Programado: ~2.3 veces/semana (cada 3 días)
      // Último riego hace 3 días -> ¡Toca regar hoy!
      lastWateredDate: addDaysToDate(today, -3),
      // Historial de riego semanal: regado hace 6, 4 y 3 días (3 veces en la semana)
      wateringHistory: [
        addDaysToDate(today, -6),
        addDaysToDate(today, -4),
        addDaysToDate(today, -3),
      ],
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
      wateringIntervalDays: 2, // Programado: 3.5 veces/semana (cada 2 días)
      // Regada hoy -> Tierra húmeda, NO regar por costumbre
      lastWateredDate: today,
      // Historial semanal: regada hace 6, 4, 2 días y hoy (4 veces en la semana)
      wateringHistory: [
        addDaysToDate(today, -6),
        addDaysToDate(today, -4),
        addDaysToDate(today, -2),
        today,
      ],
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
      wateringIntervalDays: 6, // Programado: ~1.2 veces/semana (cada 6 días)
      // Regado hace 1 día -> Próximo riego en 5 días
      lastWateredDate: addDaysToDate(today, -1),
      // Historial semanal: regado hace 5, 3 y 1 día (3 veces en la semana -> ¡Sobreriego por costumbre!)
      wateringHistory: [
        addDaysToDate(today, -5),
        addDaysToDate(today, -3),
        addDaysToDate(today, -1),
      ],
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
    
    // Asegurar que cada cultivo tenga un array de historial defensivo
    return parsed.map((item: any) => ({
      ...item,
      wateringHistory: Array.isArray(item.wateringHistory)
        ? item.wateringHistory
        : (item.lastWateredDate ? [item.lastWateredDate] : []),
    }));
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

/**
 * Borra por completo los datos guardados en localStorage.
 */
export function clearAllCropsFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Error al limpiar localStorage:', err);
    return false;
  }
}

/**
 * Exporta los cultivos a un archivo .json descargable en el dispositivo del usuario.
 * Crea un Blob de tipo application/json y un enlace <a> temporal para forzar la descarga.
 */
export function exportCropsToJSON(crops: Crop[]): void {
  if (typeof window === 'undefined') return;

  const dataString = JSON.stringify(crops, null, 2);
  const blob = new Blob([dataString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const today = getTodayLocalDateString();
  link.download = `siembra_respaldo_huerto_${today}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida y parsea un archivo JSON importado por el usuario.
 * Protege contra estructuras corruptas o datos incompletos.
 */
export function parseImportedJSON(jsonString: string): { success: boolean; data?: Crop[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'El archivo JSON no contiene una lista válida de cultivos.' };
    }

    // Validamos que cada elemento tenga al menos id, name y sowingDate
    const validCrops: Crop[] = parsed.map((item: any, index: number) => {
      if (!item.name || !item.sowingDate) {
        throw new Error(`El cultivo #${index + 1} no tiene nombre o fecha de siembra.`);
      }
      return {
        id: item.id || `crop-imported-${Date.now()}-${index}`,
        name: String(item.name),
        variety: item.variety ? String(item.variety) : undefined,
        location: item.location || 'maceta',
        sowingDate: String(item.sowingDate),
        wateringIntervalDays: Math.max(1, Number(item.wateringIntervalDays) || 3),
        lastWateredDate: item.lastWateredDate || item.sowingDate,
        wateringHistory: Array.isArray(item.wateringHistory)
          ? item.wateringHistory
          : (item.lastWateredDate ? [item.lastWateredDate] : []),
        daysToHarvest: Math.max(1, Number(item.daysToHarvest) || 60),
        notes: item.notes ? String(item.notes) : undefined,
        createdAt: Number(item.createdAt) || Date.now(),
      };
    });

    return { success: true, data: validCrops };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar el archivo JSON.' };
  }
}
