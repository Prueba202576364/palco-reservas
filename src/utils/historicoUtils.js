// Categorías reales de acciones que la app registra en el histórico.
// Antes el filtro y los colores solo reconocían 4 textos exactos ('Reserva',
// 'Cancelación', 'Movimiento', 'Edición'), pero la app en realidad registra
// muchos más (ej. 'Reserva Creada (Pendiente de Pago)', 'Pago Rechazado',
// 'confirmar_reserva_cliente'...) que caían todos en el estilo genérico y no
// se podían filtrar. Esto agrupa cada acción real en una categoría visible.

export const CATEGORIAS_ACCION = {
  ventas: {
    label: 'Ventas y confirmaciones',
    color: '#16A34A',
    icon: '✅',
    valores: ['Reserva', 'Pago Verificado y Venta Confirmada', 'confirmar_reserva_cliente']
  },
  pendientes: {
    label: 'Pendientes de pago',
    color: '#D97706',
    icon: '🕐',
    valores: ['Reserva Creada (Pendiente de Pago)', 'Comprobante Enviado']
  },
  rechazos: {
    label: 'Rechazos y cancelaciones',
    color: '#C4302B',
    icon: '❌',
    valores: ['Cancelación', 'Pago Rechazado', 'rechazar_reserva_cliente']
  },
  movimientos: {
    label: 'Movimientos de palco',
    color: '#D97706',
    icon: '🔄',
    valores: ['Movimiento']
  },
  ediciones: {
    label: 'Ediciones',
    color: '#8B4513',
    icon: '✏️',
    valores: ['Edición']
  }
};

const COLOR_DEFECTO = '#451A03';

export const getCategoriaAccion = (accion) => {
  return Object.values(CATEGORIAS_ACCION).find(cat => cat.valores.includes(accion)) || null;
};

export const getAccionColor = (accion) => getCategoriaAccion(accion)?.color || COLOR_DEFECTO;

export const getAccionIcon = (accion) => getCategoriaAccion(accion)?.icon || '📋';

// true si `accion` pertenece a la categoría `categoriaKey` (o si categoriaKey es 'todas')
export const accionPerteneceACategoria = (accion, categoriaKey) => {
  if (!categoriaKey || categoriaKey === 'todas') return true;
  return CATEGORIAS_ACCION[categoriaKey]?.valores.includes(accion) || false;
};
