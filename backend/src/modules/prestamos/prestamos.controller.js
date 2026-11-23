import { asyncHandler } from '../../utils/asyncHandler.js';
import { metaPaginacion, obtenerPaginacion } from '../../utils/pagination.js';
import {
  aprobarPrestamo,
  cancelarPrestamo,
  crearSolicitud,
  entregarPrestamo,
  listarPrestamos,
  obtenerPrestamo,
  registrarDevolucion,
  renovarPrestamo,
} from './prestamos.service.js';

export const crear = asyncHandler(async (req, res) => {
  const solicitud = await crearSolicitud({
    actor: req.usuario,
    clienteId: req.body.clienteId,
    libroIds: req.body.libroIds,
    observaciones: req.body.observaciones,
  });

  return res.status(201).json({
    data: solicitud,
    mensaje:
      solicitud.prestamos.length === 1
        ? 'Solicitud de préstamo registrada correctamente.'
        : 'Solicitud por lote registrada correctamente.',
  });
});

export const listar = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = obtenerPaginacion(req.query);
  const { total, prestamos } = await listarPrestamos({
    usuario: req.usuario,
    filtros: req.query,
    skip,
    take,
  });

  return res.json({
    data: prestamos,
    meta: metaPaginacion(total, page, pageSize),
  });
});

export const detalle = asyncHandler(async (req, res) => {
  const prestamo = await obtenerPrestamo(Number(req.params.id), req.usuario);
  return res.json({ data: prestamo });
});

export const aprobar = asyncHandler(async (req, res) => {
  const prestamo = await aprobarPrestamo(Number(req.params.id), req.usuario.id);
  return res.json({
    data: prestamo,
    mensaje: 'Solicitud aprobada y ejemplar reservado correctamente.',
  });
});

export const entregar = asyncHandler(async (req, res) => {
  const prestamo = await entregarPrestamo(Number(req.params.id), req.usuario.id);
  return res.json({
    data: prestamo,
    mensaje: 'Entrega registrada correctamente.',
  });
});

export const renovar = asyncHandler(async (req, res) => {
  const { prestamo } = await renovarPrestamo(Number(req.params.id), req.usuario.id);
  return res.json({
    data: prestamo,
    mensaje: 'Préstamo renovado correctamente.',
  });
});

export const devolver = asyncHandler(async (req, res) => {
  const prestamo = await registrarDevolucion(
    Number(req.params.id),
    req.body,
    req.usuario.id,
  );

  const mensaje =
    prestamo.estado === 'PERDIDO'
      ? 'Préstamo marcado como perdido. El ejemplar no vuelve a estar disponible.'
      : prestamo.estado === 'DEVUELTO_CON_RETRASO'
        ? 'Devolución registrada con retraso.'
        : 'Devolución registrada correctamente.';

  return res.json({ data: prestamo, mensaje });
});

export const cancelar = asyncHandler(async (req, res) => {
  const prestamo = await cancelarPrestamo(
    Number(req.params.id),
    req.body,
    req.usuario,
  );
  return res.json({
    data: prestamo,
    mensaje: 'Préstamo cancelado correctamente.',
  });
});
