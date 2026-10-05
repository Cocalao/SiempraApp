/**
 * Aplicación SIEMBRA - Huerto y Riego Consciente.
 * 
 * PROBLEMA QUE RESUELVE:
 * "El huerto se riega por costumbre y no por necesidad."
 * 
 * TRES FUNCIONES IMPLEMENTADAS:
 * 1. Registrar cultivo con fecha de siembra.
 * 2. Calendario de riego por cultivo (calcula necesidad real vs costumbre).
 * 3. Aviso del día estimado de cosecha.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. PERDIDA DE ESTADO LOCAL: Guardar en `localStorage` inmediatamente después de cada
 *    cambio de estado (inmutabilidad en React para evitar condiciones de carrera).
 * 2. HORAS Y FECHAS EN 'REGAR HOY': Usar `getTodayLocalDateString()` para registrar
 *    la fecha en formato exacto "YYYY-MM-DD" local y evitar que desfases UTC guarden
 *    el día de ayer o mañana.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CropCard } from './components/CropCard';
import { CropRegisterModal } from './components/CropRegisterModal';
import { WateringCalendar } from './components/WateringCalendar';
import { HarvestAvisos } from './components/HarvestAvisos';
import { Crop, TabType } from './types/garden';
import { loadCropsFromStorage, saveCropsToStorage } from './utils/storage';
import { getTodayLocalDateString, getWateringStatus, getHarvestStatus } from './utils/dateUtils';
import { Sprout, Plus, Droplets, Sparkles, Filter } from 'lucide-react';

export default function App() {
  // 1. Estado de cultivos cargados de localStorage
  const [crops, setCrops] = useState<Crop[]>(() => loadCropsFromStorage());
  
  // 2. Navegación activa: 'cultivos' | 'riego' | 'cosecha'
  const [currentTab, setCurrentTab] = useState<TabType>('cultivos');

  // 3. Control del modal de registro / edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cropToEdit, setCropToEdit] = useState<Crop | null>(null);

  // 4. Filtro opcional en la lista de cultivos
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Sincronización automática con localStorage ante cualquier mutación
  useEffect(() => {
    saveCropsToStorage(crops);
  }, [crops]);

  // Contadores para insignias de la barra de navegación
  const needsWaterCount = crops.filter(c => {
    const status = getWateringStatus(c.lastWateredDate, c.wateringIntervalDays);
    return status.needsWaterToday;
  }).length;

  const readyHarvestCount = crops.filter(c => {
    const status = getHarvestStatus(c.sowingDate, c.daysToHarvest);
    return status.urgency === 'ready_today' || status.urgency === 'overdue';
  }).length;

  // Handler: Guardar o actualizar cultivo
  const handleSaveCrop = (newCrop: Crop) => {
    setCrops(prevCrops => {
      const exists = prevCrops.some(c => c.id === newCrop.id);
      if (exists) {
        return prevCrops.map(c => (c.id === newCrop.id ? newCrop : c));
      }
      return [newCrop, ...prevCrops];
    });
    setCropToEdit(null);
  };

  // Handler: Registrar riego de hoy con 1 toque
  // PUNTO CRÍTICO: Se usa getTodayLocalDateString() para evitar desfase de zona horaria UTC
  const handleWaterToday = (cropId: string) => {
    const today = getTodayLocalDateString();
    setCrops(prevCrops =>
      prevCrops.map(c => {
        if (c.id === cropId) {
          return {
            ...c,
            lastWateredDate: today,
          };
        }
        return c;
      })
    );
  };

  // Handler: Editar cultivo existente
  const handleEditCrop = (crop: Crop) => {
    setCropToEdit(crop);
    setIsModalOpen(true);
  };

  // Handler: Eliminar cultivo
  const handleDeleteCrop = (cropId: string) => {
    setCrops(prevCrops => prevCrops.filter(c => c.id !== cropId));
  };

  // Handler: Abrir modal para nuevo cultivo
  const handleOpenNewCropModal = () => {
    setCropToEdit(null);
    setIsModalOpen(true);
  };

  // Filtrado de cultivos
  const filteredCrops = crops.filter(crop => {
    if (filterLocation === 'all') return true;
    return crop.location === filterLocation;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex justify-center">
      {/* Contenedor con ancho de celular móvil (max-w-md) */}
      <div className="w-full max-w-md min-h-screen bg-stone-950 flex flex-col relative border-x border-stone-800/40 shadow-2xl">
        {/* Barra superior */}
        <Header 
          cropCount={crops.length} 
          onOpenRegister={handleOpenNewCropModal} 
        />

        {/* Contenido principal según la pestaña activa */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* PESTAÑA 1: MIS CULTIVOS (Registro y listado) */}
          {currentTab === 'cultivos' && (
            <div className="space-y-4 pb-20">
              {/* Resumen superior rápido */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-100">
                    Huerto Familiar
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {needsWaterCount > 0 ? (
                      <span className="text-amber-400 font-medium">
                        💧 {needsWaterCount} {needsWaterCount === 1 ? 'cultivo necesita agua hoy' : 'cultivos necesitan agua hoy'}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        ✨ Toda la tierra con humedad adecuada
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={handleOpenNewCropModal}
                  className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Sembrar</span>
                </button>
              </div>

              {/* Filtros de ubicación: Maceta, Balcón, Huerto */}
              {crops.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <button
                    onClick={() => setFilterLocation('all')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
                      filterLocation === 'all'
                        ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                        : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Todos ({crops.length})
                  </button>
                  <button
                    onClick={() => setFilterLocation('maceta')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
                      filterLocation === 'maceta'
                        ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                        : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🪴 Macetas
                  </button>
                  <button
                    onClick={() => setFilterLocation('balcon')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
                      filterLocation === 'balcon'
                        ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                        : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🌿 Balcón
                  </button>
                  <button
                    onClick={() => setFilterLocation('huerto')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
                      filterLocation === 'huerto'
                        ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                        : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🌱 Huerto
                  </button>
                </div>
              )}

              {/* Listado de cultivos */}
              {crops.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-3 mt-4">
                  <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-stone-200">
                    Aún no hay cultivos sembrados
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                    Registra tu primera planta o maceta con su fecha de siembra para que SIEMBRA calcule cuándo necesita riego y cuándo cosecharás.
                  </p>
                  <button
                    onClick={handleOpenNewCropModal}
                    className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 mt-2 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Registrar primer cultivo</span>
                  </button>
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

          {/* PESTAÑA 2: CALENDARIO DE RIEGO POR CULTIVO */}
          {currentTab === 'riego' && (
            <WateringCalendar
              crops={crops}
              onWaterToday={handleWaterToday}
            />
          )}

          {/* PESTAÑA 3: AVISO DEL DÍA ESTIMADO DE COSECHA */}
          {currentTab === 'cosecha' && (
            <HarvestAvisos
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
