

// 🔥 SERVICIO DE PROCESAMIENTO DE IMÁGENES


class ImageService {
  constructor() {
    this.maxSize = 8 * 1024 * 1024; // 8MB: por encima de esto se comprime automáticamente
    this.maxSizeAbsoluto = 20 * 1024 * 1024; // 20MB: ni comprimiendo se acepta (archivo sospechoso)
    this.supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  }

  // 📤 PROCESAR COMPROBANTE (con compresión automática si la foto pesa mucho)
  async procesarComprobante(file, pagoId) {
    try {
      console.log('🔄 Procesando comprobante:', file.name);

      // Validar tipo y tope absoluto de tamaño (esto sí es un error real,
      // no se puede arreglar comprimiendo)
      this.validarTipoArchivo(file);
      this.validarTamañoAbsoluto(file);

      // Si la foto pesa más de lo normal, comprimirla automáticamente en
      // vez de rechazarla (las fotos de celular actuales suelen pesar
      // varios MB y antes eso hacía fallar todo el envío del comprobante).
      let archivoParaSubir = file;
      if (file.size > this.maxSize) {
        console.log('📉 Imagen pesada, comprimiendo automáticamente...');
        archivoParaSubir = await this.comprimirImagen(file, 0.7);
        if (archivoParaSubir.size > this.maxSize) {
          archivoParaSubir = await this.comprimirImagen(file, 0.4);
        }
      }

      // Convertir a Base64
      const base64Data = await this.convertirABase64(archivoParaSubir);

      // Generar nombre único (usa el nombre original solo para la extensión)
      const nombreArchivo = `comprobante_${pagoId}_${Date.now()}.${this.obtenerExtension(file.name)}`;

      return {
        data: base64Data,
        size: archivoParaSubir.size,
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

  // 🔍 VALIDAR ARCHIVO (usado por QR: aquí el tamaño sí es un límite duro)
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

  // 🔍 VALIDAR TIPO (comprobantes: el tamaño se maneja aparte, comprimiendo)
  validarTipoArchivo(file) {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }
    if (!this.supportedTypes.includes(file.type)) {
      throw new Error('Formato no soportado (usa JPG, PNG o WebP; si es HEIC/iPhone, conviértela a JPG antes de subirla)');
    }
  }

  // 🔍 VALIDAR TAMAÑO ABSOLUTO (comprobantes: tope que ni comprimiendo se acepta)
  validarTamañoAbsoluto(file) {
    if (file.size > this.maxSizeAbsoluto) {
      throw new Error(`El archivo es demasiado grande (máximo ${this.formatearTamaño(this.maxSizeAbsoluto)})`);
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

  // 🖼️ COMPRIMIR IMAGEN (baja calidad y, si la foto es enorme, también el
  // tamaño en píxeles, para que fotos de celular de 10-15MB queden livianas)
  async comprimirImagen(file, calidad = 0.8, maxDimension = 1920) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const escala = maxDimension / Math.max(width, height);
          width = Math.round(width * escala);
          height = Math.round(height * escala);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error('No se pudo comprimir la imagen'));
        }, 'image/jpeg', calidad);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('No se pudo leer la imagen para comprimirla'));
      };

      img.src = objectUrl;
    });
  }
}

// Exportar instancia única
export const imageService = new ImageService();
export default imageService; 