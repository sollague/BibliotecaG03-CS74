export function aplicarErroresApi(error, setError, setErrorGeneral) {
  let aplicado = false;
  for (const detalle of error?.detalles ?? []) {
    if (detalle.campo) {
      setError(detalle.campo, { type: 'server', message: detalle.mensaje });
      aplicado = true;
    }
  }
  if (setErrorGeneral) {
    setErrorGeneral(
      aplicado && error?.status === 400
        ? 'Revisa los campos marcados.'
        : error?.message ?? 'No se pudo completar la operación.',
    );
  }
}
