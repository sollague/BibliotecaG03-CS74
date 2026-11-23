import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  esquemaReporteLibros,
  esquemaReportePrestamos,
} from './reportes.schemas.js';
import { reporteLibros, reportePrestamos } from './reportes.service.js';

export const reportesRouter = Router();

reportesRouter.use(autenticar);
reportesRouter.use(autorizar('ADMINISTRADOR', 'BIBLIOTECARIO'));

reportesRouter.get(
  '/libros',
  validar(esquemaReporteLibros, 'query'),
  asyncHandler(async (req, res) => {
    const reporte = await reporteLibros(req.query);
    return res.json({ data: reporte });
  }),
);

reportesRouter.get(
  '/disponibilidad',
  validar(esquemaReporteLibros, 'query'),
  asyncHandler(async (req, res) => {
    const reporte = await reporteLibros({ ...req.query, soloDisponibles: true });
    return res.json({ data: reporte });
  }),
);

reportesRouter.get(
  '/prestamos',
  validar(esquemaReportePrestamos, 'query'),
  asyncHandler(async (req, res) => {
    const reporte = await reportePrestamos(req.query);
    return res.json({ data: reporte });
  }),
);
