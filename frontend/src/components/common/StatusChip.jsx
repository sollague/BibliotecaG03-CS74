import Chip from '@mui/material/Chip';
import {
  ETIQUETAS_CONDICION,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ROL,
  ETIQUETAS_SOLICITUD_TIPO,
  ETIQUETAS_TIPO_CLIENTE,
} from '../../utils/labels.js';

const ESTILOS = {
  default: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
    borderColor: '#E5E7EB',
  },
  primary: {
    backgroundColor: 'primary.light',
    color: 'primary.dark',
    borderColor: 'primary.main',
  },
  secondary: {
    backgroundColor: 'secondary.light',
    color: 'secondary.dark',
    borderColor: 'secondary.main',
  },
  success: {
    backgroundColor: 'success.light',
    color: 'success.dark',
    borderColor: 'success.main',
  },
  warning: {
    backgroundColor: 'warning.light',
    color: 'warning.dark',
    borderColor: 'warning.main',
  },
  error: {
    backgroundColor: 'error.light',
    color: 'error.dark',
    borderColor: 'error.main',
  },
  info: {
    backgroundColor: 'info.light',
    color: 'info.dark',
    borderColor: 'info.main',
  },
};

const COLORES_ESTADO = {
  SOLICITADO: 'info',
  APROBADO: 'primary',
  PRESTADO: 'secondary',
  POR_VENCER: 'warning',
  RENOVADO: 'info',
  VENCIDO: 'error',
  DEVUELTO: 'success',
  DEVUELTO_CON_RETRASO: 'warning',
  CANCELADO: 'default',
  PERDIDO: 'error',
};

const COLORES_CONDICION = {
  BUENO: 'success',
  DANADO: 'warning',
  PERDIDO: 'error',
};

const COLORES_ROL = {
  ADMINISTRADOR: 'primary',
  BIBLIOTECARIO: 'info',
  CLIENTE: 'default',
};

const COLORES_SOLICITUD_TIPO = {
  PENDIENTE: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'error',
  CANCELADA: 'default',
};

function ChipSuave({ color = 'default', etiqueta }) {
  return (
    <Chip
      size="small"
      label={etiqueta}
      variant="outlined"
      sx={{
        ...ESTILOS[color],
        borderWidth: 1,
        '& .MuiChip-label': { px: 1.25, py: 0.25 },
      }}
    />
  );
}

export function ChipEstadoPrestamo({ estado }) {
  const clave = estado ?? 'SOLICITADO';
  return (
    <ChipSuave
      color={COLORES_ESTADO[clave] ?? 'default'}
      etiqueta={ETIQUETAS_ESTADO[clave] ?? clave}
    />
  );
}

export function ChipCondicion({ condicion }) {
  if (!condicion) return <ChipSuave etiqueta="Sin registrar" />;
  return (
    <ChipSuave
      color={COLORES_CONDICION[condicion] ?? 'default'}
      etiqueta={ETIQUETAS_CONDICION[condicion] ?? condicion}
    />
  );
}

export function ChipDisponibilidad({ disponibles }) {
  const cantidad = Number(disponibles ?? 0);
  const disponible = cantidad > 0;
  return (
    <ChipSuave
      color={disponible ? 'success' : 'error'}
      etiqueta={disponible ? `Disponible (${cantidad})` : 'No disponible'}
    />
  );
}

export function ChipRol({ rol }) {
  return (
    <ChipSuave
      color={COLORES_ROL[rol] ?? 'default'}
      etiqueta={ETIQUETAS_ROL[rol] ?? rol}
    />
  );
}

export function ChipTipoCliente({ tipo }) {
  if (!tipo) return <ChipSuave etiqueta="No aplica" />;
  return <ChipSuave etiqueta={ETIQUETAS_TIPO_CLIENTE[tipo] ?? tipo} />;
}

export function ChipActivo({ activo }) {
  return (
    <ChipSuave
      color={activo ? 'success' : 'default'}
      etiqueta={activo ? 'Activa' : 'Inactiva'}
    />
  );
}

export function ChipEstadoSolicitudTipo({ estado }) {
  const clave = estado ?? 'PENDIENTE';
  return (
    <ChipSuave
      color={COLORES_SOLICITUD_TIPO[clave] ?? 'default'}
      etiqueta={ETIQUETAS_SOLICITUD_TIPO[clave] ?? clave}
    />
  );
}
