// Utilidades para exportar datos a CSV (compatible con Google Sheets)

// Convertir array de objetos a CSV
const convertirACSV = (datos, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = datos.map(item => 
    headers.map(header => {
      const value = item[header.toLowerCase()] || item[header] || '';
      // Escapar comillas y envolver en comillas si contiene coma
      return value.toString().includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Exportar palcos a CSV
export const exportarPalcosACSV = (palcos) => {
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

  const datos = palcos.map(palco => ({
    'Número': palco.numero,
    'Tipo': palco.tipo,
    'Estado': palco.estado,
    'Vendedor': palco.vendedor || '',
    'Cliente': palco.cliente || '',
    'Fecha Reserva': palco.fechaReserva || '',
    'Precio': palco.precio || '',
    'Observaciones': palco.observaciones || ''
  }));

  return convertirACSV(datos, headers);
};

// Exportar pagos a CSV
export const exportarPagosACSV = (pagos) => {
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

  const datos = pagos.map(pago => ({
    'ID': pago.id,
    'Palco': pago.palcoNumero,
    'Cliente': pago.cliente,
    'Monto': pago.monto,
    'Método': pago.metodoPago,
    'Estado': pago.estado,
    'Fecha': pago.fecha,
    'Comprobante': pago.comprobante || ''
  }));

  return convertirACSV(datos, headers);
};

// Exportar estadísticas a CSV
export const exportarEstadisticasACSV = (stats) => {
  const headers = ['Métrica', 'Valor'];
  
  const datos = [
    { 'Métrica': 'Fecha', 'Valor': new Date().toLocaleDateString() },
    { 'Métrica': 'Total Palcos', 'Valor': stats.totalPalcos },
    { 'Métrica': 'Disponibles', 'Valor': stats.disponibles },
    { 'Métrica': 'Reservados', 'Valor': stats.reservados },
    { 'Métrica': 'Vendidos', 'Valor': stats.vendidos },
    { 'Métrica': 'Ingresos Totales', 'Valor': `$${stats.ingresosTotales.toLocaleString()}` },
    { 'Métrica': 'Pagos Pendientes', 'Valor': stats.pagosPendientes },
    { 'Métrica': 'Palcos Completos', 'Valor': stats.palcosCompletos },
    { 'Métrica': 'Palcos por Sillas', 'Valor': stats.palcosSillas }
  ];

  return convertirACSV(datos, headers);
};

// Descargar archivo CSV
export const descargarCSV = (contenido, nombreArchivo) => {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Exportar todo a archivos separados
export const exportarTodoACSV = (palcos, pagos, estadisticas) => {
  const palcosCSV = exportarPalcosACSV(palcos);
  const pagosCSV = exportarPagosACSV(pagos);
  const statsCSV = exportarEstadisticasACSV(estadisticas);

  descargarCSV(palcosCSV, 'palcos_export');
  descargarCSV(pagosCSV, 'pagos_export');
  descargarCSV(statsCSV, 'estadisticas_export');
};

// Función para copiar al portapapeles (para pegar directamente en Google Sheets)
export const copiarACSV = (contenido) => {
  navigator.clipboard.writeText(contenido).then(() => {
    console.log('✅ CSV copiado al portapapeles');
    alert('CSV copiado al portapapeles. Puedes pegarlo directamente en Google Sheets.');
  }).catch(err => {
    console.error('❌ Error copiando al portapapeles:', err);
    alert('Error copiando al portapapeles. Usa la descarga manual.');
  });
}; 