import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const MisReservasModal = ({
  isOpen,
  onClose,
  busquedaCedula,
  setBusquedaCedula,
  buscarReservasPorCedula,
  handleMoverReserva,
  canMoveReservations,
  handleCancelarReserva,
  canCancel
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

  const reservasEncontradas = buscarReservasPorCedula(busquedaCedula);

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
      <div className="modal-cliente modal-mis-reservas" style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: deviceInfo?.isMobile ? '95vw' : 
                 deviceInfo?.isTablet ? '90vw' : '800px',
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
            📅 Mis Reservas
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

          {/* Buscador de reservas */}
          <div style={{
            backgroundColor: colors.creamBg,
            border: `3px solid ${colors.primaryGreen}`,
            borderRadius: '20px',
            padding: deviceInfo?.isMobile ? '20px' : 
                     deviceInfo?.isTablet ? '25px' : '30px',
            boxShadow: `0 8px 25px rgba(22, 163, 74, 0.2)`,
            textAlign: 'center'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: colors.darkBrown,
              fontSize: deviceInfo?.isMobile ? '18px' : 
                       deviceInfo?.isTablet ? '20px' : '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              🔍 Buscar Mis Reservas
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center'
            }}>
              <label style={{
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                Ingresa tu número de cédula:
              </label>
              
              <input
                type="text"
                value={busquedaCedula}
                onChange={e => setBusquedaCedula(e.target.value)}
                placeholder="Ej: 12345678"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: deviceInfo?.isMobile ? '12px 16px' : '14px 18px',
                  fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                  border: `2px solid ${colors.primaryGreen}`,
                  borderRadius: '12px',
                  backgroundColor: colors.white,
                  color: colors.darkBrown,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 15px rgba(22, 163, 74, 0.1)`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryGold;
                  e.target.style.boxShadow = `0 6px 20px rgba(22, 163, 74, 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.primaryGreen;
                  e.target.style.boxShadow = `0 4px 15px rgba(22, 163, 74, 0.1)`;
                }}
              />
              
              <p style={{
                color: colors.woodBrown,
                fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                💡 Ingresa tu cédula para ver todas tus reservas activas
              </p>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {busquedaCedula && (
            <div style={{
              backgroundColor: colors.white,
              border: `3px solid ${colors.primaryGold}`,
              borderRadius: '20px',
              padding: deviceInfo?.isMobile ? '20px' : 
                       deviceInfo?.isTablet ? '25px' : '30px',
              boxShadow: `0 8px 25px rgba(217, 119, 6, 0.15)`
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
                textAlign: 'center'
              }}>
                📋 Resultados de Búsqueda
              </h4>

              {reservasEncontradas.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: colors.creamBg,
                  borderRadius: '15px',
                  border: `2px solid ${colors.primaryRed}`,
                  color: colors.primaryRed
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    ❌
                  </div>
                  <h5 style={{
                    margin: '0 0 12px 0',
                    fontSize: deviceInfo?.isMobile ? '16px' : '18px'
                  }}>
                    No se encontraron reservas
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                    color: colors.woodBrown
                  }}>
                    Verifica que el número de cédula sea correcto
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: deviceInfo?.isMobile ? '16px' : 
                       deviceInfo?.isTablet ? '18px' : '20px'
                }}>
                  {/* Resumen de resultados */}
                  <div style={{
                    backgroundColor: colors.creamBg,
                    border: `2px solid ${colors.primaryGreen}`,
                    borderRadius: '15px',
                    padding: '16px',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      margin: 0,
                      color: colors.darkBrown,
                      fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                      fontWeight: 'bold'
                    }}>
                      🎯 Se encontraron <span style={{ 
                        color: colors.primaryGreen, 
                        fontSize: deviceInfo?.isMobile ? '20px' : '22px' 
                      }}>{reservasEncontradas.length}</span> reserva(s)
                    </p>
                  </div>

                  {/* Lista de reservas */}
                  {reservasEncontradas.map((r, idx) => (
                    <div key={idx} style={{
                      border: `2px solid ${colors.woodBrown}`,
                      borderRadius: '15px',
                      padding: deviceInfo?.isMobile ? '18px' : '20px',
                      backgroundColor: colors.creamBg,
                      boxShadow: `0 4px 15px rgba(139, 69, 19, 0.1)`,
                      transition: 'all 0.3s ease'
                    }}>
                      {/* Información principal de la reserva */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr',
                        gap: deviceInfo?.isMobile ? '16px' : '20px',
                        marginBottom: '16px'
                      }}>
                        {/* Detalles del palco */}
                        <div style={{
                          backgroundColor: colors.white,
                          padding: '16px',
                          borderRadius: '12px',
                          border: `2px solid ${colors.primaryGreen}`,
                          boxShadow: `0 4px 15px rgba(22, 163, 74, 0.1)`
                        }}>
                          <h5 style={{
                            margin: '0 0 12px 0',
                            color: colors.darkBrown,
                            fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            🏛️ Palco
                          </h5>
                          <div style={{ color: colors.woodBrown }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                              <strong>Número:</strong> {r.palco}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                              <strong>Tipo:</strong> {r.tipo === 'completo' ? 'Palco Completo' : 'Sillas Individuales'}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                              <strong>Cantidad:</strong> {r.cantidad} {r.tipo === 'completo' ? 'sillas' : 'silla(s)'}
                            </p>
                          </div>
                        </div>

                        {/* Detalles de días y fechas */}
                        <div style={{
                          backgroundColor: colors.white,
                          padding: '16px',
                          borderRadius: '12px',
                          border: `2px solid ${colors.primaryRed}`,
                          boxShadow: `0 4px 15px rgba(196, 48, 43, 0.1)`
                        }}>
                          <h5 style={{
                            margin: '0 0 12px 0',
                            color: colors.darkBrown,
                            fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📅 Días y Fechas
                          </h5>
                          <div style={{ color: colors.woodBrown }}>
                            {r.tipo === 'completo' ? (
                              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                <strong>Días:</strong> Todos los días (palco completo)
                              </p>
                            ) : (
                              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                <strong>Día:</strong> {r.dia.charAt(0).toUpperCase() + r.dia.slice(1)}
                              </p>
                            )}
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                              <strong>Estado:</strong> <span style={{ color: colors.primaryGreen }}>✅ Activa</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información del cliente */}
                      {r.reserva && (
                        <div style={{
                          backgroundColor: colors.white,
                          padding: '16px',
                          borderRadius: '12px',
                          border: `2px solid ${colors.primaryGold}`,
                          marginBottom: '16px',
                          boxShadow: `0 4px 15px rgba(217, 119, 6, 0.1)`
                        }}>
                          <h5 style={{
                            margin: '0 0 12px 0',
                            color: colors.darkBrown,
                            fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            👤 Información del Cliente
                          </h5>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '12px',
                            color: colors.woodBrown
                          }}>
                            <div>
                              <strong>Nombre:</strong> {r.reserva.nombre}
                            </div>
                            <div>
                              <strong>Teléfono:</strong> 📞 {r.reserva.telefono}
                            </div>
                            <div>
                              <strong>Cédula:</strong> 🆔 {r.reserva.cedula}
                            </div>
                            {r.reserva.vendedor && (
                              <div>
                                <strong>Vendedor:</strong> 👨‍💼 {r.reserva.vendedor}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botones de mover/cancelar reserva */}
                      {((r.tipo === 'sillas' && canMoveReservations && canMoveReservations(r.reserva)) ||
                        (canCancel && canCancel(r.reserva))) && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          justifyContent: 'center',
                          paddingTop: '16px',
                          borderTop: `2px solid ${colors.primaryGold}`
                        }}>
                          {r.tipo === 'sillas' && canMoveReservations && canMoveReservations(r.reserva) && (
                            <button
                              className="btn"
                              onClick={() => handleMoverReserva(r)}
                              style={{
                                backgroundColor: colors.primaryGold,
                                color: colors.white,
                                padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                                fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                boxShadow: `0 4px 15px rgba(217, 119, 6, 0.3)`
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 6px 20px rgba(217, 119, 6, 0.4)`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = `0 4px 15px rgba(217, 119, 6, 0.3)`;
                              }}
                            >
                              🔄 Mover a Otro Palco
                            </button>
                          )}

                          {canCancel && canCancel(r.reserva) && (
                            <button
                              className="btn"
                              onClick={() => handleCancelarReserva(r.palcoObj, r.reserva, r.tipo === 'sillas' ? r.dia : null)}
                              style={{
                                backgroundColor: colors.primaryRed,
                                color: colors.white,
                                padding: deviceInfo?.isMobile ? '10px 20px' : '12px 24px',
                                fontSize: deviceInfo?.isMobile ? '14px' : '16px',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 6px 20px rgba(196, 48, 43, 0.4)`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = `0 4px 15px rgba(196, 48, 43, 0.3)`;
                              }}
                            >
                              🗑️ Cancelar Reserva
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instrucciones cuando no hay búsqueda */}
          {!busquedaCedula && (
            <div style={{
              backgroundColor: colors.creamBg,
              border: `3px solid ${colors.primaryGold}`,
              borderRadius: '20px',
              padding: deviceInfo?.isMobile ? '30px 20px' : 
                       deviceInfo?.isTablet ? '40px 25px' : '50px 30px',
              textAlign: 'center',
              boxShadow: `0 8px 25px rgba(217, 119, 6, 0.2)`
            }}>
              <div style={{
                fontSize: deviceInfo?.isMobile ? '48px' : 
                         deviceInfo?.isTablet ? '56px' : '64px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                📅
              </div>
              <h4 style={{
                margin: '0 0 16px 0',
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '20px' : 
                         deviceInfo?.isTablet ? '22px' : '24px'
              }}>
                Consulta Tus Reservas
              </h4>
              <p style={{
                color: colors.woodBrown,
                fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Ingresa tu número de cédula en el campo de búsqueda para ver todas tus reservas activas, 
                incluyendo palcos completos y sillas individuales.
              </p>
            </div>
          )}

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

export default MisReservasModal;
