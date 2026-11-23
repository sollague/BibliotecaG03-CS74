import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';
import { perfilRouter } from './modules/perfil/perfil.routes.js';
import { categoriasRouter } from './modules/categorias/categorias.routes.js';
import { librosRouter, ejemplaresRouter } from './modules/libros/libros.routes.js';
import { politicasRouter } from './modules/politicas/politicas.routes.js';
import { prestamosRouter } from './modules/prestamos/prestamos.routes.js';
import { reportesRouter } from './modules/reportes/reportes.routes.js';
import { solicitudesTipoRouter } from './modules/solicitudes-tipo/solicitudes-tipo.routes.js';
import { noEncontrado } from './middlewares/notFound.js';
import { manejadorErrores } from './middlewares/errorHandler.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const omitirEnPruebas = () => env.NODE_ENV === 'test';

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: omitirEnPruebas,
  message: {
    error: {
      mensaje: 'Demasiados intentos de inicio de sesión. Espera unos minutos.',
    },
  },
});

const limitadorRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: omitirEnPruebas,
  message: {
    error: {
      mensaje: 'Se alcanzó el límite de registros. Intenta más tarde.',
    },
  },
});

app.get('/api/salud', (req, res) => {
  res.json({ data: { estado: 'ok' } });
});

app.use('/api/auth/login', limitadorLogin);
app.use('/api/auth/registro', limitadorRegistro);

app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/perfil', perfilRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/libros', librosRouter);
app.use('/api/ejemplares', ejemplaresRouter);
app.use('/api/politicas', politicasRouter);
app.use('/api/prestamos', prestamosRouter);
app.use('/api/solicitudes-tipo', solicitudesTipoRouter);
app.use('/api/reportes', reportesRouter);

app.use(noEncontrado);
app.use(manejadorErrores);
