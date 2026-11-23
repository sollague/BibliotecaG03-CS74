import { AppError } from '../utils/AppError.js';

export function noEncontrado(req, res, next) {
  next(new AppError(404, 'La ruta solicitada no existe.'));
}
