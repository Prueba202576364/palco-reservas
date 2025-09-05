import React from 'react';
import useDeviceDetection from '../../hooks/useDeviceDetection';

// Componente específico para palcos optimizado para móviles - MODERNIZADO
const MobileOptimizedPalco = ({ 
  palco, 
  estado,
  sillasDisponibles,
  onClick, 
  isSelected = false,
  className = '',
  canConvertPalcos = false,
  onConvertToSillas,
  onConvertToCompleto,
  dias = [],
  ...props 
}) => {
  const { isMobile, isTablet, getButtonSize } = useDeviceDetection();

  const getPalcoClasses = () => {
    const baseClasses = 'palco font-semibold text-center cursor-pointer transition-all duration-200 ease-in-out select-none touch-manipulation relative overflow-hidden rounded-lg';
    
    // Agregar clases específicas del estado
    const estadoClasses = `estado-${estado} tipo-${palco.tipo} ${palco.convertido ? 'tipo-convertido' : ''}`;
    
    const sizeClasses = isMobile 
      ? 'text-base p-4 min-h-[100px] rounded-xl' 
      : 'text-lg p-5 min-h-auto rounded-lg';

    return `${baseClasses} ${estadoClasses} ${sizeClasses}`;
  };

  const getPalcoStyle = () => {
    const baseStyle = {
      fontWeight: 600,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
      opacity: 1
    };

    // Estilos específicos según el estado del palco
    if (estado === 'vendido') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)',
        color: '#fff',
        fontWeight: 'bold',
        textShadow: '0 1px 2px #b22222'
      };
    } else if (estado === 'reservado') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        color: '#fff'
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        color: '#fff'
      };
    }
  };

  const getStatusText = () => {
    if (estado === 'disponible') {
      return `Disponible (${sillasDisponibles} sillas)`;
    } else if (estado === 'reservado') {
      return `Reservado (${sillasDisponibles} sillas libres)`;
    } else {
      return 'Vendido';
    }
  };

  const getConvertButton = () => {
    if (!canConvertPalcos) return null;

    const buttonClasses = 'btn absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/20 text-white border border-white/30 rounded cursor-pointer font-medium transition-all duration-200 hover:bg-white/30';
    const buttonSize = isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

    if (palco.tipo === 'completo') {
      return (
        <button
          className={`${buttonClasses} ${buttonSize}`}
          style={{ backgroundColor: '#f39c12', color: '#fff', fontSize: 12, marginRight: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            onConvertToSillas && onConvertToSillas();
          }}
          disabled={palco.estado !== 'disponible'}
          title="Convertir a palco por sillas"
        >
          🔄 Convertir a sillas
        </button>
      );
    } else {
      return (
        <button
          className={`${buttonClasses} ${buttonSize}`}
          style={{ backgroundColor: '#3498db', color: '#fff', fontSize: 12 }}
          onClick={(e) => {
            e.stopPropagation();
            onConvertToCompleto && onConvertToCompleto();
          }}
          disabled={dias.some(dia => (palco.reservas[dia] && palco.reservas[dia].length > 0))}
          title="Convertir a palco completo"
        >
          🔄 Convertir a completo
        </button>
      );
    }
  };

  return (
    <div
      className={`${getPalcoClasses()} ${isSelected ? 'ring-2 ring-white ring-offset-2' : ''} ${className}`}
      style={getPalcoStyle()}
      onClick={onClick}
      {...props}
    >
      {/* Indicador de tipo */}
      <div className={`palco-tipo-indicator ${palco.convertido ? 'convertido' : palco.tipo}`}>
        {palco.convertido ? '🔄' : (palco.tipo === 'completo' ? '📦' : '🪑')}
      </div>
      
      <div className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
        Palco {palco.numero}
      </div>
      
      <div className={`font-normal ${isMobile ? 'text-sm mb-5' : 'text-base mb-2'}`}>
        {getStatusText()}
      </div>
      
      {getConvertButton()}
      
      {/* Indicador de selección */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full border-2 border-gray-800" />
      )}
    </div>
  );
};

export default MobileOptimizedPalco; 