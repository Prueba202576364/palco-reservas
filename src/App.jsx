import { useState, useEffect, useRef } from 'react';
// 🆕 ARCHIVO CSS ÚNICO Y DEFINITIVO - REEMPLAZA TODOS LOS DEMÁS
import './styles/ipad-pro-scroll-fix.css';
// 🆕 MODAL DE RESERVA MEJORADO Y OPTIMIZADO - DISEÑO ELEGANTE Y PROFESIONAL
import './styles/modal-mejorado.css';
// 🆕 NUEVOS MODALES RESPONSIVOS
import './styles/responsive-modals.css';
// 🎨 MODALES ELEGANTES - ESTILO PALCO CLIENTE
import './styles/modal-elegante.css';
// 🔧 FIX COMPLETO PARA SCROLL DE MODALES
import './styles/modal-scroll-fix.css';
// 🆕 SISTEMA UNIFICADO DE RESPONSIVE PARA MODALES
import './styles/unified-modal-responsive.css';
import ResponsiveModal from './components/ui/ResponsiveModal';
import ReservationModal from './components/ui/ReservationModal';
import PaymentModal from './components/ui/PaymentModal';
import EstadisticasModal from './components/ui/EstadisticasModal';
import VerificacionPagosModal from './components/ui/VerificacionPagosModal';
import MisReservasModal from './components/ui/MisReservasModal';
import PagosClienteModal from './components/ui/PagosClienteModal';
import HistoricoCompletoModal from './components/ui/HistoricoCompletoModal';
import GestionQRModal from './components/ui/GestionQRModal';
import PrecioPalcoModal from './components/ui/PrecioPalcoModal';
import BackupModal from './components/ui/BackupModal';


// 🆕 FIX COMPLETO PARA SCROLL EN PÁGINA PRINCIPAL - SIN ACORTAMIENTO
import './styles/scroll-fix-completo.css';
// 🆕 FIX ESPECÍFICO PARA MODAL DE PALCO POR SILLAS - SOLUCIONA ACORTAMIENTO EN PC
import './styles/modal-palco-sillas-fix.css';
// 🆕 FIX COMPLETO PARA MÓVILES - SIN ACORTAMIENTO HACIA ABAJO
import './styles/mobile-fix-completo.css';
// 🚨 FIX URGENTE PARA IPHONE 14 - BOTONES SIEMPRE VISIBLES
import './styles/iphone14-fix-urgente.css';
// 🎯 FIX DEFINITIVO PARA MÓVILES - SCROLL COMPLETO Y HEADER MÓVIL
import './styles/fix-definitivo-moviles.css';
// 🔧 AUMENTAR SCROLL DEL MODAL EN 100PX - PARA PRUEBAS
import './styles/aumentar-scroll-100px.css';
// 🎯 FIX DEFINITIVO PARA IPAD - TÍTULO VISIBLE Y SCROLL UNIFICADO
import './styles/ipad-fix-definitivo.css';
// 🚨 FIX DE EMERGENCIA PARA IPAD - RESTRUCTURACIÓN COMPLETA
import './styles/ipad-fix-emergencia.css';
// 🔧 FIX DE REFINAMIENTO PARA IPAD - ELIMINAR ESPACIOS EN BLANCO
import './styles/ipad-fix-refinamiento.css';
// 🔧 FIX DE RECONSTRUCCIÓN COMPLETA PARA IPAD - ELIMINAR MALFORMACIÓN
import './styles/ipad-fix-reconstruccion.css';
// 🔧 FIX SIMPLE PARA IPAD - ORGANIZAR Y ALINEAR CONTENEDORES
import './styles/ipad-fix-simple.css';
// 🔧 FIX DE CONTENEDOR ÚNICO PARA IPAD
import './styles/ipad-contenedor-unico.css';
// 🎯 SOLUCIÓN IMPLEMENTADA DIRECTAMENTE EN LOS ARCHIVOS EXISTENTES

// 🚨 ARCHIVO DE EMERGENCIA - SOBRESCRIBE TODO LO DEMÁS
import './styles/EMERGENCIA_SCROLL_MODAL.css';

// 🎯 FIX ESPECÍFICO PARA ResponsiveModal - SOBRESCRIBE ESTILOS INLINE
import './styles/RESPONSIVE_MODAL_SCROLL_FIX.css';

// 🚫 FORZAR NO STICKY - DEBE SER EL ÚLTIMO IMPORT CSS
import './styles/force-no-sticky.css';

import MapaPalcos from './MapaPalcos';
import { AuthProvider, useAuth, LoginForm, UserHeader, ProtectedComponent } from './Auth';
import firebaseSyncService from './services/firebaseSync';
import QRUploader from './components/QRUploader';
import imageService from './services/imageService';
import useEscapeKey from './hooks/useEscapeKey';
import usePagination from './hooks/usePagination';
import Pagination from './components/Pagination';
import { useDeviceDetection } from './hooks/useDeviceDetection';

import { exportarTodoAExcel } from './utils/exportUtils';
import { accionPerteneceACategoria } from './utils/historicoUtils';
// 🎨 PALETA DE COLORES ELEGANTE PARA LA APLICACIÓN
const colors = {
  primaryRed: '#C4302B',
  primaryGold: '#D97706',
  primaryGreen: '#16A34A',
  darkBrown: '#451A03',
  creamBg: '#F5F1EB',
  white: '#FFFFFF',
  woodBrown: '#8B4513'
};

// 🆕 AGREGAR ESTE COMPONENTE AQUÍ (línea ~15)
const CloseModalButton = ({ onClose, title = "Cerrar" }) => (
  <button
    onClick={onClose}
    title={title}
    style={{
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(231, 76, 60, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = 'rgba(231, 76, 60, 1)';
      e.target.style.transform = 'scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(231, 76, 60, 0.9)';
      e.target.style.transform = 'scale(1)';
    }}
  >
    ✕
  </button>
);
// Definir todos los palcos del 1 al 40
const TODOS_LOS_PALCOS = Array.from({length: 40}, (_, i) => i + 1);

const DIAS = ['viernes', 'sabado', 'domingo'];

// 📦 Todos los palcos inician como "completo" a $1.200.000, excepto el
// 5, 6 y 7 que inician como venta "por sillas" a $150.000/día. El admin
// puede convertir individualmente cualquiera desde el panel cuando lo
// necesite (botones "Convertir a sillas" / "Convertir a completo").
const PALCOS_SILLAS_INICIAL = [5, 6, 7];
const PRECIO_COMPLETO_INICIAL = 1200000;

function crearPalcosIniciales() {
  return TODOS_LOS_PALCOS.map(numero => {
    if (PALCOS_SILLAS_INICIAL.includes(numero)) {
      return {
        numero,
        tipo: 'sillas',
        reservas: {
          viernes: [],
          sabado: [],
          domingo: [],
        },
      };
    }
    return {
      numero,
      tipo: 'completo',
      estado: 'disponible',
      precio: PRECIO_COMPLETO_INICIAL,
      reservas: [],
    };
  });
}

// 🆕 COMPONENTE DE DEBUG: Para diagnosticar problemas de sincronización
const DebugSincronizacion = ({ palcos, onVerificar, onRecargar }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const analizarPalcos = () => {
    console.log('🔍 ANÁLISIS COMPLETO DE PALCOS:');
    
    palcos.forEach(palco => {
      if (palco.tipo === 'sillas') {
        const totalReservas = Object.values(palco.reservas).flat().length;
        const sillasOcupadas = Object.entries(palco.reservas).map(([dia, reservas]) => {
          const ocupadas = reservas.reduce((sum, r) => {
            const cantidad = typeof r.cantidad === 'number' ? r.cantidad : parseInt(r.cantidad) || 1;
            return sum + cantidad;
          }, 0);
          return { dia, ocupadas };
        });
        
        console.log(`Palco ${palco.numero} (${palco.tipo}):`, {
          totalReservas,
          sillasOcupadas,
          reservas: palco.reservas
        });
      } else {
        console.log(`Palco ${palco.numero} (${palco.tipo}):`, {
          estado: palco.estado,
          reservas: palco.reservas
        });
      }
    });
  };
  
  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000
        }}
        title="Debug Sincronización"
      >
        🔧
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #2c3e50',
      borderRadius: '10px',
      padding: '15px',
      width: '300px',
      zIndex: 1001,
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>🔧 Debug Sincronización</h4>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '25px',
            height: '25px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={analizarPalcos}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          📊 Analizar Palcos
        </button>
        
        <button
          onClick={() => {
            if (window.confirm('⚠️ Esto va a SOBRESCRIBIR los datos del servidor con tu copia local. Solo úsalo si sabes que tu copia local es la correcta (por ejemplo, recuperándote de un error). ¿Continuar?')) {
              onVerificar();
            }
          }}
          style={{
            background: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ⚠️ Forzar mis datos al servidor
        </button>
        
        <button
          onClick={onRecargar}
          style={{
            background: '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          📥 Recargar desde Firebase
        </button>
      </div>
    </div>
  );
};

function AppContent() {
  const deviceInfo = useDeviceDetection();

  

  const { 
    user,
    canEdit, 
    canCancel, 
    canConvertPalcos, 
    canViewFullHistory,
    canViewAllStatistics,
    canViewOwnStatistics,
      canViewAllHistory,
  canViewOwnHistory,
  canExportData,
  canBackupRestore,
  canManageQR,
  canMoveReservations,
  canAccessClientPayments,
  canAccessClientReservations
} = useAuth();
  
  const [formErrors, setFormErrors] = useState({});
  const [vistaActual, setVistaActual] = useState('grilla');
  const [palcos, setPalcos] = useState(() => {
    const savedPalcos = localStorage.getItem('feriaPalcos');
    if (savedPalcos) {
      const palcosGuardados = JSON.parse(savedPalcos);
      
      // 🆕 NUEVO: Migración específica para palco 1
      const palco1 = palcosGuardados.find(p => p.numero === 1);
      if (palco1 && palco1.tipo !== 'sillas') {
        console.log('🔍 Migrando palco 1 de', palco1.tipo, 'a sillas');
        palco1.tipo = 'sillas';
        palco1.reservas = {
          viernes: [],
          sabado: [],
          domingo: [],
        };
        localStorage.setItem('feriaPalcos', JSON.stringify(palcosGuardados));
      }
      
      // Verificar si necesitamos migrar para agregar los nuevos palcos
      if (palcosGuardados.length < 40) {
        const palcosMigrados = crearPalcosIniciales();
        // Preservar datos existentes de los palcos que ya existían
        palcosGuardados.forEach(palcoExistente => {
          const index = palcosMigrados.findIndex(p => p.numero === palcoExistente.numero);
          if (index !== -1) {
            palcosMigrados[index] = palcoExistente;
          }
        });
        localStorage.setItem('feriaPalcos', JSON.stringify(palcosMigrados));
        
        // Sincronizar con Firebase para la app de cliente
        firebaseSyncService.sincronizarPalcos(palcosMigrados).catch(error => {
          console.error('Error sincronizando palcos migrados:', error);
        });
        
        return palcosMigrados;
      }
      return palcosGuardados;
    }
    return crearPalcosIniciales();
  });
  // 🔄 Estado de sincronización en tiempo real de palcos (ver listener onPalcosChange)
  const [syncPalcosEnVivo, setSyncPalcosEnVivo] = useState(false);
  const [ultimaSyncPalcos, setUltimaSyncPalcos] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDia, setFiltroDia] = useState('todos');
  // Filtro de tipo de palco: 'todos', 'completo', 'sillas'
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showReserva, setShowReserva] = useState(false);
  const [palcoSeleccionado, setPalcoSeleccionado] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    vendedor: '',
    dias: [], // Mantener para compatibilidad
    cantidad: 1, // Mantener para compatibilidad
    // NUEVO: Estructura para días específicos
    sillasEspecificas: {
      viernes: { activo: false, cantidad: 1 },
      sabado: { activo: false, cantidad: 1 },
      domingo: { activo: false, cantidad: 1 }
    }
  });

  // Mis reservas
  const [showMisReservas, setShowMisReservas] = useState(false);
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [reservaAMover, setReservaAMover] = useState(null); // {palco, dia, reserva}

  // Estados para UX mejorada
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '', visible: false });
  const [loadingMover, setLoadingMover] = useState(false);

  // Estados para sincronización Firebase
  const [pagosCliente, setPagosCliente] = useState([]);
  const [reservasCliente, setReservasCliente] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  
  // 🆕 NUEVO: Estados para gestión de reservas del cliente
  const [showReservasCliente, setShowReservasCliente] = useState(false);
  const [reservaClienteSeleccionada, setReservaClienteSeleccionada] = useState(null);
  const [showConfirmarReservaCliente, setShowConfirmarReservaCliente] = useState(false);
  const [showRechazarReservaCliente, setShowRechazarReservaCliente] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  // 🆕 NUEVO: Estados para paginación
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 palcos por página (3x4 grid)
  
  // 🆕 NUEVO: Función para analizar diferencias entre vendedores
  const analizarDiferenciasVendedores = () => {
    console.log('🔍 ANÁLISIS COMPLETO DE VENDEDORES:');
    console.log('🔍 ======================================');
    
    // Analizar usuario actual
    console.log('🔍 USUARIO ACTUAL:');
    console.log('🔍 - user:', user);
    console.log('🔍 - user.vendedor:', user?.vendedor);
    console.log('🔍 - user.role:', user?.role);
    console.log('🔍 - user.name:', user?.name);
    
    // Analizar permisos
    console.log('🔍 PERMISOS:');
    console.log('🔍 - canViewAllHistory():', canViewAllHistory());
    console.log('🔍 - canViewOwnHistory():', canViewOwnHistory());
    console.log('🔍 - canViewAllStatistics():', canViewAllStatistics());
    console.log('🔍 - canViewOwnStatistics():', canViewOwnStatistics());
    
    // Analizar histórico
    console.log('🔍 HISTÓRICO:');
    console.log('🔍 - Total registros:', historico.length);
    console.log('🔍 - Registros con vendedor:', historico.filter(r => r.vendedor).length);
    console.log('🔍 - Registros sin vendedor:', historico.filter(r => !r.vendedor).length);
    
    const vendedoresUnicos = [...new Set(historico.filter(r => r.vendedor).map(r => r.vendedor))];
    console.log('🔍 - Vendedores únicos:', vendedoresUnicos);
    
    // Analizar registros por vendedor
    vendedoresUnicos.forEach(vendedor => {
      const registrosVendedor = historico.filter(r => r.vendedor === vendedor);
      console.log(`🔍 - ${vendedor}: ${registrosVendedor.length} registros`);
    });
    
    // Analizar ingresos
    console.log('🔍 INGRESOS:');
    console.log('🔍 - Total ingresos:', ingresos.length);
    console.log('🔍 - Ingresos con vendedor:', ingresos.filter(i => i.detalles?.vendedor).length);
    
    const vendedoresIngresos = [...new Set(ingresos.filter(i => i.detalles?.vendedor).map(i => i.detalles.vendedor))];
    console.log('🔍 - Vendedores en ingresos:', vendedoresIngresos);
    
    vendedoresIngresos.forEach(vendedor => {
      const ingresosVendedor = ingresos.filter(i => i.detalles?.vendedor === vendedor);
      console.log(`🔍 - ${vendedor}: ${ingresosVendedor.length} ingresos`);
    });
    
    console.log('🔍 ======================================');
  };



  // Estados para gestión avanzada
  const [showHistorico, setShowHistorico] = useState(false);
  const [showEditarReserva, setShowEditarReserva] = useState(false);
  const [reservaAEditar, setReservaAEditar] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    vendedor: ''
  });
  const [historico, setHistorico] = useState(() => {
    const savedHistorico = localStorage.getItem('feriaHistorico');
    return savedHistorico ? JSON.parse(savedHistorico) : [];
  });
  
  // Estados para filtros del histórico
  const [filtrosHistorico, setFiltrosHistorico] = useState({
    cedula: '',
    vendedor: '',
    palco: '',
    accion: 'todas'
  });

  // Estados para estadísticas
  const [showEstadisticas, setShowEstadisticas] = useState(false);
  const [ingresos, setIngresos] = useState(() => {
    const savedIngresos = localStorage.getItem('feriaIngresos');
    return savedIngresos ? JSON.parse(savedIngresos) : [];
  });
  
  // Estados para filtros de estadísticas
  const [filtrosEstadisticas, setFiltrosEstadisticas] = useState({
    dia: 'todos',
    vendedor: 'todos',
    tipoIngreso: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });

  // Estados para pagos
const [showPagos, setShowPagos] = useState(false);
  const [reservaParaPago, setReservaParaPago] = useState(null);
const [pagoData, setPagoData] = useState({
  metodoPago: '',
  numeroComprobante: '',
    observaciones: '',
  imagenComprobante: null
});
  const [pagosPendientes, setPagosPendientes] = useState([]);

  // Estados para verificación de pagos
  const [showVerificacionPagos, setShowVerificacionPagos] = useState(false);

  // Estados para gestión de QR
  const [showQRUploader, setShowQRUploader] = useState(false);
  const [showPrecioPalco, setShowPrecioPalco] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const [qrData, setQrData] = useState({
  nequi: null,
    daviplata: null,
    bancolombia: null
  });

  // Estados para estadísticas actuales
  const [estadisticasActuales, setEstadisticasActuales] = useState(null);

  // 🎯 Hooks para ESC - DESPUÉS de todas las declaraciones de estado
  useEscapeKey(showMisReservas, () => setShowMisReservas(false));
  useEscapeKey(showHistorico, () => setShowHistorico(false));
  
  // 🆕 NUEVO: Auto-rellenar filtro de vendedor cuando se abre el histórico
  useEffect(() => {
    if (showHistorico && user) {
      // Si es un vendedor, automáticamente rellenar con su nombre
      if (!canViewAllHistory() && canViewOwnHistory()) {
        const nombreVendedor = user.vendedor || user['vendedor '] || user.name || '';
        setFiltrosHistorico(prev => ({
          ...prev,
          vendedor: nombreVendedor
        }));
      }
    }
  }, [showHistorico, user]);


  useEscapeKey(showEstadisticas, () => setShowEstadisticas(false));
  useEscapeKey(showVerificacionPagos, () => setShowVerificacionPagos(false));
  useEscapeKey(showReserva, () => setShowReserva(false));
  useEscapeKey(showEditarReserva, () => {
    setShowEditarReserva(false);
    setShowReserva(true);
  });
  useEscapeKey(showPagos, () => setShowPagos(false));

  useEscapeKey(showQRUploader, () => setShowQRUploader(false));
  
  useEscapeKey(!!reservaAMover, () => setReservaAMover(null));
  useEscapeKey(showReservasCliente, () => setShowReservasCliente(false));

  // 🎯 useEffect para guardar datos automáticamente
  useEffect(() => {
    // Guardar palcos automáticamente cuando cambien
    if (palcos.length > 0) {
      localStorage.setItem('feriaPalcos', JSON.stringify(palcos));
    }
  }, [palcos]);

  useEffect(() => {
    // Guardar ingresos automáticamente cuando cambien
    if (ingresos.length >= 0) {
      localStorage.setItem('feriaIngresos', JSON.stringify(ingresos));
      
      // 🔍 VALIDAR INTEGRIDAD CONTABLE AUTOMÁTICAMENTE
      const integridad = validarIntegridadContable();
      if (!integridad.valido) {
        console.warn('⚠️ Problemas de integridad contable detectados:', integridad.errores);
      }
    }
  }, [ingresos]);

  // 🔍 SINCRONIZAR INGRESOS ENTRE APPS CADA 30 SEGUNDOS
  useEffect(() => {
    const intervalId = setInterval(() => {
      sincronizarIngresosEntreApps();
    }, 30000); // 30 segundos

    return () => clearInterval(intervalId);
  }, []);

  // 💾 BACKUP AUTOMÁTICO CADA 5 MINUTOS (solo desde sesiones de administrador,
  // para no crear un backup por cada vendedor conectado). Usamos refs para
  // que el intervalo siempre lea los datos más recientes sin recrearse.
  const palcosRef = useRef(palcos);
  const ingresosRef = useRef(ingresos);
  const historicoRef = useRef(historico);
  const pagosPendientesRef = useRef(pagosPendientes);
  useEffect(() => { palcosRef.current = palcos; }, [palcos]);
  useEffect(() => { ingresosRef.current = ingresos; }, [ingresos]);
  useEffect(() => { historicoRef.current = historico; }, [historico]);
  useEffect(() => { pagosPendientesRef.current = pagosPendientes; }, [pagosPendientes]);

  useEffect(() => {
    if (!canBackupRestore()) return;

    const intervalId = setInterval(() => {
      firebaseSyncService.crearBackup({
        palcos: palcosRef.current,
        ingresos: ingresosRef.current,
        historico: historicoRef.current,
        pagosPendientes: pagosPendientesRef.current,
        creadoPor: 'Sistema (automático)'
      })
        .then(() => firebaseSyncService.limpiarBackupsAntiguos(20))
        .catch(error => console.error('❌ Error en backup automático:', error));
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    // Guardar histórico automáticamente cuando cambie
    if (historico.length >= 0) {
      localStorage.setItem('feriaHistorico', JSON.stringify(historico));
    }
  }, [historico]);

  // 🎯 useEffect para verificar y corregir datos al cargar la aplicación
  useEffect(() => {
    const verificarYCorregirDatos = () => {
      try {
        console.log('🔍 Verificando datos al cargar:', {
          palcos: palcos.length,
          ingresos: ingresos.length,
          historico: historico.length,
          filtrosEstadisticas: filtrosEstadisticas
        });

        // Verificar que los ingresos tengan la estructura correcta
        const ingresosCorregidos = ingresos.map(ingreso => {
          if (ingreso.detalles && typeof ingreso.detalles.dias === 'string') {
            return {
              ...ingreso,
              detalles: {
                ...ingreso.detalles,
                dias: ingreso.detalles.dias ? [ingreso.detalles.dias] : []
              }
            };
          }
          return ingreso;
        });

        // Si se corrigieron datos, actualizar el estado
        if (JSON.stringify(ingresosCorregidos) !== JSON.stringify(ingresos)) {
          setIngresos(ingresosCorregidos);
          console.log('✅ Datos de ingresos corregidos automáticamente');
        }

        // Verificar que los palcos tengan la estructura correcta
        const palcosCorregidos = palcos.map(palco => {
          if (!palco.reservas) {
            return { ...palco, reservas: {} };
          }
          return palco;
        });

        // Si se corrigieron datos, actualizar el estado
        if (JSON.stringify(palcosCorregidos) !== JSON.stringify(palcos)) {
          setPalcos(palcosCorregidos);
          console.log('✅ Datos de palcos corregidos automáticamente');
        }

        // Verificar filtros
        console.log('🔍 Filtros actuales:', filtrosEstadisticas);
        console.log('🔍 Ingresos filtrados:', getIngresosFiltrados().length);

        // 🧹 LIMPIEZA AUTOMÁTICA DE DUPLICADOS AL CARGAR
        const ids = ingresos.map(ing => ing.id);
        const idsUnicos = new Set(ids);
        if (ids.length !== idsUnicos.size) {
          console.log('🧹 Se detectaron duplicados al cargar, limpiando automáticamente...');
          limpiarRegistrosDuplicados();
        }

      } catch (error) {
        console.error('❌ Error verificando datos:', error);
      }
    };

    // Ejecutar verificación solo una vez al cargar
    verificarYCorregirDatos();
    
    // 🔑 Generar sessionId único para evitar duplicados
    if (!sessionStorage.getItem('sessionId')) {
      const sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('sessionId', sessionId);
      console.log('🔑 SessionId generado:', sessionId);
    }
  }, []); // Array vacío = solo se ejecuta al montar el componente

  // Función para calcular estadísticas en tiempo real
  const calcularEstadisticas = () => {
    // Estadísticas generales usando todos los palcos del 1 al 40
    const totalPalcos = 40; // Todos los palcos del 1 al 40
    
    // Contar palcos por tipo y estado
    const palcosCompletos = palcos.filter(p => p.tipo === 'completo');
    const palcosSillas = palcos.filter(p => p.tipo === 'sillas');
    
    const palcosCompletosOcupados = palcosCompletos.filter(p => p.estado !== 'disponible').length;
    const palcosSillasOcupados = palcosSillas.filter(p => 
      DIAS.some(dia => p.reservas[dia] && p.reservas[dia].length > 0)
    ).length;
    
    const palcosOcupados = palcosCompletosOcupados + palcosSillasOcupados;
  
    // Calcular total de sillas en el sistema
    const totalSillasSistema = palcos.length * 10; // 40 palcos * 10 sillas cada uno = 400 sillas
    
    // Ocupación por día (todos los palcos)
    const ocupacionPorDia = {};
    DIAS.forEach(dia => {
      let sillasOcupadas = 0;
      let sillasDisponibles = 0;
      
      // Recorrer todos los palcos del 1 al 40
      palcos.forEach(palco => {
        if (palco.tipo === 'completo') {
          // Palcos completos: si están vendidos ocupan 10 sillas, si no están disponibles
          if (palco.estado === 'vendido') {
            sillasOcupadas += 10;
          } else if (palco.estado === 'disponible') {
            sillasDisponibles += 10;
          }
          // Si está reservado, no cuenta para este día específico
        } else if (palco.tipo === 'sillas') {
          // Palcos por sillas: contar las reservas del día específico
          const reservasDia = palco.reservas[dia] || [];
          const ocupadas = reservasDia.reduce((sum, r) => sum + r.cantidad, 0);
          sillasOcupadas += ocupadas;
          sillasDisponibles += (10 - ocupadas);
        }
      });
      
      ocupacionPorDia[dia] = {
        ocupadas: sillasOcupadas,
        disponibles: sillasDisponibles,
        total: sillasOcupadas + sillasDisponibles,
        porcentaje: Math.round((sillasOcupadas / (sillasOcupadas + sillasDisponibles)) * 100)
      };
    });
  
    // 🏦 CÁLCULO CONTABLE PRECISO DE INGRESOS
    const ingresoTotal = ingresos.reduce((sum, ing) => {
      const monto = Number(ing.monto) || 0;
      return sum + monto;
    }, 0);
    
    const ventasTotal = ingresos
      .filter(ing => ing.tipo === 'venta')
      .reduce((sum, ing) => {
        const monto = Number(ing.monto) || 0;
        return sum + monto;
      }, 0);
    
    const cancelacionesTotal = Math.abs(ingresos
      .filter(ing => ing.tipo === 'cancelacion')
      .reduce((sum, ing) => {
        const monto = Number(ing.monto) || 0;
        return sum + monto;
      }, 0));
    
    // 🔍 VALIDACIÓN DE DATOS CONTABLES
    const ingresosValidos = ingresos.filter(ing => {
      const monto = Number(ing.monto);
      return !isNaN(monto) && monto !== 0 && ing.id && ing.timestamp;
    });
    
    const transaccionesDuplicadas = ingresos.length - new Set(ingresos.map(ing => ing.id)).size;
    
    // 🔍 ESTADÍSTICAS DE CALIDAD DE DATOS
    const calidadDatos = {
      totalTransacciones: ingresos.length,
      transaccionesValidas: ingresosValidos.length,
      transaccionesDuplicadas: transaccionesDuplicadas,
      porcentajeValidez: ingresos.length > 0 ? Math.round((ingresosValidos.length / ingresos.length) * 100) : 100
    };
  
    return {
      totalPalcos,
      palcosOcupados,
      palcosDisponibles: totalPalcos - palcosOcupados,
      porcentajeOcupacion: Math.round((palcosOcupados / totalPalcos) * 100),
      // Detalles por tipo de palco
      palcosCompletos: palcosCompletos.length,
      palcosCompletosOcupados,
      palcosSillas: palcosSillas.length,
      palcosSillasOcupados,
      totalSillasSistema,
      // Ocupación por día
      ocupacionPorDia,
      // 🏦 INGRESOS CONTABLES
      ingresoTotal: Math.round(ingresoTotal * 100) / 100, // Redondear a 2 decimales
      ventasTotal: Math.round(ventasTotal * 100) / 100,
      cancelacionesTotal: Math.round(cancelacionesTotal * 100) / 100,
      numeroVentas: ingresos.filter(ing => ing.tipo === 'venta').length,
      numeroCancelaciones: ingresos.filter(ing => ing.tipo === 'cancelacion').length,
      // 🔍 CALIDAD DE DATOS CONTABLES
      calidadDatos,
      // 🔍 ESTADÍSTICAS ADICIONALES
      ingresosValidos: ingresosValidos.length,
      transaccionesDuplicadas,
      porcentajeValidez: calidadDatos.porcentajeValidez
    };
  };

  // 🏦 SISTEMA CONTABLE PROFESIONAL - Función para registrar ingresos (ventas y cancelaciones)
  const registrarIngreso = (tipo, monto, detalles = {}) => {
    // 🔍 VALIDACIÓN DE DATOS
    if (!tipo || !monto || monto <= 0) {
      console.error('❌ Error: Datos inválidos para registrar ingreso:', { tipo, monto, detalles });
      return false;
    }

    // 🔍 GENERAR ID ÚNICO Y VERIFICABLE (MEJORADO)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userAgent = navigator.userAgent.slice(-10);
    const sessionId = sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9);
    const hash = btoa(`${tipo}_${monto}_${timestamp}_${randomId}_${userAgent}_${sessionId}`).replace(/[^a-zA-Z0-9]/g, '');
    const id = `ingreso_${timestamp}_${hash}_${Math.random().toString(36).substr(2, 5)}`;

    // 🔍 VALIDAR QUE NO EXISTA DUPLICADO (VALIDACIÓN MEJORADA)
    const existeDuplicado = ingresos.some(ingreso => {
      const mismoTipo = ingreso.tipo === tipo;
      const mismoMonto = Math.abs(ingreso.monto) === Math.abs(monto);
      const mismaCedula = ingreso.detalles?.cedula === detalles.cedula;
      const mismoPalco = ingreso.detalles?.palco === detalles.palco;
      const mismoMetodo = ingreso.detalles?.metodoPago === detalles.metodoPago;
      const mismoVendedor = ingreso.detalles?.vendedor === detalles.vendedor;
      
      // Verificar si es el mismo ingreso (más estricto)
      const esDuplicado = mismoTipo && mismoMonto && mismaCedula && mismoPalco && mismoMetodo && mismoVendedor;
      
      if (esDuplicado) {
        console.log('🔍 Duplicado detectado:', {
          existente: ingreso,
          nuevo: { tipo, monto, detalles }
        });
      }
      
      return esDuplicado;
    });

    if (existeDuplicado) {
      console.warn('⚠️ Transacción duplicada detectada, no se registrará:', { tipo, monto, detalles });
      mostrarMensaje('warning', '⚠️ Esta transacción ya existe en el sistema');
      return false;
    }

    // 🔍 CREAR TRANSACCIÓN CONTABLE
    const nuevoIngreso = {
      id: id,
      tipo: tipo, // 'venta', 'cancelacion', 'devolucion', 'ajuste'
      monto: tipo === 'cancelacion' || tipo === 'devolucion' ? -Math.abs(monto) : Math.abs(monto),
      fecha: new Date().toISOString(), // ISO para precisión
      fechaLocal: new Date().toLocaleString('es-CO'),
      timestamp: timestamp,
      hash: hash,
      detalles: {
        cedula: detalles.cedula || '',
        nombre: detalles.nombre || '',
        vendedor: detalles.vendedor || '',
        palco: detalles.palco || '',
        cantidad: detalles.cantidad || '',
        dias: Array.isArray(detalles.dias) ? detalles.dias : (detalles.dias ? [detalles.dias] : []),
        metodoPago: detalles.metodoPago || '',
        numeroComprobante: detalles.numeroComprobante || '',
        estadoPago: detalles.estadoPago || '',
        appOrigen: detalles.appOrigen || 'palco-reservas', // Identificar app origen
        transaccionId: detalles.transaccionId || `trans_${timestamp}_${hash}` // ID de transacción padre
      },
      // 🔍 METADATOS DE AUDITORÍA
      auditoria: {
        usuario: user?.email || user?.name || 'Sistema',
        timestamp: timestamp,
        version: '2.0',
        checksum: btoa(`${id}_${tipo}_${monto}_${timestamp}`).substr(0, 16)
      }
    };

    // 🔍 REGISTRAR TRANSACCIÓN
    setIngresos(prev => {
      const nuevosIngresos = [nuevoIngreso, ...prev];
      
      // Guardar en localStorage con timestamp
      localStorage.setItem('feriaIngresos', JSON.stringify(nuevosIngresos));
      localStorage.setItem('feriaIngresos_timestamp', timestamp.toString());
      
      // 🔍 SINCRONIZAR CON FIREBASE
      try {
        firebaseSyncService.sincronizarIngresos(nuevosIngresos);
        console.log('✅ Ingreso sincronizado con Firebase:', nuevoIngreso.id);
      } catch (error) {
        console.error('❌ Error sincronizando ingresos con Firebase:', error);
        // 🔍 GUARDAR EN COLA DE SINCRONIZACIÓN
        const colaSync = JSON.parse(localStorage.getItem('feriaIngresos_syncQueue') || '[]');
        colaSync.push(nuevoIngreso);
        localStorage.setItem('feriaIngresos_syncQueue', JSON.stringify(colaSync));
      }
      
      return nuevosIngresos;
    });

    // 🔍 LOG DE TRANSACCIÓN
    console.log('💰 Transacción registrada:', {
      id: nuevoIngreso.id,
      tipo: nuevoIngreso.tipo,
      monto: nuevoIngreso.monto,
      palco: nuevoIngreso.detalles.palco,
      cliente: nuevoIngreso.detalles.nombre,
      timestamp: nuevoIngreso.fechaLocal
    });

    return true;
  };

  // 🔍 FUNCIÓN PARA SINCRONIZAR INGRESOS ENTRE APPS
  const sincronizarIngresosEntreApps = async () => {
    try {
      console.log('🔄 Iniciando sincronización de ingresos entre apps...');
      
      // Obtener ingresos de Firebase
      const ingresosFirebase = await firebaseSyncService.obtenerIngresos();
      
      if (ingresosFirebase && ingresosFirebase.length > 0) {
        // 🔍 VALIDAR Y MERGEAR INGRESOS
        const ingresosLocales = ingresos;
        const ingresosNuevos = [];
        
        ingresosFirebase.forEach(ingresoFirebase => {
          // Verificar si ya existe localmente
          const existeLocal = ingresosLocales.some(ingresoLocal => 
            ingresoLocal.id === ingresoFirebase.id ||
            (ingresoLocal.detalles.cedula === ingresoFirebase.detalles.cedula &&
             ingresoLocal.detalles.palco === ingresoFirebase.detalles.palco &&
             ingresoLocal.detalles.metodoPago === ingresoFirebase.detalles.metodoPago &&
             Math.abs(ingresoLocal.monto) === Math.abs(ingresoFirebase.monto) &&
             ingresoLocal.tipo === ingresoFirebase.tipo)
          );
          
          if (!existeLocal) {
            ingresosNuevos.push(ingresoFirebase);
          }
        });
        
        // 🔍 AGREGAR INGRESOS NUEVOS (CON VALIDACIÓN ANTI-DUPLICADOS)
        if (ingresosNuevos.length > 0) {
          setIngresos(prev => {
            // Verificar que no existan duplicados antes de agregar
            const ingresosSinDuplicados = ingresosNuevos.filter(ingresoNuevo => {
              return !prev.some(ingresoExistente => {
                return ingresoExistente.id === ingresoNuevo.id ||
                       (ingresoExistente.detalles?.cedula === ingresoNuevo.detalles?.cedula &&
                        ingresoExistente.detalles?.palco === ingresoNuevo.detalles?.palco &&
                        ingresoExistente.monto === ingresoNuevo.monto &&
                        ingresoExistente.tipo === ingresoNuevo.tipo);
              });
            });
            
            if (ingresosSinDuplicados.length !== ingresosNuevos.length) {
              console.log(`⚠️ Se filtraron ${ingresosNuevos.length - ingresosSinDuplicados.length} duplicados durante la sincronización`);
            }
            
            const nuevosIngresos = [...ingresosSinDuplicados, ...prev];
            localStorage.setItem('feriaIngresos', JSON.stringify(nuevosIngresos));
            console.log(`✅ ${ingresosSinDuplicados.length} ingresos sincronizados desde otras apps (sin duplicados)`);
            return nuevosIngresos;
          });
        }
        
        // 🔍 PROCESAR COLA DE SINCRONIZACIÓN LOCAL
        const colaSync = JSON.parse(localStorage.getItem('feriaIngresos_syncQueue') || '[]');
        if (colaSync.length > 0) {
          for (const ingreso of colaSync) {
            try {
              await firebaseSyncService.sincronizarIngresos([ingreso]);
              console.log('✅ Ingreso de cola sincronizado:', ingreso.id);
            } catch (error) {
              console.error('❌ Error sincronizando ingreso de cola:', error);
            }
          }
          // Limpiar cola
          localStorage.setItem('feriaIngresos_syncQueue', '[]');
        }
      }
      
      console.log('✅ Sincronización de ingresos completada');
    } catch (error) {
      console.error('❌ Error en sincronización de ingresos:', error);
    }
  };

  // 🔍 FUNCIÓN PARA VALIDAR INTEGRIDAD CONTABLE
  const validarIntegridadContable = () => {
    const errores = [];
    
    // Verificar montos válidos
    ingresos.forEach((ingreso, index) => {
      if (isNaN(ingreso.monto) || ingreso.monto === 0) {
        errores.push(`Ingreso ${index}: Monto inválido (${ingreso.monto})`);
      }
      if (!ingreso.id || !ingreso.timestamp) {
        errores.push(`Ingreso ${index}: Faltan campos obligatorios`);
      }
    });
    
    // Verificar duplicados
    const ids = ingresos.map(ing => ing.id);
    const idsUnicos = new Set(ids);
    if (ids.length !== idsUnicos.size) {
      errores.push(`Se encontraron ${ids.length - idsUnicos.size} transacciones duplicadas`);
    }
    
    // Verificar balance contable
    const totalVentas = ingresos
      .filter(ing => ing.tipo === 'venta')
      .reduce((sum, ing) => sum + Math.abs(ing.monto), 0);
    
    const totalCancelaciones = ingresos
      .filter(ing => ing.tipo === 'cancelacion')
      .reduce((sum, ing) => sum + Math.abs(ing.monto), 0);
    
    const balance = totalVentas - totalCancelaciones;
    const ingresoTotal = ingresos.reduce((sum, ing) => sum + ing.monto, 0);
    
    if (Math.abs(balance - ingresoTotal) > 0.01) {
      errores.push(`Desbalance contable: Balance=${balance}, Total=${ingresoTotal}`);
    }
    
    return {
      valido: errores.length === 0,
      errores: errores,
      balance: balance,
      totalVentas: totalVentas,
      totalCancelaciones: totalCancelaciones
    };
  };

  // Funciones para filtros de estadísticas
  const getIngresosFiltrados = () => {
    return ingresos.filter(ingreso => {
      // Filtro de días - más flexible
      const coincideDia = filtrosEstadisticas.dia === 'todos' || 
        (ingreso.detalles && ingreso.detalles.dias && 
         (Array.isArray(ingreso.detalles.dias) ? 
           ingreso.detalles.dias.includes(filtrosEstadisticas.dia) :
           ingreso.detalles.dias.includes(filtrosEstadisticas.dia)));
      
      // Filtro de vendedor
      const coincideVendedor = filtrosEstadisticas.vendedor === 'todos' || 
        (ingreso.detalles && ingreso.detalles.vendedor === filtrosEstadisticas.vendedor);
      
      // Filtro de tipo
      const coincideTipo = filtrosEstadisticas.tipoIngreso === 'todos' || 
        ingreso.tipo === filtrosEstadisticas.tipoIngreso;
      
      return coincideDia && coincideVendedor && coincideTipo;
    });
  };
  // 💳 Filtrar pagos pendientes del vendedor por rol: cada vendedor ve solo
  // los suyos, los administradores ven todos.
  const getPagosPendientesFiltrados = () => {
    if (!user) return [];

    if (canViewAllStatistics()) {
      return pagosPendientes;
    }

    if (canViewOwnStatistics()) {
      const nombreVendedor = user.vendedor || user['vendedor '] || user.name;
      if (!nombreVendedor) return [];
      return pagosPendientes.filter(pago =>
        pago.reserva?.vendedor?.toLowerCase() === nombreVendedor.toLowerCase()
      );
    }

    return pagosPendientes;
  };

  const getIngresosFiltradosPorRol = (currentUser) => {
    let ingresosFiltrados = getIngresosFiltrados();

    // Si no hay usuario, retornar vacío
    if (!currentUser) {
      return [];
    }
    
    // Si es admin, retornar todos los ingresos filtrados
    if (canViewAllStatistics()) {
      return ingresosFiltrados;
    }
    
    // Los vendedores solo ven sus propias ventas
    if (canViewOwnStatistics()) {
      // 🔧 CORREGIDO: Obtener el nombre del vendedor correctamente
      const nombreVendedor = currentUser.vendedor || currentUser['vendedor '] || currentUser.name;
      
      if (!nombreVendedor) {
        return []; // Si no hay nombre de vendedor, retornar vacío
      }
      
      ingresosFiltrados = ingresosFiltrados.filter(ingreso => {
        if (!ingreso.detalles || !ingreso.detalles.vendedor) {
          return false;
        }
        return ingreso.detalles.vendedor.toLowerCase() === nombreVendedor.toLowerCase();
      });
    }
    
    return ingresosFiltrados;
  };
  const getVendedoresUnicos = () => {
    const vendedores = new Set();
    ingresos.forEach(ing => {
      // Verificar que ing.detalles existe
      if (ing.detalles && ing.detalles.vendedor) {
        vendedores.add(ing.detalles.vendedor);
      }
    });
    return Array.from(vendedores).sort();
  };

  const getEstadisticasPorVendedor = () => {
    const vendedores = {};
    getIngresosFiltradosPorRol(user).forEach(ingreso => {
      // Verificar que ingreso.detalles existe
      if (!ingreso.detalles || !ingreso.detalles.vendedor) {
        console.log('⚠️ Ingreso sin detalles válidos en estadísticas:', ingreso);
        return;
      }
      
      const vendedor = ingreso.detalles.vendedor;
      if (!vendedores[vendedor]) {
        vendedores[vendedor] = { ventas: 0, cancelaciones: 0, ingresoNeto: 0, numeroOperaciones: 0 };
      }
      if (ingreso.tipo === 'venta') {
        vendedores[vendedor].ventas += ingreso.monto;
        vendedores[vendedor].numeroOperaciones++;
      } else {
        vendedores[vendedor].cancelaciones += Math.abs(ingreso.monto);
      }
      vendedores[vendedor].ingresoNeto += ingreso.monto;
    });
    return vendedores;
  };

  const limpiarFiltrosEstadisticas = () => {
    setFiltrosEstadisticas({
      dia: 'todos',
      vendedor: 'todos',
      tipoIngreso: 'todos'
    });
  };

  // Función para exportar datos a CSV
  const exportarDatos = () => {
    try {
      exportarTodoAExcel({
        palcos,
        ingresos,
        historico,
        estadisticas: calcularEstadisticas(),
        estadisticasPorVendedor: getEstadisticasPorVendedor()
      });

      mostrarMensaje('success', '📊 Excel exportado correctamente (ventas, cancelaciones, palcos, histórico y resumen por vendedor)');
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      mostrarMensaje('error', '❌ Error al exportar datos');
    }
  };

  // 💾 Restaurar un backup real (guardado en Firebase, no en localStorage).
  // Palcos y pagos pendientes se reemplazan por completo (son el estado
  // "actual" del sistema). Ingresos e histórico se fusionan sin borrar nada
  // existente, para no perder ventas reales hechas después del backup.
  const restaurarDesdeBackup = async (backup) => {
    if (!window.confirm(
      `¿Restaurar el backup del ${backup.fechaLocal}?\n\n` +
      `Esto reemplazará el estado actual de los palcos y los pagos pendientes.\n` +
      `Los ingresos y el histórico NO se borran: solo se completa lo que falte del backup, sin perder ventas nuevas.`
    )) {
      return;
    }

    try {
      mostrarMensaje('info', '🔄 Restaurando backup...');

      // Palcos y pagos pendientes: reemplazo completo (local + Firebase)
      setPalcos(backup.palcos || []);
      await firebaseSyncService.sincronizarPalcos(backup.palcos || []);

      setPagosPendientes(backup.pagosPendientes || []);
      await firebaseSyncService.sincronizarPagosPendientes(backup.pagosPendientes || []);

      // Ingresos: fusión segura (sincronizarIngresos ya solo agrega/actualiza por id, nunca borra)
      await firebaseSyncService.sincronizarIngresos(backup.ingresos || []);
      setIngresos(prev => {
        const idsExistentes = new Set(prev.map(i => i.id));
        const faltantes = (backup.ingresos || []).filter(i => !idsExistentes.has(i.id));
        return [...prev, ...faltantes];
      });

      // Histórico: fusión segura (el listener en tiempo real también lo reflejará)
      await firebaseSyncService.restaurarHistoricoDesdeBackup(backup.historico || []);

      mostrarMensaje('success', '✅ Backup restaurado correctamente');
      setShowBackupModal(false);
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      mostrarMensaje('error', '❌ Error al restaurar el backup');
    }
  };

  // Función para limpiar todos los datos (para pruebas)
  const limpiarDatosPrueba = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos? Esto no se puede deshacer.')) {
      try {
        // Mostrar mensaje de carga
        mostrarMensaje('info', '🗑️ Limpiando datos...');
        
        // Limpiar datos en memoria
      const palcosIniciales = crearPalcosIniciales(); // 40 palcos
      setPalcos(palcosIniciales);
      setIngresos([]);
      setHistorico([]);
      setPagosPendientes([]);
      
        // Limpiar localStorage específico
      localStorage.removeItem('feriaPalcos');
      localStorage.removeItem('feriaIngresos');
      localStorage.removeItem('feriaHistorico');
      localStorage.removeItem('feriaPagosPendientes');
      
        // 🔥 SINCRONIZAR CON FIREBASE - LIMPIAR DATOS EN LA NUBE
        try {
          // Sincronizar palcos vacíos (40 palcos)
          await firebaseSyncService.sincronizarPalcos(palcosIniciales);
          
          // Sincronizar pagos pendientes vacíos
          await firebaseSyncService.sincronizarPagosPendientes([]);
          
          // Sincronizar reservas vacías
          await firebaseSyncService.sincronizarReservas([]);
          
          // Sincronizar estadísticas vacías
          await firebaseSyncService.sincronizarEstadisticas({
            totalIngresos: 0,
            totalVentas: 0,
            totalCancelaciones: 0,
            ocupacionPorDia: {
              viernes: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 },
              sabado: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 },
              domingo: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 }
            }
          });
          
          console.log('✅ Datos limpiados en Firebase correctamente');
        } catch (firebaseError) {
          console.error('⚠️ Error limpiando datos en Firebase:', firebaseError);
          // Continuar aunque falle Firebase
        }
        
        mostrarMensaje('success', '✅ Todos los datos han sido limpiados localmente y en la nube. Incluye los 40 palcos sincronizados con la app de cliente.');
      } catch (error) {
        console.error('❌ Error limpiando datos:', error);
        mostrarMensaje('error', '❌ Error limpiando datos. Intenta de nuevo.');
      }
    }
  };

  // Función para limpiar solo los QR
  const limpiarQR = () => {
    if (window.confirm('¿Quieres limpiar solo los códigos QR? Los datos de reservas se mantendrán.')) {
      setQrData({ nequi: null, daviplata: null, bancolombia: null });
      localStorage.removeItem('qr_nequi');
      localStorage.removeItem('qr_daviplata');
      localStorage.removeItem('qr_bancolombia');
      mostrarMensaje('success', '✅ Códigos QR limpiados');
    }
  };

  // Función para resetear completamente (como refrescar página)
  const resetearCompletamente = async () => {
    if (window.confirm('¿Estás seguro de que quieres resetear completamente la aplicación? Esto eliminará TODOS los datos y configuraciones tanto localmente como en la nube.')) {
      try {
        // Mostrar mensaje de carga
        mostrarMensaje('info', '🔄 Reseteando aplicación... Esto puede tomar unos segundos.');
        
        // Limpiar todos los datos en memoria
        setPalcos(crearPalcosIniciales());
        setIngresos([]);
        setHistorico([]);
        setPagosPendientes([]);
        setPagosCliente([]); // 🆕 NUEVO: Limpiar pagos del cliente
        setReservasCliente([]); // 🆕 NUEVO: Limpiar reservas del cliente
        setQrData({ nequi: null, daviplata: null, bancolombia: null });
      
      // Limpiar TODOS los datos del localStorage
      localStorage.clear();
      
      // Limpiar formularios
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        correo: '',
        vendedor: '',
        dias: [],
        cantidad: 1,
        sillasEspecificas: {
          viernes: { activo: false, cantidad: 1 },
          sabado: { activo: false, cantidad: 1 },
          domingo: { activo: false, cantidad: 1 }
        }
      });
      
      setPagoData({
        metodoPago: '',
        numeroComprobante: '',
          observaciones: '',
        imagenComprobante: null
      });
      
      // Cerrar todos los modales
      setShowReserva(false);
      setShowMisReservas(false);
      setShowHistorico(false);
      setShowEstadisticas(false);
      setShowPagos(false);
      setShowVerificacionPagos(false);
      setShowEditarReserva(false);
      
      // Limpiar filtros
      setFiltroEstado('todos');
      setFiltroDia('todos');
      setFiltrosHistorico({
        cedula: '',
        vendedor: '',
        palco: '',
        accion: 'todas'
      });
      setFiltrosEstadisticas({
        dia: 'todos',
        vendedor: 'todos',
        tipoIngreso: 'todos'
      });
      
        // 🔥 SINCRONIZAR CON FIREBASE - LIMPIAR DATOS EN LA NUBE
        try {
          // Sincronizar palcos vacíos
          await firebaseSyncService.sincronizarPalcos(crearPalcosIniciales());

          // Sincronizar pagos pendientes vacíos
          await firebaseSyncService.sincronizarPagosPendientes([]);

          // Sincronizar reservas vacías
          await firebaseSyncService.sincronizarReservas([]);

          // 🗑️ Borrar TODOS los ingresos y el histórico en Firebase (antes
          // faltaba esto: se limpiaban solo localmente y volvían a aparecer
          // por la sincronización automática de ingresos cada 30 segundos)
          await firebaseSyncService.eliminarTodosLosIngresos();
          await firebaseSyncService.eliminarTodoElHistorico();

          // Sincronizar estadísticas vacías
          await firebaseSyncService.sincronizarEstadisticas({
            totalIngresos: 0,
            totalVentas: 0,
            totalCancelaciones: 0,
            ocupacionPorDia: {
              viernes: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 },
              sabado: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 },
              domingo: { ocupadas: 0, total: 0, disponibles: 0, porcentaje: 0 }
            }
          });
          
          // Limpiar QR en Firebase
          await firebaseSyncService.sincronizarQR({ nequi: null, daviplata: null, bancolombia: null });
          
          // 🆕 NUEVO: Limpiar datos del cliente en Firebase
          await firebaseSyncService.limpiarDatosCliente();
          
          console.log('✅ Datos limpiados en Firebase correctamente');
        } catch (firebaseError) {
          console.error('⚠️ Error limpiando datos en Firebase:', firebaseError);
          // Continuar aunque falle Firebase
        }
        
        mostrarMensaje('success', '🔄 ¡Aplicación reseteada completamente! Datos limpiados localmente y en la nube.');
        
        // Opcional: Recargar la página después de un breve delay
        setTimeout(() => {
          if (window.confirm('¿Quieres recargar la página para asegurar que todo esté completamente limpio?')) {
            window.location.reload();
          }
        }, 2000);
        
      } catch (error) {
        console.error('❌ Error durante el reset:', error);
        mostrarMensaje('error', '❌ Error durante el reset. Intenta de nuevo.');
      }
    }
  };

  
  // 🧹 FUNCIÓN MEJORADA PARA LIMPIAR REGISTROS DUPLICADOS
  const limpiarRegistrosDuplicados = () => {
    console.log('🧹 Iniciando limpieza de duplicados...');
    console.log('📊 Total de ingresos antes:', ingresos.length);
    
    const registrosUnicos = [];
    const procesados = new Set();
    const duplicadosEncontrados = [];
    const idsUnicos = new Set();

    ingresos.forEach((ingreso, index) => {
      // 🔍 Crear una clave única más robusta
      const clave = `${ingreso.tipo}-${ingreso.detalles?.cedula || 'sin_cedula'}-${ingreso.detalles?.nombre || 'sin_nombre'}-${ingreso.detalles?.palco || 'sin_palco'}-${JSON.stringify(ingreso.detalles?.dias || [])}-${ingreso.monto}-${ingreso.detalles?.metodoPago || 'sin_metodo'}`;
      
      // 🔍 Verificar si el ID ya existe (para evitar claves duplicadas en React)
      if (idsUnicos.has(ingreso.id)) {
        console.log('🔍 ID duplicado encontrado, generando nuevo ID:', ingreso.id);
        // Generar nuevo ID único
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const userAgent = navigator.userAgent.slice(-10);
        const sessionId = sessionStorage.getItem('sessionId') || Math.random().toString(36).substr(2, 9);
        const hash = btoa(`${ingreso.tipo}_${ingreso.monto}_${timestamp}_${randomId}_${userAgent}_${sessionId}`).replace(/[^a-zA-Z0-9]/g, '');
        ingreso.id = `ingreso_${timestamp}_${hash}_${Math.random().toString(36).substr(2, 5)}`;
      }
      
      if (!procesados.has(clave) && !idsUnicos.has(ingreso.id)) {
        registrosUnicos.push(ingreso);
        procesados.add(clave);
        idsUnicos.add(ingreso.id);
      } else {
        duplicadosEncontrados.push({
          index,
          ingreso,
          clave
        });
      }
    });

    console.log('🔍 Duplicados encontrados:', duplicadosEncontrados.length);
    console.log('📊 Registros únicos después:', registrosUnicos.length);

    // Solo actualizar si encontramos duplicados
    if (registrosUnicos.length < ingresos.length) {
      setIngresos(registrosUnicos);

      // Guardar en localStorage
      localStorage.setItem('feriaIngresos', JSON.stringify(registrosUnicos));

      const eliminados = ingresos.length - registrosUnicos.length;
      console.log(`✅ Se eliminaron ${eliminados} registro(s) duplicado(s)`);

      // 🗑️ Borrar también en Firebase. Antes esto no pasaba, así que la
      // sincronización automática de cada 30 segundos volvía a traer los
      // duplicados de vuelta.
      const idsAEliminar = duplicadosEncontrados.map(d => d.ingreso.id).filter(Boolean);
      firebaseSyncService.eliminarIngresosPorId(idsAEliminar)
        .then(() => {
          mostrarMensaje('success', `✅ Se eliminaron ${eliminados} registro(s) duplicado(s) (local y en Firebase). Estadísticas corregidas.`);
        })
        .catch((error) => {
          console.error('❌ Error eliminando duplicados en Firebase:', error);
          mostrarMensaje('warning', '⚠️ Se limpiaron localmente, pero no se pudieron borrar de Firebase. Podrían reaparecer.');
        });

      // Recalcular estadísticas inmediatamente
      setTimeout(() => {
        const stats = calcularEstadisticas();
        console.log('📊 Nuevas estadísticas:', stats);
      }, 100);
      
    } else {
      mostrarMensaje('info', '✅ No se encontraron registros duplicados');
    }
  };

const migrarPalcos = async () => {
  try {
    const palcosMigrados = crearPalcosIniciales();
    setPalcos(palcosMigrados);
    localStorage.setItem('feriaPalcos', JSON.stringify(palcosMigrados));
    
    // Sincronizar con Firebase para la app de cliente
    await firebaseSyncService.sincronizarPalcos(palcosMigrados);
    
    mostrarMensaje('success', 'Migración de palcos completada. Ahora tienes 40 palcos sincronizados con la app de cliente.');
  } catch (error) {
    console.error('Error en migración:', error);
    mostrarMensaje('error', 'Error en la migración. Los palcos se guardaron localmente pero no se sincronizaron.');
  }
};

// FUNCIÓN PARA INICIAR PROCESO DE PAGO
const handleIniciarPago = (reservaInfo) => {
  setReservaParaPago(reservaInfo);
  setPagoData({
    metodoPago: '',
    numeroComprobante: '',
    observaciones: reservaInfo.observaciones || '',
    imagenComprobante: null,
    // 🆕 NUEVO: Inicializar el monto enviado con el monto calculado
    montoEnviado: reservaInfo.monto || 0
  });
  setShowPagos(true);
};

// FUNCIÓN PARA MANEJAR CARGA DE IMAGEN
const handleImagenComprobante = (file) => {
  // 🆕 CORREGIDO: Ahora acepta directamente el archivo
  if (file) {
    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', 'Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('error', 'La imagen no puede ser mayor a 5MB');
      return;
    }

    // 🆕 CORREGIDO: Actualizar pagoData con la imagen
    setPagoData(prev => ({ 
      ...prev, 
      imagenComprobante: file 
    }));

    // 🆕 CORREGIDO: Convertir a Base64 para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPagoData(prev => ({ 
        ...prev, 
        imagenComprobante: file,
        imagenComprobantePreview: e.target.result // Base64 para preview
      }));
    };
    reader.readAsDataURL(file);
  }
};

// FUNCIÓN PARA ENVIAR COMPROBANTE (CLIENTE)
const handleEnviarComprobante = async (e) => {
  e.preventDefault();
  
  if (!pagoData.metodoPago) {
    mostrarMensaje('error', 'Selecciona un método de pago');
    return;
  }

  const metodo = METODOS_PAGO[pagoData.metodoPago];
  
// 🆕 VALIDACIÓN CORRECTA PARA App.jsx (vendedor):
// 🆕 VALIDACIÓN CORRECTA PARA App.jsx (vendedor):
if (metodo.requiereComprobante && !pagoData.imagenComprobante && !pagoData.numeroComprobante) {
  mostrarMensaje('error', 'Debes subir una imagen del comprobante O ingresar el número de referencia');
  return;
}

// 🆕 NUEVO: Validar que el monto enviado sea válido
if (!pagoData.montoEnviado || pagoData.montoEnviado <= 0) {
  mostrarMensaje('error', 'Ingresa el monto que enviaste');
  return;
}

  // Las observaciones son opcionales, no validamos que estén presentes
  // if (!pagoData.observaciones || pagoData.observaciones.trim() === '') {
  //   mostrarMensaje('error', 'Ingresa las observaciones del pago');
  //   return;
  // }

  setLoading(true);

  try {
    // Generar ID único para el pago
    const pagoId = `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let imagenURL = null;
    let driveInfo = null; // 🆕 NUEVO: Información de Google Drive
    let fallaImagen = null; // 🆕 Si la imagen falla, NO se pierde la reserva completa

    // Si hay imagen, procesarla a Base64. Si falla (formato no soportado,
    // archivo muy grande, etc.) NO se aborta el envío: antes esto perdía
    // TODA la reserva sin dejar rastro (ni en "Verificar Pagos" ni en
    // ningún lado). Ahora la reserva se guarda igual, sin imagen, y el
    // vendedor ve un aviso claro de qué pasó para volver a intentarlo.
    if (pagoData.imagenComprobante) {
      try {
        const imagenComprobante = await imageService.procesarComprobante(pagoData.imagenComprobante, pagoId, {
          cliente: reservaParaPago.nombre,
          cedula: reservaParaPago.cedula,
          palco: reservaParaPago.palco,
          monto: reservaParaPago.monto,
          metodoPago: metodo.nombre
        });

        imagenURL = imagenComprobante.data;
        driveInfo = imagenComprobante.driveInfo;

        console.log('✅ Comprobante procesado:', {
          tamaño: imageService.formatearTamaño(imagenComprobante.size),
          dimensiones: imagenComprobante.dimensions,
          driveUrl: driveInfo?.driveUrl || 'No subido a Drive'
        });

      } catch (error) {
        console.error('❌ Error procesando comprobante (la reserva se guarda igual):', error);
        fallaImagen = error.message;
      }
    }

    const pagoPendiente = {
      id: pagoId,
      fechaEnvio: new Date().toLocaleString('es-CO'),
      reserva: reservaParaPago,
      metodoPago: metodo.nombre,
      numeroComprobante: pagoData.numeroComprobante,
      montoEsperado: reservaParaPago.monto,
      montoEnviado: pagoData.montoEnviado || reservaParaPago.monto, // 🆕 NUEVO: Usar el monto enviado
      observaciones: pagoData.observacionesCliente || pagoData.observaciones,
      imagenComprobante: imagenURL, // Base64 de la imagen
      imagenComprobanteData: imagenURL, // Usar la imagen del comprobante real
      estado: 'pendiente_verificacion',
      datosMetodo: pagoData.metodoPago !== 'efectivo' ? metodo : null,
      appOrigen: 'vendedor' // 🆕 NUEVO: Identificar que es un pago del vendedor
    };

    setPagosPendientes(prev => [pagoPendiente, ...prev]);

    // 🔥 Subir el pago pendiente a Firebase de inmediato. Antes esto nunca
    // pasaba: el comprobante solo quedaba en el navegador de quien lo
    // enviaba, así que ningún admin en otro dispositivo lo veía en
    // "Verificar Pagos" hasta que fuera demasiado tarde (o nunca).
    firebaseSyncService.agregarPagoPendiente(pagoPendiente).catch((error) => {
      console.error('❌ Error sincronizando pago pendiente con Firebase:', error);
      mostrarMensaje('warning', '⚠️ El comprobante se guardó, pero no se pudo sincronizar con el servidor. Revisa tu conexión.');
    });

    // 🟡 Marcar el palco/las sillas como "reservado" DE INMEDIATO, mientras
    // se espera la verificación. Antes el palco se veía "Disponible" para
    // todos hasta que se aprobaba el pago, así que dos vendedores podían
    // venderlo dos veces mientras el primer comprobante seguía pendiente.
    setPalcos(prev => {
      const nuevosPalcos = prev.map(p => {
        if (p.numero !== reservaParaPago.palco) return p;

        if (p.tipo === 'completo') {
          return {
            ...p,
            estado: 'reservado',
            reservas: [{
              nombre: reservaParaPago.nombre,
              cedula: reservaParaPago.cedula,
              telefono: reservaParaPago.telefono,
              correo: reservaParaPago.correo,
              vendedor: reservaParaPago.vendedor,
              estadoPago: 'pendiente_verificacion',
              pagoId: pagoId
            }]
          };
        }

        const paresDias = parsearDiasReserva(reservaParaPago.dias, Number(reservaParaPago.cantidad) || 1);
        const nuevasReservas = { ...p.reservas };
        paresDias.forEach(({ dia, cantidad }) => {
          if (!nuevasReservas[dia] || !Array.isArray(nuevasReservas[dia])) {
            nuevasReservas[dia] = [];
          }
          nuevasReservas[dia] = [
            ...nuevasReservas[dia],
            {
              nombre: reservaParaPago.nombre,
              cedula: reservaParaPago.cedula,
              telefono: reservaParaPago.telefono,
              correo: reservaParaPago.correo,
              vendedor: reservaParaPago.vendedor,
              cantidad,
              estadoPago: 'pendiente_verificacion',
              pagoId: pagoId
            }
          ];
        });
        return { ...p, reservas: nuevasReservas };
      });

      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
      return nuevosPalcos;
    });

    agregarAlHistorico(
      'Comprobante Enviado',
      `${metodo.nombre} - $${Number(pagoData.montoEnviado || reservaParaPago.monto).toLocaleString()} - ${reservaParaPago.nombre} (Esperando verificación)`,
      {
        cedula: reservaParaPago.cedula,
        nombre: reservaParaPago.nombre,
        vendedor: reservaParaPago.vendedor,
        palco: reservaParaPago.palco,
        cantidad: reservaParaPago.cantidad,
        dias: reservaParaPago.dias
      }
    );

    if (fallaImagen) {
      mostrarMensaje('warning', `⚠️ La reserva se guardó y aparece en "Verificar Pagos", pero la imagen del comprobante no se pudo adjuntar (${fallaImagen}). Pídele al cliente que reenvíe la foto o verifica con el número de referencia.`);
    } else {
      mostrarMensaje('success', `✅ Comprobante enviado por $${Number(pagoData.montoEnviado || reservaParaPago.monto).toLocaleString()}. Esperando verificación del vendedor...`);
    }
    setShowPagos(false);
    
  } catch (error) {
    console.error('Error al enviar el comprobante:', error);
    mostrarMensaje('error', 'Error al enviar el comprobante');
  } finally {
    setLoading(false);
  }
};

// FUNCIÓN PARA VERIFICAR PAGO (VENDEDOR)
// 🆕 NUEVO: FUNCIÓN SEPARADA PARA VERIFICAR PAGOS DEL VENDEDOR
const handleVerificarPagoVendedor = async (pagoPendiente, aprobado, observacionesVendedor = '') => {
  setLoading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (aprobado) {
      const { reserva } = pagoPendiente;
      console.log('🔍 Verificando pago de la app vendedor');
      console.log('🔍 DEBUG: Reserva:', reserva);
      
      // Validar que la reserva existe
      if (!reserva) {
        console.error('❌ No se encontró la reserva en el pago');
        mostrarMensaje('error', '❌ Error: No se encontró la reserva');
        return;
      }

      // ✅ Marcar el pago como resuelto en Firebase ANTES de aplicar cambios.
      // Antes esto nunca se hacía, así que el pago se quedaba "pendiente"
      // para siempre en Firebase y podía reaparecer y aprobarse dos veces
      // (ingreso duplicado, venta duplicada, ocupación inflada).
      try {
        await firebaseSyncService.resolverPagoVendedor(
          pagoPendiente.id,
          true,
          user?.displayName || user?.email || 'Vendedor'
        );
      } catch (error) {
        console.error('❌ No se pudo marcar el pago como resuelto en Firebase:', error);
        mostrarMensaje('error', '❌ Error de conexión: no se pudo confirmar el pago. Intenta de nuevo.');
        return;
      }

      // Lógica para pagos de la app vendedor. La reserva ya se marcó como
      // "reservado" (pendiente de verificación) en palco.reservas desde que
      // se envió el comprobante (handleEnviarComprobante), así que aquí solo
      // hay que CONFIRMARLA (buscarla por pagoId y quitarle la marca de
      // pendiente) — no volver a agregarla, porque eso la duplicaría.
      if (reserva.tipoPalco === 'completo' || reserva.cantidad === '10 sillas (completo)') {
        setPalcos(prev => {
          const nuevosPalcos = prev.map(p => {
            if (p.numero !== reserva.palco) return p;
            const yaEstabaReservado = (p.reservas || []).some(r => r.pagoId === pagoPendiente.id);
            return {
              ...p,
              estado: 'vendido',
              reservas: yaEstabaReservado
                ? p.reservas.map(r => r.pagoId === pagoPendiente.id ? { ...r, estadoPago: 'confirmado' } : r)
                : [{
                    nombre: reserva.nombre,
                    cedula: reserva.cedula,
                    telefono: reserva.telefono,
                    correo: reserva.correo,
                    vendedor: reserva.vendedor,
                    estadoPago: 'confirmado'
                  }]
            };
          });

          firebaseSyncService.sincronizarPalcos(nuevosPalcos);
          return nuevosPalcos;
        });
      } else {
        // Para palcos por sillas
        const paresDias = parsearDiasReserva(reserva.dias, Number(reserva.cantidad) || 1);

        setPalcos(prev => {
          const nuevosPalcos = prev.map(p => {
            if (p.numero !== reserva.palco) return p;

            const nuevasReservas = { ...p.reservas };
            let seEncontroPendiente = false;

            paresDias.forEach(({ dia }) => {
              const listaDia = nuevasReservas[dia] || [];
              const index = listaDia.findIndex(r => r.pagoId === pagoPendiente.id);
              if (index !== -1) {
                seEncontroPendiente = true;
                nuevasReservas[dia] = listaDia.map((r, i) =>
                  i === index ? { ...r, estadoPago: 'confirmado' } : r
                );
              }
            });

            // Respaldo defensivo: si por algún motivo no estaba pre-reservada
            // (ej. datos antiguos de antes de este arreglo), se agrega ahora.
            if (!seEncontroPendiente) {
              paresDias.forEach(({ dia, cantidad }) => {
                if (!nuevasReservas[dia] || !Array.isArray(nuevasReservas[dia])) {
                  nuevasReservas[dia] = [];
                }
                nuevasReservas[dia] = [
                  ...nuevasReservas[dia],
                  {
                    nombre: reserva.nombre,
                    cedula: reserva.cedula,
                    telefono: reserva.telefono,
                    correo: reserva.correo,
                    vendedor: reserva.vendedor,
                    cantidad,
                    estadoPago: 'confirmado'
                  }
                ];
              });
            }

            return { ...p, reservas: nuevasReservas };
          });

          firebaseSyncService.sincronizarPalcos(nuevosPalcos);
          return nuevosPalcos;
        });
      }

      registrarIngreso('venta', pagoPendiente.montoEsperado || 0, {
        cedula: reserva.cedula,
        nombre: reserva.nombre,
        vendedor: reserva.vendedor,
        palco: reserva.palco,
        cantidad: reserva.cantidad,
        dias: reserva.dias,
        metodoPago: pagoPendiente.metodoPago,
        numeroComprobante: pagoPendiente.numeroComprobante,
        estadoPago: 'verificado_y_confirmado'
      });

      agregarAlHistorico(
        'Pago Verificado y Venta Confirmada',
        `${pagoPendiente.metodoPago} - $${pagoPendiente.montoEsperado ? pagoPendiente.montoEsperado.toLocaleString() : '0'} - ${reserva.nombre}`,
        {
          cedula: reserva.cedula,
          nombre: reserva.nombre,
          vendedor: reserva.vendedor,
          palco: reserva.palco,
          cantidad: reserva.cantidad,
          dias: reserva.dias
        }
      );

      mostrarMensaje('success', '✅ Pago verificado y venta confirmada exitosamente');
    } else {
      // ✅ Marcar el pago como rechazado en Firebase (mismo motivo que arriba)
      try {
        await firebaseSyncService.resolverPagoVendedor(
          pagoPendiente.id,
          false,
          user?.displayName || user?.email || 'Vendedor',
          observacionesVendedor
        );
      } catch (error) {
        console.error('❌ No se pudo marcar el pago como rechazado en Firebase:', error);
        mostrarMensaje('error', '❌ Error de conexión: no se pudo rechazar el pago. Intenta de nuevo.');
        return;
      }

      // 🔓 Liberar las sillas/el palco que quedaron reservados mientras se
      // esperaba verificar el pago (se buscan por pagoId, el mismo que se
      // asignó al reservarlas en handleEnviarComprobante). Antes esto no
      // pasaba: si se rechazaba un pago, el palco se quedaba "reservado"
      // para siempre bloqueando ese cupo.
      const { reserva: reservaRechazada } = pagoPendiente;
      if (reservaRechazada) {
        setPalcos(prev => {
          const nuevosPalcos = prev.map(p => {
            if (p.numero !== reservaRechazada.palco) return p;

            if (p.tipo === 'completo') {
              const teniaEstePago = (p.reservas || []).some(r => r.pagoId === pagoPendiente.id);
              return teniaEstePago ? { ...p, estado: 'disponible', reservas: [] } : p;
            }

            const nuevasReservas = { ...p.reservas };
            Object.keys(nuevasReservas).forEach(dia => {
              nuevasReservas[dia] = (nuevasReservas[dia] || []).filter(r => r.pagoId !== pagoPendiente.id);
            });
            return { ...p, reservas: nuevasReservas };
          });

          firebaseSyncService.sincronizarPalcos(nuevosPalcos);
          return nuevosPalcos;
        });
      }

      agregarAlHistorico(
        'Pago Rechazado',
        `${pagoPendiente.metodoPago} - ${pagoPendiente.reserva.nombre} - Motivo: ${observacionesVendedor}`,
        {
          cedula: pagoPendiente.reserva.cedula,
          nombre: pagoPendiente.reserva.nombre,
          vendedor: pagoPendiente.reserva.vendedor,
          palco: pagoPendiente.reserva.palco
        }
      );

      mostrarMensaje('error', '❌ Pago rechazado. Las sillas quedaron liberadas y disponibles nuevamente.');
    }

    // El pago ya quedó marcado como resuelto en Firebase (arriba), así que
    // no puede reaparecer como pendiente. Esto solo limpia la lista local
    // para que desaparezca de inmediato sin esperar al listener.
    setPagosPendientes(prev => prev.filter(p => p.id !== pagoPendiente.id));
    
  } catch (error) {
    console.error('❌ Error en handleVerificarPagoVendedor:', error);
    mostrarMensaje('error', `Error al procesar la verificación: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// 🆕 NUEVO: FUNCIÓN SEPARADA PARA VERIFICAR RESERVAS DEL CLIENTE
const handleVerificarReservaCliente = async (reserva, aprobado, observacionesVendedor = '') => {
  setLoading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (aprobado) {
      console.log('🔍 Verificando reserva del cliente:', reserva.id);
      
      try {
        // Confirmar la reserva del cliente
        const vendedorConfirmador = user?.displayName || user?.email || 'Vendedor';
        await firebaseSyncService.confirmarReservaCliente(reserva.id, vendedorConfirmador);
        console.log('✅ Reserva del cliente confirmada');
        
        // Actualizar estado del palco
        console.log('🔍 Actualizando palco:', reserva.palco, 'Tipo:', reserva.tipoPalco);
        
        const palcoNumero = parseInt(reserva.palco);
        const nuevosPalcos = palcos.map(palco => {
          if (palco.numero === palcoNumero) {
            console.log('🔍 Encontrado palco para actualizar:', palco.numero);
            
            if (reserva.tipoPalco === 'completo') {
              console.log('🔍 Marcando palco como vendido y guardando reserva');
              return { 
                ...palco, 
                estado: 'vendido',
                reservas: [{
                  nombre: reserva.nombre,
                  cedula: reserva.cedula,
                  telefono: reserva.telefono,
                  correo: reserva.correo,
                  vendedor: vendedorConfirmador,
                  monto: reserva.monto,
                  dias: reserva.dias,
                  fecha: reserva.fecha,
                  tipoPalco: reserva.tipoPalco,
                  id: reserva.id
                }]
              };
            } else {
              console.log('🔍 Agregando reserva por sillas');
              
              // Parsear los días de la reserva
              const diasReserva = [];
              if (reserva.dias && typeof reserva.dias === 'string') {
                const diasArray = reserva.dias.split(', ');
                diasArray.forEach(diaStr => {
                  const [diaNombre, cantidad] = diaStr.split(': ');
                  if (diaNombre && cantidad) {
                    diasReserva.push({ 
                      dia: diaNombre.trim(), 
                      cantidad: parseInt(cantidad) 
                    });
                  }
                });
              }
              
              console.log('🔍 Días de reserva parseados:', diasReserva);
              
              const reservasActualizadas = { ...palco.reservas };
              diasReserva.forEach(({ dia, cantidad }) => {
                if (!reservasActualizadas[dia]) {
                  reservasActualizadas[dia] = [];
                }
                reservasActualizadas[dia].push({
                  nombre: reserva.nombre,
                  cedula: reserva.cedula,
                  telefono: reserva.telefono,
                  correo: reserva.correo,
                  vendedor: vendedorConfirmador,
                  cantidad: cantidad
                });
              });
              
              return { ...palco, reservas: reservasActualizadas };
            }
          }
          return palco;
        });
        
        console.log('🔍 Palcos actualizados:', nuevosPalcos);
        setPalcos(nuevosPalcos);
        await firebaseSyncService.sincronizarPalcos(nuevosPalcos);
        
        mostrarMensaje('success', '✅ Reserva del cliente confirmada exitosamente');
        
      } catch (error) {
        console.error('❌ Error confirmando reserva del cliente:', error);
        mostrarMensaje('error', '❌ Error confirmando la reserva');
      }
    } else {
      try {
        // Rechazar la reserva del cliente
        const vendedorRechazador = user?.displayName || user?.email || 'Vendedor';
        await firebaseSyncService.rechazarReservaCliente(reserva.id, observacionesVendedor, vendedorRechazador);
        console.log('❌ Reserva del cliente rechazada');
        
        mostrarMensaje('error', '❌ Reserva rechazada');
      } catch (error) {
        console.error('❌ Error rechazando reserva del cliente:', error);
        mostrarMensaje('error', '❌ Error rechazando la reserva');
      }
    }
    
  } catch (error) {
    console.error('❌ Error en handleVerificarReservaCliente:', error);
    mostrarMensaje('error', `Error al procesar la verificación: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// 🆕 NUEVO: FUNCIÓN UNIFICADA QUE DIRIGE A LA FUNCIÓN CORRECTA
const handleVerificarPago = async (pagoPendiente, aprobado, observacionesVendedor = '') => {
  console.log('🔍 DEBUG: Verificando pago:', pagoPendiente);
  console.log('🔍 DEBUG: appOrigen:', pagoPendiente.appOrigen);
  console.log('🔍 DEBUG: reservaId:', pagoPendiente.reservaId);
  
  // Si es un pago del vendedor, usar la función específica
  if (pagoPendiente.appOrigen === 'vendedor') {
    console.log('🔍 Dirigiendo a función de pagos del vendedor');
    return handleVerificarPagoVendedor(pagoPendiente, aprobado, observacionesVendedor);
  }
  
  // Si es un pago del cliente, usar la función específica
  if (pagoPendiente.appOrigen === 'cliente' && pagoPendiente.reservaId) {
    console.log('🔍 Dirigiendo a función de reservas del cliente');
    // Obtener la reserva desde Firebase
    const reservaDoc = await firebaseSyncService.getReservaById(pagoPendiente.reservaId);
    if (reservaDoc) {
      return handleVerificarReservaCliente(reservaDoc, aprobado, observacionesVendedor);
    }
  }
  
  // Si no coincide con ningún caso, mostrar error
  console.error('❌ Tipo de pago no reconocido:', pagoPendiente.appOrigen);
  mostrarMensaje('error', '❌ Tipo de pago no reconocido');
};

// NUEVA FUNCIÓN PARA CONFIRMAR RESERVA (REEMPLAZA LA EXISTENTE)
const handleConfirmarReservaConPago = async (e) => {
  e.preventDefault();
  
  if (!validarFormulario()) return;
  
  setLoading(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 🆕 NUEVO: Actualizar el estado de los palcos ANTES de crear la info de pago
    if (palcoSeleccionado.tipo === 'completo') {
      const nuevosPalcos = palcos.map(p =>
        p.numero === palcoSeleccionado.numero
          ? {
              ...p,
              estado: 'vendido',
              reservas: [{
                nombre: form.nombre,
                cedula: form.cedula,
                telefono: form.telefono,
                correo: form.correo,
                vendedor: form.vendedor,
              }]
            }
          : p
      );
      setPalcos(nuevosPalcos);
      
      // Sincronizar con Firebase inmediatamente
      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
    } else {
      // Para palcos de sillas, usar el día del filtro si no hay días seleccionados
      const diasAReservar = form.dias.length > 0 ? form.dias : [filtroDia];
      const nuevosPalcos = palcos.map(p => {
        if (p.numero !== palcoSeleccionado.numero) return p;
        const nuevasReservas = { ...p.reservas };
        for (let dia of diasAReservar) {
          nuevasReservas[dia] = [
            ...nuevasReservas[dia],
            {
              nombre: form.nombre,
              cedula: form.cedula,
              telefono: form.telefono,
              correo: form.correo,
              vendedor: form.vendedor,
              cantidad: Number(form.cantidad)
            }
          ];
        }
        return { ...p, reservas: nuevasReservas };
      });
      setPalcos(nuevosPalcos);
      
      // Sincronizar con Firebase inmediatamente
      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
    }
    
    const infoReserva = {
      id: Date.now(),
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      correo: form.correo,
      palco: palcoSeleccionado.numero,
      tipoPalco: palcoSeleccionado.tipo,
      monto: palcoSeleccionado.tipo === 'completo' ? palcoSeleccionado.precio : calcularPrecioSillas(),
      vendedor: form.vendedor,
      cantidad: palcoSeleccionado.tipo === 'completo' ? '10 sillas (completo)' : form.cantidad,
      dias: palcoSeleccionado.tipo === 'completo' ? 'Todos los días' : form.dias.join(', ')
    };

    agregarAlHistorico(
      'Reserva Creada (Pendiente de Pago)',
      `${palcoSeleccionado.tipo === 'completo' ? 'Palco completo' : form.cantidad + ' sillas'} Palco ${palcoSeleccionado.numero} - ${form.nombre}`,
      {
        cedula: form.cedula,
        nombre: form.nombre,
        vendedor: form.vendedor,
        palco: palcoSeleccionado.numero,
        cantidad: infoReserva.cantidad,
        dias: infoReserva.dias
      }
    );

    mostrarMensaje('success', '🕐 Reserva creada. Procede con el pago para confirmarla.');
    
    setTimeout(() => {
      setShowReserva(false);
      handleIniciarPago(infoReserva);
    }, 2000);
    
  } catch (error) {
    mostrarMensaje('error', 'Error al procesar la reserva. Intente nuevamente.');
  } finally {
    setLoading(false);
  }
};

// COMPONENTE PARA MOSTRAR INSTRUCCIONES DE PAGO
// Función para cargar imagen QR
const handleCargarQR = (metodo, event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    console.log(`📸 Cargando QR para ${metodo}:`, file.name);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Actualizar estado local
        setQrData(prev => ({ ...prev, [metodo]: e.target.result }));
        
        // Guardar en localStorage para persistencia
        localStorage.setItem(`qr_${metodo}`, e.target.result);
        
        // Sincronizar con Firebase si es Nequi o Daviplata
        if (metodo === 'nequi' || metodo === 'daviplata') {
          const qrDataActual = await firebaseSyncService.obtenerQR();
          const qrDataCompleto = {
            nequi: metodo === 'nequi' ? e.target.result : (qrDataActual.nequi || ''),
            daviplata: metodo === 'daviplata' ? e.target.result : (qrDataActual.daviplata || '')
          };
          
          console.log('🔄 Sincronizando QR con Firebase:', qrDataCompleto);
          await firebaseSyncService.sincronizarQR(qrDataCompleto);
        }
        
        mostrarMensaje('success', `✅ QR de ${METODOS_PAGO[metodo]?.nombre || metodo} cargado correctamente`);
        
        console.log(`✅ QR ${metodo} cargado y sincronizado exitosamente`);
        
      } catch (error) {
        console.error(`❌ Error sincronizando QR ${metodo}:`, error);
        mostrarMensaje('error', `❌ Error sincronizando QR: ${error.message}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error(`❌ Error leyendo archivo QR ${metodo}:`, error);
      mostrarMensaje('error', `❌ Error leyendo archivo: ${error.message}`);
    };
    
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error(`❌ Error procesando QR ${metodo}:`, error);
    mostrarMensaje('error', `❌ Error procesando QR: ${error.message}`);
  }
};

// Función para cargar QR desde localStorage y Firebase al iniciar
useEffect(() => {
  const cargarQR = async () => {
    try {
      console.log('🔄 Iniciando carga de códigos QR...');
      
      // Cargar desde localStorage primero
      const nequiQR = localStorage.getItem('qr_nequi');
      const daviplataQR = localStorage.getItem('qr_daviplata');
      const bancolombiaQR = localStorage.getItem('qr_bancolombia');
      
      console.log('🔍 Cargando QR desde localStorage:', {
        nequi: nequiQR ? 'Cargado' : 'No encontrado',
        daviplata: daviplataQR ? 'Cargado' : 'No encontrado',
        bancolombia: bancolombiaQR ? 'Cargado' : 'No encontrado'
      });
      
      // Cargar desde Firebase también
      const qrData = await firebaseSyncService.obtenerQR();
      console.log('🔍 Cargando QR desde Firebase:', {
        nequi: qrData.nequi ? 'Cargado' : 'No encontrado',
        daviplata: qrData.daviplata ? 'Cargado' : 'No encontrado',
        bancolombia: qrData.bancolombia ? 'Cargado' : 'No encontrado'
      });
      
      // Priorizar Firebase, fallback a localStorage
      const nequiFinal = qrData.nequi || nequiQR;
      const daviplataFinal = qrData.daviplata || daviplataQR;
      const bancolombiaFinal = qrData.bancolombia || bancolombiaQR;
      
      // Actualizar estado global
      setQrData({
        nequi: nequiFinal,
        daviplata: daviplataFinal,
        bancolombia: bancolombiaFinal
      });
      
      // Sincronizar con localStorage si Firebase tiene datos más recientes
      if (qrData.nequi && qrData.nequi !== nequiQR) {
        localStorage.setItem('qr_nequi', qrData.nequi);
        console.log('💾 QR Nequi actualizado en localStorage desde Firebase');
      }
      if (qrData.daviplata && qrData.daviplata !== daviplataQR) {
        localStorage.setItem('qr_daviplata', qrData.daviplata);
        console.log('💾 QR Daviplata actualizado en localStorage desde Firebase');
      }
      
      // Sincronizar con Firebase si localStorage tiene datos más recientes
      if ((nequiQR && !qrData.nequi) || (daviplataQR && !qrData.daviplata)) {
        const qrDataCompleto = {
          nequi: nequiFinal,
          daviplata: daviplataFinal
        };
        
        console.log('🔄 Sincronizando localStorage con Firebase:', qrDataCompleto);
        await firebaseSyncService.sincronizarQR(qrDataCompleto);
      }
      
      console.log('✅ QR cargado exitosamente:', {
        nequi: nequiFinal ? 'Disponible' : 'No disponible',
        daviplata: daviplataFinal ? 'Disponible' : 'No disponible',
        bancolombia: bancolombiaFinal ? 'Disponible' : 'No disponible'
      });
      
    } catch (error) {
      console.error('❌ Error cargando QR:', error);
      // Fallback a localStorage si Firebase falla
      const nequiQR = localStorage.getItem('qr_nequi');
      const daviplataQR = localStorage.getItem('qr_daviplata');
      const bancolombiaQR = localStorage.getItem('qr_bancolombia');
      
      setQrData({
        nequi: nequiQR,
        daviplata: daviplataQR,
        bancolombia: bancolombiaQR
      });
      
      console.log('⚠️ Fallback a localStorage debido a error de Firebase');
    }
  };
  
  cargarQR();
}, []);

// 🆕 NUEVO: useEffect para inicializar listeners de Firebase para reservas del cliente
useEffect(() => {
  const inicializarListenersFirebase = () => {
    try {
      console.log('🔍 Inicializando listeners de Firebase para reservas del cliente...');
      
      // 🔄 Listener en tiempo real para PALCOS: así todos los vendedores ven
      // al instante las ventas/reservas/cambios que hacen los demás, en vez de
      // depender de recargar la página (que además solo leía localStorage).
      const unsubscribePalcosLive = firebaseSyncService.onPalcosChange((data) => {
        if (data && Array.isArray(data.palcos) && data.palcos.length > 0) {
          console.log(`🔄 Palcos actualizados en tiempo real (origen: ${data.appOrigen || 'desconocido'})`);
          setPalcos(data.palcos);
          localStorage.setItem('feriaPalcos', JSON.stringify(data.palcos));
          setSyncPalcosEnVivo(true);
          setUltimaSyncPalcos(new Date());
        }
      });

      // 📜 Listener en tiempo real para el HISTÓRICO compartido: antes cada
      // vendedor solo veía su propio historial (localStorage por navegador).
      // getHistoricoFiltrado() sigue aplicando la regla de "vendedor ve solo
      // lo suyo, admin ve todo" sobre estos datos ya centralizados.
      const unsubscribeHistoricoLive = firebaseSyncService.onHistoricoChange((registros) => {
        console.log(`🔄 Histórico actualizado en tiempo real: ${registros.length} registros`);
        setHistorico(registros);
      });

      // Listener para pagos del vendedor (para "Verificar Pagos")
      const unsubscribePagosVendedor = firebaseSyncService.onPagosVendedorChange((pagos) => {
        console.log('🔄 Pagos del vendedor actualizados:', pagos.length);
        setPagosPendientes(pagos);
      });
      
      // Listener para pagos del cliente (para "Reservas Cliente")
      const unsubscribePagosCliente = firebaseSyncService.onPagosClienteChange((pagos) => {
        console.log('🔄 Pagos del cliente actualizados:', pagos.length);
        setPagosCliente(pagos);
      });
      
      // Listener para reservas del cliente
      const unsubscribeReservas = firebaseSyncService.onReservasClienteChange((reservas) => {
        console.log('🔄 Reservas del cliente actualizadas:', reservas.length);
        setReservasCliente(reservas);
      });

      // 🆕 NUEVO: Listener para eventos de QR (sincronización en tiempo real)
      const handleQrActualizado = (event) => {
        const { tipo, data } = event.detail;
        console.log(`📡 QR ${tipo} actualizado recibido:`, data ? 'Con datos' : 'Sin datos');
        
        setQrData(prev => ({
          ...prev,
          [tipo]: data
        }));
        
        // Mostrar mensaje de confirmación
        mostrarMensaje('success', `✅ QR de ${tipo} sincronizado correctamente`);
      };

      const handleQrEliminado = (event) => {
        const { tipo } = event.detail;
        console.log(`📡 QR ${tipo} eliminado recibido`);
        
        setQrData(prev => ({
          ...prev,
          [tipo]: null
        }));
        
        // Mostrar mensaje de confirmación
        mostrarMensaje('info', `🗑️ QR de ${tipo} eliminado correctamente`);
      };

      // Agregar event listeners
      window.addEventListener('qrActualizado', handleQrActualizado);
      window.addEventListener('qrEliminado', handleQrEliminado);

      return () => {
        unsubscribePalcosLive();
        unsubscribeHistoricoLive();
        unsubscribePagosVendedor();
        unsubscribePagosCliente();
        unsubscribeReservas();
        window.removeEventListener('qrActualizado', handleQrActualizado);
        window.removeEventListener('qrEliminado', handleQrEliminado);
      };
    } catch (error) {
      console.error('❌ Error inicializando listeners de Firebase:', error);
    }
  };

  inicializarListenersFirebase();
}, []);

const InstruccionesPago = ({ metodo, monto, reserva }) => {
  if (!metodo) return null;
  
  // Obtener imagen QR cargada según el método
  let qrImage = null;
  if (metodo.tieneQR) {
    if (metodo.metodoKey === 'nequi') {
      qrImage = qrData.nequi;
    } else if (metodo.metodoKey === 'daviplata') {
      qrImage = qrData.daviplata;
    } else if (metodo.metodoKey === 'bancolombia') {
      qrImage = qrData.bancolombia;
    }
  }
  
  console.log('🔍 InstruccionesPago - QR Debug:', {
    metodo: metodo.nombre,
    metodoKey: metodo.metodoKey,
    tieneQR: metodo.tieneQR,
    qrImage: qrImage ? 'Disponible' : 'No disponible',
    qrData: qrData
  });
  
  return (
    <div style={{
      backgroundColor: '#e8f4fd',
      padding: '16px',
      borderRadius: '8px',
      margin: '12px 0',
      border: `2px solid ${metodo.color}`
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: metodo.color }}>
        {metodo.icono} Instrucciones para {metodo.nombre}:
      </h4>
      
      {metodo.numero && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Número:</strong> 
          <span style={{ 
            backgroundColor: '#fff', 
            padding: '4px 8px', 
            borderRadius: '4px',
            marginLeft: '8px',
            fontFamily: 'monospace',
            fontSize: '16px'
          }}>
            {metodo.numero}
          </span>
        </div>
      )}
      
      {metodo.banco && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Banco:</strong> {metodo.banco}<br/>
          <strong>Cuenta:</strong> {metodo.cuenta}<br/>
          <strong>Titular:</strong> {metodo.titular}
        </div>
      )}
      
      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#555' }}>
        📋 {metodo.instrucciones}
      </p>
      
      {metodo.tieneQR && (
        <div style={{ 
          marginTop: '12px', 
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h5 style={{ margin: '0 0 12px 0', color: metodo.color }}>
            📱 Código QR de {metodo.nombre}
          </h5>
          
          {qrImage ? (
            // Mostrar QR cargado
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <img 
                src={qrImage} 
                alt={`Código QR ${metodo.nombre}`}
                style={{ 
                  width: '180px', 
                  height: '180px',
                  border: `3px solid ${metodo.color}`,
                  borderRadius: '12px',
                  boxShadow: `0 4px 12px ${metodo.color}30`
                }}
              />
            </div>
          ) : (
            // Botón para cargar QR
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '180px',
                height: '180px',
                border: `3px dashed ${metodo.color}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                  📱
                </div>
                <div style={{ fontSize: '12px', textAlign: 'center', color: '#666' }}>
                  Cargar QR de {metodo.nombre}
                </div>
              </div>
            </div>
          )}
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '8px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
              📞 Número de Teléfono:
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{metodo.icono} <strong>{metodo.nombre}:</strong> {metodo.numero}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(metodo.numero);
                    alert(`Número de ${metodo.nombre} copiado al portapapeles`);
                  }}
                  style={{ 
                    backgroundColor: metodo.color, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    padding: '2px 6px', 
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            </div>
          </div>
          
          {/* Botón para cargar/cambiar QR - Solo Administradores */}
          {user?.role === 'ADMIN_PRINCIPAL' || user?.role === 'ADMIN_SECUNDARIO' ? (
            <div style={{ marginBottom: '8px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCargarQR(metodo.metodoKey, e)}
                style={{ display: 'none' }}
                id={`qr-upload-${metodo.metodoKey}`}
              />
              <label
                htmlFor={`qr-upload-${metodo.metodoKey}`}
                style={{
                  backgroundColor: metodo.color,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'inline-block'
                }}
              >
                {qrImage ? '🔄 Cambiar QR' : '📁 Cargar QR'}
              </label>
            </div>
          ) : null}
          
          <small style={{ color: '#666', fontSize: '12px', display: 'block' }}>
            💡 Escanea el código con tu app bancaria
          </small>
          {qrImage && (
            <small style={{ color: metodo.color, fontSize: '11px', fontWeight: 'bold' }}>
              ✅ QR cargado correctamente
            </small>
          )}
        </div>
      )}
    </div>
  );
};
// --- Funciones para histórico ---  // <-- Esta sería la línea 225 actual
  // --- Funciones para histórico ---
  const agregarAlHistorico = (accion, detalles, datosCliente = {}) => {
    // Convertir detalles a string si es un objeto
    let detallesString = detalles;
    if (typeof detalles === 'object' && detalles !== null) {
      if (accion === 'venta_confirmada') {
        detallesString = `Venta confirmada: Palco ${detalles.palco} - $${detalles.monto?.toLocaleString() || detalles.monto} - Cliente: ${detalles.cliente}`;
      } else if (accion === 'pago_rechazado') {
        detallesString = `Pago rechazado: Palco ${detalles.palco} - $${detalles.monto?.toLocaleString() || detalles.monto} - Cliente: ${detalles.cliente}${detalles.motivo ? ` - Motivo: ${detalles.motivo}` : ''}`;
      } else {
        detallesString = JSON.stringify(detalles);
      }
    }

    // 🔍 Evitar registrar el mismo evento dos veces si se llama muy seguido
    // (por ejemplo, por un pago que se procesó/reapareció dos veces)
    const ahora = Date.now();
    const esDuplicadoReciente = historico.some(h =>
      h.accion === accion &&
      (h.palco || '') === (datosCliente.palco || '') &&
      (h.cedula || '') === (datosCliente.cedula || '') &&
      (h.vendedor || '') === (datosCliente.vendedor || '') &&
      h._clienteTimestamp && (ahora - h._clienteTimestamp) < 5000
    );

    if (esDuplicadoReciente) {
      console.warn('⚠️ Registro de histórico duplicado detectado, se omite:', accion, datosCliente);
      return;
    }

    const nuevoRegistro = {
      _clienteTimestamp: ahora,
      fecha: new Date().toLocaleString('es-CO'),
      accion,
      detalles: detallesString,
      cedula: datosCliente.cedula || '',
      nombreCliente: datosCliente.nombre || '',
      vendedor: datosCliente.vendedor || '',
      palco: datosCliente.palco || '',
      cantidad: datosCliente.cantidad || '',
      dias: datosCliente.dias || ''
    };

    // 📜 Guardar en el histórico compartido de Firebase. El listener
    // onHistoricoChange actualiza el estado local `historico` cuando
    // Firebase confirma el registro (así todos los admins lo ven, y cada
    // vendedor lo sigue filtrando a solo lo suyo con getHistoricoFiltrado).
    firebaseSyncService.agregarHistorico(nuevoRegistro).catch((error) => {
      console.error('❌ Error guardando en histórico compartido:', error);
    });
  };

  // Función para filtrar histórico
  const getHistoricoFiltrado = () => {
    let historicoFiltrado = historico;
    
    // Verificar que user existe
    if (!user) {
      console.log('⚠️ Usuario no válido para filtrado de histórico');
      return historicoFiltrado;
    }
    
    // 🆕 DEBUG: Analizar diferencias entre vendedores
    console.log('🔍 DEBUG HISTÓRICO:');
    console.log('🔍 - Usuario actual:', user);
    console.log('🔍 - user.vendedor:', user.vendedor);
    console.log('🔍 - canViewAllHistory():', canViewAllHistory());
    console.log('🔍 - canViewOwnHistory():', canViewOwnHistory());
    console.log('🔍 - Total registros en histórico:', historico.length);
    console.log('🔍 - Registros con vendedor:', historico.filter(r => r.vendedor).length);
    console.log('🔍 - Vendedores únicos en histórico:', [...new Set(historico.filter(r => r.vendedor).map(r => r.vendedor))]);
    
    // Los vendedores solo ven su propio historial
    if (!canViewAllHistory() && canViewOwnHistory()) {
      // 🆕 NUEVO: Obtener el nombre del vendedor correctamente
      const nombreVendedor = user.vendedor || user['vendedor '] || user.name;
      console.log('🔍 - Filtrando por vendedor:', nombreVendedor);
      
      historicoFiltrado = historicoFiltrado.filter(registro => {
        // Verificar que registro.vendedor existe
        if (!registro.vendedor) {
          console.log('⚠️ Registro sin vendedor:', registro);
          return false;
        }
        const coincide = registro.vendedor.toLowerCase() === nombreVendedor.toLowerCase();
        console.log('🔍 - Registro vendedor:', registro.vendedor, 'vs Usuario:', nombreVendedor, 'Coincide:', coincide);
        return coincide;
      });
      
      console.log('🔍 - Registros filtrados para este vendedor:', historicoFiltrado.length);
      
      // 🆕 NUEVO: Auto-actualizar filtro de vendedor si está vacío
      if (!filtrosHistorico.vendedor && nombreVendedor) {
        setFiltrosHistorico(prev => ({
          ...prev,
          vendedor: nombreVendedor
        }));
      }
    }
    
    return historicoFiltrado.filter(registro => {
      const coincideCedula = !filtrosHistorico.cedula || 
        registro.cedula.toLowerCase().includes(filtrosHistorico.cedula.toLowerCase());
      
      const coincideVendedor = !filtrosHistorico.vendedor || 
        registro.vendedor.toLowerCase().includes(filtrosHistorico.vendedor.toLowerCase());
      
      const coincidePalco = !filtrosHistorico.palco || 
        registro.palco.toString().includes(filtrosHistorico.palco);
      
      const coincideAccion = accionPerteneceACategoria(registro.accion, filtrosHistorico.accion);

      return coincideCedula && coincideVendedor && coincidePalco && coincideAccion;
    });
  };

  const limpiarFiltrosHistorico = () => {
    // Si es un vendedor, automáticamente rellenar con su nombre
    const nombreVendedor = user?.vendedor || user?.['vendedor '] || user?.name || '';
    const vendedorFiltro = (!canViewAllHistory() && canViewOwnHistory()) ? nombreVendedor : '';
    
    setFiltrosHistorico({
      cedula: '',
      vendedor: vendedorFiltro,
      palco: '',
      accion: 'todas'
    });
  };

  // --- Funciones para mensajes y UX ---
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto, visible: true });
    setTimeout(() => {
      setMensaje({ tipo: '', texto: '', visible: false });
    }, 3000);
  };
  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function validarTelefono(telefono) {
    return /^\d{7,15}$/.test(telefono);
  }
  const validarFormulario = () => {
    const errors = {};
  
    // Validaciones campo por campo
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!form.cedula.trim()) errors.cedula = 'La cédula es obligatoria';
    if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio';
    else if (!validarTelefono(form.telefono)) errors.telefono = 'Teléfono inválido (solo números, 7-15 dígitos)';
    if (!form.correo.trim()) errors.correo = 'El correo es obligatorio';
    else if (!validarEmail(form.correo)) errors.correo = 'Correo electrónico inválido';
    if (!form.vendedor.trim()) errors.vendedor = 'El nombre del vendedor es obligatorio';
  
// Validaciones específicas según tipo de palco
if (palcoSeleccionado) {
  if (palcoSeleccionado.tipo === 'sillas') {
    if (form.dias.length === 0) errors.dias = 'Debe seleccionar al menos un día';
    if (!form.cantidad || form.cantidad < 1) errors.cantidad = 'La cantidad debe ser mayor a 0';
    for (let dia of form.dias) {
      const disponibles = getSillasDisponibles(palcoSeleccionado, dia);
      if (disponibles < Number(form.cantidad)) {
        errors.cantidad = `No hay suficientes sillas disponibles para ${dia}. Solo quedan ${disponibles} sillas.`;
        break;
      }
    }
  }
  // Para palcos completos, las validaciones básicas ya están arriba
}
  
    // Guarda los errores en el estado
    setFormErrors(errors);
  
    // Si hay errores, muestra el toast y retorna false
    if (Object.keys(errors).length > 0) {
      mostrarMensaje('error', 'Corrige los errores en el formulario');
      return false;
    }
    // Si no hay errores, retorna true
    return true;
  };

// --- Funciones para gestión de reservas ---
// --- Funciones para gestión de reservas ---
// REEMPLAZA la función handleCancelarReserva COMPLETA con esta versión a prueba de errores:

const handleCancelarReserva = async (palco, reserva, dia = null) => {
  console.log('🔍 Iniciando cancelación de reserva:', { palco: palco.numero, reserva: reserva.nombre, dia });

  // 🆕 NUEVO: Verificar permisos para cancelar
  if (!canCancel(reserva)) {
    mostrarMensaje('error', 'No tienes permisos para cancelar esta reserva');
    return;
  }

  // VALIDACIÓN: verificar si la reserva existe
  let reservaExiste = false;
  let reservaCompleta = null;

  if (palco.tipo === 'completo') {
    reservaCompleta = palco.reservas.find(r => 
      r.cedula === reserva.cedula && 
      r.nombre === reserva.nombre &&
      r.telefono === reserva.telefono
    );
    reservaExiste = !!reservaCompleta;
  } else {
    const reservasDia = palco.reservas[dia] || [];
    reservaCompleta = reservasDia.find(r => 
      r.cedula === reserva.cedula && 
      r.nombre === reserva.nombre && 
      r.telefono === reserva.telefono &&
      r.cantidad === reserva.cantidad
    );
    reservaExiste = !!reservaCompleta;
  }

  if (!reservaExiste) {
    mostrarMensaje('error', '❌ Esta reserva ya no existe en el sistema. Posiblemente ya fue cancelada.');
    return;
  }

  // VERIFICAR DUPLICADOS: revisar si ya existe esta cancelación
  const yaExisteEnIngresos = ingresos.some(ing => 
    ing.tipo === 'cancelacion' && 
    ing.detalles &&
    ing.detalles.cedula === reserva.cedula &&
    ing.detalles.nombre === reserva.nombre &&
    ing.detalles.palco === palco.numero &&
    (palco.tipo === 'completo' || ing.detalles.dias === dia)
  );

  if (yaExisteEnIngresos) {
    mostrarMensaje('error', '⚠️ Esta reserva ya fue cancelada anteriormente.');
    return;
  }

  // CONFIRMACIÓN
  const confirmar = window.confirm(
    `¿Está seguro de cancelar la reserva de ${reserva.nombre}?\n${
      palco.tipo === 'completo'
        ? `Palco completo ${palco.numero} - $${(palco.precio || 0).toLocaleString()}`
        : `${reserva.cantidad} silla(s) en Palco ${palco.numero} para ${dia} - $${(PRECIO_SILLA[dia] * reserva.cantidad).toLocaleString()}`
    }\n\n⚠️ Esta acción no se puede deshacer.`
  );
  
  if (!confirmar) return;
  
  setLoading(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timestamp = Date.now();
    const operacionId = `cancel-${palco.numero}-${timestamp}`;
    
    // CALCULAR MONTO ANTES DE PROCESAR
    const montoDevolucion = palco.tipo === 'completo'
      ? (palco.precio || 0)
      : PRECIO_SILLA[dia] * reserva.cantidad;

    // DATOS PARA REGISTROS
    const datosRegistro = {
      cedula: reservaCompleta.cedula,
      nombre: reservaCompleta.nombre,
      telefono: reservaCompleta.telefono,
      correo: reservaCompleta.correo,
      vendedor: reservaCompleta.vendedor,
      palco: palco.numero,
      cantidad: palco.tipo === 'completo' ? '10 sillas (completo)' : reserva.cantidad,
      dias: palco.tipo === 'completo' ? 'Todos los días' : dia,
      operacionId: operacionId
    };
    
    // 1. ACTUALIZAR PALCOS (sin registrar ingresos aquí)
    setPalcos(prev => {
      const nuevosPalcos = prev.map(p => {
        if (p.numero !== palco.numero) return p;
        
        if (p.tipo === 'completo') {
          return {
            ...p,
            estado: 'disponible',
            reservas: []
          };
        } else {
          return {
            ...p,
            reservas: {
              ...p.reservas,
              [dia]: p.reservas[dia].filter(r => 
                !(r.cedula === reserva.cedula && 
                  r.nombre === reserva.nombre && 
                  r.telefono === reserva.telefono && 
                  r.cantidad === reserva.cantidad)
              )
            }
          };
        }
      });
      
      // Sincronizar con Firebase inmediatamente
      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
      
      return nuevosPalcos;
    });
    
    // 2. REGISTRAR EN INGRESOS (UNA SOLA VEZ)
    registrarIngreso('cancelacion', montoDevolucion, datosRegistro);
    
    // 3. REGISTRAR EN HISTÓRICO (UNA SOLA VEZ)
    agregarAlHistorico(
      'Cancelación', 
      palco.tipo === 'completo' 
        ? `Palco completo ${palco.numero} - ${reservaCompleta.nombre}`
        : `${reserva.cantidad} silla(s) Palco ${palco.numero} (${dia}) - ${reservaCompleta.nombre}`, 
      datosRegistro
    );
    
    mostrarMensaje('success', '✅ Reserva cancelada exitosamente. El dinero será devuelto.');
    
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    mostrarMensaje('error', '❌ Error al cancelar la reserva. Intente nuevamente.');
  } finally {
    setLoading(false);
  }
};

// FUNCIÓN MEJORADA para limpiar duplicados - más segura
// CAMBIA EL NOMBRE de la función para evitar el conflicto


  const handleEditarReserva = (palco, reserva, dia = null) => {
    setReservaAEditar({ palco, reserva, dia });
    setFormEditar({
      nombre: reserva.nombre,
      cedula: reserva.cedula,
      telefono: reserva.telefono,
      correo: reserva.correo,
      vendedor: reserva.vendedor
    });
    setShowEditarReserva(true);
    setShowReserva(false); // Cerrar el modal principal al abrir edición
  };

  const handleConfirmarEdicion = async (e) => {
    e.preventDefault();
    
    if (!formEditar.nombre.trim() || !formEditar.cedula.trim() || 
        !formEditar.telefono.trim() || !formEditar.correo.trim() || 
        !formEditar.vendedor.trim()) {
      mostrarMensaje('error', 'Todos los campos son obligatorios');
      return;
    }
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { palco, reserva, dia } = reservaAEditar;
      
      setPalcos(prev => {
        const nuevosPalcos = prev.map(p => {
          if (p.numero !== palco.numero) return p;
          
          if (p.tipo === 'completo') {
            return {
              ...p,
              reservas: p.reservas.map(r => 
                r.cedula === reserva.cedula && r.nombre === reserva.nombre 
                  ? { ...r, ...formEditar }
                  : r
              )
            };
          } else {
            return {
              ...p,
              reservas: {
                ...p.reservas,
                [dia]: p.reservas[dia].map(r =>
                  r.cedula === reserva.cedula && r.nombre === reserva.nombre && r.telefono === reserva.telefono
                    ? { ...r, ...formEditar }
                    : r
                )
              }
            };
          }
        });
        
        // Sincronizar con Firebase inmediatamente
        firebaseSyncService.sincronizarPalcos(nuevosPalcos);
        
        return nuevosPalcos;
      });
      
      agregarAlHistorico('Edición', `Actualizada reserva de ${formEditar.nombre} - Palco ${palco.numero}`, {
        cedula: formEditar.cedula,
        nombre: formEditar.nombre,
        vendedor: formEditar.vendedor,
        palco: palco.numero,
        cantidad: palco.tipo === 'completo' ? '10 sillas (completo)' : reserva.cantidad,
        dias: palco.tipo === 'completo' ? 'Todos los días' : dia
      });
      mostrarMensaje('success', '¡Reserva actualizada exitosamente!');
      setShowEditarReserva(false);
      setShowReserva(true); // Volver al modal principal después de editar
      
    } catch (error) {
      mostrarMensaje('error', 'Error al actualizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // 💰 Precio del palco completo (editable desde el panel, botón "Precio Palco")
  const [precioPalcoCompleto, setPrecioPalcoCompleto] = useState(1500000);

  // Cargar precio configurado desde Firebase al iniciar
  useEffect(() => {
    firebaseSyncService.obtenerConfiguracion()
      .then((config) => {
        if (config?.precioPalcoCompleto) {
          setPrecioPalcoCompleto(config.precioPalcoCompleto);
        }
      })
      .catch((error) => {
        console.error('❌ Error cargando precio de palco completo:', error);
      });
  }, []);

  // Precios
  // 💰 Precio del palco completo: editable desde el panel (botón "Precio Palco")
  // hasta que se confirme el valor definitivo (1.000.000 o 1.200.000, y si aplica por día).
  const PRECIO_PALCO_COMPLETO = precioPalcoCompleto;
  const PRECIO_SILLA = {
    viernes: 150000,
    sabado: 150000,
    domingo: 150000,
  };
  const METODOS_PAGO = {
    efectivo: {
      nombre: 'Efectivo',
      requiereComprobante: false,
      icono: '💵',
      color: '#27ae60',
      instrucciones: 'Entrega el dinero directamente al vendedor'
    },

    nequi: {
      nombre: 'Nequi',
      requiereComprobante: true,
      numero: '318-555-0456', // CAMBIAR POR TU NÚMERO
      icono: '💜',
      color: '#9b59b6',
      instrucciones: 'Envía el dinero a este número o escanea el QR y sube el comprobante',
      tieneQR: true,
      metodoKey: 'nequi'
    },
    daviplata: {
      nombre: 'Daviplata',
      requiereComprobante: true,
      numero: '318-555-0123', // CAMBIAR POR TU NÚMERO
      icono: '📱',
      color: '#e74c3c',
      instrucciones: 'Envía el dinero a este número o escanea el QR y sube el comprobante',
      tieneQR: true,
      metodoKey: 'daviplata'
    },
    transferencia: {
      nombre: 'Transferencia Bancaria',
      requiereComprobante: true,
      banco: 'Bancolombia', // CAMBIAR POR TU BANCO
      cuenta: '123-456-7890', // CAMBIAR POR TU CUENTA
      titular: 'Feria Expoequinos SAS', // CAMBIAR POR TU NOMBRE
      icono: '🏦',
      color: '#3498db',
      instrucciones: 'Realiza la transferencia y sube el comprobante'
    }
  };
  function getEstadoPalco(palco, dia) {
    if (palco.tipo === 'completo') {
      return palco.estado;
    } else {
      const reservasDia = palco.reservas[dia] || [];
      const sillasOcupadas = reservasDia.reduce((sum, r) => sum + r.cantidad, 0);
      // Mientras haya sillas ocupadas por un pago aún no verificado, el
      // palco no debe verse como "vendido" todavía, aunque esté al 100%.
      const hayPendientesDeVerificacion = reservasDia.some(r => r.estadoPago === 'pendiente_verificacion');
      if (sillasOcupadas === 0) return 'disponible';
      if (sillasOcupadas >= 10 && !hayPendientesDeVerificacion) return 'vendido';
      return 'reservado';
    }
  }

  // 📅 Convierte el campo `dias` de una reserva (ej: "viernes: 2 sillas, sabado: 3 sillas",
  // "Todos los días", o "viernes, sabado") en pares {dia, cantidad} correctos.
  // ANTES: se expandía el nombre del día una vez por cada silla (para sumar
  // cantidades) pero luego se volvía a multiplicar por el total al guardar,
  // duplicando/multiplicando las sillas ocupadas registradas por día.
  function parsearDiasReserva(diasReserva, cantidadTotalFallback = 1) {
    if (Array.isArray(diasReserva)) {
      return diasReserva; // ya viene como [{dia, cantidad}]
    }
    if (typeof diasReserva !== 'string' || !diasReserva.trim()) {
      return [];
    }
    if (diasReserva === 'Todos los días') {
      return ['viernes', 'sabado', 'domingo'].map(dia => ({ dia, cantidad: cantidadTotalFallback }));
    }
    if (diasReserva.includes(':')) {
      return diasReserva.split(', ').map(diaStr => {
        const [diaNombre, cantidadTexto] = diaStr.split(': ');
        return { dia: (diaNombre || '').trim(), cantidad: parseInt(cantidadTexto) || 1 };
      }).filter(d => d.dia);
    }
    // Formato simple "viernes, sabado" sin cantidad explícita por día
    return diasReserva.split(', ').map(dia => ({ dia: dia.trim(), cantidad: cantidadTotalFallback })).filter(d => d.dia);
  }

  function getSillasDisponibles(palco, dia) {
    if (palco.tipo === 'completo') {
      return palco.estado === 'disponible' ? 10 : 0;
    } else {
      const reservasDia = palco.reservas[dia] || [];
      const sillasOcupadas = reservasDia.reduce((sum, r) => sum + r.cantidad, 0);
      return 10 - sillasOcupadas;
    }
  }

  const palcosFiltrados = palcos.filter(palco => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && palco.tipo !== filtroTipo) return false;
    // Filtro por día y estado
    if (filtroDia !== 'todos') {
      const estado = getEstadoPalco(palco, filtroDia);
      if (filtroEstado !== 'todos' && estado !== filtroEstado) return false;
      return true;
    } else {
      if (palco.tipo === 'completo') {
        if (filtroEstado === 'todos' || palco.estado === filtroEstado) return true;
      } else {
        if (filtroEstado === 'todos') return true;
        for (let dia of DIAS) {
          if (getEstadoPalco(palco, dia) === filtroEstado) return true;
        }
      }
      return false;
    }
  });

  // 🆕 NUEVO: Hook de paginación para los palcos filtrados
  const {
    currentItems: palcosPaginados,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination
  } = usePagination(palcosFiltrados, itemsPerPage);

  // Resetear paginación cuando cambian los filtros
  useEffect(() => {
    resetPagination();
  }, [filtroEstado, filtroDia, filtroTipo, resetPagination]);

  const handleReservar = (palco) => {
    // 🚫 Un palco completo ya vendido no debe volver a pedir datos.
    if (palco.tipo === 'completo' && palco.estado === 'vendido') {
      mostrarMensaje('error', `🚫 El Palco ${palco.numero} ya está vendido. No se puede reservar de nuevo.`);
      return;
    }
    // 🚫 Palco por sillas sin ninguna silla disponible en ningún día.
    if (palco.tipo !== 'completo' && DIAS.every(dia => getSillasDisponibles(palco, dia) === 0)) {
      mostrarMensaje('error', `🚫 El Palco ${palco.numero} ya no tiene sillas disponibles en ningún día.`);
      return;
    }
    if (palco.tipo === 'completo' && !palco.precio) {
      mostrarMensaje('error', `⚠️ El Palco ${palco.numero} todavía no tiene precio asignado. Ve a "💰 Precio Palco" para configurarlo antes de venderlo.`);
      return;
    }
    setPalcoSeleccionado(palco);
    setShowReserva(true);
    
    // Inicializar con estructura específica
    const sillasEspecificas = {};
    DIAS.forEach(dia => {
      sillasEspecificas[dia] = {
        activo: filtroDia === dia && filtroDia !== 'todos',
        cantidad: 1
      };
    });
    
    setForm({
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      vendedor: user?.vendedor || user?.['vendedor '] || user?.name || '', // AUTO-LLENAR
      dias: palco.tipo === 'completo' ? [...DIAS] : (filtroDia !== 'todos' ? [filtroDia] : []),
      cantidad: 1,
      sillasEspecificas
    });
    
    setFormErrors({});
  };
  const handleDiaChange = (dia) => {
    setForm((prev) => ({
      ...prev,
      dias: prev.dias.includes(dia)
        ? prev.dias.filter(d => d !== dia)
        : [...prev.dias, dia]
    }));
  };

  function calcularPrecioSillas() {
    if (!form.dias.length) return 0;
    return form.dias.reduce(
      (total, dia) => total + (PRECIO_SILLA[dia] * Number(form.cantidad || 1)),
      0
    );
  }
// Función para manejar cambios en días específicos
const handleDiaEspecificoChange = (dia, campo, valor) => {
  setForm(prevForm => ({
    ...prevForm,
    sillasEspecificas: {
      ...prevForm.sillasEspecificas,
      [dia]: {
        ...prevForm.sillasEspecificas[dia],
        [campo]: valor
      }
    }
  }));
};

// Función para activar/desactivar día
const toggleDiaActivo = (dia) => {
  const nuevoEstado = !form.sillasEspecificas[dia].activo;
  handleDiaEspecificoChange(dia, 'activo', nuevoEstado);
  
  if (!nuevoEstado) {
    handleDiaEspecificoChange(dia, 'cantidad', 1);
  }
};

// Función para calcular precio total con días específicos
function calcularPrecioEspecifico() {
  let total = 0;
  Object.entries(form.sillasEspecificas).forEach(([dia, config]) => {
    if (config.activo && config.cantidad > 0) {
      total += PRECIO_SILLA[dia] * config.cantidad;
    }
  });
  return total;
}

// Función para obtener días activos
function getDiasActivos() {
  return Object.entries(form.sillasEspecificas)
    .filter(([dia, config]) => config.activo && config.cantidad > 0)
    .map(([dia, config]) => ({ dia, cantidad: config.cantidad }));
}

// Nueva validación para días específicos
const validarFormularioEspecifico = () => {
  const errors = {};
  
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!form.cedula.trim()) errors.cedula = 'La cédula es obligatoria';
  if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio';
  else if (!validarTelefono(form.telefono)) errors.telefono = 'Teléfono inválido (solo números, 7-15 dígitos)';
  if (!form.correo.trim()) errors.correo = 'El correo es obligatorio';
  else if (!validarEmail(form.correo)) errors.correo = 'Correo electrónico inválido';
  if (!form.vendedor.trim()) errors.vendedor = 'El nombre del vendedor es obligatorio';

  const diasActivos = getDiasActivos();
  if (diasActivos.length === 0) {
    errors.sillas = 'Debe seleccionar al menos un día y cantidad de sillas';
  }

  for (const { dia, cantidad } of diasActivos) {
    const disponibles = getSillasDisponibles(palcoSeleccionado, dia);
    if (disponibles < cantidad) {
      errors.sillas = `No hay suficientes sillas para ${dia}. Solo quedan ${disponibles} sillas disponibles.`;
      break;
    }
  }

  setFormErrors(errors);
  
  if (Object.keys(errors).length > 0) {
    mostrarMensaje('error', 'Corrige los errores en el formulario');
    return false;
  }
  
  return true;
};

// Nueva función para confirmar reserva específica
const handleConfirmarReservaEspecifica = async (e) => {
  e.preventDefault();
  
  if (!validarFormularioEspecifico()) return;
  
  setLoading(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const diasActivos = getDiasActivos();
    
    // 🆕 NUEVO: Actualizar el estado de los palcos ANTES de crear la info de pago
    const nuevosPalcos = palcos.map(p => {
      if (p.numero !== palcoSeleccionado.numero) return p;
      const nuevasReservas = { ...p.reservas };
      for (let { dia, cantidad } of diasActivos) {
        nuevasReservas[dia] = [
          ...nuevasReservas[dia],
          {
            nombre: form.nombre,
            cedula: form.cedula,
            telefono: form.telefono,
            correo: form.correo,
            vendedor: form.vendedor,
            cantidad: Number(cantidad)
          }
        ];
      }
      return { ...p, reservas: nuevasReservas };
    });
    setPalcos(nuevosPalcos);
    
    // Sincronizar con Firebase inmediatamente
    firebaseSyncService.sincronizarPalcos(nuevosPalcos);
    
    const infoReserva = {
      id: Date.now(),
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      correo: form.correo,
      palco: palcoSeleccionado.numero,
      tipoPalco: 'sillas_especificas',
      monto: calcularPrecioEspecifico(),
      vendedor: form.vendedor,
      diasEspecificos: diasActivos,
      resumenDias: diasActivos.map(({ dia, cantidad }) => 
        `${dia}: ${cantidad} silla${cantidad > 1 ? 's' : ''}`
      ).join(', ')
    };

    agregarAlHistorico(
      'Reserva Creada (Pendiente de Pago)',
      `Sillas específicas Palco ${palcoSeleccionado.numero} - ${form.nombre} (${infoReserva.resumenDias})`,
      {
        cedula: form.cedula,
        nombre: form.nombre,
        vendedor: form.vendedor,
        palco: palcoSeleccionado.numero,
        cantidad: 'Sillas específicas',
        dias: infoReserva.resumenDias
      }
    );

    mostrarMensaje('success', '🕐 Reserva creada. Procede con el pago para confirmarla.');
    
    setTimeout(() => {
      setShowReserva(false);
      handleIniciarPago(infoReserva);
    }, 2000);
    
  } catch (error) {
    mostrarMensaje('error', 'Error al procesar la reserva. Intente nuevamente.');
  } finally {
    setLoading(false);
  }
};
  const handleConfirmarReserva = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoading(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (palcoSeleccionado.tipo === 'completo') {
        const nuevosPalcos = palcos.map(p =>
          p.numero === palcoSeleccionado.numero
            ? {
                ...p,
                estado: 'vendido',
                reservas: [{
                  nombre: form.nombre,
                  cedula: form.cedula,
                  telefono: form.telefono,
                  correo: form.correo,
                  vendedor: form.vendedor,
                }]
              }
            : p
        );
        setPalcos(nuevosPalcos);
        
        // Sincronizar con Firebase inmediatamente
        firebaseSyncService.sincronizarPalcos(nuevosPalcos);
        mostrarMensaje('success', `¡Palco ${palcoSeleccionado.numero} reservado exitosamente!`);
        registrarIngreso('venta', palcoSeleccionado.precio, {
          cedula: form.cedula,
          nombre: form.nombre,
          vendedor: form.vendedor,
          palco: palcoSeleccionado.numero,
          cantidad: '10 sillas (completo)',
          dias: 'Todos los días'
        });
        agregarAlHistorico('Reserva', `Palco completo ${palcoSeleccionado.numero} - ${form.nombre}`, {
          cedula: form.cedula,
          nombre: form.nombre,
          vendedor: form.vendedor,
          palco: palcoSeleccionado.numero,
          cantidad: '10 sillas (completo)',
          dias: 'Todos los días'
        });
      } else {
        // Para palcos de sillas, usar el día del filtro si no hay días seleccionados
        const diasAReservar = form.dias.length > 0 ? form.dias : [filtroDia];
        const nuevosPalcos = palcos.map(p => {
          if (p.numero !== palcoSeleccionado.numero) return p;
          const nuevasReservas = { ...p.reservas };
          for (let dia of diasAReservar) {
            nuevasReservas[dia] = [
              ...nuevasReservas[dia],
              {
                nombre: form.nombre,
                cedula: form.cedula,
                telefono: form.telefono,
                correo: form.correo,
                vendedor: form.vendedor,
                cantidad: Number(form.cantidad)
              }
            ];
          }
          return { ...p, reservas: nuevasReservas };
        });
        setPalcos(nuevosPalcos);
        
        // Sincronizar con Firebase inmediatamente
        firebaseSyncService.sincronizarPalcos(nuevosPalcos);
        const diasTexto = diasAReservar.join(', ');
        const montoVenta = calcularPrecioSillas();
        mostrarMensaje('success', `¡Reserva confirmada! ${form.cantidad} silla(s) en Palco ${palcoSeleccionado.numero} para ${diasTexto}`);
        registrarIngreso('venta', montoVenta, {
          cedula: form.cedula,
          nombre: form.nombre,
          vendedor: form.vendedor,
          palco: palcoSeleccionado.numero,
          cantidad: form.cantidad,
          dias: diasTexto
        });
        agregarAlHistorico('Reserva', `${form.cantidad} silla(s) Palco ${palcoSeleccionado.numero} (${diasTexto}) - ${form.nombre}`, {
          cedula: form.cedula,
          nombre: form.nombre,
          vendedor: form.vendedor,
          palco: palcoSeleccionado.numero,
          cantidad: form.cantidad,
          dias: diasTexto
        });
      }
      
      setTimeout(() => {
        setShowReserva(false);
      }, 2000);
      
    } catch (error) {
      mostrarMensaje('error', 'Error al procesar la reserva. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  function getReservasResumen(palco, dia) {
    if (palco.tipo === 'completo') {
      if (!palco.reservas.length) return <p style={{ color: '#222' }}>No hay reservas.</p>;
      return (
        <div style={{ color: '#222' }}>
          {palco.reservas.map((r, idx) => (
            <div key={idx} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '6px', 
              padding: '10px', 
              marginBottom: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>{r.nombre}</strong> - Vendedor: {r.vendedor}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                📞 {r.telefono} | ✉️ {r.correo} | 🆔 {r.cedula}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
  {/* Editar - solo si tienes permisos */}
  {canEdit(r) && (
    <button
      className="btn"
      style={{ 
        fontSize: '12px', 
        padding: '4px 8px', 
        backgroundColor: '#3498db',
        color: 'white'
      }}
      onClick={() => handleEditarReserva(palco, r, dia)}
      disabled={loading}
    >
      ✏️ Editar
    </button>
  )}
  
  {/* Cancelar - solo administradores */}
  {canCancel(r) && (
    <button
      className="btn"
      style={{ 
        fontSize: '12px', 
        padding: '4px 8px', 
        backgroundColor: '#e74c3c',
        color: 'white'
      }}
      onClick={() => handleCancelarReserva(palco, r, dia)}
      disabled={loading}
    >
      🗑️ Cancelar
    </button>
  )}
</div>
            </div>
          ))}
        </div>
      );
    } else {
      const reservasDia = palco.reservas[dia] || [];
      if (!reservasDia.length) return <p style={{ color: '#222' }}>No hay reservas.</p>;
      return (
        <div style={{ color: '#222' }}>
          {reservasDia.map((r, idx) => (
            <div key={idx} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '6px', 
              padding: '10px', 
              marginBottom: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>{r.nombre}</strong> - {r.cantidad} silla(s) - Vendedor: {r.vendedor}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                📞 {r.telefono} | ✉️ {r.correo} | 🆔 {r.cedula}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canEdit(r) && (
                <button
                  className="btn"
                  style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    backgroundColor: '#3498db',
                    color: 'white'
                  }}
                  onClick={() => handleEditarReserva(palco, r, dia)}
                  disabled={loading}
                >
                  ✏️ Editar
                </button>
                )}
                {canCancel(r) && (
                  <button
                    className="btn"
                    style={{ 
                      fontSize: '12px', 
                      padding: '4px 8px', 
                      backgroundColor: '#e74c3c',
                      color: 'white'
                    }}
                    onClick={() => handleCancelarReserva(palco, r, dia)}
                    disabled={loading}
                  >
                    🗑️ Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // --- Mis reservas: buscar reservas por cédula ---
  function buscarReservasPorCedula(cedula) {
    let resultados = [];
    
    // Verificar que cedula existe
    if (!cedula || cedula.trim() === '') {
      return resultados;
    }
    
    palcos.forEach(palco => {
      if (palco.tipo === 'completo') {
        // Verificar que palco.reservas existe
        if (!palco.reservas || !Array.isArray(palco.reservas)) {
          console.log('⚠️ Palco sin reservas válidas:', palco.numero);
          return;
        }
        
        palco.reservas.forEach(reserva => {
          if (reserva.cedula === cedula) {
            // Los vendedores solo ven sus propias reservas
            if (!canViewAllHistory() && canViewOwnHistory() && reserva.vendedor !== user?.vendedor) {
              return;
            }
            resultados.push({
              palco: palco.numero,
              palcoObj: palco,
              tipo: 'completo',
              dias: [...DIAS],
              cantidad: 10,
              reserva,
            });
          }
        });
      } else {
        DIAS.forEach(dia => {
          // Verificar que palco.reservas[dia] existe y es un array
          if (!palco.reservas || !palco.reservas[dia] || !Array.isArray(palco.reservas[dia])) {
            console.log('⚠️ Palco sin reservas válidas para día:', palco.numero, dia);
            return;
          }
          
          palco.reservas[dia].forEach(reserva => {
            if (reserva.cedula === cedula) {
              // Los vendedores solo ven sus propias reservas
              if (!canViewAllHistory() && canViewOwnHistory() && reserva.vendedor !== user?.vendedor) {
                return;
              }
              resultados.push({
                palco: palco.numero,
                palcoObj: palco,
                tipo: 'sillas',
                dia,
                cantidad: reserva.cantidad,
                reserva,
              });
            }
          });
        });
      }
    });
    return resultados;
  }

  function handleMoverReserva(reservaObj) {
    if (!canMoveReservations(reservaObj.reserva)) {
      mostrarMensaje('error', 'No tienes permisos para mover esta reserva');
      return;
    }
    
    if (window.confirm(`¿Está seguro de mover la reserva de ${reservaObj.reserva.nombre} del Palco ${reservaObj.palco}?`)) {
      setReservaAMover(reservaObj);
    }
  }

  async function handleConfirmarMoverReserva(nuevoPalcoNumero) {
    if (!reservaAMover) return;
    
    setLoadingMover(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { palco: palcoOrigen, dia, reserva } = reservaAMover;
      setPalcos(palcos => {
        // Quitar la reserva del palco original
        const palcosActualizados = palcos.map(p => {
          if (p.numero === palcoOrigen && p.tipo === 'sillas') {
            return {
              ...p,
              reservas: {
                ...p.reservas,
                [dia]: p.reservas[dia].filter(r =>
                  !(r.cedula === reserva.cedula && r.nombre === reserva.nombre && r.telefono === reserva.telefono)
                )
              }
            };
          }
          return p;
        });
        // Agregar la reserva al nuevo palco
        const nuevosPalcos = palcosActualizados.map(p => {
          if (p.numero === nuevoPalcoNumero && p.tipo === 'sillas') {
            return {
              ...p,
              reservas: {
                ...p.reservas,
                [dia]: [
                  ...p.reservas[dia],
                  { ...reserva }
                ]
              }
            };
          }
          return p;
        });
        
        // Sincronizar con Firebase inmediatamente
        firebaseSyncService.sincronizarPalcos(nuevosPalcos);
        
        return nuevosPalcos;
      });
      
      mostrarMensaje('success', `¡Reserva movida exitosamente del Palco ${palcoOrigen} al Palco ${nuevoPalcoNumero}!`);
      agregarAlHistorico('Movimiento', `${reserva.nombre} - Palco ${palcoOrigen} → Palco ${nuevoPalcoNumero} (${dia})`, {
        cedula: reserva.cedula,
        nombre: reserva.nombre,
        vendedor: reserva.vendedor,
        palco: `${palcoOrigen} → ${nuevoPalcoNumero}`,
        cantidad: reserva.cantidad,
        dias: dia
      });
      
      registrarIngreso('movimiento', 0, {
        cedula: reserva.cedula,
        nombre: reserva.nombre,
        vendedor: reserva.vendedor,
        palcoOrigen: palcoOrigen,
        palcoDestino: nuevoPalcoNumero,
        cantidad: reserva.cantidad,
        dias: dia
      });
      
      setReservaAMover(null);
      
    } catch (error) {
      mostrarMensaje('error', 'Error al mover la reserva. Intente nuevamente.');
    } finally {
      setLoadingMover(false);
    }
  }

  // --- FUNCIONES PARA CONVERTIR PALCO ---
  function convertirPalcoAporSillas(numeroPalco) {
    setPalcos(prevPalcos => {
      const nuevosPalcos = prevPalcos.map(palco => {
        if (palco.numero === numeroPalco && palco.tipo === 'completo') {
          return {
            numero: palco.numero,
            tipo: 'sillas',
            reservas: { viernes: [], sabado: [], domingo: [] },
            convertido: true // Marcar como convertido
          };
        }
        return palco;
      });
      
      // Sincronizar con Firebase inmediatamente
      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
      
      return nuevosPalcos;
    });
    mostrarMensaje('success', `Palco ${numeroPalco} ahora es por sillas.`);
  }

  // Función para convertir palco a completo
  const convertirPalcoACompleto = (numeroPalco) => {
    setPalcos(prev => {
      const nuevosPalcos = prev.map(p => 
        p.numero === numeroPalco 
          ? { ...p, tipo: 'completo', estado: 'disponible', reservas: [] }
          : p
      );
      
      // Sincronizar con Firebase
      firebaseSyncService.sincronizarPalcos(nuevosPalcos);
      
      return nuevosPalcos;
    });
    
    mostrarMensaje('success', `Palco ${numeroPalco} ahora es completo.`);
  };

  // 💰 Guardar precio(s) de palco(s) completo(s) — sirve tanto para editar uno solo
  // como para aplicar un precio en lote a varios palcos sin precio asignado.
  // cambios: [{ numero, precio }, ...]
  const guardarPreciosPalcos = (cambios) => {
    setPalcos(prev => {
      const nuevosPalcos = prev.map(p => {
        const cambio = cambios.find(c => c.numero === p.numero);
        return cambio ? { ...p, precio: cambio.precio } : p;
      });

      firebaseSyncService.sincronizarPalcos(nuevosPalcos);

      return nuevosPalcos;
    });

    mostrarMensaje('success', cambios.length === 1
      ? `💰 Precio del Palco ${cambios[0].numero} actualizado a $${cambios[0].precio.toLocaleString()}`
      : `💰 Precio actualizado en ${cambios.length} palcos`);
  };

  // Función para limpiar datos con estructura incorrecta
  const limpiarDatosEstructuraIncorrecta = () => {
    console.log('🔧 Limpiando datos con estructura incorrecta...');
    
    const ingresosLimpios = ingresos.map(ingreso => {
      // Corregir estructura de dias si es necesario
      if (ingreso.detalles && typeof ingreso.detalles.dias === 'string') {
        console.log('🔧 Corrigiendo estructura de dias para ingreso:', ingreso.id);
        return {
          ...ingreso,
          detalles: {
            ...ingreso.detalles,
            dias: ingreso.detalles.dias ? [ingreso.detalles.dias] : []
          }
        };
      }
      return ingreso;
    });
    
    setIngresos(ingresosLimpios);
    localStorage.setItem('feriaIngresos', JSON.stringify(ingresosLimpios));
    console.log('✅ Datos corregidos y guardados');
    mostrarMensaje('success', 'Datos corregidos correctamente');
  };

  // 🆕 NUEVO: FUNCIONES PARA GESTIONAR RESERVAS DEL CLIENTE
  
  // Confirmar reserva del cliente
  const handleConfirmarReservaCliente = async (reserva) => {
    try {
      // Verificar que el ID de la reserva sea válido
      if (!reserva.id || typeof reserva.id !== 'string') {
        console.error('❌ ID de reserva inválido:', reserva.id);
        mostrarMensaje('error', 'Error: ID de reserva inválido');
        return;
      }
      
      // Usar la nueva función separada para reservas del cliente
      await handleVerificarReservaCliente(reserva, true, '');
      
      // Actualizar estado local de reservas
      setReservasCliente(prev => prev.map(r => 
        r.id === reserva.id 
          ? { ...r, estado: 'confirmada', confirmadoPorVendedor: true }
          : r
      ));
      
      // Agregar al histórico
      agregarAlHistorico('confirmar_reserva_cliente', {
        palco: reserva.palco,
        cliente: reserva.nombre,
        cedula: reserva.cedula,
        monto: reserva.monto
      }, {
        nombre: reserva.nombre,
        cedula: reserva.cedula,
        telefono: reserva.telefono,
        correo: reserva.correo
      });
      
      mostrarMensaje('success', `✅ Reserva de ${reserva.nombre} confirmada exitosamente`);
      setShowConfirmarReservaCliente(false);
      setReservaClienteSeleccionada(null);
      
    } catch (error) {
      console.error('Error confirmando reserva del cliente:', error);
      mostrarMensaje('error', 'Error al confirmar la reserva');
    }
  };

  // Rechazar reserva del cliente
  const handleRechazarReservaCliente = async (reserva) => {
    if (!motivoRechazo.trim()) {
      mostrarMensaje('error', 'Debes especificar un motivo para el rechazo');
      return;
    }

    try {
      // Verificar que el ID de la reserva sea válido
      if (!reserva.id || typeof reserva.id !== 'string') {
        console.error('❌ ID de reserva inválido:', reserva.id);
        mostrarMensaje('error', 'Error: ID de reserva inválido');
        return;
      }
      
      // Usar la nueva función separada para rechazar reservas del cliente
      await handleVerificarReservaCliente(reserva, false, motivoRechazo);
      
      // Actualizar estado local de reservas
      setReservasCliente(prev => prev.map(r => 
        r.id === reserva.id 
          ? { ...r, estado: 'rechazada', confirmadoPorVendedor: false }
          : r
      ));
      
      // Agregar al histórico
      agregarAlHistorico('rechazar_reserva_cliente', {
        palco: reserva.palco,
        cliente: reserva.nombre,
        cedula: reserva.cedula,
        motivo: motivoRechazo
      }, {
        nombre: reserva.nombre,
        cedula: reserva.cedula,
        telefono: reserva.telefono,
        correo: reserva.correo
      });
      
      mostrarMensaje('success', `❌ Reserva de ${reserva.nombre} rechazada`);
      setShowRechazarReservaCliente(false);
      setReservaClienteSeleccionada(null);
      setMotivoRechazo('');
      
    } catch (error) {
      console.error('Error rechazando reserva del cliente:', error);
      mostrarMensaje('error', 'Error al rechazar la reserva');
    }
  };

  // Obtener estadísticas de reservas del cliente
  const getEstadisticasReservasCliente = () => {
    const total = reservasCliente.length;
    const pendientes = reservasCliente.filter(r => r.estado === 'pendiente_confirmacion').length;
    const confirmadas = reservasCliente.filter(r => r.estado === 'confirmada').length;
    const rechazadas = reservasCliente.filter(r => r.estado === 'rechazada').length;
    
    return { total, pendientes, confirmadas, rechazadas };
  };

  // 🆕 FUNCIÓN DE UTILIDAD: Verificar y corregir sincronización de palcos
  const verificarSincronizacionPalcos = async () => {
    try {
      console.log('🔍 Verificando sincronización de palcos...');
      
      // Guardar estado actual en localStorage
      localStorage.setItem('feriaPalcos', JSON.stringify(palcos));
      
      // Sincronizar con Firebase
      await firebaseSyncService.sincronizarPalcos(palcos);
      
      console.log('✅ Sincronización verificada y corregida');
      mostrarMensaje('success', '✅ Sincronización de palcos verificada');
      
    } catch (error) {
      console.error('❌ Error en verificación de sincronización:', error);
      mostrarMensaje('error', '❌ Error verificando sincronización');
    }
  };

  // 🆕 FUNCIÓN DE UTILIDAD: Recargar datos desde Firebase
  const recargarDatosDesdeFirebase = async () => {
    try {
      console.log('🔍 Recargando datos desde Firebase...');
      setLoading(true);
      
      // Recargar palcos desde Firebase
      const palcosFirebase = await firebaseSyncService.obtenerPalcos();
      if (palcosFirebase && palcosFirebase.length > 0) {
        setPalcos(palcosFirebase);
        localStorage.setItem('feriaPalcos', JSON.stringify(palcosFirebase));
        console.log('✅ Datos recargados desde Firebase');
        mostrarMensaje('success', '✅ Datos recargados desde Firebase');
      } else {
        console.log('⚠️ No se encontraron datos en Firebase, usando datos locales');
        mostrarMensaje('warning', '⚠️ Usando datos locales');
      }
      
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      mostrarMensaje('error', '❌ Error recargando datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container-unificado min-h-screen w-full bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-8 sm:pb-12">
      {/* Encabezado */}
      <header className="mb-6 sm:mb-8">
        {/* Header principal */}
        <div className="mb-8">
          {/* Título perfectamente centrado */}
          <div className="text-center w-full">
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: colors.darkBrown,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              FERIA EXPOEQUINOS 2026
            </h1>
          </div>
          
          {/* Usuario centrado debajo del título */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <UserHeader />
          </div>
        </div>
      
        {/* 🎨 PANEL DE ACCIONES PRINCIPALES - DISEÑO ELEGANTE */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.creamBg} 0%, ${colors.white} 100%)`,
          border: `3px solid ${colors.woodBrown}`,
          borderRadius: '20px',
          padding: '24px',
          marginTop: '20px',
          marginBottom: '24px',
          boxShadow: `0 8px 32px rgba(139, 69, 19, 0.15)`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 🎯 Título del panel */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: colors.darkBrown,
              margin: '0',
              textAlign: 'center'
            }}>
              Panel de Control Principal
            </h3>
            <div style={{
              width: '60px',
              height: '3px',
              background: `linear-gradient(90deg, ${colors.primaryRed}, ${colors.primaryGold}, ${colors.primaryGreen})`,
              margin: '12px auto 0',
              borderRadius: '2px'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '10px',
              fontSize: '12px',
              color: colors.woodBrown
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: syncPalcosEnVivo ? '#16A34A' : '#D97706',
                display: 'inline-block'
              }}></span>
              {syncPalcosEnVivo
                ? `Sincronizado en tiempo real${ultimaSyncPalcos ? ` · última actualización ${ultimaSyncPalcos.toLocaleTimeString()}` : ''}`
                : 'Conectando con el servidor...'}
            </div>
          </div>

          {/* 🎨 Grid de botones elegantes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '100%'
          }}>
            
            {/* 📊 ESTADÍSTICAS */}
            {canViewAllStatistics() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(22, 163, 74, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowEstadisticas(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(22, 163, 74, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    📊
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Estadísticas Completas
                  </h4>
                </div>
              </div>
            )}

            {/* 📈 ESTADÍSTICAS PROPIAS */}
            {canViewOwnStatistics() && !canViewAllStatistics() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(22, 163, 74, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowEstadisticas(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(22, 163, 74, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    📈
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Mis Estadísticas
                  </h4>
                </div>
              </div>
            )}

            {/* 📊 EXPORTAR */}
            {canExportData() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryGold} 0%, ${colors.woodBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(217, 119, 6, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={exportarDatos}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(217, 119, 6, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(217, 119, 6, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    📊
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Exportar Datos
                  </h4>
                </div>
              </div>
            )}

            {/* 💳 VERIFICAR PAGOS VENDEDOR */}
            <ProtectedComponent permission="verify_payments">
              <div style={{
                background: `linear-gradient(135deg, ${getPagosPendientesFiltrados().length > 0 ? colors.primaryRed : colors.primaryGold} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(${getPagosPendientesFiltrados().length > 0 ? '196, 48, 43' : '217, 119, 6'}, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowVerificacionPagos(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = `0 12px 30px rgba(${getPagosPendientesFiltrados().length > 0 ? '196, 48, 43' : '217, 119, 6'}, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 6px 20px rgba(${getPagosPendientesFiltrados().length > 0 ? '196, 48, 43' : '217, 119, 6'}, 0.3)`;
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    💳
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Verificar Pagos
                  </h4>
                </div>
                {getPagosPendientesFiltrados().length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: colors.primaryRed,
                    color: colors.white,
                    fontSize: '0.8rem',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    {getPagosPendientesFiltrados().length}
                  </div>
                )}
              </div>
            </ProtectedComponent>

            {/* 💳 PAGOS CLIENTE */}
            <ProtectedComponent permission="verify_payments">
              <div style={{
                background: `linear-gradient(135deg, ${pagosCliente.length > 0 ? colors.primaryGreen : colors.woodBrown} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(${pagosCliente.length > 0 ? '22, 163, 74' : '139, 69, 19'}, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowReservasCliente(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = `0 12px 30px rgba(${pagosCliente.length > 0 ? '22, 163, 74' : '139, 69, 19'}, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 6px 20px rgba(${pagosCliente.length > 0 ? '22, 163, 74' : '139, 69, 19'}, 0.3)`;
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    💳
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Pagos Cliente
                  </h4>
                </div>
                {pagosCliente.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: colors.primaryGreen,
                    color: colors.white,
                    fontSize: '0.8rem',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    {pagosCliente.length}
                  </div>
                )}
              </div>
            </ProtectedComponent>

            {/* 🆘 RESTAURAR */}
            {canBackupRestore() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryRed} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(196, 48, 43, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowBackupModal(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(196, 48, 43, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(196, 48, 43, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    🆘
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Restaurar Backup
                  </h4>
                </div>
              </div>
            )}

            {/* 🗑️ RESETEAR TODO - Solo Admin Principal, acción destructiva e irreversible */}
            {user?.role === 'ADMIN_PRINCIPAL' && (
              <div style={{
                background: `linear-gradient(135deg, #7f1d1d 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(127, 29, 29, 0.4)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '2px dashed rgba(255,255,255,0.4)',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={resetearCompletamente}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(127, 29, 29, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(127, 29, 29, 0.4)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    🗑️
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Resetear Todo
                  </h4>
                </div>
              </div>
            )}

            {/* 📋 HISTÓRICO COMPLETO */}
            {canViewAllHistory() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.woodBrown} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(139, 69, 19, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowHistorico(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    📋
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Histórico Completo
                  </h4>
                </div>
              </div>
            )}

            {/* 📋 MI HISTÓRICO */}
            {canViewOwnHistory() && !canViewAllHistory() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.woodBrown} 0%, ${colors.darkBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(139, 69, 19, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowHistorico(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    📋
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Mi Histórico
                  </h4>
                </div>
              </div>
            )}

            {/* 📅 MIS RESERVAS */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.primaryGold} 0%, ${colors.woodBrown} 100%)`,
              borderRadius: '16px',
              padding: '16px',
              boxShadow: `0 6px 20px rgba(217, 119, 6, 0.3)`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowMisReservas(true)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px) scale(1.02)';
              e.target.style.boxShadow = '0 12px 30px rgba(217, 119, 6, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(217, 119, 6, 0.3)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                color: colors.white
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  📅
                </div>
                <h4 style={{
                  margin: '0',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: colors.white
                }}>
                  Mis Reservas
                </h4>
              </div>
            </div>

            {/* 🖼️ GESTIÓN QR */}
            {canManageQR() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.woodBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(22, 163, 74, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowQRUploader(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(22, 163, 74, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    🖼️
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Gestión QR
                  </h4>
                </div>
              </div>
            )}

            {/* 💰 PRECIO PALCO COMPLETO */}
            {canManageQR() && (
              <div style={{
                background: `linear-gradient(135deg, ${colors.primaryGold} 0%, ${colors.woodBrown} 100%)`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: `0 6px 20px rgba(217, 119, 6, 0.3)`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowPrecioPalco(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 30px rgba(217, 119, 6, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(217, 119, 6, 0.3)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: colors.white
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    💰
                  </div>
                  <h4 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: colors.white
                  }}>
                    Precio Palco
                  </h4>
                </div>
              </div>
            )}

          </div>

          {/* 🎨 Pie del panel */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: `2px solid ${colors.creamBg}`,
            opacity: '0.8'
          }}>
          </div>
        </div>
      </header>

      {/* Mensajes de notificación */}
      {mensaje.visible && (
        <div 
          className={`mensaje-notificacion ${mensaje.tipo}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '500',
            zIndex: 1000,
            minWidth: '300px',
            textAlign: 'center',
            backgroundColor: mensaje.tipo === 'success' ? '#27ae60' : '#e74c3c',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
        </div>
      )}

<section className="estado-palcos" style={{ minHeight: '200px' }}>
        <h2>Estado de Palcos</h2>
        
        {/* Selector de vista */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            className={`btn ${vistaActual === 'grilla' ? 'btn-estadisticas' : ''}`}
            onClick={() => setVistaActual('grilla')}
            style={{
              backgroundColor: vistaActual === 'grilla' ? '#3498db' : '#ecf0f1',
              color: vistaActual === 'grilla' ? 'white' : '#2c3e50',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            📋 Vista Grilla
          </button>
          <button 
            className={`btn ${vistaActual === 'mapa' ? 'btn-estadisticas' : ''}`}
            onClick={() => setVistaActual('mapa')}
            style={{
              backgroundColor: vistaActual === 'mapa' ? '#3498db' : '#ecf0f1',
              color: vistaActual === 'mapa' ? 'white' : '#2c3e50',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            🗺️ Vista Mapa
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#16A34A',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '2px solid #15803D'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#15803D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#D97706',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '2px solid #B45309'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#B45309',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Reservado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#C4302B',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '2px solid #A91E1A'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#A91E1A',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Vendido</span>
          </div>
        </div>
        
        <div className="filtros">
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="reservado">Reservados</option>
            <option value="vendido">Vendidos</option>
          </select>
          <select value={filtroDia} onChange={e => setFiltroDia(e.target.value)}>
            <option value="todos">Todos los días</option>
            <option value="viernes">Viernes</option>
            <option value="sabado">Sábado</option>
            <option value="domingo">Domingo</option>
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="completo">Completos</option>
            <option value="sillas">Por sillas</option>
          </select>
          <button className="btn btn-actualizar" onClick={() => {
            setFiltroEstado('todos');
            setFiltroDia('todos');
            setFiltroTipo('todos');
            recargarDatosDesdeFirebase();
          }}>🔄 Actualizar</button>
        </div>
      </section>

      <section className="palcos">
        <h2>
          {vistaActual === 'mapa' ? 'Mapa Interactivo de Palcos' : 'Palcos'}
        </h2>
        
        {vistaActual === 'mapa' ? (
          // NUEVO: Componente del mapa
<MapaPalcos
  palcos={palcos}
  onPalcoClick={handleReservar}
  filtroEstado={filtroEstado}
  filtroDia={filtroDia}
  onConvertirACompleto={convertirPalcoACompleto}
  onConvertirASillas={convertirPalcoAporSillas}
  canConvertPalcos={canConvertPalcos}
  PRECIO_SILLA={PRECIO_SILLA}
/>
        ) : (
          // 🆕 NUEVO: Grilla con paginación - CONTENEDOR UNIFICADO
          <div>
            {/* Selector de elementos por página */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>
                  Palcos por página:
                </label>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={40}>Todos</option>
                </select>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {totalItems} palcos encontrados
              </div>
            </div>

            {/* Grilla de palcos */}
            <div className="palcos-grid">
              {palcosPaginados.map((palco) => {
              let estado = 'disponible';
              let sillasDisponibles = 10;
              let dia = filtroDia !== 'todos' ? filtroDia : 'viernes';
              if (palco.tipo === 'completo') {
                estado = palco.estado;
                sillasDisponibles = estado === 'disponible' ? 10 : 0;
              } else {
                if (filtroDia !== 'todos') {
                  estado = getEstadoPalco(palco, filtroDia);
                  sillasDisponibles = getSillasDisponibles(palco, filtroDia);
                } else {
                  const estados = DIAS.map(d => getEstadoPalco(palco, d));
                  if (estados.includes('vendido')) estado = 'vendido';
                  else if (estados.includes('reservado')) estado = 'reservado';
                  else estado = 'disponible';
                  sillasDisponibles = Math.max(...DIAS.map(d => getSillasDisponibles(palco, d)));
                }
              }
              const bloqueado = palco.tipo === 'completo'
                ? palco.estado === 'vendido'
                : DIAS.every(d => getSillasDisponibles(palco, d) === 0);
              return (
                <div
                  key={palco.numero}
                  className={`palco ${estado} tipo-${palco.tipo} ${palco.convertido ? 'tipo-convertido' : ''}`}
                  onClick={() => handleReservar(palco)}
                  title={bloqueado ? 'Ya vendido / sin sillas disponibles' : undefined}
                  style={{ cursor: bloqueado ? 'not-allowed' : 'pointer', opacity: bloqueado ? 0.75 : 1, position: 'relative' }}
                >
                  {/* Indicador de tipo */}
                  <div className={`palco-tipo-indicator ${palco.convertido ? 'convertido' : palco.tipo}`}>
                    {palco.convertido ? '🔄' : (palco.tipo === 'completo' ? '📦' : '🪑')}
                  </div>
                  
                  Palco {palco.numero}
                  <br />
                  <span>
                    {estado === 'disponible' && `Disponible (${sillasDisponibles} sillas)`}
                    {estado === 'reservado' && `Reservado (${sillasDisponibles} sillas libres)`}
                    {estado === 'vendido' && `Vendido`}
                  </span>
                  <br />
                  <span style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: palco.tipo === 'completo' && !palco.precio ? '#C4302B' : '#451A03'
                  }}>
                    {palco.tipo === 'completo'
                      ? (palco.precio ? `$${palco.precio.toLocaleString()}` : '⚠️ Sin precio asignado')
                      : `$${(PRECIO_SILLA.viernes || 0).toLocaleString()}/día`}
                  </span>
                  {/* Botones de conversión - Solo administradores */}
                  {canConvertPalcos() && (
                    <div style={{ marginTop: 8 }}>
                      {palco.tipo === 'completo' && (
                        <button
                          className="btn"
                          style={{ backgroundColor: '#f39c12', color: '#fff', fontSize: 12, marginRight: 4 }}
                          onClick={e => { e.stopPropagation(); convertirPalcoAporSillas(palco.numero); }}
                          disabled={palco.estado !== 'disponible'}
                          title="Convertir a palco por sillas"
                        >
                          🔄 Convertir a sillas
                        </button>
                      )}
                      {palco.tipo === 'sillas' && (
                        <button
                          className="btn"
                          style={{ backgroundColor: '#3498db', color: '#fff', fontSize: 12 }}
                          onClick={e => { e.stopPropagation(); convertirPalcoACompleto(palco.numero); }}
                          disabled={DIAS.some(dia => (palco.reservas[dia] && palco.reservas[dia].length > 0))}
                          title="Convertir a palco completo"
                        >
                          🔄 Convertir a completo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            </div>

                           {/* Componente de paginación */}
               {/* Mostrar paginación siempre, incluso con 1 página */}
               <Pagination
                 currentPage={currentPage}
                 totalPages={totalPages}
                 totalItems={totalItems}
                 itemsPerPage={itemsPerPage}
                 onPageChange={goToPage}
                 className="mt-6"
               />
          </div>
        )}
      </section>

      {/* Modal de Mis Reservas - Mejorado */}
      <MisReservasModal
        isOpen={showMisReservas}
        onClose={() => setShowMisReservas(false)}
        busquedaCedula={busquedaCedula}
        setBusquedaCedula={setBusquedaCedula}
        buscarReservasPorCedula={buscarReservasPorCedula}
        handleMoverReserva={handleMoverReserva}
        canMoveReservations={canMoveReservations}
        handleCancelarReserva={handleCancelarReserva}
        canCancel={canCancel}
      />

      {/* Modal de Pagos del Cliente - Mejorado */}
      <PagosClienteModal
        isOpen={showReservasCliente}
        onClose={() => setShowReservasCliente(false)}
        pagosCliente={pagosCliente}
        firebaseSyncService={firebaseSyncService}
        agregarAlHistorico={agregarAlHistorico}
        mostrarMensaje={mostrarMensaje}
        palcos={palcos}
        setPalcos={setPalcos}
        registrarIngreso={registrarIngreso}
        user={user}
      />



      {/* Modal para confirmar reserva del cliente */}
      {showConfirmarReservaCliente && reservaClienteSeleccionada && (
        <ResponsiveModal
          isOpen={showConfirmarReservaCliente}
          onClose={() => {
            setShowConfirmarReservaCliente(false);
            setReservaClienteSeleccionada(null);
          }}
          title="✅ Confirmar Reserva"
          size="default"
        >
          <div style={{ color: '#222', minWidth: 400, position: 'relative' }}>
            <p>¿Estás seguro de que quieres confirmar la reserva de <strong>{reservaClienteSeleccionada.nombre}</strong>?</p>
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px' 
            }}>
              <p><strong>Palco:</strong> {reservaClienteSeleccionada.palco}</p>
              <p><strong>Monto:</strong> ${reservaClienteSeleccionada.monto?.toLocaleString()}</p>
              <p><strong>Días:</strong> {reservaClienteSeleccionada.dias}</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn" 
                style={{ backgroundColor: '#27ae60', color: 'white' }}
                onClick={() => handleConfirmarReservaCliente(reservaClienteSeleccionada)}
                disabled={loading}
              >
                {loading ? '🔄 Confirmando...' : '✅ Confirmar Reserva'}
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setShowConfirmarReservaCliente(false);
                  setReservaClienteSeleccionada(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </ResponsiveModal>
      )}

      {/* Modal para rechazar reserva del cliente */}
      {showRechazarReservaCliente && reservaClienteSeleccionada && (
        <ResponsiveModal
          isOpen={showRechazarReservaCliente}
          onClose={() => {
            setShowRechazarReservaCliente(false);
            setReservaClienteSeleccionada(null);
            setMotivoRechazo('');
          }}
          title="❌ Rechazar Reserva"
          size="default"
        >
          <div style={{ color: '#222', minWidth: 400, position: 'relative' }}>
            <p>¿Estás seguro de que quieres rechazar la reserva de <strong>{reservaClienteSeleccionada.nombre}</strong>?</p>
            <div style={{ 
              backgroundColor: '#ffeaea', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px' 
            }}>
              <p><strong>Palco:</strong> {reservaClienteSeleccionada.palco}</p>
              <p><strong>Monto:</strong> ${reservaClienteSeleccionada.monto?.toLocaleString()}</p>
              <p><strong>Días:</strong> {reservaClienteSeleccionada.dias}</p>
            </div>
            <label>Motivo del rechazo:</label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Especifica el motivo del rechazo..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            />
            <div className="modal-actions">
              <button 
                className="btn" 
                style={{ backgroundColor: '#e74c3c', color: 'white' }}
                onClick={() => handleRechazarReservaCliente(reservaClienteSeleccionada)}
                disabled={loading || !motivoRechazo.trim()}
              >
                {loading ? '🔄 Rechazando...' : '❌ Rechazar Reserva'}
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setShowRechazarReservaCliente(false);
                  setReservaClienteSeleccionada(null);
                  setMotivoRechazo('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </ResponsiveModal>
      )}

      {/* Modal para mover reserva */}
      {reservaAMover && (
        <ResponsiveModal
          isOpen={!!reservaAMover}
          onClose={() => setReservaAMover(null)}
          title="Mover reserva"
          size="default"
        >
          <div style={{ color: '#222', minWidth: 350, position: 'relative' }}>
            <p>
              <b>Palco actual:</b> {reservaAMover.palco} <br />
              <b>Día:</b> {reservaAMover.dia.charAt(0).toUpperCase() + reservaAMover.dia.slice(1)} <br />
              <b>Cantidad:</b> {reservaAMover.cantidad}
            </p>
            <label>Seleccione el nuevo palco:</label>
            <div>
              {palcos.filter(p => p.tipo === 'sillas').map(palco => {
                const disponibles = getSillasDisponibles(palco, reservaAMover.dia);
                const disabled = disponibles < reservaAMover.cantidad;
                return (
                  <button
                    key={palco.numero}
                    className="btn"
                    style={{ 
                      margin: 4, 
                      background: disabled ? '#ccc' : '#27ae60', 
                      color: '#fff',
                      opacity: loadingMover ? 0.7 : 1
                    }}
                    disabled={disabled || loadingMover}
                    onClick={() => handleConfirmarMoverReserva(palco.numero)}
                  >
                    {loadingMover ? '🔄 Moviendo...' : `Palco ${palco.numero} (${disponibles} libres)`}
                  </button>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setReservaAMover(null)}>Cancelar</button>
            </div>
          </div>
        </ResponsiveModal>
      )}

      {/* Modal de Histórico Completo - Mejorado */}
      <HistoricoCompletoModal
        isOpen={showHistorico}
        onClose={() => setShowHistorico(false)}
        historico={historico}
        filtrosHistorico={filtrosHistorico}
        setFiltrosHistorico={setFiltrosHistorico}
        getHistoricoFiltrado={getHistoricoFiltrado}
        limpiarFiltrosHistorico={limpiarFiltrosHistorico}
        user={user}
      />

      {/* Modal de Editar Reserva */}
      {showEditarReserva && (
  <div className="modal-reserva">
    <div className="modal-content" style={{ color: '#222', minWidth: 400, position: 'relative' }}>
      <CloseModalButton onClose={() => {
        setShowEditarReserva(false);
        setShowReserva(true);
      }} />
      <h3>✏️ Editar Reserva</h3>
        <p>
          <strong>Palco:</strong> {reservaAEditar?.palco.numero} 
          {reservaAEditar?.dia && ` - ${reservaAEditar.dia.charAt(0).toUpperCase() + reservaAEditar.dia.slice(1)}`}
        </p>
        <form onSubmit={handleConfirmarEdicion}>
          
          <label>Nombre Completo *</label>
          <input 
            type="text" 
            required 
            value={formEditar.nombre} 
            onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })} 
          />
          <label>Cédula *</label>
          <input 
            type="text" 
            required 
            value={formEditar.cedula} 
            onChange={e => setFormEditar({ ...formEditar, cedula: e.target.value })} 
          />
          <label>Número de Teléfono *</label>
          <input 
            type="text" 
            required 
            value={formEditar.telefono} 
            onChange={e => setFormEditar({ ...formEditar, telefono: e.target.value })} 
          />
          <label>Correo Electrónico *</label>
          <input 
            type="email" 
            required 
            value={formEditar.correo} 
            onChange={e => setFormEditar({ ...formEditar, correo: e.target.value })} 
          />
          <label>Nombre del vendedor *</label>
          <input 
            type="text" 
            required 
            value={formEditar.vendedor} 
            onChange={e => setFormEditar({ ...formEditar, vendedor: e.target.value })} 
          />
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '4px', 
            padding: '8px', 
            margin: '10px 0',
            fontSize: '14px',
            color: '#856404'
          }}>
            ⚠️ <strong>Nota:</strong> No se puede modificar la cantidad de sillas ni los días de la reserva.
          </div>
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn" 
              onClick={() => {
                setShowEditarReserva(false);
                setShowReserva(true); // Volver al modal principal al cancelar
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-estadisticas"
              disabled={loading}
            >
              {loading ? '🔄 Guardando...' : 'Guardar Cambios'}
            </button>
                        </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de reserva responsivo */}
      <ReservationModal
        isOpen={showReserva}
        onClose={() => setShowReserva(false)}
        palcoSeleccionado={palcoSeleccionado}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        handleConfirmarReserva={handleConfirmarReserva}
        handleConfirmarReservaEspecifica={handleConfirmarReservaEspecifica}
        handleIniciarPago={handleIniciarPago}
        loading={loading}
        DIAS={DIAS}
        PRECIO_SILLA={PRECIO_SILLA}
        getSillasDisponibles={getSillasDisponibles}
        getDiasActivos={getDiasActivos}
        calcularPrecioEspecifico={calcularPrecioEspecifico}
        handleDiaChange={handleDiaChange}
        handleDiaEspecificoChange={handleDiaEspecificoChange}
        toggleDiaActivo={toggleDiaActivo}
      />

      {/* Modal de Gestión de QR - Mejorado */}
      <GestionQRModal
        isOpen={showQRUploader}
        onClose={() => setShowQRUploader(false)}
      />

      {/* Modal de Precio de Palco Completo */}
      <PrecioPalcoModal
        isOpen={showPrecioPalco}
        onClose={() => setShowPrecioPalco(false)}
        palcos={palcos}
        precioSugerido={precioPalcoCompleto}
        onGuardarPrecioSugerido={setPrecioPalcoCompleto}
        onGuardarPrecios={guardarPreciosPalcos}
      />

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        palcos={palcos}
        ingresos={ingresos}
        historico={historico}
        pagosPendientes={pagosPendientes}
        creadoPorNombre={user?.displayName || user?.email || 'Admin'}
        onRestaurar={restaurarDesdeBackup}
      />
      
      {/* Modal de Estadísticas Mejorado */}
              <EstadisticasModal
          isOpen={showEstadisticas}
          onClose={() => setShowEstadisticas(false)}
          user={user}
          estadisticasActuales={estadisticasActuales}
          calcularEstadisticas={calcularEstadisticas}
          filtrosEstadisticas={filtrosEstadisticas}
          setFiltrosEstadisticas={setFiltrosEstadisticas}
          limpiarFiltrosEstadisticas={limpiarFiltrosEstadisticas}
          limpiarRegistrosDuplicados={limpiarRegistrosDuplicados}
          canViewAllStatistics={canViewAllStatistics}
          canBackupRestore={canBackupRestore}
          limpiarDatosPrueba={limpiarDatosPrueba}
          migrarPalcos={migrarPalcos}
          firebaseSyncService={firebaseSyncService}
          mostrarMensaje={mostrarMensaje}
          METODOS_PAGO={METODOS_PAGO}
          qrData={qrData}
          handleCargarQR={handleCargarQR}
          limpiarQR={limpiarQR}
          getVendedoresUnicos={getVendedoresUnicos}
          getEstadisticasPorVendedor={getEstadisticasPorVendedor}
          getIngresosFiltradosPorRol={getIngresosFiltradosPorRol}
          palcos={palcos}
          ingresos={ingresos}
          historico={historico}
          DIAS={DIAS}
          crearPalcosIniciales={crearPalcosIniciales}
          // 🏦 FUNCIONES DE ADMINISTRACIÓN CONTABLE
          sincronizarIngresosEntreApps={sincronizarIngresosEntreApps}
          validarIntegridadContable={validarIntegridadContable}
        />

      {/* Modal de pago responsivo */}
      <PaymentModal
        isOpen={showPagos && !!reservaParaPago}
        onClose={() => setShowPagos(false)}
        reservaParaPago={reservaParaPago}
        pagoData={pagoData}
        setPagoData={setPagoData}
        handleEnviarComprobante={handleEnviarComprobante}
        loading={loading}
        METODOS_PAGO={METODOS_PAGO}
        qrData={qrData}
        handleImagenComprobante={handleImagenComprobante}
        handleCargarQR={handleCargarQR}
        user={user}
      />

      {/* Modal de Verificación de Pagos (Vendedor) - Mejorado */}
      <VerificacionPagosModal
        isOpen={showVerificacionPagos}
        onClose={() => setShowVerificacionPagos(false)}
        pagosPendientes={getPagosPendientesFiltrados()}
        handleVerificarPago={handleVerificarPago}
        loading={loading}
        setShowVerificacionPagos={setShowVerificacionPagos}
      />

      {/* 🆕 COMPONENTE DE DEBUG */}
      <DebugSincronizacion 
        palcos={palcos}
        onVerificar={verificarSincronizacionPalcos}
        onRecargar={recargarDatosDesdeFirebase}
      />

    </div>
  );
}
// Componente principal con autenticación
const App = () => {  // ← Esta es la SEGUNDA declaración (está bien)
  const { user } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <AppContent />;  // ← Aquí llama a AppContent
};

// Wrapper con AuthProvider
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;