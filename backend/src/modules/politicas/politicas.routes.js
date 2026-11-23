import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import {
  esquemaActualizarPolitica,
  esquemaTipoClienteParam,
} from './politicas.schemas.js';

export const politicasRouter = Router();

politicasRouter.use(autenticar);
politicasRouter.use(autorizar('ADMINISTRADOR', 'BIBLIOTECARIO'));

politicasRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const politicas = await prisma.politicaPrestamo.findMany({
      orderBy: { tipoCliente: 'asc' },
    });
    return res.json({ data: politicas });
  }),
);

politicasRouter.patch(
  '/:tipoCliente',
  autorizar('ADMINISTRADOR'),
  validar(esquemaTipoClienteParam, 'params'),
  validar(esquemaActualizarPolitica),
  asyncHandler(async (req, res) => {
    const politica = await prisma.politicaPrestamo.update({
      where: { tipoCliente: req.params.tipoCliente },
      data: req.body,
    });
    return res.json({
      data: politica,
      mensaje: 'Política de préstamo actualizada correctamente.',
    });
  }),
);

politicasRouter.get(
  '/:tipoCliente',
  validar(esquemaTipoClienteParam, 'params'),
  asyncHandler(async (req, res) => {
    const politica = await prisma.politicaPrestamo.findUnique({
      where: { tipoCliente: req.params.tipoCliente },
    });
    if (!politica) throw new AppError(404, 'No existe una política para ese tipo de cliente.');
    return res.json({ data: politica });
  }),
);
