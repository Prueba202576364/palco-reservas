import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: 'portrait',
    screenSize: 'small',
    pixelRatio: 1,
    viewport: { width: 0, height: 0 }
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Detectar características del dispositivo
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?=.*\b(?!.*mobile))/i.test(userAgent) || 
                      (viewport.width >= 768 && viewport.width <= 1024);
      const isDesktop = !isMobile && !isTablet;

      // Determinar tamaño de pantalla
      let screenSize = 'small';
      if (viewport.width >= 1200) screenSize = 'large';
      else if (viewport.width >= 768) screenSize = 'medium';
      else screenSize = 'small';

      // Detectar orientación
      const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        orientation,
        screenSize,
        pixelRatio: window.devicePixelRatio || 1,
        viewport
      });
    };

    // Detección inicial
    detectDevice();

    // Listeners para cambios
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
};

// Hook para detectar características específicas
export const useDeviceFeatures = () => {
  const [features, setFeatures] = useState({
    hasHaptic: false,
    hasVibration: false,
    hasShare: false,
    hasPWA: false,
    hasOffline: false,
    hasPush: false
  });

  useEffect(() => {
    const detectFeatures = () => {
      setFeatures({
        hasHaptic: 'vibrate' in navigator,
        hasVibration: 'vibrate' in navigator,
        hasShare: 'share' in navigator,
        hasPWA: 'serviceWorker' in navigator,
        hasOffline: 'onLine' in navigator,
        hasPush: 'PushManager' in window
      });
    };

    detectFeatures();
  }, []);

  return features;
};

// Hook para manejo de teclado virtual
export const useVirtualKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const heightDiff = window.innerHeight - visualViewport.height;
        setKeyboardVisible(heightDiff > 150);
        setKeyboardHeight(heightDiff);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  return { keyboardVisible, keyboardHeight };
}; 