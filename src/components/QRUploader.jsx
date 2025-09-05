import React, { useState, useEffect } from 'react';
import firebaseSyncService from '../services/firebaseSync';
import imageService from '../services/imageService';

const QRUploader = () => {
  const [qrNequi, setQrNequi] = useState('');
  const [qrDaviplata, setQrDaviplata] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar QR existente al montar el componente
  useEffect(() => {
    cargarQR();
  }, []);

  const cargarQR = async () => {
    try {
      const qrData = await firebaseSyncService.obtenerQR();
      setQrNequi(qrData.nequi || '');
      setQrDaviplata(qrData.daviplata || '');
    } catch (error) {
      console.error('Error cargando QR:', error);
    }
  };

                const handleFileUpload = async (event, tipo) => {
                const file = event.target.files[0];
                if (!file) return;

                try {
                  setLoading(true);
                  setMessage('');

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
                  await firebaseSyncService.sincronizarQR({
                    nequi: tipo === 'nequi' ? imagenQR.data : qrNequi,
                    daviplata: tipo === 'daviplata' ? imagenQR.data : qrDaviplata
                  });

                  // Sincronizar también con localStorage para las reservas
                  if (tipo === 'nequi') {
                    localStorage.setItem('qr_nequi', imagenQR.data);
                  } else {
                    localStorage.setItem('qr_daviplata', imagenQR.data);
                  }

                  setMessage(`✅ QR ${tipo} procesado y sincronizado exitosamente (${imageService.formatearTamaño(imagenQR.size)})`);
                  
                  // Limpiar mensaje después de 3 segundos
                  setTimeout(() => setMessage(''), 3000);

                } catch (error) {
                  console.error('Error procesando QR:', error);
                  setMessage(`❌ Error: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              };

                const eliminarQR = async (tipo) => {
                try {
                  setLoading(true);
                  setMessage('');

                  // Actualizar estado local
                  if (tipo === 'nequi') {
                    setQrNequi('');
                  } else {
                    setQrDaviplata('');
                  }

                  // Sincronizar con Firebase (eliminar)
                  await firebaseSyncService.sincronizarQR({
                    nequi: tipo === 'nequi' ? '' : qrNequi,
                    daviplata: tipo === 'daviplata' ? '' : qrDaviplata
                  });

                  // Eliminar también de localStorage
                  if (tipo === 'nequi') {
                    localStorage.removeItem('qr_nequi');
                  } else {
                    localStorage.removeItem('qr_daviplata');
                  }

                  setMessage(`✅ QR ${tipo} eliminado exitosamente`);
                  setTimeout(() => setMessage(''), 3000);

                } catch (error) {
                  console.error('Error eliminando QR:', error);
                  setMessage(`❌ Error: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '2px solid #e9ecef'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#495057',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        🖼️ Gestión de QR
      </h3>

      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* QR Nequi */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '2px solid #28a745',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#28a745',
            fontSize: '1.2rem'
          }}>
            💚 QR Nequi
          </h4>

          {qrNequi ? (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={qrNequi} 
                alt="QR Nequi" 
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  border: '2px solid #28a745',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => eliminarQR('nequi')}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #28a745',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                color: '#6c757d'
              }}>
                Sin QR
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'nequi')}
                disabled={loading}
                style={{ display: 'none' }}
                id="qr-nequi-input"
              />
              <label
                htmlFor="qr-nequi-input"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'inline-block'
                }}
              >
                📤 Subir QR Nequi
              </label>
            </div>
          )}
        </div>

        {/* QR Daviplata */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '2px solid #007bff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#007bff',
            fontSize: '1.2rem'
          }}>
            💙 QR Daviplata
          </h4>

          {qrDaviplata ? (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={qrDaviplata} 
                alt="QR Daviplata" 
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => eliminarQR('daviplata')}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #007bff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                color: '#6c757d'
              }}>
                Sin QR
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'daviplata')}
                disabled={loading}
                style={{ display: 'none' }}
                id="qr-daviplata-input"
              />
              <label
                htmlFor="qr-daviplata-input"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'inline-block'
                }}
              >
                📤 Subir QR Daviplata
              </label>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          color: '#1976d2'
        }}>
          ⏳ Procesando...
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        color: '#856404',
        fontSize: '14px'
      }}>
        <strong>💡 Información:</strong>
        <ul style={{ margin: '10px 0 0 20px', padding: 0 }}>
          <li>Los QR se sincronizan automáticamente con la app de comprador</li>
          <li>Formatos aceptados: JPG, PNG, WEBP (máximo 5MB)</li>
          <li>Las imágenes se comprimen automáticamente para optimizar el almacenamiento</li>
        </ul>
      </div>
    </div>
  );
};

export default QRUploader; 