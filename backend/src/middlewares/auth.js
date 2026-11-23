import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { usuarioSelect } from '../utils/serializers.js';
import { AppError } from '../utils/AppError.js';

export async function autenticar(req, res, next) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) {
      throw new AppError(401, 'Debes iniciar sesión para continuar.');
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError(401, 'Tu sesión expiró. Inicia sesión nuevamente.');
    }

    const id = Number(payload.sub);
    if (!Number.isInteger(id)) {
      throw new AppError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: usuarioSelect,
    });

    if (!usuario) {
      throw new AppError(401, 'La cuenta asociada a la sesión no existe.');
    }
    if (!usuario.activo) {
      throw new AppError(403, 'Tu cuenta está desactivada. Contacta al administrador.');
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError(401, 'Debes iniciar sesión para continuar.'));
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError(403, 'No tienes permisos para realizar esta acción.'));
    }
    return next();
  };
}
