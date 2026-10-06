# 🌱 SIEMBRA — Huerto y Riego Consciente

Aplicación web móvil para familias con huerto urbano o macetas en el hogar.

> **Problema que resuelve:**  
> *"El huerto se suele regar por costumbre y no por necesidad."*  
> En macetas y jardines domésticos, la gran mayoría de las plantas no mueren por falta de agua, sino por asfixia y pudrición de raíz debido a la rutina de regar a diario sin comprobar la humedad real del sustrato.

---

## 📋 Funcionalidades Principales

### 1. Registro de Cultivo con Fecha de Siembra
* Registro de plantas con nombre, variedad o tamaño de maceta y ubicación (`🪴 Maceta`, `🌿 Balcón`, `🌱 Huerto en tierra`, `🪵 Mesa de cultivo`).
* Fecha exacta de siembra o trasplante para calcular el ciclo biológico.
* Intervalo de riego personalizado en días según la necesidad real de la especie (con plantillas familiares: Tomate Cherry, Albahaca, Lechuga, Pimiento, Romero, Zanahoria).
* Cálculo en tiempo real de la fecha estimada de cosecha al momento de cargar los datos.

### 2. Calendario de Riego por Necesidad
* **Diagnóstico de hoy:** Separa claramente las plantas que necesitan agua hoy de aquellas que deben descansar porque su sustrato aún retiene humedad.
* **Regla de oro de los 2 cm (Test del dedo):** Guía visual rápida para tocar la tierra antes de regar (dedo seco vs. dedo con tierra húmeda vs. encharcamiento).
* **Botón táctil de un toque:** Registro inmediato del riego del día (`Marcar regado hoy`), actualizando el contador y la fecha del próximo riego.
* **Calendario semanal deslizable:** Selector interactivo de los 7 días de la semana adaptado para uso con el pulgar en celulares.

### 3. Aviso del Día Estimado de Cosecha
* Cálculo automático sumando los días de ciclo a la fecha de siembra sin desfasajes de zona horaria.
* Barra de progreso del ciclo biológico con porcentaje completado.
* Contador regresivo en días naturales (*"Faltan X días"*, *"¡Cosecha estimada hoy!"*, *"Lista para cosechar hace X días"*).
* Alerta destacada para no dejar pasar el punto óptimo de cosecha y evitar que las hojas amarguen o los frutos caigan.

### 4. Estadísticas Semanales con Gráfico de Barras (`recharts`)
* Gráfico de barras que compara la **frecuencia de riego programada** (veces por semana necesarias) frente a la **frecuencia real** (veces que la familia efectivamente regó en los últimos 7 días).
* **Alerta de Riego por Costumbre:** Identifica qué plantas están recibiendo agua de más para corregir el hábito antes de que se dañen las raíces.

### 5. Respaldo de Datos y Privacidad
* **Sin login y sin servidores:** Todos los datos se guardan de forma privada en el `localStorage` del navegador del dispositivo.
* **Exportación e importación en archivo (.json):** Botón para descargar una copia de seguridad y guardarla en el teléfono, enviarla por WhatsApp o restaurarla en otro dispositivo.

---

## 📱 Diseño y Accesibilidad Móvil

La interfaz está construida siguiendo normas estrictas de usabilidad en exteriores y pantallas reducidas:
* **Uso desde 320 px de ancho:** Funciona con una sola mano sin desplazamiento horizontal roto ni necesidad de hacer zoom.
* **Contraste apto para luz solar:** Paleta oscura de alto contraste con textos en blanco puro y acentos de color con ratio superior a 14:1 (superando WCAG AAA).
* **Texto nunca menor a 16 px:** Todas las etiquetas, botones, notas y números respetan el tamaño mínimo de 16 px para lectura clara al aire libre.
* **Un solo botón principal por pantalla:** Botón verde destacado para la acción principal; todas las demás acciones son botones secundarios de contorno.
* **Estados vacíos acogedores:** Mensajes claros que invitan a la primera acción cuando todavía no hay plantas registradas.
* **Mensajes en español sin tecnicismos:** Notificaciones claras ante cualquier acción (guardar, regar, borrar, respaldar).

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Empaquetador y Servidor Dev:** [Vite](https://vitejs.dev/)
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Gráficos:** [Recharts](https://recharts.org/)
* **Iconografía:** [Lucide React](https://lucide.dev/)
* **Almacenamiento:** API Web nativa (`localStorage` + `Blob` para descarga de archivos JSON)

---

## 📂 Estructura del Código

```text
├── index.html                   # Entrada HTML con fuentes y meta viewport móvil
├── metadata.json                # Configuración de metadatos de la aplicación
├── package.json                 # Dependencias del proyecto
├── src/
│   ├── App.tsx                  # Componente principal, enrutador de pestañas y notificaciones
│   ├── index.css                # Estilos globales y regla base de 16px mínima
│   ├── main.tsx                 # Entrada de montaje de React
│   ├── components/
│   │   ├── BackupModal.tsx      # Modal para descargar y restaurar copias de seguridad (.json)
│   │   ├── BottomNav.tsx        # Barra de navegación fija con 4 pestañas accesibles
│   │   ├── CropCard.tsx         # Tarjeta individual con estado de riego y cosecha
│   │   ├── CropRegisterModal.tsx# Formulario de alta y edición con etiquetas visibles
│   │   ├── HarvestAvisos.tsx    # Avisos de cosecha estimada y barras de progreso
│   │   ├── Header.tsx           # Barra superior con accesos a respaldo y nueva planta
│   │   ├── WateringCalendar.tsx # Calendario semanal y prueba del dedo (2 cm)
│   │   └── WateringStats.tsx    # Gráfico de barras comparativo con Recharts
│   ├── types/
│   │   └── garden.ts            # Tipos de datos (Crop, PlantLocation, TabType, etc.)
│   └── utils/
│       ├── dateUtils.ts         # Funciones de fechas seguras sin desfasaje UTC
│       └── storage.ts           # Lectura, guardado, exportación e importación local
```

---

## ⚠️ Puntos Críticos y Buenas Prácticas Implementadas

1. **Manejo de fechas sin desfasajes UTC:**
   * En JavaScript, `new Date("YYYY-MM-DD")` se procesa como UTC medianoche, lo que en husos horarios de América Latina o España resta un día al mostrar la fecha local.
   * `src/utils/dateUtils.ts` utiliza `parseLocalDate()` separando año, mes y día para construir fechas exactas a medianoche local.
2. **Protección contra modo incógnito y cuota llena:**
   * Todo acceso a `localStorage` está envuelto en bloques `try/catch` para evitar bloqueos en navegadores móviles estrictos.
3. **Contenedor con altura fija para Recharts:**
   * En celulares, `ResponsiveContainer` requiere un elemento contenedor con altura fija (`h-80` / `320px`) para evitar colapsar a 0 px de alto.

---

## 🚀 Instalación y Ejecución Local

1. Clonar o descargar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador (por defecto en `http://localhost:3000` o el puerto asignado).
5. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **Apache-2.0**.
