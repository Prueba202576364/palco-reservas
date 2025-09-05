import React from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  className = ''
}) => {
  const deviceInfo = useDeviceDetection();
  
  // Calcular información de paginación
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Función para manejar clicks en botones
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };
  
  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = deviceInfo?.isMobile ? 5 : 7; // Menos páginas visibles en móviles
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      if (currentPage <= 4) {
        // Páginas iniciales
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Páginas finales
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas intermedias
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Estilos responsivos
  const getButtonStyle = (isActive = false, isDisabled = false) => ({
    background: isDisabled ? 'rgba(255,255,255,0.2)' : 
                isActive ? 'linear-gradient(135deg, #16A34A, #22c55e)' : 
                'rgba(255,255,255,0.15)',
    color: isDisabled ? '#ccc' : 'white',
    border: isActive ? '2px solid #16A34A' : '2px solid rgba(255,255,255,0.4)',
    padding: deviceInfo?.isMobile ? '8px 10px' : '10px 15px',
    borderRadius: '8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontSize: deviceInfo?.isMobile ? '12px' : '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: deviceInfo?.isMobile ? '35px' : '40px',
    textAlign: 'center',
    boxShadow: isActive ? '0 2px 8px rgba(22, 163, 74, 0.4)' : 'none',
    opacity: isDisabled ? 0.5 : 1
  });

  const getContainerStyle = () => ({
    background: 'linear-gradient(135deg, #D97706 0%, #8B4513 50%, #451A03 100%)',
    padding: deviceInfo?.isMobile ? '15px' : '20px',
    borderRadius: '12px',
    marginTop: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    border: '2px solid #8B4513',
    textAlign: 'center'
  });

  return (
    <div className={`pagination-container ${className}`} style={getContainerStyle()}>
      {/* Navegación de páginas - Solo mostrar si hay más de 1 página */}
      {totalPages > 1 ? (
        <>
          {/* Navegación de páginas */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: deviceInfo?.isMobile ? '3px' : '5px',
            flexWrap: 'wrap'
          }}>
            {/* Botón Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={getButtonStyle(false, currentPage === 1)}
            >
              ‹
            </button>
            
            {/* Números de página */}
            {pageNumbers.map((pageNumber, index) => {
              if (pageNumber === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    style={{
                      color: 'white',
                      padding: deviceInfo?.isMobile ? '6px 10px' : '8px 12px',
                      fontSize: deviceInfo?.isMobile ? '12px' : '14px',
                      fontWeight: '600'
                    }}
                  >
                    ...
                  </span>
                );
              }
              
              const isCurrentPage = pageNumber === currentPage;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={getButtonStyle(isCurrentPage)}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {/* Botón Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={getButtonStyle(false, currentPage === totalPages)}
            >
              ›
            </button>
          </div>
        </>
      ) : (
        /* Mensaje cuando solo hay 1 página */
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: deviceInfo?.isMobile ? '12px' : '14px'
        }}>
          {totalItems === 0 ? 'No hay palcos disponibles con los filtros actuales' : 'Todos los palcos están en esta página'}
        </div>
      )}
    </div>
  );
};

export default Pagination; 