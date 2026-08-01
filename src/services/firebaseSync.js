import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 🔥 SERVICIO DE SINCRONIZACIÓN FIREBASE PARA APP VENDEDOR
// Maneja la sincronización de datos con la app cliente

class FirebaseSyncService {
  constructor() {
    this.palcosRef = doc(db, 'feria', 'palcos');
    this.pagosRef = collection(db, 'pagosPendientes');
    this.reservasRef = collection(db, 'reservas');
    this.configRef = doc(db, 'feria', 'configuracion');
    this.statsRef = doc(db, 'feria', 'estadisticas');
    this.historicoRef = collection(db, 'historico');
    this.backupsRef = collection(db, 'backups');
  }

  // 📊 SINCRONIZAR PALCOS CON FIREBASE
  async sincronizarPalcos(palcos) {
    try {
      await setDoc(this.palcosRef, {
        palcos: palcos,
        ultimaActualizacion: serverTimestamp(),
        appOrigen: 'vendedor'
      });
      console.log('✅ Palcos sincronizados con Firebase');
    } catch (error) {
      console.error('❌ Error sincronizando palcos:', error);
      throw error;
    }
  }

  // 💳 SINCRONIZAR PAGOS PENDIENTES
  async sincronizarPagosPendientes(pagosPendientes) {
    try {
      // Primero, limpiar pagos existentes de la app vendedor
      const q = query(
        this.pagosRef,
        where('appOrigen', '==', 'vendedor')
      );
      const querySnapshot = await getDocs(q);
      
      // Eliminar pagos existentes
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Agregar pagos actuales usando el ID específico
      const addPromises = pagosPendientes.map(pago => {
        const pagoRef = doc(this.pagosRef, pago.id);
        return setDoc(pagoRef, {
          ...pago,
          timestamp: serverTimestamp(),
          appOrigen: 'vendedor'
        });
      });
      await Promise.all(addPromises);

      console.log('✅ Pagos pendientes sincronizados con Firebase');
    } catch (error) {
      console.error('❌ Error sincronizando pagos:', error);
      throw error;
    }
  }

  // 📋 SINCRONIZAR RESERVAS
  async sincronizarReservas(reservas) {
    try {
      // Limpiar reservas existentes de la app vendedor
      const q = query(
        this.reservasRef,
        where('appOrigen', '==', 'vendedor')
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Agregar reservas actuales
      const addPromises = reservas.map(reserva => 
        addDoc(this.reservasRef, {
          ...reserva,
          timestamp: serverTimestamp(),
          appOrigen: 'vendedor'
        })
      );
      await Promise.all(addPromises);

      console.log('✅ Reservas sincronizadas con Firebase');
    } catch (error) {
      console.error('❌ Error sincronizando reservas:', error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR INGRESOS ESPECÍFICOS DE FIREBASE (por el campo "id" del ingreso,
  // no el id del documento). Antes esto no existía: limpiar duplicados solo
  // borraba la copia local y, como sincronizarIngresosEntreApps() se ejecuta
  // cada 30s trayendo TODO lo que haya en Firebase, los duplicados "borrados"
  // volvían a aparecer siempre.
  async eliminarIngresosPorId(ids) {
    if (!ids || ids.length === 0) return;
    try {
      const ingresosRef = collection(db, 'ingresos');
      for (const id of ids) {
        const q = query(ingresosRef, where('id', '==', id));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }
      console.log(`✅ ${ids.length} ingreso(s) eliminado(s) de Firebase`);
    } catch (error) {
      console.error('❌ Error eliminando ingresos de Firebase:', error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR TODOS LOS INGRESOS (para "Resetear Todo")
  async eliminarTodosLosIngresos() {
    try {
      const ingresosRef = collection(db, 'ingresos');
      const querySnapshot = await getDocs(ingresosRef);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log(`✅ ${querySnapshot.size} ingreso(s) eliminado(s) de Firebase (reset completo)`);
    } catch (error) {
      console.error('❌ Error eliminando todos los ingresos:', error);
      throw error;
    }
  }

  // 🗑️ ELIMINAR TODO EL HISTÓRICO COMPARTIDO (para "Resetear Todo")
  async eliminarTodoElHistorico() {
    try {
      const querySnapshot = await getDocs(this.historicoRef);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log(`✅ ${querySnapshot.size} registro(s) de histórico eliminado(s) de Firebase`);
    } catch (error) {
      console.error('❌ Error eliminando histórico de Firebase:', error);
      throw error;
    }
  }

  // 🏦 SINCRONIZAR INGRESOS CONTABLES
  async sincronizarIngresos(ingresos) {
    try {
      console.log('🔄 Iniciando sincronización de ingresos...');
      
      // Crear referencia a la colección de ingresos
      const ingresosRef = collection(db, 'ingresos');
      
      // Procesar cada ingreso
      for (const ingreso of ingresos) {
        try {
          // Verificar si ya existe
          const q = query(
            ingresosRef,
            where('id', '==', ingreso.id)
          );
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Agregar nuevo ingreso
            await addDoc(ingresosRef, {
              ...ingreso,
              timestamp: serverTimestamp(),
              appOrigen: ingreso.detalles?.appOrigen || 'palco-reservas',
              sincronizado: true,
              fechaSincronizacion: serverTimestamp()
            });
            console.log(`✅ Ingreso ${ingreso.id} sincronizado`);
          } else {
            // Actualizar ingreso existente
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
              ...ingreso,
              ultimaActualizacion: serverTimestamp(),
              sincronizado: true,
              fechaSincronizacion: serverTimestamp()
            });
            console.log(`✅ Ingreso ${ingreso.id} actualizado`);
          }
        } catch (error) {
          console.error(`❌ Error sincronizando ingreso ${ingreso.id}:`, error);
        }
      }
      
      console.log('✅ Sincronización de ingresos completada');
    } catch (error) {
      console.error('❌ Error en sincronización de ingresos:', error);
      throw error;
    }
  }

  // 🔍 OBTENER INGRESOS DESDE FIREBASE
  async obtenerIngresos() {
    try {
      console.log('🔄 Obteniendo ingresos desde Firebase...');
      
      const ingresosRef = collection(db, 'ingresos');
      const q = query(
        ingresosRef,
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const ingresos = [];
      
      querySnapshot.forEach((doc) => {
        const ingreso = doc.data();
        ingresos.push({
          ...ingreso,
          id: doc.id,
          timestamp: ingreso.timestamp?.toDate?.() || ingreso.timestamp
        });
      });
      
      console.log(`✅ ${ingresos.length} ingresos obtenidos desde Firebase`);
      return ingresos;
    } catch (error) {
      console.error('❌ Error obteniendo ingresos:', error);
      return [];
    }
  }

  // 🔍 OBTENER RESERVA POR ID
  async getReservaById(reservaId) {
    try {
      console.log('🔍 Buscando reserva con ID:', reservaId);
      
      // Buscar en la colección de reservas
      const q = query(
        this.reservasRef,
        where('id', '==', reservaId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const reservaDoc = querySnapshot.docs[0];
        const reservaData = reservaDoc.data();
        console.log('✅ Reserva encontrada:', reservaData);
        return reservaData;
      } else {
        console.log('❌ No se encontró reserva con ID:', reservaId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo reserva por ID:', error);
      throw error;
    }
  }

  // 🆕 NUEVO: OBTENER RESERVAS DEL CLIENTE
  async getReservasCliente() {
    try {
      const q = query(
        this.reservasRef,
        where('appOrigen', '==', 'cliente'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reservas = [];
      
      querySnapshot.forEach((doc) => {
        reservas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reservas;
    } catch (error) {
      console.error('❌ Error obteniendo reservas del cliente:', error);
      throw error;
    }
  }

  // 🆕 NUEVO: CONFIRMAR RESERVA DEL CLIENTE
  async confirmarReservaCliente(reservaId, vendedorConfirmador) {
    try {
      const reservaRef = doc(this.reservasRef, reservaId);
      await updateDoc(reservaRef, {
        estado: 'confirmada',
        confirmadoPorVendedor: true,
        vendedorConfirmador: vendedorConfirmador,
        timestampConfirmacion: serverTimestamp()
      });
      console.log('✅ Reserva del cliente confirmada:', reservaId);
    } catch (error) {
      console.error('❌ Error confirmando reserva del cliente:', error);
      throw error;
    }
  }

  // 🆕 NUEVO: RECHAZAR RESERVA DEL CLIENTE
  async rechazarReservaCliente(reservaId, motivo, vendedorRechazador) {
    try {
      const reservaRef = doc(this.reservasRef, reservaId);
      await updateDoc(reservaRef, {
        estado: 'rechazada',
        confirmadoPorVendedor: false,
        vendedorRechazador: vendedorRechazador,
        motivoRechazo: motivo,
        timestampRechazo: serverTimestamp()
      });
      console.log('❌ Reserva del cliente rechazada:', reservaId);
    } catch (error) {
      console.error('❌ Error rechazando reserva del cliente:', error);
      throw error;
    }
  }

  // ✅ RESOLVER PAGO DEL VENDEDOR (marca aprobado/rechazado en Firebase para
  // que deje de aparecer como "pendiente" en cualquier sesión que lo escuche).
  // Antes esto solo se quitaba de la lista local del navegador y el documento
  // en Firebase se quedaba para siempre como pendiente, pudiendo reaparecer
  // y aprobarse dos veces.
  async resolverPagoVendedor(pagoId, aprobado, vendedorResolutor, motivoRechazo = '') {
    try {
      const pagoRef = doc(this.pagosRef, pagoId);
      // setDoc con merge (no updateDoc): si por alguna razón el documento no
      // se había sincronizado todavía, esto lo crea en vez de fallar con
      // "No document to update".
      await setDoc(pagoRef, {
        estado: aprobado ? 'aprobado' : 'rechazado',
        resueltoPorVendedor: vendedorResolutor,
        motivoRechazo: aprobado ? '' : motivoRechazo,
        timestampResolucion: serverTimestamp()
      }, { merge: true });
      console.log(`✅ Pago del vendedor ${aprobado ? 'aprobado' : 'rechazado'} en Firebase:`, pagoId);
    } catch (error) {
      console.error('❌ Error resolviendo pago del vendedor:', error);
      throw error;
    }
  }

  // 💳 AGREGAR UN PAGO PENDIENTE NUEVO (sin tocar los demás). Antes, cuando
  // se enviaba un comprobante, solo se guardaba en el estado local del
  // navegador y NUNCA se subía a Firebase — así que ningún otro vendedor o
  // administrador en otro dispositivo podía verlo ni verificarlo.
  async agregarPagoPendiente(pago) {
    try {
      const pagoRef = doc(this.pagosRef, pago.id);
      await setDoc(pagoRef, {
        ...pago,
        timestamp: serverTimestamp(),
        appOrigen: 'vendedor'
      });
      console.log('✅ Pago pendiente sincronizado con Firebase:', pago.id);
    } catch (error) {
      console.error('❌ Error sincronizando pago pendiente:', error);
      throw error;
    }
  }

  // 📜 AGREGAR REGISTRO AL HISTÓRICO COMPARTIDO (colección, solo se agrega,
  // nunca se edita ni se borra). Antes el histórico vivía únicamente en el
  // localStorage de cada navegador, así que cada vendedor solo veía sus
  // propias operaciones y un admin en otro dispositivo no veía nada.
  async agregarHistorico(registro) {
    try {
      await addDoc(this.historicoRef, {
        ...registro,
        timestampServidor: serverTimestamp()
      });
      console.log('✅ Registro agregado al histórico compartido');
    } catch (error) {
      console.error('❌ Error agregando registro al histórico:', error);
      throw error;
    }
  }

  // 🔄 ESCUCHAR EL HISTÓRICO COMPLETO EN TIEMPO REAL (el filtrado de
  // "solo lo mío" vs "todo" para vendedores/admins se sigue haciendo en la app)
  onHistoricoChange(callback) {
    const q = query(this.historicoRef, orderBy('timestampServidor', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const registros = [];
      querySnapshot.forEach((doc) => {
        registros.push({ id: doc.id, ...doc.data() });
      });
      callback(registros);
    }, (error) => {
      console.error('❌ Error escuchando histórico:', error);
    });
  }

  // 💾 CREAR BACKUP: snapshot completo con fecha, guardado en Firebase (no
  // en localStorage) para que sea real y compartido entre dispositivos.
  async crearBackup({ palcos, ingresos, historico, pagosPendientes, creadoPor }) {
    try {
      const docRef = await addDoc(this.backupsRef, {
        palcos: palcos || [],
        ingresos: ingresos || [],
        historico: historico || [],
        pagosPendientes: pagosPendientes || [],
        creadoPor: creadoPor || 'Sistema (automático)',
        fecha: serverTimestamp(),
        fechaLocal: new Date().toLocaleString('es-CO'),
        resumen: {
          totalPalcos: (palcos || []).length,
          palcosOcupados: (palcos || []).filter(p => p.estado === 'vendido' || p.estado === 'reservado').length,
          totalIngresos: (ingresos || []).length,
          totalHistorico: (historico || []).length,
          pagosPendientes: (pagosPendientes || []).length
        }
      });
      console.log('✅ Backup creado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  // 📥 OBTENER LOS ÚLTIMOS BACKUPS (más reciente primero)
  async obtenerBackups(cantidad = 5) {
    try {
      const q = query(this.backupsRef, orderBy('fecha', 'desc'), limit(cantidad));
      const querySnapshot = await getDocs(q);
      const backups = [];
      querySnapshot.forEach((doc) => backups.push({ id: doc.id, ...doc.data() }));
      return backups;
    } catch (error) {
      console.error('❌ Error obteniendo backups:', error);
      return [];
    }
  }

  // 🧹 BORRAR BACKUPS VIEJOS, dejando solo los N más recientes (para que la
  // colección no crezca sin límite durante los 3 días del evento)
  async limpiarBackupsAntiguos(dejar = 20) {
    try {
      const q = query(this.backupsRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      const docsViejos = querySnapshot.docs.slice(dejar);
      const deletePromises = docsViejos.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      if (docsViejos.length > 0) {
        console.log(`✅ ${docsViejos.length} backup(s) antiguo(s) eliminado(s)`);
      }
    } catch (error) {
      console.error('❌ Error limpiando backups antiguos:', error);
    }
  }

  // 🔀 RESTAURAR HISTÓRICO DESDE UN BACKUP: fusiona, nunca borra registros
  // que ya existan (para no perder operaciones nuevas hechas después del backup)
  async restaurarHistoricoDesdeBackup(historicoBackup) {
    try {
      const snapshot = await getDocs(this.historicoRef);
      const existentes = new Set();
      snapshot.forEach((doc) => {
        const data = doc.data();
        existentes.add(`${data.accion}|${data.palco}|${data.cedula}|${data.vendedor}|${data._clienteTimestamp}`);
      });

      const faltantes = (historicoBackup || []).filter(h =>
        !existentes.has(`${h.accion}|${h.palco}|${h.cedula}|${h.vendedor}|${h._clienteTimestamp}`)
      );

      for (const registro of faltantes) {
        await addDoc(this.historicoRef, {
          ...registro,
          timestampServidor: serverTimestamp(),
          restauradoDesdeBackup: true
        });
      }

      console.log(`✅ ${faltantes.length} registro(s) de histórico restaurados desde backup`);
      return faltantes.length;
    } catch (error) {
      console.error('❌ Error restaurando histórico desde backup:', error);
      throw error;
    }
  }

  // 🆕 NUEVO: ESCUCHAR RESERVAS DEL CLIENTE EN TIEMPO REAL
  onReservasClienteChange(callback) {
    const q = query(
      this.reservasRef,
      where('appOrigen', '==', 'cliente'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const reservas = [];
      querySnapshot.forEach((doc) => {
        reservas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(reservas);
    }, (error) => {
      console.error('❌ Error escuchando reservas del cliente:', error);
    });
  }

  // ⚙️ SINCRONIZAR CONFIGURACIÓN (QR, precios, etc.)
  async sincronizarConfiguracion(config) {
    try {
      await setDoc(this.configRef, {
        ...config,
        ultimaActualizacion: serverTimestamp(),
        appOrigen: 'vendedor'
      });
      console.log('✅ Configuración sincronizada con Firebase');
    } catch (error) {
      console.error('❌ Error sincronizando configuración:', error);
      throw error;
    }
  }

  // 📥 OBTENER CONFIGURACIÓN (QR, precios, etc.)
  async obtenerConfiguracion() {
    try {
      const configDoc = await getDoc(this.configRef);
      if (configDoc.exists()) {
        return configDoc.data();
      }
      return {};
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return {};
    }
  }

  // 🖼️ SINCRONIZAR IMÁGENES QR (Base64)
  async sincronizarQR(qrData) {
    try {
      await setDoc(doc(db, 'feria', 'qr'), {
        nequi: qrData.nequi || '',
        daviplata: qrData.daviplata || '',
        ultimaActualizacion: serverTimestamp(),
        appOrigen: 'vendedor',
        formato: 'base64'
      });
      console.log('✅ QR sincronizado con Firebase (Base64)');
    } catch (error) {
      console.error('❌ Error sincronizando QR:', error);
      throw error;
    }
  }

  // 📥 OBTENER PALCOS DESDE FIREBASE
  async obtenerPalcos() {
    try {
      const palcosDoc = await getDoc(this.palcosRef);
      if (palcosDoc.exists()) {
        const data = palcosDoc.data();
        return data.palcos || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo palcos desde Firebase:', error);
      throw error;
    }
  }

  // 📥 OBTENER QR DESDE FIREBASE
  async obtenerQR() {
    try {
      const qrDoc = await getDoc(doc(db, 'feria', 'qr'));
      if (qrDoc.exists()) {
        return qrDoc.data();
      }
      return { nequi: '', daviplata: '' };
    } catch (error) {
      console.error('❌ Error obteniendo QR:', error);
      return { nequi: '', daviplata: '' };
    }
  }

  // 📊 SINCRONIZAR ESTADÍSTICAS
  async sincronizarEstadisticas(estadisticas) {
    try {
      await setDoc(this.statsRef, {
        ...estadisticas,
        ultimaActualizacion: serverTimestamp(),
        appOrigen: 'vendedor'
      });
      console.log('✅ Estadísticas sincronizadas con Firebase');
    } catch (error) {
      console.error('❌ Error sincronizando estadísticas:', error);
      throw error;
    }
  }

  // 🔍 ESCUCHAR PAGOS PENDIENTES DE LA APP CLIENTE
  onPagosClienteChange(callback) {
    console.log('🔍 Configurando listener para pagos del cliente...');
    const q = query(
      this.pagosRef,
      where('appOrigen', '==', 'cliente'),
      where('estado', '==', 'pendiente_verificacion'),
      orderBy('timestamp', 'desc')
    );

    console.log('🔍 Query configurada:', q);

    return onSnapshot(q, (querySnapshot) => {
      console.log('🔄 Snapshot recibido, documentos:', querySnapshot.size);
      const pagos = [];
      querySnapshot.forEach((doc) => {
        console.log('📄 Documento encontrado:', doc.id, doc.data());
        pagos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log('📊 Total de pagos pendientes del cliente:', pagos.length);
      callback(pagos);
    }, (error) => {
      console.error('❌ Error escuchando pagos del cliente:', error);
    });
  }

  // 🆕 NUEVO: ESCUCHAR PAGOS PENDIENTES DE LA APP VENDEDOR
  onPagosVendedorChange(callback) {
    console.log('🔍 Configurando listener para pagos del vendedor...');
    const q = query(
      this.pagosRef,
      where('appOrigen', '==', 'vendedor'), // ← SOLO pagos del vendedor
      where('estado', '==', 'pendiente_verificacion'),
      orderBy('timestamp', 'desc')
    );

    console.log('🔍 Query configurada para pagos del vendedor:', q);

    return onSnapshot(q, (querySnapshot) => {
      console.log('🔄 Snapshot recibido para pagos del vendedor, documentos:', querySnapshot.size);
      const pagos = [];
      querySnapshot.forEach((doc) => {
        console.log('📄 Documento encontrado (vendedor):', doc.id, doc.data());
        pagos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log('📊 Total de pagos pendientes del vendedor:', pagos.length);
      callback(pagos);
    }, (error) => {
      console.error('❌ Error escuchando pagos del vendedor:', error);
    });
  }

  // ✅ ACTUALIZAR ESTADO DE PAGO
  async actualizarEstadoPago(pagoId, nuevoEstado, observacionesVendedor = '') {
    try {
      const pagoRef = doc(this.pagosRef, pagoId);
      
      // Verificar si el documento existe antes de actualizarlo
      const pagoDoc = await getDoc(pagoRef);
      if (!pagoDoc.exists()) {
        console.warn('⚠️ Documento de pago no existe en Firebase:', pagoId);
        console.log('🔄 Intentando sincronizar pagos pendientes...');
        
        // Intentar sincronizar los pagos pendientes desde el estado local
        // Esto se manejará desde App.jsx
        throw new Error('Documento no encontrado en Firebase');
      }
      
      await updateDoc(pagoRef, {
        estado: nuevoEstado,
        observacionesVendedor: observacionesVendedor,
        fechaVerificacion: serverTimestamp(),
        verificadoPor: 'vendedor'
      });
      console.log('✅ Estado de pago actualizado:', pagoId);
    } catch (error) {
      console.error('❌ Error actualizando estado de pago:', error);
      throw error;
    }
  }

  // 📊 OBTENER TODOS LOS PAGOS PENDIENTES
  async getPagosPendientes() {
    try {
      const querySnapshot = await getDocs(this.pagosRef);
      const pagos = [];
      querySnapshot.forEach((doc) => {
        pagos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return pagos;
    } catch (error) {
      console.error('Error obteniendo pagos pendientes:', error);
      throw error;
    }
  }

  // 📊 OBTENER TODAS LAS RESERVAS
  async getReservas() {
    try {
      const querySnapshot = await getDocs(this.reservasRef);
      const reservas = [];
      querySnapshot.forEach((doc) => {
        reservas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return reservas;
    } catch (error) {
      console.error('Error obteniendo reservas:', error);
      throw error;
    }
  }

  // 🔄 ESCUCHAR CAMBIOS EN PALCOS
  onPalcosChange(callback) {
    return onSnapshot(this.palcosRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('🔄 Cambios detectados en palcos desde Firebase');
        callback(data);
      } else {
        console.log('📄 Documento de palcos no existe');
        callback(null);
      }
    }, (error) => {
      console.error('❌ Error escuchando cambios en palcos:', error);
    });
  }

  // 🔄 SINCRONIZACIÓN COMPLETA
  async sincronizacionCompleta(palcos, pagosPendientes, reservas, configuracion, estadisticas) {
    try {
      console.log('🔄 Iniciando sincronización completa...');
      
      await Promise.all([
        this.sincronizarPalcos(palcos),
        this.sincronizarPagosPendientes(pagosPendientes),
        this.sincronizarReservas(reservas),
        this.sincronizarConfiguracion(configuracion),
        this.sincronizarEstadisticas(estadisticas)
      ]);

      console.log('✅ Sincronización completa exitosa');
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      throw error;
    }
  }

  // 🧹 LIMPIAR TODOS LOS DATOS DEL CLIENTE
  async limpiarDatosCliente() {
    try {
      console.log('🧹 Limpiando datos del cliente en Firebase...');
      
      // Limpiar pagos del cliente
      const qPagos = query(
        this.pagosRef,
        where('appOrigen', '==', 'cliente')
      );
      const querySnapshotPagos = await getDocs(qPagos);
      const deletePromisesPagos = querySnapshotPagos.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromisesPagos);
      
      // Limpiar reservas del cliente
      const qReservas = query(
        this.reservasRef,
        where('appOrigen', '==', 'cliente')
      );
      const querySnapshotReservas = await getDocs(qReservas);
      const deletePromisesReservas = querySnapshotReservas.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromisesReservas);
      
      console.log('✅ Datos del cliente limpiados en Firebase');
    } catch (error) {
      console.error('❌ Error limpiando datos del cliente:', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const firebaseSyncService = new FirebaseSyncService();
export default firebaseSyncService; 