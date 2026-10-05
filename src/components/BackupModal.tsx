/**
 * Modal para gestionar copias de seguridad de las plantas.
 * - Texto nunca menor a 16px.
 * - Alto contraste y sin palabras técnicas.
 * - Etiquetas visibles.
 * - Áreas táctiles >= 48px.
 */

import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, RotateCcw, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Crop } from '../types/garden';
import { exportCropsToJSON, parseImportedJSON, clearAllCropsFromStorage, generateInitialCrops } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: Crop[];
  onUpdateCrops: (newCrops: Crop[]) => void;
  onShowNotification: (message: string, type: 'success' | 'error') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  crops,
  onUpdateCrops,
  onShowNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  // Exportar copia
  const handleExport = () => {
    exportCropsToJSON(crops);
    onShowNotification(`Se descargó la copia con tus ${crops.length} plantas guardadas.`, 'success');
    onClose();
  };

  // Importar copia
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseImportedJSON(content);
      if (result.success && result.data) {
        onUpdateCrops(result.data);
        onShowNotification(`¡Listo! Se recuperaron ${result.data.length} plantas desde tu archivo.`, 'success');
        onClose();
      } else {
        onShowNotification('El archivo que elegiste no contiene una lista de plantas válida.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Borrar todo
  const handleClearAll = () => {
    clearAllCropsFromStorage();
    onUpdateCrops([]);
    setShowConfirmClear(false);
    onShowNotification('Se borraron todas las plantas guardadas en este teléfono.', 'success');
    onClose();
  };

  // Cargar ejemplo
  const handleResetDemo = () => {
    const initial = generateInitialCrops();
    onUpdateCrops(initial);
    setShowConfirmClear(false);
    onShowNotification('Se cargaron 3 plantas familiares de ejemplo para probar la app.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-3">
      <div 
        className="w-full max-w-md bg-stone-900 border-t-2 sm:border-2 border-stone-600 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
      >
        {/* Cabecera */}
        <div className="px-4 py-3.5 border-b border-stone-700 flex items-center justify-between shrink-0 bg-stone-900">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-600 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-xl font-bold text-white">
                Copias y Respaldo
              </h2>
              <p className="text-base text-stone-300 font-medium">
                Guardar o recuperar tus plantas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] rounded-xl bg-stone-800 text-stone-200 hover:text-white flex items-center justify-center border border-stone-700 cursor-pointer"
            aria-label="Cerrar ventana de respaldo"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4 text-base">
          {/* Dónde están los datos explicados sin tecnicismos */}
          <div className="bg-stone-950 border-2 border-stone-700 rounded-2xl p-4 space-y-1.5 leading-relaxed text-stone-200">
            <strong className="text-lg font-bold text-white block">
              💾 ¿Dónde están tus plantas guardadas?
            </strong>
            <p className="text-base text-stone-300 font-medium">
              Están guardadas en la memoria de este navegador. No se pierden al cerrar la ventana ni al apagar el teléfono.
            </p>
          </div>

          {/* Opción 1: Descargar copia de seguridad */}
          <div className="space-y-1.5">
            <label className="block text-base font-bold text-white">
              1. Guardar copia en tu teléfono:
            </label>
            <button
              onClick={handleExport}
              disabled={crops.length === 0}
              className="w-full min-h-[50px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-stone-950 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-md"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Descargar copia de mis plantas</span>
            </button>
            <p className="text-base text-stone-300 font-medium text-center">
              Podrás enviártela por WhatsApp o guardarla en tus archivos.
            </p>
          </div>

          {/* Opción 2: Recuperar desde archivo */}
          <div className="pt-3 border-t border-stone-700 space-y-1.5">
            <label htmlFor="restore-file-input" className="block text-base font-bold text-white">
              2. Recuperar plantas desde una copia anterior:
            </label>
            <input
              id="restore-file-input"
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[50px] px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer border-2 border-stone-600"
            >
              <Upload className="w-5 h-5 text-sky-400 stroke-[2.5]" />
              <span>Elegir archivo de copia anterior</span>
            </button>
          </div>

          {/* Opción 3: Limpiar o reiniciar */}
          <div className="pt-3 border-t border-stone-700 space-y-2.5">
            <label className="block text-base font-bold text-white">
              3. Opciones adicionales:
            </label>

            {!showConfirmClear ? (
              <div className="flex gap-2 flex-col sm:flex-row">
                <button
                  onClick={handleResetDemo}
                  className="flex-1 min-h-[48px] px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Cargar 3 plantas de prueba</span>
                </button>
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="min-h-[48px] px-3 py-2 bg-red-950/40 hover:bg-red-950 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-red-800"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span>Borrar todo</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-red-950 border-2 border-red-500 rounded-2xl space-y-2.5 text-white">
                <strong className="text-base font-bold block">
                  ¿Seguro que deseas borrar todas las plantas?
                </strong>
                <p className="text-base text-stone-200 font-medium">
                  Se vaciará la lista en este teléfono. Puedes descargar una copia antes si deseas conservarlas.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 min-h-[48px] py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-base rounded-xl cursor-pointer"
                  >
                    Sí, borrar todo
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 min-h-[48px] px-3 py-2 bg-stone-800 border border-stone-600 text-white font-bold text-base rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
