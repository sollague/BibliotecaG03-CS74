import { apiFetch } from './api.js';

export const perfilService = {
  obtener: () => apiFetch('/perfil'),
  actualizar: (datos) => apiFetch('/perfil', { method: 'PATCH', body: datos }),
};
