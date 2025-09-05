import React, { useState, useEffect } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import firebaseSyncService from '../../services/firebaseSync';
import imageService from '../../services/imageService';

const GestionQRModal = ({
  isOpen,
  onClose
}) => {
  const deviceInfo = useDeviceDetection();
  const [qrNequi, setQrNequi] = useState('');
  const [qrDaviplata, setQrDaviplata] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Paleta de colores del usuario
  const colors = {
    primaryRed: '#C4302B',
    primaryGold: '#D97706',
    primaryGreen: '#16A34A',
    darkBrown: '#451A03',
    creamBg: '#F5F1EB',
    white: '#FFFFFF',
    woodBrown: '#8B4513'
  };

  // Cargar QR existente al montar el componente
  useEffect(() => {
    if (isOpen) {
      cargarQR();
    }
  }, [isOpen]);

  const cargarQR = async () => {
    try {
      console.log('🔄 Cargando QR existente...');
      setMessage('🔄 Cargando códigos QR...');
      
      const qrData = await firebaseSyncService.obtenerQR();
      console.log('📥 QR obtenido de Firebase:', qrData);
      
      setQrNequi(qrData.nequi || '');
      setQrDaviplata(qrData.daviplata || '');
      
      // Verificar si se cargaron correctamente
      const nequiCargado = !!qrData.nequi;
      const daviplataCargado = !!qrData.daviplata;
      
      if (nequiCargado || daviplataCargado) {
        setMessage(`✅ QR cargados: Nequi ${nequiCargado ? '✅' : '❌'}, Daviplata ${daviplataCargado ? '✅' : '❌'}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('ℹ️ No hay códigos QR cargados. Sube tus códigos QR de Nequi y Daviplata.');
        setTimeout(() => setMessage(''), 5000);
      }
      
      console.log('✅ QR cargados exitosamente:', {
        nequi: nequiCargado ? 'Disponible' : 'No disponible',
        daviplata: daviplataCargado ? 'Disponible' : 'No disponible'
      });
      
    } catch (error) {
      console.error('❌ Error cargando QR:', error);
      setMessage(`❌ Error cargando QR: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleFileUpload = async (event, tipo) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage('');

      console.log(`📸 Iniciando carga de QR ${tipo}:`, file.name);

      // Procesar imagen a Base64
      const imagenQR = await imageService.procesarQR(file, tipo);
      
      console.log(`📸 QR ${tipo} procesado:`, {
        tamaño: imageService.formatearTamaño(imagenQR.size),
        dimensiones: imagenQR.dimensions
      });

      // Actualizar estado local
      if (tipo === 'nequi') {
        setQrNequi(imagenQR.data);
      } else {
        setQrDaviplata(imagenQR.data);
      }

      // Sincronizar con Firebase
      const qrDataCompleto = {
        nequi: tipo === 'nequi' ? imagenQR.data : qrNequi,
        daviplata: tipo === 'daviplata' ? imagenQR.data : qrDaviplata
      };

      console.log('🔄 Sincronizando con Firebase:', qrDataCompleto);
      await firebaseSyncService.sincronizarQR(qrDataCompleto);

      // Sincronizar también con localStorage para las reservas
      if (tipo === 'nequi') {
        localStorage.setItem('qr_nequi', imagenQR.data);
        console.log('💾 QR Nequi guardado en localStorage');
      } else {
        localStorage.setItem('qr_daviplata', imagenQR.data);
        console.log('💾 QR Daviplata guardado en localStorage');
      }

      // Disparar evento personalizado para notificar a otros componentes
      const qrEvent = new CustomEvent('qrActualizado', {
        detail: {
          tipo: tipo,
          data: imagenQR.data,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(qrEvent);
      console.log('📡 Evento qrActualizado disparado:', qrEvent.detail);

      setMessage(`✅ QR ${tipo} procesado y sincronizado exitosamente (${imageService.formatearTamaño(imagenQR.size)})`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error procesando QR:', error);
      setMessage(`❌ Error: ${error.message}`);
      
      // Mantener mensaje de error por más tiempo
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      event.target.value = '';
    }
  };

  const eliminarQR = async (tipo) => {
    try {
      setLoading(true);
      setMessage('');

      console.log(`🗑️ Eliminando QR ${tipo}...`);

      // Actualizar estado local
      if (tipo === 'nequi') {
        setQrNequi('');
      } else {
        setQrDaviplata('');
      }

      // Sincronizar con Firebase (eliminar)
      const qrDataCompleto = {
        nequi: tipo === 'nequi' ? '' : qrNequi,
        daviplata: tipo === 'daviplata' ? '' : qrDaviplata
      };

      console.log('🔄 Sincronizando eliminación con Firebase:', qrDataCompleto);
      await firebaseSyncService.sincronizarQR(qrDataCompleto);

      // Eliminar también de localStorage
      if (tipo === 'nequi') {
        localStorage.removeItem('qr_nequi');
        console.log('💾 QR Nequi eliminado de localStorage');
      } else {
        localStorage.removeItem('qr_daviplata');
        console.log('💾 QR Daviplata eliminado de localStorage');
      }

      // Disparar evento personalizado para notificar a otros componentes
      const qrEvent = new CustomEvent('qrEliminado', {
        detail: {
          tipo: tipo,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(qrEvent);
      console.log('📡 Evento qrEliminado disparado:', qrEvent.detail);

      setMessage(`✅ QR ${tipo} eliminado exitosamente`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error eliminando QR:', error);
      setMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      padding: deviceInfo?.isMobile ? '10px' : 
               deviceInfo?.isTablet ? '20px' : '40px',
      overflowY: 'auto',
      paddingTop: deviceInfo?.isMobile ? '10px' : 
                  deviceInfo?.isTablet ? '20px' : '40px'
    }}>
      <div className="modal-cliente modal-gestion-qr" style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: deviceInfo?.isMobile ? '95vw' : 
                 deviceInfo?.isTablet ? '90vw' : '1000px',
        maxHeight: deviceInfo?.isMobile ? '95vh' : 
                  deviceInfo?.isTablet ? '90vh' : '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        position: 'relative',
        margin: deviceInfo?.isMobile ? '10px auto' : 
                deviceInfo?.isTablet ? '20px auto' : '40px auto'
      }}>

        {/* Header del modal - Estilo elegante con gradiente */}
        <div className="modal-header" style={{
          background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.darkBrown} 50%, ${colors.woodBrown} 100%)`,
          color: colors.white,
          padding: deviceInfo?.isMobile ? '20px' : 
                   deviceInfo?.isTablet ? '22px' : '25px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          top: 'auto',
          zIndex: 10
        }}>
          <h3 style={{
            margin: 0,
            fontSize: deviceInfo?.isMobile ? '20px' : 
                     deviceInfo?.isTablet ? '22px' : '24px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🖼️ Gestión de Códigos QR
          </h3>
          <button
            className="btn-cerrar"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: colors.white,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Separador */}
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${colors.primaryGold}, ${colors.primaryGreen}, ${colors.primaryRed})`,
          margin: 0
        }}></div>

        {/* Body del modal - CON SCROLL FUNCIONAL MEJORADO */}
        <div className="modal-body" style={{
          flex: 1,
          padding: deviceInfo?.isMobile ? '20px' : 
                   deviceInfo?.isTablet ? '25px' : '30px',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: deviceInfo?.isMobile ? '16px' : 
                deviceInfo?.isTablet ? '18px' : '20px',
          margin: 0,
          width: '100%',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
          minHeight: deviceInfo?.isMobile ? 'calc(100vh - 150px)' : 
                     deviceInfo?.isTablet ? 'calc(100vh - 200px)' : 'auto'
        }}>

          {/* Estilos CSS inline para animaciones */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}</style>

          {/* Mensaje de estado */}
          {message && (
            <div style={{
              padding: deviceInfo?.isMobile ? '16px' : '20px',
              marginBottom: '20px',
              borderRadius: '15px',
              backgroundColor: message.includes('✅') ? colors.primaryGreen : colors.primaryRed,
              color: colors.white,
              border: `2px solid ${message.includes('✅') ? colors.primaryGreen : colors.primaryRed}`,
              textAlign: 'center',
              fontSize: deviceInfo?.isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              boxShadow: `0 4px 15px ${message.includes('✅') ? 'rgba(22, 163, 74, 0.3)' : 'rgba(196, 48, 43, 0.3)'}`
            }}>
              {message}
            </div>
          )}

          {/* Grid de QR */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr',
            gap: deviceInfo?.isMobile ? '20px' : '30px',
            marginBottom: '20px'
          }}>
            
            {/* QR Nequi */}
            <div style={{
              backgroundColor: colors.white,
              border: `3px solid ${colors.primaryGreen}`,
              borderRadius: '20px',
              padding: deviceInfo?.isMobile ? '20px' : '25px',
              boxShadow: `0 8px 25px rgba(22, 163, 74, 0.15)`,
              transition: 'all 0.3s ease'
            }}>
              <h4 style={{
                margin: '0 0 20px 0',
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '18px' : '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: `2px solid ${colors.primaryGreen}`,
                paddingBottom: '12px'
              }}>
                💚 Código QR Nequi
              </h4>

              {qrNequi ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: '20px'
                  }}>
                    <img 
                      src={qrNequi} 
                      alt="QR Nequi" 
                      style={{
                        maxWidth: deviceInfo?.isMobile ? '150px' : '200px',
                        maxHeight: deviceInfo?.isMobile ? '150px' : '200px',
                        border: `3px solid ${colors.primaryGreen}`,
                        borderRadius: '15px',
                        boxShadow: `0 8px 25px rgba(22, 163, 74, 0.2)`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = `0 12px 35px rgba(22, 163, 74, 0.3)`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = `0 8px 25px rgba(22, 163, 74, 0.2)`;
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: colors.primaryGreen,
                      color: colors.white,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✅
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarQR('nequi')}
                    disabled={loading}
                    style={{
                      padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                      backgroundColor: colors.primaryRed,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`,
                      opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 6px 20px rgba(196, 48, 43, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 4px 15px rgba(196, 48, 43, 0.3)`;
                      }
                    }}
                  >
                    🗑️ Eliminar QR Nequi
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: deviceInfo?.isMobile ? '150px' : '200px',
                    height: deviceInfo?.isMobile ? '150px' : '200px',
                    border: `3px dashed ${colors.primaryGreen}`,
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    color: colors.woodBrown,
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    backgroundColor: colors.creamBg,
                    transition: 'all 0.3s ease'
                  }}>
                    📱 Sin QR
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'nequi')}
                    disabled={loading}
                    style={{ 
                      display: 'none' 
                    }}
                    id="qr-nequi-input"
                    onInput={(e) => {
                      if (e.target.files.length > 0) {
                        console.log('📁 Archivo seleccionado para Nequi:', e.target.files[0].name);
                      }
                    }}
                  />
                  <label
                    htmlFor="qr-nequi-input"
                    style={{
                      padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                      backgroundColor: colors.primaryGreen,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 15px rgba(22, 163, 74, 0.3)`,
                      opacity: loading ? 0.6 : 1,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 6px 20px rgba(22, 163, 74, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.3)`;
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    📤 Subir QR Nequi
                  </label>
                </div>
              )}
            </div>

            {/* QR Daviplata */}
            <div style={{
              backgroundColor: colors.white,
              border: `3px solid ${colors.primaryGold}`,
              borderRadius: '20px',
              padding: deviceInfo?.isMobile ? '20px' : '25px',
              boxShadow: `0 8px 25px rgba(217, 119, 6, 0.15)`,
              transition: 'all 0.3s ease'
            }}>
              <h4 style={{
                margin: '0 0 20px 0',
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '18px' : '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: `2px solid ${colors.primaryGold}`,
                paddingBottom: '12px'
              }}>
                💙 Código QR Daviplata
              </h4>

              {qrDaviplata ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: '20px'
                  }}>
                    <img 
                      src={qrDaviplata} 
                      alt="QR Daviplata" 
                      style={{
                        maxWidth: deviceInfo?.isMobile ? '150px' : '200px',
                        maxHeight: deviceInfo?.isMobile ? '150px' : '200px',
                        border: `3px solid ${colors.primaryGold}`,
                        borderRadius: '15px',
                        boxShadow: `0 8px 25px rgba(217, 119, 6, 0.2)`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = `0 12px 35px rgba(217, 119, 6, 0.3)`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = `0 8px 25px rgba(217, 119, 6, 0.2)`;
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: colors.primaryGold,
                      color: colors.white,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✅
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarQR('daviplata')}
                    disabled={loading}
                    style={{
                      padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                      backgroundColor: colors.primaryRed,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`,
                      opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 6px 20px rgba(196, 48, 43, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 4px 15px rgba(196, 48, 43, 0.3)`;
                      }
                    }}
                  >
                    🗑️ Eliminar QR Daviplata
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: deviceInfo?.isMobile ? '150px' : '200px',
                    height: deviceInfo?.isMobile ? '150px' : '200px',
                    border: `3px dashed ${colors.primaryGold}`,
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    color: colors.woodBrown,
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    backgroundColor: colors.creamBg,
                    transition: 'all 0.3s ease'
                  }}>
                    📱 Sin QR
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'daviplata')}
                    disabled={loading}
                    style={{ 
                      display: 'none' 
                    }}
                    id="qr-daviplata-input"
                    onInput={(e) => {
                      if (e.target.files.length > 0) {
                        console.log('📁 Archivo seleccionado para Daviplata:', e.target.files[0].name);
                      }
                    }}
                  />
                  <label
                    htmlFor="qr-daviplata-input"
                    style={{
                      padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                      backgroundColor: colors.primaryGold,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 15px rgba(217, 119, 6, 0.3)`,
                      opacity: loading ? 0.6 : 1,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 6px 20px rgba(217, 119, 6, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 4px 15px rgba(217, 119, 6, 0.3)`;
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    📤 Subir QR Daviplata
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de carga */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: deviceInfo?.isMobile ? '20px' : '25px',
              backgroundColor: colors.primaryGreen,
              borderRadius: '15px',
              border: `3px solid ${colors.darkBrown}`,
              color: colors.white,
              fontSize: deviceInfo?.isMobile ? '16px' : '18px',
              fontWeight: 'bold',
              boxShadow: `0 8px 25px rgba(22, 163, 74, 0.3)`,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              <div>Procesando imagen...</div>
              <div style={{ 
                fontSize: deviceInfo?.isMobile ? '14px' : '16px', 
                marginTop: '8px',
                opacity: 0.9 
              }}>
                Por favor espera mientras se procesa y sincroniza tu código QR
              </div>
            </div>
          )}

          {/* Información del sistema */}
          <div style={{
            backgroundColor: colors.creamBg,
            border: `3px solid ${colors.woodBrown}`,
            borderRadius: '20px',
            padding: deviceInfo?.isMobile ? '20px' : '25px',
            boxShadow: `0 8px 25px rgba(139, 69, 19, 0.15)`
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              color: colors.darkBrown,
              fontSize: deviceInfo?.isMobile ? '18px' : '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              borderBottom: `2px solid ${colors.woodBrown}`,
              paddingBottom: '12px'
            }}>
              💡 Información del Sistema
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              fontSize: deviceInfo?.isMobile ? '14px' : '16px',
              color: colors.woodBrown
            }}>
              <div style={{
                backgroundColor: colors.white,
                padding: '16px',
                borderRadius: '15px',
                border: `2px solid ${colors.primaryGreen}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                <strong style={{ color: colors.darkBrown }}>Sincronización Automática</strong>
                <p style={{ margin: '8px 0 0 0' }}>Los QR se sincronizan automáticamente con la app de comprador</p>
              </div>
              <div style={{
                backgroundColor: colors.white,
                padding: '16px',
                borderRadius: '15px',
                border: `2px solid ${colors.primaryGold}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                <strong style={{ color: colors.darkBrown }}>Formatos Aceptados</strong>
                <p style={{ margin: '8px 0 0 0' }}>JPG, PNG, WEBP (máximo 5MB)</p>
              </div>
              <div style={{
                backgroundColor: colors.white,
                padding: '16px',
                borderRadius: '15px',
                border: `2px solid ${colors.primaryRed}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                <strong style={{ color: colors.darkBrown }}>Optimización Automática</strong>
                <p style={{ margin: '8px 0 0 0' }}>Las imágenes se comprimen automáticamente para optimizar el almacenamiento</p>
              </div>
            </div>
          </div>

          {/* Botones de acción del modal */}
          <div className="modal-actions" style={{
            padding: '20px',
            backgroundColor: colors.creamBg,
            border: `2px solid ${colors.woodBrown}`,
            borderRadius: '15px',
            textAlign: 'center',
            marginTop: '20px',
            position: 'relative',
            bottom: 'auto',
            zIndex: 10
          }}>
            {/* Botón de prueba para verificar funcionalidad */}
            <button
              className="btn"
              onClick={() => {
                console.log('🧪 Prueba de estado QR:', {
                  nequi: qrNequi ? 'Cargado' : 'No cargado',
                  daviplata: qrDaviplata ? 'Cargado' : 'No cargado',
                  localStorage: {
                    nequi: localStorage.getItem('qr_nequi') ? 'Disponible' : 'No disponible',
                    daviplata: localStorage.getItem('qr_daviplata') ? 'Disponible' : 'No disponible'
                  }
                });
                setMessage('🧪 Estado QR mostrado en consola. Revisa la consola del navegador.');
                setTimeout(() => setMessage(''), 3000);
              }}
              style={{
                backgroundColor: colors.primaryGreen,
                color: colors.white,
                padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px rgba(22, 163, 74, 0.3)`,
                marginRight: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 6px 20px rgba(22, 163, 74, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.3)`;
              }}
            >
              🧪 Probar Estado QR
            </button>
            
            {/* Botón de limpieza completa */}
            <button
              className="btn"
              onClick={async () => {
                try {
                  setLoading(true);
                  setMessage('🧹 Limpiando todos los códigos QR...');
                  
                  // Limpiar estado local
                  setQrNequi('');
                  setQrDaviplata('');
                  
                  // Limpiar localStorage
                  localStorage.removeItem('qr_nequi');
                  localStorage.removeItem('qr_daviplata');
                  
                  // Limpiar Firebase
                  await firebaseSyncService.sincronizarQR({
                    nequi: '',
                    daviplata: ''
                  });
                  
                  // Disparar eventos
                  window.dispatchEvent(new CustomEvent('qrEliminado', { detail: { tipo: 'nequi' } }));
                  window.dispatchEvent(new CustomEvent('qrEliminado', { detail: { tipo: 'daviplata' } }));
                  
                  setMessage('✅ Todos los códigos QR han sido limpiados correctamente');
                  setTimeout(() => setMessage(''), 3000);
                  
                } catch (error) {
                  console.error('❌ Error limpiando QR:', error);
                  setMessage(`❌ Error limpiando QR: ${error.message}`);
                  setTimeout(() => setMessage(''), 5000);
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                backgroundColor: colors.primaryRed,
                color: colors.white,
                padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`,
                marginRight: '10px',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px rgba(196, 48, 43, 0.4)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 15px rgba(196, 48, 43, 0.3)`;
                }
              }}
            >
              🧹 Limpiar Todo QR
            </button>
            
            <button
              className="btn"
              onClick={onClose}
              style={{
                backgroundColor: colors.woodBrown,
                color: colors.white,
                padding: deviceInfo?.isMobile ? '12px 24px' : 
                         deviceInfo?.isTablet ? '13px 26px' : '14px 28px',
                fontSize: deviceInfo?.isMobile ? '14px' : 
                         deviceInfo?.isTablet ? '15px' : '16px',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px rgba(139, 69, 19, 0.3)`
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 6px 20px rgba(139, 69, 19, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 15px rgba(139, 69, 19, 0.3)`;
              }}
            >
              🔒 Cerrar Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionQRModal;
