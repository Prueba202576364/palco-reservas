import { useState } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const PaymentModal = ({
  isOpen,
  onClose,
  reservaParaPago,
  pagoData,
  setPagoData,
  handleEnviarComprobante,
  loading,
  METODOS_PAGO,
  qrData,
  handleImagenComprobante,
  handleCargarQR,
  user
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const deviceInfo = useDeviceDetection();

  // Función para seleccionar método de pago
  const handleMethodSelect = (methodKey) => {
    setSelectedMethod(methodKey);
    setPagoData({ ...pagoData, metodoPago: methodKey });
  };

  // Función para obtener método seleccionado
  const getSelectedMethod = () => {
    return METODOS_PAGO[selectedMethod] || null;
  };

  // Función para renderizar instrucciones de pago
  const renderPaymentInstructions = () => {
    const metodo = getSelectedMethod();
    if (!metodo) return null;

    let qrImage = null;
    if (metodo.tieneQR) {
      if (metodo.metodoKey === 'nequi') {
        qrImage = qrData?.nequi;
      } else if (metodo.metodoKey === 'daviplata') {
        qrImage = qrData?.daviplata;
      } else if (metodo.metodoKey === 'bancolombia') {
        qrImage = qrData?.bancolombia;
      }
    }

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          {metodo.icono} Instrucciones para {metodo.nombre}
        </h4>
        
        {/* Información del método */}
        {metodo.numero && (
          <div className="mb-4">
            <strong className="text-blue-700">Número:</strong> 
            <span className="ml-2 bg-white px-3 py-2 rounded-lg font-mono text-lg border border-blue-300">
              {metodo.numero}
            </span>
          </div>
        )}
        
        {metodo.banco && (
          <div className="mb-4 space-y-2">
            <div><strong className="text-blue-700">Banco:</strong> {metodo.banco}</div>
            <div><strong className="text-blue-700">Cuenta:</strong> {metodo.cuenta}</div>
            <div><strong className="text-blue-700">Titular:</strong> {metodo.titular}</div>
          </div>
        )}
        
        <p className="text-blue-600 mb-4">
          📋 {metodo.instrucciones}
        </p>
        
        {/* Código QR */}
        {metodo.tieneQR && (
          <div className="bg-white rounded-xl border border-blue-300 p-6 text-center">
            <h5 className="text-lg font-bold text-blue-800 mb-4">
              📱 Código QR de {metodo.nombre}
            </h5>
            
            {qrImage ? (
              <div className="flex justify-center mb-4">
                <img 
                  src={qrImage} 
                  alt={`Código QR ${metodo.nombre}`}
                  className="w-48 h-48 border-4 border-blue-500 rounded-2xl shadow-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 border-2 border-dashed border-blue-400 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center bg-gray-50">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-sm text-gray-600 text-center">
                  Cargar QR de {metodo.nombre}
                </div>
              </div>
            )}
            
            {/* Información del teléfono */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Teléfono:</strong> {metodo.telefono || 'No disponible'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-unified">
      <div className="modal-container-unified">
        
        {/* Header del modal - Estilo elegante con gradiente */}
        <div className="modal-header-unified">
          <h3>
            💳 Realizar Pago
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
          
          {/* Resumen de la reserva */}
          {reservaParaPago && (
            <div className="resumen-pago" style={{
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%)',
              padding: deviceInfo?.isMobile ? '15px' : '20px',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)',
              flexShrink: 0,
              marginBottom: deviceInfo?.isMobile ? '15px' : '20px'
            }}>
              <h4 style={{ 
                fontSize: deviceInfo?.isMobile ? '1.2rem' : '1.5rem', 
                marginBottom: '15px',
                fontWeight: '700'
              }}>
                📋 Resumen de tu reserva:
              </h4>
              <div className="info-pago" style={{
                display: 'grid',
                gridTemplateColumns: deviceInfo?.isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                textAlign: 'left'
              }}>
                <div><strong>Palco:</strong> {reservaParaPago.palco}</div>
                <div><strong>Cliente:</strong> {reservaParaPago.nombre}</div>
                <div><strong>Cantidad:</strong> {reservaParaPago.cantidad}</div>
                <div><strong>Días:</strong> {reservaParaPago.dias}</div>
                <div className="total-pago" style={{
                  gridColumn: deviceInfo?.isMobile ? '1' : '1 / -1',
                  textAlign: 'center',
                  fontSize: deviceInfo?.isMobile ? '1.1rem' : '1.3rem',
                  fontWeight: '700',
                  marginTop: '10px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}>
                  <strong>Total a pagar: ${reservaParaPago.monto?.toLocaleString() || '0'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de pago */}
          <form onSubmit={handleEnviarComprobante} style={{
            background: '#f8f9fa',
            padding: deviceInfo?.isMobile ? '20px' : '25px',
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            flexShrink: 0
          }}>
            
            {/* Métodos de pago */}
            <div className="metodos-pago" style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontSize: deviceInfo?.isMobile ? '1.1rem' : '1.3rem', 
                marginBottom: '15px',
                color: '#2c3e50',
                textAlign: 'center'
              }}>
                🏦 Selecciona tu método de pago:
              </h4>
              <div className="grid-metodos" style={{
                display: 'grid',
                gridTemplateColumns: deviceInfo?.isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(METODOS_PAGO || {}).map(([key, metodo]) => (
                  <div
                    key={key}
                    className={`metodo-opcion ${pagoData.metodoPago === key ? 'seleccionado' : ''}`}
                    onClick={() => handleMethodSelect(key)}
                    style={{
                      background: pagoData.metodoPago === key ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : '#fff',
                      color: pagoData.metodoPago === key ? 'white' : '#2c3e50',
                      padding: '15px',
                      borderRadius: '12px',
                      border: `2px solid ${pagoData.metodoPago === key ? '#27ae60' : '#e9ecef'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      transform: pagoData.metodoPago === key ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: pagoData.metodoPago === key ? '0 4px 15px rgba(39, 174, 96, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (pagoData.metodoPago !== key) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagoData.metodoPago !== key) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <div className="metodo-icono" style={{ fontSize: '2rem', marginBottom: '8px' }}>
                      {metodo.icono}
                    </div>
                    <div className="metodo-nombre" style={{ 
                      fontWeight: '600',
                      fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                    }}>
                      {metodo.nombre}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrucciones del método seleccionado */}
            {selectedMethod && renderPaymentInstructions()}

            {/* Campos del formulario */}
            {pagoData.metodoPago && (
              <>
                {/* Número de comprobante */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                  }}>
                    Número de Comprobante / Referencia (Opcional si subes imagen)
                  </label>
                  <input
                    type="text"
                    value={pagoData.numeroComprobante || ''}
                    onChange={e => setPagoData({ ...pagoData, numeroComprobante: e.target.value })}
                    placeholder="Ej: 123456789 o últimos 4 dígitos"
                    style={{
                      width: '100%',
                      padding: deviceInfo?.isMobile ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                    }}
                  />
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    💡 Puedes subir solo la imagen del comprobante o solo el número
                  </div>
                </div>

                {/* Subir comprobante */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                  }}>
                    Subir Comprobante (Imagen) - Recomendado
                  </label>
                  
                  <div
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (file && handleImagenComprobante) {
                          handleImagenComprobante(file);
                        }
                      };
                      input.click();
                    }}
                    style={{
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f9f9f9',
                      marginBottom: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3498db';
                      e.target.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#ccc';
                      e.target.style.backgroundColor = '#f9f9f9';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
                    <div style={{ color: '#666' }}>Haz clic para subir comprobante</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      PNG, JPG hasta 5MB
                    </div>
                    {pagoData.imagenComprobante && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '0.8rem',
                        color: '#27ae60',
                        fontWeight: '600'
                      }}>
                        📸 Archivo seleccionado: {pagoData.imagenComprobante.name}
                      </div>
                    )}
                  </div>
                  
                  {/* Preview de imagen */}
                  {pagoData.imagenComprobantePreview && (
                    <div className="preview-imagen" style={{
                      marginTop: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={pagoData.imagenComprobantePreview} 
                        alt="Preview comprobante"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef'
                        }}
                      />
                      <div style={{
                        marginTop: '8px',
                        fontSize: '0.8rem',
                        color: '#27ae60',
                        fontWeight: '600'
                      }}>
                        ✅ Imagen cargada correctamente
                      </div>
                    </div>
                  )}
                </div>

                {/* Monto enviado */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                  }}>
                    Monto que enviaste *
                  </label>
                  <input
                    type="number"
                    required
                    value={pagoData.montoEnviado || ''}
                    onChange={e => setPagoData({ ...pagoData, montoEnviado: e.target.value })}
                    min="0"
                    step="1000"
                    placeholder="Cantidad en pesos"
                    style={{
                      width: '100%',
                      padding: deviceInfo?.isMobile ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      minHeight: deviceInfo?.isMobile ? '45px' : 'auto'
                    }}
                  />
                  {pagoData.montoEnviado && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '0.8rem',
                      color: '#27ae60',
                      fontStyle: 'italic'
                    }}>
                      💡 Monto pre-llenado según tu reserva. Puedes modificarlo si es necesario.
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    fontSize: deviceInfo?.isMobile ? '0.9rem' : '1rem'
                  }}>
                    Observaciones (Opcional)
                  </label>
                  <textarea
                    value={pagoData.observacionesCliente || ''}
                    onChange={e => setPagoData({ ...pagoData, observacionesCliente: e.target.value })}
                    rows="2"
                    placeholder="Información adicional sobre el pago..."
                    style={{
                      width: '100%',
                      padding: deviceInfo?.isMobile ? '12px' : '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: deviceInfo?.isMobile ? '16px' : '1rem',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      resize: 'vertical',
                      minHeight: deviceInfo?.isMobile ? '60px' : 'auto'
                    }}
                  />
                </div>
              </>
            )}

            {/* Botones de acción */}
            <div className="modal-actions" style={{
              display: 'flex',
              gap: deviceInfo?.isMobile ? '12px' : '15px',
              marginTop: '20px',
              flexShrink: 0
            }}>
              <button 
                type="button" 
                className="btn btn-cancelar"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: deviceInfo?.isMobile ? '15px 12px' : '18px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.6 : 1,
                  minHeight: deviceInfo?.isMobile ? '50px' : 'auto'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#5a6268')}
                onMouseLeave={(e) => !loading && (e.target.style.background = '#6c757d')}
              >
                ❌ Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-confirmar"
                disabled={!pagoData.metodoPago || loading}
                style={{
                  flex: 1,
                  padding: deviceInfo?.isMobile ? '15px 12px' : '18px',
                  background: !pagoData.metodoPago || loading ? '#e9ecef' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: !pagoData.metodoPago || loading ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: deviceInfo?.isMobile ? '0.9rem' : '1.1rem',
                  fontWeight: '600',
                  cursor: !pagoData.metodoPago || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: !pagoData.metodoPago || loading ? 0.6 : 1,
                  minHeight: deviceInfo?.isMobile ? '50px' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (pagoData.metodoPago && !loading) {
                    e.target.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagoData.metodoPago && !loading) {
                    e.target.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                  }
                }}
              >
                {loading ? '🔄 Enviando...' : '📤 Enviar Comprobante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;


