import { useState } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const ReservationModal = ({
  isOpen,
  onClose,
  palcoSeleccionado,
  form,
  setForm,
  formErrors,
  handleConfirmarReserva,
  handleConfirmarReservaEspecifica,
  handleIniciarPago,
  loading,
  DIAS,
  PRECIO_PALCO_COMPLETO,
  PRECIO_SILLA,
  getSillasDisponibles,
  getDiasActivos,
  calcularPrecioEspecifico,
  handleDiaChange,
  handleDiaEspecificoChange,
  toggleDiaActivo
}) => {
  const [activeTab, setActiveTab] = useState('form');
  const deviceInfo = useDeviceDetection();

  // 🎨 PALETA DE COLORES ELEGANTE
  const colors = {
    primaryRed: '#C4302B',
    primaryGold: '#D97706',
    primaryGreen: '#16A34A',
    darkBrown: '#451A03',
    creamBg: '#F5F1EB',
    white: '#FFFFFF',
    woodBrown: '#8B4513'
  };

  // Función para calcular precio total
  const calcularPrecioTotal = () => {
    if (palcoSeleccionado.tipo === 'completo') {
      return PRECIO_PALCO_COMPLETO;
    }
    return calcularPrecioEspecifico();
  };

  // Función para obtener días activos
  const diasActivos = getDiasActivos();

  // Función para validar formulario básico
  const validarFormularioBasico = () => {
    if (!form.nombre.trim()) return false;
    if (!form.cedula.trim()) return false;
    if (!form.telefono.trim()) return false;
    if (!form.correo.trim()) return false;
    if (!form.vendedor.trim()) return false;
    
    // Para palcos por sillas, verificar que haya al menos un día activo
    if (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0) {
      return false;
    }
    
    return true;
  };

  // Función para manejar el botón de confirmar reserva (nuevo flujo con pago)
  const handleProcederAPago = () => {
    // Validar formulario antes de proceder
    if (!validarFormularioBasico()) {
      alert('Por favor completa todos los campos requeridos y selecciona al menos un día (para palcos por sillas).');
      return;
    }

    // Crear objeto de reserva para el pago
    const reservaInfo = {
      id: Date.now(),
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      correo: form.correo,
      vendedor: form.vendedor,
      palco: palcoSeleccionado.numero,
      tipo: palcoSeleccionado.tipo,
      cantidad: palcoSeleccionado.tipo === 'completo' ? '10 sillas (completo)' : diasActivos.reduce((sum, dia) => sum + dia.cantidad, 0),
      dias: palcoSeleccionado.tipo === 'completo' ? 'Todos los días' : diasActivos.map(dia => `${dia.dia}: ${dia.cantidad} silla${dia.cantidad > 1 ? 's' : ''}`).join(', '),
      monto: calcularPrecioTotal(),
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
      estado: 'pendiente_pago'
    };

    // Cerrar modal de reserva y abrir modal de pago
    onClose();
    handleIniciarPago(reservaInfo);
  };



  // Función local para manejar cambios en días específicos (FALLBACK)
  const handleDiaEspecificoChangeLocal = (dia, valor) => {
    console.log(`🔍 handleDiaEspecificoChangeLocal llamado para ${dia} con valor ${valor}`);
    console.log(`🔍 Estado actual:`, form.sillasEspecificas[dia]);
    
    // Si la función externa funciona, úsala
    if (handleDiaEspecificoChange && typeof handleDiaEspecificoChange === 'function') {
      console.log(`🔍 Usando función externa handleDiaEspecificoChange`);
      handleDiaEspecificoChange(dia, 'cantidad', valor);
    } else {
      // Fallback local si la función externa no funciona
      console.log(`🔍 Usando fallback local`);
      
      // Verificar que el día existe en sillasEspecificas
      if (!form.sillasEspecificas[dia]) {
        console.log(`🔍 Día ${dia} no existe, creándolo...`);
        setForm(prevForm => ({
          ...prevForm,
          sillasEspecificas: {
            ...prevForm.sillasEspecificas,
            [dia]: {
              activo: true,
              cantidad: valor
            }
          }
        }));
        return;
      }
      
      const nuevaCantidad = Math.max(0, Math.min(valor, getSillasDisponibles ? getSillasDisponibles(palcoSeleccionado, dia) : 10));
      console.log(`🔍 Nueva cantidad:`, nuevaCantidad);
      
      setForm(prevForm => {
        const newForm = {
          ...prevForm,
          sillasEspecificas: {
            ...prevForm.sillasEspecificas,
            [dia]: {
              ...prevForm.sillasEspecificas[dia],
              cantidad: nuevaCantidad,
              activo: nuevaCantidad > 0
            }
          }
        };
        console.log(`🔍 Nuevo formulario:`, newForm.sillasEspecificas[dia]);
        return newForm;
      });
    }
  };

  // Función local para activar/desactivar día (FALLBACK)
  const toggleDiaActivoLocal = (dia) => {
    console.log(`🔍 toggleDiaActivoLocal llamado para ${dia}`);
    console.log(`🔍 Estado actual:`, form.sillasEspecificas[dia]);
    
    // Si la función externa funciona, úsala
    if (toggleDiaActivo && typeof toggleDiaActivo === 'function') {
      console.log(`🔍 Usando función externa toggleDiaActivo`);
      toggleDiaActivo(dia);
    } else {
      // Fallback local si la función externa no funciona
      console.log(`🔍 Usando fallback local`);
      
      // Verificar que el día existe en sillasEspecificas
      if (!form.sillasEspecificas[dia]) {
        console.log(`🔍 Día ${dia} no existe, creándolo...`);
        setForm(prevForm => ({
          ...prevForm,
          sillasEspecificas: {
            ...prevForm.sillasEspecificas,
            [dia]: {
              activo: true,
              cantidad: 1
            }
          }
        }));
        return;
      }
      
      const nuevoEstado = !form.sillasEspecificas[dia].activo;
      console.log(`🔍 Nuevo estado:`, nuevoEstado);
      
      setForm(prevForm => {
        const newForm = {
          ...prevForm,
          sillasEspecificas: {
            ...prevForm.sillasEspecificas,
            [dia]: {
              ...prevForm.sillasEspecificas[dia],
              activo: nuevoEstado,
              cantidad: nuevoEstado ? 1 : 0
            }
          }
        };
        console.log(`🔍 Nuevo formulario:`, newForm.sillasEspecificas[dia]);
        return newForm;
      });
    }
  };

  if (!isOpen) return null;

  // Debug: mostrar estado completo del formulario
  console.log(`🔍 Estado completo del formulario:`, form.sillasEspecificas);

  return (
    <div className="modal-overlay-unified">
      <div className="modal-container-unified">
        
        {/* Header del modal - Estilo elegante con gradiente */}
        <div className="modal-header-unified">
          <h3>
            🏛️ Reservar Palco {palcoSeleccionado?.numero}
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
          
          {/* Información del palco */}
          {palcoSeleccionado?.tipo === 'completo' ? (
            <div className="info-palco-completo" style={{
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%)',
              padding: deviceInfo?.isMobile ? '15px' : '20px',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)',
              flexShrink: 0,
              marginTop: deviceInfo?.isMobile ? '10px' : '15px',
              marginBottom: deviceInfo?.isMobile ? '15px' : '20px',
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: deviceInfo?.isMobile ? '280px' : '350px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div className="precio-destacado" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                <div style={{ 
                  fontSize: deviceInfo?.isMobile ? '1.8rem' : '2.5rem', 
                  fontWeight: '900', 
                  marginBottom: '8px',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  ${PRECIO_PALCO_COMPLETO.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem', 
                  opacity: 0.9,
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  Palco completo (10 sillas, 3 días)
                </div>
              </div>
            </div>
          ) : (
            <div className="info-palco-sillas" style={{ flexShrink: 0 }}>
              <div className="selector-dias-cantidad" style={{ marginBottom: deviceInfo?.isMobile ? '15px' : '20px' }}>
                <h4 style={{ 
                  fontSize: deviceInfo?.isMobile ? '1.1rem' : '1.4rem', 
                  marginBottom: '15px',
                  color: '#2c3e50',
                  textAlign: 'center'
                }}>
                  📅 Selecciona días y cantidades:
                </h4>
                {DIAS.map(dia => {
                  const disponibles = getSillasDisponibles ? getSillasDisponibles(palcoSeleccionado, dia) : 10;
                  const config = form.sillasEspecificas[dia];
                  const cantidadActual = config ? config.cantidad : 0;
                  const isActivo = config ? config.activo : false;
                  
                  return (
                    <div key={dia} className="dia-selector" style={{
                      background: isActivo ? colors.creamBg : colors.white,
                      padding: deviceInfo?.isMobile ? '16px' : '20px',
                      borderRadius: '15px',
                      marginBottom: deviceInfo?.isMobile ? '12px' : '15px',
                      border: `3px solid ${isActivo ? colors.primaryGreen : colors.creamBg}`,
                      transition: 'all 0.3s ease',
                      boxShadow: isActivo ? `0 6px 20px ${colors.primaryGreen}40` : '0 3px 10px rgba(0,0,0,0.1)',
                      transform: isActivo ? 'scale(1.02)' : 'scale(1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleDiaActivoLocal(dia)}>
                      
                      {/* PRIMERA VISTA: Solo información del día y botón de selección */}
                      <div className="dia-info" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: isActivo ? '15px' : '0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Indicador visual de selección */}
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isActivo ? colors.primaryGreen : colors.creamBg,
                            border: `3px solid ${isActivo ? colors.darkBrown : colors.woodBrown}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}>
                            {isActivo && (
                              <span style={{ color: colors.white, fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                            )}
                          </div>
                          
                          <div>
                            <span className="dia-nombre" style={{ 
                              fontWeight: '700', 
                              color: colors.darkBrown,
                              fontSize: deviceInfo?.isMobile ? '1.1rem' : '1.3rem',
                              textTransform: 'capitalize'
                            }}>
                              {dia}
                            </span>
                            <div style={{ 
                              color: colors.primaryGreen, 
                              fontWeight: '600',
                              fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem',
                              marginTop: '2px'
                            }}>
                              ${PRECIO_SILLA[dia]?.toLocaleString() || '0'}/silla
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <span className="dia-disponibles" style={{ 
                            color: colors.woodBrown, 
                            fontSize: deviceInfo?.isMobile ? '0.8rem' : '1rem',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {disponibles} disponibles
                          </span>
                          
                          {/* Botón de selección */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDiaActivoLocal(dia);
                            }}
                            style={{
                              background: isActivo ? colors.primaryRed : colors.primaryGreen,
                              color: colors.white,
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: deviceInfo?.isMobile ? '0.8rem' : '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            {isActivo ? 'Deseleccionar' : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                      
                      {/* SEGUNDA VISTA: Controles de cantidad SOLO si está activo */}
                      {isActivo && (
                        <div className="cantidad-controls" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '15px',
                          padding: '15px',
                          background: `${colors.primaryGreen}20`,
                          borderRadius: '12px',
                          border: `2px solid ${colors.primaryGreen}50`,
                          animation: 'slideDown 0.3s ease-out'
                        }}>
                          <span style={{ 
                            color: colors.primaryGreen, 
                            fontWeight: '600',
                            fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                          }}>
                            Cantidad de sillas:
                          </span>
                          
                          <button
                            type="button"
                            className="btn-cantidad"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDiaEspecificoChangeLocal(dia, cantidadActual - 1);
                            }}
                            disabled={cantidadActual <= 0}
                            style={{
                              background: cantidadActual <= 0 ? colors.creamBg : colors.primaryGreen,
                              color: cantidadActual <= 0 ? colors.woodBrown : colors.white,
                              border: 'none',
                              width: deviceInfo?.isMobile ? '40px' : '45px',
                              height: deviceInfo?.isMobile ? '40px' : '45px',
                              borderRadius: '50%',
                              fontSize: deviceInfo?.isMobile ? '1.2rem' : '1.4rem',
                              fontWeight: 'bold',
                              cursor: cantidadActual <= 0 ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease',
                              opacity: cantidadActual <= 0 ? 0.5 : 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            title={cantidadActual <= 0 ? 'No se puede reducir más' : 'Reducir cantidad'}
                          >
                            −
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max={disponibles}
                            value={cantidadActual}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleDiaEspecificoChangeLocal(dia, parseInt(e.target.value) || 0);
                            }}
                            className="input-cantidad"
                            style={{
                              width: deviceInfo?.isMobile ? '60px' : '70px',
                              height: deviceInfo?.isMobile ? '40px' : '45px',
                              textAlign: 'center',
                              border: `3px solid ${colors.primaryGreen}`,
                              borderRadius: '10px',
                              fontSize: deviceInfo?.isMobile ? '1rem' : '1.1rem',
                              fontWeight: '700',
                              background: colors.white,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          
                          <button
                            type="button"
                            className="btn-cantidad"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDiaEspecificoChangeLocal(dia, cantidadActual + 1);
                            }}
                            disabled={cantidadActual >= disponibles}
                            style={{
                              background: cantidadActual >= disponibles ? colors.creamBg : colors.primaryGreen,
                              color: cantidadActual >= disponibles ? colors.woodBrown : colors.white,
                              border: 'none',
                              width: deviceInfo?.isMobile ? '40px' : '45px',
                              height: deviceInfo?.isMobile ? '40px' : '45px',
                              borderRadius: '50%',
                              fontSize: deviceInfo?.isMobile ? '1.2rem' : '1.4rem',
                              fontWeight: 'bold',
                              cursor: cantidadActual >= disponibles ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease',
                              opacity: cantidadActual >= disponibles ? 0.5 : 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            title={cantidadActual >= disponibles ? 'No hay más sillas disponibles' : 'Aumentar cantidad'}
                          >
                            +
                          </button>
                          
                          {/* Badge de cantidad seleccionada */}
                          <span className="cantidad-badge" style={{
                            background: colors.primaryGreen,
                            color: colors.white,
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: deviceInfo?.isMobile ? '0.8rem' : '0.9rem',
                            fontWeight: '700',
                            boxShadow: `0 2px 8px ${colors.primaryGreen}50`
                          }}>
                            {cantidadActual} silla{cantidadActual !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mostrar precio total para palcos por sillas */}
              {diasActivos.length > 0 && (
                <div className="precio-destacado" style={{
                  background: `linear-gradient(135deg, ${colors.primaryGreen} 0%, ${colors.primaryGold} 50%, ${colors.woodBrown} 100%)`,
                  padding: deviceInfo?.isMobile ? '15px' : '20px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  color: colors.white,
                  boxShadow: `0 4px 15px ${colors.primaryGreen}50`
                }}>
                  <div style={{ fontSize: deviceInfo?.isMobile ? '1.6rem' : '2.2rem', fontWeight: '900', marginBottom: '8px' }}>
                    ${calcularPrecioTotal().toLocaleString()}
                  </div>
                  <div style={{ fontSize: deviceInfo?.isMobile ? '0.8rem' : '1rem', opacity: 0.9 }}>
                    {diasActivos.map(dia => `${dia.dia}: ${dia.cantidad} silla(s)`).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Separador para crear espacio entre precio y formulario */}
          <div style={{
            height: deviceInfo?.isMobile ? '12px' : 
                     deviceInfo?.isTablet ? '14px' : '15px',
            width: '100%',
            background: 'transparent',
            flexShrink: 0
          }}></div>

          {/* Formulario de datos personales */}
          <div style={{
            background: '#f8f9fa',
            padding: deviceInfo?.isMobile ? '20px' : '25px',
            borderRadius: '0px',
            border: '2px solid #e9ecef',
            borderTop: 'none',
            flexShrink: 0,
            marginTop: deviceInfo?.isMobile ? '10px' : '15px'
          }}>
            <form onSubmit={(e) => { e.preventDefault(); handleProcederAPago(); }} className="form-cliente" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: deviceInfo?.isMobile ? '40px' : 
                   deviceInfo?.isTablet ? '42px' : '45px',
              flex: 1
            }}>
              <h4 style={{ 
                fontSize: deviceInfo?.isMobile ? '1.2rem' : '1.5rem', 
                color: colors.darkBrown,
                marginBottom: '10px',
                textAlign: 'center',
                flexShrink: 0
              }}>
                📝 Datos Personales
              </h4>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: colors.darkBrown,
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Nombre Completo *
                </label>
                <input 
                  type="text" 
                  required 
                  value={form.nombre} 
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className={formErrors.nombre ? 'error' : ''}
                  placeholder="Tu nombre completo"
                  style={{
                    padding: deviceInfo?.isMobile ? '12px' : '15px',
                    border: formErrors.nombre ? `2px solid ${colors.primaryRed}` : `2px solid ${colors.creamBg}`,
                    borderRadius: '10px',
                    fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                    transition: 'all 0.3s ease',
                    background: formErrors.nombre ? `${colors.primaryRed}10` : colors.white,
                    minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                  }}
                />
                {formErrors.nombre && (
                  <div className="error-message" style={{ 
                    color: colors.primaryRed, 
                    fontSize: deviceInfo?.isMobile ? '0.7rem' : '0.9rem',
                    marginTop: '5px'
                  }}>
                    ⚠️ {formErrors.nombre}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Cédula *
                </label>
                <input 
                  type="text" 
                  required 
                  value={form.cedula} 
                  onChange={e => setForm({ ...form, cedula: e.target.value })}
                  className={formErrors.cedula ? 'error' : ''}
                  placeholder="Número de cédula"
                  style={{
                    padding: deviceInfo?.isMobile ? '12px' : '15px',
                    border: formErrors.cedula ? '2px solid #e74c3c' : '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                    transition: 'all 0.3s ease',
                    background: formErrors.cedula ? 'rgba(231, 76, 60, 0.05)' : 'white',
                    minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                  }}
                />
                {formErrors.cedula && (
                  <div className="error-message" style={{ 
                    color: '#e74c3c', 
                    fontSize: deviceInfo?.isMobile ? '0.7rem' : '0.9rem',
                    marginTop: '5px'
                  }}>
                    ⚠️ {formErrors.cedula}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Teléfono *
                </label>
                <input 
                  type="tel" 
                  required 
                  value={form.telefono} 
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className={formErrors.telefono ? 'error' : ''}
                  placeholder="Número de teléfono"
                  style={{
                    padding: deviceInfo?.isMobile ? '12px' : '15px',
                    border: formErrors.telefono ? '2px solid #e74c3c' : '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                    transition: 'all 0.3s ease',
                    background: formErrors.telefono ? 'rgba(231, 76, 60, 0.05)' : 'white',
                    minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                  }}
                />
                {formErrors.telefono && (
                  <div className="error-message" style={{ 
                    color: '#e74c3c', 
                    fontSize: deviceInfo?.isMobile ? '0.7rem' : '0.9rem',
                    marginTop: '5px'
                  }}>
                    ⚠️ {formErrors.telefono}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Correo Electrónico *
                </label>
                <input 
                  type="email" 
                  required 
                  value={form.correo} 
                  onChange={e => setForm({ ...form, correo: e.target.value })}
                  className={formErrors.correo ? 'error' : ''}
                  placeholder="tu@correo.com"
                  style={{
                    padding: deviceInfo?.isMobile ? '12px' : '15px',
                    border: formErrors.correo ? '2px solid #e74c3c' : '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                    transition: 'all 0.3s ease',
                    background: formErrors.correo ? 'rgba(231, 76, 60, 0.05)' : 'white',
                    minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                  }}
                />
                {formErrors.correo && (
                  <div className="error-message" style={{ 
                    color: '#e74c3c', 
                    fontSize: deviceInfo?.isMobile ? '0.7rem' : '0.9rem',
                    marginTop: '5px'
                  }}>
                    ⚠️ {formErrors.correo}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <label style={{ 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Vendedor *
                </label>
                <input 
                  type="text" 
                  required 
                  value={form.vendedor} 
                  onChange={e => setForm({ ...form, vendedor: e.target.value })}
                  className={formErrors.vendedor ? 'error' : ''}
                  placeholder="Nombre del vendedor"
                  style={{
                    padding: deviceInfo?.isMobile ? '12px' : '15px',
                    border: formErrors.vendedor ? '2px solid #e74c3c' : '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                    transition: 'all 0.3s ease',
                    background: formErrors.vendedor ? 'rgba(231, 76, 60, 0.05)' : 'white',
                    minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                  }}
                />
                {formErrors.vendedor && (
                  <div className="error-message" style={{ 
                    color: '#e74c3c', 
                    fontSize: deviceInfo?.isMobile ? '0.7rem' : '0.9rem',
                    marginTop: '5px'
                  }}>
                    ⚠️ {formErrors.vendedor}
                  </div>
                )}
              </div>

              {/* Botones de acción - SIEMPRE VISIBLES */}
              <div className="modal-actions" style={{
                display: 'flex',
                gap: deviceInfo?.isMobile ? '12px' : '15px',
                marginTop: deviceInfo?.isMobile ? '15px' : '20px',
                flexShrink: 0,
                paddingBottom: deviceInfo?.isMobile ? '20px' : '0',
                position: deviceInfo?.isMobile ? 'relative' : 'static',
                bottom: deviceInfo?.isMobile ? '0' : 'auto'
              }}>
                <button 
                  type="button" 
                  className="btn btn-cancelar"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: deviceInfo?.isMobile ? '15px 12px' : '18px',
                    background: colors.woodBrown,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.6 : 1,
                    minHeight: deviceInfo?.isMobile ? '50px' : 'auto'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.background = colors.darkBrown)}
                  onMouseLeave={(e) => !loading && (e.target.style.background = colors.woodBrown)}
                >
                  ❌ Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-confirmar"
                  disabled={loading || (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0)}
                  style={{
                    flex: 1,
                    padding: deviceInfo?.isMobile ? '15px 12px' : '18px',
                    background: loading || (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0) ? colors.creamBg : `linear-gradient(135deg, ${colors.primaryGreen}, ${colors.primaryGold})`,
                    color: loading || (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0) ? colors.woodBrown : colors.white,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem',
                    fontWeight: '600',
                    cursor: loading || (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: loading || (palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0) ? 0.6 : 1,
                    minHeight: deviceInfo?.isMobile ? '50px' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !(palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0)) {
                      e.target.style.background = `linear-gradient(135deg, ${colors.primaryGold}, ${colors.primaryGreen})`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !(palcoSeleccionado?.tipo === 'sillas' && diasActivos.length === 0)) {
                      e.target.style.background = `linear-gradient(135deg, ${colors.primaryGreen}, ${colors.primaryGold})`;
                    }
                  }}
                >
                  {loading ? '🔄 Creando...' : '💳 Proceder al Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;

// 🎨 ESTILOS CSS PARA ANIMACIONES
const styles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      max-height: 200px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .dia-selector {
    animation: fadeIn 0.3s ease-out;
  }

  .cantidad-controls {
    animation: slideDown 0.3s ease-out;
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
