import { useEffect, useState, useRef } from 'react';

const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = "Modal",
  size = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ""
}) => {
  const scrollContainerRef = useRef(null);
  const [deviceType, setDeviceType] = useState('desktop');
  
  // Detectar dispositivo
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent);
      const isTablet = /ipad/i.test(userAgent);
      
      if (isTablet) {
        setDeviceType('tablet');
      } else if (isMobile) {
        setDeviceType('mobile');
      } else {
        setDeviceType('desktop');
      }
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Manejar escape y body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Estilos del modal
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    overflowY: 'auto'
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: size === 'full' ? (deviceType === 'mobile' ? '95vw' : '98vw') : '600px',
    height: 'auto',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '16px 20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #ddd',
    flexShrink: 0,
    backgroundColor: '#f8f9fa'
  };

  const bodyStyle = {
    padding: deviceType === 'mobile' ? '15px' : '20px',
    paddingTop: deviceType === 'mobile' ? '10px' : '15px',
    paddingBottom: deviceType === 'mobile' ? '20px' : '30px',
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={modalStyle} onClick={closeOnOverlayClick ? onClose : undefined}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
            {title}
          </h2>
          
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Contenido con scroll */}
        <div 
          ref={scrollContainerRef}
          style={bodyStyle}
        >
          {children}
        </div>
      </div>
      
      {/* Estilos CSS inline para animaciones */}
      <style>{`
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveModal;
