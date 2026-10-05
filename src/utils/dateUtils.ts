/**
 * Utilidades de fecha y cálculos agronómicos para SIEMBRA.
 * 
 * NOTA DE ARQUITECTURA / PUNTOS CRÍTICOS DONDE SUELE HABER ERRORES:
 * 1. ZONA HORARIA: No usar `new Date("YYYY-MM-DD")` directamente porque el estándar ECMAScript
 *    lo interpreta como UTC medianoche. En husos horarios de América Latina o España,
 *    `new Date("2026-10-05").getDate()` puede devolver el día 4 debido al desfase horario.
 * 2. HORARIO DE VERANO (DST): Sumar simplemente `dias * 24 * 60 * 60 * 1000` falla cuando hay cambio
 *    de hora (días de 23 o 25 horas). Usamos `setDate(getDate() + N)`.
 * 3. PORCENTAJE DE COSECHA: Si la siembra es hoy o el ciclo ya venció, se debe acotar entre 0% y 100%
 *    para evitar porcentajes negativos o barras rotas en pantalla.
 */

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

/**
 * Convierte un string "YYYY-MM-DD" en un objeto Date a medianoche en la hora LOCAL del usuario.
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE:
 * Si haces `new Date(dateString)` con un formato ISO corto ("2026-10-05"), JS lo toma en UTC.
 * Al llamar `.toLocaleDateString()` en UTC-3 (Argentina/Chile), mostrará "4 de octubre" en vez del 5.
 */
export function parseLocalDate(dateString: string): Date {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    // Fallback defensivo si el string viniese mal formateado
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // En JavaScript los meses van de 0 (Enero) a 11 (Diciembre)
  const day = parseInt(parts[2], 10);
  
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Devuelve la fecha de hoy en formato "YYYY-MM-DD" en hora local (no UTC).
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE:
 * `new Date().toISOString().split('T')[0]` usa UTC. Si son las 22:00 en Buenos Aires (UTC-3),
 * en UTC ya es mañana, por lo que registraría una siembra o riego con fecha futura errónea.
 */
export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea un objeto Date a string "YYYY-MM-DD" local.
 */
export function formatToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la diferencia exacta en días naturales entre dos fechas (ignora horas/minutos).
 * Retorna (targetDate - fromDate) en días.
 * Si targetDate es posterior a fromDate, el resultado es positivo.
 */
export function getCalendarDaysDiff(fromDateStr: string, targetDateStr: string): number {
  const from = parseLocalDate(fromDateStr);
  const target = parseLocalDate(targetDateStr);
  
  const diffMs = target.getTime() - from.getTime();
  // Math.round protege contra pequeños desajustes de 1 hora por DST
  return Math.round(diffMs / MILLISECONDS_IN_DAY);
}

/**
 * Suma N días a una fecha dada respetando los cambios de mes y año.
 */
export function addDaysToDate(dateStr: string, daysToAdd: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + daysToAdd);
  return formatToLocalDateString(date);
}

/**
 * Formatea una fecha ISO a español legible: ej: "5 de octubre de 2026" o "5 oct 2026".
 */
export function formatSpanishDate(dateStr: string, short = false): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: short ? 'short' : 'long',
    year: 'numeric',
  });
}

/**
 * Formatea fecha solo con día y mes para pantallas móviles compactas: ej: "5 de oct."
 */
export function formatSpanishDayMonth(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Calcula la fecha estimada de cosecha sumando los días estimados a la fecha de siembra.
 */
export function calculateHarvestDate(sowingDateStr: string, daysToHarvest: number): string {
  return addDaysToDate(sowingDateStr, daysToHarvest);
}

/**
 * Información completa del estado de cosecha para un cultivo.
 */
export interface HarvestStatusInfo {
  harvestDateStr: string;
  daysRemaining: number; // >0 faltan días, =0 hoy, <0 retrasada
  daysSinceSowing: number;
  progressPercent: number; // 0 a 100
  statusText: string;
  urgency: 'early' | 'growing' | 'ready_soon' | 'ready_today' | 'overdue';
}

/**
 * Obtiene el diagnóstico del ciclo de cosecha para un cultivo.
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE:
 * Si `daysToHarvest <= 0`, ocurriría una división por cero en `progressPercent`.
 * Si el cultivo ya pasó la fecha, el porcentaje no debe desbordar infinitamente el diseño.
 */
export function getHarvestStatus(sowingDateStr: string, daysToHarvest: number): HarvestStatusInfo {
  const todayStr = getTodayLocalDateString();
  const safeDaysToHarvest = Math.max(1, daysToHarvest);
  
  const harvestDateStr = calculateHarvestDate(sowingDateStr, safeDaysToHarvest);
  const daysSinceSowing = Math.max(0, getCalendarDaysDiff(sowingDateStr, todayStr));
  const daysRemaining = getCalendarDaysDiff(todayStr, harvestDateStr);
  
  // Porcentaje acotado entre 0 y 100 para la barra de progreso
  const rawProgress = (daysSinceSowing / safeDaysToHarvest) * 100;
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawProgress)));
  
  let statusText = '';
  let urgency: HarvestStatusInfo['urgency'] = 'growing';

  if (daysRemaining > 15) {
    statusText = `Faltan ${daysRemaining} días`;
    urgency = progressPercent < 30 ? 'early' : 'growing';
  } else if (daysRemaining > 1) {
    statusText = `Faltan ${daysRemaining} días (próxima)`;
    urgency = 'ready_soon';
  } else if (daysRemaining === 1) {
    statusText = '¡Cosecha estimada mañana!';
    urgency = 'ready_soon';
  } else if (daysRemaining === 0) {
    statusText = '¡Día estimado de cosecha hoy!';
    urgency = 'ready_today';
  } else {
    const overdueDays = Math.abs(daysRemaining);
    statusText = `Lista para cosechar (hace ${overdueDays} día${overdueDays > 1 ? 's' : ''})`;
    urgency = 'overdue';
  }

  return {
    harvestDateStr,
    daysRemaining,
    daysSinceSowing,
    progressPercent,
    statusText,
    urgency,
  };
}

/**
 * Información completa del estado de riego para resolver:
 * "El huerto se riega por costumbre y no por necesidad".
 */
export interface WateringStatusInfo {
  nextWateringDateStr: string;
  daysUntilWatering: number; // <=0 necesita riego, >0 aún retiene humedad
  daysSinceLastWatered: number;
  needsWaterToday: boolean;
  statusBadgeText: string;
  adviceMessage: string;
  urgency: 'water_now' | 'water_overdue' | 'watered_today' | 'soil_moist';
}

/**
 * Calcula si la planta realmente necesita agua hoy o si el sustrato aún está húmedo.
 * PUNTO DONDE ALGUIEN SUELE EQUIVOCARSE:
 * La gente tiende a verificar solo `lastWateredDate !== today` y regar.
 * Pero si la planta tiene un intervalo de 3 días y se regó ayer, NO debe regarse hoy.
 * El exceso de riego asfixia las raíces (pudrición radicular).
 */
export function getWateringStatus(lastWateredDateStr: string, intervalDays: number): WateringStatusInfo {
  const todayStr = getTodayLocalDateString();
  const safeInterval = Math.max(1, intervalDays);
  
  const nextWateringDateStr = addDaysToDate(lastWateredDateStr, safeInterval);
  const daysUntilWatering = getCalendarDaysDiff(todayStr, nextWateringDateStr);
  const daysSinceLastWatered = getCalendarDaysDiff(lastWateredDateStr, todayStr);
  
  const needsWaterToday = daysUntilWatering <= 0;
  
  let statusBadgeText = '';
  let adviceMessage = '';
  let urgency: WateringStatusInfo['urgency'] = 'soil_moist';

  if (daysSinceLastWatered === 0) {
    statusBadgeText = 'Regado hoy';
    adviceMessage = 'Suelo húmedo. No vuelvas a regar hoy: las raíces necesitan respirar.';
    urgency = 'watered_today';
  } else if (daysUntilWatering === 0) {
    statusBadgeText = 'Toca regar hoy';
    adviceMessage = 'Cumplió su ciclo de secado. Comprueba con el dedo a 2 cm antes de regar.';
    urgency = 'water_now';
  } else if (daysUntilWatering < 0) {
    const overdueDays = Math.abs(daysUntilWatering);
    statusBadgeText = `Riego pendiente (+${overdueDays}d)`;
    adviceMessage = `Lleva ${daysSinceLastWatered} días sin agua. Revisa si el sustrato está seco.`;
    urgency = 'water_overdue';
  } else {
    // daysUntilWatering > 0
    statusBadgeText = `Próximo riego en ${daysUntilWatering} día${daysUntilWatering > 1 ? 's' : ''}`;
    adviceMessage = 'No riegues por costumbre. La tierra aún retiene humedad suficiente.';
    urgency = 'soil_moist';
  }

  return {
    nextWateringDateStr,
    daysUntilWatering,
    daysSinceLastWatered,
    needsWaterToday,
    statusBadgeText,
    adviceMessage,
    urgency,
  };
}
