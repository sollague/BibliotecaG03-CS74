export function obtenerPaginacion(query, { tamanoPorDefecto = 10, maximo = 100 } = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(maximo, Math.max(1, Number(query.pageSize) || tamanoPorDefecto));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function metaPaginacion(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
