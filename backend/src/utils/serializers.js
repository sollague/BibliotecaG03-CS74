// Campos de usuario seguros para respuestas de la API (nunca passwordHash).
export const usuarioSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  email: true,
  identificacion: true,
  telefono: true,
  direccion: true,
  rol: true,
  tipoCliente: true,
  activo: true,
  documentoValidacion: true,
  institucionNombre: true,
  institucionRuc: true,
  responsableNombre: true,
  responsableCargo: true,
  responsableEmail: true,
  responsableTelefono: true,
  createdAt: true,
  updatedAt: true,
};

export const usuarioResumenSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  email: true,
  identificacion: true,
  tipoCliente: true,
};
