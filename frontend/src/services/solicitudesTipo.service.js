import { apiFetch, urlApi } from './api.js';

export const solicitudesTipoService = {
  crear: (datos) =>
    apiFetch('/solicitudes-tipo', { method: 'POST', body: datos }),
  mias: () => apiFetch('/solicitudes-tipo/mias'),
  cancelar: (id) =>
    apiFetch(`/solicitudes-tipo/${id}/cancelar`, { method: 'PATCH' }),
  listar: (params) => apiFetch('/solicitudes-tipo', { params }),
  revisar: (id, datos) =>
    apiFetch(`/solicitudes-tipo/${id}/revisar`, { method: 'PATCH', body: datos }),
};

export const urlDocumentoSolicitud = (solicitudId, documentoId) =>
  urlApi(`/solicitudes-tipo/${solicitudId}/documentos/${documentoId}`);
