import { apiFetch } from './api.js';

export const librosService = {
  listar: (params) => apiFetch('/libros', { params }),
  obtener: (id) => apiFetch(`/libros/${id}`),
  crear: (datos) => apiFetch('/libros', { method: 'POST', body: datos }),
  actualizar: (id, datos) =>
    apiFetch(`/libros/${id}`, { method: 'PATCH', body: datos }),
  eliminar: (id) => apiFetch(`/libros/${id}`, { method: 'DELETE' }),
  ejemplares: (id) => apiFetch(`/libros/${id}/ejemplares`),
  agregarEjemplares: (id, cantidad) =>
    apiFetch(`/libros/${id}/ejemplares`, { method: 'POST', body: { cantidad } }),
  eliminarEjemplar: (id) =>
    apiFetch(`/ejemplares/${id}`, { method: 'DELETE' }),
};
