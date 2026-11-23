import { Router } from 'express';
import { autenticar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validate.js';
import { esquemaLogin, esquemaRegistro } from './auth.schemas.js';
import { login, logout, perfilSesion, registro } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', validar(esquemaRegistro), registro);
authRouter.post('/login', validar(esquemaLogin), login);
authRouter.post('/logout', logout);
authRouter.get('/me', autenticar, perfilSesion);
