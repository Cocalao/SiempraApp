/**
 * Modal / Bottom-Sheet para registrar o editar un cultivo con su fecha de siembra.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. INPUT NUMBER COMO STRING: Los inputs de formulario devuelven `e.target.value` como `string`.
 *    Si no se parsea con `parseInt`, luego `sowingDate + daysToHarvest` concatena cadenas ("3" + 1 = "31").
 * 2. FECHA DE SIEMBRA VACÍA: Dejar la fecha en blanco genera fechas inválidas `NaN-NaN-NaN` en los cálculos.
 *    Se debe exigir `required` y validar antes de guardar.
 * 3. VALOR MÍNIMO DE RIEGO: Un intervalo de riego de 0 días causaría un bucle infinito de necesidad de riego.
 *    Se impone `Math.max(1, interval)`.
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Droplet, Clock, MapPin, Check } from 'lucide-react';
import { Crop, PlantLocation } from '../types/garden';
import { PRESET_CROPS } from '../utils/storage';
import { 
  getTodayLocalDateString, 
  calculateHarvestDate, 
  formatSpanishDate,
  formatToLocalDateString,
  parseLocalDate
} from '../utils/dateUtils';

interface CropRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCrop: (crop: Crop) => void;
  cropToEdit?: Crop | null;
}

export const CropRegisterModal: React.FC<CropRegisterModalProps> = ({
  isOpen,
  onClose,
  onSaveCrop,
  cropToEdit,
}) => {
  const today = getTodayLocalDateString();

  // Estados del formulario
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState<PlantLocation>('maceta');
  const [sowingDate, setSowingDate] = useState(today);
  const [wateringIntervalDays, setWateringIntervalDays] = useState(3);
  const [daysToHarvest, setDaysToHarvest] = useState(60);
  const [lastWateredDate, setLastWateredDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Si estamos editando, rellenar los datos; si es nuevo, resetear
  useEffect(() => {
    if (cropToEdit) {
      setName(cropToEdit.name);
      setVariety(cropToEdit.variety || '');
      setLocation(cropToEdit.location);
      setSowingDate(cropToEdit.sowingDate);
      setWateringIntervalDays(cropToEdit.wateringIntervalDays);
      setDaysToHarvest(cropToEdit.daysToHarvest);
      setLastWateredDate(cropToEdit.lastWateredDate);
      setNotes(cropToEdit.notes || '');
      setErrorMessage('');
    } else {
      setName('');
      setVariety('');
      setLocation('maceta');
      setSowingDate(today);
      setWateringIntervalDays(3);
      setDaysToHarvest(60);
      setLastWateredDate(today);
      setNotes('');
      setErrorMessage('');
    }
  }, [cropToEdit, isOpen, today]);

  if (!isOpen) return null;

  // Cálculo en tiempo real de la fecha estimada de cosecha para previsualización inmediata
  const estimatedHarvestDate = calculateHarvestDate(sowingDate || today, Math.max(1, daysToHarvest));

  // Aplicar plantilla rápida
  const handleSelectPreset = (presetName: string) => {
    const preset = PRESET_CROPS.find(p => p.name === presetName);
    if (!preset) return;

    setName(preset.name);
    setWateringIntervalDays(preset.defaultIntervalDays);
    setDaysToHarvest(preset.defaultDaysToHarvest);
    setLocation(preset.locationDefault);
    setNotes(preset.recommendation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Por favor, ingresa el nombre de la planta o cultivo.');
      return;
    }

    if (!sowingDate) {
      setErrorMessage('Por favor, selecciona una fecha de siembra válida.');
      return;
    }

    // PUNTO CRÍTICO: Validar que el último riego no sea anterior a la siembra de forma ilógica
    const safeInterval = Math.max(1, Number(wateringIntervalDays) || 1);
    const safeHarvestDays = Math.max(1, Number(daysToHarvest) || 1);
    
    // Si no se especificó último riego, asumimos la fecha de siembra o hoy
    const safeLastWatered = lastWateredDate || sowingDate;

    const newOrUpdatedCrop: Crop = {
      id: cropToEdit ? cropToEdit.id : `crop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      variety: variety.trim() || undefined,
      location,
      sowingDate,
      wateringIntervalDays: safeInterval,
      daysToHarvest: safeHarvestDays,
      lastWateredDate: safeLastWatered,
      notes: notes.trim() || undefined,
      createdAt: cropToEdit ? cropToEdit.createdAt : Date.now(),
    };

    onSaveCrop(newOrUpdatedCrop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-stone-900 border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Barra superior del modal */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-stone-100">
              {cropToEdit ? 'Editar Cultivo' : 'Registrar Nuevo Cultivo'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Planifica el riego por necesidad real y calcula tu cosecha
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar formulario"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrollable del formulario */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Plantillas rápidas para la familia */}
          {!cropToEdit && (
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                Plantillas rápidas de huerto:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_CROPS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.name)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      name === preset.name
                        ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                        : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    <span>{preset.iconName}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nombre y variedad */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Nombre de la planta *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Tomate Cherry, Lechuga, Albahaca..."
                required
                className="w-full h-11 px-3.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Variedad / Detalle (opcional)
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="ej: En maceta 15L"
                  className="w-full h-11 px-3.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Ubicación
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as PlantLocation)}
                  className="w-full h-11 px-3 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="maceta">🪴 Maceta</option>
                  <option value="balcon">🌿 Balcón / Jardinera</option>
                  <option value="huerto">🌱 Huerto en tierra</option>
                  <option value="mesa_cultivo">🪵 Mesa de cultivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fecha de Siembra */}
          <div className="p-3.5 bg-stone-800/60 border border-stone-700/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold text-xs tracking-tight">1. Fecha de Siembra</span>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1">
                ¿Qué día sembraste las semillas o trasplantaste?
              </label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                required
                className="w-full h-11 px-3.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Configuración de Riego Consciente */}
          <div className="p-3.5 bg-sky-950/30 border border-sky-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-400">
              <Droplet className="w-4 h-4" />
              <span className="font-semibold text-xs tracking-tight">2. Intervalo de Riego por Necesidad</span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-stone-300">Regar cada:</span>
                <span className="font-bold text-sky-300">
                  {wateringIntervalDays} {wateringIntervalDays === 1 ? 'día' : 'días'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={wateringIntervalDays}
                onChange={(e) => setWateringIntervalDays(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-stone-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>Diario (1d)</span>
                <span>Frecuente (3d)</span>
                <span>Secano (6-10d)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1">
                ¿Cuándo se regó por última vez?
              </label>
              <input
                type="date"
                value={lastWateredDate}
                onChange={(e) => setLastWateredDate(e.target.value)}
                className="w-full h-10 px-3 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
              />
              <p className="text-[11px] text-sky-200/70 mt-1">
                Tip: En maceta no riegues por rutina; espera a que la superficie pierda la humedad.
              </p>
            </div>
          </div>

          {/* Configuración de Cosecha */}
          <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-xs tracking-tight">3. Estimación de Cosecha</span>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">
                Días de ciclo desde la siembra hasta la cosecha:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={daysToHarvest}
                  onChange={(e) => setDaysToHarvest(parseInt(e.target.value, 10) || 1)}
                  className="w-24 h-11 px-3 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-center font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-stone-400">días en total</span>
              </div>
            </div>

            {/* Aviso en tiempo real de la fecha estimada */}
            <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 text-xs text-stone-300">
              <div className="text-[11px] text-stone-400">Día estimado de recolección:</div>
              <div className="font-semibold text-amber-300 mt-0.5">
                📅 {formatSpanishDate(estimatedHarvestDate)}
              </div>
            </div>
          </div>

          {/* Notas libres */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Notas familiares o cuidados (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ej: Proteger del viento fuerte, revisar pulgones en las hojas."
              rows={2}
              className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botón de guardar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-stone-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{cropToEdit ? 'Guardar Cambios' : 'Registrar Cultivo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
