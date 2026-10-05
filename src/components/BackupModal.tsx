/**
 * Modal para gestionar el respaldo de datos en SIEMBRA:
 * - Exportar a archivo JSON
 * - Importar desde archivo JSON
 * - Borrar datos locales
 * - Restablecer datos de ejemplo
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
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  crops,
  onUpdateCrops,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  // 1. Exportar datos a archivo JSON
  const handleExport = () => {
    exportCropsToJSON(crops);
    setFeedbackMessage({
      text: `Se descargó el archivo con ${crops.length} cultivos guardados.`,
      type: 'success',
    });
  };

  // 2. Importar datos desde archivo JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseImportedJSON(content);
      if (result.success && result.data) {
        onUpdateCrops(result.data);
        setFeedbackMessage({
          text: `¡Éxito! Se restauraron ${result.data.length} cultivos del archivo.`,
          type: 'success',
        });
      } else {
        setFeedbackMessage({
          text: result.error || 'No se pudo leer el archivo de respaldo.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    // Limpiamos el valor para poder seleccionar el mismo archivo de nuevo si se desea
    e.target.value = '';
  };

  // 3. Borrar datos
  const handleClearAll = () => {
    clearAllCropsFromStorage();
    onUpdateCrops([]);
    setShowConfirmClear(false);
    setFeedbackMessage({
      text: 'Se han borrado todos los datos del huerto en este dispositivo.',
      type: 'success',
    });
  };

  // 4. Restablecer datos de ejemplo
  const handleResetDemo = () => {
    const initial = generateInitialCrops();
    onUpdateCrops(initial);
    setShowConfirmClear(false);
    setFeedbackMessage({
      text: 'Se cargaron los 3 cultivos de ejemplo familiares.',
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-stone-900 border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
      >
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-800 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-base font-bold text-stone-100">
                Respaldo de Datos
              </h2>
              <p className="text-xs text-stone-400">
                Guardado seguro en tu navegador y copias en archivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal de respaldo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Mensaje de feedback */}
          {feedbackMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                : 'bg-red-950/60 border-red-800/80 text-red-200'
            }`}>
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Dónde se guardan los datos */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3.5 space-y-1.5 leading-relaxed text-stone-300">
            <p className="font-semibold text-stone-200">
              💾 ¿Dónde están tus datos ahora mismo?
            </p>
            <p className="text-[11px] text-stone-400">
              Quedan almacenados en el <strong>localStorage</strong> de tu navegador en este dispositivo. Permanecen guardados aunque cierres la pestaña o apagues el celular.
            </p>
          </div>

          {/* Botón 1: Exportar a archivo JSON */}
          <div className="space-y-1.5">
            <button
              onClick={handleExport}
              disabled={crops.length === 0}
              className="w-full min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar copia de seguridad (.json)</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center">
              Guarda el archivo en tu teléfono, envíatelo por WhatsApp o súbelo a Google Drive.
            </p>
          </div>

          {/* Botón 2: Importar desde archivo JSON */}
          <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
            <input
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Restaurar desde archivo de respaldo (.json)</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center">
              Ideal si cambiaste de celular o borraste el historial del navegador.
            </p>
          </div>

          {/* Acciones de gestión y borrado */}
          <div className="pt-3 border-t border-stone-800/80 space-y-2">
            {!showConfirmClear ? (
              <div className="flex gap-2">
                <button
                  onClick={handleResetDemo}
                  className="flex-1 min-h-[40px] px-3 py-2 bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cargar datos demo</span>
                </button>
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="min-h-[40px] px-3 py-2 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-900/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar todo</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl space-y-2 text-red-200">
                <p className="font-bold">¿Borrar todos los cultivos guardados?</p>
                <p className="text-[11px] text-red-300">
                  Esta acción vacía el almacenamiento local de este navegador.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Sí, borrar todo
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 cursor-pointer"
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
