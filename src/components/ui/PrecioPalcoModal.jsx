import React, { useState, useEffect } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const PrecioPalcoModal = ({
  isOpen,
  onClose,
  palcos,
  precioSugerido,
  onGuardarPrecioSugerido,
  onGuardarPrecios
}) => {
  const deviceInfo = useDeviceDetection();
  const [precioSugeridoInput, setPrecioSugeridoInput] = useState(precioSugerido || 0);
  const [preciosEditados, setPreciosEditados] = useState({});
  const [soloSinPrecio, setSoloSinPrecio] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setPrecioSugeridoInput(precioSugerido || 0);
      setPreciosEditados({});
      setMessage('');
    }
  }, [isOpen, precioSugerido]);

  if (!isOpen) return null;

  const palcosCompletos = (palcos || [])
    .filter(p => p.tipo === 'completo')
    .sort((a, b) => a.numero - b.numero);

  const palcosVisibles = soloSinPrecio
    ? palcosCompletos.filter(p => !p.precio)
    : palcosCompletos;

  const totalSinPrecio = palcosCompletos.filter(p => !p.precio).length;

  const getValorInput = (palco) => {
    if (preciosEditados[palco.numero] !== undefined) return preciosEditados[palco.numero];
    return palco.precio || '';
  };

  const handleCambiarInput = (numero, valor) => {
    setPreciosEditados(prev => ({ ...prev, [numero]: valor }));
  };

  const guardarPalco = (numero) => {
    const valor = Number(preciosEditados[numero]);
    if (!valor || valor <= 0) {
      setMessage(`❌ Ingresa un precio válido para el Palco ${numero}`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    onGuardarPrecios([{ numero, precio: valor }]);
    setPreciosEditados(prev => {
      const nuevo = { ...prev };
      delete nuevo[numero];
      return nuevo;
    });
  };

  const guardarPrecioSugerido = () => {
    const valor = Number(precioSugeridoInput);
    if (!valor || valor <= 0) {
      setMessage('❌ Ingresa un precio sugerido válido');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (onGuardarPrecioSugerido) onGuardarPrecioSugerido(valor);
    setMessage('✅ Precio sugerido guardado');
    setTimeout(() => setMessage(''), 2000);
  };

  const aplicarATodosSinPrecio = () => {
    const valor = Number(precioSugeridoInput);
    if (!valor || valor <= 0) {
      setMessage('❌ Ingresa un precio sugerido válido antes de aplicar');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const sinPrecio = palcosCompletos.filter(p => !p.precio);
    if (sinPrecio.length === 0) {
      setMessage('ℹ️ Todos los palcos completos ya tienen precio asignado');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    onGuardarPrecios(sinPrecio.map(p => ({ numero: p.numero, precio: valor })));
  };

  const badgeEstado = (palco) => {
    const estilos = {
      disponible: { bg: colors.primaryGreen, label: 'Disponible' },
      reservado: { bg: colors.primaryGold, label: 'Reservado' },
      vendido: { bg: colors.primaryRed, label: 'Vendido' }
    };
    const estilo = estilos[palco.estado] || estilos.disponible;
    return (
      <span style={{
        backgroundColor: estilo.bg,
        color: colors.white,
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '3px 8px',
        borderRadius: '10px',
        whiteSpace: 'nowrap'
      }}>
        {estilo.label}
      </span>
    );
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
      <div className="modal-cliente modal-precio-palco" style={{
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
          background: `linear-gradient(135deg, ${colors.primaryGold} 0%, ${colors.darkBrown} 50%, ${colors.woodBrown} 100%)`,
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
            💰 Precio por Palco Completo
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
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Separador */}
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${colors.primaryGold}, ${colors.primaryGreen}, ${colors.primaryRed})`,
          margin: 0,
          flexShrink: 0
        }}></div>

        {/* Body con scroll */}
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
              backgroundColor: message.includes('✅') ? colors.primaryGreen : message.includes('ℹ️') ? colors.primaryGold : colors.primaryRed,
              color: colors.white,
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          {/* Precio sugerido / aplicar en lote */}
          <div style={{
            backgroundColor: colors.creamBg,
            border: `3px solid ${colors.woodBrown}`,
            borderRadius: '16px',
            padding: '16px'
          }}>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.darkBrown, fontWeight: 'bold', fontSize: '15px' }}>
              Precio sugerido (para palcos que aún no tienen precio)
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="number"
                min="0"
                step="10000"
                value={precioSugeridoInput}
                onChange={(e) => setPrecioSugeridoInput(e.target.value)}
                style={{
                  flex: '1 1 160px',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: `2px solid ${colors.woodBrown}`,
                  borderRadius: '10px',
                  color: colors.darkBrown
                }}
              />
              <button
                onClick={guardarPrecioSugerido}
                style={{
                  backgroundColor: colors.woodBrown,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Guardar sugerido
              </button>
              <button
                onClick={aplicarATodosSinPrecio}
                style={{
                  backgroundColor: colors.primaryGreen,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Aplicar a los {totalSinPrecio} sin precio
              </button>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: colors.woodBrown }}>
              Esto no cambia el precio de los palcos que ya tienen uno asignado, solo rellena los que están vacíos.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.darkBrown, fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={soloSinPrecio}
              onChange={(e) => setSoloSinPrecio(e.target.checked)}
            />
            Mostrar solo palcos sin precio ({totalSinPrecio})
          </label>

          {/* Lista de palcos completos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {palcosVisibles.length === 0 && (
              <p style={{ textAlign: 'center', color: colors.woodBrown }}>No hay palcos que mostrar con este filtro.</p>
            )}
            {palcosVisibles.map(palco => {
              const sinPrecio = !palco.precio;
              return (
                <div key={palco.numero} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${sinPrecio ? colors.primaryRed : colors.primaryGreen}`,
                  backgroundColor: colors.white,
                  flexWrap: 'wrap'
                }}>
                  <strong style={{ color: colors.darkBrown, minWidth: '90px' }}>Palco {palco.numero}</strong>
                  {badgeEstado(palco)}
                  {sinPrecio && (
                    <span style={{ color: colors.primaryRed, fontSize: '12px', fontWeight: 'bold' }}>
                      ⚠️ Sin precio asignado
                    </span>
                  )}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      placeholder="Precio COP"
                      value={getValorInput(palco)}
                      onChange={(e) => handleCambiarInput(palco.numero, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        border: `2px solid ${colors.woodBrown}`,
                        borderRadius: '8px',
                        color: colors.darkBrown
                      }}
                    />
                    <button
                      onClick={() => guardarPalco(palco.numero)}
                      style={{
                        backgroundColor: colors.primaryGreen,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      💾 Guardar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            backgroundColor: colors.white,
            border: `2px dashed ${colors.primaryGold}`,
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '12px',
            color: colors.woodBrown
          }}>
            ℹ️ Cada palco completo tiene su propio precio. Mientras un palco no tenga precio asignado, no se podrá vender (aparecerá bloqueado al intentar reservarlo). Cambiar el precio de un palco no modifica ventas ya registradas, solo aplica a reservas nuevas.
          </div>
        </div>

        {/* Footer */}
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

export default PrecioPalcoModal;
