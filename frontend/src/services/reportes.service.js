import { apiFetch } from './api.js';

export const reportesService = {
  libros: (params) => apiFetch('/reportes/libros', { params }),
  disponibilidad: (params) => apiFetch('/reportes/disponibilidad', { params }),
  prestamos: (params) => apiFetch('/reportes/prestamos', { params }),
};
