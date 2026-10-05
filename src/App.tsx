/**
 * Aplicación SIEMBRA - Huerto y Riego Consciente.
 * 
 * Cumple con los 6 requisitos de accesibilidad y experiencia de usuario:
 * 1. Funciona desde 320px de ancho, con una mano y sin hacer zoom.
 * 2. Contraste alto para leer al sol; texto nunca menor a 16px.
 * 3. Todos los campos con etiqueta visible.
 * 4. Un solo botón principal por pantalla; los demás, secundarios.
 * 5. Estado vacío claro que invita a la primera acción.
 * 6. Mensajes de éxito y error visibles, en español, sin palabras técnicas.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CropCard } from './components/CropCard';
import { CropRegisterModal } from './components/CropRegisterModal';
import { WateringCalendar } from './components/WateringCalendar';
import { HarvestAvisos } from './components/HarvestAvisos';
import { WateringStats } from './components/WateringStats';
import { BackupModal } from './components/BackupModal';
import { Crop, TabType } from './types/garden';
import { loadCropsFromStorage, saveCropsToStorage } from './utils/storage';
import { getTodayLocalDateString, getWateringStatus, getHarvestStatus } from './utils/dateUtils';
import { Sprout, Plus, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [crops, setCrops] = useState<Crop[]>(() => loadCropsFromStorage());
  const [currentTab, setCurrentTab] = useState<TabType>('cultivos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cropToEdit, setCropToEdit] = useState<Crop | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Auto-ocultar notificación después de 4 segundos
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification]);

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    saveCropsToStorage(crops);
  }, [crops]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const needsWaterCount = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return status.needsWaterToday;
  }).length;

  const readyHarvestCount = crops.filter(c => {
    const status = getHarvestStatus(c.sowingDate, c.daysToHarvest);
    return status.urgency === 'ready_today' || status.urgency === 'overdue';
  }).length;

  // Guardar cultivo (nuevo o editado)
  const handleSaveCrop = (newCrop: Crop) => {
    const isEdit = crops.some(c => c.id === newCrop.id);
    setCrops(prevCrops => {
      if (isEdit) {
        return prevCrops.map(c => {
          if (c.id === newCrop.id) {
            return {
              ...newCrop,
              wateringHistory: c.wateringHistory || [newCrop.lastWateredDate],
            };
          }
          return c;
        });
      }
      return [
        {
          ...newCrop,
          wateringHistory: newCrop.wateringHistory || [newCrop.lastWateredDate],
        },
        ...prevCrops,
      ];
    });

    setCropToEdit(null);
    showNotification(
      isEdit 
        ? `✅ Cambios de "${newCrop.name}" guardados correctamente.` 
        : `✅ Planta "${newCrop.name}" guardada. Ya puedes ver cuándo regarla.`,
      'success'
    );
  };

  // Marcar regado hoy
  const handleWaterToday = (cropId: string) => {
    const today = getTodayLocalDateString();
    const cropTarget = crops.find(c => c.id === cropId);

    setCrops(prevCrops =>
      prevCrops.map(c => {
        if (c.id === cropId) {
          const currentHistory = c.wateringHistory || [c.lastWateredDate];
          const updatedHistory = currentHistory.includes(today)
            ? currentHistory
            : [...currentHistory, today];

          return {
            ...c,
            lastWateredDate: today,
            wateringHistory: updatedHistory,
          };
        }
        return c;
      })
    );

    showNotification(
      `💧 Riego anotado para "${cropTarget?.name || 'la planta'}". Tierra con agua suficiente por hoy.`,
      'success'
    );
  };

  // Editar cultivo
  const handleEditCrop = (crop: Crop) => {
    setCropToEdit(crop);
    setIsModalOpen(true);
  };

  // Eliminar cultivo
  const handleDeleteCrop = (cropId: string) => {
    const cropTarget = crops.find(c => c.id === cropId);
    setCrops(prevCrops => prevCrops.filter(c => c.id !== cropId));
    showNotification(
      `🗑️ Se eliminó "${cropTarget?.name || 'la planta'}" de tu huerto.`,
      'success'
    );
  };

  const handleOpenNewCropModal = () => {
    setCropToEdit(null);
    setIsModalOpen(true);
  };

  const filteredCrops = crops.filter(crop => {
    if (filterLocation === 'all') return true;
    return crop.location === filterLocation;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex justify-center text-base">
      {/* Contenedor adaptado desde 320px de ancho */}
      <div className="w-full max-w-md min-h-screen bg-stone-950 flex flex-col relative border-x border-stone-800 shadow-2xl">
        {/* Barra superior */}
        <Header 
          cropCount={crops.length} 
          onOpenRegister={handleOpenNewCropModal}
          onOpenBackup={() => setIsBackupModalOpen(true)}
        />

        {/* Notificación visible de éxito o error en español sin tecnicismos */}
        {notification && (
          <div 
            role="alert"
            className={`sticky top-[60px] z-30 mx-3 mt-2 p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-xl transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-400 text-white font-bold'
                : 'bg-red-950 border-red-500 text-white font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-emerald-300 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-300 shrink-0" />
              )}
              <span className="text-base leading-tight font-bold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="min-h-[44px] min-w-[44px] rounded-lg text-white hover:text-stone-300 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Contenido principal según la pestaña activa */}
        <main className="flex-1 p-3 overflow-y-auto">
          {/* PESTAÑA 1: PLANTAS (Registro y listado) */}
          {currentTab === 'cultivos' && (
            <div className="space-y-4 pb-24">
              {/* Tarjeta de resumen con UN SOLO BOTÓN PRINCIPAL en la pantalla */}
              <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-4 space-y-3 shadow-md">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Tus Plantas y Macetas
                  </h2>
                  <p className="text-base text-stone-300 font-medium mt-1">
                    {needsWaterCount > 0 ? (
                      <span className="text-amber-300 font-bold block">
                        💧 Hay {needsWaterCount} {needsWaterCount === 1 ? 'planta que necesita agua hoy' : 'plantas que necesitan agua hoy'}.
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold block">
                        ✨ Toda la tierra con humedad adecuada.
                      </span>
                    )}
                  </p>
                </div>

                {/* ÚNICO BOTÓN PRINCIPAL DE ESTA PANTALLA */}
                <button
                  onClick={handleOpenNewCropModal}
                  className="w-full min-h-[52px] px-4 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-stone-950 font-extrabold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-transform cursor-pointer"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                  <span>Registrar nuevo cultivo</span>
                </button>
              </div>

              {/* Filtros secundarios de ubicación (botones secundarios de estilo contorno) */}
              {crops.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-base font-bold text-stone-300 px-1">
                    Filtrar por ubicación:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-base">
                    <button
                      onClick={() => setFilterLocation('all')}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer shrink-0 border-2 ${
                        filterLocation === 'all'
                          ? 'bg-stone-800 border-emerald-400 text-white'
                          : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      Todas ({crops.length})
                    </button>
                    <button
                      onClick={() => setFilterLocation('maceta')}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer shrink-0 border-2 ${
                        filterLocation === 'maceta'
                          ? 'bg-stone-800 border-emerald-400 text-white'
                          : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      🪴 Macetas
                    </button>
                    <button
                      onClick={() => setFilterLocation('balcon')}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer shrink-0 border-2 ${
                        filterLocation === 'balcon'
                          ? 'bg-stone-800 border-emerald-400 text-white'
                          : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      🌿 Balcón
                    </button>
                    <button
                      onClick={() => setFilterLocation('huerto')}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer shrink-0 border-2 ${
                        filterLocation === 'huerto'
                          ? 'bg-stone-800 border-emerald-400 text-white'
                          : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      🌱 Huerto
                    </button>
                  </div>
                </div>
              )}

              {/* ESTADO VACÍO: cuando todavía no hay ningún dato */}
              {crops.length === 0 ? (
                <div className="bg-stone-900 border-2 border-dashed border-stone-700 rounded-3xl p-6 text-center space-y-4 my-2">
                  <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Sprout className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white">
                      Tu huerto todavía está esperando sus primeras semillas
                    </h3>
                    <p className="text-base text-stone-300 leading-relaxed font-medium">
                      Toca el botón verde de arriba para registrar tu primer cultivo. Así evitarás regar por costumbre y sabrás exactamente cuándo recolectar tu cosecha.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCrops.map(crop => (
                    <CropCard
                      key={crop.id}
                      crop={crop}
                      onWaterToday={handleWaterToday}
                      onEdit={handleEditCrop}
                      onDelete={handleDeleteCrop}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: CALENDARIO DE RIEGO */}
          {currentTab === 'riego' && (
            <WateringCalendar
              crops={crops}
              onWaterToday={handleWaterToday}
              onOpenRegister={handleOpenNewCropModal}
            />
          )}

          {/* PESTAÑA 3: AVISO DE COSECHA */}
          {currentTab === 'cosecha' && (
            <HarvestAvisos
              crops={crops}
              onOpenRegister={handleOpenNewCropModal}
            />
          )}

          {/* PESTAÑA 4: ESTADÍSTICAS */}
          {currentTab === 'estadisticas' && (
            <WateringStats 
              crops={crops} 
              onOpenRegister={handleOpenNewCropModal}
            />
          )}
        </main>

        {/* Modal de Registro y Edición */}
        <CropRegisterModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCropToEdit(null);
          }}
          onSaveCrop={handleSaveCrop}
          cropToEdit={cropToEdit}
        />

        {/* Modal de Respaldo */}
        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          crops={crops}
          onUpdateCrops={(newCrops) => setCrops(newCrops)}
          onShowNotification={showNotification}
        />

        {/* Barra de Navegación Inferior Fija para Móvil */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          needsWaterCount={needsWaterCount}
          readyHarvestCount={readyHarvestCount}
        />
      </div>
    </div>
  );
}
