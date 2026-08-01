// Utilidades para exportar toda la información del sistema a un solo archivo Excel (.xlsx)
import * as XLSX from 'xlsx';

const DIAS_EXPORT = ['viernes', 'sabado', 'domingo'];

const formatearDias = (dias) => {
  if (Array.isArray(dias)) return dias.join(', ');
  return dias || '';
};

// 💰 Hoja: ventas confirmadas (de `ingresos`, tipo === 'venta')
const construirHojaVentas = (ingresos) => {
  const ventas = ingresos.filter(i => i.tipo === 'venta');
  return ventas.map(v => ({
    'Fecha': v.fechaLocal || v.fecha || '',
    'Vendedor': v.detalles?.vendedor || '',
    'Cliente': v.detalles?.nombre || '',
    'Cédula': v.detalles?.cedula || '',
    'Palco': v.detalles?.palco || '',
    'Cantidad': v.detalles?.cantidad || '',
    'Días': formatearDias(v.detalles?.dias),
    'Método de Pago': v.detalles?.metodoPago || '',
    'Monto': v.monto || 0
  }));
};

// 🔴 Hoja: cancelaciones/devoluciones
const construirHojaCancelaciones = (ingresos) => {
  const cancelaciones = ingresos.filter(i => i.tipo === 'cancelacion');
  return cancelaciones.map(c => ({
    'Fecha': c.fechaLocal || c.fecha || '',
    'Vendedor': c.detalles?.vendedor || '',
    'Cliente': c.detalles?.nombre || '',
    'Cédula': c.detalles?.cedula || '',
    'Palco': c.detalles?.palco || '',
    'Días': formatearDias(c.detalles?.dias),
    'Monto Devuelto': Math.abs(c.monto || 0)
  }));
};

// 🏛️ Hoja: resumen de palcos (1 fila por palco)
const construirHojaPalcosResumen = (palcos) => {
  return palcos.map(p => {
    let ocupacionResumen = '';
    if (p.tipo === 'completo') {
      ocupacionResumen = p.estado === 'vendido' ? '10/10 sillas' : (p.estado === 'reservado' ? 'Reservado' : '0/10 sillas');
    } else {
      const totalOcupadas = DIAS_EXPORT.reduce((sum, dia) => {
        const reservasDia = p.reservas?.[dia] || [];
        return sum + reservasDia.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);
      }, 0);
      ocupacionResumen = `${totalOcupadas} sillas ocupadas (3 días)`;
    }
    return {
      'Número': p.numero,
      'Tipo': p.tipo === 'completo' ? 'Completo' : 'Por sillas',
      'Estado': p.estado || (p.tipo === 'sillas' ? 'Ver detalle' : ''),
      'Precio': p.tipo === 'completo' ? (p.precio || 'Sin asignar') : '',
      'Ocupación': ocupacionResumen
    };
  });
};

// 🎫 Hoja: detalle de cada reserva individual (cliente por cliente, día por día)
const construirHojaReservasDetalle = (palcos) => {
  const filas = [];
  palcos.forEach(p => {
    if (p.tipo === 'completo') {
      const reserva = Array.isArray(p.reservas) ? p.reservas[0] : null;
      if (reserva) {
        filas.push({
          'Palco': p.numero,
          'Tipo': 'Completo',
          'Día': 'Todos (3 días)',
          'Cliente': reserva.nombre || '',
          'Cédula': reserva.cedula || '',
          'Teléfono': reserva.telefono || '',
          'Vendedor': reserva.vendedor || '',
          'Cantidad': 10
        });
      }
    } else {
      DIAS_EXPORT.forEach(dia => {
        const reservasDia = p.reservas?.[dia] || [];
        reservasDia.forEach(r => {
          filas.push({
            'Palco': p.numero,
            'Tipo': 'Por sillas',
            'Día': dia.charAt(0).toUpperCase() + dia.slice(1),
            'Cliente': r.nombre || '',
            'Cédula': r.cedula || '',
            'Teléfono': r.telefono || '',
            'Vendedor': r.vendedor || '',
            'Cantidad': r.cantidad || 1
          });
        });
      });
    }
  });
  return filas;
};

// 📜 Hoja: histórico de operaciones
const construirHojaHistorico = (historico) => {
  return historico.map(h => ({
    'Fecha': h.fecha || '',
    'Acción': h.accion || '',
    'Detalles': h.detalles || '',
    'Cédula': h.cedula || '',
    'Cliente': h.nombreCliente || '',
    'Vendedor': h.vendedor || '',
    'Palco': h.palco || '',
    'Cantidad': h.cantidad || '',
    'Días': formatearDias(h.dias)
  }));
};

// 👤 Hoja: resumen por vendedor
const construirHojaPorVendedor = (estadisticasPorVendedor) => {
  return Object.entries(estadisticasPorVendedor).map(([vendedor, datos]) => ({
    'Vendedor': vendedor,
    'Ventas ($)': datos.ventas,
    'Cancelaciones ($)': datos.cancelaciones,
    'Ingreso Neto ($)': datos.ingresoNeto,
    'Número de Operaciones': datos.numeroOperaciones
  }));
};

// 📊 Hoja: resumen general (usa los nombres de campo reales de calcularEstadisticas())
const construirHojaResumenGeneral = (stats) => {
  const filas = [
    { 'Métrica': 'Fecha de exportación', 'Valor': new Date().toLocaleString('es-CO') },
    { 'Métrica': 'Total de palcos', 'Valor': stats.totalPalcos },
    { 'Métrica': 'Palcos ocupados', 'Valor': stats.palcosOcupados },
    { 'Métrica': 'Palcos disponibles', 'Valor': stats.palcosDisponibles },
    { 'Métrica': '% Ocupación', 'Valor': `${stats.porcentajeOcupacion}%` },
    { 'Métrica': 'Palcos completos (total)', 'Valor': stats.palcosCompletos },
    { 'Métrica': 'Palcos completos ocupados', 'Valor': stats.palcosCompletosOcupados },
    { 'Métrica': 'Palcos por sillas (total)', 'Valor': stats.palcosSillas },
    { 'Métrica': 'Palcos por sillas ocupados', 'Valor': stats.palcosSillasOcupados },
    { 'Métrica': 'Total sillas del sistema', 'Valor': stats.totalSillasSistema },
    { 'Métrica': 'Ingreso total ($)', 'Valor': stats.ingresoTotal },
    { 'Métrica': 'Total ventas ($)', 'Valor': stats.ventasTotal },
    { 'Métrica': 'Total cancelaciones ($)', 'Valor': stats.cancelacionesTotal },
    { 'Métrica': 'Número de ventas', 'Valor': stats.numeroVentas },
    { 'Métrica': 'Número de cancelaciones', 'Valor': stats.numeroCancelaciones }
  ];

  DIAS_EXPORT.forEach(dia => {
    const o = stats.ocupacionPorDia?.[dia];
    if (o) {
      filas.push({ 'Métrica': `Ocupación ${dia} (sillas ocupadas/total)`, 'Valor': `${o.ocupadas}/${o.total} (${o.porcentaje}%)` });
    }
  });

  return filas;
};

// 🗂️ Construye y descarga el archivo Excel completo con todas las hojas
export const exportarTodoAExcel = ({ palcos, ingresos, historico, estadisticas, estadisticasPorVendedor }) => {
  const wb = XLSX.utils.book_new();

  const hojas = [
    ['Resumen General', construirHojaResumenGeneral(estadisticas)],
    ['Ventas Confirmadas', construirHojaVentas(ingresos)],
    ['Cancelaciones', construirHojaCancelaciones(ingresos)],
    ['Por Vendedor', construirHojaPorVendedor(estadisticasPorVendedor)],
    ['Palcos - Resumen', construirHojaPalcosResumen(palcos)],
    ['Reservas - Detalle', construirHojaReservasDetalle(palcos)],
    ['Histórico de Operaciones', construirHojaHistorico(historico)]
  ];

  hojas.forEach(([nombre, datos]) => {
    const ws = XLSX.utils.json_to_sheet(datos.length > 0 ? datos : [{ 'Info': 'Sin registros' }]);
    XLSX.utils.book_append_sheet(wb, ws, nombre.substring(0, 31)); // Excel limita el nombre de hoja a 31 caracteres
  });

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `feria_expoequinos_export_${fechaArchivo}.xlsx`);
};
