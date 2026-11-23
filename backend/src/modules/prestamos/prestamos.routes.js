import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import {
  aprobar,
  cancelar,
  crear,
  detalle,
  devolver,
  entregar,
  listar,
  renovar,
} from './prestamos.controller.js';
import {
  esquemaCancelacion,
  esquemaCrearSolicitud,
  esquemaDevolucion,
  esquemaIdParam,
  esquemaListarPrestamos,
} from './prestamos.schemas.js';

export const prestamosRouter = Router();

prestamosRouter.use(autenticar);

prestamosRouter.get('/', validar(esquemaListarPrestamos, 'query'), listar);

prestamosRouter.post(
  '/solicitudes',
  autorizar('CLIENTE', 'BIBLIOTECARIO'),
  validar(esquemaCrearSolicitud),
  crear,
);

prestamosRouter.get('/:id', validar(esquemaIdParam, 'params'), detalle);

prestamosRouter.patch(
  '/:id/aprobar',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  aprobar,
);

prestamosRouter.patch(
  '/:id/entregar',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  entregar,
);

prestamosRouter.patch(
  '/:id/renovar',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  renovar,
);

prestamosRouter.patch(
  '/:id/devolver',
  autorizar('BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaDevolucion),
  devolver,
);

prestamosRouter.patch(
  '/:id/cancelar',
  autorizar('CLIENTE', 'BIBLIOTECARIO'),
  validar(esquemaIdParam, 'params'),
  validar(esquemaCancelacion),
  cancelar,
);
