import { asyncHandler } from '../../utils/asyncHandler.js';
import { metaPaginacion, obtenerPaginacion } from '../../utils/pagination.js';
import {
  actualizarLibro,
  agregarEjemplares,
  crearLibro,
  eliminarEjemplar,
  eliminarLibro,
  listarEjemplares,
  listarLibros,
  obtenerLibro,
} from './libros.service.js';

const esStaff = (usuario) =>
  usuario.rol === 'BIBLIOTECARIO' || usuario.rol === 'ADMINISTRADOR';

export const listar = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = obtenerPaginacion(req.query);
  const incluirInactivos = esStaff(req.usuario)
    ? req.query.incluirInactivos
    : false;

  const { total, libros } = await listarLibros({
    ...req.query,
    incluirInactivos,
    skip,
    take,
  });

  return res.json({
    data: libros,
    meta: metaPaginacion(total, page, pageSize),
  });
});

export const obtener = asyncHandler(async (req, res) => {
  const libro = await obtenerLibro(Number(req.params.id), {
    esStaff: esStaff(req.usuario),
  });
  return res.json({ data: libro });
});

export const crear = asyncHandler(async (req, res) => {
  const libro = await crearLibro(req.body);
  return res.status(201).json({
    data: libro,
    mensaje: 'Libro registrado correctamente.',
  });
});

export const actualizar = asyncHandler(async (req, res) => {
  const libro = await actualizarLibro(Number(req.params.id), req.body);
  return res.json({
    data: libro,
    mensaje: 'Libro actualizado correctamente.',
  });
});

export const eliminar = asyncHandler(async (req, res) => {
  const libro = await eliminarLibro(Number(req.params.id));
  return res.json({
    data: libro,
    mensaje: 'Libro eliminado del catálogo correctamente.',
  });
});

export const ejemplares = asyncHandler(async (req, res) => {
  const resultado = await listarEjemplares(Number(req.params.id));
  return res.json({ data: resultado });
});

export const agregar = asyncHandler(async (req, res) => {
  const resultado = await agregarEjemplares(
    Number(req.params.id),
    req.body.cantidad,
  );
  return res.status(201).json({
    data: resultado,
    mensaje: 'Ejemplares agregados correctamente.',
  });
});

export const eliminarEjemplarHandler = asyncHandler(async (req, res) => {
  const resultado = await eliminarEjemplar(Number(req.params.id));
  return res.json({
    data: resultado,
    mensaje: 'Ejemplar eliminado correctamente.',
  });
});
