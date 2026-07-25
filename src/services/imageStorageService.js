import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from '../firebaseConfig';

// 📸 SERVICIO DE ALMACENAMIENTO DE IMÁGENES
// Maneja la subida, descarga y eliminación de imágenes

class ImageStorageService {
  constructor() {
    this.comprobantesRef = ref(storage, 'comprobantes');
    this.qrRef = ref(storage, 'qr');
  }

  // 📤 SUBIR COMPROBANTE DE PAGO
  async subirComprobante(file, pagoId) {
    try {
      console.log('🔄 Subiendo comprobante:', file.name);
      
      // Crear referencia única
      const comprobanteRef = ref(this.comprobantesRef, `pago_${pagoId}_${Date.now()}`);
      
      // Subir archivo
      const snapshot = await uploadBytes(comprobanteRef, file);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Comprobante subido exitosamente:', downloadURL);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
      throw error;
    }
  }

  // 📤 SUBIR QR
  async subirQR(file, tipo) {
    try {
      console.log(`🔄 Subiendo QR ${tipo}:`, file.name);
      
      // Crear referencia única
      const qrRef = ref(this.qrRef, `${tipo}_${Date.now()}`);
      
      // Subir archivo
      const snapshot = await uploadBytes(qrRef, file);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`✅ QR ${tipo} subido exitosamente:`, downloadURL);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
    } catch (error) {
      console.error(`❌ Error subiendo QR ${tipo}:`, error);
      throw error;
    }
  }

  // 📥 DESCARGAR IMAGEN
  async descargarImagen(path) {
    try {
      const imageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('❌ Error descargando imagen:', error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR IMAGEN
  async eliminarImagen(path) {
    try {
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      console.log('✅ Imagen eliminada exitosamente:', path);
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      throw error;
    }
  }

  // 📋 LISTAR COMPROBANTES
  async listarComprobantes() {
    try {
      const result = await listAll(this.comprobantesRef);
      const comprobantes = [];
      
      for (const itemRef of result.items) {
        const downloadURL = await getDownloadURL(itemRef);
        comprobantes.push({
          name: itemRef.name,
          url: downloadURL,
          path: itemRef.fullPath
        });
      }
      
      return comprobantes;
    } catch (error) {
      console.error('❌ Error listando comprobantes:', error);
      throw error;
    }
  }

  // 📋 LISTAR QR
  async listarQR() {
    try {
      const result = await listAll(this.qrRef);
      const qrImages = [];
      
      for (const itemRef of result.items) {
        const downloadURL = await getDownloadURL(itemRef);
        qrImages.push({
          name: itemRef.name,
          url: downloadURL,
          path: itemRef.fullPath
        });
      }
      
      return qrImages;
    } catch (error) {
      console.error('❌ Error listando QR:', error);
      throw error;
    }
  }

  // 🧹 LIMPIAR COMPROBANTES ANTIGUOS
  async limpiarComprobantesAntiguos(diasAntiguedad = 30) {
    try {
      const result = await listAll(this.comprobantesRef);
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
      
      let eliminados = 0;
      
      for (const itemRef of result.items) {
        const metadata = await itemRef.getMetadata();
        const fechaCreacion = new Date(metadata.timeCreated);
        
        if (fechaCreacion < fechaLimite) {
          await deleteObject(itemRef);
          eliminados++;
        }
      }
      
      console.log(`✅ ${eliminados} comprobantes antiguos eliminados`);
      return eliminados;
    } catch (error) {
      console.error('❌ Error limpiando comprobantes antiguos:', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const imageStorageService = new ImageStorageService();
export default imageStorageService;









