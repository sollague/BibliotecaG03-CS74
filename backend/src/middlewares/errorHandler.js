import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const MENSAJES_UNICIDAD = {
  email: 'El correo ya está registrado.',
  identificacion: 'La identificación ya está registrada.',
  isbn: 'El ISBN ya está registrado.',
  codigo: 'El código de ejemplar ya existe.',
  tipoCliente: 'Ya existe una política para ese tipo de cliente.',
  nombre: 'El nombre ya está registrado.',
};

function manejarPrisma(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const campos = Array.isArray(error.meta?.target)
        ? error.meta.target
        : [String(error.meta?.target ?? '')];
      const campo = campos.find((c) => MENSAJES_UNICIDAD[c]) ?? campos[0];
      const mensaje =
        MENSAJES_UNICIDAD[campo] ?? 'Ya existe un registro con esos datos.';
      return new AppError(
        409,
        mensaje,
        MENSAJES_UNICIDAD[campo] ? [{ campo, mensaje }] : undefined,
      );
    }
    if (error.code === 'P2003') {
      return new AppError(
        409,
        'No se puede completar la operación porque el registro está relacionado con otros datos.',
      );
    }
    if (error.code === 'P2025') {
      return new AppError(404, 'No se encontró el registro solicitado.');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(400, 'Los datos enviados no son válidos.');
  }

  return null;
}

function manejarArchivo(error) {
  if (error?.name !== 'MulterError') return null;

  const mensajes = {
    LIMIT_FILE_SIZE: 'Cada documento puede pesar como máximo 5 MB.',
    LIMIT_FILE_COUNT: 'Puedes adjuntar hasta 3 documentos.',
    LIMIT_UNEXPECTED_FILE: 'Puedes adjuntar hasta 3 documentos.',
  };

  return new AppError(
    400,
    mensajes[error.code] ?? 'No se pudo procesar el archivo adjunto.',
  );
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(error, req, res, next) {
  const errorArchivo = manejarArchivo(error);
  const errorPrisma = manejarPrisma(error);
  const errorFinal = errorArchivo ?? errorPrisma ?? error;

  if (errorFinal instanceof AppError) {
    return res.status(errorFinal.statusCode).json({
      error: {
        mensaje: errorFinal.message,
        detalles: errorFinal.detalles,
      },
    });
  }

  if (env.NODE_ENV !== 'test') {
    console.error('[ERROR NO CONTROLADO]', error);
  }

  return res.status(500).json({
    error: {
      mensaje: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
    },
  });
}
