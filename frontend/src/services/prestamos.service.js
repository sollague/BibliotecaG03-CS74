import { apiFetch } from './api.js';

export const prestamosService = {
  listar: (params) => apiFetch('/prestamos', { params }),
  obtener: (id) => apiFetch(`/prestamos/${id}`),
  solicitar: (datos) =>
    apiFetch('/prestamos/solicitudes', { method: 'POST', body: datos }),
  aprobar: (id) => apiFetch(`/prestamos/${id}/aprobar`, { method: 'PATCH' }),
  entregar: (id) => apiFetch(`/prestamos/${id}/entregar`, { method: 'PATCH' }),
  renovar: (id) => apiFetch(`/prestamos/${id}/renovar`, { method: 'PATCH' }),
  devolver: (id, datos) =>
    apiFetch(`/prestamos/${id}/devolver`, { method: 'PATCH', body: datos }),
  cancelar: (id, datos) =>
    apiFetch(`/prestamos/${id}/cancelar`, { method: 'PATCH', body: datos }),
};
