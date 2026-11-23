const BASE = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(mensaje, detalles, status) {
    super(mensaje);
    this.name = 'ApiError';
    this.detalles = detalles;
    this.status = status;
  }
}

function construirUrl(path, params) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.set(clave, String(valor));
    }
  });
  const cadena = query.toString();
  return `${BASE}${path}${cadena ? `?${cadena}` : ''}`;
}

export function urlApi(path) {
  return `${BASE}${path}`;
}

export async function apiFetch(path, { method = 'GET', body, params, signal } = {}) {
  const esFormData = body instanceof FormData;
  const respuesta = await fetch(construirUrl(path, params), {
    method,
    credentials: 'include',
    signal,
    headers:
      body && !esFormData ? { 'Content-Type': 'application/json' } : undefined,
    body: esFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const texto = await respuesta.text();
  let payload = null;
  if (texto) {
    try {
      payload = JSON.parse(texto);
    } catch {
      payload = null;
    }
  }

  if (!respuesta.ok) {
    throw new ApiError(
      payload?.error?.mensaje ?? 'No se pudo completar la solicitud.',
      payload?.error?.detalles,
      respuesta.status,
    );
  }

  return payload ?? {};
}
