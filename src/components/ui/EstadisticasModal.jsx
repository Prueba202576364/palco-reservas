import { useState } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const EstadisticasModal = ({
  isOpen,
  onClose,
  user,
  estadisticasActuales,
  calcularEstadisticas,
  filtrosEstadisticas,
  setFiltrosEstadisticas,
  limpiarFiltrosEstadisticas,
  limpiarRegistrosDuplicados,
  canViewAllStatistics,
  canBackupRestore,
  limpiarDatosPrueba,
  migrarPalcos,
  firebaseSyncService,
  mostrarMensaje,
  METODOS_PAGO,
  qrData,
  handleCargarQR,
  limpiarQR,
  getVendedoresUnicos,
  getEstadisticasPorVendedor,
  getIngresosFiltradosPorRol,
  palcos,
  ingresos,
  historico,
  DIAS,
  crearPalcosIniciales,
  // 🏦 FUNCIONES DE ADMINISTRACIÓN CONTABLE
  sincronizarIngresosEntreApps,
  validarIntegridadContable
}) => {
  const deviceInfo = useDeviceDetection();
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

  const stats = estadisticasActuales || calcularEstadisticas();

  return (
    <div className="modal-overlay-unified">
      <div className="modal-container-unified">
        
        {/* Header del modal - Estilo elegante con gradiente */}
        <div className="modal-header-unified">
          <h3>
            📊 Estadísticas y Reportes
          </h3>
          <button
            className="modal-close-button-unified"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body del modal - CON SCROLL FUNCIONAL */}
        <div className="modal-body-unified">
          
          {/* Aviso de Vendedor */}
          {user?.role === 'EMPLEADO' && (
            <div style={{ 
              backgroundColor: colors.creamBg, 
              border: `2px solid ${colors.primaryGold}`, 
              borderRadius: '12px', 
              padding: '16px', 
              marginBottom: '16px',
              textAlign: 'center',
              boxShadow: `0 4px 15px rgba(217, 119, 6, 0.2)`
            }}>
              <strong style={{ color: colors.darkBrown }}>👤 Vista de Vendedor:</strong> 
              <span style={{ color: colors.woodBrown }}> Solo se muestran tus propias ventas y estadísticas</span>
            </div>
          )}
          
          {/* Resumen General */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              backgroundColor: colors.creamBg, 
              padding: '20px', 
              borderRadius: '15px', 
              border: `3px solid ${colors.primaryGreen}`,
              boxShadow: `0 4px 15px rgba(22, 163, 74, 0.2)`
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.primaryGreen, fontSize: '1.1rem' }}>💰 Ingresos Totales</h4>
              <p style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', color: colors.darkBrown }}>
                ${stats.ingresoTotal.toLocaleString()}
              </p>
              <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                Ventas: ${stats.ventasTotal.toLocaleString()} | 
                Devoluciones: ${stats.cancelacionesTotal.toLocaleString()}
              </small>
            </div>
            
            <div style={{ 
              backgroundColor: colors.creamBg, 
              padding: '20px', 
              borderRadius: '15px', 
              border: `3px solid ${colors.primaryGold}`,
              boxShadow: `0 4px 15px rgba(217, 119, 6, 0.2)`
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.primaryGold, fontSize: '1.1rem' }}>🏛️ Ocupación de Palcos</h4>
              <p style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', color: colors.darkBrown }}>
                {stats.porcentajeOcupacion}%
              </p>
              <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                {stats.palcosOcupados} de {stats.totalPalcos} palcos ocupados<br/>
                <span style={{ fontSize: '0.8rem' }}>
                  ({stats.palcosDisponibles} disponibles)
                </span>
              </small>
            </div>
            
            <div style={{ 
              backgroundColor: colors.creamBg, 
              padding: '20px', 
              borderRadius: '15px', 
              border: `3px solid ${colors.primaryRed}`,
              boxShadow: `0 4px 15px rgba(196, 48, 43, 0.2)`
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.primaryRed, fontSize: '1.1rem' }}>📈 Operaciones</h4>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0', color: colors.darkBrown }}>
                {stats.numeroVentas} Ventas | {stats.numeroCancelaciones} Cancelaciones
              </p>
              <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                Total de transacciones realizadas
              </small>
            </div>
            
            <div style={{ 
              backgroundColor: colors.creamBg, 
              padding: '20px', 
              borderRadius: '15px', 
              border: `3px solid ${colors.woodBrown}`,
              boxShadow: `0 4px 15px rgba(139, 69, 19, 0.2)`
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.woodBrown, fontSize: '1.1rem' }}>🪑 Total Sillas</h4>
              <p style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', color: colors.darkBrown }}>
                {stats.totalSillasSistema}
              </p>
              <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                Capacidad total del sistema
              </small>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ 
            backgroundColor: colors.creamBg, 
            border: `2px solid ${colors.woodBrown}`, 
            borderRadius: '15px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: `0 4px 15px rgba(139, 69, 19, 0.1)`
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.darkBrown, fontSize: '1.2rem' }}>🔍 Filtros</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr 1fr 1fr', 
              gap: '16px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  color: colors.darkBrown
                }}>
                  Día:
                </label>
                <select
                  value={filtrosEstadisticas.dia}
                  onChange={e => setFiltrosEstadisticas({ ...filtrosEstadisticas, dia: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: `2px solid ${colors.woodBrown}`,
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="todos">Todos los días</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  color: colors.darkBrown
                }}>
                  Vendedor:
                </label>
                <select
                  value={filtrosEstadisticas.vendedor}
                  onChange={e => setFiltrosEstadisticas({ ...filtrosEstadisticas, vendedor: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: `2px solid ${colors.woodBrown}`,
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="todos">Todos los vendedores</option>
                  {getVendedoresUnicos().map(vendedor => (
                    <option key={vendedor} value={vendedor}>{vendedor}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  color: colors.darkBrown
                }}>
                  Tipo:
                </label>
                <select
                  value={filtrosEstadisticas.tipoIngreso}
                  onChange={e => setFiltrosEstadisticas({ ...filtrosEstadisticas, tipoIngreso: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: `2px solid ${colors.woodBrown}`,
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="todos">Ventas y cancelaciones</option>
                  <option value="venta">Solo ventas</option>
                  <option value="cancelacion">Solo cancelaciones</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  className="btn"
                  onClick={limpiarFiltrosEstadisticas}
                  style={{ 
                    width: '100%', 
                    backgroundColor: colors.woodBrown, 
                    color: colors.white, 
                    fontSize: '0.9rem',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.woodBrown}
                >
                  🔄 Limpiar Filtros
                </button>
                
                <button
                  className="btn"
                  onClick={limpiarRegistrosDuplicados}
                  style={{ 
                    width: '100%', 
                    backgroundColor: colors.primaryGold, 
                    color: colors.white, 
                    fontSize: '0.9rem',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryGold}
                >
                  🧹 Limpiar Duplicados
                </button>
              </div>
            </div>
          </div>

          {/* Herramienta de Limpieza Simplificada */}
          <div style={{ 
            backgroundColor: colors.creamBg, 
            border: `2px solid ${colors.primaryGold}`, 
            borderRadius: '15px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: `0 4px 15px rgba(217, 119, 6, 0.2)`
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.darkBrown, fontSize: '1.2rem', textAlign: 'center' }}>🔄 Limpiar Reservas</h4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn"
                onClick={async () => {
                  if (confirm('⚠️ ¿Estás seguro de que quieres limpiar los datos de reservas?\n\nEsto eliminará:\n- Todas las reservas (local y Firebase)\n- Todos los ingresos y estadísticas\n- Todo el historial de transacciones\n- Todos los pagos pendientes\n- Datos de ambas apps (vendedor y cliente)\n\n✅ SE MANTIENEN:\n- Usuarios y autenticación\n- Configuraciones del sistema\n- Códigos QR\n- Datos de la feria\n\nEs como reiniciar solo las reservas.')) {
                    try {
                      setLoading(true);
                      
                      // Limpiar localStorage
                      localStorage.removeItem('feriaPalcos');
                      localStorage.removeItem('feriaIngresos');
                      localStorage.removeItem('feriaHistorico');
                      localStorage.removeItem('feriaPagosPendientes');
                      localStorage.removeItem('feriaConfiguracion');
                      localStorage.removeItem('feriaIngresos_syncQueue');
                      
                      // Limpiar sessionStorage
                      sessionStorage.clear();
                      
                      // 🔥 LIMPIAR SOLO DATOS DE RESERVAS EN FIREBASE
                      console.log('🔥 Iniciando limpieza selectiva de Firebase...');
                      
                      const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
                      const { db } = await import('../../firebaseConfig');
                      
                      // Eliminar solo las reservas (mantener usuarios y configuraciones)
                      const reservasSnapshot = await getDocs(collection(db, 'reservas'));
                      const deleteReservasPromises = reservasSnapshot.docs.map(doc => deleteDoc(doc.ref));
                      await Promise.all(deleteReservasPromises);
                      console.log('✅ Reservas de Firebase eliminadas');
                      
                      // Eliminar solo los pagos pendientes
                      const pagosSnapshot = await getDocs(collection(db, 'pagosPendientes'));
                      const deletePagosPromises = pagosSnapshot.docs.map(doc => deleteDoc(doc.ref));
                      await Promise.all(deletePagosPromises);
                      console.log('✅ Pagos pendientes de Firebase eliminados');
                      
                      // Eliminar solo los ingresos/estadísticas
                      const ingresosSnapshot = await getDocs(collection(db, 'ingresos'));
                      const deleteIngresosPromises = ingresosSnapshot.docs.map(doc => deleteDoc(doc.ref));
                      await Promise.all(deleteIngresosPromises);
                      console.log('✅ Ingresos de Firebase eliminados');
                      
                      // ✅ NO TOCAR: usuarios, configuraciones, QR, datos de la feria
                      console.log('✅ Datos importantes preservados: usuarios, configuraciones, QR');
                      
                      // 🔄 SINCRONIZAR PALCOS INICIALES A FIREBASE
                      console.log('🔄 Sincronizando palcos iniciales a Firebase...');
                      const palcosIniciales = crearPalcosIniciales();
                      await firebaseSyncService.sincronizarPalcos(palcosIniciales);
                      console.log('✅ Palcos iniciales sincronizados a Firebase');
                      
                      // Mostrar mensaje
                      alert('✅ Datos de reservas eliminados correctamente.\n\n✅ Se mantuvieron:\n- Usuarios y autenticación\n- Configuraciones del sistema\n- Códigos QR\n\n✅ Se sincronizaron palcos iniciales a Firebase\n\nLa página se recargará automáticamente...');
                      
                      // Recargar la página
                      window.location.reload();
                      
                    } catch (error) {
                      console.error('❌ Error limpiando datos:', error);
                      alert('❌ Error al limpiar algunos datos de Firebase, pero los datos locales se limpiaron correctamente.');
                      window.location.reload();
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  backgroundColor: loading ? colors.woodBrown : colors.primaryRed, 
                  color: colors.white, 
                  fontSize: '1rem',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = colors.darkBrown)}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = colors.primaryRed)}
              >
                {loading ? '🔄 Limpiando...' : '🗑️ Limpiar Reservas'}
              </button>
            </div>
            <small style={{ color: colors.woodBrown, display: 'block', marginTop: '12px', fontSize: '0.8rem', textAlign: 'center' }}>
              💡 Elimina solo las reservas y estadísticas. Mantiene usuarios y configuraciones importantes.
            </small>
            
            {/* Botón de prueba para sincronizar palcos */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const palcosIniciales = crearPalcosIniciales();
                    await firebaseSyncService.sincronizarPalcos(palcosIniciales);
                    alert('✅ Palcos sincronizados a Firebase correctamente');
                  } catch (error) {
                    console.error('Error sincronizando palcos:', error);
                    alert('❌ Error sincronizando palcos');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  backgroundColor: colors.primaryGreen,
                  color: colors.white,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                🔄 Sincronizar Palcos
              </button>
            </div>
          </div>

          {/* Configuración de QR - SOLO PARA ADMINISTRADORES */}
          {(canViewAllStatistics() || canBackupRestore()) && (
            <div style={{ 
              backgroundColor: colors.creamBg, 
              border: `2px solid ${colors.primaryGreen}`, 
              borderRadius: '15px', 
              padding: '20px', 
              marginBottom: '20px',
              boxShadow: `0 4px 15px rgba(22, 163, 74, 0.2)`
            }}>
            <h4 style={{ 
              margin: '0 0 16px 0', 
              color: colors.darkBrown, 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              📱 Configuración de Códigos QR
              <span style={{
                fontSize: '0.9rem',
                color: colors.primaryGreen,
                padding: '4px 8px',
                backgroundColor: colors.white,
                borderRadius: '12px',
                border: `1px solid ${colors.primaryGreen}`,
                fontWeight: '600'
              }}>
                👑 Solo Administradores
              </span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              {/* Nequi QR */}
              <div style={{ 
                backgroundColor: colors.white, 
                padding: '16px', 
                borderRadius: '12px',
                border: `2px solid ${colors.primaryRed}`,
                boxShadow: `0 4px 15px rgba(196, 48, 43, 0.1)`
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: colors.primaryRed, fontSize: '1rem' }}>💜 Nequi</h5>
                <div style={{ marginBottom: '12px', color: colors.darkBrown }}>
                  <strong>Número:</strong> {METODOS_PAGO.nequi.numero}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCargarQR('nequi', e)}
                  style={{ display: 'none' }}
                  id="qr-upload-nequi-config"
                />
                <label
                  htmlFor="qr-upload-nequi-config"
                  style={{
                    backgroundColor: colors.primaryRed,
                    color: colors.white,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'inline-block',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryRed}
                >
                  {qrData.nequi ? '🔄 Cambiar QR' : '📁 Cargar QR'}
                </label>
                {qrData.nequi && (
                  <div style={{ marginTop: '12px' }}>
                    <img 
                      src={qrData.nequi} 
                      alt="QR Nequi"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        border: `2px solid ${colors.primaryRed}`,
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Daviplata QR */}
              <div style={{ 
                backgroundColor: colors.white, 
                padding: '16px', 
                borderRadius: '12px',
                border: `2px solid ${colors.primaryGold}`,
                boxShadow: `0 4px 15px rgba(217, 119, 6, 0.1)`
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: colors.primaryGold, fontSize: '1rem' }}>📱 Daviplata</h5>
                <div style={{ marginBottom: '12px', color: colors.darkBrown }}>
                  <strong>Número:</strong> {METODOS_PAGO.daviplata.numero}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCargarQR('daviplata', e)}
                  style={{ display: 'none' }}
                  id="qr-upload-daviplata-config"
                />
                <label
                  htmlFor="qr-upload-daviplata-config"
                  style={{
                    backgroundColor: colors.primaryGold,
                    color: colors.white,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'inline-block',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryGold}
                >
                  {qrData.daviplata ? '🔄 Cambiar QR' : '📁 Cargar QR'}
                </label>
                {qrData.daviplata && (
                  <div style={{ marginTop: '12px' }}>
                    <img 
                      src={qrData.daviplata} 
                      alt="QR Daviplata"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        border: `2px solid ${colors.primaryGold}`,
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                className="btn"
                onClick={limpiarQR}
                style={{ 
                  backgroundColor: colors.primaryGold, 
                  color: colors.white, 
                  fontSize: '0.8rem',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryGold}
              >
                🗑️ Limpiar Solo QR
              </button>
            </div>
            <small style={{ color: colors.woodBrown, display: 'block', marginTop: '12px', fontSize: '0.8rem', textAlign: 'center' }}>
              💡 Carga tus códigos QR reales de Nequi y Daviplata. Se guardarán automáticamente.
            </small>
          </div>
            )}

          {/* Detalles de Palcos */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: colors.darkBrown, fontSize: '1.3rem', marginBottom: '16px' }}>🏛️ Detalles de Palcos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ 
                backgroundColor: colors.creamBg, 
                padding: '20px', 
                borderRadius: '15px',
                border: `3px solid ${colors.primaryGold}`,
                boxShadow: `0 4px 15px rgba(217, 119, 6, 0.2)`
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: colors.primaryGold, fontSize: '1.1rem' }}>📦 Palcos Completos</h5>
                <p style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', color: colors.darkBrown }}>
                  {stats.palcosCompletosOcupados}/{stats.palcosCompletos}
                </p>
                <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                  {Math.round((stats.palcosCompletosOcupados / stats.palcosCompletos) * 100)}% ocupados
                </small>
              </div>
              
              <div style={{ 
                backgroundColor: colors.creamBg, 
                padding: '20px', 
                borderRadius: '15px',
                border: `3px solid ${colors.primaryGreen}`,
                boxShadow: `0 4px 15px rgba(22, 163, 74, 0.2)`
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: colors.primaryGreen, fontSize: '1.1rem' }}>🪑 Palcos por Sillas</h5>
                <p style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', color: colors.darkBrown }}>
                  {stats.palcosSillasOcupados}/{stats.palcosSillas}
                </p>
                <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                  {Math.round((stats.palcosSillasOcupados / stats.palcosSillas) * 100)}% ocupados
                </small>
              </div>
            </div>
          </div>

          {/* Ocupación por día */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: colors.darkBrown, fontSize: '1.3rem', marginBottom: '16px' }}>📅 Ocupación por Día</h4>
            <div style={{ display: 'grid', gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {DIAS.map(dia => {
                const ocupacion = stats.ocupacionPorDia[dia];
                return (
                  <div key={dia} style={{ 
                    backgroundColor: colors.creamBg, 
                    padding: '20px', 
                    borderRadius: '15px',
                    border: `2px solid ${colors.woodBrown}`,
                    boxShadow: `0 4px 15px rgba(139, 69, 19, 0.1)`
                  }}>
                    <h5 style={{ margin: '0 0 12px 0', textTransform: 'capitalize', color: colors.darkBrown, fontSize: '1.1rem' }}>{dia}</h5>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        backgroundColor: colors.white, 
                        height: '10px', 
                        borderRadius: '5px',
                        overflow: 'hidden',
                        border: `1px solid ${colors.woodBrown}`
                      }}>
                        <div style={{ 
                          backgroundColor: colors.primaryGreen, 
                          height: '100%', 
                          width: `${ocupacion.porcentaje}%`,
                          transition: 'width 0.3s ease',
                          borderRadius: '5px'
                        }}></div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', color: colors.darkBrown }}>
                      <strong style={{ fontSize: '1.2rem' }}>{ocupacion.porcentaje}%</strong><br/>
                      {ocupacion.ocupadas}/{ocupacion.total} sillas<br/>
                      <small style={{ color: colors.woodBrown, fontSize: '0.9rem' }}>
                        {ocupacion.disponibles} disponibles
                      </small>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas por vendedor */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: colors.darkBrown, fontSize: '1.3rem', marginBottom: '16px' }}>👤 Rendimiento por Vendedor</h4>
            <div style={{ overflowX: 'auto', borderRadius: '15px', border: `2px solid ${colors.woodBrown}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: colors.white }}>
                <thead>
                  <tr style={{ backgroundColor: colors.creamBg }}>
                    <th style={{ padding: '16px', textAlign: 'left', border: `1px solid ${colors.woodBrown}`, color: colors.darkBrown, fontWeight: '600' }}>Vendedor</th>
                    <th style={{ padding: '16px', textAlign: 'right', border: `1px solid ${colors.woodBrown}`, color: colors.darkBrown, fontWeight: '600' }}>Ventas</th>
                    <th style={{ padding: '16px', textAlign: 'right', border: `1px solid ${colors.woodBrown}`, color: colors.darkBrown, fontWeight: '600' }}>Cancelaciones</th>
                    <th style={{ padding: '16px', textAlign: 'right', border: `1px solid ${colors.woodBrown}`, color: colors.darkBrown, fontWeight: '600' }}>Ingreso Neto</th>
                    <th style={{ padding: '16px', textAlign: 'center', border: `1px solid ${colors.woodBrown}`, color: colors.darkBrown, fontWeight: '600' }}>Operaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(getEstadisticasPorVendedor()).map(([vendedor, stats]) => (
                    <tr key={vendedor} style={{ borderBottom: `1px solid ${colors.creamBg}` }}>
                      <td style={{ padding: '16px', border: `1px solid ${colors.woodBrown}`, fontWeight: '500', color: colors.darkBrown }}>
                        {vendedor}
                      </td>
                      <td style={{ padding: '16px', border: `1px solid ${colors.woodBrown}`, textAlign: 'right', color: colors.primaryGreen, fontWeight: '600' }}>
                        ${stats.ventas.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', border: `1px solid ${colors.woodBrown}`, textAlign: 'right', color: colors.primaryRed, fontWeight: '600' }}>
                        ${stats.cancelaciones.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', border: `1px solid ${colors.woodBrown}`, textAlign: 'right', fontWeight: '700', color: colors.darkBrown }}>
                        ${stats.ingresoNeto.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', border: `1px solid ${colors.woodBrown}`, textAlign: 'center', color: colors.woodBrown, fontWeight: '500' }}>
                        {stats.numeroOperaciones}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de ingresos filtrado */}
          <div>
            <h4 style={{ color: colors.darkBrown, fontSize: '1.3rem', marginBottom: '16px' }}>💳 Historial de Ingresos ({getIngresosFiltradosPorRol(user).length} registros)</h4>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              border: `2px solid ${colors.woodBrown}`, 
              borderRadius: '15px',
              backgroundColor: colors.white
            }}>
              {getIngresosFiltradosPorRol(user).length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: colors.woodBrown }}>
                  No hay registros con los filtros seleccionados
                </p>
              ) : (
                getIngresosFiltradosPorRol(user).map(ingreso => (
                  <div key={ingreso.id} style={{ 
                    padding: '16px', 
                    borderBottom: `1px solid ${colors.creamBg}`,
                    backgroundColor: ingreso.tipo === 'venta' ? colors.creamBg : colors.white
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: ingreso.tipo === 'venta' ? colors.primaryGreen : colors.primaryRed
                        }}>
                          {ingreso.tipo === 'venta' ? '💰 Venta' : '↩️ Cancelación'}
                        </span>
                        <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: colors.woodBrown }}>
                          {ingreso.fecha}
                        </span>
                      </div>
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: ingreso.tipo === 'venta' ? colors.primaryGreen : colors.primaryRed
                      }}>
                        ${Math.abs(ingreso.monto).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: colors.woodBrown, marginTop: '8px' }}>
                      <strong>{ingreso.detalles.nombre}</strong> - 
                      Palco {ingreso.detalles.palco} - 
                      {ingreso.detalles.cantidad} - 
                      Vendedor: {ingreso.detalles.vendedor}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="modal-actions" style={{ 
            display: 'flex', 
            gap: '16px', 
            marginTop: '24px',
            flexWrap: deviceInfo?.isMobile ? 'wrap' : 'nowrap'
          }}>
            <button 
              className="btn" 
              style={{ 
                backgroundColor: colors.primaryGreen, 
                color: colors.white, 
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1
              }}
              onClick={() => {
                console.log('🔍 Estado actual de datos:', {
                  palcos: palcos.length,
                  ingresos: ingresos.length,
                  historico: historico.length,
                  localStorage: {
                    palcos: localStorage.getItem('feriaPalcos') ? 'SÍ' : 'NO',
                    ingresos: localStorage.getItem('feriaIngresos') ? 'SÍ' : 'NO',
                    historico: localStorage.getItem('feriaHistorico') ? 'SÍ' : 'NO'
                  }
                });
                alert(`Estado: ${palcos.length} palcos, ${ingresos.length} ingresos, ${historico.length} histórico`);
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryGreen}
            >
              🔍 Verificar Datos
            </button>
            <button 
              className="btn" 
              onClick={onClose}
              style={{ 
                backgroundColor: colors.woodBrown, 
                color: colors.white, 
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.darkBrown}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.woodBrown}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasModal;
