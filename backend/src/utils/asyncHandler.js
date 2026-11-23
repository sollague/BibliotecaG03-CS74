// Envuelve controladores asíncronos para que los errores lleguen al
// middleware central de manejo de errores.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
