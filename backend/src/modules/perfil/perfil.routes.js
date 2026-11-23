import { Router } from 'express';
import { autenticar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { actualizarPerfil } from './perfil.service.js';
import { esquemaActualizarPerfil } from './perfil.schemas.js';

export const perfilRouter = Router();

perfilRouter.use(autenticar);

perfilRouter.get(
  '/',
  asyncHandler(async (req, res) => res.json({ data: req.usuario })),
);

perfilRouter.patch(
  '/',
  validar(esquemaActualizarPerfil),
  asyncHandler(async (req, res) => {
    const usuario = await actualizarPerfil(req.usuario.id, req.body);
    return res.json({
      data: usuario,
      mensaje: 'Perfil actualizado correctamente.',
    });
  }),
);
