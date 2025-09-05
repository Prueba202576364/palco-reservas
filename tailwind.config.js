/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Breakpoints alineados con palcos-cliente
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4k': '2560px',
        // Alias por dispositivo (opcionales, solo utilidades)
        'iphone-se': '390px',
        'iphone-xr': '414px',
        'ipad-mini': '768px',
        'ipad-pro': '1024px',
        'surface-pro': '912px',
        macbook: '1440px',
      },

      // Paleta y tokens usados por la app (mismos colores)
      colors: {
        palco: {
          disponible: '#27ae60',
          reservado: '#f39c12',
          vendido: '#e74c3c',
          'disponible-hover': '#2ecc71',
          'reservado-hover': '#f1c40f',
          'vendido-hover': '#c0392b',
        },
        primary: {
          red: '#C4302B',
          gold: '#D97706',
          green: '#16A34A',
        },
        dark: { brown: '#451A03' },
        cream: { bg: '#F5F1EB' },
        wood: { brown: '#8B4513' },
      },

      // Espaciados adicionales frecuentes
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
        200: '50rem',
        250: '62.5rem',
        300: '75rem',
        400: '100rem',
      },

      // Grids para palcos
      gridTemplateColumns: {
        'palcos-mobile': 'repeat(2, 1fr)',
        'palcos-tablet': 'repeat(4, 1fr)',
        'palcos-desktop': 'repeat(6, 1fr)',
        'palcos-large': 'repeat(8, 1fr)',
        'palcos-xl': 'repeat(10, 1fr)',
        'palcos-4k': 'repeat(12, 1fr)',
      },

      // Alturas seguras de viewport
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'palco-mobile': '80px',
        'palco-tablet': '100px',
        'palco-desktop': '120px',
        'palco-large': '140px',
      },

      aspectRatio: {
        palco: '1 / 1',
        'palco-wide': '4 / 3',
        'palco-tall': '3 / 4',
      },

      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },

      boxShadow: {
        palco: '0 4px 15px rgba(0,0,0,0.2)',
        'palco-hover': '0 8px 25px rgba(0,0,0,0.3)',
        header: '0 4px 15px rgba(0,0,0,0.2)',
        filtros: '0 4px 15px rgba(0,0,0,0.2)',
      },

      borderRadius: {
        palco: '12px',
        'palco-lg': '15px',
        'palco-xl': '18px',
        'palco-2xl': '20px',
      },

      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}