import { apiFetch } from './api.js';

export const usuariosService = {
  listar: (params) => apiFetch('/usuarios', { params }),
  crear: (datos) => apiFetch('/usuarios', { method: 'POST', body: datos }),
  cambiarRol: (id, rol) =>
    apiFetch(`/usuarios/${id}/rol`, { method: 'PATCH', body: { rol } }),
  cambiarEstado: (id, activo) =>
    apiFetch(`/usuarios/${id}/estado`, { method: 'PATCH', body: { activo } }),
  listarClientes: (params) => apiFetch('/usuarios/clientes', { params }),
  actualizarCliente: (id, datos) =>
    apiFetch(`/usuarios/clientes/${id}`, { method: 'PATCH', body: datos }),
};
