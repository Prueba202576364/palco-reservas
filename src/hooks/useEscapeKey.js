import { useEffect } from 'react';

/**
 * Hook personalizado para manejar la tecla ESC
 * @param {boolean} isActive - Si el modal/componente está activo
 * @param {function} onEscape - Función a ejecutar cuando se presiona ESC
 */
const useEscapeKey = (isActive, onEscape) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isActive) {
        onEscape();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);
};

export default useEscapeKey;