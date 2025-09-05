import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const PagosClienteModal = ({
  isOpen,
  onClose,
  pagosCliente,
  firebaseSyncService,
  agregarAlHistorico,
  mostrarMensaje,
  palcos,
  setPalcos,
  registrarIngreso,
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

  // Función para rechazar pago
  const handleRechazarPago = async (pago, observaciones) => {
    try {
      await firebaseSyncService.actualizarEstadoPago(pago.id, 'rechazado', observaciones);
      
      // Agregar al histórico
      agregarAlHistorico('pago_rechazado', {
        palco: pago.reserva.palco,
        monto: pago.montoEsperado,
        cliente: pago.reserva.nombre,
        cedula: pago.reserva.cedula,
        motivo: observaciones
      }, pago.reserva);
      
      mostrarMensaje('success', '❌ Pago rechazado correctamente');
    } catch (error) {
      console.error('Error rechazando pago:', error);
      mostrarMensaje('error', '❌ Error rechazando el pago');
    }
  };

  // Función para confirmar pago y venta
  const handleConfirmarPago = async (pago) => {
    if (window.confirm(`¿Confirmar que recibiste $${pago.montoEsperado.toLocaleString()}?\n\nEsto confirmará la venta del Palco ${pago.reserva.palco}.`)) {
      try {
        // 1. Actualizar estado del pago
        await firebaseSyncService.actualizarEstadoPago(pago.id, 'aprobado');
        
        // 2. Procesar la venta del palco usando la misma lógica que las reservas
        const palcoNumero = parseInt(pago.reserva.palco);
        console.log('🔍 Actualizando palco desde pago:', palcoNumero, 'Tipo:', pago.reserva.tipoPalco);
        
        const nuevosPalcos = palcos.map(palco => {
          if (palco.numero === palcoNumero) {
            console.log('🔍 Encontrado palco para actualizar:', palco.numero);
            
            if (pago.reserva.tipoPalco === 'completo') {
              console.log('🔍 Marcando palco como vendido (completo) y guardando reserva');
              return { 
                ...palco, 
                estado: 'vendido',
                reservas: [{
                  nombre: pago.reserva.nombre,
                  cedula: pago.reserva.cedula,
                  telefono: pago.reserva.telefono,
                  correo: pago.reserva.correo,
                  vendedor: user?.displayName || user?.email || 'Vendedor',
                  monto: pago.montoEsperado,
                  dias: pago.reserva.dias,
                  fecha: pago.fechaEnvio,
                  tipoPalco: pago.reserva.tipoPalco,
                  id: pago.id
                }]
              };
            } else {
              console.log('🔍 Agregando reserva por sillas');
              
              // Parsear los días de la reserva
              const diasReserva = [];
              if (pago.reserva.dias && typeof pago.reserva.dias === 'string') {
                const diasArray = pago.reserva.dias.split(', ');
                diasArray.forEach(diaStr => {
                  const [diaNombre, cantidad] = diaStr.split(': ');
                  if (diaNombre && cantidad) {
                    diasReserva.push({ 
                      dia: diaNombre.trim(), 
                      cantidad: parseInt(cantidad) 
                    });
                  }
                });
              }
              
              console.log('🔍 Días de reserva parseados:', diasReserva);
              
              const reservasActualizadas = { ...palco.reservas };
              diasReserva.forEach(({ dia, cantidad }) => {
                if (!reservasActualizadas[dia]) {
                  reservasActualizadas[dia] = [];
                }
                reservasActualizadas[dia].push({
                  nombre: pago.reserva.nombre,
                  cedula: pago.reserva.cedula,
                  telefono: pago.reserva.telefono,
                  correo: pago.reserva.correo,
                  vendedor: user?.displayName || user?.email || 'Vendedor',
                  cantidad: cantidad
                });
              });
              
              return { ...palco, reservas: reservasActualizadas };
            }
          }
          return palco;
        });
        
        console.log('🔍 Palcos actualizados desde pago:', nuevosPalcos);
        setPalcos(nuevosPalcos);
        
        // Sincronizar con Firebase inmediatamente
        firebaseSyncService.sincronizarPalcos(nuevosPalcos);
          
        // 3. Registrar el ingreso
        registrarIngreso('venta', pago.montoEsperado, {
          palco: palcoNumero,
          cliente: pago.reserva.nombre,
          cedula: pago.reserva.cedula,
          metodoPago: pago.datosMetodo?.tipo || 'No especificado',
          pagoId: pago.id,
          appOrigen: 'cliente'
        });
        
        // 4. Agregar al histórico
        agregarAlHistorico('venta_confirmada', {
          palco: palcoNumero,
          monto: pago.montoEsperado,
          cliente: pago.reserva.nombre,
          cedula: pago.reserva.cedula
        }, pago.reserva);
        
        mostrarMensaje('success', `✅ Venta confirmada: Palco ${palcoNumero} - $${pago.montoEsperado.toLocaleString()}`);
      } catch (error) {
        console.error('Error procesando venta:', error);
        mostrarMensaje('error', '❌ Error procesando la venta');
      }
    }
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
      <div className="modal-cliente modal-pagos-cliente" style={{
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
            💳 Pagos del Cliente
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

          {/* Estadísticas rápidas */}
          <div style={{
            backgroundColor: colors.creamBg,
            border: `3px solid ${colors.primaryGreen}`,
            borderRadius: '20px',
            padding: deviceInfo?.isMobile ? '20px' : 
                     deviceInfo?.isTablet ? '25px' : '30px',
            textAlign: 'center',
            boxShadow: `0 8px 25px rgba(22, 163, 74, 0.2)`
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
              📊 Resumen de Pagos
            </h4>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                backgroundColor: colors.primaryGreen,
                color: colors.white,
                padding: deviceInfo?.isMobile ? '16px 20px' : '20px 24px',
                borderRadius: '15px',
                fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                boxShadow: `0 4px 15px rgba(22, 163, 74, 0.3)`,
                minWidth: '120px'
              }}>
                💳 {pagosCliente.length} Pago(s) Pendiente(s)
              </div>
            </div>
          </div>

          {/* SECCIÓN: Pagos del Cliente */}
          {pagosCliente.length > 0 ? (
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
                textAlign: 'center',
                borderBottom: `3px solid ${colors.primaryGold}`,
                paddingBottom: '12px'
              }}>
                💳 Pagos del Cliente ({pagosCliente.length})
              </h4>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: deviceInfo?.isMobile ? '16px' : 
                     deviceInfo?.isTablet ? '18px' : '20px'
              }}>
                {pagosCliente.map(pago => (
                  <div key={pago.id} style={{
                    border: `3px solid ${colors.primaryGreen}`,
                    borderRadius: '20px',
                    padding: deviceInfo?.isMobile ? '20px' : '24px',
                    backgroundColor: colors.creamBg,
                    boxShadow: `0 8px 25px rgba(22, 163, 74, 0.15)`,
                    transition: 'all 0.3s ease'
                  }}>
                    
                    {/* Información del cliente y reserva */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr',
                      gap: deviceInfo?.isMobile ? '16px' : '20px',
                      marginBottom: '20px'
                    }}>
                      {/* Datos del cliente */}
                      <div style={{
                        backgroundColor: colors.white,
                        padding: '16px',
                        borderRadius: '15px',
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
                          👤 Cliente
                        </h5>
                        <div style={{ color: colors.woodBrown }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                            <strong>{pago.reserva.nombre}</strong>
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            📞 {pago.reserva.telefono}
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            🆔 {pago.reserva.cedula}
                          </p>
                        </div>
                      </div>

                      {/* Datos de la reserva */}
                      <div style={{
                        backgroundColor: colors.white,
                        padding: '16px',
                        borderRadius: '15px',
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
                          🏛️ Reserva
                        </h5>
                        <div style={{ color: colors.woodBrown }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                            <strong>Palco {pago.reserva.palco}</strong>
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            📊 {pago.reserva.cantidad}
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            📅 {pago.reserva.dias}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalles del pago */}
                    <div style={{
                      backgroundColor: colors.white,
                      padding: '20px',
                      borderRadius: '15px',
                      border: `2px solid ${colors.woodBrown}`,
                      marginBottom: '20px',
                      boxShadow: `0 4px 15px rgba(139, 69, 19, 0.1)`
                    }}>
                      <h5 style={{
                        margin: '0 0 16px 0',
                        color: colors.darkBrown,
                        fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        💳 Detalles del Pago
                      </h5>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: deviceInfo?.isMobile ? '12px' : '16px',
                        fontSize: '14px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Método:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '4px' }}>
                            {pago.metodoPago || pago.datosMetodo?.nombre || 'No especificado'}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Enviado:</strong>
                          <div style={{ color: colors.primaryGreen, marginTop: '4px', fontWeight: 'bold' }}>
                            ${pago.montoEsperado ? pago.montoEsperado.toLocaleString() : '0'}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Fecha:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '4px' }}>
                            {pago.fechaEnvio}
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      {pago.observaciones && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: colors.creamBg,
                          borderRadius: '10px',
                          border: `1px solid ${colors.primaryGold}`
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Observaciones del cliente:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '8px' }}>{pago.observaciones}</div>
                        </div>
                      )}
                      
                      {pago.datosMetodo && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: colors.creamBg,
                          borderRadius: '10px',
                          border: `1px solid ${colors.primaryGold}`
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Verificar en:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '8px', fontSize: '12px' }}>
                            {pago.datosMetodo.numero || pago.datosMetodo.cuenta}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comprobante de pago */}
                    {pago.comprobanteUrl && (
                      <div style={{
                        marginBottom: '20px',
                        textAlign: 'center',
                        backgroundColor: colors.white,
                        padding: '20px',
                        borderRadius: '15px',
                        border: `2px solid ${colors.primaryGreen}`,
                        boxShadow: `0 4px 15px rgba(22, 163, 74, 0.1)`
                      }}>
                        <h5 style={{
                          margin: '0 0 16px 0',
                          color: colors.darkBrown,
                          fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}>
                          📸 Comprobante de Pago
                        </h5>
                        <img 
                          src={pago.comprobanteUrl}
                          alt="Comprobante de pago"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '15px',
                            border: `3px solid ${colors.primaryGreen}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }}
                          onClick={() => window.open(pago.comprobanteUrl)}
                          title="Click para ver en tamaño completo"
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.02)';
                            e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                        />
                        <p style={{
                          fontSize: '14px',
                          color: colors.woodBrown,
                          margin: '12px 0 0 0',
                          fontStyle: 'italic'
                        }}>
                          💡 Click en la imagen para verla en tamaño completo
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div style={{
                      display: 'flex',
                      gap: deviceInfo?.isMobile ? '12px' : '16px',
                      justifyContent: 'center',
                      paddingTop: '20px',
                      borderTop: `2px solid ${colors.primaryGold}`,
                      flexWrap: deviceInfo?.isMobile ? 'wrap' : 'nowrap'
                    }}>
                      <button
                        className="btn"
                        onClick={() => {
                          const observaciones = prompt('¿Motivo del rechazo? (opcional)');
                          if (observaciones !== null) {
                            handleRechazarPago(pago, observaciones);
                          }
                        }}
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
                          boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`,
                          minWidth: deviceInfo?.isMobile ? '100%' : 'auto'
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
                        ❌ Rechazar Pago
                      </button>
                      
                      <button
                        className="btn"
                        onClick={() => handleConfirmarPago(pago)}
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
                          minWidth: deviceInfo?.isMobile ? '100%' : 'auto'
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
                        ✅ Confirmar Pago y Venta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Mensaje cuando no hay pagos */
            <div style={{
              textAlign: 'center',
              padding: deviceInfo?.isMobile ? '40px 20px' : 
                       deviceInfo?.isTablet ? '50px 25px' : '60px 30px',
              backgroundColor: colors.creamBg,
              borderRadius: '20px',
              border: `3px solid ${colors.primaryGreen}`,
              boxShadow: `0 8px 25px rgba(22, 163, 74, 0.2)`
            }}>
              <div style={{
                fontSize: deviceInfo?.isMobile ? '48px' : 
                         deviceInfo?.isTablet ? '56px' : '64px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                ✅
              </div>
              <h4 style={{
                margin: '0 0 16px 0',
                color: colors.darkBrown,
                fontSize: deviceInfo?.isMobile ? '20px' : 
                         deviceInfo?.isTablet ? '22px' : '24px'
              }}>
                ¡Excelente! No hay pagos pendientes
              </h4>
              <p style={{
                color: colors.woodBrown,
                fontSize: deviceInfo?.isMobile ? '16px' : '18px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Todos los pagos del cliente han sido procesados correctamente
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

export default PagosClienteModal;
