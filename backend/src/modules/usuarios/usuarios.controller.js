import { asyncHandler } from '../../utils/asyncHandler.js';
import { metaPaginacion, obtenerPaginacion } from '../../utils/pagination.js';
import {
  actualizarCliente,
  cambiarEstado,
  cambiarRol,
  crearPersonal,
  listarClientes,
  listarUsuarios,
} from './usuarios.service.js';

export const listar = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = obtenerPaginacion(req.query);
  const { total, usuarios } = await listarUsuarios({ ...req.query, skip, take });

  return res.json({
    data: usuarios,
    meta: metaPaginacion(total, page, pageSize),
  });
});

export const crear = asyncHandler(async (req, res) => {
  const usuario = await crearPersonal(req.body);
  return res.status(201).json({
    data: usuario,
    mensaje: 'Cuenta creada correctamente.',
  });
});

export const actualizarRol = asyncHandler(async (req, res) => {
  const usuario = await cambiarRol(
    Number(req.params.id),
    req.body.rol,
    req.usuario.id,
  );
  return res.json({
    data: usuario,
    mensaje: 'Perfil de acceso actualizado correctamente.',
  });
});

export const actualizarEstado = asyncHandler(async (req, res) => {
  const usuario = await cambiarEstado(
    Number(req.params.id),
    req.body.activo,
    req.usuario.id,
  );
  return res.json({
    data: usuario,
    mensaje: usuario.activo
      ? 'Cuenta activada correctamente.'
      : 'Cuenta desactivada correctamente.',
  });
});

export const listarClientesHandler = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = obtenerPaginacion(req.query);
  const { total, clientes } = await listarClientes({ ...req.query, skip, take });

  return res.json({
    data: clientes,
    meta: metaPaginacion(total, page, pageSize),
  });
});

export const actualizarClienteHandler = asyncHandler(async (req, res) => {
  const cliente = await actualizarCliente(Number(req.params.id), req.body);
  return res.json({
    data: cliente,
    mensaje: 'Datos del cliente actualizados correctamente.',
  });
});
