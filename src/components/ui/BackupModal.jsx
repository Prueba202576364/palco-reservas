import React, { useState, useEffect } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import firebaseSyncService from '../../services/firebaseSync';

const BackupModal = ({
  isOpen,
  onClose,
  palcos,
  ingresos,
  historico,
  pagosPendientes,
  creadoPorNombre,
  onRestaurar
}) => {
  const deviceInfo = useDeviceDetection();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const colors = {
    primaryRed: '#C4302B',
    primaryGold: '#D97706',
    primaryGreen: '#16A34A',
    darkBrown: '#451A03',
    creamBg: '#F5F1EB',
    white: '#FFFFFF',
    woodBrown: '#8B4513'
  };

  const cargarBackups = async () => {
    setLoading(true);
    try {
      const lista = await firebaseSyncService.obtenerBackups(5);
      setBackups(lista);
    } catch (error) {
      console.error('❌ Error cargando backups:', error);
      setMessage('❌ Error cargando la lista de backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage('');
      cargarBackups();
    }
  }, [isOpen]);

  const crearBackupAhora = async () => {
    setLoading(true);
    setMessage('');
    try {
      await firebaseSyncService.crearBackup({
        palcos,
        ingresos,
        historico,
        pagosPendientes,
        creadoPor: creadoPorNombre
      });
      setMessage('✅ Backup creado correctamente');
      await cargarBackups();
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      setMessage('❌ Error creando el backup');
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
      <div className="modal-cliente modal-backup" style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: deviceInfo?.isMobile ? '95vw' :
                 deviceInfo?.isTablet ? '90vw' : '700px',
        maxHeight: deviceInfo?.isMobile ? '95vh' :
                  deviceInfo?.isTablet ? '90vh' : '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        margin: deviceInfo?.isMobile ? '10px auto' :
                deviceInfo?.isTablet ? '20px auto' : '40px auto'
      }}>

        {/* Header */}
        <div className="modal-header" style={{
          background: `linear-gradient(135deg, ${colors.primaryRed} 0%, ${colors.darkBrown} 50%, ${colors.woodBrown} 100%)`,
          color: colors.white,
          padding: deviceInfo?.isMobile ? '20px' :
                   deviceInfo?.isTablet ? '22px' : '25px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h3 style={{
            margin: 0,
            fontSize: deviceInfo?.isMobile ? '20px' :
                     deviceInfo?.isTablet ? '22px' : '24px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🆘 Backups del Sistema
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: colors.white,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${colors.primaryGold}, ${colors.primaryGreen}, ${colors.primaryRed})`,
          flexShrink: 0
        }}></div>

        {/* Body */}
        <div className="modal-body" style={{
          padding: deviceInfo?.isMobile ? '16px' :
                   deviceInfo?.isTablet ? '20px' : '25px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {message && (
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: message.includes('✅') ? colors.primaryGreen : colors.primaryRed,
              color: colors.white,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          <button
            onClick={crearBackupAhora}
            disabled={loading}
            style={{
              backgroundColor: colors.primaryGreen,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            💾 Crear Backup Ahora (con los datos actuales)
          </button>

          <div style={{
            backgroundColor: colors.creamBg,
            border: `2px dashed ${colors.primaryGold}`,
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '12px',
            color: colors.woodBrown
          }}>
            ℹ️ También se crea un backup automático cada 5 minutos. Al restaurar: los <strong>palcos y pagos pendientes se reemplazan</strong> por los del backup elegido. Los <strong>ingresos e histórico nunca se borran</strong> — solo se completa lo que falte, para no perder ventas registradas después del backup.
          </div>

          <h4 style={{ margin: '4px 0 0 0', color: colors.darkBrown }}>Últimos backups</h4>

          {loading && backups.length === 0 && (
            <p style={{ textAlign: 'center', color: colors.woodBrown }}>Cargando...</p>
          )}

          {!loading && backups.length === 0 && (
            <p style={{ textAlign: 'center', color: colors.woodBrown }}>Todavía no hay ningún backup guardado.</p>
          )}

          {backups.map(backup => (
            <div key={backup.id} style={{
              display: 'flex',
              flexDirection: deviceInfo?.isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: deviceInfo?.isMobile ? 'flex-start' : 'center',
              gap: '10px',
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${colors.woodBrown}`,
              backgroundColor: colors.white
            }}>
              <div>
                <strong style={{ color: colors.darkBrown }}>{backup.fechaLocal || 'Sin fecha'}</strong>
                <div style={{ fontSize: '12px', color: colors.woodBrown, marginTop: '4px' }}>
                  Creado por: {backup.creadoPor || 'Desconocido'}
                </div>
                <div style={{ fontSize: '12px', color: colors.woodBrown, marginTop: '4px' }}>
                  {backup.resumen?.palcosOcupados ?? '?'}/{backup.resumen?.totalPalcos ?? '?'} palcos ocupados ·{' '}
                  {backup.resumen?.totalIngresos ?? '?'} ingresos · {backup.resumen?.totalHistorico ?? '?'} operaciones
                </div>
              </div>
              <button
                onClick={() => onRestaurar(backup)}
                disabled={loading}
                style={{
                  backgroundColor: colors.primaryRed,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ♻️ Restaurar este
              </button>
            </div>
          ))}
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: colors.creamBg,
          borderTop: `2px solid ${colors.woodBrown}`,
          textAlign: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: colors.woodBrown,
              color: colors.white,
              padding: '12px 28px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔒 Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
