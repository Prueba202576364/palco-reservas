import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const VerificacionPagosModal = ({
  isOpen,
  onClose,
  pagosPendientes,
  handleVerificarPago,
  loading,
  setShowVerificacionPagos
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

  return (
    <div className="modal-overlay-unified">
      <div className="modal-container-unified">
        
        {/* Header del modal - Estilo elegante con gradiente */}
        <div className="modal-header-unified">
          <h3>
            💳 Verificación de Pagos Pendientes (Vendedor)
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
          
          {/* Estado de pagos pendientes */}
          {pagosPendientes.length === 0 ? (
             <div style={{
               textAlign: 'center',
               padding: deviceInfo?.isMobile ? '40px 20px' : 
                        deviceInfo?.isTablet ? '50px 25px' : '60px 20px',
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
                fontSize: '16px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Todos los pagos del vendedor han sido verificados correctamente
              </p>
            </div>
          ) : (
            <div>
                             {/* Resumen de pagos pendientes */}
               <div style={{
                 backgroundColor: colors.creamBg,
                 border: `3px solid ${colors.primaryGold}`,
                 borderRadius: '15px',
                 padding: deviceInfo?.isMobile ? '20px' : 
                          deviceInfo?.isTablet ? '22px' : '20px',
                 marginBottom: deviceInfo?.isMobile ? '20px' : 
                               deviceInfo?.isTablet ? '22px' : '24px',
                 textAlign: 'center',
                 boxShadow: `0 8px 25px rgba(217, 119, 6, 0.2)`
               }}>
                 <h4 style={{
                   margin: '0 0 12px 0',
                   color: colors.darkBrown,
                   fontSize: deviceInfo?.isMobile ? '18px' : 
                            deviceInfo?.isTablet ? '20px' : '20px'
                 }}>
                   📋 Resumen de Pagos Pendientes
                 </h4>
                 <p style={{
                   margin: 0,
                   color: colors.woodBrown,
                   fontSize: deviceInfo?.isMobile ? '16px' : 
                            deviceInfo?.isTablet ? '18px' : '18px',
                   fontWeight: 'bold'
                 }}>
                   Tienes <span style={{ 
                     color: colors.primaryRed, 
                     fontSize: deviceInfo?.isMobile ? '20px' : 
                              deviceInfo?.isTablet ? '22px' : '24px' 
                   }}>{pagosPendientes.length}</span> pago(s) del vendedor esperando verificación
                 </p>
               </div>

                              {/* Lista de pagos pendientes */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: deviceInfo?.isMobile ? '16px' : 
                       deviceInfo?.isTablet ? '18px' : '20px' 
                }}>
                                 {pagosPendientes.map(pago => (
                   <div key={pago.id} style={{
                     border: `3px solid ${colors.primaryGold}`,
                     borderRadius: '20px',
                     padding: deviceInfo?.isMobile ? '20px' : 
                              deviceInfo?.isTablet ? '22px' : '24px',
                     backgroundColor: colors.creamBg,
                     boxShadow: `0 8px 25px rgba(217, 119, 6, 0.15)`,
                     transition: 'all 0.3s ease'
                   }}>
                                         {/* Información del cliente y reserva */}
                     <div style={{
                       display: 'grid',
                       gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : '1fr 1fr',
                       gap: deviceInfo?.isMobile ? '16px' : 
                            deviceInfo?.isTablet ? '18px' : '20px',
                       marginBottom: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '20px'
                     }}>
                                             {/* Datos del cliente */}
                       <div style={{
                         backgroundColor: colors.white,
                         padding: deviceInfo?.isMobile ? '18px' : 
                                  deviceInfo?.isTablet ? '20px' : '20px',
                         borderRadius: '15px',
                         border: `2px solid ${colors.primaryGreen}`,
                         boxShadow: `0 4px 15px rgba(22, 163, 74, 0.1)`
                       }}>
                         <h4 style={{
                           margin: '0 0 16px 0',
                           color: colors.darkBrown,
                           fontSize: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '18px',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px'
                         }}>
                           👤 Cliente
                         </h4>
                         <div style={{ color: colors.woodBrown }}>
                           <p style={{ margin: '0 0 8px 0', fontSize: deviceInfo?.isMobile ? '14px' : '16px' }}>
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
                         padding: deviceInfo?.isMobile ? '18px' : 
                                  deviceInfo?.isTablet ? '20px' : '20px',
                         borderRadius: '15px',
                         border: `2px solid ${colors.primaryRed}`,
                         boxShadow: `0 4px 15px rgba(196, 48, 43, 0.1)`
                       }}>
                         <h4 style={{
                           margin: '0 0 16px 0',
                           color: colors.darkBrown,
                           fontSize: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '18px',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px'
                         }}>
                           🏛️ Reserva
                         </h4>
                         <div style={{ color: colors.woodBrown }}>
                           <p style={{ margin: '0 0 8px 0', fontSize: deviceInfo?.isMobile ? '14px' : '16px' }}>
                             <strong>Palco {pago.reserva.palco}</strong>
                           </p>
                           <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                             📊 {pago.reserva.cantidad} sillas
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
                       padding: deviceInfo?.isMobile ? '18px' : 
                                deviceInfo?.isTablet ? '20px' : '20px',
                       borderRadius: '15px',
                       border: `2px solid ${colors.woodBrown}`,
                       marginBottom: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '20px',
                       boxShadow: `0 4px 15px rgba(139, 69, 19, 0.1)`
                     }}>
                       <h4 style={{
                         margin: '0 0 16px 0',
                         color: colors.darkBrown,
                         fontSize: deviceInfo?.isMobile ? '16px' : 
                                  deviceInfo?.isTablet ? '18px' : '18px',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px'
                       }}>
                         💳 Detalles del Pago
                       </h4>
                                             <div style={{
                         display: 'grid',
                         gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(3, 1fr)',
                         gap: deviceInfo?.isMobile ? '12px' : 
                              deviceInfo?.isTablet ? '14px' : '16px',
                         fontSize: deviceInfo?.isMobile ? '13px' : '14px'
                       }}>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: deviceInfo?.isMobile ? '10px' : 
                                   deviceInfo?.isTablet ? '12px' : '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Método:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '4px' }}>{pago.metodoPago}</div>
                        </div>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: deviceInfo?.isMobile ? '10px' : 
                                   deviceInfo?.isTablet ? '12px' : '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Esperado:</strong>
                          <div style={{ color: colors.primaryGreen, marginTop: '4px', fontWeight: 'bold' }}>
                            ${pago.montoEsperado ? pago.montoEsperado.toLocaleString() : '0'}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: colors.creamBg,
                          padding: deviceInfo?.isMobile ? '10px' : 
                                   deviceInfo?.isTablet ? '12px' : '12px',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Enviado:</strong>
                          <div style={{ color: colors.woodBrown, marginTop: '4px' }}>
                            {pago.imagenComprobanteData ? '✅ Comprobante adjunto' : '❌ Sin comprobante'}
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      {pago.numeroComprobante && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: colors.creamBg,
                          borderRadius: '10px',
                          border: `1px solid ${colors.primaryGold}`
                        }}>
                          <strong style={{ color: colors.darkBrown }}>Comprobante:</strong>
                          <span style={{ color: colors.woodBrown, marginLeft: '8px' }}>{pago.numeroComprobante}</span>
                        </div>
                      )}
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
                     {pago.imagenComprobanteData && (
                       <div style={{
                         marginBottom: deviceInfo?.isMobile ? '16px' : 
                                      deviceInfo?.isTablet ? '18px' : '20px',
                         textAlign: 'center',
                         backgroundColor: colors.white,
                         padding: deviceInfo?.isMobile ? '18px' : 
                                  deviceInfo?.isTablet ? '20px' : '20px',
                         borderRadius: '15px',
                         border: `2px solid ${colors.primaryGreen}`,
                         boxShadow: `0 4px 15px rgba(22, 163, 74, 0.1)`
                       }}>
                         <h4 style={{
                           margin: '0 0 16px 0',
                           color: colors.darkBrown,
                           fontSize: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '18px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: '8px'
                         }}>
                           📸 Comprobante de Pago
                         </h4>
                        <img 
                          src={pago.imagenComprobanteData}
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
                          onClick={() => window.open(pago.imagenComprobanteData)}
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
                       gap: deviceInfo?.isMobile ? '12px' : 
                            deviceInfo?.isTablet ? '14px' : '16px',
                       justifyContent: 'center',
                       paddingTop: deviceInfo?.isMobile ? '16px' : 
                                    deviceInfo?.isTablet ? '18px' : '20px',
                       borderTop: `2px solid ${colors.primaryGold}`,
                       flexWrap: deviceInfo?.isMobile ? 'wrap' : 'nowrap'
                     }}>
                      <button
                        className="btn"
                        onClick={() => {
                          const observaciones = prompt('¿Motivo del rechazo? (opcional)');
                          if (observaciones !== null) {
                            handleVerificarPago(pago, false, observaciones);
                          }
                        }}
                                                 style={{
                           backgroundColor: colors.primaryRed,
                           color: colors.white,
                           padding: deviceInfo?.isMobile ? '10px 20px' : 
                                    deviceInfo?.isTablet ? '12px 22px' : '12px 24px',
                           fontSize: deviceInfo?.isMobile ? '14px' : 
                                    deviceInfo?.isTablet ? '15px' : '16px',
                           border: 'none',
                           borderRadius: '12px',
                           cursor: 'pointer',
                           fontWeight: 'bold',
                           transition: 'all 0.3s ease',
                           boxShadow: `0 4px 15px rgba(196, 48, 43, 0.3)`,
                           minWidth: deviceInfo?.isMobile ? '100%' : 'auto'
                         }}
                        disabled={loading}
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
                        onClick={() => {
                          if (window.confirm(`¿Confirmar que recibiste $${pago.montoEsperado ? pago.montoEsperado.toLocaleString() : '0'} por ${pago.metodoPago}?\n\nEsto confirmará la venta del Palco ${pago.reserva.palco}.`)) {
                            handleVerificarPago(pago, true);
                          }
                        }}
                                                 style={{
                           backgroundColor: colors.primaryGreen,
                           color: colors.white,
                           padding: deviceInfo?.isMobile ? '10px 20px' : 
                                    deviceInfo?.isTablet ? '12px 22px' : '12px 24px',
                           fontSize: deviceInfo?.isMobile ? '14px' : 
                                    deviceInfo?.isTablet ? '15px' : '16px',
                           border: 'none',
                           borderRadius: '12px',
                           cursor: 'pointer',
                           fontWeight: 'bold',
                           transition: 'all 0.3s ease',
                           boxShadow: `0 4px 15px rgba(22, 163, 74, 0.3)`,
                           minWidth: deviceInfo?.isMobile ? '100%' : 'auto'
                         }}
                        disabled={loading}
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

                    {/* Información adicional del pago */}
                    {pago.imagenComprobanteData !== pago.observaciones && (
                      <div style={{
                        backgroundColor: pago.imagenComprobanteData ? colors.creamBg : '#FEF2F2',
                        border: `2px solid ${pago.imagenComprobanteData ? colors.primaryGreen : colors.primaryRed}`,
                        color: pago.imagenComprobanteData ? colors.darkBrown : colors.primaryRed,
                        padding: '16px',
                        borderRadius: '12px',
                        marginTop: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        ⚠️ <strong>Información del pago:</strong> 
                        <div style={{ marginTop: '8px' }}>
                          {pago.imagenComprobanteData 
                            ? `Cliente envió comprobante de pago`
                            : `Cliente pagó $${pago.montoEsperado ? pago.montoEsperado.toLocaleString() : '0'}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
               onClick={() => setShowVerificacionPagos(false)}
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

export default VerificacionPagosModal;
