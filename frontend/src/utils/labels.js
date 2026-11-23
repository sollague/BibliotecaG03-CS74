export const ETIQUETAS_ESTADO = {
  SOLICITADO: 'Solicitado',
  APROBADO: 'Aprobado',
  PRESTADO: 'Prestado',
  POR_VENCER: 'Por vencer',
  RENOVADO: 'Renovado',
  VENCIDO: 'Vencido',
  DEVUELTO: 'Devuelto',
  DEVUELTO_CON_RETRASO: 'Devuelto con retraso',
  CANCELADO: 'Cancelado',
  PERDIDO: 'Perdido',
};

export const ETIQUETAS_ROL = {
  ADMINISTRADOR: 'Administrador',
  BIBLIOTECARIO: 'Bibliotecario',
  CLIENTE: 'Cliente',
};

export const ETIQUETAS_TIPO_CLIENTE = {
  LECTOR_GENERAL: 'Lector general',
  ESTUDIANTE: 'Estudiante',
  BECARIO: 'Becario',
  INSTITUCION_EDUCATIVA: 'Institución educativa',
};

export const ETIQUETAS_CONDICION = {
  BUENO: 'Buen estado',
  DANADO: 'Dañado',
  PERDIDO: 'Perdido',
};

export const ETIQUETAS_SOLICITUD_TIPO = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
};

export const ESTADOS_PRESTAMO = Object.keys(ETIQUETAS_ESTADO);

export function nombreCompleto(persona) {
  if (!persona) return '—';
  return `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim() || '—';
}

export function formatearFecha(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(valor));
}

export function formatearFechaHora(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor));
}

export function iniciales(persona) {
  if (!persona) return '?';
  return `${persona.nombres?.[0] ?? ''}${persona.apellidos?.[0] ?? ''}`.toUpperCase();
}
