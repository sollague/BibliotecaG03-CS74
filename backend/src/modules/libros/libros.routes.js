import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import {
  actualizar,
  agregar,
  crear,
  ejemplares,
  eliminar,
  eliminarEjemplarHandler,
  listar,
  obtener,
} from './libros.controller.js';
import {
  esquemaActualizarLibro,
  esquemaAgregarEjemplares,
  esquemaCrearLibro,
  esquemaIdParam,
  esquemaListarLibros,
} from './libros.schemas.js';

export const librosRouter = Router();

librosRouter.use(autenticar);

librosRouter.get('/', validar(esquemaListarLibros, 'query'), listar);

librosRouter.post(
  '/',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaCrearLibro),
  crear,
);

librosRouter.get(
  '/:id/ejemplares',
  autorizar('ADMINISTRADOR', 'BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  ejemplares,
);

librosRouter.post(
  '/:id/ejemplares',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaAgregarEjemplares),
  agregar,
);

librosRouter.get('/:id', validar(esquemaIdParam, 'params'), obtener);

librosRouter.patch(
  '/:id',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaActualizarLibro),
  actualizar,
);

librosRouter.delete(
  '/:id',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  eliminar,
);

export const ejemplaresRouter = Router();

ejemplaresRouter.use(autenticar);

ejemplaresRouter.delete(
  '/:id',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  eliminarEjemplarHandler,
);
