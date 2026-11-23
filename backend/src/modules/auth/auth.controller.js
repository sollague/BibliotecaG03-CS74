import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { registrarCliente, autenticarUsuario } from './auth.service.js';

function duracionEnMs(valor) {
  const coincidencia = /^(\d+)([smhd])$/.exec(valor);
  if (!coincidencia) return 8 * 60 * 60 * 1000;
  const cantidad = Number(coincidencia[1]);
  const unidad = coincidencia[2];
  const factores = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return cantidad * factores[unidad];
}

const opcionesCookie = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: duracionEnMs(env.JWT_EXPIRES_IN),
  path: '/',
});

export const registro = asyncHandler(async (req, res) => {
  const usuario = await registrarCliente(req.body);
  return res.status(201).json({
    data: usuario,
    mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.',
  });
});

export const login = asyncHandler(async (req, res) => {
  const usuario = await autenticarUsuario(req.body);
  const token = jwt.sign({ sub: String(usuario.id) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.cookie(env.COOKIE_NAME, token, opcionesCookie());

  return res.json({
    data: { usuario },
    mensaje: 'Inicio de sesión correcto.',
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.COOKIE_NAME, { ...opcionesCookie(), maxAge: undefined });
  return res.json({ data: null, mensaje: 'Sesión cerrada correctamente.' });
});

export const perfilSesion = asyncHandler(async (req, res) => {
  return res.json({ data: req.usuario });
});
