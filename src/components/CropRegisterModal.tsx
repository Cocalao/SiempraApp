/**
 * Formulario para registrar o editar un cultivo.
 * Cumple estrictamente con:
 * - 1. Uso desde 320px de ancho con una sola mano.
 * - 2. Contraste para sol y texto nunca menor a 16px.
 * - 3. Todos los campos con etiqueta visible (no solo placeholders).
 * - 4. Un solo botón principal ("Guardar planta").
 * - 6. Mensajes de error en español sin tecnicismos.
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Droplet, Clock, Check } from 'lucide-react';
import { Crop, PlantLocation } from '../types/garden';
import { PRESET_CROPS } from '../utils/storage';
import { 
  getTodayLocalDateString, 
  calculateHarvestDate, 
  formatSpanishDate 
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

  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState<PlantLocation>('maceta');
  const [sowingDate, setSowingDate] = useState(today);
  const [wateringIntervalDays, setWateringIntervalDays] = useState(3);
  const [daysToHarvest, setDaysToHarvest] = useState(60);
  const [lastWateredDate, setLastWateredDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const estimatedHarvestDate = calculateHarvestDate(sowingDate || today, Math.max(1, daysToHarvest));

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
      setErrorMessage('Por favor, escribe el nombre de la planta para poder guardarla.');
      return;
    }

    if (!sowingDate) {
      setErrorMessage('Por favor, elige el día en que sembraste la planta.');
      return;
    }

    const safeInterval = Math.max(1, Number(wateringIntervalDays) || 1);
    const safeHarvestDays = Math.max(1, Number(daysToHarvest) || 1);
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
      wateringHistory: cropToEdit?.wateringHistory || [safeLastWatered],
      notes: notes.trim() || undefined,
      createdAt: cropToEdit ? cropToEdit.createdAt : Date.now(),
    };

    onSaveCrop(newOrUpdatedCrop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-3">
      <div 
        className="w-full max-w-md bg-stone-900 border-t-2 sm:border-2 border-stone-600 rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabecera del formulario */}
        <div className="px-4 py-3.5 border-b border-stone-700 flex items-center justify-between shrink-0 bg-stone-900">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {cropToEdit ? 'Editar planta' : 'Nueva planta'}
            </h2>
            <p className="text-base text-stone-300 font-medium">
              Datos para calcular riego y cosecha
            </p>
          </div>
          {/* Botón secundario para cerrar */}
          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] rounded-xl bg-stone-800 text-stone-200 hover:text-white flex items-center justify-center border border-stone-700 cursor-pointer"
            aria-label="Cerrar formulario"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del formulario con etiquetas visibles */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-base">
          {/* Mensaje de error sin tecnicismos */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950 border-2 border-red-500 rounded-xl text-base font-bold text-white leading-snug">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Plantillas rápidas familiares */}
          {!cropToEdit && (
            <div className="space-y-1.5">
              <label className="block text-base font-bold text-stone-200">
                Elegir sugerencia rápida:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_CROPS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.name)}
                    className={`shrink-0 min-h-[48px] px-3.5 py-2 rounded-xl text-base font-semibold border-2 transition-colors cursor-pointer flex items-center gap-2 ${
                      name === preset.name
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                        : 'bg-stone-800 border-stone-700 text-stone-200 hover:border-stone-500'
                    }`}
                  >
                    <span className="text-lg">{preset.iconName}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campo 1: Nombre de la planta */}
          <div className="space-y-1.5">
            <label htmlFor="crop-name-input" className="block text-base font-bold text-white">
              Nombre de la planta <span className="text-emerald-400">(obligatorio)</span>:
            </label>
            <input
              id="crop-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ejemplo: Tomate Cherry, Albahaca..."
              required
              className="w-full min-h-[48px] px-3.5 bg-stone-950 border-2 border-stone-600 rounded-xl text-white text-base font-medium placeholder-stone-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Campo 2: Dónde está plantada */}
          <div className="space-y-1.5">
            <label htmlFor="crop-location-select" className="block text-base font-bold text-white">
              ¿Dónde está plantada?
            </label>
            <select
              id="crop-location-select"
              value={location}
              onChange={(e) => setLocation(e.target.value as PlantLocation)}
              className="w-full min-h-[48px] px-3.5 bg-stone-950 border-2 border-stone-600 rounded-xl text-white text-base font-medium focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="maceta">🪴 En maceta</option>
              <option value="balcon">🌿 En balcón o jardinera</option>
              <option value="huerto">🌱 En tierra directa de huerto</option>
              <option value="mesa_cultivo">🪵 En mesa de cultivo</option>
            </select>
          </div>

          {/* Campo 3: Detalle o variedad */}
          <div className="space-y-1.5">
            <label htmlFor="crop-variety-input" className="block text-base font-bold text-white">
              Detalle del lugar o variedad (opcional):
            </label>
            <input
              id="crop-variety-input"
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="Ejemplo: Maceta grande de 20 litros"
              className="w-full min-h-[48px] px-3.5 bg-stone-950 border-2 border-stone-600 rounded-xl text-white text-base font-medium placeholder-stone-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Campo 4: Fecha de Siembra */}
          <div className="p-3.5 bg-stone-950 border-2 border-stone-700 rounded-2xl space-y-2">
            <label htmlFor="crop-sowing-date" className="block text-base font-bold text-emerald-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Día en que sembraste o plantaste:</span>
            </label>
            <input
              id="crop-sowing-date"
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              required
              className="w-full min-h-[48px] px-3 bg-stone-900 border-2 border-stone-600 rounded-xl text-white text-base font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
            />
          </div>

          {/* Campo 5 y 6: Riego consciente */}
          <div className="p-3.5 bg-sky-950/40 border-2 border-sky-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-base">
              <Droplet className="w-5 h-5 shrink-0" />
              <span>Necesidad real de riego:</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="crop-interval-slider" className="block text-base font-medium text-stone-200">
                Regar cada <strong className="text-sky-300 text-lg">{wateringIntervalDays} {wateringIntervalDays === 1 ? 'día' : 'días'}</strong>:
              </label>
              <input
                id="crop-interval-slider"
                type="range"
                min="1"
                max="10"
                step="1"
                value={wateringIntervalDays}
                onChange={(e) => setWateringIntervalDays(parseInt(e.target.value, 10))}
                className="w-full h-8 accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-base text-stone-300 font-semibold">
                <span>Diario (1d)</span>
                <span>Frecuente (3d)</span>
                <span>Seco (6d+)</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="crop-last-watered" className="block text-base font-medium text-stone-200">
                ¿Qué día regaste por última vez?
              </label>
              <input
                id="crop-last-watered"
                type="date"
                value={lastWateredDate}
                onChange={(e) => setLastWateredDate(e.target.value)}
                className="w-full min-h-[48px] px-3 bg-stone-900 border-2 border-stone-600 rounded-xl text-white text-base font-bold focus:outline-none focus:border-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Campo 7: Cosecha estimada */}
          <div className="p-3.5 bg-amber-950/40 border-2 border-amber-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
              <Clock className="w-5 h-5 shrink-0" />
              <span>Tiempo total hasta la cosecha:</span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="crop-days-harvest" className="block text-base font-medium text-stone-200">
                Cantidad de días del ciclo completo:
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="crop-days-harvest"
                  type="number"
                  min="5"
                  max="365"
                  value={daysToHarvest}
                  onChange={(e) => setDaysToHarvest(parseInt(e.target.value, 10) || 1)}
                  className="w-28 min-h-[48px] px-3 bg-stone-900 border-2 border-stone-600 rounded-xl text-white text-center text-lg font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="text-base text-stone-300 font-semibold">días en total</span>
              </div>
            </div>

            <div className="p-3 bg-stone-900 border border-stone-700 rounded-xl text-base text-stone-200 leading-snug">
              <span className="text-stone-300 block font-medium">Fecha estimada de cosecha:</span>
              <strong className="text-amber-300 text-lg block mt-0.5">
                📅 {formatSpanishDate(estimatedHarvestDate)}
              </strong>
            </div>
          </div>

          {/* Campo 8: Notas familiares */}
          <div className="space-y-1.5">
            <label htmlFor="crop-notes-textarea" className="block text-base font-bold text-white">
              Consejo o recordatorio familiar (opcional):
            </label>
            <textarea
              id="crop-notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ejemplo: No mojar las hojas, sol por la mañana."
              rows={2}
              className="w-full p-3 bg-stone-950 border-2 border-stone-600 rounded-xl text-white text-base font-medium placeholder-stone-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* UN SOLO BOTÓN PRINCIPAL DE LA PANTALLA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[52px] bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-stone-950 font-extrabold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-transform cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>{cropToEdit ? 'Guardar cambios de la planta' : 'Guardar nueva planta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
