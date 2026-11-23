import { ESTADOS_ACTIVOS } from './constants.js';

// Un ejemplar está disponible cuando no está perdido y no participa en un
// préstamo que lo ocupe (aprobado, prestado o renovado).
export function condicionDisponible(libroId) {
  return {
    libroId,
    condicion: { not: 'PERDIDO' },
    prestamos: { none: { estado: { in: ESTADOS_ACTIVOS } } },
  };
}

export async function contarDisponibles(cliente, libroId) {
  return cliente.ejemplar.count({ where: condicionDisponible(libroId) });
}

export async function buscarEjemplarDisponible(cliente, libroId) {
  return cliente.ejemplar.findFirst({
    where: condicionDisponible(libroId),
    orderBy: { id: 'asc' },
    select: { id: true, codigo: true },
  });
}
