import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import {
  actualizarClienteHandler,
  actualizarEstado,
  actualizarRol,
  crear,
  listar,
  listarClientesHandler,
} from './usuarios.controller.js';
import {
  esquemaActualizarCliente,
  esquemaCambiarEstado,
  esquemaCambiarRol,
  esquemaCrearPersonal,
  esquemaListarUsuarios,
} from './usuarios.schemas.js';

export const usuariosRouter = Router();

usuariosRouter.use(autenticar);

usuariosRouter.get('/', autorizar('ADMINISTRADOR'), validar(esquemaListarUsuarios, 'query'), listar);
usuariosRouter.post('/', autorizar('ADMINISTRADOR'), validar(esquemaCrearPersonal), crear);

usuariosRouter.get(
  '/clientes',
  autorizar('ADMINISTRADOR', 'BIBLIOTECARIO'),
  validar(esquemaListarUsuarios, 'query'),
  listarClientesHandler,
);

usuariosRouter.patch(
  '/clientes/:id',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaActualizarCliente),
  actualizarClienteHandler,
);

usuariosRouter.patch(
  '/:id/rol',
  autorizar('ADMINISTRADOR'),
  validar(esquemaCambiarRol),
  actualizarRol,
);

usuariosRouter.patch(
  '/:id/estado',
  autorizar('ADMINISTRADOR'),
  validar(esquemaCambiarEstado),
  actualizarEstado,
);
