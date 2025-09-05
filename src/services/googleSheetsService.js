// Servicio para exportar datos a Google Sheets
class GoogleSheetsService {
  constructor() {
    this.SPREADSHEET_ID = ''; // ID de tu Google Sheet
    this.API_KEY = ''; // Tu API Key de Google
  }

  // Configurar credenciales
  configurar(spreadsheetId, apiKey) {
    this.SPREADSHEET_ID = spreadsheetId;
    this.API_KEY = apiKey;
  }

  // Exportar palcos
  async exportarPalcos(palcos) {
    try {
      const values = palcos.map(palco => [
        palco.numero,
        palco.tipo,
        palco.estado,
        palco.vendedor || '',
        palco.cliente || '',
        palco.fechaReserva || '',
        palco.precio || '',
        palco.observaciones || ''
      ]);

      const headers = [
        'Número',
        'Tipo',
        'Estado',
        'Vendedor',
        'Cliente',
        'Fecha Reserva',
        'Precio',
        'Observaciones'
      ];

      await this.actualizarHoja('Palcos', [headers, ...values]);
      console.log('✅ Palcos exportados a Google Sheets');
    } catch (error) {
      console.error('❌ Error exportando palcos:', error);
      throw error;
    }
  }

  // Exportar pagos pendientes
  async exportarPagosPendientes(pagos) {
    try {
      const values = pagos.map(pago => [
        pago.id,
        pago.palcoNumero,
        pago.cliente,
        pago.monto,
        pago.metodoPago,
        pago.estado,
        pago.fecha,
        pago.comprobante || ''
      ]);

      const headers = [
        'ID',
        'Palco',
        'Cliente',
        'Monto',
        'Método',
        'Estado',
        'Fecha',
        'Comprobante'
      ];

      await this.actualizarHoja('Pagos', [headers, ...values]);
      console.log('✅ Pagos exportados a Google Sheets');
    } catch (error) {
      console.error('❌ Error exportando pagos:', error);
      throw error;
    }
  }

  // Exportar estadísticas
  async exportarEstadisticas(stats) {
    try {
      const values = [
        ['Fecha', new Date().toLocaleDateString()],
        ['Total Palcos', stats.totalPalcos],
        ['Disponibles', stats.disponibles],
        ['Reservados', stats.reservados],
        ['Vendidos', stats.vendidos],
        ['Ingresos Totales', `$${stats.ingresosTotales.toLocaleString()}`],
        ['Pagos Pendientes', stats.pagosPendientes],
        ['Palcos Completos', stats.palcosCompletos],
        ['Palcos por Sillas', stats.palcosSillas]
      ];

      await this.actualizarHoja('Estadísticas', values);
      console.log('✅ Estadísticas exportadas a Google Sheets');
    } catch (error) {
      console.error('❌ Error exportando estadísticas:', error);
      throw error;
    }
  }

  // Actualizar hoja específica
  async actualizarHoja(nombreHoja, valores) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${nombreHoja}?valueInputOption=RAW&key=${this.API_KEY}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: valores
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  }

  // Crear nueva hoja
  async crearHoja(nombreHoja) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}:batchUpdate?key=${this.API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          addSheet: {
            properties: {
              title: nombreHoja
            }
          }
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  }

  // Exportar todo
  async exportarTodo(palcos, pagos, estadisticas) {
    try {
      await Promise.all([
        this.exportarPalcos(palcos),
        this.exportarPagosPendientes(pagos),
        this.exportarEstadisticas(estadisticas)
      ]);
      
      console.log('✅ Todos los datos exportados exitosamente');
    } catch (error) {
      console.error('❌ Error en exportación completa:', error);
      throw error;
    }
  }
}

export default new GoogleSheetsService(); 