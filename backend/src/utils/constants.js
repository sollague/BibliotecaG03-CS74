export const ESTADOS_ACTIVOS = ['APROBADO', 'PRESTADO', 'RENOVADO'];

export const ESTADOS_TERMINALES = [
  'DEVUELTO',
  'DEVUELTO_CON_RETRASO',
  'CANCELADO',
  'PERDIDO',
];

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

export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  BIBLIOTECARIO: 'BIBLIOTECARIO',
  CLIENTE: 'CLIENTE',
};

// Días de anticipación con los que un préstamo se muestra "Por vencer".
// Decisión aprobada del proyecto (el SRS no define el valor).
export const DIAS_POR_VENCER = 3;
