import React from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

// Contenedor responsive que se adapta automáticamente al dispositivo
const ResponsiveContainer = ({ 
  children, 
  className = '', 
  deviceInfo,
  gridType = 'palcos',
  ...props 
}) => {
  const deviceData = useDeviceDetection();
  const device = deviceInfo || deviceData;

  const getGridClasses = () => {
    if (gridType === 'palcos') {
      // Grid específico para palcos con columnas dinámicas
      if (device?.isMobile) {
        if (device?.orientation === 'landscape') {
          return 'grid grid-cols-4 gap-2';
        }
        return 'grid grid-cols-2 gap-3';
      } else if (device?.isTablet) {
        if (device?.orientation === 'landscape') {
          return 'grid grid-cols-6 gap-3';
        }
        return 'grid grid-cols-4 gap-3';
      } else if (device?.isDesktop) {
        if (device?.screenSize === 'large') {
          return 'grid grid-cols-8 gap-4';
        } else if (device?.screenSize === 'medium') {
          return 'grid grid-cols-6 gap-4';
        } else {
          return 'grid grid-cols-5 gap-4';
        }
      }
      // Fallback responsive
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4';
    }
    
    // Grid genérico
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4';
  };

  const getContainerClasses = () => {
    const baseClasses = 'w-full transition-all duration-300 ease-in-out';
    
    if (device?.isMobile) {
      return `${baseClasses} px-2 py-2`;
    } else if (device?.isTablet) {
      return `${baseClasses} px-4 py-3`;
    } else {
      return `${baseClasses} px-6 py-4`;
    }
  };

  const getResponsiveStyles = () => {
    const baseStyles = {
      minHeight: device?.isMobile ? 'auto' : 'auto',
      maxWidth: '100%',
      overflow: 'hidden'
    };

    // Ajustes específicos para orientación
    if (device?.isMobile && device?.orientation === 'landscape') {
      return {
        ...baseStyles,
        maxHeight: '80vh',
        overflowY: 'auto'
      };
    }

    return baseStyles;
  };

  return (
    <div
      className={`${getContainerClasses()} ${className}`}
      style={getResponsiveStyles()}
      {...props}
    >
      <div className={getGridClasses()}>
        {children}
      </div>
    </div>
  );
};

// Componente para botones responsive modernizado
export const ResponsiveButton = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  const baseClasses = 'min-h-[44px] min-w-[100px] font-semibold rounded-lg border-none cursor-pointer transition-all duration-200 ease-in-out touch-manipulation select-none relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500',
    secondary: 'bg-gradient-to-br from-pink-400 to-red-500 text-white hover:from-pink-500 hover:to-red-600 focus:ring-pink-500',
    success: 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 focus:ring-blue-500',
    danger: 'bg-gradient-to-br from-pink-400 to-yellow-400 text-white hover:from-pink-500 hover:to-yellow-500 focus:ring-pink-500',
    warning: 'bg-gradient-to-br from-teal-200 to-pink-200 text-gray-800 hover:from-teal-300 hover:to-pink-300 focus:ring-teal-500',
    info: 'bg-gradient-to-br from-orange-100 to-pink-200 text-gray-800 hover:from-orange-200 hover:to-pink-300 focus:ring-orange-500'
  };
  
  const sizeClasses = {
    small: 'text-xs px-3 py-2 min-h-[35px] min-w-[80px]',
    medium: 'text-sm px-4 py-2.5 min-h-[44px] min-w-[100px]',
    large: 'text-base px-5 py-3 min-h-[50px] min-w-[120px]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{
        WebkitTapHighlightColor: 'transparent'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Componente para grids responsive modernizado
export const ResponsiveGrid = ({ 
  children, 
  columns = 'auto-fit',
  minWidth = '200px',
  gap = '15px',
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`grid gap-4 w-full ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(${minWidth}, 1fr))`,
        gap: gap
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente para modales responsive modernizado
export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = '',
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-6 max-w-[95vw] max-h-[95vh] overflow-auto relative min-w-[300px] shadow-2xl border border-white/20 ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <h3 className="text-2xl font-semibold text-center mb-5 text-gray-800">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

// Componente para inputs responsive modernizado
export const ResponsiveInput = ({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 ease-in-out box-border bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
};

// Componente para selects responsive modernizado
export const ResponsiveSelect = ({ 
  value = '',
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none bg-white cursor-pointer box-border transition-all duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Componente para cards responsive modernizado
export const ResponsiveCard = ({ 
  children, 
  className = '',
  padding = 'p-5',
  ...props 
}) => {
  return (
    <div
      className={`bg-white rounded-xl ${padding} shadow-lg border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer; 