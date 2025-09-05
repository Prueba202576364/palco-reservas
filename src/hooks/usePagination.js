import { useState, useMemo, useCallback } from 'react';
import { useDeviceDetection } from './useDeviceDetection';

const usePagination = (items, itemsPerPage = 10) => {
  const deviceInfo = useDeviceDetection();
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular items por página basado en el dispositivo
  const getItemsPerPage = () => {
    if (deviceInfo?.isMobile) return 6; // 2x3 grid en móviles
    if (deviceInfo?.isTablet) return 12; // 3x4 grid en tablets
    return 18; // 3x6 grid en desktop
  };
  
  const adaptiveItemsPerPage = itemsPerPage === 10 ? getItemsPerPage() : itemsPerPage;

  // Calcular información de paginación
  const paginationInfo = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / adaptiveItemsPerPage);
    
    // Asegurar que la página actual sea válida
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    
    // Calcular índices de inicio y fin
    const startIndex = (validCurrentPage - 1) * adaptiveItemsPerPage;
    const endIndex = startIndex + adaptiveItemsPerPage;
    
    // Obtener elementos de la página actual
    const currentItems = items.slice(startIndex, endIndex);
    
    return {
      currentItems,
      currentPage: validCurrentPage,
      totalPages,
      totalItems,
      itemsPerPage: adaptiveItemsPerPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems),
      hasNextPage: validCurrentPage < totalPages,
      hasPrevPage: validCurrentPage > 1
    };
  }, [items, currentPage, adaptiveItemsPerPage]);

  // Función para cambiar de página (usando useCallback para evitar re-renders)
  const goToPage = useCallback((page) => {
    const totalPages = Math.ceil(items.length / adaptiveItemsPerPage);
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  }, [items.length, adaptiveItemsPerPage]);

  // Funciones de navegación
  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      const newPage = paginationInfo.currentPage + 1;
      setCurrentPage(newPage);
    }
  }, [paginationInfo.currentPage, paginationInfo.hasNextPage]);

  const goToPrevPage = useCallback(() => {
    if (paginationInfo.hasPrevPage) {
      const newPage = paginationInfo.currentPage - 1;
      setCurrentPage(newPage);
    }
  }, [paginationInfo.currentPage, paginationInfo.hasPrevPage]);

  // Función para ir a la primera página
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Función para ir a la última página
  const goToLastPage = useCallback(() => {
    const totalPages = Math.ceil(items.length / adaptiveItemsPerPage);
    setCurrentPage(totalPages);
  }, [items.length, adaptiveItemsPerPage]);

  // Resetear a la primera página cuando cambian los items
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    ...paginationInfo,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    resetPagination
  };
};

export default usePagination; 