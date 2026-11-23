import { DIAS_POR_VENCER } from './constants.js';

export function sumarDias(fecha, dias) {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

// "Por vencer" y "Vencido" no se persisten: se derivan de la fecha límite.
export function estadoEfectivo(prestamo, ahora = new Date()) {
  if (!['PRESTADO', 'RENOVADO'].includes(prestamo.estado) || !prestamo.fechaLimite) {
    return prestamo.estado;
  }
  const limite = new Date(prestamo.fechaLimite);
  if (limite.getTime() < ahora.getTime()) return 'VENCIDO';
  if (limite.getTime() <= sumarDias(ahora, DIAS_POR_VENCER).getTime()) {
    return 'POR_VENCER';
  }
  return prestamo.estado;
}

export function conEstadoEfectivo(prestamo) {
  return { ...prestamo, estadoEfectivo: estadoEfectivo(prestamo) };
}
