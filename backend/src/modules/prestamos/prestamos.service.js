import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import {
  buscarEjemplarDisponible,
  contarDisponibles,
} from '../../utils/availability.js';
import {
  ESTADOS_ACTIVOS,
  ETIQUETAS_CONDICION,
} from '../../utils/constants.js';
import { estadoEfectivo, sumarDias } from '../../utils/dates.js';
import { usuarioResumenSelect } from '../../utils/serializers.js';

const OFFSET_ECUADOR_MS = 5 * 60 * 60 * 1000;

const incluirResumen = {
  cliente: { select: usuarioResumenSelect },
  libro: { select: { id: true, titulo: true, isbn: true } },
  ejemplar: { select: { id: true, codigo: true, condicion: true } },
};

const incluirDetalle = {
  cliente: { select: usuarioResumenSelect },
  libro: {
    select: {
      id: true,
      titulo: true,
      autor: true,
      editorial: true,
      isbn: true,
      categoria: { select: { nombre: true } },
    },
  },
  ejemplar: { select: { id: true, codigo: true, condicion: true } },
  historial: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      estadoAnterior: true,
      estadoNuevo: true,
      observacion: true,
      createdAt: true,
      usuario: { select: { nombres: true, apellidos: true } },
    },
  },
};

function inicioDiaEcuador(fecha) {
  return new Date(new Date(`${fecha}T00:00:00.000Z`).getTime() + OFFSET_ECUADOR_MS);
}

function mapearPrestamo(prestamo) {
  return { ...prestamo, estadoEfectivo: estadoEfectivo(prestamo) };
}

async function buscarDetalle(id, cliente = prisma) {
  const prestamo = await cliente.prestamo.findUnique({
    where: { id },
    include: incluirDetalle,
  });
  if (!prestamo) throw new AppError(404, 'El préstamo no existe.');
  return mapearPrestamo(prestamo);
}

async function obtenerPolitica(tipoCliente, cliente = prisma) {
  const politica = await cliente.politicaPrestamo.findUnique({
    where: { tipoCliente },
  });
  if (!politica) {
    throw new AppError(
      409,
      'No existe una política de préstamo configurada para el tipo de cliente.',
    );
  }
  return politica;
}

async function contarPrestamosVigentes(clienteId, cliente = prisma) {
  return cliente.prestamo.count({
    where: { clienteId, estado: { in: ESTADOS_ACTIVOS } },
  });
}

async function conReintentoSerializable(fn, intentos = 3) {
  let ultimoError;
  for (let intento = 0; intento < intentos; intento += 1) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      ultimoError = error;
      if (error?.code !== 'P2034' || intento === intentos - 1) throw error;
    }
  }
  throw ultimoError;
}

async function validarDisponibilidad(libroIds) {
  const solicitados = new Map();
  for (const id of libroIds) {
    solicitados.set(id, (solicitados.get(id) ?? 0) + 1);
  }

  for (const [libroId, cantidad] of solicitados.entries()) {
    const libro = await prisma.libro.findUnique({
      where: { id: libroId },
      select: { id: true, titulo: true, activo: true },
    });
    if (!libro || !libro.activo) {
      throw new AppError(
        404,
        'Uno de los libros seleccionados no existe o fue eliminado del catálogo.',
      );
    }
    const disponibles = await contarDisponibles(prisma, libroId);
    if (disponibles < cantidad) {
      throw new AppError(
        409,
        `El libro «${libro.titulo}» no tiene ejemplares disponibles suficientes.`,
      );
    }
  }
}

export async function crearSolicitud({ actor, clienteId, libroIds, observaciones }) {
  if (new Set(libroIds).size !== libroIds.length) {
    throw new AppError(400, 'No repitas el mismo libro dentro de una solicitud.');
  }

  let idCliente;
  if (actor.rol === 'CLIENTE') {
    if (clienteId && clienteId !== actor.id) {
      throw new AppError(403, 'Solo puedes solicitar préstamos para tu propia cuenta.');
    }
    idCliente = actor.id;
  } else if (actor.rol === 'BIBLIOTECARIO') {
    if (!clienteId) {
      throw new AppError(400, 'Selecciona el cliente que realiza la solicitud.');
    }
    idCliente = clienteId;
  } else {
    throw new AppError(403, 'No tienes permisos para registrar solicitudes de préstamo.');
  }

  const cliente = await prisma.usuario.findUnique({
    where: { id: idCliente },
    select: { id: true, nombres: true, apellidos: true, rol: true, activo: true, tipoCliente: true },
  });

  if (!cliente || cliente.rol !== 'CLIENTE') {
    throw new AppError(404, 'El cliente no existe.');
  }
  if (!cliente.activo) {
    throw new AppError(409, 'El cliente está desactivado y no puede solicitar préstamos.');
  }
  if (!cliente.tipoCliente) {
    throw new AppError(409, 'El cliente no tiene un tipo de cliente asignado.');
  }
  if (
    libroIds.length > 1 &&
    cliente.tipoCliente !== 'INSTITUCION_EDUCATIVA'
  ) {
    throw new AppError(
      400,
      'Solo las instituciones educativas pueden solicitar varios libros en un mismo lote.',
    );
  }

  const politica = await obtenerPolitica(cliente.tipoCliente);
  const vigentes = await contarPrestamosVigentes(cliente.id);

  if (vigentes + libroIds.length > politica.maxLibrosSimultaneos) {
    throw new AppError(
      409,
      `La solicitud supera el máximo de ${politica.maxLibrosSimultaneos} préstamos simultáneos de su tipo de cliente (activos: ${vigentes}, solicitados: ${libroIds.length}).`,
    );
  }

  await validarDisponibilidad(libroIds);

  const solicitudId = await prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudPrestamo.create({
      data: {
        clienteId: cliente.id,
        creadaPorId: actor.id,
      },
    });

    for (const libroId of libroIds) {
      await tx.prestamo.create({
        data: {
          solicitudId: solicitud.id,
          clienteId: cliente.id,
          libroId,
          estado: 'SOLICITADO',
          observaciones: observaciones || null,
          historial: {
            create: {
              estadoNuevo: 'SOLICITADO',
              usuarioId: actor.id,
              observacion: 'Solicitud registrada',
            },
          },
        },
      });
    }

    return solicitud.id;
  });

  const solicitud = await prisma.solicitudPrestamo.findUnique({
    where: { id: solicitudId },
    include: {
      cliente: { select: usuarioResumenSelect },
      prestamos: { include: incluirResumen },
    },
  });

  return solicitud;
}

export async function listarPrestamos({ usuario, filtros, skip, take }) {
  const where = {};

  if (usuario.rol === 'CLIENTE') {
    where.clienteId = usuario.id;
  } else if (filtros.clienteId) {
    where.clienteId = filtros.clienteId;
  }

  if (filtros.estado === 'POR_VENCER') {
    where.estado = { in: ['PRESTADO', 'RENOVADO'] };
    where.fechaLimite = {
      gte: new Date(),
      lte: sumarDias(new Date(), 3),
    };
  } else if (filtros.estado === 'VENCIDO') {
    where.estado = { in: ['PRESTADO', 'RENOVADO'] };
    where.fechaLimite = { lt: new Date() };
  } else if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.desde || filtros.hasta) {
    where.fechaSolicitud = {};
    if (filtros.desde) {
      where.fechaSolicitud.gte = inicioDiaEcuador(filtros.desde);
    }
    if (filtros.hasta) {
      where.fechaSolicitud.lt = sumarDias(inicioDiaEcuador(filtros.hasta), 1);
    }
  }

  if (filtros.q) {
    const q = filtros.q;
    where.OR = [
      { cliente: { nombres: { contains: q } } },
      { cliente: { apellidos: { contains: q } } },
      { cliente: { email: { contains: q } } },
      { cliente: { identificacion: { contains: q } } },
      { libro: { titulo: { contains: q } } },
      { libro: { isbn: { contains: q } } },
    ];
  }

  const [total, prestamos] = await Promise.all([
    prisma.prestamo.count({ where }),
    prisma.prestamo.findMany({
      where,
      include: incluirResumen,
      orderBy: { fechaSolicitud: 'desc' },
      skip,
      take,
    }),
  ]);

  return { total, prestamos: prestamos.map(mapearPrestamo) };
}

export async function obtenerPrestamo(id, usuario) {
  const prestamo = await buscarDetalle(id);
  if (usuario.rol === 'CLIENTE' && prestamo.clienteId !== usuario.id) {
    throw new AppError(404, 'El préstamo no existe.');
  }
  return prestamo;
}

export async function aprobarPrestamo(id, actorId) {
  await conReintentoSerializable(async (tx) => {
    const prestamo = await tx.prestamo.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { id: true, activo: true, tipoCliente: true },
        },
        libro: { select: { id: true, titulo: true, activo: true } },
      },
    });

    if (!prestamo) throw new AppError(404, 'El préstamo no existe.');
    if (prestamo.estado !== 'SOLICITADO') {
      throw new AppError(409, 'Solo se pueden aprobar préstamos en estado Solicitado.');
    }
    if (!prestamo.cliente.activo) {
      throw new AppError(409, 'El cliente está desactivado.');
    }
    if (!prestamo.libro.activo) {
      throw new AppError(409, 'El libro fue eliminado del catálogo.');
    }

    const politica = await obtenerPolitica(prestamo.cliente.tipoCliente, tx);
    const vigentes = await contarPrestamosVigentes(prestamo.clienteId, tx);
    if (vigentes + 1 > politica.maxLibrosSimultaneos) {
      throw new AppError(
        409,
        `El cliente ya alcanzó el máximo de ${politica.maxLibrosSimultaneos} préstamos simultáneos.`,
      );
    }

    const ejemplar = await buscarEjemplarDisponible(tx, prestamo.libroId);
    if (!ejemplar) {
      throw new AppError(
        409,
        `El libro «${prestamo.libro.titulo}» no tiene ejemplares disponibles.`,
      );
    }

    await tx.prestamo.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        ejemplarId: ejemplar.id,
        fechaAprobacion: new Date(),
        aprobadoPorId: actorId,
        historial: {
          create: {
            estadoAnterior: 'SOLICITADO',
            estadoNuevo: 'APROBADO',
            usuarioId: actorId,
            observacion: `Ejemplar ${ejemplar.codigo} reservado`,
          },
        },
      },
    });
  });

  return buscarDetalle(id);
}

export async function entregarPrestamo(id, actorId) {
  await prisma.$transaction(async (tx) => {
    const prestamo = await tx.prestamo.findUnique({
      where: { id },
      include: {
        cliente: { select: { tipoCliente: true } },
        ejemplar: { select: { id: true } },
      },
    });

    if (!prestamo) throw new AppError(404, 'El préstamo no existe.');
    if (prestamo.estado !== 'APROBADO') {
      throw new AppError(409, 'Solo se puede registrar la entrega de un préstamo aprobado.');
    }
    if (!prestamo.ejemplar) {
      throw new AppError(409, 'El préstamo no tiene un ejemplar asignado.');
    }

    const politica = await obtenerPolitica(prestamo.cliente.tipoCliente, tx);
    const ahora = new Date();

    await tx.prestamo.update({
      where: { id },
      data: {
        estado: 'PRESTADO',
        fechaEntrega: ahora,
        fechaLimite: sumarDias(ahora, politica.plazoDias),
        entregadoPorId: actorId,
        historial: {
          create: {
            estadoAnterior: 'APROBADO',
            estadoNuevo: 'PRESTADO',
            usuarioId: actorId,
            observacion: `Entrega registrada. Plazo: ${politica.plazoDias} días`,
          },
        },
      },
    });
  });

  return buscarDetalle(id);
}

export async function renovarPrestamo(id, actorId) {
  const resultado = await prisma.$transaction(async (tx) => {
    const prestamo = await tx.prestamo.findUnique({
      where: { id },
      include: { cliente: { select: { tipoCliente: true } } },
    });

    if (!prestamo) throw new AppError(404, 'El préstamo no existe.');
    if (!['PRESTADO', 'RENOVADO'].includes(prestamo.estado)) {
      throw new AppError(409, 'Solo se pueden renovar préstamos activos.');
    }
    if (!prestamo.fechaLimite || prestamo.fechaLimite.getTime() < Date.now()) {
      throw new AppError(409, 'El préstamo está vencido y no se puede renovar.');
    }

    const politica = await obtenerPolitica(prestamo.cliente.tipoCliente, tx);
    if (prestamo.renovacionesRealizadas >= politica.renovacionesPermitidas) {
      throw new AppError(
        409,
        `El cliente ya agotó las ${politica.renovacionesPermitidas} renovaciones permitidas para su tipo de cliente.`,
      );
    }

    const nuevaFecha = sumarDias(prestamo.fechaLimite, politica.diasRenovacion);

    await tx.prestamo.update({
      where: { id },
      data: {
        estado: 'RENOVADO',
        fechaLimite: nuevaFecha,
        renovacionesRealizadas: { increment: 1 },
        historial: {
          create: {
            estadoAnterior: prestamo.estado,
            estadoNuevo: 'RENOVADO',
            usuarioId: actorId,
            observacion: `Renovación ${prestamo.renovacionesRealizadas + 1} de ${politica.renovacionesPermitidas}`,
          },
        },
      },
    });

    return nuevaFecha;
  });

  return { prestamo: await buscarDetalle(id), nuevaFechaLimite: resultado };
}

export async function registrarDevolucion(id, { condicion, observaciones }, actorId) {
  await prisma.$transaction(async (tx) => {
    const prestamo = await tx.prestamo.findUnique({
      where: { id },
      include: { ejemplar: { select: { id: true, codigo: true } } },
    });

    if (!prestamo) throw new AppError(404, 'El préstamo no existe.');
    if (!['PRESTADO', 'RENOVADO'].includes(prestamo.estado)) {
      throw new AppError(
        409,
        'Solo se puede registrar la devolución de préstamos entregados.',
      );
    }
    if (!prestamo.ejemplar) {
      throw new AppError(409, 'El préstamo no tiene un ejemplar asignado.');
    }

    const ahora = new Date();
    const conRetraso =
      prestamo.fechaLimite && ahora.getTime() > prestamo.fechaLimite.getTime();
    const nuevoEstado =
      condicion === 'PERDIDO'
        ? 'PERDIDO'
        : conRetraso
          ? 'DEVUELTO_CON_RETRASO'
          : 'DEVUELTO';

    const nota = observaciones
      ? `${prestamo.observaciones ? `${prestamo.observaciones} | ` : ''}${observaciones}`.slice(0, 2000)
      : prestamo.observaciones;

    await tx.prestamo.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        fechaDevolucion: ahora,
        condicionDevolucion: condicion,
        devueltoPorId: actorId,
        observaciones: nota,
        historial: {
          create: {
            estadoAnterior: prestamo.estado,
            estadoNuevo: nuevoEstado,
            usuarioId: actorId,
            observacion: `Devolución: ${ETIQUETAS_CONDICION[condicion]}${
              observaciones ? ` - ${observaciones}` : ''
            }`.slice(0, 255),
          },
        },
      },
    });

    await tx.ejemplar.update({
      where: { id: prestamo.ejemplar.id },
      data: { condicion },
    });
  });

  return buscarDetalle(id);
}

export async function cancelarPrestamo(id, { observaciones }, usuario) {
  const prestamo = await prisma.prestamo.findUnique({
    where: { id },
    select: { id: true, clienteId: true, estado: true, observaciones: true },
  });

  if (!prestamo) throw new AppError(404, 'El préstamo no existe.');

  const permitido =
    (usuario.rol === 'CLIENTE' &&
      prestamo.clienteId === usuario.id &&
      prestamo.estado === 'SOLICITADO') ||
    (usuario.rol === 'BIBLIOTECARIO' &&
      ['SOLICITADO', 'APROBADO'].includes(prestamo.estado));

  if (!permitido) {
    throw new AppError(
      409,
      'No se puede cancelar el préstamo en su estado actual.',
    );
  }

  const nota = observaciones
    ? `${prestamo.observaciones ? `${prestamo.observaciones} | ` : ''}${observaciones}`.slice(0, 2000)
    : prestamo.observaciones;

  await prisma.prestamo.update({
    where: { id },
    data: {
      estado: 'CANCELADO',
      canceladoPorId: usuario.id,
      observaciones: nota,
      historial: {
        create: {
          estadoAnterior: prestamo.estado,
          estadoNuevo: 'CANCELADO',
          usuarioId: usuario.id,
          observacion: observaciones || 'Préstamo cancelado',
        },
      },
    },
  });

  return buscarDetalle(id);
}
