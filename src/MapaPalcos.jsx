import React, { useState, useMemo, useEffect } from 'react';
import { useDeviceDetection } from './hooks/useDeviceDetection';

// 🗺️ Configuración de palcos según el nuevo plano del recinto (38 palcos,
// forma de "U"): columna izquierda 1→15 (de abajo hacia arriba), fila
// inferior 16→23 (de izquierda a derecha), columna derecha 24→38 (de abajo
// hacia arriba). Ya no hay palcos en la parte superior: ahí van BAHÍA y
// PREPISTA, que son solo referencia del plano (no se venden).
const PALCOS_SILLAS_MAPA = [5, 6, 7]; // debe coincidir con PALCOS_SILLAS_INICIAL de App.jsx

const COL_Y_TOP = 100;
const COL_Y_BOTTOM = 660;
const COL_STEP = (COL_Y_BOTTOM - COL_Y_TOP) / 14; // 14 espacios entre 15 palcos

const CONFIGURACION_PALCOS = {
  // Columna izquierda: 1 (abajo) → 15 (arriba)
  lateralIzquierdo: Array.from({ length: 15 }, (_, i) => {
    const numero = i + 1;
    return {
      numero,
      x: 250,
      y: COL_Y_BOTTOM - i * COL_STEP,
      tipo: PALCOS_SILLAS_MAPA.includes(numero) ? 'sillas' : 'completo'
    };
  }),
  // Fila inferior: 16 → 23, de izquierda a derecha
  inferior: Array.from({ length: 8 }, (_, i) => {
    const numero = i + 16;
    return {
      numero,
      x: 340 + i * 80,
      y: 740,
      tipo: PALCOS_SILLAS_MAPA.includes(numero) ? 'sillas' : 'completo'
    };
  }),
  // Columna derecha: 24 (abajo) → 38 (arriba)
  lateralDerecho: Array.from({ length: 15 }, (_, i) => {
    const numero = i + 24;
    return {
      numero,
      x: 990,
      y: COL_Y_BOTTOM - i * COL_STEP,
      tipo: PALCOS_SILLAS_MAPA.includes(numero) ? 'sillas' : 'completo'
    };
  })
};

const MapaPalcos = ({ 
  palcos = [], 
  onPalcoClick, 
  filtroEstado = 'todos',
  filtroDia = 'todos',
  onConvertirACompleto,
  onConvertirASillas,
  canConvertPalcos = () => false,
  PRECIO_SILLA = {}
}) => {
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoveredPalco, setHoveredPalco] = useState(null);
  const [selectedPalco, setSelectedPalco] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, palco: null });
  
  // Hook de detección de dispositivos
  const deviceInfo = useDeviceDetection();
  // Asegurar variables derivadas disponibles para evitar ReferenceError
  const { isMobile = false, isTablet = false, isDesktop = false } = deviceInfo || {};
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [longPressPalco, setLongPressPalco] = useState(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [longPressMessage, setLongPressMessage] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 900, height: 700 });

  // Calcular dimensiones responsivas basadas en el dispositivo
  useEffect(() => {
    const calculateDimensions = () => {
      if (deviceInfo?.isMobile) {
        const containerWidth = Math.min(window.innerWidth - 40, 900);
        const containerHeight = (containerWidth * 700) / 900;
        setSvgDimensions({ width: containerWidth, height: containerHeight });
      } else if (deviceInfo?.isTablet) {
        const containerWidth = Math.min(window.innerWidth - 60, 900);
        const containerHeight = (containerWidth * 700) / 900;
        setSvgDimensions({ width: containerWidth, height: containerHeight });
      } else {
        setSvgDimensions({ width: 900, height: 700 });
      }
    };

    calculateDimensions();
  }, [deviceInfo]);

  // Funciones helper para zoom - ELIMINADAS (optimizadas para responsive)

  // Posicionamiento del tooltip anclado al palco (idéntico al cliente)
  const calcularPosicionTooltip = (palcoMapa) => {
    const palcoX = palcoMapa.x;
    const palcoY = palcoMapa.y;
    const tooltipWidth = 260;
    const tooltipHeight = 115;
    const margin = 20;

    let tooltipX; let tooltipY; let arrowDirection = 'down';
    // Nuevo plano en forma de "U": columna izquierda 1-15, fila inferior
    // 16-23, columna derecha 24-38 (ya no hay fila superior de palcos).
    const esInferior = palcoMapa.numero >= 16 && palcoMapa.numero <= 23;
    const esLateralIzquierdo = palcoMapa.numero >= 1 && palcoMapa.numero <= 15;
    const esLateralDerecho = palcoMapa.numero >= 24 && palcoMapa.numero <= 38;

    const svgW = 1200;
    const svgH = 880;

    if (esInferior) {
      tooltipX = palcoX - tooltipWidth / 2;
      tooltipY = palcoY + margin + 10;
      arrowDirection = 'up';
      if (tooltipY + tooltipHeight > svgH) tooltipY = svgH - tooltipHeight - 10;
      if (tooltipX < 10) tooltipX = 10;
      if (tooltipX + tooltipWidth > svgW) tooltipX = svgW - tooltipWidth - 10;
    } else if (esLateralIzquierdo) {
      tooltipX = palcoX - tooltipWidth - margin;
      tooltipY = palcoY - tooltipHeight / 2;
      arrowDirection = 'right';
      if (tooltipX < 10) { tooltipX = palcoX + margin; arrowDirection = 'left'; }
    } else if (esLateralDerecho) {
      tooltipX = palcoX + margin;
      tooltipY = palcoY - tooltipHeight / 2;
      arrowDirection = 'left';
      if (tooltipX + tooltipWidth > svgW - 10) { tooltipX = palcoX - tooltipWidth - margin; arrowDirection = 'right'; }
    } else {
      tooltipX = palcoX - tooltipWidth / 2;
      tooltipY = palcoY - tooltipHeight - margin;
      arrowDirection = 'down';
    }

    // Límites del SVG
    if (arrowDirection !== 'left' && arrowDirection !== 'right') {
      if (tooltipY < 10) tooltipY = 10;
      if (tooltipY + tooltipHeight > svgH) tooltipY = svgH - tooltipHeight - 10;
    } else {
      if (tooltipY < 10) tooltipY = 10;
      if (tooltipY + tooltipHeight > svgH) tooltipY = svgH - tooltipHeight - 10;
    }

    return { x: tooltipX, y: tooltipY, arrowDirection };
  };

  // Obtener todos los palcos del mapa
  const todosPalcos = useMemo(() => {
    return [
      ...CONFIGURACION_PALCOS.lateralIzquierdo,
      ...CONFIGURACION_PALCOS.inferior,
      ...CONFIGURACION_PALCOS.lateralDerecho
    ];
  }, []);

  // 🆕 CORRECCIÓN: Función mejorada para obtener estado del palco
  const getEstadoPalco = (numeroPalco, dia) => {
    const palco = palcos.find(p => p.numero === numeroPalco);
    if (!palco) return 'disponible';

    if (palco.tipo === 'completo') {
      return palco.estado;
    } else {
      // Para palcos por sillas
      if (dia !== 'todos') {
        const reservasDia = palco.reservas[dia] || [];
        const sillasOcupadas = reservasDia.reduce((sum, r) => {
          // 🆕 CORRECCIÓN: Asegurar que cantidad sea un número
          const cantidad = typeof r.cantidad === 'number' ? r.cantidad : parseInt(r.cantidad) || 1;
          return sum + cantidad;
        }, 0);
        
        if (sillasOcupadas === 0) return 'disponible';
        if (sillasOcupadas >= 10) return 'vendido';
        return 'reservado';
      } else {
        // Vista general: revisar todos los días
        const DIAS = ['viernes', 'sabado', 'domingo'];
        const estados = DIAS.map(d => {
          const reservas = palco.reservas[d] || [];
          const ocupadas = reservas.reduce((sum, r) => {
            const cantidad = typeof r.cantidad === 'number' ? r.cantidad : parseInt(r.cantidad) || 1;
            return sum + cantidad;
          }, 0);
          if (ocupadas === 0) return 'disponible';
          if (ocupadas >= 10) return 'vendido';
          return 'reservado';
        });
        
        if (estados.includes('vendido')) return 'vendido';
        if (estados.includes('reservado')) return 'reservado';
        return 'disponible';
      }
    }
  };

  // 🆕 CORRECCIÓN: Función mejorada para obtener sillas disponibles
  const getSillasDisponibles = (numeroPalco, dia) => {
    const palco = palcos.find(p => p.numero === numeroPalco);
    if (!palco) return 10;

    if (palco.tipo === 'completo') {
      return palco.estado === 'disponible' ? 10 : 0;
    } else {
      if (dia !== 'todos') {
        const reservasDia = palco.reservas[dia] || [];
        const sillasOcupadas = reservasDia.reduce((sum, r) => {
          // 🆕 CORRECCIÓN: Asegurar que cantidad sea un número
          const cantidad = typeof r.cantidad === 'number' ? r.cantidad : parseInt(r.cantidad) || 1;
          return sum + cantidad;
        }, 0);
        
        const disponibles = Math.max(0, 10 - sillasOcupadas);
        console.log(`🔍 Palco ${numeroPalco}, Día ${dia}: ${sillasOcupadas} ocupadas, ${disponibles} disponibles`);
        return disponibles;
      } else {
        // Para vista general, usar el mínimo disponible
        const DIAS = ['viernes', 'sabado', 'domingo'];
        const disponibilidades = DIAS.map(d => {
          const reservas = palco.reservas[d] || [];
          const ocupadas = reservas.reduce((sum, r) => {
            const cantidad = typeof r.cantidad === 'number' ? r.cantidad : parseInt(r.cantidad) || 1;
            return sum + cantidad;
          }, 0);
          return Math.max(0, 10 - ocupadas);
        });
        
        const minimoDisponible = Math.min(...disponibilidades);
        console.log(`🔍 Palco ${numeroPalco} - Disponibilidades por día:`, disponibilidades, 'Mínimo:', minimoDisponible);
        return minimoDisponible;
      }
    }
  };

  // Función para obtener el color del palco con mejor gradiente
  const getColorPalco = (numeroPalco, isHovered = false, isSelected = false) => {
    const estado = getEstadoPalco(numeroPalco, filtroDia);
    
    if (isSelected) {
      return 'url(#gradientSelected)';
    }
    
    if (isHovered) {
      switch (estado) {
        case 'vendido':
          return 'url(#gradientVendidoHover)';
        case 'reservado':
          return 'url(#gradientReservadoHover)';
        case 'disponible':
        default:
          return 'url(#gradientDisponibleHover)';
      }
    }
    
    switch (estado) {
      case 'vendido':
        return 'url(#gradientVendido)';
      case 'reservado':
        return 'url(#gradientReservado)';
      case 'disponible':
      default:
        return 'url(#gradientDisponible)';
    }
  };

  // Función para obtener información del palco
  const getInfoPalco = (palcoMapa) => {
    const palcoData = palcos.find(p => p.numero === palcoMapa.numero);
    const estado = getEstadoPalco(palcoMapa.numero, filtroDia);
    const disponibles = getSillasDisponibles(palcoMapa.numero, filtroDia);
    
    // Usar el tipo real del palco desde Firebase, o el de configuración como fallback
    const tipoReal = palcoData?.tipo || palcoMapa.tipo;
    
    let estadoTexto = '';
    let iconoEstado = '';
    switch (estado) {
      case 'vendido':
        estadoTexto = 'Vendido';
        iconoEstado = '🚫';
        break;
      case 'reservado':
        estadoTexto = 'Reservado';
        iconoEstado = '⏱️';
        break;
      case 'disponible':
      default:
        estadoTexto = 'Disponible';
        iconoEstado = '✅';
    }

    return {
      estado: estadoTexto,
      iconoEstado,
      disponibles: disponibles,
      ocupacion: `${10 - disponibles}/10 sillas`,
      precio: tipoReal === 'completo'
        ? (palcoData?.precio ? `$${palcoData.precio.toLocaleString()}` : '⚠️ Sin precio asignado')
        : `$${(PRECIO_SILLA?.viernes || 0).toLocaleString()}/día`,
      tipo: tipoReal
    };
  };

  // Calcular palcos disponibles dinámicamente
  const palcosDisponibles = useMemo(() => {
    return todosPalcos.filter(palco => getEstadoPalco(palco.numero, filtroDia) === 'disponible').length;
  }, [todosPalcos, palcos, filtroDia]);

  // Manejar hover del palco (anclado al palco)
  const handlePalcoHover = (palcoMapa) => {
    if (isMobile) return;
    const posicion = calcularPosicionTooltip(palcoMapa);
    setTooltipPos(posicion);
    setShowTooltip(palcoMapa);
    setHoveredPalco(palcoMapa.numero);
  };

  const handlePalcoLeave = () => {
    console.log('🎯 Leave del palco');
    
    if (isMobile) return; // No hover en móvil
    setShowTooltip(null);
    setHoveredPalco(null);
  };

  // Manejar click del palco
  const handlePalcoClick = (palcoMapa, event) => {
    // Verificar si es click derecho (button 2)
    if (event.button === 2) {
      console.log('Click derecho detectado, ignorando click normal');
      return;
    }
    
    // En móvil, solo manejar click si no fue long press
    if (isMobile && longPressPalco) {
      console.log('Click ignorado - long press activo');
      return;
    }
    
    console.log('Click en palco:', palcoMapa.numero);
    
    const estado = getEstadoPalco(palcoMapa.numero, filtroDia);
    
    setSelectedPalco(palcoMapa.numero);
    setTimeout(() => setSelectedPalco(null), 1000);
    
    if (estado === 'vendido') {
      // Efecto de shake para palcos vendidos
      const element = document.getElementById(`palco-${palcoMapa.numero}`);
      if (element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 500);
      }
      return;
    }
    
    // Buscar el palco real en tu estado
    const palcoReal = palcos.find(p => p.numero === palcoMapa.numero);
    if (palcoReal && onPalcoClick) {
      console.log('Llamando onPalcoClick con:', palcoReal);
      onPalcoClick(palcoReal);
    }
  };

  // Manejar long press para móviles (equivalente al doble click)
  const handleLongPress = (palcoMapa, event) => {
    if (!isMobile) return;
    
    console.log('📱 Long press completado en palco:', palcoMapa.numero);
    console.log('📱 isMobile:', isMobile);
    console.log('📱 canConvertPalcos():', canConvertPalcos());
    
    // Verificar permisos antes de mostrar opciones de conversión
    if (!canConvertPalcos()) {
      console.log('❌ Usuario sin permisos para convertir palcos');
      alert('Solo administradores pueden cambiar tipos de palcos');
      return;
    }
    
    const palcoReal = palcos.find(p => p.numero === palcoMapa.numero);
    if (!palcoReal) {
      console.log('❌ Palco no encontrado:', palcoMapa.numero);
      console.log('📱 Palcos disponibles:', palcos.map(p => p.numero));
      return;
    }
    
    console.log('📱 Palco encontrado:', palcoReal);
    
    // Mostrar opciones de conversión
    const puedeConvertir = (
      (palcoReal.tipo === 'completo' && palcoReal.estado === 'disponible') ||
      (palcoReal.tipo === 'sillas' && ['viernes', 'sabado', 'domingo'].every(dia => 
        !palcoReal.reservas[dia] || palcoReal.reservas[dia].length === 0
      ))
    );
    
    console.log('📱 ¿Puede convertir?', puedeConvertir);
    console.log('📱 Tipo actual:', palcoReal.tipo);
    console.log('📱 Estado actual:', palcoReal.estado);
    console.log('📱 Reservas:', palcoReal.reservas);
    
    if (puedeConvertir) {
      const tipoDestino = palcoReal.tipo === 'completo' ? 'sillas' : 'completo';
      const confirmacion = window.confirm(
        `¿Convertir Palco ${palcoMapa.numero} de ${palcoReal.tipo} a ${tipoDestino}?`
      );
      
      if (confirmacion) {
        console.log('✅ Confirmando conversión de palco:', palcoMapa.numero, 'de', palcoReal.tipo, 'a', tipoDestino);
        handleConvertir(palcoMapa, tipoDestino);
      } else {
        console.log('❌ Conversión cancelada por el usuario');
      }
    } else {
      console.log('❌ No se puede convertir este palco');
      console.log('📱 Razón: tipo =', palcoReal.tipo, ', estado =', palcoReal.estado);
      alert('No se puede convertir este palco en este momento. Verifica que esté disponible y no tenga reservas.');
    }
  };

  // Manejar click derecho para menú contextual (solo en desktop)
  const handleRightClick = (palcoMapa, event) => {
    if (isMobile) return; // En móvil se maneja con long press
    
    event.preventDefault();
    event.stopPropagation(); // Evitar que se propague al click normal
    
    console.log('🖱️ Click derecho en palco:', palcoMapa.numero);
    
    // Verificar permisos antes de mostrar menú contextual
    if (!canConvertPalcos()) {
      console.log('❌ Usuario sin permisos para convertir palcos');
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const svg = event.currentTarget.closest('svg');
    const svgRect = svg.getBoundingClientRect();
    
    setContextMenu({
      show: true,
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top,
      palco: palcoMapa
    });
  };

  // Cerrar menú contextual
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, palco: null });
  };

  // Manejar conversión de palco
  const handleConvertir = (palco, tipoDestino) => {
    const palcoReal = palcos.find(p => p.numero === palco.numero);
    
    if (tipoDestino === 'completo' && onConvertirACompleto) {
      // Verificar que no tenga reservas por sillas
      const tieneReservas = ['viernes', 'sabado', 'domingo'].some(dia => 
        palcoReal.reservas[dia] && palcoReal.reservas[dia].length > 0
      );
      
      if (tieneReservas) {
        alert('No se puede convertir a palco completo porque tiene reservas por sillas');
        return;
      }
      
      onConvertirACompleto(palco.numero);
    } else if (tipoDestino === 'sillas' && onConvertirASillas) {
      // Verificar que esté disponible
      if (palcoReal.estado !== 'disponible') {
        alert('No se puede convertir a palco por sillas porque está ocupado');
        return;
      }
      
      onConvertirASillas(palco.numero);
    }
    
    closeContextMenu();
  };

  // Filtrar palcos según el filtro actual
  const palcosFiltrados = todosPalcos.filter(palco => {
    if (filtroEstado === 'todos') return true;
    return getEstadoPalco(palco.numero, filtroDia) === filtroEstado;
  });

  // Calcular tamaños responsivos
  // 🆕 Radios reducidos: con 38 palcos en 3 filas/columnas (15/8/15) hay
  // menos espacio por palco que en el mapa anterior (13/7/7/13).
  const palcoRadius = isMobile ? 14 : 16;
  const palcoRadiusHover = isMobile ? 17 : 19;
  const palcoRadiusSelected = isMobile ? 19 : 21;
  const fontSize = isMobile ? 10 : 11;
  const fontSizeHover = isMobile ? 12 : 13;

  return (
    <div className="mapa-container-v2" style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(8px, 2vw, 12px)',
      boxSizing: 'border-box',
      marginTop: 'clamp(20px, 4vw, 40px)'
    }}>
      {/* Contenedor principal con borde completo */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        border: '3px solid #8B4513',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        boxSizing: 'border-box'
      }}>
      {/* Encabezado del Mapa */}
      <div className="mapa-header" style={{
        width: '100%',
        maxWidth: '900px',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        marginBottom: '0',
        flexWrap: 'wrap',
        padding: 'clamp(20px, 4vw, 30px)',
        minHeight: 'clamp(120px, 20vw, 160px)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          gap: 'clamp(8px, 2vw, 12px)'
        }}>
          <h1 className="titulo-palcos" style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: '900',
            color: '#fff',
            margin: '0',
            textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
            letterSpacing: 'clamp(2px, 0.4vw, 3px)',
            textAlign: 'left',
            lineHeight: '1.2',
            marginBottom: 'clamp(8px, 2vw, 12px)'
          }}>
            PALCOS
          </h1>
          <div className="subtitulo-equino" style={{
            backgroundColor: '#FF8C00',
            color: '#fff',
            padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 20px)',
            borderRadius: '8px',
            fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
            fontWeight: '600',
            margin: '0',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            display: 'block',
            width: 'fit-content'
          }}>
            Exposición Equina grado B
          </div>
          <p className="fecha-evento" style={{
            color: '#f0f0f0',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            margin: '0',
            fontWeight: '500',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }}>
            del 11 al 13 de Septiembre de 2026
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
          gap: 'clamp(8px, 2vw, 12px)'
        }}>
          <div className="numero-palcos" style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1',
            animation: palcosDisponibles !== todosPalcos.length ? 'pulse 2s infinite' : 'none',
            textAlign: 'center',
            marginBottom: 'clamp(4px, 1vw, 8px)'
          }}>
            {palcosDisponibles}
          </div>
          <div className="texto-palcos" style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            textAlign: 'center',
            margin: '0',
            fontWeight: '600',
            lineHeight: '1.3',
            letterSpacing: 'clamp(0.5px, 0.1vw, 1px)'
          }}>
            PALCOS<br/>DISPONIBLES
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(16px, 3vw, 20px)'
        }}>
          <div style={{
            fontSize: 'clamp(2.5rem, 7vw, 4rem)',
            animation: 'bounce 2s infinite',
            marginRight: 'clamp(8px, 2vw, 12px)'
          }}>
            🐎
          </div>
          <div style={{
            color: '#fff',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(6px, 1.5vw, 8px)'
          }}>
            <div className="expo-equino" style={{
              fontSize: 'clamp(1.3rem, 3.8vw, 2rem)',
              fontWeight: 'bold',
              margin: '0',
              textAlign: 'right',
              lineHeight: '1.1',
              letterSpacing: 'clamp(1px, 0.2vw, 2px)'
            }}>
              EXPO
            </div>
            <div className="expo-equino" style={{
              fontSize: 'clamp(1.3rem, 3.8vw, 2rem)',
              fontWeight: 'bold',
              margin: '0',
              textAlign: 'right',
              lineHeight: '1.1',
              letterSpacing: 'clamp(1px, 0.2vw, 2px)'
            }}>
              EQUINO
            </div>
            <div className="tenjo-2025" style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontWeight: '600',
              textAlign: 'right',
              lineHeight: '1.3',
              letterSpacing: 'clamp(0.5px, 0.1vw, 1px)'
            }}>
              Tenjo 2026
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda interactiva */}
      <div className="filtros-mapa" style={{
        backgroundColor: '#fff',
        padding: 'clamp(15px, 3vw, 25px) clamp(20px, 4vw, 30px)',
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(20px, 4vw, 40px)',
        flexWrap: 'wrap',
        margin: '0',
        minHeight: 'clamp(80px, 15vw, 100px)'
      }}>
        {[
          { estado: 'disponible', color: '#27ae60', icono: '✅', texto: 'Disponible' },
          { estado: 'reservado', color: '#f39c12', icono: '⏱️', texto: 'Reservado' },
          { estado: 'vendido', color: '#e74c3c', icono: '🚫', texto: 'Vendido' }
        ].map(item => (
          <div key={item.estado} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px)',
            borderRadius: '20px',
            backgroundColor: filtroEstado === item.estado ? `${item.color}20` : 'transparent',
            border: filtroEstado === item.estado ? `2px solid ${item.color}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: filtroEstado === item.estado ? 'scale(1.05)' : 'scale(1)'
          }}>
            <div style={{
              width: 'clamp(14px, 2.2vw, 16px)',
              height: 'clamp(14px, 2.2vw, 16px)',
              borderRadius: '50%',
              backgroundColor: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(8px, 1.4vw, 10px)'
            }}>
              {item.icono}
            </div>
            <span className="leyenda-texto" style={{
              fontWeight: '600',
              color: filtroEstado === item.estado ? item.color : '#333',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)'
            }}>
              {item.texto}
            </span>
          </div>
        ))}
      </div>

      {/* Barra de instrucciones encima del mapa */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#fff',
        padding: 'clamp(15px, 3vw, 20px) clamp(20px, 4vw, 25px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'clamp(15px, 3vw, 20px)',
        flexWrap: 'wrap',
        margin: '0',
        minHeight: 'clamp(70px, 12vw, 90px)',

      }}>
        {/* INSTRUCCIONES - CENTRADAS */}
        <div className="instrucciones-izquierda" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 'clamp(8px, 2vw, 12px)', 
          alignItems: 'center',
          textAlign: 'center',
          flex: '1',
          width: '100%'
        }}>
          <div className="instruccion-item" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(4px, 1vw, 6px) 0',
            justifyContent: 'center',
            width: '100%'
          }}>
            <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}>🎯</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Click izquierdo:</span>
              <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: '#666' }}>Reservar palco</span>
            </div>
          </div>
          
          {canConvertPalcos() && (
            <div className="instruccion-item" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: 'clamp(4px, 1vw, 6px) 0',
              justifyContent: 'center',
              width: '100%'
            }}>
              <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}>🖱️</span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Click derecho:</span>
              <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: '#666' }}>Convertir tipo</span>
            </div>
            </div>
          )}
          
          <div className="instruccion-item" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(4px, 1vw, 6px) 0',
            justifyContent: 'center',
            width: '100%'
          }}>
            <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)' }}>🔄</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Hover:</span>
              <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: '#666' }}>Ver detalles</span>
            </div>
          </div>
          
          {/* ACTUALIZADO EN TIEMPO REAL */}
          <div className="instruccion-item" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(4px, 1vw, 6px) 0',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{
              width: 'clamp(10px, 1.5vw, 12px)', 
              height: 'clamp(10px, 1.5vw, 12px)', 
              borderRadius: '50%', 
              backgroundColor: '#27ae60', 
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: '1.2' }}>Actualizado en</span>
              <span style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: '#666', lineHeight: '1.2' }}>tiempo real</span>
            </div>
          </div>
        </div>




      </div>

      <svg
        viewBox="0 0 1200 880"
        className="mapa-svg-interactivo"
        style={{ 
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          backgroundColor: '#faf8f3',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          cursor: 'default',
          userSelect: 'none',
          display: 'block',
          width: '100%',
          maxWidth: '900px',
          margin: '0',
          overflow: 'visible',
          minHeight: 'clamp(600px, 80vw, 800px)'
        }}
        // Eventos de zoom eliminados
        // onWheel={handleWheel}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
      >
        {/* Grupo principal - zoom eliminado */}
        <g
          transform="translate(0, 0) scale(1)"
          transformOrigin="600 440"
        >
          {/* Contenido del mapa */}
          <g>
            {/* Definir gradientes y efectos */}
            <defs>
              {/* Gradientes para estados */}
              <radialGradient id="gradientDisponible" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#27ae60" />
              </radialGradient>
              <radialGradient id="gradientDisponibleHover" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#58d68d" />
                <stop offset="100%" stopColor="#2ecc71" />
              </radialGradient>
              
              <radialGradient id="gradientReservado" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#f7dc6f" />
                <stop offset="100%" stopColor="#f39c12" />
              </radialGradient>
              <radialGradient id="gradientReservadoHover" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fdeaa7" />
                <stop offset="100%" stopColor="#f7dc6f" />
              </radialGradient>
              
              <radialGradient id="gradientVendido" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ec7063" />
                <stop offset="100%" stopColor="#e74c3c" />
              </radialGradient>
              <radialGradient id="gradientVendidoHover" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#f1948a" />
                <stop offset="100%" stopColor="#ec7063" />
              </radialGradient>
              
              <radialGradient id="gradientSelected" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#85c1e9" />
                <stop offset="100%" stopColor="#3498db" />
              </radialGradient>

              {/* Filtros de efectos */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
              </filter>

              {/* Animaciones CSS dentro del SVG */}
              <style>
                {`
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-3px); }
                    75% { transform: translateX(3px); }
                  }
                  .palco-circle {
                    transition: all 0.3s ease;
                    cursor: pointer;
                  }
                  .palco-circle:hover {
                    filter: url(#glow);
                  }
                  .palco-text {
                    pointer-events: none;
                    font-family: 'Arial', sans-serif;
                    font-weight: bold;
                  }
                  .fadeIn {
                    animation: fadeIn 0.5s ease-in-out;
                  }
                  @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                  }
                `}
              </style>
            </defs>

            {/* Fondo del escenario/arena, según el nuevo plano del recinto */}
            <g>
              <rect
                x="320"
                y="100"
                width="600"
                height="590"
                fill="url(#gradientArena)"
                stroke="#27ae60"
                strokeWidth="3"
                rx="20"
                filter="url(#shadow)"
              />

              {/* Gradiente para la arena */}
              <defs>
                <linearGradient id="gradientArena" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f4d03f" />
                  <stop offset="50%" stopColor="#f7dc6f" />
                  <stop offset="100%" stopColor="#f1c40f" />
                </linearGradient>
              </defs>

              {/* Texto del escenario */}
              <text
                x="620"
                y="380"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill="#27ae60"
                style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}
              >
                ARENA PRINCIPAL
              </text>

              <text x="620" y="425" textAnchor="middle" fontSize="26" fill="#27ae60" fontWeight="600">
                Exposición Equina Grado B
              </text>

              <text x="620" y="460" textAnchor="middle" fontSize="22" fill="#27ae60" fontWeight="500">
                11-13 Septiembre 2026
              </text>

              {/* Mesa técnica */}
              <rect x="800" y="115" width="110" height="34" rx="6" fill="#f39c12" stroke="#fff" strokeWidth="1.5" />
              <text x="855" y="137" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
                MESA TÉCNICA
              </text>
            </g>

            {/* BAHÍA y PREPISTA: solo referencia del plano, no se venden */}
            <g>
              <rect x="320" y="20" width="180" height="65" rx="10" fill="#c8b48a" stroke="#8B4513" strokeWidth="2" />
              <text x="410" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3d2b12">
                BAHÍA
              </text>

              <rect x="510" y="20" width="280" height="65" rx="10" fill="#c8b48a" stroke="#8B4513" strokeWidth="2" />
              <text x="650" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3d2b12">
                PREPISTA
              </text>
            </g>

            {/* Graderías (público general, no numeradas ni vendibles aquí) */}
            <g>
              <rect x="150" y="90" width="55" height="610" rx="10" fill="#f0a94e" stroke="#8B4513" strokeWidth="2" />
              <text
                x="177"
                y="395"
                textAnchor="middle"
                fontSize="17"
                fontWeight="bold"
                fill="#3d2b12"
                transform="rotate(-90 177 395)"
              >
                GRADERÍAS PARA 700 PERSONAS
              </text>

              <rect x="340" y="790" width="560" height="55" rx="10" fill="#f0a94e" stroke="#8B4513" strokeWidth="2" />
              <text x="620" y="823" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3d2b12">
                GRADERÍAS PARA 400 PERSONAS
              </text>
            </g>

            {/* Entradas/salidas */}
            <g>
              <text x="177" y="770" textAnchor="middle" fontSize="22" fill="#8B4513">↕</text>
              <text x="177" y="793" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3d2b12">Entrada</text>
              <text x="177" y="806" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3d2b12">Salida</text>

              <text x="1035" y="770" textAnchor="middle" fontSize="22" fill="#8B4513">↕</text>
              <text x="1035" y="793" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3d2b12">Entrada/Salida</text>
              <text x="1035" y="806" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3d2b12">VIP</text>
            </g>

            {/* Etiquetas de secciones */}
            <text x="180" y="70" textAnchor="middle" fontSize="15" fill="#27ae60" fontWeight="600">
              LATERAL IZQUIERDO
            </text>
            <text x="1060" y="70" textAnchor="middle" fontSize="15" fill="#27ae60" fontWeight="600">
              LATERAL DERECHO
            </text>
            <text x="620" y="705" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#27ae60">
              INFERIOR
            </text>

            {/* Renderizar palcos con animaciones */}
            {palcosFiltrados.map((palcoMapa, index) => {
              const info = getInfoPalco(palcoMapa);
              const color = getColorPalco(palcoMapa.numero, hoveredPalco === palcoMapa.numero, selectedPalco === palcoMapa.numero);
              const isHovered = hoveredPalco === palcoMapa.numero;
              const isSelected = selectedPalco === palcoMapa.numero;
              
              return (
                <g key={`${palcoMapa.numero}-${animationKey}`} className="fadeIn" 
                   style={{ animationDelay: `${index * 0.05}s` }}>
                  
                  {/* Círculo de resplandor para hover */}
                  {isHovered && (
                    <circle
                      cx={palcoMapa.x}
                      cy={palcoMapa.y}
                      r="35"
                      fill="none"
                      stroke={info.estado === 'disponible' ? '#27ae60' : info.estado === 'reservado' ? '#f39c12' : '#e74c3c'}
                      strokeWidth="2"
                      opacity="0.6"
                      style={{
                        animation: 'pulse 1s infinite'
                      }}
                    />
                  )}
                  
                  {/* Círculo principal del palco */}
                  <circle
                    id={`palco-${palcoMapa.numero}`}
                    cx={palcoMapa.x}
                    cy={palcoMapa.y}
                    r={isHovered ? palcoRadiusHover : isSelected ? palcoRadiusSelected : palcoRadius}
                    fill={color}
                    stroke={info.tipo === 'sillas' ? "#9b59b6" : "#34495e"}
                    strokeWidth={info.tipo === 'sillas' ? 3 : 2}
                    className="palco-circle"
                    filter="url(#shadow)"
                    onMouseEnter={(e) => handlePalcoHover(palcoMapa, e)}
                    onMouseLeave={handlePalcoLeave}
                    onClick={(e) => handlePalcoClick(palcoMapa, e)}
                    // EVENTOS TOUCH DESHABILITADOS PARA PERMITIR SCROLL EN IPAD
                    // onTouchStart={(e) => {
                    //   console.log('📱 Touch start en palco:', palcoMapa.numero);
                    //   if (isMobile) {
                    //     const timer = setTimeout(() => {
                    //       console.log('📱 Timer completado para palco:', palcoMapa.numero);
                    //       // Ejecutar long press directamente cuando el timer se complete
                    //       handleLongPress(palcoMapa, e);
                    //     }, 1000); // 1 segundo para long press
                    //     setLongPressTimer(timer);
                    //   } else {
                    //     handlePalcoClick(palcoMapa, e);
                    //   }
                    // }}
                    // onTouchEnd={(e) => {
                    //   console.log('📱 Touch end en palco:', palcoMapa.numero);
                    //   if (isMobile) {
                    //     clearTimeout(longPressTimer);
                    //     setLongPressTimer(null);
                    //     setLongPressPalco(null);
                    //     setLongPressProgress(0);
                    //     setLongPressMessage('');
                    //   }
                    // }}
                    // onTouchCancel={(e) => {
                    //   console.log('📱 Touch cancel en palco:', palcoMapa.numero);
                    //   if (isMobile) {
                    //     clearTimeout(longPressTimer);
                    //     setLongPressTimer(null);
                    //     setLongPressPalco(null);
                    //     setLongPressProgress(0);
                    //     setLongPressMessage('');
                    //   }
                    // }}
                    onContextMenu={(e) => handleRightClick(palcoMapa, e)}
                    style={{
                      transform: `scale(${isHovered ? 1.1 : isSelected ? 1.2 : 1})`,
                      transformOrigin: `${palcoMapa.x}px ${palcoMapa.y}px`,
                      cursor: 'pointer',
                      touchAction: 'manipulation'
                    }}
                  />
                  
                  {/* Número del palco */}
                  <text
                    x={palcoMapa.x}
                    y={palcoMapa.y + 6}
                    textAnchor="middle"
                    fontSize={isHovered ? fontSizeHover : fontSize}
                    fontWeight="bold"
                    fill="white"
                    className="palco-text"
                    style={{ 
                      filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {palcoMapa.numero}
                  </text>
                  
                  {/* Indicador de tipo de palco mejorado */}
                  {info.tipo === 'sillas' && (
                    <g>
                      <circle
                        cx={palcoMapa.x + 18}
                        cy={palcoMapa.y - 18}
                        r="6"
                        fill="#9b59b6"
                        stroke="white"
                        strokeWidth="2"
                        filter="url(#shadow)"
                      />
                      <text
                        x={palcoMapa.x + 18}
                        y={palcoMapa.y - 15}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="white"
                        style={{ pointerEvents: 'none' }}
                      >
                        S
                      </text>
                    </g>
                  )}
                  
                  {/* Indicador de estado con icono */}
                  {isHovered && (
                    <text
                      x={palcoMapa.x}
                      y={palcoMapa.y - 35}
                      textAnchor="middle"
                      fontSize="18"
                      style={{ pointerEvents: 'none' }}
                    >
                      {info.iconoEstado}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Tooltip anclado al palco (como cliente) */}
            {showTooltip && (
              <g style={{ pointerEvents: 'none' }}>
                {/* Sombra */}
                <rect
                  x={tooltipPos.x + 2}
                  y={tooltipPos.y + 2}
                  width="260"
                  height="115"
                  fill="rgba(0,0,0,0.1)"
                  rx="12"
                />
                {/* Fondo */}
                <rect
                  x={tooltipPos.x}
                  y={tooltipPos.y}
                  width="260"
                  height="115"
                  fill="url(#tooltipGradient)"
                  stroke="#3498db"
                  strokeWidth="2"
                  rx="12"
                  filter="url(#shadow)"
                />
                <defs>
                  <linearGradient id="tooltipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c3e50" />
                    <stop offset="100%" stopColor="#34495e" />
                  </linearGradient>
                </defs>
                {/* Separador */}
                <line
                  x1={tooltipPos.x + 15}
                  y1={tooltipPos.y + 20}
                  x2={tooltipPos.x + 245}
                  y2={tooltipPos.y + 20}
                  stroke="#3498db"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Título */}
                <text x={tooltipPos.x + 20} y={tooltipPos.y + 13} fill="white" fontSize="16" fontWeight="bold">
                  🏛️ Palco {showTooltip.numero}
                </text>
                {/* Estado */}
                <text x={tooltipPos.x + 20} y={tooltipPos.y + 35} fill="#ecf0f1" fontSize="13" fontWeight="600">
                  {getInfoPalco(showTooltip).iconoEstado} {getInfoPalco(showTooltip).tipo === 'completo' ? 'Palco Completo' : 'Por Sillas'} • {getInfoPalco(showTooltip).estado}
                </text>
                {/* Disponibilidad */}
                <text x={tooltipPos.x + 20} y={tooltipPos.y + 55} fill="#ecf0f1" fontSize="12">
                  💺 {getInfoPalco(showTooltip).disponibles} sillas disponibles
                </text>
                {/* Precio */}
                <text x={tooltipPos.x + 20} y={tooltipPos.y + 75} fill="#f39c12" fontSize="13" fontWeight="bold">
                  💰 {getInfoPalco(showTooltip).precio}
                </text>
                {/* Mensaje acción */}
                <text x={tooltipPos.x + 20} y={tooltipPos.y + 95} fill="#10b981" fontSize="12" fontWeight="bold">
                  ✅ Click para reservar
                </text>
                {/* Flecha según dirección */}
                {(() => {
                  const d = tooltipPos.arrowDirection || 'down';
                  let pts;
                  if (d === 'up') pts = `${tooltipPos.x + 20},${tooltipPos.y + 115} ${tooltipPos.x + 30},${tooltipPos.y + 115} ${tooltipPos.x + 25},${tooltipPos.y + 108}`;
                  else if (d === 'down') pts = `${tooltipPos.x + 20},${tooltipPos.y + 8} ${tooltipPos.x + 30},${tooltipPos.y + 8} ${tooltipPos.x + 25},${tooltipPos.y + 15}`;
                  else if (d === 'left') pts = `${tooltipPos.x + 8},${tooltipPos.y + 50} ${tooltipPos.x + 8},${tooltipPos.y + 60} ${tooltipPos.x + 15},${tooltipPos.y + 55}`;
                  else pts = `${tooltipPos.x + 260},${tooltipPos.y + 50} ${tooltipPos.x + 260},${tooltipPos.y + 60} ${tooltipPos.x + 253},${tooltipPos.y + 55}`;
                  return (
                    <polygon points={pts} fill="#34495e" stroke="#3498db" strokeWidth="1" />
                  );
                })()}
              </g>
            )}

            {/* Menú contextual para conversión */}
            {contextMenu.show && (
              <g>
                {/* Fondo del menú */}
                <rect
                  x={contextMenu.x}
                  y={contextMenu.y}
                  width="200"
                  height="120"
                  fill="white"
                  stroke="#2c3e50"
                  strokeWidth="2"
                  rx="8"
                  filter="url(#shadow)"
                />
                
                {/* Título del menú */}
                <text
                  x={contextMenu.x + 100}
                  y={contextMenu.y + 20}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#2c3e50"
                >
                  🔧 Palco {contextMenu.palco?.numero}
                </text>
                
                <line
                  x1={contextMenu.x + 10}
                  y1={contextMenu.y + 25}
                  x2={contextMenu.x + 190}
                  y2={contextMenu.y + 25}
                  stroke="#bdc3c7"
                  strokeWidth="1"
                />
                
                {/* Opciones del menú */}
                {(() => {
                  const palcoReal = palcos.find(p => p.numero === contextMenu.palco?.numero);
                  const puedeConvertir = palcoReal && canConvertPalcos() && (
                    (palcoReal.tipo === 'completo' && palcoReal.estado === 'disponible') ||
                    (palcoReal.tipo === 'sillas' && ['viernes', 'sabado', 'domingo'].every(dia => 
                      !palcoReal.reservas[dia] || palcoReal.reservas[dia].length === 0
                    ))
                  );
                  
                  return (
                    <g>
                      {/* Opción 1: Convertir - Solo si tiene permisos */}
                      {canConvertPalcos() && (
                        <>
                          <rect
                            x={contextMenu.x + 10}
                            y={contextMenu.y + 35}
                            width="180"
                            height="25"
                            fill={puedeConvertir ? "#ecf0f1" : "#bdc3c7"}
                            rx="4"
                            style={{ cursor: puedeConvertir ? 'pointer' : 'not-allowed' }}
                            onClick={puedeConvertir ? () => {
                              const tipoDestino = palcoReal.tipo === 'completo' ? 'sillas' : 'completo';
                              handleConvertir(contextMenu.palco, tipoDestino);
                            } : undefined}
                          />
                          
                          <text
                            x={contextMenu.x + 100}
                            y={contextMenu.y + 50}
                            textAnchor="middle"
                            fontSize="12"
                            fill={puedeConvertir ? "#2c3e50" : "#7f8c8d"}
                            fontWeight="600"
                          >
                            {palcoReal?.tipo === 'completo' 
                              ? '🔄 Convertir a Por Sillas' 
                              : '🔄 Convertir a Completo'}
                          </text>
                        </>
                      )}
                      
                      {/* Opción 2: Cerrar */}
                      <rect
                        x={contextMenu.x + 10}
                        y={contextMenu.y + (canConvertPalcos() ? 70 : 35)}
                        width="180"
                        height="25"
                        fill="#e74c3c"
                        rx="4"
                        style={{ cursor: 'pointer' }}
                        onClick={closeContextMenu}
                      />
                      
                      <text
                        x={contextMenu.x + 100}
                        y={contextMenu.y + (canConvertPalcos() ? 85 : 50)}
                        textAnchor="middle"
                        fontSize="12"
                        fill="white"
                        fontWeight="600"
                      >
                        ❌ Cerrar
                      </text>
                      
                      {/* Estado actual */}
                      <text
                        x={contextMenu.x + 100}
                        y={contextMenu.y + (canConvertPalcos() ? 105 : 70)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#7f8c8d"
                      >
                        Estado: {palcoReal?.tipo === 'completo' ? 'Palco Completo' : 'Por Sillas'}
                      </text>
                      
                      {/* Mensaje de permisos si no tiene acceso */}
                      {!canConvertPalcos() && (
                        <text
                          x={contextMenu.x + 100}
                          y={contextMenu.y + 105}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#e74c3c"
                          fontWeight="600"
                        >
                          🔒 Solo administradores pueden convertir palcos
                        </text>
                      )}
                    </g>
                  );
                })()}
              </g>
            )}
          </g>
        </g>
      </svg>

      {/* Controles de Zoom - ELIMINADOS */}
      {/* <div style={{...}}>
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>−</button>
        <button onClick={resetZoom}>🔄</button>
        <div>{Math.round(zoom * 100)}%</div>
      </div> */}

      {/* Nota: leyenda inferior eliminada y barra de instrucciones movida arriba */}
      </div> {/* Cierre del contenedor principal con borde */}

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.7; 
          }
        }
        
        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }
        
        @keyframes shake {
          0%, 100% { 
            transform: translateX(0); 
          }
          10%, 30%, 50%, 70%, 90% { 
            transform: translateX(-5px); 
          }
          20%, 40%, 60%, 80% { 
            transform: translateX(5px); 
          }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  );
};

export default MapaPalcos;