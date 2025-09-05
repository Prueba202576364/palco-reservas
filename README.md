# 🏇 Sistema de Gestión de Palcos - Feria Expoequinos 2025

## 📋 Descripción

Sistema web completo para la gestión de reservas y ventas de palcos para la **Exposición Equina Grado B** que se realizará del 13 al 15 de Septiembre de 2025 en Tenjo, Colombia. La aplicación permite a vendedores y administradores gestionar reservas, verificar pagos, y mantener un control completo del estado de los palcos en tiempo real.

## ✨ Características Principales

### 🎯 Gestión de Palcos
- **37 palcos** distribuidos en diferentes secciones (VIP, Laterales, Inferiores)
- **Dos tipos de palcos**: Completos (10 sillas) y por sillas individuales
- **Estados en tiempo real**: Disponible, Reservado, Vendido
- **Vista dual**: Grilla tradicional y Mapa interactivo SVG
- **Conversión dinámica** entre tipos de palco

### 👥 Sistema de Autenticación y Roles
- **Firebase Authentication** integrado
- **3 niveles de acceso**:
  - 👑 **Administrador Principal**: Acceso total
  - ⚡ **Administrador Secundario**: Gestión completa sin algunas funciones críticas
  - 👤 **Vendedor**: Gestión de sus propias ventas

### 💳 Sistema de Pagos
- **Múltiples métodos**: Efectivo, Nequi, Daviplata, Transferencia bancaria
- **Códigos QR** para pagos móviles
- **Verificación de comprobantes** con imágenes
- **Estados de pago**: Pendiente, Verificado, Rechazado

### 📊 Gestión de Datos
- **Sincronización en tiempo real** con Firebase
- **Backup automático** cada minuto
- **Exportación de datos** en formato JSON y CSV
- **Histórico completo** de todas las operaciones
- **Estadísticas detalladas** por vendedor y día

### 📱 Experiencia de Usuario
- **Diseño responsivo** optimizado para móviles
- **Interfaz intuitiva** con animaciones y feedback visual
- **Notificaciones en tiempo real**
- **Filtros avanzados** por estado, día y vendedor

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca principal de UI
- **Vite 7.0.4** - Build tool y servidor de desarrollo
- **CSS3** - Estilos personalizados con gradientes y animaciones
- **SVG** - Mapa interactivo de palcos

### Backend y Servicios
- **Firebase 10.14.1** - Plataforma completa
  - **Authentication** - Autenticación de usuarios
  - **Firestore** - Base de datos NoSQL en tiempo real
  - **Storage** - Almacenamiento de archivos
- **Uploadcare** - Procesamiento de imágenes

### Herramientas de Desarrollo
- **ESLint 9.30.1** - Linting de código
- **TypeScript** - Tipado estático (tipos React)
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
palco-reservas/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   └── QRUploader.jsx  # Gestión de códigos QR
│   ├── services/           # Servicios y lógica de negocio
│   │   ├── firebaseSync.js      # Sincronización con Firebase
│   │   ├── imageService.js      # Procesamiento de imágenes
│   │   ├── imageStorageService.js # Almacenamiento de imágenes
│   │   └── googleSheetsService.js # Exportación a Google Sheets
│   ├── utils/              # Utilidades
│   │   └── exportUtils.js  # Exportación de datos
│   ├── App.jsx             # Componente principal
│   ├── Auth.jsx            # Sistema de autenticación
│   ├── MapaPalcos.jsx      # Mapa interactivo SVG
│   ├── firebaseConfig.js   # Configuración de Firebase
│   └── App.css             # Estilos principales
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── README.md               # Documentación
```

## 🚀 Instalación

### Prerrequisitos
- **Node.js** 18+ 
- **npm** o **yarn**
- **Cuenta de Firebase** con proyecto configurado

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd palco-reservas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication, Firestore y Storage
   - Copiar configuración a `src/firebaseConfig.js`

4. **Configurar variables de entorno** (opcional)
```bash
# Crear archivo .env.local
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Construir para producción**
```bash
npm run build
```

## 📖 Uso

### 🔐 Inicio de Sesión
1. Acceder a la aplicación
2. Ingresar credenciales de Firebase
3. El sistema asignará permisos según el rol configurado

### 🎯 Gestión de Palcos

#### Vista Grilla
- **Ver estado**: Disponible (verde), Reservado (amarillo), Vendido (rojo)
- **Filtrar**: Por estado, día específico o todos los días
- **Reservar**: Click en palco disponible → Llenar formulario

#### Vista Mapa
- **Mapa interactivo** con ubicación real de palcos
- **Hover**: Información detallada del palco
- **Click**: Reservar palco
- **Click derecho/Long press**: Convertir tipo de palco

### 💰 Proceso de Venta

1. **Crear Reserva**
   - Seleccionar palco
   - Llenar datos del cliente
   - Elegir días y cantidad (para palcos por sillas)

2. **Proceso de Pago**
   - Cliente envía comprobante
   - Vendedor verifica pago
   - Confirmar venta

3. **Gestión de Pagos**
   - Verificar comprobantes
   - Aprobar/rechazar pagos
   - Historial de transacciones

### 📊 Estadísticas y Reportes

#### Estadísticas en Tiempo Real
- **Ocupación**: Porcentaje de palcos ocupados
- **Ingresos**: Total de ventas y cancelaciones
- **Por vendedor**: Rendimiento individual
- **Por día**: Distribución de ventas

#### Exportación de Datos
- **JSON**: Backup completo del sistema
- **CSV**: Compatible con Excel/Google Sheets
- **Automática**: Cada 5 minutos

## 🧩 Componentes Principales

### `App.jsx` - Componente Principal
- **Estado global** de la aplicación
- **Gestión de palcos** y reservas
- **Sincronización** con Firebase
- **Sistema de mensajes** y notificaciones

### `Auth.jsx` - Sistema de Autenticación
- **Firebase Authentication** integrado
- **Gestión de roles** y permisos
- **Componentes protegidos** por nivel de acceso
- **Interfaz de login** moderna

### `MapaPalcos.jsx` - Mapa Interactivo
- **SVG responsivo** con 37 palcos
- **Animaciones** y efectos visuales
- **Tooltips informativos**
- **Gestión táctil** para móviles

### `QRUploader.jsx` - Gestión de QR
- **Carga de imágenes** QR
- **Procesamiento** automático
- **Sincronización** con app cliente
- **Validación** de formatos

## 🔌 API/Servicios

### Firebase Services
```javascript
// Autenticación
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Base de datos
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Almacenamiento
import { getStorage, ref, uploadBytes } from 'firebase/storage';
```

### Servicios Personalizados

#### `firebaseSync.js`
- **Sincronización bidireccional** con Firebase
- **Listeners en tiempo real** para cambios
- **Gestión de pagos** pendientes
- **Backup automático** de datos

#### `imageService.js`
- **Procesamiento de imágenes** a Base64
- **Compresión automática** para optimización
- **Validación** de formatos y tamaños
- **Gestión de QR** y comprobantes

#### `googleSheetsService.js`
- **Exportación** a Google Sheets
- **Formato CSV** compatible
- **Actualización** automática de hojas
- **Gestión de credenciales** API

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (http://localhost:5173)

# Producción
npm run build        # Construir para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
```

## ⚙️ Configuración

### Firebase Configuration
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxjJQxbIgQOp7V8ZOzHMEdQiS48sR8fNQ",
  authDomain: "feria-2025.firebaseapp.com",
  projectId: "feria-2025",
  storageBucket: "feria-2025.firebasestorage.app",
  messagingSenderId: "606697537967",
  appId: "1:606697537967:web:55c7b45f15438ff723ef5a",
  measurementId: "G-3XHDSNORZD"
};
```

### Precios Configurados
```javascript
const PRECIO_PALCO_COMPLETO = 1500000; // $1,500,000 COP
const PRECIO_SILLA = {
  viernes: 50000,    // $50,000 COP
  sabado: 80000,     // $80,000 COP
  domingo: 80000     // $80,000 COP
};
```

### Métodos de Pago
- **Efectivo**: Pago directo al vendedor
- **Nequi**: Transferencia móvil con QR
- **Daviplata**: Transferencia móvil con QR
- **Transferencia Bancaria**: Bancolombia

## 🔐 Sistema de Permisos

### Administrador Principal
- ✅ Acceso total al sistema
- ✅ Gestión de usuarios y roles
- ✅ Backup y restauración
- ✅ Conversión de palcos
- ✅ Verificación de pagos

### Administrador Secundario
- ✅ Gestión completa de reservas
- ✅ Verificación de pagos
- ✅ Estadísticas y reportes
- ✅ Exportación de datos
- ❌ Gestión de usuarios

### Vendedor
- ✅ Crear reservas propias
- ✅ Verificar pagos
- ✅ Estadísticas personales
- ✅ Historial propio
- ❌ Gestión de otros vendedores

## 📱 Optimización Móvil

### Características Responsivas
- **Diseño adaptativo** para todos los dispositivos
- **Touch-friendly** con botones grandes
- **Orientación** horizontal y vertical
- **Zoom optimizado** para iOS

### Breakpoints
```css
/* Móvil pequeño */
@media (max-width: 400px)

/* Móvil */
@media (max-width: 768px)

/* Desktop */
@media (min-width: 769px)
```

## 🔄 Sincronización en Tiempo Real

### Firebase Listeners
- **Palcos**: Cambios en estado y reservas
- **Pagos**: Nuevos comprobantes del cliente
- **Configuración**: Actualizaciones de QR y precios
- **Estadísticas**: Cálculos automáticos

### Backup Automático
- **Cada minuto**: Backup en memoria
- **Cada 5 minutos**: Exportación automática
- **Persistencia**: localStorage + Firebase
- **Recuperación**: Restauración desde memoria

## 🚨 Manejo de Errores

### Validaciones
- **Formularios**: Validación en tiempo real
- **Imágenes**: Tamaño y formato
- **Pagos**: Verificación de montos
- **Permisos**: Control de acceso

### Recuperación
- **Offline**: Funcionamiento local
- **Sincronización**: Recuperación automática
- **Backup**: Restauración manual
- **Logs**: Registro de errores

## 🤝 Contribución

### Guías de Contribución

1. **Fork** el repositorio
2. **Crear rama** para nueva funcionalidad
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrollar** siguiendo estándares
4. **Probar** en diferentes dispositivos
5. **Commit** con mensajes descriptivos
6. **Pull Request** con descripción detallada

### Estándares de Código
- **ESLint** configurado
- **Funciones puras** cuando sea posible
- **Componentes funcionales** con hooks
- **Comentarios** en funciones complejas
- **Nombres descriptivos** para variables

### Estructura de Commits
```
feat: nueva funcionalidad de exportación
fix: corrección en validación de pagos
docs: actualización de documentación
style: mejora en diseño responsivo
refactor: optimización de sincronización
test: agregar pruebas unitarias
```

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal**: [Tu Nombre]
- **Cliente**: Feria Expoequinos 2025
- **Ubicación**: Tenjo, Colombia

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: [tu-email@dominio.com]
- **WhatsApp**: [número de contacto]
- **Horario**: Lunes a Viernes 8:00 AM - 6:00 PM

---

## 🎯 Roadmap

### Versión 2.0 (Próximamente)
- [ ] **App móvil nativa** (React Native)
- [ ] **Notificaciones push** para pagos
- [ ] **Integración con WhatsApp** Business
- [ ] **Dashboard analítico** avanzado
- [ ] **Sistema de descuentos** automático
- [ ] **Reportes PDF** personalizados

### Versión 3.0 (Futuro)
- [ ] **Inteligencia artificial** para predicciones
- [ ] **Integración con contabilidad**
- [ ] **Sistema de fidelización**
- [ ] **API pública** para terceros
- [ ] **Multi-idioma** (Español/Inglés)

---

**🏇 ¡Que disfruten la Exposición Equina 2025! 🏇**
