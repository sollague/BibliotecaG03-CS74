export class AppError extends Error {
  constructor(statusCode, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}
