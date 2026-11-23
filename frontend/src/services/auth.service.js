import { apiFetch } from './api.js';

export const authService = {
  login: (datos) => apiFetch('/auth/login', { method: 'POST', body: datos }),
  registro: (datos) => apiFetch('/auth/registro', { method: 'POST', body: datos }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
};
