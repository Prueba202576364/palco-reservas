

// 🔥 SERVICIO DE PROCESAMIENTO DE IMÁGENES


class ImageService {
  constructor() {
    this.maxSize = 5 * 1024 * 1024; // 5MB
    this.supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  }

  // 📤 PROCESAR COMPROBANTE CON SUBIDA A DRIVE
  async procesarComprobante(file, pagoId, metadata = {}) {
    try {
      console.log('🔄 Procesando comprobante:', file.name);
      
      // Validar archivo
      this.validarArchivo(file);
      
      // Convertir a Base64
      const base64Data = await this.convertirABase64(file);
      
      // Generar nombre único
      const nombreArchivo = `comprobante_${pagoId}_${Date.now()}.${this.obtenerExtension(file.name)}`;
      
      // Metadata adicional
      const metadataCompleta = {
        ...metadata,
        pagoId: pagoId,
        fechaSubida: new Date().toISOString(),
        nombreOriginal: file.name,
        tamaño: file.size
      };
      

      
      return {
        data: base64Data,
        size: file.size,
        dimensions: await this.obtenerDimensiones(file),

        nombreArchivo: nombreArchivo
      };
      
    } catch (error) {
      console.error('❌ Error procesando comprobante:', error);
      throw error;
    }
  }

  // 📤 PROCESAR QR (MÉTODO FALTANTE)
  async procesarQR(file, tipo) {
    try {
      console.log(`🔄 Procesando QR ${tipo}:`, file.name);
      
      // Validar archivo
      this.validarArchivo(file);
      
      // Convertir a Base64
      const base64Data = await this.convertirABase64(file);
      
      // Obtener dimensiones
      const dimensions = await this.obtenerDimensiones(file);
      
      console.log(`✅ QR ${tipo} procesado exitosamente:`, {
        tamaño: this.formatearTamaño(file.size),
        dimensiones: dimensions
      });
      
      return {
        data: base64Data,
        size: file.size,
        dimensions: dimensions,
        tipo: tipo
      };
      
    } catch (error) {
      console.error(`❌ Error procesando QR ${tipo}:`, error);
      throw error;
    }
  }

  // 🔍 VALIDAR ARCHIVO
  validarArchivo(file) {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }
    
    if (!this.supportedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no soportado. Use JPG, PNG o WebP');
    }
    
    if (file.size > this.maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo ${this.formatearTamaño(this.maxSize)}`);
    }
  }

  // 🔄 CONVERTIR A BASE64
  async convertirABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 📏 OBTENER DIMENSIONES
  async obtenerDimensiones(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // 📁 OBTENER EXTENSIÓN
  obtenerExtension(nombreArchivo) {
    return nombreArchivo.split('.').pop().toLowerCase();
  }

  // 📊 FORMATEAR TAMAÑO
  formatearTamaño(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 🖼️ COMPRIMIR IMAGEN
  async comprimirImagen(file, calidad = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', calidad);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// Exportar instancia única
export const imageService = new ImageService();
export default imageService; 