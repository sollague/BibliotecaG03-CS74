import { AppError } from '../utils/AppError.js';

// Valida body, query o params con un esquema Zod y reemplaza el valor
// original por el dato normalizado.
export function validar(esquema, fuente = 'body') {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[fuente]);
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.') || 'general',
        mensaje: issue.message,
      }));
      return next(new AppError(400, 'Revisa los datos ingresados.', detalles));
    }
    req[fuente] = resultado.data;
    return next();
  };
}
