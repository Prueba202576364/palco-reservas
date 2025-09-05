import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const HistoricoCompletoModal = ({
  isOpen,
  onClose,
  historico,
  filtrosHistorico,
  setFiltrosHistorico,
  getHistoricoFiltrado,
  limpiarFiltrosHistorico,
  user
}) => {
  const deviceInfo = useDeviceDetection();

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

  // Función para obtener el color de la acción
  const getAccionColor = (accion) => {
    switch (accion) {
      case 'Reserva': return colors.primaryGreen;
      case 'Cancelación': return colors.primaryRed;
      case 'Movimiento': return colors.primaryGold;
      case 'Edición': return colors.woodBrown;
      default: return colors.darkBrown;
    }
  };

  // Función para obtener el icono de la acción
  const getAccionIcon = (accion) => {
    switch (accion) {
      case 'Reserva': return '✅';
      case 'Cancelación': return '❌';
      case 'Movimiento': return '🔄';
      case 'Edición': return '✏️';
      default: return '📋';
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  };

  // Función para obtener el texto de detalles
  const getDetallesTexto = (detalles) => {
    if (typeof detalles === 'string') return detalles;
    if (typeof detalles === 'object') {
      try {
        return JSON.stringify(detalles, null, 2);
      } catch (error) {
        return 'Detalles no disponibles';
      }
    }
    return 'Sin detalles';
  };

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
      <div className="modal-cliente modal-historico-completo" style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: deviceInfo?.isMobile ? '95vw' : 
                 deviceInfo?.isTablet ? '90vw' : '1200px',
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
            📋 Histórico Completo de Movimientos
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

          {/* Aviso para empleados */}
          {user?.role === 'EMPLEADO' && (
            <div style={{
              backgroundColor: colors.creamBg,
              border: `3px solid ${colors.primaryGold}`,
              borderRadius: '20px',
              padding: deviceInfo?.isMobile ? '20px' : 
                       deviceInfo?.isTablet ? '25px' : '30px',
              textAlign: 'center',
              boxShadow: `0 8px 25px rgba(217, 119, 6, 0.2)`
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '18px' : 
                         deviceInfo?.isTablet ? '20px' : '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                👤 Vista de Vendedor
              </h4>
              <p style={{
                margin: '0 0 12px 0',
                color: colors.woodBrown,
                fontSize: deviceInfo?.isMobile ? '16px' : '18px'
              }}>
                Solo se muestran tus propias actividades
              </p>
              {filtrosHistorico.vendedor && (
                <div style={{
                  backgroundColor: colors.white,
                  padding: '12px',
                  borderRadius: '15px',
                  border: `2px solid ${colors.primaryGreen}`,
                  display: 'inline-block'
                }}>
                  <span style={{ color: colors.primaryGreen, fontWeight: 'bold' }}>
                    🔍 Filtro automático: {filtrosHistorico.vendedor}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Filtros de búsqueda */}
          <div style={{
            backgroundColor: colors.white,
            border: `3px solid ${colors.primaryGreen}`,
            borderRadius: '20px',
            padding: deviceInfo?.isMobile ? '20px' : 
                     deviceInfo?.isTablet ? '25px' : '30px',
            boxShadow: `0 8px 25px rgba(22, 163, 74, 0.15)`
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: colors.darkBrown,
              fontSize: deviceInfo?.isMobile ? '18px' : 
                       deviceInfo?.isTablet ? '20px' : '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              borderBottom: `3px solid ${colors.primaryGreen}`,
              paddingBottom: '12px'
            }}>
              🔍 Filtros de Búsqueda
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr',
              gap: deviceInfo?.isMobile ? '16px' : '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  color: colors.darkBrown
                }}>
                  🆔 Cédula del Cliente:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={filtrosHistorico.cedula}
                  onChange={e => setFiltrosHistorico({ ...filtrosHistorico, cedula: e.target.value })}
                  style={{
                    width: '100%',
                    padding: deviceInfo?.isMobile ? '10px 12px' : '12px 16px',
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    border: `2px solid ${colors.primaryGreen}`,
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryGold;
                    e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.primaryGreen;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  color: colors.darkBrown
                }}>
                  🏷️ Nombre del Vendedor:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={filtrosHistorico.vendedor}
                  onChange={e => setFiltrosHistorico({ ...filtrosHistorico, vendedor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: deviceInfo?.isMobile ? '10px 12px' : '12px 16px',
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    border: `2px solid ${colors.primaryGreen}`,
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryGold;
                    e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.primaryGreen;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: deviceInfo?.isMobile ? '16px' : '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  color: colors.darkBrown
                }}>
                  🏛️ Número de Palco:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 15"
                  value={filtrosHistorico.palco}
                  onChange={e => setFiltrosHistorico({ ...filtrosHistorico, palco: e.target.value })}
                  style={{
                    width: '100%',
                    padding: deviceInfo?.isMobile ? '10px 12px' : '12px 16px',
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    border: `2px solid ${colors.primaryGreen}`,
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryGold;
                    e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.primaryGreen;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  color: colors.darkBrown
                }}>
                  📋 Tipo de Acción:
                </label>
                <select
                  value={filtrosHistorico.accion}
                  onChange={e => setFiltrosHistorico({ ...filtrosHistorico, accion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: deviceInfo?.isMobile ? '10px 12px' : '12px 16px',
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    border: `2px solid ${colors.primaryGreen}`,
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    color: colors.darkBrown,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryGold;
                    e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.primaryGreen;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="todas">Todas las acciones</option>
                  <option value="Reserva">Reservas</option>
                  <option value="Cancelación">Cancelaciones</option>
                  <option value="Movimiento">Movimientos</option>
                  <option value="Edición">Ediciones</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button
                  className="btn"
                  onClick={limpiarFiltrosHistorico}
                  style={{
                    width: '100%',
                    backgroundColor: colors.woodBrown,
                    color: colors.white,
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    padding: deviceInfo?.isMobile ? '10px 12px' : '12px 16px',
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
                  🔄 Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Resumen de resultados */}
          <div style={{
            backgroundColor: colors.creamBg,
            border: `2px solid ${colors.primaryGold}`,
            borderRadius: '15px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              color: colors.darkBrown,
              fontSize: deviceInfo?.isMobile ? '16px' : '18px',
              fontWeight: 'bold'
            }}>
              {user?.role === 'EMPLEADO' ? (
                <>
                  Mostrando <span style={{ color: colors.primaryGreen }}>{getHistoricoFiltrado().length}</span> de tus{' '}
                  <span style={{ color: colors.primaryGold }}>{historico.filter(r => r.vendedor === user.vendedor).length}</span> registros
                  {(filtrosHistorico.cedula || filtrosHistorico.vendedor || filtrosHistorico.palco || filtrosHistorico.accion !== 'todas') && (
                    <span style={{ color: colors.primaryRed }}> (filtrados)</span>
                  )}
                </>
              ) : (
                <>
                  Mostrando <span style={{ color: colors.primaryGreen }}>{getHistoricoFiltrado().length}</span> de{' '}
                  <span style={{ color: colors.primaryGold }}>{historico.length}</span> registros
                  {(filtrosHistorico.cedula || filtrosHistorico.vendedor || filtrosHistorico.palco || filtrosHistorico.accion !== 'todas') && (
                    <span style={{ color: colors.primaryRed }}> (filtrados)</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Lista de registros */}
          <div style={{
            backgroundColor: colors.white,
            border: `3px solid ${colors.primaryRed}`,
            borderRadius: '20px',
            padding: deviceInfo?.isMobile ? '20px' : 
                     deviceInfo?.isTablet ? '25px' : '30px',
            boxShadow: `0 8px 25px rgba(196, 48, 43, 0.15)`
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: colors.darkBrown,
              fontSize: deviceInfo?.isMobile ? '18px' : 
                       deviceInfo?.isTablet ? '20px' : '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              borderBottom: `3px solid ${colors.primaryRed}`,
              paddingBottom: '12px'
            }}>
              📋 Registros del Histórico
            </h4>

            {getHistoricoFiltrado().length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: deviceInfo?.isMobile ? '40px 20px' : 
                         deviceInfo?.isTablet ? '50px 25px' : '60px 30px',
                backgroundColor: colors.creamBg,
                borderRadius: '20px',
                border: `2px solid ${colors.primaryGold}`
              }}>
                <div style={{
                  fontSize: deviceInfo?.isMobile ? '48px' : 
                           deviceInfo?.isTablet ? '56px' : '64px',
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
                  {historico.length === 0 ? '📋' : '🔍'}
                </div>
                <h4 style={{
                  margin: '0 0 16px 0',
                  color: colors.darkBrown,
                  fontSize: deviceInfo?.isMobile ? '20px' : 
                           deviceInfo?.isTablet ? '22px' : '24px'
                }}>
                  {historico.length === 0 
                    ? "No hay movimientos registrados aún" 
                    : "No se encontraron registros con los filtros aplicados"
                  }
                </h4>
                <p style={{
                  color: colors.woodBrown,
                  fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {historico.length === 0 
                    ? "Los movimientos aparecerán aquí cuando se realicen reservas, cancelaciones o ediciones"
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados"
                  }
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: deviceInfo?.isMobile ? '16px' : 
                     deviceInfo?.isTablet ? '18px' : '20px'
              }}>
                {getHistoricoFiltrado().map((registro) => (
                  <div 
                    key={registro.id} 
                    style={{
                      border: `3px solid ${getAccionColor(registro.accion)}`,
                      borderRadius: '20px',
                      padding: deviceInfo?.isMobile ? '20px' : '24px',
                      backgroundColor: colors.creamBg,
                      boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1)`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 12px 35px rgba(0, 0, 0, 0.15)`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.1)`;
                    }}
                  >
                    {/* Header del registro */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      flexWrap: deviceInfo?.isMobile ? 'wrap' : 'nowrap',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          backgroundColor: getAccionColor(registro.accion),
                          color: colors.white,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                          boxShadow: `0 4px 15px ${getAccionColor(registro.accion)}40`
                        }}>
                          {getAccionIcon(registro.accion)} {registro.accion}
                        </span>
                      </div>
                      <span style={{
                        fontSize: deviceInfo?.isMobile ? '12px' : '14px',
                        color: colors.woodBrown,
                        backgroundColor: colors.white,
                        padding: '8px 12px',
                        borderRadius: '15px',
                        border: `1px solid ${colors.primaryGold}`,
                        fontWeight: 'bold'
                      }}>
                        📅 {formatearFecha(registro.fecha)}
                      </span>
                    </div>
                    
                    {/* Detalles del registro */}
                    <div style={{
                      fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                      color: colors.darkBrown,
                      marginBottom: '16px',
                      backgroundColor: colors.white,
                      padding: '16px',
                      borderRadius: '15px',
                      border: `2px solid ${colors.primaryGreen}`,
                      lineHeight: '1.5'
                    }}>
                      {getDetallesTexto(registro.detalles)}
                    </div>
                    
                    {/* Información detallada */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                      fontSize: deviceInfo?.isMobile ? '12px' : '14px',
                      color: colors.woodBrown,
                      backgroundColor: colors.white,
                      padding: '16px',
                      borderRadius: '15px',
                      border: `2px solid ${colors.primaryGold}`,
                      boxShadow: `0 4px 15px rgba(217, 119, 6, 0.1)`
                    }}>
                      {registro.cedula && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>🆔 Cédula:</strong>
                          <span>{registro.cedula}</span>
                        </div>
                      )}
                      {registro.nombreCliente && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>👤 Cliente:</strong>
                          <span>{registro.nombreCliente}</span>
                        </div>
                      )}
                      {registro.vendedor && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>🏷️ Vendedor:</strong>
                          <span>{registro.vendedor}</span>
                        </div>
                      )}
                      {registro.palco && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>🏛️ Palco:</strong>
                          <span>{registro.palco}</span>
                        </div>
                      )}
                      {registro.cantidad && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>📊 Cantidad:</strong>
                          <span>{registro.cantidad}</span>
                        </div>
                      )}
                      {registro.dias && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>📅 Días:</strong>
                          <span>{registro.dias}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default HistoricoCompletoModal;
