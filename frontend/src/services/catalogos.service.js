import { apiFetch } from './api.js';

export const catalogosService = {
  categorias: () => apiFetch('/categorias'),
  politicas: () => apiFetch('/politicas'),
  actualizarPolitica: (tipoCliente, datos) =>
    apiFetch(`/politicas/${tipoCliente}`, { method: 'PATCH', body: datos }),
};
