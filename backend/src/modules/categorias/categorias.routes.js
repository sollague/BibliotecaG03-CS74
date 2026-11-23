import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { autenticar } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const categoriasRouter = Router();

categoriasRouter.use(autenticar);

categoriasRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });
    return res.json({ data: categorias });
  }),
);
